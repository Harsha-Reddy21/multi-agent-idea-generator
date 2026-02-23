1.	Cortex Platform
2.	Conceptual Guide
Conceptual Guide
TABLE OF CONTENTS
•	Overview
•	Introduction
•	Core Concepts
o	Model only Configuration
o	Generative AI
o	Large Language Models (LLM)
o	Transformer Models
o	Prompt Engineering
	Types of Prompts
o	Model Fine-tuning
o	Vector Store
o	Retrieval-Augmented Generation (RAG)
o	Retrieval and Pre-processing:
o	Grounded Generation:
•	Key Terminology
o	Tokenization
o	Embeddings
o	Attention Mechanism
o	Latent Space
•	Capabilities
o	Text Generation
o	Image Generation
o	Code Generation
Overview
This guide introduces the foundational ideas behind the Cortex and GenAI in general.
We recommend starting with one of the how-to guides before delving into this conceptual guide. The hands-on experience will provide valuable context, making the concepts discussed here easier to grasp.
Unlike the Tutorials and How-to guides, this section is not intended to offer detailed instructions or implementation examples. For those, please consult the respective guides. For in-depth technical details, refer to the API reference documentation.
________________________________________
Introduction
Generative AI represents a transformative leap in how machines interact with humans. Unlike traditional AI systems, which analyze or classify data, Generative AI creates. Whether it’s writing articles, generating images, or assisting with code, these systems unlock creativity at scale.
________________________________________
Core Concepts
Model only Configuration
“Model-Only Configuration” integrates and utilizes generative AI models without the need for additional infrastructure or dependencies. This approach focuses solely on providing access to pre-trained models, enabling developers to plug them into their applications with minimal setup. By abstracting away complexities such as data pipelines, fine-tuning environments, or custom infrastructure, this configuration empowers developers to quickly prototype, test, and deploy generative AI solutions. Ideal for those seeking simplicity and speed, it ensures that the focus remains on harnessing the model’s capabilities to meet specific application needs.
Generative AI
Generative AI refers to models trained to create new data points, such as text, images, or audio, by understanding patterns in existing datasets.
________________________________________
Large Language Models (LLM)
Large language models (LLMs) are artificial intelligence (AI) models that can perform natural language processing (NLP) tasks, such as generating and translating text, answering questions, and summarizing text.
LLMs are trained on massive amounts of data, often billions of words, to learn statistical relationships and patterns in language. They are based on deep learning architectures, such as the Transformer developed by Google, and are also known as neural networks (NNs
________________________________________
Transformer Models
Transformers are the backbone of modern Generative AI systems. They use the attention mechanism to process sequential data efficiently.
•	Key Features:
o	Scalability: Handle large datasets.
o	Versatility: Support multi-modal tasks like text-to-image generation.
•	Examples: GPT, DALL·E, BERT.
________________________________________
Prompt Engineering
Prompt engineering is the art of designing inputs to maximize output quality from a generative model.
TYPES OF PROMPTS
1.	Direct prompts: “Summarize this text.”
2.	Conversational prompts: “Imagine you’re a teacher explaining photosynthesis.”
3.	Instructional prompts: “Write a Python function to calculate Fibonacci numbers.”
________________________________________
Model Fine-tuning
Fine-tuning adjusts a pre-trained model for a specific task or domain by training it on smaller, domain-specific datasets.
•	Steps:
1.	Pre-train on general data.
2.	Fine-tune on specialized data.
3.	Validate and test outputs.
________________________________________
Vector Store
A vector store is a specialized database designed to store and manage high-dimensional vectors, which represent data points in a way that captures their semantic meaning. In Generative AI, vector stores enable efficient retrieval and similarity searches, allowing models to access relevant information quickly and enhance their output quality. Examples of the vector store available on Cortex are:
1.	Pinecone: A fully managed vector database that allows developers to build and scale AI applications by providing fast and reliable similarity search capabilities.
2.	Elasticsearch: While primarily known as a search engine, Elasticsearch can also handle vector embeddings, enabling powerful search and recommendation features for AI-driven applications. These tools empower Generative AI systems to deliver more accurate and contextually relevant results, improving user experiences across various applications.
________________________________________
Retrieval-Augmented Generation (RAG)
RAG (Retrieval-Augmented Generation) is an AI framework that merges the advantages of conventional information retrieval systems, like search engines and databases, with the abilities of generative large language models (LLMs). This integration of your data and general knowledge with the linguistic capabilities of LLMs results in generation that is more precise, current, and tailored to your specific requirements.
 
RAGs follow several key steps to improve the outputs of generative AI:
Retrieval and Pre-processing:
RAGs utilize advanced search algorithms to access external data sources, such as websites, knowledge bases, and databases. After retrieving the relevant information, it undergoes pre-processing steps like tokenization, stemming, and the elimination of stop words.
Grounded Generation:
The pre-processed information is then integrated into the pre-trained large language model (LLM). This integration enriches the LLM’s context, allowing it to gain a deeper understanding of the subject matter. As a result, the LLM can produce responses that are more accurate, informative, and engaging.
RAG works by initially retrieving pertinent information from a database based on a query generated by the LLM. This information is then incorporated into the LLM’s input, which helps it generate text that is more precise and contextually appropriate. The retrieval process is typically managed by a semantic search engine that employs embeddings stored in vector databases, along with advanced ranking and query rewriting techniques, to ensure that the results are relevant and effectively address the user’s question
________________________________________
Key Terminology
Tokenization
Breaking input text into manageable chunks called tokens, which the model processes.
Example:
Input: “AI is powerful.”
Tokens: [“AI”, “is”, “powerful”, “.”]
________________________________________
Embeddings
Numerical representations of data (e.g., words, images) used for similarity calculations.
Use Case:
Search engines convert queries and documents into embeddings to rank results.
________________________________________
Attention Mechanism
A component that prioritizes the most relevant input data when generating outputs.
Analogy:
A teacher focuses on key phrases when summarizing a student’s essay.
________________________________________
Latent Space
An abstract representation where generative models map relationships between data points.
Example:
In latent space, similar images (e.g., “cat” and “kitten”) are closer than dissimilar ones (“cat” and “car”).
________________________________________
Capabilities
Text Generation
•	Applications: Blog posts, customer support, documentation.
•	Example Prompt: “Write a motivational email to employees.”
________________________________________
Image Generation
•	Applications: Marketing visuals, concept art, UI/UX design.
•	Example: Generating a realistic image of a “cyberpunk cityscape.”
________________________________________
Code Generation
•	Applications: Boilerplate code, debugging assistance, test cases.
•	Example: “Write a JavaScript function to sort an array.”



Pre-requisites
If you’re new to the Cortex platform, follow our detailed step-by-step guide to gain access,set up your environment and start building your first model.
STEP 1. Get Approval for Your Use Case
•	
•	
•	
o	
o	
o	
STEP 2. Request Access to Cortex
1.	
2.	
o	
o	
3.	
4.	
STEP 3. Request an AWS Account
•	
________________________________________
Set Up Your First Model
To delve into the core idea and principles of model configs, refer to the Conceptual Guides
Follow the steps below to start building basic interactive chat using Cortex APIs with minimal set-up.
STEP 1. Set up a model config >
STEP 2. Set up a data config >
________________________________________
Authentication Guidelines for Cortex
Cortex follows secure and robust authentication mechanisms to protect sensitive data and ensure system integrity. Cortex follows CATS Auth Patterns; Please visit the link below for documentation
AUTHENTICATION METHODS:
1.	Delegated Auth (End-user Auth):
o	Ideal for scenarios where individual user permissions are required.
o	The user authenticates directly via their account credentials.
2.	AWS Auth:
o	Used for backend services or automated workflows.
o	AWS roles and permissions are leveraged for secure access.
FUTURE PLANS:
Cortex may introduce Entra ID App Registration via Azure to simplify authentication for enterprise applications. Stay tuned for updates.
Important Notes: (1) Cortex does not provide usernames/passwords for service accounts to ensure compliance with security policies. (2) For detailed steps, refer to the Authentication Documentation.
________________________________________
Environment Guidelines for Cortex
Cortex APIs can only be accessed from secure and approved environments managed by the CATS team.
ENVIRONMENT SETUP:
•	Install required tools and dependencies in your local setup according to CATS guidelines.
•	Configure the network and environment settings to comply with organizational security protocols.
ADDITIONAL NOTES:
1.	Codespaces:
If you plan to use LiteClient in Codespaces, reach out to the Cortex team for setup assistance.
2.	Postman Usage:
Use browser sessions or cookies for secure authentication when using Postman.
3.	Non-Lilly Devices:
Accessing Cortex from non-Lilly machines requires using Virtual Desktop Infrastructure (VDI).
For a detailed step-by-step guide, visit the CATS Environment Documentation.
With an approved use case and permissions, it’s time to create your configurations in Cortex!
________________________________________
Helpful Links:
•	Cortex API



Creating a Simple chat (Model only) using cortex API.
Pre-requisites:
To create a simple chat model, ensure you have completed the steps in the Getting Started with Cortex and have access to the following resources:
1.	Cortex API to view the API documentation for the Cortex platform.
2.	Chat In A Box CIAB to view and query the chat model you will create.
3.	Access to the following APIs which are the three general topics that you need to make comprehensive basic Cortex assistant:
o	Model API
o	Data API
o	Prompt API
4.	List of models, which can be obtained from the GET/models/classes/list API endpoint: click on Try it out and Execute. The details of the different model classes available on Cortex will be in the JSON response body.
Skip the reading and watch the demonstration! This demo video provides a step-by-step walkthrough of the process below. It serves as a visual guide to help you get started more quickly. Cortex access is required to view.
Procedure:
Step 1: Login
Log in to the Cortex API using your organizational credentials.
Step 2: Access Model | Config API
Locate the Model | Config section of the API. You will find the following API services:
•	GET /model/ List models (List all the Model Configs)
•	POST /model/ Setconfig (build and set a Config)
•	GET /model/{model} Getconfig (get the details of your (Config)
•	DELETE /model/{model} Delete config
•	GET /model/exists/{model} Check if Model Exists
Step 3: Set Model Configuration
To set your chat model configuration, expand the POST/models/ in the Model Config API, click the Try it out button. In the request body, you will find the default json documents for edits. To get the details of ALL the fields in the json request body, refer to Request Syntax
For this basic Model only Config, you do not need to specify values to ALL the fields in the request. Here is a sample request with values to some basic fields:
   {
  "name": "mydemo-1",
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "lly-dev/demo-setup2/doc",
  "auth": {
    "owners": ["testuser@lilly.com"],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "displayName": "mydemo-1",
  "model_description": "This is a demo for TW project",
  "security_config": "",
  "chain": [
    {
      "chain_class": "model-only-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {}
    }
  ],
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 7,
      "priority": 100
    }
  ],
  "toolkits": null,
  "allowed_tools_list": null,
  "prompts": {
    "no_context": "default_no_context",
    "with_context": "default_with_context",
    "enhance_query": "default_enhance_query",
    "sql": "default_sql",
    "agent_tool": "default_agent_tool",
    "table_summary": "default_table_summary",
    "summary": "default_summary",
    "entity_extraction": "default_entity_extraction",
    "rewrite": "default_rewrite",
    "kg_triple_extraction": "default_kg_triple_extraction"
  },
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
  "labels": {},
  "k_value": 20,
  "token_buffer_size": 1.2,
  "temperature": 0,
  "top_p": 1,
  "stop": null,
  "seed": null,
  "logprobs": false
}
Here are the sample values of the required prominent fields in the above json request body. These values can be customised according to your use case
•	name: “mydemo-1”,
•	s3_bucket:”lly-light-dev”
•	s3_prefix: “lly-dev/mydemo-1/docs”
•	owners: [“testuser@lilly.com”],
•	displayName: “my first chat model”
•	model_description: This chat is a test of the model config in Cortex.
For the sample values of the below fields, refer to the response body from Step 4 of the Pre-requisites above
•	model_class: lilly.openai
•	model_iteration: 7
•	priority: 100
The values of the below fields can be set to null
•	security_config: “”
•	stop: null
•	seed: null
•	toolkits: null
•	allowed_tools_list: null
Step 4: Execute the Request
Once the modification is done, click on Execute. This will send the request to the server to create the chat model.
A 200 successful response will show that the simple chat model has been deployed as shown in the syntax below:
 {
  "name": "mydemo-1",
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "llm-dev/my-demo1/docs",
  "auth": {
    "owners": [
      "testuser@lilly.com"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "displayName": "mydemo-1",
  "model_description": "This is a demo for TW project",
  "security_config": "",
  "chain": [
    {
      "chain_class": "model-only-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {}
    }
  ],
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 7,
      "priority": 100
    }
  ],
  "toolkits": null,
  "allowed_tools_list": null,
  "prompts": {
    "no_context": "default_no_context",
    "with_context": "default_with_context",
    "enhance_query": "default_enhance_query",
    "sql": "default_sql",
    "agent_tool": "default_agent_tool",
    "table_summary": "default_table_summary",
    "summary": "default_summary",
    "entity_extraction": "default_entity_extraction",
    "rewrite": "default_rewrite",
    "kg_triple_extraction": "default_kg_triple_extraction"
  },
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
  "labels": {},
  "k_value": 20,
  "token_buffer_size": 1.2,
  "temperature": 0,
  "top_p": 1,
  "stop": null,
  "seed": null,
  "logprobs": false
}
Failure Response
•	Status Code:
o	500: Internal Server Error. The server may be offline or experiencing issues.
o	403 or 404: Requested resource not found. The user may not have permission to access the resource.
o	422: Validation Error.
	loc:
	Description: This field indicates the location of the error within the request. It typically provides a path to the specific field or parameter that caused the validation to fail. This can be an array of strings representing the hierarchy of the JSON object where the error occurred.
	Example: If the error is related to the name field in the request body, loc might look like ["name"]. If it’s nested, it could be something like ["auth", "owners"].
	msg:
	Description: This field contains a human-readable message that describes the nature of the validation error. It provides context about why the validation failed, which can help the user understand what needs to be corrected in the request.
	Example: A message might be "Name must be lowercase and alphanumeric." or "Email format is invalid."
	type:
	Description: This field indicates the type of validation error that occurred. It can provide a categorization of the error, such as whether it was a type error, format error, or a required field error.
	Example: Possible values might include "value_error", "type_error", or "missing_field".
INTERACT WITH YOUR CHAT MODEL
Now that your simple chat model is deployed, you can query your model.
Step 5: Query your Model using the Cortex API
To query the model, you will use the Model | Ask endpoint:
1.	Open the Cortex API and log in.
2.	Navigate to GET/model/ask/{model} and click Try it out and Execute.
3.	Provide the following details:
o	model: name of the model you created - mydemo-1
o	q (query): ask a question - What is the color of grass?
4.	Execute the request, and you will see the response: "message": "Grass is typically green".
Note: This question derived a generic answer based on the source training and prompts of the model class you have chosen in your configuration setting. Thus, any questions relating specific internal organizational information e.g who is Eli Lilly MAY return as a “I cannot answer” error. To handle such specific related questions, you will need to add data into this model you have created. The steps to these are discussed in 2) How to: Create a RAG chat (model + doc) using Cortex APIs
Step 6: Query your Model using Chat In A Box
If you want to query your model from a user interface, you can use the Chat In A Box (CIAB) dashboard. You will need to link the model you created to Chat in A Box - CIAB with the following steps.
Step 7: Fetch Model Configuration (optional)
To fetch the configuration of the created AI model:
1.	Expand the Model | Config section.
2.	In the GET /model/exists/{model} Model exists section, add the model name and execute it. This will provide a true or false if the model exists.
Step 8: Delete the Chat Model (optional)
If you want to delete the created Simple Chat AI model:
1.	Expand the Model | Config section.
2.	In the DELETE /model/{model} Delete model section, add the model name and execute it.




How to: Create a Model and Document (RAG) Workflow using Cortex API.
Overview of RAG Chat System
Creating a Retrieval-Augmented Generation (RAG) chat system using the Cortex API involves integrating a document retrieval system with a generative model to provide contextually relevant responses based on user queries. So in previous guide we learnt how to create a chat assistant (model only) using cortex APIs. Now we will be add a sample document to our model and query it with some questions related to added document.
Components
•	Document Store: A database or storage system where documents are indexed and stored. This could be a vector database or a traditional database.
•	Retrieval Model: A model that retrieves relevant documents based on the user’s query. This could be a simple keyword search or a more complex semantic search using embeddings.
•	Embedding Model: The embedding model takes the data that is inbound and embeds it, chunk it and replaces the words with tokens, stores the tokens in the vector database, and then from that vector database we can do retrieval and send those tokens off to the LLM to do a better job inferencing to queries.
Workflow
•	User Input: The user submits a query or message.
•	Document Retrieval: The system uses the retrieval model to search the document store for relevant documents based on the input query.
•	Contextual Generation: The retrieved documents are then passed to the generative model along with the user’s query to generate a contextually relevant response.
•	Response Output: The generated response is sent back to the user.
Skip the reading and watch the demonstration! This demo video provides a step-by-step walkthrough of the process below. It serves as a visual guide to help you get started more quickly.
Pre-requisites:
To create a RAG chat model, ensure you successfully completed the model only guide and have access to the following resources:
1.	The embedded model list, which can be obtained from the Data API:
o	Expand the GET/data/embeddings/list in the Data API , click the Try it out button. The 200 request body will reveal the details of the different types of embeddings available to your model. Ensure you choose the embedding list name that is compatible to your model.
2.	The model class name, which can be obtained from the Model-New | LLMs API:
o	Open the Cortex API, find the Model-New | LLMs API, expand it, and click on Execute. The model class name will be in the JSON response.
Procedure
Step 1: Login
Log in to the Cortex API using your organizational credentials.
Step 2: Access Data-New API
Locate the Data API and expand it. You will find the following API services:
•	POST /data/ Set Data Config
•	POST /data/upload {name} Data Upload Handler
•	GET /data/list-files/{name} List Files
•	GET /data/embeddings/list List Embeddings
•	Step 3: Set up Data Config
To set your data config, expand the POST/data in the Data API , click the Try it out button. In the request body, you will find the default json documents for edits. To get the details of ALL the fields in the json request body, refer to Request Syntax
For this data Config, you do not need to specify values to ALL the fields in the request, you will only specify data specific attributes in the data config.
You will mame your data config, add email of the owner(s). Add S3 prefix (you can use the same prefix you had in the model config). Add a display name and a description of your data config. Add the same model version and class used in your model config. Choose either pinecone or elasticsearch for your vectorstore option. You will need an admin function to Set up the allowed model config. This is to specify the model configs that can access your data config. Note that you can add more than 1 AI assistants here as a list.
You will choose an embedding model that is compatible to your LLM. The embedding model is a critical part of your overall Cortex configuration. Here is a link to the list of LLMs and compatible embedding models.
Here is a sample request with values to some basic fields:
   {
  "name": "mydemo-1",
  "auth": {
    "owners": ["testuser@lilly.com"],
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
  "s3_prefix_data": "data/mydemo-1/docs",
  "exclude_filter": [],
  "assume_role": "",
  "displayName": "mydemo-1",
  "data_config_description": "We are uploading a sample data to our chat model.",
  "embedding": {
    "model": "text-embedding-3-small",
    "open_api_type": "azure"
  },
  "model_version": {
    "model_class": "lilly-openai",
    "model_iteration": "7"
  },
  "vectorstore": "pinecone",
  "concepts_of_interest": [],
  "augmentable_metadata": [],
  "allowed_model_configs": ["mydemo-1"],
  "chunk_size": 1500,
  "chunk_overlap": 300,
  "index_name": "",
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
  }
}
Step 4: Execute the Request
Once the modification is done, click on execute. This will send the request to the server to upload data to the chat model. You can see the response section confirming that the data ahs been uploaded to our chat model.
{
   "messege":"success"
}
Step 5: Get your data config details
Now our Data config has been deployed, to check the data config details, navigate to GET /data/{name} provide the name of your data config (e.g., mydemo-1) and click Execute.
A 200 success response reflects the json response body with your newly created data config details showing that the data configuration is successful. We can move to the next step to upload data file to our model.
Step 6: Add data to your config
To add data, navigate to POST /data/upload/{name} (Data Upload Handler) and click on the try it out and provide below details on the input values.
name:mydemo-1
file:Upload the pdf file
click on Execute .
A 200 success response body will show that your upload is queued and you can see a job-ID for this queue. This job ID can be used in the GET/models/job-status to check the status of the job- when it’s queued, running, complete or done.
Step 7: Checkout the data in the config
To verify if your data is uploaded or not you navigate to GET /data/list-files/{name} (List Files) and provide below details on the input values.
name:mydemo-1
start_page:1
end_page:2
Click on execute
A 200 response body will show the file name and size of the file you uploaded.
Step 8: Link your model and data config
Navigate to GET /model/{model} API and copy the model config you created and update that into the data config through the APIs. Paste this into the response body of the POST /model/ Set Config. Add the data config model name in the data section of your model config. Note that, you can list multiple data configs here
   "data": [],
add the data config model name here and re-execute it.
   "data": ["mydemo-1"],
A 200 response body will show your model config is linked to your data config.
Step 9: Chat with your model through CIAB
Now we are done with the configuration and it’s time to query our’mydemo-1 chat model. Go to Chat in A Box - CIAB. and ask a question that is specific to the uploaded data content.
Now you will get a custom response that is robust and refined.
Cortex has used the data that you had put in that data config of that file to do a RAG pipeline, It retrieved relevant information out of your document, send it to the LLM for a refined response.





1.	Cortex Platform
2.	How To
3.	Agents and Tools
4.	Create an Agent Tool
Creating an Agent Tool for the Cortex Platform
Please follow the Github repo for agent template for most up to date instructions: https://github.com/EliLillyCo/cortex-agent-template
This guide gets updated as much as possible, but will occasionally have some lag time behind repo.
To create an Agent Tool for Cortex you will need to follow the following steps:
1.	Create a new repository, refer to Backstage Accelerator to get either a Go or Python server template
2.	Using Proto file in template to generate all necessary files
3.	Create a gRPC server
4.	Develop the functionality of the tool
5.	Deploy the tool to CATS
6.	Configure the tool in Cortex
7.	Test the tool in Cortex
8.	Add the tool to a Model Config
Create a new project
To create a new project you need to create a GitHub repository and setup the project with a gRPC language of your choice. This project is written in Go, but you can use any language that supports gRPC. To use either Go or Python template, navigate to Backstage Accelerators and select the desired cortex accelerator.
•	Navigate through the prompts to generate your new repository
Create a new proto file
You will need to create a new proto file that will define the service that Cortex will use to communicate with the tool. This is important because this is the contract between Cortex and the tool. This is how Cortex will know how to communicate with the tool. If you have cloned template from Backstage, proto file is generated for you.
This section of the proto file is critical that it is identical. This is the contract between Cortex and the tool to work properly. Current proto version is toolv2. To check the latest version, check the proto file in the template repo
syntax = "proto3";
import "google/protobuf/struct.proto";
package toolv2;

// Service containing all tools within our toolkit, and methods to interact with them.
service Toolkit {
    /*
    Sends list of all tools with names and descriptions

    This function must be implemented by the GRPC tool server.  It should not do any significant
    processing as this is called for each toolkit provider associated with a model when a query
    is executed.  Expectation is this function should execute in <100ms
    */
    rpc DescribeTools(DescribeRequest) returns (ToolList);

    /* 
    Executes a requested tool by name and params, and responds.

    This function must be implemented by the GRPC tool server.  It can perform any computation needed
    to translate the tool request to a tool response.

    Expectation is this function should execute in <1min
    */
    rpc ExecuteTool(ToolRequestV2) returns (ToolResponseV2);
}

// Message sent to tool provider to list what tools are available to the given user
message DescribeRequest {
    /* 
    Toolkit config in Cortex that is associated with the request from Cortex.
    IMPORTANT: if you wish to restrict access, your tool server should check the provided source toolkit & verify
    the source toolkit calling is expected to call.  If this tool server can be used by any config in Cortex, this param can be ignored.
    */
    string source_toolkit = 1;
    
    // The authenticated user that is making the request
    Auth auth = 2;
}

// Message response from tool provider containing a list of tools served by this provider for the given toolkit/user
message ToolList {
    
    // List of tools
    repeated AgentTool tools = 1;
}

// Definition of a single action which can be taken by the LLM agent
message AgentTool {
    
    // Name of the tool.  This is used by LLM to identify the tool.
    string name = 1;
    
    // Prompt Description which is used by the LLM to decide which tool(s) to call for a given question
    string description = 2;
    
    // Flag to end LLM decision loop & immediately return results to the user.
    bool direct_return = 3;
    
    // Human description of what this tool does (not used by the LLM)
    optional string short_description = 4;
    
    // JSON schema describing the input to this tool (see https://json-schema.org/docs)
    optional string json_input_schema = 5;

    // Optional prompt which if specified is used as additional instructions to LLM to format
    // inputs to the tool input.
    optional string input_transformation_prompt = 6;
    
    // JSON schema describing the output returned by this tool (see https://json-schema.org/docs)
    optional string json_output_schema = 7;
    
    // Free field of labels which can be applied to this tool & used for discovery/classification of tools.
    map<string,string> labels = 8;
}

// Call to execute a given agent tool with specified parameters
message ToolRequestV2 {
    
    // Name of the tool as defined in AgentTool spec above
    string name = 1;
    
    // Input blob, if JSON input schema is defined, this will be a JSON object matching the schema specified
    string input = 2;

    // User context values (for backward compatibility, this will be deprecated)
    map<string, google.protobuf.Value> user_context = 3;
    
    /* 
    Toolkit config in Cortex that is associated with the request from Cortex.
    IMPORTANT: if you wish to restrict access, your tool server should check the provided source toolkit & verify
    the source toolkit calling is expected to call.  If this tool server can be used by any config in Cortex, this param can be ignored.
    */
    optional string source_toolkit = 4;
    
    // The authenticated user that is making the request
    Auth auth = 5;

    /* 
    Attached data not included in the main input (use for large data multi model file inputs)
    */
    repeated Attachment attachments = 6;
}

// Metadata describing the authenticated user & providing downstream authentication tokens, passed from Cortex
message Auth {
    
    // User UPN as returned by the authentication source (can be Azure user UPN, AWS Role, Azure client ID, etc.)
    string user_upn = 1;
    
    // Set of name & entra id access tokens for downstream systems.  The names & token values provided here are defined in the Toolkit config in Cortex when registering the tool provider.
    map<string, string> access_tokens = 2;
    
    // User context values (for backward compatibility)
    map<string, google.protobuf.Value> user_context = 3;
}

// Response from the agent tool
message ToolResponseV2 {
    
    // Output returned by the agent tool, if JSON output schema is defined in the AgentTool definition, this must be a JSON object matching the schema specified
    string output = 1;
    
    // Additional action commands to be sent back to the LLM decision engine in Cortex
    repeated Command commands = 2;
    
    /* 
    Attached data not included in the main output spec (use for large data responses)
    */
    repeated Attachment attachments = 3;
}

// Additional large file output associated with a tool response.
message Attachment {
    
    // File name for the attachment
    string name = 1;
    
    // Link (e.g. can be presigned S3 URL or other link where data can be fetched with a GET request to the provided URL)
    string link = 2;

    // Metadata about the file.  This is provided to the LLM as a prompt to describe the contents of the file, how it can be used, etc.
    string description = 3;
}

// FUTURE (not currently implemented): A instruction returned to the LLM decision engine
message Command {
    
    // Instruction name
    string command = 1;
    
    // Instruction value
    string data = 2;
}
The DescribeTools method will return a list of all available tools with their names and descriptions.
The ExecuteTool method will take a ToolRequest object with the name of the tool and the parameters to be passed to the tool. The method will return a ToolResponse object with the result of the tool.
Describe Tool is important
The Describe Tool is important because it is the first thing that Cortex will call when the tool is registered. This will allow Cortex to know what tools are available and what they do. This allows the LLM to read what tools are available and what they do. The LLM will make a decision based on the tools description which tool to use if there are multiple tools defined for a single Model Config in Cortex.
Getting Started
1.	Run make setup
o	This command will install necessary dev tooling (linters, formatters, pre-commit hooks, etc.)
o	This command will also generate a new virtual environment and install all app dependencies. Once complete, run source .venv/bin/activate to activate your new python environment
2.	Replace all instances of cortex_tool_template, cortex-tool-template, etc. with the desired name of your repo
3.	Run make proto to generated the required python files from the proto definitions
4.	Test the tool
o	This template includes a test client located in testing/client.py. Run both the server.py file to start the tool locally, and run the testing/client.py file to call the tool locally and test its execution.
o	If the test is successful, congratulations! You have successfully completed setup of your new tool and you are free to modify your new tool!
NOTE: There are additional helpful commands available in the Makefile for setup, build, cloud services, etc. Be sure to check it out if relevant to your use case
Create a gRPC server
First, ensure appropriate branches are set up on the target repo
•	eg. develop, main, etc.
Next, follow these steps to set up the server on the CATS DEV cluster (similar steps apply for the PROD cluster):
1.	Follow the CATS pre-requisites to set up the repo
o	https://cats.lilly.com/guide/Prerequisites
2.	Run CI/CD pipeline and grab sha from the build step:
o	copy the sha into the initialSha value of the appropriate helm values file. This will establish a base image for CATS deployments
Set up CATS infrastructure
1.	Make sure you have appropriate access and permissions:
o	https://dev.lilly.com/docs/platforms-and-tools/cats/
2.	Update the template output dir in the gitignore with your repo name
3.	Modify your namespace YAML to add an sg-rule allowing ingress from the llm-dev namespace on your exposed port. Refer to SG Rule Docs for details.
4.	"ingress_rules" : [{
5.	 "namespace_allow_from": "llm-dev",
6.	 "port": 50051
7.	}]
8.	Run make templates or make templates env=<env>
o	this command will use helm to output the appropriate kubernetes manifest files in the helm/<REPO_NAME>
o	it will use the dev config by default
9.	Open a PR in the CATS Infra Repo
o	Dev Cluster
o	Prod Cluster
o	Create a new folder in the appropriate projects/<env> folder (dev, qa, prd)
o	Copy the output files from the repo into the new folder in the CATS repo
10.	(Optional) Test to check the deployment is set up correctly by running a curl command from llm-dev (or llm-prod depending on environment) to your server. If set up correctly, the response should indicate the connection is not allowed due to GRPC not supporting curl. If not, curl will hang.
11.	curl http://[service-name].[namespace-name].svc.cluster.local:50051
NOTE! Regular team might not have access to namespace pod to run this command. If your server fails, then you can request Cortex support to assist with this step.
With this configuration, flux will trigger automatic updates whenever a new image is pushed from CI/CD.
Deploy Server to CATS
To deploy this tool you will need to setup a deployment in the CATS environment.
All the Kubernetes manifest files are created for you if using template above. If you want to create your own, some examples can be found below
•	service.yaml Make sure that the service is running on the same port that is defined in the namespace configuration. It is not recommended to have port switching between the port and targetPort in the service configuration. This can run into issues with the communication between Cortex and the tool running in the CATS environment.
apiVersion: v1
kind: Service
metadata:
  name: cortex-webscraper
  namespace: cortex-webscraper-dev
spec:
  ports:
  - port: 5000
    targetPort: 5000
    protocol: TCP
  selector:
    app.kubernetes.io/name: cortex-webscraper
•	ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: arxiv-agent
  namespace: lrl-md3-arxiv-agent-dev
spec:
  rules:
    - host: arxiv-agent.apps-d.lrl.lilly.com
      http:
        paths:
          - path: "/"
            pathType: Prefix
            backend:
              service:
                name: arxiv-agent
                port:
                  number: 9999
Configure Tool in Cortex
To use the tool in Cortex you will need to use their API’s to create a new tool. You will need to provide all the necessary information for the tool to be properly registered in Cortex. For more information on the latest schema required to create a new tool.
https://cortex.lilly.com/docs#/Toolkit/set_tool_config_toolkits_put for more information on the latest schema required to create a new tool.
For example this is the json config for the webscraper tool:
{
  "allowed_model_configs": [
    "webscraper-dev"
  ],
  "auth": {
    "owners": [
      "johnson_christopher_colton@lilly.com"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": false
  },
  "description": "Cortex Web Scraper to return HTML of a given URL",
  "name": "cortex-web-scraper",
  "displayName": "Cortex Web Scraper",
  "server": "cortex-webscraper.cortex-webscraper-dev.svc.cluster.local:5000",
  "agent_tool_max_iterations": 7
}
There are a few important sections in the config that you will need to pay attention to:
allowed_model_configs: This is a list of all the model configs that the tool is allowed to be used with. This is important because the tool will only be available to be used with the model configs defined in this list if it is a private tool. There is a bug currently for public tools that also requires this list to be defined, but in the future this will be fixed.
private: This is a boolean value that will determine if the tool is private or public. If the tool is private then the tool will only be available to the model configs defined in the allowed_model_configs list. If the tool is public then the tool will be available to all model configs to use.
server: This is the address of the tool that Cortex will use to communicate with the tool. This should be the address of the service that you deployed in the CATS environment.
Testing that the Tool is Working
To verify that the tool is working in Cortex properly you can use the following API endpoints replacing the ToolName with the name of the tool you defined in the config:
https://cortex.lilly.com/toolkits/${ToolName}
https://cortex.lilly.com/toolkits/${ToolName}/describe
https://cortex.lilly.com/toolkits/${ToolName}/execute
This will allow you to verify that the tool is working properly in Cortex. You should see successful responses from the API endpoints if the tool is working properly. You can also view the logs of the tool in the CATS environment to see if there are any errors that are occurring.
Using the Tool with a Model Config To use the tool with a model config you will need to add the tool to the model config.
There are a few important sections in the config that you will need to set in order to use the tool with the model config:
{
  "chain": [
    {
      "chain_class": "tool-chain",
      "model_iteration": 1,
      "order": 1
    }
  ],
  "toolkits": [
    "${ToolName}"
  ]
}
chain: This is a list of all the chains that will be executed for the model config. This is important because this is the order that the chains will be executed in. The chain_class should be set to tool-chain to indicate that this is a tool chain.
toolkits: This is a list of all the tools that will be executed in the chain. This is important because this is the list of tools that will be executed in the chain. The tool should be defined in the list as the name of the tool that you defined in the config.


Creating a Chatbot with a Single Agent
Large Language Models(LLM) have shown great capacity in reasoning about tasks. Given a complex task, an LLM can reason about it and propose a plan to accomplish the task; it will then execute the steps in the plan.
Agents allow the LLM to execute those steps via function calling: the agent sends the query or function parameters to a function that has been provided for it and will retrieve the response that was generated by the function and pass it to LLM as text. In this document, we’ll go through the steps needed for creating a chatbot that utilizes a single agent.
TABLE OF CONTENTS
•	Cortex landscape: models, agents, and tools
•	How can I create my own chatbot agentic workflow?
o	1. Tool Server creation
o	2. Tool Server Deployment
o	3. Tool Server Configuration on Cortex
o	4. Model Configuration on Cortex
________________________________________
Cortex landscape: models, agents, and tools
Cortex enables the use of various LLMs (OpenAI or Google Gemini), alongside their associated attributes such as authorization, chains, users, etc. Each model can be configured to use a specific chain to do its task, and each chain can have its own prompt that guides the LLM. Here, we are focusing on the tool-chain.
The toolchain is used when the user wants to create a chatbot that uses a single-agent. The tool chain allows the agent to query tools, or regular functions that an agent uses to accomplish tasks, it has access to and them handles the execution of the tools. As a reminder, tools can execute native code or call APIs to accomplish their task by receiving information from a query and processing to accomplish their task.
Now that you know all about agents and tools, lets get to building!
 
________________________________________
How can I create my own chatbot agentic workflow?
To create your own chatbot that utilizes agents, you’ll need to perform the following steps:
1.	Create a Tool Server that hosts your tools
2.	Deploy the tool server on CATS
3.	Create/config a toolkit on Cortex
4.	Create a model on Cortex that uses the tool-chain and the toolkit created before
________________________________________
1. Tool Server creation
Cortex utilizes a gRPC tool server that hosts the tools. The template for the tool server can be found here.
This template needs minimum modifications to implement your own tools. First, you’ll need to define your own tools and then, make those tools available on your server.
1.	Defining your own tools:
o	You can implement your business logic inside the execute function. This function must return a CustomResponse object.
2.	Making tools available on your server:
o	Once your tools are defined, you can add them to the tool_list found under server.py file in the template:

if name == "main":
    # Decide what tools to host here:
    tool_list: List[tool_interface.ToolService] = [
        EchoTool(),
        GreetingTool(),
        MathTool()
        ]

Tools have a specific format. You’ll need to name the tool and provide a description for the tool, the LLM uses the description to know about the tools it has access to, as well as when it tries to pick a tool to carry out a task. You can define your tools in any tool that you like. Here’s an example of a tool, which echos back what the user says:

lass EchoTool(ToolService):
  name = "Echo"
  description = "Echos what a client says back to them."
  direct_return = False
  
  def execute(self, params: str, auth_token=None) -> CustomResponse:
  
    return CustomResponse(result=f"You said: {params}", status="success", type="text")

2. Tool Server Deployment
Now that your tool server code is ready, you should deploy it on CATS. * Create a deployment file to define the specs of your deployment * Define the name space and ports your tool server is listening to
The general CATS guide is [available here] (https://cats.lilly.com/guide/)
3. Tool Server Configuration on Cortex
Next, introduce your tool server, as a toolkit, to Cortex. You need to use the /toolkits endpoint to put your toolkit config on Cortex.
Here’s the toolkit template:
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
  "agent_tool_max_iterations": 7
}
The most important parts of a toolkit config are: allowed_model_configs and server; the former defines which Cortex models are allowed to use your toolkit, and the latter provides the address of the tool server you deployed on CATS. You don’t need to have a Cortex model created to name it in the allowed_model_configs; you can name it here first, and create it in the next step.
If you intend to make your toolkit to be accessible to any model, you can leave the allowed_model_configs to be empty and set the private field to false. You can also specify auth parameters in your toolkit config
To test that Cortex can communicate with your toolkit, you can use describe and execute endpoints. Describe endpoint describes all the tools you have available on your tool server:
 
Execute endpoint is used for directly executing a tool by providing its input:
 
4. Model Configuration on Cortex
This is the final step of the process. You’ll need to create a Cortex model that binds together all the pieces we have discussed: LLM class, tool chain, and tool server. The (/manage/config endpoint)[https://chat.lilly.com/docs#/Config/setconfig_manage_config_post] can be used to post a config. Here are the main fields that need to be specified in the config:
"name": "chem-agents",
"chain": [
    {
      "chain_class": "tool-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {}
    }
  ],
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 6,
      "priority": 100
    }
  ],
  "toolkits": [
    "test-toolkit"
  ]
