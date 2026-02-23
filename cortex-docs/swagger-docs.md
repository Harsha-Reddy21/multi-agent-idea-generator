SWAGGER DOCS


These are the swagger endpoints:

Cortex
 v3.70 
OAS 3.0
/docs/all/v1/openapi.json
Lilly's Control Plane for AI - History API
 
Data
Feature Flag
History
Manages user session history & messages
Jobs
Migration | Cortex super admins only
Model | Ask
Model | Config
Model | Context Cache
Model | Evaluation
Model | Files
Model | Jobs
Model | LLMs
Model | Security
Model | Summarize
Model | Visualization
OpenAI compatible
Private LLM
Prompt
RAGAS
Security
Security-Cyber
Sync
System
Toolkit
Toolkit-Security
Schemas




DATA ENDPOINT:


POST
/data
Set Data Config
GET
/data
List Models
GET
/data/{name}
Get Data Config
DELETE
/data/delete/{name}
Delete Data Config
POST
/data/upload/{name}
Data Upload Handler
POST
/data/upload-text/{name}
Upload Text Handler
POST
/data/async_upload/{name}
Async Upload Handler
GET
/data/search-metadata/{name}
Search Documents By Metadata
GET
/data/files/{name}
Get File Handler
GET
/data/documents/{name}
Get Documents
GET
/data/list-files/{name}
List Files
DELETE
/data/delete-file-embeddings/{name}
Delete Embedding
GET
/data/job-status-id/{name}/{job_id}
Get Job Status Handler
GET
/data/job-status/{name}
List Ingest Jobs
DELETE
/data/jobs/clear-jobs/{name}
Clear Jobs
GET
/data/external/list
External Files List Handler
POST
/data/external/upload/{name}
External Upload Handler
POST
/data/visualize/{name}
Visualize
GET
/data/summarize-documents/{name}
Summarize Documents
GET
/data/count-documents/{name}
Count The Number Of Indexes In The Vector Store
POST
/data/index/{name}
Reload Index
GET
/data/download/{name}/{job_id}/{job_type}
Download Job Result
GET
/data/jobs/failure/{key_name}
Get Failed Job Result
GET
/data/external_s3_list_files/{name}
List Files From External S3
GET
/data/embeddings/list
Listembeddings
GET
/data/list-external-files/{name}
Get External Ingested Files List
POST
/data/event-listener
Event Listener
POST
/data/chunks/{name}
Generate Chunks
POST
/data/migrate/{source}/{destination}/{name}
Migrate Index From One Vectorstore To Another
GET
/data/jobs-count-in-queue/{name}
Get The Count Of Jobs In The Queue For A Data Config
POST
/data/redshift-connector/{name}
Query Redshift
POST
/data/upload_custom_chunking/{name}
Upload Custom Chunking
POST
/data/custom_search/{config_name}
Custom Search
GET
/data/{data_name}/exists
Check Data Exists

















