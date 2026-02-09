from dotenv import load_dotenv
import os
import requests
import logging
load_dotenv()
import time

import json
from typing import Optional


load_dotenv()

def get_oauth_token() -> Optional[str]:
    
    
    client_id = os.getenv("CORTEX_CLIENT_ID")    
    client_secret = os.getenv("CORTEX_CLIENT_SECRET")
    tenant_id = os.getenv("CORTEX_TENANT_ID")


    oauth_url="https://login.microsoftonline.com/"+tenant_id+"/oauth2/v2.0/token"

    payload = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': "client_credentials",
        'scope': "api://Cortex_Engineering.lilly.com/.default"
    }

    try:
        response = requests.post(oauth_url, data=payload, verify=False)
        response.raise_for_status()
        access_token = response.json().get('access_token')
        logging.info("OAuth token obtained successfully")

        return access_token
    except Exception as e:
        print(f'Error {e}')
    


api_url = os.getenv("API_URL", "https://gateway.apim-dev.lilly.com/cortex/model/ask")

query="Launch the LT app and login with the valid credentials"
def send_query(query, auth_token): 

    url = f"{api_url}/{'speqe-small-embedding'}"
    params = {'q': query, 'stream': 'false','no_summary':'true'}
    # params = {'q': query, 'stream': 'false'}
    headers = {'Content-Type': 'application/json'}
    if auth_token:
        headers['Authorization'] = f"Bearer {auth_token}"

    time_1=time.time()
    response = requests.get(url,params=params,headers=headers)
    time_2=time.time()
    print(f'Time to get response from model_ask API: {time_2-time_1} seconds')
    return response.json()


if __name__ == "__main__":
    start_time=time.time()
    TOKEN = get_oauth_token()
    token_time=time.time()
    print(f'Time to get token, {token_time-start_time} seconds')
    res=send_query(query, TOKEN)

    # print(f'Response: {res['message']}')
    # print(f'total length, {len(res['source_metadata'])}')


    similarity={}
    count=100 
    total_count=len(res['source_metadata']) if len(res['source_metadata']) else 100
    count=total_count
    print(f'Total count: {total_count}')
    
    for item in res['source_metadata']:
        if item['metadata']['issue_id'] in similarity:
            continue
        if count<1:
            count=1
        similarity[item['metadata']['issue_id']]=min(100, round(item['metadata']['score']*50*(count/total_count),1))
        count-=1
    


    print(f'Similarity: {similarity}')
    end_time=time.time()
    print(f'Total time taken, {end_time-start_time} seconds')
    
