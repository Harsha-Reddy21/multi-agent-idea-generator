import requests
import json
import pandas as pd
import os
import re
import boto3
from datetime import datetime
from requests.auth import HTTPBasicAuth

# S3 Configuration
S3_BUCKET = os.getenv("S3_BUCKET", "lly-light-dev")
S3_PREFIX = os.getenv("S3_PREFIX", "lilly-sage-ai-dev/")

# Define all tables to fetch
TABLES = {
    "AI_Registry": "x_inell_ai_reg_ai_registry",
    "AI_Registry_Task": "x_inell_ai_reg_ai_registry_task",
    "AI_Approved_Submissions": "x_inell_ai_reg_approved_ai_systems",
    "AI_Metrics": "x_inell_ai_reg_ai_registry_metrics"
}

def get_all_records(table_name):
    # ServiceNow table API endpoint
    url = f"https://lilly.service-now.com/api/now/table/{table_name}"

    username = os.getenv("SERVICENOW_USERNAME")
    password = os.getenv("SERVICENOW_PASSWORD")

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    all_records = []
    limit = 1000   # how many rows per request
    offset = 0

    while True:
        params = {
            "sysparm_limit": limit,
            "sysparm_offset": offset
        }

        response = requests.get(url, headers=headers, params=params,
                                auth=HTTPBasicAuth(username, password))

        if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")
            break

        data = response.json().get("result", [])
        if not data:
            break  # no more records

        all_records.extend(data)
        offset += limit

    return all_records

def sanitize_dataframe(df):
    """Remove illegal characters from dataframe for Excel export"""
    # Create a copy to avoid modifying the original
    df = df.copy()
    
    # Pattern to remove illegal XML characters for Excel
    # This includes control characters that openpyxl cannot handle
    illegal_chars_pattern = re.compile(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F\uFFFE\uFFFF]')
    
    def clean_value(val):
        if pd.isna(val):
            return val
        if isinstance(val, str):
            # Remove illegal characters
            cleaned = illegal_chars_pattern.sub('', val)
            # Also limit length to avoid Excel cell limit (32,767 characters)
            if len(cleaned) > 32000:
                cleaned = cleaned[:32000] + '...[truncated]'
            return cleaned
        return val
    
    for col in df.columns:
        if df[col].dtype == 'object':  # Only process object/string columns
            df[col] = df[col].apply(clean_value)
    
    return df

def check_s3_access(bucket, prefix):
    """Simple S3 access test"""
    try:
        s3 = boto3.client("s3")
        response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix, MaxKeys=1)
        return {
            "status": "success",
            "bucket": bucket,
            "prefix": prefix,
            "accessible": True
        }
    except Exception as e:
        return {
            "status": "error",
            "bucket": bucket,
            "prefix": prefix,
            "accessible": False,
            "error": str(e)
        }

def upload_to_s3(local_filepath, bucket, prefix):
    """Upload file to S3"""
    try:
        s3 = boto3.client("s3")
        filename = os.path.basename(local_filepath)
        s3_key = f"{prefix}servicenow_dump/{filename}"
        
        print(f"Uploading {filename} to s3://{bucket}/{s3_key}...")
        s3.upload_file(local_filepath, bucket, s3_key)
        print(f"Successfully uploaded to S3: s3://{bucket}/{s3_key}")
        
        return {
            "status": "success",
            "bucket": bucket,
            "s3_key": s3_key,
            "local_file": local_filepath
        }
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

def save_to_excel_multi_sheet(all_tables_data, filename="ai_registry_complete_dump.xlsx"):
    if not all_tables_data:
        print("No data to save.")
        return

    filepath = os.path.join(os.getcwd(), filename)
    
    # Create Excel writer object
    with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
        for table_name, records in all_tables_data.items():
            if records:
                df = pd.DataFrame(records)
                # Sanitize data to remove illegal characters
                df = sanitize_dataframe(df)
                # Excel sheet names have a 31 character limit
                sheet_name = table_name[:31]
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                print(f"  - Sheet '{sheet_name}': {len(records)} records")
            else:
                print(f"  - '{table_name}': No records found")
    
    print(f"\nSaved to: {filepath}")
    return filepath

if __name__ == "__main__":
    print("=" * 60)
    print("ServiceNow Data Extraction and S3 Upload")
    print("=" * 60)
    
    # Check S3 access
    print("\nChecking S3 access...")
    s3_check = check_s3_access(S3_BUCKET, S3_PREFIX)
    if s3_check["status"] == "success":
        print(f"✓ S3 access verified: s3://{S3_BUCKET}/{S3_PREFIX}")
    else:
        print(f"✗ S3 access failed: {s3_check.get('error', 'Unknown error')}")
        print("Warning: Will save locally only\n")
    
    # Fetch data from ServiceNow
    print("\nFetching data from all AI Registry tables...\n")
    all_tables_data = {}
    
    for table_display_name, table_api_name in TABLES.items():
        print(f"Fetching {table_display_name}...")
        records = get_all_records(table_api_name)
        all_tables_data[table_display_name] = records
        print(f"  Retrieved {len(records)} records\n")
    
    # Save to Excel with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ai_registry_dump_{timestamp}.xlsx"
    filepath = save_to_excel_multi_sheet(all_tables_data, filename)
    
    # Upload to S3 if access is available
    if s3_check["status"] == "success" and filepath:
        print("\n" + "=" * 60)
        upload_result = upload_to_s3(filepath, S3_BUCKET, S3_PREFIX)
        if upload_result["status"] == "success":
            print("✓ Process completed successfully!")
        else:
            print("✗ Upload failed, but file saved locally")
    
    print("=" * 60)
 