Data
POST
/data
Set Data Config
Create or update a data configuration for document processing and vector storage.
This endpoint creates or updates a data configuration that defines how documents will be processed, chunked, embedded, and stored in the vector database. The configuration includes authentication settings, storage parameters, embedding models, chunking strategies, and optional advanced features.
Request Body (DataConfig):
Core Configuration:
•	name (str): Unique identifier for the data config (lowercase alphanumeric with dashes)
•	displayName (str, optional): Human-readable display name
•	data_config_description (str, optional): Description of the data configuration's purpose
•	auth (Auth): Authentication and authorization settings defining access control
Storage Configuration:
•	s3_bucket (str): S3 bucket name for document storage (defaults to environment variable)
•	s3_prefix (str): S3 prefix path for organizing documents (defaults to environment variable)
•	vectorstore (VectorDB): Vector database type ("elasticsearch", "pinecone", or "snd")
•	assume_role (str, optional): AWS IAM role to assume for S3 access
Processing Configuration:
•	embedding (EmbeddingReference): Embedding model configuration for vector generation
•	model_version (ModelVersionReference): Language model version for processing
•	chunk_size (int): Maximum size of text chunks in tokens (default: 1500, min: 500)
•	chunk_overlap (int): Number of overlapping tokens between adjacent chunks (default: 300)
•	exclude_filter (List[str], optional): Regex patterns to exclude files from ingestion
Advanced Features:
•	contextual_chunking (ContextualChunkingConfig, optional): Configuration for hierarchical document chunking based on document structure
•	multimodal (bool): Enable processing of charts, tables, and images (default: False)
•	bounding_boxes (bool): Enable PDF bounding boxes for granular citations (default: False)
•	snd_config (SNDConfig, optional): Configuration for SND (Secure Network Database) vector database integration. Required when vectorstore is set to "snd". Defines metadata mapping and field configuration.
Structure includes:
o	type: Configuration type ("nested" or "plain")
o	path: Path to SND configuration (required for nested type)
o	embeddings_field: Field name for embeddings (e.g., "abstract_vector.abstract_vectors")
o	page_content_field: Field name for page content (e.g., "abstract_vector.text_chunk")
o	attribute_mapping: Maps metadata fields from source documents to output format
Example attribute_mapping structure:
{
  "attribute_mapping": {
    "source": {"type": "copy", "value": "redirect_url"},
    "doc_name": {"type": "copy", "value": "title"},
    "long_citation": {"type": "copy", "value": "name__v"},
    "short_citation": {"type": "copy", "value": "name__v"}
  }
}
Mapping types:
o	"copy": Copy value from source document field
o	"static": Use a static string value
Metadata Configuration:
•	concepts_of_interest (List[str], optional): List of domain-specific concepts to track
•	augmentable_metadata (List[str], optional): Metadata fields that can be enhanced
•	allowed_model_configs (List[str], optional): List of model configs that can access this data
Index Configuration:
•	index_name (str, optional): Custom index name for the vector database
Authorization:
The endpoint performs dual authorization checks:
1.	Current Config Auth: Validates access to modify existing configuration (if updating)
2.	New Config Auth: Validates the provided auth settings for the new/updated configuration
The user must have manager-level permissions for both checks to succeed.
Validation:
•	Validates embedding model configuration and availability
•	For SND vectorstore, validates SND-specific configuration
•	Ensures chunk_overlap is less than chunk_size
•	Validates S3 bucket and prefix permissions
•	Checks model version compatibility
Response:
Returns a success confirmation:
{
    "message": "success"
}
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "name": "string-lowercase-alphanumeric-with-dashes",
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "llm-dev",
  "exclude_filter": [],
  "assume_role": "",
  "displayName": "",
  "data_config_description": "",
  "embedding": {
    "model": "valid embedding model name. for example: text-embedding-ada-002",
    "open_api_type": "valid embedding type. for example:azure"
  },
  "model_version": {
    "model_class": "string (lowercase alphanumeric with dashes) name of the model",
    "model_iteration": "valid version of the model"
  },
  "vectorstore": "elasticsearch",
  "concepts_of_interest": [
    "string"
  ],
  "augmentable_metadata": [
    "string"
  ],
  "allowed_model_configs": [
    "string"
  ],
  "chunk_size": 1500,
  "chunk_overlap": 300,
  "index_name": "string",
  "contextual_chunking": {
    "is_enable": false,
    "separator": [
      "\n\n",
      "\n",
      ".",
      " "
    ],
    "chunk_size": 1500,
    "chunk_overlap": 300,
    "depth": 3
  },
  "multimodal": false,
  "bounding_boxes": false,
  "snd_config": {
    "type": "nested",
    "path": "abstract_vector",
    "embeddings_field": "abstract_vector.abstract_vectors",
    "page_content_field": "abstract_vector.text_chunk",
    "attribute_mapping": {
      "source": {
        "type": "copy",
        "value": "string"
      },
      "doc_name": {
        "type": "copy",
        "value": "string"
      }
    }
  }
}
Responses
GET
/data
List Models
List all the data configs that the user is authorized to access
Parameters
Try it out
Name	Description
is_admin
boolean
(query)	Lists the data configs where the user is an owner
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "additionalProp1": {}
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/{name}
Get Data Config
Get the data config.
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string-lowercase-alphanumeric-with-dashes",
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "llm-dev",
  "exclude_filter": [],
  "assume_role": "",
  "displayName": "",
  "data_config_description": "",
  "embedding": {
    "model": "valid embedding model name. for example: text-embedding-ada-002",
    "open_api_type": "valid embedding type. for example:azure"
  },
  "model_version": {
    "model_class": "string (lowercase alphanumeric with dashes) name of the model",
    "model_iteration": "valid version of the model"
  },
  "vectorstore": "elasticsearch",
  "concepts_of_interest": [
    "string"
  ],
  "augmentable_metadata": [
    "string"
  ],
  "allowed_model_configs": [
    "string"
  ],
  "chunk_size": 1500,
  "chunk_overlap": 300,
  "index_name": "string",
  "contextual_chunking": {
    "is_enable": false,
    "separator": [
      "\n\n",
      "\n",
      ".",
      " "
    ],
    "chunk_size": 1500,
    "chunk_overlap": 300,
    "depth": 3
  },
  "multimodal": false,
  "bounding_boxes": false,
  "snd_config": {
    "type": "nested",
    "path": "abstract_vector",
    "embeddings_field": "abstract_vector.abstract_vectors",
    "page_content_field": "abstract_vector.text_chunk",
    "attribute_mapping": {
      "source": {
        "type": "copy",
        "value": "string"
      },
      "doc_name": {
        "type": "copy",
        "value": "string"
      }
    }
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/data/delete/{name}
Delete Data Config
Delete the data config
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/upload/{name}
Data Upload Handler
Upload multiple files to the data store and associate them with the given model/domain.
This endpoint accepts multiple files and their corresponding metadata, uploads them into the configured data storage, and prepares them for downstream processing (e.g., embeddings or model training).
Parameters
•	name (str, path): The domain or dataset name where files should be uploaded.
•	x_user (str, header, optional): User identifier for authorization.
•	x_id (str, header, optional): Additional user or session ID for tracking.
•	x_groups (str, header, optional): Groups associated with the user for access control.
•	metadata (str, form, optional): Metadata in JSON format.
o	Single metadata for all files: {"key1": "value1"}
o	Per-file metadata: {"file1.pdf": {"author": "John"}, "file2.doc": {"author": "Jane"}}
o	If the value is not a dictionary (e.g., "file1": "string_value"), it defaults to an empty dictionary.
o	Restricted keys (entities, entity_list, bucket, prefix, source) will be skipped.
•	files (List[UploadFile], required): The list of files to upload. Each file will be stored and processed individually.
•	model_class (str, optional): Specific model class to associate uploaded data with.
•	model_iteration (int, optional): Model iteration/version number.
•	upload_timeout (int, optional): Timeout (in seconds) for file upload. Overrides the default (30 minutes). If provided, this defines the maximum allowed upload time per file.
•	content_type (str, header, optional): MIME type for the uploaded file(s). If not provided, it will be inferred from the file extension.
•	key_label (List[str], query, optional): List of metadata key-label pairs in the format "key:label". These will be merged into the metadata for each file.
•	low_priority (bool, query, default=False): If True, the job is queued in the low-priority queue. Useful for large uploads that are not time-sensitive.
•	action_on_conflict (DataActions, query, default=OVERWRITE): Defines the action when a file with the same key already exists. Options: OVERWRITE, SKIP, or ERROR.
Behavior
1.	Validates the user authorization against the domain.
2.	Validates file extensions and MIME types. Unsupported file types are skipped.
3.	Parses and validates metadata. Invalid or restricted keys are filtered out.
4.	Uploads files to storage with optional timeout handling.
5.	Returns a list of JobResponse objects indicating the status of each upload.
Returns
•	List[JobResponse]: A list containing the result of each uploaded file. Each response includes:
o	status: "success" or "failed"
o	error_message: Reason for failure (if any)
o	job_id: Unique job identifier
o	job_result: Metadata or processing results
o	docs: Storage location references
o	meta: Extra metadata (e.g., domain name)
Notes
•	If no files are provided, the API raises a 400 Bad Request.
•	Metadata is case-insensitive when filtering restricted keys.
•	The upload_timeout parameter helps avoid timeout issues for large files.
Parameters
Try it out
Name	Description
name *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

upload_timeout
integer
(query)	 

key_label
array<string>
(query)	
low_priority
boolean
(query)	Run the job in the low priority queue. Ideal for the file upload jobs that are not time sensitive.
Default value : false
 

action_on_conflict
string
(query)	Available values : skip, overwrite
 

Request body
 
metadata
string	    Enter metadata as a JSON string.
    
    Example: If you want to use single metadata for all uploaded files,
    use the following format: {"key1": "value1"}.
    
    If you want to add metadata for each file individually,
    use the following format: {"file_name_1": {"key1": "value1"}, "file_name_2": {"key1": "value1"}}.

    If you use metadata like {"file_name_1": "str_value"}, we will use an empty dictionary because this format is not proper.

    Do not use certain restricted keys like "entities", "entity_list",
    "bucket", "prefix", "source". If you pass those values, we will skip them.

files *
array<string>	
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "status": "string",
    "error_message": "string",
    "job_id": "string",
    "job_result": {
      "additionalProp1": {}
    },
    "docs": [
      null
    ],
    "meta": {}
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/upload-text/{name}
Upload Text Handler
Upload text to the model, storing the file objects & embeddings for use in the model (are available immediately after embeddings are complete)
Parameters
Try it out
Name	Description
name *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

low_priority
boolean
(query)	Run the job in the low priority queue. Ideal for the file upload jobs that are not time sensitive.
Default value : false
 

action_on_conflict
string
(query)	Available values : skip, overwrite
 

Request body
 
•	Example Value
•	Schema
{
  "text": "This is sample text which is required, kindly provide some data",
  "document_id": "string (lowercase alphanumeric)",
  "metadata": {}
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "status": "string",
  "error_message": "string",
  "job_id": "string",
  "job_result": {
    "additionalProp1": {}
  },
  "docs": [
    null
  ],
  "meta": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/async_upload/{name}
Async Upload Handler
Generates a presigned URL for uploading a file to S3.
Parameters
Try it out
Name	Description
name *
string
(path)	 

object_name *
string
(query)	 

expiration_seconds
integer
(query)	Default value : 3600
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/search-metadata/{name}
Search Documents By Metadata
Parameters
Try it out
Name	Description
name *
string
(path)	 

q *
string
(query)	Input query sent to model
 
minLength: 1
maxLength: 10485760
meta_filter
array<string>
(query)	Enter the metadata field names and values that you would like to see matching documents for. You may enter more than one metadata field. The format is key:value. For example, medicine:Zepbound. The output will show all matching documents for the metadata field(s) entered.
Default value : List []
match_any_meta
boolean
(query)	This field specifies whether to return documents where ANY metadata fields match the given criteria (True) or ALL metadata field matches the given criteria (False). This allows users to control the strictness of the metadata filtering.
Default value : true
 

k
integer
(query)	topk chunks to return
Default value : 100
 
maximum: 200
minimum: 0
rrf_threshold
number
(query)	RRF relevance score that returned documents must meet or exceed
Default value : 0
 
minimum: 0
model_class
string
(query)	 

model_iteration
integer
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/files/{name}
Get File Handler
Download the file
Parameters
Try it out
Name	Description
name *
string
(path)	 

file_key *
string
(query)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

download_file
boolean
(query)	Default value : false
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/documents/{name}
Get Documents
Get a list of doc chunks from vector store for the given file and pagination is applied as per the start_page, end_page and page_size.
Parameters
Try it out
Name	Description
name *
string
(path)	 

file_name *
string
(query)	 

k
integer
(query)	topk documents to return
Default value : 100
 
maximum: 100
minimum: 0
model_class
string
(query)	 

model_iteration
integer
(query)	 

start_page
integer
(query)	Default value : 1
 

end_page
integer
(query)	Default value : 2
 

page_size
integer
(query)	Default value : 2
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/list-files/{name}
List Files
Get a list of all the files stored in the specified S3 bucket and pagination is applied as per the start_page, end_page and page_size. By default, page_size is set to 500.
Parameters
Try it out
Name	Description
name *
string
(path)	 

page
integer
(query)	page should be greater than 0
Default value : 1
 
minimum: 1
page_size
integer
(query)	Number of items per page should be between 1 and 200
Default value : 100
 
maximum: 200
minimum: 1
filter_sync_files
boolean
(query)	Filter out files that are synced from external sources
Default value : true
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/data/delete-file-embeddings/{name}
Delete Embedding
Endpoint to delete the embeddings and stored file. If external storage is used, then pass the fully qualified path of the file.
Parameters
Try it out
Name	Description
name *
string
(path)	 

file_name *
string
(query)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/job-status-id/{name}/{job_id}
Get Job Status Handler
Get model status for job upload
Parameters
Try it out
Name	Description
name *
string
(path)	 

job_id *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "status": "string",
  "error_message": "string",
  "job_id": "string",
  "job_result": {
    "additionalProp1": {}
  },
  "docs": [
    null
  ],
  "meta": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/job-status/{name}
List Ingest Jobs
Retrieve the status of upload documents jobs for specified domain. This endpoint will return the status of all the jobs that are currently running.
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "additionalProp1": {}
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/data/jobs/clear-jobs/{name}
Clear Jobs
Clear all jobs from the queue.
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/external/list
External Files List Handler
This endpoint will list out files based on the type and prefix provided. Provide the valid type ex. onedrive or sharepoint.
Parameters
Try it out
Name	Description
type *
string
(query)	Available values : onedrive, sharepoint
 

prefix *
string
(query)	 

site_name
string
(query)	Give the valid site_name if type='sharepoint'
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  "string"
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/external/upload/{name}
External Upload Handler
Upload files from external sources like OneDrive or SharePoint to the data config.
This endpoint facilitates the ingestion of documents stored in external content repositories such as Microsoft OneDrive or SharePoint into the specified data config. It accepts paths to files or folders in these external systems, downloads the content, and processes it according to the data config's settings for vectorization and storage.
Path Parameters:
•	name (str, required): The name of the data config to upload files to
Form Parameters:
•	path (str, required): Colon-delimited list of file or folder paths to upload For individual files: folder/document.pdf For entire folders: folder For multiple items: folder/doc1.pdf:folder/doc2.docx:another_folder
Query Parameters:
•	type (ExternalType, required): Type of external repository (onedrive or sharepoint)
•	site_name (str, conditional): SharePoint site name Required when type is sharepoint
•	library_name (str, conditional): SharePoint document library name Required when type is sharepoint
•	upload_timeout (int, optional): Timeout in seconds for upload operations Helps prevent hanging on large or problematic documents
•	low_priority (bool, default=False): Whether to run the job in a low-priority queue Useful for non-time-sensitive large uploads
•	action_on_conflict (DataActions, default=OVERWRITE): How to handle documents that already exist Options: OVERWRITE, SKIP
Authorization:
•	Requires owner-level access to the specified data config
•	User must have permissions to both the data config and external content
Processing Behavior:
1.	Validates the user's authorization for the data config
2.	Establishes connection to the external system (OneDrive or SharePoint)
3.	For each path:
o	If it's a folder, recursively finds all valid files within it
o	If it's a file, validates that it's a supported format
o	Reads the file content from the external source
o	Processes and indexes the document according to data config settings
4.	Returns a list of job responses tracking the status of each file upload
Response:
Returns an array of job response objects, one for each uploaded file:
[
  {
    "status": "success",
    "job_id": "job-20251022-123456-utc",
    "error_message": null,
    "job_result": {},
    "docs": ["document1.pdf"],
    "meta": {
      "domain": "domain-name"
    }
  },
  {
    "status": "success",
    "job_id": "job-20251022-123457-utc",
    "error_message": null,
    "job_result": {},
    "docs": ["document2.docx"],
    "meta": {
      "domain": "domain-name"
    }
  }
]
Notes:
•	Files must be in formats that can be processed (PDF, DOCX, XLSX, etc.)
•	The system will validate file formats before attempting to process them
•	Very large folders may be processed in batches
•	Use the job IDs to track processing status through the job status endpoints
•	This endpoint is particularly useful for integrating with organizational document repositories
Parameters
Try it out
Name	Description
name *
string
(path)	 

type *
string
(query)	Available values : onedrive, sharepoint
 

site_name
string
(query)	Give the valid site_name if type='sharepoint'
 

library_name
string
(query)	Give the valid document library name if type='sharepoint'
 

model_class
string
(query)	 

model_iteration
integer
(query)	 

upload_timeout
integer
(query)	 

low_priority
boolean
(query)	Run the job in the low priority queue. Ideal for the file upload jobs that are not time sensitive.
Default value : false
 

action_on_conflict
string
(query)	Available values : skip, overwrite
 

Request body
 
path *
string	
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "status": "string",
    "error_message": "string",
    "job_id": "string",
    "job_result": {
      "additionalProp1": {}
    },
    "docs": [
      null
    ],
    "meta": {}
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/visualize/{name}
Visualize
Creates a t-SNE plot of the vector store, using all the documents that were ingested. Alternatively, a list of ingested documents names can be provided, or the maximum number of documents to be used for visualization. Kindly note that the minimum documents required for this endpoint to work is 6.
Parameters
Try it out
Name	Description
name *
string
(path)	 

max_num_docs
string
(query)	Default value : all
 

model_class
string
(query)	 

model_iteration
string
(query)	 

Request body
 
•	Example Value
•	Schema
[
  "string"
]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/summarize-documents/{name}
Summarize Documents
Generate a comprehensive document inventory report for a specific data config.
This endpoint creates a detailed CSV report of all unique documents stored in the vector database for the specified domain. Unlike the /count-documents/{name} endpoint which only returns a count, this endpoint performs a thorough inventory of the actual document names and generates a downloadable report.
Path Parameters:
•	name (str, required): The name of the data config to inventory
Authorization:
•	Requires owner-level access to the specified data config
Processing Behavior:
1.	Validates the user's authorization for the specified data config
2.	Scans all vector entries in the associated vector database
3.	Extracts unique document names from the metadata of each entry
4.	Generates a CSV file containing the list of all unique document names
5.	Creates an asynchronous job to handle potentially large document collections
6.	Returns a job ID that can be used to retrieve the results when ready
Report Format:
The generated CSV report contains a single column:
•	Document Name: The filename of each unique document in the vector store
Response:
Returns a job response object that can be used to track progress and retrieve results:
{
  "status": "success",
  "job_id": "job-20251022-123456-utc",
  "error_message": null,
  "job_result": {},
  "docs": [],
  "meta": {
    "domain": "domain-name",
    "job_type": "counting"
  }
}
Retrieving Results:
Once the job is complete, use the /data/download/{name}/{job_id}/counting endpoint with the returned job_id to download the CSV file.
Notes:
•	This is an asynchronous operation due to potentially large document collections
•	The report focuses on unique document names, not individual vector entries
•	Helps identify what documents are actually available in the vector database
•	The job may take significant time to complete for large document collections
Parameters
Try it out
Name	Description
name *
string
(path)	 

model_class
string
(query)	 

model_iteration
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/count-documents/{name}
Count The Number Of Indexes In The Vector Store
Count the total number of document entries indexed in the vector store for a specific data config.
It returns a simple integer count of all document chunks (vector entries) stored in the associated vector database, which is useful for monitoring ingestion progress.
Path Parameters:
•	name (str, required): The name of the data config to query
Processing Behavior:
1.	Validates the user's authorization for the specified data config
2.	Constructs the appropriate data model instance based on the config
3.	Queries the vector database to count all indexed document entries
4.	Returns the total count as an integer
Performance Notes:
•	For very large indices (millions of entries), this operation may take several seconds
•	The count represents vector entries, which may be more numerous than source documents due to chunking (each source document typically creates multiple vector entries)
Response:
Returns an integer representing the total number of vector entries:
42
Notes:
•	This is a lightweight diagnostic endpoint that only counts entries without retrieving them
•	The count represents vector entries/chunks, not original source documents
•	For detailed document listing and metadata, use other endpoints like /list-files/{name}
•	This count can be useful for comparing against expected document counts after bulk ingestion
Parameters
Try it out
Name	Description
name *
string
(path)	 

model_class
string
(query)	 

model_iteration
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema0	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/index/{name}
Reload Index
Index or reindex documents for a specified data config.
This endpoint processes documents stored in the configured S3 bucket for the given domain and creates vector embeddings for search and retrieval. It can be used for initial indexing, reindexing, or selectively indexing specific documents.
Path Parameters:
•	name (str, required): The name of the data config to index
Query Parameters:
•	limit (int, default=10000): Maximum number of documents to index Controls the batch size and prevents overloading the system
•	doc_filter (List[str], optional): Filter documents using regular expression patterns Any document matching any pattern will be included Example pattern: .*pdf will select all PDF files
•	doc_prefix (str, optional): Only index documents with this prefix Relative to the prefix defined in the data configuration Useful for targeting specific folders/directories
•	filter_list (List[str], optional): Explicit list of document names to index Names should be relative to the data config prefix Most precise way to target specific documents
•	action_on_conflict (DataActions, default=SKIP): How to handle documents that already exist Options: OVERWRITE, SKIP
•	upload_timeout (int, optional): Timeout in seconds for indexing operations Helps prevent hanging on large or problematic documents
Authorization:
•	Requires owner-level access to the specified data config
Processing Behavior:
1.	Validates the user's authorization for the data config
2.	Retrieves documents from storage based on provided filters
3.	Processes documents based on the config's settings:
o	Chunks documents according to configured strategy
o	Generates embeddings using the specified model
o	Stores vectors in the configured vector database
4.	Returns a job object for tracking the indexing progress
Response:
Returns a job response object:
{
  "status": "success",
  "job_id": "job-20251022-123456-utc",
  "error_message": null,
  "job_result": {
    "total_documents": 15,
    "successful_documents": 15,
    "failed_documents": 0
  },
  "docs": ["document1.pdf", "document2.docx"],
  "meta": {
    "domain": "domain-name"
  }
}
Notes:
•	Indexing is an asynchronous operation; use the returned job ID to track progress
•	Use specific filters to limit resource usage for large document collections
•	Reindexing may be necessary after changes to embedding models or chunking configuration
•	For very large datasets, consider running multiple smaller indexing jobs
Parameters
Try it out
Name	Description
name *
string
(path)	 

limit
integer
(query)	Maximum number of documents to index. Defaults to 10,000
Default value : 10000
 

doc_filter
array<string>
(query)	Filter the documents by set of regular expression rules, any match will be included. Example: '.*pdf'
doc_prefix
string
(query)	Only index documents that contain this prefix (relative to the prefix defined in the model config)
Default value :
 

filter_list
array<string>
(query)	List of document names to be indexed, names relative to model config prefix.
model_class
string
(query)	 

model_iteration
integer
(query)	 

action_on_conflict
string
(query)	Available values : skip, overwrite
 

upload_timeout
integer
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "status": "string",
  "error_message": "string",
  "job_id": "string",
  "job_result": {
    "additionalProp1": {}
  },
  "docs": [
    null
  ],
  "meta": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/download/{name}/{job_id}/{job_type}
Download Job Result
Downloads the results that were created via a visualization, or summarize-documents job. job_type should be either visualization or counting.
Parameters
Try it out
Name	Description
name *
string
(path)	 

job_id *
string
(path)	 

job_type *
string
(path)	Available values : visualization, counting
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/jobs/failure/{key_name}
Get Failed Job Result
This API returns the failed jobs inserted to redis via "DataStorage.report_failure". args: key_name: domain_name or config name to be given for filtering range_size: start and end index for pagination;defaults to 1-50. The range between the start and end values cannot be more than 100.
Parameters
Try it out
Name	Description
key_name *
string
(path)	 

range_size
string
(query)	default is 1-50
Default value : 0-50
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/external_s3_list_files/{name}
List Files From External S3
List files directly from an external S3 bucket configured in a data config.
This endpoint provides a direct view into the files available in an external S3 bucket that has been configured as a data source in the specified data config. Unlike the /list-external-files/{name} endpoint which shows ingested files, this endpoint shows files that exist in the source bucket but may not have been ingested yet.
Path Parameters:
•	name (str, required): The name of the data configuration domain that defines the external S3 bucket connection
Query Parameters:
•	sub_prefix (str, optional): A sub-prefix path relative to the main S3 prefix to filter results to a specific directory. Allows targeted file listing within large buckets.
Authorization:
•	Requires owner-level access to the specified data config
Processing Behavior:
1.	Validates the user's authorization for the specified data config
2.	Connects to the external S3 bucket configured in the data config
3.	Lists files directly from the bucket's specified prefix path
4.	If sub_prefix is provided, only lists files under that sub-directory
Multiple Prefix Support:
The system supports listing files from multiple prefixes within the same bucket. If the data config contains multiple prefixes (separated by colons), files from all specified prefixes will be included in the results.
Response:
Returns an array of file names from the external S3 bucket:
[
  "document1.pdf",
  "folder/document2.docx",
  "reports/quarterly/report.xlsx"
]
Notes:
•	This endpoint shows files in their original location, not ingested copies
•	Files listed may not have been processed or ingested into the system yet
•	Useful for discovering available content before ingestion
•	Does not include any file metadata beyond names and paths
•	Provides visibility into data sources for planning ingestion operations
Parameters
Try it out
Name	Description
name *
string
(path)	 

sub_prefix
string
(query)	Give the sub prefix relative to the s3 prefix
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/embeddings/list
Listembeddings
List all the valid embeddings
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {
    "model": "string",
    "chunk_size": 0,
    "iteration": 1,
    "compute_type": "cpu",
    "open_api_type": "azure",
    "dimension": 0
  },
  "additionalProp2": {
    "model": "string",
    "chunk_size": 0,
    "iteration": 1,
    "compute_type": "cpu",
    "open_api_type": "azure",
    "dimension": 0
  },
  "additionalProp3": {
    "model": "string",
    "chunk_size": 0,
    "iteration": 1,
    "compute_type": "cpu",
    "open_api_type": "azure",
    "dimension": 0
  }
}	No links
GET
/data/list-external-files/{name}
Get External Ingested Files List
Retrieve a list of files ingested from external S3 buckets for a specific data config.
This endpoint returns a comprehensive list of all files that have been ingested from external S3 buckets and are associated with the specified data config.
Path Parameters:
•	name (str, required): The name of the data config
Authorization:
•	Requires user-level access to the specified data config
•	Validates user context against the config's access control settings
Processing Behavior:
1.	Validates the user's authorization for the specified data config
2.	Retrieves the list of externally ingested files from the special "external_docs" folder in the config's storage location
3.	Returns the list of file names without any filtering or pagination
Response:
Returns a JSON array of file names:
[
  "document1.pdf",
  "document2.docx",
  "report.xlsx"
]
Notes:
•	This endpoint only lists files that were ingested from external S3 buckets
•	It does not include files uploaded directly through the standard upload endpoints
•	Files are stored in a special "external_docs" subfolder within the config's storage location
•	No pagination is currently implemented, so large document sets will return all files at once
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/event-listener
Event Listener
Process events from external systems for automated data ingestion and processing.
This endpoint listens for events from configured event sources and triggers appropriate data processing actions based on the event type and payload.
Request Body:
The endpoint expects a JSON payload with the following structure:
Core Event Information:
•	event_source (str): The source system generating the event (e.g., "aws:s3")
•	bucket (str): Source bucket/container where the data is stored
•	key (str): Object key/path of the file or resource that triggered the event
Supported Event Sources:
AWS S3 Events:
•	When new files are uploaded to configured S3 buckets
•	When files are modified in configured S3 buckets
•	Format: {"event_source": "aws:s3", "bucket": "bucket-name", "key": "path/to/file.pdf"}
Processing Behavior:
1.	The system identifies the event source from the payload
2.	The appropriate event handler is selected based on the event source
3.	For S3 events, the system:
o	Identifies matching data configurations based on the bucket and prefix mapping
o	Automatically triggers data ingestion for the new/updated file
o	Associates the file with the correct data domain(s)
o	Processes the file according to domain configuration (chunking, embedding, etc.)
Response:
Returns information about the triggered processing jobs:
[
    {
        "status": "success",
        "job_id": "job-12345",
        "data_config": "domain-name"
    }
]
Notes:
•	This endpoint is primarily intended for automated webhook integrations
•	Manual testing via Swagger UI may not produce meaningful results without properly formatted event payloads
•	For manual file uploads, use the /data/upload/{name} endpoint instead
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
POST
/data/chunks/{name}
Generate Chunks
Generate document chunks for uploaded files using a specified chunking strategy.
This endpoint takes one or more uploaded files and splits their contents into smaller, structured "chunks" based on the chosen chunking strategy and parameters. These chunks can then be used for downstream tasks such as search, summarization, embeddings, or fine-tuned model training.
________________________________________
Path Parameters:
•	name (str): The data configuration name. Used to fetch data-related settings.
Headers:
•	x_org (Optional[str]): The organization identifier.
•	x_id (Optional[str]): The user identifier.
•	x_groups (Optional[str]): The groups or roles the user belongs to.
Query Parameters:
•	chunking_strategy (ChunkingStrategy): Strategy for chunking text.
o	Options: contextual, semantic (currently only contextual is implemented).
o	Default: contextual.
•	depth (int): Controls the hierarchical level of splitting.
o	0: One chunk for the entire document.
o	1: Split into top-level sections (e.g., Introduction, Methods, Results).
o	2: Split into subsections, and so on.
o	Default: 1.
•	chunk_size (int, optional): Maximum token size per chunk.
o	If a chunk exceeds this size, it is further split.
o	Default: None (no size restriction).
•	chunk_overlap (int, optional): Number of overlapping tokens between chunks.
o	Helps preserve context across chunks.
o	Default: None (no overlap).
•	separators (List[str], optional): Explicit delimiters for splitting text.
o	Examples: ["\n\n", "\n", ".", " "].
o	Default: Inherits from configuration if not provided.
•	upload_timeout (int, optional): Timeout in seconds for file upload processing.
o	Default: None (uses system default).
•	model_class (str, optional): Model class identifier for contextual/semantic chunking.
•	model_iteration (int, optional): Model version/iteration for chunking.
Request Body:
•	files (List[UploadFile]): One or more files to be processed and chunked.
Returns:
•	List[JobResponse2]: A list of job responses representing the processing state/results of each uploaded file. Each job contains metadata and references to the generated chunks.
Errors:
•	401 Unauthorized: If the user does not have permission to access the given config.
•	404 Not Found: If the requested chunking strategy is not implemented.
Parameters
Try it out
Name	Description
name *
string
(path)	 

upload_timeout
integer
(query)	 

chunking_strategy
string
(query)	Chunking strategy e.g. contextual, semantic. Default is Contextual
Available values : contextual, semantic
 

depth
integer
(query)	Defines the granularity of chunks within the document. Granularity levels are as follows:
•	0: A single chunk representing the entire document.
•	1: Each chunk represents a top-level section (e.g., abstract, introduction, methods, results, conclusion in a research paper).
•	2: Each chunk represents subsections within sections, and so on. Defaults to 1, meaning the document is divided into top-level sections.
Default value : 1
 

chunk_size
integer
(query)	The maximum token size for each chunk. If set, and the chunks generated based on the depth parameter exceed this token size, the chunks will be further split to ensure they do not exceed chunk_size. Defaults to None, meaning no size limit is enforced.
 

chunk_overlap
integer
(query)	Defines the number of tokens to overlap between adjacent chunks when chunk_size is set. Overlap ensures continuity between chunks for downstream tasks like summarization or text generation. Defaults to None, meaning no overlap is applied.
 

separators
array<string>
(query)	A list of characters or strings used to split the text into chunks. Common separators include paragraph markers (\n\n), newlines (\n), sentences (.), and words (). If not provided, the default behavior uses these common separators.
model_class
string
(query)	 

model_iteration
integer
(query)	 

Request body
 
files *
array<string>	
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "type": "string",
    "job_type": "string",
    "job_input_delivery": "string",
    "job_output_delivery": "string",
    "job_id": "string",
    "status": "string",
    "error_message": "string",
    "domain": "string",
    "job_result": {},
    "meta": {}
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/migrate/{source}/{destination}/{name}
Migrate Index From One Vectorstore To Another
Migrate the chunked values in an elastic search index from elasticsearch to pinecone using data config name
Parameters
Try it out
Name	Description
name *
string
(path)	Data Config Name
 

source *
string
(path)	Source Vectorstore Name
Available values : elasticsearch, pinecone
 

destination *
string
(path)	Destination Vectorstore Name
Available values : elasticsearch, pinecone
 

action_on_conflict
string
(query)	Available values : skip, overwrite
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/jobs-count-in-queue/{name}
Get The Count Of Jobs In The Queue For A Data Config
Get the length of the redis queue for each data config
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema0	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/redshift-connector/{name}
Query Redshift
Fetch the data from redshift
Parameters
Try it out
Name	Description
name *
string
(path)	 

secret_id *
string
(query)	 

Request body
 
query *
string	Provide the SQL query here
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/upload_custom_chunking/{name}
Upload Custom Chunking
Handles the upload and processing of a JSON file for Pinecone vector store.
## Requirements:

- This endpoint only supports JSON files, and the file size must be ≤ 100 MB.
- This endpoint only supports the **Pinecone vector store**.
- The JSON file must be uploaded using the /data/async_upload/{name} endpoint.
- The request body must include the JSON file name.
- The JSON file must follow the structure:

```json
[
    {
        "text": "text",
        "source": "path/to/file",
        "metadata": {
            "keywords": ["keyword1", "keyword2"]
        }
    }
]
```

- If any required field (`text`, `source`, `metadata.keywords`) is missing, that entry will be skipped.
- We will skip the chunk if the combined size of the metadata and text exceeds 35 KB.
- This API returns a job response that can be used to track the status of the upload process.
Parameters
Try it out
Name	Description
name *
string
(path)	 

file_name *
string
(query)	 

upload_timeout
integer
(query)	 

action_on_conflict
string
(query)	Available values : skip, overwrite
Default value : overwrite
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "status": "string",
  "error_message": "string",
  "job_id": "string",
  "job_result": {
    "additionalProp1": {}
  },
  "docs": [
    null
  ],
  "meta": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/custom_search/{config_name}
Custom Search
Custom search the vector store index using the custom filter
https://docs.pinecone.io/guides/data/understanding-metadata
Example 1. - Filtering by entity attribute of metadata
{ "filter": {"entities" : {"$in": ["Lilly,Indiana,Indianapolis"]}}, "threshold_score": 1.7 }
Example 2. - Filtering by theme and entity attribute of metadata
{ "filter": {"$and": [{"theme" : {"$eq": "informative"}}, {"entities" : {"$in": ["Lilly,Indiana,Indianapolis"]}}]}, "threshold_score": 1.5 }
Parameters
Try it out
Name	Description
config_name *
string
(path)	 

query *
string
(query)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

top_k
integer
(query)	topk documents to return
Default value : 20
 
maximum: 200
minimum: 1
Request body
 
•	Example Value
•	Schema
{
  "filter": {
    "additionalProp1": {}
  },
  "threshold_score": 1.5
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/{data_name}/exists
Check Data Exists
Check if the data exists
Parameters
Try it out
Name	Description
data_name *
string
(path)	 

Responses



Feature Flag
POST
/feature-flag/enable/{flag_name}
Enable a feature flag (super-admin only)
Provide the name of the feature flag to enable. If the feature flag does not exist, it will be created.
    Only super admins can enable feature flags.
Parameters
Try it out
Name	Description
flag_name *
string
(path)	The name of the feature flag to enable
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "flag_name": "string",
  "current_value": true,
  "previous_value": true
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/feature-flag/disable/{flag_name}
Disable a feature flag (super-admin only)
Provide the name of the feature flag to disable. If the feature flag does not exist, it will be created.
    Only super admins can disable feature flags.
Parameters
Try it out
Name	Description
flag_name *
string
(path)	The name of the feature flag to disable
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "flag_name": "string",
  "current_value": true,
  "previous_value": true
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/feature-flag/{flag_name}
Delete a feature flag (super-admin only)
Provide the name of the feature flag to delete. Responds back with the status of the feature flag prior to deletion.
Deleting a feature flag is the same as disabling it. This should be used to prune old feature flags that are removed as features become permanent.
    Only super admins can delete feature flags.
Parameters
Try it out
Name	Description
flag_name *
string
(path)	The name of the feature flag to delete
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "flag_name": "string",
  "current_value": true
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/feature-flag/status/{flag_name}
Get the current status of a feature flag
Provide the name of the feature flag to get the status. Returns a current value of false, when the feature flag does not exist.
Parameters
Try it out
Name	Description
flag_name *
string
(path)	The name of the feature flag to check
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "flag_name": "string",
  "current_value": true
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/feature-flag/list
Get the list of all feature flags known to the system
Provide a list of all persisted feature flags.
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "flags": [
    {
      "flag_name": "string",
      "current_value": true
    }
  ]
}	No links





History
Manages user session history & messages
GET
/history/{model}/sessions
Get History Sessions
Get user's current sessions
Parameters
Try it out
Name	Description
model *
string
(path)	 

start
integer
(query)	Default value : -1
 

end
integer
(query)	Default value : -1
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "sessions": [
    {
      "id": "",
      "lastUpdated": 0,
      "lastMessagePartial": {
        "id": "",
        "query": "",
        "response": "",
        "created": 0,
        "tokenCount": 0,
        "steps": [
          {
            "name": "",
            "message": "",
            "status": "",
            "state": {
              "additionalProp1": "string",
              "additionalProp2": "string",
              "additionalProp3": "string"
            },
            "parent": ""
          }
        ],
        "state": {
          "additionalProp1": "string",
          "additionalProp2": "string",
          "additionalProp3": "string"
        }
      }
    }
  ]
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/history/{model}/sessions/{session_id}
Get History Session
Get specified session current messages
Parameters
Try it out
Name	Description
model *
string
(path)	 

session_id *
string
(path)	 

start
integer
(query)	Default value : -1
 

end
integer
(query)	Default value : -1
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "messages": [
    {
      "id": "",
      "query": "",
      "response": "",
      "created": 0,
      "tokenCount": 0,
      "steps": [
        {
          "name": "",
          "message": "",
          "status": "",
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          },
          "parent": ""
        }
      ],
      "state": {
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
      }
    }
  ],
  "sessonStorage": ""
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/history/user/{user_id}/messages
Get Messages By User
Get all messages for a user within a specified time range, grouped by modelID and sessionID. Restricted to cyber admin group members only. Results are paginated with a maximum of 100 messages per page. All timestamps are expected to be in milliseconds.
Parameters
Try it out
Name	Description
user_id *
string
(path)	 

start_time
integer
(query)	Start timestamp in milliseconds (unix timestamp)
Default value : 0
 
minimum: 0
end_time
integer
(query)	End timestamp in milliseconds (unix timestamp)
 
minimum: 0
page_size
integer
(query)	Number of messages per page
Default value : 100
 
maximum: 100
minimum: 1
page_number
integer
(query)	Page number (1-based)
Default value : 1
 