Name is the model name you used when setting up a private toolkit in the previous step. You can keep the chain as is; model_version can be one of the various models that support function calling and are available on Cortex, and the toolkit is the toolkit you created earlier.
Once your model is configured, you can start using it like any other chatbot:
 
Under tools, you’ll see the LLM’s thought process:
 
Here it’s showing that it needs two tools to perform its task: 1- Get the SMILES of caffeine 2- Use the SMILES to calculate its weight. You can use the drop down next to each tool to see the value it has calculated, which will be passed to the next tool:
 
The model stops once a final answer is generated:
 
________________________________________
S


1.	Cortex Platform
2.	How To
3.	Agents and Tools
4.	Multiagent w/ Swarm
Cortex Swarm Multiagent
DEPRECATED: The multi-agent-collaboration-chain approach described in this document is deprecated and may be removed in the future. Please use the new Cortex Agentic V2 Framework with agent-chain for creating multi-agent systems. This documentation is maintained for reference only.
An Agent is a common type of GenAI workflow where an LLM is allowed to dictate and execute tasks to answer a query; these tasks can range from native function execution to calling other RAG workflows.
There are various ways of creating agent. In a previous guide, we discussed creating a single agent on Cortex. This single agent architecture uses one LLM to orchestrate the use of tools.
Here, we will focus on OpenAI Swarm, which is an experimental framework from OpenAI that allows the creation of multiagent systems. In this multi-agent system, a supervisor agent is in charge of managing/orchestrating other agents. Each worker agent has a set of tools that it can use to accomplish its task and each will need its own special prompt. Please be aware that Swarm framework is experimental and as per the Swarm repo, “It is not intended to be used in production, and therefore has no official support.”
TABLE OF CONTENTS
•	Multiagent Overview
•	How can I create my own agentic workflow?
o	4. Creating a Cortex Model
________________________________________
Multiagent Overview
In a multiagent system, multiple agents collaborate towards a goal. This is different from a single agent framework where one agent uses the tools at its disposal to accomplish a task. It is recommended to start with single agent systems and only expand to multiagent when the number of tools becomes too much for a single agent to handle properly. The introduction of multiple agents adds more complexity to prompting the whole system and the task handoff between agents.
As stated earlier, each agent will have its own tools and its own prompt. Prompting is very important in a multiagent system, as each agent not only needs to be prompted correctly to perform its own task, but also needs to know about the capabilities of other agents so that they can all communicate well together. Since the supervisor agent orchestrates the workers, it needs to know about the abilities of all other agents.
 
________________________________________
How can I create my own agentic workflow?
To create a multiagent chatbot on Cortex, you will need to follow these steps:
1.	Create a Tool Server that hosts your tools
2.	Deploy the tool server on CATS
3.	Create/config a toolkit on Cortex
4.	Create a model on Cortex that uses the multi-agent-collaboration-chain and the toolkit created before
Steps 1-3 are the same as the single agent guide that can be found here.
________________________________________
4. Creating a Cortex Model
The /manage/config endpoint can be used to post a config. Here are the main fields that need to be specified in the model config:
•	Name: name of the chatbot
•	chain: There are two important fields here:
o	chain_class: Specifies which Cortex chain to be used by the chatbot. Choosing multi-agent-collaboration-chain chain class instructs Cortex to use Swarm multi agent framework to answer user queries.
o	chain_params: Used to set up the supervisor and workers
o	Important: a more detailed guide about the chain_params field is provided later on in this guide.
•	model_versions: Specifies the model that is used with Swarm. The LLM model that is selected in the model config, needs to be compatible with Swarm.
•	toolkits: the toolkit that was set up to host the tools.
{
  "name": "kernellilly-red",
  "chain": [
    {
      "chain_class": "multi-agent-collaboration-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
                      "supervisor": {"prompt": "You are a supervisor agent that has access to a worker agent. Your worker agent can take SMILES string as input and returns the molecular weight of the molecule, returns its compound profile/physico-chemical properties, such as molecular weight (MW), number of heavy atoms. Finds near neighbors or similar molecules to a given SMILES string. Return the SMILES string of LSN IDS, molecule names or ChEMBL IDs.\n\nPass the user query to the worker and work with it to find an answer."}, 
                      "agents_config": 
                        {
                          "worker agent 1": {"tools":["SMILES2Weight", "CompoundProfile", "StructureResolver"], "prompt": "\n\nYou are an expert AI drug hunter with extensive knowledge of chemistry, biology, and pharmacology. Your task is to solve the problem to the best of your ability using the provided tools.\n \nAlways generate a thorough step-by-step plan before executing any action.\nUse the most specific tool available for each action.\n\nAnswer the question below using the following tools: {tool_strings}\n\n \nUse the tools provided, applying the most specific tool available for each action.\nYour final answer should contain all information necessary to answer the question and subquestions.\n \nKey guidelines:\n1. Use ResearchDataLakeStructure for LSNs.\n2. Use StructureResolver for common names or molecule SMILES.\n3. ALWAYS return a markdown table if near neighbors or similar molecules, compound properties or profiles are requested.\n!!!IMPORTANT!!!\nIf you need to pass a SMILES string to a tool, never guess the SMILES string. You MUST ALWAYS retrieve them using StructureResolver or ResearchDataLakeStructure. Even if SMILES have been calculated in a previous step, re-use StructureResolver or ResearchDataLakeStructure to retrieve the SMILES.\n Use the following tools to answer user queries: {tool_names}"} 
                        }
                      }
    }
  ],
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 6,
      "priority": 100
    }
  ],
  "toolkits": [
    "testing-toolkit2"
  ]
}
How to specify agent architectures in chain_params?
The chain_params field in the chain parameter of the model config is used to add tools into different agents. This field has two keys that need to be provided:
1.	supervisor: this holds a JSON of the prompt that is used for the supervisor.
a. Here’s an example we used from a multi-agentic workflow application, Kernal Lilly:
"supervisor" {"prompt": "You are a supervisor agent that has access to a worker agent. Your worker agent can take SMILES string as input and returns the molecular weight of the molecule, returns its compound profile/physico-chemical properties, such as molecular weight (MW), number of heavy atoms. Finds near neighbors or similar molecules to a given SMILES string. Return the SMILES string of LSN IDS, molecule names or ChEMBL IDs.\n\nPass the user query to the worker and work with it to find an answer."}
1.	agents_config: this key holds the information that is used by Cortex to set up the worker agents; the information includes:
a. The name of the worker agent as key b. and the value associated with that key is a JSON that contains the prompt and tools associated with the agent. It is important the names of the tools match the names you have defined in your toolserver and have exposed to Cortex. Here we have defined one worker with 5 tools:
"agents_config": {
"worker agent 1": {"tools":["SMILES2Weight", "CompoundProfile", "StructureResolver"], "prompt": "\n\nYou are an expert AI drug hunter with extensive knowledge of chemistry, biology, and pharmacology. Your task is to solve the problem to the best of your ability using the provided tools.\n \nAlways generate a thorough step-by-step plan before executing any action.\nUse the most specific tool available for each action.\n\nAnswer the question below using the following tools: {tool_strings}\n\n \nUse the tools provided, applying the most specific tool available for each action.\nYour final answer should contain all information necessary to answer the question and subquestions.\n \nKey guidelines:\n1. Use ResearchDataLakeStructure for LSNs.\n2. Use StructureResolver for common names or molecule SMILES.\n3. ALWAYS return a markdown table if near neighbors or similar molecules, compound properties or profiles are requested.\n!!!IMPORTANT!!!\nIf you need to pass a SMILES string to a tool, never guess the SMILES string. You MUST ALWAYS retrieve them using StructureResolver or ResearchDataLakeStructure. Even if SMILES have been calculated in a previous step, re-use StructureResolver or ResearchDataLakeStructure to retrieve the SMILES.\n Use the following tools to answer user queries: {tool_names}"} 
          }
d. In the agent prompt, there are two place holders: {tool_strings} and {tool_names} tool_strings is used to dynamically add tool descriptions from your toolserver into agent prompt. tool_names adds the name of your tools into the prompt.
After configuring the model, we can use it like any other chatbot:
 
1.	Cortex Platform
2.	How To
3.	Agents and Tools
4.	Multiagent w/ LangGraph
Cortex LangGraph Multiagent
DEPRECATED: The supervisor-agent-chain approach described in this document is deprecated and may be removed in the future. Please use the new Cortex Agentic V2 Framework with agent-chain for creating multi-agent systems. This documentation is maintained for reference only.
An Agent is a common type of GenAI workflow where an LLM is allowed to dictate and execute tasks to answer a query; these tasks can range from native function execution to calling other RAG workflows.
There are various ways of creating agent. We previously discussed how to create single agent and swarm multiagents, here, we will focus on creating a multiagent system using LangGraph
TABLE OF CONTENTS
•	Multiagent Overview
•	How can I create my own agentic workflow?
o	4. Creating a Cortex Model
________________________________________
Multiagent Overview
In a multiagent system, multiple agents collaborate towards a goal. This is different from a single agent framework where one agent uses the tools at its disposal to accomplish a task. It is recommended to start with single agent systems and only expand to multiagent when the number of tools becomes too much for a single agent to handle properly. The introduction of multiple agents adds more complexity to prompting the whole system and the task handoff between agents.
As stated earlier, each agent will have its own tools and its own prompt. Prompting is very important in a multiagent system, as each agent not only needs to be prompted correctly to perform its own task, but might also need to know about the capabilities of other agents so that they can all communicate well together. Since the supervisor agent orchestrates the workers, it needs to know about the abilities of its workers.
 
________________________________________
How can I create my own agentic workflow?
To create a multiagent chatbot on Cortex, you will need to follow these steps:
1.	Create a Tool Server that hosts your tools
2.	Deploy the tool server on CATS
3.	Create/config a toolkit on Cortex
4.	Create a model on Cortex that uses the supervisor-agent-chain and the toolkit created before
Steps 1-3 are the same as the single agent guide that can be found here.
________________________________________
4. Creating a Cortex Model
The /manage/config endpoint can be used to post a config. Here are the main fields that need to be specified in the model config:
•	Name: name of the chatbot
•	chain: There are two important fields here:
o	chain_class: Specifies which Cortex chain to be used by the chatbot. Choosing supervisor-agent-chain chain class instructs Cortex to use LangGraph multi agent framework to answer user queries.
o	chain_params: Used to set up supervisor and its workers
o	Important: a more detailed guide about the chain_params field is provided later on in this guide.
•	model_versions: Specifies the model that is used by agents in the workflow.
•	toolkits: the toolkit that was set up to host the tools.
{
  "chain": [
    {
      "chain_class": "supervisor-agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "recursion_limit": 10,
        "supervisor": {
          "prompt": "You are a high-level supervisor in a pharmaceutical research environment. You have access to two specialized worker agents: a databases-agent and a scientist-agent. Your role is to understand user queries, determine which agents are best suited to handle the task, and coordinate their efforts to accomplish the goal. Always provide a brief plan before delegating tasks to the workers.\n\nThe scientist agent has the following tools:\n1. SMILES2Weight: Calculates the molecular weight of a compound from its SMILES string.\n2. CompoundProfile: Provides physico-chemical properties of compounds from their SMILES strings.\n\nThe database-agent has the following tools:\n1. ResearchDataLakeStructure: Resolves an LSN id to its SMILES string.\n2. StructureResolver: Resolves a molecule name or ChEMBL ID to its SMILES string. It cannot use LSN ids."
        },
        "agents_config": {
          "scientist-agent": {
            "prompt": "\n\nYou are an expert AI drug hunter with extensive knowledge of chemistry, biology, and pharmacology. Your task is to solve the problem to the best of your ability using the provided tools.\n \nAlways generate a thorough step-by-step plan before executing any action.\nUse the most specific tool available for each action.\n\nAnswer the question below using the following tools: {tool_strings}\n\n \nUse the tools provided, applying the most specific tool available for each action.\nYour final answer should contain all information necessary to answer the question and subquestions.\n\n!!!IMPORTANT!!!\nIf you need to pass a SMILES string to a tool, never guess the SMILES string. You MUST ALWAYS retrieve them by asking supervisor to use databases-agent. \n Use the following tools to answer user queries: {tool_names}",
            "tools": [
              "SMILES2Weight",
              "CompoundProfile"
            ]
          },
          "database-agent": {
            "prompt": "\n\nYou are an expert AI drug hunter with extensive knowledge of chemistry, biology, and pharmacology. Your task is to retrieve SMILES strings using your tools.\n\nAlways generate a thorough step-by-step plan before executing any action.\n\nAnswer the question below using the following tools: {tool_strings}\n\nUse the tools provided, applying the most specific tool available for each action.\n Use the following tools to answer user queries: {tool_names}",
            "tools": [
              "StructureResolver",
              "ResearchDataLakeStructure"
            ]
          }
        }
      }
    }
  ],
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 7,
      "priority": 100
    }
  ],
  "toolkits": [
    "chem-agents"
  ]
}
How to specify agent architectures in chain_params?
The chain_params field in the chain parameter of the model config is used to add tools into different agents. This field has three keys that need to be provided:
1.	recursion_limit: “Recursion limit sets the maximum number of super-steps the graph can execute during a single execution. Once the limit is reached, LangGraph will raise GraphRecursionError.
2.	supervisor: A JSON that contains supervisor prompt. a. Here’s an example we used from a multi-agentic workflow application, Kernel Lilly: "supervisor": {"You are a high-level supervisor in a pharmaceutical research environment. You have access to two specialized worker agents: a databases-agent and a scientist-agent. Your role is to understand user queries, determine which agents are best suited to handle the task, and coordinate their efforts to accomplish the goal. Always provide a brief plan before delegating tasks to the workers.\n\nThe scientist agent has the following tools:\n1. SMILES2Weight: Calculates the molecular weight of a compound from its SMILES string.\n2. CompoundProfile: Provides physico-chemical properties of compounds from their SMILES strings.\n\nThe database-agent has the following tools:\n1. ResearchDataLakeStructure: Resolves an LSN id to its SMILES string.\n2. StructureResolver: Resolves a molecule name or ChEMBL ID to its SMILES string. It cannot use LSN ids."}
3.	agents_config: this key holds the information that is used by Cortex to set up the worker agents; the information includes: a. The name of the worker agent as key b. The value associated with that key is a JSON that contains the prompt and tools associated with the agent. It is important the names of the tools match the names you have defined in your toolserver and have exposed to Cortex. Here we have defined one worker with 5 tools:
"agents_config": {
            "scientist-agent": {
              "prompt": "\n\nYou are an expert AI drug hunter with extensive knowledge of chemistry, biology, and pharmacology. Your task is to solve the problem to the best of your ability using the provided tools.\n \nAlways generate a thorough step-by-step plan before executing any action.\nUse the most specific tool available for each action.\n\nAnswer the question below using the following tools: {tool_strings}\n\n \nUse the tools provided, applying the most specific tool available for each action.\nYour final answer should contain all information necessary to answer the question and subquestions.\n\n!!!IMPORTANT!!!\nIf you need to pass a SMILES string to a tool, never guess the SMILES string. You MUST ALWAYS retrieve them by asking supervisor to use databases-agent. \n Use the following tools to answer user queries: {tool_names}",
              "tools": [
                "SMILES2Weight", "CompoundProfile" 
              ]
            },
            "database-agent": {
              "prompt": "\n\nYou are an expert AI drug hunter with extensive knowledge of chemistry, biology, and pharmacology. Your task is to retrieve SMILES strings using your tools.\n\nAlways generate a thorough step-by-step plan before executing any action.\n\nAnswer the question below using the following tools: {tool_strings}\n\nUse the tools provided, applying the most specific tool available for each action.\n Use the following tools to answer user queries: {tool_names}",
              "tools": [
                "StructureResolver", "ResearchDataLakeStructure"
              ]
            }
          }
d. In the agent prompt, there are two place holders: {tool_strings} and {tool_names} tool_strings is used to dynamically add tool descriptions from your toolserver into agent prompt. tool_names adds the name of your tools into the prompt.
After configuring the model, we can use it like any other chatbot:
 
Here’s another example where the supervisor uses two agents to answer user query:
 
1.	Cortex Platform
2.	How To
3.	Agents and Tools
4.	WebScraper Tool
Integrating WebScraper into your Model
To integrate the WebScraper tool into your model, follow these steps:
1.	Update Model Configuration (if applicable): If your model configuration does not currently utilize the tool-chain, update it accordingly.
o	Utilize the Update Model endpoint to modify your model configuration.
o	Enable Tool Execution: To utilize any tool in Cortex, ensure that the tool-chain is enabled in your model configuration. The tool-chain facilitates the execution of tools defined in the model configuration.
{
  "chain": [
    {
      "chain_class": "tool-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {}
    }
  ],
1.	Add the WebScraper tool to your model configuration.
  "toolkits": [
    "cortex-web-scraper"
  ]
}
After the model configuration has been updated, you can now access the WebScraper tool.
WebScraper Tool Usage: To utilize the WebScraper tool, prompt the LLM to execute it with a URL as input.
WebScraper Tool Functionality
The WebScraper tool accepts a URL as input and returns the HTML content of the webpage to the LLM. The LLM then processes the HTML content as required.
Potential Use Cases: The WebScraper tool can be utilized for various tasks, such as summarizing webpage content, extracting specific information, or performing other operations that require HTML content.
URL Scraping Restrictions: The WebScraper tool operates within a set of permitted URLs. A central deny list of websites is maintained to prevent unauthorized scraping.
Robots.txt Considerations: If a website has a robots.txt file defined, the tool reads it to determine if the user agent is authorized to scrape the website.
When prompting the LLM to utilize the WebScraper tool, ensure that you provide a URL. Additionally, incorporate terms such as “scrape” or “scraping” within the prompt to explicitly indicate the intended usage of the WebScraper tool.



1.	Cortex Platform
2.	How To
3.	Agents and Tools
4.	Implementing Human in the Loop for Agent Tools
Implementing Human in the Loop for Agent Tools
This guide explains how to implement Human in the Loop (HITL) functionality in your Cortex agent tools using MCP (Model Context Protocol) servers, allowing agents to pause execution and request structured input from users before proceeding.
Overview
Human in the Loop enables agent tools to pause execution when additional user input is needed, request structured input using JSON schema specifications, resume execution with the provided user input, and maintain conversation state across pause/resume cycles.
When to Use Human in the Loop
Use HITL when your tool needs to request confirmation before performing sensitive operations, gather additional structured information from users, allow users to review and modify parameters before execution, or implement approval workflows within agent interactions.
Implementation Steps
Tool Implementation
Here’s how to create a tool with HITL functionality:
class SMILESCanonicalizer(ToolService):
    class CanonInput(BaseModel):
        smiles: str

    name = "SMILESCanonicalizer"
    description = "Converts a SMILES string to its canonical form and validates its structure"
    direct_return = False
    short_description = "Canonicalize SMILES string"
    json_input_schema = str(CanonInput.model_json_schema())

    def execute(self, input: str, commands=None) -> CustomResponse:
        try:
            canon_input = self.CanonInput.model_validate_json(input)
            confirmed = False
            for command in commands:
                if command.command == "confirmed":
                    confirmed = True

            if not confirmed:
                return CustomResponse(
                    result=f"Please confirm this input: {str(canon_input.model_dump_json())}", status="confirmation_request", type="command"
                )
            else:

                result = {
                    "input_smiles": canon_input.smiles,
                    "canonical_smiles": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
                }

                return CustomResponse(
                    result=json.dumps(result),
                    status="success",
                    type="text"
                )

        except Exception as e:
            return CustomResponse(
                result="An error occurred while processing the SMILES string.",
                status="error",
                type="text"
            )
This tool has an input JSON Schema that will be honored by the agentic framework, whenever it tries to call the tool with an input. The agent will initially send a confirmation_request command by default (if a tool does not need HITL, they can ignore it). This will partially execute the tool and halt the agent execution via asking user for confirmation. The confrimation message that is being sent by the tool will be displayed to the user and they’ll need to confirm the input JSON Schema that the tool had receveid.
To properly handle HITL, it’s important that your tool sets the appropriate status and type values in the CustomResponse type shown above. Additionally, in your toolserver’s ExecuteTool function, it should perform the following actions to send all the required data back to Cortex:
def ExecuteTool(self, request: tool_pb.ToolRequestV2, context):
  logger.debug("ExecuteTool Request Made")
  logger.debug(request)
  self.__check_auth(request.auth, request.source_toolkit)

  response = TOOL_DICT[request.name].execute(request.input, request.commands)

  

  if response.type == "command":
      if response.status == "confirmation_request":
          command_data = json.dumps({"tool_name": request.name, "tool_input": request.input, "tool_response": response.result, "tool_status": response.status})
          command = tool_pb.Command(command=response.status, data=command_data)
      
      return tool_pb.ToolResponseV2(output=response.result, commands=[command])
Key Components of HITL Tools
1.	Command Checking: Tools must check for commands in the kwargs to determine if confirmation was provided. In case of approval, a confirmed command is sent.
2.	Status Codes: Return appropriate status codes:
o	confirmation_request: Requests user confirmation
o	confirmed: Sent by agent to the tool after human approval.
o	success: Indicates successful completion
Model Configuration
The most important part of the model config is the chain class and providing the tool:
"chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "max_turns": 50,
        "supervisor": {
          "prompt": "",
          "description": ""
        },
        "resources": {
          "executables": [
            {
              "name": "SMILESCanonicalizer",
              "type": "tool-call",
              "description": ""
            }
          ]
        }
      }
    }
  ]