minimum: 1
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "messages": {
    "additionalProp1": {
      "additionalProp1": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ],
      "additionalProp2": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ],
      "additionalProp3": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ]
    },
    "additionalProp2": {
      "additionalProp1": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ],
      "additionalProp2": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ],
      "additionalProp3": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ]
    },
    "additionalProp3": {
      "additionalProp1": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ],
      "additionalProp2": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ],
      "additionalProp3": [
        {
          "id": "",
          "query": "",
          "response": "",
          "created": 0,
          "tokenCount": 0,
          "steps": [
            {
              "name": "",
              "message": "",
              "status": "",
              "state": {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string"
              },
              "parent": ""
            }
          ],
          "state": {
            "additionalProp1": "string",
            "additionalProp2": "string",
            "additionalProp3": "string"
          }
        }
      ]
    }
  },
  "pagination": {
    "additionalProp1": 0,
    "additionalProp2": 0,
    "additionalProp3": 0
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	







Jobs
GET
/job/summary-result/{job_id}
Get Summary Job Result
Retrieves the status and results of a document summarization job.
When running summary, ephemeral files are uploaded by a user. As job authorization is based on model, this could allow a different user to access file summary results of another user. This function restricts results access to be user-scoped for security. Only the user who initiated the job can retrieve its results, enforced through the restrict_access_by_user_id field on the job structure.
This logic is specific to summary jobs but could be extended to other job types in the future as seen in get_summary_job_by_id.
Parameters
Try it out
Name	Description
job_id *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/job/summary-status/{job_id}
Get Summary Job Status Handler
Retrieves the status and results of a document summarization job.
When running summary, ephemeral files are uploaded by a user. As job authorization is based on model, this could allow a different user to access file summary results of another user. This function restricts results access to be user-scoped for security. Only the user who initiated the job can retrieve its results, enforced through the restrict_access_by_user_id field on the job structure.
This logic is specific to summary jobs but could be extended to other job types in the future as seen in get_summary_job_by_id.
Parameters
Try it out
Name	Description
job_id *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/job/job-status/{job_id}
Get Job Status Handler
Get job status for evaluation, clustering, counting, and refined summary etc.
Parameters
Try it out
Name	Description
job_id *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/job/download/{job_id}/{job_type}
Download Job Result
Downloads the results from a job (visualization, clustering, counting).
Parameters
Try it out
Name	Description
job_id *
string
(path)	 

job_type *
string
(path)	Available values : visualization, counting, clustering
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/job/job-result/{job_id}
Get Job Result
Get job result of job which turns to be finished
Parameters
Try it out
Name	Description
job_id *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/job/clear-jobs/{name}
Clear Jobs
Clear all the jobs from the queue associated with the given config name.
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/job/requeue-jobs
Requeue Job Handler
This endpoint is used to requeue the jobs which are expired but are in started state in the started job registry, we fetch these kinds of jobs across the queues that we have and requeue them to the respective queue.
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/job/redis-queued-jobs-count
Get Redis Queued Jobs Count
This endpoint is used to get the count of jobs in the redis registries.
Parameters
Try it out
Name	Description
config_name
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/job/workflow/status/{config_name}
Get Running Workflow By Config
Parameters
Try it out
Name	Description
config_name *
string
(path)	 

status *
string
(query)	Available values : Running, Failed, Canceled, TimedOut, Terminated, Completed
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/job/kill/workflows/{config_name}
Kill Workflows
Parameters
Try it out
Name	Description
config_name *
string
(path)	 

workflow_ids *
array<string>
(query)	List of workflow IDs in the format ['part1#part2#part3', ...]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	




Jobs
Migration | Cortex super admins only
POST
/prompt/migrate
Prompt Migrate
Parameters
Try it out
Name	Description
app_binding
string
(query)	App binding for the model configs to be migrated
Available values : Chat Builder, MD3, Everything Else(Except Chat Builder and MD3)
 

Request body
 
•	Example Value
•	Schema
[]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/prompt/migrate/job-status
Job Status
Parameters
Try it out
Name	Description
job_id *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/migrate
Data Config Migration
Parameters
Try it out
Name	Description
app_binding
string
(query)	App binding for the model configs to be migrated
Available values : Chat Builder, MD3, Everything Else(Except Chat Builder and MD3)
 

Request body
 
•	Example Value
•	Schema
[]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/migrate/job-status
Job Status
Parameters
Try it out
Name	Description
job_id *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/security/migrate
Childsecurity Migrate
Parameters
Try it out
Name	Description
app_binding
string
(query)	App binding for the model configs to be migrated
Available values : Chat Builder, MD3, Everything Else(Except Chat Builder and MD3)
 

Request body
 
•	Example Value
•	Schema
[]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/security/migrate/job-status
Job Status
Parameters
Try it out
Name	Description
job_id *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/migrate
Model Migrate
Parameters
Try it out
Name	Description
app_binding
string
(query)	App binding for the model configs to be migrated
Available values : Chat Builder, MD3, Everything Else(Except Chat Builder and MD3)
 

Request body
 
•	Example Value
•	Schema
[]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/migrate/job-status
Model Job Status
Parameters
Try it out
Name	Description
job_id *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/pinecone_ids/migrate
Upsert Delete Pinecone Ids
Parameters
Try it out
Name	Description
index_host *
string
(query)	The host of the index to be migrated
 

bucket_name *
string
(query)	The name of the bucket where the vectors are stored
 

timeout
integer
(query)	Timeout for the job
Default value : 3600
 

batch_size
integer
(query)	Batch size for processing the ids
Default value : 100
 
maximum: 200
minimum: 100
number_of_workers
integer
(query)	Number of workers to be used for processing the ids
Default value : 5
 
maximum: 16
minimum: 1
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/pinecone_ids/migration/job-status
Pinecone Ids Migration Status
Parameters
Try it out
Name	Description
job_id *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/migration/history
Migrate Cortex History S3
Triggers migration of Cortex history S3 files via a Temporal workflow. If "models" is provided, only folders under those models are migrated.
Parameters
Try it out
Name	Description
models
array<string>
(query)	
activity_run_time
integer
(query)	Timeout for each individual activity within the workflow (3 hours default)
Default value : 10800
 

workflow_run_time
integer
(query)	Timeout for the complete workflow from start to finish (24 hours default
Default value : 86400
 

batch_size
integer
(query)	Number of files to process per batch
Default value : 1000
 
minimum: 100
maximum: 5000
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/migration/history/validate
Validate Cortex History Migration Completion
Validates that all Cortex history S3 files have been properly migrated. Starts a validation workflow and returns immediately with workflow ID for tracking.
Parameters
Try it out
Name	Description
models
array<string>
(query)	
activity_run_time
integer
(query)	Timeout for the validation activity (1 hour default)
Default value : 3600
 

workflow_run_time
integer
(query)	Timeout for the complete validation workflow (2 hours default)
Default value : 7200
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/tagging/cortex-guard
Tag Cortex Guard S3
Triggers tagging of Cortex Guard S3 files via a Temporal workflow. If "user_ids" is provided, only folders under those user IDs are tagged.
Parameters
Try it out
Name	Description
user_ids
array<string>
(query)	
activity_run_time
integer
(query)	Timeout for each individual activity within the workflow (3 hours default)
Default value : 10800
 

workflow_run_time
integer
(query)	Timeout for the complete workflow from start to finish (24 hours default
Default value : 86400
 

batch_size
integer
(query)	Number of files to process per batch
Default value : 1000
 
minimum: 100
maximum: 5000
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/data/tagging/cortex-guard/validate
Validate Cortex Guard Tagging Completion
Validates that all Cortex Guard S3 files have been properly tagged. Starts a validation workflow and returns immediately with workflow ID for tracking.
Parameters
Try it out
Name	Description
user_ids
array<string>
(query)	
activity_run_time
integer
(query)	Timeout for the validation activity (1 hour default)
Default value : 3600
 

workflow_run_time
integer
(query)	Timeout for the complete validation workflow (2 hours default)
Default value : 7200
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/migrate/litellm
Litellm Migrate
Parameters
Try it out
Name	Description
app_binding
string
(query)	App binding for the model configs to be migrated
Available values : Chat Builder, MD3, Everything Else(Except Chat Builder and MD3)
 

Request body
 
•	Example Value
•	Schema
[]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/data/migrate/litellm
Litellm Migrate Data
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
[]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/migrate/litellm/job-status
Job Status
Parameters
Try it out
Name	Description
job_id *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/redis/scan
Scan Redis Patterns
Scans Redis keys matching the specified pattern(s) and provides detailed statistics.
This endpoint triggers a Temporal workflow that:
•	Scans Redis for keys matching each pattern
•	Provides statistics on key count, expiry status, memory usage
•	Execution time and performance metrics
•	Supports both single and multiple patterns
Examples:
•	Single pattern: {"patterns": ["user:*"]}
•	Multiple patterns: {"patterns": ["user:*", "session:*", "cache:*"]}
•	{*}:::*: Session keys (with Redis Cluster hash tags)
•	*:::meta: Metadata keys
Security: Requires 'cortex-super-admins' group membership.
Parameters
Try it out
Name	Description
batch_size
integer
(query)	Number of keys to process in each batch (100-10000)
Default value : 1000
 
maximum: 10000
minimum: 100
activity_timeout
integer
(query)	Timeout for activities in seconds (5 minutes)
Default value : 3600
 
minimum: 300
workflow_timeout
integer
(query)	Timeout for the complete workflow (10 minutes)
Default value : 7200
 
minimum: 600
Request body
 
•	Example Value
•	Schema
[
  "string"
]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/redis/scan/user-models
Scan Redis User Model Keys
Scans Redis specifically for Base64 encoded user model keys and provides comprehensive analytics.
This endpoint triggers a Temporal workflow that:
•	Scans all Redis keys to find Base64 encoded user_id:::model_name patterns
•	Provides detailed statistics on user model distribution
•	Analyzes session counts, TTL status, and memory usage
•	Tracks unique users, models, and user-model combinations
•	Returns comprehensive analytics including activity timestamps
User Model Key Format: base64(user_id:::model_name)
Analytics Provided:
•	User and model distribution statistics
•	Session activity analysis (latest/oldest timestamps)
•	TTL status and expiry analysis
•	Memory usage statistics
•	User-model combination patterns
Security: Requires 'cortex-super-admins' group membership.
Parameters
Try it out
Name	Description
batch_size
integer
(query)	Number of keys to process in each batch (100-10000)
Default value : 1000
 
maximum: 10000
minimum: 100
activity_timeout
integer
(query)	Timeout for activities in seconds (5 minutes minimum)
Default value : 3600
 
minimum: 300
workflow_timeout
integer
(query)	Timeout for the complete workflow (10 minutes minimum)
Default value : 7200
 
minimum: 600
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/redis/meta-ttl
Add Ttl To Redis Meta Keys
Adds TTL to Redis metadata keys and cleans up expired keys based on lastUpdated timestamps.
This endpoint triggers a Temporal workflow that:
•	Scans Redis for keys matching the metadata pattern (*:::meta)
•	Parses SessionMetadata protobuf to extract lastUpdated timestamp
•	Calculates TTL so keys expire ttl_days after lastUpdated time
•	Sets appropriate TTL on keys that are still valid
•	DELETES keys that are already past their calculated expiry date (cleanup)
Key Pattern: Keys matching *:::meta contain SessionMetadata protobuf with lastMessagePartial.created field representing the last activity timestamp.
TTL Logic:
•	expiry_time = lastUpdated + ttl_days
•	If expiry_time > current_time: Set TTL for remaining time
•	If expiry_time <= current_time: Delete expired key immediately
Examples:
•	Default: {"pattern": "*:::meta", "ttl_days": 30} - All meta keys, 30-day TTL
•	User-specific: {"pattern": "user:123:*:::meta", "ttl_days": 14} - Specific user, 14-day TTL
Security: Requires 'cortex-super-admins' group membership.
Parameters
Try it out
Name	Description
pattern
string
(query)	Redis key pattern for metadata keys (default: '*:::meta')
Default value : *:::meta
 

ttl_days
integer
(query)	Number of days to keep keys alive from lastUpdated time (1-365 days)
Default value : 30
 
maximum: 365
minimum: 1
batch_size
integer
(query)	Number of keys to process in each batch (100-10000). Use 1000-2000 for millions of keys to optimize memory usage. Also used as checkpoint interval.
Default value : 1000
 
maximum: 10000
minimum: 100
resume_from_checkpoint
boolean
(query)	If true, resume from a saved checkpoint per node when available; otherwise start from the beginning.
Default value : false
 

activity_timeout
integer
(query)	Timeout for activities in seconds (5 minutes)
Default value : 3600
 
minimum: 300
workflow_timeout
integer
(query)	Timeout for the complete workflow (10 minutes)
Default value : 7200
 
minimum: 600
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/redis/user-model-ttl
Add Ttl To Redis User Model Keys
Adds TTL to Redis user model keys and cleans up expired keys based on latest session activity timestamps.
User Model Key Pattern: b64encode(f"{user_id}:::{model_name}")
What this endpoint does:
•	Scans Redis for keys matching the user model pattern (base64 encoded user_id:::model_name)
•	Gets the latest timestamp from each ZSET (highest score = latest session activity)
•	Calculates TTL so keys expire ttl_days after their latest session activity
•	DELETES keys that are already past their calculated expiry date (cleanup)
•	Processes keys in batches with checkpoint support for resumability
•	SKIPS keys that already have TTL set (safe for re-runs)
Timestamp-based TTL Logic:
•	User model keys are ZSETs containing: session_id -> timestamp (message.created)
•	TTL calculated as: remaining_seconds = (latest_timestamp + ttl_days_ms - current_time_ms) / 1000
•	Keys expire relative to their last activity, not when migration runs
Safety Features:
•	Resumable: saves checkpoint after each batch
•	Idempotent: skips keys that already have TTL
•	Validates key format before processing
•	Comprehensive error handling and statistics
Returns:
•	workflow_id: Use to track progress in Temporal UI
•	Keys already expired will be automatically deleted
•	Checkpoints saved for resumability if workflow interrupted
Example patterns processed:
•	b64encode("user123:::gpt-4") -> User model ZSET
•	b64encode("alice@company.com:::claude-3") -> User model ZSET
Parameters
Try it out
Name	Description
batch_size
integer
(query)	Number of keys to process in each batch (default: 1000)
Default value : 1000
 
maximum: 10000
minimum: 100
ttl_days
integer
(query)	Number of days to keep keys alive from latest session activity (default: 30)
Default value : 30
 
maximum: 365
minimum: 1
resume_from_checkpoint
boolean
(query)	Resume from saved checkpoint if available (default: false)
Default value : false
 

activity_timeout
integer
(query)	Timeout for activities in seconds (default: 3600)
Default value : 3600
 
minimum: 60
workflow_timeout
integer
(query)	Timeout for the entire workflow in seconds (default: 7200)
Default value : 7200
 
minimum: 300
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/redis/session-ttl
Add Ttl To Redis Session Keys
Adds TTL to Redis session keys and cleans up expired keys based on latest message timestamps.
Session Key Pattern: {<b64(user_id:model_name)>}:::<b64(session_id)>
What this endpoint does:
•	Scans Redis for keys matching the session pattern (with Redis Cluster hash tags)
•	Gets the latest timestamp from each ZSET (highest score = latest message)
•	Calculates TTL so keys expire ttl_days after their latest message
•	DELETES keys that are already past their calculated expiry date (cleanup)
•	Processes keys in batches with checkpoint support for resumability
•	SKIPS keys that already have TTL set (safe for re-runs)
•	FILTERS OUT meta keys (handled by separate endpoint)
Timestamp-based TTL Logic:
•	Session keys are ZSETs containing: message_id -> timestamp (message.created)
•	TTL calculated as: remaining_seconds = (latest_timestamp + ttl_days_ms - current_time_ms) / 1000
•	Keys expire relative to their last activity, not when migration runs
Safety Features:
•	Resumable: saves checkpoint after each batch
•	Idempotent: skips keys that already have TTL
•	Validates session key format before processing
•	Comprehensive error handling and statistics
Returns:
•	workflow_id: Use to track progress in Temporal UI
•	Keys already expired will be automatically deleted
•	Checkpoints saved for resumability if workflow interrupted
Example patterns processed:
•	{dXNlcjEyMzpncHQtNA==}:::c2Vzc2lvbjEyMw== -> Session ZSET
•	{YWxpY2VAY29tcGFueS5jb206Y2xhdWRlLTM=}:::YWJjZGVmZ2g= -> Session ZSET
Parameters
Try it out
Name	Description
batch_size
integer
(query)	Number of keys to process in each batch (default: 1000)
Default value : 1000
 
maximum: 10000
minimum: 100
ttl_days
integer
(query)	Number of days to keep keys alive from latest message (default: 30)
Default value : 30
 
maximum: 365
minimum: 1
resume_from_checkpoint
boolean
(query)	Resume from last saved checkpoint (default: False)
Default value : false
 

activity_timeout
integer
(query)	Timeout for activities in seconds (default: 3600)
Default value : 3600
 
minimum: 60
workflow_timeout
integer
(query)	Timeout for the entire workflow in seconds (default: 7200)
Default value : 7200
 
minimum: 300
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/redis/ttl/checkpoint
Get Redis Ttl Checkpoint
Retrieves the current checkpoint for Redis TTL migration operations.
What this endpoint does:
•	Checks if there's an existing checkpoint for the specified pattern's TTL migration
•	Returns checkpoint data including cursor position and progress statistics
•	Useful for resuming interrupted migrations or checking progress
Supported Patterns:
•	user_model: User model keys (base64 encoded user_id:::model_name)
•	{*}:::*: Session keys (with Redis Cluster hash tags)
•	*:::meta: Metadata keys
•	Custom patterns as needed
Checkpoint Information Includes:
•	cursor: Current scan position in Redis (for resuming)
•	keys_processed: Number of keys processed so far
•	keys_updated_ttl: Number of keys that had TTL successfully set
•	keys_deleted_expired: Number of keys deleted due to expiry
•	timestamp: When the checkpoint was last saved
•	checkpoint_age_seconds: How old the checkpoint is
Use Cases:
•	Check if a previous migration is in progress
•	Get cursor position to resume from where migration left off
•	Monitor progress of long-running migrations
•	Determine if migration completed successfully
Returns:
•	If checkpoint exists: Full checkpoint data with progress information
•	If no checkpoint: checkpoint_found: false
Parameters
Try it out
Name	Description
pattern *
string
(query)	Migration pattern identifier (e.g., 'user_model', '{}:::', '*:::meta')
 

ttl_days
integer
(query)	TTL days configuration that was used in the migration (default: 30)
Default value : 30
 
maximum: 365
minimum: 1
activity_timeout
integer
(query)	Timeout for activities in seconds (default: 60)
Default value : 60
 
minimum: 30
workflow_timeout
integer
(query)	Timeout for the entire workflow in seconds (default: 120)
Default value : 120
 
minimum: 60
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | Ask
GET
/model/ask-with-custom-prompt/{model}
Custom Ask Handler
Ask a question by passing custom prompt and context. Filter it by file(s) from which you want the answer
Parameters
Try it out
Name	Description
model *
string
(path)	 

prompt
string
(query)	Default value :
 

model_context
string
(query)	Default value :
 

filter_by_file
array<string>
(query)	
model_class
string
(query)	 

model_iteration
integer
(query)	 

default_knowledge
boolean
(query)	 

model_session_id_param
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/ask-with-custom-prompt/{model}
Custom Prompt Handler
Ask a question by passing custom prompt and context. Filter it by file(s) from which you want the answer (use for large queries)
Parameters
Try it out
Name	Description
model *
string
(path)	 

filter_by_file
array<string>
(query)	
model_class
string
(query)	 

model_iteration
integer
(query)	 

default_knowledge
boolean
(query)	 

model_session_id_param
string
(query)	 

Request body
 
•	Example Value
•	Schema
{
  "prompt": "string",
  "model_context": "string"
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/ask/{model}
Askhandler
Send queries to model config
Request Parameters
•	model (str, required): Name of the model config to use
•	q (str, required): The question or query text to send to the model
•	model_class (str, optional): Specific model class to use if different from config default
•	model_iteration (int, optional): Specific Model version iteration to use if different from config default
•	model_session_id_param (str, optional): Used to reference the same session across multiple requests to retrieve chat history
•	stream (bool, optional): Enable real-time streaming responses (default: false)
•	no_summary (bool, optional): Skip document summarization in RAG (default: false)
•	filter_by_file (list[str], optional): Used to limit search in data config to provided file names (Used in case the data config has large number of files ingested)
•	workflow_timeout (int, optional): Timeout for the workflow in seconds (default: 1800)
•	background_job (bool, optional): If true, the request will be processed in the background using temporal and a job ID will be returned. (default: false)
Response
•	Returns ModelResponse containing the model's answer, metadata, and processing details.
•	For streaming requests, returns StreamingModelResponseMessage with real-time chunks.
•	Background jobs return JobResponse with job tracking information.
Notes
•	Authentication required - User must have access to the specified model configuration
•	Background processing recommended for long-running or resource-intensive queries
Example Request
GET /model/ask/my-model
q=Hello World
stream=false
Example Response
{
    "message": "Hello! How can I assist you today?",
    "source_metadata": [],
    "command_request": null,
    "token_count": null,
    "steps": [
        {
        "name": "Model",
        "message": "# Starting model chain (with memory character size: 0): ['model-only-chain-v1']",
        "status": "running",
        "state": {},
        "parent": "root"
        },
        {
        "name": "Base Model",
        "message": "### Model Only Chain Used prompt template ...",
        "status": "done",
        "state": {},
        "parent": "root"
        }
    ],
    "logprobs": {},
    "status": [],
    "state_params": {}
}
Example Request With Streaming
GET /model/ask/my-model
q=Hello World
stream=true
Example Response With Streaming
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":"# Starting model chain (with memory character size: 0): ['model-only-chain-v1'] ","name":"Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"pending"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"message","message_fragment":"Hello! How can I assist you today?"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":"### Model Only Chain Used prompt template with token size (52):  You are a helpful AI chat assistant. You can be asked questions in any language. Your goal is to respond correctly and comprehensively.   You have access to your chat_history: History: {chat_history} Question: {question}  Answer:  ","name":"Base Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"done"}
Parameters
Try it out
Name	Description
model *
string
(path)	 

q *
string
(query)	Input query sent to model
 
minLength: 1
maxLength: 10485760
model_class
string
(query)	 

model_iteration
integer
(query)	 

model_session_id_param
string
(query)	 

stream
boolean
(query)	Default value : false
 

no_summary
boolean
(query)	True: No summary of retrieved documents; False: Default behaviour i.e. summarise the document retrieved via RAG
Default value : false
 

workflow_timeout
integer
(query)	Timeout for the workflow in seconds. If not specified, defaults to 30 minutes.
Default value : 1800
 

background_job
boolean
(query)	If true, the request will be processed in the background using temporal and a job ID will be returned.
Default value : false
 

filter_by_file
array<string>
(query)	
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/ask/{model}
Ask Handler
Send queries to model config, with Multimodal support
Request Parameters
•	model (str, required): Name of the model config to use
•	q (str, required): The question or query text to send to the model
•	uploaded_file (UploadFile, optional): File to upload and process with the query. Note: Supported only by multimodal models, and filetype compatibility depends on the specific model.
•	model_class (str, optional): Specific model class to use if different from config default
•	model_session_id_param (str, optional): Used to reference the same session across multiple requests to retrieve chat history
•	stream (bool, optional): Enable real-time streaming responses (default: false)
•	no_summary (bool, optional): Skip document summarization in RAG (default: false)
•	filter_by_file (list[str], optional): Used to limit search in data config to provided file names (Used in case the data config has large number of files ingested)
•	chunks (list, optional): Directly pass chunks to skip the retrieval from vector store. Useful in case of user_doc_chain.
•	workflow_timeout (int, optional): Timeout for the workflow in seconds (default: 1800)
•	background_job (bool, optional): If true, the request will be processed in the background using temporal and a job ID will be returned. (default: false)
Response
•	Returns ModelResponse containing the model's answer, metadata, and processing details.
•	For streaming requests, returns StreamingModelResponseMessage with real-time chunks.
•	Background jobs return JobResponse with job tracking information.
Notes
•	Authentication required - User must have access to the specified model configuration
•	Document limit validation enforced based on model config settings
•	Background processing recommended for long-running or resource-intensive queries
Example Request
POST /model/ask/my-model
Content-Type: multipart/form-data
q=Hello World
stream=false
Example Response
{
    "message": "Hello! How can I assist you today?",
    "source_metadata": [],
    "command_request": null,
    "token_count": null,
    "steps": [
        {
        "name": "Model",
        "message": "# Starting model chain (with memory character size: 0): ['model-only-chain-v1']",
        "status": "running",
        "state": {},
        "parent": "root"
        },
        {
        "name": "Base Model",
        "message": "### Model Only Chain Used prompt template ...",
        "status": "done",
        "state": {},
        "parent": "root"
        }
    ],
    "logprobs": {},
    "status": [],
    "state_params": {}
}
Example Request With Streaming
POST /model/ask/my-model
Content-Type: multipart/form-data
q=Hello World
stream=true
Example Response With Streaming
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":"# Starting model chain (with memory character size: 0): ['model-only-chain-v1'] ","name":"Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"pending"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"message","message_fragment":"Hello! How can I assist you today?"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":"### Model Only Chain Used prompt template with token size (52):  You are a helpful AI chat assistant. You can be asked questions in any language. Your goal is to respond correctly and comprehensively.   You have access to your chat_history: History: {chat_history} Question: {question}  Answer:  ","name":"Base Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"done"}
Example Request with Multimodal File Upload
POST /model/ask/my-model
Content-Type: multipart/form-data
q=Hello World
uploaded_file=image.jpg
Example Response with Multimodal File Upload
{
"message": "The image is a diagram illustrating the mapping of different GPT-4 models to their corresponding names in the Cortex Default Map....",
"source_metadata": [],
"command_request": null,
"token_count": null,
"steps": [
    {
    "name": "Model",
    "message": "# Starting model chain (with memory character size: 0): ['model-only-chain-v1']",
    "status": "running",
    "state": {},
    "parent": "root"
    },
    {
    "name": "Base Model",
    "message": "### Model Only Chain Used prompt template with token size (53)",
    "status": "done",
    "state": {},
    "parent": "root"
    }
],
"logprobs": {},
"status": [],
"state_params": {}
}
Parameters
Try it out
Name	Description
model *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

model_session_id_param
string
(query)	 

stream
boolean
(query)	Default value : false
 

no_summary
boolean
(query)	True: No summary of retrieved documents; False: Default behaviour i.e. summarise the document retrieved via RAG
Default value : false
 

workflow_timeout
integer
(query)	Timeout for the workflow in seconds. If not specified, defaults to 30 minutes.
Default value : 1800
 

background_job
boolean
(query)	If true, the request will be processed in the background using temporal and a job ID will be returned.
Default value : false
 

Request body
 
q *
string	
uploaded_file
string($binary)	
filter_by_file
array<string>	
chunks
array<undefined>	
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/ask-multifile/{model}
Ask Handler Multifile
Send queries to model config, with Multimodal support
Request Parameters
•	model (str, required): Name of the model config to use
•	q (str, required): The question or query text to send to the model
•	uploaded_file (UploadFile, optional): File to upload and process with the query. Note: Supported only by multimodal models, and filetype compatibility depends on the specific model.
•	model_class (str, optional): Specific model class to use if different from config default
•	model_session_id_param (str, optional): Used to reference the same session across multiple requests to retrieve chat history
•	stream (bool, optional): Enable real-time streaming responses (default: false)
•	no_summary (bool, optional): Skip document summarization in RAG (default: false)
•	filter_by_file (list[str], optional): Used to limit search in data config to provided file names (Used in case the data config has large number of files ingested)
•	chunks (list, optional): Directly pass chunks to skip the retrieval from vector store. Useful in case of user_doc_chain.
•	workflow_timeout (int, optional): Timeout for the workflow in seconds (default: 1800)
•	background_job (bool, optional): If true, the request will be processed in the background using temporal and a job ID will be returned. (default: false)
Response
•	Returns ModelResponse containing the model's answer, metadata, and processing details.
•	For streaming requests, returns StreamingModelResponseMessage with real-time chunks.
•	Background jobs return JobResponse with job tracking information.
Notes
•	Authentication required - User must have access to the specified model configuration
•	Document limit validation enforced based on model config settings
•	Background processing recommended for long-running or resource-intensive queries
Example Request
POST /model/ask/my-model
Content-Type: multipart/form-data
q=Hello World
stream=false
Example Response
{
    "message": "Hello! How can I assist you today?",
    "source_metadata": [],
    "command_request": null,
    "token_count": null,
    "steps": [
        {
        "name": "Model",
        "message": "# Starting model chain (with memory character size: 0): ['model-only-chain-v1']",
        "status": "running",
        "state": {},
        "parent": "root"
        },
        {
        "name": "Base Model",
        "message": "### Model Only Chain Used prompt template ...",
        "status": "done",
        "state": {},
        "parent": "root"
        }
    ],
    "logprobs": {},
    "status": [],
    "state_params": {}
}
Example Request With Streaming
POST /model/ask/my-model
Content-Type: multipart/form-data
q=Hello World
stream=true
Example Response With Streaming
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":"# Starting model chain (with memory character size: 0): ['model-only-chain-v1'] ","name":"Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"pending"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"message","message_fragment":"Hello! How can I assist you today?"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":"### Model Only Chain Used prompt template with token size (52):  You are a helpful AI chat assistant. You can be asked questions in any language. Your goal is to respond correctly and comprehensively.   You have access to your chat_history: History: {chat_history} Question: {question}  Answer:  ","name":"Base Model","parent":"root","status":"running"}
{"message_id":"1758529112-05a27a81-42c9-4837-a613-055d883e2a36","type":"step","message_fragment":null,"name":"Base Model","parent":"root","status":"done"}
Example Request with Multimodal File Upload
POST /model/ask/my-model
Content-Type: multipart/form-data
q=Hello World
uploaded_file=image.jpg
Example Response with Multimodal File Upload
{
"message": "The image is a diagram illustrating the mapping of different GPT-4 models to their corresponding names in the Cortex Default Map....",
"source_metadata": [],
"command_request": null,
"token_count": null,
"steps": [
    {
    "name": "Model",
    "message": "# Starting model chain (with memory character size: 0): ['model-only-chain-v1']",
    "status": "running",
    "state": {},
    "parent": "root"
    },
    {
    "name": "Base Model",
    "message": "### Model Only Chain Used prompt template with token size (53)",
    "status": "done",
    "state": {},
    "parent": "root"
    }
],
"logprobs": {},
"status": [],
"state_params": {}
}
Parameters
Try it out
Name	Description
model *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

model_session_id_param
string
(query)	 

stream
boolean
(query)	Default value : false
 

no_summary
boolean
(query)	True: No summary of retrieved documents; False: Default behaviour i.e. summarise the document retrieved via RAG
Default value : false
 

workflow_timeout
integer
(query)	Timeout for the workflow in seconds. If not specified, defaults to 30 minutes.
Default value : 1800
 

background_job
boolean
(query)	If true, the request will be processed in the background using temporal and a job ID will be returned.
Default value : false
 

Request body
 
q *
string	
uploaded_files
array<string>	
filter_by_file
array<string>	
chunks
array<undefined>	
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/ask/with-custom-filter/{model}
Ask Handler
This endpoint allows users to ask questions to the model with a custom filter applied. The filter can be used to narrow down the documents being fetched from the vector store based on metadata
Parameters
Try it out
Name	Description
model *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

model_session_id_param
string
(query)	 

stream
boolean
(query)	Default value : false
 

no_summary
boolean
(query)	True: No summary of retrieved documents; False: Default behaviour i.e. summarise the document retrieved via RAG
Default value : false
 

workflow_timeout
integer
(query)	Timeout for the workflow in seconds. If not specified, defaults to 30 minutes.
Default value : 1800
 

background_job
boolean
(query)	If true, the request will be processed in the background using temporal and a job ID will be returned.
Default value : false
 

Request body
 
•	Example Value
•	Schema
{
  "q": "string",
  "metadata_filter": {
    "additionalProp1": {}
  }
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/stream-messages/{message_id}
Get Messages From Redis Streams
Stream messages from Redis streams by message ID using Server-Sent Events (SSE) protocol.
This endpoint establishes a real-time streaming connection to retrieve messages stored in Redis streams associated with a specific message ID. It implements the Server-Sent Events (SSE) protocol to push data from the server to the client as messages become available without requiring polling.
Parameters
•	message_id (str, path): The unique identifier of the Redis stream to retrieve messages from.
•	timeout (int, query, default=30): Maximum time in seconds to keep the connection open for streaming. Must be between 1 and 119 seconds. If the connection remains idle for this duration, it will be closed.
Behavior
1.	Validates that the requested Redis stream exists for the user.
2.	Establishes a streaming connection using the SSE protocol.
3.	Continuously polls the Redis stream for new messages.
4.	Formats and streams each message according to SSE specifications.
5.	Handles termination messages and connection timeout.
Technical Implementation
•	Starts reading from the beginning of the stream (ID "0-0")
•	Messages are formatted as data: {messages} per SSE specification
•	Automatic connection closure after timeout
Returns
•	StreamingResponse: A streaming HTTP response that:
o	Has content type text/event-stream
o	Contains properly formatted SSE messages
o	Includes appropriate headers for streaming
o	Automatically handles backpressure
Notes
•	If the stream doesn't exist, a ValueError is raised
•	Messages with type "termination" will end the stream
Parameters
Try it out
Name	Description
message_id *
string
(path)	 

timeout
integer
(query)	Maximum time in seconds to keep the connection open for streaming. Default is 30 seconds.
Default value : 30
 
minimum: 1
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | Config
POST
/model
Setconfig
Create or Update Model Configuration
Create a new model configuration or update an existing one with complete validation and authorization. This endpoint allows authorized users to create new model configurations or update existing ones.
Request Body
•	model (ModelConfig): Complete model configuration object containing all settings and metadata
Returns
ModelConfig: The created or updated model config object if successful or else will return relevant errors.
ModelConfig Structure (Input)
Core Configuration
•	name (str): Unique identifier for the model (lowercase alphanumeric with dashes)
•	displayName (str, optional): Human-readable name for the model
•	model_description (str, optional): Description of the model's purpose and capabilities
•	auth (Auth): Authentication and authorization configuration including owners, users, groups
•	security_config (str, optional): Security configuration identifier for access control
•	labels (Dict[str, str]): Key-value pairs for model categorization and metadata
Processing Configuration
•	chain (List[ChainConfig]): Processing chain configuration (doc-chain, agent-chain, etc.)
•	model_versions (List[ModelVersionReference]): Available model versions and their LLM configurations
o	Each reference specifies: model_class, model_iteration, priority (default: 0)
o	Optional: reasoning_effort (for o1/o3/GPT-5 models), enable_thinking (for Claude 3.7+)
o	Example: {"model_class": "lilly-openai", "model_iteration": 6, "priority": 1}
o	Higher priority versions used as default when no specific version requested
•	prompts (PromptCatalog): Custom prompts and prompt templates for the model
•	context_cache_key (str, optional): Name of the context cache for performance optimization
Data & Tools
- data (List[str]): List of data configuration names associated with this model
- toolkits (List[str], optional): Available toolkits for agent-based models
- allowed_tools_list (List[str], optional): Specific tools allowed for this model
Performance & Behavior
- max_response_token_size (int, optional): Maximum tokens allocated for model responses
- doc_relevence_threshold (float): Document similarity threshold for RAG filtering (0.0-1.0, default: 0.5)
  * Lower values include more documents with broader coverage
  * Higher values include only highly relevant documents with focused results
- k_value (int): Number of documents to retrieve during RAG (default: 20)
- agent_tool_max_iterations (int, optional): Maximum iterations for agent tool execution
- document_limit_to_search (int, optional): Maximum number of documents to consider during filter by file (default: 0)
- token_buffer_size (float): Buffer to token generation (default: 1.2)
Search & Retrieval Configuration
- hybrid_search (HybridSearchParams, optional): Configuration for hybrid search capabilities
- rerank (RerankingParams, optional): Reranking configuration for improving document relevance
LLM Generation Parameters
- temperature (float): Degree of randomness in token selection (default: 0.0)
- top_p (float): Nucleus sampling parameter (0.0-1.0, default: 1.0)
- top_k (int): Picks next token from top k most probable tokens (default: 50)
- stop (List[str], optional): Stop words to cut off model output
- seed (int, optional): Deterministic seed for reproducible generation
- logprobs (bool): Enable/disable log probabilities (default: false)
Advanced Features
- app_binding (str, optional): Application binding identifier
- multimodal (bool): Enable multimodal ingestion and inference (default: false)
- session_config (SessionConfigParams, optional): Session-based memory configuration
PROMPT CONFIGURATION (PromptCatalog)
The prompts field in ModelConfig uses PromptCatalog to reference custom prompt configurations.
Each prompt type serves specific use cases and supports different template variables.
Available Prompt Types
1. **no_context** (PromptType.NO_CONTEXT):
   - Purpose: Generates responses without document context (model-only chain)
   - Required Variables: {question}, {chat_history}
   - Use Case: General conversation, Q&A without RAG
   - Default: "default_no_context"

2. **with_context** (PromptType.WITH_CONTEXT):
   - Purpose: Generates responses using retrieved document context
   - Required Variables: {question}, {chat_history}, {context}
   - Use Case: RAG-based question answering with document retrieval
   - Default: "default_with_context"

3. **with_json_context** (PromptType.WITH_JSON_CONTEXT):
   - Purpose: Handles multimodal context with JSON structure
   - Required Variables: {question}, {chat_history}, {context}
   - Use Case: Multimodal document processing with structured context
   - Default: "default_with_json_context"

4. **enhance_query** (PromptType.ENHANCE_QUERY):
   - Purpose: Improves search queries before document retrieval
   - Required Variables: {question}, {chat_history}
   - Use Case: Query expansion and refinement for better RAG results
   - Default: "default_enhance_query"

5. **sql** (PromptType.SQL):
   - Purpose: Generates SQL queries from natural language
   - Required Variables: {question}
   - Use Case: Text-to-SQL chain for database querying
   - Default: "default_sql"

6. **agent_tool** (PromptType.AGENT_TOOL - Legacy):
   - Purpose: Controls agent behavior and tool usage (legacy format)
   - Required Variables: {agent_scratchpad}, {chat_history}, {input}, {tool_names}, {tool_strings}
   - Use Case: Legacy agent chains with tool execution
   - Default: "default_agent_tool"

7. **cortex_agent_tool_prompt_v2** (PromptType.CORTEX_AGENT_TOOL_V2):
   - Purpose: Modern agent prompt for tool usage and decision making
   - Required Variables: {system_instructions}, {tools}, {previous_tool_calls}, {input}
   - Use Case: Current agent chains with improved tool handling
   - Default: "default_cortex_agent_tool_prompt_v2"

8. **cortex_agent_action** (PromptType.CORTEX_AGENT_ACTION):
   - Purpose: Prompt for agent action execution
   - Required Variables: {system_instructions}, {tools}, {previous_tool_calls}, {input}
   - Use Case: Agent action-taking in Cortex agent framework
   - Default: "default_cortex_agent_action"

9. **cortex_agent_reasoning** (PromptType.CORTEX_AGENT_REASONING):
   - Purpose: Prompt for agent reasoning and planning
   - Required Variables: {current_agent}, {agents_and_tools}, {previous_tool_calls}, {input_message}
   - Use Case: Agent reasoning in multi-agent collaboration
   - Default: "default_cortex_agent_reasoning"

10. **table_summary** (PromptType.TABLE_SUMMARY):
    - Purpose: Generates summaries of table data
    - Required Variables: {table}
    - Use Case: Table summarization during ingestion
    - Default: "default_table_summary"

11. **summary** (PromptType.SUMMARY):
    - Purpose: Creates document summaries
    - Required Variables: {size}, {text}
    - Use Case: Document summarization for indexing
    - Default: "default_summary"

12. **entity_extraction** (PromptType.ENTITY_EXTRACTION):
    - Purpose: Extracts entities from text
    - Required Variables: {text}
    - Use Case: Named entity recognition during processing
    - Default: "default_entity_extraction"

13. **rewrite** (PromptType.REWRITE):
    - Purpose: Rewrites and improves text content
    - Required Variables: {article}
    - Use Case: Content improvement and rewriting
    - Default: "default_rewrite"

14. **kg_triple_extraction** (PromptType.KG_TRIPLE_EXTRACTION):
    - Purpose: Extracts knowledge graph triples
    - Required Variables: {text}
    - Use Case: Knowledge graph construction
    - Default: "default_kg_triple_extraction"
Prompt Customization
To use custom prompts, reference them by name in the PromptCatalog:
```json
{
  "prompts": {
    "with_context": "my_custom_rag_prompt",
    "sql": "my_custom_sql_prompt",
    "cortex_agent_tool_prompt_v2": "my_custom_agent_prompt"
  }
}
```
CHAIN CONFIGURATION (ChainConfig)
The chain field defines the processing pipeline for handling user requests.
Each chain type has specific capabilities and use cases.
Available Chain Types
1. **doc-chain** (DocChain):
   - Purpose: Document retrieval and question answering
   - Use Case: RAG-based applications with document search
   - Prompts Used: with_context, with_json_context, enhance_query
   - Configuration: Supports filtering, multimodal, and hybrid search
   - Parameters: k_value, doc_relevence_threshold, hybrid_search, rerank

2. **model-only-chain** (ModelOnlyChain):
   - Purpose: Direct LLM interaction without external data
   - Use Case: General conversation, reasoning without RAG
   - Prompts Used: no_context
   - Configuration: Simple LLM generation with optional multimodal support
   - Parameters: temperature, top_p, top_k, max_response_token_size

3. **sql-db-chain** DEPRECATED (SqlDBChain):
   - Purpose: Natural language to SQL query generation
   - Use Case: Database querying with natural language
   - Prompts Used: sql
   - Configuration: Database connection and query execution
   - Parameters: Database credentials and connection settings

4. **agent-chain** (AgentChain):
   - Purpose: Modern agent framework with tool usage
   - Use Case: Complex task execution with tools and reasoning
   - Prompts Used: cortex_agent_tool_prompt_v2, cortex_agent_action, cortex_agent_reasoning
   - Configuration: Tools, agent behavior, iterations
   - Parameters: agent_tool_max_iterations, toolkits, allowed_tools_list

5. **tool-chain** (ToolChain - Legacy):
   - Purpose: Legacy tool execution framework
   - Use Case: Tool-based task execution (deprecated)
   - Prompts Used: agent_tool
   - Configuration: Tool selection and execution
   - Parameters: toolkits, allowed_tools_list

6. **supervisor-agent-chain** (SupervisorAgentChain):
   - Purpose: Multi-agent coordination with supervisor
   - Use Case: Complex workflows with multiple specialized agents
   - Prompts Used: cortex_agent_tool_prompt_v2, custom agent prompts
   - Configuration: Agent hierarchy and coordination
   - Parameters: agents_config with supervisor and agent definitions

7. **multi-agent-collaboration-chain** (MultiAgentCollaborationChain):
   - Purpose: Collaborative multi-agent processing
   - Use Case: Complex tasks requiring agent collaboration
   - Prompts Used: Various agent prompts
   - Configuration: Agent collaboration patterns
   - Parameters: agents_config with collaboration settings

8. **user-doc-chain** (UserDocChain):
   - Purpose: User-specific document retrieval
   - Use Case: Document search with user-level permissions
   - Prompts Used: with_context
   - Configuration: User-aware document filtering
   - Parameters: Similar to doc-chain with user context

9. **hybrid-doc-chain** (HybridDocChain):
   - Purpose: Hybrid search with semantic and keyword matching
   - Use Case: Enhanced document retrieval with multiple search methods
   - Prompts Used: with_context, enhance_query
   - Configuration: Hybrid search parameters
   - Parameters: hybrid_search configuration

10. **model-enhanced-query-chain** (ModelEnhancedQueryChain):
    - Purpose: Query enhancement before document retrieval
    - Use Case: Improved RAG performance through query refinement
    - Prompts Used: enhance_query, with_context
    - Configuration: Query enhancement and document retrieval
    - Parameters: Query enhancement settings
Chain Configuration Structure
```json
{
  "chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "max_turns": 10,
      "react_enabled": true,
      "chain_params": {
        "supervisor": {
          "prompt": "You are a helpful AI assistant...",
          "description": "Main supervisor agent"
        },
        "resources": {
          "executables": [
            {
              "name": "research_tool",
              "type": "tool-call",
              "description": "Conducts research"
            }
          ]
        }
      }
    }
  ]
}
```
Chain Parameter Details
- chain_class: The type of chain to use (required)
- model_iteration: Version of the chain implementation (default: 1)
- order: Execution order for multiple chains (default: 1)
- max_turns: Maximum conversation turns for agent chains
- react_enabled: Enable ReAct reasoning for agent chains
- chain_params: Chain-specific configuration parameters
Agent Chain Parameters
- supervisor: Main agent configuration with prompt and description
- resources.executables: Available tools and sub-agents
- agents_config: Multi-agent configuration for supervisor chains
Best Practices
1.	Use doc-chain for RAG applications with document retrieval
2.	Use agent-chain for tool-based task execution
3.	Use model-only-chain for simple conversational interfaces
4.	Customize prompts to align with your specific use case
5.	Test different chain configurations for optimal performance
6.	Use appropriate prompt types for each chain type
Error Responses
•	403 Forbidden: User lacks owner permissions for existing or new model configuration
•	400 Bad Request: Invalid model configuration, validation errors, or malformed request
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "name": "string (lowercase alphanumeric with dashes)",
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "displayName": "string",
  "model_description": "string",
  "security_config": "string",
  "chain": [
    {
      "chain_class": "doc-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {}
    }
  ],
  "model_versions": [
    {
      "model_class": "string (lowercase alphanumeric with dashes) name of the model",
      "model_iteration": 0,
      "priority": 0,
      "reasoning_effort": "low",
      "enable_thinking": false,
      "advanced_param_overrides": {}
    }
  ],
  "prompts": {
    "no_context": "default_no_context",
    "with_context": "default_with_context",
    "with_json_context": "default_with_json_context",
    "enhance_query": "default_enhance_query",
    "sql": "default_sql",
    "agent_tool": "default_agent_tool",
    "cortex_agent_tool_prompt_v2": "default_cortex_agent_tool_prompt_v2",
    "cortex_agent_tool_prompt_v2_with_file_handling": "default_cortex_agent_tool_prompt_v2_with_file_handling",
    "cortex_agent_action": "default_cortex_agent_action",
    "cortex_agent_reasoning": "default_cortex_agent_reasoning",
    "table_summary": "default_table_summary",
    "summary": "default_summary",
    "entity_extraction": "default_entity_extraction",
    "rewrite": "default_rewrite",
    "kg_triple_extraction": "default_kg_triple_extraction"
  },
  "toolkits": [
    "string"
  ],
  "allowed_tools_list": [
    "string"
  ],
  "data": [],
  "max_response_token_size": 0,
  "doc_relevence_threshold": 0.5,
  "hybrid_search": {
    "rrf_relevance_threshold": 0.012,
    "rrf_constant": 60,
    "hybrid_score_type": "average",
    "lexical_average_weight": 50
  },
  "agent_tool_max_iterations": 0,
  "app_binding": "string",
  "multimodal": false,
  "labels": {},
  "k_value": 20,
  "token_buffer_size": 1.2,
  "temperature": 0,
  "top_p": 1,
  "top_k": 50,
  "stop": [
    "string"
  ],
  "seed": 0,
  "logprobs": false,
  "rerank": {
    "enabled": false,
    "model": "cohere-rerank-3.5",
    "top_n": 20
  },
  "document_limit_to_search": 0,
  "session_config": {
    "max_conversation_turns": 20,
    "context_management_method": "moving_window",
    "method_config": {
      "additionalProp1": {}
    }
  },
  "context_cache_key": ""
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model
Listmodels
List all the models that the user is authorized to access
Parameters
Try it out
Name	Description
is_admin
boolean
(query)	Lists the model configs where the user is an owner
 

app_binding
string
(query)	Application binding value to filter the models
 

Responses
Curl
curl -X 'GET' \
  'https://dev.chat.lilly.com/model?is_admin=true' \
  -H 'accept: application/json'
Request URL
https://dev.chat.lilly.com/model?is_admin=true
Server response
Code	Details
200	Response body
Download
[
  {
    "displayName": "Test-RAG-pdf",
    "name": "test-rag-pdf",
    "labels": {},
    "model_description": "<p>Test-RAG-pdf</p>",
    "is_admin": true,
    "is_user": true,
    "private": true,
    "owners": [
      "harshavardhan.reddyg@network.lilly.com"
    ],
    "users": [],
    "data": [
      "test-rag-pdf"
    ],
    "toolkits": null,
    "llm": [
      "GPT-4o"
    ],
    "chain": [
      {
        "chain_class": "doc-chain",
        "model_iteration": 1,
        "order": 1,
        "chain_params": {}
      }
    ]
  },
  {
    "displayName": "supervisor-agent-direct",
    "name": "supervisor-agent-direct",
    "labels": {
      "chatbuilder": "read only"
    },
    "model_description": "Routes user queries between observability and all toolkit.",
    "is_admin": true,
    "is_user": true,
    "private": false,
    "owners": [
      "gowtham.alasakani@network.lilly.com",
      "gowri.matadh@network.lilly.com",
      "akshay.kumarb@network.lilly.com",
      "ranjit.kumar@network.lilly.com",
      "amrapali.shyam@network.lilly.com",
      "chenfeng.zhang@lilly.com",
      "aparna.jogireddygari@network.lilly.com",
      "shudhanshu.ranjan@network.lilly.com",
      "harshavardhan.reddyg@network.lilly.com",
      "sagar.gwalani@lilly.com",
      "tanksale_amruta@lilly.com",
      "samarth.pratapsingh@network.lilly.com",
      "biki.kumarsah@network.lilly.com"
    ],
    "users": [],
    "data": [],
    "toolkits": null,
    "llm": [
      "GPT-5"
    ],
    "chain": [
      {
        "chain_class": "model-only-chain",
        "model_iteration": 1,
        "order": 1,
        "chain_params": {
          "description": "Classifies query intent as either support or observability and routes accordingly."
        }
      }
    ]
  },
  {
    "displayName": "test-model-config",
    "name": "test-model-config-with-prompt",
    "labels": {
      "chatbuilder": "read only"
    },
    "model_description": "Simple chatbot.",
    "is_admin": true,
    "is_user": true,
    "private": true,
    "owners": [
      "harshavardhan.reddyg@network.lilly.com"
    ],
    "users": [],
    "data": [],
    "toolkits": null,
    "llm": [
      "OpenAI-o1-mini"
    ],
    "chain": [
      {
        "chain_class": "model-only-chain",
        "model_iteration": 1,
        "order": 1,
        "chain_params": {
          "description": "simple chatbot."
        }
      }
    ]
  }
]
Response headers
 content-length: 1737  content-type: application/json  date: Thu,23 Oct 2025 12:03:39 GMT  server: envoy  strict-transport-security: max-age=63072000; includeSubDomains; preload;  x-content-type-options: nosniff,nosniff  x-envoy-upstream-service-time: 2296  x-frame-options: SAMEORIGIN,SAMEORIGIN  x-xss-protection: 1; mode=block,1; mode=block 
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "displayName": "string",
    "name": "string",
    "labels": {},
    "model_description": "string",
    "is_admin": true,
    "is_user": true,
    "private": true,
    "owners": [],
    "users": [],
    "data": [],
    "toolkits": [
      "string"
    ],
    "llm": [],
    "chain": []
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/{model}
Getconfig
Retrieve the configuration for a specific model by its identifier.
This endpoint fetches the complete model configuration including all settings, authentication details, data sources, toolkits, and chain configurations. The user must have appropriate access permissions to view the model configuration.
Args: model (str): The unique identifier/name of the model configuration to retrieve
Returns: ModelConfig | ModelConfigWithErrors: The complete model configuration object if successful, or a ModelConfigWithErrors object containing error details if the configuration has issues or if the user lacks proper authorization
Parameters
Try it out
Name	Description
model *
string
(path)	 

Responses
Curl
curl -X 'GET' \
  'https://dev.chat.lilly.com/model/test-rag-pdf' \
  -H 'accept: application/json'
Request URL
https://dev.chat.lilly.com/model/test-rag-pdf
Server response
Code	Details
200	Response body
Download
{
  "name": "test-rag-pdf",
  "auth": {
    "owners": [
      "harshavardhan.reddyg@network.lilly.com"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [
      "arn:aws:iam::408787358807:role/lrl-light-apps-ciab-dev-ciab-dev"
    ],
    "users": [],
    "private": true
  },
  "displayName": "Test-RAG-pdf",
  "model_description": "<p>Test-RAG-pdf</p>",
  "security_config": null,
  "chain": [
    {
      "chain_class": "doc-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {}
    }
  ],
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 7,
      "priority": 0,
      "reasoning_effort": null,
      "enable_thinking": false,
      "advanced_param_overrides": {}
    }
  ],
  "prompts": {
    "no_context": "ciab_default_no_context",
    "with_context": "ciab_default_with_context",
    "with_json_context": "ciab_default_with_json_context",
    "enhance_query": "default_enhance_query",
    "sql": "default_sql",
    "agent_tool": "default_agent_tool",
    "cortex_agent_tool_prompt_v2": "default_cortex_agent_tool_prompt_v2",
    "cortex_agent_tool_prompt_v2_with_file_handling": "default_cortex_agent_tool_prompt_v2_with_file_handling",
    "cortex_agent_action": "default_cortex_agent_action",
    "cortex_agent_reasoning": "default_cortex_agent_reasoning",
    "table_summary": "default_table_summary",
    "summary": "default_summary",
    "entity_extraction": "default_entity_extraction",
    "rewrite": "default_rewrite",
    "kg_triple_extraction": "default_kg_triple_extraction"
  },
  "toolkits": null,
  "allowed_tools_list": null,
  "data": [
    "test-rag-pdf"
  ],
  "max_response_token_size": 0,
  "doc_relevence_threshold": 0.5,
  "hybrid_search": {
    "rrf_relevance_threshold": 0.012,
    "rrf_constant": 60,
    "hybrid_score_type": "average",
    "lexical_average_weight": 50
  },
  "agent_tool_max_iterations": null,
  "app_binding": "chatbuilder",
  "multimodal": false,
  "labels": {},
  "k_value": 20,
  "token_buffer_size": 1.2,
  "temperature": 0,
  "top_p": 1,
  "top_k": 50,
  "stop": null,
  "seed": null,
  "logprobs": false,
  "rerank": {
    "enabled": false,
    "model": "cohere-rerank-3.5",
    "top_n": 20
  },
  "document_limit_to_search": 0,
  "session_config": null,
  "context_cache_key": ""
}
Response headers
 content-length: 1957  content-type: application/json  date: Thu,23 Oct 2025 09:41:12 GMT  server: envoy  strict-transport-security: max-age=63072000; includeSubDomains; preload;  x-content-type-options: nosniff,nosniff  x-envoy-upstream-service-time: 323  x-frame-options: SAMEORIGIN,SAMEORIGIN  x-xss-protection: 1; mode=block,1; mode=block 
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/model/{model}
Deleteconfig
Delete the model config
Parameters
Try it out
Name	Description
model *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/exists/{model}
Model Exists
Check Model Configuration Existence
Verifies whether a model configuration with the specified name exists in the system. This endpoint provides a quick way to check model availability without retrieving the full configuration.
Request Parameters
•	model (str, required): The name/identifier of the model configuration to check for existence
Response
Returns bool indicating model existence status:
•	true if the model configuration exists in the system
•	false if the model configuration does not exist or is inaccessible
Notes
•	No authentication required - This is a public endpoint for existence checking
Example Request
GET /model/exists/my-chatbot-config
Example Response
true
Example Request (Non-existent Model)
GET /model/exists/invalid-model-name
Example Response (Non-existent Model)
false
Parameters
Try it out
Name	Description
model *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
true	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/metrics/config-summary
Listmetric
List Model Metrics
Retrieves aggregated metrics about model configurations and their application bindings. This endpoint provides insights into the distribution and usage patterns of configured models across different applications.
Request Parameters
No parameters required for this endpoint.
Response
Returns dict containing aggregated metrics about model configurations and application bindings. For cases where no configurations exist, returns dict with a warning message.
Notes
•	Authentication required - Depends on router-level authentication configuration
•	Performs read-only operations on the models storage
Example Request
GET /model/metrics/config-summary
Example Response
{
    "total_unique_app_bindings": 1,
    "app_binding_counts": {
        "codespaces": 2
    },
    "total_unique_model_classes": 1,
    "model_class_counts": {
        "lilly-openai": 3
    }
}
Example Response (No Configurations)
{
    "message": "No configs found"
}
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
Model | Context Cache
POST
/model/context_cache
Create Context Cache
Create a context cache for model
Parameters
Try it out
Name	Description
model_class
string
(query)	 

model_iteration
integer
(query)	 

Request body
 
model_config_name *
string	Model config name to create context cache for
time_to_live
integer
maximum: 2592000
minimum: 60	Time to live for the cache in seconds for eg:
60 for 60 seconds
300 for 5 minutes
3600 for 1 hour
86400 for 1 day
files *
array<string>	
text
string
maxLength: 1000	Text to be used for the context cache
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/context_cache/{cache_key}
Get Context Cache
Get context cache by cache name
Parameters
Try it out
Name	Description
cache_key *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string",
  "displayName": "string",
  "model": "string",
  "createTime": "string",
  "updateTime": "string",
  "expireTime": "string",
  "usageMetadata": {
    "audioDurationSeconds": 0,
    "imageCount": 0,
    "textCount": 0,
    "totalTokenCount": 0,
    "videoDurationSeconds": 0
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
PATCH
/model/context_cache/{cache_key}
Update Context Cache
Update a context cache by name
Parameters
Try it out
Name	Description
cache_key *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

Request body
 
•	Example Value
•	Schema
{
  "model_config_name": "string",
  "time_to_live": 60
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/model/context_cache/{cache_key}
Delete Context Cache
Delete context cache by cache name
Parameters
Try it out
Name	Description
cache_key *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

Request body
 
•	Example Value
•	Schema
{
  "model_config_name": "string"
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	











Model | Evaluation
POST
/model/evaluate/{model}
Evaluate
Evaluate the model responses using the provided ground truth values.
Table Requirements:
The uploaded SQLite database file must contain a table named query with the following columns:
•	message: Responses generated by the model.
•	ground_truth: Expected responses to evaluate against.
Parameters
Try it out
Name	Description
model *
string
(path)	 

metric
string
(query)	Evaluation metric to use (default: cosine). Supported values: cosine, bleu, bert.
Available values : cosine, bleu, bert
 

model_class
string
(query)	 

model_iteration
integer
(query)	 

Request body
 
file *
string($binary)	SQLite database file with a query table containing a message and ground_truth columns.
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | Files
GET
/model/list-files/{model}
Listfiles
Get a list of all the files stored in the various data configs mapped to this model config.
Parameters
Try it out
Name	Description
model *
string
(path)	 

page
integer
(query)	page should be greater than 0
Default value : 1
 
minimum: 1
page_size
integer
(query)	Number of items per page should be between 1 and 200
Default value : 100
 
maximum: 200
minimum: 1
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {}
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | Jobs
GET
/model/download/{model}/{job_id}/{job_type}
Download Job Result
Downloads the results that were created via a visualization, clustering, or counting job. job_type should be one of: visualization, clustering, or counting. For visualization and counting jobs a data config name should also be provided.
Parameters
Try it out
Name	Description
model *
string
(path)	 

job_id *
string
(path)	 

job_type *
string
(path)	 

data
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/job-status/{model}/{job_id}
Get Job Status Handler
Get job status for evaluate and clustering job type
Parameters
Try it out
Name	Description
model *
string
(path)	 

job_id *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "status": "string",
  "error_message": "string",
  "job_id": "string",
  "job_result": {
    "additionalProp1": {}
  },
  "docs": [
    null
  ],
  "meta": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | LLMs
GET
/model/classes/list
List Model Classes
List all the valid model classes. If private_only is True, only return models that have a private configuration defined in S3.
Parameters
Try it out
Name	Description
private_only
boolean
(query)	Set to true to list only private models
Default value : false
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {
    "model_class": "string",
    "model_class_index_alias": "string",
    "model_iteration": "string",
    "llm": {
      "model_name": "string",
      "deployment_name": "string",
      "display_name": "string",
      "token_limit": 0,
      "max_response_token_size": 0,
      "prompt_supported_file_extensions": [],
      "provider": "string",
      "reasoning_effort": "low",
      "enable_thinking": false,
      "is_deprecated": false,
      "multimodal_capability": "network",
      "has_context_caching": false,
      "advanced_param_overrides": {}
    }
  },
  "additionalProp2": {
    "model_class": "string",
    "model_class_index_alias": "string",
    "model_iteration": "string",
    "llm": {
      "model_name": "string",
      "deployment_name": "string",
      "display_name": "string",
      "token_limit": 0,
      "max_response_token_size": 0,
      "prompt_supported_file_extensions": [],
      "provider": "string",
      "reasoning_effort": "low",
      "enable_thinking": false,
      "is_deprecated": false,
      "multimodal_capability": "network",
      "has_context_caching": false,
      "advanced_param_overrides": {}
    }
  },
  "additionalProp3": {
    "model_class": "string",
    "model_class_index_alias": "string",
    "model_iteration": "string",
    "llm": {
      "model_name": "string",
      "deployment_name": "string",
      "display_name": "string",
      "token_limit": 0,
      "max_response_token_size": 0,
      "prompt_supported_file_extensions": [],
      "provider": "string",
      "reasoning_effort": "low",
      "enable_thinking": false,
      "is_deprecated": false,
      "multimodal_capability": "network",
      "has_context_caching": false,
      "advanced_param_overrides": {}
    }
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/llm/list
List Model
List Available LLM Models and Embeddings
Retrieves a comprehensive catalog of all available language models and embedding models in the system with advanced filtering capabilities. This endpoint provides essential model information for client applications to discover and select appropriate models based on their specific requirements.
Request Parameters
•	model_type (str, optional): Filter by model category. Options: "embedding" for embedding models, "inference" for language models
•	private_only (bool, optional): Set to true to list only private models with custom S3 configurations (default: false)
•	reasoning_only (bool, optional): Set to true to list only reasoning-capable models like GPT-O1, GPT-5 series (default: false)
•	model_class (str, optional): Filter by specific model class from available dropdown options in Swagger UI
Response
Returns list[dict] containing model information dictionaries with the following structure:
•	For inference models: name, model_type, model_class, model_iteration, model_name, deployment_name, token_limit, max_response_token_size, is_deprecated, has_context_caching, prompt_supported_file_extensions, multimodal_capability
•	For embedding models: name, model_type, provider, private, max_dimensions
Notes
•	No authentication required - This is a public discovery endpoint
•	Reasoning models include advanced AI models: GPT-O1, GPT-O3-MINI, GPT-O4-MINI, GPT-5 series
•	Multimodal models support file upload capabilities with varying file type support
•	Token limits and response sizes help with capacity planning and request optimization
Example Request
GET /model/llm/list
Example Response (All Models)
[
    {
        "name": "gpt-4-turbo-azure-v1",
        "model_type": "inference",
        "model_class": "gpt-4-turbo",
        "model_iteration": 1,
        "model_name": "gpt-4-turbo",
        "deployment_name": "gpt-4-turbo-deployment",
        "token_limit": 128000,
        "max_response_token_size": 4096,
        "is_deprecated": false,
        "has_context_caching": true,
        "prompt_supported_file_extensions": ["pdf", "docx", "txt"],
        "multimodal_capability": true
    },
    {
        "name": "text-embedding-3-large-azure",
        "model_type": "embedding",
        "provider": "azure",
        "private": false,
        "max_dimensions": 3072
    }
]
Parameters
Try it out
Name	Description
model_type
string
(query)	Filter by model type
Available values : embedding, inference
 

private_only
boolean
(query)	Set to true to list only private models
Default value : false
 

reasoning_only
boolean
(query)	Set to true to list only reasoning models
Default value : false
 

model_class
string
(query)	Filter by model_class
Available values : lilly-openai, mistral, google-vertex, llama3, deepseek-r1-distill-llama-70b, lilly-openai-bartender, aepc-openai, llama2, claude, biobert-finetuned, claudetitan, grok, titan, nova, cohere, llama2-7b-chat, biomistral-7b, opensource-falcon7b-openai, lilly-openai-instructor, lrl-md3-openai
 

Responses
Curl
curl -X 'GET' \
  'https://dev.chat.lilly.com/model/llm/list?private_only=false&reasoning_only=false' \
  -H 'accept: application/json'
Request URL
https://dev.chat.lilly.com/model/llm/list?private_only=false&reasoning_only=false
Server response
Code	Details
200	Response body
Download
[
  {
    "name": "lilly-openai-v1",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 1,
    "model_name": "text-davinci-003",
    "deployment_name": "text-davinci-003",
    "token_limit": 4097,
    "max_response_token_size": 1000,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v2",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 2,
    "model_name": "gpt-4",
    "deployment_name": "gpt-4",
    "token_limit": 8192,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v3",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 3,
    "model_name": "gpt-4-32k",
    "deployment_name": "gpt-4-32k",
    "token_limit": 32768,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v4",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 4,
    "model_name": "gpt-4-1106-preview",
    "deployment_name": "gpt-4-1106-preview",
    "token_limit": 128000,
    "max_response_token_size": 4096,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v5",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 5,
    "model_name": "gpt-4-0125-preview",
    "deployment_name": "gpt-4-0125-preview",
    "token_limit": 128000,
    "max_response_token_size": 4096,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v6",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 6,
    "model_name": "gpt-4o",
    "deployment_name": "gpt-4o",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v7",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 7,
    "model_name": "gpt-4o",
    "deployment_name": "gpt-4o",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v8",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 8,
    "model_name": "gpt-4o",
    "deployment_name": "gpt-4o",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v9",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 9,
    "model_name": "gpt-4-32k",
    "deployment_name": "gpt-4-32k",
    "token_limit": 32768,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v10",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 10,
    "model_name": "gpt-4-32k",
    "deployment_name": "gpt-4-32k",
    "token_limit": 32768,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v11",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 11,
    "model_name": "o1-mini",
    "deployment_name": "o1-mini",
    "token_limit": 128000,
    "max_response_token_size": 65536,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v12",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 12,
    "model_name": "o1-preview",
    "deployment_name": "o1-preview",
    "token_limit": 128000,
    "max_response_token_size": 32768,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v13",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 13,
    "model_name": "gpt-4o-mini",
    "deployment_name": "gpt-4o-mini",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "lilly-openai-v14",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 14,
    "model_name": "gpt-4-1106-preview",
    "deployment_name": "gpt-4-1106-preview",
    "token_limit": 128000,
    "max_response_token_size": 4096,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v15",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 15,
    "model_name": "o1",
    "deployment_name": "o1",
    "token_limit": 200000,
    "max_response_token_size": 100000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v16",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 16,
    "model_name": "o3-mini",
    "deployment_name": "o3-mini",
    "token_limit": 200000,
    "max_response_token_size": 100000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-v17",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 17,
    "model_name": "gpt-4.5-preview",
    "deployment_name": "gpt-4.5-preview",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v18",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 18,
    "model_name": "gpt-4.1",
    "deployment_name": "gpt-4.1",
    "token_limit": 1000000,
    "max_response_token_size": 32768,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v19",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 19,
    "model_name": "gpt-4.1-nano",
    "deployment_name": "gpt-4.1-nano",
    "token_limit": 1000000,
    "max_response_token_size": 32000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v20",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 20,
    "model_name": "o4-mini",
    "deployment_name": "o4-mini",
    "token_limit": 200000,
    "max_response_token_size": 100000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v21",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 21,
    "model_name": "gpt-5",
    "deployment_name": "gpt-5",
    "token_limit": 400000,
    "max_response_token_size": 128000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v22",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 22,
    "model_name": "gpt-5-mini",
    "deployment_name": "gpt-5-mini",
    "token_limit": 400000,
    "max_response_token_size": 128000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v23",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 23,
    "model_name": "gpt-5-nano",
    "deployment_name": "gpt-5-nano",
    "token_limit": 400000,
    "max_response_token_size": 128000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v24",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 24,
    "model_name": "gpt-5-chat",
    "deployment_name": "gpt-5-chat",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v25",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 25,
    "model_name": "o3-pro",
    "deployment_name": "o3-pro",
    "token_limit": 200000,
    "max_response_token_size": 100000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v26",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 26,
    "model_name": "gpt-realtime",
    "deployment_name": "gpt-realtime",
    "token_limit": 28672,
    "max_response_token_size": 4096,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-v27",
    "model_type": "inference",
    "model_class": "lilly-openai",
    "model_iteration": 27,
    "model_name": "o3-deep-research",
    "deployment_name": "o3-deep-research",
    "token_limit": 200000,
    "max_response_token_size": 100000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lrl-md3-openai-v1",
    "model_type": "inference",
    "model_class": "lrl-md3-openai",
    "model_iteration": 1,
    "model_name": "gpt-4-32k",
    "deployment_name": "gpt-4-32k",
    "token_limit": 32768,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lrl-md3-openai-v2",
    "model_type": "inference",
    "model_class": "lrl-md3-openai",
    "model_iteration": 2,
    "model_name": "gpt-4-1106-preview",
    "deployment_name": "gpt-4-1106-preview",
    "token_limit": 128000,
    "max_response_token_size": 4096,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lrl-md3-openai-v3",
    "model_type": "inference",
    "model_class": "lrl-md3-openai",
    "model_iteration": 3,
    "model_name": "gpt-4o",
    "deployment_name": "gpt-4o",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lrl-md3-openai-v4",
    "model_type": "inference",
    "model_class": "lrl-md3-openai",
    "model_iteration": 4,
    "model_name": "gpt-4o",
    "deployment_name": "gpt-4o",
    "token_limit": 128000,
    "max_response_token_size": 16384,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "lilly-openai-bartender-v1",
    "model_type": "inference",
    "model_class": "lilly-openai-bartender",
    "model_iteration": 1,
    "model_name": "text-davinci-003",
    "deployment_name": "text-davinci-003",
    "token_limit": 4097,
    "max_response_token_size": 1000,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "lilly-openai-instructor-v1",
    "model_type": "inference",
    "model_class": "lilly-openai-instructor",
    "model_iteration": 1,
    "model_name": "gpt-4-32k",
    "deployment_name": "gpt-4-32k",
    "token_limit": 32768,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "opensource-falcon7b-openai-v1",
    "model_type": "inference",
    "model_class": "opensource-falcon7b-openai",
    "model_iteration": 1,
    "model_name": "falcon-7b",
    "deployment_name": "falcon-7b",
    "token_limit": 32768,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "claude-v1",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 1,
    "model_name": "anthropic.claude-instant-v1",
    "deployment_name": "anthropic.claude-instant-v1",
    "token_limit": 100000,
    "max_response_token_size": 4096,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "claude-v2",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 2,
    "model_name": "anthropic.claude-v2",
    "deployment_name": "anthropic.claude-v2",
    "token_limit": 100000,
    "max_response_token_size": 4096,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "claude-v3",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 3,
    "model_name": "anthropic.claude-3-sonnet-20240229-v1:0",
    "deployment_name": "anthropic.claude-3-sonnet-20240229-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 4096,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "claude-v4",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 4,
    "model_name": "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "deployment_name": "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v5",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 5,
    "model_name": "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "deployment_name": "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v6",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 6,
    "model_name": "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "deployment_name": "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v7",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 7,
    "model_name": "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    "deployment_name": "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v8",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 8,
    "model_name": "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    "deployment_name": "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v9",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 9,
    "model_name": "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    "deployment_name": "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v10",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 10,
    "model_name": "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    "deployment_name": "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "claude-v11",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 11,
    "model_name": "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    "deployment_name": "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "claude-v12",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 12,
    "model_name": "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    "deployment_name": "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "claude-v13",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 13,
    "model_name": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "deployment_name": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 64000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v14",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 14,
    "model_name": "us.anthropic.claude-sonnet-4-20250514-v1:0",
    "deployment_name": "us.anthropic.claude-sonnet-4-20250514-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 2000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v15",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 15,
    "model_name": "us.anthropic.claude-opus-4-20250514-v1:0",
    "deployment_name": "us.anthropic.claude-opus-4-20250514-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 2000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v16",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 16,
    "model_name": "us.anthropic.claude-opus-4-1-20250805-v1:0",
    "deployment_name": "us.anthropic.claude-opus-4-1-20250805-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 32000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claude-v17",
    "model_type": "inference",
    "model_class": "claude",
    "model_iteration": 17,
    "model_name": "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
    "deployment_name": "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
    "token_limit": 200000,
    "max_response_token_size": 64000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "claudetitan-v1",
    "model_type": "inference",
    "model_class": "claudetitan",
    "model_iteration": 1,
    "model_name": "anthropic.claude-v2",
    "deployment_name": "anthropic.claude-v2",
    "token_limit": 100000,
    "max_response_token_size": 4096,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "titan-v1",
    "model_type": "inference",
    "model_class": "titan",
    "model_iteration": 1,
    "model_name": "amazon.titan-text-lite-v1",
    "deployment_name": "amazon.titan-text-lite-v1",
    "token_limit": 4000,
    "max_response_token_size": 400,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "titan-v2",
    "model_type": "inference",
    "model_class": "titan",
    "model_iteration": 2,
    "model_name": "amazon.titan-text-express-v1",
    "deployment_name": "amazon.titan-text-express-v1",
    "token_limit": 8000,
    "max_response_token_size": 800,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "nova-v1",
    "model_type": "inference",
    "model_class": "nova",
    "model_iteration": 1,
    "model_name": "us.amazon.nova-micro-v1:0",
    "deployment_name": "us.amazon.nova-micro-v1:0",
    "token_limit": 128000,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "nova-v2",
    "model_type": "inference",
    "model_class": "nova",
    "model_iteration": 2,
    "model_name": "us.amazon.nova-lite-v1:0",
    "deployment_name": "us.amazon.nova-lite-v1:0",
    "token_limit": 300000,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "nova-v3",
    "model_type": "inference",
    "model_class": "nova",
    "model_iteration": 3,
    "model_name": "us.amazon.nova-pro-v1:0",
    "deployment_name": "us.amazon.nova-pro-v1:0",
    "token_limit": 300000,
    "max_response_token_size": 5000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "nova-v4",
    "model_type": "inference",
    "model_class": "nova",
    "model_iteration": 4,
    "model_name": "us.amazon.nova-premier-v1:0",
    "deployment_name": "us.amazon.nova-premier-v1:0",
    "token_limit": 1000000,
    "max_response_token_size": 10000,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "memory"
  },
  {
    "name": "llama2-v1",
    "model_type": "inference",
    "model_class": "llama2",
    "model_iteration": 1,
    "model_name": "meta.llama2-13b-chat-v1",
    "deployment_name": "meta.llama2-13b-chat-v1",
    "token_limit": 4000,
    "max_response_token_size": 0,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama2-v2",
    "model_type": "inference",
    "model_class": "llama2",
    "model_iteration": 2,
    "model_name": "meta.llama2-70b-chat-v1",
    "deployment_name": "meta.llama2-70b-chat-v1",
    "token_limit": 4000,
    "max_response_token_size": 0,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama3-v1",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 1,
    "model_name": "us.meta.llama3-1-8b-instruct-v1:0",
    "deployment_name": "us.meta.llama3-1-8b-instruct-v1:0",
    "token_limit": 128000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama3-v2",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 2,
    "model_name": "us.meta.llama3-1-70b-instruct-v1:0",
    "deployment_name": "us.meta.llama3-1-70b-instruct-v1:0",
    "token_limit": 128000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama3-v3",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 3,
    "model_name": "us.meta.llama3-2-1b-instruct-v1:0",
    "deployment_name": "us.meta.llama3-2-1b-instruct-v1:0",
    "token_limit": 128000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama3-v4",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 4,
    "model_name": "us.meta.llama3-2-3b-instruct-v1:0",
    "deployment_name": "us.meta.llama3-2-3b-instruct-v1:0",
    "token_limit": 128000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama3-v5",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 5,
    "model_name": "us.meta.llama3-2-11b-instruct-v1:0",
    "deployment_name": "us.meta.llama3-2-11b-instruct-v1:0",
    "token_limit": 128000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama3-v6",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 6,
    "model_name": "us.meta.llama3-2-90b-instruct-v1:0",
    "deployment_name": "us.meta.llama3-2-90b-instruct-v1:0",
    "token_limit": 128000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama3-v7",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 7,
    "model_name": "us.meta.llama4-maverick-17b-instruct-v1:0",
    "deployment_name": "us.meta.llama4-maverick-17b-instruct-v1:0",
    "token_limit": 1000000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "llama3-v8",
    "model_type": "inference",
    "model_class": "llama3",
    "model_iteration": 8,
    "model_name": "us.meta.llama4-scout-17b-instruct-v1:0",
    "deployment_name": "us.meta.llama4-scout-17b-instruct-v1:0",
    "token_limit": 10000000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "webp",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "cohere-v1",
    "model_type": "inference",
    "model_class": "cohere",
    "model_iteration": 1,
    "model_name": "cohere.command-light-text-v14",
    "deployment_name": "cohere.command-light-text-v14",
    "token_limit": 4000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "cohere-v2",
    "model_type": "inference",
    "model_class": "cohere",
    "model_iteration": 2,
    "model_name": "cohere.command-text-v14",
    "deployment_name": "cohere.command-text-v14",
    "token_limit": 4000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "cohere-v3",
    "model_type": "inference",
    "model_class": "cohere",
    "model_iteration": 3,
    "model_name": "cohere.command-light-text-v14",
    "deployment_name": "cohere.command-light-text-v14",
    "token_limit": 4000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "cohere-v4",
    "model_type": "inference",
    "model_class": "cohere",
    "model_iteration": 4,
    "model_name": "cohere.command-text-v14",
    "deployment_name": "cohere.command-text-v14",
    "token_limit": 4000,
    "max_response_token_size": 0,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "mistral-v1",
    "model_type": "inference",
    "model_class": "mistral",
    "model_iteration": 1,
    "model_name": "mistral.mistral-7b-instruct-v0:2",
    "deployment_name": "mistral.mistral-7b-instruct-v0:2",
    "token_limit": 32000,
    "max_response_token_size": 800,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "mistral-v2",
    "model_type": "inference",
    "model_class": "mistral",
    "model_iteration": 2,
    "model_name": "mistral.mixtral-8x7b-instruct-v0:1",
    "deployment_name": "mistral.mixtral-8x7b-instruct-v0:1",
    "token_limit": 32000,
    "max_response_token_size": 3276,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "llama2-7b-chat-v1",
    "model_type": "inference",
    "model_class": "llama2-7b-chat",
    "model_iteration": 1,
    "model_name": "llama2-7b-chat",
    "deployment_name": "llama2-7b-chat",
    "token_limit": 4000,
    "max_response_token_size": 400,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "biomistral-7b-v1",
    "model_type": "inference",
    "model_class": "biomistral-7b",
    "model_iteration": 1,
    "model_name": "biomistral-7b",
    "deployment_name": "biomistral-7b",
    "token_limit": 1200,
    "max_response_token_size": 300,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v1",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 1,
    "model_name": "gemini-1.5-pro",
    "deployment_name": "gemini-1.5-pro",
    "token_limit": 2097152,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v2",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 2,
    "model_name": "gemini-1.5-flash",
    "deployment_name": "gemini-1.5-flash",
    "token_limit": 1048576,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v3",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 3,
    "model_name": "gemini-1.5-pro",
    "deployment_name": "gemini-1.5-pro",
    "token_limit": 2097152,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v4",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 4,
    "model_name": "gemini-1.5-flash",
    "deployment_name": "gemini-1.5-flash",
    "token_limit": 1048576,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v5",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 5,
    "model_name": "gemini-1.5-pro",
    "deployment_name": "gemini-1.5-pro",
    "token_limit": 2097152,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v6",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 6,
    "model_name": "gemini-1.5-flash",
    "deployment_name": "gemini-1.5-flash",
    "token_limit": 1048576,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v7",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 7,
    "model_name": "gemini-1.5-pro",
    "deployment_name": "gemini-1.5-pro",
    "token_limit": 2097152,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v8",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 8,
    "model_name": "gemini-1.5-flash",
    "deployment_name": "gemini-1.5-flash",
    "token_limit": 1048576,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v9",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 9,
    "model_name": "medlm-large-1.5@001",
    "deployment_name": "medlm-large-1.5@001",
    "token_limit": 8192,
    "max_response_token_size": 1024,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v10",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 10,
    "model_name": "medlm-large-1.5@001",
    "deployment_name": "medlm-large-1.5@001",
    "token_limit": 8192,
    "max_response_token_size": 1024,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v11",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 11,
    "model_name": "medlm-large-1.5@001",
    "deployment_name": "medlm-large-1.5@001",
    "token_limit": 8192,
    "max_response_token_size": 1024,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v12",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 12,
    "model_name": "medlm-large-1.5@001",
    "deployment_name": "medlm-large-1.5@001",
    "token_limit": 8192,
    "max_response_token_size": 1024,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "google-vertex-v13",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 13,
    "model_name": "gemini-2.0-flash-001",
    "deployment_name": "gemini-2.0-flash-001",
    "token_limit": 1048576,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": true,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v14",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 14,
    "model_name": "gemini-2.0-flash-lite-001",
    "deployment_name": "gemini-2.0-flash-lite-001",
    "token_limit": 1048576,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v15",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 15,
    "model_name": "gemini-2.0-pro-exp-02-05",
    "deployment_name": "gemini-2.0-pro-exp-02-05",
    "token_limit": 2097152,
    "max_response_token_size": 8192,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v16",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 16,
    "model_name": "gemini-2.5-pro",
    "deployment_name": "gemini-2.5-pro",
    "token_limit": 1048576,
    "max_response_token_size": 65536,
    "is_deprecated": false,
    "has_context_caching": true,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v17",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 17,
    "model_name": "gemini-2.5-pro-preview-03-25",
    "deployment_name": "gemini-2.5-pro-preview-03-25",
    "token_limit": 1048576,
    "max_response_token_size": 65536,
    "is_deprecated": false,
    "has_context_caching": true,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v18",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 18,
    "model_name": "gemini-2.5-flash-preview-04-17",
    "deployment_name": "gemini-2.5-flash-preview-04-17",
    "token_limit": 1048576,
    "max_response_token_size": 64000,
    "is_deprecated": false,
    "has_context_caching": true,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v19",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 19,
    "model_name": "gemini-2.5-flash",
    "deployment_name": "gemini-2.5-flash",
    "token_limit": 1048576,
    "max_response_token_size": 64000,
    "is_deprecated": false,
    "has_context_caching": true,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "google-vertex-v20",
    "model_type": "inference",
    "model_class": "google-vertex",
    "model_iteration": 20,
    "model_name": "gemini-2.5-flash-lite",
    "deployment_name": "gemini-2.5-flash-lite",
    "token_limit": 1048576,
    "max_response_token_size": 64000,
    "is_deprecated": false,
    "has_context_caching": true,
    "prompt_supported_file_extensions": [
      "jpg",
      "png",
      "mp4",
      "pdf",
      "docx",
      "xlsx"
    ],
    "multimodal_capability": "network"
  },
  {
    "name": "biobert-finetuned-v1",
    "model_type": "inference",
    "model_class": "biobert-finetuned",
    "model_iteration": 1,
    "model_name": "biobert-finetuned",
    "deployment_name": "biobert-finetuned",
    "token_limit": 1200,
    "max_response_token_size": 300,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "biobert-finetuned-v2",
    "model_type": "inference",
    "model_class": "biobert-finetuned",
    "model_iteration": 2,
    "model_name": "biobert-finetuned-v2",
    "deployment_name": "biobert-finetuned-v2",
    "token_limit": 1200,
    "max_response_token_size": 300,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "deepseek-r1-distill-llama-70b-v1",
    "model_type": "inference",
    "model_class": "deepseek-r1-distill-llama-70b",
    "model_iteration": 1,
    "model_name": "deepseek-r1-distill-llama-70b",
    "deployment_name": "deepseek-r1-distill-llama-70b",
    "token_limit": 128000,
    "max_response_token_size": 0,
    "is_deprecated": true,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "aepc-openai-v1",
    "model_type": "inference",
    "model_class": "aepc-openai",
    "model_iteration": 1,
    "model_name": "aepcaadsai",
    "deployment_name": "aepcaadsai",
    "token_limit": 8192,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "grok-v1",
    "model_type": "inference",
    "model_class": "grok",
    "model_iteration": 1,
    "model_name": "grok-3",
    "deployment_name": "grok-3",
    "token_limit": 131072,
    "max_response_token_size": 8192,
    "is_deprecated": false,
    "has_context_caching": false,
    "prompt_supported_file_extensions": "not_supported"
  },
  {
    "name": "text-embedding-ada-002-azure",
    "model_type": "embedding",
    "provider": "azure",
    "private": false,
    "max_dimensions": 1536
  },
  {
    "name": "text-embedding-ada-002-openai",
    "model_type": "embedding",
    "provider": "openai",
    "private": false,
    "max_dimensions": 1536
  },
  {
    "name": "text-embedding-3-small-azure",
    "model_type": "embedding",
    "provider": "azure",
    "private": false,
    "max_dimensions": 1536
  },
  {
    "name": "text-embedding-3-small-openai",
    "model_type": "embedding",
    "provider": "openai",
    "private": false,
    "max_dimensions": 1536
  },
  {
    "name": "text-embedding-3-large-azure",
    "model_type": "embedding",
    "provider": "azure",
    "private": false,
    "max_dimensions": 3072
  },
  {
    "name": "text-embedding-3-large-openai",
    "model_type": "embedding",
    "provider": "openai",
    "private": false,
    "max_dimensions": 3072
  },
  {
    "name": "instructor-azure",
    "model_type": "embedding",
    "provider": "azure",
    "private": false,
    "max_dimensions": 768
  },
  {
    "name": "amazon.titan-embed-text-v1-bedrock",
    "model_type": "embedding",
    "provider": "bedrock",
    "private": false,
    "max_dimensions": 1536
  },
  {
    "name": "cohere.embed-multilingual-v3-bedrock",
    "model_type": "embedding",
    "provider": "bedrock",
    "private": false,
    "max_dimensions": 1024
  },
  {
    "name": "cohere.embed-english-v3-bedrock",
    "model_type": "embedding",
    "provider": "bedrock",
    "private": false,
    "max_dimensions": 1024
  },
  {
    "name": "text-embedding-004-vertex",
    "model_type": "embedding",
    "provider": "vertex",
    "private": false,
    "max_dimensions": 768
  },
  {
    "name": "multimodalembedding-vertex",
    "model_type": "embedding",
    "provider": "vertex",
    "private": false,
    "max_dimensions": 1408
  },
  {
    "name": "text-multilingual-embedding-002-vertex",
    "model_type": "embedding",
    "provider": "vertex",
    "private": false,
    "max_dimensions": 768
  }
]
Response headers
 connection: close  content-length: 37205  content-type: application/json  date: Thu,23 Oct 2025 12:07:14 GMT  server: envoy  strict-transport-security: max-age=63072000; includeSubDomains; preload;  x-content-type-options: nosniff,nosniff  x-envoy-upstream-service-time: 1390  x-frame-options: SAMEORIGIN,SAMEORIGIN  x-xss-protection: 1; mode=block,1; mode=block 
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "additionalProp1": {}
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | Security
GET
/model/security-config/{model}
Get Securityconfig Modelconfig
Get Security Configuration for a Model.
Retrieves both the global InfoSec security configuration and the model-specific LLM Guard configuration (child security config) for a given model. This is essential for understanding and managing security policies applied to a model.
Path Parameter:
•	model (str): The name of the model whose security configuration is to be retrieved.
Returns:
•	list: A list containing two elements:
o	dict: The global InfoSec security configuration (may be empty if not set).
o	dict: The model's LLM Guard configuration, keyed by model name (may be empty or null if not set).
Notes:
•	User must be authorized to access the model's configuration.
•	If the model or security configs are not found, or if unauthorized, an error is returned.
•	The response is always a list: [global_infosec_config, {model: model_llmguard_config}].
Example Request:
GET /model/security-config/testoutputsofchoice
Example Response:
[
    {
        "name": "infosecconfig",
        "s3_bucket": "testbucket",
        "s3_prefix": "data/infosecconfig/docs",
        "auth": {
            "owners": ["testuser@lilly.com"],
            "access_groups": ["group1"],
            "private": true
        }
    },
    {
        "testoutputsofchoice": {
            "llm_guard_field1": "value",
            "llm_guard_field2": "value"
        }
    }
]
Parameters
Try it out
Name	Description
model *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/ismanager/{model}
Ismanager
Check if User is Manager for a Model.
Determines whether the current user has manager (admin) privileges for the specified model configuration.
Path Parameter:
•	model (str): The name of the model to check manager status for.
Returns:
•	bool: True if the user is a manager for the model, False otherwise.
•	dict: Error details if the model is not found or the user is unauthorized.
Notes:
•	User context is determined from the request (authentication required).
•	Returns False if the user does not have manager privileges for the model.
•	Returns an error dict if the model does not exist or the user is not authorized to view it.
Example Request:
GET /model/ismanager/my-model
Example Response:
true
Parameters
Try it out
Name	Description
model *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
true	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/isauthorized/{model}
Isauthorized
Check if User is Authorized for a Model.
Determines whether the current user has access rights to the specified model configuration. Useful for access control, UI logic, and API security.
Path Parameter:
•	model (str): The name of the model to check authorization for.
Returns:
•	bool: True if the user is authorized to access the model, False otherwise.
•	dict: Error details if the model is not found or the user is unauthorized.
Notes:
•	User context is determined from the request (authentication required).
•	Returns False if the user does not have access rights for the model.
•	Returns an error dict if the model does not exist or the user is not authorized to view it.
Example Request:
GET /model/isauthorized/my-model
Example Response:
true
Parameters
Try it out
Name	Description
model *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
true	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | Summarize
POST
/model/refined-summary/{model}
Refined Summary Handler
Generate a Summary of the Model using Refined Summarization
Parameters
Try it out
Name	Description
model *
string
(path)	 

persona
string
(query)	 

summary_focus
string
(query)	 

target_audience
string
(query)	 

summary_size
string
(query)	 

summary_method
string
(query)	Choose a summarization method. Pick refine if unsure.
Available values : refine, mapreduce, stuff
Default value : refine
 

model_class
string
(query)	 

model_iteration
integer
(query)	 

model_session_id_param
string
(query)	 

max_chunks
integer
(query)	Document Chunks will be clustered to filter to this number of chunks
Default value : 20
 

clustering_embedding
string
(query)	Embedding to use for clustering when selecting Document Chunks
Default value : text-embedding-3-large-azure
 

similarity_threshold
number
(query)	Threshold for similarity when selecting chunks based on focus
Default value : 0.7
 

min_chunks
integer
(query)	Minimum number of chunks to retain after filtering
Default value : 6
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "type": "string",
  "job_type": "string",
  "job_input_delivery": "string",
  "job_output_delivery": "string",
  "job_id": "string",
  "status": "string",
  "error_message": "string",
  "domain": "string",
  "job_result": {},
  "meta": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/summarize/{model}
Summarize File Handler
Generate document summaries from uploaded files or text chunks with customizable length, focus, and settings.
Parameters
Try it out
Name	Description
model *
string
(path)	 

model_class
string
(query)	 

model_iteration
integer
(query)	 

summary_title
string
(query)	Title for the summary
Default value : Summary
 

chunk_size
integer
(query)	Size of each chunk in tokens
Default value : 1200
 

chunk_overlap
integer
(query)	Overlap between chunks in tokens
Default value : 350
 

summary_focus
string
(query)	Focus area for the summary
 

summary_custom_instructions
string
(query)	Custom instructions for the summary prompt
 

summary_size
string
(query)	Length of the summary output. Short: 1-2 paragraphs, Medium: 3-5 paragraphs, Long: 6-10 paragraphs
Available values : short, medium, long
Default value : medium
 

summary_method
string
(query)	Available values : stuff, refine, mapreduce
Default value : mapreduce
 

min_chunks
integer
(query)	Minimum chunks to retain
Default value : 5
 

max_chunks
integer
(query)	Maximum chunks for summarization
Default value : 8
 

Request body
 
chunks
array<string>	List of text chunks to summarize
file
string	Document file to summarize
prompt
string	Custom prompt override
mergePrompt
string	Custom merge prompt override utilized in refine and mapreduce summarization methods
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "type": "string",
  "job_type": "string",
  "job_input_delivery": "string",
  "job_output_delivery": "string",
  "job_id": "string",
  "status": "string",
  "error_message": "string",
  "domain": "string",
  "job_result": {},
  "meta": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Model | Visualization
POST
/model/visualize/{model}
Visualize
Creates a t-SNE plot of the vector store, using all the documents that were ingested. Alternatively, a list of ingested documents names can be provided, or the maximum number of documents to be used for visualization.
Parameters
Try it out
Name	Description
model *
string
(path)	 

max_num_docs
string
(query)	Default value : all
 

model_class
string
(query)	 

model_iteration
string
(query)	 

Request body
 
•	Example Value
•	Schema
[
  "string"
]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/cluster/{model}
Cluster
This endpoint clusters and visualizes uploaded prompts using the specified model and number of clusters.
Features:
•	Accepts a SQLite database file with a query table containing a prompt column.
•	Allows the user to specify the number of clusters (num_clusters) for the K-Means clustering algorithm. Default is 8.
•	Clusters the prompts based on embeddings generated by the provided model.
•	Returns a ZIP file containing:
o	A CSV file with prompt and their assigned cluster IDs.
o	A plot (cluster_plot.jpg) visualizing the clusters.
Parameters
Try it out
Name	Description
model *
string
(path)	 

num_clusters
integer
(query)	Default value : 8
 

model_class
string
(query)	 

model_iteration
integer
(query)	 

Request body
 
file *
string($binary)	SQLite database file with a query table containing a prompt column.
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/summarize-documents/{model}
Summarize Documents
Retrieves and counts the number of unique documents stored in the vector store for each data configuration mapped to a model.
This endpoint processes all data configurations associated with the specified model, queues a job for each configuration to count the documents, and provides a response containing the job details. Additionally, the endpoint generates a CSV file for each data configuration containing the names of the documents, which can be used for auditing, reporting, or monitoring purposes.
Parameters
Try it out
Name	Description
model *
string
(path)	 

model_class
string
(query)	 

model_iteration
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/count-documents/{model}
Count Documents
Counts the number of documents in each of the vector store of a data config mapped to a model config.
Parameters
Try it out
Name	Description
model *
string
(path)	 

model_class
string
(query)	 

model_iteration
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  "string"
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
OpenAI compatible
POST
/cortex-openai/chat/completions
Chat Completions Post
OpenAI-Compatible Chat Completions API
` This endpoint accepts chat messages and returns a completions from the specified model. It is compatible with the LiteLLM chat model interface and serves as a drop-in replacement for OpenAI's chat completions API.
Request Parameters
•	data: Request body with the following fields:
o	model (string): Name of the model configuration to use
o	messages (array): List of message objects with role and content
o	temperature (float): Controls randomness of the output (default: 1.0)
o	stream (boolean): Whether to stream the response (default: false)
•	session_id (string, optional): Unique identifier for the chat session
Response
•	JSON response containing the model's completions
•	If streaming is enabled, returns a streaming response with chunks of the completions
Notes
•	This endpoint validates that no forbidden LiteLLM parameters are provided
•	Azure AI Chat models require an API key which is automatically handled
•	ClusterLLMs are not supported for this endpoint
Example Request
{
"model": "your-model-config-name",
"messages": [
    {"role": "user", "content": "Hello, how can you help me today?"}
],
"temperature": 0.7,
"stream": false
}
Parameters
Try it out
Name	Description
session_id
string
(query)	 

Request body
 
•	Example Value
•	Schema
{
  "model": "model_config_name",
  "messages": [
    {
      "role": "user",
      "content": ""
    }
  ],
  "temperature": 1,
  "stream": false,
  "additionalProp1": {}
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/cortex-openai/openai/deployments/{_}/chat/completions
Chat Completions Post
OpenAI-Compatible Chat Completions API
` This endpoint accepts chat messages and returns a completions from the specified model. It is compatible with the LiteLLM chat model interface and serves as a drop-in replacement for OpenAI's chat completions API.
Request Parameters
•	data: Request body with the following fields:
o	model (string): Name of the model configuration to use
o	messages (array): List of message objects with role and content
o	temperature (float): Controls randomness of the output (default: 1.0)
o	stream (boolean): Whether to stream the response (default: false)
•	session_id (string, optional): Unique identifier for the chat session
Response
•	JSON response containing the model's completions
•	If streaming is enabled, returns a streaming response with chunks of the completions
Notes
•	This endpoint validates that no forbidden LiteLLM parameters are provided
•	Azure AI Chat models require an API key which is automatically handled
•	ClusterLLMs are not supported for this endpoint
Example Request
{
"model": "your-model-config-name",
"messages": [
    {"role": "user", "content": "Hello, how can you help me today?"}
],
"temperature": 0.7,
"stream": false
}
Parameters
Try it out
Name	Description
session_id
string
(query)	 

Request body
 
•	Example Value
•	Schema
{
  "model": "model_config_name",
  "messages": [
    {
      "role": "user",
      "content": ""
    }
  ],
  "temperature": 1,
  "stream": false,
  "additionalProp1": {}
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/cortex-openai/responses
Responses Post
Responses API
Processes input text or messages and returns model-generated responses. This endpoint is designed for generating completions based on flexible input formats, supporting both string input and structured message arrays. It is compatible with the LiteLLM interface and serves as a drop-in replacement for OpenAI's responses API with enhanced response formatting capabilities.
Request Parameters
•	model (string, required): Name of the model configuration to use for generating responses
•	input (list[ChatCompletionMessageRequest] | string, required): Input data - either a list of message objects with role and content, or a plain text string
•	temperature (float, optional): Controls randomness of the output (default: 1.0, range: 0.0 - 1.0)
•	stream (boolean, optional): Whether to stream the response in real-time (default: false)
•	session_id (string, optional): Unique identifier for the session - auto-generated if not provided
Response
•	JSON response containing the model's responses
•	If streaming is enabled, returns a streaming response with chunks of the responses
Notes
•	** Authentication required** - Valid user context and model access permissions
•	Validates that no forbidden LiteLLM parameters are included in the request
•	Azure AI Chat models automatically receive JWT token authentication
•	ClusterLLMs are not supported and will return a BadRequest error
•	Supports both structured message input and plain text string input
•	Session IDs are auto-generated using UUID4 if not provided
•	Streaming responses use text/event-stream media type
Example Request
POST /responses
Content-Type: application/json

{
    "model": "gpt-4-config",
    "input": [
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ],
    "temperature": 0.7,
    "stream": false
}
Alternative string input format:
POST /responses
Content-Type: application/json

{
    "model": "claude-config",
    "input": "Write a haiku about machine learning",
    "temperature": 0.9
}
Parameters
Try it out
Name	Description
session_id
string
(query)	 

Request body
 
•	Example Value
•	Schema
{
  "model": "model_config_name",
  "input": [
    {
      "role": "user",
      "content": ""
    }
  ],
  "temperature": 1,
  "stream": false,
  "additionalProp1": {}
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/cortex-openai/embeddings
Embedding Post
This endpoint accepts text and returns embeddings from the specified model. It is compatible with LiteLLMs embedding model interface.
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
POST
/cortex-openai/openai/deployments/{_}/embeddings
Embedding Post
This endpoint accepts text and returns embeddings from the specified model. It is compatible with LiteLLMs embedding model interface.
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
Private LLM
POST
/model/private-llm/update
Update Private Llm
Add a new config value to the allowed_configs list for the given LLM key. If a configuration for the given model does not exist, one is created.
Parameters
Try it out
Name	Description
model_class *
string
(query)	 

model_iteration *
integer
(query)	 

config_name *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/private-llm/delete
Delete Private Llm
Remove the specified config value from the allowed_configs list for the given LLM key. If 'remove_all' is true, remove the entire configuration for the model.
Parameters
Try it out
Name	Description
model_class *
string
(query)	 

model_iteration *
integer
(query)	 

config_name *
string
(query)	 

remove_all
boolean
(query)	Default value : false
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Prompt
GET
/prompt
Prompt Name List
Returns list of prompt model's names that user is authorized to access If detailed=true, returns partial prompt objects with: name, display_name, description, prompt_type, owners Optional prompt_type filter to return only prompts of specific type
Parameters
Try it out
Name	Description
is_admin
boolean
(query)	Lists the model configs where the user is an owner
 

detailed
boolean
(query)	Set to true to get full prompt objects instead of just names
 

prompt_type
string
(query)	Filter prompts by prompt type (e.g., 'with_context', 'no_context')
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/prompt
Create Prompt Config
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "prompt_type": "no_context",
  "allowed_model_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "prompt": {
    "name": "string",
    "input_variables": [
      "string"
    ],
    "optional_variables": [],
    "input_types": {
      "additionalProp1": {}
    },
    "output_parser": {
      "name": "string"
    },
    "partial_variables": {
      "additionalProp1": {}
    },
    "metadata": {},
    "tags": [
      "string"
    ],
    "template": "string",
    "template_format": "f-string",
    "validate_template": false
  }
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "prompt_type": "no_context",
  "allowed_model_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "prompt": {
    "name": "string",
    "input_variables": [
      "string"
    ],
    "optional_variables": [],
    "output_parser": {
      "name": "string"
    },
    "partial_variables": {
      "additionalProp1": {}
    },
    "metadata": {},
    "tags": [
      "string"
    ],
    "template": "string",
    "template_format": "f-string",
    "validate_template": false
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/prompt/{name}
Get Prompt Config
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "prompt_type": "no_context",
  "allowed_model_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "prompt": {
    "name": "string",
    "input_variables": [
      "string"
    ],
    "optional_variables": [],
    "output_parser": {
      "name": "string"
    },
    "partial_variables": {
      "additionalProp1": {}
    },
    "metadata": {},
    "tags": [
      "string"
    ],
    "template": "string",
    "template_format": "f-string",
    "validate_template": false
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
PUT
/prompt/{name}
Update Prompt Config
Parameters
Try it out
Name	Description
name *
string
(path)	 

Request body
 
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "prompt_type": "no_context",
  "allowed_model_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "prompt": {
    "name": "string",
    "input_variables": [
      "string"
    ],
    "optional_variables": [],
    "input_types": {
      "additionalProp1": {}
    },
    "output_parser": {
      "name": "string"
    },
    "partial_variables": {
      "additionalProp1": {}
    },
    "metadata": {},
    "tags": [
      "string"
    ],
    "template": "string",
    "template_format": "f-string",
    "validate_template": false
  }
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "prompt_type": "no_context",
  "allowed_model_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "prompt": {
    "name": "string",
    "input_variables": [
      "string"
    ],
    "optional_variables": [],
    "output_parser": {
      "name": "string"
    },
    "partial_variables": {
      "additionalProp1": {}
    },
    "metadata": {},
    "tags": [
      "string"
    ],
    "template": "string",
    "template_format": "f-string",
    "validate_template": false
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/prompt/{name}
Delete Prompt Config
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/prompt/{prompt_name}/exists
Check Prompt Exists
Check if the prompt exists
Parameters
Try it out
Name	Description
prompt_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
true	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
RAGAS
GET
/model/evaluate-rag/{model}
Ragas Evaluate
Evaluate model with ragas
Parameters
Try it out
Name	Description
model *
string
(path)	 

q *
string
(query)	Input query for evaluation
 
minLength: 1
maxLength: 10485760
ground_truth *
string
(query)	Ground truth for evaluation
 
minLength: 1
maxLength: 10485760
metrics *
array<string>
(query)	List of metrics to evaluate. Metrics Explanation
Available values : answer_correctness, answer_relevancy, semantic_similarity, context_entity_recall, context_precision, context_recall, context_utilization, faithfulness
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/evaluate-rag/{model}/bulk
Ragas Evaluate
Evaluate model with ragas
Parameters
Try it out
Name	Description
model *
string
(path)	 

metrics *
array<string>
(query)	List of metrics to evaluate. Metrics Explanation
Available values : answer_correctness, answer_relevancy, semantic_similarity, context_entity_recall, context_precision, context_recall, context_utilization, faithfulness
 

batch_size
integer
(query)	Batch size for evaluation
Default value : 5
 
maximum: 50
workflow_timeout
integer
(query)	Workflow timeout in seconds
Default value : 72000
 

Request body
 
•	Example Value
•	Schema
[
  {
    "question": "string",
    "ground_truth": "string"
  }
]
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/evaluate-rag/{model}/fetch_evaluation/{file_name}
Fetch Evaluation
Parameters
Try it out
Name	Description
model *
string
(path)	 

file_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/evaluate-rag/generate-test-data
Ragas Generate Test Data
Parameters
Try it out
Name	Description
generator_model_config *
string
(query)	 

embedding_model_config *
string
(query)	 

test_size
integer
(query)	The number of questions to generate
Default value : 10
 
maximum: 50
minimum: 1
output_format
string
(query)	Available values : json, csv
 

Request body
 
uploaded_file *
string($binary)	
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "message": "",
  "source_metadata": [],
  "command_request": [
    "string"
  ],
  "token_count": 0,
  "steps": [],
  "logprobs": {},
  "status": [],
  "state_params": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/model/evaluate-rag/download-test-data
Ragas Download Test Data
Parameters
Try it out
Name	Description
generator_model_config_name *
string
(query)	 

test_data_file_name *
string
(query)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/model/evaluate-rag/job-status/{job_id}
Get Ragas Evaluate Job Status
Get model status for job upload
Parameters
Try it out
Name	Description
job_id *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Security
POST
/security/
Create Security Config
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "name": "testusersecconfig",
  "auth": {
    "owners": [
      "testuser@lilly.com"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "private": true
  },
  "guard": true,
  "blocking": false,
  "allowed_model_configs": [],
  "llm_guard": [
    {
      "bypass_scanners": {},
      "input_scanners": {
        "BanSubstrings": {
          "substrings": [
            "pfizer",
            "moderna",
            "covishield",
            "malaria"
          ]
        },
        "BanTopics": {
          "topics": [
            "vaccines",
            "covid",
            "china",
            "usa",
            "india"
          ],
          "threshold": 0.5
        },
        "PromptInjection": {
          "threshold": 0.5
        },
        "Secrets": {},
        "Language": {
          "valid_languages": [
            "en"
          ]
        },
        "BanCode": {},
        "BanCompetitors": {
          "competitors": [
            "Novo",
            "VKTX"
          ],
          "redact": false,
          "threshold": 0.5
        },
        "Code": {
          "languages": [
            "Python"
          ],
          "is_blocked": true
        },
        "Toxicity": {
          "threshold": 0.6
        },
        "Sentiment": {
          "threshold": -1
        }
      },
      "output_scanners": {
        "BanSubstrings": {
          "substrings": [
            "lockdown",
            "WHO"
          ]
        },
        "BanTopics": {
          "topics": [
            "covid variant",
            "deaths",
            "ukraine",
            "war",
            "russia",
            "UN"
          ],
          "threshold": 0.7
        }
      }
    }
  ],
  "guardrails_ai": [
    {
      "bypass_scanners": {},
      "input_scanners": {
        "detect_pii": {
          "pii_types": [
            "email",
            "phone_number",
            "address"
          ]
        },
        "detect_jailbreak": {
          "device": "cpu",
          "on_fail": "noop"
        }
      },
      "output_scanners": {
        "competitor_check": {
          "competitors": [
            "Pfizer",
            "Moderna",
            "AstraZeneca",
            "Johnson & Johnson"
          ],
          "threshold": 0.5
        }
      }
    }
  ]
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string (lowercase alphanumeric with dashes)",
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "string",
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "guard": false,
  "llm_guard": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      }
    }
  ],
  "guardrails_ai": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      }
    }
  ],
  "allowed_model_configs": [
    "string"
  ],
  "blocking": false
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/security/list
List Security Config
This is to list all the user security configs based on private flag. Note: Please keep list_security_config at the top and not change.
Parameters
Try it out
Name	Description
is_admin
string
(query)	Query all configs based on admin privileges.
Available values : true, false
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "name": "string (lowercase alphanumeric with dashes)",
    "s3_bucket": "lly-light-dev",
    "s3_prefix": "string",
    "auth": {
      "owners": [],
      "allow_access_to_reports_of": [],
      "owners_group": [],
      "access_groups": [],
      "access_aws_roles": [],
      "owners_aws_roles": [],
      "users": [],
      "private": true
    },
    "guard": false,
    "llm_guard": [
      {
        "bypass_scanners": {
          "additionalProp1": [
            "string"
          ],
          "additionalProp2": [
            "string"
          ],
          "additionalProp3": [
            "string"
          ]
        },
        "input_scanners": {
          "additionalProp1": {
            "additionalProp1": {}
          },
          "additionalProp2": {
            "additionalProp1": {}
          },
          "additionalProp3": {
            "additionalProp1": {}
          }
        },
        "output_scanners": {
          "additionalProp1": {
            "additionalProp1": {}
          },
          "additionalProp2": {
            "additionalProp1": {}
          },
          "additionalProp3": {
            "additionalProp1": {}
          }
        }
      }
    ],
    "guardrails_ai": [
      {
        "bypass_scanners": {
          "additionalProp1": [
            "string"
          ],
          "additionalProp2": [
            "string"
          ],
          "additionalProp3": [
            "string"
          ]
        },
        "input_scanners": {
          "additionalProp1": {
            "additionalProp1": {}
          },
          "additionalProp2": {
            "additionalProp1": {}
          },
          "additionalProp3": {
            "additionalProp1": {}
          }
        },
        "output_scanners": {
          "additionalProp1": {
            "additionalProp1": {}
          },
          "additionalProp2": {
            "additionalProp1": {}
          },
          "additionalProp3": {
            "additionalProp1": {}
          }
        }
      }
    ],
    "allowed_model_configs": [
      "string"
    ],
    "blocking": false
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/security/{user_security_config_name}
Get Security Config
Parameters
Try it out
Name	Description
user_security_config_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string (lowercase alphanumeric with dashes)",
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "string",
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "guard": false,
  "llm_guard": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      }
    }
  ],
  "guardrails_ai": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      }
    }
  ],
  "allowed_model_configs": [
    "string"
  ],
  "blocking": false
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
PUT
/security/{user_security_config_name}
Create Update Security Config
Parameters
Try it out
Name	Description
user_security_config_name *
string
(path)	 

Request body
 
•	Example Value
•	Schema
{
  "name": "testusersecconfig",
  "auth": {
    "owners": [
      "testuser@lilly.com"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "private": true
  },
  "guard": true,
  "blocking": false,
  "allowed_model_configs": [],
  "llm_guard": [
    {
      "bypass_scanners": {},
      "input_scanners": {
        "BanSubstrings": {
          "substrings": [
            "pfizer",
            "moderna",
            "covishield",
            "malaria"
          ]
        },
        "BanTopics": {
          "topics": [
            "vaccines",
            "covid",
            "china",
            "usa",
            "india"
          ],
          "threshold": 0.5
        },
        "PromptInjection": {
          "threshold": 0.5
        },
        "Secrets": {},
        "Language": {
          "valid_languages": [
            "en"
          ]
        },
        "BanCode": {},
        "BanCompetitors": {
          "competitors": [
            "Novo",
            "VKTX"
          ],
          "redact": false,
          "threshold": 0.5
        },
        "Code": {
          "languages": [
            "Python"
          ],
          "is_blocked": true
        },
        "Toxicity": {
          "threshold": 0.6
        },
        "Sentiment": {
          "threshold": -1
        }
      },
      "output_scanners": {
        "BanSubstrings": {
          "substrings": [
            "lockdown",
            "WHO"
          ]
        },
        "BanTopics": {
          "topics": [
            "covid variant",
            "deaths",
            "ukraine",
            "war",
            "russia",
            "UN"
          ],
          "threshold": 0.7
        }
      }
    }
  ],
  "guardrails_ai": [
    {
      "bypass_scanners": {},
      "input_scanners": {
        "detect_pii": {
          "pii_types": [
            "email",
            "phone_number",
            "address"
          ]
        },
        "detect_jailbreak": {
          "device": "cpu",
          "on_fail": "noop"
        }
      },
      "output_scanners": {
        "competitor_check": {
          "competitors": [
            "Pfizer",
            "Moderna",
            "AstraZeneca",
            "Johnson & Johnson"
          ],
          "threshold": 0.5
        }
      }
    }
  ]
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string (lowercase alphanumeric with dashes)",
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "string",
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "guard": false,
  "llm_guard": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      }
    }
  ],
  "guardrails_ai": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      }
    }
  ],
  "allowed_model_configs": [
    "string"
  ],
  "blocking": false
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/security/{user_security_config_name}
Delete Security Config
Parameters
Try it out
Name	Description
user_security_config_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	