Toolkit Configuration
Tool server can be configured using the Toolkit endpoints on Cortex API:
{
  "allowed_model_configs": [
    "cortex-agent"
  ],
  "auth": {
    "owners": [
      "morin_nathan_a@lilly.com",
      "rashidedin.jahandideh@lilly.com",
      "andrew.hoblitzell@lilly.com"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [
    ],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "description": "Cortex Default Toolkit",
  "name": "cortex-toolkit",
  "displayName": "Cortex Default Toolkit",
  "server": "cortex-toolserver.cortex-toolserver-dev.svc.cluster.local:5000",
  "agent_tool_max_iterations": 7,
  "access_token_scopes": []
}
How It Works
HITL Flow
When a tool needs additional information:
1.	Tool returns a response with status confirmation_request
2.	The framework saves the current state including all previous inputs, and shows the input that needs confirmation to the user
3.	User provides confirmation by providing a JSON that matches tool’s expected input JSON schema
4.	Framework performs tool execution, adds tool output that was generated after confirmation to its history and invokes the LLM
State Management
The framework automatically handles:
•	Preserving conversation history during HITL cycle
•	Maintaining tool execution context
Complete Working Example
Here’s the complete flow for the SMILESCanonicalizer tool:
Step 1: Initial Request
The user makes an initial request that triggers the HITL tool. Since initial request is sent using confirmation_request, the tool returns back a confirmation_request command to Cortex.
 
Step 2: User Confirmation
When the user confirms, the tool is automatically called again with a confirmed command. User must provide the confirmed input in accordance to tool’s JSON input schema. In this example workflow, the next query user provides is: {“smiles”:”CN1C=NC2=C1C(=O)N(C(=O)N2C)C”} This will cause Cortex to execute the tool using a confirmed command.
 
Step 3: Cortex calls the tool with confirmed input
In the final stage of HITL execution, Cortex will return the results of tool execution:
 
Best Practices
For HITL to execute successfully, provide clear descriptions of what action requires confirmation. When implementing HITL tools, ensure your confirmation messages clearly explain what action will be taken and why confirmation is needed. This helps users make informed decisions about whether to proceed.
Include comprehensive logging for debugging HITL flows. Log when confirmation is requested, when it’s received, and what commands are parsed. This makes troubleshooting much easier when flows don’t work as expected.
Handle cases where commands or kwargs might be malformed. Always validate the structure of incoming data and provide graceful error handling when the expected format isn’t received.
Troubleshooting
Execution doesn’t resume
Verify the commands structure is correct. Ensure the tool returns the correct status codes. Review logs for any parsing errors to identify where the flow is breaking.
Tool doesn’t request confirmation
Verify the tool checks for commands/confirmation properly. Ensure the initial call doesn’t include confirmation by mistake. Check that the supervisor prompt correctly handles HITL responses and stops processing when a confirmation_request is received.
Tool Server Connection Issues
Verify the server URL in tool_config.json is correct and matches your deployment. Ensure the server is running and accessible from the Cortex environment. Check that the toolkit is properly referenced in model_config.json with the correct toolkit name.





1.	Cortex Platform
2.	How To
3.	Custom Model on CIAB
Making Your Cortex Model Available on CIAB
Your team is building an AI assistant on Cortex and needs a UX! You’ve connected to your data, chosen the best LLM for your use case, and now you’re ready to chat. #### Chat-in-a-Box (CIAB) now connects to your Cortex model, and it’s as easily as updating your config!
This capability helps you rapidly prototype the application before investing heavily in a User Experience (UX). In fact, you may find that CIAB satisfies your long-term UX needs.
CIAB team is continually updating the product and welcomes your additional ideas for features, particularly features for all builders on chat.lilly.com! Share your feedback under “support” at chat.lilly.com.
Prerequisites:
1.	You have created a 1) How to: Create a simple chat (model only) using Cortex APIs
2.	You have chosen the right environment for your integration.
a. Development - AI Assistant model configs in the Cortex Dev Environment (https://dev.api.cortex.lilly.com/) will be shown in CIAB Dev (http://chat-tmp-dev.cortex.lilly.com)
b. Production - AI Assistant model configs in the Cortex Production Environment (https://api.cortex.lilly.com) will be visible to CIAB Production (https://chat.lilly.com/)
Note: Most applications will start in the development environment, run quality checks, and then promote to Production.
Connect your model config to the CIAB user interface:
1.	In the appropriate environment, bind your model config to the CIAB application in the app_binding field, by including:
o	"app_binding": "chatbuilder"
2.	Set your model config as read only in the labels field, by including
o	"labels": {"chatbuilder": "read only"},
o	CIAB does not support edit for externally created models. Your model will not function properly without this configuration.
3.	Add at least one user to the owners property or one Active Directory group in the owners_group list of the model config.
4.	 "auth": {
5.	 "owners": [
6.	   "USER_PRINCIPAL_NAME(UPN)"
7.	 ],
8.	 "owners_group": [],
9.	  }
10.	Complete your Quality Checks a. Navigate to chat.lilly.com (for a production config) or chat-tmp-dev.cortex.lilly.com (for a dev config) and see the AI assistant listed on the dashboard. Interact with the model and fix any issues.
o	If working in Dev, Promote your config to Production, and replicate your quality checks
11.	Once the integration is working as you intended, share your assistant by adding users to the model config. json "auth": { "users": ["USER_PRINCIPAL_NAME(UPN)"],
Additional Capabilities/Features
You can add more CIAB features directly to your AI assistant through simple changes to your model config. Below are 3 examples.
1.	Add “inline sourcing” to your UX
o	This feature links source documents in line with the LLM responses.
o	To configure, see “Chat-in-a-Box Compliant Config” in References below, with the line, a. with_context_prompt_template i. template: copy “ALWAYS Cite your claims in-line..."
2.	Mirror the tone and precision of the CIAB application
o	For the standard CIAB experience, see “Chat In A Box Compliant Config” in References below, a. with_context_prompt_template > copy template
3.	Use a config that goes deeper into questions for your user
o	see Query Enhanced Model Config below
Reference
•	Chat-in-a-Box Compliant Config
•	   {
•	  "name": "MODEL_NAME",
•	  "auth": {
•	    "owners": ["USER_PRINCIPAL_NAME(UPN)"],
•	    "allow_access_to_reports_of": [],
•	    "owners_group": [],
•	    "access_groups": [],
•	    "access_aws_roles": [],
•	    "owners_aws_roles": [],
•	    "users": [],
•	    "private": true
•	  },
•	  "assume_role": null,
•	  "assume_role_external_id": null,
•	  "displayName": "MODEL_NAME",
•	  "model_description": "MODEL_DESCRIPTION",
•	  "guard": false,
•	  "llm_guard": null,
•	  "security_config": "",
•	  "chainable": false,
•	  "chain": [
•	    {
•	 "chain_class": "doc-chain",
•	 "model_iteration": 1,
•	 "order": 1
•	    }
•	  ],
•	  "model_versions": [
•	    {
•	 "model_class": "lilly-openai",
•	 "model_iteration": 7,
•	 "priority": 100
•	    }
•	  ],
•	  "toolkits": null,
•	  "vectorstore": "elasticsearch",
•	  "allowed_tools_list": null,
•	  "with_context_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "chat_history",
•	 "context",
•	 "question"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "Write an answer for the question below based on the provided context. ALWAYS Cite your claims in-line using the chunk id provided in the context. DO NOT create duplicate in-line citations. DO NOT generate a separate reference block. EXAMPLE CITATION \"With chunk id (b237e8cd-b4a8-4a3a-89e3-024ec89a50cd)\" WILL BE \"(b237e8cd-b4a8-4a3a-89e3-024ec89a50cd)\". IMPORTANT If the context provides insufficient information and the question cannot be directly answered, reply \"I apologize, I don't have enough information to answer based on the documents provided to me. Please try rephrasing your query.  You may also use the feedback link to report issues.\" ALWAYS output in markdown format. \n NOTE you are keeping a chat history of past interactions. \n History:\n {chat_history} \n Context:\n {context}\n Question: {question}\n Answer:",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "model_enhansed_query_template": {
•	    "name": null,
•	    "input_variables": [
•	 "chat_history",
•	 "question"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "Reframe the question delimited by `` below with more context on the area of research and its application. Frame it such that it would improve the response of a retrieval-augmented generation that is built on corpus of technical documents. Do not mention the training data cutoff or about retrieval-augmented generation system. Be verbose in the context, but limit your output to 70 words. Your have access to your chat_history:\nHistory: {chat_history}\n`{question}`",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "no_context_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "chat_history",
•	 "question"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "Answer in an direct and concise tone, I am in a hurry. Your audience is an expert, so be highly specific. If there are ambiguous terms or acronyms, first define them. \nYou have access to your chat_history:\nHistory: {chat_history}\nQuestion: {question}\nAnswer: ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "sql_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "question"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "Given an input question, first create a syntactically correct postgresql query to run, then look at the results of the query and return the answer.Only perform SELECT operations. Never perform DELETE, DROP , UPDATE, INSERT, CASCADE operations on the database.If you are asked to perform a DELETE, DROP, UPDATE,INSERT, CASCADE or any other statements that modify data, respond with 'cannot perform the query'.If you don't know the answer to a question,respond with don't know.If sql query returns no result, respond data not found.If someone asks for the lsn or serial number they really mean compound.If someone asks for compound structure they really mean 'smiles' string.If someone asks for compound details look into structure table.\nQuestion: {question}\nAnswer: ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "agent_tool_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "agent_scratchpad",
•	 "chat_history",
•	 "input",
•	 "tool_names",
•	 "tool_strings"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "\n\nSystem:\n                You are an AI system.\n                You can only respond with a single complete\n                \"Thought, Action, Action Input\" format\n                OR a single \"Final Answer\" format.\n                Complete format:\n                Thought: (reflect on your progress and decide what to do next)\n                Action: (the action name, should be one of [{tool_names}])\n                Action Input: (the input string to the action)\n                OR\n                Final Answer: (the final answer to the original input question)\n\nHuman:\n                Answer the question below using the following tools:\n                {tool_strings}\n                Use the tools provided, using the most specific tool available for each action.\n                Your final answer should contain all information necessary to answer the question and subquestions.\n                Your have access to your chat_history:\n                History: {chat_history}\n                !!!IMPORTANT!!!\n                Never produce a Final Answer AND a Thought, Action, Observation, or Action Input.\n                Send a Final Answer if you have one, otherwise send a Thought, Action, and Action Input.\n                Question: {input}\n\nAI:\n                Thought: {agent_scratchpad}\n\n                ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "summary_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "size",
•	 "text"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "\n                    You are a sophisticated language model trained to analyze and understand a wide range of documents.                     Below are several excerpts from various sources, including reports, notes, articles, and summaries.                     Your task is to synthesize information from these excerpts to provide accurate, {size}, and context-aware                     answers to the questions posed.\n                    Respond to human with a professional business language, always using markdown formating,                     and emphasizing important points in the report using markdown format. Retain all markdown links to images in the summary.\n\n                    Create a {size} summary of the key points discussed in the markdown document highlighting any significant changes or indicators.\n                    ```markdown\n                    {text}\n                    ```\n                    Here is a summary of the key points discussed in the document, as markdown:\n                    ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "entity_extraction_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "text"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "\n                    You are an helpful assistant.\n\n                     \n                    Given the following document, extract all relevant entities, focusing                     specifically on business names related to pharmaceutical companies, their                     pharmaceutical products, financial institutions, and governmental                     organizations. Identify pharmaceutical companies and list each along with                     their pharmaceutical products, capturing product names and relevant                     descriptions. For financial institutions, identify entities such as banks,                     insurance companies, investment firms, and other financial services                     organizations. Additionally, identify and list governmental organizations,                     providing a brief description of their role or function as mentioned in the                     document. Present your findings as a table containing 2 columns:\n                    - Entity Name: Full business name of pharmaceutical company, govermental organization,                     or pharmaceutical product. Expand abbreviations whenever possible.\n                    - Entity Type: One of pharmaceutical company, financial institution, governmental                     organization, or pharmaceutical products.\n\n                    If there is not relevant entity, just return NONE\n\n                    Document:\n\n                    {text}\n\n                    Table:\n\n                    | Entity Name | Entity Type |\n                    | --- | --- |\n                    ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "table_summary_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "table"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "\n                        You are an helpful assistant interpreting tables in HTML format. Generate your summary using                         markdown format to emphasize important key points from the given table. Use ONLY the information given in the table.\n\n                        Please provide a comprehensive summary of the given table below. The summary should cover all                         the key points and main ideas given in the table with focus to companies, their products, and revenues,                         while also condensing the information into a concise and easy-to-understand format. Please ensure that                         the summary includes relevant details and examples that support the main ideas, while avoiding any                         unnecessary information or repetition.                         The length of the summary should be appropriate for the length and complexity of the original text, providing                         a clear and accurate overview without omitting any important information.\n\n                        {table}\n                        ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "rewrite_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "article"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "\n                    You are a text processor that outputs a series of simple sentences with consistent naming.                     Rewrite provided article into a list of sentences.                     Every sentence must follow all these rules:\n                    - Each sentence has exactly one verb.\n                    - One sentence has two core nouns (an object and a subject )\n                    - All relevant atributes of an entity are added as separate sentences.\n                    - Once an entity is named, this name is reused every time the entity is mentioned (never use alternative names)\n                    - Exlude ornamental text that does not convey meaning relevant in current context respond with rawtext block adhering to above. No additional comments.\n\n                    Article: {article}\n                    ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "kg_triple_extraction_prompt_template": {
•	    "name": null,
•	    "input_variables": [
•	 "text"
•	    ],
•	    "optional_variables": [],
•	    "output_parser": null,
•	    "partial_variables": {},
•	    "metadata": null,
•	    "tags": null,
•	    "template": "\n                   You are a networked intelligence helping a human track knowledge triples about all relevant people, things, concepts, etc. and integrating them with your knowledge stored within your weights as well as that stored in a knowledge graph.\n\n                   Extract all of the knowledge triples from the given text in the form of (subject, predicate, object).\n\n                   Avoid stopwords.\n\n                   ---------------------\n\n                    Text: {text}\n\n                    Triplets:\n\n                    ",
•	    "template_format": "f-string",
•	    "validate_template": true,
•	    "_type": "prompt"
•	  },
•	  "max_response_token_size": 0,
•	  "doc_relevence_threshold": 0.5,
•	  "rrf_relevance_threshold": 0.01,
•	  "agent_tool_max_iterations": 7,
•	  "augmentable_metadata": null,
•	  "app_binding": "chatbuilder",
•	  "labels": {"chatbuilder": "read only"},
•	  "concepts_of_interest": null,
•	  "k_value": 20,
•	  "chunk_size": 1500,
•	  "chunk_overlap": 300,
•	  "temperature": 0,
•	  "token_buffer_size": 1.2,
•	  "contextual_chunking": {
•	    "is_enable": false,
•	    "separator": [
•	 "\n\n",
•	 "\n",
•	 ".",
•	 " "
•	    ],
•	    "chunk_size": 1500,
•	    "chunk_overlap": 300,
•	    "depth": 3
•	  }
•	}
Query Enhanced Model Config
{
  "name": "MODEL_NAME",
  "auth": {
    "owners": ["USER_PRINCIPAL_NAME(UPN)"],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "assume_role": null,
  "assume_role_external_id": null,
  "displayName": "MODEL_NAME",
  "model_description": "MODEL_DESCRIPTION",
  "guard": false,
  "llm_guard": null,
  "security_config": "",
  "chainable": false,
  "chain": [
    {
      "chain_class": "doc-chain",
      "model_iteration": 1,
      "order": 2
    },
    {
      "chain_class": "model-enhansed-query-chain",
      "model_iteration": 1,
      "order": 1
    }
  ],
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 7,
      "priority": 100
    }
  ],
  "toolkits": null,
  "vectorstore": "elasticsearch",
  "allowed_tools_list": null,
  "with_context_prompt_template": {
    "name": null,
    "input_variables": [
      "chat_history",
      "context",
      "question"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "You are an autoregressive language model specialized in drug discovery and research. Your expertise spans drug hunting, biology, chemistry, and pharmacology, your capabilities are enhanced through instruction-tuning and RLHF by drug research experts. You are brilliant at reasoning. Provide thorough, factual, and nuanced answers, considering the latest developments in the field. \nSince you are autoregressive, each token you produce is another opportunity to use computation and think step-by-step about the solution of the asked request. Use clear headers and ALWAYS explain context, assumptions, and reasoning in a concise manner BEFORE you try to answer a question. NOTE your audience is expert-level; maintain scientific rigor. IMPORTANT If there are ambiguous terms or acronyms, first define them. CRUCIAL use the provided research article abstract as context to formulate your answers. ALWAYS Cite your claims in-line using the chunk id provided in the context. DO NOT generate a separate reference block. EXAMPLE CITATION \"With chunk id (b237e8cd-b4a8-4a3a-89e3-024ec89a50cd)\" WILL BE \"(b237e8cd-b4a8-4a3a-89e3-024ec89a50cd)\". IMPORTANT if the data or provided context is inconclusive say so and indicate clearly when you're speculating. ALWAYS output in markdown format. \n Write an answer for the question below based on the provided context. NOTE you are keeping a chat history of past interactions. \n History:\n {chat_history} \n Context:\n {context}\n Question: {question}\n Answer:",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "model_enhansed_query_template": {
    "name": null,
    "input_variables": [
      "chat_history",
      "question"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "You are an expert NLP researcher generating a prompt to be sent to an embedding database. Augment the prompt delimited by `` below with information about the research area and its practical applications. Frame it to improve the response and performance of a Retrieval-Augmented Generation chatbot built using a large corpus of drug discovery research publications. ONLY say what the new prompt is. Limit your answer to 75. You must also include any relevant information from the previous chat history listed below in the new prompt. \n History:\n {chat_history} \n `{question}`",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "no_context_prompt_template": {
    "name": null,
    "input_variables": [
      "chat_history",
      "question"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "Understand the question. Think step-by-step. Answer in a direct tone. Your audience is an expert in the field, so be highly specific. If there are ambiguous terms or acronyms, first define them. Additionally, you are keeping a chat history of past interactions. \n History:\n {chat_history} \nQuestion: {question}\nAnswer: ",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "sql_prompt_template": {
    "name": null,
    "input_variables": [
      "question"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "Given an input question, first create a syntactically correct postgresql query to run, then look at the results of the query and return the answer.Only perform SELECT operations. Never perform DELETE, DROP , UPDATE, INSERT, CASCADE operations on the database.If you are asked to perform a DELETE, DROP, UPDATE,INSERT, CASCADE or any other statements that modify data, respond with 'cannot perform the query'.If you don't know the answer to a question,respond with don't know.If sql query returns no result, respond data not found.If someone asks for the lsn or serial number they really mean compound.If someone asks for compound structure they really mean 'smiles' string.If someone asks for compound details look into structure table.\nQuestion: {question}\nAnswer: ",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "agent_tool_prompt_template": {
    "name": null,
    "input_variables": [
      "agent_scratchpad",
      "question",
      "tool_descriptions",
      "tool_names"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "Answer the following questions as best you can. You have access to the following tools:\n{tool_descriptions}Use the following format:\n\n                                                Question: the input question you must answer\n                                                Thought: you should always think about what to do\n                                                Action: the action to take, should be one of [{tool_names}]\n                                                Action Input: the input to the action\n                                                Observation: the result of the action\n                                                ... (this Thought/Action/Action Input/Observation can repeat N times)\n                                                Thought: I now know the final answer\n                                                Final Answer: the final answer to the original input question\nBegin!\n\n                                                Question: {question}\n                                                Thought:{agent_scratchpad}",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "summary_prompt_template": {
    "name": null,
    "input_variables": [
      "size",
      "text"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "\n                    You are a sophisticated language model trained to analyze and understand a wide range of documents.                     Below are several excerpts from various sources, including reports, notes, articles, and summaries.                     Your task is to synthesize information from these excerpts to provide accurate, {size}, and context-aware                     answers to the questions posed.\n                    Respond to human with a professional business language, always using markdown formating,                     and emphasizing important points in the report using markdown format. Retain all markdown links to images in the summary.\n\n                    Create a {size} summary of the key points discussed in the markdown document highlighting any significant changes or indicators.\n                    ```markdown\n                    {text}\n                    ```\n                    Here is a summary of the key points discussed in the document, as markdown:\n                    ",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "entity_extraction_prompt_template": {
    "name": null,
    "input_variables": [
      "text"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "\n                    You are an helpful assistant.\n\n                     \n                    Given the following document, extract all relevant entities, focusing                     specifically on business names related to pharmaceutical companies, their                     pharmaceutical products, financial institutions, and governmental                     organizations. Identify pharmaceutical companies and list each along with                     their pharmaceutical products, capturing product names and relevant                     descriptions. For financial institutions, identify entities such as banks,                     insurance companies, investment firms, and other financial services                     organizations. Additionally, identify and list governmental organizations,                     providing a brief description of their role or function as mentioned in the                     document. Present your findings as a table containing 2 columns:\n                    - Entity Name: Full business name of pharmaceutical company, govermental organization,                     or pharmaceutical product. Expand abbreviations whenever possible.\n                    - Entity Type: One of pharmaceutical company, financial institution, governmental                     organization, or pharmaceutical products.\n\n                    If there is not relevant entity, just return NONE\n\n                    Document:\n\n                    {text}\n\n                    Table:\n\n                    | Entity Name | Entity Type |\n                    | --- | --- |\n                    ",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "table_summary_prompt_template": {
    "name": null,
    "input_variables": [
      "table"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "\n                        You are an helpful assistant interpreting tables in HTML format. Generate your summary using                         markdown format to emphasize important key points from the given table. Use ONLY the information given in the table.\n\n                        Please provide a comprehensive summary of the given table below. The summary should cover all                         the key points and main ideas given in the table with focus to companies, their products, and revenues,                         while also condensing the information into a concise and easy-to-understand format. Please ensure that                         the summary includes relevant details and examples that support the main ideas, while avoiding any                         unnecessary information or repetition.                         The length of the summary should be appropriate for the length and complexity of the original text, providing                         a clear and accurate overview without omitting any important information.\n\n                        {table}\n                        ",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "rewrite_prompt_template": {
    "name": null,
    "input_variables": [
      "article"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "\n                    You are a text processor that outputs a series of simple sentences with consistent naming.                     Rewrite provided article into a list of sentences.                     Every sentence must follow all these rules:\n                    - Each sentence has exactly one verb.\n                    - One sentence has two core nouns (an object and a subject )\n                    - All relevant atributes of an entity are added as separate sentences.\n                    - Once an entity is named, this name is reused every time the entity is mentioned (never use alternative names)\n                    - Exlude ornamental text that does not convey meaning relevant in current context respond with rawtext block adhering to above. No additional comments.\n\n                    Article: {article}\n                    ",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "kg_triple_extraction_prompt_template": {
    "name": null,
    "input_variables": [
      "text"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": null,
    "tags": null,
    "template": "\n                   You are a networked intelligence helping a human track knowledge triples about all relevant people, things, concepts, etc. and integrating them with your knowledge stored within your weights as well as that stored in a knowledge graph.\n\n                   Extract all of the knowledge triples from the given text in the form of (subject, predicate, object).\n\n                   Avoid stopwords.\n\n                   ---------------------\n\n                    Text: {text}\n\n                    Triplets:\n\n                    ",
    "template_format": "f-string",
    "validate_template": true,
    "_type": "prompt"
  },
  "max_response_token_size": null,
  "doc_relevence_threshold": 0.85,
  "rrf_relevance_threshold": 0.01,
  "agent_tool_max_iterations": 7,
  "augmentable_metadata": null,
  "app_binding": "chatbuilder",
  "labels": {
    "chatbuilder": "read only"
  },
  "concepts_of_interest": null,
  "k_value": 20,
  "chunk_size": 1500,
  "chunk_overlap": 300,
  "temperature": 0,
  "token_buffer_size": 1.2,
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
  }
}



1.	Cortex Platform
2.	How To
3.	Connect to Cortex via AWS
Getting started with Cortex, an AWS@Lilly approach.
by Tom Griffin
THIS BLOG WILL COVER -
•	API Gateway & Lambda integrations with Cortex
•	S3 & Lambda integrations with Cortex for Ingestion / embedding creation
•	API Gateway & Lambda prompt handling
By the end of this blog post you will be able to create a new vector store in Cortex via Lambda, populate it with embeddings and then run a prompt query against your stack via your API. At a high-level, the design looks like this
 
PRE-READ
Use the following links and information to gain access and background knowledge of the concepts and components discussed in the blog:
•	Github
•	Cortex Access Get started with Cortex (lilly.com)
•	AWS@Lilly DX DEV env
•	CyberArk Self-Help - CyberArk : Login and Retrieve Stored Password
•	Cloud Admin Account
•	Cortex API knowledge Cortex - Swagger UI (lilly.com)
DATA PREPARATION TASKS LIKE CREATING RIGHT SIZED FILES FOR EMBEDDING CREATION ARE NOT IN SCOPE***
ALL INFORMATION IS SPECIFIC TO AWS DX DEV ENVIRONMENTS
THE INTENTION OF THIS BLOG IS NOT TO TELL YOU HOW CORTEX WORKS RATHER; HOW YOU CAN LEVERAGE THE CAPABILITIES, FOR EXAMPLE - I WON’T BE COVERING EXPLANATIONS AS TO WHAT A VECTOR STORE OR AN INDEX IS.
CODE EXAMPLES HAVE BEEN SIMPLIFIED TO GET YOU GOING QUICKLY, YOU CAN IMPROVE THEM.
ALL LAMBDAS ARE IN PYTHON
Infrastructure:
1.	S3 buckets can be provisioned in multiple ways in Lilly’s AWS Dev DX accounts –
o	Console
o	CloudFormation
o	Cloud.lilly.com
2.	You can decide what provisioning method is best for your stack, the important things to note are as follows:
•	CORS policy on bucket may need to be edited via EDAT / Digital Core to allow access to bucket from different AWS envs – this must be locked to a domain.
•	Lambda role will need access to bucket.
•	Ensure bucket adheres to red data standards – block all public access and allow access via IAM roles and bucket policies.
•	Buckets provisioned via cloud.lilly.com will require requests to manage
1.	AWS API Gateway’s in dx environments MUST follow certain principles to allow them to be safely accessed at Lilly:
o	API gateway endpoints MUST be set to private which by default restricts traffic to your Lilly VPC.
o	A security policy must then be applied to the gateway to allow the endpoint to be called from a dx location.
o	You can further secure the API endpoint with an authorizer function and/or API Keys.
You can experiment with this cloudformation template to achieve the creation of your API Gateway
YOU WILL NEED TO NAME YOUR RESOURCES APPROPRIATELY AND THEN REFERENCE THEM CORRECTLY
AWSTemplateFormatVersion: '2010-09-09'  #API
Resources:
 YOURAPINAME:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name:YourAPIName
      EndpointConfiguration:
        Types:
          - PRIVATE
        VpcEndpointIds: 
          - 'vpce-03bee17f69c9802b9'
      Policy: 
        Version: '2012-10-17'
        Statement:
          - Effect: 'Deny'
            Principal: '*'
            Action: 'execute-api:Invoke'
            Resource: 'execute-api:us-east-2:accountID:123456 /*'
            Condition:
              StringNotEquals:
                aws:sourceVpce:
                  - 'vpce-069388414a9f87f40'
                  - 'vpce-058757a9c034d181c'
                  - 'vpce-03bee17f69c9802b9'
                  - 'vpce-00d3041344448c59a'
                  - 'vpce-08859ebdbaecb03b5'
                  - 'vpce-05a765db42827d977'
                  - 'vpce-05503c45b56a7924e'
                  - 'vpce-05ac776662a91e83b'
                  - 'vpce-0e8034b577b3cc7fe'
                  - 'vpce-0fad78fdd3b709c61'
                  - 'vpce-069a5f2c8ee2a9802'
          - Effect: 'Allow'
            Principal: '*'
            Action: 'execute-api:Invoke'
            Resource: 'arn:aws:execute-api:us-east-2:yourAccountID:123456/*'
             

  YourStage:
    Type: AWS::ApiGateway::Stage
    Properties:
      DeploymentId: !Ref YourDeployment
      RestApiId: !Ref YourDeployment
      StageName: 'your-Stage’

  YourDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - "VLTAPIMethod"
    Properties:
      RestApiId: !Ref VLTAPIGateway

  YourMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref YourMethod
      ResourceId: !Ref YourMethod
      HttpMethod: POST
      AuthorizationType: NONE
      ApiKeyRequired: false
      Integration:
        IntegrationHttpMethod: POST
        Type: AWS_PROXY
        Uri:
          Fn::Sub: arn:aws:apigateway:us-east-2:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-2:yourAccountID:function:lly-your-lambda-name/invocations
        IntegrationResponses:
          - StatusCode: 200
            ResponseParameters:
              method.response.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
              method.response.header.Access-Control-Allow-Methods: "'POST,OPTIONS'"
              method.response.header.Access-Control-Allow-Origin: "'*'"
      MethodResponses:
        - StatusCode: 200
          ResponseModels:
            'application/json': 'Empty'
          ResponseParameters:
            method.response.header.Access-Control-Allow-Headers: false
            method.response.header.Access-Control-Allow-Methods: false
            method.response.header.Access-Control-Allow-Origin: false

  YourResourceName:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref YourGateway
      ParentId: !GetAtt YourGateway.RootResourceId
      PathPart: ‘yourendpoint’

  YourAPIKey:
    Type: AWS::ApiGateway::ApiKey
    Properties:
      Name: YourAPIKey
      Description: API Key
      Enabled: true

  UsagePlan:
    Type: AWS::ApiGateway::UsagePlan
    Properties:
      ApiStages:
        - ApiId: !Ref APIGateway
          Stage: !Ref Stage
      Description: 'Usage Plan for APIKey'
      Quota:
        Limit: 3000000
        Period: MONTH
      Throttle:
        BurstLimit: 5000
        RateLimit: 10000

  UsagePlanKey:
    Type: AWS::ApiGateway::UsagePlanKey
    Properties:
      KeyId: !Ref APIKey
      KeyType: API_KEY
      UsagePlanId: !Ref UsagePlan

  ProdDeployment:
    Type: 'AWS::ApiGateway::Deployment'
    Properties:
      RestApiId: !Ref APIGateway
      Description: 'API Deployment'
      StageName: 'YourStageName’
You can add a callable method for each function, but this is not necessary for any lambda other than the prompt lambda initially.
Cortex access from your VPC
Following the points raised at Get started with Cortex (lilly.com), you will provide resources deployed to your dx subnets with the ability to communicate with the cortex infrastructure and APIs. To achieve this, you will need to provide your account ID and follow up with Cortex support to ensure your traffic can flow correctly.
Having done this, it is now possible to deploy AWS resources to the private subnets that exist in your dx account and have them programmatically interface with cortex. In our case, these resources are going to be lambdas.
Creating Lambdas and adding them to your API
The cortex endpoints this blog uses are documented in the swagger page Cortex - Swagger UI.
You may or may not decide to make each of these functions callable via your API Gateway, the prompt handling lambda is the only one that is really required, the rest can be invoked or triggered in multiple ways like s3 events etc, but there are benefits to having the functions accessible via a UI, which should become apparent as your application evolves.
Layers required for Cortex
The python layer used for cortex authentication uses the light client, I have published both layers required here:
•	You can upload a new layer in dev manually via the dev-dx admin role, using the lambda console in QA and Prod you will deploy your layer via a pipeline.
Create Vector Store
The first lambda that we are going to write and deploy is the function that creates the vector store that your embeddings will live in:

import json
import requests
import time
import os
import boto3
import light_client
from light_client import LIGHTClient, AUTH_METHOD_AWS 

def lambda_handler(event, context):
  
  YOUR_USER = "griffin_thomas@lilly.com"
  aws_owners = "arn:aws:iam::accountID:role/lly-your-cortex-role "
      
  client = LIGHTClient(auth_method=AUTH_METHOD_AWS)
      
  CORTEX_BASE = "https://api.dev.cortex.lilly.com"
  
  CUSTOM_MODEL_NAME = "YourCustomVectorName"
  
  MODELS = {
      "gpt4-turbo": {
        "model_class": "lilly-openai",
        "model_iteration": 4
      }
  }
  
  CUSTOM_MODEL_CONFIG = {
    "name": CUSTOM_MODEL_NAME,
    "s3_bucket": "lly-light-dev",
    "s3_prefix": "llm-dev/your-vector-storage-name/docs",
    "auth": {
      "owners": [
        "owners_aws_roles"
        ],
      "access_aws_roles": [
        aws_owners
        ],
      "owners_aws_roles":  [
        aws_owners
      ],
      "owners_group": [
        "your_AD_group"
        ],
      "access_groups": [
        “your_AD_group”
        
        ]
    },
    "displayName": "your-vector-storage-name",
    "model_versions": [
      {
        "model_class": "lilly-openai",
        "model_iteration": 4,
        "priority": 0
      }
    ]
  }
  
result = client.post(f"{CORTEX_BASE}/manage/config", json=CUSTOM_MODEL_CONFIG)
  print(result.text)
  print(result.json)

When deploying this function you will need an AD group to use to govern access to your vector store and to replace the values in code with your vector stores names and an IAM role in your AWS env that has permissions to do what your downstream app needs to do.
The amount of vector stores and indexes you can create is entirely up to you, the more granular your get with it the more well architected and solutioned your prompt handling functions need to become, base your decisions on your data and the rest of the stack that you are planning to create.
Getting this far ensures that you have completed the cortex access and VPC setup steps correctly.
Embedding creation
The embedding creation code uses several endpoints, the code example has been simplified to allow for you to easily ingest one file at a time or all files in a particular directory:

import json
import requests
import time
import os
import boto3
import light_client
from light_client import LIGHTClient, AUTH_METHOD_AWS 

client = LIGHTClient(auth_method=AUTH_METHOD_AWS)

CORTEX_BASE = "https://api.dev.cortex.lilly.com"
YOUR_USER = "griffin_thomas@lilly.com"
aws_owners = "arn:aws:iam::471112777871:role/lly-drs-cortex"
    
CUSTOM_MODEL_NAME = "your-vector-store-name"
    
MODELS = {
    "gpt4-turbo": {
        "model_class": "lilly-openai",
        "model_iteration": 3
    }
}
    
CUSTOM_MODEL_CONFIG = {
    "name": CUSTOM_MODEL_NAME,
    "s3_bucket": "lly-light-dev",
    "s3_prefix": "llm-dev/your-vector-store-name/docs",
    "auth": {
        "owners": [
            "owners_aws_roles"
        ],
        "access_aws_roles": [
            aws_owners
        ],
        "owners_aws_roles": [
            aws_owners
        ],
        "owners_group": [
            "your_ad_group"
        ],
        "access_groups": [
            "your_ad_group"
        ]
    },
    "displayName": "your-vector-store-name",
    "model_versions": [
        {
            "model_class": "lilly-openai",
            "model_iteration": 3,
            "priority": 0
        }
    ]
}
#used for one file at a time, edit the below for multiple
FILE = yourfile
FILE_PATH = '/tmp/
def lambda_handler(event, context):
    
    s3 = boto3.client('s3')
    bucket_name = ‘lly-your-bucketname’
    s3_file_key = FILE
    
    s3.download_file(bucket_name, s3_file_key, FILE_PATH)
    
    file_path = FILE_PATH
    
    cortex_embed(file_path, CUSTOM_MODEL_CONFIG, CUSTOM_MODEL_NAME)

def embed_file(dataset_name: str, file: str) -> str:
    file = FILE_PATH
    result = client.post(f"{CORTEX_BASE}/models/{dataset_name}/upload", files={"files": (file, open(file, 'rb'))})
    if result.status_code != 200:
        raise Exception(f"error uploading file {file} to dataset {dataset_name}, status code {result.status_code} : {result.text}")
    return result.json()[0]["job_id"]

def embed_file_sync(dataset_name: str, filename: str) -> bool:
    job_id = embed_file(dataset_name=dataset_name, file=filename)
    checks = 0
    while checks < 500:
        status = check_embed_status(dataset_name=dataset_name, job_id=job_id)
        print(f"Checking status: {status}")
        if status == "failed":
            return False
        if status == "finished":
            return True
        time.sleep(1)

def cortex_embed(file_path: str, config: dict, model_name: str):   
    file_to_embed = FILE_PATH
    #success = configure_model(config)
    #if not success:
        #exit(1)
    success = embed_file_sync(model_name, file_to_embed)
    if success:
        print(f"successfully embedded file {file_to_embed}")

def check_embed_status(dataset_name: str, job_id: str) -> str:
    result = client.get(f"{CORTEX_BASE}/models/{dataset_name}/job-status/{job_id}")
    if result.status_code != 200:
        raise Exception(f"error checking status of job {job_id}, status code {result.status_code} : {result.text}")
    return result.json()["status"]

def configure_model(config: dict) -> bool:
    result = client.post(f"{CORTEX_BASE}/manage/config", json=config)
    if result.status_code != 200:
         raise Exception(f"error configuring model, status code {result.status_code} : {result.text}")
    return True

Prompt
The prompt query function allows an API call to pass a constructed prompt against the data stored in the embedding store, this function uses the event of your API post as a trigger:
import json
import requests
import time
import os
import boto3
import light_client
from light_client import LIGHTClient, AUTH_METHOD_AWS 

def lambda_handler(event, context):
  
  YOUR_USER = "griffin_thomas@lilly.com"
  aws_owners = "arn:aws:iam::accountID:role/role-name-lly "
      
  client = LIGHTClient(auth_method=AUTH_METHOD_AWS)
      
  CORTEX_BASE = "https://api.dev.cortex.lilly.com"
  
  CUSTOM_MODEL_NAME = "your-vector-store-name"
  
  MODELS = {
      "gpt4-turbo": {
        "model_class": "lilly-openai",
        "model_iteration": 3
      }
  }
  
  CUSTOM_MODEL_CONFIG = {
    "name": CUSTOM_MODEL_NAME,
    "s3_bucket": "lly-light-dev",
    "s3_prefix": "llm-dev/your-vector-store/docs",
    "auth": {
      "owners": [
        "owners_aws_roles"
        ],
      "access_aws_roles": [
        aws_owners
        ],
      "owners_aws_roles":  [
        aws_owners
      ],
      "owners_group": [
        "your_ad_groups"
        ],
      "access_groups": [
        "your_ad_groups"
        
        ]
    },
    "displayName": "your-vector-store-name",
    "model_versions": [
      {
        "model_class": "lilly-openai",
        "model_iteration": 3,
        "priority": 0
      }
    ]
  }
  try:
     prompt = event['prompt']
     result = client.post(f"{CORTEX_BASE}/ask/{CUSTOM_MODEL_NAME}", json={"q": prompt})
     return {
         'statusCode': 200,
         'body': (result.text)
     }
     
  except Exception as e:
    print(f"Error {str(e)}")
    return {
        'statusCode': 500,
        'body': "error getting response from Cortex"
    }
User Interface
The purpose of this UI is to provide you with a react and material-ui based solution that quickly enables you to construct and send a prompt via a form and a free text field to the API endpoint you have created by following the code examples in the previous sections.
It is also possible to edit the prompt function in your API to construct your prompt so your UI can just pass single word values, it is up to you to decide where you would ultimately like to construct your prompt.
Package.JSON
"dependencies": {

"@emotion/react": "^11.13.0",

"@emotion/styled": "^11.13.0",

"@material-ui/core": "^4.12.4",

"@material-ui/icons": "^4.11.3",

"@mui/icons-material": "^5.16.6",

"@mui/material": "^5.16.6",

"aws-sdk": "^2.118.0",

"axios": "^0.24.0",

"react": "^17.0.2",

"react-dom": "^17.0.2",

"react-scripts": "4.0.3"

}
App.js




1.	Cortex Platform
2.	How To
3.	Connect EDB S3 to Cortex
Guide to Connecting EDB S3 Data to Cortex
This document outlines the process of ingesting data from the EDB S3 into Cortex.
TABLE OF CONTENTS
•	Introduction
•	Getting Started
•	Prerequisites
•	Role Creation
•	Obtaining Role Details
•	Data Config Creation
•	Important Attributes for EDB S3 Integration
•	Data Ingestion
________________________________________
Introduction
Before delving into the technical details of this integration, it’s crucial to emphasize that access to the EDB data sources is exclusively granted to the data owners and data custodians of the data products listed in the marketplace.
To access the data sources, refer to Lilly Data for details. Access to the data source requires a consulting request to the data owner or custodian.
Not all data sources are listed in the marketplace.
________________________________________
Getting Started
This document outlines the steps required to connect with EDB S3 and ingest the data into Cortex. The Cortex-EDB S3 Integration follows the assume role access pattern where Cortex will be assuming the role created at the EDB end.
 
________________________________________
Prerequisites
Provide the Cortex-role associated with each environment to the EBD team:
•	Dev: arn:aws:iam::408787358807:role/lrl-light-apps/lrl-light-apps-llm-dev-lmm-data
•	QA: arn:aws:iam::474366589702:role/lrl-light-apps/lrl-light-apps-llm-qa-lmm-data
•	PROD: arn:aws:iam::283234040926:role/lrl-light-apps/lrl-light-apps-llm-dev-lmm-data
Provide the data configuration name to the EDB team. This data configuration name will be referred to as the External ID, and this External ID will be mapped to the role that will be created at the EDB end.
________________________________________
Role Creation
The EDB team will create a role using the Cortex-role and External ID. Here’s a sample:
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "s3.amazonaws.com",
                "AWS": [
                    "arn:aws:iam::283234040926:role/lrl-light-apps/lrl-light-apps-llm-dev-lmm-data",
                    "arn:aws:iam::408787358807:role/lrl-light-apps/lrl-light-apps-llm-dev-lmm-data"
                ]
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "sts:ExternalId": "EDBTEST"
                }
            }
        }
    ]
}
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
                "s3:GetObjectTagging",
                "s3:GetObjectVersionTagging"
            ],
            "Resource": [
                "arn:aws:s3:::lly-edp-raw-us-east-2-dev/cortex_data_test/*"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:ListAllMyBuckets"
            ],
            "Resource": [
                "arn:aws:s3:::lly-edp-raw-us-east-2-dev"
            ],
            "Effect": "Allow"
        }
    ]
}
________________________________________
Obtaining Role Details
Once the EDB team creates a role, they will provide the following details:
•	s3_bucket
•	s3_prefix
•	assume_role
________________________________________
Data Config Creation
After obtaining the above information, create a Data Config specific to the EDB data ingestion using the POST /data endpoint. Below is a sample template:
{
  "name": "EDBTEST",
  "auth": {
    "owners": [
      "abc@lilly.com"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [],
    "access_groups": [],
    "access_aws_roles": [],
    "owners_aws_roles": [],
    "users": [],
    "private": true
  },
  "s3_bucket": "lly-edp-raw-us-east-2-dev", 
  "s3_prefix": "cortex_data_test", 
  "exclude_filter": [],
  "assume_role": "arn:aws:iam::1234xx:role/SyedRoleWithExternalID1", 
  "displayName": "EDBTEST",
  "data_config_description": "EDBTEST",
  "embedding": {
    "model": "text-embedding-ada-002",
    "open_api_type": "azure"
  },
  "model_version": {
    "model_class": "lilly-openai",
    "model_iteration": "7"
  },
  "vectorstore": "elasticsearch",
  "concepts_of_interest": null,
  "augmentable_metadata": null,
  "allowed_model_configs": [],
  "chunk_size": 1500,
  "chunk_overlap": 300,
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
  }
}
________________________________________
Important Attributes for EDB S3 Integration
•	s3_bucket: This is an EDB S3 bucket where the source data resides, obtained from the EDB team.
•	s3_prefix: This is the EDB S3 prefix location from the S3 bucket, provided by the EDB team.
•	assume_role: This role is created at the EDB end and configured in the data config. Role details are provided by the EDB team.
________________________________________
Data Ingestion
Once the data configuration is created, use the following endpoints to ingest data:
•	/data/index/{name}: Ingest files using various options.
o	doc_filter: Filters files per the specified regex pattern.
o	filter_list: Ingests only files in the list.
o	doc_prefix: Fetches files from the sub-prefix existing in the s3_prefix.
•	/data/external_s3_list_files/{name}: Lists files present in the source S3 prefix.
•	/data/list-external-files/{name}: Lists files ingested from the EDB S3 location per data config.





1.	Cortex Platform
2.	How To
3.	Call LLMs Directly
Direct Model Access
If you have a specific use case for directly calling LLM models (utilizing Cortex for baseline security and access to scaled models with a standardized interface), this is ideal if your advanced use case does not require RAG/Agent processing.
________________________________________
The below code gives an an example calling GPT4-turbo using python:
import time
import os
# Install Light Client: https://client-python.apps.lrl.lilly.com/
from light_client import LIGHTClient

client = LIGHTClient()

CORTEX_BASE = "https://api.cortex.lilly.com"

YOUR_USER = os.environ["EMAIL"]
1. Create Prompt Config Function
def create_prompt(prompt_config_name: str, model_name: str, prompt_config: str) -> object:
    result = client.post(f"{CORTEX_BASE}/prompt", json={
        "name": prompt_config_name,
        "display_name": f"{model_name} Default With Context",
        "prompt_type": "no_context",
        "allowed_model_configs": [
            model_name
            ],
        "auth": {
            "owners": [
            YOUR_USER
            ],
            "private": True
        },
        "prompt": {
            "input_variables": [
                "chat_history",
                "context",
                "question"
            ],
            "template": prompt_config,
            "template_format": "f-string",
        }
    })
    
    if result.status_code != 200:
      raise Exception(f"error updating prompt, status code {result.status_code} : {result.text}")

    return result.json()
2. Create Model Config Function
def create_model(model_name: str, prompt_config_name: str) -> object:
    result = client.post(f"{CORTEX_BASE}/model", json={
            "name": model_name,
            "auth": {
                "owners": [YOUR_USER]
            },
            "displayName": model_name,
            "model_description": model_name,
            "chain": [
                {
                    "chain_class": "model-only-chain",
                    "model_iteration": 1,
                    "order": 1,
                    "chain_params": {}
                }
            ],
            "model_versions": [
                {
                    "model_class": "lilly-openai",
                    "model_iteration": 7,
                    "priority": 0
                }
            ],
            "prompts": {
                "no_context": prompt_config_name,
            }
    })
    
    if result.status_code != 200:
      raise Exception(f"error listing datasets, status code {result.status_code} : {result.text}")

    return result.json()
3. Send Query Function
def call_model(model_name: str, prompt: str) -> str:
    """
    Call openai model through cortex with raw prompt given in prompt param.  Model param should be one of
    the keys listed in the MODEL dictionary above.
    """
    
    result = client.post(f"{CORTEX_BASE}/model/ask/{model_name}", data={
      "q": prompt
    })

    if result.status_code != 200:
      raise Exception(f"error calling model, status code {result.status_code} : {result.text}")
    data = result.json()
    
    output = data['message'] + \
        "\nCunks:\n" + \
        '\n'.join(
        doc['metadata']['chunk_id'] 
        for doc in data['source_metadata']
        )
        
    return output
**4. Call **
file_to_embed = "lillybio.pdf" # Update with path to your file
custom_model_name = f"{os.environ['USER'].lower()}-test-bot-workshop-model-only-v2"

prompt_config_name = f"{custom_model_name}_with_context"

prompt_config = """
Return the answer to the question based on the chat history and context. Be concise and clear.

History:
{chat_history}

Question: {question}

Answer: 

"""

# # Uncomment to embed documents
prompt_create_result = create_prompt(
    prompt_config_name=prompt_config_name,
    model_name=custom_model_name,
    prompt_config=prompt_config
)
print(f'Create Prompt: {prompt_create_result}')
print(f"Create Model: {create_model(custom_model_name, prompt_config_name)}")

print(call_model(custom_model_name, "Who is Eli Lilly?"))




1.	Cortex Platform
2.	How To
3.	Cortex Python RAG
#Implement a RAG Workflow in Python
This page describes how to implement a RAG workflow in Python using Cortex.
________________________________________
Follow this link https://client-python.apps.lrl.lilly.com/ to install the LIGHT client library which manages API Authentication.
import time
import os
# Install Light Client: https://client-python.apps.lrl.lilly.com/
from light_client import LIGHTClient

client = LIGHTClient()

CORTEX_BASE = "https://api.cortex.lilly.com"

YOUR_USER = os.environ["EMAIL"] # Must be a UPN (Lilly Email)



def list_datasets() -> list[str]:
    result = client.get(f"{CORTEX_BASE}/data")
    
    if result.status_code != 200:
      raise Exception(f"error listing datasets, status code {result.status_code} : {result.text}")

    return [r["name"] for r in result.json()]


# 1. Create DataSet Config

def create_dataset(dataset_name: str) -> object:
    result = client.post(f"{CORTEX_BASE}/data", json={
            "name": dataset_name,
            "auth": {
                    "owners": [YOUR_USER] # Must be a UPN (Lilly Email)
                },
            "displayName": dataset_name,
            "data_config_description": dataset_name,
            "embedding": {
                "model": "text-embedding-3-large",
                "open_api_type": "azure"
            },
            "model_version": {
                "model_class": "lilly-openai",
                "model_iteration": "7"
            },
            "allowed_model_configs": [dataset_name]
    })
    
    if result.status_code != 200:
      raise Exception(f"error listing datasets, status code {result.status_code} : {result.text}")

    return result.json()



# 2. Upload Data to Dataset config

def embed_file(dataset_name: str, file: str) -> str:
    """Returns job id for given local file
    Args:
        dataset_name (str): name of the dataset config in Cortex
        file (str): Path to local file
    Returns:
        str: Job ID
    """
    result = client.post(f"{CORTEX_BASE}/data/upload/{dataset_name}", files={
      "files": (file, open(file, 'rb')),
    })
    
    if result.status_code != 200:
      raise Exception(f"error uploading file {file} to dataset {dataset_name}, status code {result.status_code} : {result.text}")

    return result.json()[0]["job_id"]


def check_embed_status(dataset_name: str, job_id: str) -> str:
    """Return the current status of a submitted job
    Args:
        dataset_name (str): name of the dataset config in Cortex
        job_id (str): Job ID
    Returns:
        str: Job Status
    """
    result = client.get(f"{CORTEX_BASE}/data/job-status-id/{dataset_name}/{job_id}")
    
    if result.status_code != 200:
      raise Exception(f"error checking status of job {job_id}, status code {result.status_code} : {result.text}")

    return result.json()["status"] 


def embed_file_sync(dataset_name: str, filename: str) -> bool:
    """Embed the document spacified using default Cortex workflow
    Args:
        dataset_name (str): name of the dataset config in Cortex
        filename (str): Path to local file
    Returns:
        bool: was embedding successful
    """
    job_id = embed_file(dataset_name=dataset_name, file=filename)
    checks = 0
    while checks < 500:
        status = check_embed_status(dataset_name=dataset_name, job_id=job_id)
        
        print(f"Checking status: {status}")
        
        if status == "failed":
            return False
        
        if status == "finished":
            return True
        
        time.sleep(1)
        
        
# 3. Create Prompt Config

def create_prompt(prompt_config_name: str, model_name: str, prompt_config: str) -> object:
    result = client.post(f"{CORTEX_BASE}/prompt", json={
        "name": prompt_config_name,
        "display_name": f"{model_name} Default With Context",
        "prompt_type": "with_context",
        "allowed_model_configs": [
            model_name
            ],
        "auth": {
            "owners": [
            YOUR_USER
            ],
            "private": True
        },
        "prompt": {
            "input_variables": [
                "chat_history",
                "context",
                "question"
            ],
            "template": prompt_config,
            "template_format": "f-string",
        }
    })
    
    if result.status_code != 200:
      raise Exception(f"error updating prompt, status code {result.status_code} : {result.text}")

    return result.json()



# 4. Create Model Config

def create_model(model_name: str, prompt_config_name: str) -> object:
    result = client.post(f"{CORTEX_BASE}/model", json={
            "name": model_name,
            "auth": {
                "owners": [YOUR_USER]
            },
            "displayName": model_name,
            "model_description": model_name,
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
                    "priority": 0
                }
            ],
            "prompts": {
                "no_context": "default_no_context",
                "with_context": prompt_config_name
            },
            "data": [
                model_name
            ]
    })
    
    if result.status_code != 200:
      raise Exception(f"error listing datasets, status code {result.status_code} : {result.text}")

    return result.json()


# 4. Send Query

def call_model(model_name: str, prompt: str) -> str:
    """
    Call openai model through cortex with raw prompt given in prompt param.  Model param should be one of
    the keys listed in the MODEL dictionary above.
    """
    
    result = client.post(f"{CORTEX_BASE}/model/ask/{model_name}", data={
      "q": prompt
    })

    if result.status_code != 200:
      raise Exception(f"error calling model, status code {result.status_code} : {result.text}")
    data = result.json()
    
    output = data['message'] + \
        "\nCunks:\n" + \
        '\n'.join(
        doc['metadata']['chunk_id'] 
        for doc in data['source_metadata']
        )
        
    return output

if __name__ == "__main__":    
    file_to_embed = "lillybio.pdf" # Update with path to your file
    custom_model_name = f"{os.environ['USER'].lower()}-test-bot-workshop-v2"

    prompt_config_name = f"{custom_model_name}_with_context"
    
    prompt_config = """
    Write an answer for the question below based on the provided context. 
    If the context provides insufficient information and the question cannot be directly answered, 
    reply \"I cannot answer\". You have access to your chat_history. 
    ALWAYS Cite your claims in-line using the chunk id provided in the context. 
    DO NOT generate a separate reference block. 
    EXAMPLE CITATION \"With chunk id (b237e8cd-b4a8-4a3a-89e3-024ec89a50cd)\" WILL BE \"(b237e8cd-b4a8-4a3a-89e3-024ec89a50cd)\". 
    IMPORTANT if the data or provided context is inconclusive say so and indicate clearly when you're speculating. 
    ALWAYS output in markdown format. 
    
    History:
    {chat_history}
    
    Context (with relevance scores):
    {context}
    
    Question: {question}
    
    Answer: 
    
    """
    
    # # Uncomment to embed documents
    print(f"Create Dataset: {create_dataset(custom_model_name)}")
    success = embed_file_sync(custom_model_name, file_to_embed)
    if success:
        print(f"successfully embedded file {file_to_embed}")
    
    prompt_create_result = create_prompt(
        prompt_config_name=prompt_config_name,
        model_name=custom_model_name,
        prompt_config=prompt_config
    )
    print(f'Create Prompt: {prompt_create_result}')
    print(f"Create Model: {create_model(custom_model_name, prompt_config_name)}")
    
    print(call_model(custom_model_name, "Who is Lilly?"))




1.	Cortex Platform
2.	How To
3.	Setup Multimodal Pipeline
Setup Multimodal Pipeline using Cortex
As of Cortex Release 2.20 (March 12, 2025), the Cortex ingestion pipeline can be configured to ingest documents containing tables, images, and charts. Data ingested prior to Release 2.20 only processed text, excluding any visual element. Consequently, if you had built a chat or summarization tool integrated into a vector database, any images would have been lost to that embedding process.
The Multimodal feature uses LLMs to identify charts, graphs, infographics, tables, and other visual elements, extract key information from the visual elements, and embed it alongside the text. This information is now accessible to answer questions in an AI chat. We support .docx, .pdf and .ppt file types using the multimodal pipeline with Cortex.
Any files embedded prior to Release Version 2.20 will be only text based. To use Multimodal embedding, each will need to be re-embedded.
Setup Instructions - RAG Based
To enable Multi-modal ingest, you will need to set flags in both the model and data configs.
Enable multimodal flag on your model config: Update the multimodal flag to true. The default is set to false.
{
 "agent_tool_max_iterations": 7,
  "app_binding": "chatbuilder",
  "multimodal": true,
  "labels": {},
  "k_value": 20,
  "token_buffer_size": 1.2,
  "temperature": 0,
  "top_p": 1,
  "stop": null,
  "seed": null,
  "logprobs": false
}
Enable multimodal flag on your data config: Just like with the model config,update the multimodal flag to true on your data config. The default is set to false.
{
  "model_version": {
    "model_class": "google-vertex",
    "model_iteration": "15"
  },
  "vectorstore": "pinecone",
  "concepts_of_interest": null,
  "augmentable_metadata": null,
  "allowed_model_configs": [
    "cortexhelpassistant"
  ],
  "chunk_size": 1500,
  "chunk_overlap": 300,
  "index_name": "9a1fc096f142c9abf29442e520dd974b",
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
  "multimodal": true
  }
Embed your Files: Use the standard embedding process that you typically use to embed your files through Cortex. Example: /data/upload/{name}, which should initiate the embedding process using the multimodal capability. Once the documents finish embedding, you can use the standard model/ask endpoint to start the interaction and ask questions around those visual elements.
Configure context For multi-modal models, model config needs to set with_json_context prompt context so that responses have sufficient context background to return consistent answers
  "prompts": {
    "no_context": "default_no_context",
    "with_context": "default_no_context",
    "with_json_context": [PROMPT_WITH_JSON_CONTEXT_HERE],
    "enhance_query": "default_enhance_query",
    "sql": "default_sql",
    "agent_tool": "default_agent_tool",
    "table_summary": "default_table_summary",
    "summary": "default_summary",
    "entity_extraction": "default_entity_extraction",
    "rewrite": "default_rewrite",
    "kg_triple_extraction": "default_kg_triple_extraction"
  },
The prompt for with_json_context can start with context specific to the model but end with specific instructions on JSON: “\nReference data JSON schema includes:\n ‘page_numbers’: int, # page number from the document, where this reference text has been sourced.\n ‘text_content’: string, # content of the page.\n \n Context:\n {context}\n Question: {question}.” An example can be found below
{
  "name": [PROMPT_WITH_JSON_CONTEXT_HERE],
  "display_name": "some-display-name",
  "description": null,
  "prompt_type": "with_json_context",
  "allowed_model_configs": [
  ],
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
    "name": "",
    "input_variables": [
      "context",
      "question"
    ],
    "optional_variables": [],
    "output_parser": null,
    "partial_variables": {},
    "metadata": {},
    "tags": null,
    "template": "[INSERT YOUR PROMPT HERE]\nReference data JSON schema includes:\n    'page_numbers': int,  # page number from the document, where this reference text has been sourced.\n    'text_content': string,  # content of the page.\n \n Context:\n {context}\n Question: {question}.",
    "template_format": "f-string",
    "validate_template": false
  }
}
________________________________________
Setup Instructions - Upload In Context
You can also upload a few file types including markdown, csv, images and videos in context with your /ask request and ask the LLM questions about those files. In order to do this, after creating your model config, you can simply use the POST method on /model/ask/{model_name} and pass the file using the uploaded_file parameter along with the question in the q parameter.



1.	Cortex Platform
2.	How To
3.	Use APIM Gateway
Use APIM Gateway Endpoints to Call Cortex
This document provides step-by-step instructions for application team to register, configure, and access Cortex API through Azure API Management (APIM) Gateway endpoints. By following these instructions, applications will be able to authenticate and interact with Cortex using OAuth 2 client credentials and Entra ID bearer access token.
Steps to Integrate
Step 1: Register Your Application
1.	Follow these instructions to request an app registration in Lilly Entra ID.
2.	Cortex requires one app registration per deployment environment. For example to use all three Cortex environments, dev, QA, and production, three separate Entra app registrations are required.
Step 2: Create a Client Secret and Secret pair on Azure
1.	Once the application is registered, obtain the client_id. You can find the Application (client) ID in the Overview section of your App Registration in Entra admin center.
2.	To generate a client secret in Azure Portal, go to Azure Directory > App Registrations. See instructions from Entra team
3.	Store the client secret securely, as it will be required for authentication to Entra ID.
Step 3: Request Client ID to be added to Access List on Cortex
1.	Retrieve the client_id from your registered Azure application.
2.	Submit a request to the Cortex team to add your ClientId to the access list using following link: ClientID Access.
3.	Wait for the confirmation before proceeding with API Integration. This process could take up to 48 hours to complete.
Step 4: Update Access to Configurations
Go to each configuration(Model, Data, Prompt, and Security) and give access to the new client_id
Include your application client_id as one of the owners of the model or data.
Example:
{
  "name": "healthbot",
  "auth": {
    "owners": [
      "john.doe@lilly.com",
      "c95fc6ad-f31b-4fb1-b959-5c80fd708717"
    ],
    "allow_access_to_reports_of": [],
    "owners_group": [
      ""
    ],
    "access_groups": [
      ""
    ],
    "access_aws_roles": [],
    "owners_aws_roles": [
      "arn:aws:iam::283234040926:role/lrl-light-apps-chatbuilder-prd-ciab"
    ],
    "users": [],
    "private": true
  }
Step 5: Access Cortex APIs via APIM
1.	Once whitelisted, use APIM Gateway endpoints to consume Cortex API.
2.	Use your client ID and client secret to obtain an access token from Entra ID.
3.	Use the access token to authenticate to the APIM endpoints, as shown in the example python code below.
Below are the Internet-facing Cortex APIM Endpoints:
•	Dev Environment: https://gateway.apim-dev.lilly.com/cortex
•	QA Environment: https://gateway.apim-qa.lilly.com/cortex
•	Production Environment: https://gateway.apim.lilly.com/cortex
Below are the Lilly private network-facing Cortex APIM Endpoints:
•	Dev Environment: https://gateway-intranet.apim-dev.lilly.com/cortex
•	QA Environment: https://gateway-intranet.apim-qa.lilly.com/cortex
•	Production Environment: https://gateway-intranet.apim.lilly.com/cortex
If you have doubts, see Azure APIM - which URL should I use?.
The APIM endpoints will accept any valid Lilly Entra ID access token for authentication. Authorization to use Cortex APIs is managed exclusively by Cortex team.
Step 6: Authentication and Cortex API Access (Python Example)
Use the following python script to generate an access token and call Cortex API.
Obtain Access Token
Ensure correct scope is used when requesting access tokens from Entra. (Default scope=api://Cortex.lilly.com/.default)
import requests
#Variables
client_id = "your-client-id"
client_secret = "your-client-secret"
tenant_id = "your-tenant-id"
api_url = "https://gateway.apim-dev.lilly.com/cortex/model"
def get_access_token(client_id, client_secret, tenant_id):
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    payload = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'api://Cortex.lilly.com/.default'
    }
    response = requests.post(token_url, data=payload)
    response.raise_for_status()
    return response.json().get('access_token')
Call a Cortex API using the Token
access_token = get_access_token(client_id, client_secret, tenant_id)
model_name = <testmodelname>
def call_crtx_api(access_token, api_url):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(f"{api_url}/model/{model_name}", headers=headers)
    return response.json()
response = call_crtx_api(access_token, api_url)
print(response)




1.	Cortex Platform
2.	How To
3.	Setup SageMaker
Setting Up Your Development Environment in AWS SageMaker
This guide walks you through the process of setting up a development environment in AWS SageMaker, from creating your domain to launching your first JupyterLab notebook. By following these steps, you’ll establish a powerful cloud-based environment for machine learning development and experimentation.
Prerequisites
Before getting started, ensure you have the following:
•	AWS Account with SageMaker access
•	IAM role with the following permissions:
o	AmazonSageMakerFullAccess
o	AmazonS3FullAccess
Creating a SageMaker Domain
a. Navigate to the AWS Management Console and select Amazon SageMaker AI
 
b . From the Amazon SageMaker AI console, create a domain: a. On the left navigation pane b. Under Admin configurations, choose Domains c. Click Create domain
c. Choose Set up for single user (Quick setup) a. Your domain and user profile will be created automatically b. In the example below, we’ve created the QuickSetupDomain-20250130T111313 domain
For more detailed information on domain creation, refer to the (AWS SageMaker documentation)[https://docs.aws.amazon.com/sagemaker/latest/dg/onboard-quick-start.html]
 
Accessing Your User Profile
a. Select your newly created domain (e.g., QuickSetupDomain-20250130T111313) b. Navigate to the User profiles tab c. Select the default user that has been automatically created
 
d. Select the default user and click Launch Studio
 
Creating a JupyterLab Space
After launching SageMaker Studio, you’ll need to create a JupyterLab space:
1.	Click Create JupyterLab space
2.	For Name, specify a meaningful name for your space
3.	Select one of the following options: a. Share with my domain to create a shared space accessible by others in your domain b. Private domain for a space only accessible by you as the creator
4.	Click Create space
 
e. Configure your instance:
a.	Select the Instance type to specify the Amazon EC2 instance that will run your space
b.	The default instance is ml.t3.medium with 5 GB of storage
c.	You can choose different instance types or storage capacities based on your specific requirements
d.	Click Run space to launch your environment
Instance selection should be based on your computational needs and budget constraints. Larger instances will incur higher costs.
 
Launching Your Notebook
In JupyterLab, you’ll see your newly created notebook environment:
a. To start working with your notebook, click the Run button b. This will initialize your JupyterLab environment and allow you to begin creating and executing notebooks
 
Additional Resources
For more detailed information on creating and managing JupyterLab spaces, refer to the AWS SageMaker JupyterLab documentation.
Next Steps
Now that you have your SageMaker environment set up, you can:
* Install necessary libraries and dependencies
* Import or create datasets
* Develop and train machine learning models
* Deploy models for inference
* Collaborate with team members
Your SageMaker environment provides a fully managed experience for machine learning development, allowing you to focus on building models rather than managing infrastructure.
V


1.	Cortex Platform
2.	How To
3.	Fine-tune LLMs using LlamaFactory
Fine-tuning LLMs using LlamaFactory framework in AWS SageMaker: A Developer’s Guide
This guide walks you through the steps of fine-tuning a Large Language Model (LLM) using LlamaFactory. LlamaFactory is an optimization framework tailored for fine-tuning large language models, offering streamlined workflows for techniques like LoRA, QLoRA, and comprehensive fine-tuning. Fine-tuning involves customizing a pre-trained model to better fit specific tasks, understand your industry’s unique terminology, or generate responses that reflect your organization’s voice and values.
By following this detailed guide, you’ll gain practical experience in setting up your environment, preparing your data, executing the fine-tuning process, and effectively using your newly customized model. Let’s get started!
________________________________________
When to Consider Fine-tuning
Fine-tuning an LLM can be a powerful way to enhance AI capabilities for your specific needs, but it’s not always necessary. Consider fine-tuning when:
•	Domain-specific knowledge is required: Your application deals with specialized terminology, concepts, or data that general-purpose models struggle with (like medical, legal, or technical fields)
•	Consistent style or tone is needed: You want responses that consistently match your brand voice or communication style
•	Task specialization matters: You need the model to excel at specific tasks like summarization, classification, or answering questions in a particular format
•	Privacy concerns exist: You need to build capabilities with proprietary data that shouldn’t be sent to external API providers
•	Cost efficiency for production: You want to reduce ongoing API costs by hosting your own specialized model
•	Reducing hallucinations: You need more reliable and factual responses within your domain of interest
Fine-tuning is likely unnecessary when dealing with general-purpose tasks, when you have very limited data, or when prompt engineering with a larger model would be sufficient.
________________________________________
TABLE OF CONTENTS
•	LLM Fine-tuning Glossary: Terms You Should Know
•	Prerequisites
•	Environment Setup
•	LlamaFactory
•	Data Preparation
•	Fine-tuning Process
•	Model Management
•	Inference
•	Environment Cleanup
•	Space Management
•	Common Issues and Solutions
•	Additional Resources
________________________________________
LLM Fine-tuning Glossary: Terms You Should Know
Core Concepts
•	Base Model: The original pre-trained model before any fine-tuning or adaptation, such as Llama 3, Mistral, or Falcon.
•	Quantization: The process of reducing the precision of the model weights (e.g., from 32-bit to 8-bit or 4-bit) to decrease memory usage and increase inference speed.
•	LoRA (Low-Rank Adaptation): An efficient fine-tuning technique that significantly reduces the number of trainable parameters by adding small, trainable “adapter” matrices to the model instead of updating all weights.
•	QLoRA (Quantized LoRA): A variation of LoRA that further reduces memory requirements by quantizing the base model while keeping adapters in full precision.
Data Formats
•	Alpaca Format: A data format used for instruction-following datasets, consisting of input, instruction, and output fields.
•	ShareGPT Format: A conversational data format that preserves the back-and-forth structure of dialogues between users and assistants.
•	JSON (JavaScript Object Notation) Lines: A convenient format for storing structured data that may be processed one record at a time
LlamaFactory Specific
•	Adapter: In LlamaFactory, refers to the trainable parameters added during LoRA fine-tuning.
•	dataset_info.json: The configuration file in LlamaFactory that contains information about available datasets.
•	train_*.json: Configuration files that specify training parameters, model selection, and dataset choices.
•	llamafactory-cli: The command-line interface tool used to execute training and evaluation commands in LlamaFactory
For a comprehensive list of terms and definitions related to LLMs, please refer to our LLM Glossary document.
________________________________________
Prerequisites
Before beginning the fine-tuning process, ensure you have:
1.	Before fine-tuning the model, you need to create your custom datasets for your specific use case. In the GitHub repo folder, we’ve provided two example datasets: new_alpaca_en_demo.json and new_identity.json in the folder custom_datasets_examples. You can use these as references when creating your own custom datasets. Refer to the Alpaca or ShareGPT documentation from LlamaFactory for detailed instructions to format your custom dataset according to one of these structures for compatibility. These datasets will be used in STEP 4.
2.	AWS SageMaker access. Refer to this link to set up the SageMaker environment
3.	Hugging Face account and access token. Refer to this link for detailed instructions on setting up a Hugging Face account.
________________________________________
Environment Setup
JupyterLab Space Configuration: To set up the JupyterLab Spaces for fine-tuning large language models (LLMs), you’ll need to ensure that the notebook instance has all the required compute resources. This is because the training code runs directly on the notebook instance itself. Here are the key requirements for setting up the Space: * GPU Access: Use an instance like ml.g4dn.xlarge which provides the necessary GPU access for LLM PEFT fine-tuning. * Memory: Ensure that the instance has at least 30GB of memory to handle the model weights and fine-tuning data. Additionally, you need to assess the memory needed based on the llm model and datasets that you will be using.
Create a new Space with the following specifications:
 
________________________________________
LlamaFactory
After you have set up your JupyterLab Space, click on Run space to launch your notebook.
 
The provided Jupyter notebooks are finetune.ipynb and inference.ipynb.
Open the finetune.ipynb notebook. In the code cell, enter the following commands to clone the LLaMA-Factory GitHub repository and install all the required Python packages.
Step 1: Clone the repository from GitHub using the command below: https://github.com/hiyouga/LLaMA-Factory.git
!git clone --depth 1
Step 2: Open LLaMA-Factory Folder
%cd LLaMA-Factory
Step 3: Install the required packages and dependencies using the setup.py file. We can install them using the command below in a Jupyter Notebook cell:
!pip install -e ".[torch,metrics,bitsandbytes]"
Step 4: Check you are at the LLaMA-Factory directory by running the following command in a Jupyter Notebook cell:
You will see something like this :
'/home/sagemaker-user/LLaMA-Factory'
Step 5: Step 3 will install all required dependencies. To ensure correct installation, run the following.
!llamafactory-cli
The following message will appear if the installation is successful.
  The installation of llamafactory has been successfully completed. This means that the LLaMa-Factory framework is ready to use for fine-tuning LLM models!
Please check the LLaMa-Factory folder to familiarize yourself with its contents. The main folder of interest is the ‘data’ folder, which contains example datasets for fine-tuning LLMs. We will also use this folder to upload our custom datasets and update the dataset_info.json file. For more information about the data folder, refer to this link and explore the available datasets and preparation steps.
 
________________________________________
Data Preparation
•	Hugging Face Authentication is required for accessing certain models and datasets. If you have not already, refer to this link for detailed instructions on setting up a Hugging Face account and creating an access token.
•	To execute this step you need to have your custom datasets in the supported format that was mentioned in the prerequisite section.
Navigate to LLaMa-Factory/data and upload your custom datasets in this folder. Additionally, locate the dataset_info.json file.
This is an example of how I have uploaded my custom datasets to the LLaMa-Factory/data and the update of the dataset_info.json file.
 
An important step is updating the dataset_info.json file to include your new custom datasets. This file serves as a registry that keeps track of all available datasets in your environment. For example:
 
In this registry, each key (like “1identity” or “1alpaca_en_demo”) is a unique identifier for a dataset, and the “file_name” property points to the actual JSON file containing that dataset. When you create new custom datasets, you’ll need to add similar entries to this file so the framework can locate and use them during the fine-tuning process. This dataset registration step is essential before proceeding with model fine-tuning.
________________________________________
Fine-tuning Process
Configuration File Setup
Note that a GPU is a must to train an LLM using Llama-factory. You can check the GPU environment by running the following code in a Jupyter Notebook cell:
import torch
try:
    assert torch.cuda.is_available() is True
except AssertionError:
    print("Please set up a GPU before using LLaMA Factory")

Create the train_llama3.json configuration file where you can specify the model’s name from Hugging Face, the dataset or datasets used, and the fine-tuning hyperparameters such as learning rate, batch size, and number of epochs. For more information about models, data and fine-tuning hyperparameters, refer to this link. Note that we are using the two updated datasets.
 
Training Execution
1.	Run the training command:
!llamafactory-cli train train_llama3.json
The command automatically sets up all required datasets, models, and pipelines for fine-tuning. Training one epoch on a ml.g4dn.xlarge instance with the two updated datasets takes approximately three minutes. The output model is saved in the specified output directory (llama3_lora) provided in the JSON config file.
During training, you may see a message similar to the image below, please enter 3 to continue with the fine-tuning.
 
Once fine-tuning is complete, a new folder “llama3_lora” will appear in the Llama-Factory folder. This llama3_lora contains the fine-tuned weights of the fine-tuned model. You can share this file with Cortex team to host this finetune model in Cortex so you can use it for inference.
 
Additionally, you can check the output to be similar like the following:
  Congrats, you have fine-tuned an LLM!
________________________________________
Model Management
Saving Fine-tuned Models to S3
The fine-tuned model weights will be saved in the specified output directory (e.g llama3_lora).
S3 Upload Process
a. Please provide the s3 bucket name.
 
b. Check your S3 bucket to ensure all the files are uploaded correctly.
 
Always verify the upload was successful before cleaning up local files
You can also zip your fine-tuned model weights using tarfile and upload it to S3.
 
You can check the tar file uploaded in your s3 bucket.
 
The model weights can be shared with the Cortex team for hosting. Additionally, it will be necessary to provide the inference code. The following section provides a general inference code, but it can be customized if a specific inference format is required.
________________________________________
Inference
The fine-tuned model is now ready for use!
The inference.ipynb notebook is used here. It needs to be in the same directory as the finetune.ipynb notebook. The following 3 files inference_pipeline.py, predict.py and config.py need to be inside the LLaMA-Factory folder.
Install Python Libraries
This tutorial utilizes the following Python libraries:
    * [transformers](https://pypi.org/project/transformers/) - for defining the model, tokenizer, and trainer.
    * [peft](https://pypi.org/project/peft/) - for creating a LoRA adapter on top of the Transformer model.
    * [bitsandbytes](https://pypi.org/project/bitsandbytes/) - for loading the base model with 4-bit quantization for QLoRA.
    * [accelerate](https://pypi.org/project/accelerate/) - a dependency required by bitsandbytes.
The notebook has been tested with: transformers==4.49.0, peft==0.14.0, bitsandbytes==0.42.0, accelerate==1.4.0 and torch==2.6.0
Step 1: Install and import libraries
You can install the individual libraries
!pip install torch !pip install transformers accelerate peft !pip install -U bitsandbytes
Or you could also install the requirements.txt file attached with the code.
!pip install -r requirements.txt

from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch
Step 2: Check your directory is LLaMA-Factory and make sure the files config.py, inference_pipeline.py and predict.py are saved in this directory %pwd
'/home/sagemaker-user/LLaMA-Factory'
Step 3: Make sure you are login into Hugging Face Refer to this link to make sure you have access to HuggingFace
Step 4: Assigned the model path to a variable model_path = "llama3_lora" model_path
Step 5: Import the predict function from the predict.py file
# Make Predictions (RUN ONLY ONCE)

from predict import CallLLM

#Initialize the predictor
service = CallLLM(model_path)
Step 6: Inference the model.
text = "Describe the process of making pancakes"
response = service.predict(text)
print(response)
Step 6 should provide a response if everything is working correctly. If you are done with testing your new model and you are done, please shout down the Jupyter notebook. Follow Step 8.
________________________________________
Environment Cleanup
After you are done with fine-tuning and inferencing your model. Shut down the Space in SageMaker to avoid unnecessary charges.
Shutting Down Resources
1.	Save all important outputs
2.	Close all notebook kernels:
Select “Shut Down All” under KERNELS
 
Confirm shutdown
 
You can see the KERNEL is empty and no notebooks are there. You can close the JupyterLab tab.
 
________________________________________
Space Management
a. Navigate to the llama-factory-framework Space and click “Stop space”
 
b. Confirm the action
 
c. Verify the status shows as “Stopped” in the SageMaker console, indicating you have successfully shut down the Space and no additional charges will incur for the instance ml.g4dn.xlarge.
 
Tip: You can either delete the Space or leave it stopped for future use
________________________________________
Common Issues and Solutions
1.	GPU Not Available a. Solution: Verify Space instance type and configuration
2.	Memory Errors a. Solution: Reduce batch size, model size or increase Space storage
3.	Authentication Failures a. Solution: Check Hugging Face token validity
________________________________________
Additional Resources
•	LlamaFactory Documentation
•	Hugging Face Documentation
•	SageMaker Documentation




1.	Cortex Platform
2.	How To
3.	Content Cache API Instructions
Context Cache API Instructions
Model Compatibility
Context caching is supported for Gemini models, including Gemini 2.0 Flash.
APIs
1. Cache Create API
Allows users to:
•	Upload a file
•	Provide system instructions
•	Set a Time-To-Live (TTL)
2. Cache Get API
Retrieves cache metadata by name:
•	Creation time
•	Update time
•	Expiration time
•	Existence check (expired caches return “not found”)
Cache content is not retrievable.
3. Cache Update API
Modifies the TTL of an existing cache.
Expired caches cannot be updated.
4. Cache Deletion API
Deletes the specified cache.
Usage
When creating a model_config, users can specify a cache_name. This name will be used during /model/ask API calls to reference the cache.
Important Considerations
•	Gemini models are shared across teams. Cache overwrites are possible.
•	Two usage scenarios:
o	Separate Cache Sizes: Caches with different sizes (e.g., 80 vs. 50) are only loaded into the context window when explicitly referenced via cache_name.
o	Immediate Context Usage: Some caches may occupy context window space immediately upon creation, which can cause conflicts.
Continue with the current approach. Context cache adoption by other clients is not immediate.
If cache overwrites become problematic, consider deploying a separate Gemini instance.



1.	Cortex Platform
2.	How To
3.	Surfacting Fine Tuned Models on Cortex
Surfacing a Fine-Tuned Models on Cortex
Scenario Overview
•	Client AWS Account: Owns and has fine-tuned the model.
•	Cortex AWS Account: Wants to access and use the model for inference.
Prerequisites
1. AWS Organizations
•	Ensure both accounts are under the same AWS Organization and resource sharing via AWS Resource Access Manager (RAM) must be enabled.
2. IAM Permissions
CLIENT AWS ACCOUNT (MODEL OWNER)
a. RAM Permissions
Attach the following policy to the IAM role used for sharing:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ShareResources",
      "Effect": "Allow",
      "Action": [
        "ram:CreateResourceShare",
        "ram:UpdateResourceShare",
        "ram:DeleteResourceShare",
        "ram:AssociateResourceShare",
        "ram:DisassociateResourceShare",
        "ram:GetResourceShares"
      ],
      "Resource": ["${model-arn}"]
    }
  ]
}
Replace ${model-arn} with the actual model ARN.
b. Amazon Bedrock Permissions
Attach this custom policy (if AmazonBedrockFullAccess is not already present):
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ShareCustomModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:GetCustomModel",
        "bedrock:ListCustomModels",
        "bedrock:PutResourcePolicy",
        "bedrock:GetResourcePolicy",
        "bedrock:DeleteResourcePolicy"
      ],
      "Resource": ["${model-arn}"]
    }
  ]
}
Replace ${model-arn} with the actual model ARN.
Cortex AWS Account (Model Consumer): Ensure IAM role for Cortex includes permissions for Amazon Bedrock and inference usage of shared models.
Steps to Share and Access the Model
In Client AWS Account (Model Owner)
SHARE THE MODEL VIA AWS RAM
1.	Go to Amazon Bedrock Console → Custom models.
2.	Click the ⋮ menu next to the target model → Select “Share”.
3.	Fill the form:    - Name: Custom shared name.    - Recipient Account ID: Cortex AWS account ID.
4.	Click Share model.
MODEL AVAILABILITY
•	The model becomes visible in the recipient’s AWS RAM console.
________________________________________
In Cortex AWS Account (Model Consumer)
ACCEPT THE SHARED MODEL
1.	Go to AWS RAM Console → Shared with me tab.
2.	Find the shared model and click Accept.
COPY THE MODEL TO DESIRED REGION
•	After accepting, copy it to your preferred AWS Region via the Bedrock Console.
USE THE MODEL IN BEDROCK
1.	Go to Amazon Bedrock Console → Custom models.
2.	The shared model should appear with status “Shared”.
3.	Begin using it for inference.
________________________________________
Add the Custom Model to Cortex
1.	Ensure Model is Enabled
2.	Add Model in Cortex    - Follow the internal process for adding a model in Cortex.



1.	Cortex Platform
2.	How To
3.	Implement Linear Chains
Linear Chain with Prompt Tuning
Introduction
Linear chains provide a systematic way to manage workflows, ensuring each operation is executed in a strict, predictable sequence. When integrated with Cortex, linear chains can be orchestrated efficiently using prompt tuning—leveraging both supervisor prompts and system prompts. This document explains best practices and provides practical examples for building robust linear chains in Cortex.
________________________________________
Key Concepts
Linear Chain
A linear chain enforces a fixed order of operations, ideal for scenarios requiring precision—such as mathematical calculations, workflow automation, or multi-step processes.
Prompt Tuning
Prompt tuning is the art of crafting instructions to guide AI model behavior. In linear chains, two prompt types are essential:
•	Supervisor Prompts: Task-specific, detailed instructions.
•	System Prompts: High-level principles for workflow management.
________________________________________
Implementing Linear Chains in Cortex
Use Case 1: Arithmetic Operations with Standard Operator Precedence

Supervisor Prompt Example:
You are a mathematics assistant proficient in performing arithmetic operations following the rule of operator precedence. The precedence is as follows:
1. **Brackets** (solve expressions within parentheses first)
2. **Orders** (evaluate exponents or roots next)
3. **Division and Multiplication** (from left to right)
4. **Addition and Subtraction** (from left to right)
Use the available tools to perform arithmetic operations: addition, subtraction, multiplication, and division. Follow these guidelines when responding to queries:
1. Tool Usage: Use the provided tools to calculate results. Return the tool's response directly without altering it.
2. Chaining Calculations: Pass the output of one tool as the input to another when necessary to handle multi-step calculations.
3. Caching: Use the caching tool to store intermediate or final results if they are needed later.
Always ensure responses strictly follow the operator precedence outlined above.

Example Workflow

Input Expression
Solve: (3 + 2) * 5 - (3 - 1) * 6
Execution Steps
{
  "steps": [
    {
      "name": "AddNumbers",
      "message": "\nInput: 3, 2\n\nResponse: 3.0 + 2.0 = 5.0\n",
      "status": "done"
    },
    {
      "name": "MultiplyNumbers",
      "message": "\nInput: 5.0, 5\n\nResponse: 5.0 × 5.0 = 25.0\n",
      "status": "done"
    },
    {
      "name": "SubtractNumbers",
      "message": "\nInput: 3, 1\n\nResponse: 3.0 - 1.0 = 2.0\n",
      "status": "done"
    },
    {
      "name": "MultiplyNumbers",
      "message": "\nInput: 2.0, 6\n\nResponse: 2.0 × 6.0 = 12.0\n",
      "status": "done"
    },
    {
      "name": "SubtractNumbers",
      "message": "\nInput: 25.0, 12.0\n\nResponse: 25.0 - 12.0 = 13.0\n",
      "status": "done"
    }
  ]
}
Final Output
The result of the expression (3 + 2) * 5 - (3 - 1) * 6 is 13.0.
________________________________________
Use Case 2: Arithmetic Operations with Custom Operator Precedence
The following supervisor example is designed to negate the BODMAS/PEMDAS rule on which the GenAi has been trained.
Input Expression
Solve: 5+3*9-7/2-0
Supervisor Prompt:
You are a mathematical assistant specialized in solving expressions using a custom order of operations. Follow these rules strictly:

1. **PRIORITY RULE**: Addition and subtraction are prioritized before multiplication and division, irrespective of their position in the expression.
2. **DIRECTION**: Within each operation type (addition, subtraction, multiplication, division), evaluate from left to right.
3. **PARENTHESES**: Expressions inside parentheses are evaluated first, adhering to the same custom rules within them.
4. **REIMAGINING EXPRESSIONS**: Reimagine the expression to group terms such that addition and subtraction are handled first. For example:
   - Input: `3+2*8-7+7-1`
   - Reimagined: `(3+2)*(8-7)+(7-1)`

You must:
- Reorganize the expression to comply with the custom rules.
- Use parentheses to clearly indicate the new grouping.
- Solve step-by-step, providing intermediate results for each step.

Use the tools provided to perform individual calculations and return the results directly without modifying them. Ensure the reimagining and solving processes follow this custom order of operations exactly.
Execution Steps
{
  "message": "Reimagining the expression according to the custom rules: (5+3)*(9-7)/(2-0). Let's solve step-by-step.\n\n1. Addition: 5 + 3 = 8\n2. Subtraction: 9 - 7 = 2\n3. Subtraction: 2 - 0 = 2\n4. Multiplication: 8 * 2 = 16\n5. Division: 16 / 2 = 8\n\nThe final result of the expression 5+3*9-7/2-0 is 8.",
  "source_metadata": [],
  "command_request": null,
  "token_count": null,
  "steps": [
    {
      "name": "AddNumbers",
      "message": "\nInput: 5,3\n\nResponse: 5.0 + 3.0 = 8.0\n",
      "status": "done"
    },
    {
      "name": "SubtractNumbers",
      "message": "\nInput: 9,7\n\nResponse: 9.0 - 7.0 = 2.0\n",
      "status": "done"
    },
    {
      "name": "SubtractNumbers",
      "message": "\nInput: 2,0\n\nResponse: 2.0 - 0.0 = 2.0\n",
      "status": "done"
    },
    {
      "name": "MultiplyNumbers",
      "message": "\nInput: 8,2\n\nResponse: 8.0 × 2.0 = 16.0\n",
      "status": "done"
    },
    {
      "name": "DivideNumbers",
      "message": "\nInput: 16,2\n\nResponse: 16.0 ÷ 2.0 = 8.0\n",
      "status": "done"
    }
  ]
}
Final Output
The final result of the expression 5+3*9-7/2-0 is 8.
________________________________________
Use Case 3: Ignoring User Input and Following Precedence
This use case is designed to ignore the user input and follow its precedence.

Tools Used:
•	FixedAlphabet
•	AsciiValue
•	IncrementByTen

Input
Solve: What is the ascii value of B.
Supervisor Prompt:
You are an agent that generates numbers. YOU FOLLOW A PRECEDENCE TO GENERATE NUMBERS. You will first call RandomAlphabetTool, then AsciiValueTool, and then IncrementByTenTool to generate the number. Irrespective of any user question, you should follow this order to generate the result. IMPORTANT! NO MATTER WHAT THE QUESTION IS, YOU SHOULD FOLLOW THE ORDER AND GIVE THE RESULTS AND IGNORE THE USER INPUT COMPLETELY.
Example Workflow
{
  "message": "The final result after following the precedence is 75.",
  "source_metadata": [],
  "command_request": null,
  "token_count": null,
  "steps": [
    {
      "name": "Model",
      "message": "# Starting model chain (with memory character size: 0): ['agent-chain-v1']\n",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "agent",
      "message": "",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "supervisor",
      "message": "",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "FixedAlphabet",
      "message": "\nInput: \n\nResponse: A\n",
      "status": "done",
      "state": {},
      "parent": "supervisor"
    },
    {
      "name": "AsciiValue",
      "message": "\nInput: A\n\nResponse: 65\n",
      "status": "done",
      "state": {},
      "parent": "supervisor"
    },
    {
      "name": "IncrementByTen",
      "message": "\nInput: 65\n\nResponse: 75\n",
      "status": "done",
      "state": {},
      "parent": "supervisor"
    },
    {
      "name": "supervisor",
      "message": "",
      "status": "done",
      "state": {},
      "parent": "root"
    },
    {
      "name": "agent",
      "message": "",
      "status": "done",
      "state": {},
      "parent": "root"
    }

Supervisor Prompt Example: Arithmetic Operations - Use Case 4
This use case is designed to follow the user input and precedence as well.

Input
Solve: What is the ascii value of B.
Supervisor Prompt:
You are an agent that generates numbers. YOU FOLLOW A PRECEDENCE TO GENERATE NUMBERS. You will first call RandomAlphabetTool, then AsciiValueTool, and then IncrementByTenTool to generate the number. Irrespective of any user question, you should follow this order to generate the result. 
Example Workflow
{
  "message": "The ASCII value of 'B' is 66. However, based on the predefined process, the generated number is 75.",
  "source_metadata": [],
  "command_request": null,
  "token_count": null,
  "steps": [
    {
      "name": "Model",
      "message": "# Starting model chain (with memory character size: 0): ['agent-chain-v1']\n",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "agent",
      "message": "",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "supervisor",
      "message": "",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "FixedAlphabet",
      "message": "\nInput: A\n\nResponse: A\n",
      "status": "done",
      "state": {},
      "parent": "supervisor"
    },
    {
      "name": "AsciiValue",
      "message": "\nInput: A\n\nResponse: 65\n",
      "status": "done",
      "state": {},
      "parent": "supervisor"
    },
    {
      "name": "IncrementByTen",
      "message": "\nInput: 65\n\nResponse: 75\n",
      "status": "done",
      "state": {},
      "parent": "supervisor"
    },
    {
      "name": "supervisor",
      "message": "",
      "status": "done",
      "state": {},
      "parent": "root"
    },
    {
      "name": "agent",
      "message": "",
      "status": "done",
      "state": {},
      "parent": "root"
    }
  ],
  "logprobs": {}
}
________________________________________
Best Practices for Effective Prompting
1. Establishing Precedence in the Prompt
•	Explicit Priority: Clearly define the order of operations or steps in your prompt. Use numbering or bullet points to ensure clarity.
•	Caps for Emphasis: Highlight key rules or instructions in uppercase to grab attention. For example: “ALWAYS FOLLOW THE SPECIFIED SEQUENCE.”
EXAMPLE:
You MUST follow this order of operations:
1. PARENTHESES
2. ADDITION AND SUBTRACTION
3. MULTIPLICATION AND DIVISION
2. Few-Shot Prompting
•	Provide examples within the prompt to set a clear context. Include both inputs and outputs to illustrate the expected behavior.
EXAMPLE:
Example 1:
Input: Solve (3 + 5) * 2
Output: 16

Example 2:
Input: Solve 4 + 3 * 2
Output: 10
3. Use of Step-by-Step Instructions
•	Break down the task into smaller steps and guide the system to complete one step at a time.
EXAMPLE:
Step 1: Identify operations in parentheses.
Step 2: Evaluate multiplication or division next.
Step 3: Perform addition or subtraction.
4. Reframing User Inputs
•	Reinterpret or reorganize the user input to align with the process flow.
EXAMPLE:
Input: Solve 5+3*9-7/2-0
Reframed: (5+3)*(9-7)/(2-0)
5. Caching Intermediate Results
•	Store results from intermediate steps to maintain consistency and prevent recalculations.
EXAMPLE PROMPT:
Store the result of Step 1 in memory. Use it for Step 2.
6. Specifying Tool Usage
•	Provide explicit instructions on which tools to use for which steps.
EXAMPLE:
Use the addition tool for Step 1 and the multiplication tool for Step 2. Return tool results without modification.
7. Structured Outputs
•	Define a standard format for responses to ensure consistency in the output.
EXAMPLE:
Response Format:
- Step 1 Result: ...
- Step 2 Result: ...
- Final Output: ...
8. Handling Ambiguous Inputs
•	Include fallback instructions for unclear or incomplete inputs.
EXAMPLE:
If the input is ambiguous, return: "Please clarify the expression."
9. Iterative Refinement
•	Allow for correction and re-execution of steps based on feedback or errors.
EXAMPLE:
If an error is detected, restart from Step 1.
10. Contextual Awareness
•	Maintain a focus on the goal and prevent deviation by reiterating the objective in the prompt.
EXAMPLE:
The goal is to solve the expression accurately. Do not perform additional operations.
11. Example Chains for Complex Workflows
•	Use multi-step examples to illustrate workflows with dependencies.
EXAMPLE CHAIN:
Input: Calculate 5 + (3 * 2)
1. Solve inside parentheses: 3 * 2 = 6
2. Add 5 + 6 = 11
Output: 11

________________________________________
Evaluation Results: Multiple Iterations of Ignoring User Input
The following table summarizes the evaluation framework results for multiple benchmark questions where the system was instructed to ignore user input and follow the fixed tool sequence. The results demonstrate the consistency of the output regardless of the input.
Question	LLM Response	Ground Truth	Answer Correctness	Answer Relevancy	Semantic Similarity
What is the ASCII value of the letter ‘A’?	The final result after following the precedence is 75.	The generated number is 75.	0.146	0.110	0.583
What is the ASCII value of the letter ‘a’?	The final result after following the precedence is 75.	The generated number is 75.	0.146	0.103	0.583
What is the ASCII value of the space character?	The final result after following the sequence of tool calls is 75.	The generated number is 75.	0.139	0.079	0.557
What is the ASCII value of the letter ‘Z’?	The final result after following the sequence of tool calls is 75.	The generated number is 75.	0.139	0.081	0.557
What is the ASCII value of the letter ‘z’?	The final result after following the precedence is 75.	The generated number is 75.	0.146	0.130	0.583
Generate a number?	The generated number is 75.	The generated number is 75.	1.000	0.740	1.000
What is 100 incremented by 10	The result of the sequence of tool calls is 75. The process followed was: 1. FixedAlphabet tool returned ‘A’. 2. AsciiValue tool returned 65 for ‘A’. 3. IncrementByTen tool incremented 65 by 10 to give 75.	The generated number is 75.	0.375	0.252	0.498
What is 10 plus the ASCII value of the digit ‘9’?	The final result after following the sequence of tool calls is 75.	The generated number is 75.	0.514	0.168	0.557
What is the ASCII value of the exclamation mark ‘!’?	The final result after following the sequence of tool calls is 75.	The generated number is 75.	0.139	0.095	0.557
What is the ASCII value of the at symbol ‘@’?	The final result after following the sequence of tool calls is 75.	The generated number is 75.	0.139	0.094	0.557
What is the ASCII value of the dollar sign ‘$’?	The final result after following the precedence is 75.	The generated number is 75.	0.146	0.095	0.583
Notes:
•	All responses consistently ignore the user input and follow the fixed tool sequence.
•	The answer correctness and semantic similarity metrics show the framework’s evaluation of the generated responses.
Benefits of Using Linear Chains
•	Precision: Strict adherence to predefined rules or workflows.
•	Traceability: Each step in the chain is logged for transparency.
•	Consistency: Reduces variability in task execution.
________________________________________
Conclusion
By combining supervisor and system prompts, Cortex enables robust linear chains for complex, multi-step tasks. This approach enhances reliability, transparency, and scalability—making it ideal for high-precision applications.




1.	Cortex Platform
2.	How To
3.	MCP Integration
Creating and Running MCP Server
Introduction
The Model Context Protocol (MCP) server enables you to expose Python functions as tools for use in agent-chain within the Cortex platform. This guide walks you through implementing, configuring, and running an MCP server using FastMCP, with practical examples for tool registration and serving.
Key Concepts
MCP Server
The Model Context Protocol is an open standard that enables developers to build secure, two-way connections between their data sources and AI-powered tools. An MCP server exposes tools (functions) to be orchestrated by agents. It leverages the FastMCP framework for rapid tool registration and Streamable-HTTP transport for serving.
Tools
Tools are Python functions decorated with @mcp.tool() that can be invoked by the agent. Each tool should have a clear docstring and type annotations for input/output.
Step-by-Step Implementation
1. Project Setup
Ensure you have the following dependencies in your requirements.txt:
mcp[cli]==1.9.3
Install them with:
pip install -r requirements.txt
2. MCP Server Implementation
Below is a breakdown of the main components in server.py:
MCP SERVER AND TOOL REGISTRATION
import json
import logging
from typing import Any, Dict, List

import requests
from mcp.server.fastmcp import FastMCP

LOGLEVEL = "INFO"


def get_logger(name: str) -> logging.Logger:
    """
    Return logger with given name
    """
    ch = logging.StreamHandler()
    ch.setLevel(LOGLEVEL)
    ch.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )
    logger = logging.getLogger(name)
    logger.addHandler(ch)
    logger.setLevel(LOGLEVEL)
    return logger


logger = get_logger(__name__)

mcp = FastMCP("Weather Server", host="0.0.0.0", port=6000)

@mcp.tool()
def get_weather(city: str) -> str:
    """
    Get the weather for a given city.
    """
    logger.info("Received the request in get_weather")
    api_url = "https://wttr.in"
    response = requests.get(f"{api_url}/{city}", timeout=30)
    return response.text

@mcp.tool()
def add_numbers(a: int, b: int) -> int:
    """
    Add two numbers.
    """
    logger.info("Received the request in add_numbers")
    return a + b

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
Example: Arithmetic and Weather Tools
With the above setup, your MCP server exposes two tools:
•	get_weather(city: str) -> str: Returns weather information for a city.
•	add_numbers(a: int, b: int): Adds two numbers.
You can extend this by adding more tools following the same pattern.
Once the server is up and running, create the toolkit config and model config so that the agents can discover the tools within the MCP server and use the tools in the agent chain.
Creating the Toolkit
{
  "allowed_model_configs": [
    "mcp-server-sample-model-config"
  ],
  "auth": {
    "owners": [
      "testuser@lilly.com"
    ],
    "private": true
  },
  "description": "mcp-server-sample-toolkit",
  "name": "mcp-server-sample-toolkit",
  "server": "mcp://mcp_server:6000",
  "agent_tool_max_iterations": 7,
  "allowed_file_types": [
    "*"
  ]
}
Upon hitting the endpoint /toolkits/{toolkit_name}/describe, the response would be:
[
  {
    "name": "get_weather",
    "description": "Get the weather for a given city.",
    "json_input_schema": "{\"properties\": {\"city\": {\"title\": \"City\", \"type\": \"string\"}}, \"required\": [\"city\"], \"type\": \"object\"}"
  },
  {
    "name": "add_numbers",
    "description": "Add two numbers.",
    "json_input_schema": "{\"properties\": {\"a\": {\"title\": \"A\", \"type\": \"integer\"}, \"b\": {\"title\": \"B\", \"type\": \"integer\"}}, \"required\": [\"a\", \"b\"], \"type\": \"object\"}"
  }
]
This confirms that Cortex can connect to the MCP server and list all the tools.
Creating the Model Config
{
  "name": "mcp-server-sample-model-config",
  "auth": {
    "owners": [
      "testuser@lilly.com"
    ],
    "private": true
  },
  "displayName": "mcp-server-sample-model-config",
  "model_description": "mcp-server-sample-model-config",
  "chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "max_turns": 50,
        "supervisor": {
          "prompt": "You are a supervisor agent which has access to 2 tools which do addition of 2 numbers and also can answer the questions about weather provided the city name",
          "description": "Handoff to supervisor once the response from child agent is received"
        },
        "resources": {
          "executables": [
            {
              "name": "get_weather",
              "type": "tool-call",
              "description": "This tool gets the weather details about the city. Input is city name."
            },
            {
              "name": "add_numbers",
              "type": "tool-call",
              "description": "This tool performs the addition of 2 numbers. Input is 2 numbers and returns the sum of 2 numbers"
            }
          ]
        }
      }
    }
  ],
  "toolkits": [
    "mcp-server-sample-toolkit"
  ],
  "allowed_tools_list": [
    "get_weather",
    "add_numbers"
  ]
}
Testing the Ask Endpoint
Using the /model/ask/{model} endpoint:
QUESTION:
How is the climate in Bangalore?
RESPONSE:
{
  "message": "The climate in Bangalore is currently partly cloudy with a temperature of +24°C (feels like 26°C). The wind is blowing from the northeast at 25 km/h, and there is no precipitation expected.",
  "steps": [
    {
      "name": "Model",
      "message": "# Starting model chain (with memory character size: 0): ['agent-chain-v1']\n",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "agent",
      "message": "",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "supervisor",
      "message": "",
      "status": "running",
      "state": {},
      "parent": "root"
    },
    {
      "name": "get_weather",
      "message": "\nInput: {\"city\": \"Bangalore\"}\n\nResponse: Weather report: Bangalore\n\n  Partly cloudy\n  +24°C (feels like 26°C)\n  Wind: 25 km/h\n  No precipitation expected.",
      "status": "done",
      "state": {},
      "parent": "supervisor"
    },
    {
      "name": "supervisor",
      "message": "",
      "status": "done",
      "state": {},
      "parent": "root"
    },
    {
      "name": "agent",
      "message": "",
      "status": "done",
      "state": {},
      "parent": "root"
    }
  ]
}
This confirms that an agent can identify and use tools from the MCP server as per the provided question.
Please refer to the repositories below for more details:
•	pinecone-mcp-server-syed
•	LRL_light_k8s_infra_apps





1.	Cortex Platform
2.	How To
3.	Working with File Attachments in Cortex Tools
Working with File Attachments in Cortex Tools
Learn how to handle file attachments in Cortex tools when building agents for the Cortex platform. This guide demonstrates how to process files uploaded by users through presigned S3 URLs in your custom tools.
Getting Started
To work with file attachments in Cortex tools, follow the guides for Creating an Agent Tool for the Cortex Platform and Cortex Agentic V2 Framework Multiagent Guide. These guides provide the foundation for creating tools that can be integrated with Cortex agents.
________________________________________
Uploading Files via the /ask Endpoint
When users need to send files to Cortex agents, they use the /ask endpoint with multipart/form-data. This section explains how file uploads flow from the API to agent tools.
Upload Flow Overview
1.	Client uploads file → 2. API stores in S3 → 3. Agent chain receives S3 location → 4. Presigned URL generated → 5. Tool receives attachment
API Endpoint Structure
The POST /ask/{model} endpoint accepts multipart form data:
@router.post("/ask/{model}", tags=["Model | Ask"])
async def ask_handler(
    model: str,
    q: Annotated[str, Form(...)],  # The question/query
    uploaded_file: Annotated[UploadFile | bytes, File(...)] = None,  # File upload
    # ... other parameters
)
Client Upload Example
curl -X POST "http://api/model/ask/your-agent-model" \
  -H "x-user: username" \
  -H "x-groups: groups" \
  -F "q=What is in this document?" \
  -F "uploaded_file=@/path/to/document.pdf"
Upload Processing Steps
The API validates file size and type based on model configuration. Files are then renamed with UUIDs and stored in S3: The agent chain receives the S3 location:
   context = {
       "uploaded_file_bucket": bucket,
       "uploaded_file_key": key,
   }
When tools are invoked, the framework generates presigned URLs:
   presigned_url = generate_presigned_url(s3_client, bucket, key)
   attachment = Attachment(
       name=filename,
       link=presigned_url,
       description="Uploaded file from user"
   )
Tools then receive attachments in the _attachments parameter:
   {
     "_attachments": [
       {
         "name": "document.pdf",
         "link": "https://s3.amazonaws.com/bucket/path?presigned-url-params",
         "description": "Uploaded file from user"
       }
     ]
   }
Protobuf Support
For gRPC-based tools, attachments are transmitted using the protobuf Attachment message:
message Attachment {
  string name = 1;  // File name
  string link = 2;  // Presigned S3 URL
  string description = 3;  // Metadata about the file
}
The framework automatically converts between the Pydantic Attachment model and protobuf format when communicating with gRPC tools.
Basic Attachment Processing
Here’s a complete example of processing attachments in a Cortex tool:
def process_with_attachments(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process attachments from the parameter dict.
    Downloads files from presigned URLs and returns their content.
    """
    logger.info(
        f"process_with_attachments called with params keys: {list(params.keys())}"
    )
    result: Dict[str, Any] = {"message": "Processed successfully", "attachments": []}
    attachments_list: List[Dict[str, Any]] = result["attachments"]

    # Extract attachments if present
    attachments = params.get("_attachments", [])
    logger.info(f"Found {len(attachments)} attachments")
    if not attachments:
        logger.info("No attachments found in params")
        return result

    for attachment in attachments:
        try:
            # Check for both 'url' and 'link' fields (Cortex uses 'link')
            url = attachment.get("url") or attachment.get("link")
            filename = attachment.get("name", "unknown")

            if not url:
                logger.warning(f"No URL found for attachment {filename}")
                continue

            logger.info(f"Processing attachment {filename} with URL: {url[:100]}...")

            # Download file content
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            # Process content (limit to 10KB or 100 lines for demo)
            content = response.content
            text_content = content[:10240].decode(
                "utf-8", errors="ignore"
            )  # First 10KB
            lines = text_content.split("\n")[:100]  # First 100 lines

            attachment_info = {
                "filename": filename,
                "size": len(content),
                "preview": "\n".join(lines),
                "lines_shown": len(lines),
                "presigned_url": url,  # Return the presigned URL for the agent to use
            }
            attachments_list.append(attachment_info)

        except Exception as e:
            # filename should be defined from the try block above
            attachment_filename = attachment.get("name", "unknown")
            logger.error(f"Error processing attachment {attachment_filename}: {e}")
            attachments_list.append({"filename": attachment_filename, "error": str(e)})

    return result
Cortex Tool with Attachment Support
Create a Cortex tool that can handle both queries and file attachments:
@mcp.tool()
def process_query_with_attachments(**kwargs) -> Dict[str, Any]:
    """
    Process a query with optional file attachments.

    This tool accepts arbitrary keyword arguments to handle dynamic attachment data
    from the Cortex agent framework.
    """
    logger.info(f"Received kwargs: {kwargs}")
    logger.info(f"Type of kwargs: {type(kwargs)}")
    logger.info(
        f"Keys in kwargs: {list(kwargs.keys()) if isinstance(kwargs, dict) else 'N/A'}"
    )

    # Extract query and attachments from kwargs
    query = kwargs.get("query", "")

    # The attachments might come in different ways depending on how the tool is called
    attachments = None

    # Check if there's a nested kwargs structure (most common from Cortex)
    if "kwargs" in kwargs:
        nested_kwargs = kwargs["kwargs"]
        # Handle case where kwargs is a JSON string
        if isinstance(nested_kwargs, str):
            try:
                nested_kwargs = json.loads(nested_kwargs)
                logger.info(f"Parsed nested kwargs from string: {nested_kwargs}")
            except json.JSONDecodeError:
                logger.warning(f"Could not parse kwargs string: {nested_kwargs}")
                nested_kwargs = {}

        if isinstance(nested_kwargs, dict):
            logger.info(f"Found nested kwargs: {nested_kwargs}")
            if "_attachments" in nested_kwargs:
                attachments = nested_kwargs["_attachments"]
                logger.info(
                    f"Found attachments in nested kwargs._attachments: {attachments}"
                )
            elif "attachments" in nested_kwargs:
                attachments = nested_kwargs["attachments"]
                logger.info(
                    f"Found attachments in nested kwargs.attachments: {attachments}"
                )
            # Also extract query from nested kwargs if present
            if "query" in nested_kwargs:
                query = nested_kwargs["query"]

    # Check if _attachments is directly in kwargs (check this regardless of nested kwargs)
    if "_attachments" in kwargs and attachments is None:
        attachments = kwargs["_attachments"]
        logger.info(f"Found attachments in top-level _attachments: {attachments}")
    # Check if attachments is in the top level
    elif "attachments" in kwargs:
        attachments = kwargs["attachments"]
        logger.info(f"Found attachments in attachments: {attachments}")
    # Check if there's a nested structure in input
    elif "input" in kwargs and isinstance(kwargs["input"], str):
        try:
            # Try to parse input as JSON
            input_data = json.loads(kwargs["input"])
            if isinstance(input_data, dict) and "_attachments" in input_data:
                attachments = input_data["_attachments"]
                logger.info(f"Found attachments in parsed input: {attachments}")
        except json.JSONDecodeError:
            logger.info("Could not parse input as JSON")

    # Create params dict for processing
    params = {"query": query, "_attachments": attachments or []}

    # Process attachments if present
    result = process_with_attachments(params)
    result["query"] = query

    logger.info(f"Returning result with {len(result['attachments'])} attachments")

    return result
Key Concepts
Attachment Structure
When Cortex passes attachments to your tool, they come in this format:
{
  "_attachments": [
    {
      "name": "example.txt",
      "link": "https://s3.amazonaws.com/bucket/path?presigned-url-params"
    }
  ]
}
Considerations for working with Tools and File Attachments
Developers should keep some concepts in mind when working with files in S3 in Cortex. Attachments are provided as time-limited presigned S3 URLs that must be downloaded within their validity period. Cortex uses the field name link for the URL field, though some systems may use url instead, so it’s important to check for both. Attachments may be nested within kwargs or other parameter structures depending on how your tool is invoked. You should always handle download failures gracefully as network issues or expired URLs can cause problems. Consider implementing size limits for processing large files to prevent memory issues or timeouts.
When implementing file attachment support in your Cortex tools, it’s essential to follow several best practices. Log extensively during development to understand the parameter structure that Cortex passes to your tool. Check multiple locations for attachments due to varying parameter structures that may occur in different invocation contexts. Handle both JSON strings and objects for flexible integration since parameters may be serialized in different ways. Implement timeouts for file downloads to prevent your tool from hanging on slow or failed connections. Return useful information about processed files for the agent to use in its responses. Additionally, consider what file types your tool will need to process and how you should handle unsupported formats. Think about how you will handle large files that might exceed memory limits or processing timeouts. These considerations will help ensure your tool handles attachments robustly and provides a good experience for users working with file uploads in the Cortex platform.













1.	Cortex Platform
2.	Others
3.	AI enablement
Why does AI enablement require a platform?
AI enablement requires a platform for several compelling reasons, particularly when leveraging the capabilities of various hyperscalers and testing against different models. Here’s an in-depth look at these reasons:
1. Scalability and Resource Management
•	Dynamic Resource Allocation: AI workloads can be highly variable, requiring significant computational resources at certain times and minimal at others. A platform enables dynamic allocation of resources, scaling up during intensive tasks and scaling down when idle.
•	Cost Efficiency: Platforms provided by hyperscalers like AWS, Google Cloud, and Azure offer pay-as-you-go models, optimizing costs based on actual usage rather than upfront investments in hardware.
2. Interoperability and Integration
•	Diverse Model Support: Different AI models may require different environments, libraries, and dependencies. A robust AI platform allows seamless integration and interoperability between various models and tools, supporting a wide range of frameworks like TensorFlow, PyTorch, and Scikit-learn.
•	Hybrid Deployments: Platforms facilitate hybrid cloud environments, enabling AI workloads to run across on-premises infrastructure and multiple cloud providers, enhancing flexibility and resilience.
3. Experimentation and Testing
•	Model Benchmarking: AI platforms allow users to easily test and benchmark different models against each other, providing insights into performance, accuracy, and efficiency. This is critical for selecting the best model for a specific task.
•	Hyperparameter Tuning: Platforms provide tools for automated hyperparameter tuning, optimizing model performance without extensive manual intervention.
4. Security and Compliance
•	Data Security: Hyperscalers invest heavily in security measures, ensuring that data is encrypted, access is controlled, and compliance with regulations (like GDPR, HIPAA) is maintained.
•	User Authentication: Platforms offer robust authentication mechanisms, safeguarding access to sensitive AI workloads and data.
5. Collaboration and Version Control
•	Collaborative Development: AI platforms provide collaborative tools, allowing multiple users to work on the same project simultaneously, share experiments, and build upon each other’s work.
•	Version Control: Integrated version control systems track changes in code, models, and data, ensuring reproducibility and accountability in AI development.
6. Automation and Orchestration
•	Workflow Automation: Platforms offer tools to automate repetitive tasks, such as data preprocessing, model training, and deployment pipelines, improving productivity and reducing the risk of human error.
•	Orchestration: Orchestration tools manage complex workflows, ensuring that different stages of AI development and deployment are executed in the correct sequence and dependencies are managed efficiently.
7. Access to Specialized Services
•	AI-specific Tools: Hyperscalers provide specialized AI services such as natural language processing (NLP), computer vision, and automated machine learning (AutoML), which can be readily integrated into AI workflows.
•	APIs and SDKs: Cortex offer extensive APIs and SDKs, simplifying the development process and allowing integration with other services and applications.
8. Performance Optimization
•	Optimized Infrastructure: Platforms provide optimized hardware, such as GPUs and TPUs, specifically designed for AI workloads, significantly improving performance and reducing training times.
•	Data Management: Efficient data storage and retrieval systems provided by platforms ensure that data is processed quickly and effectively, which is crucial for training and deploying AI models.
9. Monitoring and Maintenance
•	Real-time Monitoring: Platforms offer real-time monitoring tools to track the performance of AI models and infrastructure, helping identify and resolve issues promptly.
•	Maintenance and Updates: Continuous updates and maintenance provided by hyperscalers ensure that the underlying infrastructure and tools remain up-to-date with the latest advancements and security patches.
Why did Tech@Lilly SPE sponsor building a platform?
An AI enablement platform is essential for leveraging the full potential of AI by providing scalability, interoperability, security, and specialized tools. It allows Lilly to efficiently manage resources, collaborate on projects, automate workflows, and experiment with different models. Cortex provides all foundations for AI and allows teams to deliver faster than ever.


1.	Cortex Platform
2.	Others
3.	Cortex Architecture
Cortex Architecture
This page provides a high-level overview of the Cortex platform’s architecture. You’ll find a roughly drawn diagram that illustrates the key components and their interactions within the system. This overview is designed to give you a foundational understanding of how Cortex is structured and how its various elements work together to deliver robust performance.
 


1.	Cortex Platform
2.	Others
3.	Cortex Configurations
Cortex Configurations
Model Configs
Pre-Cortex Refactor

{
  "name": "string (lowercase alphanumeric with dashes)", # R - Name of the Cortex Model Config
  "s3_bucket": "lly-light-prod", # R - Standard bucket where files and configs are stored. 
  "s3_prefix": "string", # R - Prefix for the model config 
  "auth": {}, # R -authz/authn configuration
  "assume_role": "string", # NR - authz/authn configuration 
  "assume_role_external_id": "string", # NR - authz/authn configuration
  "displayName": "string", # config display name in return object
  "model_description": "", # description of the config
  "guard": false, # NR - enabling/disabling llm-guard for security
  "llm_guard": [], # NR - security tooling configuration for llm-guard
  "security_config": "", # NR - custom security configuration reference
  "chainable": false, # R - if using multi-chains referenced below
  "chain": [ # R - chain or chains 
    {
      "chain_class": "doc-chain", # R - see section 1 below
      "model_iteration": 1, # R
      "order": 1 # R
    }
  ],
  "model_versions": [ # R - Query /modelclasses list for current models and their coupled embedding model 
    {
      "model_class": "",
      "model_iteration": 1,
      "priority": 0
    }
  ],
  "toolkits": [], # NR - Referenced Tools for agency
  "vectorstore": "elasticsearch", # R - Elasticsearch or Pinecone
  "allowed_tools_list": [], # NR - List of Tools that can be used for agency
  "with_context_prompt_template": { # R if using doc_chain to inject as context with custom prompts
  },
  "model_enhansed_query_template": { R if using model_enhanced_query_chain to inject as context with custom prompts
  },
  "no_context_prompt_template": { # R if using model_only_chain to inject as context with custom prompts
  },
  "sql_prompt_template": { # R if using sql_chain to inject as context with custom prompts
  },
  "agent_tool_prompt_template": { # R if using tool_chain to inject as context with custom prompts
  },
  "max_response_token_size": 0, # NR - LLM Response Token Size
  "doc_relevence_threshold": 0.5, # R (for RAG) - RAG Document Relevance Threshold 
  "agent_tool_max_iterations": 0, # NR - Number of Tool Itterations
  "app_binding": "string", # NR - Custom App Binding for AI Products that need filtering on endpoints
  "labels": {}, 
  "concepts_of_interest": [], # NR - Concepts for interest in search
  "k_value": 20, # R - The top-k parameter effectively controls the vocabulary size considered during text generation. By setting a specific value for k, users can limit the number of words from which the model can choose.
  "chunk_size": 1500, # R - Embedding Chunk Size as documents get split into chunks what size is required
  "chunk_overlap": 300, # R - Embedding Chunk Size overlap. This ensures context isn't lost during ingest based on amount of overlap.
  "temperature": 0, # LLM temperature is a parameter that controls the amount of randomness in a large language model's (LLM) output.
  "token_buffer_size": 1.2 # amount of conversation context that is held in memory
}

Section 1 - What are chains?
doc_chain: RAG Chain for document retrieval using similarity search. This chain also includes direct model access and doesn’t require that searched context is passed to the model. hybrid_doc_chain: RAG Chain for document retrieval using hybrid search. This chain also includes direct model access and doesn’t require that the searched context is passed to the model. model_enhanced_query_chain: Chain to enhance user questions with context before sending to a search chain as listed above (doc and hybrid doc chain) model_only_chain: Direct LLM access without enabling RAG (not required to be bolted together with the chains listed above) sql_db_chain: Chain for querying databases which can be linked with chains above. tool_chain: chain for agents which can be linked with other chains for context, etc.


1.	Cortex Platform
2.	Others
3.	Direct Model Access
Direct Model Access
If you have a use-case for calling LLM models directly (using Cortex for baseline security & access to scaled models with a standard interface). This is ideal if you have an advanced use-case that does not require RAG/Agent processing.
THE BELOW CODE GIVES AN AN EXAMPLE CALLING GPT4-TURBO USING PYTHON:
# Install Light Client: https://client-python.apps.lrl.lilly.com/
from light_client import LIGHTClient

client = LIGHTClient()

MODELS = {
    "gpt4-turbo": {
      "model_class": "lilly-openai",
      "model_iteration": 4
    }
}



def call_model(name: str, prompt:str) -> str:
    """
    Call openai model through cortex with raw prompt given in prompt param.  Model param should be one of
    the keys listed in the MODEL dictionary above.
    """
    if name not in MODELS:
      raise Exception(f"{name} must be one of {MODELS.keys()}")
    
    result = client.post(f"https://chat.apps-api.lrl.lilly.com/ask/md3-raw", params=MODELS[name], json={
      "q": prompt
    })

    if result.status_code != 200:
      raise Exception(f"error calling model, status code {result.status_code} : {result.text}")

    return result.json()["message"]


if __name__ == "__main__":
    print("Example GPT4-Turbo Call:")
    print(call_model("gpt4-turbo", "Who is Lilly?")) # replace with your own prompt.
    
    # Example prompt calling with system/AI messages
    """
    System:
    <system message>
    AI:
    <AI message>
    
    """




1.	Cortex Platform
2.	Others
3.	Implement RAG workflow in Python
Using Cortex to implement RAG workflow in Python
Using the Cortex APIs, you can easily implement a RAG workflow in python. The below example shows how this can be accomplished. NOTE: follow link at the top of the script to install the LIGHT client library to connect to Cortex.
import time
import os
# Install Light Client: https://client-python.apps.lrl.lilly.com/
from light_client import LIGHTClient

client = LIGHTClient()

MODELS = {
    "gpt4-turbo": {
      "model_class": "lilly-openai",
      "model_iteration": 4
    }
}

CORTEX_BASE = "https://chat.apps-api.lrl.lilly.com"


YOUR_USER = "morin_nathan_a@lilly.com" # Replace with your email

CUSTOM_MODEL_NAME = f"{os.environ['USER'].lower()}-test-bot"

CUSTOM_MODEL_CONFIG = {
  "name": CUSTOM_MODEL_NAME,
  "auth": {
    "owners": [
      YOUR_USER
    ],
  },
  "displayName": f"Test bot for user {YOUR_USER}",
  "model_versions": [
    {
      "model_class": "lilly-openai",
      "model_iteration": 4,
      "priority": 0
    }
  ]
}


def configure_model(config: dict) -> bool:
    
    result = client.post(f"{CORTEX_BASE}/manage/config", json=config)

    if result.status_code != 200:
      raise Exception(f"error configuring model, status code {result.status_code} : {result.text}")

    return True



def call_model(prompt:str, pass_through_model: str = "gpt4-turbo", custom_config: str = "md3-raw") -> str:
    """
    Call openai model through cortex with raw prompt given in prompt param.  Model param should be one of
    the keys listed in the MODEL dictionary above.
    """
    if custom_config == "md3-raw":
        if pass_through_model not in MODELS:
            raise Exception(f"{pass_through_model} must be one of {MODELS.keys()}")
        params = MODELS[pass_through_model]
    else:
        params = {}
    
    result = client.post(f"{CORTEX_BASE}/ask/{custom_config}", params=params, json={
      "q": prompt
    })

    if result.status_code != 200:
      raise Exception(f"error calling model, status code {result.status_code} : {result.text}")

    return result.json()["message"]


def embed_file(dataset_name: str, file: str) -> str:
    """Returns job id for given local file
    Args:
        dataset_name (str): name of the dataset config in Cortex
        file (str): Path to local file
    Returns:
        str: Job ID
    """
    result = client.post(f"{CORTEX_BASE}/models/{dataset_name}/upload", files={
      "files": (file, open(file, 'rb')),
    })
    
    if result.status_code != 200:
      raise Exception(f"error uploading file {file} to dataset {dataset_name}, status code {result.status_code} : {result.text}")

    return result.json()[0]["job_id"]


def check_embed_status(dataset_name: str, job_id: str) -> str:
    """Return the current status of a submitted job
    Args:
        dataset_name (str): name of the dataset config in Cortex
        job_id (str): Job ID
    Returns:
        str: Job Status
    """
    result = client.get(f"{CORTEX_BASE}/models/{dataset_name}/job-status/{job_id}")
    
    if result.status_code != 200:
      raise Exception(f"error checking status of job {job_id}, status code {result.status_code} : {result.text}")

    return result.json()["status"] 


def embed_file_sync(dataset_name: str, filename: str) -> bool:
    """Embed the document spacified using default Cortex workflow
    Args:
        dataset_name (str): name of the dataset config in Cortex
        filename (str): Path to local file
    Returns:
        bool: was embedding successful
    """
    job_id = embed_file(dataset_name=dataset_name, file=filename)
    checks = 0
    while checks < 500:
        status = check_embed_status(dataset_name=dataset_name, job_id=job_id)
        
        print(f"Checking status: {status}")
        
        if status == "failed":
            return False
        
        if status == "finished":
            return True
        
        time.sleep(1)
            
            


if __name__ == "__main__":
    print("Example GPT4-Turbo Call:")
    print(call_model("Who is Lilly?")) # replace with your own prompt.
    
    # Example prompt calling with system/AI messages
    """
    System:
    <system message>
    AI:
    <AI message>
    
    """
    
    
    file_to_embed = "lillybio.pdf" # Update with path to your file
    
    # Uncomment to embed documents
    success = configure_model(CUSTOM_MODEL_CONFIG)
    if not success:
        exit(1)
    success = embed_file_sync(CUSTOM_MODEL_NAME, file_to_embed)
    if success:
        print(f"successfully embedded file {file_to_embed}")
    print(call_model("Who is Lilly?", custom_config=CUSTOM_MODEL_NAME)) # replace with your own prompt.
If you want to deploy your workflow on AWS, you can use the LIGHT client AWS auth flag (see https://client-python.apps.lrl.lilly.com/) & specify the AWS IAM role your script runs under in your model config.
Checking Job Status and Handling Failures
To monitor the status of jobs or check for failures, Cortex provides several endpoints:
1.	List Current Jobs
Use /data/job-status/{name} to retrieve a list of the current jobs.
2.	Get Specific Job Information
Use /data/job-status-id/{name}/{job_id} to get detailed information about a specific job. This endpoint can also provide failure details. For example:
```bash curl -X ‘GET’
‘https://cortex.lilly.com/data/job-status-id/{name}/{job_id}’
-H ‘accept: application/json’
This will return detailed information about the job, including any failure reasons.
1.	Get Additional Failure Information
Use /data/jobs/failure/{key_name} to retrieve more details about failing jobs.
For example:
```bash curl -X ‘GET’
‘https://cortex.lilly.com/data/jobs/failure/name’
-H ‘accept: application/json’
An example of doing this in Swagger is found in the following video:



1.	Cortex Platform
2.	Others
3.	Cortex Agentic V2 Framework Multiagent Guide
Cortex Agentic V2 Framework Multiagent Guide
The new agentic V2 framework allows us to create a hierarchical, multiagent system using a combination of tools and Cortex agentic or RAG models. This makes it easy to add an agent someone else has created to your own agent and combine it with custom tools.
Overview
Agentic Framework V2 allows the creation of a hierarchical, multiagent system. Here’s an example of what a hierachy can look like:
 
Each agent in the system will have its prompt and associated executables. There are three types of executables that can be used:
    class ExecutableType(StrEnum):
        """
        Executable type
        """

        TOOL_CALL = "tool-call"
        AGENTIC_MODEL = "agentic-model"
        MODEL = "model"
1- tool-call: this allows attaching a regular tool to the current agent. Regular tools are hosted on a Tool Server the agent has access to.
2- agentic-model: Users can choose a Cortex model, which has been configured as agent, and add its tools to another agent. This is a recursive operation that builds an agent tree. As an example, let’s say agent A wants to use agent B; in this case, agent A creates a child agent and adds the tools from agent B to this child agent. If one of the tools of agent B is another agentic-model, this build operation continues.
Since each child agent is a Cortex model, it will run using the LLM specified in its own model config.
3- model: This executable is used to add a Cortex RAG or model-only model to an agent.
Once the tree is built, the root node is returned to the agent chain and used for answering user queries.
How to configure your agents
We use a similar configuration for both parent and child agents. To configure an agent, we start with using Cortex model configs, specifically, the chain field.
It is best to use a bottom-up approach when setting up the agent hierarchy. Starting from one of the leaf nodes(child agents). This approach allows testing each agent in isolation and ensuring that it functions properly, before adding it to another agent. Here’s what the chain parameter looks like:
    "chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "max_turns": 50,
        "execution_type": "handoff"
        "supervisor": {
          "prompt": "your prompt for this agent.",
          "description": "Description of your agent."
        },
        "resources": {
          "executables": [
            {
              "name": "executable 1",
              "type": "type of executable",
              "description": "description of executable"
            }
          ]
        }
      }
    }
  ]
There are key parameters that need to be specified when creating an agent config:
chain-class
•	This needs to be set to agent-chain to use Agentic Framework V2 when answering user queries.
chain-params
•	Holds the configuration of your agent hierarchy.
#### max_turns
o	Controls how many turns the agent can run for; prevents infinite loops and raises an exception when the agent exceeds this value.
#### execution_type
o	Specifies whether this agent is added to another agent as a tool or it can act as handoff. If an agent is set up as tools, when it’s invoked by other agents, it will only reecive the input. On the other hand, if we use handoff, the whole conversation history is passed to the agent. Default value is handoff.
#### supervisor
o	The agent that controls the run and invokes tools to respond to user queries. Has the following attributes:
1- prompt: holds the prompt this agent uses to answer user queries. It is very importatnt to provide sufficient details in your prompt about how you want this agent to behave, especially, how to communicate with the parent agent(if any).
2- description: a description of the capabilities of this agent.
3- child_to_parent_handoff: prompt used by child agents of this agent to describe this agent when child agents want to hand off back to their parent. Defaults to “supervisor agent which knows how to respond to the user, always send here final results”.
#### resources
o	Contains the resources this agent has access to. EAch resource can be an executable with the following fields:
1- name: Name of the executable. Must match the name of the tool or Cortex model you intend to use.
2- type: Type of the executable; could be one of the three types mentioned earlier.
3- description: Description of the executable. This field is very important when adding an executable of type agentic-model or model to an agent. The agent will use this description when it decides which executable is needed to answer the user query. It is left blank when using tool-call executable, as Cortex gRPC hosted tools have a description member that informs the agent of their capabilities.
Example Agent Setup
Next, we’ll walk through an example of creating a multi-agent hierarchy. This example sets up the agent tree we saw earlier; a supervisor with two child agents: a database agent used for information retrieval and a small molecule agent that hosts tools for running analysis on data.
1- We start by creating the database agent, called kernellilly-database-agent:
    "chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "max_turns": 50,
        "supervisor": {
          "prompt": "You are an agent capable of retreiving SMILES of compound names and LSN ids. Use StructureResolver to retreive SMILES of compound names. Use ResearchDataLakeStructure to retreive SMILES of LSN ids. You must directly return the tool response without modifying it. \n\n!!!Important!!!\n\nWhen running a tool, you must only send the parameter the tool expects.",
          "description": "Agent capable of retrieving SMILES strings given compound names and LSN ids."
        },
        "resources": {
          "executables": [
            {
              "name": "StructureResolver",
              "type": "tool-call",
              "description": ""
            },
            {
              "name": "ResearchDataLakeStructure",
              "type": "tool-call",
              "description": ""
            }
          ]
        }
      }
    }
  ]
This agent only uses tool-call executables. It is very important to experiment with prompting and test this agent before adding it to another agent. This testing will be an iterative process, as the integration with the parent can also impact the execution of this child agent.
2- Second step is adding the small molecule agent, named kernellilly-small-molecule-agent:
    "chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "max_turns": 50,
        "supervisor": {
          "prompt": "You are an agent that has access to the following tools:\n1- SMILES2Weight: Calculating the molecular weight of a SMILES. \n2- CompoundProfile: Calculating physico-chemical properties(compound profile) of SMILES.\n3- Functional Groups: Lists functional groups identified by their common name.\n4- GetGeneIDfromGeneName: Retrieves the gene ID of a given gene name.\n5- GetDrugsNameFromGeneID: Retrieves drugs approved for a given gene ID.\n6- GetGeneDescription: Uses gene ID to get additional molecular, functional, and disease-related information.\n 7- NearNeighborSearch: Takes SMILES string and performs near neighbor search to return similar molecules. \n\nYou must directly return the tool response without modifying it. \n\n!!!Important Guidelines!!!\n\n1- Think and plan the steps needed to answering user query. 2- Use the most specific tool for each step. 3- When running a tool, you must only send the parameter the tool expects.",
          "description": "Agent capable of calculating molecular weight and physio-chemical properties of a SMILES string."
        },
        "resources": {
          "executables": [
            {
              "name": "SMILES2Weight",
              "type": "tool-call",
              "description": ""
            },
            {
              "name": "CompoundProfile",
              "type": "tool-call",
              "description": ""
            }
          ]
        }
      }
    }
  ]
Similar to previous agent, this agent only uses tool-call executables.
3- Finally, we add the parent agent. The parent agent is the main supervisor that manages all child agents, as well as other types of executables it might have.
    "chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "max_turns": 50,
        "supervisor": {
          "prompt": "You are a supervisor agent in a multi-agent drug discovery system. Follow these strict protocols when coordinating tools:\\n\\n1. For Compound Analysis:\\n   - FIRST: Use kernellilly-database-agent to get SMILES:\\n     - Use StructureResolver for compound names\\n     - Use ResearchDataLakeStructure for LSN IDs\\n   - THEN: With the retrieved SMILES, ALWAYS run both:\\n     - kernellilly-small-molecule-agent's SMILES2Weight tool for molecular weight\\n     - kernellilly-small-molecule-agent's CompoundProfile tool for compound profile\\n\\n2. For Pubmed Queries:\\n   - Use pubmed-v3 with the exact user query\\n   - Return results without modification\\n\\nCRITICAL RULES:\\n- Execute tools in sequence: first get SMILES, then calculate properties\\n\\nReturn all tool responses in their original form.",
          "description": "Supervisor agent, coordinating between chem-agents tools and pubmed-v3 RAG model."
        },
        "resources": {
          "executables": [
            {
              "name": "kernellilly-small-molecule-agent",
              "type": "agentic-model",
              "description": "A small molecule agent capable of calculating molecular weight and physio-chemical properties of SMILES strings. Has a tool named SMILES2Weight that calculates molecular weight of SMILES. Has another tool called CompoundProfile that calculates compound profile and physio-chemical properties of a SMILES. Receives the SMILES string and returns the results."
            },
            {
              "name": "kernellilly-database-agent",
              "type": "agentic-model",
              "description": "A database agent capable of retreiving SMILES of compound names and LSN ids. Has a tool named StructureResolver to retreive SMILES of compound names. Has another tool called ResearchDataLakeStructure to retreive SMILES of LSN ids. Returns SMILES strings."
            },
            {
              "name": "pubmed-v3",
              "type": "model",
              "description": "Queries a RAG model containing pubmed publications for information related to scientific articles."
            }
          ]
        }
      }
    }
  ]
As we can see here, previous agents have been added as agentic-models to this agent. We also have a description of the capabilities of these child agents that allows the supervisor to know what tasks they’re capable of.
We can see that this agent also has access to an executable of type model. Here we are adding a Cortex RAG model as another executable to this agent. We also have the description that notifies this agent what this RAG model is capable of.
We can now query our agent:
 
 
1.	Cortex Platform
2.	Contextual Chunking
Contextual Chunking
TABLE OF CONTENTS
•	Importance of Context
•	Contextual Chunking vs. Semantic Chunking
•	Use Cases of Contextual Chunking
•	Contextual Chunking Flow Architecture
•	Document upload via API
•	PDF Contextual Chunking
•	.docx Contextual Chunking
•	Contextual Splitting with ContextualSplitter
•	Enable contextual chunking in the RAG pipeline
•	API Information
Contextual chunking is the process of dividing a lengthy document into smaller, contextually relevant chunks. These chunks are structured to preserve logical units like paragraphs, sections, or subsections, ensuring that each chunk is complete and pertinent for subsequent tasks.
Contextual chunking leverages structural and syntactic cues in the document (e.g., headings, paragraphs, tables, figures), facilitating the division based on predefined structural boundaries rather than arbitrary points.
________________________________________
Importance of Context
•	Retaining context prevents the loss of important information and relationships between concepts, allowing downstream tasks like summarization, question-answering, and others to operate more effectively.
•	When a document is split without context, it risks breaking mid-sentence, cutting off paragraphs, or disrupting references—all of which can impair the performance of models that rely on complete ideas or concepts.
________________________________________
Contextual Chunking vs. Semantic Chunking
•	Contextual Chunking: Contextual chunking is a document segmentation technique that groups related content based on their structural and contextual relationships. It’s particularly useful when maintaining the document’s natural flow and structure is crucial.
o	Examples of Contextual Elements:
	Sections in a research paper, such as the Introduction, Methods, Results, and Conclusion.
	Logical units in contracts or legal documents, such as clauses and definitions, are essential components that provide clarity and structure to the document.
o	Purpose: Useful when the goal is to preserve the document’s structure and context, making it easier to answer questions based on its flow, maintain section-based context, or support tasks like summarizing by section.
o	Techniques: Typically, it leverages layout-aware processing techniques, such as the Azure Document Intelligence Layout Model, to identify sections, tables, and figures. This allows for the alignment of chunking with these elements.
•	Semantic Chunking: Semantic chunking is a technique that divides a document based on its meaning or content, creating chunks that represent distinct ideas or topics rather than strictly adhering to structural boundaries. The primary objective of this approach is to ensure that each chunk has a coherent meaning or theme.
o	Examples of Semantic Elements:
	Grouping content within a document based on topics, such as all paragraphs related to a particular argument or finding.
	Dividing text based on shifts in subject or concept rather than on visible structural elements.
o	Purpose: This technique is particularly useful when the objective is to ensure that each chunk of text has a distinct and coherent meaning. By adhering to this principle, it facilitates more effective handling of natural language processing (NLP) tasks that concentrate on comprehending specific topics or concepts.
o	Techniques: Techniques employed include semantic embeddings, NLP models, and vector-based similarity measures to identify changes in meaning and segment text accordingly.
________________________________________
Use Cases of Contextual Chunking
Contextual chunking is highly useful in the following areas:
1.	Summarization: Text chunks can be individually summarized and then combined to create a comprehensive summary of the entire document.
2.	Question-Answering (QA): Chunking simplifies the process of retrieving contextually relevant sections of the text for answering specific questions.
3.	Search and Retrieval: Breaking a document into smaller chunks enhances the efficiency of search algorithms by enabling them to search smaller, more targeted segments.
4.	Topic Segmentation: Contextual chunking can help by breaking a lengthy document into its distinct sections, contextual chunking facilitates easier reading and facilitates topic modeling.
________________________________________
Contextual Chunking Flow Architecture
 
________________________________________
Document upload via API
The user uploads a document (e.g., PDF) through an API endpoint.
Note that only PDF and .docx files will be supported. Depending on the type of document uploaded, it will invoke the appropriate component.
________________________________________
PDF Contextual Chunking
1.	Pdf document Sent to Azure Document Intelligence Service
o	The uploaded document is sent to the AzureDocIntelProcessor.
o	AzureDocIntelProcessor employs the Azure Document Intelligence API to analyze the document’s content. Leveraging Azure DI’s layout model, the processor extracts essential document elements, including text blocks, tables, images, and layout data, while maintaining the document’s original structure.
o	The Azure service provides a structured output that includes recognized text regions, semantic structures, and positional data, which forms the basis for meaningful chunking in subsequent stages.
Sample PDF
 
Azure Doc Intelligence Response
 
1.	Post-Processing with Azure Document Intelligent Result Processor
o	The AzureDIResultProcessor takes the data returned from Azure DI and further processes it to ensure usability in chunking
o	Data Refinement:
	Extracts relevant content, organizing it into coherent sections and paragraphs
	Formats and structures the extracted data, optimizing it for contextual splitting
o	This step helps ensure that each chunk retains its natural context, enhancing the readability and coherence for downstream processing
________________________________________
.docx Contextual Chunking
1.	The uploaded Docx is passed to the DocumentParser. The DocumentParser component is responsible for reading and extracting content from DOCX files. It processes headings, paragraphs and tables, ensuring that each document element is captured in sequence and passed to DocumentTreeGenerator
2.	The DocumentTreeGenerator organizes extracted document content into a tree structure, where headings serve as parent nodes, and paragraphs/tables under each heading become child nodes. It uses the extracted elements to create a tree where MyNode instances represent each heading, paragraph, or table. It combines all associated content under each heading node and generates metadata to describe each section. Each instance of MyNode maintains a reference to its parent and children, enabling hierarchical navigation and structured retrieval of document content.
________________________________________
Contextual Splitting with ContextualSplitter
•	The ContextualSplitter receives the refined content and divides it into smaller, meaningful chunks, focusing on retaining each segment’s context
•	Parameters Used for Chunking:
o	depth: defines the granularity of chunks, where
1.	would mean each chunk is a section (i.e. in a research paper, something like intro, methods, results, conclusion, etc),
2.	would be section of sections, and so on. Defaults to 1
o	Chunk Size (Optional): If this is set, and the chunks based on the depth parameter exceeds a certain token size, split the chunks so they don’t exceed chunk size. Defaults to None
o	Chunk Overlap(Optional): if chunk size is being used, this defines how much overlap there should be between sentences or paragraphs to maintain continuity between chunks
o	Separators(Optional): Uses sentence boundaries, paragraph markers, or other delimiters for logical splitting points. For example - ["\n\n","\n","."," "] will be used for paragraph, newline, sentences, word splitting
•	The output is a series of contextually coherent chunks that maintain the document’s logical structure and meaning, making them ready for downstream tasks such as summarization, search, or question-answering
________________________________________
Enable contextual chunking in the RAG pipeline
Contextual chunking can be seamlessly integrated into the existing RAG (Retrieval-Augmented Generation) pipeline by configuring the relevant parameters within the data configuration settings
POST /data
{
    "name": "test-data-config",
    "auth": {
      "owners": [
         "testuser@lilly.com"
      ],
    .......
    .......
    .......
    "contextual_chunking": {
      "is_enable": true,
      "separator": [
        "\n\n",
        "\n",
        ".",
        " "
      ],
      "chunk_size": 1500,
      "chunk_overlap": 300,
      "depth": 3
    }
  }
By setting "is_enable": true, contextual chunking becomes part of the data upload process using /data/upload/{name} API, facilitating efficient storage and retrieval for downstream RAG tasks.
________________________________________
API Information
curl -X 'POST' \ 'http://127.0.0.1:9090/data/chunks/general-data-config-1?chunking_strategy=contextual&depth=3' \ -H 'accept: application/json' \ -H 'Content-Type: multipart/form-data' \ -F 'files=@LLM_recall.pdf;type=application/pdf' \ -F 'separators='
Result
[
  {
    "type": "data",
    "job_type": "contextual_chunking",
    "job_input_delivery": "s3",
    "job_output_delivery": "s3",
    "job_id": "2024-11-04-19-54-30-utc-gpu-data-contextual_chunking-s3-s3-e0329ea1-fc66-4088-a07c-bc0f2f7caf76",
    "status": "queued",
    "error_message": "",
    "domain": "general-data-config-1",
    "job_result": {},
    "meta": {
      "domain": "general-data-config-1",
      "type": "data",
      "job_type": "contextual_chunking",
      "job_input_delivery": "s3",
      "job_output_delivery": "s3",
      "job_created": "2024-11-04T19:54:30.534974"
    }
  }
]
Check the status of Job
GET /job/job-status/{job_id}
curl -X 'GET' \ 'http://127.0.0.1:9090/job/job-status/2024-11-04-19-54-30-utc-gpu-data-contextual_chunking-s3-s3-e0329ea1-fc66-4088-a07c-bc0f2f7caf76' \ -H 'accept: application/json'
{
  "type": "data",
  "job_type": "contextual_chunking",
  "job_input_delivery": "s3",
  "job_output_delivery": "s3",
  "job_id": "2024-11-04-19-54-30-utc-gpu-data-contextual_chunking-s3-s3-e0329ea1-fc66-4088-a07c-bc0f2f7caf76",
  "status": "finished",
  "error_message": "",
  "domain": "general-data-config-1",
  "job_result": {
    "url": "http://minio:9000/testbucket/data/data/contextual_chunking/jobs/2024/11/04/2024-11-04-19-54-30-utc-gpu-data-contextual_chunking-s3-s3-e0329ea1-fc66-4088-a07c-bc0f2f7caf76_job_result.json?AWSAccessKeyId=test&Signature=x3UJGsE1AsVysX1twj3mwNoI4EI%3D&Expires=1730753694"
  },
  "meta": {
    "domain": "general-data-config-1",
    "type": "data",
    "job_type": "contextual_chunking",
    "job_input_delivery": "s3",
    "job_output_delivery": "s3",
    "job_created": "2024-11-04T19:54:30.534974",
    "finished": "2024-11-04T19:54:54.409585"
  }
}




1.	Cortex Platform
2.	Data Source Synchronization (Sharepoint)
Data Source Synchronization
Data Source Synchronization is a Cortex Data integration for maintaining a mirrored copy of a Data Source to a user’s Data Config. Sharepoint is the only current supported Data Source to Synchronize.
Sharepoint Synchronization
For Sharepoint Synchronization, Cortex mirrors a User’s SharePoint Location in their Data Config. As a User makes changes to their Files in SharePoint, they will then be able to reference the updated Files directly in their Model.
Note: This initial implementation uses the User’s Token for synchronization with SharePoint, and therefore it is not done as a background process, but must be kicked off by the User.
Approach
A new Config type Sync has been added to Cortex for managing Synced locations. A Sync config is used to sync a single Sharepoint Location (Document Library, Folder, File) to one or more Data Configs. Once you have a Data Config associated with your Model, you can create 1 to Many Sync Configs to Sync data from sharepoint to your config.
As noted before, the User’s token must be leveraged to sync the data - therefore an interaction with the user is required to re-sync when changes are made at the Sharepoint location. This is accomplished via a trigger_sync endpoint.
Trigger Sync Flow
When a Sync is triggered, it moves through the following flow:
 
Recalculate Sync Status Flow
Retrieving a Sync using the GET endpoint will dynamically recalculate the Sync status. Below is the flow used to determine the current Sync Status:
Note: When possible, a Delta Link will be used to evaluate delta, but it some cases a file by file comparison must be done to reconcile the data. If this is required, rather than forcing the client to wait on this reconciliation for the synchronous response, the status will be returned as “Reconciling” and an Asynchronous job will be kicked off to perform this reconciliation.
 
Authorization Strategy
Sync configs leverage the same Authorization strategy as Data and Model Configs, allowing for owners and users of Sync Configs. Owners can Create, Update, and Delete, while Users can Get (including metrics and aggregated metrics), and Trigger.
API Endpoints
Sync Name List
GET /sync Sync Name List: Returns list of syncs config names that user is authorized to access. If data_config parameter is provided, syncs are filtered to only include configs that are syncing to that data config.
Create Sync Config
POST /sync: Create a Sync Config. Below is the minimum required detail to create a Sync Config. See Schema Details section for details about all of the Sync Config fields. For options beyond the bare minimum, see Advanced Options.
Note: When a Sync is created, an initial Sync is automatically triggered
{
  "name": "string (Unique name for storing/referencing the Sync)",
  "sync_type": "sharepoint",
  "external_config": {
    "site_name": "string (Sharepoint Site Name)",
    "library_name": "string (Optional Sharepoint Library Name)",
    "path": "string (Optional Sharepoint Path - relative from Site/Library name)",
  },
  "data_configs": ["data_config_name (one or more required)"],
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
Is Valid Sync
POST /sync/is_valid_sync: Check validity of sync and respond with validity and detail. The primary purpose of this validity endpoint is not for validating the input schema (although it will do that as well), but instead to validate the the Sharepoint Location that is planned to be synced. The only current reasons for a Sync to be considered “invalid” are if a Sharepoint site/library/path is invalid or the Sharepoint contents exceed the max file limit (currently 100). Beyond valid or invalid, the is_valid_sync endpoint will return a status of warn if any files in the Sharepoint location are invalid for syncing and will be skipped. See below response for such an example.
{
  "validity": "warn",
  "valid_file_count": 32,
  "total_file_count": 50,
  "message": "Warn: Sync contains 18 invalid files out of 50 that will be skipped."
}
Update Sync Config
PUT /sync: Update a Sync Config. Sync Configs may be updated, however this endpoint is restricted from some changes. You are unable to update the Sharepoint location details or file_validity_override. In these cases, a Sync should be deleted and recreated, rather than updated. When updating, if a data_config is added, a Sync will be triggered to sync the data to this config. If a data_config is deleted, the currently synced files will be deleted from this data config.
Get Sync Config
GET /sync/{name}: Get the most current data for a Sync Config. Below are some fields that are maintained by Cortex and returned in the Sync config:
{
  "sync_id": "string (A UUID for the last Execution of Sync against this config)",
  "sync_datetime": "datetime (The Datetime of the last successful Sync. The datetime represents the time that data was pulled from Sharepoint)",
  "sync_status": "One of the following: [In Sync, Out of Sync, Sync Failed, Sync Pending, Syncing Files, Reconciling]",
  "failure_reason": "If the status is 'Sync Failed', this will return a reason for failure.",
}
Delete Sync Config
DELETE /sync/{name}: Delete a sync config. During deletion, all synced files for the sync’s data_configs will be deleted as well.
Get Sync Metrics
GET /sync/metrics/{name}: Get metrics related to a specific Sync execution. By default this endpoint will retrieve metrics for the most recent sync, but passing a sync_id will get metrics for that sync execution. Metrics indicate how the Sync is progressing by showing the total number of file-specific jobs, and the status of those jobs. A missing status indicates a document upload job that did not finish or fail that is no longer present in Cortex. This represent a failure case, and will result in a Sync status of “Sync Failed” for this sync execution.
{
  "my_data_config": {
    "job_total": 11,
    "failed_jobs": 0,
    "finished_jobs": 3,
    "missing_jobs": 0
  }
}

Trigger Sync
POST /sync/trigger/{name}: Triggers a sync execution on a Sync Config. When triggering a sync, Cortex will get the calculate the status of the sync, and by default will only execute a sync if the Sync Status is not Sync Pending, Syncing Files, Reconciling, or In Sync. There are two parameters accepted for trigger_sync:
•	force: Execute the sync execution even if the status is showing that it is not needed. This can be helpful if for some reason the Sync gets hung in a Syncing Pending / Syncing Files state.
•	reconcile: If this parameter is set to True the delta_link will not be used to check for Sharepoint changes. Instead a full reconciliation will be done against all files in the Data Configs vs. Sharepoint. If for some reason the Sync Config indicates that everything is In Sync, but files are missing from the Data Config, using this parameter can do a clean refresh of files.
Get Aggregated Metrics by Data Config
GET /sync/metrics/aggregated/{data_config}: In some cases, there may be multiple Sync’s tied to a Data Config. Rather than having the client application retrieve the data from individual Sync Configs it may be beneficial to get an Aggregate view of the Status and Datetime. sync_status is aggregated in this priority order: Sync Failed, Syncing Files, Sync Pending, Reconciling, Out of Sync, In Sync. sync_datetime returns the oldest completed sync.
Recommended User facing application use
Using the endpoints described above, here is a recommended use pattern to drive a user experience around Sharepoint Sync:
1.	Check sync validity and inform user of # of files that will be skipped
2.	Create Sync
3.	Get Sync Metrics and inform user of sync progress
4.	Get Sync and inform user when data is no longer current
5.	Allow user to refresh to get most up-to-date data
Recommended Service Account use
1.	Create Service Account with access to Sharepoint location
2.	Create Sync
3.	Periodically trigger_sync to refresh data at desired frequency
4.	Use Get Sync for health status check to ensure data is remaining In Sync
Schema Details
{
  "name": "string (Unique name for storing/referencing the Sync)",
  "display_name": "string",
  "description": "string",
  "sync_type": "sharepoint (ENUM - sharepoint is the only option currently)",
  "sync_id": "string (A UUID for the last Execution of Sync against this config)",
  "sync_datetime": "string (The Datetime of the last successful Sync. The datetime represents the time that data was pulled from Sharepoint)",
  "sync_status": "In Sync",
  "external_config": {
    "site_name": "string (Sharepoint Site Name)",
    "library_name": "string (Sharepoint Library Name)",
    "path": "string (Sharepoint Path - relative from Site/Library name)",
  },
  "failure_reason": "If the status is 'Sync Failed', this will return a reason for failure.",
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
      "mp3"
    ],
    "file_size_mb": 500
  },
  "data_configs": ["one or more data_config names"],
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
Advanced Options
File Validity Override
When creating a Sync Config, it defaults to including all files that can be processed by Cortex, and the maximum file size allowed by Cortex. Applications may want to restrict what is considered a Valid file for syncing. If so, a file_validity_override may be provided, given that the file extensions are allowable by Cortex and the max file size is below the max size allowed from Cortex. Below is an example validity file_validity_override.
"file_validity_override": {
    "allowed_file_extensions": [
      "pdf",
      "docx",
    ],
    "file_size_mb": 30
  },




1.	Cortex Platform
2.	LLM Model Library
Exploring Accessible Models in Cortex
Cortex offers a diverse range of large language models (LLMs) and embedding models from various vendors, including Google’s Gemini, Anthropic’s Claude v3, Azure OpenAI, Meta’s llama3, and self-hosted models like Deepseek R3.
________________________________________
Choose an LLM that aligns with your specific application and excels in that domain. Here are some factors to consider when selecting the most suitable model for your application:
•	Task: Determine whether you need an all-rounder model or if there’s a specific task that aligns with your use case, such as classification, clustering, retrieval, or summarization. For instance, if you’re building an RAG application, prioritize the “Retrieval” task. Furthermore, refine your selection based on your specific requirements, including language (e.g., English, Chinese, French, Polish) or domain (e.g., law).
•	Model size and memory are crucial factors that influence retrieval performance. Larger models may lead to higher latency, while model size and memory usage are also important considerations.
•	Embedding dimensions: These represent the length of the embedding vector. While larger dimensions can capture more intricate details and relationships, they’re not always necessary. Smaller embedding dimensions provide faster inference and are more resource-efficient. Strive for a balance between data complexity and operational efficiency.</p>
•	Max tokens: The maximum number of tokens that can be converted into a single embedding is called the “max tokens.”
LLMs
model_class	model_iteration	model_name	display_name	token_limit	max_response_token_size	status
lilly-openai	20	o4-mini	OpenAI-o4-mini	200000	100000	New
lilly-openai	19	gpt-4.1-nano	GPT-4.1 Nano	1000000	32000	New
lilly-openai	18	gpt-4.1	GPT-4.1	1000000	32768	New
lilly-openai	17	gpt-4.5-preview	GPT-4.5 Preview	128000	16384	New
lilly-openai	16	o3-mini	OpenAI-o3-mini	200000	100000	active
lilly-openai	15	o1	OpenAI-o1	200000	100000	active
lilly-openai	14	gpt-4-1106-preview	GPT-4 Turbo (1106 Preview)	128000	4096	active
lilly-openai	13	gpt-4o-mini	GPT-4o Mini	128000	16384	active
lilly-openai	12	o1-preview	OpenAI-o1-preview	128000	32768	active
lilly-openai	11	o1-mini	OpenAI-o1-mini	128000	65536	active
lilly-openai	10	gpt-4-32k	GPT-4 32k	32768	5000	active
lilly-openai	9	gpt-4-32k	GPT-4 32k	32768	5000	active
lilly-openai	8	gpt-4o	GPT-4o	128000	16384	active
lilly-openai	7	gpt-4o	GPT-4o	128000	16384	active
lilly-openai	6	gpt-4o	GPT-4o	128000	16384	active
lilly-openai	5	gpt-4-0125-preview	GPT-4 Turbo (0125 Preview)	128000	4096	deprecated
lilly-openai	4	gpt-4-1106-preview	GPT-4 Turbo (1106 Preview)	128000	4096	deprecated
lilly-openai	3	gpt-4-32k	GPT-4 32k	32768	5000	active
lilly-openai	2	gpt-4	GPT-4	8192	8192	active
lilly-openai	1	text-davinci-003	GPT-3	4097	1000	deprecated
lrl-md3-openai	4	gpt-4o	GPT-4o	128000	16384	active
lrl-md3-openai	3	gpt-4o	GPT-4o	128000	16384	active
lrl-md3-openai	2	gpt-4-1106-preview	GPT-4 Turbo (1106 Preview)	128000	4096	active
lrl-md3-openai	1	gpt-4-32k	GPT-4 32k	32768	5000	active
lilly-openai-bartender	1	text-davinci-003	GPT-3	4097	1000	deprecated
lilly-openai-instructor	1	gpt-4-32k	GPT-4 32k	32768	5000	active
opensource-falcon7b-openai	1	falcon-7b	Falcon-7B	32768	5000	active
claude	13	us.anthropic.claude-3-7-sonnet-20250219-v1:0	Claude 3.7 Sonnet	200000	8192	active
claude	12	us.anthropic.claude-3-5-haiku-20241022-v1:0	Claude 3.5 Haiku	200000	8192	active
claude	11	us.anthropic.claude-3-5-haiku-20241022-v1:0	Claude 3.5 Haiku	200000	8192	active
claude	10	us.anthropic.claude-3-5-haiku-20241022-v1:0	Claude 3.5 Haiku	200000	8192	active
claude	9	us.anthropic.claude-3-5-sonnet-20241022-v2:0	Claude 3.5 Sonnet V2	200000	8192	active
claude	8	us.anthropic.claude-3-5-sonnet-20241022-v2:0	Claude 3.5 Sonnet V2	200000	8192	active
claude	7	us.anthropic.claude-3-5-sonnet-20241022-v2:0	Claude 3.5 Sonnet V2	200000	8192	active
claude	6	us.anthropic.claude-3-5-sonnet-20240620-v1:0	Claude 3.5 Sonnet	200000	8192	active
claude	5	us.anthropic.claude-3-5-sonnet-20240620-v1:0	Claude 3.5 Sonnet	200000	8192	active
claude	4	us.anthropic.claude-3-5-sonnet-20240620-v1:0	Claude 3.5 Sonnet	200000	8192	active
claude	3	anthropic.claude-3-sonnet-20240229-v1:0	Claude 3 Sonnet	200000	4096	active
claude	2	anthropic.claude-v2	Claude 2	100000	4096	deprecated
claude	1	anthropic.claude-instant-v1	Claude	100000	4096	deprecated
claudetitan	1	anthropic.claude-v2	Claude 2	100000	4096	deprecated
titan	2	amazon.titan-text-express-v1	Titan Text Express	8000	800	active
titan	1	amazon.titan-text-lite-v1	Titan Text Lite	4000	400	active
nova	3	us.amazon.nova-pro-v1:0	Nova Pro	3000000	5000	active
nova	2	us.amazon.nova-lite-v1:0	Nova Lite	3000000	5000	active
nova	1	us.amazon.nova-micro-v1:0	Nova Micro	128000	5000	active
llama2	2	meta.llama2-70b-chat-v1	Llama-2 70B	4000	0	deprecated
llama2	1	meta.llama2-13b-chat-v1	Llama-2 13B	4000	0	deprecated
llama3	6	us.meta.llama3-2-90b-instruct-v1:0	Llama-3.2 90B Instruct	128000	0	active
llama3	5	us.meta.llama3-2-11b-instruct-v1:0	Llama-3.2 11B Instruct	128000	0	active
llama3	4	us.meta.llama3-2-3b-instruct-v1:0	Llama-3.2 3B Instruct	128000	0	active
llama3	3	us.meta.llama3-2-1b-instruct-v1:0	Llama-3.2 1B Instruct	128000	0	active
llama3	2	us.meta.llama3-1-70b-instruct-v1:0	Llama-3.1 70B Instruct	128000	0	active
llama3	1	us.meta.llama3-1-8b-instruct-v1:0	Llama-3.1 8B Instruct	128000	0	active
cohere	4	cohere.command-text-v14	Cohere	4000	0	active
cohere	3	cohere.command-light-text-v14	Cohere Light	4000	0	active
cohere	2	cohere.command-text-v14	Cohere	4000	0	active
cohere	1	cohere.command-light-text-v14	Cohere Light	4000	0	active
mistral	2	mistral.mixtral-8x7b-instruct-v0:1	Mistral 8x7B	32000	3276	active
mistral	1	mistral.mistral-7b-instruct-v0:2	Mistral 7B	32000	800	active
llama2-7b-chat	1	llama2-7b-chat	Llama-2 7B	4000	400	deprecated
biomistral-7b	1	biomistral-7b	BioMistral 7B	1200	300	active
google-vertex	18	gemini-2.5-flash-preview-04-17	Gemini 2.5 Flash preview	1048576	64000	New
google-vertex	17	gemini-2.5-pro-preview-03-25	Gemini 2.5 Pro preview	1048576	65536	New
google-vertex	16	gemini-2.5-pro-exp-03-25	Gemini 2.5 Pro	1048576	65536	New
google-vertex	15	gemini-2.0-pro-exp-02-05	Gemini 2 Pro	2097152	8192	deprecated
google-vertex	14	gemini-2.0-flash-lite-001	Gemini 2 Flash Lite	1048576	8192	active
google-vertex	13	gemini-2.0-flash-001	Gemini 2 Flash	1048576	8192	active
google-vertex	12	medlm-large-1.5@001	MedLM Large 1.5	8192	1024	deprecated
google-vertex	11	medlm-large-1.5@001	MedLM Large 1.5	8192	1024	deprecated
google-vertex	10	medlm-large-1.5@001	MedLM Large 1.5	8192	1024	deprecated
google-vertex	9	medlm-large-1.5@001	MedLM Large 1.5	8192	1024	deprecated
google-vertex	8	gemini-1.5-flash	Gemini 1.5 Flash	1048576	8192	deprecated
google-vertex	7	gemini-1.5-pro	Gemini 1.5 Pro	2097152	8192	deprecated
google-vertex	6	gemini-1.5-flash	Gemini 1.5 Flash	1048576	8192	deprecated
google-vertex	5	gemini-1.5-pro	Gemini 1.5 Pro	2097152	8192	deprecated
google-vertex	4	gemini-1.5-flash	Gemini 1.5 Flash	1048576	8192	deprecated
google-vertex	3	gemini-1.5-pro	Gemini 1.5 Pro	2097152	8192	deprecated
google-vertex	2	gemini-1.5-flash	Gemini 1.5 Flash	1048576	8192	deprecated
google-vertex	1	gemini-1.5-pro	Gemini 1.5 Pro	2097152	8192	deprecated
biobert-finetuned	1	biobert-finetuned	BioBert-Finetuned	1200	300	active
deepseek-r1-distill-llama-70b	1	deepseek-r1-distill-llama-70b	DeepSeek R1 Distill Llama 70B	128000	0	active
aepc-openai	1	aepcaadsai	AEPC Fine Tuned	8192	8192	active
Embedding Models
Name	Model	Chunk Size	Iteration	Compute Type	Open API Type	Dimension
text-embedding-ada-002-azure	text-embedding-ada-002	16	1	COMPUTE_GPU	azure	1536
text-embedding-ada-002-openai	text-embedding-ada-002	16	1	COMPUTE_GPU	openai	1536
text-embedding-3-small-azure	text-embedding-3-small	16	1	COMPUTE_GPU	azure	1536
text-embedding-3-small-openai	text-embedding-3-small	16	1	COMPUTE_GPU	openai	1536
text-embedding-3-large-azure	text-embedding-3-large	16	1	COMPUTE_GPU	azure	3072
text-embedding-3-large-openai	text-embedding-3-large	16	1	COMPUTE_GPU	openai	3072
instructor-azure	instructor	16	1	COMPUTE_GPU	azure	768
amazon.titan-embed-text-v1-bedrock	amazon.titan-embed-text-v1	16	1	COMPUTE_GPU	bedrock	1536
cohere.embed-multilingual-v3-bedrock	cohere.embed-multilingual-v3	16	1	COMPUTE_GPU	bedrock	1024
cohere.embed-english-v3-bedrock	cohere.embed-english-v3	16	1	COMPUTE_GPU	bedrock	1024
text-embedding-004-vertex	text-embedding-004	16	1	COMPUTE_GPU	vertex	768
multimodalembedding-vertex	multimodalembedding	16	1	COMPUTE_GPU	vertex	1408
text-multilingual-embedding-002-vertex	text-multilingual-embedding-002	16	1	COMPUTE_GPU	vertex	1408




1.	Cortex Platform
2.	Effective Prompt Engineering
Mastering Prompt Engineering for Effective LLM Interactions
Prompt engineering is crucial for maximizing the effectiveness of interactions with LLMs. Imagine an LLM as a smart and hardworking person who was unexpectedly joined your team without any prior knowledge of your goals. To effectively utilize this resource, you must provide them with precise instructions on how to perform their tasks. Here are some key reasons why focusing on instructions is essential:
•	Precision and Clarity: Well-crafted instructions ensure that the LLM comprehends the specific requirements and context of the query, leading to more accurate and relevant responses and actions. This reduces ambiguity and enhances the overall quality of the output.
•	Efficiency: Effective instruction (prompt engineering) can streamline interactions with LLMs, minimizing the need for subsequent questions or clarifications. This saves time and resources, making the process more efficient.
•	Mitigation of Bias and Errors: Thoughtfully designed instructions (prompts) can help reduce the likelihood of biases and errors in the LLM’s responses, such as hallucinations. By guiding the model with precise and neutral language, outputs are more balanced and accurate.
Now that we understand the importance of prompt engineering, let’s explore some strategies to enhance your LLM interactions.
To maximize the effectiveness of interactions with LLMs, prompt engineering techniques are essential. Here are some practical strategies to implement:
•	Provide Clear and Specific Instructions: Offer detailed and precise instructions to guide the model towards the desired output. Avoid using single words or short phrases.
•	Use Delimiters to Add Structure: Delimiters, such as quotes, backticks, or XML tags, can help separate different parts of the prompt and make it easier for the model to understand its structure.
•	Utilize Markdown Headings: Markdown headings, such as #, can be used to organize and structure your prompts.
•	Embrace Triple Quotes: Triple quotes, enclosed in three double quotes, can be used to create multi-line strings or code snippets within your prompts.
•	Leverage Triple Backticks: Triple backticks, enclosed in three single quotes, can be used to create code blocks or code snippets within your prompts.
•	Use Triple Dashes: Triple dashes, enclosed in three dashes, can be used to create lists or bullet points within your prompts.
•	Incorporate Angle Brackets: Angle brackets, enclosed in angle brackets, can be used to create hyperlinks or references within your prompts.
XML tags:
•	Example: Your task is to condense the text enclosed in triple quotes into a single sentence.
Shall I compare thee to a summer’s day? Thou art more lovely and more temperate: Rough winds do shake the darling buds of May, And summer’s lease hath all too short a date:
Contextual Framing:
•	Description: Provide the necessary background and scope of the request to help the model understand the task.
•	Example: “As a marketing consultant for a small tech startup, outline a 3-month content marketing plan that focuses on social media engagement.”
Step-by-Step Breakdown:
•	Description: Break down complex tasks into smaller, manageable steps to ensure clarity and comprehensiveness.
•	Example: “List the steps involved in conducting a competitive analysis for a new product launch in the tech industry.”
Role Specification Description:
•	Description: Assign a specific role to the model to tailor the response to the required perspective or expertise.
•	Example: “As a financial advisor, provide an investment strategy for a client who is planning to retire in 20 years.”
Iterative Refinement:
•	Description: Engage in a dialogue to iteratively refine the prompt and responses, ensuring the output meets your expectations.
•	Example: Start with “Draft an executive summary for a business plan,” then follow up with “Include more details about the market analysis section.”
Hallucination Reduction:
•	Description: Enable the model to minimize the generation of inaccurate or irrelevant information.
•	Example: Try the following to troubleshoot or minimize hallucinations:
o	Have the model respond with “I don’t know” if it lacks confidence in its answer.
o	Encourage the model to be highly confident in its responses.
o	Instruct the model to “think” before providing an answer.
o	Additionally, instruct the model to find relevant quotes from lengthy documents and incorporate them into its responses.
Here are some examples of how these techniques can be applied:
Example 1: Follow-on Prompts
“As a financial advisor, provide an investment strategy for a client seeking to retire in 20 years. If you are not certain about your response, refrain from providing it.”
Follow-up prompts for refinement:
•	Include a diversified portfolio with a mix of stocks, bonds, and real estate.
•	Specify the percentage allocation for each asset class.
•	Consider the client’s moderate risk tolerance and current economic conditions.
Example 2: Using Conditionals
“You will be provided with a customer support ticket, delimited by triple quotes.
If the request pertains to billing, highlight our flexible pricing models and ROI calculator for similar businesses.
On the other hand, if the request relates to account login issues, emphasize our security protocols and user management ease for enterprise clients.
In both cases, acknowledge the industry-specific challenges faced by the customer.”
Example 3: Leveraging Long Context
“I will provide you with a document. Please read it carefully, as I will ask you a question about it. Here is the document:
First, locate the most relevant quotes from the document and print them in numbered order. Ensure that the quotes are relatively short. If there are no relevant quotes, write “No relevant quotes” instead.
Next, provide an answer to the question, starting with “Answer:”. Avoid including or referencing the quoted content verbatim in your answer. Do not say “According to Quote [1]” when answering. Instead, make references to quotes relevant to each section of your answer by adding their bracketed numbers at the end of relevant sentences.
Therefore, the format of your overall response should resemble the structure shown between the tags. Please ensure that you adhere to the formatting and spacing precisely.”
Provide examples of question-answer pairs that incorporate parts of the provided document, ensuring that the answers adhere to Claude’s output structure.
For instance, if a question cannot be answered by the document, clearly state that.



1.	Cortex Platform
2.	Cortex Environments
Cortex Environments
Below are the updated URLs across non-prod and prod environments.
Environment URLs
Environment	Cluster	URL
Dev	Dev	https://dev.cortex.lilly.com/docs

Stable Dev	Dev	https://stable.dev.cortex.lilly.com/docs

QA	QA	https://qa.cortex.lilly.com/docs

QA	Production	https://eval.cortex.lilly.com/docs

Production	Production	https://cortex.lilly.com/docs

APIs
Environment	Cluster	URL
Dev	Dev	api.dev.cortex.lilly.com
Stable Dev	Dev	stable.api-d.cortex.lilly.com
SBX	Dev	api.sbx.cortex.lilly.com
QA	QA	api.qa.cortex.lilly.com
QA	Production	api.eval.cortex.lilly.com
Production	Production	api.cortex.lilly.com



1.	Cortex Platform
2.	SDK
This section covers documentation for SDKs offered by Cortex.
________________________________________
TABLE OF CONTENTS
•	Cortex Tools SDK
•	Cortex Platform SDK



•	Software Product Engineering
1.	Cortex Platform
2.	SDK
3.	Cortex Tools SDK
Creating an Python Agent Tool using the cortex-toolkit SDK
What is Cortex Toolkit SDK?
A starter kit for building and deploying Cortex tools. Using this SDK takes away the need for the developers to maintain and sync the protobuf used by Cortex. It completely eliminates the interaction with protobuf and gRPC layer of the tool, by abstracting away the handling of gRPC request and response.
Features
•	Tool Server Framework: Ready-to-use gRPC server implementation for hosting Cortex tools
•	Tool Service Interface: Abstract base class for implementing custom tools
•	Type Definitions: Pydantic models for working with tool requests and responses
Installation
pip install cortex-toolkit
Getting Started
CREATING A CUSTOM TOOL
1.	Define your tool by implementing the ToolService interface:
from cortex_toolkit.tools_v2.interface.types import AgentTool, ToolRequest, ToolResponse
from cortex_toolkit.tools_v2.interface.tool_service import ToolService

class MyCustomTool(ToolService):
    def __init__(self):
        agent_tool = AgentTool(
            name="my_custom_tool",
            description="This tool does something useful",
            direct_return=False,
            short_description="A useful tool",
            json_input_schema='{"type": "object", "properties": {"input": {"type": "string"}}}',
            json_output_schema='{"type": "object", "properties": {"result": {"type": "string"}}}'
        )
        super().__init__(agent_tool)
    
    async def execute(self, request: ToolRequest) -> ToolResponse:
        # Implement your tool logic here
        result = f"Processed: {request.input}"
        return ToolResponse(output=result)
STARTING A TOOL SERVER
from cortex_toolkit.tools_v2.toolserver import ToolKitServer

# Create your tools
my_tool = MyCustomTool()

# Create and start the server
server = ToolKitServer(tools={"my_custom_tool": my_tool})
server.serve(port=5000)




•	Software Product Engineering
1.	Cortex Platform
2.	SDK
3.	Cortex Platform SDK
Cortex Platform SDK
Overview
The Cortex SDK provides programmatic access to a comprehensive set of APIs related to:
•	Toolkit Management
•	Prompt Configuration
•	Data Management
•	Security Management
•	Model Configuration and Management
•	Job and Task Scheduling
APIs
Cortex APIs are structured under cortex_sdk.cortex_sdk.api module:
•	data_api
•	history_api
•	jobs_api
•	model_ask_api
•	model_config_api
•	model_context_cache_api
•	model_evaluation_api
•	model_files_api
•	model_jobs_api
•	model_llms_api
•	prompt_new_api
•	ragas_api
•	toolkit_api
•	toolkit_security_api
Installing The Package
pip install elilillyco-cortex-sdk
The above pip command might fail as the sdk is hosted in Lilly’s Artifactory. Please follow below steps.
1.	Login to artifactory.lilly.com
2.	Navigate to Artifacts
3.	Choose Lilly-Python from the list
4.	Click “Set Me Up” on the top right-hand side
5.	Click “Generate Token & Create Instructions”
6.	Use the token while setting up the environment varaible in the next step
Now, export the environment variables
export JF_ARTIFACTORY_VERSION_TOKEN=""
export JF_ARTIFACTORY_EMAIL=""
export PIP_INDEX_URL=https://${JF_ARTIFACTORY_EMAIL}:${JF_ARTIFACTORY_VERSION_TOKEN}@elilillyco.jfrog.io/artifactory/api/pypi/Lilly-Python/simple
Now, try installing the package.
pip install elilillyco-cortex-sdk
requirement.txt file
Add the following line to your requirements.txt file
elilillyco-cortex-sdk==0.1.0 # please use the latest version number
Getting Started
Accessing Documentation
For detailed usage instructions, refer to the Cortex SDK README.
Interacting with APIs
After installation, utilize the provided APIs as documented within the Swagger Interface at /cortex_sdk/cortex_sdk/api.
Example: Accessing Cortex Model Config API
from elilillyco_cortex_sdk.configuration import Configuration
from elilillyco_cortex_sdk.api_client import ApiClient
from elilillyco_cortex_sdk.api.model_config_api import ModelConfigApi
from elilillyco_cloud_auth.auth_header_generator import NoAuthHeaderGenerator

# Get dynamic headers from your auth generator
auth_gen = NoAuthHeaderGenerator()
auth_headers = auth_gen.get_auth_headers()

config = Configuration(host="https://api.host.com")
client = ApiClient(config)
client.set_auth_headers(auth_headers)  # <- Inject headers

# Use an endpoint
try:
    api = ModelConfigApi(client)
    response = api.listmodels_model_get()
    print(response)
except Exception as e:
    raise RuntimeError(f"Failed to hit the model config list endpoint: {e}")
Example: Accessing Cortex Model Ask API
from elilillyco_cortex_sdk.configuration import Configuration
from elilillyco_cortex_sdk.api_client import ApiClient
from elilillyco_cortex_sdk.api.model_ask_api import ModelAskApi

# Get dynamic headers from your auth generator
auth_gen = NoAuthHeaderGenerator()
auth_headers = auth_gen.get_auth_headers()

config = Configuration(host="https://api.host.com")
client = ApiClient(config)
client.set_auth_headers(auth_headers)  # <- Inject headers

try:
    api = ModelAskApi(client)
    response = api.askhandler_model_ask_model_get(model="gpt-4o", q="What is the meaning of life?")
    print(model_classes)
except Exception as e:
    raise RuntimeError(f"Failed to hit the GET ask endpoint: {e}")
Example: Accessing Cortex Model History API
from elilillyco_cortex_sdk.configuration import Configuration
from elilillyco_cortex_sdk.api_client import ApiClient
from elilillyco_cortex_sdk.api.history_api import HistoryApi

# Get dynamic headers from your auth generator
auth_gen = NoAuthHeaderGenerator()
auth_headers = auth_gen.get_auth_headers()

config = Configuration(host="https://api.host.com")
client = ApiClient(config)
client.set_auth_headers(auth_headers)  # <- Inject headers

try:
    api = HistoryApi(client)
    response = api.get_history_sessions_history_model_sessions_get("gpt-4o")
    print(response)
except Exception as e:
    raise RuntimeError(f"Failed to hit the history sessions endpoint: {e}")
Authentication
The package provides several authentication mechanisms:
No Authentication
from elilillyco_cloud_auth.auth_header_generator import NoAuthHeaderGenerator

auth = NoAuthHeaderGenerator()
Static Authentication
from elilillyco_cloud_auth.auth_header_generator import StaticAuthHeaderGenerator

auth = StaticAuthHeaderGenerator(
    auth_header={"Authorization": "Bearer your-static-token"}
)
Azure AD Authentication for APIM
from elilillyco_cloud_auth.auth_header_generator import ApimAuthHeaderGenerator

auth = ApimAuthHeaderGenerator(
    azure_app_client_id="your-client-id",
    azure_app_client_secret="your-client-secret",
    azure_app_authority="https://login.microsoftonline.com/your-tenant-id",
    scope="your-scope"
)
Caching Authentication
from elilillyco_cloud_auth.auth_header_generator import CachingAuthHeaderGenerator, ApimAuthHeaderGenerator

# First create a base auth generator
base_auth = ApimAuthHeaderGenerator(
    azure_app_client_id="your-client-id",
    azure_app_client_secret="your-client-secret",
    azure_app_authority="https://login.microsoftonline.com/your-tenant-id",
    scope="your-scope"
)

# Then wrap it with caching
auth = CachingAuthHeaderGenerator(
    token_generator=base_auth,
    expire_after_seconds=3600  # Cache tokens for 1 hour
)
Troubleshooting
If you encounter issues during installation or configuration:
•	Verify network connectivity and firewall settings
•	Ensure your Azure credentials are valid and properly configured
•	Check Python environment compatibility and dependencies
•	Consult the SDK documentation or contact support for further assistance




1.	Cortex Platform
2.	LLM Glossary
LLM Glossary
Models
•	Large Language Model (LLM): A type of AI model trained on vast amounts of text data that can generate human-like text, answer questions, summarize content, and perform various language tasks.
•	Foundation Model: Large-scale AI model trained on diverse data.
•	Instruction-tuned / Fine-tuned Models: Models optimized for specific tasks.
•	LLM, SLM: Large Language Models and Small Language Models.
•	Multi-Modal Models: Models processing multiple data types (text, image, audio).
•	Reasoning Models: Models designed for logical inference.
•	Model Size (7B, 13B): Number of model parameters in billions.
•	Parameter: A variable within the model that is adjusted during training. Large models have billions of parameters that determine how they process and generate text.
•	Tokenizer: A component that converts text into tokens (smaller units like words or sub words) that the model can process.
•	Epoch: One complete pass through the entire training dataset during the fine-tuning process.
•	Batch Size: The number of training examples processed together in one iteration.
•	Learning Rate: A hyperparameter that controls how much to change the model in response to the estimated error each time the model weights are updated.
•	Inference: The process of using a trained model to generate predictions or responses for new inputs. Let me know if you need any further assistance!
Inference
•	Top p/k Sampling: Sampling strategy for generating diverse responses.
•	Hallucination: Model generating false or misleading information.
•	Temperature: Controls randomness in model responses.
•	Seed: Ensures reproducibility of outputs.
•	Max Tokens: Limits the number of generated tokens.
•	Latency: Time taken for a model to generate a response.
Prompts
•	User prompt, System prompt: Inputs guiding model behavior.
•	Few shot, Zero shot: Learning strategies with minimal or no examples.
•	Context Window: Maximum input size the model can consider.
•	Token (Input/Output): Smallest units of text processed by the model.
•	Chain of Thought: Structured reasoning approach for improving responses.
RAG (Retrieval-Augmented Generation)
•	Vector DB: Database storing vector embeddings for retrieval.
•	Embedding: Representation of text in numerical form.
•	Semantic Search: Search method based on meaning rather than keywords.
•	Retrieval: Fetching relevant documents for model reference.
•	Indexing: Organizing data for efficient retrieval.
•	Chunks: Dividing text into smaller, retrievable sections.
•	Re-Ranking: Refining retrieved results for relevance.
Fine-Tuning
•	Fine-tuning: The process of further training a pre-trained model on a specific dataset to adapt it for particular tasks, domains, or styles of communication.
•	Attention: Mechanism for focusing on relevant input parts.
•	Epoch: One complete pass over the training data.
•	Benchmark: Standard for evaluating model performance.
•	PEFT, LoRA, QLoRA: Parameter-efficient tuning methods.
•	Parameter: Model variables learned during training.
•	Checkpoint: Saved state of a model during training.
•	Quantization: Reducing model size while maintaining accuracy.
Training
•	RLHF: Reinforcement Learning from Human Feedback.
•	PreTraining: Initial phase where the model learns from vast datasets.
•	Distillation: Transferring knowledge from a large model to a smaller one.
•	Pruning: Removing unnecessary parameters to improve efficiency.
•	Attention Mechanism: A key component of transformer-based LLMs that allows the model to focus on different parts of the input when generating outputs.
•	Gradient Accumulation: A technique to simulate larger batch sizes by accumulating gradients over multiple smaller batches before updating model weights.
•	Loss Function: A method to measure how well the model is performing, with lower values indicating better performance.
Infrastructure Terms
•	GPU (Graphics Processing Unit): Specialized hardware that significantly accelerates the training and inference of deep learning models.
•	S3 (Simple Storage Service): AWS’s object storage service used for storing fine-tuned models and datasets.
•	SageMaker: Amazon’s cloud machine learning platform that provides tools and environments for building, training, and deploying ML models.
•	Jupyter Notebook: An interactive computing environment used for developing and running code for machine learning experiments.
LoRA Parameters
Learn how parameters affect the fine-tuning process.
Key Fine-tuning Parameters
•	Learning Rate: Defines how much the model’s weights adjust per training step.
o	Higher Learning Rates: Faster training, risk of overfitting.
o	Lower Learning Rates: More stable training, may require more epochs.
o	Typical Range: 1e-4 (0.0001) to 5e-5 (0.00005).
•	Epochs: Number of times the model sees the full training dataset.
o	Recommended: 1-3 epochs (anything more than 3 is generally not optimal unless you want your model to have much less hallucinations but also less creativity).
o	More Epochs: Better learning, higher risk of overfitting.
o	Fewer Epochs: May undertrain the model.
Advanced Parameters:
 
LoRA Configuration Parameters
Tuning these parameters helps balance model performance and efficiency:
•	r (Rank of decomposition): Controls the fine-tuning process.
o	Suggested: 8, 16, 32, 64, or 128.
o	Higher: Better accuracy on hard tasks but increases memory and risk of overfitting.
o	Lower: Faster, memory-efficient but may reduce accuracy.
•	lora_alpha (Scaling factor): Determines the learning strength.
o	Suggested: Equal to or double the rank (r).
o	Higher: Learns more but may overfit.
o	Lower: Slower to learn, more generalizable.
•	lora_dropout (Default: 0): Dropout probability for regularization.
o	Higher: More regularization, slower training.
o	Lower (0): Faster training, minimal impact on overfitting.
•	target_modules: Modules to fine-tune (default includes “q_proj”, “k_proj”, “v_proj”, “o_proj”, “gate_proj”, “up_proj”, “down_proj”).
o	Fine-tuning all modules is recommended for best results.
•	bias (Default: “none”): Controls bias term updates.
o	Set to none for optimized, faster training.
•	use_gradient_checkpointing: Reduces memory usage for long contexts.
o	Use “unsloth” to reduce memory by an extra 30% by using the gradient checkpointing algorithm.
•	random_state: A seed for reproducible experiments.
o	Suggested: Set to a fixed value like 3407.
•	use_rslora: Enables Rank-Stabilized LoRA.
o	True: Automatically adjusts lora_alpha.
•	loftq_config: Applies quantization and advanced LoRA initialization.
o	None: Default (no quantization).
o	Set: Initializes LoRA using top singular vectors—improves accuracy but increases memory usage.
Target Modules Explained
These components transform inputs for attention mechanisms:
•	q_proj, k_proj, v_proj: Handle queries, keys, and values.
•	o_proj: Integrates attention results into the model.
•	gate_proj: Manages flow in gated layers.
•	up_proj, down_proj: Adjust dimensionality for efficiency.






1.	Cortex Platform
2.	Reference
3.	Model and Data Configs
Model and Data Config
Model Config response body
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
      "model_iteration": 1,
      "priority": 0
    }
  ],
  "toolkits": [
    "string"
  ],
  "allowed_tools_list": [
    "string"
  ],
  "prompts": {
    "no_context": "default_no_context",
    "with_context": "default_with_context",
    "enhance_query": "default_enhance_query",
    "sql": "default_sql",
    "agent_tool": "default_agent_tool",
    "table_summary": "default_table_summary",
    "summary": "default_summary",
    "entity_extraction": "default_entity_extraction",
    "rewrite": "default_rewrite",
    "kg_triple_extraction": "default_kg_triple_extraction"
  },
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
  "labels": {},
  "k_value": 20,
  "token_buffer_size": 1.2,
  "temperature": 0,
  "top_p": 1,
  "stop": [
    "string"
  ],
  "seed": 0,
  "logprobs": false
}
Request Syntax for model config
Here is a description of all the fields in the above request. To start with the basic model only config, refer to the examples below this section:
•	name: A unique identifier for the model, consisting of lowercase alphanumeric characters and dashes.
•	s3_bucket: The name of the S3 bucket where model data is stored.
•	s3_prefix: A prefix for the S3 bucket, used to organize model data. Add the S3 bucket path where the model data will be stored (e.g., lilly-bucket-folder/demo-model/docs).
•	auth: An object defining the security and access control settings for the model.
o	owners: List of users who own the model. Email ID should be added. Numerous owners can be added, seperated by comma
o	allow_access_to_reports_of: Users allowed to access reports related to the model.
o	owners_group: Groups that own the model.
o	access_groups: Groups that have access to the model.
o	access_aws_roles: AWS roles that have access to the model.
o	owners_aws_roles: AWS roles that own the model.
o	users: List of users who have access to the model.
o	private: Boolean indicating if the model is private.
•	displayName: The name of the model to be displayed.
•	model_description: A brief description of the model’s purpose and functionality.
•	security_config: Additional security configurations for the model.
•	chain: An array defining the processing chain for the model. Each object in the array specifies the class of the chain, the iteration of the model, the order of execution, and any parameters specific to that chain.
o	chain_class: The type of processing chain (e.g., “doc-chain”).
o	model_iteration: The iteration number of the model being used in the chain.
o	order: The order in which this chain should be executed.
o	chain_params: Additional parameters for the chain, which can be customized based on the specific requirements of the model.
•	model_versions: An array that defines the versions of the model being created.
o	model_class: A string representing the name of the model, which should be lowercase alphanumeric with dashes. User can find the model classes from the 4th step of prerequisites.
o	model_iteration: The iteration number of the model version.
o	priority: An integer indicating the priority of this model version.
•	toolkits: An array of strings representing the toolkits that can be used with the model.
•	allowed_tools_list: An array of strings specifying the tools that are allowed to be used with the model.
•	prompts: An object containing various prompt configurations for the model.
o	no_context: Default prompt for queries without context.
o	with_context: Default prompt for queries with context.
o	enhance_query: Default prompt for enhancing queries.
o	sql: Default prompt for SQL queries.
o	agent_tool: Default prompt for agent tools.
o	table_summary: Default prompt for summarizing tables.
o	summary: Default prompt for generating summaries.
o	entity_extraction: Default prompt for extracting entities.
o	rewrite: Default prompt for rewriting queries.
o	kg_triple_extraction: Default prompt for knowledge graph triple extraction.
•	data: An array that can hold any additional data relevant to the model.
•	max_response_token_size: An integer specifying the maximum number of tokens in the response.
•	doc_relevence_threshold: A float value indicating the threshold for document relevance.
•	hybrid_search: An object defining parameters for hybrid search functionality.
o	rrf_relevance_threshold: A float value for the relevance threshold in the hybrid search.
o	rrf_constant: An integer constant used in the hybrid search scoring.
o	hybrid_score_type: A string indicating the type of scoring used in hybrid search (e.g., “average”).
o	lexical_average_weight: An integer representing the weight for lexical average scoring.
•	agent_tool_max_iterations: An integer specifying the maximum number of iterations for
•	app_binding: A string that binds the model to a specific application.
•	k_value: An integer representing the number of nearest neighbors to consider in certain algorithms.
•	token_buffer_size: A float value indicating the buffer size for tokens.
•	temperature: A float value controlling the randomness of the model’s output (higher values lead to more random outputs).
•	seed: An integer used for random seed initialization.
DATA CONFIG RESPONSE BODY
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
  "s3_bucket": "lly-light-dev",
  "s3_prefix": "llm-dev",
  "s3_prefix_data": "string",
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
    "model_iteration": "valid version of the model "
  },
  "vectorstore": "pinecone",
  "concepts_of_interest": [],
  "augmentable_metadata": [],
  "allowed_model_configs": [],
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
  }
}
REQUEST SYNTAX FOR DATA CONFIG
name:The name of the setup or configuration. In this case, it is “demo-setup2”.
•	auth:
o	This object contains authentication and access control settings.
o	owners: A list of email addresses of users who own this setup. Here, it includes one owner.
o	allow_access_to_reports_of: A list of users or groups allowed to access reports related to this setup. It is empty, meaning no specific access is granted.
o	owners_group: Groups of owners, currently empty.
o	access_groups: Groups that have access to this setup, currently empty.
o	access_aws_roles: AWS roles that have access to this setup, currently empty.
o	owners_aws_roles: AWS roles of the owners, currently empty.
o	users: A list of users who have access to this setup, currently empty.
o	private: A boolean indicating whether the setup is private. Here, it is set to true.
•	s3_bucket:The name of the S3 bucket where data is stored. In this case, it is “lly-light-dev”.
•	s3_prefix:The prefix used in the S3 bucket to organize files. Here, it is “llm-dev”.
•	s3_prefix_data:The specific path within the S3 bucket where the data for this setup is located. It is set to “data/demo-setup2/docs”.
•	exclude_filter:A list of filters to exclude certain data from being processed. It is currently empty, meaning no exclusions are specified.
•	assume_role:An optional field for specifying an AWS role to assume for accessing resources. It is currently empty.
•	displayName:A user-friendly name for the setup, which is “demo-setup2”.
•	data_config_description:A description of the data configuration. Here, it states, “Hi, we are uploading data to our chat model.”
•	embedding:
o	This object contains settings related to the embedding model used for document retrieval.
o	model: The specific embedding model to use. In this case, it is “text-embedding-3-small”. You can find this value from pre-requisite #4.
o	open_api_type: Specifies the type of OpenAI API being used. Here, it is set to “azure”.
•	model_version:
o	This object specifies the version of the model being used.
o	model_class: The class of the model, which is “lilly-openai”. You can find the value from pre-requisite #5.
o	model_iteration: The iteration/version of the model, set to “7”.
•	vectorstore:The type of vector store being used for document retrieval. Here, it is set to “pinecone”.
•	concepts_of_interest:A list of concepts that are of interest for this setup. It is currently empty.
•	augmentable_metadata:Metadata that can be augmented or enhanced. It is currently empty.
•	allowed_model_configs:A list of model configurations that are allowed for this setup. Here, it includes “demo-setup2”.
•	chunk_size:The size of the chunks into which documents will be split for processing. It is set to 1500 characters.
•	chunk_overlap:The number of characters that can overlap between chunks. Here, it is set to 300 characters.
•	index_name:The name of the index in the vector store. It is currently empty, which may indicate that it will be set automatically or is not yet defined.
•	contextual_chunking:
o	This object contains settings for contextual chunking of documents.
o	is_enable: A boolean indicating whether contextual chunking is enabled. It is set to false.
o	separator: An array of strings used to separate chunks. It includes newline characters and punctuation.
o	chunk_size: The size of the chunks for contextual chunking, set to 1500 characters.
o	chunk_overlap: The overlap for contextual chunking, set to 300 characters.
o	depth: The depth of contextual chunking, set to 3.




1.	Cortex Platform
2.	Reference
3.	Evaluating Model Response
Cortex Evaluation API
The purpose of this page is to provide detailed information on managing benchmark question sets within the Cortex evaluation framework, setting ground truth and helping you evaluate responses of the model that your application uses.
________________________________________
Environments
Environment	Cluster	URL
Dev	Dev	https://cortex-eval.dev.cortex.lilly.com/docs

Dev	Prod	https://cortex-eval-dev.cortex.lilly.com/docs

Eval	Prod	https://cortex-eval-eval.cortex.lilly.com/docs

Prod	Prod	https://cortex-eval.cortex.lilly.com/docs

________________________________________
Access
Access to the above environments requires you to be part of cortex-eval-users AD group.
Request Access >
________________________________________
Endpoints
Get all benchmark question sets:
Type	Description
Endpoint	GET /benchmark-question-set
Description	Fetch all benchmark question sets, filter them by user and groups, and return the filtered sets.
Parameters	- x_user (Optional[str]): The user making the request, extracted from the request headers.(no need to pass this exclusively applies everywhere)
- x_groups (Optional[str]): The groups the user belongs to, extracted from the request headers.(no need to pass this exclusively applies everywhere)
Response	- 200 OK: A list of filtered benchmark question sets.
- 500 Internal Server Error: An error occurred while fetching the benchmark question sets
Example Request:
GET /benchmark-question-set
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Example Response:
[
  {
    "name": "string",
    "description": "string",
    "owners": [
      "sdsad"
    ],
    "users": [],
    "owner_groups": [],
    "owner_aws_roles": [],
    "public_read": false,
    "updated_at": "2025-03-11T06:37:30.847253+00:00",
    "id": "c6eb6125-f905-41e9-b4d9-bf7fc7eb62cc",
    "active": true,
    "allow_access_to_reports_of": [],
    "access_groups": [],
    "access_aws_roles": [],
    "created_at": "2025-03-11T06:37:30.847253+00:00"
  }
]
### Create a new benchmark question set:
Type	Description
Endpoint	POST /benchmark-question-set
Description	Create a new benchmark question set.
Parameters	- benchmark_question_set (BenchmarkQuestionSetCreateSchema): The benchmark question set to create.
Response	- 200 OK: The created benchmark question set.
- 400 Bad Request: An integrity error occurred.
- 500 Internal Server Error: An error occurred while creating the benchmark question set.
Example Request:
POST /benchmark-question-set
Content-Type: application/json
{
  "owners": [],
  "users": [],
  "allow_access_to_reports_of": [],
  "owner_groups": [],
  "access_groups": [],
  "owner_aws_roles": [],
  "access_aws_roles": [],
  "public_read": false,
  "name": "sdsa",
  "description": "string",
  "active": true
}

Example Response:
{
  "created_at": "2025-03-11T10:37:43.778085Z",
  "updated_at": "2025-03-11T10:37:43.778085Z",
  "owners": [
    "testuser"
  ],
  "users": [],
  "allow_access_to_reports_of": [],
  "owner_groups": [],
  "access_groups": [],
  "owner_aws_roles": [],
  "access_aws_roles": [],
  "public_read": false,
  "name": "test",
  "description": "string",
  "active": true,
  "id": "f6e66f8c-4020-4a39-bd36-27d0ea5e635b"
}
Get a benchmark question set by ID:
Type	Description
Endpoint	GET /benchmark-question-set/{question_set_id
Description	Fetch a benchmark question set by its ID.set.
Parameters	- question_set_id (UUID4) : The ID of the benchmark question set to fetch.
- x_user (Optional[str]) : The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
Response	- 200 OK: The fetched benchmark question set.
- 404 Not Found: The benchmark question set with the specified ID was not found.
- 500 Internal Server Error: An error occurred while fetching the benchmark question set.
Example Request:
GET /benchmark-question-set/{question_set_id}
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Example Response:
{
  "created_at": "2025-03-11T10:37:43.778085Z",
  "updated_at": "2025-03-11T10:37:43.778085Z",
  "owners": [
    "testuser"
  ],
  "users": [],
  "allow_access_to_reports_of": [],
  "owner_groups": [],
  "access_groups": [],
  "owner_aws_roles": [],
  "access_aws_roles": [],
  "public_read": false,
  "name": "test",
  "description": "string",
  "active": true,
  "id": "f6e66f8c-4020-4a39-bd36-27d0ea5e635b"
}
Update a benchmark question set:
Type	Description
Endpoint	PUT /benchmark-question-set/{question_set_id
Description	Update a benchmark question set by its ID set.
Parameters	- question_set_id (UUID4): The ID of the benchmark question set to update.
- benchmark_question_set (BenchmarkQuestionSetCreateSchema) : The updated benchmark question set data. x_user (Optional[str]): The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
Response	- 200 OK: The updated benchmark question set.
- 400 Bad Request: A benchmark question set with the same name already exists.
- 500 Internal Server Error: An error occurred while updating the benchmark question set.
Example Request:
PUT /benchmark-question-set/{question_set_id}
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Content-Type: application/json
{
  "owners": [],
  "users": [],
  "allow_access_to_reports_of": [],
  "owner_groups": [],
  "access_groups": [],
  "owner_aws_roles": [],
  "access_aws_roles": [],
  "public_read": false,
  "name": "sdsa",
  "description": "string",
  "active": true
}
Example Response:
{
  "created_at": "2025-03-11T10:37:43.778085Z",
  "updated_at": "2025-03-11T10:39:08.060232Z",
  "owners": [
    "new"
  ],
  "users": [],
  "allow_access_to_reports_of": [],
  "owner_groups": [],
  "access_groups": [],
  "owner_aws_roles": [],
  "access_aws_roles": [],
  "public_read": false,
  "name": "11111",
  "description": "string",
  "active": true,
  "id": "f6e66f8c-4020-4a39-bd36-27d0ea5e635b"
}
Delete a benchmark question set:
Type	Description
Endpoint	DELETE /benchmark-question-set/{question_set_id}
Description	Delete a benchmark question set by its ID.
Parameters	- question_set_id (UUID4): The ID of the benchmark question set to delete.
- x_user (Optional[str]) : The user making the request, extracted from the request headers.
- x_groups (Optional[str]): The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
Response	- 200 OK: A response indicating the deletion status. 404 Not Found: The benchmark question set with the specified ID was not found.
- 500 Internal Server Error: An error occurred while deleting the benchmark question set.
Example Request:
DELETE /benchmark-question-set/{question_set_id}
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Example Response:
{
  "message": "Benchmark Question Set and its 2 associated questions archived successfully"
}
Get all questions of a benchmark question set:
Type	Description
Endpoint	GET /benchmark-question-set/{question_set_id}/questions
Description	Fetch all questions of a benchmark question set by its ID.
Parameters	- question_set_id (UUID4): The ID of the benchmark question set to fetch questions for.
- x_user (Optional[str]) : The user making the request, extracted from the request headers.
- x_groups (Optional[str]): The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
Response	- 200 OK: A list of questions for the benchmark question set. 404 Not Found: The benchmark question set with the specified ID was not found.
- 500 Internal Server Error: An error occurred while fetching the questions.
Example Request:
GET /benchmark-question-set/{question_set_id}/questions
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Example Response:
  {
    "id": "367d718e-551e-4a1f-bf27-5f804aa8a063",
    "benchmark_question_set_id": "f6e66f8c-4020-4a39-bd36-27d0ea5e635b",
    "description": "",
    "eval_method": "",
    "creation_method": "manual",
    "created_at": "2025-03-11T10:39:50.868382+00:00",
    "question": "Define some key insurance policy components",
    "ground_truth": "Some key insurance policy components include the premium, policy limit, and deductible.\n\n1. **Premium**: The premium is the price of the insurance policy, typically paid on a monthly basis. Insurers consider multiple factors to set a premium, such as the policyholder's history of claims, age, location, and creditworthiness (s3://lly-light-dev/llm-dev/data/eval-test-1/docs/All_about_insurance_new.docx: f69539bf-b6b2-4f2c-917b-089b7e68b7f6).\n\n2. **Policy Limit**: The policy limit is the maximum amount an insurer will pay for a covered loss under a policy. This limit can be set per period (e.g., annually), per loss or injury, or over the life of the policy. Higher limits generally come with higher premiums (s3://lly-light-dev/llm-dev/data/eval-test-1/docs/All_about_insurance_new.docx: 55193d3e-0096-4610-bbf4-71ab6021be18).\n\n3. **Deductible**: The deductible is the specific amount the policyholder must pay out of pocket before the insurer pays a claim. Deductibles help deter small and insignificant claims. Policies with higher deductibles are typically less expensive because they result in fewer small claims",
    "document_path": "dsszc",
    "active": true,
    "updated_at": "2025-03-11T10:39:50.868382+00:00"
  }
  {
    "id": "7623e3e6-14d0-4e8b-a980-4f47c95ef5c6",
    "benchmark_question_set_id": "f6e66f8c-4020-4a39-bd36-27d0ea5e635b",
    "description": "",
    "eval_method": "",
    "creation_method": "manual",
    "created_at": "2025-03-11T10:39:50.868382+00:00",
    "question": "What are the different types of insurance",
    "ground_truth": "The different insurance schemes include two-wheeler and four-wheeler insurance",
    "document_path": "xczxc",
    "active": true,
    "updated_at": "2025-03-11T10:39:50.868382+00:00"
  }

Delete a benchmark question set:
Type	Description
Endpoint	DELETE /benchmark-question-set/{question_set_id}
Description	Delete a benchmark question set by its ID.
Parameters	- question_set_id (UUID4): The ID of the benchmark question set to delete.
- x_user (Optional[str]) : The user making the request, extracted from the request headers.
- x_groups (Optional[str]): The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
Response	- 200 OK: A response indicating the deletion status.
- 404 Not Found: The benchmark question set with the specified ID was not found.
- 500 Internal Server Error: An error occurred while deleting the benchmark question set.
Example Request:
DELETE /benchmark-question-set/{question_set_id}
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Example Response:
{
  "message": "Benchmark Question Set and its 2 associated questions archived successfully"
}
Add questions to a benchmark question set:
Type	Description
Endpoint	PUT /benchmark-question-set/{question_set_id}/questions
Description	Add questions to a benchmark question set by its ID.
Link to excel template >
Link to json >

Parameters	- question_set_id (UUID4): The ID of the benchmark question set to add questions to.
- x_user (Optional[str]) : The user making the request, extracted from the request headers.
- x_groups (Optional[str]): The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
- uploaded_file (UploadFile) : The uploaded file containing the questions to add.
Response	- 200 OK: A list of the added benchmark questions.
- 400 Bad Request: The uploaded file is not in JSON or XLSX format.
- 404 Not Found: The benchmark question set with the specified ID was not found.
- 500 Internal Server Error: An error occurred while adding the questions.
Example Request:
PUT /benchmark-question-set/{question_set_id}/questions
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Content-Type: multipart/form-data
{
  "uploaded_file": "questions.json"
}
Example Response:
  [
  {
    "created_at": "2025-03-11T10:39:50.868382Z",
    "updated_at": "2025-03-11T10:39:50.868382Z",
    "id": "367d718e-551e-4a1f-bf27-5f804aa8a063",
    "benchmark_question_set_id": "f6e66f8c-4020-4a39-bd36-27d0ea5e635b",
    "question": "Define some key insurance policy components",
    "description": "",
    "ground_truth": "Some key insurance policy components include the premium, policy limit, and deductible.\n\n1. **Premium**: The premium is the price of the insurance policy, typically paid on a monthly basis. Insurers consider multiple factors to set a premium, such as the policyholder's history of claims, age, location, and creditworthiness (s3://lly-light-dev/llm-dev/data/eval-test-1/docs/All_about_insurance_new.docx: f69539bf-b6b2-4f2c-917b-089b7e68b7f6).\n\n2. **Policy Limit**: The policy limit is the maximum amount an insurer will pay for a covered loss under a policy. This limit can be set per period (e.g., annually), per loss or injury, or over the life of the policy. Higher limits generally come with higher premiums (s3://lly-light-dev/llm-dev/data/eval-test-1/docs/All_about_insurance_new.docx: 55193d3e-0096-4610-bbf4-71ab6021be18).\n\n3. **Deductible**: The deductible is the specific amount the policyholder must pay out of pocket before the insurer pays a claim. Deductibles help deter small and insignificant claims. Policies with higher deductibles are typically less expensive because they result in fewer small claims",
    "eval_method": "",
    "document_path": "dsszc",
    "creation_method": "manual",
    "active": true
  },
  {
    "created_at": "2025-03-11T10:39:50.868382Z",
    "updated_at": "2025-03-11T10:39:50.868382Z",
    "id": "7623e3e6-14d0-4e8b-a980-4f47c95ef5c6",
    "benchmark_question_set_id": "f6e66f8c-4020-4a39-bd36-27d0ea5e635b",
    "question": "What are the different types of insurance",
    "description": "",
    "ground_truth": "The different insurance schemes include two-wheeler and four-wheeler insurance",
    "eval_method": "",
    "document_path": "xczxc",
    "creation_method": "manual",
    "active": true
  }
]
Get all test runs endpoint:
Type	Description
Endpoint	GET /test-runs
Description	Fetch all test runs, filter them by user and groups, and remove specific attributes.
Parameters	- x_user (Optional[str]): The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
Response	- 200 OK: A list of filtered and processed test runs.
- 500 Internal Server Error: An error occurred while fetching the test runs.
Example Request:
GET /test-runs
Headers:
  x_user: user@example.com
  x_groups: group1,group2
Example Response:
  [
  {
    "model_config_name": "test-gpt-6",
    "status": "queued",
    "owners": [
      "amandeep@lilly.com"
    ],
    "users": [
      "amandeep@lilly.com"
    ],
    "owner_groups": [],
    "owner_aws_roles": [
      ""
    ],
    "public_read": false,
    "id": "7521bfd1-8acb-462a-b6d8-7dd409c834ce",
    "job_id": "d7021e85-4ed7-4bac-ac42-9c88fc5abec2",
    "allow_access_to_reports_of": [
      ""
    ],
    "access_groups": [],
    "access_aws_roles": [
      ""
    ]
  },
  {
    "model_config_name": "test-gpt-6",
    "status": "queued",
    "owners": [
      "amandeep@lilly.com"
    ],
    "users": [
      "amandeep@lilly.com"
    ],
    "owner_groups": [],
    "owner_aws_roles": [
      ""
    ],
    "public_read": false,
    "id": "ce340a6d-fec8-4bb1-9f62-722a4ff064a1",
    "job_id": "78505709-6149-463d-908e-97ee8f5bae69",
    "allow_access_to_reports_of": [
      ""
    ],
    "access_groups": [],
    "access_aws_roles": [
      ""
    ]
  }
]
Get test run status:
Type	Description
Endpoint	GET /test-runs/status/{test_run_id}
Description	Fetch the status of a specific test run by its ID, validate user access, and return the status.
Parameters	- test_run_id (UUID4): The ID of the test run to fetch the status for.
- x_user (Optional[str]) : The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
- cats_app_auth (Optional[str]) : The authorization token, extracted from the request headers.
Response	- 200 OK: The status of the test run.
- 404 Not Found: The test run with the specified ID was not found
- 500 Internal Server Error: An error occurred while fetching the test run status.
Example Request:
GET /test-runs/status/{test_run_id}
Headers:
  x_user: user@example.com
  x_groups: group1,group2
  cats_app_auth: Bearer your_token
Example Response:
  {
  "test_run_id": "uuid",
  "status": "completed"
}
Get results by ID:
Type	Description
Endpoint	GET /test-runs/{test_run_id}
Description	Fetch the result of a specific test run by its ID, validate user access, and return the result.
Parameters	- test_run_id (UUID4): The ID of the test run to fetch the status for.
- x_user (Optional[str]) : The user making the request, extracted from the request headers.
- x_groups (Optional[str]) : The groups the user belongs to, extracted from the request headers.
- cats_app_auth (Optional[str]) : The authorization token, extracted from the request headers.
Response	- 200 OK: The status of the test run.
- 404 Not Found: The test run with the specified ID was not found
- 500 Internal Server Error: An error occurred while fetching the test run result.
Example Request:
GET /test-runs/{test_run_id}
Headers:
  x_user: user@example.com
  x_groups: group1,group2
  cats_app_auth: Bearer your_token
Example Response:
  {
  "id": "ce340a6d-fec8-4bb1-9f62-722a4ff064a1",
  "job_id": "78505709-6149-463d-908e-97ee8f5bae69",
  "status": "queued",
  "model_config_name": "test-gpt-6",
  "public_read": false,
  "test_run_benchmark_question_sets": [
    {
      "benchmark_question_set_id": "c6eb6125-f905-41e9-b4d9-bf7fc7eb62cc",
      "name": "string",
      "description": "string",
      "benchmark_questions": [
        {
          "benchmark_question_id": "906ade46-9462-47f4-9ce5-17842683b037",
          "question": "Define some key insurance policy components",
          "ground_truth": "Some key insurance policy components include the premium, policy limit, and deductible.\n\n1. **Premium**: The premium is the price of the insurance policy, typically paid on a monthly basis. Insurers consider multiple factors to set a premium, such as the policyholder's history of claims, age, location, and creditworthiness (s3://lly-light-dev/llm-dev/data/eval-test-1/docs/All_about_insurance_new.docx: f69539bf-b6b2-4f2c-917b-089b7e68b7f6).\n\n2. **Policy Limit**: The policy limit is the maximum amount an insurer will pay for a covered loss under a policy. This limit can be set per period (e.g., annually), per loss or injury, or over the life of the policy. Higher limits generally come with higher premiums (s3://lly-light-dev/llm-dev/data/eval-test-1/docs/All_about_insurance_new.docx: 55193d3e-0096-4610-bbf4-71ab6021be18).\n\n3. **Deductible**: The deductible is the specific amount the policyholder must pay out of pocket before the insurer pays a claim. Deductibles help deter small and insignificant claims. Policies with higher deductibles are typically less expensive because they result in fewer small claims",
          "llm_response": "I apologize, I don't have enough information to answer based on the documents provided to me. Please try rephrasing your query. You may also use the feedback link to report issues.",
          "metrics": {
            "answer_correctness": 0.16823458516766354
          },
          "llm_response_metadata": {
            "context": [
              "The proposal document outlines comprehensive test strategies for AI model and chatbot validation.\n\nFor AI models, it includes techniques like randomized testing with train-test split, cross-validation, bootstrap tests, model agnostic and specific tests, privacy and performance testing, security testing against adversarial attacks, and continuous testing for concept drift.\n\nMetrics such as F1 score, accuracy, and precision are used for evaluation, with tools like scikit-learn.\n\nFor chatbots, strategies include adding the AI agent to a test page, running A/B tests, ensuring conversational flow, navigation, response time, error validation, and testing across different communication channels.\n\nChatbot-specific tests also cover visuals, accuracy, promptness, UI validation, intelligence, and data format validation, with automation tools like Botium.\n\nThe document also highlights necessary skills (Node.js, Selenium, Python, etc.), relevant tools (scikit-learn, Botium), and additional resources like courses on Udemy and information from Google.",
              "The document titled 'Show and Tell: A Neural Image Caption Generator' by Oriol Vinyals, Alexander Toshev, Samy Bengio, and Dumitru Erhan from Google, presents a model called NIC (Neural Image Captioner) that automatically describes the content of images using a combination of Convolutional Neural Networks (CNN) and Recurrent Neural Networks (RNN).\n\nThe NIC model uses a CNN to encode images into a fixed-length vector representation and an RNN, specifically an LSTM, to generate descriptive sentences.\n\nThe model is trained to maximize the likelihood of the target description given the training image.\n\nThe performance of the NIC model is evaluated on several datasets, including Pascal, Flickr30k, SBU, and COCO, showing significant improvements in BLEU scores compared to previous methods.\n\nThe document also discusses the challenges of overfitting, the importance of large datasets, and the potential for transfer learning.\n\nEvaluation metrics such as BLEU-1, BLEU-4, METEOR, and CIDER are used to assess the model's performance.\n\nThe document highlights the use of word embeddings, BeamSearch for sentence generation, and the role of human evaluations in assessing the quality of generated descriptions.\n\nFuture directions include leveraging larger datasets and unsupervised data to further improve image description models.",
              "Colonel Eli Lilly, born on July 8, 1838, in Baltimore, Maryland, was a significant figure in the pharmaceutical industry and a notable military leader.\n\nHe founded Eli Lilly and Company, which grew to become a leading global manufacturer of pharmaceutical and animal health products.\n\nLilly's early career included working at various drugstores and serving in the Civil War, where he organized the Eighteenth Indiana Battery of Light Artillery and participated in key battles such as Hoover’s Gap and Chattanooga.\n\nAfter the war, he ventured into business, partnering with James W. Binford in the Red Front Drugstore and later with Dr. John F. Johnston in a pharmaceutical manufacturing business.\n\nLilly's personal life saw tragedy with the death of his first wife, Emily Lemon, and later his daughter, Eleanor Wallace Lilly.\n\nHe remarried Maria Cynthia Sloan and continued his business and philanthropic efforts, including the establishment of the Eleanor Home of the Flower Mission in memory of his daughter.\n\nLilly was also active in civic affairs, contributing to the Indianapolis Board of Trade and the Commercial Club.\n\nHe passed away on June 6, 1898, leaving a legacy of innovation and public service."
            ]
          }
        },
        {
          "benchmark_question_id": "84a5f649-72c0-411e-bb53-e46644b60e32",
          "question": "What are the different types of insurance",
          "ground_truth": "The different insurance schemes include two-wheeler and four-wheeler insurance",
          "llm_response": "I apologize, I don't have enough information to answer based on the documents provided to me. Please try rephrasing your query. You may also use the feedback link to report issues.",
          "metrics": {
            "answer_correctness": 0.17215102066507787
          },
          "llm_response_metadata": {
            "context": [
              "The proposal document outlines comprehensive test strategies for AI model and chatbot validation.\n\nFor AI models, it includes techniques like randomized testing with train-test split, cross-validation, bootstrap tests, model agnostic and specific tests, privacy and performance testing, security testing against adversarial attacks, and continuous testing for concept drift.\n\nMetrics such as F1 score, accuracy, and precision are used for evaluation, with tools like scikit-learn.\n\nFor chatbots, strategies include adding the AI agent to a test page, running A/B tests, ensuring conversational flow, navigation, response time, error validation, and testing across different communication channels.\n\nChatbot-specific tests also cover visuals, accuracy, promptness, UI validation, intelligence, and data format validation, with automation tools like Botium.\n\nThe document also highlights necessary skills (Node.js, Selenium, Python, etc.), relevant tools (scikit-learn, Botium), and additional resources like courses on Udemy and information from Google.",
              "Colonel Eli Lilly, born on July 8, 1838, in Baltimore, Maryland, was a significant figure in the pharmaceutical industry and a notable military leader.\n\nHe founded Eli Lilly and Company, which grew to become a leading global manufacturer of pharmaceutical and animal health products.\n\nLilly's early career included working at various drugstores and serving in the Civil War, where he organized the Eighteenth Indiana Battery of Light Artillery and participated in key battles such as Hoover’s Gap and Chattanooga.\n\nAfter the war, he ventured into business, partnering with James W. Binford in the Red Front Drugstore and later with Dr. John F. Johnston in a pharmaceutical manufacturing business.\n\nLilly's personal life saw tragedy with the death of his first wife, Emily Lemon, and later his daughter, Eleanor Wallace Lilly.\n\nHe remarried Maria Cynthia Sloan and continued his business and philanthropic efforts, including the establishment of the Eleanor Home of the Flower Mission in memory of his daughter.\n\nLilly was also active in civic affairs, contributing to the Indianapolis Board of Trade and the Commercial Club.\n\nHe passed away on June 6, 1898, leaving a legacy of innovation and public service.",
              "The document titled 'Show and Tell: A Neural Image Caption Generator' by Oriol Vinyals, Alexander Toshev, Samy Bengio, and Dumitru Erhan from Google, presents a model called NIC (Neural Image Captioner) that automatically describes the content of images using a combination of Convolutional Neural Networks (CNN) and Recurrent Neural Networks (RNN).\n\nThe NIC model uses a CNN to encode images into a fixed-length vector representation and an RNN, specifically an LSTM, to generate descriptive sentences.\n\nThe model is trained to maximize the likelihood of the target description given the training image.\n\nThe performance of the NIC model is evaluated on several datasets, including Pascal, Flickr30k, SBU, and COCO, showing significant improvements in BLEU scores compared to previous methods.\n\nThe document also discusses the challenges of overfitting, the importance of large datasets, and the potential for transfer learning.\n\nEvaluation metrics such as BLEU-1, BLEU-4, METEOR, and CIDER are used to assess the model's performance.\n\nThe document highlights the use of word embeddings, BeamSearch for sentence generation, and the role of human evaluations in assessing the quality of generated descriptions.\n\nFuture directions include leveraging larger datasets and unsupervised data to further improve image description models."
            ]
          }
        }
      ]
    }
  ],
  "created_at": "2025-03-11T10:43:33.932966Z",
  "updated_at": "2025-03-11T10:48:03.909879Z"
}






1.	AI Products
2.	Chat in a Box
Chat In A Box
Chat in a Box (CIAB) enables you to craft customized AI chat assistants effortlessly. Simply name your assistant, invite users, and upload files..
Chat In A Box >
Follow the Chat In A Box Viva Engage page for latest updates including software release notes.
Advanced Usage
Labels
Chat in a box supports a number of custom labels for advanced use cases. These labels are used to modify that chat page experience for specific models. In order to use a labels it must be added to the “labels” object of the Cortex Model Config.
•	Custom Error Message: When the /ask request to Cortex returns an error message, a default error message will be returned. This can be overridden to a custom message using this label.
o	Key: custom_error_message
o	Value: String
•	Custom Wait Message: While waiting for a message response from LLM, sets a custom waiting message to be shown to the user.
o	Key: custom_wait_message
o	Value: String
•	Agent Debug: Adds debugging logging for agent-chain models to output for easier troubleshooting
o	Key: agent_debug
o	Value: True
•	Background Job: For agent-chain models which may execute for longer than 2minutes, switches to using server-sent events (SSE) in the Chat page. This allows for user to leave the chat page while an /ask is executing and get responses back beyond 2minutes.
o	Key: background_job
o	Value: True
•	Read Only: Limit a model to be uneditable (even by owners) in Chat in a Box
o	Key chatbuilder
o	Value: read only
Updating unsupported Assistant Types
Chat in a Box supports creation of model-only chain and doc-chain models via the UI. However, it allows update of other chain types as well. In order to update your model-config using Chat in a Box, ensure that the Chat in a Box AWS Role is an Owner on your config:
    "owners_aws_roles": [
      "arn:aws:iam::283234040926:role/lrl-light-apps-chatbuilder-dev-ciab-dev"
    ]
•	Develop: arn:aws:iam::283234040926:role/lrl-light-apps-chatbuilder-dev-ciab-dev
•	Eval: arn:aws:iam::283234040926:role/lrl-light-apps-chatbuilder-qa-ciab-dev
•	Prod: arn:aws:iam::283234040926:role/lrl-light-apps-chatbuilder-prd-ciab





1.	AI Products
2.	PromoMaker
PromoMaker
PromoMaker uses AI to generate promotional text for Lilly medicines. Users can create workspaces for individual brands, indications, and regions, and generate claims for them. Claims can then be exported, edited, saved, or refined, enabling users to create and refine claims for Lilly medicines quicker.
All AI functionality is powered by Cortex, which allows for the creation of personal configs and facilitates retrieval-augmented generation with uploaded files. This means that claims can be supported by file-based evidence, which can be uploaded and viewed within the application.
________________________________________
Current Features
Here are some key features:
•	Retrieval-augmented generation through Cortex - claims can be supported through - file-based evidence
•	Workspace creation and management for brands, indications and regions
•	Multi-claim generation
•	Generate different components of a claim headline, subheadline, citations etc
•	Prompt-Form, Refinement, and Chat UIs to generate claims
•	Generic prompt generation
•	Claim saving and exporting
•	File uploading and viewing
•	Jira Bug and Feature Requests
•	Source Viewer
•	Save Prompts
•	Streaming Query Content to the user
•	Query Feedback
________________________________________
Technologies
•	Next.js v14.2.14 - Frontend React-based framework offering features such as server-side rendering and server-side API routes
•	Tailwind CSS - Utility-first CSS framework
•	AntDesign - React UI library with a variety of pre-built, accessible web components
•	TypeScript - Typed JavaScript superset for ensuring type safety & for catching type-related errors early in development
•	Docker - Containerization platform for building, shipping, and running applications
•	GitHub Actions - Automated, customizable workflows that allow for building, testing, and deploying code directly from GitHub. Used for CI/CD and can be triggered by various GitHub events (see the .github/workflows directory)
•	React Testing Library and Jest - Unit testing libraries/frameworks
________________________________________
Local Development
1.	Clone the repository
2.	git clone https://github.com/EliLillyCo/Promo-Maker.git
3.	cd Promo-Maker
4.	Install dependencies
5.	npm install
6.	Create a .env or .env.local file and set the necessary environment variables. See .env.example.local to view the required environment variables.
The LOCAL_URL environment variable should be the URL running on port 9090 within your codespace (i.e. the Swagger endpoint).
In order to facilitate communication between the Cortex APIs running in your codespace and the local development server, you will need to set the GITHUB_TOKEN environment variable. This can be retrieved by running echo $GITHUB_TOKEN in your codespace terminal.
The ENV and NEXT_PUBLIC_ENV environment variables should be set to anything other than prod, qa or dev when running locally.
For more information on setting up your codespace for local development, refer to this Confluence article or follow the Cortex API README.
1.	Start the development server
2.	npm run dev
3.	Open http://localhost:3000 with your browser.
4.	DB commands
1.	bash npm run makeMigration creates a new migration file which can be used for database management.
2.	bash npm run migrate applies all pending migrations to update the database schema.
3.	bash npm run migrationRollback undoes the most recent migration, reverting the database schema to its previous state.
________________________________________
Cortex Local Development
1.	Open a codespace : 16 Cores, Region isn’t necessary
o	If the codespace is made on the cortex-api repository, you will need write access to have access to the codespace secrets
o	If the codespace is made within your repository, you will need to gain a copies of the codespace secrets necessary to run cortex.
2.	If running the codespace within your repository: 2.1. Make a new branch (Just to avoid any accidents):
3.	 git checkout -b "CortexTest"
2.2. Clear all files within the codespace 2.3. Clone the Cortex-api repository:
 git clone https://github.com/EliLillyCo/cortex-api.git
4.	Set up cortex with the following command:
5.	 cd cortex-api
6.	 make dev
Note: If you’ve closed the codespace or the codespace is timed out run the following commands:
 cd cortex-api
 docker-compose up
or
 cd cortex-api
 make down
 make dev
Note: To check it is running you can open the 9090 codespace address url with the added /docs at the end:
 CodespaceUrl:9090/docs 
This will open a swagger of the cortex-api endpoints.
7.	Once the API is running (Seen within the console) open a new terminal and write the following command:
8.	 echo $GITHUB_TOKEN
Note: This token will be valid only for the codespace session
9.	Finally you will need to copy the github token and codespace address with port 9090 into the LOCAL_URL and GITHUB_TOKEN environment variables within the ENV.
10.	 GITHUB_TOKEN = "Token"
11.	 LOCAL_URL = "CodespaceURL:9090"
Note: Remember to remove the final ‘/’ at the end of the codespace url. Feel free to explore the other codespace address to gain a deeper understanding on how cortex is running locally. For further information on utilising cortex go to: https://cortex.lilly.com/ or try out their endpoint with: https://cortex.lilly.com/docs
________________________________________
Notes/Prerequisites
•	This project requires Node.js and npm to be installed. You can download Node.js from here. All other dependencies can and must be installed by running npm install in your local Promo-Maker directory prior to starting the development server.
•	For local development, the LOCAL_URL and GITHUB_TOKEN environment variables must be set. These will be unique to your codespace and GITHUB_TOKEN will need to be refreshed periodically.
•	The lilly-openai-v4 model class does not work locally. Use lilly-openai-v3 instead.
________________________________________
Deployment
This project is deployed to the Research AWS Light account using CATS. The develop branch is automatically deployed to the dev CATS cluster, the main branch is automatically deployed to the qa CATS cluster, and releases trigger an automated deployment to the prod CATS cluster.
The deployment process is automated using GitHub Actions workflows. The workflows can be found in the .github/workflows directory. The application is containerized using Docker such that the image can be built and pushed to the Research AWS Light ECR. The Dockerfile can be found in the root of the repository.
The deployment folders can be found in the following locations:
•	dev CATS cluster
•	qa CATS cluster
•	prd CATS cluster
Note: During deployments CATS will update the configuration for our application by automatically updating the image tage assocatiated with the deployment.
Within CATS we have several configurations we’ve done to add neccessary functionality such as environment variables, secrets, RDS, and more. For more information on how to utilise cats for your own project go to: https://cats.lilly.com/
________________________________________
Contributing
Please see the CONTRIBUTING.md file for more information on how to contribute to this project.
________________________________________
Links
•	Jira Board
•	Figma



Step-by-Step Contribution Guide
Any member of the Cortex community is encouraged to improve the Cortex documentation. The documentation is managed in Github as Markdown code, and follows standard software development practices, where users submit changes in a Pull Request, to be reviewed by documentation administrators.
Some changes can be made directly in the Github UI, else you can clone, edit, and commit changes using git by following the below process.
Follow these steps to contribute to this documentation repository:
________________________________________
IF YOU DON’T HAVE GIT ON YOUR MACHINE, INSTALL IT.
Clone the repository
 
To Clone the repository to your machine. Go to your GitHub account, open the spe-docs repository, click on the code button and then click the copy to clipboard icon.
Open a terminal and run the following git command:
git clone "url you just copied"
where “url you just copied” (without the quotation marks) is the url to this repository (your fork of this project). See the previous steps to obtain the url.
 
For example:
git clone https://github.com/EliLillyCo/spe-docs.git
Here you’re copying the contents of the spe-docs repository on GitHub to your computer.
Create a branch
Change to the repository directory on your computer (if you are not already there):
cd spe-docs
Now create a branch using the git switch command:
git switch -c your-new-branch-name
For example:
git switch -c test-branch
Make necessary changes and commit those changes
Now make the changes as per your requirement and then, save the file.
If you go to the project directory and execute the command git status, you’ll see there are changes.
Add those changes to the branch you just created using the git add command:
git add .
Now commit those changes using the git commit command:
git commit -m "Put your comment here"
Push changes to GitHub
Push your changes using the command git push:
git push -u origin your-branch-name
replacing your-branch-name with the name of the branch you created earlier.
Submit your changes for review
If you go to your repository on GitHub, you’ll see a Compare & pull request button. Click on that button.
Now submit the pull request. Repository Admin will review your pull request and approve it once verified.