Security-Cyber
GET
/manage/cyberconfig
Get Securityconfig
Get the llmguard parent infosec configs
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/manage/cyberconfig
Set Securityconfig
Set llmguard parent infosec configs Check if the user is authorized to post infosec parent guard config
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "name": "string",
  "s3_bucket": "string",
  "s3_prefix": "string",
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "parent_llm_guard": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "included_configs": {},
      "excluded_configs": {}
    }
  ],
  "parent_guardrails": [
    {
      "bypass_scanners": {
        "additionalProp1": [
          "string"
        ],
        "additionalProp2": [
          "string"
        ],
        "additionalProp3": [
          "string"
        ]
      },
      "input_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "output_scanners": {
        "additionalProp1": {
          "additionalProp1": {}
        },
        "additionalProp2": {
          "additionalProp1": {}
        },
        "additionalProp3": {
          "additionalProp1": {}
        }
      },
      "included_configs": {},
      "excluded_configs": {}
    }
  ],
  "parent_prompt_limiter": {
    "additionalProp1": {}
  }
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Sync
GET
/sync
Sync Name List
Returns list of syncs config names that user is authorized to access
Parameters
Try it out
Name	Description
is_admin
boolean
(query)	Lists the sync configs where the user is an owner
 

data_config
string
(query)	Lists the sync configs for a specific data config
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  "string"
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/sync
Create Sync Config
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "sync_type": "sharepoint",
  "sync_id": "string",
  "sync_datetime": "string",
  "sync_status": "In Sync",
  "external_config": {
    "site_name": "string",
    "library_name": "string",
    "path": "string"
  },
  "failure_reason": "string",
  "pending_sync_job_id": "string",
  "file_validity_override": {
    "allowed_file_extensions": [
      "csv",
      "mp4",
      "pdf",
      "pptx",
      "txt",
      "wav",
      "docx",
      "jsonl",
      "ndjson",
      "pdf",
      "mp3",
      "xlsx",
      "xlsx"
    ],
    "file_size_mb": 500
  },
  "data_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  }
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "sync_type": "sharepoint",
  "sync_id": "string",
  "sync_datetime": "string",
  "sync_status": "In Sync",
  "external_config": {
    "site_name": "string",
    "library_name": "string",
    "path": "string"
  },
  "failure_reason": "string",
  "pending_sync_job_id": "string",
  "file_validity_override": {
    "allowed_file_extensions": [
      "csv",
      "mp4",
      "pdf",
      "pptx",
      "txt",
      "wav",
      "docx",
      "jsonl",
      "ndjson",
      "pdf",
      "mp3",
      "xlsx",
      "xlsx"
    ],
    "file_size_mb": 500
  },
  "data_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/sync/is_valid_sync
Is Valid Sync
Check validity of sync and respond with validity and detail
Parameters
Try it out
Name	Description
validate_only_external_config
boolean
(query)	Perform validation against only the External Config, ignoring other validations (e.g. Data Config not present).
Default value : false
 

Request body
 
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "sync_type": "sharepoint",
  "sync_id": "string",
  "sync_datetime": "string",
  "sync_status": "In Sync",
  "external_config": {
    "site_name": "string",
    "library_name": "string",
    "path": "string"
  },
  "failure_reason": "string",
  "pending_sync_job_id": "string",
  "file_validity_override": {
    "allowed_file_extensions": [
      "csv",
      "mp4",
      "pdf",
      "pptx",
      "txt",
      "wav",
      "docx",
      "jsonl",
      "ndjson",
      "pdf",
      "mp3",
      "xlsx",
      "xlsx"
    ],
    "file_size_mb": 500
  },
  "data_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  }
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "validity": "invalid",
  "valid_file_count": 0,
  "total_file_count": 0,
  "message": "string"
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
PUT
/sync/{name}
Update Sync Config
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "sync_type": "sharepoint",
  "sync_id": "string",
  "sync_datetime": "string",
  "sync_status": "In Sync",
  "external_config": {
    "site_name": "string",
    "library_name": "string",
    "path": "string"
  },
  "failure_reason": "string",
  "pending_sync_job_id": "string",
  "file_validity_override": {
    "allowed_file_extensions": [
      "csv",
      "mp4",
      "pdf",
      "pptx",
      "txt",
      "wav",
      "docx",
      "jsonl",
      "ndjson",
      "pdf",
      "mp3",
      "xlsx",
      "xlsx"
    ],
    "file_size_mb": 500
  },
  "data_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  }
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "sync_type": "sharepoint",
  "sync_id": "string",
  "sync_datetime": "string",
  "sync_status": "In Sync",
  "external_config": {
    "site_name": "string",
    "library_name": "string",
    "path": "string"
  },
  "failure_reason": "string",
  "pending_sync_job_id": "string",
  "file_validity_override": {
    "allowed_file_extensions": [
      "csv",
      "mp4",
      "pdf",
      "pptx",
      "txt",
      "wav",
      "docx",
      "jsonl",
      "ndjson",
      "pdf",
      "mp3",
      "xlsx",
      "xlsx"
    ],
    "file_size_mb": 500
  },
  "data_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/sync/{name}
Get Sync Config
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "sync_type": "sharepoint",
  "sync_id": "string",
  "sync_datetime": "string",
  "sync_status": "In Sync",
  "external_config": {
    "site_name": "string",
    "library_name": "string",
    "path": "string"
  },
  "failure_reason": "string",
  "pending_sync_job_id": "string",
  "file_validity_override": {
    "allowed_file_extensions": [
      "csv",
      "mp4",
      "pdf",
      "pptx",
      "txt",
      "wav",
      "docx",
      "jsonl",
      "ndjson",
      "pdf",
      "mp3",
      "xlsx",
      "xlsx"
    ],
    "file_size_mb": 500
  },
  "data_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/sync/{name}
Delete Sync Config
Parameters
Try it out
Name	Description
name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/sync/metrics/{name}
Get Sync Metrics
Parameters
Try it out
Name	Description
name *
string
(path)	 

sync_id
string
(query)	Sync ID to query.
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {
    "job_total": 0,
    "failed_jobs": 0,
    "finished_jobs": 0,
    "missing_jobs": 0
  },
  "additionalProp2": {
    "job_total": 0,
    "failed_jobs": 0,
    "finished_jobs": 0,
    "missing_jobs": 0
  },
  "additionalProp3": {
    "job_total": 0,
    "failed_jobs": 0,
    "finished_jobs": 0,
    "missing_jobs": 0
  }
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/sync/trigger/{name}
Trigger Sync
Parameters
Try it out
Name	Description
name *
string
(path)	 

force
boolean
(query)	Force sync even if sync is in progress.
Default value : false
 

reconcile
boolean
(query)	Perform full reconciliation between current files in Data Configs and Sharepoint.
Default value : false
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "additionalProp1": {}
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/sync/metrics/aggregated/{data_config}
Get Aggregated Dataconfig Metrics
Parameters
Try it out
Name	Description
data_config *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "sync_status": "In Sync",
  "sync_datetime": "string"
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
System
GET
/health
Healthhandler
Healthceck for llm fabric api
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{}	No links
GET
/health/diagnostic
Health Check Diagnostic
Parameters
Try it out
No parameters
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "application_name": "string",
  "application_status": "UP",
  "service_health_responses": [
    {
      "service_name": "string",
      "status": "UP",
      "details": {}
    }
  ]
}	No links
Toolkit
PUT
/toolkits
Set Tool Config
Set the toolkit config
Parameters
Try it out
No parameters
Request body
 
•	Example Value
•	Schema
{
  "allowed_model_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "description": "string",
  "name": "string (lowercase alphanumeric with dashes)",
  "displayName": "string",
  "server": "string",
  "agent_tool_max_iterations": 7,
  "access_token_scopes": []
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
{
  "allowed_model_configs": [],
  "auth": {
    "owners": [],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "description": "string",
  "name": "string (lowercase alphanumeric with dashes)",
  "displayName": "string",
  "server": "string",
  "agent_tool_max_iterations": 7,
  "access_token_scopes": []
}	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits
List Toolkits
List all toolkit configs the user has access to
Parameters
Try it out
Name	Description
is_admin
boolean
(query)	Lists the model configs where the user is an owner
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "name": "string",
    "description": "string",
    "displayName": "string",
    "server": "string",
    "is_owner": false
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits/{toolkit_name}
Get Toolkit Config
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
DELETE
/toolkits/{toolkit_name}
Delete Toolkit
Delete API for toolkit
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
true	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits/{toolkit_name}/describe
Describe Toolkit
Retrieve Available Tools in a Toolkit.
Returns a comprehensive list of all tools available within a specified toolkit, including their descriptions, parameters, and metadata. This endpoint is essential for discovering toolkit capabilities and understanding tool interfaces before execution.
Args:
toolkit_name (str): The name of the toolkit to retrieve tool descriptions for
request (Request): FastAPI request object containing user context and authentication
Returns:
list[ToolDescription]: A list of tool descriptions containing:
    - name: Tool identifier
    - description: Detailed explanation of tool functionality
    - args_schema: JSON schema defining tool parameters
    - short_description: Brief tool summary
    - tags: Categorization labels
    - metadata: Additional tool information
    - return_direct: Whether tool returns results directly
    - verbose: Detailed logging flag
    - handle_tool_error: Error handling configuration
    - handle_validation_error: Validation error handling
    - response_format: Expected response format
    - json_input_schema: JSON schema for input validation
Notes:
- Requires proper authentication and authorization for the specified toolkit
- Returns 401 Unauthorized if user lacks access to the toolkit
- Raises ToolkitNotFoundException if the toolkit does not exist
- Tool count metrics are automatically recorded for monitoring purposes
- All tools are described asynchronously to support various tool implementations
Example Request:
GET /toolkits/my-toolkit/describe
Example Response:
[
    {
        "name": "search_tool",
        "description": "Search through documents and return relevant results",
        "short_description": "Document search tool",
        "args_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            }
        },
        "return_direct": false,
        "verbose": false,
        "tags": ["search", "documents"],
        "metadata": {"version": "1.0"},
        "handle_tool_error": false,
        "handle_validation_error": false,
        "response_format": "content",
        "json_input_schema": "{}"
    }
]
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  {
    "name": "string",
    "description": "string",
    "args_schema": {},
    "return_direct": false,
    "verbose": false,
    "tags": [
      "string"
    ],
    "metadata": {},
    "handle_tool_error": false,
    "handle_validation_error": false,
    "response_format": "content",
    "short_description": "string",
    "json_input_schema": {}
  }
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits/{toolkit_name}/execute
Execute Toolkit
Execute a Toolkit Tool via GET Request.
Executes a specific tool within a toolkit using query parameters. This endpoint is ideal for simple tool executions with short queries that can be passed via URL parameters. For complex queries or large input data, use the POST variant of this endpoint.
Args:
toolkit_name (str): The name of the toolkit containing the tool to execute
request (Request): FastAPI request object containing user context and authentication
tool (str, optional): The specific tool name within the toolkit to execute. Defaults to empty string
query (str, optional): The input query or parameters to pass to the tool. Defaults to empty string
Returns:
str: The output result from the executed tool as a string
Notes:
- Requires proper authentication and authorization for the specified toolkit
- Returns 401 Unauthorized if user lacks access to the toolkit
- Raises ToolkitNotFoundException if the toolkit does not exist
- Tool execution is performed asynchronously to support various tool implementations
- Query length is limited by URL parameter constraints; use POST for longer queries
- Empty tool parameter may execute a default tool depending on toolkit configuration
- Tool output is returned directly as string content
Example Request:
GET /toolkits/my-toolkit/execute?tool=search_tool&query=find%20documentation
Example Response:
Found 5 relevant documents matching your query about documentation...
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

tool
string
(query)	Default value :
 

query
string
(query)	Default value :
 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
POST
/toolkits/{toolkit_name}/execute
Execute Toolkit
Execute a Toolkit Tool via POST Request.
Executes a specific tool within a toolkit using request body parameters. This endpoint is preferred for complex tool executions with longer queries, structured input data, or when URL parameter limits would be exceeded. Provides the same functionality as the GET variant but with enhanced input capacity.
Args:
toolkit_name (str): The name of the toolkit containing the tool to execute
request (Request): FastAPI request object containing user context and authentication
query (ToolkitQuery): Request body containing the query string to be processed by the tool
tool (str, optional): The specific tool name within the toolkit to execute. Defaults to empty string
Returns:
str: The output result from the executed tool as a string
Notes:
- Requires proper authentication and authorization for the specified toolkit
- Returns 401 Unauthorized if user lacks access to the toolkit
- Raises ToolkitNotFoundException if the toolkit does not exist
- Tool execution is performed asynchronously to support various tool implementations
- Preferred over GET method for queries longer than URL parameter limits
- Request body allows for more complex query structures and larger input data
- Empty tool parameter may execute a default tool depending on toolkit configuration
- Tool output is returned directly as string content
Request Body Schema:
- **query** (str): The input query or parameters to pass to the tool
Example Request:
POST /toolkits/my-toolkit/execute?tool=analysis_tool
Content-Type: application/json

{
    "query": "Analyze the following large dataset and provide insights on trends, patterns, and anomalies..."
}
Example Response:
Analysis complete. Found 3 key trends: 1) Seasonal patterns in Q2-Q3...
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

tool
string
(query)	Default value :
 

Request body
 
•	Example Value
•	Schema
{
  "query": ""
}
Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits/{toolkit_name}/tools
List Toolkit Tools
Retrieve Simplified Tool List from Toolkit.
Returns a simplified list of tools available within a specified toolkit, providing essential information for tool discovery and selection. This endpoint offers a lighter alternative to the /describe endpoint, focusing on basic tool identification rather than comprehensive schema details.
Args:
toolkit_name (str): The name of the toolkit to retrieve tools from
request (Request): FastAPI request object containing user context and authentication
Returns:
list[ToolList]: A list of simplified tool information containing:
    - name: The unique identifier of the tool within the toolkit
    - description: Detailed explanation of the tool's functionality and purpose
    - short_description: Brief summary of what the tool does
Notes:
- Requires proper authentication and authorization for the specified toolkit
- Raises UnauthorizedException if user lacks access to the toolkit
- Raises ToolkitNotFoundException if the toolkit does not exist
- Returns a simplified view compared to `/describe` endpoint (no schema details)
- Useful for UI components that need basic tool information without full schemas
- Tool information is retrieved asynchronously to support various toolkit implementations
- All accessible tools within the toolkit are included in the response
Example Request:
GET /toolkits/my-toolkit/tools
Example Response:
[
    {
        "name": "search_tool",
        "description": "Search through documents and return relevant results based on query parameters",
        "short_description": "Document search tool"
    },
    {
        "name": "analysis_tool",
        "description": "Analyze data patterns and provide insights with statistical summaries",
        "short_description": "Data analysis tool"
    }
]
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  "string"
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits/{toolkit_name}/exists
Check Toolkit Exists
Check Toolkit Existence.
Verifies whether a toolkit with the specified name exists in the system. This endpoint provides a quick way to validate toolkit availability before attempting to access or execute tools within it. No authentication is required, making it suitable for public availability checks.
Args:
toolkit_name (str): The name of the toolkit to check for existence
Returns:
bool: True if the toolkit exists and is available, False if it does not exist
Notes:
- No authentication or authorization required - this is a public availability check
- Returns boolean result immediately without detailed error information
- Useful for validating toolkit names before making authenticated requests
- Does not check user permissions - only verifies toolkit existence in the system
- Can be used for UI validation, form validation, or programmatic checks
- Lightweight operation with minimal resource usage
- Does not provide information about toolkit contents or accessibility
Example Request:
GET /toolkits/my-toolkit/exists
Example Response:
true
Example Response (Non-existent toolkit):
false
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
true	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits/{model_config}/list-tools
List Tools
Retrieve All Tools Available to a Model Configuration.
Returns a consolidated list of all tools available from all toolkits associated with a specific model configuration. This endpoint aggregates tools across multiple toolkits, providing a comprehensive view of all capabilities accessible through a given model configuration.
Args:
model_config (str): The name of the model configuration to retrieve associated tools for
request (Request): FastAPI request object containing user context and authentication
Returns:
list[ToolList]: A consolidated list of tools from all associated toolkits containing:
    - name: The unique identifier of each tool
    - description: Detailed explanation of the tool's functionality and purpose
    - short_description: Brief summary of what the tool does
Notes:
- Requires proper authentication and authorization for the specified model configuration
- Returns 403 Forbidden if user lacks access to the model configuration
- Returns 404 Not Found if the model configuration does not exist
- Returns 401 Unauthorized if user lacks access to any associated toolkit
- Aggregates tools from all toolkits configured for the specified model
- Each toolkit's authorization is checked individually during aggregation
- Returns 500 Internal Server Error for unexpected system errors
- Tools are retrieved asynchronously from each toolkit to support various implementations
- Duplicate tool names across toolkits will appear as separate entries
Error Responses:
- **404 Not Found**: Model configuration does not exist
- **403 Forbidden**: User not authorized to access model configuration
- **401 Unauthorized**: User not authorized to access one or more associated toolkits
- **500 Internal Server Error**: System error during tool retrieval
Example Request:
GET /toolkits/my-model-config/list-tools
Example Response:
[
    {
        "name": "search_tool",
        "description": "Search through documents and return relevant results based on query parameters",
        "short_description": "Document search tool"
    },
    {
        "name": "analysis_tool",
        "description": "Analyze data patterns and provide insights with statistical summaries",
        "short_description": "Data analysis tool"
    },
    {
        "name": "calculation_tool",
        "description": "Perform mathematical calculations and statistical operations on datasets",
        "short_description": "Mathematical calculator"
    }
]
Parameters
Try it out
Name	Description
model_config *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
[
  "string"
]	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
Toolkit-Security
GET
/toolkits/{toolkit_name}/is-manager
Is Toolkit Manager
Check Toolkit Manager Permissions.
Determines whether the current user has manager (administrative) privileges for the specified toolkit configuration. Manager permissions allow users to modify toolkit configurations, manage access controls, and perform administrative operations on the toolkit.
Args:
toolkit_name (str): The name of the toolkit to check manager permissions for
request (Request): FastAPI request object containing user context and authentication
Returns:
bool: True if the user has manager privileges for the toolkit, False otherwise
Notes:
- Requires authentication - user context is extracted from the request
- Returns 404 Not Found if the toolkit does not exist
- Returns 500 Internal Server Error for unexpected system errors
- Manager privileges are typically required for:
  - Modifying toolkit configuration
  - Managing user access permissions
  - Deleting or updating toolkit settings
  - Administrative operations on toolkit tools
- Regular users may have access to use tools without manager privileges
- Useful for UI components to show/hide administrative features
- This endpoint may be moved to middleware in future versions
Error Responses:
- **404 Not Found**: Toolkit configuration does not exist
- **500 Internal Server Error**: System error during permission check
Example Request:
GET /toolkits/my-toolkit/is-manager
Example Response (User is a manager):
true
Example Response (User is not a manager):
false
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
true	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links
GET
/toolkits/{toolkit_name}/is-authorized
Is Toolkit Authorized
Check Toolkit Access Authorization.
Determines whether the current user is authorized to access and use the specified toolkit configuration. This endpoint checks basic access permissions, which are required before users can execute tools or retrieve toolkit information. Different from manager permissions, this checks general usage rights.
Args:
toolkit_name (str): The name of the toolkit to check access authorization for
request (Request): FastAPI request object containing user context and authentication
Returns:
bool | JSONResponse:
    - bool: True if the user is authorized to access the toolkit, False otherwise
    - JSONResponse: Error response with details when toolkit is not found or system errors occur
Notes:
- Requires authentication - user context is extracted from the request
- Returns 404 Not Found JSONResponse if the toolkit does not exist
- Returns 500 Internal Server Error JSONResponse for unexpected system errors
- Access authorization is required for:
  - Executing toolkit tools
  - Retrieving toolkit tool descriptions
  - Viewing toolkit configuration details
  - Basic toolkit operations
- If toolkit auth isn't configured, users may be automatically authorized
- Authorization is separate from manager permissions (use /is-manager for admin checks)
- Useful for UI components to show/hide toolkit-related features
- This endpoint may be moved to middleware in future versions
Error Responses:
- **404 Not Found**: Toolkit configuration does not exist
- **500 Internal Server Error**: System error during authorization check
Example Request:
GET /toolkits/my-toolkit/is-authorized
Example Response (User is authorized):
true
Example Response (User is not authorized):
false
Example Error Response (Toolkit not found):
{
    "time": "2024-01-01T12:00:00Z",
    "module": "toolkits->is_authorized",
    "name": "my-toolkit",
    "action": "get",
    "message": "Toolkit config not found"
}
Parameters
Try it out
Name	Description
toolkit_name *
string
(path)	 

Responses
Code	Description	Links
200	Successful Response
Media type
 
Controls Accept header.
•	Example Value
•	Schema
"string"	No links
422	Validation Error
Media type
 
•	Example Value
•	Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}	No links

