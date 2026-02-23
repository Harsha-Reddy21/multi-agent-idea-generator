CATS DOCUMENTATION


•	What Is CATS?
•	Introduction
Introduction
Welcome to the Cloud Applications and Technology as a Service (CATS) platform documentation. CATS serves as a pivotal tool for accelerating the development and migration of web applications to the cloud. Spearheaded by the SPE Tech and Platform team, CATS is built using Open Source and AWS services that are designed to make your job as a developer as easy as possible. This platform is tailored to modernize operational workflows, reduce costs, and significantly diminish deployment timelines.
Want to get to know more about the CATS Platform? Ask Cats Agent or CatsBot!
Why CATS?
CATS integrates a GitOps CI/CD methodology to create a seamless operational pipeline from development to production. It is not just a platform but a strategic ally in your cloud-native journey. Here are some of the key features that CATS brings to your development lifecycle:
•	Azure AD Single Sign-On: CATS streamlines your authentication process by offering seamless access management across your applications through integration with Azure Active Directory. This ensures a frictionless sign-on experience, enhancing productivity and security.
•	Active Directory Authorization: With CATS, you gain simple and fine-tuned control over user permissions, ensuring secure and appropriate access to resources. Our platform enables precise management of access rights, bolstering your security posture.
•	Opinionated Automation: Transform your deployment cycles from weeks to hours with CATS's highly opinionated automation strategies. Our platform automates your workflows, allowing for swift and efficient application deployment.
•	Centralized Operations: Monitor and manage all operational aspects from a single vantage point with CATS. Our centralized operations dashboard ensures peak performance, providing visibility into your entire infrastructure.
•	Robust Security: CATS is committed to safeguarding your applications with multi-level vulnerability scanning and robust security protocols. Our comprehensive security measures protect your infrastructure from evolving threats.
•	Auto DNS Provisioning: Enjoy automated DNS setup with CATS for all deployed solutions. Our platform automatically provisions DNS, simplifying domain management and enhancing your application's accessibility.
•	Managed Certificates: CATS automatically provides and manages certificates for all deployed solutions, ensuring secure connections and data integrity without the manual hassle.
•	Integrated S3: Application teams can leverage AWS S3 buckets for storage out of the box with CATS. Our integrated S3 solution offers scalable and secure storage options, easily accessible to your applications.
•	Integrated RDS: Utilize Amazon RDS instances seamlessly with CATS. Our integrated RDS feature allows application teams to deploy relational databases efficiently, supporting scalable and reliable data management.
•	EDB Native integration: CATS offers native integration with EnterpriseDB, providing advanced database capabilities and optimizations for your applications. Leverage this integration for high-performance database solutions.
•	RED Data Ready: CATS is fully qualified to host applications handling red data, ensuring compliance and security for sensitive information.
•	GxP Qualified: CATS has been qualified as GxP compliant, with related quality documentation readily available in our Quality Docs. Trust in our platform to meet your compliance needs effectively.
CATS Components
CATS is an opinionated platform with a complex architecture, designed with components that aims to streamline your development and deployment workflows. At the heart of the platform are key components essential for hosting applications and overseeing authentication and permissions management. Below is a detailed diagram illustrating the CATS architecture and how each component work with one another.
 
Major Components at a Glance
•	EKS: Orchestrates the deployment and scaling of containerized applications within our Kubernetes cluster.
•	EC2/Fargate: Provides the flexible compute resources needed to power your applications.
•	GitHub Repository: A secure repository for your source code, integrated into the CI/CD pipeline.
•	Azure Active Directory: Manages user authentication, ensuring secure access to the platform.
•	Bouncer: Handles nuanced authorization processes to keep your operations smooth and secure.
•	Amazon ECR: Stores and manages container images, facilitating continuous deployment within the Kubernetes ecosystem.
For a deeper dive into each component and how they interlace to empower your cloud applications, continue to the respective sections of our documentation.
S




•	What Is CATS?
•	Platform Overview
Platform Overview
To help you embark on your journey with CATS, we offer three separate clusters to application teams:


Environments
SBX Environment: SBX Cluster
Development Environment: DEV Cluster
QA Environment: QA Cluster
Production Environment: PRD Cluster
The CATS Platform is composed of four Kubernetes clusters, each designed for a specific use case. We recommend that application teams deploy their solutions in the Production Cluster, which offers high stability. Within this cluster, solutions can be organized using folder and namespace suffixes (e.g., namespace-dev, namespace-qa, namespace-prd) for efficient management.
Please note: The Development (DEV) Cluster does not come with any stability guarantees. Despite our efforts to stabilize it through the introduction of the Sandbox (SBX) Cluster, the DEV Cluster remains prone to occasional disruptions. The SBX Cluster is exclusively for the CATS Platform Team to carry out platform development, and as a result, it may experience instability due to ongoing work. Platform components are initially developed and tested in the SBX Cluster to reduce the frequency of cluster-breaking changes in the DEV Cluster, though such incidents may still occur.
Both the DEV and SBX Clusters are subject to periodic wipes, downtime, and unforeseen issues. Only the CATS Platform Team should be working in the SBX Cluster.
For most use cases, especially when your application does not require a VPCE (Virtual Private Cloud Endpoint), deploying in the Production Cluster is strongly encouraged due to its higher stability. Please refer to the table below to select the most suitable cluster for your application.
Review the below table to better understand how each application deployment repo maps to a different amazon account on a different VPC. Many users run into VPC issues so please ensure you are developing your solution in the correct environment. See our documentation on AWS VPCs for further detailis on which VPC you may be working with.
Different Cluster Details:
Cluster	App Deployment Repo	AWS Account Name	AWS Account ID	VPC Access
Production Cluster	infra_apps
prod-igw-dx-researchit-light	283234040926	vpc-0ea80082460c43671 // vpce-03bee17f69c9802b9
QA Cluster	infra_apps_qa
qa-igw-dx-researchit-light	474366589702	vpc-0d4e782cbe86eb07c // vpce-058757a9c034d181c
Development Cluster	infra_apps_test
dev-igw-dx-researchit-light	408787358807	vpc-06a3d8f2cdafb8a6e // vpce-069388414a9f87f40
Sandbox Cluster	infra_apps_sbx
dev-igw-dx-lrl-researchit-light-sbx	891377229906	vpc-06a3d8f2cdafb8a6e // vpce-069388414a9f87f40


Development Cluster for Beginners
For those who are new to CATS and eager to experiment, our development cluster is the perfect spot to unleash your creativity as it gives you full flexibility and admin access to the cluster. Get your hands dirty without any fear of breaking things:
•	Explore and Experiment: Visit the Apps Test Repo to start playing around in a safe, isolated environment.
⚠️ IMPORTANT: The playground cluster is inherently unstable and is not intended for production use. Any work you do here may be lost at any time, so be sure to back up your data locally before deploying. This ensures that you won't lose your work during any unexpected incidents.


QA Cluster for Testing
If you're already acquainted with the basics and ready for quality assurance testing, the GitHub Repo is your gateway: Apps Test QA Repo
•	Deploy with Confidence: The QA cluster is an exact copy of the production cluster where you can accurately test your solution without being in the production environment.
When the CATS platform team schedules platform upgrades, we request our users use the QA cluster to test their solutions against our changes to ensure stability. We provide a TWO DAY QA testing window for all updates.


Production Cluster for Official Deployment
If you're already acquainted with the basics and ready for the real action, the official GitHub Repo is your gateway: Apps Repo
•	Deploy with Confidence: This is our production cluster so feel confident that it is a secure and stable environment for your solution.
By setting up these three environments, we aim to provide a seamless and accommodating development experience, regardless of your expertise level with CATS.


Cross AWS Account Connections
When planning a connection between two AWS accounts the first thing that should be verified is if the accounts are on the same VPC. Below you can find a table that outlines the deployment repo your solution is deployed in on the CATS platform and which AWS account that deployment maps too along with the VPC the AWS account is on.
See our documentation on AWS VPCs for further detailis on which VPC you may be working with.
Cluster	App Deployment Repo	AWS Account Name	AWS Account ID	VPC Access
Production Cluster	infra_apps
prod-igw-dx-researchit-light	283234040926	vpc-03bee17f69c9802b9
QA Cluster	infra_apps_qa
qa-igw-dx-researchit-light	474366589702	vpc-058757a9c034d181c
Development Cluster	infra_apps_test
dev-igw-dx-researchit-light	408787358807	vpc-069388414a9f87f40
Sandbox Cluster	infra_apps_sbx
dev-igw-dx-lrl-researchit-light-sbx	891377229906	vpc-069388414a9f87f40
If the AWS Account housing your AWS Resources is NOT on the same VPC as the AWS account where your solution is deployed, then you CANNOT communicate between those two accounts.
There are two solutions if this happens to you.
1.	Create a new AWS account that is on one of the thee VPCs that one of the CATS Clusters is on.
2.	Re-Deploy your solution to one of the CATS AWS Accounts that has a VPC that maps to your non CATS AWS Account.
In Summary:
•	AWS Dev account can only connect to other AWS Dev accounts on the VPC 069388414a9f87f40.
•	AWS QA account can only connect to other AWS QA accounts on the VPC 058757a9c034d181c.
•	AWS Prod account can only connect to other AWS Prod accounts on the VPC 03bee17f69c9802b9.
Basic System Services Available
CATS is equipped with a comprehensive suite of services designed to empower our application teams, providing a rich, out-of-the-box experience that facilitates development, deployment, and monitoring. Here's what you can expect:
•	CATS Agent: The CATS Agent enhances platform operations by combining documentation insights with real-time Kubernetes intelligence. It uses live resource data in the cluster to perform context-aware diagnostics and provide actionable insights, enabling users to troubleshoot and optimize deployments efficiently within the platform.
o	CATS Agent can be found HERE
•	CATSbot Virtual Assistant: The CATSbot is an intelligent chat bot designed to assist users in understanding and utilizing the CATS Platform.
o	CATSbot can be found HERE
•	Kubernetes Dashboard: Gain insights and manage your Kubernetes resources with an intuitive, web-based user interface. This is the most important dashboard for the average user. Please try accessing one of the links below, if you do not have access to the dashboard you can request access via the Developer Front Door. After being added to the group it will take around 24 hours for the changes to be reflected on your end.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	Ingress Dashboard (Traefik): Simplify the management of external access to your services with a versatile Ingress controller, featuring a user-friendly dashboard for easy configuration.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	GitOps (Automated CI/CD via Argo ): Embrace the principles of GitOps for continuous integration and deployment, automating your pipeline for increased efficiency and reliability.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	Metrics Dashboard (Grafana/Prometheus): Monitor your application's health and performance with detailed metrics visualized through Grafana, powered by Prometheus's robust monitoring capabilities.
o	Production Environment Dashboard
o	Qa Environment Dashboard
o	Dev Environment Dashboard
•	Logging Dashboard (OpenObserve): Access and analyze logs from your applications and infrastructure in one centralized dashboard, enhancing observability.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	Cost Monitoring (Kubecost): Keep your cloud expenses in check with detailed insights into your Kubernetes costs, helping you optimize resource allocation and spending.
o	Dev Environment Dashboard
o	Qa Environment Dashboard
o	Production Environment Dashboard
•	S3 UI Tool (CloudBrowser): Interact with AWS S3 buckets effortlessly using CloudBrowser, a graphical interface that streamlines storage management.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	Auto Resource Deployer (Crossplane): Automate the deployment of cloud resources across multiple providers with Crossplane, simplifying cloud-native application management.
o	Additional Documentation on Crossplane: HERE
•	Authentication Service (Bouncer): Secure your applications with Bouncer, providing robust authentication services to safeguard access.
o	Bouncer Repository Source Code located: HERE
•	Restful SDK:
o	Python Light Client Service: Integrate your Python applications seamlessly with our platform using the lightweight client SDK.
	Library is located HERE
o	R Light Client Service: Leverage the R language for statistical computing and graphics with our easy-to-use client SDK.
	Library is located HERE
Each service is designed to enhance your productivity and streamline your operations, ensuring you have the tools you need to succeed. Embrace the full potential of CATS and transform your application development and deployment processes.


•	What Is CATS?
•	Shared Responsibility Model
Shared Responsibility Model
A shared responsibility model is a framework that defines and distinguishes the responsibilities between different parties involved in managing and operating a system, platform, or service. This model helps clarify what each party is responsible for, ensuring that all aspects of the system are covered without overlap or confusion.
In the context of cloud computing and platforms like AWS, Kubernetes, or even internal platforms (like CATS), a shared responsibility model typically divides responsibilities between the service provider (e.g., AWS, the CATS Platform Team) and the users or customers (e.g., Lilly Application Development Teams). It ensures that both sides understand their roles in maintaining security, functionality, and performance.
 


Working Agreement
By proceeding with the use of the CATS platform, application teams acknowledge and agree to abide by the shared responsibility model outlined herein. Application teams are fully responsible for maintaining their own configurations, containerizing their applications, and addressing any issues related to their deployments. The platform team will not be held responsible for problems stemming from misconfigurations, application errors, or improperly maintained CI/CD workflows within individual applications. It is the responsibility of each app team to resolve these issues independently, ensuring that their applications function correctly within the platform's infrastructure.


Platform Team Responsibilities:
Infrastructure Management:
•	Full responsibility for maintaining the AWS EKS cluster, worker nodes, and scaling through tools like Karpenter.
•	Monitor and ensure the health of the platform’s infrastructure (nodes, autoscaling, etc.).
GitHub Validation and Compliance:
•	Maintain the validation pipeline in GitHub, ensuring that all config changes (e.g., Kubernetes YAML files) go through proper checks before merging.
•	Establish policies and enforce guidelines to ensure that app teams' configurations meet best practices before deployment.
Networking and Security:
•	Route53: Manage DNS configurations, create and maintain DNS entries for ingress routing.
•	Ingress Controller: Maintain ingress controllers, load balancers, and ensure proper routing and security for incoming traffic.
•	Networking Policies: Implement and maintain security group policies, service meshes (if applicable in the future), and any VPC configurations to ensure secure network traffic.
•	TLS/SSL Certificate Management: Ensure that all external-facing services are secured with SSL/TLS certificates.
System Services Maintenance:
•	Argo CD and Flux: Ensure proper functioning and continuous updates of GitOps tools like Argo CD and Flux for application deployment.
•	Monitoring Tools: Maintain observability services like Grafana, Prometheus, and custom dashboards to monitor cluster health and application performance.
•	Authentication Services: Maintain and update the Bouncer authentication service to ensure seamless integration with AD Groups for app team access.
•	Logging and Audit: Ensure that centralized logging (e.g., using ELK stack, Loki) and audit trails are enabled for all deployments.
CI/CD Workflows:
•	Maintain the CI/CD pipeline that allows Kubernetes configurations to be automatically deployed to the cluster when pushed to the GitHub repo.
•	Ensure that deployment pipelines have proper rollback strategies and notifications on failure.
•	Support: Ensure system uptime, provide support for platform-level bugs, and monitor platform services like the cluster, networking, and key system services (Argo CD, Ingress, etc.).
•	Support Tier 2/3 for infrastructure issues but not app-specific issues.
Platform Updates:
•	Perform regular updates, security patches, and scaling optimizations for Kubernetes and platform services (e.g., EKS version upgrades, system service upgrades like Argo CD).
Validation Package:
•	The CATS Platform Team is responsible for managing the validation documentation required for the overall platform.
•	The platform maintains the GCP Neutral status via the "CATS - Qualification Plan", ensuring that all necessary validation efforts are conducted to meet and uphold this qualification.
•	The team manages and maintains the "CATS - Security Plan and Administration SOP" to ensure the platform’s security practices are well-documented and in compliance with Lilly standards.
•	Platform-level validation efforts include infrastructure, networking, security measures, and system services, ensuring that the platform meets the necessary compliance and operational standards.
•	Out of Scope: The platform validation documents are focused solely on the CATS platform infrastructure, services, and security measures. The content, performance, or validation of individual applications fall under the purview of the app teams.


Application Team Responsibilities:
Kubernetes Configuration Maintenance:
•	Write, maintain, and update their Kubernetes resource files (e.g., Deployments, Services, Ingress, Secrets, ConfigMaps).
•	Ensure configurations adhere to best practices and are validated against the platform’s GitHub Validator before merging to the main branch.
Application Containerization:
•	Create, maintain, and update Dockerfiles to containerize their applications. Ensure that images are secure, optimized, and follow platform guidelines (e.g., using the latest stable base images).
Solution's CI/CD Workflows:
•	Write and manage their GitHub Actions or equivalent workflows that trigger their app deployments.
•	Ensure their workflows follow platform templates but take responsibility for customizing and debugging issues with their specific CI/CD pipelines.
App Debugging and Resolution:
•	Application Failures: Handle debugging and resolution of application-specific issues, such as 404 errors, application crashes, or misconfigurations that lead to failed deployments.
•	Ingress and Routing: Ensure that Ingress routing is properly configured and is aligned with the platform’s network policies.
•	Resource Management: Manage the resources their apps consume (e.g., CPU, memory limits), ensuring that they scale appropriately.
Identity and Access Management (IAM):
•	App teams are responsible for managing IAM roles and permissions for their applications. This includes defining who can access their resources and what actions they can perform.
•	Teams must ensure that IAM policies are correctly configured to protect sensitive data and comply with organizational security requirements. This responsibility also encompasses the creation and maintenance of service accounts, which are essential for enabling applications to interact securely with other services and resources.
•	Proper management of IAM roles, permissions, and service accounts is crucial for maintaining application security and integrity within the CATS platform.
App-Specific Monitoring:
•	Set up and maintain their application-level monitoring and alerting (e.g., using custom Grafana dashboards) to track app performance and health.
•	The platform team provides system-level dashboards, but app teams must create specific monitoring for their apps via provided services such as the Metrics Dashboard.
Security Compliance:
•	Ensure application images are free of vulnerabilities and scanned before being pushed to AWS ECR (e.g., using tools like Github's Automated Security Scanning tool).
•	Manage application-level secrets using appropriate Kubernetes tools (e.g., Secrets or external secret management systems like AWS Secrets Manager). We provide guidence on how to effectively manage your solution's secretes but the creation, maintenence and overall management of the secretes is on the application team.
Application Ownership:
•	App teams are fully responsible for managing their service’s lifecycle, updates, and retirement, ensuring that resources are cleaned up when no longer needed. Ensure application resiliency (e.g., proper health checks, liveness/readiness probes) to avoid platform-wide disruptions.
Validation Package:
•	Each individual app team is responsible for maintaining their own validation documents for their specific applications.
•	The platform team's validation efforts do not extend to how individual applications are built, deployed, or operated.
•	App teams must ensure that their applications comply with any validation requirements specific to their operations, industry regulations, or internal Lilly processes.




•	What Is CATS?
•	GitHub repositories
GitHub
The source code for CATS is spanned across multiple GitHub repositories. Check out the list of repositories here.
Access is controlled through GitHub Team memberships. See https://github.com/EliLillyCo/LRL_light_k8s_infra_apps_docs/blob/main/docs/guide/GitHubTeams.md for more details.
Application Deployment Repos
Environment	Repository	Description
Development	LRL_light_k8s_infra_apps_test
Application deployment repo that allows customers to deploy their solutions into our Dev Cluster
QA	LRL_light_k8s_infra_apps_qa
Application deployment repo that allows customers to deploy their solutions into our QA Cluster
Production	LRL_light_k8s_infra_apps
Application deployment repo that allows customers to deploy their solutions into our PRD Cluster


Platform Infrastructure Repos
The following list of github repositories contain parts of the CATS infrastructure in some way or another.
Repository URL	Description
LRL_light_k8s_infra
Main infrastructure code for CATS. Largest repo that majority of source code is housed in. Likely references other repos with smaller components.
LRL_light_k8s_infra_apps_docs
Contains the source code for this Docs Site!
LRL_light_k8s_infra_CATSbot
This repository contains automation that periodically retrains the CatsBot using updated content from the Cats Documentation Repository. By continuously aligning with the latest changes on the documentation site, the bot is able to provide users with accurate and current information.
LRL_light_k8s_infra_app_client_python
Python-based client libraries for interacting with Kubernetes apps in the Light infra.
LRL_light_k8s_infra_app_client_r
R-based client libraries for Kubernetes applications on the Light infrastructure.
LRL_light_k8s_infra_apps_validator
Will contain tools and automation scripts designed to validate applications within the Light Kubernetes infrastructure. This validation process includes automated tests, configuration checks, and compliance verifications, ensuring each application meets the required standards before deployment. By continuously monitoring and validating applications, this repository helps maintain quality, stability, and compliance across the Kubernetes environment. In Development still.
LRL_light_k8s_infra_go_bouncer
Bouncer is an authorization service that uses Microsoft Graph & K8s to provide easy authorization for microservice applications. This version is written in GO.
LRL_light_k8s_infra_bouncer
Deprecated - Original Bouncer Service that handled authentication services for the cluster
LRL_light_k8s_infra_credential_service
This repo contains a simple service designed to be deployed as a K8s cron job that periodically pushes ECR temporary docker credentials to the github actions secret store.
LRL_light_k8s_infra_echo
This repo contains RESTFUL API's to check networking inside of a k8s pod
LRL_light_k8s_infra_healthcheck
Health-check service for monitoring CATS Kubernetes infrastructure status.
LRL_light_k8s_infra_manager
This project manages the Light K8s custom infrastructure resources. This includes managing syncing AppRunner with the cluster ingress for external access, managing compute profiles per annotations on the namespace object, and provisioning roles in AWS with connection to k8s.
spe-platforms-agent
This repo contains the source code for the CATS Platform Agent toolkit server
LRL_cats_argocd_test
Test configurations for deploying applications using ArgoCD in the CATS environment.
LRL_eks_cert_manager
cert-manager is a Kubernetes addon to automate the management and issuance of TLS certificates from various issuing sources. It will ensure certificates are valid and up to date periodically, and attempt to renew certificates at an appropriate time before expiry.
LRL_light_aws-smtp-relay
SMTP server to relay emails via Amazon SES or Amazon Pinpoint using IAM roles.
LRL_light_livedesign
This repository contains the CDK stacks to deploy livedesign AWS infrastructure
LRL_light_omics_docs
Documentation and resources for the Omics solution.
LRL_light_security
This repository contains python automation code to create LIGHT security controlls. The automation is designed to be idempotent. It will always try to make the AWS Account where it's run match the data domain definitions defined in the repository.
LRL_light_traefik-forward-auth
A minimal forward authentication service that provides OAuth/SSO login and authentication for the traefik reverse proxy/load balancer.
aws-efs-csi-pv-provisioner
Kubernetes CSI driver to dynamically provisions Persistent Volumes (PVs) in response to user-requested Persistent Volume Clains (PVCs). Each PV / PVC is a subdirectory on a single, cluster-wide EFS file system. Works in conjunction with the AWS EFS CSI driver.
aws-fsx-ontap-configs
Maintain the CF and other configurations for Amazon FSX for ONTAP
crossplane
Crossplane configurations for managing cloud-native Kubernetes resources.
crossplane-contrib_provider-aws
This provider-aws repository is the Crossplane infrastructure provider for Amazon Web Services (AWS). The provider that is built from the source code in this repository can be installed into a Crossplane control plane
eks-charts
Helm charts for deploying resources and services on AWS EKS.
flux
Flux GitOps configurations for Kubernetes clusters.
fluxcd-community_helm-charts
Community-contributed Helm charts for FluxCD deployments.
fluxcd_flux2
Flux v2 configurations and controllers for GitOps deployments in Kubernetes.
fluxcd_helm-controller
Helm controller for FluxCD to manage Helm releases in GitOps workflows.
fluxcd_image-automation-controller
FluxCD controller for automating container image updates.
fluxcd_image-reflector-controller
Reflects container image metadata for FluxCD automation.
fluxcd_notification-controller
Notification controller for alerting and event-based actions in FluxCD.
grafana-helm-charts
Helm charts for deploying and configuring Grafana in Kubernetes.
kedacore-charts
Helm charts for KEDA, an event-driven autoscaler for Kubernetes.
lrl-aws-tools
Standard docker tools for AWS & K8s. Collection of AWS tools and utilities used within the LRL infrastructure.
lrl-cloud-browser
This repository contains the API and web application for browsing cloud object stores.
lrl-cloud-browser-1
Deprecated - Legacy version of the LRL cloud resource browser.
lrl-cloud-patterns
This repository is designed to provide guides, templates, and code samples for common cloud patterns in Lilly RIDS.
lrl-cluwe-cli-api-solutions
this repository use to keep api for fsx api via cli access.
lrl-pgadmin
This repo contains code that extends PG Admin server to securly auto refresh database credentials from a kubernetes environment scoped to named users. This allows secure remote access to postgresql databases isolated in a kubernetes cluster deployment.
openobserve
Observability and monitoring resources for Kubernetes clusters.
openobserve-helm-chart
Helm chart for deploying OpenObserve observability tools.
prometheus-community-helm-charts
Helm charts for Prometheus monitoring systems.
FairwindsOps/gemini
Gemini is a Kubernetes CRD and operator for managing VolumeSnapshots. This allows you to create a snapshot of the data on your PersistentVolumes on a regular schedule, retire old snapshots, and restore snapshots with minimal downtime.
rds_database_creation
This repository contains information on the process as well as the CloudFormation template that is required when restoring a relational database from a backup or a snapshot. This template can also be used for the initial RDS setup. Please note that this would be independent of your application CI/CD pipeline and would only be used for either creating a new DB instance or restoring an RDS instance from snapshot.
elastic_cloud-on-k8s
Elasticsearch
cert-manager_cert-manager
New Cert Manager
grafana_mimir?tab=readme-ov-file
Mimir
jaeger_helm-charts
Jaeger
grafana-helm-charts/commits/main/
Promtail + Loki (Old Grafana Helm)





•	What Is CATS?
•	GitHub Teams
GitHub Teams for CATS
Role-based access to CATS team code in GitHub is managed through GitHub Teams.
Least-privileged access should be granted to users based on business need in the following hierarchy.
The following is the apparent hierarchy of CATS teams. Note that these are currently not consistently implemented as of April 23, 2025. Please verify team access before assigning roles.
GitHub Teams for CATS
Team	Purpose
GitHub_Read_Only
All people within the Eli Lilly Organization. Read-only access.
lrl_light_infra_admin
Admin access to LIGHT Infra GitHub Repos.
LRL_light_k8s_infra_write
Write access to LIGHT Infra GitHub Repos.
lrl_light_infra_approvers
Maintainer access to LIGHT Infra Repos.
light_apps
Deploying applications to the LIGHT platform.
Deprecated/Redundant Teams
⚠️ Deprecated Teams: These teams are no longer in use and should not be assigned to new members.
Team	Purpose
LRL_light_k8s_infra_read
Read access to LIGHT Infra GitHub Repos.
Coming Soon
These are the Hangar teams. These teams will soon merge their processes with CATS.
Team	Purpose
hangar-read
'Read' access for spe-platform-engineering teams.
hangar-temporal-devs
Developers for the Temporal platform on Hangar.
hangar-write
'Write' access for spe-platform-engineering teams.
hangar-admin
'Admin' access for spe-platform-engineering teams.
hangar-maintain
'Maintain' access for spe-platform-engineering teams.





•	What Is CATS?
•	CATS Platform Agent
CATS Platform Agent
CATS Platform Agent is your advanced assistant for platform operations, seamlessly integrating documentation insights with real-time Kubernetes cluster intelligence. Building on the foundation of CATSbot, it goes beyond static knowledge retrieval by offering dynamic, context-aware diagnostics and actionable insights with operational capabilities. With its ability to connect directly to platform clusters, CATS Agent empowers users to access live resource data, troubleshoot issues, and optimize deployments with precision.
Overview
CATS Agent combines the knowledge base of CATSbot with real-time cluster connectivity, allowing users to:
•	Query actual cluster resources and states
•	Diagnose deployment issues with real-time data
•	Receive personalized recommendations based on your specific infrastructure
Key Features
Real-Time Cluster Information
•	View configuration, state, and health metrics of your Kubernetes resources
•	Get detailed logs and events for troubleshooting
•	Monitor resource utilization and performance metrics
Context-Aware Assistance
•	Combines documentation knowledge with your actual cluster state
•	Provides personalized recommendations based on your specific infrastructure
•	Suggests optimizations and best practices for your deployments
Interactive Operations
•	Execute controlled kubectl commands directly from the chat interface
•	Explore namespaces and resources across your clusters
Accessing CATS Agent
In Chat-In-The-Box
CLICK HERE to access CATS Agent through Chat-In-The-Box.
INFO
CATS Agent requires the same access provisioning as CATSbot via the lrl_cats_access_non_rids AD Group. See the Get Access section for details on joining this group.
 
Using CATS Agent
CATS Agent provides a range of capabilities through its specialized tools:
Querying Cluster Resources
Get real-time information about any resource in your cluster:
Show me all pods in <your-namespace> namespace that are not running

Get details about the ingress configuration for <your-application> in <your-namespace> namespace

List all deployments in the <your-namespace> namespace and their current status

Diagnosing Issues
Troubleshoot deployment and configuration problems with context-aware assistance:
My application in namespace <your-namespace> is returning 503 errors. What could be wrong?

The persistent volume claim for my database isn't binding. Help me diagnose the issue.

Check why my deployment pods in the <your-namespace> namespace are crashing and suggest a fix

Combining Documentation with Real-Time Data
Get comprehensive answers that merge platform knowledge with current cluster state:
What's the best way to scale my stateful application in the <your-namespace> namespace given my current resource utilization?

Explain how ingress works in CATS and check if my current configuration on the <ingress-name> ingress follows best practices

Security and Permissions
CATS Agent operates with strict security controls:
•	All operations require authentication using your organizational credentials.
•	Access is limited to read-only and non-destructive actions on cluster resources.
•	Every action is logged to ensure auditability and compliance with organizational policies.
Available Tools
CATS Agent provides these specialized tools:
Knowledge Base Querier
•	Retrieves documentation and best practices for CATS platform
•	Provides general guidance on Kubernetes concepts and patterns
•	Answers questions about platform features and capabilities
Kubernetes Resource Explorer
•	Executes read-only kubectl commands to fetch real-time information
•	Supports get, describe, list and logs operations
•	Requires namespace specification for proper resource scoping
Namespace Explorer
•	Shows available namespaces in your clusters
•	Filters results based on your access permissions
•	Provides usage statistics and resource allocation
Edit this page




•	What Is CATS?
•	CATSbot Virtual Assistant
CATSbot Virtual Assistant
MEET YOUR NEW DEPLOYMENT ALLY: CATS AGENT!
Struggling with deployment hiccups on the CATS Platform? Say hello to CATS Agent – your on-demand, real-time assistant! 🛠️ Whether you're tackling tricky troubleshooting or configuring your deployments, CATS Agent is here to take your productivity to the next level! 🌟
CatsBot is your reliable App Deployment Assistant, designed to answer all questions about the CATS Platform. With CatsBot, you can troubleshoot deployments, and effortlessly create Kubernetes resources like namespaces, deployments, ingresses, services, and more++
Using CATSbot in Chat-In-The-Box
CLICK HERE to try out CATSbot!
INFO
CATSBot access is provisioned via the same AD Group that provides access to the CATS Platform's Dashboard offerings, lrl_cats_access_non_rids. See the Get Access section for more details on how to join this group.
 
You can also use Chat-In-A-Box to create your own chat bots. Controling what model you want to use, what information you want your bot trained on, and permissions to the bot! Feel free to try it out!


Using CATSbot in Teams
Now you can use CATSbot in teams via the Eli Labs For Teams applications
 
Setup
1.	When in a chat click the plus button at the bottom where you draft a message
2.	Click, "get more apps"
3.	A new window should pop up, now click the blue "Get More Apps" button
4.	Now search for "ELI LABS for Teams" and click the "Add" button.
5.	Now you can either open it directly or choose a chat location to place the app. We suggest selecting a group chat the includes all the members of the project you are working on.
Initiating the Bot
To begin chatting with CATSbot using the "ELI LABS for Teams" application, you first need to initiate the chat by mentioning the application in the Teams chat where it has been added. For example, type something like "@ELI LABS for Teams, tell me about CATS". This action will add the application to the chat group and prompt you to select a model. Find the CATSbot model, star it to mark it as a favorite for easy access, and then click the chat bubble icon to start interacting with it. Once you’ve favorited the model and confirmed the name, you’re ready to begin chatting.
To ask questions, simply tag the application again (e.g., @ELI LABS for Teams) and type your query. This allows you and your peers to chat with CATSbot in Teams group chats while working.
Example:
 
Edit this page




•	News
•	Important Announcement
🚨 Important Announcement: IAM Policy Update Affecting App Authentication
Date Posted: June 13, 2025
Status: Active Issue - Bypass Available
Impact: All application teams using device code flow authentication
________________________________________
Overview
A recent conditional IAM policy change is currently blocking all authentication to app registration via device code flow as well as all connections to users outside of the Lilly network.
While we are working towards implementing a global resolution to this issue, immediate bypass steps are available below.
🔧 Immediate Action Required
To ensure your applications continue functioning properly, please have your team members follow this process to bypass the CA policy:
Bypass Steps
1.	Go to the Microsoft MyAccess Portal
2.	Navigate to Access Packages
3.	Navigate to the Active tab
4.	Open the access package: Island Browser Policy Opt-Out
5.	Click Continue
6.	Provide an explanation in the "What problem(s) did you face with using Island?" field
7.	Leave "Request for a specific period" set to "No"
8.	The business justification field can be left blank
9.	Press the Submit request button
📊 Impact Summary
Affected Systems
•	All applications using device code flow authentication
•	Applications requiring external user connections
•	Any app registration processes
Expected Resolution
We are actively working on a platform-wide solution to resolve this authentication issue permanently. This bypass process is a temporary measure to keep your applications operational while we implement the global fix.
🆘 Need Help?
If you encounter issues with the bypass process or need additional support:
•	(Lilly Flow) CATS Club
•	(Lilly Flow) Ask a Question
•	(Jira) Project Board
•	(Jira) Make a Triage Request
•	(SNOW) Report an Issue
•	CATS Docs
________________________________________
Last Updated: June 13, 2025
Next Update: We will provide updates as we progress toward the permanent solution
________________________________________
CATS Platform Team 🐈



•	News
•	Release Notes 2025
Release Notes 2025
4.6.2 - Temporal Enhancements, and Production Stability
Released June 13th, 2025
Github Release Notes
🚀 New and Upcoming Enhancements
1.	Temporal Service Enhancements
o	Enabled cross-namespace access by default for improved service connectivity.
o	Added security group rules allowing pod connections to Temporal service on port 7233.
o	Enhanced workflow orchestration capabilities across namespace boundaries.
📊 Production Stability and Performance
1.	Bouncer Service Enhancements
o	Enhanced access logs S3 compactor functionality for improved log management.
o	Optimized log processing and storage efficiency.
🔄 Backup and Disaster Recovery
1.	Velero Production Enhancements
o	Replaced inline JSON policy definitions with JSON.stringify for improved readability and maintainability.
o	Adjusted memory resource requests and limits for optimal backup performance.
o	Updated nodeSelector and tolerations to align with Karpenter-managed node pools.
o	Increased CPU/memory maximums for container full backup operations.
o	Applied IAM policy hotfixes for enhanced security and functionality.
🔐 Policy and Security Management
1.	Kyverno Policy Production Refinements
o	Disabled mutateExistingOnPolicyUpdate to prevent retroactive policy mutations in production.
o	Removed unused IAM role assumptions and redundant context definitions.
o	Streamlined mutation logic for improved policy configuration management.
2.	IAM Role Management
o	Resolved IAM role name duplication issues for cleaner resource management.
o	Enhanced security through proper role isolation and naming conventions.
🛠 Production Release Management
1.	Release Asset Promotion
o	Successfully promoted release assets from development through QA to production.
o	Enhanced deployment pipeline reliability and consistency across environments.
2.	Bouncer Environment Variable Optimization
o	Simplified logPrefixValue determination logic by removing cronJob parameter dependency.
o	Improved service configuration maintainability.
🔎 Issue References
[CATS-1866], [CATS-1870], [INC13528294]
🌐 Impact Summary
Namespaces Affected
•	ingress-entry, velero, temporal
Key Configuration Changes
•	LLM domain routing and API configurations
•	Enhanced Velero backup policies for production workloads
•	Improved Temporal service networking rules
•	Refined Kyverno policy configurations for production stability
Production Improvements
•	Enhanced backup operation resource allocation
•	Improved cross-namespace service connectivity
•	Streamlined release asset promotion processes
4.6.1 - Infrastructure Scaling and Self-Service Foundation
Released May 15th, 2025 ::: Github Release Notes
🚀 New and Upcoming Enhancements
1.	Cluster Self-Service Toolkit (Development Phase)
o	Initial implementation of cluster self-service capabilities in development environment.
o	Foundation for organization policy management and cluster governance tools.
o	Integrated Bouncer logs with Athena query and Grafana visualization for enhanced monitoring.
2.	Velero Backup Service Integration
o	Added Velero backup and restore capabilities to the platform.
o	Enhanced disaster recovery options for cluster workloads and configurations.
📊 Infrastructure Scaling and Performance
1.	LiveDesign Karpenter Optimizations
o	Updated LiveDesign Karpenter nodes to larger instance types for improved performance.
o	Increased node limit to 3,000 to support scaling requirements.
o	Removed memory limitations to allow for better resource allocation flexibility.
o	Expanded LiveDesign non-critical node pool capacity from 80 to 240 nodes.
2.	Karpenter Configuration Fixes
o	Resolved instanceCPU value type error for improved stability and reliability.
3.	KEDA Scaling and Tuning
o	Enhanced KEDA autoscaling configurations for better workload management.
o	Improved scaling responsiveness and resource utilization.
🔐 Policy and Governance
1.	ArgoCD ClusterPolicy Enhancements
o	Tuned ArgoCD ClusterPolicy configurations for improved application management.
o	Enhanced policy-driven resource generation and management capabilities.
o	Fixed UpdateRequest queue issues with ArgoCD Application generation rules.
2.	Bouncer Service Improvements
o	Increased Bouncer replica count for better availability and load distribution.
o	Enhanced service resilience and performance under load.
3.	Organization Policy Tuning
o	Refined organization-level policies for better cluster governance.
o	Improved compliance and security policy enforcement.
🛠 Developer Experience
1.	Environment-Specific Configurations
o	Staged spe.lilly.com for all clusters except production environments.
o	Enhanced development and testing capabilities with proper environment isolation.
2.	Namespace Partition Features
o	Fixed namespace partition feature flag environment variable naming.
o	Improved namespace management and isolation capabilities.
3.	Release Asset Management
o	Streamlined release asset promotion process across environments.
o	Enhanced deployment pipeline reliability for self-hosted runners.
🔎 Issue References
[CATS-1544], [CATS-1615], [CATS-1814], [CATS-1835], [CATS-1837], [CATS-1848]
🌐 Impact Summary
Namespaces Affected
•	karpenter-system, argocd, bouncer, velero, keda-system
Key Configuration Changes
•	Significantly enhanced Karpenter node pool scaling capabilities
•	Introduction of Velero backup service
•	Improved ArgoCD policy management
•	Enhanced autoscaling configurations
Performance Improvements
•	3,750% increase in LiveDesign node pool capacity (80 to 3,000 nodes)
•	200% increase in non-critical node pool capacity (80 to 240 nodes)
•	Removed memory allocation constraints for better resource utilization
4.4.1 - Cost management, ExternalSecrets, and Scheduling
Released April 21st ::: Github Release Notes
🚀 New and Upcoming Enhancements
1.	AI Cluster Agents
o	Enables querying of live production cluster state using CATS cluster agents.
2.	Admission Webhook Controller
o	Introduces feature toggles in preparation for Kyverno-generated Flux resources.
3.	ArgoCD
o	Upgraded to version 2.14.7.
o	Supports fine-grained roles and enables publishing managed resources to Application pages.
4.	Cert-Manager
o	Deployed ClusterIssuer to support system-wide service certificate management.
5.	Credential Services
o	Rolled out a new workflow running on self-hosted runners (in-cluster) for on-demand credential generation.
o	📅 Documentation and architecture will be published on April 21.
6.	Kafka
o	Initial assets staged for a platform-wide Kafka service.
7.	Kyverno
o	ArgoCD generators now offer finer-grained control over policy-driven resources.
📈 Observability Enhancements
1.	OpenTelemetry
o	Initial release of the OpenTelemetry operator for dynamic observability routing.
2.	Prometheus Blackbox Exporter
o	Launched to monitor system service health with cluster service scraping.
3.	Grafana
o	New dashboards for Blackbox Exporter.
o	Introduced "Hangar" dashboards for utilization and cost metrics.
4.	OpenCost
o	Bugfixes implemented for Infrastructure as Code IAM roles.
🔐 Secrets Management
1.	External Secrets Operator v2
o	Now leverages ClusterIssuer for improved namespace independence and certificate management.
⚙️ Workload Scheduling
1.	Karpenter
o	Increased vCPU limits for default NodePools.
o	Minimum node size set to 47 vCPUs.
o	Baseline ephemeral storage set to 500Gi.
o	New "compute" node type added to support compute-heavy workloads.
🛠 Self-Hosted Runners
•	Prepped for upcoming changes supporting the new credential services workflow.
🔎 Issue References
[CATS-138], [CATS-1571], [CATS-1629], [CATS-1631], [CATS-1632], [CATS-1633], [CATS-1638], [CATS-1639], [CATS-1669], [CATS-1718], [CATS-1719], [CATS-1722], [CATS-1723], [CATS-1744], [CATS-1777]
🌐 Impact Summary
New CRDs
•	instrumentations.opentelemetry.io/v1alpha1
•	opentelemetrycollectors.opentelemetry.io/v1alpha1
•	opentelemetrycollectors.opentelemetry.io/v1beta1
Namespaces Affected
•	argocd, credential-services, external-secrets, k8s-manager, kafka, kyverno, kube-system, kubecost, logging, self-hosted-runners
4.3.1 - Temporal, Prometheus Upgrade, Kyverno, Kubecost
Released March 10th ::: Github Release Notes
Temporal Server
•	Build & Deploy Temporal Workflows: Teams can now build and deploy their Temporal workflows on our platform. More information can be found in the CATS documentation.
•	New TemporalNamespace CustomResource: Implements dedicated namespaces for improved workflow isolation.
•	Complete Workflow Orchestration: Offers enhanced management and visibility across all workflows.
Prometheus Upgrade
•	Prometheus version has been upgraded to v2.55.1 for improved monitoring and performance.
Spot vs On-Demand Kyverno Mutation Policy
•	This mutation policy automatically handles Spot vs. OnDemand node requests, enhancing our resource allocation and cost management.
Kubecost Changes
•	We have officially discontinued the Kubecost Enterprise license and removed the data federation component as it is not supported in the free-tier plan.
NOTE
The Kubecost dashboard is no longer federating data across multiple clusters. Each cluster now has its own standalone Kubecost instance, so please be sure to monitor the instance specific to the cluster(s) that host your application.
4.2.2 - Devops, Argocd Improvements, and Kyverno
Released February 24th ::: Github Release Notes
Kyverno:
•	More Stable Generation of ArgoCD Applications:
o	We have improved the stability of ArgoCD applications by utilizing Kyverno resource generators instead of custom controllers. This change ensures a more reliable and consistent application deployment process.
•	Cluster Cleanup with Kyverno Policies:
o	We have deployed new Kyverno policies to clean up old pods and job pods. This automated cleanup process helps maintain a tidy and efficient cluster environment, reducing resource wastage and potential conflicts.
ArgoCD:
•	Exposing ArgoCD Scrape Metrics:
o	We have exposed ArgoCD scrape metrics to monitor application health. This allows for better visibility and monitoring of the health and performance of your applications.
•	ArgoCD Application AutoSync:
o	By default, ArgoCD application autosync is turned off to improve the speed of our ArgoCD server. This change helps in reducing the load and improving the overall performance of the server.
o	ACTION REQUIRED application teams will need to manage the sync settings on their own applications. Please see the cats documentation for configuration an admin argocd role to manage applications. https://cats.lilly.com/guide/Namespace
Grafana:
•	Grafana Plugins Persistence:
o	Grafana plugins will now be persisted on restart via in-cluster volumes. This enhancement ensures that all your custom plugins remain intact and functional even after a system restart, providing a seamless monitoring experience.
Security Enhancements:
•	Hardened System Service Image Security:
o	To enhance the security of our system services, we are now using JFrog Proxy for all images. This measure ensures that all images are scanned and verified, reducing the risk of vulnerabilities and ensuring a more secure platform.
4.2.1 - Kyverno Adoption and Hotfixes
Released February 10th ::: Github Release Notes
1.	Hotfix: Read Access for QA/PRD kubectl. Fixed read access issues for kubectl in QA and production clusters.
2.	Hotfix: AWS ALB Idle Timeout. Fixed a "504 Gateway Timeout" issue by adjusting the AWS ALB idle timeout to 10 minutes across all clusters (dev, qa, prod). The idle timeout has been restored to 10 minutes, preventing 504 errors.
3.	Enabled H100 for Cortex.
4.	Kyverno Adoption: ArgoCD CR Generation. Replaced the ArgoCD handler in the admission webhook controller with Kyverno for better policy management and stability. New Kyverno ClusterPolicy validates namespace annotations and generates ArgoCD CRs.
5.	Security Update: ELB Security Policy. Updated the ELB security policy to ELBSecurityPolicy-TLS13-1-2-Res-2021-06 to strengthen encryption and align with security requirements.
6.	MD3 Model Scale Out. Scaled out the MD3 model as part of ongoing performance improvements.
7.	Automatic Cleanup of Stale PRs. Automatic closure of pull requests that have been inactive for 30 days. The action will automatically close stale PRs and add appropriate labels. Runs every day at 5:00 PM EST.
8.	Grafana Plugin Persistence Issue. Resolved an issue where Grafana plugins were not persisting after a production restart.
9.	Prometheus Upgrade. Upgraded Prometheus to support new metrics features, enhancing monitoring capabilities. Improved ArgoCD metrics scraping.
10.	Admission Webhook Controller Replacement. Replaced the admission webhook controller for ArgoCD application generation with Kyverno. Kyverno policies now handle the generation of ArgoCD applications, deprecating the admission webhook controller.
11.	AWS Load Balancer Idle Timeout Fix. Restored the idle timeout to 10 minutes for all clusters, preventing 504 errors for long-running requests.
12.	Argocd CR Permissions for Kyverno Controller. Added the necessary permissions for the Kyverno service account to manipulate ArgoCD resources. Policies implemented by Kyverno service account.
4.1.2 - SLA Go-Live and General Enhancements
Released January 31st ::: Github Release Notes
1.	Service Level Agreements Go-Live The SLA section of the documentation site now features a dedicated page designed to provide clear and accurate information about SLA Exclusions, Review and Revisions, and Monitoring and Reporting. A new "SLA Reports" section has been added under the News category to enhance transparency and accessibility. These updates ensure that users have a comprehensive understanding of SLA processes and reporting, reinforcing the commitment to maintaining high service standards.
2.	Fix Grafana Alert Links with Port Issues
Grafana alert links and generated dashboard links were appending a port (e.g., <url>:3000), causing broken URLs. To resolve this, the grafana.ini root_url was updated to use absolute URLs corresponding to the environment ingress.
3.	EFS Throughput Mode Change in CATS Dev Cluster
The EFS throughput mode in the CATS dev cluster was updated from "Bursting" to "Enhanced" to improve performance for workloads in the livedesign namespace that were experiencing timeouts.
4.	Update RDS Instance Documentation
The RDS documentation was updated to recommend using PostgreSQL 15.0 as the preferred version, with a note explaining that PostgreSQL 16.0 is available but should be avoided when using PGadmin.
5.	Optimize ArgoCD Sync Parallelism
To address long ArgoCD sync times, configuration changes were made to increase sync parallelism, significantly reducing the time required for these operations.
6.	Reinstate Missing Grafana Data Sources
The Azure Monitor datasource in the Main Grafana organization was missing, affecting monitoring functionality. This was resolved by reinstating the datasource and exposing the decryption secret.
7.	Improve Concurrency for Release Mergebacks
GitHub Actions runners were being cancelled during mergebacks due to insufficiently unique concurrency pools. A unique string combining head_ref and base_ref was added to ensure pools are uniquely associated and prevent cancellations.
8.	Support Section on Docsite Reworked.
The Support section has been significantly improved to enhance usability and organization, including a complete rework of the "Standard Support Offering" page, a reorganized sidebar for better navigation, and the addition of a table of contents for streamlined access to key topics. The "Ticket Template" page was renamed "Submit a Ticket" and linked to the updated ServiceNow request form, with a new "Submit a Ticket" button added for quick access. Admin-related documentation has been moved to a new Admin section to improve content organization, and a new Feature Request page was introduced to guide users in submitting and tracking feature requests. Additional UI enhancements, such as the "Catsbot" button and a "Submit a Support Ticket" button at the top of the site, improve functionality, while the "GitHub" button was split into three separate buttons for each environment to clarify deployment differences. These updates align with the latest Docusaurus version for consistency, and shortcuts were added to the makefile to streamline formatting fixes with Prettier and simplify the validation process.
4.1.1 - Fargate Restructure / Observability Enhancement
Released January 19th ::: Github Release Notes
1.	Fargate Profile Restructuring and Workload Restarts: We have restructured the Fargate profiles in the cluster, which will cause some serverless (Fargate) workloads to restart.
o	Impact: Brief interruptions in applications may occur during the process.
o	Action Required: No action is needed.
2.	Grafana Upgrade & Configuration Changes (PLG): We are upgrading Grafana in production. Since Grafana currently lacks persistent storage, all configurations stored in memory will be cleared as we transition to a new persistent storage solution.
o	Action Required: Export and save any custom dashboards or settings in production BEFORE THE UPGRADE.
o	Action Required: Re-import your dashboards and settings into the newly persistent Grafana setup after the upgrade.
3.	Observability Tools: Jaeger & Loki
We are enhancing the observability stack to improve monitoring and debugging capabilities.
o	Jaeger (Distributed Tracing):
View and analyze distributed traces for your services at Jaeger UI.
	Understand service call patterns and pinpoint performance bottlenecks.
o	Loki (Logs):
Query structured Loki logs directly through Grafana.
	Use Grafana-Loki integration to search and filter logs centrally for streamlined troubleshooting.
4.	View System Service Infrastructure via ArgoCD
We've improved visibility into system service infrastructure resources via ArgoCD.
o	Capabilities:
	View infrastructure resources for system services.
	Identify the status and health of key platform services.
o	Benefits:
	Better understanding of service dependencies.
	Faster troubleshooting of platform-related issues.
5.	Introducing New Domain Patterns
We are rolling out new domain patterns for applications:
•	bu.lilly.com
•	cats.lilly.com
•	chat.lilly.com
•	cortex.lilly.com
•	dh.lilly.com
•	gs.lilly.com
•	is.lilly.com
•	lrl.lilly.com
•	mq.lilly.com
Recommended Ingress Host Patterns
•	<my-app>.dev.<domain> for development
•	<my-app>.qa.<domain> for QA
•	<my-app>.<domain> for production
The existing/legacy domains (apps.lrl.lilly.com, apps-internal.lrl.lilly.com, apps-api.lrl.lilly.com) will remain supported.



•	Jump Start
•	Prerequisites
Prerequisites
The following prerequisites will need to be configured to get started.


Repository Access
First of all, you will need write access to the repository you are working with, so you can add your app's Kubernetes config. You can request access in GitHub here.
Before you can have your application deployed, we will need to create a image repository for your GitHub repository. We have automated this process so all you need to do is add the team light_apps to your GitHub repository with admin privileges.
1.	Navigate to the Settings tab of your GitHub repository
2.	Click on the Collaborators and teams button under Access section
3.	Click on the Add teams button and search for "light_apps" and be sure to select Admin as the role.
4.	Click the button on the bottom of the pop-up "Add EliLillyCo/light_apps to this repository"
 
If all went well you should see your Manage Access settings option look similar to this
 
The next step is to wait for our credential service to run and create an ECR repository for your GitHub repository and send the login credentials to your GitHub repository's secrets.
Note: Our credential service runs every two hours, so you may not get your Light ECR credentials immediately.
Expedited Credentials Option
If you need immediate access to credentials, you can use our on-demand workflow to provision credentials for your repository right away:
1.	Navigate to Load Credentials into GitHub Repository Secrets
2.	Follow the instructions to trigger the on-demand credential generation process
3.	Wait approximately 1 minute for the process to complete
To check if you have received your ECR credentials, navigate to the Security section in the Settings tab of your GitHub repository and go to Actions under Secrets and variables. You should see 3 secrets created with the names LIGHT_DOCKER_REPOSITORY_URL, LIGHT_DOCKER_TOKEN, and LIGHT_DOCKER_USER.
 
Once you see those three secrets you are all set to start publishing your docker images to that ECR repository.


Automated Security Scanning
Not only does the credential service send out Tokens for you to access your new ECR repository which is setup with image scanning, but it also turns on GitHub's vulnerability scanning and alerting for your repository automatically.
 
You can see that your repository will have these settings automatically turned on so that you can be alerted for any vulnerabilities in your codebase that GitHub might find. For more information please visit GitHub Security to learn more.
Note: GitHub repository owners will receive email notifications when GitHub has detected a vulnerability in your repository. Typically they will also create a pull request for you automatically to update your dependencies to the latest version where the bug has been fixed.
V



•	Jump Start
•	Deployment Overview
Deployment Overview
NOTE: If you are trying to deploy and have not completed the necessary prerequisites please do so before proceeding!
This comprehensive guide is structured to equip you with the essential knowledge and steps required to deploy your solutions using CATS (Cloud Applications and Technology as a Service). The deployment process is streamlined through the integration of three core technologies: Containerization, Github Actions and Kubernetes. These technologies form the backbone of our platform, facilitating the automation of the deployment processes.
The simple steps required to deploy a solution are the following:
1.	Build your Solution
2.	Containerize the Application via Dockerfile
3.	Configure Git Actions workflow to build image and push to ECR
4.	Write Kubernetes Deployment files for all needed resources
5.	Solution is LIVE
Have a question? Ask Cats Agent or CatsBot!
Often application teams prefer consuming content in video format so we have a application deployment demo available for you to watch: Link to Recording
Now let's ensure you're equipped with the basics:
Build Your Solution
You as the application development team can decide when you are ready to deploy your solution. You do not need to be in a production ready state to deploy as CATS can allow for continuous automated deployments as you iterate through your solution! so feel free to start your deployment early in your development lifecycle.
Containerization
Containerization is a lightweight, efficient form of virtualization. It allows you to package your application and its dependencies into a 'container' that can run consistently across any environment. This process eliminates the "it works on my machine" problem by providing a clear separation between your application and the underlying system. Containers are portable, easy to deploy, and less resource-intensive compared to traditional virtual machines.
For example, to containerize a simple web application using Docker, you would create a Dockerfile:
# Use an official Python runtime as a parent image
FROM python:3.8

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]

With the Dockerfile created, you build the container image and run it:
docker build -t my-python-app .
docker run -p 4000:80 my-python-app

This Dockerfile defines an environment based on a Python 3.8 image, installs dependencies, and specifies how to run your app. The docker run command then runs the app in a new container, mapping port 4000 on your host to port 80 in the container.
GitHub Actions
Load Credentials into GITHUB repository secrets
The load_credentials GitHub Actions workflow template is designed to load ECR credentials into repository secrets. This documentation provides a detailed explanation of the workflow's structure and guides you through each section to ensure a clear understanding of how the load_credentials action file operates.
Template to Load Credentials
name: Load Credentials through GitHub Actions

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Select the environment to load credentials for'
        required: true
        default: 'prd'

  pull_request:
    branches:
      - main
  push:
    branches:
      - main
    tags:
      - v*

jobs:
  Load-Credentials:
    uses: EliLillyCo/hangar/.github/workflows/load-credentials.yaml@main
    with:
      environment: ${{ github.event.inputs.environment || 'prd'}}

Workflow Overview
This GitHub Actions workflow is designed to load credentials into a repository's secrets for a specified environment. It provides a streamlined way to manage credentials securely and automate their usage in deployment pipelines.
Workflow Triggers
The workflow is triggered by the following events:
1.	Manual Dispatch (workflow_dispatch):
o	Allows users to manually trigger the workflow via the GitHub Actions UI.
o	Accepts an input parameter environment to specify the target environment (default: prd).
2.	Pull Request (pull_request):
o	Automatically triggers the workflow when a pull request is made to the main branch.
3.	Push to main Branch (push):
o	Automatically triggers the workflow when changes are pushed to the main branch.
4.	Tag Creation (push with tags):
o	Triggers the workflow when a tag matching the pattern v* (e.g., v1.0.0) is pushed.
Job: Load-Credentials
This workflow uses a reusable workflow from the EliLillyCo/actions repository to load credentials. The job is defined as follows:
Job Configuration
•	uses: References the reusable workflow located at .github/workflows/load-credentials.yml in the actions.
•	with: Passes the environment input to the reusable workflow. The value is dynamically set based on the workflow_dispatch input or defaults to prd.
Build and Push Docker Image
The build_push_image GitHub Actions workflow template provided is designed to automate the building and pushing of a Docker image based on events such as pull requests, pushes to the main branch, or the creation of tags. This documentation will guide you through the structure of the workflow and explain each section, ensuring a clear understanding of how the build push action file works.
Template using build-push-action@v4
name: Build and Push Docker Image

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
    tags:
      - v*

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    env:
      ENVIRONMENT: ""
      LOWERCASE_REPO: ""
    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0
    - name: Get name for ECR repo #(used in image name)
      run: echo "LOWERCASE_REPO=$(echo ${{ github.event.repository.name }} | tr [A-Z] [a-z])" >> $GITHUB_ENV

    - name: if DEV, set dev variables
      id: set-dev-variables  
      shell: bash
      if: github.event_name == 'pull_request'
      run: |
        echo "ENVIRONMENT=dev" >> $GITHUB_ENV;
    
    - name: if QA, set qa variables
      id: set-qa-variables
      shell: bash
      if: github.event_name == 'push' && github.ref_type != 'tag'
      run: |
        echo "ENVIRONMENT=qa" >> $GITHUB_ENV; 
    
    - name: if PROD, set prod variables
      id: set-prod-variables
      shell: bash
      if: github.ref_type == 'tag'
      run: |
        echo "ENVIRONMENT=prod" >> $GITHUB_ENV; 

    - name: Generate Docker Metadata
      id: meta
      uses: docker/metadata-action@v5
      env:
        DOCKER_METADATA_PR_HEAD_SHA: true
      with:
        # list of Docker images to use as base name for tags
        images: |
          ${{ secrets.LIGHT_DOCKER_REPOSITORY_URL }}/${{ env.LOWERCASE_REPO }}    
        # generate Docker tags based on the following events/attributes
        tags: |
          type=sha,prefix=sha-
          type=sha,prefix=sha-,format=short
          type=sha,prefix=${{ env.ENVIRONMENT }}-sha-,format=short
          type=ref,event=pr
          type=ref,event=branch
          type=ref,event=tag
            
    - name: Login to LIGHT AWS ECR
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.LIGHT_DOCKER_USER }}
        password: ${{ secrets.LIGHT_DOCKER_TOKEN }}
        registry: ${{ secrets.LIGHT_DOCKER_REPOSITORY_URL }}
        ecr: false # TODO: fix as this is misleading, set to false to enable use of LIGHT_DOCKER_TOKEN to auth with registry

    - name: Build and push docker images
      uses: docker/build-push-action@v4
      with:
        tags: ${{ steps.meta.outputs.tags }}
        push: true
        provenance: false

Workflow Overview
This GitHub Actions workflow is designed to automate the process of building Docker images from your repository and pushing them to a Docker registry. It is triggered on pull requests and pushes to the main branch, as well as on version tags (v*).
The workflow consists of several jobs and steps, each fulfilling a specific role—from setting environmental variables based on the type of trigger (development, QA, production) to building and pushing the Docker image.
Workflow Triggers
This workflow is triggered by two GitHub events:
•	Pull Request: Triggered when a pull request is opened or updated on the main branch.
•	Push: Triggered when changes are pushed to the main branch or when a tag starting with "v" is created.
Additional Trigger Options:
•	Schedule: Allows users to schedule workflows at specified intervals. This is beneficial for periodic tasks such as nightly builds or other scheduled processes.
•	Repository Dispatch: Enables external events to trigger workflows using the GitHub API. This is useful for integrating with external systems or triggering workflows from external events.
•	Workflow Dispatch: Allows manual triggering of workflows through the GitHub UI or API. This is helpful when users want to initiate workflows on-demand.
•	Webhooks: GitHub Actions can be triggered by custom webhooks, providing flexibility for integration with various external systems and services.
•	Push to Branch: Users can customize the push trigger to target specific branches other than just main. This is useful for scenarios where separate branches need individualized build and push actions.
•	Tag Creation: Apart from the specific "v*" tag condition, users can customize tag triggers based on specific patterns or conditions.
These trigger options provide flexibility and customization for different use cases. Users can choose the most appropriate trigger combination based on their workflow requirements.
Job Structure
The job named build constitutes the core of this workflow, specifying the runtime environment, timeout settings, and a set of environment variables essential for its execution. These variables include ENVIRONMENT, LOWERCASE_REPO, among others, ensuring that each job run is contextualized and correctly configured.
Job Environment Variables
Several environment variables are defined to capture information about the repository, the current branch or tag, and the Docker image version. These variables include:
•	ENVIRONMENT: The environment for which the Docker image is being built (dev, qa, or prod). This variable is dynamically set based on the type of GitHub event that triggers the workflow. For instance, it is set to "dev" for pull requests, "qa" for pushes to the main branch (excluding tags), and "prod" for tagged pushes, indicating the build target environment.
•	LOWERCASE_REPO: The lowercase name of the GitHub repository. This variable is crucial for naming conventions in Docker images and repositories, which often require lowercase. It is generated by converting the repository name from the GitHub context to lowercase, ensuring compatibility with Docker and other systems that might be case-sensitive.
•	GITHUB_ENV: A special GitHub Actions environment file that allows you to set environment variables for use in subsequent steps of the same job. When you write to this file (using the echo command with redirection, for example), the environment variable is available to every subsequent step in the job. This is used to dynamically set and pass variables like ENVIRONMENT and LOWERCASE_REPO across different steps within the job, ensuring that actions such as building and pushing Docker images can use the most current and relevant environment settings.
Workflow Steps
1.	Get name for ECR repo:
o	Action: echo "LOWERCASE_REPO=$(echo ${{ github.event.repository.name }} | tr [A-Z] [a-z])" >> $GITHUB_ENV
o	Purpose: This step dynamically generates the lowercase name of the GitHub repository and assigns it to the LOWERCASE_REPO environment variable. It is used to ensure the Docker image name conforms to naming conventions that may require lowercase.
2.	if DEV, set dev variables:
o	Action: echo "ENVIRONMENT=dev" >> $GITHUB_ENV;
o	Purpose: Sets the ENVIRONMENT variable to dev for Docker image builds triggered by pull requests. This indicates that the build is intended for the development environment.
3.	if QA, set qa variables:
o	Action: echo "ENVIRONMENT=qa" >> $GITHUB_ENV;
o	Purpose: Configures the ENVIRONMENT variable to qa for Docker image builds triggered by pushes to the main branch (excluding tags). This denotes that the build targets the QA (Quality Assurance) environment.
4.	if PRD, set PRD variables:
o	Action: echo "ENVIRONMENT=prod" >> $GITHUB_ENV;
o	Purpose: Adjusts the ENVIRONMENT variable to prod for Docker image builds triggered by tag pushes. This specifies that the build is meant for the production environment. Note: In your template, it says "if PROD," but in your request, you wrote "if PRD." For consistency with your template, I used "PROD."
5.	Generate Docker Metadata:
o	Action: docker/metadata-action@v5
o	Purpose: Utilizes the docker/metadata-action@v5 to generate metadata for the Docker image, including tags derived from the SHA, PR, branch, or tag events. This metadata is crucial for versioning and tracking the Docker image across different environments.
6.	Login to LIGHT AWS ECR:
o	Action: docker/login-action@v3
o	Purpose: Authenticates with LIGHT AWS ECR using the provided username and token. This step is essential for pushing the Docker image to the repository securely.
o	To login you will need to complete the Prerequisites. Please do so before proceeding!
7.	Build and Push Docker Images:
o	Action: docker/build-push-action@v4
o	Purpose: Builds the Docker image based on the generated metadata tags and pushes the image to the configured Docker registry. This automates the deployment of new or updated Docker images to the appropriate environments.
note: provenance: false This option controls whether or not to include provenance information when building and pushing Docker images. Provenance information in the context of Docker images refers to metadata that describes the origin and history of an image, including details about how it was built, its layers, and any dependencies. It can be useful for tracking the authenticity and security of an image, especially in situations where you need to ensure the image's trustworthiness. In our cluster if you do not include this line the automation may create 'image index' artifacts in our ECR that will cause errors so please ensure you include the line provenance: false.
When you set provenance to false, as seen in your code, you are instructing the docker/build-push-action to exclude this provenance information from the Docker image.
Sha Tag Overview
The Generate Docker Metadata step in our GitHub Actions workflow template uses the docker/metadata-action@v5 to create Docker tags based on certain events and attributes. The configuration provided in your workflow will result in the generation of the following types of Docker tags:
SHA Tags:
•	Tags prefixed with sha-, including the full SHA of the commit. This provides a unique identifier for every commit.
•	Short SHA tags prefixed with sha-, which are shorter versions of the full SHA tags for convenience and readability.
Environment-SHA Tags:
•	These tags include the environment name (dev, qa, prod) followed by -sha- and the short SHA of the commit. For example, a tag for a development environment might look like dev-sha-abc123.
Pull Request (PR) Tags:
•	Tags generated for pull requests. These are useful for identifying images built from PRs.
Branch Tags:
•	Tags that correspond to the name of the branch for non-tag pushes. This allows for easy identification of images built from specific branches.
Sha Tag Pattern Breakdown:
•	For pushes that include tags, the tag itself will be used as the Docker tag. This is particularly useful for production releases and versioning.
Here’s a breakdown of the tag types and their formats as specified in your workflow:
•	type=sha,prefix=sha-: Full SHA of the commit prefixed with sha-.
•	type=sha,prefix=sha-,format=short: Shortened SHA of the commit, also prefixed with sha-.
•	type=sha,prefix=${{ env.ENVIRONMENT }}-sha-,format=short: The environment name followed by -sha- and the short SHA. The environment is dynamically set based on the event that triggered the workflow.
•	type=ref,event=pr: Tags for pull requests.
•	type=ref,event=branch: Tags that reflect the branch name for branch pushes.
•	type=ref,event=tag: Tags that directly use the git tag for tag pushes.
This configuration ensures that the Docker images built and pushed by this GitHub Actions workflow can be accurately identified and tracked across different environments and development stages, based on the nature of the git action that triggered the build.
Note: The sha pattern output by your GitHub actions file MUST match the pattern you declare in your Kubernetes deployment file that you are about to write in order for our automation to properly detect changes in your build and automatically deploy them for you.
References
See the official documentation around GitHub Actions here
See official docker build-push-action documentation here
Kubernetes
Kubernetes, often abbreviated as K8s, is an open-source platform designed to automate deploying, scaling, and operating application containers. It groups containers that make up an application into logical units for easy management and discovery. Kubernetes scales with your application's needs, manages resources efficiently, and integrates with the CI/CD pipeline.
See the official Kubernetes Documentation here: Kubernetes Documentation
Creating your Kubernetes namespace file
The next step towards getting your solution deployed is creating your namespace.yaml file. This file is where you define your namespace and give it a unique name. Create the namespace file in the <project-name>-dev folder you just created.
namespace.yaml Template:
# Define Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: <namespace-name>
  labels:
    cost-center: <costcenterID>
  annotations:
    app.lrl.lilly.com/compute: <serverless> or <hybrid> 
    app.lilly.com/cloud-browser-auth: <authconfigs> #optional
    app.lilly.com/sg-rule: <interface> #optional
    app.lilly.com/argo.automated: "true"
    app.lilly.com/argo.config: |-
            {
                "roles": {
                    "readADGroups": [ "<dev-group>" ],
                    "adminADGroups": [ "<admin-group>" ]
                }
            }


You need to replace the placeholder values with your desired configurations. Here's an explanation of the placeholders:
Placeholder	Description
<namespace-name>	The name of your namespace.
<costcenterID>	The ID of the cost center associated with the namespace.
<serverless>	The default solution.
<hybrid>	The application config will be using Fargate and EC2.
<authconfigs>	This line relates to the cloud browser solution. Remove line if you are not using this feature.
<interface>	The annotation will contain the interface used to define your ingress and egress rules for all resources in your namespace.
<dev-group>	String that represents the AD group you would like to have read only access to your namespaces resources in the Argo Dashboard
<admin-group>	String that represents the AD group you would like to have Admin access to your namespaces resources in the Argo Dashboard
Note: Remember to remove the angle brackets (<>) when replacing the placeholder values. Additionally, this template assumes you are using the apps/v1 API version for the Deployment resource.


1. labels: explained
cost-center: - This label maps your namespace to your area's cost center. This is used by our kubecost solution to congregate namespaces into large groups to better understand how many resources each group is using.


2. annotations: explained
app.lilly.com/compute:
There are two types of compute supported. The primary type is Fargate. The second type is AWS EC2 instances. To configure your namespace to use Fargate / EC2 instances, you must place the annotation: app.lrl.lilly.com/compute with a value of either 'serverless' to allow using only Fargate OR 'hybrid' to allow using both EC2 or Fargate.
NOTE: If you chose hybrid you must label your containers to allow them to run on Fargate, while if you chose serverless all your containers will run on Fargate without special config.
A more detailed explanation can be found here.


app.lilly.com/cloud-browser-auth:
This allows setting s3 auth roles for s3 resources associated with the associated namespace.
The value for this annotation is a JSON object in string format. The simplest config allows setting a list of users providing read only access to the default S3 path for this namespace. This default bucket / S3 prefix path will be 's3://lly-light-prod/namespace-name/'
annotations:
  app.lrl.lilly.com/cloud-browser-auth: '{"authConfigs": [{ "users": ["A123456", "B7891011"]}]}'

A more detailed explanation can be found here.


app.lilly.com/sg-rule:
This is an optional annotation that outlines the interface you will populate in order to apply specific ingress and egress rules to your namespace. These rules will then apply to all resources within your namespace.
ingress rules interface:
app.lilly.com/sg-rule: |-
{
  "ingress_rules": [
    {
      "namespace_allow_from": "<other-namespace>",
      "port": <your-ingress-port>
    }
  ],
  "egress_rules": [
    {
      "prefix_list": "<your-prefix-list>",
      "port": <your-egress-port>
    },
    {
      "sg_id": "<security-group-ID>",
      "sg_account": "<security-group-account>",
      "port": <your-egress-port>
    }
  ]
}

Note: You do not need to use this annotation. There is a default security group policy that is applied automatically to a namespace upon creation, called sg-main. This default policy allows the following activities:
•	Restrict namespace to not allow outbound traffic
•	Allow self referencing. Allows communication between pods within your own namespace
•	Allow udp and tcp lookup on cluster DNS service
•	Allow namespace to connect to RDS
•	Allow namespace to connect to EFS
•	Allow communication to control plane
•	Allow all traffic from core cluster services. cluster can communicate over all TCP ports.
•	Allow all Lilly specific egress are except on prem
•	Allow all AWS APIs
•	Allow all AWS DB RDS
•	Allow all AWS DB redshift
•	Allow access to AWS managed Kafka
•	Allow access to Schrodinger License
•	Allow access to MOE license
•	Allow access to all Lilly http based URLs
•	Allow access to Microsoft private link
For more detailed information on the security group rule annotation, see our extensive documentation here. For a detailed Architecture diagram of how the security groups are handled in CATS, see our diagram here.


app.lilly.com/argo.config:
This is a required annotation that ensures configuration of permissions for the Argo CD dashboard based off of the AD groups you assign to both the Read-Only section and the Admin section. Configure this by customizing and managing your own AD groups that contain your project's developers or users.
Whenever you make an initial deployment, that task is handled by Argo CD. Later on you will configure annotations related to Flux. Flux handles the continuous deployment of resources via sha diffs in the AWS ECR. This ensures updates to your container's image are automatically identified and rolled out quickly.
Use this interface to set your AD Groups by replacing <dev-group> and <admin-group> with strings that are names of the AD groups you have configured:
{
    "roles": {
        "readADGroups": [ "<dev-group>" ],
        "adminADGroups": [ "<admin-group>" ]
    }
}

You can easily use existing AD Groups for the roles interface or create new existing groups by navigating to the Lilly idmportal and select "Create a new Group".
For information on permissions provided by readADGroups and adminADGroups roles, navigate HERE
For details on the Argo Dashboard please navigate HERE

________________________________________
Creating your Kubernetes deployment file
Final step, and this one is the most challenging step, you will need to create a deploy.yaml file which describes the application that you want to deploy in Kubernetes. This yaml configuration file is what is used for the instructions on how to deploy your application, what resources it needs, and where to get your Docker image from.
For most solutions, this deploy.yaml file, along with your namespace.yaml file, will be the only two resources needed by the CATS app repository under projects/dev/<project-name>-dev/ to get your web application fully deployed and functional on CATS.
Luckily we have plenty of examples for you to look through to help with creating your deployment configuration. E.g. nextjs.
Template for a Kubernetes deployment file in YAML
# Define Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <deployment-name>
  namespace: <namespace-name>
  labels:
    app: <app-label>
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.<policy-name>: "<aws-account-number>;<your-repo-name-in-ecr>;glob:<tag-pattern>"
    # Example: app.lilly.com/flux.simple.docs-policy: "283234040926;lrl_light_k8s_infra_apps_catsdocs;glob:sha-.*"
    wave.pusher.com/update-on-config-change: "true"
spec:
  replicas: <replica-count>
  selector:
    matchLabels:
      app: <app-label>
  template:
    metadata:
      labels:
        app: <app-label>
    spec:
      containers:
        - name: <container-name>
          image: <container-image> # {"$imagepolicy": "<namespace-name>:<policy-name>"}
          ports:
            - containerPort: <container-port>
          <additional-container-configuration>
      <additional-pod-configuration>

---
# Define a Service
apiVersion: v1
kind: Service
metadata:
  name: <service-name>
  namespace: <namespace-name>
spec:
  selector:
    app: <app-label>
  ports:
    - protocol: TCP
      port: <service-port>
      targetPort: <container-port>

---
# Define an Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: <ingress-name>
  namespace: <namespace-name>
spec:
  rules:
    - host: <ingress-host>
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: <service-name>
                port:
                  number: <service-port>


You need to replace the placeholder values with your desired configurations. Here's an explanation of the placeholders:
Placeholder	Description
<namespace-name>	The name of your namespace.
<deployment-name>	The name of your deployment.
<app-label>	A label to identify your application.
<aws-account-number>	Default to "283234040926" for AWS Prod Cluster.
<your-repo-name-in-ecr>	The name of your repository in AWS ECR
<policy-name>	A unique policy name within your namespace. Chosen by you. It is arbitrary. Avoid special characters.
<tag-pattern	This is where you declare the sha tagging pattern you are using in your git workflow file. Example: "sha-.*"
<replica-count>	The number of replicas you want to run.
<container-name>	The name of your container within the pod.
<container-image>	The image for your container (e.g., your-registry/your-image:tag).
<container-port>	The port on which your container listens.
<additional-container-configuration>	You can add any additional container configuration (e.g., environment variables, volumes, etc.).
<additional-pod-configuration>	You can add any additional pod-level configuration (e.g., volumes, secrets, etc.).
<service-name>	The name of your service.
<service-port>	The port on which your service listens.
<ingress-name>	The name of your ingress resource.
<ingress-host>	The host/domain associated with your ingress. See Ingress Route Information below for more details.
Note: Remember to remove the angle brackets (<>) when replacing the placeholder values. Additionally, this template assumes you are using the apps/v1 API version for the Deployment resource.


Container Image Explanation:
You can find the name of your image by following these steps.
1.	Navigating to your repository and go to the Actions Tab
2.	Select the workflow the is building your desired image and open it.
3.	Click on the button that has a green checkmark and is labeled build
4.	Expand the section labeled build and push docker image
5.	Scroll through the logs and look for a line that says something like this: writing image sha256:a1fa199272cae6ec8747f905aa5624666be61e38db0aff5b9e2763f07df072d8 done this is the default name of your image. This is not what you want to use. You want to use the Image name that matches the tag that you define in your workflow file. so something like sha-e10271b or qa-sha-e10271b. This is your <image sha tag> Here is an example of an actual image that is being deployed: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_light_k8s_infra_apps_docs:dev-sha-e10271b
For docker images built with the above automation, check the github actions build to see the docker image URL. The image URL will always start with 283234040926.dkr.ecr.us-east-2.amazonaws.com/<your-lower-case-repo-name>:<your-image-tag>. See example here.
If using generic images (e.g. pgadmin) use Artifactory to avoid DockerHub rate limiting. E.g. pgadmin:4 becomes elilillyco-lilly-docker.jfrog.io/pgadmin:4. You also need to make sure that an entry for the image is present in allowed images.
note on glob:<pattern>
Please note that for Flux V1 glob patterns were supported. However now in Flux V2, the pattern expected in the flux.simple annotation is a regex pattern. This is a known change in Flux V2. We encourage all app teams to use the -.*. We may change the nomenclature to clarify confusion in a future release.
Historically users deployed images with the sha pattern declared in their workflow file example: dev-sha-.*. Now that we have moved to Flux V2 this pattern needs to be updated in the annotation to dev-sha-.*
Annotations Explanation:
The following lines enable flux to automatically find your latest image in the ECR and deploy it to a new pod. If the deployment is successful the old pod will be deleted and a seamless transition between the two images will happen. If you did not make any changes when implementing the git actions automation code above, then the pattern sha-.* should work out of the box:
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.<policy-name>: "<aws-account-number>;<your-repo-name-in-ecr>;glob:<tag-pattern>"
    # Example: app.lilly.com/flux.simple.docs-policy: "283234040926;lrl_light_k8s_infra_apps_catsdocs;glob:sha-.*"
    wave.pusher.com/update-on-config-change: "true"

<aws-account-number> - Default to "283234040926" for AWS Prod Cluster. You may use a different account number if you are pulling from a non CATS AWS Account's ECR. It is possible to pull your solutions image from any ECR... BUT if you do that the CATS Support team is severely limited in our ability to troubleshoot issues that may arise. We HIGHLY suggest pushing your image to the CATS PRD Account 283234040926.


<your-repo-name-in-ecr> - This is the name of your repository in AWS ECR. In the example you can see we are using the catsdocs repo name.
Your projects ECR repo name will usually be the github repository name in lowercase. Sometimes special characters such as spaces can be changed to underscores.
To find your specific name if you are not sure, you can navigate to your github actions tab and go to the "Build and Push Image" step.
To be 100 percent certain what your name is you can log into the AWS console, navigate to ECR, and look up your repo there. This method requires a CA account.


<policy-name> - A unique policy name within your namespace. Chosen by you. It is arbitrary. Avoid special characters.


<tag-pattern - This is where you declare the sha tagging pattern you are using in your git workflow file. Example: "sha-.*"
This pattern must match the pattern you are using in your workflow file or the automation will not work.
The pattern expected in the flux.simple annotation is a regex pattern. This is a known change in Flux V2. We encourage all app teams to use the -.* pattern until we have a better solution in place.
Historically users deployed images with the sha pattern declared in their workflow file example: dev-sha-.*. Now that we have moved to Flux V2 this pattern needs to be updated in the annotation to dev-sha-.*


<$imagepolicy> - Update the comment with your namespace name and image policy you define in the flux annotation to properly allow automated deployments. This comment is used by the Light Account butler. He needs the info for commit messages to work correctly.
Template:
  image: <container-image> # {"$imagepolicy": "<namespace-name>:<policy-name>"}

Example:
  image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_falcon_bartender:qa-sha-06c5953 # {"$imagepolicy": "falcon-qa:my-policy-bartender"}



Ingress Route Information
There are three types of ingress routes available on the CATS Platform
1.	*.apps.lrl.lilly.com - This is a browser based route that allows a user to be on or off the lilly network and requires the user to authenticate upon accessing.
2.	*.apps-internal.lrl.lilly.com - This is a browser based route that requires a user to be on the lilly network but does not force the user to authenticate.
3.	*.apps-api.lrl.lilly.com - This is a programmatic / script based route. If you are accessing an endpoint in CATS via a script, you will need to target this route. This route is not set up for browser based access. If you access an endpoint on this route via your browser, you will get an "invalid token" response.
Customize the host based off of deployment environment with help from the table below:
top domain	Route	DEV Cluster	QA Cluster	PROD Cluster
lrl.lilly.com	Authenticated	*.apps-d.lrl.lilly.com	*.apps-q.lrl.lilly.com	*.apps.lrl.lilly.com
lrl.lilly.com	Un-Authenticated	*.apps-internal-d.lrl.lilly.com	*.apps-internal-q.lrl.lilly.com	*.apps-internal.lrl.lilly.com
lrl.lilly.com	API Route	*.apps-api-d.lrl.lilly.com	*.apps-api-q.lrl.lilly.com	*.apps-api.lrl.lilly.com
For full information on how to configure your ingress based off of route type and cluster you are deploying in see our docs here.
Resource Name Configuration:
Resource names should not contain environment suffixes (dev, qa, prd), unless there is a really good reason for those. These are implicitly contained in namespace names. Convention for namespaces is enforced by validation.
The above templates are the very minimum required for a deployment. Depending on your solution you may need to include additional fields or make customized changes. Please see the Deployment Configuration Section on our DocSite for more extensive details around configuring deployment resources.
Dashboards
Now that you have finished staging your deployment the automation is working in the background to bring your solution online. Head on over to our Dashboards Section to find a variaty of dashboards available for troublshooting issues and monitoring logs, cost, and resource health.
Continuous Deployment
Now that you have added in your Kubernetes config file it should be deployed immediately via Argo CD, give or take a few minutes for the resources to start up on Fargate.
Once that happens the magic of automation kicks in! Now anytime that you push an updated docker image tag with a new version to the ECR, Flux will automatically identify the new image and deploy that image for you! Flux's automation will even update your Kubernetes yaml config showing you which specific image tag is currently deployed.
The only thing you need to worry about now is defining your own release cycle management for your application. One recommendation is to follow the GitHub Flow pattern.
CODEOWNERS
You can use our CODEOWNERS file to define individuals or teams that are responsible for code in a repository.
Code owners are automatically requested for review when someone opens a pull request that modifies code that they own. Code owners are not automatically requested to review draft pull requests.
See our Docs on setting up CODEOWNERS in CATS!
Developing more complex Kubernetes Infrastructure
Our main cluster infra_apps, has many restrictions as it must fulfil production requirements to allow use of real data & has more guarantees of stability. If you are developing complex Kubernetes infrastructure, this slows development significantly. To solve this, we have another cluster deployed into a DEV AWS account. This cluster has no stability guarantees (may be wiped at any time), but gives full flexibility to developers & full admin access to the cluster. The Dev cluster is the location that the Platform team does development work in. This can cause issues for application teams who are trying to deploy new solutions while the Platform team is working on new features for users!
When possible please do you development in the production cluster, infra_apps
To access the cluster via terminal, you must have a -CA account & be a member of the aws_light_devs group (request in myaccess).
Follow this guide to setup Lilly AWS Auth on your local machine (this allows local machine AWS account login): https://github.com/EliLillyCo/lrl-cloud-patterns/wiki/Lilly-AWS-Accounts#aws-cli-httpsgithubcomelilillycolilly_aws_auth
Follow this guide to access the cluster: https://github.com/EliLillyCo/lrl-cloud-patterns/wiki/Lilly-AWS-Accounts#accessing-the-light-account-for-infra-development
Once you have done this, you will have full kubectl access to each cluster with the role designated in the matrix below:
Cluster	Role
Production Cluster
Read-Only
QA Cluster
Read-Only
Development Cluster
Read-Only



•	Jump Start
•	Working With the Repo
Working with the Deployment Repositories
Here are some of the basic guidelines for how application teams should work with the Apps Deployment Repos to get their solutions deployed. This section includes details around where you should put your files and who will need to approve those files.
Remember there are three different Apps Deployment Repositories that correspond with three different Kubernetes Clusters and AWS Accounts!
Different Cluster Details:
Cluster	App Deployment Repo	AWS Account Name	AWS Account ID	VPCE Access
Production Cluster	infra_apps
prod-igw-dx-researchit-light	283234040926	vpce-03bee17f69c9802b9
QA Cluster	infra_apps_qa
qa-igw-dx-researchit-light	474366589702	vpce-058757a9c034d181c
Development Cluster	infra_apps_test
dev-igw-dx-researchit-light	408787358807	vpce-069388414a9f87f40
Sandbox Cluster	infra_apps_sbx
dev-igw-dx-lrl-researchit-light-sbx	891377229906	vpce-069388414a9f87f40
Set Up Project Workspace
Regardless of which environment you are working in you should see a /projects folder. Within this folder you will see a breakdown of /dev, /qa, and /prd. These folders handle applications that are segregated by their namespaces.
To set up a dev workspace in the Production Cluster's app deployment repo navigate to /projects/dev and create a new folder.
Name the new folder <project-name>-dev. This is the location where you will do all of your development work.
When you are ready to move on to QA you will create a new folder in the /projects/qa folder named <project-name>-qa.
When you are ready to move to production you will create a new folder in the /projects/prd folder named <project-name>-prd
Note: The name that you give your folder MUST match the name that you use as your namespace within the folder.


Merging to Main
The changes on your branch will not go live in the cluster until you have merged them to the main branch. In order to merge you changes into this branch you will need to raise a Pull Request. Pull Requests are required as we have validation that will run on your changes and protect you from merging in code that will result in a failed build. If your build fails you should go into the GitHub actions file and see what went wrong. There will be a message that will point you in the right direction and provide some details on how to fix your error.
If you are creating a new namespace or making changes to an existing namespace the lrl_light_infra_approvers group will need to approve your pull request. This group is made up of individuals on the CATS Platform team. Approvals from the group are not needed for any other files other than on namespace.yaml files. Pull request reviews are handled asynchronously and are monitored throughout the week. Please do not contact developers directly unless you have a validated Pull Request that has not been reviewed for 1 business day. The CATS team is transitioning this review process to our operations and support teams and this process is subject to change.
We highly suggest you update the CODEOWNERS file so that you can control the groups that are automatically selected and required for approvals on your namespace's files. Further details on the CODEOWNERS file can be found here.
Note: there are many people working in this repository on a daily basis so you need to update your base branch in order to get your changes to merge in. Watch your PR until it merges!
Using Codespaces
CATS makes it simple to use codespaces with the same docker images you use in CATS.
You will see three new environment variables in codespaces created from github repos onboarded to CATS as described in the readme:
•	LIGHT_DOCKER_REPOSITORY_URL
•	LIGHT_DOCKER_TOKEN
•	LIGHT_DOCKER_USER
You can use these to login to docker with:
echo $LIGHT_DOCKER_TOKEN | docker login -u $LIGHT_DOCKER_USER $LIGHT_DOCKER_REPOSITORY_URL --password-stdin

Once logged in, you will have read only (pull) permissions on any CATS docker images.
If you want to auto login, you can add the following file to your github repo .devcontainer/devcontainer.json:
{
    "postCreateCommand": "echo $LIGHT_DOCKER_TOKEN | docker login -u $LIGHT_DOCKER_USER $LIGHT_DOCKER_REPOSITORY_URL --password-stdin",
}



Merge Queue Process
This repository uses GitHub's merge queues to manage pull request merges, which ensures:
1.	Changes are integrated in a fair, sequential manner
2.	Automated validation runs on each change before merging
3.	Conflicts are reduced by handling one merge at a time
Protected Branch Naming Convention
We maintain protected branches with the naming convention:
automation/<namespace-name>

These branches have special automation that handles auto-committed image updates from the Flux controllers. These updates manage image tag changes and are added to the merge queue to maintain fairness in processing.
Best Practices for Pull Requests
1.	Create a new branch for your changes
2.	Make your changes and submit a pull request
3.	Once approved, your PR will be added to the merge queue
4.	Wait for the automated processes to complete before your changes are merged
5.	For image updates, use the appropriate automation branch
Edit this page




•	Jump Start
•	Containerization and Dockerfiles
Containerization and Dockerfiles
Containerization is a lightweight, efficient form of virtualization. It allows you to package your application and its dependencies into a 'container' that can run consistently across any environment. This process eliminates the "it works on my machine" problem by providing a clear separation between your application and the underlying system. Containers are portable, easy to deploy, and less resource-intensive compared to traditional virtual machines.
For example, to containerize a simple web application using Docker, you would create a Dockerfile:
# Use an official Python runtime as a parent image
FROM python:3.8

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]

With the Dockerfile created, you build the container image and run it:
docker build -t my-python-app .
docker run -p 4000:80 my-python-app

This Dockerfile defines an environment based on a Python 3.8 image, installs dependencies, and specifies how to run your app. The docker run command then runs the app in a new container, mapping port 4000 on your host to port 80 in the container.
Building From Artifactory
Some teams may want to connect to artifactory in order to build their container based off of packages hosted there. The following code helps you get connected in order to utilize those packages or images.
Ensure you have completed the prerequisite section and the light_apps github account has been added to your repository. This will ensure you have the following organization secrets available
•	GITHUBREADONLY
•	JF_ARTIFACTORY_AUTH
•	JF_ARTIFACTORY_DEPLOY_TOKEN
•	JF_ARTIFACTORY_EMAIL
•	JF_ARTIFACTORY_TOKEN
•	JF_ARTIFACTORY_VERSION_TOKEN
•	SPE_ROSA_ARGOCD_PAT
•	TEST_IOS_CERT_DECRYPT_KEY
•	TEST_IOS_CERT_PASSWD
These secrets can be verified by going to your repository's settings -> secrets and variables -> actions page
Dockerfile for logging into Artifactory via secrets
Here is an example of containerizing a simple api application where the application is utilizing
FROM public.ecr.aws/sam/build-nodejs18.x:latest AS builder

ENV PORT=5000
ENV NEXTAUTH_URL='http://localhost:3000'
ENV CLIENT_ID=''
ENV CLIENT_SECRET=''
ENV TENANT_ID=''
ENV NEXTAUTH_SECRET=''
ENV NODE_ENVIRONMENT='development'

WORKDIR /app
COPY .npmrc package.json package-lock.json ./ 
RUN --mount=type=secret,id=JF_ARTIFACTORY_EMAIL,uid=1000 \
    --mount=type=secret,id=JF_ARTIFACTORY_AUTH,uid=1000 \
    JF_ARTIFACTORY_EMAIL=$(cat /run/secrets/JF_ARTIFACTORY_EMAIL) \
    JF_ARTIFACTORY_AUTH=$(cat /run/secrets/JF_ARTIFACTORY_AUTH) \
    npm ci --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 5000

CMD npm run start

Dockerfile Template Explained
Base Image Selection:
FROM public.ecr.aws/sam/build-nodejs18.x:latest AS builder This line specifies the base image for the build stage. It uses Node.js 18.x from the AWS public Elastic Container Registry (ECR), labeling this stage as builder.
Environment Variables:
ENV lines define environment variables within the Docker image.
These include: PORT for the application port (set to 5000).
NEXTAUTH_URL, CLIENT_ID, CLIENT_SECRET, TENANT_ID, NEXTAUTH_SECRET for authentication and authorization purposes.
NODE_ENVIRONMENT set to development to specify the Node environment.
Working Directory:
WORKDIR /app Sets the working directory inside the container to /app. Future commands will run in this directory.
Copying Files:
COPY .npmrc package.json package-lock.json ./
Copies the .npmrc file (used for npm configuration), package.json, and package-lock.json (which list package dependencies) into the /app directory.
Running npm ci:
Utilizes Docker's --mount=type=secret,id=...,uid=1000 syntax to securely use secrets during the build process, avoiding the secrets being stored in the image layers.
JF_ARTIFACTORY_EMAIL and JF_ARTIFACTORY_AUTH are read from Docker secrets and used to authenticate against a JFrog Artifactory registry, to fetch private npm packages.
npm ci --legacy-peer-deps command is used to install dependencies, ensuring a clean, repeatable installation by deleting node_modules and installing exactly what's in package-lock.json.
Copying Application Files:
COPY . .
Copies the rest of the application's files and directories into the /app directory in the container. Building the Application:
RUN npm run build
Runs the build script defined in package.json, which typically compiles the application or prepares it for production. Exposing Ports:
EXPOSE 5000
Informs Docker that the container listens on port 5000 at runtime. This is more of documentation; to map ports, you need to do so when running the container.
Starting the Application:
CMD npm run start
Specifies the command to run when the container starts. In this case, it starts the application using the start script defined in package.json.
note: This is the key part of connecting to artifactory and you must have the organization secrets available via your repository's settings -> secrets and variables -> actions page. Then ensure you alter your workflow file to get the secrets to be usable variables in your dockerfile. See next section for that.
RUN --mount=type=secret,id=JF_ARTIFACTORY_EMAIL,uid=1000 \
    --mount=type=secret,id=JF_ARTIFACTORY_AUTH,uid=1000 \
    JF_ARTIFACTORY_EMAIL=$(cat /run/secrets/JF_ARTIFACTORY_EMAIL) \
    JF_ARTIFACTORY_AUTH=$(cat /run/secrets/JF_ARTIFACTORY_AUTH) \
    npm ci --legacy-peer-deps

Workflow File change
Ensure you declare your secrets needed in your workflow file as seen below.
- name: Build and Push Images
      uses: docker/build-push-action@v4
      with:
        secrets: |
          JF_ARTIFACTORY_EMAIL=${{ secrets.JF_ARTIFACTORY_EMAIL }}
          JF_ARTIFACTORY_AUTH=${{ secrets.JF_ARTIFACTORY_AUTH }}
        push: true
        provenance: false
        tags: ${{ steps.meta.outputs.tags }}




•	Jump Start
•	CODEOWNERS
CODEOWNERS
Official GitHub CODEOWNERS Documentation
You can use a CODEOWNERS file to define individuals or teams that are responsible for code in a repository.
The people you choose as code owners must have write permissions for the repository. When the code owner is a team, that team must be visible and it must have write permissions, even if all the individual members of the team already have write permissions directly, through organization membership, or through another team membership.
Code owners are automatically requested for review when someone opens a pull request that modifies code that they own. Code owners are not automatically requested to review draft pull requests.
Using CODEOWNERS with CATS
In the Infra_Apps repository, the dev folder is open for anyone to approve pull requests, unless editing restricted files. First time additions to the qa and prd folders by default require an approval by an administrator of this GitHub repository. This qa/prd approval can be delegated for individual app directories to an app Github team that has approval to merge changes to an individual app(s) Code Owners.
Location of CODEOWNERS file in infra_apps repo.


CODEOWNERS File Example:
# Global Code Owners (changes must be approved by this group)
* @EliLillyCo/lrl_light_infra_approvers

projects/prd/   @EliLillyCo/lrl_light_infra_approvers
projects/qa/   @EliLillyCo/lrl_light_infra_approvers
projects/dev/   @EliLillyCo/lrl_light_k8s_infra_write
projects/system_services/   @EliLillyCo/lrl_light_infra_approvers
.github/   @EliLillyCo/lrl_light_infra_approvers
CODEOWNERS @EliLillyCo/lrl_light_infra_approvers

# Backstage specific
/projects/dev/backstage-dev/ @EliLillyCo/gis-eip-backstagepilot-admin
/projects/qa/backstage-qa/ @EliLillyCo/gis-eip-backstagepilot-admin
/projects/prd/backstage-prd/ @EliLillyCo/gis-eip-backstagepilot-admin

In the above code block you can see that approvals on specific files and locations are locked down. Only the groups designated can approve changes on the designated locations or file. From here you can see which files and locations require approvals from lrl_light_infra_approvers (CATS Platform Team).


How To Update CODEOWNERS:
1.	Ensure you have a github group that can be used for approvals on your namespaces code.
2.	Draft a change to the CODEOWNERS file that follows the provided pattern. Replace <your-namespace> with the namespace you have defined. Replace <your-group-name> with the name of the group you want to delegate your approvals to.
# Your Project Name
/projects/dev/<your-namespace>-dev/ @EliLillyCo/<your-group-name>
/projects/qa/<your-namespace>-qa/ @EliLillyCo/<your-group-name>
/projects/prd/<your-namespace>-prd/ @EliLillyCo/<your-group-name>

3.	Raise a Pull Request. The lrl_light_infra_approvers group will be automatically assigned as approvers on your PR. There will be an error on your PR that says your file is not valid. Ignore this error as someone in the lrl_light_infra_approvers group will add the group you specified in <your-group-name> to the repository with "write" access.
4.	After both the approval is granted and the designated group is added with write access the error will go away and you will be free to merge the PR.
Edit this page




•	Jump Start
•	Deploying SaaS Solution
Deploying SaaS Solution
If you want to deploy a SaaS solution on CATS, kindly reach out to a community member who has already worked through this process to discuss their experience deploying SaaS solutions on CATS. They will provide details surrounding the process and how the process worked.
TODO: Further Define process and document here
SaaS Solutions Deployed	Contact	Description
BioTuring	Abhi Malatpure	Deployed Via HelmChart... The BioTuring BBrowserX is a state-of-the-art data visualization and analysis tool that provides researchers with a streamlined, user-friendly Graphical User Interface (GUI) platform for analyzing single-cell datasets. Its built-in GPU acceleration gives BBrowserX the power to scale up to millions of cells.
LiveDesign SaaS Projects?	Nathan Morin	Details Coming Soon!
Edit this page




•	K8s Configuration
•	Overview
Configuration Overview
The configuration section is all about helping our users configure their deployment resources appropriately for their projects. See the below table of contents for a quick look at the sections available as well as what information is in each section:
Section	Description
Namespace
Discuss what is a namespace as well as the labels and annotations used to configure a namespace correctly. IAM permissions and Cluster Security Groups are handled via namespace configuration.
Deployment
Discuss what a deployment is and how to configure a deployment resource for your specific solution.
Service
Discuss what is a Service is and how it maps to an ingress.
Ingress
Discuss what is an Ingress is, how to configure an ingress for your solution, and Routing, Authorization and Authentication within the cluster.
Compute and Workload Scheduling
Covers the two types of compute supported: Fargate and AWS EC2 instances, including how to configure namespaces for each.
Scaling
Discusses horizontal scaling for pod replicas related to deployments or stateful sets.
Storage
Discusses the options available for storing data such as S3, EFS, or EBS.
Cron Job
Explains CronJobs in Kubernetes for scheduling jobs.
Jobs
Describes how Jobs manage Pods to completion, including an example Job configuration.
Rate Limit
Describes how to control the Number of Requests Going to a Service
External Secrets
Introduces the concept of managing secrets externally, not directly within Kubernetes.
Helm Release
Describes creating Helm release resources for managing applications or services on Kubernetes.
Graph User Info
Explains how to access graph-based user information via a built-in integration in CATS.
Makefile
Discuss what a makefile is and why it is important. Template provided




•	K8s Configuration
•	Namespace
Namespace
In Kubernetes, namespaces provides a mechanism for isolating groups of resources within a single cluster. Names of resources need to be unique within a namespace, but not across namespaces. Namespace-based scoping is applicable only for namespaced objects (e.g. Deployments, Services, etc.) and not for cluster-wide objects (e.g. StorageClass, Nodes, PersistentVolumes, etc.).
When to Use Multiple Namespaces
Namespaces are intended for use in environments with many users spread across multiple teams, or projects. For clusters with a few to tens of users, you should not need to create or think about namespaces at all. Start using namespaces when you need the features they provide.
Namespaces provide a scope for names. Names of resources need to be unique within a namespace, but not across namespaces. Namespaces cannot be nested inside one another and each Kubernetes resource can only be in one namespace.
Namespaces are a way to divide cluster resources between multiple users (via resource quota).
It is not necessary to use multiple namespaces to separate slightly different resources, such as different versions of the same software: use labels to distinguish resources within the same namespace.
CATS Namespace Template
# Define Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: <namespace-name>
  labels:
    cost-center: <costcenterID>
  annotations:
    app.lrl.lilly.com/compute: <serverless> or <hybrid> 
    lilly.com/cloud-browser-auth: <authconfigs> #optional
    app.lilly.com/sg-rule: <interface> #optional
    app.lilly.com/argo.automated: "true"
    app.lilly.com/argo.config: |-
            {
                "roles": {
                    "readADGroups": [ "<dev-group>" ],
                    "adminADGroups": [ "<admin-group>" ]
                }
            }


You need to replace the placeholder values with your desired configurations. Here's an explanation of the placeholders:
Placeholder	Description
<namespace-name>	The name of your namespace.
<costcenterID>	The ID of the cost center associated with the namespace.
<serverless>	The default solution.
<hybrid>	The application config will be using Fargate and EC2.
<authconfigs>	This line relates to the cloud browser solution. Remove line if you are not using this feature.
<interface>	The annotation will contain the interface used to define your ingress and egress rules for all resources in your namespace.
<dev-group>	This represents the AD group you would like to have read only access to your namespaces resources in the Argo Dashboard
<admin-group>	This represents the AD group you would like to have Admin access to your namespaces resources in the Argo Dashboard
Note: Remember to remove the angle brackets (<>) when replacing the placeholder values. Additionally, this template assumes you are using the apps/v1 API version for the Deployment resource.


Labels and Annotations
1. labels: explained
cost-center: - This label maps your namespace to your area's cost center. This is used by our kubecost solution to congregate namespaces into large groups to better understand how many resources each group is using. This label is a string. If your cost center contains all numbers such as 654321 then you can simply put it in quotes. "654321"


2. annotations: explained
app.lilly.com/compute:
There are two types of compute supported. The primary type is Fargate. The second type is AWS EC2 instances. To configure your namespace to use Fargate / EC2 instances, you must place the annotation: app.lrl.lilly.com/compute with a value of either 'serverless' to allow using only Fargate OR 'hybrid' to allow using both EC2 or Fargate.
NOTE: If you chose hybrid you must label your containers to allow them to run on Fargate, while if you chose serverless all your containers will run on Fargate without special config.
A more detailed explanation can be found here.


lilly.com/cloud-browser-auth:
This allows setting s3 auth roles for s3 resources associated with the associated namespace.
The value for this annotation is a JSON object in string format. The simplest config allows setting a list of users providing read only access to the default S3 path for this namespace. This default bucket / S3 prefix path will be 's3://lly-light-prod/namespace-name/'
annotations:
  app.lrl.lilly.com/cloud-browser-auth: '{"authConfigs": [{ "users": ["A123456", "B7891011"]}]}'

A more detailed explanation can be found here.


app.lilly.com/sg-rule:
This is an optional annotation that outlines the interface you will populate in order to apply specific ingress and egress rules to your namespace. These rules will then apply to all resources within your namespace.
ingress rules interface:
app.lilly.com/sg-rule: |-
{
  "ingress_rules": [
    {
      "namespace_allow_from": "<other-namespace>",
      "port": <your-ingress-port>
    }
  ],
  "egress_rules": [
    {
      "prefix_list": "<your-prefix-list>",
      "port": <your-egress-port>
    },
    {
      "sg_id": "<security-group-ID>",
      "sg_account": "<security-group-account>",
      "port": <your-egress-port>
    }
  ]
}

Note: You do not need to use this annotation. There is a default security group policy that is applied automatically to a namespace upon creation, called sg-main. This default policy allows the following activities:
•	Restrict namespace to not allow outbound traffic
•	Allow self referencing. Allows communication between pods within your own namespace
•	Allow udp and tcp lookup on cluster DNS service
•	Allow namespace to connect to RDS
•	Allow namespace to connect to EFS
•	Allow communication to control plane
•	Allow all traffic from core cluster services. cluster can communicate over all TCP ports.
•	Allow all Lilly specific egress are except on prem
•	Allow all AWS APIs
•	Allow all AWS DB RDS
•	Allow all AWS DB redshift
•	Allow access to AWS managed Kafka
•	Allow access to Schrodinger License
•	Allow access to MOE license
•	Allow access to all Lilly http based URLs
•	Allow access to Microsoft private link
For more detailed information on the security group rule annotation, see our extensive documentation here. For a detailed Architecture diagram of how the security groups are handled in CATS, see our diagram here.



app.lilly.com/argo.config:
This is a required annotation that ensures configuration of permissions for the Argo CD dashboard based off of the AD groups you assign to both the Read-Only section and the Admin section. Configure this by customizing and managing your own AD groups that contain your project's developers or users.
Use this interface to set your AD Groups by replacing <dev-group> and <admin-group> with strings that are names of the AD groups you have configured:
{
    "roles": {
        "readADGroups": [ "<dev-group>" ],
        "adminADGroups": [ "<admin-group>" ]
    }
}

You can easily use existing AD Groups for the roles interface or create new existing groups by navigating to the Lilly idmportal and select "Create a new Group".
For information on permissions provided by readADGroups and adminADGroups roles, navigate HERE
For details on the Argo Dashboard please navigate HERE


Security Group Rule
The sg-rule annotation is an optional annotation on a namespace. This annotation contains an interface that you will populate with details that are specific to the solution that you are deploying. Before adding sg-rule as an annotation on your namespace please review the two policies below to ensure they do no already cover your use case.
You will need the sg-rule annotation if you are attempting to enable namespace1 to namespace2 communication.
default sg-main policy
Most developers will not need to use this annotation as without it your namespace will automatically be added to the default security group sg-main via our automation. The sg-main security group policy will allow/restrict the following scenarios:
•	Restrict namespace to not allow outbound traffic
•	Allow self referencing. Allows communication between pods within your own namespace
•	Allow udp and tcp lookup on cluster DNS service
•	Allow namespace to connect to RDS
•	Allow namespace to connect to EFS
•	Allow communication to control plane
•	Allow all traffic from core cluster services. cluster can communicate over all TCP ports.
•	Allow all Lilly specific egress are except on prem
•	Allow all AWS APIS
•	Allow all AWS DB RDS
•	Allow all AWS DB redshift
•	Allow access to AWS managed Kafka
•	Allow access to Schrodinger License
•	Allow access to MOE license
•	Allow access to all Lilly http based URLs
•	Allow access to Microsoft private link
sg-onprem policy
If you are using an on prem node group solution you will have labeled your node as "onpremis" this designation will automatically add the sg-onprem security group policy to your namespace instead of the sg-main policy. The sg-onprem security group policy will allow/restrict the following scenarios:
•	Restrict namespace to not allow outbound traffic
•	Allow self referencing. Allows communication between pods within your own namespace, on the same security group.
•	Allow udp and tcp lookup on cluster DNS service
•	Allow namespace to connect to RDS
•	Allow namespace to connect to EFS
•	Allow communication to control plane
•	Allow all outbound traffic
sg-rule Interface Template:
app.lilly.com/sg-rule: |-
{
  "ingress_rules": [
    {
      "namespace_allow_from": "<other-namespace>",
      "port": <your-ingress-port>
    }
  ],
  "egress_rules": [
    {
      "prefix_list": "<your-prefix-list>",
      "port": <your-egress-port>
    },
    {
      "sg_id": "<security-group-ID>",
      "sg_account": "<security-group-account>",
      "port": <your-egress-port>
    }
  ]
}

This template is made up of two sections, ingress_rules: and egress_rules:.


ingress_rules:
This part of the interface is optional. If you would like to allow traffic into your namespace, from another namespace, you will fill out the following fields with the applicable information. In most cases developers are not allowing traffic from other namespaces and therefore can remove this section.
"ingress_rules": [
    {
      "namespace_allow_from": "<other-namespace>",
      "port": <your-ingress-port>
    }
  ],

Placeholder	Description
<other-namespace>	(string) The name of namespace you want to allow connection from. Remove line if you are not using this feature.
<your-ingress-port>	(int) The port that incoming traffic is targeting.


Example - No ingress rules used:
app.lilly.com/sg-rule: |-
{
  "ingress_rules": [],
  "egress_rules": [
    {
      "prefix_list": "<your-prefix-list>",
      "port": <your-egress-port>
    },
    {
      "sg_id": "<security-group-ID>",
      "sg_account": "<security-group-account>",
      "port": <your-egress-port>
    }
  ]
}



egress_rules:
This part of the interface is made up of two sections, one for designating a prefix list, and one for designating the security group information that will apply to all resources in your namespace. If you are not using a prefix list that section can be removed from the 'egress_rules:' section.


prefix lists explained:
An AWS (Amazon Web Services) prefix list is a collection of CIDR (Classless Inter-Domain Routing) blocks that are specified in a single list. These CIDR blocks represent IP address ranges used by AWS services. AWS prefix lists are primarily used in networking and security configurations, such as in AWS Identity and Access Management (IAM) policies, route tables, and security group rules.
Using prefix lists allows you to simplify the management of IP address ranges associated with AWS services. Instead of individually specifying multiple IP ranges for different services, you can refer to a single prefix list that encapsulates all the relevant CIDR blocks.
If your solution's use case requires a custom prefix list to be created reach out to Cole Thomas or Ross Grinvalds and we will help you get one set up.
"egress_rules": [
    {
      "prefix_list": "<your-prefix-list>",
      "port": <your-egress-port>
    },
]

Placeholder	Description
<your-prefix-list>	(string) Optional field that you can fill out if you are using prefix lists.
<your-egress-port>	(int) Optional field that specifies the destination port that the outgoing traffic from your namespace is targeting.
The prefix list details are not required fields. If you are not using prefix lists in your solution then this section can be removed.
Example - No prefix list and no ingress rules used:
app.lilly.com/sg-rule: |-
{
  "ingress_rules": [],
  "egress_rules": [
    {
      "sg_id": "<security-group-ID>",
      "sg_account": "<security-group-account>",
      "port": <your-egress-port>
    }
  ]
}



Security Group Details section explained:
If you decide to define an egress rule, then this part of the interface is required. In it you are designating the information surrounding the security group your namespace is associated with.
"egress_rules": [
    {
      "sg_id": "<security-group-ID>",
      "sg_account": "<security-group-account>",
      "port": <your-egress-port>
    }
]

Placeholder	Description
<security-group-ID>	(string) The ID of the security group you are using.
<security-group-account>	(string) The AWS account that owns the security group you specified in <security-group-ID>
<your-sg-egress-port>	(int) The destination port that outgoing traffic from your namespace is targeting


Basic sg-rule Interface Template:
The following template contains the bare minimum required if using the sg-rule: annotation. The template does not allow traffic from other namespaces and is not using a prefix list. this template would allow traffic out of the namespace via the port specified in 'your-egress-port'.
app.lilly.com/sg-rule: |-
{
  "ingress_rules": [],
  "egress_rules": [
    {
      "sg_id": "<security-group-ID>",
      "sg_account": "<security-group-account>",
      "port": <your-egress-port>
    }
  ]
}

IAM Permissions for your app
You can assign AWS IAM permission to any of your app deployment pods. See the sections below for a few different permission patterns.
General
There are two steps to adding permissions to your app.
1.	Define in an annotation, a role/service account & policy annotation in your namespace.
This annotation follows the pattern app.lrl.lilly.com/aws-role.{service account name}
The value of the annotation can be either policy or s3. See below for information about each of these.
2.	Associate service account with your Deployment pod
This will create a role in AWS associated with a k8s service account following the pattern:
•	Service Account Created {service account name from above}
•	Assume Role IAM Role ARN Created (USE IF AWS AUTH OF CUSTOM LILLY SERVICE) arn:aws:iam::{Account ID see below}:role/lrl-light-apps-{namespace name}-{service account name from above}
•	Resource IAM Role ARN Created (USE IF TRUSTING FROM ANOTHER ACCOUNT) arn:aws:iam::{Account ID see below}:role/lrl-light-apps/lrl-light-apps-{namespace name}-{service account name from above}
There are two different ARNs above because when performing STS calls, the path segment is stripped from the ARN of the IAM role with only the IAM role name remaining. Note the missing /lrl-light-apps/ infix when AUTHENTICATING WITH LILLY CUSTOM SERVICE.
Cluster	Account IDS
Main (prod) default	283234040926
QA	474366589702
DEV	408787358807
NOTE: Make sure that the length of the resulting AWS role name after replacing the values in lrl-light-apps-{namespace name}-{service account name from above} is equal or less than 64 characters, otherwise the automation will fail to create the AWS role. The namespace will be created and deployed but the AWS role will not be created. For example, this is an invalid AWS role name because the length is 69 characters: lrl-light-apps-spe-eli-labs-assay-catalog-dev-assay-catalog-svc-acct
S3 Policy
Create add an annotation to your namespace & provide the value s3, this will auto create a policy with access to a path prefix in our platform s3 bucket with the pattern s3://lly-light-prod/{your namespace name}/*
apiVersion: v1
kind: Namespace
metadata:
  name: my-app-namespace-dev
  labels:
    cost-center: your-apps-cost-center-id
  annotations:
    app.lrl.lilly.com/aws-role.my-service-account: s3

Add the service account created above to the serviceAccountName. This attaches the k8s service account & the associated IAM role to your pod.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: my-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: my-app
    spec:
      containers:
      ...
      serviceAccountName: my-service-account

You can now access the bucket: s3://lly-light-prod/my-app-namespace-dev/*, with full permission for the specified S3 path.
Custom Permission
Important Note: custom policies are a powerful method of setting any AWS IAM permission. Because of this, they have potential to be misconfigured / misused. To protect against this, any namespace with a custom IAM policy must be created in a namespace.yml file. This allows our GitHub CODEOWNERS to flag this namespace & associated policy changes for additional review.
You can set custom permissions by creating an annotation with the value policy & adding a .policy annotation with the custom policy to associate with this role.
apiVersion: v1
kind: Namespace
metadata:
  name: my-app-namespace-dev
  labels:
    cost-center: your-apps-cost-center-id
  annotations:
    app.lrl.lilly.com/aws-role.my-service-account: policy
    app.lrl.lilly.com/aws-role.my-service-account.policy: |
      {
          "Version": "2012-10-17",
          "Statement": [
              ... IAM Policy Statements Here ...
          ]
      }

From there, you can add service account created above to the serviceAccountName. This attaches the k8s service account & the associated IAM role to your pod.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: my-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: my-app
    spec:
      containers:
      ...
      serviceAccountName: my-service-account

Your pod will now have the permission defined in the custom policy.
Research Data cross account roles
If you have data in Research Data not in an API that you need to access from your app, you can use a custom policy as above with a specific policy statement
apiVersion: v1
kind: Namespace
metadata:
  name: my-app-namespace-dev
  labels:
    cost-center: your-apps-cost-center-id
  annotations:
    app.lrl.lilly.com/aws-role.my-service-account: policy
    app.lrl.lilly.com/aws-role.my-service-account.policy: |
      {
          "Version": "2012-10-17",
          "Statement": [
              {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Resource": "arn:aws:iam::014508419436:role/aws_resd_{your data domain}_{your role label}"
              }
          ]
      }

This policy allows your app to assume into the given Research Data role. To create this role, you must update the data domain definitions here: [Click here] (https://github.com/EliLillyCo/LRL_research_data_security/blob/main/data_domain_definitions/data_domains_prd.json).
For the example above, you would need to add the following configuration & create a PR to the main branch (If you have questions or need access, ask one of the Research Data Security approvers) [Click here] (https://github.com/orgs/EliLillyCo/teams/lrl-resdata-security-approvers/members):
{
    "data_domain": "{your data domain}",
    "roles": [
    {
        "label": "{your label}",
        "assume_role_policy": "role_policy_nologin.json",
        "additional_policy_statements": [
            {
            "Action": "sts:AssumeRole",
            "Principal": {
                "AWS": "arn:aws:iam::283234040926:role/lrl-light-apps/lrl-light-apps-{your-namespace}-{your service account name}"
            },
            "Effect": "Allow"
            }
        ],
        "policies": [
              ... Research Data Policies ...
        ]
    }
    ]
},

From there, you can add service account created above to the serviceAccountName. This attaches the k8s service account & the associated IAM role to your pod.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: my-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: my-app
    spec:
      containers:
      ...
      serviceAccountName: my-service-account

Your pod will now have permission to assume into the research data role you specified




•	K8s Configuration
•	Deployment
Deployment
A Deployment provides declarative updates for Pods and ReplicaSets.
You describe a desired state in a Deployment, and the Deployment Controller changes the actual state to the desired state at a controlled rate. You can define Deployments to create new ReplicaSets, or to remove existing Deployments and adopt all their resources with new Deployments.
CATS Deployment Template:
# Define Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <deployment-name>
  namespace: <namespace-name>
  labels:
    app: <app-label>
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.<policy-name>: "<aws-account-number>;<your-repo-name-in-ecr>;glob:<tag-pattern>"
    # Example: app.lilly.com/flux.simple.docs-policy: "283234040926;lrl_light_k8s_infra_apps_catsdocs;glob:sha-.*"
    wave.pusher.com/update-on-config-change: "true"
spec:
  replicas: <replica-count>
  selector:
    matchLabels:
      app: <app-label>
  template:
    metadata:
      labels:
        app: <app-label>
    spec:
      containers:
        - name: <container-name>
          image: <container-image> # {"$imagepolicy": "<namespace-name>:<policy-name>"}
          ports:
            - containerPort: <container-port>
          <additional-container-configuration>
      <additional-pod-configuration>


You need to replace the placeholder values with your desired configurations. Here's an explanation of the placeholders:
Placeholder	Description
<namespace-name>	The namespace where your deployment will be created.
<deployment-name>	The name of your Kubernetes deployment.
<app-label>	A label that identifies your application components within Kubernetes.
<aws-account-number>	Default to "283234040926" for AWS Prod Cluster.
<your-repo-name-in-ecr>	The name of your repository in AWS ECR
<policy-name>	A unique policy name within your namespace. chosen by you. It is arbitrary. Avoid special characters.
<tag-pattern	This is where you declare the sha tagging pattern you are using in your git workflow file. Example: "sha-.*"
<replica-count>	The number of pod replicas you want for your deployment.
<container-name>	The name assigned to the container within your pod.
<container-image>	The Docker image for your container (e.g., your-registry/your-image:tag).
<container-port>	The port that your container listens on.
<additional-container-configuration>	Any additional container configuration (e.g., environment variables, volumes, etc.).
<additional-pod-configuration>	Any additional pod-level configuration (e.g., volumes, secrets, etc.).


Find Your Container Image Name:
You can find the name of your image by following these steps.
1.	Navigating to your repository and go to the Actions Tab
2.	Select the workflow the is building your desired image and open it.
3.	Click on the button that has a green checkmark and is labeled build
4.	Expand the section labeled build and push docker image
5.	Scroll through the logs and look for a line that says something like this: writing image sha256:a1fa199272cae6ec8747f905aa5624666be61e38db0aff5b9e2763f07df072d8 done this is <your-image-tag>
If using generic images (e.g. pgadmin) use Artifactory to avoid DockerHub rate limiting. E.g. pgadmin:4 becomes elilillyco-lilly-docker.jfrog.io/pgadmin:4. You also need to make sure that an entry for the image is present in allowed images.
Annotations Explanation:
The following lines enable flux to automatically find your latest image in the ECR and deploy it to a new pod. If the deploy is successful the old pod will be deleted and a seamless transition between the two images will happen. If you did not make any changes when implementing the git actions automation code above, then the pattern sha-.* should work out of the box:
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.<policy-name>: "<aws-account-number>;<your-repo-name-in-ecr>;glob:<tag-pattern>"
    # Example: app.lilly.com/flux.simple.docs-policy: "283234040926;lrl_light_k8s_infra_apps_catsdocs;glob:sha-.*"
    wave.pusher.com/update-on-config-change: "true"

<aws-account-number> - Default to "283234040926" for AWS Prod Cluster. You may use a different account number if you are pulling from a non CATS AWS Account's ECR. It is possible to pull your solutions image from any ECR... BUT if you do that the CATS Support team is severely limited in our ability to troubleshoot issues that may arise. We HIGHLY suggest pushing your image to the CATS PRD Account 283234040926.


<your-repo-name-in-ecr> - This is the name of your repository in AWS ECR. In the example you can see we are using the catsdocs repo name.
Your projects ECR repo name will usually be the github repository name in lowercase. Sometimes special characters such as spaces can be changed to underscores.
To find your specific name if you are not sure, you can navigate to your github actions tab and go to the "Build and Push Image" step.
To be 100 percent certain what your name is you can log into the AWS console, navigate to ECR, and look up your repo there. This method requires a CA account.


<policy-name> - A unique policy name within your namespace. Chosen by you. It is arbitrary. Avoid special characters.


<tag-pattern - This is where you declare the sha tagging pattern you are using in your git workflow file. Example: "sha-.*"
This pattern must match the pattern you are using in your workflow file or the automation will not work.
The pattern expected in the flux.simple annotation is a regex pattern. This is a known change in Flux V2. We encourage all app teams to use the -.* pattern until we have a better solution in place.
Historically users deployed images with the sha pattern declared in their workflow file example: dev-sha-.*. Now that we have moved to Flux V2 this pattern needs to be updated in the annotation to dev-sha-.*


<$imagepolicy> - Update the comment with your namespace name and image policy you define in the flux annotation to properly allow automated deployments. This comment is used by the Light Account butler. He needs the info for commit messages to work correctly.
Template:
  image: <container-image> # {"$imagepolicy": "<namespace-name>:<policy-name>"}

Example:
  image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_falcon_bartender:qa-sha-06c5953 # {"$imagepolicy": "falcon-qa:my-policy-bartender"}



Resource Name Configuration:
Resource names should not contain environment suffixes (dev, qa, prd), unless there is a really good reason for those. These are implicitly contained in namespace names. Convention for namespaces is enforced by validation.
The above templates are the very minimum required for a deployment. Depending on your solution you may need to include additional fields or make customized changes. Please see our examples folder for more extensive documentation.
Continuous Deployment
Now that you have added in your Kubernetes config file it should be deployed immediately, give or take a few minutes for the resources to start up on Fargate.
Once that happens the magic of Flux kicks in! Now anytime that you update your docker image tag with a new version Flux will automatically deploy that newly built image for you! It will even update your Kubernetes yaml config showing you which specific image tag is deployed.
The only thing you need to worry about now is defining your own release cycle management for your application. One recommendation is to follow the GitHub Flow pattern.


Service
In Kubernetes, a Service is a method for exposing a network application that is running as one or more Pods in your cluster.
A key aim of Services in Kubernetes is that you don't need to modify your existing application to use an unfamiliar service discovery mechanism. You can run code in Pods, whether this is a code designed for a cloud-native world, or an older app you've containerized. You use a Service to make that set of Pods available on the network so that clients can interact with it.
If you use a Deployment to run your app, that Deployment can create and destroy Pods dynamically. From one moment to the next, you don't know how many of those Pods are working and healthy; you might not even know what those healthy Pods are named. Kubernetes Pods are created and destroyed to match the desired state of your cluster. Pods are ephemeral resources (you should not expect that an individual Pod is reliable and durable).
Each Pod gets its own IP address (Kubernetes expects network plugins to ensure this). For a given Deployment in your cluster, the set of Pods running in one moment in time could be different from the set of Pods running that application a moment later.
This leads to a problem: if some set of Pods (call them "backends") provides functionality to other Pods (call them "frontends") inside your cluster, how do the frontends find out and keep track of which IP address to connect to, so that the frontend can use the backend part of the workload?
CATS Service Template
# Define a Service
apiVersion: v1
kind: Service
metadata:
  name: <service-name>
  namespace: <namespace-name>
spec:
  selector:
    app: <app-label>
  ports:
    - protocol: TCP
      port: <service-port>
      targetPort: <container-port>

You need to replace the placeholder values with your desired configurations. Here's an explanation of the placeholders:
Placeholder	Description
<namespace-name>	The namespace where your service will be created.
<service-name>	The name of your Kubernetes service.
<app-label>	A label to match the pods with the service.
<service-port>	The port on which your service is exposed.
<container-port>	The target port on the container that the service directs traffic to.





Ingress
An API object that manages external access to the services in a cluster, typically HTTP.
Ingress may provide load balancing, SSL termination and name-based virtual hosting.
Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster. Traffic routing is controlled by rules defined on the Ingress resource.
Here is a simple example where an Ingress sends all its traffic to one Service:
 
An Ingress may be configured to give Services externally-reachable URLs, load balance traffic, terminate SSL / TLS, and offer name-based virtual hosting. An Ingress controller is responsible for fulfilling the Ingress, usually with a load balancer, though it may also configure your edge router or additional frontends to help handle the traffic.
An Ingress does not expose arbitrary ports or protocols. Exposing services other than HTTP and HTTPS to the internet typically uses a service of type Service.Type=NodePort or Service.Type=LoadBalancer.
Overview
There are three types of ingress routes available on the CATS Platform
1.	apps.lrl.lilly.com - This is a browser based route that allows a user to be on or off the lilly network and requires the user to authenticate upon accessing.
2.	apps-internal.lrl.lilly.com - This is a browser based route that requires a user to be on the lilly network but does not force the user to authenticate.
3.	apps-api.lrl.lilly.com - This is a programmatic / script based route. If you are accessing an endpoint in CATS via a script, you will need to target this route. This route is not set up for browser based access. If you access an endpoint on this route via your browser, you will get an "invalid token" response.
CATS Ingress Template
# Define an Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: <ingress-name>
  namespace: <namespace-name>
spec:
  rules:
    - host: <ingress-host>
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: <service-name>
                port:
                  number: <service-port>


You need to replace the placeholder values with your desired configurations. Here's an explanation of the placeholders:
Placeholder	Description
<namespace-name>	The namespace where your ingress will be created.
<ingress-name>	The name of your ingress resource.
<ingress-host>	The host/domain associated with your ingress (e.g., example.com).
<service-name>	The name of the service to which the ingress routes traffic.
<service-port>	The service port to which the ingress routes traffic.
Ingress Routes in CATS
CATS Supports three different ingress routes:
1.	Authenticated route : *.apps.lrl.lilly.com
2.	Unauthenticated route : *.apps-internal.lrl.lilly.com
3.	Script Based Access route : *.apps-api.lrl.lilly.com
Authenticated Route
For more details see Authorization section below
Unauthenticated Route
For more details see Authorization section below
Script Based Access Route
If users want to access data from apps hosted in CATS from a Notebook / script environment / CLI, there is a built-in way of securely providing this access.
How to add a API access endpoint?
In addition to the regular apps.lrl.lilly.com domain which is intended for browser based app access, CATS has a apps-api.lrl.lilly.com domain.
This domain is designed to allow programmatic access & is available only on the Lilly Network. All the authorization "lilly groups" headers available in the main domain are available in this domain.
To configure your app, add an Ingress resource with a apps-api.lrl.lilly.com domain.
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: example-app
  namespace: example
  annotations:
    lilly.com/security_groups: |
      [
        {
          "Route": "/",
          "ADGroups": [ "ad_group1", "ad_group2" ]
        }
      ]
spec:
  rules:
  - host: example-app.apps-api.lrl.lilly.com
    http:
      paths:
      - path: '/'
        backend:
          serviceName: example-backend-service
          servicePort: 80

How to access your API endpoint?
You can access these API endpoints using one of the client libraries. See supported languages below.
•	R
•	Python


Routing and Middleware
Ingress naming conventions
For every environment (dev, qa, prd) you can have separate DNS names (xxx.apps.lrl.lilly.com). It is recommended to distinguish the environments by modifying the DNS names with appropriate suffixes (dev: -d, qa: -q, prd: NOTHING). So for an application xxx you will get xxx-d.apps.lrl.lilly.com in dev and xxx.apps.lrl.lilly.com in production.
Custom Routing Middleware
If some specific request manipulation is required, use middlewares. Please note how the middleware is referenced - {middleware-namespace}-{middleware-name}@{traefik-configuration-provider}. You can always check the dashboard for any potential issues.
Example Middleware that adds custom headers
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: pgadmin-header
  namespace: indigo-dev
spec:
  headers:
    customRequestHeaders:
      x-forwarded-proto: "https"
      x-forwarded-port: "443"
---
apiVersion: extensions/v1
kind: Ingress
metadata:
  name: indigo-pgadmin
  namespace: indigo-dev
  annotations:
    traefik.ingress.kubernetes.io/router.middlewares: indigo-dev-pgadmin-header@kubernetescrd
spec:
  rules:
  - host: indigo-pgadmin-d.apps.lrl.lilly.com
    http:
      paths:
      - path: '/'
        pathType: Prefix
        backend:
          service
            name: indigo-pgadmin
            port:
              number: 80

Default Middleware Available
Compression (applies gzip compression to your route)
Example definition
apiVersion: extensions/v1
kind: Ingress
metadata:
  name: indigo-pgadmin
  namespace: indigo-dev
  annotations:
    traefik.ingress.kubernetes.io/router.middlewares: [if you have other custom middleware, they can go here],ingress-entry-compression@kubernetescrd
spec:
  rules:
  - host: indigo-pgadmin-d.apps.lrl.lilly.com
    http:
      paths:
      - path: '/'
        pathType: Prefix
        backend:
          service:
            name: indigo-pgadmin
            port:
              number: 80

Rate Limit Middleware
If you would like to implement rate limiting you can do so via a middleware.
Steps to add rate limit:
1.	Create custom rate limit middleware Kubernetes resource. Full Instructions HERE. Simple template to get started:
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: ratelimit-middleware
  namespace: your-namespace-name
spec:
  rateLimit:
    average: 100
    burst: 200




2.	Attach your new rate limit middleware resource to your ingress via the following annotation. Be sure to update the name of your middleware to match the name defined in your middleware resource created in step 1.
annotations:
    traefik.ingress.kubernetes.io/router.middlewares: ratelimit-middleware

Redirect Middleware
If you would like to implement a traffic redirection from one host to another, you can do so via a middleware.
Steps to add traffic host redirect:
1.	Create a Middleware using the following template to get started:
  apiVersion: traefik.containo.us/v1alpha1
  kind: Middleware
  metadata:
    name: userfacing-base-redirect
    namespace: <your-namespace>
  spec:
    redirectRegex:
      regex: .* # a regex pattern that matches the host(s) that you want to redirect
      replacement: https://kubecost.apps.lrl.lilly.com # the new host that you want to redirect to 



2.	Attach your new redirect middleware resource to your ingress via the following annotation. Be sure to update the name of your middleware to match the name defined in your middleware resource created in step 1.
annotations:
  traefik.ingress.kubernetes.io/router.middlewares: kubecost-userfacing-base-redirect@kubernetescrd

Authorization
Authenticated Route
Authenticated Route
apiVersion: extensions/v1
kind: Ingress
metadata:
  name: example-app
  namespace: example
  annotations:
    lilly.com/security_groups: |
      [
        {
          "Route": "/",
          "ADGroups": [ "ad_group1", "ad_group2" ]
        }
      ]
spec:
  rules:
  - host: example-app.apps.lrl.lilly.com
    http:
      paths:
      - path: '/'
        pathType: Prefix
        backend:
          service:
            name: example-backend-service
            port:
              number: 80

NOTE: See Bouncer application for authentication/authorization implementation. In the example above see the lilly.com/security_groups annotation and its syntax. The group name matching is CASE SENSITIVE.
Authenticated Bouncer Patterns.
There are five different authentication patterns available for developers implementing an authenticated route. All route authentication is enabled via the Bouncer system service. Head on over to the Bouncer repository for more information on these different authentication patterns.
•	Standard Web Pattern
•	Azure APIM and Entra ID
•	Client Credentials
•	On Behalf of User (API)
•	AWS STS
No Authentication
(accessible only on Lilly Network)
To skip authentication altogether, use the annotation below (kubernetes.io/ingress.class: ingress-noauth) on your Ingress. The DNS name is now apps-internal as opposed to just apps.
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example
  namespace: example
  annotations:
    kubernetes.io/ingress.class: ingress-noauth
spec:
  rules:
    - host: <app name>.apps-internal.lrl.lilly.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service
                name: <service name>
                port: 
                  number: 5601

Authentication with AWS Roles Ingress Routes
In some cases, users may want to leverage Bouncer's authorization of ingress routes for AWS Roles. In this case, no OAuth headers should be requested for the ingress. An example of this is available to test against in the CATS DEV cluster for the admin-testing-<main|hybrid|onprem> echo services (main example, hybrid example, onprem example). An example ingress is provided below:
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example
  namespace: example-ns
  annotations:
    lilly.com/security_groups: '[{"Route": "/.*", "Method": "GET", "AWSRoles": ["arn:aws:sts::408787358807:role/AWSReservedSSO_aws_light_devs_be5dfdb952b1974e"], "AWSAccountIds": ["408787358807"]}]'
    lilly.com/oauth_token_headers: '{}'
spec:
  rules:
  - host: example.apps-api-d.lrl.lilly.com
    http:
      paths:
      - path: '/'
        pathType: Prefix
        backend:
          service:
            name: example-svc
            port:
              number: 80

In order to call such an endpoint, developers will need to implement AWS STS signing for requests sent to the endpoint. To do this, a set of signed headers must first be obtained from STS and then applied to the request submitted to the CATS-hosted endpoint. Example implementations are provided below for the CATS DEV admin-testing-main namespaced echo service. Developers with access to aws_light_devs can use this endpoint for testing. If obtaining credentials via the aws sso login --sso-session lilly --no-browser method, environment variables can be stashed to the current shell via:
Example $HOME/.aws/config:
[profile light-d-sso]
output = json
region = us-east-2
sso_session = lilly
sso_account_id = 408787358807
sso_role_name = aws_light_devs

[sso-session lilly]
sso_start_url = https://lilly-aws-login.awsapps.com/start/
sso_region = us-east-2
sso_registration_scopes = sso:account:access

Example command to export AWS environment variables:
eval "$(aws configure export-credentials --profile light-d-sso --format env)"

Python example using LightClient library:
import json
import requests
from light_client import LIGHTClient

#DEV | QA | PROD Clusters
# PROD: LRL_Light_k8s_infra_apps
# QA: LRL_light_k8s_infra_apps_qa
# DEV: LRL_light_k8s_infra_apps_test
client = LIGHTClient(env="DEV")

url = "https://admin-testing-main-aws.apps-api-d.lrl.lilly.com/echo'"
headers = {
    "Content-Type": "application/json"
}

try:
    response = client.get(url=url, headers=headers, timeout=10)
except requests.exceptions.ConnectTimeout as e:
    response = requests.Response()
    response._content = e
    response.status_code = 503
if response.status_code != 200:
    print(response.status_code)
    print(response.json())
else:
    print(response.status_code)
    print(response.json())

Javascript example using aws-sdk-v3:
const { HttpRequest } =             require('@aws-sdk/protocol-http');
const { SignatureV4 } =             require('@aws-sdk/signature-v4');
const { Sha256 } =                  require('@aws-crypto/sha256-universal');
const { fromEnv } =                 require('@aws-sdk/credential-provider-env');
const { fromNodeProviderChain } =   require('@aws-sdk/credential-providers');

// const credentialProvider = fromNodeProviderChain({
//   //...any input of fromEnv(), fromSSO(), fromTokenFile(), fromIni(),
//   // fromProcess(), fromInstanceMetadata(), fromContainerMetadata()
//   // Optional. Custom STS client configurations overriding the default ones.
//   clientConfig: { region: 'us-east-2' },
// });

const credentialProvider = fromEnv(
    {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    }
);

var sts_request = new HttpRequest({
    hostname: "sts.amazonaws.com/",
    protocol: "https:",
    body: "Action=GetCallerIdentity&Version=2011-06-15",
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Host': 'sts.amazonaws.com',
    },
    method: 'POST',
  });

let credentials = credentialProvider();
credentials.then(
    (cred)=>{
        var signer = new SignatureV4({credentials: cred, region: 'us-east-1', sha256: Sha256, service: 'sts'});
        signer.sign(
            sts_request, 
            {unsignableHeaders: new Set(['x-amz-content-sha256'])}
        ).then(
            (signed_sts_request)=>{
                var headers = {
                    ...signed_sts_request.headers,
                    'User-Agent': 'javascript client example with aws-sdk-js-v3',
                }
                delete headers['Host'];
                console.log(headers)
                fetch('https://admin-testing-main-aws.apps-api-d.lrl.lilly.com/echo', {headers: headers}).then(response => {
                    if (!response.ok) {
                        throw new Error('CATS response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Data:', data);
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                }); 
            });
        },
    (err)=>{
        console.error(err);
    }
);

Javascript example using the aws4 library:
const AWS = require('aws-sdk');
const aws4 = require('aws4');

class LightClient {
    constructor() {
      this.headers = this.getSession();
    }
  
    /**
     * @name - getSession
     * @description - get temporary session from STS
     */
    async getSession() {
      AWS.config.update({ region: 'us-east-2' });
      const credentials = new AWS.EnvironmentCredentials('AWS');
      await credentials.getPromise();
  
      const requestData = {
        host: 'sts.amazonaws.com',
        path: '/',
        service: 'sts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: 'Action=GetCallerIdentity&Version=2011-06-15',
      };
      const signedRequest = aws4.sign(requestData, {
        accessKeyId: credentials.accessKeyId,
        sessionToken: credentials.sessionToken,
        secretAccessKey: credentials.secretAccessKey,
      });
      return Promise.resolve(signedRequest.headers);
    }
}

async function buildHeader() {
    try {
      const ll = new LightClient();
      const authHeaders = await ll.getSession();
      return {
        'User-Agent': 'javascript client example',
        'X-Amz-Security-Token': authHeaders['X-Amz-Security-Token'],
        'X-Amz-Date': authHeaders['X-Amz-Date'],
        Authorization: authHeaders.Authorization,
      };
    } catch (error) {
      console.log('Error in buildHeader');
      console.log(error);
    }
    
}

buildHeader().then(headers => {
    console.log(headers)
    fetch('https://admin-testing-main-aws.apps-api-d.lrl.lilly.com/echo', {headers: headers}).then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the response body as JSON
        })
        .then(data => {
            console.log('Data:', data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
});

Privileged accounts
If you need to protect your service with a privileged account access, you need to use your -CA accounts. Create an AD group with -CA account members only (e.g. Indigo_infrastructure).
Request to have this group added to GAT_Private_Groups, otherwise neither Bouncer, nor the user of MS Graph API will be able to see your group membership (-CA accounts' membership is protected, hence it is not visible by default). See RITM2885602 for details.
When accessing the protected service use a different browser to the one you use regularly (e.g. FireFox) to avoid any clashes (anonymous mode might work too) and as your email / User Principal Name (UPN) enter systemid-CA@llynet.com (e.g. xh01053-CA@llynet.com).
Routing across multiple application (CORS avoidance)
By default each host name defined in Ingress resources can only be used once per namespace (i.e. application). Validation of the PR will fail should one namespace want to use a host name that is being used in a different namespace.
If one application (i.e. namespace) needs to expose its api to a web UI of another (i.e. to avoid CORS issues in a browser), it needs to allow the use of its host name in a different namespace.
This is performed in app_integrations.yml.config file in the namespace that is permitting the use of the host name.
E.g. Indigo wants to use GeneKB's API. Two things need to happen:
1.	Indigo needs to allow GeneKB to use one of Indigo's hostnames: dev/indigo-dev/app_integrations.yml.config
genekb-dev:
  ingress:
    reference: allowed
    host: indigo-d.apps.lrl.lilly.com

2.	GeneKB (genekb-dev) can now expose its service on Indigo's host (indigo-d.apps.lrl.lilly.com). Do note the use of middleware.
Authentication needs to be set separately to any existing Ingresses
See GeneKB example


Streamlit App Routes
When application teams are deploying a streamlit application on the CATs Platform there is a manual step required involving some additional configuration in route53 involving a CNAME record entry.
Streamlit Config Instructions
1.	Modify the annotations field in the Ingress metadata to include traefik.ingress.kubernetes.io/router.middlewares for making socket connections and lilly.com/user_info_headers for security as shown below:
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: <project-name>
  namespace: <namespace>
  annotations:
    traefik.ingress.kubernetes.io/router.middlewares: ingress-entry-compression@kubernetescrd
    lilly.com/user_info_headers: '[{"attribute": "name", "header": "X-USER-NAME"}, {"attribute": "email", "header": "X-USER-EMAIL"}, {"attribute": "groups", "header": "X-USER-GROUPS"}, {"attribute": "department", "header": "X-USER-DEPARTMENT"}, {"attribute": "id", "header": "X-USER-ID"}]'




2.	Ensure to configure livenessProbe and readinessProbe for maintaining a stable socket connection. The resource allocations can be adjusted based on your application's requirements.


Port can be according to your deployment configuration.
spec:
  containers:
  - image: <image-name>
    name: <application-name>
    resources:
      limits:
        memory: "2Gi"
        cpu: "4.0"
      requests:
        memory: "2Gi"
        cpu: "4.0"
    ports:
    - containerPort: 8080
    livenessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 20
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 20




3.	The Dockerfile commands below are used to prepare a Streamlit application for a production-ready solution. Ensure to replace app.py with the correct path to your Streamlit application file.


Port can be according to your deployment configuration.
RUN mkdir -p ~/.streamlit && echo "[browser]\ngatherUsageStats = false" > ~/.streamlit/config.toml

# Run app.py when the container launches
CMD ["python", "-m", "streamlit", "run", "--server.enableCORS", "true", "--server.enableXsrfProtection", "true", "--server.address", "0.0.0.0", "--server.port", "8080", "app.py"]




4.	Please refer the below section to understand how to enable the WebSocket connection for your ingress.



Enable WebSocket Connections
To enable the WebSocket connection in applications, Ingresses need to be annoataed. Please look at the below template which can be used to enable the WebSocket connection for your ingress.
WebSocket Connection Ingress Template:
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: <ingress-name>
  namespace: <namespace>
  annotations:
    app.lilly.com/ack-recordset.websocket.standard: "<Ingress hosts to be enabled, separated by commas (', ')>"
spec:
  rules:
  - host: <ingress-host-1>
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: <service-name>
            port:
              number: <service-port>
  - host: <ingress-host-2>
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: <service-name>
            port:
              number: <service-port>

You need to replace the placeholder values with your desired configurations. Below is an explanation of each placeholder:
Placeholder	Description
<ingress-host>	The host or domain name associated with your ingress (e.g., example.apps.lrl.lilly.com).
<service-name>	The name of the Kubernetes service to which the ingress routes traffic.
<service-port>	The port number of the Kubernetes service to which the ingress routes traffic.
<namespace>	The namespace where the ingress resource will be created.
<ingress-name>	The name of the ingress resource.
Ensure that all placeholder values are replaced with the appropriate configurations before deploying the YAML file.
Find below an example of how to enable the WebSocket connection for your ingress.
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: test-ingress
  namespace: admin-testing-dev
  annotations:
    app.lilly.com/ack-recordset.websocket.standard: "ack-one.sbx.cats.lilly.com, ack-two.sbx.cats.lilly.com"
spec:
  rules:
    - host: ack-one.sbx.cats.lilly.com
      http:
        paths:
          - path: /hello
            pathType: Prefix
            backend:
              service:
                name: test-pod
                port:
                  number: 80
    - host: ack-two.sbx.cats.lilly.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: test-pod
                port:
                  number: 5000

Find Below the set of Hosted Zone Patterns. Currently these patterns are supported to be taken off the App Runner route and directly onto loadbalancer to allow web socket connections for the hosted applications. These are separated based on clusters DEV, QA, PROD.
PROD
Hosted Zone
*.bu.lilly.com
*.gs.lilly.com
*.lrl.lilly.com
*.apps.lrl.lilly.com
*.mq.lilly.com
QA
Hosted Zone
*.qa.bu.lilly.com
*.apps-q.lrl.lilly.com
DEV
Hosted Zone
*.dev.bu.lilly.com
*.apps-d.lrl.lilly.com
*.dev.mq.lilly.com
*.dev.dc.lilly.com


Validations / Restrictions
•	The WebSocket connection is only supported for the Hosted Zone Patterns listed above. Any URL defined from the pattern outside of the above mentioned patterns will not be supported for WebSocket connection.
•	The urls defined in the annotaion app.lilly.com/ack-recordset.websocket.standard should be the part of the list of Hosts defined in the Ingress spec.


Note - Please contact CATS Team if you want your Hosted Zone Pattern listed above and enable the WebSocket Connection for the applications.



Customizing URLs
You do have the ability to customize your solutions URL if deployed on CATS. We have many options available out of the box that should fit your use case. The patterns provided are outlined below. If the team you are developing an application for does not roll up through one of our provided patterns we are open to adding more patterns. Reach out to the CATS team to explain your proposed use case. Use cases must be reusable patterns and not domains for individual solutions.
Out-Of-The-Box Options
The effort to expand the available patterns is currently on going. This section displays our current offerings.
As you know, there are three routes in the CATS cluster. Authenticated Route, Internal Route, API route. When it comes to customizing the url you want to use for each of these routes you can use the below tables to configure your URL. We have prioritized getting the Authenticated Routes (Apps) routes prioritized and into production so that application teams have access to patterns that are more suitable for the end users.
If you need to use an Internal Route or API Route you will need to continue using the lrl pattern until the new routes are available.


CURRENT OFFERINGS
Description	Domain Available
Lilly Research Laboratories	lrl.lilly.com
Global Services	gs.lilly.com
Information Security	is.lilly.com
Business Unit	bu.lilly.com
Manufacturing and Quality	mq.lilly.com
Digital Core	dc.lilly.com
Digital Health	dh.lilly.com
CATS Platform	cats.lilly.com
Cortex Initiative Backend	cortex.lilly.com
Cortex Initiative Frontend	chat.lilly.com
Lilly Research Laboratories Services
top domain	Route	DEV	QA	PROD
lrl.lilly.com	Authenticated	*.apps-d.lrl.lilly.com	*.apps-q.lrl.lilly.com	*.apps.lrl.lilly.com
lrl.lilly.com	Un-Authenticated	*.apps-internal-d.lrl.lilly.com	*.apps-internal-q.lrl.lilly.com	*.apps-internal.lrl.lilly.com
lrl.lilly.com	API Route	*.apps-api-d.lrl.lilly.com	*.apps-api-q.lrl.lilly.com	*.apps-api.lrl.lilly.com


Global Services
top domain	Route	DEV	QA	PROD
gs.lilly.com	Authenticated	*.dev.gs.lilly.com	*.qa.gs.lilly.com	*.gs.lilly.com


Information Security
top domain	Route	DEV	QA	PROD
is.lilly.com	Authenticated	*.dev.is.lilly.com	*.qa.is.lilly.com	*.is.lilly.com


Business Units
top domain	Route	DEV	QA	PROD
bu.lilly.com	Authenticated	*.dev.bu.lilly.com	*.qa.bu.lilly.com	*.bu.lilly.com


Manufacturing and Quality
top domain	Route	DEV	QA	PROD
mq.lilly.com	Authenticated	*.dev.mq.lilly.com	*.qa.mq.lilly.com	*.mq.lilly.com


Digital Core
top domain	Route	DEV	QA	PROD
dc.lilly.com	Authenticated	*.dev.dc.lilly.com	*.qa.dc.lilly.com	*.dc.lilly.com


Digital Health
top domain	Route	DEV	QA	PROD
dh.lilly.com	Authenticated	*.dev.dh.lilly.com	*.qa.dh.lilly.com	*.dh.lilly.com


CATS Platform Services
top domain	Route	DEV	QA	PROD
cats.lilly.com	Authenticated	*.dev.cats.lilly.com	*.qa.cats.lilly.com	*.cats.lilly.com


Cortex Platform's Backend Routes
top domain	Route	DEV	QA	PROD
cortex.lilly.com	Authenticated	*.dev.cortex.lilly.com	*.qa.cortex.lilly.com	*.cortex.lilly.com


Cortex Platform's Frontend Routes
top domain	Route	DEV	QA	PROD
chat.lilly.com	Authenticated	*.dev.chat.lilly.com	*.qa.chat.lilly.com	*.chat.lilly.com


________________________________________
FUTURE OFFERINGS
The following information relates to development effort that is currently in progress. Once completed we will make an announcement in cats club and update our docs.
Some of the below patterns are live in their respective environments but the tables below outline all the patterns that will be available once this effort is completed. Please see the section above for the patterns that are currently available.
When configuring your host within your ingress resource you simply need to follow our provided patterns. See some examples below for an explanation on how customizing urls works.


Lilly Research Laboratories
top domain	Route	DEV	QA	PROD
lrl.lilly.com	Authenticated	*.dev.lrl.lilly.com	*.qa.lrl.lilly.com	*.lrl.lilly.com
lrl.lilly.com	Un-Authenticated	*.internal-d.lrl.lilly.com	*.internal-q.lrl.lilly.com	*.internal.lrl.lilly.com
lrl.lilly.com	API Route	*.api-d.lrl.lilly.com	*.api-q.lrl.lilly.com	*.api.lrl.lilly.com


Global Services
top domain	Route	DEV	QA	PROD
gs.lilly.com	Authenticated	*.dev.gs.lilly.com	*.qa.gs.lilly.com	*.gs.lilly.com
gs.lilly.com	Un-Authenticated	*.internal-d.gs.lilly.com	*.internal-q.gs.lilly.com	*.internal.gs.lilly.com
gs.lilly.com	API Route	*.api-d.gs.lilly.com	*.api-q.gs.lilly.com	*.api.gs.lilly.com


Information Security
top domain	Route	DEV	QA	PROD
is.lilly.com	Authenticated	*.dev.is.lilly.com	*.qa.is.lilly.com	*.is.lilly.com
is.lilly.com	Un-Authenticated	*.internal-d.is.lilly.com	*.internal-q.is.lilly.com	*.internal.is.lilly.com
is.lilly.com	API Route	*.api-d.is.lilly.com	*.api-q.is.lilly.com	*.api.is.lilly.com


Business Units
top domain	Route	DEV	QA	PROD
bu.lilly.com	Authenticated	*.dev.bu.lilly.com	*.qa.bu.lilly.com	*.bu.lilly.com
bu.lilly.com	Un-Authenticated	*.internal-d.bu.lilly.com	*.internal-q.bu.lilly.com	*.internal.bu.lilly.com
bu.lilly.com	API Route	*.api-d.bu.lilly.com	*.api-q.bu.lilly.com	*.api.bu.lilly.com


Manufacturing and Quality
top domain	Route	DEV	QA	PROD
mq.lilly.com	Authenticated	*.dev.mq.lilly.com	*.qa.mq.lilly.com	*.mq.lilly.com
mq.lilly.com	Un-Authenticated	*.internal-d.mq.lilly.com	*.internal-q.mq.lilly.com	*.internal.mq.lilly.com
mq.lilly.com	API Route	*.api-d.mq.lilly.com	*.api-q.mq.lilly.com	*.api.mq.lilly.com


Digital Core
top domain	Route	DEV	QA	PROD
dc.lilly.com	Authenticated	*.dev.dc.lilly.com	*.qa.dc.lilly.com	*.dc.lilly.com
dc.lilly.com	Un-Authenticated	*.internal-d.dc.lilly.com	*.internal-q.dc.lilly.com	*.internal.dc.lilly.com
dc.lilly.com	API Route	*.api-d.dc.lilly.com	*.api-q.dc.lilly.com	*.api.dc.lilly.com


Digital Health
top domain	Route	DEV	QA	PROD
dh.lilly.com	Authenticated	*.dev.dh.lilly.com	*.qa.dh.lilly.com	*.dh.lilly.com
dh.lilly.com	Un-Authenticated	*.internal-d.dh.lilly.com	*.internal-q.dh.lilly.com	*.internal.dh.lilly.com
dh.lilly.com	API Route	*.api-d.dh.lilly.com	*.api-q.dh.lilly.com	*.api.dh.lilly.com


CATS Platform Services
top domain	Route	DEV	QA	PROD
cats.lilly.com	Authenticated	*.dev.cats.lilly.com	*.qa.cats.lilly.com	*.cats.lilly.com
cats.lilly.com	Un-Authenticated	*.internal-d.cats.lilly.com	*.internal-q.cats.lilly.com	*.internal.cats.lilly.com
cats.lilly.com	API Route	*.api-d.cats.lilly.com	*.api-q.cats.lilly.com	*.api.cats.lilly.com


Cortex Platform's Backend Routes
top domain	Route	DEV	QA	PROD
cortex.lilly.com	Authenticated	*.dev.cortex.lilly.com	*.qa.cortex.lilly.com	*.cortex.lilly.com
cortex.lilly.com	Un-Authenticated	*.internal-d.cortex.lilly.com	*.internal-q.cortex.lilly.com	*.internal.cortex.lilly.com
cortex.lilly.com	API Route	*.api-d.cortex.lilly.com	*.api-q.cortex.lilly.com	*.api.cortex.lilly.com
cortex.lilly.com	API Route	api.dev.cortex.lilly.com	api.qa.cortex.lilly.com	api.cortex.lilly.com


Cortex Platform's Frontend Routes
top domain	Route	DEV	QA	PROD
chat.lilly.com	Authenticated	*.dev.chat.lilly.com	*.qa.chat.lilly.com	*.chat.lilly.com
chat.lilly.com	Un-Authenticated	*.internal-d.chat.lilly.com	*.internal-q.chat.lilly.com	*.internal.chat.lilly.com
chat.lilly.com	API Route	*.api-d.chat.lilly.com	*.api-q.chat.lilly.com	*.api.chat.lilly.com


VaHub
top domain	Route	DEV	QA	PROD
apps.vahub.lilly.com	Authenticated	*.dev.apps.vahub.lilly.com	*.qa.apps.vahub.lilly.com	*.apps.vahub.lilly.com
apps.vahub.lilly.com	Un-Authenticated	*.internal-d.apps.vahub.lilly.com	*.internal-q.apps.vahub.lilly.com	*.internal.apps.vahub.lilly.com
apps.vahub.lilly.com	API Route	*.api-d.apps.vahub.lilly.com	*.api-q.apps.vahub.lilly.com	*.api.apps.vahub.lilly.com
Request New Custom Domain
If the team you are developing an application for does not roll up through one of our provided patterns we are open to adding more patterns. Reach out to the CATS team to explain your proposed use case. Use cases must be reusable patterns and not domains for individual solutions.
1.	Reach out to a member of the CATS platform team with the domain you would like created. He will then create a new Route53 Hosted-Zone and provide you with four nameservers.
2.	The Requestor will submit this service request, Telecom DDI - Global Zones and Delegated Zones, utilizing the nameservers provided by the platform team.
3.	Once completed and approved please let the Platform Team know and we will do some backend work to enable the new domain!



Ingress Patterns and Visualization
In Kubernetes environments, understanding ingress traffic routing patterns can be challenging. This guide introduces visualization tools and common patterns to help you better understand how ingress resources direct traffic to your services.
Ingress Diagram Tool
The Kubernetes Ingress Diagrams tool provides comprehensive visualization of ingress resources, services, and endpoints in your Kubernetes clusters. It automatically identifies AWS Application Load Balancer (ALB) configurations when present, clearly showing how external traffic flows through your cluster's network architecture.
Accessing the Tool
The ingress diagram visualization tool is deployed and accessible at:
•	https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com
Example Use Cases
View traffic routing for a specific namespace with endpoints:
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/diagrams?namespace=llm-dev&endpoints=true
View all ingresses with a specific host pattern:
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/diagrams?host=.*apps-d.lrl.lilly.com&endpoints=true
View specific namespaces with endpoint details:
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/diagrams?namespace=aads-legal-intakes-dev&endpoints=true
Common Ingress Patterns
The system identifies five main ingress pattern types:
1. Simple Path Routing Pattern
•	Routes all traffic to a single service
•	Has a single hostname and path
•	The simplest form of ingress configuration
•	Used when an application is served by a single backend service
Example: An ingress with one host (like app.example.com) and one path (/) pointing to a single service
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simple-path-ingress
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80

2. Host-Based Routing Pattern
•	Routes traffic based on the hostname in the request
•	Multiple hostnames route to different services
•	Allows hosting multiple applications on the same infrastructure using different domain names
•	Detected when an ingress has more than one host rule
Example: Different hosts like app1.example.com and app2.example.com routing to different backend services
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: host-based-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80

3. Path-Based Routing Pattern
•	Routes traffic based on the URL path
•	Different paths route to different services under the same hostname
•	Allows exposing multiple services under the same hostname
•	Detected when an ingress has multiple paths but only one host
Example: example.com/api goes to an API service while example.com/app goes to a frontend service
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-based-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /app
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80

4. Fanout (Multiple Services) Pattern
•	Also known as path-based fan-out
•	Routes different URL paths to different services
•	Creates a unified API gateway from multiple microservices
•	Detected when there are multiple backend services in a single ingress
Example: Routing /api/users to a user service, /api/products to a product service, etc.
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fanout-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /api/users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80
      - path: /api/products
        pathType: Prefix
        backend:
          service:
            name: product-service
            port:
              number: 80
      - path: /api/orders
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80

5. Default Backend Pattern
•	Uses a default backend with no specific routing rules
•	Used for catch-all services or fallback endpoints
•	Detected when an ingress has no rules defined
•	Provides a consistent experience for unmatched requests
Example: A generic 404 page or a service that handles all unmatched requests
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: default-backend-ingress
spec:
  defaultBackend:
    service:
      name: default-service
      port:
        number: 80

number: 80
•	host: web.example.com http: paths:
o	path: / pathType: Prefix backend: service: name: web-service port: number: 80

### 4. TLS/SSL Termination

Adding TLS certificate for secure connections:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - secure.example.com
    secretName: tls-secret
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: secure-service
            port:
              number: 80

Visualizing Ingress Flow
The following diagram shows a typical traffic flow through Kubernetes ingress:
 
Reading Diagram Elements
When using the Hangar Ingress Diagram Tool, you'll see these components:
1.	External Clients: Shown at the top, representing external traffic sources
2.	Hostnames/Domains: The domain names configured in your ingress resources
3.	ALB/Ingress Controllers: Shows AWS Application Load Balancers and ingress controllers
4.	Services: Kubernetes services that receive traffic from ingress rules
5.	Endpoints: When enabled (endpoints=true), shows the actual pods behind each service
Diagram Color Legend
•	Blue Boxes: External components (clients, hostnames)
•	Green Boxes: Kubernetes ingress resources
•	Yellow Boxes: Kubernetes services
•	Purple Boxes: Kubernetes pods/endpoints
•	Arrows: Traffic flow direction with path/port information
API Usage
For more complex scenarios, you can interact with the Ingress Diagram Tool's API:
Summary Endpoints
# Summary of all ingress resources
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/summary

# Summary filtered by namespace
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/summary?namespace=your-namespace

# Summary with endpoints data
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/summary?endpoints=true

Diagram Endpoints
# Mermaid diagrams for all ingress resources
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/diagrams

# Diagrams in Markdown format (instead of HTML)
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/diagrams?format=md

# Diagrams with limited pods displayed (default is all)
https://hangar-ingress-diagram-generator.apps-d.lrl.lilly.com/api/ingress/diagrams?max_pods=3

Troubleshooting Ingress Configurations
When troubleshooting ingress issues:
1.	Verify your ingress resource is correctly defined
2.	Check that referenced services exist in the correct namespace
3.	Confirm that service selectors match your pod labels
4.	Validate that port mappings are consistent through the chain
5.	Use the Ingress Diagram Tool to visualize the current configuration
6.	Check Ingress Controller logs if traffic isn't flowing as expected
________________________________________
For more information, contact the Hangar Team or visit the project repository.



Compute and Workload Scheduling
There are three types of provisioned nodes supported by the platform:
•	Fargate (serverless) nodes
•	Nodes via EC2 Autoscaling Groups
•	Nodes via AWS Karpenter
Services that Schedule Workloads
Fargate (planned for obsolescence in 2025)
Fargate has been the main provisioned node kind since the first release of CATS. It supports a configurable array of compute types shown here, and scales relatively well for many workloads. These nodes are managed by AWS and the CATS platform is unable to support many new upcoming services as the control of the nodes themselves are not fully available to our team. As the platform continues to expand its adoption of the AWS Karpenter node scheduler, the usage of Fargate will be reduced and eventually replaced over time.
EC2 Autoscaling Groups and Managed EKS NodeGroups
These node schedulers leverage EC2 Autoscaling Groups to provision EC2 instances that are joined to the CATS cluster. This pattern was suggested for custom EC2 node configuration from the beginning of the CATS platform through 2024. This method of provisioning compute has been mainly replaced by the features of AWS Karpenter, and existing use cases will be shifted to AWS Karpenter over time. For an up-to-date list of existing configurations, please see our infra code repo here: Click here
AWS Karpenter
This node scheduling technology will be leveraged in Q4 2024 onward and provides a comprehensive and robust scheduling tool for nodes. This is the preferred mechanism for custom nodes for application teams and additional information can be found in our AWS Karpenter documentation. The CATS platform is in an early phase of its adoption of Karpenter and does not currently support automation to enable Karpenter for scheduling. Guidance for scheduling is provided on this page in the examples.
Node Networking Configurations
On-premise Network Connected Nodes
When using this method to schedule pods, the pods themselves are not hosted on-premises but this method facilitates connections to on-prem hosted services and/or databases.
In addition to implementing the below template, please ensure that the compute annotation on your namespace is set to hybrid. See further details on how to do implement this configuration change here.
By scheduling your pod on the OnPremis node group your security policy will NOT be the default security group sg-main. Instead your pod will be a part of the sg-onprem security group. further details about these security groups and their differences can be found here.
When a pod is scheduled on the onPrem nodegroup you cannot directly talk to other resources deployed on the CATS Platform. This was a trade off we had to make to comply with security requirmeents. Please see the below diagram to better undertand how you may want to talk with other resources in your namespace.
 
Configuration Options
Configure Workload Scheduling via Namespace Annotation
To configure your namespace to use Fargate / EC2 instances, you must place the annotation: app.lrl.lilly.com/compute with a value of either serverless to allow using only Fargate OR hybrid to allow using both EC2 or Fargate. NOTE: If you chose hybrid you must label your containers to allow them to run on Fargate, while if you chose serverless all your containers will run on Fargate without special config.
NOTE on AWS Karpenter Scheduling: this feature does not automatically schedule workloads to AWS Karpenter nodes. In order to schedule to AWS Karpenter nodes, the hybrid option must be selected.
Affinities, Selectors, Tolerations, and Topologies, "Oh My!"
The Kubernetes development team provides rich documentation around concepts for workload scheduling. The CATS team does not provide active consulting or training related to leveraging these features, and it is expected that application teams wanting to use scheduling features educate themselves scheduling techniques by reading the docs posted here:
•	Assigning Pods to Nodes
o	provides information on nodeSelector usage
o	provides information on affinity and *AntiAffinity usage
•	Taints and Tolerations
o	provides information on node taints used to constrain scheduling and execution
o	provides information on tolerations used to accept node taints
Examples
Karpenter
Deployment Scheduled on General-Purpose Node
Note that a combination of spec.nodeSelector and spec.tolerations for the Pod template is required for scheduling. Example application running on EC2 within a hybrid namespace:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: 3
            memory: 40G
          requests:
            cpu: 3
            memory: 40G
        ports:
        - containerPort: 3838
      # Use node selector to specify the run environment (dev/qa/prd)
      nodeSelector:
        app.lilly.com/env: [dev|qa|prd] # **NOTE: this is different from the older `app.lrl.lilly.com/env: [dev|qa|prd]` nodeSelector label key!** 
        app.lilly.com/node-kind: general-purpose
      tolerations:
      - key: app.lilly.com/env
        value: "[dev|qa|prd]"
        effect: "NoSchedule"

Deployment Scheduled on Accelerated (GPU-enabled) Node
Note that a combination of spec.nodeSelector and spec.tolerations for the Pod template is required for scheduling. Example application running on EC2 within a hybrid namespace:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: 3
            memory: 40G
          requests:
            cpu: 3
            memory: 40G
        ports:
        - containerPort: 3838
      # Use node selector to specify the run environment (dev/qa/prd)
      nodeSelector:
        app.lilly.com/env: [dev|qa|prd] # **NOTE: this is different from the older `app.lrl.lilly.com/env: [dev|qa|prd]` nodeSelector label key!** 
        app.lilly.com/node-kind: accelerated
      tolerations:
      - key: app.lilly.com/env
        value: "[dev|qa|prd]"
        effect: "NoSchedule"
      - key: nvidia.com/gpu
        value: "true"
        effect: "NoSchedule"

Namespace Configuration
Fargate Only Namespace (serverless namespace)
Note the app.lrl.lilly.com/compute: serverless annotation on the namespace.
apiVersion: v1
kind: Namespace
metadata:
  name: your-app-namespace-dev
  labels:
    cost-center: your-apps-cost-center-id
  annotations:
    app.lrl.lilly.com/compute: serverless

EC2 or Fargate Namespace (hybrid namespace)
Note the app.lrl.lilly.com/compute: hybrid tag on the namespace annotation. The app.lrl.lilly.com/compute: serverless metadata.label for the Pod template will be required for workloads defined in this particular namespace to use Fargate.
apiVersion: v1
kind: Namespace
metadata:
  name: your-app-namespace-dev
  labels:
    cost-center: your-apps-cost-center-id
  annotations:
    app.lrl.lilly.com/compute: hybrid

Scheduling Workloads
Deployment Scheduled on Fargate in serverless Namespace
Note that app.lrl.lilly.com/compute: serverless metadata.label for the Pod template is not required in this instance as it will be applied from the namespace configuration. Template for app running on fargate inside of a serverless namespace:

apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: 1
            memory: 10G
          requests:
            cpu: 1
            memory: 10G

Deployment Scheduled on Fargate in hybrid Namespace
Note that app.lrl.lilly.com/compute: serverless metadata.label for the Pod template is required in this instance. Example application running on fargate within a hybrid namespace:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app
        app.lrl.lilly.com/compute: serverless
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: 1
            memory: 10G
          requests:
            cpu: 1
            memory: 10G

Deployment Scheduled on Default EC2 in hybrid Namespace
Note that a combination of spec.nodeSelector and spec.tolerations for the Pod template is required for scheduling. Example application running on EC2 within a hybrid namespace:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: 3
            memory: 40G
          requests:
            cpu: 3
            memory: 40G
        ports:
        - containerPort: 3838
      # Use node selector to specify the run environment (dev/qa/prd)
      nodeSelector:
        app.lrl.lilly.com/env: dev
      tolerations:
      - key: dedicated
        value: "ec2"
        effect: "NoExecute"

Deployment Scheduled on Default On-premise Connected EC2 in hybrid Namespace
Note that a combination of spec.nodeSelector and spec.tolerations for the Pod template is required for scheduling. Template for applications to follow in order to schedule nodes on the pre defined OnPrem node group:

apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.<policy-name>: "<aws-account-number>;<your-repo-name-in-ecr>;glob:<tag-pattern>"
    # Example: app.lilly.com/flux.simple.docs-policy: "283234040926;lrl_light_k8s_infra_apps_catsdocs;glob:sha-.*"
    wave.pusher.com/update-on-config-change: "true"
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: 1
            memory: 10G
          requests:
            cpu: 1
            memory: 10G
        ports:
        - containerPort: 3838
      nodeSelector:
        nodeGroup: onPremise
        app.lrl.lilly.com/env: dev
      tolerations:
      - key: nodeGroup
        value: "onPremise"
        effect: NoExecute
      - key: dedicated
        value: "ec2"
        effect: "NoExecute"


Deployment Scheduled on Custom Dedicated EC2 Instance
The following template will help users select the an existing ASG dedicated instance for their application. Note that tolerations and node selectors will depend on the particular configuration of the autoscaling group.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app-label
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app-label
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: # Specify cpus, example: 2
            memory: # Specify memory. example: 8G
            nvidia.com/gpu: # set this field to "1" if scheduling for gpus, else remove the field
          requests:
            cpu: # Specify cpu. example: 2
            memory: # Specify memory. example: 8G
            nvidia.com/gpu: # set this field to "1" if scheduling for gpus, else remove the field
      nodeSelector:
        app: [ASG app name](https://github.com/EliLillyCo/LRL_light_k8s_infra/blob/main/aws/lib/stacks/eks-nodegroups.ts)
        app.lrl.lilly.com/env: [ASG env, i.e. dev|qa|prd](https://github.com/EliLillyCo/LRL_light_k8s_infra/blob/main/aws/lib/stacks/eks-nodegroups.ts)
      tolerations: # <-- this will vary depending on the configuration of the ASG!
      - key: nvidia.com/gpu
        effect: NoSchedule
      - key: dedicated
        value: "ec2"
        effect: "NoExecute"
      - key: app
        value: [ASG taint name, typically same as ASG app name](https://github.com/EliLillyCo/LRL_light_k8s_infra/blob/main/aws/lib/stacks/eks-nodegroups.ts)
        effect: "NoExecute"





•	K8s Configuration
•	Scaling
Scaling
The documentation here is about Horizontal Scaling (scaling the number of pod replicas related to a specific deployment or stateful set).
HorizontalPodScaler
This autoscaler scales out your application when average CPU usage if more than 50% of the CPU requests, and scale in when CPU usage is below.
"The HorizontalPodAutoscaler controller operates on the ratio between desired metric value and current metric value", see the scaling algorithm for more details.
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: your-app
  namespace: your-app-namespace-dev
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: your-app
  minReplicas: 2
  maxReplicas: 6
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50

A walkthrough of HorizontalPodAutoscaler is available here: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/
Add separate node groups
Applications might have special compute need (usage of SPOT instances, GPU, or specific EC2 instance types), those can be added as customized node groups here:
https://github.com/EliLillyCo/LRL_light_k8s_infra/blob/1fb8f68fc19bea5e182a50842e77f6ed05c7dd61/aws/lib/stacks/eks-nodegroups.ts#L281-L302
Note: Work with the CATS Platform team to get these changes included in the infra stack.
Examples
A node group of dedicated instances (maximum of 5 c6i.xlarge2 on-demand instances):
addASG(this, "dev", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.C6I, ec2.InstanceSize.XLARGE2) }, { available: 0, rootVolSize: 50 }, { "app": "your-app:NoExecute" }, { "app": "your-app", "node.kubernetes.io/compute.capacity": "ON_DEMAND" }, "_your_app", availabilityZone, undefined, false, 5) // dedicated on-demand instances for your app

A node group of Spot instances (cheaper but can be interrupted, maximum of 5 c6i.xlarge2 Spot instances):
addASG(this, "dev", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.C6I, ec2.InstanceSize.XLARGE2) }, { available: 0, rootVolSize: 50 }, { "app": "your-app:NoExecute" }, { "app": "your-app", "node.kubernetes.io/compute.capacity": "SPOT" }, "_your_app", availabilityZone, 2, false, 5) // dedicated Spot instances for your app

To use the dedicated instances, you need to modify your nodeSelctor and tolerations field of your deployment pod template. An example using the above dedicated on-demand EC2 instances:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  namespace: your-app-namespace-dev
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.<policy-name>: "<aws-account-number>;<your-repo-name-in-ecr>;glob:<tag-pattern>"
    # Example: app.lilly.com/flux.simple.docs-policy: "283234040926;lrl_light_k8s_infra_apps_catsdocs;glob:sha-.*"
    wave.pusher.com/update-on-config-change: "true"
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: your-app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: your-app
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_new_app:sha-a431842 # {"$imagepolicy": "<namespace-name>:<policy-name>"}
        name: your-app
        resources:
          limits:
            cpu: 3
            memory: 40G
          requests:
            cpu: 3
            memory: 40G
        ports:
        - containerPort: 3838
      # Use node selector to specify the run environment (dev/qa/prd)
      nodeSelector:
        node.kubernetes.io/compute.capacity: ON_DEMAND
        app.lrl.lilly.com/env: dev
      tolerations:
      - key: app
        value: your-app
        effect: NoExecute
      - key: dedicated
        value: "ec2"
        effect: NoExecute




Storage
There are three main types of storage supported in CATS. The first (and recommended) is S3 object storage.
The second is EFS (NFS filesystem).
The third us EBS (block storage).
S3
See Adding Permissions to your app for more information about how to grant S3 permission
EFS
Example EFS config
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: <volume name>
  namespace: <namespace>
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 1Gi # Since this using the default EFS volume class, storage requests although required does not limit storage used.

Backups are automatically taken daily
EBS
Example EBS volume
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: <volume name>
  namespace: <namespace>
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard-block-v2

Backups must be configured
apiVersion: gemini.fairwinds.com/v1
kind: SnapshotGroup
metadata:
  name: <volume name>
  namespace: <namespace>
spec:
  persistentVolumeClaim:
    claimName: <volume name (from above)>
  schedule:
    - every: 1 hour #time interval for snapshotting
      keep: 5
    - every: 1 day #time interval for snapshotting
      keep: 10
  template:
    spec:
      volumeSnapshotClassName: csi-aws-vsc

Backup/Restore Process
EBS
To restore from backups follow this procedure (cluster CLI is required):
1.	Decide on which snapshot to restore from (time based). Snapshots can be viewed in the following dashboards:
kubectl -n <namespace> get volumesnapshots

Example
NAME                              READYTOUSE   SOURCEPVC              SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS   SNAPSHOTCONTENT                                    CREATIONTIME   AGE
data-es-cluster-v2-0-1710954169   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-5c114724-ae4f-40b3-8286-6743ea59f7c4   101m           101m
data-es-cluster-v2-0-1710954769   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-b24083af-9311-442b-9b11-d9605c72c779   91m            91m
data-es-cluster-v2-0-1710955369   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-f11deed6-1933-49d5-a311-688a1e210c94   81m            81m
data-es-cluster-v2-0-1710955969   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-a8dd1829-8256-4b01-8377-c3cd54d21144   71m            71m
data-es-cluster-v2-0-1710956569   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-c461e387-cd2d-4b92-a21c-b999d366db45   61m            61m
data-es-cluster-v2-0-1710957169   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-dcbf0b1a-9c73-4ac2-a5b4-38d19c98ffd7   51m            51m
data-es-cluster-v2-0-1710957769   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-098c3f80-8e58-46f9-8179-f645f02f12c5   41m            41m
data-es-cluster-v2-0-1710958369   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-6b047533-58ab-44af-9fb0-4e192ff6426d   31m            31m
data-es-cluster-v2-0-1710958969   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-640451e6-ac67-4f97-a54c-579321145a4a   21m            21m
data-es-cluster-v2-0-1710959569   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-58243f8a-784d-4ab9-b41a-e56aa29124f9   11m            11m
data-es-cluster-v2-0-1710960169   true         data-es-cluster-v2-0                           100Gi         csi-aws-vsc     snapcontent-9039ddfe-8553-4d76-b2f2-f9c1cda2851a   67s            68s

Select the timestamp corresponding to the snapshot to restore from. In the example above, if restoring to snapsot data-es-cluster-v2-0-1710955369 select timestamp 1710955369
2.	Scale down pods using EBS
3.	Update Snapshot restore
kubectl -n <namespace> annotate snapshotgroup <volume name> --overwrite \
  "gemini.fairwinds.com/restore=<timestamp from above>"

4.	Confirm snapshot restore
Should see namespaces in terminating state (may take a few seconds to couple minutes)
kubectl -n <namespace> get pvc

Exmaple
NAME                   STATUS        VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
data-es-cluster-v2-0   Terminating   pvc-7bc9525d-5dad-4c40-b566-d05c56582e25   100Gi      RWO            standard-block-v2   13d

Once complete, new pvc should be added with the same name & status Bound
kubectl -n <namespace> get pvc

NAME                   STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
data-es-cluster-v2-0   Bound    pvc-0e96a46e-9ace-4413-ab56-6c82c77555e6   100Gi      RWO            standard-block-v2   76s

4.	Clean annotation
kubectl -n <namespace> annotate snapshotgroup <volume name> gemini.fairwinds.com/restore-

5.	Scale back up pods using EBS
Notes:
In testing observed behavior occasionally where snapshot/backup creation controller gets into a restore loop after restoring from backup, triggering restore periodically even after already restored.
Seemed to resolve after restarting the controller, even with this backups/restore operated correctly, adding this note to note observed behavior for future investigation & perhaps upstream patch if continue to observe.
Policy on Deleting PVCs
As a general rule, the CATS Team does not delete Persistent Volume Claims (PVCs) due to the significant risks involved. Deleting a PVC can result in permanent data loss, application failures, and potential disruption to stateful workloads. In some cases, it may also leave orphaned storage volumes that are difficult to manage.
If you need a PVC to be deleted, please add it to the list below along with the date of your request. To ensure ample time for consideration, the CATS Team will wait one year before performing the deletion. This delay gives you the opportunity to change your mind, as once a PVC is deleted, all associated data will be permanently lost.
Click the pen and you can update the list below
PVC Name	Date Requested
	
	
	
	
	
	
Edit this page




Cron Job
A CronJob creates Jobs on a repeating schedule.
CronJob is meant for performing regular scheduled actions such as backups, report generation, and so on. One CronJob object is like one line of a crontab (cron table) file on a Unix system. It runs a Job periodically on a given schedule, written in Cron format.
CronJobs have limitations and idiosyncrasies. For example, in certain circumstances, a single CronJob can create multiple concurrent Jobs. See the limitations below.
When the control plane creates new Jobs and (indirectly) Pods for a CronJob, the .metadata.name of the CronJob is part of the basis for naming those Pods. The name of a CronJob must be a valid DNS subdomain value, but this can produce unexpected results for the Pod hostnames. For best compatibility, the name should follow the more restrictive rules for a DNS label. Even when the name is a DNS subdomain, the name must be no longer than 52 characters. This is because the CronJob controller will automatically append 11 characters to the name you provide and there is a constraint that the length of a Job name is no more than 63 characters.
template:
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  schedule: "* * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox:1.28
            imagePullPolicy: IfNotPresent
            command:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure


Note: A spec of ttlSecondsAfterFinished of 14400s (4 Hours) is added to every job generated in the cluster. This will result in cleanup of jobs and pods 4 hours post completion.




Jobs
A Job creates one or more Pods and will continue to retry execution of the Pods until a specified number of them successfully terminate. As pods successfully complete, the Job tracks the successful completions. When a specified number of successful completions is reached, the task (ie, Job) is complete. Deleting a Job will clean up the Pods it created. Suspending a Job will delete its active Pods until the Job is resumed again.
A simple case is to create one Job object in order to reliably run one Pod to completion. The Job object will start a new Pod if the first Pod fails or is deleted (for example due to a node hardware failure or a node reboot).
You can also use a Job to run multiple Pods in parallel.
If you want to run a Job (either a single task, or several in parallel) on a schedule, see CronJob.
Example Job
Here is an example Job config. It computes π to 2000 places and prints it out. It takes around 10s to complete.
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34.0
        command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
  backoffLimit: 4

To Run this Job you could either use a CronJob or Kubectl.
Search the infra_apps repo for examples to see how our current users are utilizing and defining Jobs resources.
Note: A spec of ttlSecondsAfterFinished of 14400s (4 Hours) is added to every job generated in the cluster. This will result in cleanup of jobs and pods 4 hours post completion.





Rate Limit
To Control the Number of Requests Going to a Service
The RateLimit middleware ensures that services will receive a fair amount of requests, and allows one to define what fair is.
It is based on a token bucket implementation. In this analogy, the average parameter (defined below) is the rate at which the bucket refills, and the burst is the size (volume) of the bucket.
Configuration Template
# Here, an average of 100 requests per second is allowed.
# In addition, a burst of 200 requests is allowed.
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: ratelimit-middleware-name
  namespace: your-namespace-name
spec:
  rateLimit:
    average: 100
    burst: 200

Configuration Options
1.	Average
average is the maximum rate, by default in requests per second, allowed from a given source.
It defaults to 0, which means no rate limiting.
The rate is actually defined by dividing average by period. So for a rate below 1 req/s, one needs to define a period larger than a second.
# 100 reqs/s
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: ratelimit-middleware-name
  namespace: your-namespace-name
spec:
  rateLimit:
    average: 100



2.	Period
period, in combination with average, defines the actual maximum rate, such as:
r = average / period

# 6 reqs/minute
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: ratelimit-middleware-name
  namespace: your-namespace-name
spec:
  rateLimit:
    period: 1m
    average: 6



3.	Burst
burst is the maximum number of requests allowed to go through in the same arbitrarily small period of time.
It defaults to 1.
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: ratelimit-middleware-name
  namespace: your-namespace-name
spec:
  rateLimit:
    burst: 100

Advanced Rate Limit Configs
For more advanced rate limit configuration options please navigate to the full documentation here: https://doc.traefik.io/traefik/middlewares/http/ratelimit/
Attach Rate Limit Middleware to Ingress
Attach your new rate limit middleware resource to your ingress via the following annotation. Be sure to update the name of your middleware to match the name defined in your middleware resource created in step 1.
annotations:
    traefik.ingress.kubernetes.io/router.middlewares: ratelimit-middleware-name





External Secrets
TIP
External Secrets V2 is now available on CATS with enhanced security and higher customizability. More instructions on setting up external secrets with the V2 operator coming soon here.
External Secrets refer to a method or a tool that allows Kubernetes to access secrets stored in external secret management systems, such as AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, or Google Secret Manager, rather than storing them directly in Kubernetes Secrets. This approach enhances security by centralizing secret management, reducing the risk of secret leakage, and enabling fine-grained access control and auditing capabilities external to Kubernetes.
AWS Secrets Manager
The CATS Platforms preferred approach is to use AWS Secrets Manager as our secret management system.
AWS Secrets Manager allows you to store a wide range of sensitive information securely. This includes:
Database Credentials: Username and password for RDS, Redshift, or other database services.
API Keys: Access keys and secret keys for AWS services or third-party APIs.
SSH Keys: Private keys for SSH access to EC2 instances.
OAuth Tokens: Tokens for accessing services like GitHub, Google, or other OAuth 2.0 secured APIs.
Encryption Keys: Private keys for encrypting and decrypting data.
Application Secrets: Configuration data, connection strings, or any other sensitive information used by your applications.
Certificates: SSL/TLS certificates for securing web traffic.
Service Account Credentials: Credentials for service accounts in different platforms or services.
Other Secrets: Any other string-based sensitive data that your application requires.
AWS Secrets Manager ensures that these secrets are securely stored and managed, providing fine-grained access control, automatic rotation, and audit logging capabilities.
Using AWS Secrets Manager
The steps to use a secret in CATS are as follows:
1.	Create AWS Secret: Using your -CA account, log into the AWS console and navigate to Secrets Manager. Here you can create a new secret. Ensure you put all the values in correctly as your account does not have permission to edit or retrieve the secret once it is set. You do have the ability to create another new secret if you mess up.
2.	Create K8s Secret: You now have a secret you can use in your solution. To get this secret into the Kubernetes Cluster you must create an external secret object and map the AWS Secrets Manager Secret to the new Kubernetes External Secret Resource.
Create AWS Secret
Using AWS Secrets manager in Lilly - https://github.com/EliLillyCo/lrl-cloud-patterns/tree/main/aws/secretsmanager
If you need to create a secret in secret manager, you can use your -CA account in CATS PRD account - prod-igw-dx-researchit-light, assuming role arn:aws:iam::283234040926:role/aws_light_devs. This role has write-only permissions on the secrets. You can only create secrets using this role. You cannot edit or retrieve secrets using this role. If you make a mistake you will need to create a new secret.
You can create the secret via the console or through code.
For reference this is the profile:
[light_prd]
aws_profile = light_prd
username = ***************** YOUR-CA-ACCOUNT ******************-ca
account = prod-igw-dx-researchit-light
account_id = 
role = aws_light_devs
entry_url = https://aws-login.am.lilly.com
role_arn = arn:aws:iam::283234040926:role/aws_light_devs
region = us-east-2
output = json
duration = 3600
note = Saved login_profile to get credentials for prod-igw-dx-researchit-light:aws_light_devs. To use this saved login_profile, use `lilly-aws-auth login light_prd`

The above code is for the production cluster. Depending on the Cluster you are working in, you will need to update your code to account for the correct account and role_arn based off of the table below:
Environment	Account	Role ARN
DEV:	dev-igw-dx-researchit-light	arn:aws:iam::408787358807:role/aws_light_devs
QA:	qa-igw-dx-researchit-light	arn:aws:iam::474366589702:role/aws_light_devs
PRD:	prod-igw-dx-researchit-light	arn:aws:iam::283234040926:role/aws_light_devs
Create K8s Secret
This section outlines how to create a Kubernetes External secret and map that secret to a secret in AWS Secrets Manager.
Here's a template:
apiVersion: kubernetes-client.io/v1
kind: ExternalSecret
metadata:
  name: your-secrets-name
  namespace: your-namespace
spec:
  backendType: secretsManager
  data:
  - key: aws_secret_name
    name: k8s_secret_key
    property: aws_secret_key
  - key: aws_secret_name
    name: k8s_secret_key2
    property: aws_secret_key2
  - key: aws_secret_name
    name: k8s_secret_key3
    property: aws_secret_key3

Here is an example live in practice:
apiVersion: "kubernetes-client.io/v1"
kind: ExternalSecret
metadata:
  name: abarp-sa-creds
  namespace: abarp-dev
spec:
  backendType: secretsManager
  data:
    - key: lrl-light-abarp-sa-creds
      name: username
      property: username
    - key: lrl-light-abarp-sa-creds
      name: password
      property: password
    - key: lrl-light-abarp-sa-creds
      name: passphrase
      property: passphrase

Configured in the code above is a Kubernetes "External Secret Resource" named abarp-sa-creds. This external secret references the secret that was created in AWS Secretes Manager named lrl-light-abarp-sa-creds. The above configuration will create the K8s secret with the specified name and keep it in sync with the AWS secret specified.
See the below example of how to reference your secret in your deployment resource:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: abarp-dev
  namespace: abarp-dev
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.abarp-dev: "283234040926;lrl_abarp;glob:abarp-develop-sha-.*"
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: abarp-dev
  template:
    metadata:
      labels:
        app.kubernetes.io/name: abarp-dev
    spec:
      containers:
      - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_abarp:abarp-develop-sha-2c4f800 # {"$imagepolicy": "abarp-dev:abarp-dev"}
        name: abarp-dev
        env:
        - name: ABARP_CERT_PASSPHRASE
          valueFrom:
            secretKeyRef:
              name: abarp-sa-creds
              key: passphrase
        - name: ABARP_SA_USERNAME
          valueFrom:
            secretKeyRef:
              name: abarp-sa-creds
              key: username
        - name: ABARP_SA_PASSWORD
          valueFrom:
            secretKeyRef:
              name: abarp-sa-creds
              key: password
        ports:
        - containerPort: 3001
        resources:
          limits:
            memory: "1Gi"
            cpu: "0.25"
          requests:
            memory: "1Gi"
            cpu: "0.25"

Full documentation on how this works can be found here.
Referencing Secret In An External AWS Account
If performing a cross account secret access, create a role (with the appropriate secret manager permissions) in the source account & allow the AWS role arn:aws:iam::283234040926:role/light-infra-stack-LightClusterLightInfraServiceAcc-ZTULM7KFYCFC assume role permission. This will allow the external secrets controller access to assume into the source account role & fetch the secret from the source account.
The above example uses the production account role. If you are working in the QA or Dev cluster then see the table below to find the correct role arn for your use case:
Environment	Role ARN
DEV:	arn:aws:iam::408787358807:role/light-infra-stack-LightClusterLightInfraServiceAcc-3GAJR7QUTINT
QA:	arn:aws:iam::474366589702:role/light-infra-stack-LightClusterLightInfraServiceAcc-1GC05W554VJY
PRD:	arn:aws:iam::283234040926:role/light-infra-stack-LightClusterLightInfraServiceAcc-ZTULM7KFYCFC
Once this is configured, you must specify the role you create in your ExternalSecret config as below:
apiVersion: kubernetes-client.io/v1
kind: ExternalSecret
metadata:
  name: test
  namespace: test
spec:
  backendType: secretsManager
  roleArn: <your role arn>
  data:
  - key: some_aws_secret
    name: k8s_secret_key
    property: aws_secret_key
  - key: some_aws_secret
    name: k8s_secret_key2
    property: aws_secret_key2
  - key: some_aws_secret2
    name: k8s_secret_key3
    property: aws_secret_key3



External Secrets V2
To enhance the customizability and security of external secrets management within the CATS platform, an upgrade has been made on the external secrets operator, resulting in a new operator that targets ExternalSecret resources in a separate API Group (external-secret.io).
Use Cases and Patterns
The External Secret operator V2 supports the following use cases/patterns with higher customizability and enhanced security:
1.	Same AWS account secrets management (supported by V1)  
2.	Cross AWS account secrets management (supported by V1)  
3.	Kubernetes secret/token management with integration to AWS Secret Manager  
Setting up External Secrets with V2 Operator
The V2 external secret controller uses a new SecretStore custom resource to handle configuration with an external secret management provider (i.e., AWS Secrets Manager) to locate the appropriate external secrets. Here is an example of a SecretStore that targets the AWS Secrets Manager of the same AWS account that the cluster is being deployed:
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secretstore
  namespace: <namespace-name>
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-2

After setting that up, you can then create a new ExternalSecret object that references the newly created SecretStore as follows:
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: <external-secret-name>
  namespace: <namespace-name>
spec:
  dataFrom:
  - extract:
      key: <aws-secrets-manager-secret-name>
  refreshInterval: 10s
  secretStoreRef:
    kind: SecretStore
    name: aws-secretstore
  target:
    creationPolicy: Owner
    deletionPolicy: Retain

Custom External Secret Templates and Configuration
The external secrets operator V2 provides enhanced customization and flexibility for configuring secrets through Templating. For more information, please refer to the official documentation from external secrets operator here.
Push Kubernetes Secret to AWS Secrets Manager
External Secrets Operator V2 supports bidirectional synchronization with the PushSecret resource, allowing you to push Kubernetes secrets to AWS Secrets Manager. This is useful for sharing secrets with other systems or backing up Kubernetes secrets.
Here's a template for pushing a Kubernetes secret to AWS Secrets Manager:
apiVersion: external-secrets.io/v1alpha1
kind: PushSecret
metadata:
  name: <push-secret-name>
  namespace: <namespace>
spec:
  # Replace: Overwrite the entire secret if it exists
  # Merge: Update existing keys and add new ones
  updatePolicy: Replace

  # None: Do not delete the remote secret when the PushSecret is deleted
  # Delete: Delete the remote secret when the PushSecret is deleted
  deletionPolicy: None
  refreshInterval: 10s
  secretStoreRefs:
    - name: <your-secret-store>
      kind: SecretStore
  selector:
    secret:
      name: <kubernetes-secret-name>
  data:
    # For each key in your Kubernetes secret you want to push
    - match:
        secretKey: <kubernetes-secret-key>
        remoteRef:
          remoteKey: <aws-secrets-manager-secret-name> # Path in AWS Secrets Manager
          property: <property-name>    # Key within the AWS secret

Example use case: After creating database credentials with Crossplane or another provider, you can push these credentials to AWS Secrets Manager for use by other applications:
apiVersion: external-secrets.io/v1alpha1
kind: PushSecret
metadata:
  name: db-credentials-pushsecret
  namespace: app-namespace
spec:
  updatePolicy: Replace
  deletionPolicy: None
  refreshInterval: 15s
  secretStoreRefs:
    - name: aws-secretstore
      kind: SecretStore
  selector:
    secret:
      name: db-credentials
  data:
    - match:
        secretKey: endpoint
        remoteRef:
          remoteKey: app/database/credentials
          property: endpoint
    - match:
        secretKey: password
        remoteRef:
          remoteKey: app/database/credentials
          property: password
    - match:
        secretKey: username
        remoteRef:
          remoteKey: app/database/credentials
          property: username

This configuration will push the endpoint, password, and username keys from the db-credentials Kubernetes secret to an AWS Secrets Manager secret at the path app/database/credentials.



External Integrations
Integrating with External AWS Accounts is possible. See our examples below.
Research Data & EDB API (DWS)
Research Data & EDB APIs can always be accessed from app backends by passing the Lilly-Authorization header provided by CATS with every request to the Research Data & EDB APIs in the Authorization header.
If your app has no backend or you would rather call these APIs directly from the frontend, CATS has a direct integration with these APIs.
Each app has a reserved path _apps_system which is used for system APIs.
Within this reserved path is the Research Data & EDB API integration https://<YOUR APP HOST>/_apps_system/researchdata/prd/<API PATH>
E.g. https://indigo-d.apps.lrl.lilly.com/_apps_system/researchdata/prd/chembl/v3.0/version The request will be proxied to https://api.data.lrl.lilly.com/chembl/v3.0/version with the current users credentials.
This is achieved by Bouncer service: https://github.com/EliLillyCo/LRL_light_k8s_infra_bouncer/blob/main/routes/researchData.js


Legacy Heroku Pattern
CATS runs within the VPC of an AWS DX account and is therefore an endpoint on Lilly's private network. See the below table to understand how each CATS Cluster maps to an AWS Account and how each AWS Account maps to a VPC.
Cluster	App Deployment Repo	AWS Account Name	AWS Account ID	VPC Access
Production Cluster	infra_apps
prod-igw-dx-researchit-light	283234040926	vpc-03bee17f69c9802b9
QA Cluster	infra_apps_qa
qa-igw-dx-researchit-light	474366589702	vpc-058757a9c034d181c
Development Cluster	infra_apps_test
dev-igw-dx-researchit-light	408787358807	vpc-069388414a9f87f40
Heroku is external to Lilly and therefore can't reach CATS.
When deploying routes on the apps-api route in cats (example: aads-edb-fapi-qa.apps-api-q.lrl.lilly.com) this route is an RFC 1918 10.x private IP that isn't routable on the public Internet.
You can have a public-Internet facing endpoint published for your API in Enterprise Data's Azure API Management service, allowing your app to reach your APIs with Cybersecurity-approved controls for the public Internet via the Lilly private network bridge.


Cross AWS Account Resource connections
See documentation here on connecting to AWS resources that are housed in a non-CATS AWS account.




Graph User Info
Graph User Info is information about a user that is stored and accessible through a Graph API, such as the Microsoft Graph API or any other graph-based data structure or service. Graph APIs are designed to provide a comprehensive and relational way to interact with a network of data, entities, and their interconnections, often used within platforms like social networks, directory services, and organizational data systems.
Builtin Graph User Info Integration
As Authentication & Authorization are first class platform constructs, basic User info is also available to all apps hosted in the platform as a native integration.
The way this works is, you can add annotations to your app ingress resources which will tell the platform to inject headers into each request to your app with the information of the requesting user.
User Info Headers
The main way this can be done is with the lilly.com/user_info_headers.
The value of the annotation is a json list of headers to pass to your app. Each header config is as follows {"attribute": "{user info attribute}", "header": "{header sent in requests to your app with the value of the user info attribute specified}"}
The following user info attributes are allowed:
User Info Attribute	Description
id	Lilly System ID (e.g. c233707)
title	Position Title (e.g. Sr. Developer)
department	Lilly Department (e.g. Research IT)
groups	A comma separated list of the users's AD groups (e.g. group1,A second group,AnotherGroup)
name	Display Name. User's full name given + surname (e.g. Nathan Morin)
email	User's email address (e.g. morin_nathan_a@lilly.com)

NOTE: In your ingress configuration, array values within the annotations MUST be enclosed in single quotes if they are single-line strings.
Example config below:
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: myapp-dev
  namespace: myapp-dev
  annotations:
    lilly.com/user_info_headers: '[{"attribute": "id", "header": "X-WEBAUTH-USER"}, {"attribute": "name", "header": "X-USER-NAME"}, {"attribute": "email", "header": "X-WEBAUTH-EMAIL"}, {"attribute": "groups", "header": "X-WEBAUTH-GROUPS"}]'
spec:
  rules:
  - host: example-app.apps.lrl.lilly.com
    http:
      paths:
      ... your backend ...

How to Request OAuth Token
To access the OAuth Bearer Token of the logged-in user, add the following annotation to your ingress configuration for both your frontend and backend:
Example of ingress.yml for frontend
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nalo-ai-chat-frontend-app
  namespace: nalo-ai-chat-dev
  annotations:
    lilly.com/security_groups: |
      [
        {
          "Route": "/",
          "ADGroups": [ "NALO_AI_Chat_Bot" ]
        }
      ]
    lilly.com/oauth_token_headers: '{"cats-app-auth": "self"}' # This annotation will allow the application to include the OAuth Token of the authenticated user in the Headers of the application URL that can retrieved with logic in the application.
    traefik.ingress.kubernetes.io/router.middlewares: ingress-entry-compression@kubernetescrd
    lilly.com/user_info_headers: '[{"attribute": "name", "header": "X-USER-NAME"}, {"attribute": "email", "header": "X-USER-EMAIL"}, {"attribute": "groups", "header": "X-USER-GROUPS"}, {"attribute": "department", "header": "X-USER-DEPARTMENT"}, {"attribute": "id", "header": "X-USER-ID"}]'
spec:
  rules:
    - host: nalo-ai-chat-dev.mq.lilly.com
      http:
        paths:
          - path: "/"
            pathType: Prefix
            backend:
              service:
                name: nalo-ai-chat-frontend-app
                port:
                  number: 8501

Example Ingress configuration for a FastAPI backend, including the cats-app-auth header to ensure the /docs page functions correctly:
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nalo-ai-chat-backend-docs
  namespace: nalo-ai-chat-dev
  annotations:
    lilly.com/oauth_token_headers: '{"cats-app-auth": "self"}'
spec:
  rules:
  - host: nalo-ai-chat-backend-dev.mq.lilly.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nalo-ai-chat-backend
            port:
              number: 8080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nalo-ai-chat-backend-api
  namespace: nalo-ai-chat-dev
  annotations:
    lilly.com/oauth_token_headers: '{"cats-app-auth": "self"}'
spec:
  rules:
  - host: nalo-ai-chat-backend-d.apps-api.lrl.lilly.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nalo-ai-chat-backend
            port:
              number: 8080

Retrieving Headers
To retrieve these headers within a streamlit application run the following line:
headers = _get_websocket_headers()

The headers should look something like this:
{
  "Host": "nalo-ai-chat-dev.apps.lrl.lilly.com",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Cats-App-Auth": "<Auth Token>",
  "Connection": "Upgrade",
  "Cookie": "_ga_TS73L2KX2T=GS1.1.1719493790.1.1.1719495178.0.0.0; _ga_C7J840KQ0S=GS1.1.1720807459.1.0.1720807502.0.0.0; _gid=GA1.2.1089996773.1721046313; _ga_WKTRG6FDF2=GS1.1.1721148600.41.1.1721148619.41.0.0; _ga=GA1.1.1545315391.1719358932; _ga_F4QPGPB1JD=GS1.1.1721165301.17.1.1721165305.0.0.0;",
  "Origin": "https://nalo-ai-chat-dev.apps.lrl.lilly.com",
  "Pragma": "no-cache",
  "Sec-Websocket-Extensions": "permessage-deflate; client_max_window_bits",
  "Sec-Websocket-Key": "+Xw37oq+yAJlEYIsJ5eeAA==",
  "Sec-Websocket-Protocol": "streamlit, PLACEHOLDER_AUTH_TOKEN",
  "Sec-Websocket-Version": "13",
  "Upgrade": "websocket",
  "X-Amzn-Oidc-Accesstoken": "<Auth Token>",
  "X-Amzn-Trace-Id": "Root=1-6696ec2c-0bc0cdfe36eb784c7f18cf12",
  "X-Forwarded-For": "40.36.4.112, 10.121.223.83, 10.121.235.77",
  "X-Forwarded-Host": "nalo-ai-chat-dev.apps.lrl.lilly.com",
  "X-Forwarded-Port": "443",
  "X-Forwarded-Proto": "https",
  "X-Forwarded-Server": "traefik-ingress-controller-5f8d7b65c8-82f8n",
  "X-Real-Ip": "10.121.235.77",
  "X-User-Department": "GSP and NALO Tech@Lilly",
  "X-User-Email": "nikhilanand.dhoka@lilly.com",
  "X-User-Groups": "Microsoft365_Licensing_Copilot,_IAM_USE_ONLY-Employees,aws_nalo_read,CA_Rings_NewAccounts,FIM_MDM_PRD_INTUNE_AS_PRIMARY,IAM_AAD_StagedRollout_Standard,CertAE,Lilly_Employees,OPSD_General_User,FIM_MDM_PRD_AW_ManagedUsers,ProofPoint-PSATv2 ...",
  "X-User-Id": "L074473",
  "X-User-Name": "Nikhil Anand Dhoka"
}

To retrieve the OAuth Token, run the following command:
auth_token = headers.get("Cats-App-Auth")

Calling Cortex API
To call the Cortex API within your application on CATS, follow these steps:
1.	Retrieve the OAuth Token as outlined above.
2.	If your frontend retrieves this token from the header, send the OAuth Token to the backend before hitting the Cortex API. Example of Calling backend from Streamlit Application:
url = f"http://nalo-ai-chat-backend:8080/sendQuery" #The url for your backend be constructed via following pattern: http:/<Backend Service Name>:<Port on which the service is running>/sendQuery
rq = requests.Session()
response = rq.post(url, data=data, headers={"auth-token": auth_token})

3.	On the backend, retrieve this bearer token to call the Cortex API. FAST API example:
from fastapi import Request, Form
import requests

@app.post("/sendQuery")
async def send_query(request: Request, query: str = Form(...), chatThreadSessionId: str = Form(...), modelConfig: str = Form(...)):
    auth_token = request.headers.get('auth-token')
    CORTEX_BASE = "https://api.cortex.lilly.com"
    rq = requests.Session()
    MODELS = {
        "gpt4-turbo": {
            "model_class": "lilly-openai",
            "model_iteration": 4
        }
    }
    params = MODELS.get("gpt4-turbo")
    json_data = {
        "q": query,
        "model_session_id_param": chatThreadSessionId,
        "stream": False
    }
    result = rq.post(f"{CORTEX_BASE}/ask/{modelConfig}", params=params, json=json_data, headers={"Authorization": f'{auth_token}'})

Edit this page





Makefile
A Makefile is a file used by the make utility, a standard build automation tool available on Unix/Linux systems and environments that can emulate Unix toolchains. The purpose of a Makefile is to define a set of tasks to be executed. These tasks can include compiling source code into binary executables, cleaning up temporary files, installing software to system directories, and more. It essentially allows developers to automate the repetitive aspects of the build process.
The structure of a Makefile includes rules, dependencies, and actions:
Rules: These indicate when and how to remake certain files, which are the targets of the rule. A rule specifies the dependencies of the target and the commands to execute when the target needs to be updated.
Dependencies: These are files that the target depends on; if any dependency is newer than the target, the commands associated with that target will be executed.
Actions: These are the commands that make executes in order to update the target file. Actions are usually shell commands.
Makefile Template
Here's a an example of what a Makefile might look like:

# =======================================
# Makefile for YOUR-APP-NAME
# =======================================

# Shell to use for running scripts
SHELL := /bin/bash

# Detect operating system
OSFLAG :=
ifeq ($(OS),Windows_NT)
	$(error Please use Windows Subsystem for Linux)
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		OSFLAG += LINUX
		MAKEFLAGS += -j$(shell nproc)
	endif
	ifeq ($(UNAME_S),Darwin)
		OSFLAG += DARWIN
	endif
endif

# Default values for variables
DOCKER_TAG ?= latest
IMAGE_NAME ?= your_app_name
ECR_REPOSITORY ?= 123456789012.dkr.ecr.us-east-2.amazonaws.com/$(IMAGE_NAME)

# =======================================
# Setup and Development Targets
# =======================================

.PHONY: setup ci_setup ci_unit_tests setup_test test dev clean refresh_dev

setup: ## Setup the project environment
	@echo Setting up the project...

# CI/CD Targets
ci_setup: ## Setup CI environment
	$(MAKE) build

ci_unit_tests: test ## Run unit tests in CI

# Testing Targets
setup_test: setup ## Prepare environment for testing
	@echo Setting up test environment...

test: setup_test ## Run tests locally
	npm run test

# Local Development Targets
dev: setup ## Prepare local development environment
	npm run dev

clean: ## Clean the local development environment
	@echo Cleaning up...

refresh_dev: clean dev ## Refresh the local development environment

# =======================================
# Docker Operations
# =======================================

.PHONY: build up down aws_login cats_dev_ecr_login cats_dev_ecr_tag cats_dev_ecr_push cats_dev_ecr_build_and_push

build: ## Build Docker image
	docker build -t $(IMAGE_NAME):$(DOCKER_TAG) .

up: ## Start Docker containers
	docker-compose up -d

down: ## Stop Docker containers
	docker-compose down

# =======================================
# CATS DEV Cluster Development
# =======================================

aws_login: ## Log in to AWS
	AWS_CONFIG_FILE=.aws/config AWS_PROFILE=default aws sso login --no-browser

cats_dev_ecr_login: ## Log in to ECR
	aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $(ECR_REPOSITORY)

cats_dev_ecr_tag: ## Tag Docker image for ECR
	docker tag $(IMAGE_NAME):$(DOCKER_TAG) $(ECR_REPOSITORY):$(DOCKER_TAG)

cats_dev_ecr_push: cats_dev_ecr_tag ## Push Docker image to ECR
	docker push $(ECR_REPOSITORY):$(DOCKER_TAG)

cats_dev_ecr_build_and_push: build cats_dev_ecr_push ## Build and push Docker image to ECR

# =======================================
# Helper Targets
# =======================================

.PHONY: help

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Allow overriding of targets
%: %-default
	@true
Template Breakdown
This Makefile is structured to facilitate various development, testing, CI/CD, and Docker operations for an application. It's divided into several sections, each with a specific focus. Here's a breakdown:
Preamble and Setup
Shell Specification
•	SHELL := /bin/bash sets the default shell for executing commands to Bash. This ensures that Bash-specific syntax and utilities can be used reliably.
Operating System Detection
•	This block checks the operating system where the Makefile is running. It sets an OSFLAG variable based on the OS detected (LINUX or DARWIN for macOS). If Windows is detected, it errors out, suggesting the use of Windows Subsystem for Linux (WSL) instead. This section is crucial for ensuring that the Makefile behaves correctly across different environments.
Default Variables
•	Sets default values for DOCKER_TAG, IMAGE_NAME, and ECR_REPOSITORY using the ?= operator. This allows these variables to be overridden externally without modifying the Makefile.
Targets and Phony Targets
.PHONY
•	This special target lists other targets that are not associated with files. It ensures that the listed targets are always executed even if files with those names exist.
Setup and Development Targets
•	setup: Initializes the project environment.
•	ci_setup, ci_unit_tests: Define Continuous Integration (CI) setup and testing procedures.
•	setup_test, test: Prepare for and run tests locally.
•	dev, clean, refresh_dev: Targets for managing local development environments.
Docker Operations
•	build, up, down: Commands for building Docker images and managing container state.
CATS DEV Cluster Development
AWS and ECR Login
•	Targets for authenticating with AWS and the Elastic Container Registry (ECR), necessary for pushing Docker images to AWS ECR.
o	aws_login: Logs in to AWS using the specified profile.
o	cats_dev_ecr_login: Logs in to AWS ECR to enable pushing Docker images.
o	cats_dev_ecr_tag, cats_dev_ecr_push, cats_dev_ecr_build_and_push: Manage tagging and pushing Docker images to ECR.
Helper Targets
•	A self-documenting feature that parses the Makefile and displays a help message detailing available targets and their descriptions. It uses awk to extract comments following the ## marker. This target makes it easier for users to understand and use the Makefile without digging through its contents manually.
Overriding Pattern Rule
%: %-default
•	This rule allows for dynamic target names and is a placeholder for future extensions. It doesn't do anything by default (@true is a no-operation command), but it sets up a convention where targets can have -default versions that can be overridden.
Edit this page

Previous




Velero Kubernetes Backup System - Deployment & Usage Guide
Overview
Velero is a backup solution for Kubernetes that enables you to back up and restore cluster resources, persistent volumes, and perform disaster recovery. This document provides an overview of the infrastructure code used to deploy and configure Velero, as well as common commands for managing backups.
Key Files and Components
1. LRL_light_k8s_infra/aws/lib/services/velero.ts
This is the main TypeScript file responsible for deploying Velero to the Kubernetes cluster. It includes:
•	Namespace: Creates a namespace called backup for all Velero resources
•	ServiceAccount Creation: Defines a Kubernetes ServiceAccount named velero in the backup namespace
•	IAM Role Setup: Creates an AWS IAM Role with the necessary permissions to access S3 for storing backups and manage EBS snapshots
•	ArgoCD Application Configuration: Defines the ArgoCD Application that deploys and manages the Velero Helm chart
•	Default Backup Schedule: Configures a daily backup schedule running at 1:00 AM
2. LRL_light_k8s_infra/aws/config/accountDetails.ts
Contains environment-specific configuration for Velero, including:
•	S3 Bucket Names: Defines the S3 buckets for each environment where backups are stored:
o	sbx: "lly-velero-backups-sbx-dev"
o	dev: "lly-light-velero-backups-dev"
o	qa: "lly-light-velero-backups-qa"
o	prd: "lly-light-velero-backups-prd"
3. IAM Role with Permissions
Creates an AWS IAM Role with policies to:
•	Manage EBS snapshots and volumes:
o	ec2:DescribeVolumes
o	ec2:DescribeSnapshots
o	ec2:CreateTags
o	ec2:CreateVolume
o	ec2:CreateSnapshot
o	ec2:DeleteSnapshot
•	Access the S3 bucket for storing backups:
o	s3:AbortMultipartUpload
o	s3:GetObject
o	s3:DeleteObject
o	s3:PutObject
o	s3:ListMultipartUploadParts
o	s3:ListBucket
o	Plus a separate statement with broader s3:* permissions
4. Kubernetes Resources Created
When deployed, the following Kubernetes resources are created:
1.	Namespace: backup
2.	ServiceAccount: velero in the backup namespace
3.	IAM Role: velero-s3-backup-role with necessary permissions
4.	BackupStorageLocation: Defines where backups are stored in S3
5.	VolumeSnapshotLocation: Defines where volume snapshots are stored (AWS)
6.	Schedule: Daily backup schedule at 1:00 AM
7.	Deployment: Velero server
8.	DaemonSet: Velero node-agent for handling volume snapshots
5. Configuration Settings
Notable configuration values:
•	Backup TTL: 240 hours (10 days)
•	Operation Timeout: 4 hours
•	Default Storage Location: AWS S3
•	Schedule: Daily at 1:00 AM
•	Excluded Namespaces: kube-system, velero
•	AWS Region: us-east-2
•	Resource Requests/Limits:
o	Requests: 750m CPU, 256Mi memory
o	Limits: 2000m CPU, 1024Mi memory
•	Node Selector:
o	kubernetes.io/os: linux
o	app.lilly.com/compute: node
o	app.lilly.com/system-service: true
AWS Resources Used
1.	S3 Bucket: Environment-specific buckets for storing backup data
2.	IAM Roles:
o	IAM Role for service account (IRSA)
o	AWS permissions for S3 access and EBS snapshots
3.	EBS Snapshots: For persistent volume backups
Installation Process
1.	Prerequisite: Ensure you have:
o	Access to the AWS account
o	Kubectl access to the Kubernetes cluster
o	The appropriate S3 bucket created in AWS
o	Proper IAM permissions
2.	Deployment Method:
o	Velero is deployed through ArgoCD as defined in the velero.ts file
o	The code creates:
	AWS IAM role with appropriate permissions
	Kubernetes service account linked to the IAM role
	ArgoCD application that deploys the Velero Helm chart
3.	Verification:
o	CATS Support can verify the installation with: kubectl get pods -n backup
o	Check the status of the Velero deployment: kubectl get deployment -n backup velero
o	Verify the backup schedule: kubectl get schedule -n backup
Creating Backups and Restores via GitOps
Important: End users do not have direct kubectl or Velero CLI access. All backup and restore operations must be performed using GitOps through manifest files in the repository.
Creating Backups
To create a backup for your application, you need to add a Velero Backup manifest to the projects-managed-assets directory structure:
1. Directory Structure
Create your backup configuration in:
projects-managed-assets/{environment}/{your-app}-backups/
Example: projects-managed-assets/qa/livedesign-qa-backups/
2. Backup Manifest Example
# File: projects-managed-assets/qa/myapp-qa-backups/velero-backup.yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: qa-myapp-pvc-backup
  namespace: backup  # Must be 'backup' namespace
spec:
  # Target namespace to backup
  includedNamespaces:
  - myapp-qa
  
  # Target specific PVCs using label selectors
  labelSelector:
    matchLabels:
      app.kubernetes.io/instance: myapp  # Adjust to match your PVC labels
  
  # Backup configuration
  snapshotVolumes: true
  defaultVolumesToFsBackup: false
  snapshotMoveData: false
  csiSnapshotTimeout: 10m
  volumeSnapshotLocations:
  - aws
  
  # Retention policy
  ttl: 240h0m0s  # 10 days
  
  # Storage location
  storageLocation: aws
3. Identifying Your PVC Labels
Before creating a backup, identify the labels on your PVCs that should be backed up. Common label patterns:
•	app.kubernetes.io/instance: {app-name}
•	app.kubernetes.io/name: {component-name}
•	app: {app-name}
Ask CATS Support to help identify the correct labels for your PVCs using:
kubectl get pvc -n {your-namespace} --show-labels
4. Deployment Process
1.	Create the directory structure and backup manifest
2.	Commit your changes to the repository
3.	Push to your branch and create a pull request
4.	ArgoCD will automatically deploy the backup resource
5.	Velero will process the backup and create snapshots
5. Verification
Ask CATS Support to verify your backup was created successfully:
kubectl get backup.velero.io -n backup
kubectl describe backup.velero.io {your-backup-name} -n backup
Creating Restores
Similar to backups, restores are created via manifest files:
1. Restore Manifest Example
# File: projects-managed-assets/qa/myapp-qa-backups/velero-restore.yaml
apiVersion: velero.io/v1
kind: Restore
metadata:
  name: qa-myapp-restore-20250619
  namespace: backup
spec:
  # Source backup to restore from
  backupName: qa-myapp-pvc-backup
  
  # Optional: restore to different namespace
  # namespaceMapping:
  #   myapp-qa: myapp-qa-restored
  
  # Optional: include only specific resources
  # includedResources:
  # - persistentvolumeclaims
  # - persistentvolumes
  
  # Optional: exclude specific resources
  # excludedResources:
  # - events
2. Restore Process
1.	Create the restore manifest in the same directory as your backup
2.	Commit and push the changes
3.	Monitor the restore progress with CATS Support
4.	Verify restored resources are functioning correctly
Backup Schedules
For regular automated backups, create a Schedule resource:
# File: projects-managed-assets/qa/myapp-qa-backups/velero-schedule.yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: qa-myapp-daily-backup
  namespace: backup
spec:
  # Cron schedule (daily at 2 AM)
  schedule: "0 2 * * *"
  
  template:
    includedNamespaces:
    - myapp-qa
    labelSelector:
      matchLabels:
        app.kubernetes.io/instance: myapp
    snapshotVolumes: true
    storageLocation: aws
    ttl: 240h0m0s
Directory Structure Examples
Single Application Backup
projects-managed-assets/
  qa/
    myapp-qa-backups/
      velero-backup.yaml
      velero-schedule.yaml
Application with Multiple Backups
projects-managed-assets/
  qa/
    myapp-qa-backups/
      database-backup.yaml
      files-backup.yaml
      daily-schedule.yaml
      weekly-schedule.yaml
Working Example
See the complete working example at:
•	Repository: LRL_light_k8s_infra_apps_qa
•	Path: projects-managed-assets/qa/livedesign-qa-backups/
•	Files:
o	velero-backup.yaml - Manual backup configuration
o	VELERO-BACKUP-GUIDE.md - Implementation guide
Important Notes
1.	Namespace Requirement: All Velero resources (Backup, Restore, Schedule) must be created in the backup namespace
2.	GitOps Only: Users cannot run Velero CLI commands - all operations via manifest files
3.	CATS Support: Contact CATS Support for verification, troubleshooting, and manual operations
4.	Label Selectors: Critical to get the right label selectors to target your PVCs correctly
5.	Testing: Always test restore procedures in non-production environments first
CATS Support Commands (Reference Only)
The following commands are available to CATS Support team members with cluster access:
Backup Operations (CATS Support Only)
# Check backup status
velero backup describe <backup-name> --namespace backup

# View backup logs
velero backup logs <backup-name> --namespace backup

# List all backups
velero backup get --namespace backup

# Manual backup creation (if needed)
velero backup create <backup-name> --include-namespaces=<namespace> --snapshot-volumes --namespace backup
Restore Operations (CATS Support Only)
# Check restore status
velero restore describe <restore-name> --namespace backup

# View restore logs
velero restore logs <restore-name> --namespace backup

# List all restores
velero restore get --namespace backup

# Manual restore creation (if needed)
velero restore create --from-backup=<backup-name> --namespace backup
Schedule Management (CATS Support Only)
# List backup schedules
velero schedule get --namespace backup

# View schedule details
velero schedule describe <schedule-name> --namespace backup

# Delete a schedule (if needed)
velero schedule delete <schedule-name> --namespace backup
Storage Location Management (CATS Support Only)
# View backup storage locations
velero backup-location get --namespace backup

# Check backup storage location status
velero backup-location describe aws --namespace backup
System Status (CATS Support Only)
# Check Velero server status
kubectl get deployment -n backup velero

# Check Velero server logs
kubectl logs deployment/velero -n backup

# Check Velero client version
velero version

# Verify backup resources
kubectl get backup.velero.io -n backup
kubectl get restore.velero.io -n backup
kubectl get schedule.velero.io -n backup
Best Practices
1.	Use GitOps Approach: Always create backups and restores via manifest files in projects-managed-assets
2.	Label Selectors: Carefully choose label selectors to target the correct PVCs
3.	Test Restores: Periodically test the restore process in non-production environments
4.	Descriptive Names: Use clear, descriptive names for backup and restore resources
5.	Environment Separation: Keep environment-specific backups in their respective directories
6.	Documentation: Document your backup strategy and recovery procedures
7.	Retention Policy: Adjust the backup TTL based on your requirements (default: 10 days)
8.	Monitor via CATS Support: Work with CATS Support to monitor backup job success/failure
9.	PVC Labels: Ensure your application's PVCs have consistent, meaningful labels
10.	Disaster Recovery Plan: Document the complete restore procedure for disaster recovery scenarios
Troubleshooting
For End Users
1.	Backup Not Created:
o	Verify your manifest is in the correct directory: projects-managed-assets/{env}/{app}-backups/
o	Ensure the backup namespace is set to backup
o	Check that your label selectors match your PVCs
o	Contact CATS Support to verify ArgoCD deployment status
2.	Restore Not Working:
o	Verify the source backup name exists and is completed
o	Check namespace mappings if restoring to different namespace
o	Ensure target namespace exists or will be created
o	Contact CATS Support for restore verification
3.	Label Selector Issues:
o	Ask CATS Support to help identify correct PVC labels: kubectl get pvc -n {namespace} --show-labels
o	Common patterns: app.kubernetes.io/instance, app.kubernetes.io/name, app
o	Test with a small subset of resources first
For CATS Support
1.	Failed Backups:
o	Check the backup logs: velero backup logs <backup-name> --namespace backup
o	Verify IAM permissions for the Velero service account
o	Check S3 bucket accessibility
o	Verify label selectors match actual PVC labels
2.	Failed Restores:
o	Check the restore logs: velero restore logs <restore-name> --namespace backup
o	Verify that the backup exists and is in a completed state
o	Check for namespace conflicts or resource validation errors
o	Verify target namespace exists or can be created
3.	Storage Issues:
o	Verify the backup storage location is accessible: velero backup-location describe aws --namespace backup
o	Check the S3 bucket permissions and accessibility
o	Ensure the bucket exists in the correct AWS region (us-east-2)
o	Verify IAM role has proper S3 permissions
4.	Volume Snapshot Issues:
o	Verify that the EBS snapshots are being created in AWS console
o	Check the VolumeSnapshotLocation configuration
o	Ensure the IAM role has the necessary EC2 snapshot permissions
o	Check for EFS volumes (cannot be snapshotted via CSI)
5.	ArgoCD Deployment Issues:
o	Check ArgoCD application sync status: kubectl get application system-services.qa.projects-managed-assets -n argocd
o	Verify manifest syntax and structure
o	Check for validation errors in ArgoCD UI or logs
Edit this page

Previous



Namespace Deletion Process for GitOps Environment
Overview
Deleting a namespace in our GitOps setup isn't just "delete files and redeploy." There are data, dependencies, and cleanup considerations that need to be handled properly.
Pre-Deletion Checklist
Data Impact
•	Check for persistent volumes that contain important data
•	Identify any databases or stateful services
•	Review secrets that might need to be preserved elsewhere
External Dependencies
•	AWS resources created by the namespace (other aws resources)
•	Services in other namespaces that depend on this one
•	External integrations, APIs, or webhooks
•	DNS entries and ingress routes
Backup Requirements
•	Export any data that needs to be preserved
•	Document manual configurations not stored in Git
•	Save connection strings, certificates, or other critical info
Deletion Steps
1. Remove GitOps files from the repository
•	Delete the entire namespace directory from the repo
•	Commit and push the changes
2. Wait for ArgoCD/Flux to sync
•	Monitor the sync process in ArgoCD UI
•	Most resources should delete automatically
3. Handle stuck resources (if needed)
•	Some resources might get stuck due to finalizers
•	Persistent volumes might need manual cleanup
•	External secrets or webhooks could block deletion
4. Clean up external resources
•	Remove AWS IAM policies and roles if namespace-specific
•	Clean up DNS entries if needed
•	Remove monitoring alerts and dashboards
•	Update any external service configurations
Common Gotchas
•	Persistent volumes don't always delete with the namespace
•	External secrets can cause hanging finalizers
•	Admission controllers can block namespace deletion
Rollback Plan
If something goes wrong, we can restore by:
1.	Reverting the Git commit
2.	Letting GitOps recreate the resources
3.	Restoring data from backups if needed
NOTE
This process assumes the namespace is fully managed through GitOps. Manual kubectl changes or external resource creation outside of Git would need additional cleanup steps




S3 Lifecycle Management with Object Tagging
Overview
Our S3 buckets are configured with automatic lifecycle rules that manage object expiration and storage transitions based on object tags. This system helps control storage costs and ensures temporary files are cleaned up automatically.
How the Lifecycle Rules Were Created
The S3 lifecycle rules are deployed using AWS Controllers for Kubernetes (ACK) through our infrastructure-as-code setup. The rules are defined in LRL_light_k8s_infra/aws/lib/services/ack_s3_bucket_with_lifecycle.ts and deployed via the EKS cluster configuration in eks-cluster.ts.
Infrastructure Components
•	Rule Definition: The getStandardLifecycleRules() function in ack_s3_bucket_with_lifecycle.ts defines all lifecycle rules as hardcoded configurations
•	Deployment: Rules are deployed as ACK S3 Bucket resources in the kube-system namespace with names like ack-s3-lifecycle-{env}-{index}
•	Management: The system uses bucket adoption to manage existing S3 buckets without recreating them
Adding New Lifecycle Rules
To add a new expiration rule:
1.	Update the rule definition in ack_s3_bucket_with_lifecycle.ts:
{
  id: "expire-in-days-60",
  status: "Enabled",
  filter: {
    tag: {
      key: "hangar.lilly.com/ExpireInDays",
      value: "60",
    },
  },
  expiration: {
    days: 60,
  },
}
2.	Deploy the changes through the normal CDK deployment process - the ACK controller will update the bucket lifecycle configuration
3.	Update this documentation to include the new tag value in the available rules table
WARNING
Lifecycle rule changes affect all objects in the bucket. Test new rules in sandbox environment first.
How It Works
The lifecycle management system applies rules to objects based on their tags. When you upload files to S3, you can tag them to specify how long they should be retained before automatic deletion.
Available Lifecycle Rules
Automatic Expiration Tags
Use the hangar.lilly.com/ExpireInDays tag to set automatic deletion:
Tag Value	Retention Period	Use Case
1	1 day	Temporary files, debug logs
7	7 days	Short-term artifacts, test data
30	30 days	Build artifacts, temporary backups
Default Behavior (No Tags)
Objects without expiration tags will:
•	Move to Intelligent Tiering immediately (cost optimization)
•	Keep old versions for 35 days before deletion
•	Never expire automatically
Tagging Examples
AWS CLI
# Upload with 7-day expiration
aws s3 cp myfile.txt s3://lly-light-dev/myfile.txt \
  --tagging "hangar.lilly.com/ExpireInDays=7"

# Add tags to existing object
aws s3api put-object-tagging \
  --bucket lly-light-dev \
  --key myfile.txt \
  --tagging 'TagSet=[{Key=hangar.lilly.com/ExpireInDays,Value=30}]'
Boto3 (Python)
import boto3

s3 = boto3.client('s3')

# Upload with tags
s3.put_object(
    Bucket='lly-light-dev',
    Key='myfile.txt',
    Body=b'file content',
    Tagging='hangar.lilly.com/ExpireInDays=7'
)

# Add tags to existing object
s3.put_object_tagging(
    Bucket='lly-light-dev',
    Key='myfile.txt',
    Tagging={
        'TagSet': [
            {
                'Key': 'hangar.lilly.com/ExpireInDays',
                'Value': '30'
            }
        ]
    }
)
Best Practices
Choose the Right Retention Period
•	1 day: Debug logs, temporary processing files
•	7 days: CI/CD artifacts, test outputs
•	30 days: Build artifacts, temporary backups
•	No tag: Permanent files, application data
Tag Consistently
•	Always use the full tag key: hangar.lilly.com/ExpireInDays
•	Use only the supported values: 1, 7, or 30
•	Tag objects at upload time when possible
Monitor Your Usage
•	Review S3 storage metrics regularly
•	Check for objects that should be tagged but aren't
•	Verify lifecycle rules are working as expected
Common Gotchas
•	Case sensitivity: Tag keys and values are case-sensitive
•	Timing: Lifecycle rules run daily, not immediately
•	Versioning: Old versions follow separate retention rules (35 days)
•	Partial matches: Only exact tag values trigger rules
Troubleshooting
Objects Not Expiring
1.	Check the tag key is exactly hangar.lilly.com/ExpireInDays
2.	Verify the tag value is 1, 7, or 30
3.	Remember lifecycle rules run once daily
4.	Check object creation date vs. expected expiration
Unexpected Deletions
1.	Review object tags before upload
2.	Check if objects were tagged accidentally
3.	Verify lifecycle rule configuration in AWS console
NOTE
This lifecycle management only applies to the Light platform buckets. Objects in other S3 buckets may have different lifecycle policies or no automatic cleanup.
Edit this page
















Intoduction To Dashboards
•	Ingress Dashboard (Traefik): Simplify the management of external access to your services with a versatile Ingress controller, featuring a user-friendly dashboard for easy configuration.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	Deployment Dashboard (Automated CI/CD via Argo ): Embrace the principles of GitOps for continuous integration and deployment, automating your pipeline for increased efficiency and reliability.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	Grafana Observability Dashboards (Prometheus/Loki/Jaeger): Monitor your application's health and performance with detailed metrics visualized through Grafana, powered by Prometheus's robust monitoring capabilities.
o	Production Environment Dashboard
o	Qa Environment Dashboard
o	Dev Environment Dashboard
•	Tracing Dashboard (Jaeger): Monitor your applications requests through microservice architectures. Find bottlenecks in your applications requests by comparing tracing information.
o	Production Environment Dashboard
o	Qa Environment Dashboard
o	Dev Environment Dashboard
•	Cost Monitoring (Kubecost): Keep your cloud expenses in check with detailed insights into your Kubernetes costs, helping you optimize resource allocation and spending.
o	Dev Environment Dashboard
o	Qa Environment Dashboard
o	Production Environment Dashboard
•	Fargate Logging Dashboard (OpenObserve): Access and analyze logs from your legacy fargate applications. This is a deprioritized service and will not receive dedicated support.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
•	Kubernetes Dashboard: Gain insights and manage your Kubernetes resources with an intuitive, web-based user interface. This is the most important dashboard for the average user. Please try accessing one of the links below, if you do not have access to the dashboard you can request access via the Developer Front Door. After being added to the group it will take around 24 hours for the changes to be reflected on your end.
o	Production Environment Dashboard
o	QA Environment Dashboard
o	Dev Environment Dashboard
Table of Contents
Dashboard Offering	Description
Overview
General overview of the dashboard offerings available on the CATS platform, including monitoring and management tools.
Argo Deployment Dashboard
Provides a visual interface for tracking and managing Argo CD deployments, offering insight into the deployment status and health.
Metrics Dashboard
Grafana. Monitors application health and performance through Prometheus-powered metrics visualized in Grafana.
Cost Monitoring Dashboard
Kubecost. Provides detailed insights into Kubernetes costs to help optimize resource allocation and manage spending effectively.
Ingress Dashboard
Traefik. Versatile Ingress controller with a user-friendly dashboard for managing external access to applications.
Logging Dashboard (Depricated)
Centralized dashboard (OpenObserve) for viewing and analyzing application and infrastructure logs. Please use Grafana features and datasources instead of this dashboard.
Kubernetes Dashboard (Depricated)
The old web-based interface for real-time insights and management of Kubernetes resources and workloads. Please use Argo instead of this dashboard.
Edit this page

Previous
S3 Lifecycle Tagging




Argo Deployment Dashboard
The Argo CD dashboard provides a comprehensive and user-friendly web interface that allows users to manage and monitor their applications' deployment process in Kubernetes clusters efficiently.
•	DEV Cluster Dashboard
•	QA Cluster Dashboard
•	PROD Cluster Dashboard
Views Available
Tree View

When navigating to the dashboard you will land on the "Applications" page. On this page you can see all the "applications" or namespaces that are within the cluster you are working in. Security is set so that you should only see the namespaces associated with you.
After selecting an application tile it will open the resource tree associated with the namespace. Here you can see all the resources associated with your namespace and how they roll up to the top level "application" resource.
On the Cards representing each of your resources you can see some visual cues that provide immediate visual feedback on the state of your resources, if they are synced, OutOfSynce, progressing, healthy or failed and more! Understand what each icon means by expanding the sidebar on the left.
Click into individual resources to find more details and logs on specific resources.

Pod View

This view displays all the pods associated with your application and allows you to group them via different filters:
•	Node
•	Parent Resource
•	Top Level Resources
To open a specific pod you should hover over the green checkbox. Details around the individual pod will appear and allow you to better understand which pod you are selecting. To look at the full description of the pod click the green checkbox.
When clicking into a pod you can see three tabs, Summary, Events, and Logs.
Summary: Includes the latest manifest that is deployed and active in the cluster. Here you can ensure you have configured the resource correctly and that your most recent configurations are live in the cluster.
Events: This section is where startup events are logged. If your resource is having trouble deploying, this is where you will see those errors. For pods you may see issues around pulling an image or node scheduling issues here. Issues on this side often indicate there is an issue on the resource configuration side of your deployment. Look through our troubleshooting Docs to see if the error you are facing has a solution documented.
Logs: This section includes the pod logs. These are the logs that are produced by the pod itself after starting up successfully. Errors in this section usually indicate there is an issue on the application side of your deployment.

Network View

Use this view to troubleshoot network ingresses Ensure everything is connected as anticipated Selecting an ingress opens up the configuration and you can ensure your host is working. Use this to figure out where is the missing connection.
The Network View can be helpful to users who are troubleshooting ingress routes as they show the flow of network traffic from ingress resources through a service to the pod that the service is pointing to. Breaks in this flow likely indicate a configuration issue on one or both of the indicated resources.
You can use this view to verify the network flow is implemented as you intend. When selecting an ingress resource card you can see two options, Summary and Events.
Summary: Includes the latest manifest that is deployed and active in the cluster. Here you can ensure you have configured the ingress resource correctly and that your most recent configurations are live in the cluster.
Events: This section is where start up events are logged. If your ingress is having trouble deploying this is where you will find the errors. Issues on this side often indicated there is an issue on the resource configuration side of your deployment. Look through our troubleshooting docs to see if the error you are facing has a solution documented.

List View

This view is a basic view that lists out all of the individual resources that are a part of your application. This is a table of all your items in a single location. If you know what you are looking for this may be a fast way to jump directly to the resource you are searching for.

Sidebar
On the left side of the screen you can find the side bar. You may need to expand it if you do not see all of the options.
FILTERS
Depending on what view you have selected you can use the filters in the Sidebar to filter what resources are displayed in your main view. You can also find the definitions for the different icons that appear on your resource cards to give you visual feedback.
SYNC STATUS:
Whether or not the live state matches the target state. Is the deployed application the same as Git says it should be? If correctly applied status is Synced. If not correctly applied Out of Sync.

HEALTH STATUS:
•	Healthy - the resource is healthy
•	Progressing - the resource is not healthy yet but still making progress and might be healthy soon
•	Degraded - the resource is degraded
•	Suspended - the resource is suspended and waiting for some external event to resume (e.g. suspended CronJob or paused Deployment)
•	Missing - the resource is missing but Argo CD believes it should still exist.
•	Unknown - Argo does not know the health status of the resource.

Refresh Resources
Use the Refresh Resources button at the top of your view to get the most up-to-date manifests from github and execute a diff on manifests active in the cluster and current in github. This will allow you to know if your resources are in sync or not.
Refresh: Fetches the latest manifests from git and compares diff.
Hard Refresh: Argo CD caches the manifests, and a hard refresh will invalidate this cache.
Sync Resources
Sync: Executing a sync reconciles the current cluster state with the target state in git.
Out of Sync Status: Resources become out of sync when Argo detects a difference between the active manifest in the cluster and the current manifest detected in github.
You can fix Out of sync resources by using the Argo Dashboard's Sync function. There are two ways to sync Out of Sync resources, by either syncing individual resources that are out of sync or syncing the entire project.
Sync All Resources in your Project
1.	When in the Tree View and looking at all of your projects resource cards, click the Sync Button at the top
2.	Depending on the issue that you are facing causing the out of synSelect one of the following options
o	Prune: Remove Objects that are dangling. Trim Off the stuff that should not be there anymore. Remove everything with a trash can icon.
o	Dry Run: Give you a chance to try out the action before actually doing it.
o	Apply Only: It will not create new objects but will only update existing options.
o	Force: Makes changes and disregards potential errors
3.	Select a Prune Propagation Policy
o	Foreground: In this policy, when you delete an object, the deletion process enters a "foreground deletion" state. First, the object is marked as "deleting" by setting its metadata.deletionTimestamp field, which signals that the object is in the process of being deleted. The system then deletes all the dependent objects (those that specify the object as an owner in their metadata.ownerReferences). The original object is only removed after all its dependents are deleted. This policy is useful when you need to ensure that all dependent resources are cleanly and completely removed before the primary object is deleted.
o	Background: When using the background deletion policy, after you delete the primary object, it is immediately removed. However, the garbage collector will then asynchronously clean up all dependent objects in the background. This means the primary object gets deleted first without waiting for its dependents to be deleted. This policy is useful for quicker deletions of the primary object while not needing to manage the cleanup process yourself.
o	Orphan: With the orphan deletion policy, when you delete an object, its dependents are not deleted. Instead, they are "orphaned," meaning they will remain in the cluster but will no longer have an owner. This policy is useful if you want to delete an object but keep its dependents running, possibly to attach them to another parent object later.
4.	Select which resources to Synchronize in the Synchronize Resources Section
o	All: Selecting All will apply the change to all of the resources in your application.
o	Out of Sync: Selecting Out Of Sync will apply the change to all of the resources with the Out of Sync status.
o	None: Selecting None will deselect all resources.
o	Manual Selection: You also have the option to scroll through and manually check the boxes for the resources you want to apply the change to.

Sync One Resource in your Project
1.	Expand the Resource Card that is out of sync
2.	In the top right corner you will see the sync button, click it
3.	Depending on the issue that you are facing causing the out of synSelect one of the following options
o	Prune: Remove Objects that are dangling. Trim Off the stuff that should not be there anymore. Remove everything with a trash can icon.
o	Dry Run: Give you a chance to try out the action before actually doing it.
o	Apply Only: It will not create new objects but will only update existing options.
o	Force: Makes changes and disregards potential errors
4.	Select a Prune Propagation Policy
o	Foreground: In this policy, when you delete an object, the deletion process enters a "foreground deletion" state. First, the object is marked as "deleting" by setting its metadata.deletionTimestamp field, which signals that the object is in the process of being deleted. The system then deletes all the dependent objects (those that specify the object as an owner in their metadata.ownerReferences). The original object is only removed after all its dependents are deleted. This policy is useful when you need to ensure that all dependent resources are cleanly and completely removed before the primary object is deleted.
o	Background: When using the background deletion policy, after you delete the primary object, it is immediately removed. However, the garbage collector will then asynchronously clean up all dependent objects in the background. This means the primary object gets deleted first without waiting for its dependents to be deleted. This policy is useful for quicker deletions of the primary object while not needing to manage the cleanup process yourself.
o	Orphan: With the orphan deletion policy, when you delete an object, its dependents are not deleted. Instead, they are "orphaned," meaning they will remain in the cluster but will no longer have an owner. This policy is useful if you want to delete an object but keep its dependents running, possibly to attach them to another parent object later.
5.	Select which resources to Synchronize in the Synchronize Resources Section
o	All: Selecting All will apply the change to all of the resources in your application.
o	Out of Sync: Selecting Out Of Sync will apply the change to all of the resources with the Out of Sync status.
o	None: Selecting None will deselect all resources.
o	Manual Selection: You also have the option to scroll through and manually check the boxes for the resources you want to apply the change to.
Get Logs
In order to find the logs from your pods you will need to navigate to the pod you are looking for and open it up to find the logs tab.
You can navigate to the pod via its resource card through the tree view or to the pod through the pod view outlined above
Once you have the pod resource you want opened you should see three tabs, Summary, Events, and Logs
Note: When you view logs from a resource that is the parent of multiple resources then all of the logs of the resources that roll up to the resource you are viewing will be included in the logs.
Get Events
In order to find the events on a resource navigate to your preferred view and open the desired resource. Once open navigate to the events section.
The Events section is where start up events are logged. If your resource is having trouble deploying, this is where you will see those errors. For pods you may see issues around pulling an image or node scheduling issues here. Issues on this side often indicated there is an issue on the resource configuration side of your deployment. Look through our troubleshooting docs to see if the error you are facing has a solution documented.
Restart Resource
The following instructions will help you restart a deployment or a deamonset. You may only restart your deployments and deamonsets. You cannot restart individual pods and must restart the parent deployment resource.
Option 1:
1.	Expand the Deployment Resource Card that you would like to restart.
2.	In the top right corner you will see the three dots, click the three dots and the restart button will appear.
Option 2:
1.	When viewing all of the resources within your project/namespace in the Tree View of the argo dashboard find the deployment resource you would like to restart.
2.	Without expanding the resource card click the three dots. In the dropdown you will find the restart button. Click it to restart.
Exec into Pod
The following instructions will help you exec into a pod within your namespace.
1.	Expand the specific Pod Resource Card that you would like to exec into.
2.	In the top right corner you will see the three dots, click the three dots and the exec button will appear. Click the button to get into the pod!
Delete Resource
There is a delete button. This button will delete your selected resource. We suggest you do not click this button. According to how we have permissions set, this button should not work for you anyways!
Use at your own risk!

More Info
For more infomration on Argo and how it works in the CATS cluster please nagivate here
Edit this page




Grafana
Grafana is a leading open-source analytics and monitoring platform that provides users with powerful visualization capabilities for their metrics, logs, and traces. Integrated seamlessly with our Prometheus metrics scraper, Loki logging querier, and Jaeger tracing tool, Grafana allows teams to create custom dashboards that present data in an intuitive and visually appealing manner. With its wide range of visualization options, including graphs, charts, and tables, users can easily track performance trends, identify anomalies, and gain actionable insights into their applications and infrastructure. Grafana also supports alerting functionalities, enabling teams to set up notifications based on specific conditions, ensuring timely responses to potential issues. As an essential component of our observability stack, Grafana empowers users to explore their data effectively and make informed decisions to enhance system reliability and performance.
Use Grafana In CATS
There are a selection of pre-built dashboards allowing you to view the most common key metrics, application logs, and network tracing for your CATS deployed applications. Usually these dashboards will serve most use cases, however if a custom alert or dashboard is needed by your team, please see their respective sections on this page for more details.
Prequisites
To start utilizing Grafana for your applications, you must have the following criteria:
•	Metrics: any kubernetes resource in your namespace
•	Logs: you must have your pod scheduled on a karpenter node for the promtail daemonset to provision you a log scraper. Pleae consult the Karpenter documentation for more information.
•	Tracing: any ingress resource in your namespace
Cluster Overview
Cluster Overview dashboard shows a general overview of total resource quantity and usage clusterwide and by namespace. Notice the dashboard navigations built into the cluster overview and the grafana resource sidebar to navigate to the other dashboards.
 
 
Namespaces Dashboard
This dashboard displays a list of namespace scoped pods, their status, and what resources they are utilizing.
Loki Tools-log Dashboard
Using the namespace/pod selector, if the container you are looking at is running on a Karpenter node you will automatically be provisioned a logs scraper via Promtail. Therefore, the containers stdout application logs will be transformed into structured logs and will be visible in the logs section of the app dashboard.
 
As applications dump many logs, there is also the ability to search through the logstream utilizing the following search window, it accepts generic strings.
 
Resulting in all logs containing the string error:
 
Expanding the individual log, there will now be grouped structured log fields that are exposed. You can add to the structured logging by writing more detailed logs in your applications.
 
Pod Stats and Info Dashboard
Please utilize the following selectors to select the namespace, pod, container to view, there are various metrics exposed and visualized throughout the coming dashboards, these are some examples.
 
•	Network Usage: Monitor the network traffic and bandwidth usage of your application.
 
•	RAM Usage: Track the memory consumption to ensure your application is running efficiently.
 
•	Health: Get an overview of the application's health status, including any critical alerts or issues.
 
•	CPU Usage: Analyze the CPU utilization to identify any performance bottlenecks.
 
App Dashboard
Navigating to the App Dashboard will show a comprehensive dashboard for visualizing application resources and logs; it is a combination of all of the above mentioned dashboards with an extra panel for Jaeger Tracing.
Jaeger Tracing
There is one more key service of the observability stack that has not been mentioned, and that is visualizing network information with Jaeger tracing. Tracing as a concept will be covered more in depth in Jaeger.
The following screenshots illustrate a basic workflow of using Jaeger in Grafana to trace and analyze your application's hops across a distributed system:
1.	Jaeger Service: Start by selecting the service you want to trace.
 
2.	Trace Search: Use the trace search functionality to find specific traces based on various criteria.
 
3.	Trace Entry: View the entry point of the trace to understand where the request originated.
 
4.	Client View: Analyze the client view to understand what client made the request.
 
5.	Trace Forward: Follow the trace forward to see how the request propagates through different services.
 
Grafana Alerts
Grafana Alerts enhance our observability stack by providing real-time notifications based on specific conditions within your metrics and logs. We have integrated Grafana alerts with popular communication platforms such as Slack and Microsoft Teams, allowing teams to receive instant updates on critical performance issues, anomalies, or threshold breaches directly in their preferred messaging channels. This integration ensures that relevant team members stay informed and can respond promptly to potential incidents, improving overall responsiveness and reducing downtime. Custom alert rules can be configured based off the below template:
Alerts Template

#We have to establish a heirarchy of contact points for the alerts to be sent to the right teams

kind: ConfigMap
apiVersion: v1
metadata:
  name: grafana-alerting-contact-points
  namespace: monitoring-configs
  labels:
    grafana_alert: "2"
data:
  grafana-alerting-contact-points.yaml: |-
    apiVersion: 1
    policies:
      - orgId: 1
        receiver: catsAlerts
        group_by:
          - grafana_folder
          - alertname
        routes:
          - receiver: catsAlerts
            matchers:
              - grafana_folder = system_services
          - receiver: myAlertsTest
            matchers:
              - grafana_folder = myAlertFolder
    contactPoints:
      - orgId: 1
        name: myAlertsTest
        receivers:
          - uid: my-test-alert
            type: teams
            settings:
              username: grafana_bot
              url: my-teams-webhook
              message: |
                {{ template "my_teams.message" . }}
              title: |
                {{ template "my_teams.subject" . }}
    templates:
      - orgId: 1
        name: my_teams.message
        template: |
          Alert: {{ .CommonLabels.alertname }}
          {{ if .CommonAnnotations.description }}
          Description: {{ .CommonAnnotations.description }}
          {{ end }}
      - orgId: 1
        name: my_teams.subject
        template: |
          {{ define "my_teams.subject" }}
           MY ALERTS
          {{ end }}
Create Custom Dashboard
We are excited to provide a new and enhanced way for our customers to create their own personalized dashboards. The old metrics-edit method has been depricated and been replaced by the following process.
Grafana Organizations
In Grafana, an organization is a logical grouping of users, dashboards, and data sources. It is a way to segment and manage access to resources within a Grafana instance. By using organizations, you can effectively partition a Grafana setup for different teams, departments, or use cases within a single installation. The CATS team utilizes the organizations feature to provide a workspace for each individual application team.
Default Orgs
•	Main Org: This is the default organization for all users. In this location you will find prebuilt dashboards that are applicable to all application teams.
•	Editor Org: This org is the equivelent of our old Metrics-Edit space. Anyone can use this org by default to build and save dashboards. The dashboards in this location will not be wiped and are persistent. Feel free to exirement and create as much as you want in this org. All users have edit permissions on this org so if you want to lock down your dashboard you will need to request the creation of a new organization specifically for your team.
Request Org Creation
Please submit a request to the CATS Platform team in order for us to create you an organization so that you can get started building your Dashboards.
1.	Navigate to our ServiceNow ticket submission page
2.	Select a Platform or Application = CATS Platform
3.	Issue Type = Request for Information
4.	Title = "Grafana Org Creation"
5.	Description = "My team would like an org created for us in Grafana. We would like to designate "Admin's Name" as the administrator for our organization. We would like "Organization Name" to be the name our our organiztion.
Selecting your Org
There is a known grafana based bug when trying to use the org selector button in the top left of your screen, we encourage users to avoid using this selector.
To select an organization click on your profile picture on the top right of the screen and then go to your profile.
 
Once on your profile page scroll down to the bottom of the menu and you will see the list of orgs you are a part of. Select the org you want to open
 
Managing Your Org
Each organization has an initial Administrator designated upon creation.
You can manage the member of your org by clicking on the three bars in the top left corner and selecting "Administration". Note, Please ensure you are in the organization you want to manage when going to this tab.
 
Next got to "Users and Access" and click on "Organization users". This will display all of the users who have access to your org and allow you to specify the permissiosn they have while in your organization.
 
To invite more users simply click "Invite" this will allow you to invite a new user via their email. If the user has already logged into the metrics dashboard before you will be able to look them up by username.
 
How to create a Dashboard
Once you have your organization set up it is very straight forward to set up a dashboard. Ensure you have the desired org open by following the instructions outlined above. You can create a dashboard either in your personal org OR within the Editor Org. Remember, if you create a dashboard in the Editor Org, all users will be able to both see the dashboard, and edit it further if they want to.
1.	Simply navigate to the top left and click on the three lines, and select the Dashboard option
 
2.	Next you simply need to click on "New Dashboard" or "Create dashboard" button to get started
 
3.	click "Add Visualization" to begin adding a something to display the metrics.
 
4.	Select your datasource. You will see "Prometheus" available to use out of the box. You have the ability to add additional data sources if you desire.
5.	Once you are happy with your creation be sure to SAVE your dashboard or else you will lose your hard work!
Official Documentation
Full details on Grafana can be found on their Official Documentation Site.
Edit this page






AWS Services and Resource Overview
The CATS Platform allows users to leverage a wide range of AWS services to support their deployments. You have three options for integrating AWS services with your CATS deployments:
1.	Utilize Services in the CATS AWS Account Access the services already available in the CATS-managed AWS account.
2.	Stand Up a new AWS account seperate from other solutions Stand up your own AWS account, provision resources there, and establish cross-account communication with CATS to integrate these services into your deployments.
3.	Connect to Existing AWS Accounts If you already have resources in a separate AWS account, you can connect and use them within CATS by configuring cross-account communication.
The resources/services available to be used in the CATS AWS Accounts are:
•	Bedrock
•	ECR
•	RDS
•	S3 storage via Cloud Browser
•	Secrets Manager
If you wish to use a service not listed above, you’ll need to configure a cross-account connection to link your resources with the CATS platform. For detailed guidance on how to set this up, refer to our cross-account configuration instructions here.
Table of Contents
AWS Service	Description
Overview
General overview of how to utilize AWS services with the CATS platform, including options for resource integration.
AWS Bedrock
Fully managed service to integrate high-performance foundation models from top AI companies for generative AI applications.
AWS ECR Credential Service
Automates the provisioning of ECR repositories and refreshes credentials to enable seamless integration with GitHub.
AWS RDS Databases
Managed relational databases, including PostgreSQL, for use within your CATS deployment, ensuring reliable and scalable storage.
AWS S3 Cloud Browser
Provides a user-friendly interface for managing AWS S3 buckets, simplifying storage interactions.
AWS Secrets Manager
Securely stores, manages, and retrieves secrets such as API keys and database credentials, with integration into Kubernetes via External Secrets.
AWS VPC
Virtual Private Cloud for managing secure networking and isolation of resources in the AWS cloud, tailored for CATS deployments.
Cross Account AWS Connections
Guide on establishing secure cross-account connections to link AWS resources outside the CATS AWS account to your deployment.
AWS Bedrock Overview
Amazon Bedrock is a fully managed service that streamlines the integration and utilization of high-performing foundation models (FMs) from top AI companies, including Amazon, for building generative AI applications. This service offers a unified API through which users can access a wide selection of foundation models to best fit their specific needs. Additionally, Amazon Bedrock provides a comprehensive set of capabilities necessary for developing generative AI applications with a focus on security, privacy, and the principles of responsible AI, making it a versatile tool for businesses and developers aiming to harness the power of AI in their operations.

Before utilizing any of the Bedrock Models please review the following:
•	Please review the Responsible Use of AI guidelines outlined by AI at Lilly. These guidelines can be found here: Responsible Use of AI.
•	You may proceed with development using green data only. However, for production and for the use of higher sensitive data, please ensure that you have an approved AI use case. To request approval for an AI use case please follow the process outlined in the AI Hub.
Models Available
Bedrock Models are available in the following CATS AWS Accounts:
•	prod-igw-dx-researchit-light 283234040926
•	qa-igw-dx-researchit-light 474366589702
•	dev-igw-dx-researchit-light 408787358807

Bedrock Models are ONLY available in the following Regions:
•	Europe (Frankfurt)
•	US West (Oregon)
•	Europe (Paris)
•	Asia Pacific (Tokyo)
•	Asia Pacific (Singapore)
•	Asia Pacific (Sydney)
•	US East (N. Virginia)
Note: We suggest using the region closest to you.

US East (N. Virginia) Models Available in Production Account 283234040926:
There are currently 35 models avaialable for us via the CATS Platform.

Model Name	Access Status
AI21 Labs	
Jurassic-2 Ultra	Access granted
Jurassic-2 Mid	Access granted
Jamba 1.5 Mini	Available to request
Jamba 1.5 Large	Available to request
Jamba-Instruct	Available to request
Amazon	
Titan Embeddings G1 - Text	Access granted
Titan Text G1 - Lite	Access granted
Titan Text G1 - Express	Access granted
Titan Text G1 - Premier	Access granted
Titan Text Embeddings V2	Access granted
Titan Image Generator G1 v2	Access granted
Titan Image Generator G1	Access granted
Titan Multimodal Embeddings G1	Access granted
Anthropic	
Claude 3.5 Sonnet	Access granted
Claude 3 Opus	Access granted
Claude 3 Sonnet	Access granted
Claude 3 Haiku	Access granted
Claude	Access granted
Claude Instant	Access granted
Cohere	
Command	Access granted
Command Light	Access granted
Embed English	Access granted
Embed Multilingual	Access granted
Command R	Available to request
Command R+	Available to request
Meta	
Llama 3.2 1B Instruct	Access granted
Llama 3.2 3B Instruct	Access granted
Llama 3.2 11B Vision Instruct	Access granted
Llama 3.2 90B Vision Instruct	Access granted
Llama 3 8B Instruct	Access granted
Llama 3 70B Instruct	Access granted
Llama 2 Chat 13B	Access granted
Llama 2 Chat 70B	Access granted
Llama 2 13B	Access granted
Llama 2 70B	Access granted
Mistral AI	
Mistral 7B Instruct	Access granted
Mixtral 8x7B Instruct	Access granted
Mistral Large (24.02)	Access granted
Mistral Small (24.02)	Access granted
Stability AI	
SDXL 1.0	Access granted

To see the models available in other regions and environments:
1.	Log into the account associated with the environment you are working in. When logging in select the aws_light_devs role. In order to log in you will need a -CA account and have the aws_light_devs role. To get this role you can request access via the Developer Front Door
2.	Select the region you would like to work in. This option is at the top of the screen on the right side.
3.	Navigate to the AWS Bedrock service by searching "Amazon Bedrock" in the search box at the top of the screen.
4.	Click the orange "Get started" button.
5.	On the left side of the screen select "Model access" to see the full list of models that are available. If a model is not available that you want to use please reach out to Cole Thomas and he will work with you to get it enabled.
Getting Started
Add Bedrock Policy to Namespace
Namespace Policy Template:
To get started using AWS Bedrock models you will need to add the following policy to the namespace you are working in.
apiVersion: v1
kind: Namespace
metadata:
  name: <your-namespace>
  labels:
    cost-center: <your-cost-center>
  annotations:
    app.lrl.lilly.com/compute: <serverless> / <hybrid>
    app.lrl.lilly.com/aws-role.lmm-data: policy
    app.lrl.lilly.com/aws-role.lmm-data.policy: |
    {
            "Version": "2012-10-17",
            "Statement": [
            {
                "Sid": "BedrockAll",
                "Effect": "Allow",
                "Action": [
                "bedrock:*"
                ],
                "Resource": "*"
            },
            {
                "Sid": "DescribeKey",
                "Effect": "Allow",
                "Action": [
                "kms:DescribeKey"
                ],
                "Resource": "arn:*:kms:*:::*"
            },
            {
                "Sid": "APIsWithAllResourceAccess",
                "Effect": "Allow",
                "Action": [
                "iam:ListRoles",
                "ec2:DescribeVpcs",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups"
                ],
                "Resource": "*"
            },
            {
                "Sid": "PassRoleToBedrock",
                "Effect": "Allow",
                "Action": [
                "iam:PassRole"
                ],
                "Resource": "arn:aws:iam::*:role/*AmazonBedrock*",
                "Condition": {
                "StringEquals": {
                    "iam:PassedToService": [
                        "bedrock.amazonaws.com"
                        ]
                    }
                }
            }
        ]
    }
Permissions Granted in Policy Explained:
Access to Amazon Bedrock Services: This policy grants comprehensive permissions (bedrock:*) to all Amazon Bedrock services. Amazon Bedrock offers fully managed foundational models for building and deploying generative AI applications. With these permissions, you can leverage any aspect of the Bedrock services, including model training, deployment, and inference capabilities.
Key Management Service (KMS) Access: The policy includes permissions for kms:DescribeKey, allowing your applications to retrieve information about AWS KMS keys. This is crucial for applications that require encryption and decryption capabilities, ensuring that your application can securely manage and use encryption keys for data protection.
AWS Resource Descriptions: Permissions are granted for listing IAM roles (iam:ListRoles) and describing AWS Virtual Private Cloud (VPC) resources (ec2:DescribeVpcs, ec2:DescribeSubnets, ec2:DescribeSecurityGroups). These permissions enable your applications to query information about the IAM roles and networking resources in your AWS environment, facilitating resource management and configuration.
Role Delegation to Amazon Bedrock: Specifically tailored to interactions with Amazon Bedrock, the policy allows your applications to pass IAM roles (iam:PassRole) to Amazon Bedrock services under certain conditions. This capability is restricted to roles intended for Amazon Bedrock (arn:aws:iam::*:role/*AmazonBedrock*), and only when the role is being passed to bedrock.amazonaws.com, ensuring that role delegation is securely managed and scoped to intended use cases.
Calling Bedrock via API
Here is a code block that shows how to use a get headers function to get into aws us-east-1 where bedrock is located.
from boto3 import Session
import psycopg2
from botocore.awsrequest import AWSRequest
from botocore.compat import HTTPHeaders
from botocore.hooks import HierarchicalEmitter
from botocore.model import ServiceId
from botocore.signers import RequestSigner
import boto3
import pymsteams
import requests
import os
import json

def get_aws_header(**kwargs):
    session = Session(**kwargs)
    credentials = session.get_credentials()
    emitter = HierarchicalEmitter()
    signer = RequestSigner(ServiceId("BEDROCK"), 'us-east-1', "bedrock", "v4", credentials, emitter)

    url = "https://bedrock.amazonaws.com/"

    headers = HTTPHeaders()
    headers.add_header("Content-Type", content_type)
    request = AWSRequest("POST", url, headers,
                         data=request_parameters, params={})
    signer.sign("GetCallerIdentity", request)
    return request.headers

Now that you have made connection to bedrock within the AWS account you can implement your specific use case! Good luck ✌️
Edit this page






ECR Credential Service : Provision Github Repo with Action Credentials and Cross Account Registries
CronJob that runs on all github repos provided with access by Light-Automation, refresh ECR credentials in the Github Actions secret store and optionally create ECR repos with cross-account access.
Configuration
In order to create an ECR repo and provide your Github Actions build and push docker images with ECR credentials, you must first add light-apps as collaborator with admin access.
 
This cronjob will add and continuously update the Actions/Repository Secrets so that there will always be fresh credentials to push (and pull) from ECR within an action run.
 
The cronjob will also create an ECR registry in the production Light account for you that you authenticate to with the repository secrets, it will usually be in the form of your_repo_name. This registry will be provisioned with cross account permissions, which allows you to develop in the LRL_light_k8s_infra_apps_test or LRL_light_k8s_infra_apps_qa environments.
 
RDS Databases
Amazon Relational Database Service (RDS) is a managed database service provided by Amazon Web Services (AWS) that simplifies the setup, operation, and scaling of a relational database in the cloud. It supports several database engines, including PostgreSQL, MySQL, MariaDB, Oracle, and Microsoft SQL Server, allowing users to choose the one that best fits their needs. RDS handles routine database tasks such as provisioning, patching, backup, recovery, and scaling, enabling developers to focus on their applications rather than on database management.
Resource to calculate what kind of DB you want to use and how much it will cost.
Recommended PostgreSQL Engine Version
When provisioning a PostgreSQL RDS instance via Crossplane, we strongly recommend using "15.9" as the engine version. This version is widely adopted, stable, and most compatible with the majority of PostgreSQL management tools, including pgAdmin.
Why 15.9?
•	Stability: It’s a mature release frequently updated and patched by AWS.
•	Ecosystem Compatibility: Many client libraries, frameworks, and admin tools have thoroughly tested integration with PostgreSQL 15.x.
•	PGAdmin Compatibility: Versions above 16.0 currently present known issues when used with pgAdmin; users may be unable to connect or interact properly with RDS instances. If your workflow relies on pgAdmin, avoid specifying any 16.x engine version until pgAdmin provides official support.
Application Access to RDS Instance
To enable traffic from your application in the cluster to reach the RDS instance, you must attach the cluster’s security group to the vpcSecurityGroupIds field in your RDSInstance configuration. This ensures that the RDS instance allows inbound traffic from the specified security group. An example configuration of an RDSInstance object is provided below.
Important: Be sure to use the correct security group for the environment (Dev, QA, or Prod) where your application and RDS instance are deployed.
Environment	Cluster Security Group
Dev	sg-0fbc2281bb1d4a235
QA	sg-0da01d6b76e594051
Prod	sg-0fc1ecf123aa058f0
Dev/QA Config Example
Template:
apiVersion: database.aws.crossplane.io/v1beta1
kind: RDSInstance
metadata:
  name: <Your db name, must be unique across all apps & DNS safe>
  namespace: <Your Namespace>
spec:
  providerConfigRef:
    name: "default"
  forProvider:
    dbInstanceClass: db.t2.small
    masterUsername: postgres
    allocatedStorage: 20
    region: us-east-2
    engine: postgres
    engineVersion: "15.9"
    skipFinalSnapshotBeforeDeletion: true
    autoMinorVersionUpgrade: false
    storageEncrypted: true
    deletionProtection: false
    dbSubnetGroupName: light-rds-subnet-group
    # Currently referencing the AWS Cluster SG directly, future update to use label refs, etc.  For now seems like crossplane does not fully support this.
    vpcSecurityGroupIds:
      - sg-0fc1ecf123aa058f0
  writeConnectionSecretToRef:
    namespace: <Your Namespace>
    name: <Name of the secret which will be created in your namespace containing db connection / credential info>
PRD Config Example
template:
apiVersion: database.aws.crossplane.io/v1beta1
kind: RDSInstance
metadata:
  name: <Your db name, must be unique across all apps & DNS safe>
  namespace: <Your Namespace>
spec:
  providerConfigRef:
    name: "default"
  forProvider:
    dbInstanceClass: db.t2.small
    masterUsername: postgres
    allocatedStorage: 20
    region: us-east-2
    engine: postgres
    engineVersion: "15.9"
    skipFinalSnapshotBeforeDeletion: true
    autoMinorVersionUpgrade: false
    storageEncrypted: true
    deletionProtection: true
    enablePerformanceInsights: true
    backupRetentionPeriod: 7
    dbSubnetGroupName: light-rds-subnet-group
    # Currently referencing the AWS Cluster SG directly, future update to use label refs, etc.  For now seems like crossplane does not fully support this.
    vpcSecurityGroupIds:
      - sg-0fc1ecf123aa058f0
  writeConnectionSecretToRef:
    namespace: <Your Namespace>
    name: <Name of the secret which will be created in your namespace containing db connection / credential info>
This configuration will create a RDS Postgresql database & set the connection info in a secret it creates in the namespace referenced with the writeConnectionSecretToRef property.
This secret follows the structure:
endpoint: <RDS Host>
password: <RDS Main user password>
port: <RDS Port>
username: <RDS Main Username>
These configurations can be viewed in the K8s Dashboard under the crossplane rds custom resource [Click Here] (https://k8s-dashboard.apps.lrl.lilly.com/#/customresourcedefinition/rdsinstances.database.aws.crossplane.io?namespace=_all)
OnPrem Access (Mobius / BI tool)
For use cases such as Mobius or BI tool access which requires a direct DB connection, there is a pre-provisioned security group which provides OnPrem access to RDS Postgresql DBs. NOTE: this should only be added when necessary for the above use cases.
In your crossplane resource, add the following security group to the vpcSecurityGroupIds parameter
vpcSecurityGroupIds:
 ...
 - sg-01c9259fe1ed54f5f 

Cross Account RDS Connection
Step 1:
Create a secret in external AWS account's secrets manger
Step 2:
Create a cross account role in the non-CATS aws account that cats can use to connect to the non-CATS AWS account that is housing the RDS database you wish to connect to.
Step 3:
Create an external secret in your solution's deployment files within the applicable CATS infra_apps repo.
This is an example of the external secret that the CLUWE team has created to enable connection to a RDS database housed in the AWS Account 490262564977.
Following this pattern should work for your solution as well!
---
apiVersion: "kubernetes-client.io/v1"
kind: ExternalSecret
metadata:
  name: cluwe-secret
  namespace: cluwe-qa
spec:
  backendType: secretsManager
  roleArn: arn:aws:iam::490262564977:role/lrl-cluwe-cats-cross-connection
  region: us-east-2
  data:
    - key: cluwe-dev/rds/secret
      name: username
      property: rds_username
    - key: cluwe-dev/rds/secret
      name: password
      property: rds_password
    - key: cluwe-dev/rds/secret
      name: endpoint
      property: rds_host
Step 4:
Go into the AWS console and find the EC2 security group associated with your solutions namespace. Security group should look something like this: sg-07b45033d6584cdb2
Step 5:
Add this security group to the inbound rules for the RDS database you are trying to target in the non CATS AWS Account.
Edit this page
CloudBrowser : S3 UI Tool
Interact with AWS S3 buckets effortlessly using CloudBrowser, a graphical interface that streamlines storage management.
•	Production Environment Dashboard
•	QA Environment Dashboard
•	Dev Environment Dashboard
Configuration
Lilly Cloud Browser is configured by annotations on Kubernetes namespaces. The available annotations are listed below.
lilly.com/cloud-browser-auth
This allows setting s3 auth roles for s3 resources associated with the associated namespace.
The value for this annotation is a JSON object in string format. The simplest config allows setting a list of users providing read only access to the default S3 path for this namespace. This default bucket / S3 prefix path will be s3://lly-light-prod/<namespace name>/
annotations:
  lilly.com/cloud-browser-auth: '{"authConfigs": [{ "users": ["A123456", "B7891011"]}]}'
Expanding on this, you can also specify an access group(s) rather than individual users:
annotations:
  lilly.com/cloud-browser-auth: '{"authConfigs": [{ "groups": ["group1", "group2"]}]}'
You can also allow [read, write, readwrite, delete, all] access by setting these values:
annotations:
  lilly.com/cloud-browser-auth: '{"authConfigs": [{ "groups": ["group1", "group2"], "permission": "readwrite"}]}'
You can set a non default prefix by:
annotations:
  lilly.com/cloud-browser-auth: '{"authConfigs": [{ "groups": ["group1", "group2"], "permission": "readwrite", "prefix": "customprefix"}]}'
CORS Configuration
To enable access from the cloud-browser frontend to an s3 bucket, CROSS ORIGIN RESOURCE SHARING (CORS) configuration needs to be set at the bucket level.
Click on the bucket, and navigate topermissions. 
Under permissions, findCross-origin resource sharing. 
Click edit, paste the following configuration block and save.
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "HEAD",
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        "AllowedOrigins": [
            "https://cloud-browser.apps.lrl.lilly.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-meta-custom-header",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2",
            "date"
        ],
        "MaxAgeSeconds": 3000
    }
]
References
Please navigate to the cloud-browser repository for more information: lrl-cloud-browser.

Edit this page




AWS Secrets Manager
AWS Secrets Manager is a fully managed service that helps you securely store, manage, and retrieve sensitive information like database credentials, API keys, and other secrets. It allows you to control access to secrets using fine-grained permissions and integrates with AWS Identity and Access Management (IAM) for secure access.
Key features of AWS Secrets Manager:
•	Automatic Rotation: It supports automatic rotation of secrets for supported AWS services (like RDS databases) without disrupting your applications.
•	Secure Storage: Secrets are encrypted using AWS KMS (Key Management Service) for protection.
•	Easy Retrieval: Secrets can be programmatically retrieved via the AWS SDK, CLI, or API in applications, ensuring credentials aren’t hard-coded in codebases.
•	Versioning: Secrets Manager keeps track of multiple versions of your secrets, allowing rollback if needed.
•	Integration with AWS Services: It integrates with services like Amazon RDS, Redshift, and DocumentDB for automatic secret rotation.
Using Secrets Manager with CATS
The CATS Platform team strongly recommends using AWS Secrets Manager as the central, secure location for storing sensitive information such as API keys, database credentials, and other secrets.
These secrets are automatically synchronized with a Kubernetes resource called an "External Secret," enabling seamless access to secrets by applications deployed within the Kubernetes cluster.
For detailed instructions on setting up and using External Secrets in CATS, refer to our full guide here.
Amazon Documentation
For a more detailed look at the Secrets Manager service please review the official amazon documentation here.






AWS VPC
Below you can find all of the AWS VPC Endpoint details for Lilly Developers.
________________________________________
We are pleased to announce that we have published the details of AWS VPC Endpoints for particular services of all qualified regions.
To Access VPC Endpoints details for particular region, click on specific region below which will redirect you to region based Endpoints.
________________________________________
•	Click here for N.Virginia
•	Click here for Ohio
•	Click here for California
•	Click here for Oregon
•	Click here for Tokyo
•	Click here for London
________________________________________
What are AWS VPC Endpoints?
AWS VPC Endpoints allow you to privately connect your VPC to supported AWS services and VPC endpoint services powered by AWS PrivateLink without requiring an Internet Gateway, NAT device, VPN connection, or AWS Direct Connect connection.
Please refer this: What are VPC endpoints?
________________________________________
How to request AWS Service VPC Endpoint
If the service VPC Endpoint is not present in this document, please raise a SNOW Change request and assign to PLATFORM-AWS-FOUND-SVCS-GLB.
________________________________________
Click any VPC Type from the table below to access the "N.Virginia" VPC Endpoints
Region	VPC Type
N.Virginia	Dev DX

N.Virginia	Dev NODX

N.Virginia	QA DX

N.Virginia	QA NODX

N.Virginia	Prod DX

N.Virginia	Prod NODX

________________________________________
N.Virginia Dev DX
VPC Type = vpc-087ee81cc90911dd6 - Dev DX
Name	Service name	Endpoint ID
S3 DevDX	com.amazonaws.us-east-1.s3	vpce-0ce9393e99b6847b9
CloudFormation DevDX	com.amazonaws.us-east-1.cloudformation	vpce-0a6dd9ee8adb70c8a
CloudTrail DevDX	com.amazonaws.us-east-1.cloudtrail	vpce-01569d2a790da23f1
Config DevDX	com.amazonaws.us-east-1.config	vpce-0a54a38f2a9538616
EC2 DevDX	com.amazonaws.us-east-1.ec2	vpce-044be7e1874e7ecd8
EC2-Messages DevDX	com.amazonaws.us-east-1.ec2messages	vpce-0ed19920a5f0fe17c
ElasticLoadBalancing DevDX	com.amazonaws.us-east-1.elasticloadbalancing	vpce-08b8016027f45d4a1
Events DevDX	com.amazonaws.us-east-1.events	vpce-08edc37cb74eb78f1
Execute-API DevDX	com.amazonaws.us-east-1.execute-api	vpce-00d3041344448c59a
Glue DevDX	com.amazonaws.us-east-1.glue	vpce-045c3d087082c87e6
KMS DevDX	com.amazonaws.us-east-1.kms	vpce-065741d640ec3b51a
Logs DevDX	com.amazonaws.us-east-1.logs	vpce-09050117f5b5d71ca
Monitoring DevDX	com.amazonaws.us-east-1.monitoring	vpce-04eae4e02e2ca3054
SecretsManager DevDX	com.amazonaws.us-east-1.secretsmanager	vpce-03e06825462dfb9a8
SNS DevDX	com.amazonaws.us-east-1.sns	vpce-022c239d67ff56ccf
SQS DevDX	com.amazonaws.us-east-1.sqs	vpce-0c9e6513a053c0e2b
SSM DevDX	com.amazonaws.us-east-1.ssm	vpce-05ab679bf429bb68a
SSM-Messages DevDX	com.amazonaws.us-east-1.ssmmessages	vpce-0a5f5c61b159d8054
STS DevDX	com.amazonaws.us-east-1.sts	vpce-0071aa51bcd5dd998
DynamoDB DevDX	com.amazonaws.us-east-1.dynamodb	vpce-05531ec1b43251241
DevDX - RDS	com.amazonaws.us-east-1.rds	vpce-027f20ac3fb80a514
MedicalImaging DevDX	com.amazonaws.us-east-1.medical-imaging	vpce-07d17a1eb5e0fdcd7
Runtime-MedicalImaging-DevDX	com.amazonaws.us-east-1.runtime-medical-imaging	vpce-095aa29bbbbf0d72c
________________________________________
N.Virginia Dev NODX
VPC Type = vpc-02445d0e8e6203a7d - Dev NODX
Name	Service name	Endpoint ID
S3 DevNODX	com.amazonaws.us-east-1.s3	vpce-09841b5541083fe0c
MedicalImaging DevNoDX	com.amazonaws.us-east-1.medical-imaging	vpce-0479c1d073115d6d5
Runtime-MedicalImaging-DevNoDX	com.amazonaws.us-east-1.runtime-medical-imaging	vpce-065cfaa3e3ff1e088
________________________________________
N.Virginia QA DX
VPC Type = vpc-01a8eabb469cb2a46 QA DX
Name	Service name	Endpoint ID
CloudFormation QaDX	com.amazonaws.us-east-1.cloudformation	vpce-0755129a7ccc40455
CloudTrail QaDX	com.amazonaws.us-east-1.cloudtrail	vpce-0a438fe89f21b515e
Config QaDX	com.amazonaws.us-east-1.config	vpce-0165ea8e839625add
EC2 QaDX	com.amazonaws.us-east-1.ec2	vpce-05c8f787f67139c91
EC2-Messages QaDX	com.amazonaws.us-east-1.ec2messages	vpce-0dc15128458c51845
ElasticLoadBalancing QaDX	com.amazonaws.us-east-1.elasticloadbalancing	vpce-0ac4242a0636ac2ae
Events QaDX	com.amazonaws.us-east-1.events	vpce-0e5f8e42743fc087d
Execute-API QaDX	com.amazonaws.us-east-1.execute-api	vpce-08859ebdbaecb03b5
Glue QaDX	com.amazonaws.us-east-1.glue	vpce-0fe165586c8d7a3ba
KMS QaDX	com.amazonaws.us-east-1.kms	vpce-0680ac47d2b63d05a
Logs QaDX	com.amazonaws.us-east-1.logs	vpce-0e52dc76b751314cc
Monitoring QaDX	com.amazonaws.us-east-1.monitoring	vpce-01b509b60fe88424f
SecretsManager QaDX	com.amazonaws.us-east-1.secretsmanager	vpce-0c69454372ba9627c
SNS QaDX	com.amazonaws.us-east-1.sns	vpce-05a079e08b0634c79
SQS QaDX	com.amazonaws.us-east-1.sqs	vpce-0acddf835b001a6ec
SSM QaDX	com.amazonaws.us-east-1.ssm	vpce-0c89c261f5ddff81e
SSM-Messages QaDX	com.amazonaws.us-east-1.ssmmessages	vpce-08a4175c1fd261afd
STS QaDX	com.amazonaws.us-east-1.sts	vpce-0084e5b809a19b5fe
DynamoDB QaDX	com.amazonaws.us-east-1.dynamodb	vpce-0eb08fe60fa7a9c92
S3 QaDX	com.amazonaws.us-east-1.s3	vpce-042efb214d15b6832
MedicalImaging QaDX	com.amazonaws.us-east-1.medical-imaging	vpce-0ac3f74f57258cae3
Runtime-MedicalImaging-QaDX	com.amazonaws.us-east-1.runtime-medical-imaging	vpce-06025f42d5ae9559a
________________________________________
N.Virginia QA NODX
VPC Type = vpc-0098367cf4f301ec2 QA NODX
Name	Service name	Endpoint ID
S3 QaNODX	com.amazonaws.us-east-1.s3	vpce-01c1ca60274ca5a76
MedicalImaging QaNoDX	com.amazonaws.us-east-1.medical-imaging	vpce-04aefc1405c074c91
Runtime-MedicalImaging-QaNoDX	com.amazonaws.us-east-1.runtime-medical-imaging	vpce-03f21e3e2d6d698da
________________________________________
N.Virginia Prod DX
VPC Type = vpc-0ca682ee62e2a162f Prod DX
Name	Service name	Endpoint ID
S3 ProdDX	com.amazonaws.us-east-1.s3	vpce-07ff15f2ff3e5aebb
SSM ProdDX	com.amazonaws.us-east-1.ssm	vpce-0f8c6238815c65989
SecretsManager ProdDX	com.amazonaws.us-east-1.secretsmanager	vpce-030f387ebdf239e5c
Execute-API ProdDX	com.amazonaws.us-east-1.execute-api	vpce-05a765db42827d977
ElasticLoadBalancing ProdDX	com.amazonaws.us-east-1.elasticloadbalancing	vpce-0faed1820d790acf1
MedicalImaging ProdDX	com.amazonaws.us-east-1.medical-imaging	vpce-05564008d4c4449f9
Runtime-MedicalImaging-ProdDx	com.amazonaws.us-east-1.runtime-medical-imaging	vpce-0defa5cf657d94103
DynamoDB ProdDX	com.amazonaws.us-east-1.dynamodb	vpce-066c0d4b9720133ee
________________________________________
N.Virginia Prod NODX
VPC Type = vpc-0681fa28b392e751f Prod NODX
Name	Service name	Endpoint ID
Prod-NoDX-S3-Gateway	com.amazonaws.us-east-1.s3	vpce-038c5821737c9db63
MedicalImaging ProdNoDX	com.amazonaws.us-east-1.medical-imaging	vpce-046f42a2463f98c00
Runtime-MedicalImaging-ProdNoDX	com.amazonaws.us-east-1.runtime-medical-imaging	vpce-02e71611e0af77522
________________________________________
Click any VPC Type from the table below to access the "Ohio" VPC Endpoints
Region	VPC Type
Ohio	Dev DX

Ohio	Dev NODX

Ohio	QA DX

Ohio	QA NODX

Ohio	Prod DX

Ohio	Prod NODX

________________________________________
Ohio Dev DX
VPC Type = vpc-06a3d8f2cdafb8a6e DevDX
Name	Service name	Endpoint ID
S3 DevDX	com.amazonaws.us-east-2.s3	vpce-00597e56f203d515d
SecretsManager DevDx	com.amazonaws.us-east-2.secretsmanager	vpce-08a83caf899eaab13
SSM DevDX	com.amazonaws.us-east-2.ssm	vpce-03f7174e5d88a5346
SSM-Messages DevDX	com.amazonaws.us-east-2.ssmmessages	vpce-0a67e6e0fe40f71c7
EC2 DevDX	com.amazonaws.us-east-2.ec2	vpce-0271270f3f25d6485
EC2-Messages DevDX	com.amazonaws.us-east-2.ec2messages	vpce-0f467afdc33f2ce97
ElasticLoadBalancing DevDX	com.amazonaws.us-east-2.elasticloadbalancing	vpce-061751a976ad94bc2
Execute-API DevDX	com.amazonaws.us-east-2.execute-api	vpce-069388414a9f87f40
Glue DevDX	com.amazonaws.us-east-2.glue	vpce-032ce77019e4d117d
KMS DevDX	com.amazonaws.us-east-2.kms	vpce-0548cc17c7adbf5aa
Logs DevDX	com.amazonaws.us-east-2.logs	vpce-0e85ca396c1f0b124
Monitoring DevDX	com.amazonaws.us-east-2.monitoring	vpce-01f798744c6d41329
STS DevDX	com.amazonaws.us-east-2.sts	vpce-0b6089d46477e5fef
SNS DevDX	com.amazonaws.us-east-2.sns	vpce-0b652714b64d2eca6
SQS DevDX	com.amazonaws.us-east-2.sqs	vpce-0fb67b2434607e688
DynamoDB DevDX	com.amazonaws.us-east-2.dynamodb	vpce-030ae10c11e62da56
Athena DevDX	com.amazonaws.us-east-2.athena	vpce-04e329928e64facab
Sagemaker API DevDX	com.amazonaws.us-east-2.sagemaker.api	vpce-09106d5e6614ada54
Sagemaker Runtime DevDx	com.amazonaws.us-east-2.sagemaker.runtime	vpce-0ef3976c4652eb60a
Sagemaker Notebook	aws.sagemaker.us-east-2.notebook	vpce-09ca62afe75819c1c
Sagemaker Studio DevDX	aws.sagemaker.us-east-2.studio	vpce-03c1aa667cecd5237
MGN-DevDX	com.amazonaws.us-east-2.mgn	vpce-02847462cb88f7e4d
Textract DevDX	com.amazonaws.us-east-2.textract	vpce-075f25b40a27f353e
________________________________________
Ohio Dev NODX
VPC Type = vpc-0af5b8f31d61a37f0 DevNODX
Name	Service name	Endpoint ID
S3 DevNoDX	com.amazonaws.us-east-2.s3	vpce-014eeaeba01da6ba4
DynamoDB Dev NoDX	com.amazonaws.us-east-2.dynamodb	vpce-0f20635d994b52d36
________________________________________
Ohio QA DX
VPC Type = vpc-0d4e782cbe86eb07c QaDX
Name	Service name	Endpoint ID
SecretManager QaDx	com.amazonaws.us-east-2.secretsmanager	vpce-0410bb629eec80d57
SSM QaDX	com.amazonaws.us-east-2.ssm	vpce-007ef0345e7581f6c
SSMMessages QaDX	com.amazonaws.us-east-2.ssmmessages	vpce-05d536d27a65339f0
EC2 QaDX	com.amazonaws.us-east-2.ec2	vpce-089b42ba2a703a98d
ElasticLoadBalancing QaDX	com.amazonaws.us-east-2.elasticloadbalancing	vpce-08e67239b12aae5c3
Execute-API QaDX	com.amazonaws.us-east-2.execute-api	vpce-058757a9c034d181c
Glue QaDX	com.amazonaws.us-east-2.glue	vpce-00ea5a984097886e0
KMS QaDX	com.amazonaws.us-east-2.kms	vpce-0c0e9f67d8cb6c48e
Logs QaDX	com.amazonaws.us-east-2.logs	vpce-0991c8e1cc2914c42
Monitoring QaDX	com.amazonaws.us-east-2.monitoring	vpce-0a1d71e968e020fa2
STS QaDX	com.amazonaws.us-east-2.sts	vpce-03038900a4c2df72d
SNS QaDX	com.amazonaws.us-east-2.sns	vpce-093bfb4dc92d6b496
SQS QaDX	com.amazonaws.us-east-2.sqs	vpce-01176dac17bcbf8b2
EC2Messages QaDX	com.amazonaws.us-east-2.ec2messages	vpce-043bd53b2c2a93304
S3 QaDX	com.amazonaws.us-east-2.s3	vpce-02bba4a28975f7f16
DynamoDB QaDX	com.amazonaws.us-east-2.dynamodb	vpce-0142823be13f0ea5b
Athena QaDX	com.amazonaws.us-east-2.athena	vpce-06398b7a8f87bf36b
________________________________________
Ohio QA NODX
VPC Type = vpc-09c2cf5ce04d4296c QaNODX
Name	Service name	Endpoint ID
S3 QaNoDX	com.amazonaws.us-east-2.s3	vpce-03b93a1706b13c53f
________________________________________
Ohio PROD DX
VPC Type = vpc-0ea80082460c43671 ProdDX
Name	Service name	Endpoint ID
SecretManager ProdDx	com.amazonaws.us-east-2.secretsmanager	vpce-0b2586b341b808131
S3 ProdDX	com.amazonaws.us-east-2.s3	vpce-0c2e2da1be9686b41
SSM ProdDX	com.amazonaws.us-east-2.ssm	vpce-0c36bfe813f09f9d5
Glue ProdDX	com.amazonaws.us-east-2.glue	vpce-039b09d74225a8d70
Athena ProdDX	com.amazonaws.us-east-2.athena	vpce-034b3a5d2f70e7ce6
Execute-API ProdDX	com.amazonaws.us-east-2.execute-api	vpce-03bee17f69c9802b9
________________________________________
Ohio PROD NODX
VPC Type = vpc-00d9483e17ad66ae2 ProdNODX
Name	Service name	Endpoint ID
SSM ProdNODX	com.amazonaws.us-east-2.ssm	vpce-091913f2115523533
S3 ProdNoDX	com.amazonaws.us-east-2.s3	vpce-0aec81db4f13c2f32
________________________________________
Click any VPC Type from the table below to access the "California" VPC Endpoints
Region	VPC Type
California	Dev DX

California	Dev NODX

California	QA DX

California	QA NODX

California	Prod DX

California	Prod NODX

________________________________________
California Dev DX
VPC Type = vpc-0d92ee4f2a442ecf4 DevDX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-1.ecr.api	vpce-0ff58d1365891b09f
None	com.amazonaws.us-west-1.ecr.dkr	vpce-082e8c4817ea78d24
S3 Gateway Dev DX	com.amazonaws.us-west-1.s3	vpce-078265e238df61a03
________________________________________
California Dev NODX
VPC Type = vpc-0ff4cdc7d9a0128da DevNODX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-1.ecr.api	vpce-0d1db52d6fe1b11a6
None	com.amazonaws.us-west-1.ecr.dkr	vpce-095ee0461813410d7
None	com.amazonaws.us-west-1.logs	vpce-0516dd4b657a684c7
________________________________________
California QA DX
VPC Type = vpc-01757d2683a38742e QA DX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-1.ecr.dkr	vpce-007ffd2dbaf4472a3
None	com.amazonaws.us-west-1.ecr.api	vpce-0b4b0b88d7dad0b0f
________________________________________
California QA NODX
VPC Type = vpc-0e5f3d53aa97f544e QaNODX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-1.ecr.dkr	vpce-04b4dd9ef4d27f2dd
None	com.amazonaws.us-west-1.ecr.api	vpce-0e263d26acf13071a
None	com.amazonaws.us-west-1.logs	vpce-0a76efa0d4b370ea4
________________________________________
California PROD DX
VPC Type = vpc-090ed91c29dd08ce8 ProdDX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-1.ecr.dkr	vpce-0d24d93020a57409f
None	com.amazonaws.us-west-1.ecr.api	vpce-06c9a4dff45ba81a7
________________________________________
California PROD NODX
VPC Type = vpc-08787255a4a9a08be ProdNODX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-1.ecr.api	vpce-09c4c8b2c779ffaff
None	com.amazonaws.us-west-1.ecr.dkr	vpce-0dc7d2e4b0d8e509d
None	com.amazonaws.us-west-1.logs	vpce-0ee3956d46cdf72ad
________________________________________
Click any VPC Type from the table below to access the "Oregon" VPC Endpoints
Region	VPC Type
Oregon	Dev DX

Oregon	Dev NODX

Oregon	QA DX

Oregon	QA NODX

Oregon	Prod DX

Oregon	Prod NODX

________________________________________
Oregon Dev DX
VPC Type = vpc-0c4dabc6581e25acd DevDX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-2.dynamodb	vpce-0691af80bb3c70e8c
None	com.amazonaws.us-west-2.s3	vpce-07458aee098dd3635
None	com.amazonaws.us-west-2.sts	vpce-0c9c2e75f9590352e
None	com.amazonaws.us-west-2.ec2messages	vpce-05a5beff411ee94b0
None	com.amazonaws.us-west-2.cloudformation	vpce-00c056fe002202d60
None	com.amazonaws.us-west-2.events	vpce-0f1f259fab021ef22
None	com.amazonaws.us-west-2.datasync	vpce-090c1f22400ea731a
None	com.amazonaws.us-west-2.ssmmessages	vpce-05e5be6045ef4da37
None	com.amazonaws.us-west-2.logs	vpce-0ee96c2ac52eae880
None	com.amazonaws.us-west-2.s3	vpce-0cc99d7caf1a0fed8
None	com.amazonaws.us-west-2.glue	vpce-0739c814ebf5f741f
None	com.amazonaws.us-west-2.config	vpce-0f1cf3ac979b0ca7c
None	com.amazonaws.us-west-2.execute-api	vpce-05503c45b56a7924e
None	com.amazonaws.us-west-2.secretsmanager	vpce-00c3f1e56d8559ecf
None	com.amazonaws.us-west-2.monitoring	vpce-0f4f8306aa1056982
None	com.amazonaws.us-west-2.sns	vpce-096bfc4ce03ec0700
None	com.amazonaws.us-west-2.ecr.api	vpce-0b21bff03e8dfd5cc
None	com.amazonaws.us-west-2.states	vpce-03747a38cd560ec0d
None	com.amazonaws.us-west-2.cloudtrail	vpce-01d338b3741e58712
None	com.amazonaws.us-west-2.ssm	vpce-087d27d895677ea49
None	com.amazonaws.us-west-2.sqs	vpce-0ea0c0c747d757eeb
None	com.amazonaws.us-west-2.ecr.dkr	vpce-05c6ed396c20badcc
None	com.amazonaws.us-west-2.elasticfilesystem	vpce-0f0eeea1b9acf9707
None	com.amazonaws.us-west-2.ec2	vpce-00ce04116141931dc
None	com.amazonaws.us-west-2.kms	vpce-0ba1d11423a3ecce2
None	com.amazonaws.us-west-2.lambda	vpce-0ce61e089513cb4de
None	com.amazonaws.us-west-2.elasticloadbalancing	vpce-01c245ed5030df18c
Oregon Dev NODX
VPC Type = vpc-027074bd2392602fd DevNODX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-2.dynamodb	vpce-0914bbf7fc300f677
None	com.amazonaws.us-west-2.s3	vpce-0eab9cdb22bb1382e
None	com.amazonaws.us-west-2.secretsmanager	vpce-0697b0cb614fb8c5a
None	com.amazonaws.us-west-2.cloudtrail	vpce-0612501f5e01dac60
None	com.amazonaws.us-west-2.ecr.dkr	vpce-0ccbca2f952e0a4d1
None	com.amazonaws.us-west-2.ec2messages	vpce-050b2a5ffb5a87c59
None	com.amazonaws.us-west-2.logs	vpce-01b360ca7bed88e9c
None	com.amazonaws.us-west-2.kms	vpce-00e657e43a8cb138f
None	com.amazonaws.us-west-2.sns	vpce-04ae3ff46561fbb50
None	com.amazonaws.us-west-2.cloudformation	vpce-000c28c5ee28bf01c
None	com.amazonaws.us-west-2.ec2	vpce-0499acd522e7d9dd1
None	com.amazonaws.us-west-2.execute-api	vpce-0ff2acb7384ffc252
None	com.amazonaws.us-west-2.datasync	vpce-09069ec99fcbf5cbd
None	com.amazonaws.us-west-2.glue	vpce-0ef7a0af382806560
None	com.amazonaws.us-west-2.elasticfilesystem	vpce-070a9f377aa234dd0
None	com.amazonaws.us-west-2.ecr.api	vpce-06903c0905b064ffd
None	com.amazonaws.us-west-2.s3	vpce-0deacea958bbb4ee0
None	com.amazonaws.us-west-2.monitoring	vpce-02e999064c662632d
None	com.amazonaws.us-west-2.sqs	vpce-06e74d3d69940e7fa
None	com.amazonaws.us-west-2.ssm	vpce-0ea73964da07b9b02
None	com.amazonaws.us-west-2.lambda	vpce-05ae445468a86e563
None	com.amazonaws.us-west-2.states	vpce-03d87d4b47c1a13a0
None	com.amazonaws.us-west-2.events	vpce-0796dd76526dd46b2
None	com.amazonaws.us-west-2.elasticloadbalancing	vpce-0511642e1ebf7d860
None	com.amazonaws.us-west-2.ssmmessages	vpce-073958a707873a7cd
None	com.amazonaws.us-west-2.sts	vpce-047503b629dcef9b9
None	com.amazonaws.us-west-2.config	vpce-09e547ccb843da575
________________________________________
Oregon QA DX
VPC Type = vpc-084ab3e1ecfaeafc1 QaDX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-2.s3	vpce-065ca2c8309f8c830
None	com.amazonaws.us-west-2.dynamodb	vpce-0dde62573bdda9816
None	com.amazonaws.us-west-2.datasync	vpce-000e061277b4ad9c3
None	com.amazonaws.us-west-2.lambda	vpce-0a8c1d19247916bdc
None	com.amazonaws.us-west-2.logs	vpce-0aa0d5c8ef974f3a7
None	com.amazonaws.us-west-2.cloudtrail	vpce-092b41fa24ab0478e
None	com.amazonaws.us-west-2.sts	vpce-01a0ce2b0e0b26f92
None	com.amazonaws.us-west-2.ec2	vpce-0408af98ae9c0e2bc
None	com.amazonaws.us-west-2.ecr.dkr	vpce-04985bf67cd319aa8
None	com.amazonaws.us-west-2.ecr.api	vpce-0b274790c11f62ddd
None	com.amazonaws.us-west-2.states	vpce-012f9d736406d3ff3
None	com.amazonaws.us-west-2.sqs	vpce-089957be589c33c97
None	com.amazonaws.us-west-2.s3	vpce-05a205cfc87dd1cc1
None	com.amazonaws.us-west-2.elasticfilesystem	vpce-0b8e22648c64ffcc8
None	com.amazonaws.us-west-2.sns	vpce-0807711cf33f0ef65
None	com.amazonaws.us-west-2.glue	vpce-08267086ead8a333c
None	com.amazonaws.us-west-2.events	vpce-03bb9cdaae7203fce
None	com.amazonaws.us-west-2.config	vpce-0bca43e678830139a
None	com.amazonaws.us-west-2.cloudformation	vpce-04c5e1041fa4e297d
None	com.amazonaws.us-west-2.elasticloadbalancing	vpce-054581e42f2bc8fdc
None	com.amazonaws.us-west-2.ssmmessages	vpce-0000e2cc8648d01e1
None	com.amazonaws.us-west-2.execute-api	vpce-05ac776662a91e83b
None	com.amazonaws.us-west-2.secretsmanager	vpce-0646d881dc984ebf3
None	com.amazonaws.us-west-2.ssm	vpce-028d7627c2d8173e9
None	com.amazonaws.us-west-2.monitoring	vpce-0d714fa2454336d4c
None	com.amazonaws.us-west-2.kms	vpce-043330a97d70cb34c
None	com.amazonaws.us-west-2.ec2messages	vpce-00f02c66ee46aeaac
________________________________________
Oregon QA NODX
VPC Type = vpc-058c5b0fd02b939e0 QaNODX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-2.dynamodb	vpce-091a7ff1009fc006f
None	com.amazonaws.us-west-2.s3	vpce-09f3d842b53414d21
None	com.amazonaws.us-west-2.datasync	vpce-0b996ca8a230a9e3f
None	com.amazonaws.us-west-2.ecr.dkr	vpce-050f82d0a734b128b
None	com.amazonaws.us-west-2.ecr.api	vpce-0be694f7e456c93e0
None	com.amazonaws.us-west-2.kms	vpce-0728c8993dd40f5c3
None	com.amazonaws.us-west-2.s3	vpce-065784226bb815138
None	com.amazonaws.us-west-2.ssmmessages	vpce-0dfb269cb44ba1384
None	com.amazonaws.us-west-2.states	vpce-0e5338f22287a9cc6
None	com.amazonaws.us-west-2.sts	vpce-0fe2c8532c80768eb
None	com.amazonaws.us-west-2.events	vpce-02ef036519f598845
None	com.amazonaws.us-west-2.logs	vpce-0dadb446a5038599f
None	com.amazonaws.us-west-2.cloudtrail	vpce-0775a1e165235ba02
None	com.amazonaws.us-west-2.ec2	vpce-0ff8b3b6105731539
None	com.amazonaws.us-west-2.execute-api	vpce-0ecc2a4c71b85c473
None	com.amazonaws.us-west-2.ssm	vpce-057da752ce95ce329
None	com.amazonaws.us-west-2.elasticfilesystem	vpce-07f0e10b644129299
None	com.amazonaws.us-west-2.monitoring	vpce-0bede3690f4f753f3
None	com.amazonaws.us-west-2.lambda	vpce-03d3144fbd5533a4d
None	com.amazonaws.us-west-2.secretsmanager	vpce-04d3308a78c63efc6
None	com.amazonaws.us-west-2.ec2messages	vpce-0a567e65cf0996438
None	com.amazonaws.us-west-2.elasticloadbalancing	vpce-056fcb676bc2a869a
None	com.amazonaws.us-west-2.glue	vpce-060e22da0662453a7
None	com.amazonaws.us-west-2.cloudformation	vpce-0bef62b8df10ea7f7
None	com.amazonaws.us-west-2.sns	vpce-0c2f1e2fa0517bb9a
None	com.amazonaws.us-west-2.sqs	vpce-040943adf18786b37
None	com.amazonaws.us-west-2.config	vpce-0a8e02d265644ca34
________________________________________
Oregon PROD DX
VPC Type = vpc-06697b82677f46c99 ProdDX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-2.s3	vpce-08b5679c5e9f848b7
None	com.amazonaws.us-west-2.dynamodb	vpce-0c0a35f7cacab1c8a
None	com.amazonaws.us-west-2.lambda	vpce-0d5b74d09435f89ab
None	com.amazonaws.us-west-2.states	vpce-09191f0b300f45665
None	com.amazonaws.us-west-2.ssm	vpce-08c8210ac36848aab
None	com.amazonaws.us-west-2.datasync	vpce-0a31c26080c524a28
None	com.amazonaws.us-west-2.sns	vpce-03581c903134e5d18
None	com.amazonaws.us-west-2.sqs	vpce-0d243880623ccf03e
None	com.amazonaws.us-west-2.ecr.api	vpce-03af3952a0c7cfc06
None	com.amazonaws.us-west-2.cloudtrail	vpce-08c52727395bcb7fa
None	com.amazonaws.us-west-2.sts	vpce-03a4100ec001df3f0
None	com.amazonaws.us-west-2.config	vpce-01172c55038237460
None	com.amazonaws.us-west-2.execute-api	vpce-0e8034b577b3cc7fe
None	com.amazonaws.us-west-2.kms	vpce-0912a8653a4f8eb18
None	com.amazonaws.us-west-2.elasticfilesystem	vpce-04241f00b74360ee2
None	com.amazonaws.us-west-2.events	vpce-09108f93612b45bfd
None	com.amazonaws.us-west-2.ec2messages	vpce-092f36f2d964f8e00
None	com.amazonaws.us-west-2.secretsmanager	vpce-051bfe55eb3331919
None	com.amazonaws.us-west-2.ec2	vpce-0db28f6808fc35600
None	com.amazonaws.us-west-2.cloudformation	vpce-0b037ed0054c8fe68
None	com.amazonaws.us-west-2.s3	vpce-03a943a00d5bf433d
None	com.amazonaws.us-west-2.logs	vpce-0f511fe615d89d6e9
None	com.amazonaws.us-west-2.ssmmessages	vpce-04530045a628ba850
None	com.amazonaws.us-west-2.monitoring	vpce-0ad98d5f27d08fd83
None	com.amazonaws.us-west-2.ecr.dkr	vpce-0a009b2ff6c454579
None	com.amazonaws.us-west-2.elasticloadbalancing	vpce-0d4b6da199872b5dc
None	com.amazonaws.us-west-2.glue	vpce-0ced223cb08add77f
________________________________________
Oregon PROD NODX
VPC Type = vpc-08545fbf7782ac73e ProdNODX
Name	Service name	Endpoint ID
None	com.amazonaws.us-west-2.dynamodb	vpce-0e692b08975fb9404
None	com.amazonaws.us-west-2.s3	vpce-077ce5113cda7e19f
None	com.amazonaws.us-west-2.logs	vpce-01fda426e975e41d3
None	com.amazonaws.us-west-2.elasticloadbalancing	vpce-0bd419af4c3c9ad68
None	com.amazonaws.us-west-2.cloudformation	vpce-0cc1311dad5e67685
None	com.amazonaws.us-west-2.execute-api	vpce-0bff99dce1c720004
None	com.amazonaws.us-west-2.s3	vpce-07f503aea56d82988
None	com.amazonaws.us-west-2.ec2messages	vpce-084f2a50c70a8519b
None	com.amazonaws.us-west-2.elasticfilesystem	vpce-0c7f457230821fae1
None	com.amazonaws.us-west-2.ecr.api	vpce-0e54f0734c8575863
None	com.amazonaws.us-west-2.sts	vpce-0b82b8b352aa6ccd8
None	com.amazonaws.us-west-2.lambda	vpce-081ae0e956a17228a
None	com.amazonaws.us-west-2.ec2	vpce-0fbd9d6c6637299ea
None	com.amazonaws.us-west-2.monitoring	vpce-059cb8716a7343611
None	com.amazonaws.us-west-2.ssm	vpce-08fd6019b374df1ef
None	com.amazonaws.us-west-2.sns	vpce-0c46c97ca71ba7795
None	com.amazonaws.us-west-2.glue	vpce-0c92416b848565880
None	com.amazonaws.us-west-2.secretsmanager	vpce-0aae7d7f7cadcf79d
None	com.amazonaws.us-west-2.ssmmessages	vpce-0ba5f5c21a9d4be56
None	com.amazonaws.us-west-2.kms	vpce-0ecc217c465f9d191
None	com.amazonaws.us-west-2.datasync	vpce-042abab3fbd1113bf
None	com.amazonaws.us-west-2.ecr.dkr	vpce-0b2af7a993a67fdb9
None	com.amazonaws.us-west-2.sqs	vpce-0dbbf34a15db23777
None	com.amazonaws.us-west-2.events	vpce-0b006c73cbde0d6fa
None	com.amazonaws.us-west-2.states	vpce-0d5646a3a0ce6d74e
None	com.amazonaws.us-west-2.cloudtrail	vpce-015a8e8616b3f4754
None	com.amazonaws.us-west-2.config	vpce-050bdf0a592131f59
________________________________________
Click any VPC Type from the table below to access the "Tokyo" VPC Endpoints
Region	VPC Type
Tokyo	Dev DX

Tokyo	Dev NODX

Tokyo	QA DX

Tokyo	QA NODX

Tokyo	Prod DX

Tokyo	Prod NODX

________________________________________
Tokyo Dev DX
VPC Type = vpc-03a2cf3c69e7ed806 DevDX
Name	Service name	Endpoint ID
S3 DevDX	com.amazonaws.ap-northeast-1.s3	vpce-0e8f90e702175b7f4
CloudFormation DevDX	com.amazonaws.ap-northeast-1.cloudformation	vpce-0b600d59cfd68e9ce
CloudTrail DevDX	com.amazonaws.ap-northeast-1.cloudtrail	vpce-03a5e9cab53a2bbd4
Config DevDX	com.amazonaws.ap-northeast-1.config	vpce-0d8b87bbb4f7cdf53
EC2 DevDX	com.amazonaws.ap-northeast-1.ec2	vpce-0ea7a393cb9eb53c1
EC2-Messages DevDX	com.amazonaws.ap-northeast-1.ec2messages	vpce-0f362a8518f22ff08
Events DevDx	com.amazonaws.ap-northeast-1.events	vpce-0cc4200d3efbcb07a
Execute-API DevDX	com.amazonaws.ap-northeast-1.execute-api	vpce-0fad78fdd3b709c61
Glue DevDX	com.amazonaws.ap-northeast-1.glue	vpce-0601fba4b95a9c1cb
KMS DevDX	com.amazonaws.ap-northeast-1.kms	vpce-04ff573001f3ecd4a
Logs DevDX	com.amazonaws.ap-northeast-1.logs	vpce-086bf54d9bd49e227
Monitoring DevDX	com.amazonaws.ap-northeast-1.monitoring	vpce-05964a15888412794
SecretsManager DevDx	com.amazonaws.ap-northeast-1.secretsmanager	vpce-06e606e86451234f2
SNS DevDX	com.amazonaws.ap-northeast-1.sns	vpce-095067891f3b8b819
SQS DevDX	com.amazonaws.ap-northeast-1.sqs	vpce-0c80d1a9984756019
SSM-Messages DevDX	com.amazonaws.ap-northeast-1.ssmmessages	vpce-0599d1a210aae53a6
STS DevDX	com.amazonaws.ap-northeast-1.sts	vpce-040d8d821fddc0e00
SSM DevDX	com.amazonaws.ap-northeast-1.ssm	vpce-00258bdc1f3ed378c
ElasticLoadBalancing DevDX	com.amazonaws.ap-northeast-1.elasticloadbalancing	vpce-0aaa6e61b088f4646
DynamoDb DevDX	com.amazonaws.ap-northeast-1.dynamodb	vpce-03c3fcbe0a4893bd5
________________________________________
Tokyo Dev NODX
VPC Type = vpc-07a57b08ebdb5005b DevNODX
Name	Service name	Endpoint ID
S3 DevNoDX	com.amazonaws.ap-northeast-1.s3	vpce-02dea2bc310272649
________________________________________
Tokyo QA DX
VPC Type = vpc-038208dfc40d12a90 QaDX
Name	Service name	Endpoint ID
CloudFormation QaDX	com.amazonaws.ap-northeast-1.cloudformation	vpce-086abdd2ae25768fb
CloudTrail QaDX	com.amazonaws.ap-northeast-1.cloudtrail	vpce-09e0fe233267e807c
Config QaDX	com.amazonaws.ap-northeast-1.config	vpce-0648d3bc31c7e0fc1
EC2 QaDX	com.amazonaws.ap-northeast-1.ec2	vpce-0cf1f310f4fa789e2
EC2-Messages QaDX	com.amazonaws.ap-northeast-1.ec2messages	vpce-03850a6357c6bce2e
Events QaDX	com.amazonaws.ap-northeast-1.events	vpce-08415ffdaacd59659
Execute-API QaDX	com.amazonaws.ap-northeast-1.execute-api	vpce-069a5f2c8ee2a9802
Glue QaDX	com.amazonaws.ap-northeast-1.glue	vpce-0ab22e7c71eddbb1f
KMS QaDX	com.amazonaws.ap-northeast-1.kms	vpce-0321088db0b59b6f3
Logs QaDX	com.amazonaws.ap-northeast-1.logs	vpce-0e77ab91db0263b6c
Monitoring QaDX	com.amazonaws.ap-northeast-1.monitoring	vpce-013c8c85819a03f54
SecretsManager QaDX	com.amazonaws.ap-northeast-1.secretsmanager	vpce-0eb61d857302fe3e2
SNS QaDX	com.amazonaws.ap-northeast-1.sns	vpce-043a1c80a9505ae7c
SQS QaDX	com.amazonaws.ap-northeast-1.sqs	vpce-0d314685d26c10268
SSM-Messages QaDX	com.amazonaws.ap-northeast-1.ssmmessages	vpce-0b4c1893fc3226fea
STS QaDX	com.amazonaws.ap-northeast-1.sts	vpce-01bcbecc89a8ee142
SSM QaDX	com.amazonaws.ap-northeast-1.ssm	vpce-082e5e535bb0ce85f
ElasticLoadBalancing QaDX	com.amazonaws.ap-northeast-1.elasticloadbalancing	vpce-08215cef2a84751f8
DynamoDB QaDX	com.amazonaws.ap-northeast-1.dynamodb	vpce-037d87b34edf6e85e
S3 QaDX	com.amazonaws.ap-northeast-1.s3	vpce-0bf12adac10bf6510
________________________________________
Tokyo QA NODX
VPC Type = vpc-0a5733ffa05829972 QaNODX
Name	Service name	Endpoint ID
S3 QaNoDX	com.amazonaws.ap-northeast-1.s3	vpce-0f69914d67fd78897
________________________________________
Tokyo PROD DX
VPC Type = vpc-0f775a99236920966 ProdDX
Name	Service name	Endpoint ID
S3 ProdDX	com.amazonaws.ap-northeast-1.s3	vpce-094057e7991c9ed51
SSM ProdDX	com.amazonaws.ap-northeast-1.ssm	vpce-09692868dd47584c0
SecretsManager ProdDX	com.amazonaws.ap-northeast-1.secretsmanager	vpce-0ff37bc10e9b4ba1c
________________________________________
Tokyo PROD NODX
VPC Type = vpc-007f5b2c5666cb3a8 ProdNODX
Name	Service name	Endpoint ID
S3 ProdNoDX	com.amazonaws.ap-northeast-1.s3	vpce-06d5a14eff5aec2c9
________________________________________
Click any VPC Type from the table below to access the "London" VPC Endpoints
Region	VPC Type
London	Dev DX

________________________________________
London Dev DX
VPC Type = vpc-082574efacbaf989d DevDX
Name	Service name	Endpoint ID
DevDX-EC2Messages	com.amazonaws.eu-west-2.ec2messages	vpce-04ee3a00b4e457e8e
DevDX-SSM-Messages	com.amazonaws.eu-west-2.ssmmessages	vpce-06e35edd1c21c0106
DevDX-EC2	com.amazonaws.eu-west-2.ec2	vpce-0eb91f02d5fd5ca6b
DevDX-SSM	com.amazonaws.eu-west-2.ssm	vpce-08cdb3863125b0d09
Edit this page




Connecting To AWS Resources in Non-CATS AWS Accounts
Many application teams want to take advantage of AWS Services like Lambda, Glue, Redshift, Aurora Databases, Sagemaker and so on. App Teams are free to use AWS resource like these if they are set up in a stand alone AWS account. Users can get an AWS Account to hold these resources and then connect them with their deployments in the CATS Cluster. In this section we outline some patterns for connecting to different types of AWS Resources that are held in AWS Accounts External to the CATS Platform.
In cases where application teams define resources like Glue jobs, Lambda functions, or SageMaker models in an external AWS accounts and want to trigger or interact with those resources within the CATS AWS account, certain permissions, trust relationships, and network configurations are required.
Common Considerations for All Services
1.	Cross-Account Role Assumption:
•	The CATS AWS account must be able to assume a role in the user's external AWS account to trigger resources like Glue jobs, Lambda functions, or Redshift queries.
•	This requires the external AWS account to create an IAM role that trusts the CATS AWS account and grants necessary permissions for specific services.
•	More details on cross-account role permission setup in the next section.
2.	Networking:
•	If the interaction involves VPC-based resources (e.g., accessing an RDS database from SageMaker in a different account), you need to ensure network connectivity. The simplest way to avoid additional networking configurations is to ensure that the two resources are on the same VPC.
3.	Resource Policies:
•	For services like Lambda or S3 that require resource-based policies, the external AWS account must set appropriate policies to allow access or invocation from the CATS account.
4.	S3 Access:
•	If resources in either account need to access S3 buckets (for data storage, model artifacts, etc.), ensure the S3 bucket policies allow cross-account access.
General Cross-Account IAM Role and Trust Policy Setup
The following general IAM role and trust relationship configurations must be set up. These steps apply to all services, with service-specific details addressed later. Steps:
1.	Role Creation in External Account:
•	Create an IAM role in their external AWS account that grants service-related permissions (e.g., glue:StartJobRun) and trusts the CATS platform’s AWS account.
2.	Role Creation in CATS Account:
•	Create an IAM role in the CATS AWS account that allows the CATS platform to invoke the user’s Lambda function in the external account. Look at the Namespace section to create an ServiceAccount using IRSA.
3.	Attach Trust Policy to IAM Role in the External Account:
•	Create a trust policy that will be attached to the trust relationship of the IAM role in the external account.
•	Example Trust Policy defined for the IAM role in external account:
{
  "Effect": "Allow",
  "Principal": {
    "AWS": "<CATS-IAM-role-arn>"
  },
  "Action": "sts:AssumeRole"
}
4.	IAM Policy/Permissions in External Account:
•	The user’s IAM role in the external account should allow the IAM Role in CATS to perform specific actions and access any necessary resources from the AWS service.
•	Example IAM Policy attached to IAM Role in external account:
{
  "Effect": "Allow",
  "Action": [
    <service>:<ActionAllowed>
  ],
  "Resource": "<resource-arn>"
}
5.	Next Steps:
•	After setting up the generic cross-account role permissions, look for the AWS service you are trying to interact from within the CATS account below for more information and custom configurations.
Glue
To allow your deployment in CATS to trigger a Glue job defined in an external AWS account:
Step 1: IAM Policy/Permissions in External Account:
•	The user’s IAM role in the external account should allow the IAM Role in CATS to start the Glue job and access any necessary Glue resources (databases, crawlers, etc.).
•	Example IAM Policy attached to IAM Role in external account:
{
  "Effect": "Allow",
  "Action": [
    "glue:StartJobRun",
    "glue:GetJob",
    "glue:GetJobRun"
  ],
  "Resource": "arn:aws:glue:<region>:<user-account-id>:job/<job-name>"
}
Step 2: Create a Cronjob/Deployment to Trigger the Glue Job:
•	Create a Cronjob/Deployment that will trigger the Glue job function with the right AWS configurations:
apiVersion: batch/v1
kind: CronJob
metadata:
  name: lambda-trigger-cronjob
spec:
  schedule: "0 0 * * *"  # Adjust the schedule as needed
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: lambda-trigger
            image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl-aws-tools:k8s_aws_cli-87bee64
            command: ["/bin/sh", "-c"]
            args:
              - |
                GLUE_JOB_NAME="your-glue-job-name"
                
                # Start the Glue job
                aws glue start-job-run --job-name $GLUE_JOB_NAME
                
                # Check if the invocation was successful
                if [ $? -eq 0 ]; then
                  echo "Lambda function invoked successfully."
                else
                  echo "Failed to invoke Lambda function."
                fi
            env:
            - name: AWS_PROFILE
              value: "<external-account-profile>"
            - name: AWS_DEFAULT_REGION
              value: "<your-aws-region>"
            - name: AWS_CONFIG_FILE
              value: "/home/run_user/aws-custom-config"
            volumeMounts:
            - name: "aws-config-volume"
              mountPath: "/home/run_user/aws-custom-config"
              subPath: "aws-config"
            - name: "tmp"
              mountPath: "/tmp"
          restartPolicy: OnFailure
          volumes:
          - name: "aws-config-volume"
            configMap:
              name: "aws-config"
          - name: "tmp"
            emptyDir: {}
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-config
data:
  aws-config: |
    [profile <cats-account-profile>]
    role_arn = <cats-account-iam-role-arn>
    web_identity_token_file = /var/run/secrets/eks.amazonaws.com/serviceaccount/token
    region=<your-aws-region>

    [profile <external-account-profile>]
    role_arn = <external-account-iam-role-arn>
    role_session_name = lambda-trigger
    source_profile = <cats-account-profile>
    region = <your-aws-region>
SageMaker
To allow the CATS platform to interact with a SageMaker endpoint or run training jobs in an external AWS account:
Interaction: Use a Kubernetes Deployment to invoke SageMaker operations. You can invoke an endpoint or start a training job.
Step 1: IAM Policy in External Account:
•	Attach a policy to the IAM role in the external account that grants permission to invoke SageMaker endpoints or start training jobs.
•	Example IAM Policy attached to IAM Role in external account:
{
  "Effect": "Allow",
  "Action": [
    "sagemaker:InvokeEndpoint",
    "sagemaker:CreateTrainingJob",
    "sagemaker:DescribeTrainingJob"
  ],
  "Resource": "*"
}
Step 2: Create a Deployment to Invoke the SageMaker Endpoint:
•	Create a Deployment that will trigger the SageMaker job function with the right AWS configurations:
apiVersion: batch/v1
kind: Deployment
metadata:
  name: sagemaker-trigger
  labels:
    app: sagemaker-trigger
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sagemaker-trigger
  template:
    metadata:
      labels:
        app: sagemaker-trigger
    spec:
      containers:
      - name: sagemaker-trigger-container
        image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl-aws-tools:k8s_aws_cli-87bee64
        command: ["/bin/sh", "-c"]
        args:
          - |            
            # Invoke sagemaker endpoint
            aws sagemaker-runtime invoke-endpoint --endpoint-name "<sagemaker-endpoint>" --body "<input-payload>" --region "<aws-region>" /tmp/sagemaker_output.txt
            cat /tmp/sagemaker_output.txt

        env:
        - name: AWS_PROFILE
          value: "<external-account-profile>"
        - name: AWS_DEFAULT_REGION
          value: "<your-aws-region>"
        - name: AWS_CONFIG_FILE
          value: "/home/run_user/aws-custom-config"
        volumeMounts:
        - name: "aws-config-volume"
          mountPath: "/home/run_user/aws-custom-config"
          subPath: "aws-config"
        - name: "tmp"
          mountPath: "/tmp"
      restartPolicy: Always
      volumes:
      - name: "aws-config-volume"
        configMap:
          name: "aws-config"
      - name: "tmp"
        emptyDir: {}
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-config
data:
  aws-config: |
    [profile <cats-account-profile>]
    role_arn = <cats-account-iam-role-arn>
    web_identity_token_file = /var/run/secrets/eks.amazonaws.com/serviceaccount/token
    region=<your-aws-region>

    [profile <external-account-profile>]
    role_arn = <external-account-iam-role-arn>
    role_session_name = lambda-trigger
    source_profile = <cats-account-profile>
    region = <your-aws-region>
Aurora Database
Cross Account Aurora Database Connection Instructions
In progress
Lambda
To allow your Deployment/Cronjob in CATS to trigger a Lambda function defined in an external AWS account:
Step 1: Lambda Role Creation in External Account:
•	Users need to create an IAM role in their external AWS account that will be assumed by the Lambda service to execute the function. This role must have a trust policy that allows the Lambda service to assume the role.
•	Example Trust Policy attached to the IAM role:
{
  "Effect": "Allow",
  "Principal": {
    "Service": "lambda.amazonaws.com"
  },
  "Action": "sts:AssumeRole"
}
Step 2: IAM Policy/Permissions in External Account:
•	The IAM role in the external account should grant permissions for the Lambda service to execute the function.
•	Example IAM Policy attached to IAM Role in external account:
{
  "Effect": "Allow",
  "Action": [
    "lambda:InvokeFunction"
  ],
  "Resource": "arn:aws:lambda:<region>:<user-account-id>:function:<function-name>"
}
Step 3: Create a Cronjob/Deployment to Trigger the Lambda Function:
•	Create a Cronjob/Deployment that will trigger the lambda function with the right AWS configurations:
apiVersion: batch/v1
kind: CronJob
metadata:
  name: lambda-trigger-cronjob
spec:
  schedule: "0 0 * * *"  # Adjust the schedule as needed
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: lambda-trigger
            image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl-aws-tools:k8s_aws_cli-87bee64
            command: ["/bin/sh", "-c"]
            args:
              - |
                LAMBDA_FUNCTION_NAME="your-lambda-function-name"
                
                # Invoke the Lambda function using AWS CLI
                aws lambda invoke \
                  --function-name $LAMBDA_FUNCTION_NAME \
                  --payload '{}' \
                  /dev/null
                
                # Check if the invocation was successful
                if [ $? -eq 0 ]; then
                  echo "Lambda function invoked successfully."
                else
                  echo "Failed to invoke Lambda function."
                fi
            env:
            - name: AWS_PROFILE
              value: "<external-account-profile>"
            - name: AWS_DEFAULT_REGION
              value: "<your-aws-region>"
            - name: AWS_CONFIG_FILE
              value: "/home/run_user/aws-custom-config"
            volumeMounts:
            - name: "aws-config-volume"
              mountPath: "/home/run_user/aws-custom-config"
              subPath: "aws-config"
            - name: "tmp"
              mountPath: "/tmp"
          restartPolicy: OnFailure
          volumes:
          - name: "aws-config-volume"
            configMap:
              name: "aws-config"
          - name: "tmp"
            emptyDir: {}
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-config
data:
  aws-config: |
    [profile <cats-account-profile>]
    role_arn = <cats-account-iam-role-arn>
    web_identity_token_file = /var/run/secrets/eks.amazonaws.com/serviceaccount/token
    region=<your-aws-region>

    [profile <external-account-profile>]
    role_arn = <external-account-iam-role-arn>
    role_session_name = lambda-trigger
    source_profile = <cats-account-profile>
    region = <your-aws-region>
Redshift
To allow your Job in CATS to trigger a Redshift operation for a resource defined in an external AWS account:
Step 1: IAM Policy/Permissions in External Account:
•	The IAM role in the external account should allow certain actions to be done with specific Redshift resources, such as executing SQL queries, retrieving data, and listing schemas and tables.
o	Example policy for the IAM role in the external account:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "redshift:GetClusterCredentials",
        "redshift:DescribeClusters",
        "redshift-data:ExecuteStatement",
        "redshift-data:GetStatementResult",
        "redshift-data:ListDatabases",
        "redshift-data:ListSchemas",
        "redshift-data:ListTables",
        "redshift-data:DescribeStatement",
        "redshift-data:CancelStatement"
      ],
      "Resource": [
        "arn:aws:redshift:<region>:<user-account-id>:cluster/<cluster-name>",
        "arn:aws:redshift:<region>:<user-account-id>:dbuser/<db-user>"
      ]
    }
  ]
}
Step 2: Create a Job to Trigger Redshift Query:
apiVersion: batch/v1
kind: Job
metadata:
  name: redshift-query-trigger
  labels:
    app: redshift-query-trigger
spec:
  template:
    metadata:
      labels:
        app: redshift-query-trigger
    spec:
      containers:
      - name: redshift-query-container
        image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl-aws-tools:k8s_aws_cli-87bee64
        command:
          - /bin/bash
          - -c
          - |
            aws redshift-data execute-statement --cluster-identifier "<redshift-cluster-name>" --database "<database-name>" --sql "<sql-query>" --region "<aws-region>"
            echo "Query executed on Redshift cluster: <redshift-cluster-name>"
        env:
        - name: AWS_PROFILE
          value: "<external-account-profile>"
        - name: AWS_DEFAULT_REGION
          value: "<your-aws-region>"
        - name: AWS_CONFIG_FILE
          value: "/home/run_user/aws-custom-config"
        volumeMounts:
        - name: "aws-config-volume"
          mountPath: "/home/run_user/aws-custom-config"
          subPath: "aws-config"
        - name: "tmp"
          mountPath: "/tmp"
      restartPolicy: Never
      volumes:
      - name: "aws-config-volume"
        configMap:
          name: "aws-config"
      - name: "tmp"
        emptyDir: {}
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-config
data:
  aws-config: |
    [profile <cats-account-profile>]
    role_arn = <cats-account-iam-role-arn>
    web_identity_token_file = /var/run/secrets/eks.amazonaws.com/serviceaccount/token
    region=<your-aws-region>

    [profile <external-account-profile>]
    role_arn = <external-account-iam-role-arn>
    role_session_name = lambda-trigger
    source_profile = <cats-account-profile>
    region = <your-aws-region>
RDS Database
Cross Account RDS Database Connection Instructions
Step 1: Create a secret in external AWS account's secrets manger
Step 2: Create a cross account role in the non-CATS aws account that cats can use to connect to the non-CATS AWS account that is housing the RDS database you wish to connect to.
Step 3: Create an external secret in your solution's deployment files within the applicable CATS infra_apps repo.
This is an example of the external secret that the CLUWE team has created to enable connection to a RDDS database housed in the AWS Account 490262564977.
Following this pattern should work for your solution as well!
---
apiVersion: "kubernetes-client.io/v1"
kind: ExternalSecret
metadata:
  name: cluwe-secret
  namespace: cluwe-qa
spec:
  backendType: secretsManager
  roleArn: arn:aws:iam::490262564977:role/lrl-cluwe-cats-cross-connection
  region: us-east-2
  data:
    - key: cluwe-dev/rds/secret
      name: username
      property: rds_username
    - key: cluwe-dev/rds/secret
      name: password
      property: rds_password
    - key: cluwe-dev/rds/secret
      name: endpoint
      property: rds_host
Step 4: Go into the AWS console and find the EC2 security group associated with your solutions namespace. Security group should look something like this: sg-07b45033d6584cdb2
Step 5: Add this security group to the inbound rules for the RDS database you are trying to target in the non CATS AWS Account.
Edit this page


















Overview
Observability is the practice of gaining insight into the internal state of systems by collecting and analyzing external outputs, such as logs, metrics, and traces. It allows teams to monitor the health, performance, and reliability of their applications and infrastructure in real time. By implementing strong observability practices, organizations can proactively detect issues, understand system behavior, and respond to problems before they impact users. In modern cloud-native environments, where systems are often distributed and complex, observability is crucial for ensuring operational visibility, optimizing performance, and maintaining reliability at scale.
•	Metrics (Prometheus): Prometheus collects and stores time-series metrics (e.g., CPU, memory usage). Metrics provide numerical insight into system health and performance.
•	Logs (Loki): Logs provide detailed records of events occurring within applications and infrastructure, which help debug specific issues or trace problems through system interactions.
•	Logs (OpenObserve): Openobserve was our original solution to providing logs to users. It is still active in the cluster but Loki is the new and improved Service Offering we provide.
•	Visualization (Grafana): Grafana is used to visualize logs, metrics, and traces together in a unified dashboard, helping teams to quickly analyze system behavior and diagnose issues.
•	Traces (Jaeger): Traces capture the lifecycle of requests as they move through different services and systems, helping to identify bottlenecks in distributed systems.
Disclaimer
The CATS Team provides a robust platform with system-level services designed to be generic and usable by all customers. While we strive to ensure these services meet a wide range of needs, certain customizations and feature extensions fall outside the scope of our responsibilities. Please review the following guidelines to understand the boundaries of our support:
Platform Team Responsibilities:
•	The CATS Team ensures that services like Grafana are set up in a way that is broadly usable for all teams.
•	Core platform functionality and documentation are maintained to support the most common use cases.
Application Team Responsibilities:
•	Customizations beyond the provided platform capabilities, such as adding new data sources in Grafana, are the responsibility of the application development teams.
•	If your team wishes to extend platform features, you are expected to take ownership of the implementation and troubleshooting of those changes.
Feature Requests:
If you identify a platform feature that would benefit all customers, Submit A Feature Request. These requests will be added to our backlog and prioritized with other planned work.
Continuous Documentation Improvements:
•	We value collaboration to enhance our documentation. If you encounter gaps while using the platform, we encourage you to work with us to address them.
•	As you resolve challenges specific to your customizations, please propose improvements to the documentation to help future users.
Out of Scope:
Continuous support for customizations or extended use cases that go beyond the default platform capabilities is not within the scope of the CATS Team.
Teams are expected to independently research and implement such changes if desired.
Table Of Contents
Observability	Description
Grafana
Powerful visualization tool for monitoring system performance using customizable dashboards and metrics.
Jaeger
Traces capture the lifecycle of requests as they move through different services and systems.
Loki
Log aggregation system that integrates seamlessly with Grafana, allowing for efficient log analysis and search.
OpenObserve
Centralized observability platform for managing logs, metrics, and traces in a unified interface.
Prometheus
Metrics monitoring and alerting toolkit that integrates with Grafana for real-time insights into system performance.

Note: Our observability components are closely linked to our Dashboard Offerings.
Edit this page




Grafana
Grafana is a leading open-source analytics and monitoring platform that provides users with powerful visualization capabilities for their metrics, logs, and traces. Integrated seamlessly with our Prometheus metrics scraper, Loki logging querier, and Jaeger tracing tool, Grafana allows teams to create custom dashboards that present data in an intuitive and visually appealing manner. With its wide range of visualization options, including graphs, charts, and tables, users can easily track performance trends, identify anomalies, and gain actionable insights into their applications and infrastructure. Grafana also supports alerting functionalities, enabling teams to set up notifications based on specific conditions, ensuring timely responses to potential issues. As an essential component of our observability stack, Grafana empowers users to explore their data effectively and make informed decisions to enhance system reliability and performance.
Use Grafana In CATS
There are a selection of pre-built dashboards allowing you to view the most common key metrics, application logs, and network tracing for your CATS deployed applications. Usually these dashboards will serve most use cases, however if a custom alert or dashboard is needed by your team, please see their respective sections on this page for more details.
Prequisites
To start utilizing Grafana for your applications, you must have the following criteria:
•	Metrics: any kubernetes resource in your namespace
•	Logs: you must have your pod scheduled on a karpenter node for the promtail daemonset to provision you a log scraper. Pleae consult the Karpenter documentation for more information.
•	Tracing: any ingress resource in your namespace
Cluster Overview
Cluster Overview dashboard shows a general overview of total resource quantity and usage clusterwide and by namespace. Notice the dashboard navigations built into the cluster overview and the grafana resource sidebar to navigate to the other dashboards.
 
 
Namespaces Dashboard
This dashboard displays a list of namespace scoped pods, their status, and what resources they are utilizing.
Loki Tools-log Dashboard
Using the namespace/pod selector, if the container you are looking at is running on a Karpenter node you will automatically be provisioned a logs scraper via Promtail. Therefore, the containers stdout application logs will be transformed into structured logs and will be visible in the logs section of the app dashboard.
 
As applications dump many logs, there is also the ability to search through the logstream utilizing the following search window, it accepts generic strings.
 
Resulting in all logs containing the string error:
 
Expanding the individual log, there will now be grouped structured log fields that are exposed. You can add to the structured logging by writing more detailed logs in your applications.
 
Pod Stats and Info Dashboard
Please utilize the following selectors to select the namespace, pod, container to view, there are various metrics exposed and visualized throughout the coming dashboards, these are some examples.
 
•	Network Usage: Monitor the network traffic and bandwidth usage of your application.
 
•	RAM Usage: Track the memory consumption to ensure your application is running efficiently.
 
•	Health: Get an overview of the application's health status, including any critical alerts or issues.
 
•	CPU Usage: Analyze the CPU utilization to identify any performance bottlenecks.
 
App Dashboard
Navigating to the App Dashboard will show a comprehensive dashboard for visualizing application resources and logs; it is a combination of all of the above mentioned dashboards with an extra panel for Jaeger Tracing.
Jaeger Tracing
There is one more key service of the observability stack that has not been mentioned, and that is visualizing network information with Jaeger tracing. Tracing as a concept will be covered more in depth in Jaeger.
The following screenshots illustrate a basic workflow of using Jaeger in Grafana to trace and analyze your application's hops across a distributed system:
1.	Jaeger Service: Start by selecting the service you want to trace.
 
2.	Trace Search: Use the trace search functionality to find specific traces based on various criteria.
 
3.	Trace Entry: View the entry point of the trace to understand where the request originated.
 
4.	Client View: Analyze the client view to understand what client made the request.
 
5.	Trace Forward: Follow the trace forward to see how the request propagates through different services.
 
Grafana Alerts
Grafana Alerts enhance our observability stack by providing real-time notifications based on specific conditions within your metrics and logs. We have integrated Grafana alerts with popular communication platforms such as Slack and Microsoft Teams, allowing teams to receive instant updates on critical performance issues, anomalies, or threshold breaches directly in their preferred messaging channels. This integration ensures that relevant team members stay informed and can respond promptly to potential incidents, improving overall responsiveness and reducing downtime. Custom alert rules can be configured based off the below template:
Alerts Template

#We have to establish a heirarchy of contact points for the alerts to be sent to the right teams

kind: ConfigMap
apiVersion: v1
metadata:
  name: grafana-alerting-contact-points
  namespace: monitoring-configs
  labels:
    grafana_alert: "2"
data:
  grafana-alerting-contact-points.yaml: |-
    apiVersion: 1
    policies:
      - orgId: 1
        receiver: catsAlerts
        group_by:
          - grafana_folder
          - alertname
        routes:
          - receiver: catsAlerts
            matchers:
              - grafana_folder = system_services
          - receiver: myAlertsTest
            matchers:
              - grafana_folder = myAlertFolder
    contactPoints:
      - orgId: 1
        name: myAlertsTest
        receivers:
          - uid: my-test-alert
            type: teams
            settings:
              username: grafana_bot
              url: my-teams-webhook
              message: |
                {{ template "my_teams.message" . }}
              title: |
                {{ template "my_teams.subject" . }}
    templates:
      - orgId: 1
        name: my_teams.message
        template: |
          Alert: {{ .CommonLabels.alertname }}
          {{ if .CommonAnnotations.description }}
          Description: {{ .CommonAnnotations.description }}
          {{ end }}
      - orgId: 1
        name: my_teams.subject
        template: |
          {{ define "my_teams.subject" }}
           MY ALERTS
          {{ end }}
Create Custom Dashboard
We are excited to provide a new and enhanced way for our customers to create their own personalized dashboards. The old metrics-edit method has been depricated and been replaced by the following process.
Grafana Organizations
In Grafana, an organization is a logical grouping of users, dashboards, and data sources. It is a way to segment and manage access to resources within a Grafana instance. By using organizations, you can effectively partition a Grafana setup for different teams, departments, or use cases within a single installation. The CATS team utilizes the organizations feature to provide a workspace for each individual application team.
Default Orgs
•	Main Org: This is the default organization for all users. In this location you will find prebuilt dashboards that are applicable to all application teams.
•	Editor Org: This org is the equivelent of our old Metrics-Edit space. Anyone can use this org by default to build and save dashboards. The dashboards in this location will not be wiped and are persistent. Feel free to exirement and create as much as you want in this org. All users have edit permissions on this org so if you want to lock down your dashboard you will need to request the creation of a new organization specifically for your team.
Request Org Creation
Please submit a request to the CATS Platform team in order for us to create you an organization so that you can get started building your Dashboards.
1.	Navigate to our ServiceNow ticket submission page
2.	Select a Platform or Application = CATS Platform
3.	Issue Type = Request for Information
4.	Title = "Grafana Org Creation"
5.	Description = "My team would like an org created for us in Grafana. We would like to designate "Admin's Name" as the administrator for our organization. We would like "Organization Name" to be the name our our organiztion.
Selecting your Org
There is a known grafana based bug when trying to use the org selector button in the top left of your screen, we encourage users to avoid using this selector.
To select an organization click on your profile picture on the top right of the screen and then go to your profile.
 
Once on your profile page scroll down to the bottom of the menu and you will see the list of orgs you are a part of. Select the org you want to open
 
Managing Your Org
Each organization has an initial Administrator designated upon creation.
You can manage the member of your org by clicking on the three bars in the top left corner and selecting "Administration". Note, Please ensure you are in the organization you want to manage when going to this tab.
 
Next got to "Users and Access" and click on "Organization users". This will display all of the users who have access to your org and allow you to specify the permissiosn they have while in your organization.
 
To invite more users simply click "Invite" this will allow you to invite a new user via their email. If the user has already logged into the metrics dashboard before you will be able to look them up by username.
 
How to create a Dashboard
Once you have your organization set up it is very straight forward to set up a dashboard. Ensure you have the desired org open by following the instructions outlined above. You can create a dashboard either in your personal org OR within the Editor Org. Remember, if you create a dashboard in the Editor Org, all users will be able to both see the dashboard, and edit it further if they want to.
1.	Simply navigate to the top left and click on the three lines, and select the Dashboard option
 
2.	Next you simply need to click on "New Dashboard" or "Create dashboard" button to get started
 
3.	click "Add Visualization" to begin adding a something to display the metrics.
 
4.	Select your datasource. You will see "Prometheus" available to use out of the box. You have the ability to add additional data sources if you desire.
5.	Once you are happy with your creation be sure to SAVE your dashboard or else you will lose your hard work!
Official Documentation
Full details on Grafana can be found on their Official Documentation Site.
Edit this page



Jaeger
Jaeger is an open-source, end-to-end distributed tracing system that helps monitor and troubleshoot transactions in microservices-based architectures. It was originally developed by Uber and is a part of the Cloud Native Computing Foundation (CNCF). Jaeger is used for tracking requests as they travel through different services in a distributed system, providing visibility into the system's performance and helping identify bottlenecks, latencies, or errors.
Key features of Jaeger include:
•	Distributed Context Propagation: Follows requests as they traverse different services.
•	Performance Monitoring: Tracks response times, latency, and the duration of individual operations.
•	Root Cause Analysis: Helps identify which component of the system is causing performance issues.
•	Service Dependency Analysis: Visualizes the flow and dependencies between services.
•	Error Detection: Identifies failed or problematic operations across the services.
Using Jaeger with CATS
This guide will walk you through using Jaeger to trace and analyze your application's performance. We will cover selecting a service, filtering by tags and duration, querying for traces, viewing client and forward requests, and comparing two traces.
1. Select a Service
Start by selecting the service you want to trace from the Jaeger UI. This will correspond to the type of ingress you have for your application.

2. Filter by Tags and Duration
Use the filter options to narrow down the traces by specific tags and duration of said traces.

3. Query for Traces
Execute the query to retrieve the traces that match your criteria.
 
4. View Client Request
Select a trace to view the client request details.
 
5. View Forward Request
Follow the trace to view the forward request details.
 
6. Compare Two Traces
Select two traces for comparison to analyze differences in performance and behavior.
 
Edit this page




Loki
Loki is an open-source, log aggregation system developed by Grafana Labs, specifically designed for storing and querying logs. It's part of the observability toolchain and is often used alongside [Prometheus (for metrics) and Grafana (for visualization)]. Loki is highly optimized for Kubernetes environments and aims to be a cost-effective and scalable solution for log management.
Key Features of Loki:
•	Log Aggregation: Loki collects logs from various sources, including Kubernetes pods, servers, and applications, and stores them in a central location. This makes it easy to search and analyze logs across multiple systems.
•	Kubernetes-Native: Loki is designed with Kubernetes in mind. It integrates well with Kubernetes clusters, typically using Promtail (a lightweight log collector) to collect logs from pods and push them to Loki.
•	Scalability: Loki is designed to scale horizontally. It is efficient in how it stores and indexes logs, focusing on low-cost operations by indexing only metadata such as labels (Kubernetes pod names, namespaces, etc.), rather than the full text of the logs.
•	Integration with Grafana: One of Loki's strongest features is its seamless integration with Grafana. Grafana allows users to visualize, explore, and create dashboards for their logs, making it easy to correlate logs with metrics and traces from other sources like Prometheus.
•	Efficient Storage: Unlike traditional log management systems that index the entire contents of logs, Loki uses label-based indexing. This reduces the storage footprint and lowers the costs of operating a log management solution, making it ideal for teams that need large-scale log aggregation without the high operational overhead.
Visualize Logs with Loki on Metrics Dashboard
Loki integrates seamlessly with Grafana, providing powerful log analysis capabilities. With Grafana’s intuitive interface, users can easily visualize, search, and correlate logs with metrics and traces. This makes Loki a central part of your observability stack, providing insights that go beyond metrics and traces alone.
Unified Log Exploration: In Grafana, users can query logs from Loki in real-time using a simple, yet flexible query language. The integration allows you to search logs by labels, such as Kubernetes pod names, namespaces, and other metadata. You can visualize these logs alongside performance metrics from Prometheus and trace data from Jaeger.
Correlating Metrics, Logs, and Traces: One of the key benefits of Loki in Grafana is the ability to correlate logs with metrics (from Prometheus) and traces (from Jaeger). For example, if a metric indicates high CPU usage or errors, you can drill down directly into the related logs to pinpoint the cause. Similarly, if traces show an issue in request flow, you can view the corresponding logs for more detailed context.
Custom Dashboards: With Grafana, you can create custom dashboards that combine logs, metrics, and traces in one view, offering a complete picture of system health and behavior. These dashboards can be tailored to your application's specific needs, making it easier to detect, debug, and resolve issues faster.
Alerting and Notifications: You can configure alerts based on specific log patterns or log levels (e.g., errors or warnings). Grafana’s alerting system allows for notifications via email, Slack, or other communication channels, so teams can proactively respond to issues before they escalate.
Loki's integration with Grafana makes it a key tool in monitoring and troubleshooting your applications, ensuring that logs are not only stored efficiently but also easily accessible and actionable.
How to use Loki in CATS
As there is no user interface for Loki, the only way to query Loki for logs is through Grafana. Please see the Grafana documentation for utilizing the tool.
Official Loki Documentation
For additional information about Loki, see the Official Documentation.



OpenObserve
OpenObserve is the legacy log aggregation and visualization service available on our platform. It provides comprehensive logging capabilities, indexing entire log contents to allow detailed search queries across applications and systems. This tool helps users collect, monitor, and troubleshoot logs from various sources, ensuring operational visibility and aiding in debugging. While it remains fully supported, users looking for a more efficient, Kubernetes-optimized solution may consider transitioning to our newer logging service, Loki, which offers a lighter, more scalable approach to log management. However, OpenObserve continues to be a reliable choice for teams that prefer its detailed log indexing and robust querying features. See our Logging Dashboards page for more details on teh various approaches to logging.
Official Documentation
Please refer to the offical OpenObserve Documentation to better understand how to get the best results when using this service.
OpenObserve Dashboards
Access and analyze logs from your applications and infrastructure in one centralized dashboard, enhancing observability.
•	Logging Dashboard - PRD
•	Logging Dashboard - QA
•	Logging Dashboard - DEV

How to Query in OpenObserve
See the official OpenObserve Documentation for full instructions on how to use this system service.
You can use the following query to get started: (match_all('key-word'))
Example:
 
Edit this page




Opencost : Cost Monitoring Dashboard
Opencost is a cost monitoring tool for workloads running in a Kubernetes cluster. It provides insights into workload spending in your project namespace, allowing you to track and optimize resource usage across your clusters. Whether you're managing costs for development, testing, or production environments, Opencost helps you understand where your resources are being allocated and how to make the most out of your budget. Opencost also provides cost data and metrics associated with cloud compute resources, giving you a more fine-grained breakdown of application cost running in the cloud.
Cloud Cost Integration
This feature incorporates AWS Cost and Usage Report (CUR) data directly into the Opencost instances. By reconciling Opencost’s calculated metrics with AWS billing data, this integration significantly improves the accuracy of cost reporting. Additionally, it provides application teams with visibility into other AWS resources used within their applications that are not accounted for in the native Kubernetes resource allocation costs. This feature delivers a detailed and accurate cost breakdown for each application or cost center within the cluster.

Navigating the Opencost Dashboard
The Opencost dashboard for each cluster can be accessed as follows:
•	Dev
•	Qa
•	Prod
The main dashboard displayed by Opencost on initial page load is the "Cost Allocations" dashboard. This dashboard provides a high-level cost showback of workload compute and storage resources across the cluster broken down by Namespaces by default. You can customize the date range, aggregation concept, resolution type, and currency via the dropdown panels at the top of the dashboard.
 
To understand more about the cloud cost spending of your resources, select the "Cloud Costs" dashboard from the left navigation bar. This dashboard provides a cost breakdown of cloud resources that have been integrated into the cluster to support different types of workloads and use cases.
 
NOTE
The AWS CUR data integration and ingestion process typically takes up to 48 hours to complete. If you want to view the reconciled cost for a specific day, come back to the dashboard two days after for more accurate cost breakdown.
Grafana dashboard for Cost Observability
Due to several limitations of the default Opencost dashboard, we have integrated and customized some Grafana dashboards that provide a more detailed breakdown of your workload costs within the cluster. We highly recommend application teams to use Grafana as the preferred dashboarding solution for observing their project workload spending as we build out more robust and comprehensive cost observability dashboards as a platform service.
To access the different cost overview dashboards that we have imported on Grafana, you can check them out here:
•	Dev
•	Qa
•	Prod
Edit this page




Prometheus
Prometheus is a powerful open-source monitoring and alerting toolkit designed for recording real-time metrics in a time-series database. Our implementation of Prometheus serves as the backbone of our Grafana dashboard visualization tool. Prometheus is continuously scraping metrics from various sources, including applications, infrastructure components, and Kubernetes clusters. This enables teams to gain deep insights into system performance, resource utilization, and overall health. Prometheus’s robust querying capabilities allow users to create custom metrics visualizations and set alerts based on key performance indicators (KPIs). With its efficient data collection and storage model, Prometheus ensures that our users have access to the critical information needed for proactive monitoring and optimization of their applications on the CATS platform.
How to use Prometheus in CATS
As there is no user interface for Prometheus, the only way to query Loki for metrics is through Grafana. Please see the Grafana documentation for utilizing the tool.
Official Documentation
For more information please review the offical Prometheus Documentation on their webiste.
Edit this page




System Service Overview
CATS is equipped with a comprehensive suite of services designed to empower our application teams, providing a rich, out-of-the-box experience that facilitates development, deployment, and monitoring.
Each service is designed to enhance your productivity and streamline your operations, ensuring you have the tools you need to succeed. Embrace the full potential of CATS and transform your application development and deployment processes.
Use the below table for a quick look at what Services we have available and the purpose of each service.
System Service	Description
Argo
Auto Deployment Tool. Declarative, GitOps continuous delivery tool for Kubernetes, automating application deployments.
Backstage
A developer portal Lilly is utilizing to catalog software assets for re-use, speed up software development with accelerators, and more.
Bouncer
Authentication Service. Provides robust authentication services to secure application access.
Crossplane
Auto Resource Deployer. Automates the deployment of cloud resources across multiple providers, simplifying cloud-native application management.
Self Service Toolkit
A toolkit that provides easy self-service access and management capabilities for external resources within the cluster
Flux
Auto Deployment Tool. Automates deployment to Kubernetes, monitoring Git repositories for changes and applying them.
Github Repositories
Lists all GitHub repositories associated with the platform.
Kafka
A powerful distributed streaming platform that facilitates high-throughput, fault-tolerant messaging systems.
Karpenter
A Kubernetes-native node autoscaler that provisions nodes based on workload demands, optimizing cluster efficiency.
PGadmin
A web-based administration tool for managing PostgreSQL databases deployed on the platform.
Reloader
A Kubernetes operator that automatically updates pods when changes are made to their ConfigMaps and Secrets.
Restful SDK
Provides lightweight SDKs for integrating Python and R applications with the platform.
Smarter Device Manager
Runs as a DaemonSet within the cluster, exposing hardware devices (Linux device drivers) to your pods.
Send Emails
Enables applications to send emails using configured SMTP services, integrated with your deployments.
Wave
Auto Deployment Tool. Enables automatic deployment of apps on secret changes, with a controller to handle updates.
Requesting New Services
We invite you to communicate any requests for system-level services not currently available within our cluster to the CATS Platform Team. To ensure effective prioritization and allocation of our resources, we kindly request the submission of a comprehensive business case alongside endorsements from multiple application teams for each request. This collaborative approach allows us to confirm the broader utility and ensures our efforts are aligned with supporting the collective needs of our users, rather than focusing on singular application teams.
Our goal is to maximize the impact of our work by catering to the requirements that benefit a wide array of teams. We appreciate your understanding and cooperation in providing the necessary details for your requests.
Edit this page




Argo : Declarative GitOps Tool
Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes. It automates the deployment of applications to various environments by using Git repositories as the source of truth for defining the desired application state. Argo CD follows the GitOps principles, where updates to applications are made by changing the code in Git, and the tool automatically applies these changes to the target environment, ensuring that the live state in the cluster always matches the version-controlled configuration.
Using Argo in CATS
Enabling Argo for Your Application
To enable Argo for your solution you will need to add an annotation to your namespace. Find more information around how to configure this annotation HERE
Permissions by Role
Note: For information on Argo's RBAC Config please scroll down to Argo Concepts > RBAC Configuration
Resource	Action	Context	Read-Only	Admin	Support
Project	List	All	X	X	X
	View	All	X	X	X
	Modify	All			X
Accounts	List	All	X	X	X
	View	All	X	X	X
	Modify	All			X
	Delete	All			X
Accounts.Tokens	Get Token	All			X
	Create Token	All			X
	Delete Token	All			X
Clusters	List	All			X
	View	All			X
	Modify	All			X
	Delete	All			X
Certificates	List	All			X
	View	All			X
	Create	All			X
	Modify	All			X
	Delete	All			X
GnuPG Keys	List	All			X
	View	All			X
	Create	All			X
	Modify	All			X
	Delete	All			X
Repositories	List	All	X	X	X
	View	All	X	X	X
	Create	All			X
	Modify	All			X
	Delete	All			X
Resource	Action	Context	Read-Only	Admin	Support
Application	List	Owned Projects	X	X	X
	View	Owned Projects	X	X	X
	Delete	Owned Projects			X
	Deployment/Restart	Owned Projects		X	X
	DeamonSets/Restart	Owned Projects		X	X
	Sync	Owned Projects		X	X
	Rollback (Redeploy)	Owned Projects		X	X
	Refresh	Owned Projects		X	X
	Logs	Owned Projects	X	X	X
	Exec	Owned Projects		X	X
	List	All Projects	X	X	X
	View	All Projects	X	X	X
	Delete	All Projects			X
	Sync	All Projects			X
	Rollback (Redeploy)	All Projects			X
	Refresh	All Projects			X
	Logs	All Projects			X
	Exec	All Projects			X
Resource	Action	Context	Read-Only	Admin	Support
ApplicationSet (disabled)	List	Owned Projects			X
	View	Owned Projects			X
	Modify	Owned Projects			X
	Delete	Owned Projects			X
	List	All Projects			X
	View	All Projects			X
	Modify	All Projects			X
	Delete	All Projects			X
Custom Role
Currently We do not allow custom configurations for your Argo Roles. This may come in a future release. If this is something you want to see prioritized please bring it up in CATS club!
Argo Dashboard
The Argo CD dashboard provides a comprehensive and user-friendly web interface that allows users to manage and monitor their applications' deployment process in Kubernetes clusters efficiently.
•	DEV Cluster Dashboard
•	QA Cluster Dashboard
•	PROD Cluster Dashboard
Views Available
Tree View

When navigating to the dashboard you will land on the "Applications" page. On this page you can see all the "applications" or namespaces that are within the cluster you are working in. Security is set so that you should only see the namespaces associated with you.
After selecting an application tile it will open the resource tree associated with the namespace. Here you can see all the resources associated with your namespace and how they roll up to the top level "application" resource.
On the Cards representing each of your resources you can see some visual cues that provide immediate visual feedback on the state of your resources, if they are synced, OutOfSynce, progressing, healthy or failed and more! Understand what each icon means by expanding the sidebar on the left.
Click into individual resources to find more details and logs on specific resources.

Pod View

This view displays all the pods associated with your application and allows you to group them via different filters:
•	Node
•	Parent Resource
•	Top Level Resources
To open a specific pod you should hover over the green checkbox. Details around the individual pod will appear and allow you to better understand which pod you are selecting. To look at the full description of the pod click the green checkbox.
When clicking into a pod you can see three tabs, Summary, Events, and Logs.
Summary: Includes the latest manifest that is deployed and active in the cluster. Here you can ensure you have configured the resource correctly and that your most recent configurations are live in the cluster.
Events: This section is where startup events are logged. If your resource is having trouble deploying, this is where you will see those errors. For pods you may see issues around pulling an image or node scheduling issues here. Issues on this side often indicate there is an issue on the resource configuration side of your deployment. Look through our troubleshooting Docs to see if the error you are facing has a solution documented.
Logs: This section includes the pod logs. These are the logs that are produced by the pod itself after starting up successfully. Errors in this section usually indicate there is an issue on the application side of your deployment.

Network View

Use this view to troubleshoot network ingresses Ensure everything is connected as anticipated Selecting an ingress opens up the configuration and you can ensure your host is working. Use this to figure out where is the missing connection.
The Network View can be helpful to users who are troubleshooting ingress routes as they show the flow of network traffic from ingress resources through a service to the pod that the service is pointing to. Breaks in this flow likely indicate a configuration issue on one or both of the indicated resources.
You can use this view to verify the network flow is implemented as you intend. When selecting an ingress resource card you can see two options, Summary and Events.
Summary: Includes the latest manifest that is deployed and active in the cluster. Here you can ensure you have configured the ingress resource correctly and that your most recent configurations are live in the cluster.
Events: This section is where start up events are logged. If your ingress is having trouble deploying this is where you will find the errors. Issues on this side often indicated there is an issue on the resource configuration side of your deployment. Look through our troubleshooting docs to see if the error you are facing has a solution documented.

List View

This view is a basic view that lists out all of the individual resources that are a part of your application. This is a table of all your items in a single location. If you know what you are looking for this may be a fast way to jump directly to the resource you are searching for.

Sidebar
On the left side of the screen you can find the side bar. You may need to expand it if you do not see all of the options.
FILTERS
Depending on what view you have selected you can use the filters in the Sidebar to filter what resources are displayed in your main view. You can also find the definitions for the different icons that appear on your resource cards to give you visual feedback.
SYNC STATUS:
Whether or not the live state matches the target state. Is the deployed application the same as Git says it should be? If correctly applied status is Synced. If not correctly applied Out of Sync.

HEALTH STATUS:
•	Healthy - the resource is healthy
•	Progressing - the resource is not healthy yet but still making progress and might be healthy soon
•	Degraded - the resource is degraded
•	Suspended - the resource is suspended and waiting for some external event to resume (e.g. suspended CronJob or paused Deployment)
•	Missing - the resource is missing but Argo CD believes it should still exist.
•	Unknown - Argo does not know the health status of the resource.

Refresh Resources
Use the Refresh Resources button at the top of your view to get the most up-to-date manifests from github and execute a diff on manifests active in the cluster and current in github. This will allow you to know if your resources are in sync or not.
Refresh: Fetches the latest manifests from git and compares diff.
Hard Refresh: Argo CD caches the manifests, and a hard refresh will invalidate this cache.
Sync Resources
Sync: Executing a sync reconciles the current cluster state with the target state in git.
Out of Sync Status: Resources become out of sync when Argo detects a difference between the active manifest in the cluster and the current manifest detected in github.
You can fix Out of sync resources by using the Argo Dashboard's Sync function. There are two ways to sync Out of Sync resources, by either syncing individual resources that are out of sync or syncing the entire project.
Sync All Resources in your Project
1.	When in the Tree View and looking at all of your projects resource cards, click the Sync Button at the top
2.	Depending on the issue that you are facing causing the out of synSelect one of the following options
o	Prune: Remove Objects that are dangling. Trim Off the stuff that should not be there anymore. Remove everything with a trash can icon.
o	Dry Run: Give you a chance to try out the action before actually doing it.
o	Apply Only: It will not create new objects but will only update existing options.
o	Force: Makes changes and disregards potential errors
3.	Select a Prune Propagation Policy
o	Foreground: In this policy, when you delete an object, the deletion process enters a "foreground deletion" state. First, the object is marked as "deleting" by setting its metadata.deletionTimestamp field, which signals that the object is in the process of being deleted. The system then deletes all the dependent objects (those that specify the object as an owner in their metadata.ownerReferences). The original object is only removed after all its dependents are deleted. This policy is useful when you need to ensure that all dependent resources are cleanly and completely removed before the primary object is deleted.
o	Background: When using the background deletion policy, after you delete the primary object, it is immediately removed. However, the garbage collector will then asynchronously clean up all dependent objects in the background. This means the primary object gets deleted first without waiting for its dependents to be deleted. This policy is useful for quicker deletions of the primary object while not needing to manage the cleanup process yourself.
o	Orphan: With the orphan deletion policy, when you delete an object, its dependents are not deleted. Instead, they are "orphaned," meaning they will remain in the cluster but will no longer have an owner. This policy is useful if you want to delete an object but keep its dependents running, possibly to attach them to another parent object later.
4.	Select which resources to Synchronize in the Synchronize Resources Section
o	All: Selecting All will apply the change to all of the resources in your application.
o	Out of Sync: Selecting Out Of Sync will apply the change to all of the resources with the Out of Sync status.
o	None: Selecting None will deselect all resources.
o	Manual Selection: You also have the option to scroll through and manually check the boxes for the resources you want to apply the change to.

Sync One Resource in your Project
1.	Expand the Resource Card that is out of sync
2.	In the top right corner you will see the sync button, click it
3.	Depending on the issue that you are facing causing the out of synSelect one of the following options
o	Prune: Remove Objects that are dangling. Trim Off the stuff that should not be there anymore. Remove everything with a trash can icon.
o	Dry Run: Give you a chance to try out the action before actually doing it.
o	Apply Only: It will not create new objects but will only update existing options.
o	Force: Makes changes and disregards potential errors
4.	Select a Prune Propagation Policy
o	Foreground: In this policy, when you delete an object, the deletion process enters a "foreground deletion" state. First, the object is marked as "deleting" by setting its metadata.deletionTimestamp field, which signals that the object is in the process of being deleted. The system then deletes all the dependent objects (those that specify the object as an owner in their metadata.ownerReferences). The original object is only removed after all its dependents are deleted. This policy is useful when you need to ensure that all dependent resources are cleanly and completely removed before the primary object is deleted.
o	Background: When using the background deletion policy, after you delete the primary object, it is immediately removed. However, the garbage collector will then asynchronously clean up all dependent objects in the background. This means the primary object gets deleted first without waiting for its dependents to be deleted. This policy is useful for quicker deletions of the primary object while not needing to manage the cleanup process yourself.
o	Orphan: With the orphan deletion policy, when you delete an object, its dependents are not deleted. Instead, they are "orphaned," meaning they will remain in the cluster but will no longer have an owner. This policy is useful if you want to delete an object but keep its dependents running, possibly to attach them to another parent object later.
5.	Select which resources to Synchronize in the Synchronize Resources Section
o	All: Selecting All will apply the change to all of the resources in your application.
o	Out of Sync: Selecting Out Of Sync will apply the change to all of the resources with the Out of Sync status.
o	None: Selecting None will deselect all resources.
o	Manual Selection: You also have the option to scroll through and manually check the boxes for the resources you want to apply the change to.
Auto Sync
Auto Sync is a powerful feature in Argo CD that automatically applies changes from your Git repository to your Kubernetes cluster when changes are detected. This eliminates the need for manual synchronization after each code update, ensuring your cluster always reflects what's defined in your Git repository (GitOps approach). By default, when applications are first created, Auto Sync is disabled and must be explicitly enabled.
Verify Auto Sync Status
You can verify if Auto Sync is enabled for your application by checking the App Details in the Argo CD dashboard:
 
When Auto Sync is enabled, you'll see "AUTOMATED" displayed in the Sync Policy section, along with any enabled options such as Prune or Self-Heal.
 
When Auto Sync is disabled, you'll see a blank or "Manual" Sync Policy, requiring you to manually synchronize when changes are detected.
Enable/Disable Auto Sync
How to Enable Auto Sync
You can enable Auto Sync in one of the following ways:
•	Using the Argo CD Dashboard:
i.	Go to your application in the Argo CD UI
ii.	Select the "App Details" tab
iii.	Click "Enable Auto-Sync" in the Sync Policy section
iv.	Optionally select additional options (Prune, Self-Heal)
v.	Click "Save"  
How to Disable Auto Sync
To disable Auto Sync for an application, use one of the following methods:
•	Using the Argo CD Dashboard:
i.	Go to your application in the Argo CD UI
ii.	Select the "App Details" tab
iii.	Click "Disable Auto-Sync" in the Sync Policy section
iv.	Click "Save"  
Auto Sync Privileges
In CATS, only users with Admin roles can enable or disable Auto Sync for applications in their owned projects. Users with Read-Only access cannot modify sync policies. This is in line with the permissions table presented earlier in this document where only Admin roles can perform "Sync" actions on applications.
Admin privileges are granted to users who belong to the AD groups specified in the namespace annotation. The application teams can configure which AD groups have read-only access and which have admin access using the following namespace annotation:
metadata:
  annotations:
    app.lilly.com/argo.config: |-
      {
          "roles": {
              "readADGroups": [ "<dev-group>" ],
              "adminADGroups": [ "<admin-group>" ]
          }
      }
Only users who belong to the AD groups listed in adminADGroups can:
•	Enable or disable Auto Sync
•	Configure sync options like Prune and Self-Heal
•	Perform manual synchronization operations
This ensures that only designated administrators within your team can manage the synchronization behavior of your applications, providing an additional layer of control over your deployment process.
Auto Sync Options
You can further customize Auto Sync behavior with the following advanced options:
Prune Resources
Enables automatic deletion of resources that no longer exist in Git. Without this option, resources that are removed from Git will remain in your cluster even when Auto Sync is enabled.
Self-Heal
Automatically triggers a sync when Argo CD detects that the live state in the cluster differs from the desired state in Git, even if the change was made directly to the cluster (outside of Git). This ensures your cluster always matches Git even if someone makes manual changes to the cluster.
Get Logs
In order to find the logs from your pods you will need to navigate to the pod you are looking for and open it up to find the logs tab.
You can navigate to the pod via its resource card through the tree view or to the pod through the pod view outlined above
Once you have the pod resource you want opened you should see three tabs, Summary, Events, and Logs
Note: When you view logs from a resource that is the parent of multiple resources then all of the logs of the resources that roll up to the resource you are viewing will be included in the logs.
Get Events
In order to find the events on a resource navigate to your preferred view and open the desired resource. Once open navigate to the events section.
The Events section is where start up events are logged. If your resource is having trouble deploying, this is where you will see those errors. For pods you may see issues around pulling an image or node scheduling issues here. Issues on this side often indicated there is an issue on the resource configuration side of your deployment. Look through our troubleshooting docs to see if the error you are facing has a solution documented.
Restart Resource
The following instructions will help you restart a deployment or a deamonset. You may only restart your deployments and deamonsets. You cannot restart individual pods and must restart the parent deployment resource.
Option 1:
1.	Expand the Deployment Resource Card that you would like to restart.
2.	In the top right corner you will see the three dots, click the three dots and the restart button will appear.
Option 2:
1.	When viewing all of the resources within your project/namespace in the Tree View of the argo dashboard find the deployment resource you would like to restart.
2.	Without expanding the resource card click the three dots. In the dropdown you will find the restart button. Click it to restart.
Exec into Pod
The following instructions will help you exec into a pod within your namespace.
1.	Expand the specific Pod Resource Card that you would like to exec into.
2.	In the top right corner you will see the three dots, click the three dots and the exec button will appear. Click the button to get into the pod!
Delete Resource
There is a delete button. This button will delete your selected resource. We suggest you do not click this button. According to how we have permissions set, this button should not work for you anyways!
Use at your own risk!

Argo Concepts
Project (top level element)
Official documentation for Argo Projects
Projects provide a logical grouping of applications, which is useful when Argo CD is used by multiple teams. Projects provide the following features:
•	restrict what may be deployed (trusted Git source repositories)
•	restrict where apps may be deployed to (destination clusters and namespaces)
•	restrict what kinds of objects may or may not be deployed (e.g. RBAC, CRDs, DaemonSets, NetworkPolicy etc...)
•	defining project roles to provide application RBAC (bound to OIDC groups and/or JWT tokens)

Projects provide a logical separation of GitOps configuration for the following elements
•	Source VCS Repositories (only EliLillyCo Github repositories are in scope)
•	Destinations for resource deployment, composed of:
o	a Kubernetes cluster (only the CATS cluster where Argo is deployed is in scope)
o	a Kubernetes namespace
•	Project-level Roles
Application (belongs to one Project)
Official documentation for Argo Applications
Applications provide a mapping from a declared cluster state (VCS like Github) to a Kubernetes cluster's active state. They are composed of two elements:
•	Destinations for resource deployment, composed of: (same as project)
o	a Kubernetes cluster (only the CATS cluster where Argo is deployed is in scope)
o	a Kubernetes namespace
•	Project the application belongs to
•	Source
o	What Github repo and which branch of that repo?
o	What path to locate desired files?
o	What kind of files to bring in?
•	Sync Policy
o	Defines a strategy to reconcile VCS state to live cluster state
o	Defines Argo controller behavior when resources drift apart
o	Defines the lifecycle of resources after the application is removed
RBAC Configuration
Official documentation for Argo RBAC
This section describes how the Role-Based Configuration is set up in the CATS Platform's infrastructure code. Please note that application teams do not have the ability to create custom roles but must assume one of the two prebuilt roles (Read-Only, Admin) that are offered out of the box. For transparency and an enhanced understanding we have outlined the components that make up Argo Roles below:
•	Roles: a set of roles for the project to use
o	Name: logical name of the role
o	Groups: users with these AD Groups will have access to this role
o	Policies: set of statements that map the role to actions or other groups in Argo
•	Policy: an action that a role can use
o	Type: either p (permission) or g (group)
o	Grantee <role/user/group>: the entity that is targeted by the policy, for example: proj:<project-name>:<role-name>
o	Resource: the resource targeted by the policy, either an Argo resource (applications) or another role (proj:<project-name>:<role-name>)
o	Action: the granted action, which depends on what resource is targeted
o	Context: where this policy can be applied
o	Grant Type: either allow or deny
Edit this page
V




Bouncer : Authentication Service:
Secure your applications with Bouncer, providing robust authentication services to safeguard access.
Bouncer is authorization service that uses Microsoft Graph & K8s to provide easy authorization for microservice applications. All documentation around bouncer and how it works is located within the bouncer repository itself.
•	Bouncer Repository Source Code located: HERE

Authenticated Patterns
There are five different authentication patterns available for developers implementing an authenticated route. All route authentication is enabled via the Bouncer system service. Head on over to the Bouncer repository for more information on these different authentication patterns.
•	Standard Web Pattern
•	Azure APIM and Entra ID
•	Client Credentials
•	On Behalf of User (API)
•	AWS STS
Using Bouncer with Entra ID and Azure APIM
Application teams can use bouncer to pass Entra ID tokens. Please see full instructions and documentation on how to implement this pattern by navigating to the README.md on the bouncer repository.
Bouncer Logs
Logs from bouncer are stored in AWS CloudWatch and can be referenced and searched. See below details for the logs location and query instructions.
Logs Location
Some users may want to query the Bouncer Service's logs during troubleshooting. To find the logs you will require having a CA account.
1.	Log into the Cluster you want to get the logs from. Dev / QA / PRD
2.	Navigate to the S3 service page
3.	Go to Buckets
4.	Go to the correct bucket that has the bouncer-access-logs prefix. In Dev Cluster the bucket is lly-light-access-logs-dev
5.	Navigate to the bouncer-access-logs prefix.
6.	Navigate to the year you are targeting
7.	Navigate to the month in that year you are targeting
8.	Navigate to the day in that month you are targeting
If you want to get meaningful information from these logs you will need to run Athena queries against them.
Query Against Bouncer Logs
Note: For Extensive Documentation on how to use Amazon Athena you can go here: https://docs.aws.amazon.com/athena/latest/ug/getting-started.html
1.	To execute queries against the bouncer logs you will need to navigate to the AWS Service "Amazon Athena"
2.	Once there you will see the Query Editor
3.	Before you run your first query, you need to set up a query result location in Amazon S3.
4.	For Data Source you will select AwsDataCatalog
5.	For database you will select cats_access_logs
6.	Now you can write your Query via SQL




Flux : Auto Deployment Tool
Flux V2 is an open source second iteration of the Flux gitops toolkit. The service provides a full gitops suite but we have relegated most of the GitHub repository syncing to ArgoCD. Specifically we utilize two specific aspects of Flux V2 namely the image repository and the image reflector to create custom resource definitions to enable automatic image rollout based on diffs in the AWS ECR.
Repositories Related to Flux Implementation:
Helm Charts -> https://github.com/EliLillyCo/fluxcd-community_helm-charts
Image reflector Controller -> https://github.com/EliLillyCo/fluxcd_image-reflector-controller/tree/main


Simple Flux Annotation
The following lines enable Flux to automatically find your latest image in the ECR and deploy it to a new pod. If the deploy is successful the old pod will be deleted and a seamless transition between the two images will happen. If you did not make any changes when implementing the GitHub actions automation code above, then the pattern sha-.* should work out of the box:
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.<policy-name>: "<aws-account-number>;<your-repo-name-in-ecr>;glob:<tag-pattern>"
    # Example: app.lilly.com/flux.simple.docs-policy: "283234040926;lrl_light_k8s_infra_apps_catsdocs;glob:sha-.*"
    wave.pusher.com/update-on-config-change: "true"
<aws-account-number> - Default to "283234040926" for AWS Prod Cluster. You may use a different account number if you are pulling from a non CATS AWS Account's ECR. It is possible to pull your solutions image from any ECR... BUT if you do that the CATS Support team is severely limited in our ability to troubleshoot issues that may arise. We HIGHLY suggest pushing your image to one of the following accounts:
    - PRD ACCOUNT : 283234040926
    - QA ACCOUNT : 474366589702
    - DEV ACCOUNT : 408787358807

<your-repo-name-in-ecr> - This is the name of your repository in AWS ECR. In the example you can see we are using the catsdocs repo name.
Your projects ECR repo name will usually be the GitHub repository name in lowercase. Sometimes special characters such as spaces can be changed to underscores.
To find your specific name if you are not sure, you can navigate to your GitHub actions tab and go to the "Build and Push Image" step.
To be 100 percent certain what your name is you can log into the AWS console, navigate to ECR, and look up your repo there. This method requires a CA account.

<policy-name> - A unique policy name within your namespace. Chosen by you. It is arbitrary. Avoid special characters.

<tag-pattern> - This is where you declare the sha tagging pattern you are using in your GitHub workflow file. Example: "sha-.*"
This pattern must match the pattern you are using in your workflow file or the automation will not work.

<$imagepolicy> - Update the comment with your namespace name and image policy you define in the flux annotation to properly allow automated deployments. This comment is used by the Light Account butler. He needs the info for commit messages to work correctly.
Template:
  image: <container-image> # {"$imagepolicy": "<namespace-name>:<policy-name>"}
Example:
  image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_falcon_bartender:qa-sha-06c5953 # {"$imagepolicy": "falcon-qa:my-policy-bartender"}

Custom Flux Annotation
The following annotation is a custom version of the simple annotation. This custom annotation allows you to manually provision repositories and repository policies if a more custom implementation is needed. 99% of users will not need to use this and should stick with the simple annotation pattern.
annotations:
        app.lilly.com/flux.automated: "true"
        app.lilly.com/flux.v2.repos: |
            [
                {
                    "name": "repo-1",
                    "image": "408787358807.dkr.ecr.us-east-2.amazonaws.com/flux-testing",
                    "injectCreatedAt": "true",
                    "provider": "aws", optional
                    "policies": [
                        "policy-1"
                    ]
                }
            ]
        app.lilly.com/flux.v2.policies: |
            [
                {
                    "name": "policy-1",
                    "policy": {
                        "alphabetical": {
                            "order": "asc"
                        }
                    },
                    "filterTags": {
                        "pattern": "^dev-(?P<timestamp>\d+)$",
                        "extract": "$timestamp"
                    }
                }
            ]
Edit this page




Wave : Auto Deployment Tool
Enable auto deploy of app on secret change
By default, K8s does not re-deploy the pods in a deployment if a secret referenced in an environment variable or mounted in a container changes.
Wave is a controller that handles this update process. It has been deployed in this cluster & can be used by apps.
To enable Wave's syncing process for your app, add the below annotation to your deployment config:
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
    wave.pusher.com/update-on-config-change: "true"
Edit this page




Kafka
Overview
Apache Kafka is a powerful distributed streaming platform that facilitates high-throughput, fault-tolerant messaging systems. Deployed as a system service in a Kubernetes cluster, Kafka can significantly enhance data processing and integration capabilities, serving as the backbone for event-driven architectures. Within Kubernetes, Kafka can be used to reliably process and distribute a vast stream of data across various services and applications, ensuring real-time data flow and enabling microservices to communicate efficiently through publish-subscribe messaging patterns. This setup is particularly useful for building scalable, resilient applications that require real-time data processing, analytics, and monitoring in a distributed environment. By leveraging Kafka within Kubernetes, organizations can achieve more dynamic, loosely coupled architectures that can easily scale to meet demand.
Kafka Configuration in Kubernetes
Basic Kafka Configuration
Configure Kafka producers and consumers within your applications. Details such as bootstrap servers, topic names, and security settings are specified in your application's configurations.
Kafka Security
Kafka supports SSL and SASL for security. Configure these in your Kafka brokers and clients. Use Kubernetes Secrets to store sensitive information like SSL keystrokes and SASL credentials.
Example
ConfigMap for Kafka Configuration:
apiVersion: v1
kind: ConfigMap
metadata:
  name: kafka-config
data:
  server.properties: |
    # Kafka configuration
    broker.id=0
    listeners=PLAINTEXT://:9092
    log.dirs=/var/lib/kafka/data
    num.partitions=1
    zookeeper.connect=zookeeper:2181
This ConfigMap contains the server.properties file used by Kafka brokers. The properties include the broker ID, listener configurations, log directory, number of partitions, and the Zookeeper connection string. Modify these properties according to your specific requirements.
StatefulSet for Kafka Brokers:
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: kafka
spec:
  serviceName: "kafka"
  replicas: 3
  selector:
    matchLabels:
      app: kafka
  template:
    metadata:
      labels:
        app: kafka
    spec:
      containers:
      - name: kafka
        image: bitnami/kafka:latest
        ports:
        - containerPort: 9092
        volumeMounts:
        - name: kafka-config
          mountPath: /opt/bitnami/kafka/config/server.properties
          subPath: server.properties
        - name: data
          mountPath: /var/lib/kafka/data
      volumes:
      - name: kafka-config
        configMap:
          name: kafka-config
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
This StatefulSet defines a Kafka cluster with 3 replicas. It mounts the kafka-config ConfigMap to configure each broker. The volumeClaimTemplates section ensures that each broker pod has persistent storage attached to it. Update the replicas, storage requests, and other specifications as necessary for your environment.
Service for Kafka Broker Discovery:
apiVersion: v1
kind: Service
metadata:
  name: kafka
spec:
  ports:
  - port: 9092
  clusterIP: None
  selector:
    app: kafka
This headless service facilitates the discovery of Kafka brokers within the cluster. By setting clusterIP: None, Kubernetes allows each pod to have its own unique IP address, which is crucial for the stable identification of each broker across restarts.
Summary
1.	ConfigMap (kafka-config): Stores the Kafka server configurations. It's mounted into the Kafka brokers to configure them on startup.
2.	StatefulSet (kafka): Manages the Kafka broker pods. It uses persistent storage to ensure that data is not lost between pod restarts. The configuration is applied from the mounted ConfigMap.
3.	Service (kafka): A headless service that provides a stable network identity for the brokers. This allows Kafka clients and other brokers to communicate with each member of the StatefulSet using a consistent DNS name.
Edit this page




Karpenter
Overview
Karpenter is an open-source Kubernetes cluster autoscaler designed to automatically adjust cluster capacity based on the workload's needs. It dynamically provisions and scales nodes by considering pod specifications and optimizing for cost, performance, and scheduling efficiency. Unlike traditional Kubernetes autoscalers, Karpenter directly integrates with the cloud provider (in our case AWS) to provision the right instance types and sizes, ensuring that workloads are placed on appropriately scaled infrastructure without manual intervention. This helps improve resource utilization, lower costs, and reduce latency in scaling operations.
CLICK HERE to see the official Karpenter Documentation.
Resources
Ec2NodeClass
Node Classes enable configuration of AWS specific settings. Each NodePool must reference an EC2NodeClass using spec.template.spec.nodeClassRef. Multiple NodePools may point to the same EC2NodeClass. This resource will always be managed by the CATS Platform team as it is analagous to EC2 Launch Templates, which control setting related to node security, allowed AMI images, and networking.
NodePool
NodePools set constraints on the nodes that can be created by Karpenter and the pods that can run on those nodes. A NodePool can be set to do things like:
•	Define taints to limit the pods that can run on nodes Karpenter creates
•	Define any startup taints to inform Karpenter that it should taint the node initially, but that the taint is temporary.
•	Limit node creation to certain zones, instance types, and computer architectures
•	Set defaults for node expiration
Default NodePools
A set of default NodePool resources is made available to all application teams of the CATS platform. These NodePools always select Bottlerocket-enabled Ec2NodeClasses to provide enhanced security for scheduled workloads. Two sets of NodePools are configured, one for general-purpose workloads and another for accelerated (GPU-enabled) workloads. A list of the available configurations is maintained in our system-services repository here. NodePools prefixed with system-service identify the defaults.
Custom NodePools
Custom NodePools may be enabled for application teams using our infrastructure as code Karpenter manifest generator. These requests are handled by the platform team on behalf of application teams. Requests for custom NodePools may be sent to CATS_Support@lilly.com. In order to best understand your needs, the minimum amount of information is required:
•	limit of total vCPU
•	limit of total memory (in Gi)
•	limit of total GPUs
•	suggested instance families (see this AWS document for reference)
•	extra node taints
•	extra node labels for selectors to leverage
Wherever possible, we recommend leveraging the default NodePools as this provides a more efficient utilization of provisioned cluster resources. The platform team may help to make recommendations based on additional constraints and security requirements.
Using Karpenter With CATS
Scheduling
See Compute and Workload Scheduling for information on how to use AWS Karpenter nodes.
Self-guided Workshop
To get started with Karpenter on the CATS platform, we recommend first completing the self-guided workshop provided by the platform team. This workshop is designed to help new application developers gain a comprehensive understanding of Karpenter and how to leverage it effectively for various use cases. The workshop includes a GitHub repository that you will clone locally and work through. Detailed instructions are available in the README.md file within the repository, guiding you through the process step by step. Completion of this workshop will equip you with the necessary knowledge to successfully utilize Karpenter on the CATS platform.
CLICK HERE to navigate to the CATS Karpenter Workshop.
Edit this page



PGAdmin
pgAdmin is an open-source, web-based administration and development platform for PostgreSQL, the advanced open-source relational database system. It provides a graphical interface that allows database administrators and developers to interact with PostgreSQL databases through their browser. With pgAdmin, users can manage, maintain, and monitor PostgreSQL databases from anywhere, without the need for command-line tools.
Option 1
The same credentials used by your CATS application to connect to your database (DB) can also be used in the PGAdmin app running here: http://pgadmin.apps.lrl.lilly.com/
Expectation
If you follow this guide you will be able to go to http://pgadmin.apps.lrl.lilly.com/ and automatically log in to a a PGAdmin session connected to one or more database servers.
Get AD group access for your users
Users must belong to one of the AD groups found in the ingress defined in LRL_light_k8s_infra_apps/projects/system_services/pgadmin.yml.
Configure pgadmin.yml
Connecting PGAdmin to your DB requires some configuration under the db_access_rules of the ConfigMap: LRL_light_k8s_infra_apps/projects/system_services/pgadmin.yml. To create a new connection from PGAdmin to your DB you need to get your application's namespace, your Kubernetes secret, and your secret keys. You will also need a list of user emails that you want to grant access to the database.
apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
  namespace: db-management-prd
data:  
  db-config.yaml: |
    db_access_rules:
    - namespace: <app-namespace>
      secret: <secret-name>
      fields:
        user: <user-key>
        password: <password-key>
        host: <host-key>
        port: <port-key>
        database: <database-name-key>
      users:
      - user1@lilly.com
      - user2@lilly.com
Option 2
This option is used to run your own PGAdmin instance in your namespace, using an AD Group for authentication.
Replace angle brackets and variable names with corresponding values in the template, below.
Variable	Description	Occurrences
<namespace-name>	Your namespace name.	6
<server-name>	The name you want your databases listed under in the Servers group.	1
<pod-name>	The name you want to give your pod.	7
<rds-secret-name>	The name you assigned under writeConnectionSecretToRef for your RDS instance.	4
<email-address-for-login>	Email address used for web UI login.	1
<password-for-login>	Assigns a default password for web UI login.	1
<container-name>	A name for the PGAdmin container in your pod.	1
<modified-login-email>	This is the same email address provided above with the '@' replaced by a '_'.	3
<AD-group-name>	The name of the AD group with all approved users to give access to the ingress URL.	1
<unique-subdomain>	DNS safe subdomain that will precede .apps.lrl.lilly.com in the ingress URL.	1
*** Tip: Use find and replace to make sure all values are filled out

Place this file in your namespace's folder with your other configuration files. You can make changes to some of the other variables in the template, below, but the variables above should be the only ones required. This template assumes you used Crossplane in your namespace to create you RDS Instance and your credentials are saved as a K8s secret in your namespace.

Once your pod is running, visit your ingress address and log in using the email address and password for login you provided. You RDS databases should be listed and you should not be prompted for a password. If/when your database password is rotated, delete your pod and recreate it. This should update the password based on the updated secret.

Only users in the AD Group will be able to access the URL. All others will see a 404 message. All users will need to use the email address and password in the config file to access PGAdmin unless individual user accounts are created using the admin account.

See [example here] (https://github.com/EliLillyCo/LRL_light_k8s_infra_apps/blob/main/projects/dev/backstage-dev/pgadmin.yaml)
Template
projects/\<env>/\<namespace>/pgadmin.yaml
Template:
apiVersion: v1
kind: ConfigMap
metadata:
 name: pgadmin-config
 namespace: <namespace-name> # first of 6 replacements of <namespace-name>
data:
  # change the MaintenanceDB if you have provided a different value when creating your RDS Instance
  # contains the only replacement of <server-name>
  temp-servers.json: |
    {
      "Servers": {
        "1": {
          "Name": "<server-name>",
          "Group": "Servers",
          "Port": $PORT,
          "Username": "$USER",
          "Host": "$HOST",
          "SSLMode": "prefer",
          "MaintenanceDB": "postgres",
          "PassFile": "/.pgpass"
        }
      }
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <pod-name> # first of 7 replacements of <pod-name>
  namespace: <namespace-name>
  annotations:
    wave.pusher.com/update-on-config-change: "true"
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: <pod-name>
  template:
    metadata:
      labels:
        app.kubernetes.io/name: <pod-name>
        app.lrl.lilly.com/compute: serverless
    spec:
      initContainers:
      - args:
        - sh
        - -c
        - cat /temp-config/temp-servers.json | envsubst > /config/servers.json
        image: bhgedigital/envsubst:latest # this image needs added to Artifactory and the image updated here
        name: envsubst
        env:
          - name: PORT
            valueFrom:
              secretKeyRef:
                name: <rds-secret-name> # first of 4 replacements of <rds-secret-name>
                key: port
          - name: USER
            valueFrom:
              secretKeyRef:
                name: <rds-secret-name>
                key: username
          - name: HOST
            valueFrom:
              secretKeyRef:
                name: <rds-secret-name>
                key: endpoint
        volumeMounts:
        - mountPath: "/temp-config"
          name: temp-storage
          readOnly: true
        - mountPath: "/config"
          name: configuration
          readOnly: false
      containers:
      - name: <container-name> # the only replacement of <container-name>
        image: elilillyco-lilly-docker.jfrog.io/dpage/pgadmin4:6.17
        ports:
        - containerPort: 80
        env:
        - name: PGADMIN_CONFIG_ENHANCED_COOKIE_PROTECTION 
          value: "False"
        - name: PGADMIN_SERVER_JSON_FILE
          value: "/config/servers.json"
        - name: PGADMIN_DEFAULT_EMAIL 
          value: <email-address-for-login> # only replacement of <email-address-for-login>
        - name: PGADMIN_DEFAULT_PASSWORD 
          value: <password-for-login> # only replacement of <password-for-login>
          # adjust the variable below for session duration, in days, to avoid having to login to the web portal each time
          # you will still be authenticated through AD
          # this appears to be saved as a cookie and is per-browser, not per user. default is 1 day.
        - name: PGADMIN_CONFIG_SESSION_EXPIRATION_TIME 
          value: "1"
        envFrom:
        - prefix: "rds_"
          secretRef:
            name: <rds-secret-name>
        resources:
          limits:
            memory: "0.5Gi"
            cpu: "0.25"
          requests:
            memory: "0.5Gi"
            cpu: "0.25"
        lifecycle:
          postStart:
            exec:
              # the <modified-login-email> used in this section requires '@' in <email-address-for-login> to be replaced with '_', i.e. 'user@domain.com' becomes 'user_domain.com'
              # all three replacements of <modified-login-email> are in this command
              command:
                - "/bin/sh"
                - "-c"
                - |                  
                  mkdir -p /var/lib/pgadmin/storage/<modified-login-email>;
                  echo "${rds_endpoint}:${rds_port}:*:${rds_username}:${rds_password}" > /var/lib/pgadmin/storage/<modified-login-email>/.pgpass;
                  chmod 600 /var/lib/pgadmin/storage/<modified-login-email>/.pgpass;
        volumeMounts:
          - name: configuration
            mountPath: "/config"
            readOnly: false
      volumes:
        - name: temp-storage
          configMap:
            name: pgadmin-config
        - name: configuration
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: <pod-name>
  namespace: <namespace-name>
spec:
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
  type: ClusterIP
  selector:
    app.kubernetes.io/name: <pod-name>
---
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: pgadmin-header
  namespace: <namespace-name>
spec:
  headers:
    customRequestHeaders:
      x-forwarded-proto: "https"
      x-forwarded-port: "443"
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: <pod-name>
  namespace: <namespace-name>
  annotations:
    traefik.ingress.kubernetes.io/router.middlewares: <namespace-name>-pgadmin-header@kubernetescrd
    lilly.com/user_info_headers: '[{"attribute": "email", "header": "X-Forwarded-User"}]'
    # contains the only replacement of <AD-group-name>
    lilly.com/security_groups: |
      [
        {
          "Route": "/.*",
          "ADGroups": [ "<AD-group-name>" ]
        }
      ]
spec:
  rules:
  # the only replacement of <unique-subdomain>
  - host: <unique-subdomain>.apps.lrl.lilly.com # i.e. namespace-pgadmin.apps.lrl.lilly.com
    http:
      paths:
      - path: '/'
        pathType: Prefix
        backend:
          service:
            name: <pod-name>
            port:
              number: 80

Edit this page




Reloader
Overview
Reloader is a Kubernetes operator that automatically updates pods when changes are made to their ConfigMaps and Secrets. It watches for changes and performs rolling upgrades on dependent resources, automating the process of applying configuration changes. This ensures applications always run with the latest configurations without manual intervention.
Reloader Configuration in Kubernetes
Usage
Reloader supports several annotations to control its behavior, focusing on automatic reloading for all ConfigMaps and Secrets or specific ones.
1. Auto Reload for All ConfigMaps and Secrets
To automatically reload a Deployment, StatefulSet, or DaemonSet when any ConfigMap or Secret it depends on is updated, use:
reloader.stakater.com/auto: "true"
Example:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-application
  annotations:
    reloader.stakater.com/auto: "true"
spec:
  ...
2. Specific ConfigMap or Secret Reload
For reloading only when specific ConfigMaps or Secrets are updated:
For a specific ConfigMap:
configmap.reloader.stakater.com/reload: "my-configmap-name"
For a specific Secret:
secret.reloader.stakater.com/reload: "my-secret-name"
Example:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-specific-app
  annotations:
    configmap.reloader.stakater.com/reload: "my-configmap-name"
    secret.reloader.stakater.com/reload: "my-secret-name"
spec:
  ...
Configuring Your Application to Use Reloader
Applications should consume configurations from ConfigMaps or Secrets, either mounted as volumes or exposed as environment variables.
Using ConfigMaps and Secrets as Volumes:
Mount a ConfigMap as a volume:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-using-volume
  annotations:
    reloader.stakater.com/auto: "true"
spec:
  template:
    spec:
      containers:
      - name: my-app
        image: my-app-image
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
      volumes:
      - name: config-volume
        configMap:
          name: my-configmap-name
Using ConfigMaps and Secrets as Environment Variables:
Expose ConfigMap or Secret data as environment variables:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-using-env
  annotations:
    reloader.stakater.com/auto: "true"
spec:
  template:
    spec:
      containers:
      - name: my-app
        image: my-app-image
        envFrom:
        - configMapRef:
            name: my-configmap-name
        - secretRef:
            name: my-secret-name





Restful SDK
Python
Light Client Library
Overview
The Light Client Library is a Python SDK that provides seamless authentication for CATS-hosted applications using Microsoft Authentication Library (MSAL) with support for multiple OAuth 2.0 flows. This library simplifies the authentication process by caching refresh tokens locally, reducing the need for frequent re-authentication to approximately every 30 days of inactivity. Access token refreshing is handled transparently, ensuring a smooth user experience for developers interacting with CATS services.
Key Features
•	MSAL Azure AD Authentication: Secure authentication using Microsoft Authentication Library with support for multiple OAuth 2.0 flows
•	Authorization Code Flow: Default authentication method compliant with Lilly's Island Browser Policy and Conditional Access Policies
•	Device Code Flow: Available for remote environments with verbose logging support
•	Client Credentials Flow: Service-to-service authentication using client ID and secret
•	Token Caching: Local refresh token caching for reduced authentication frequency
•	Transparent Token Refresh: Automatic access token renewal without user intervention
•	HTTP Client Integration: Standard HTTP methods similar to the requests library
•	Command Line Interface: CLI tools for token management and AWS integration
•	AWS Integration: Support for AWS authentication and S3 credential management
•	GitHub Codespaces Support: Automatic detection and configuration for Codespaces environments
Getting Started
Prerequisites
Before using the Light Client Library, ensure you have:
•	Python 3.7 or higher installed
•	Access to the target CATS environment
•	Valid Azure AD credentials
•	For authorization code flow: Available ports 31410-31415 for OAuth callback server
Installation
The Light Client Library can be installed from two sources:
Install From GitHub
pip install git+https://github.com/EliLillyCo/LRL_light_k8s_infra_app_client_python.git
Install From HPC Artifactory
pip install light-client -i https://artifactory.am.lilly.com/artifactory/api/pypi/lrl-pypi/simple
Basic Usage
The Light Client provides a simple interface that mirrors the standard Python requests library:
from light_client import LIGHTClient

# Initialize the client (uses authorization code flow by default)
client = LIGHTClient()

# The client supports standard HTTP methods (GET, POST, PUT, DELETE, etc.)
# and accepts the same parameters as the requests library
response = client.get("https://test.apps.lrl.lilly.com/")

# On first use, follow the authentication prompt in your browser
# Subsequent requests will use cached tokens automatically
# The response is a standard requests Response object

# NOTE: The above URL is an example and will return a 404 response
Authentication Methods
The Light Client supports three authentication flows to accommodate different use cases:
Authorization Code Flow (Default)
The default authentication method opens a browser window for interactive login. This method is compliant with Lilly's Island Browser Policy and Conditional Access Policies. It requires ports 31410-31415 to be available for the OAuth callback server.
from light_client import LIGHTClient

# Uses authorization code flow by default
client = LIGHTClient()
response = client.get("https://test.apps.lrl.lilly.com/")
GitHub Codespaces Support: The authorization code flow automatically detects GitHub Codespaces environments and configures the OAuth callback URL appropriately. No additional configuration is required.
Device Code Flow
For environments where browser access is limited or unavailable, device code flow displays a code for authentication on another device:
from light_client import LIGHTClient

# Device code flow must be specified via CLI or environment configuration
# See CLI documentation for usage
Note: Device code flow may be restricted by Conditional Access Policies in certain environments. If you experience authentication issues, use the default authorization code flow.
Client Credentials Flow
For automated scenarios or service-to-service authentication, use client credentials with environment variables:
import os
from light_client import LIGHTClient

# Set environment variables
os.environ['CLIENT_ID'] = 'your-client-id'
os.environ['CLIENT_SECRET'] = 'your-client-secret'

# Client credentials flow must be specified via CLI or environment configuration
# See CLI documentation for usage
Important: Client credentials authentication does not provide user-level access information. Ensure this approach meets your application's quality and security requirements before implementation.
Command Line Interface
The Light Client includes a powerful CLI tool called light_auth for token management and AWS integration.
CLI Usage
light_auth --help
usage: light_auth [-h] [-e {DEV,QA,PRD}] [-H] [option]

Prints authentication token for light hosted applications

positional arguments:
  option
                        refresh-login   clear cache and reinitialize authentication to ensure fresh login (forces interactive auth)
                        token           get token (default)
                        namespaces      returns list of namespaces allowed based on scoped s3-credentials
                        buckets         returns list of buckets allowed based on scoped s3-credentials
                        prefixes        returns list of prefixes allowed based on scoped s3-credentials
                        creds           return access tokens that allow scoped access to s3. Can also pass {bucket, namespace in that order} get more specificly scoped credentials. This can be used in an AWS profile as a credential provider
                        setup           setup AWS profile in ~/.aws/config to use light_auth as a credential provider

options:
  -h, --help            show this help message and exit
  -e {DEV,QA,PRD}, --env {DEV,QA,PRD}
                        authentication environment (default=PRD)
  -H, --header          return the full header
  -p [PROFILE], --profile [PROFILE], --profile_name [PROFILE]
                        supply a profile name to create a named profile
  -b [BUCKET], --bucket [BUCKET]
                        supply an s3 bucket name
  -n [NAMESPACE], --namespace [NAMESPACE]
                        supply a kubernetes namespace name
  -P [PREFIX], --prefix [PREFIX]
                        supply an s3 key prefix
  -s [SERVICE], --service [SERVICE]
                        supply an AWS service (currently only S3 is supported)
  --auth-method {auth-code,device-code,client-credentials}
                        authentication method to use (default=auth-code)
  -v, --verbose         enable verbose output during authentication
  --show-all            show all available token parts for debugging (content depends on token source - cache vs fresh)
  --no-cache            force fresh authentication by clearing cache first
Authentication Method Examples
# Default auth-code flow (opens browser, requires ports 31410-31415)
light_auth token

# Device code flow with verbose output to see the code
light_auth --auth-method device-code -v token

# Client credentials flow (requires environment variables)
CLIENT_ID=your-client-id CLIENT_SECRET=your-client-secret light_auth --auth-method client-credentials token
Token Debugging Features
For advanced token debugging, troubleshooting authentication issues, and inspecting token contents, the CLI provides several debugging flags:
# Show cached token information
light_auth token --show-all

# Show all tokens from fresh authentication
light_auth token --show-all --no-cache

# Reset authentication completely
light_auth refresh-login
For comprehensive debugging documentation, see the CLI Debugging Guide.
CLI Examples
List Available S3 Buckets
$ light_auth buckets | jq
{
  "buckets": [
    "lly-light-prod"
  ]
}
List Available S3 Prefixes
$ light_auth prefixes --bucket lly-light-prod | jq
{
  "prefixes": [
    "",
    "uat-folder/readonly/",
    "uat-folder/writeonly/",
    "uat-folder/readwrite/",
    "uat-folder/deleteonly/"
  ]
}
Get Scoped S3 Credentials
$ light_auth creds --bucket lly-light-prod --prefix uat-folder/readonly | jq
{
  "AccessKeyId": "ASIAUD4QQPRPPKIIUMOV",
  "SecretAccessKey": "<redacted>",
  "SessionToken": "<redacted>",
  "Expiration": "2023-11-13T22:20:11+00:00",
  "Version": 1
}
AWS Integration
S3 Credential Provider Setup
The Light Client can serve as an AWS credential provider, allowing you to use standard AWS CLI commands without repeated authentication. The login period matches the standard Light Client token lifecycle.
Configure AWS Profile
Add the following configuration to your ~/.aws/config file:
[profile myprofile]
credential_process = light_auth setup -n my_namespace -p myprofile
This setup enables you to use AWS CLI commands with automatic credential management:
# Use the configured profile with AWS CLI
aws s3 ls --profile myprofile
Note: If authentication fails, refresh your cached tokens by running:
light_auth refresh-login
AWS Authentication for CATS Applications
When calling CATS-hosted applications from AWS environments and you want to use AWS authentication instead of Azure AD, the Light Client provides helper functions to fetch the required authentication headers.
Method 1: Direct AWS Authentication
from light_client import LIGHTClient, AUTH_METHOD_AWS

# Initialize client with AWS authentication method
client = LIGHTClient(auth_method=AUTH_METHOD_AWS)

# The client will fetch AWS credentials and use them to authenticate 
# CATS requests using the default boto3 credential chain
response = client.get("https://test.apps.lrl.lilly.com/")
Method 2: Environment Variable Configuration
Alternatively, you can set an environment variable to specify the authentication method:
export LIGHT_CLIENT_AUTH_PROVIDER=AUTH_METHOD_AWS
from light_client import LIGHTClient

# Client will automatically use AWS authentication based on environment variable
client = LIGHTClient()
response = client.get("https://test.apps.lrl.lilly.com/")
Both methods utilize the default boto3 credential chain for obtaining AWS credentials.
GitHub Codespaces Support
The authorization code flow automatically detects and supports GitHub Codespaces environments:
•	Local Development: Uses http://127.0.0.1:{port}/ for OAuth callbacks
•	GitHub Codespaces: Uses https://{codespace_name}-{port}.{domain}/ for OAuth callbacks
The Codespace callback URL is constructed using:
•	CODESPACE_NAME environment variable (provided by GitHub)
•	GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN environment variable (defaults to app.github.dev)
•	Selected port from range 31410-31415
No additional configuration is required - the client automatically detects the Codespace environment and handles URL construction.
Troubleshooting
Common Issues
Authentication Failures
•	Run light_auth refresh-login to clear cached tokens and re-authenticate
•	Verify your Azure AD credentials are valid
•	Check that you have access to the target CATS environment
•	If using device code flow in an environment with Island Browser Policy restrictions, switch to authorization code flow (default) using --auth-method auth-code
Browser Not Opening for Authorization Code Flow
•	Ensure ports 31410-31415 are available for the OAuth callback server
•	Check that you're not running in a headless or remote environment
•	Consider using device code flow with --auth-method device-code -v if browser access is unavailable
Port Conflicts
•	Authorization code flow requires ports 31410-31415 to be available
•	If these ports are in use, free them or use device code flow as an alternative
Codespaces Issues
•	Ensure port forwarding is enabled for OAuth callback ports (31410-31415)
•	Verify that CODESPACE_NAME and GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN environment variables are set correctly
Token Expiration
•	Cached tokens are automatically refreshed, but if issues persist, use light_auth refresh-login
•	Ensure your system clock is synchronized
AWS Integration Issues
•	Verify your AWS credentials are properly configured
•	Check that the boto3 credential chain is correctly set up
•	Ensure you have the necessary permissions for the target AWS resources
•	If authentication fails, run light_auth refresh-login to refresh cached tokens
Conditional Access Policy Errors
•	The authorization code flow (default) is compliant with Lilly's Conditional Access Policies
•	Device code flow may be restricted by policy in certain environments
•	Contact the CATS team if you require device code flow for your use case
Debugging Token Issues
For detailed debugging of authentication tokens and flows:
# Check current cached token status
light_auth token --show-all

# Force fresh authentication to compare
light_auth token --show-all --no-cache

# Test different authentication methods
light_auth token --show-all --no-cache --auth-method device-code

# Reset authentication completely if issues persist
light_auth refresh-login
For comprehensive debugging documentation, see the CLI Debugging Guide.
Related Documentation
•	External Integrations - Integrating with external services
•	AWS Resource Overview - Using AWS services with CATS
R
R-based client libraries for interacting with Kubernetes apps in the Light infra.
Client Library for Applications Hosted on LIGHT Platform (Lilly LRL LIGHT)
Installation
On Lilly Network
install.packages("LIGHTClient", repos = c("https://artifactory.am.lilly.com/artifactory/lrl-cran/"))
GitHub
devtools::install_github("EliLillyCo/LRL_light_k8s_infra_app_client_r", auth_token="<github personal access token>", ref="main")
Edit this page



Cluster Self-Service Toolkit
The Cluster Self-Service Toolkit is a powerful platform feature that provides application teams with a comprehensive set of pre-configured assets for securely managing resources external to their Kubernetes clusters. This toolkit is automatically deployed when a namespace with hybrid compute type (annotation app.lrl.lilly.com/compute: hybrid) is created, enabling teams to interact with external resources without requiring direct access to those systems.
Overview
The Self-Service Toolkit follows a security-first approach, creating a controlled environment where application teams can interact with their external resources. All resources in this toolkit have the managed-- prefix, indicating that they are created, owned, and managed by the CATS platform. These resources cannot be modified through ArgoCD as they fall under platform management.
Features at a Glance
The Cluster Self-Service Toolkit includes the following key features:
Feature	Description	Activation
AWS CLI Access
Secure pod for executing AWS CLI commands via ArgoCD terminal	Automatic
External Secrets Integration
Pre-configured SecretStore for AWS Secrets Manager integration	Automatic
IAM Roles & Policies
Namespace-scoped permissions for AWS resource access	Automatic
Bouncer Logs Analysis
Athena query access through Grafana for application traffic analysis	On-request
Architecture & Implementation
Each component of the Self-Service Toolkit is designed to work together to provide a secure and efficient experience for application teams, following core security and platform engineering principles:
Security Boundaries
The toolkit implements strict security boundaries, ensuring that each namespace can only perform operations on external resources that follow the naming convention cats/<namespace-name>/*. This namespace-based isolation ensures that:
1.	Resource Isolation: All resources are isolated to their specific namespace
2.	Least Privilege: IAM policies grant only the minimum necessary permissions
3.	Audit Trail: All operations performed are logged for accountability and compliance
4.	Managed Infrastructure: Resources are platform-controlled to ensure security and consistency
Supporting Resources
The toolkit includes several supporting resources that are automatically deployed:
•	Network Policies: Ensuring proper network isolation and security
•	SecretStore: Pre-configured for AWS Secrets Manager integration, supporting both same and cross-account scenarios
INFO
If you are interested in the detailed architecture of this feature, check out our platform designs documentation for the toolkit here.
Best Practices
•	Always use the toolkit for managing external resources instead of direct AWS access
•	Follow naming conventions for resources: cats/<namespace-name>/<resource-name>
•	Do not attempt to modify the managed-- resources, as they are controlled by the platform
•	Reference the External Secrets documentation for best practices on secrets management
Toolkit Features
AWS CLI Access
The managed--self-service-cli-deployment provides secure AWS CLI access for application teams to interact with their external resources. This deployment creates a pre-configured pod with AWS CLI that team members can access through ArgoCD's exec functionality.
Key capabilities include:
•	AWS Secrets Manager operations (create, read, update, delete)
•	AWS resource management within team's namespace scope
•	Secure execution of AWS CLI commands without requiring direct AWS console access
How to Use AWS CLI Access
1.	Navigate to your application in ArgoCD
2.	Locate the managed--self-service-cli-deployment in your resources
3.	Use the "Terminal" option to exec into the pod
4.	Run standard AWS CLI commands to manage your resources
 
Managing Secrets in AWS Secrets Manager
# List your secrets (filtered to your namespace)
aws secretsmanager list-secrets --filters Key=name,Values=cats/<your-namespace>

# Create a new secret
aws secretsmanager create-secret --name cats/<your-namespace>/my-new-secret --secret-string '{"username":"admin","password":"my-secure-password"}'

# Update a secret value
aws secretsmanager update-secret --secret-id cats/<your-namespace>/my-existing-secret --secret-string '{"username":"admin","password":"my-new-secure-password"}'

# Retrieve a secret value
aws secretsmanager get-secret-value --secret-id cats/<your-namespace>/my-existing-secret
External Secrets Integration
The toolkit includes a preconfigured SecretStore that facilitates integration with AWS Secrets Manager. This enables:
•	Automatic synchronization of secrets from AWS to Kubernetes
•	Secure management of sensitive information
•	Cross-account secret access when needed
For more information about using external secrets with this toolkit, please refer to the External Secrets documentation.
IAM Roles and Policies
The toolkit automatically provisions IAM roles and policies scoped to your namespace. These roles:
•	Allow access to AWS resources with the cats/<namespace-name> prefix
•	Follow least privilege principles to ensure security
•	Support cross-account interactions when needed
•	Enable AWS CLI operations from the access pod
These IAM resources are fully managed by the platform and will be automatically updated if policy requirements change.
Bouncer Logs Analysis via Athena
The toolkit also provides application teams with the capability to analyze their application traffic through Bouncer logs using AWS Athena queries in Grafana. This feature enables teams to:
•	Understand their application's traffic patterns and user activity
•	Monitor and analyze API usage metrics
•	Track active user counts and session information
•	Generate custom visualizations based on application traffic data
How to Access Bouncer Log Analysis
Unlike other features in the toolkit, Bouncer logs analysis requires additional setup by the platform team:
1.	Submit a Feature Request to enable Bouncer logs analysis for your application
2.	The platform team will create a dedicated Grafana organization for your team
3.	AWS Athena datasource will be installed and configured with appropriate permissions
4.	Your team will have access to this datasource in the newly created Grafana organization via the RBAC scheme configured
Example Athena Queries
Once your Grafana organization is set up with Athena integration, you can use queries like:
-- Get all bouncer logs for the test-dev namespace  
SELECT * FROM namespace_test_dev


-- Get daily active user count for your application in the llm-qa namespace
SELECT count(DISTINCT user) AS daily_active_users
FROM namespace_llm_qa;
Future Extensions
The Cluster Self-Service Toolkit is designed to be extensible, allowing for additional tools and capabilities to be added to the asset packet as platform needs evolve. Future additions may include:
•	Database management tools
•	Advanced logging and monitoring capabilities
•	Additional cloud resource provisioning options
•	Custom resource management utilities
If you would like to suggest additional tools or features for the Self-Service Toolkit, please follow the standard Feature Request process.
Troubleshooting
If you encounter issues with the Self-Service Toolkit:
1.	Verify your namespace has the correct app.lrl.lilly.com/compute: hybrid annotation
2.	Ensure you have the appropriate permissions in ArgoCD for your application
3.	Check that your resources follow the required naming convention (cats/<namespace-name>/*)
4.	Contact the platform team if you believe the toolkit resources were not properly deployed
Support
For questions or issues related to the Cluster Self-Service Toolkit, please submit a support ticket following the standard support process.
Edit this page

Previous




Send Emails
CATS has a built-in email server that allows sending email from <app-name>-no-reply@apps.lrl.lilly.com.
You can use this server with the below connection info:
•	server: smtp.messaging.svc
•	port: 1025
No authentication is required as long as your app is running in the CATS K8s cluster.
Note: "smtp.messaging.svc:1025" is a non-ssl (non secure) service ensure you have added email_secure = FALSE to your code. The service is running within the cluster (communication outside the cluster is encrypted).

EXTERNAL tags
Steps have already been taken to remove the [EXTERNAL] tag from the subject line of the email. However, by default, emails will still have
EXTERNAL EMAIL: Use caution before replying, clicking links, and opening attachments.
prepended to the body of the email.
To remove this tag, you will need to submit a ticket through the ServiceNow portal. The proper ticket is: Miscellaneous Email Requests. There are two options to choose from for this use case, depending on the desired outcome. The options are:
Email Service	Description
Request External Tag exemption	Completely remove the tag from the email
Request Lilly Agent Tag for Sender	Change EXTERNAL EMAIL to LILLY AGENT EMAIL
The Lilly Agent tag is typically used by vendors or partners, such as Jira or AMEX, who are approved to send emails from non-Lilly domains. Most of the requests will be for the first option, but the second option is available, if needed.
You will need to provide the full sender email address from which you want the tag removed. If approved, the message will be removed from the email or modified. Please expect a series of follow-up emails regarding your use case.
Send from Custom URL
TODO: coming soon


Smarter Device Manager
Overview
Smarter Device Manager runs as a DaemonSet within the cluster, exposing hardware devices (linux device drivers) to your pods. It uses a ConfigMap to define the devices it should manage and then allows pods to request these devices. To learn more about Smarter Device Manager, please refer to this repository or article. Here's how to set it up for Filesystem in Userspace (FUSE) as an example.
Usage
Configuring Devices with a ConfigMap
The list of devices that are available to pods are managed by the CATS core team through a ConfigMap in the kube-system Namespace (view the list here). If you would like to access any other additional devices, please contact the CATS team and we have them added to our list.
Requesting Devices in a Pod Deployment
To request access to these devices for your pods, you'll need to modify the pod's deployment configuration. Here's how to request the FUSE device in a Deployment by adding the device in your resource’s limits and request:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echo-server-reflector
  namespace: admin-testing-smarter-device-manager-dev
  labels:
    app: echo-server-reflector
spec:
  replicas: 1
  selector:
    matchLabels:
      app: echo-server-reflector
  template:
    metadata:
      labels:
        app: echo-server-reflector
    spec:
      containers:
      - name: echo-server-reflector
        image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_light_k8s_infra_echo:dev-sha-a34f51d
        command: ["uvicorn"]
        args: ["app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8080",
          "--proxy-headers", "--root-path", "/"]
        resources:
          limits:
            memory: "2Gi"
            cpu: "1"
            smarter-devices/fuse: 1 # Limit 1 FUSE device to be accessed at a time
          requests:
            memory: "2Gi"
            cpu: "1"
            smarter-devices/fuse: 1 # Request 1 FUSE device to be accessed 
        ports:
        - containerPort: 8080
Once the Deployment is up in the cluster, your pods should be able to access the specific devices as requested.




Temporal
•	DEV Cluster Temporal UI
•	QA Cluster Temporal UI
•	PROD Cluster Temporal UI
Overview
Temporal provides a way for applications to durably run background jobs including:
•	Event-driven workflows
•	SAGA and distributed transactions
•	State machines
•	Batch processing
•	Scheduled jobs and cron
•	Some situations where you might want to use a queue. The Temporal scheduler queues jobs internally for you and helps with error handling. Temporal allows you to setup multiple queues to control workflow exeuction.
Temporal calls background jobs "workflows" and each workflow is consists of one or more "activities". Temporal's SDK allows you to write your workflows and activities in one several popular programming languages. Once you have created your workflows you can trigger them from your applcation using the SDK or create scheduled workflows.
Temporal's durable execution engine provides several benefits over traditional background jobs:
•	Temporal keeps track of workflow execution state which allows you to easily monitor them through the UI and API.
•	Temporal will automatically retry failed jobs based on your configured policies.
•	Your application can query and send events to running workflows. This feature allows you to implement event driven applications and state machines, including ones that include manual steps.
•	Workflows can sleep for short or long periods of time without taking up compute resources.
WARNING
The inputs and outputs from your workflow's activities will be captured in Temporal's database and archive (if archival is enabled). Please keep this in mind when doing CI and PI assessments for your application.
Architecture
 
The CATS clusters host Temporal and its UI and make it available as a service to CATS projects. Temporal's multi-tenancy featurs are used to provide separation between projects.
Applications using Temporal will need to run one or more worker pods which contain the application's workflow and activity code. At first glance, requiring app developers to host their own worker pods can seem like a major downside to Temporal. However, this setup provides the app developers the most control over scaling their application. Temporal also allows applications to create multiple worker pools, which can be used for workflow prioritization or separating workflows that require a special resource, like a GPU. Code sharing between the application and workflows is also easier in this setup than some alternative products.
Alternatives
Several other high quality workflow execution engines exist, each with their own set of tradeoffs. Here are the main tradeoffs for some popular options.
•	Apache Airflow
o	Provides a nice high level UI for viewing the status of all workflows
o	Provides nice calendar view for workflows
o	Does not support multi-tenancy
o	Airflow workflows must be written in Python
o	Workflow code must be present in the Airflow containers, which can make setting up CI/CD difficult
•	AWS Step Functions
o	Can scale to zero
o	Workflows are written in JSON/YAML DSL which provides less features than a full programming language
o	Lambdas have a 15 minute time limit
o	Poor integration with CATS
o	Monitoring UI can be rough
Support
You can request Temporal support through the CATS ServiceNow Request in the ServiceNow catalog. Please provide the following information in your ticket. Tickets without sufficent detail may be moved down the queue.
•	In the description please include that you are having issues with "Temporal in CATS".
•	The name of your project folder in Lilly-Kubed-Apps.
•	The name of the environment you are having issues in or have questions about.
•	If you are facing an issue, please include details about the issue and how you identified it.
•	Please be aware that EDAT is not familiar with the details of your project. We are likely not familiar with any area specific terminology or acronyms.
Support Scope
Within Scope:
•	Issues with application onboarding.
•	Answering questions about Temporal concepts.
•	Help solving issues where detailed debugging information is provided.
Out of Scope:
•	Fixing issues with application code.
•	Adding or removing users from an application AD group.
Incidents
Incidents with the Temporal service can be filed using the CATS ServiceNow Request.
The following criteria are used for determining incident priority:
•	P1: N/A
•	P2: Temporal platform is down or unavailable to multiple applications
•	P3
o	Onboarding issues
o	Access issues for a newly onboarded app
o	User access issues
•	P4: N/A
•	P5: N/A
Edit this page



Cluster Design
 
System Components
This table outlines all of the system components utilized in the CATS platform.
Component	Description	Link to Documentation on component
Elastic Kubernetes Service (EKS)	Managed Kubernetes service offered by AWS that simplifies the deployment, management, and scaling of containerized applications using Kubernetes.	Link to AWS EKS Docs

EC2 and Fargate Container	Amazon Elastic Kubernetes Service (EKS) offers two compute options for managing containerized applications in Kubernetes clusters: EKS EC2-based worker nodes and AWS Fargate. With EC2-based nodes, you provision and manage Amazon EC2 instances for your Kubernetes cluster, gaining flexibility and control but requiring more operational overhead. On the other hand, AWS Fargate offers serverless container execution, abstracting away infrastructure management and providing granular billing. You create Fargate profiles to specify workloads that should run on Fargate. Utilizing either option involves creating an EKS cluster, defining node groups or Fargate profiles, deploying workloads, configuring service discovery and load balancing, and implementing monitoring and scaling solutions to meet specific application needs.	Link to AWS EC2 Docs / Link to AWS Fargate Docs

Flux	Flux is a delivery solution that allows the automatic deployment of application images via tags. This component allows application teams the ability to make changes to their application’s source code and then automatically see those changes get replicated in production after they publish the new application image to their main branch in GitHub.	Link to Flux Docs / Source Code TBD
GitHub Repository	The GitHub repository is the location that we house all the source code for the CATS Platform. There are main, QA, and DEV branches that correspond to three different environments for development. All applications are deployed in the production environment and are isolated by namespaces to ensure there is no interference between applications.	Link to Github Repo List

GitHub Actions	GitHub actions are used for the deployment of the CDK stack. Changes are validated and deployed by GitHub actions and the AWS CloudFormation service.	Link to GitHub Actions Docs

Bouncer	Bouncer is an authorization service that uses Microsoft Graph & Kubernetes to provide easy authorization for microservice applications.	Link to Bouncer Docs

Application Load Balancer	An AWS Application Load Balancer (ALB) is a sophisticated traffic distribution and routing service designed for cloud-based applications. It operates at the application layer, intelligently directing incoming HTTP/HTTPS traffic to multiple backend instances or services based on factors like URL paths, hostnames, and headers.	Link TBD
Artifactory	JFrog Artifactory is an artifact repository manager used in software development and DevOps workflows. It serves as a centralized hub for storing and managing binary artifacts, including libraries, packages, and dependencies.	Link to Artifactory Docs

Azure Active Directory	Active Directory is used in conjunction with the Bouncer Service to authentic Users.	Link Lilly Authentication Services Page

Amazon Elastic Container Registry (ECR)	AWS Elastic Container Registry (ECR) is a fully managed container registry service provided by Amazon Web Services (AWS). It is designed to store, manage, and deploy Docker container images, making it a crucial component in containerized application deployment. Since CATS is a Kubernetes based platform, this component is crucial for implementing a container-based application hosting system.	Link to AWS ECR docs

Grafana	Grafana is an open-source service used for monitoring and observability, in our case in the context of deployed application and CATS platform infrastructure. It provides data visualization and analytics through customizable dashboards, enabling our software developers to monitor and analyze metrics from various data sources in real-time.	Link to Metrics Dashboard powered by Grafana / Link to Grafana Docs

Crossplane	Crossplane is an open-source Kubernetes extension that we provide our users as a service. This service empowers our users to manage cloud infrastructure and services declaratively from within their Kubernetes resource definitions. It allows for the provisioning and orchestration of resources like databases, storage, and networking as if they were Kubernetes objects, streamlining the deployment and management of cloud-native applications.	Link to CATS Crossplane Section / Link to Crossplane Docs

AWS Aurora and Relational Database Service (RDS)	AWS Aurora/RDS is a fully managed relational database service offered by Amazon Web Services (AWS). When a user employs Crossplane, Crossplane interfaces with AWS Aurora/RDS to create a database by using Crossplane's custom resource definitions (CRDs).	Link to AWS Aurora and RDS Docs

AWS Secrets Manager	AWS Secrets Manager is an AWS-managed service for securely storing and rotating sensitive data like credentials and API keys used by applications. CATS integrates with AWS Secrets Manager to manage secrets more securely, using IAM roles to access and control access to these secrets. This integration simplifies secrets management within Kubernetes while enhancing security and access control.	Link to AWS Secrets Manager Docs

External Secrets Manager	An open-source service that synchronizes secrets from AWS into Kubernetes secret resources.	Link to K8s External Secrets Manager Repo

Amazon Route 53	AWS Route 53 is used to manage the DNS records for CATS, allowing us to assign human-readable domain names to our cluster-based resources. For example, you can map a domain name like "lilly.application.com" to the IP addresses of our Kubernetes services.	Link to AWS Route53 Docs

Amazon Web Application Firewall (WAF)	Amazon’s Web Application Firewall is an enterprise level managed web application firewall service provided by Amazon Web Services (AWS).	Link to AWS WAF docs

S3 Cloud Browser	Interact with AWS S3 buckets effortlessly using CloudBrowser, a graphical interface that streamlines storage management.	Link to S3 Cloudbrowser Section

PGadmin	PGadmin is an open-source administration and management tool for PostgreSQL, which is a powerful open-source relational database management system (RDBMS). PGadmin is designed to provide a user-friendly graphical interface for database administrators, developers, and other users to interact with PostgreSQL databases.	Link to PGadmin Section / Link to PGadmin Docs

Kubecost	Kubecost is an open-source cost-monitoring tool that provides developers with real-time cost breakdown of their Kubernetes resources running on the CATS platform. Costs are broken down by in-cluster resource usage like CPU, RAM, and Persistent Volume, as well as Kubernetes objects like namespaces, nodes, and pods.	Link to Kubecost Section / Kubecost Docs

External DNS	Keeps DNS records synchronized with your external entry points	Link to External DNS K8s Docs

Gemini Controller	TBD - Backup Snapshots for EBS volumes. Backup snapshots for Amazon Elastic Block Store (EBS) volumes are point-in-time copies of our data in AWS. They are an essential part of any data backup strategy and are used to restore data in the case of a failure, error, or data loss. Snapshots capture a specific state of a volume and can be used to initialize new volumes with the captured data. They are incremental, so only the blocks that have changed since the last snapshot are saved, which minimizes the storage costs.	Link to Gemini Docs

Healthcheck	Custom built solution by the CATS Team. The purpose of this service is to monitor the health of the CATS Platform. When the Lambda successfully sends a request to the API endpoint, the service will return a response with a status code of 200. However, if the request fails, notifications will be automatically sent to the CATS support team to alert them of the issue.	Link to Healthcheck App Repo

Kubernetes Dashboard	The Kubernetes Dashboard is a web-based graphical user interface (GUI) that provides our developers and administrators with a convenient way to interact with and manage the Kubernetes cluster resources. It offers a visual representation of various resources and components within the cluster, making it easier to monitor, troubleshoot, and perform administrative tasks.	Link to CATS K8s Dashboard Section / Link to Kubernetes Dashboard docs

K8s Manager	TBD	Link TBD
Keda	TBD - Autoscaler based on message queues.	Link TBD
Grafana	Grafana is a powerful open-source analytics and monitoring platform that serves as the main visualization and query tool for Prometheus, Loki, and Jaeger. It allows users to create custom dashboards to visualize metrics, logs, and traces in an intuitive and visually appealing manner. With a wide range of visualization options, including graphs, charts, and tables, Grafana helps users track performance trends, identify anomalies, and gain actionable insights into their applications and infrastructure. Additionally, Grafana supports alerting functionalities, enabling teams to set up notifications based on specific conditions to ensure timely responses to potential issues.	Link CATS Metrics Dashboard Section / Link to Grafana Docs

Prometheus Metrics	Prometheus is an open-source monitoring and alerting toolkit designed for collecting, storing, querying, and visualizing metrics from diverse software systems. Operating on a pull-based model, Prometheus regularly scrapes metrics data from monitored services and stores it in a time-series database, where it can be efficiently queried and analyzed.	Link CATS Metrics Dashboard Section / Link to Grafana Docs / Link to Prometheus Docs

Loki Logs	Loki is an open-source log aggregation system designed to efficiently collect, store, and query logs from various applications. Unlike traditional log management systems, Loki indexes only the metadata of the logs, making it highly efficient and cost-effective. It integrates seamlessly with Grafana, allowing users to visualize and analyze log data alongside metrics and traces, providing a comprehensive observability solution. Loki supports querying historical log streams, enabling users to troubleshoot issues and gain insights into application behavior over time.	Link CATS Logs Dashboard Section / Link to Loki Docs

Jaeger Tracing	Jaeger is an open-source, end-to-end distributed tracing tool used for monitoring and troubleshooting microservices-based distributed systems. It helps in tracking requests as they travel through various services, providing visibility into the system's performance and aiding in identifying bottlenecks, latencies, or errors. Jaeger supports features like distributed context propagation, performance monitoring, root cause analysis, service dependency analysis, and error detection.	Link CATS Jaeger Tracing Section / Link to Jaeger Docs

Simple Mail Transfer Protocol (SMTP) Service	The Simple Mail Transfer Protocol (SMTP) is a fundamental internet protocol used for the transfer of electronic mail (email) messages between computers or email servers. SMTP is part of the application layer of the TCP/IP protocol suite and is responsible for routing and delivering email messages from the sender to the recipient's email server.	Link to AWS SES docs

Elastic Block Storage (EBS) Controller	Amazon Elastic Block Storage (EBS) is an AWS service offering block-level storage solutions designed for Amazon Elastic Compute Cloud (EC2) instances. These EBS volumes serve as attachable storage devices, offering both durability and scalability. They are versatile, accommodating various use cases, such as data storage, database management, and application data storage within the AWS cloud infrastructure.	Link to AWS EBS docs

FSXx Controller	Cloud-based managed file storage service offering Windows and Lustre options. Amazon FSx is a cloud-based managed file storage service offering two key options: Amazon FSx for Windows File Server, tailored for Windows workloads and accessible from both Windows and Linux instances, and Amazon FSx for Lustre, designed for high-performance computing tasks. The former delivers fully managed Windows file shares, built on Microsoft Windows File Server, suitable for critical Windows applications, while the latter offers a high-performance, fully managed file system optimized for compute-intensive workloads.	Link to FSX Docs

Elastic File System (EFS) Controller	Elastic File System (EFS), a managed file storage service from AWS, provides scalable network-attached storage (NAS) that can be effortlessly shared across multiple EC2 instances. EFS is versatile, catering to a variety of applications, including content repositories, data sharing, and application data storage. What sets EFS apart is its ability to automatically scale its storage capacity as data grows, offering a convenient solution for applications with fluctuating storage requirements, ensuring both flexibility and cost-effectiveness.	Link to AWS EFS Docs

Wave	Wave watches Deployments within a Kubernetes cluster and ensures that each Deployment's Pods always have up to date configuration.	Link to Public Wave Repo

Application Runner Gateway	AWS App Runner is an AWS service that provides a fast, simple, and cost-effective way to deploy from source code or a container image directly to a scalable and secure web application in the AWS Cloud. You don't need to learn new technologies, decide which compute service to use, or know how to provision and configure AWS resources.	Link to AWS AppRunner Docs

Edit this page

Previous




Security and Networking Design
This page outlines the details surrounding Security and Networking decisions/
Networking Design
coming soon
AWS Account Info
Lilly AWS DX accounts egress traffic through a load balanced gateway. If you are allowlisting IPs from external web services & want to allow apps hosted in Lilly AWS DX (including CATS) to access, can use the following IPs: IPs: 18.224.143.244, 3.131.242.46, 18.188.162.84
Security Design
coming soon




Controller Design
What are the controllers coming soon
Webhook Admission Controller
description coming soon




Support Overview
Table of Contents
Document	Description
Submit A Ticket
Instructions for customers to submit support tickets through ServiceNow.
Feature Request
Instructions for customers to request new features for the CATS Platform.
Standard Support Offering
Details about the three tiered support structure and services provided.
Service Level Agreement
Overview of the defined SLAs governing support response times and expectations.
Release Process
Guidelines outlining the process for software releases within the platform.
Contact Us
Information on how to reach the support team for assistance.
Troubleshoot
Resources and steps for troubleshooting common issues.
Quality Documents
Access to documentation related to quality assurance and compliance.
Cloud Costs(2026)
Outlines the plan to move to a chargeback model in 2026.
Edit this page



Submit a Support Ticket
If you are a customer and need to submit a support ticket or report an incident, you can easily do so through ServiceNow. Simply click the button below to access the required form in the ServiceNow catalog.
Submit a Ticket

You may also find valuable information in our Support Knowledge Article available on ServiceNow.
CATS Support Page




Feature Requests
Welcome to the Feature Requests page! This is where we gather ideas and feedback from our users to continually improve the CATS platform. Your suggestions are invaluable in shaping the future of our platform.
How to Submit a Feature Request
If you have an idea for a new feature or improvement, please follow these steps:
1.	Navigate to our CATS - Submit an Issue Page and create a new ticket under the "Feature Requests" category.
2.	Provide a detailed description of your feature request, including:
o	The problem you're trying to solve.
o	How this feature would benefit your workflow.
o	How this will benefit the other Application Development Teams using the CATS platform.
o	Any additional context or examples.
Our team reviews all requests on a regular basis and prioritizes them based on impact, feasibility, and alignment with our roadmap.
Tracking Feature Requests
When a feature request is submitted, it will be reviewed by the team and converted into a Jira card. Once the card is created, we will close the original SNOW request and list the card number here along with a link to its location on our Jira board, allowing requestors to continuously track its progress.
We encourage you to collaborate with us directly on the Jira card by adding comments, providing additional details, or sharing use cases that support your request. Your input helps us prioritize and refine the feature to best meet your needs.
Work In Progress
•	CATS-1184 : Weak Cypher Enabled as Load Balencer
•	CATS-1468 : Bouncer Response Header Duplication





Standard Support Offering
The CATS Platform offers a structured support system categorized into three tiers, each designed to address user needs effectively and ensure seamless operation within the platform.
Tiered Support Structure
Tier I Support
Description:
Tier I support serves as the initial point of contact for users, responsible for triaging tickets and guiding users to appropriate resources. This tier focuses on resolving simple tasks and directing users to self-support tools.
Key Tasks:
•	Onboarding Assistance: Direct users to the FRONTDOOR for onboarding guidance.
•	Knowledge Base Navigation: Provide links to relevant knowledge articles and documentation on the CATS documentation site (CatsDocs).
•	Dashboard Support: Help users access and understand the dashboards.
•	Escalation: Direct tickets requiring specific platform knowledge to Tier II support.
Tier II Support
Description:
Tier II support possesses a deeper understanding of the platform, enabling them to troubleshoot more complex issues. This tier has access to privileged commands and tools like Argo for managing deployments and reviewing logs.
Key Tasks:
•	Command-Line Access: Utilize K9s for read access to the cluster and troubleshoot issues.
•	Resource Management: Restart Kubernetes resources (deployments, pods, etc.) using Argo.
•	Log Analysis: Assist users in locating error logs through Argo, query bouncer logs in CloudWatch, and analyze OpenObserve logs for troubleshooting.
•	Configuration Guidance: Help users execute sync actions on their applications and understand their resource configurations.
•	Consultation: Address specific issues, such as API connection problems and configuration errors, by providing relevant documentation and guidance.
•	Escalation: Raise any bugs or requests requiring code changes to Tier III support.
Tier III Support
Description:
Tier III support focuses on resolving platform bugs and implementing code modifications based on escalations from Tier II. This tier conducts thorough investigations to ensure issues are diagnosed correctly and rectified effectively.
Key Tasks:
•	Bug Resolution: Identify and fix bugs reported by users or escalated by Tier II.
•	Code Modifications: Implement necessary changes or improvements to system components to enhance user experiences.
•	Error Log Analysis: Perform detailed searches of system services to analyze and address errors effectively.
Shared Responsibility Model
To facilitate a successful partnership between the platform team and our customers, we have established a Shared Responsibility Model. This model clearly delineates the roles and responsibilities of each party, enhancing understanding and collaboration. You can view the model here.
Service Level Agreement
Our tiered support structure is designed to operate in accordance with the defined Service Level Agreements (SLAs) outlined here. These SLAs ensure that users receive prompt and effective assistance tailored to the complexity of their issues, promoting a dependable support experience across all tiers.
Working Agreement
By engaging with the CATS Platform, our customers agree to adhere to the terms set forth in the Platform's Working Agreement. This agreement establishes mutual expectations and commitments. For more details, please visit here.




Service Level Agreement (SLA) for the CATS Platform
1. Introduction
•	Purpose: Define the service levels and performance standards for the CATS Platform across the Development (Dev), Quality Assurance (QA), and Production environments.
•	Scope: Outline which components and environments the SLA covers, and specify that service levels differ by environment.
2. Definitions
•	Uptime/Availability: The percentage of time the platform is accessible.
•	Downtime: Periods when the platform is inaccessible to users.
•	Response Time: The time taken to respond to incidents or support requests.
•	Resolution Time: The timeframe for resolving incidents.
3. Communication Channels
•	Outlook:
o	Used for formal communications, escalations, and documentation of incident or status updates.
o	Official announcements, including maintenance schedules and policy updates, are distributed via email to all relevant stakeholders.
o	Official CATS Support email: CATS_Support@lilly.com
•	Lilly Flow:
o	A Stack Overflow-style platform where customers can post questions and receive answers from support teams or community members.
o	Used for knowledge sharing, enabling customers to find solutions to common issues and contribute to a shared knowledge base.
o	Link to CATS Club Lilly Flow community.
•	Microsoft Teams Channel:
o	Real-time communication channel for quick responses to queries, updates on ongoing incidents, and collaborative troubleshooting.
o	Dedicated channels for critical incidents, where the team can coordinate efforts, share real-time updates, and access historical discussions for reference.
o	Link to Microsoft Teams Channel
•	ServiceNow:
o	Primary platform for incident tracking and resolution documentation.
o	Used to log, categorize, and manage incidents with clear tracking of response and resolution times, aligning with the SLA.
o	Link to ServiceNow Request
o	Link to ServiceNow Help Desk Knowledge Article
•	Status Page (Coming Soon):
o	Public-facing communication tool for broadcasting system status and incident updates.
o	Provides real-time updates on system availability, ongoing incidents, and planned maintenance, allowing users to monitor platform health.
•	JIRA Board:
o	Project management tool for tracking ongoing work, planned improvements, and backlog items.
o	Used for prioritizing, tracking progress, and documenting fixes related to incidents or platform enhancements.
o	Link to JIRA Project
4. Service Commitments by Environment
In our CATS Kubernetes cluster, deployed within an AWS environment, service availability is achieved through a combination of containerization, pod-based application isolation, and load balancing. Kubernetes leverages container technology to ensure consistent application deployment and management, while pods provide isolation and redundancy, ensuring application availability even in the face of node failures. Load balancers, such as AWS Elastic Load Balancer (ELB), distribute traffic across pods deployed across multiple AWS Availability Zones (AZs), guaranteeing high availability during regional outages. Additionally, AWS's inherent high-availability features, including Auto Scaling and data replication services like Amazon RDS and S3, further enhance our cluster's resilience, enabling continuous service availability and data protection.
4.1 Incident Management
Production
Incident Level	Description	Response Time	Resolution Time	Escalation Protocol
P1	Critical – Complete platform outage or severe impact on Core System Feature Functionality	One Hour	Same Business Day	Once an incident has been raised, escalate to Platform Team lead immediately via Teams Message.
P2	High – Major functionality impacted; work-around possible. Core System Feature Impacted	One Hour	Next Business Day	Once an incident has been raised, escalate to Platform Team lead immediately via Teams Message.
P3	Medium – Minor issue with workaround	Same Business Day	One Week	Escalate to Development Team if unresolved after one week via Email to CATS_Support@lilly.com
P4	Low – Cosmetic or minor issue with no real impact	Same Business Day	Capacity Dependent	No formal escalation allowed.
P5	Informational – No impact	Same Business Day	Capacity Dependent	No formal escalation allowed.
QA Environment
Incident Level	Description	Response Time	Resolution Time	Escalation Protocol
P1	None – No P1 defined for QA	N/A	N/A	N/A
P2	High – Major functionality impacted; no work-around possible. Core System Feature	Same Business Day	Three Days	Escalate to Development Team if unresolved after three days via Email to CATS_Support@lilly.com
P3	Medium – Minor issue with workaround available	Same Business Day	One Week	Escalate to Development Team if unresolved after one week via Email to CATS_Support@lilly.com
P4	Low – Cosmetic or minor issue with no real impact	Same Business Day	Capacity Dependent	No formal escalation allowed.
P5	Informational – No impact	Same Business Day	Capacity Dependent	No formal escalation allowed.
Development Environment
The Development Cluster is inherently unstable and is not intended for production use. Any work you do here may be lost at any time, so be sure to back up your data locally before deploying.
Incident Level	Description	Response Time	Resolution Time	Escalation Protocol
P1	None – No P1 defined for Dev	N/A	N/A	N/A
P2	High – Major functionality impacted; no work-around possible. Core System Feature Impacted	Same Business Day	One Week	Escalate to Development Team if unresolved after one week via Email to CATS_Support@lilly.com
P3	Medium – Minor issue with workaround available	Same Business Day	Two Weeks	No formal escalation allowed.
P4	Low – Cosmetic or minor issue with no real impact	Same Business Day	Capacity Dependent	No formal escalation allowed.
P5	Informational – No impact	Same Business Day	Capacity Dependent	No formal escalation allowed.
4.2 Core Team Support Hours
The CATS Core Team, located in Indianapolis, Indiana, is committed to the following support hours:
•	Support hours: 8:00AM EST – 5:00PM EST, Monday – Friday
•	Support requested via primary support channel (submitting an issue through ServiceNow).
4.3 Extended Support Hours
The CATS Extended Team, located in Bengaluru, India, is committed to the following support hours:
•	Support hours: 10:30PM EST – 7:30AM EST, Monday – Friday
•	Support requested via primary support channel (submitting an issue through ServiceNow).
4.4 Core System Features
Core System Feature	Core System Service(s)	External Dependent Service	Impact	Description
Load Balancing to Application	ALB, Traefik, Bouncer	AWS	Critical	Facilitates traffic distribution and routing to application pods, ensuring load management.
Authentication and Authorization	Bouncer	Microsoft Entra ID	Critical	Manages secure user authentication and access control to the platform, integrating with Entra ID.
Workload Scaling	Vertical Pod Autoscaler, Horizontal Pod Autoscaler, Keda, Reloader, Nvidia Device Plugin		Critical	Scales application workloads dynamically, balancing resource usage across the cluster.
Secrets Management	AWS Secrets Manager, Wave, External Secrets Controller	AWS	Critical	Securely stores and manages sensitive data for applications, integrating with AWS Secrets.
Core Persistent Storage	EFS Controller, EBS Controller, PV Provisioner, FSX Controller	AWS	Critical	Provides persistent data storage solutions to ensure high availability of application data.
Workload Scheduling	Karpenter, Node Groups, Fargate, Cluster Autoscaler, Metrics Server	AWS	Critical	Allocates workloads across nodes for optimal performance, scalability, and resource usage.
Network Isolation / Security	AWC, AWS WAF, VPC Security Controller, AWS VPC CNI Controller	AWS	High	Enforces network policies, traffic filtering, and isolation within the VPC to ensure security.
Database Services	Crossplane	AWS	High	Manages database instances and configurations, facilitating consistent data access and storage.
Role Provisioning	K8s-Manager	AWS	High	Automates role-based access control (RBAC) provisioning for secure access management.
Application Dashboards	K8s Dashboard, Argo Dashboard, Traefik Dashboard		Medium	Provides visual interfaces for monitoring and managing deployed applications and resources.
Credential Services	ECR, S3 Cloud Browser	AWS, GitHub Actions	Medium	ECR Credentials are available
GitOps Workflow	Helm Operator, Argo CD, AWC	GitHub	Medium	Manages and secures access to container images and resources, with support for ECR credentials.
Automated Image Deployments	Flux, AWC	GitHub	Low	Automates the deployment of updated container images, ensuring consistent application versions.
Observability Dashboard	Prometheus, Grafana, Loki, Jaeger, Elastic Search, Mimir, Certificate Manager2, Kubecost	Azure, Slack, Microsoft Teams	Low	Provides insights into system metrics, logs, and traces to support monitoring and troubleshooting.
Self Help Resources	DocSite, Cats Agent, CatsBot	Cortex	Low	Self-service documentation and chatbot resources for end users.
Extended Persistent Storage Options	Smarter Device Manager		Low	Offers additional storage options tailored for specific application and device needs.
Backups	Backup Controller		Low	Manages and schedules data backups for recovery and compliance.
5. Shared Responsibility Model
Please reference our Shared Responsibility Modelfor a full understanding of both our customers' responsibilities and the responsibilities of the CATS Team.
6. Working Agreement
By proceeding with the use of the CATS platform, application teams acknowledge and agree to abide by the shared responsibility model outlined herein. Application teams are fully responsible for maintaining their own configurations, containerizing their applications, and addressing any issues related to their deployments. The platform team will not be held responsible for problems stemming from misconfigurations, application errors, or improperly maintained CI/CD workflows within individual applications. It is the responsibility of each app team to resolve these issues independently, ensuring that their applications function correctly within the platform's infrastructure.
7. Planned Outages
The CATS platform handles planned outages through a carefully structured release and patching process aimed at minimizing downtime and ensuring a seamless user experience. Most platform releases are meticulously planned to achieve zero downtime, ensuring uninterrupted service for users. Patching for workloads running on EC2 nodes occurs on the first Sunday of each month at 1 AM UTC, while AWS Fargate users should refer to AWS's interruption expectations. In cases of occasional downtime, we follow a structured process to minimize disruption. Please see our Release Process Section for full details on our Release Process.
8. Monitoring and Reporting
8. Monitoring and Reporting
Monitoring and reporting standards are being developed for each environment to support SLA compliance. Reports will only include P1 and P2 incidents:
•	Production Environment:
o	Monitoring: Full monitoring, covering uptime, latency, error rates, and resource use, with real-time alerts for any SLA issues.
o	Reporting: Monthly SLA reports to stakeholders, detailing system stability, incident handling, and resolution. These reports will be posted under the News Section of the Docsite.
•	QA Environment:
o	Monitoring: Targeted monitoring focused on stability and resource use for testing.
o	Reporting: Quarterly reports to identify trends and resolve any recurring issues. These reports will be posted under the News Section of the Docsite.
•	Development Environment:
o	Monitoring: Basic monitoring for resource availability and connectivity, with more monitoring added as tools are built.
o	Reporting: As-needed internal reports to support tool improvement. These reports will be posted under the News Section of the Docsite.
As our tools develop, each environment will receive the appropriate level of monitoring and reporting to meet its needs.
9. Exclusions
The following scenarios are excluded from SLA commitments:
•	Third-Party Service Outages:
Any disruptions, outages, or service degradations resulting from external service providers, including AWS, Microsoft Entra ID, GitHub, and Azure. Since these third-party dependencies are beyond direct control, SLA adherence may be impacted.
•	Customer-Controlled Configurations:
Incidents caused by customer-managed configurations, settings, or application-level customizations that deviate from recommended guidelines. Any remediation may be addressed on a best-effort basis without specific SLA obligations.
•	Development Environment Activities:
Performance, stability, and availability commitments do not apply to the Development (Dev) environment, which is designated for testing and experimentation. Issues in Dev resulting from active development or testing are excluded from SLA guarantees.
10. Review and Revision
The SLA will undergo a formal review on an annual basis to assess and adjust commitments based on platform usage, performance metrics, and customer feedback.
In addition, ad hoc reviews may be conducted sooner if triggered by significant incidents, changes in third-party service availability, or evolving customer requirements. This flexible approach ensures the SLA remains responsive to the platform’s needs and operational realities for each environment.
Edit this page





Release Process
The CATS platform release and patching process is designed to minimize downtime and ensure a smooth experience for our users. Below, you will find details about our release schedule, downtime considerations, and the step-by-step process we follow.
The CATS team has updated our release process to improve feature delivery and testing for the year 2025. Below is a detailed breakdown of the process:
Overview
Our team operates in two-week sprints, during which we focus on:
1.	Developing new features.
2.	Testing features from the previous sprint which are live in both the DEV and QA environments.
3.	Hot Fixing any issues identified in the DEV, QA, and PRD environments.
4.	Zero Downtime: Most CATS platform releases are carefully planned to achieve zero downtime. This means that users should experience uninterrupted service during these updates.
5.	Occasional Downtime: On occasion, the CATS Platform Team may release upgrades or new features that require some downtime. In such cases, we follow a structured process to minimize disruption.
Step-by-Step Process
Sprint Weeks 1 and 2
1.	Development Phase
o	New features are developed and tested by the platfrom team in the Sandbox environment.
2.	Testing Phase
o	Features developed during the previous sprint remain in the DEV and QA environments for two weeks of customer testing.
o	Customers interact with the features, providing feedback and identifying any issues. Issues are fixed as they are reported by customers or identified by our team.
3.	Release to Production
o	At the end of the two-week sprint:
	Successfully tested features are promoted from DEV and QA to Production (PROD).
	After the upgrade has concluded the Platform Team will document the health of the production environment by attaching a screenshot in the QA to PRD Pull Request.
	This release occurs on the Friday before the sprint ends.
o	Patching Schedule:
	For workloads running on EC2 nodes, patching occurs on the first Sunday of every month at 1 AM UTC.
	For workloads running on Fargate, please refer to AWS's documentation regarding interruption expectations: AWS Fargate Pod Patching.
o	PRD Release Notification:
	On the Monday before the DEV and QA features are pushed to production an email will be sent to the CATS mailing list. This email will include release notes that encompass all changes that are being pushed to PRD as well as reiterate the timeline of when these changes will be taking place.
4.	Environment Synchronization (Monday Following Release)
o	After the PROD release, the production environment is merged back into DEV and QA:
	This ensures that any hotfixes released to PROD are reflected in the lower environments.
	It also prepares DEV and QA for the next round of testing with a clean slate.
5.	Feature Promotion to DEV and QA
o	Features developed in the Sandbox during the previous sprint are promoted to the DEV and QA environments for customer testing.
o	DEV and QA Promotion Notification: Once the new features that have been developed in the Sandbox Environment have been successfully pushed to both the DEV and QA clusters a notification will be sent out to the CATS mailing list that highlights the new features available. Users will be requested to report any issues to the platform team that they encounter over the two week period where these features will sit in DEV and QA for testing.
6.	Cycle Restart
o	The cycle begins again:
	New features are developed in Sandbox.
	Features from the prior sprint are tested in DEV and QA.
Key Highlights
•	This process ensures features undergo two weeks of customer testing in DEV and QA before being released to PROD.
•	Synchronizing environments after each PROD release minimizes discrepancies and provides a consistent testing experience.
•	Regular feedback during the testing phase allows us to address issues before production deployment.
If you have any questions about this process or need assistance with testing, please reach out to the CATS support team via the Teams Channel!
Sprint Schedule
Please use the below schedule to understand our sprint schedule and when we are planning releases to each environment. This table will be continuously updated for accuracy.
Release Name	Sprint Start	Sprint End	Production Release	DEV QA Release
4.1.1	Jan 7	Jan 14	Jan 17	Jan 27 through Jan 28
-----	Jan 14	Jan 27	-No PRD Release-	Jan 27 through Jan 28
4.2.1	Jan 28	Feb 10	Feb 07	Feb 10 through Feb 11
4.2.2	Feb 11	Feb 24	Feb 21	Feb 24 through Feb 25
4.3.1	Feb 25	Mar 10	Mar 07	Mar 10 through Mar 11
4.3.2	Mar 11	Mar 24	Mar 21	Mar 24 through Mar 25
4.4.1	Mar 25	Apr 07	Apr 04	Apr 07 through Apr 08
4.4.2	Apr 08	Apr 21	Apr 18	Apr 21 through Apr 22
4.5.1	Apr 22	May 05	May 02	May 05 through May 06
4.5.2	May 06	May 19	May 16	May 19 through May 20
4.5.3	May 20	Jun 02	May 30	Jun 02 through Jun 03
4.6.1	Jun 03	Jun 16	Jun 13	Jun 16 through Jun 17
4.6.2	Jun 17	Jun 30	Jun 27	Jun 30 through Jul 01
-----	Jul 01	Jul 14	-No PRD Release-	-No DEV/QA Release-
4.7.1	Jul 15	Jul 28	Jul 25	Jul 28 through Jul 29
4.8.1	Jul 29	Aug 11	Aug 08	Aug 11 through Aug 12
4.8.2	Aug 12	Aug 25	Aug 22	Aug 25 through Aug 26
4.9.1	Aug 26	Sep 08	Sep 05	Sep 08 through Sep 09
4.9.2	Sep 09	Sep 22	Sep 19	Sep 22 through Sep 23
4.10.1	Sep 23	Oct 06	Oct 03	Oct 06 through Oct 07
4.10.2	Oct 07	Oct 20	Oct 17	Oct 20 through Oct 21
4.10.3	Oct 21	Nov 03	Oct 31	Nov 03 through Nov 04
4.11.1	Nov 04	Nov 17	Nov 14	Nov 17 through Nov 18
4.11.2	Nov 18	Dec 01	Nov 28	Dec 01 through Dec 02
4.12.1	Dec 02	Dec 15	Dec 12	Dec 15 through Dec 16
------	Dec 16	Dec 29	-No PRD Release-	-No DEV/QA Release-
Release Notification Channels
•	CATS Release Notifications Email Group
o	This is an email group we use exclusively for announcing upcoming platform upgrades. If you would like to join our mailing list please navigate to the Developer Front Door and join the group.
•	DocSite News Section
o	This is the section on the DocSite itself where we upload our release notes. Check them out!
•	SPE CATS Teams Channel
o	Link to Channel




Contact Us
Official Communication Channels
Below you can find the official communication channels for reaching out to the CATS Platform team. If you have a problem we suggest submitting a ServiceNow Request. If you have a question, we suggest posting a question on Lilly Flow.
•	Outlook:
o	Used for formal communications, escalations, and documentation of incident or status updates.
o	Official announcements, including maintenance schedules and policy updates, are distributed via email to all relevant stakeholders.
o	Official CATS Support email: CATS_Support@lilly.com
•	Lilly Flow:
o	A Stack Overflow-style platform where customers can post questions and receive answers from support teams or community members.
o	Used for knowledge sharing, enabling customers to find solutions to common issues and contribute to a shared knowledge base.
o	Link to CATS Club Lilly Flow community.
•	Microsoft Teams Channel:
o	Real-time communication channel for quick responses to queries, updates on ongoing incidents, and collaborative troubleshooting.
o	Dedicated channels for critical incidents, where the team can coordinate efforts, share real-time updates, and access historical discussions for reference.
o	Link to Microsoft Teams Channel
•	ServiceNow:
o	Primary platform for incident tracking and resolution documentation.
o	Used to log, categorize, and manage incidents with clear tracking of response and resolution times, aligning with the SLA.
o	Link to ServiceNow Request
o	Link to ServiceNow Help Desk Knowledge Article
•	Status Page (Coming Soon):
o	Public-facing communication tool for broadcasting system status and incident updates.
o	Provides real-time updates on system availability, ongoing incidents, and planned maintenance, allowing users to monitor platform health.
•	JIRA Board:
o	Project management tool for tracking ongoing work, planned improvements, and backlog items.
o	Used for prioritizing, tracking progress, and documenting fixes related to incidents or platform enhancements.
o	Link to JIRA Project
CATS Platform Team
The following individuals are part of the CATS Platform Team, dedicated to developing and delivering new features. For support inquiries, please use the official support channels provided above.
Location LCC:
•	Cole Thomas
•	Ross Grinvalds
•	Natalie Pierce
•	Brian Cheong
•	Jeffrey Hensley
Location LCCI:
•	Satyarthsinh Gohil
•	Saurabh Purohit
•	Uday Vempalaku
🐾 CATS Club 🐾
Do you have questions about CATS in general and wonder how you can take advantage of it? Need help with your deployments to CATS from an expert? Looking for a community that shares your interest in DevOps and cloud technologies? CATS Club is where you need to be!
CATS Club is a Community on Lilly Flow. Join to stay informed around questions coming in and answers going out!
Contributors
See the list of contributors who have participated in the development of the platform's infrasturcture.







Troubleshooting
Getting stuck on your deployment? Here are some built-in resources offered by CATS that you can use to check the status of your deployment and the health of your application:
Build and Push Errors
Missing Signature Key
err="missing signature key"
-east-2.amazonaws.com, from AWS API>]}" err="missing signature key" ref=283234040926.dkr.ecr.us-east-2.amazonaws.com/gis-eip-backstagepilot:qa-c40b39f296dc1aca60112e1267fc8d07cb488d8b ││ ts=2024-04-22T16:50:07.105344558Z caller=repocachemanager.go:226 component=warmer canonical_name=283234040926.dkr.ecr.us-east-2.amazonaws.com/gis-eip-backstagepilot auth="{map[283234040926.dkr.ecr.us-east-2.amazonaws.com:<registry creds for AWS@283234040926.dkr.ecr.us │
This error can be seen in the flux pod logs. It is almost always the result of a application team moving to docker-build-and-push-actionsv4 or higher and not including provenance=false in their workflow file.
provenance: false This option controls whether or not to include provenance information when building and pushing Docker images. Provenance information in the context of Docker images refers to metadata that describes the origin and history of an image, including details about how it was built, its layers, and any dependencies. It can be useful for tracking the authenticity and security of an image, especially in situations where you need to ensure the image's trustworthiness. In our cluster if you do not include this line the automation may create 'image index' artifacts in our ECR that will cause flux errors so please ensure you include the line provenance:false.
If you are seeing err="missing signature key" your new image is not going to deploy until you go into the ECR and delete all "image index" artifacts from your private repository. To delete the image index artifacts you will need a CA account.
1.	Ensure provenance:false has been added to your workflow file
2.	Navigate to the AWS console and go to the clustery you are working in dev / qa / prd.
3.	Navigate to "Private Registry" and go to "repositories
4.	Search for the repository you are pushing images from
5.	Scroll through all the images in this section and identify all entries that have the type "Image Index".
6.	Delete all "Image Index" items and flux will release your newest image
Kubernetes Dashboard
The Kubernetes dashboard allows you to check the health status of your deployments, making sure that the configurations and state of your application are exactly as intended.
Depending on your deployment environment, you can visit the dashboard here:
•	DEV
•	QA
•	PROD
Deployment Errors in Events
MatchNodeSelector Failed:
MatchNodeSelector failed: Fargate profile LightClusterfargateprofilefgpr-5f0df229c03844b4b65c8d060fd680e7 cannot satisfy pod's node selector/affinity requirements
If you see this error it means that your deployment and pods have failed to satisfy the requirements to be scheduled on a specific node. You may have set your compute to serverless in your namespace and then specified node selection in your deployment definition.
       # Use node selector to specify the run environment (dev/qa/prd)
       nodeSelector:
         app.lrl.lilly.com/env: dev
       tolerations:
       - key: dedicated
         value: "ec2"
         effect: "NoExecute"
The code above is used for selecting a node while in hybrid compute so you will need to remove this if you are actually using serverless compute.
Conversley you may be trying to use hybrid compute but have not included the above code to properly activate the node selector.

untolerated taint:
combined from similar events): pod didn't trigger scale-up: 6 node(s) had untolerated taint {app: livedesign}, 167 node(s) had untolerated taint {dedicated: ec2}, 6 node(s) had untolerated taint {app: bioturing}, 12 node(s) had untolerated taint {app: chemistry42}, 18 node(s) had untolerated taint {app: bia-ds}, 16 node(s) had untolerated taint {app: blaze}
This is a common error that is actually not an error at all. This often shows up when you have not specified compute in your namespace. Go take a look at your annotations on your namespace file and ensure you have compute listed on your namespace file. After adding compute to your namespace it can take some time to get back in sync and can be helped via a deployment restart.

CORS issues
elog-d.apps.lrl.lilly.com/:1  Access to XMLHttpRequest at 'https://elog-api-d.apps-api.lrl.lilly.com/status/sharepoint_status/?user_id=kaustav.khatua%40lilly.com' from origin 'https://elog-d.apps.lrl.lilly.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
If one application (i.e. namespace) needs to expose its api to a web UI of another (i.e. to avoid CORS issues in a browser), it needs to allow the use of its host name in a different namespace via middleware. The above error occurred when an app team was trying to do this within a single namespace. Removing the middleware eliminated the error.
Ingress Troubleshooting
To troubleshoot ingress use Traefik dashboard on : Traefik Dashboard
No-authentication traefik controller is separate and has its dashboard on Traefik Dashboard - No Auth
Netshoot for Troubleshooting

this section will outline how to install and use a netshoot container for troubleshooting
AWS & AWS CLI
Alternatively, if you prefer to use the Kubernetes CLI tool kubectl to view the status of your deployments, some additional steps are required to set that up:
Set up Lilly AWS and login to the AWS account for CATS
Please visit this GitHub Wiki to set up your Lilly AWS -CA account and gain access to the CATS AWS accounts, for both the Management Console and CLI.
Install Dependencies and Prepare Directories
If you are not running Linux and/or do not wish to use the Homebrew package manager, please visit this page for more detailed installation instructions.
Otherwise, if Homebrew is not yet installed on your machine, run this command and press ENTER when prompted
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Upon successful installation, run the following two commands to allow brew to be executable (you will be prompted to do this in the terminal as well)
(echo; echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"') >> /home/codespace/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
If kubectl or awscli is not yet installed on your machine, use brew to install (brew install kubectl or brew install awscli respesctively).
Setup Cluster Auth (read only qa/prod)
Add this to your ~/.aws/config file using vim (if you receive an error "Can't open file for writing", run mkdir ~/.aws before modifying the config file)
[profile light-d-sso]
output = json
region = us-east-2
sso_session = lilly
sso_account_id = 408787358807
sso_role_name = aws_light_devs

[profile light-q-sso]
output = json
region = us-east-2
sso_session = lilly
sso_account_id = 474366589702
sso_role_name = aws_light_devs

[profile light-p-sso]
output = json
region = us-east-2
sso_session = lilly
sso_account_id = 283234040926
sso_role_name = aws_light_devs

[sso-session lilly]
sso_start_url = https://lilly-aws-login.awsapps.com/start/
sso_region = us-east-2
sso_registration_scopes = sso:account:access
Run the following command to set your default profile to light-d-sso (note: if you skip this step you will still log in but you will be unable to correctly access AWS)
export AWS_PROFILE=light-d-sso
Type the text below into your terminal to log into the aws cluster. Copy the second URL provided and past it into a Private or InPrivate window. Log in with your CA account
aws sso login --sso-session lilly --no-browser
To verify that you have logged in successfully, run the following command (you should receive a JSON file as an output - if you receive a request object, make sure you have correctly exported your profile)
aws sts get-caller-identity
Use the commands below to apply the profiles to your ~/.kube/config
aws eks update-kubeconfig --name Light-Infra --region us-east-2 --alias light-d-sso --profile light-d-sso --user-alias light-d-sso
aws eks update-kubeconfig --name Light-Infra --region us-east-2 --alias light-q-sso --profile light-q-sso --user-alias light-q-sso
aws eks update-kubeconfig --name Light-Infra --region us-east-2 --alias light-p-sso --profile light-p-sso --user-alias light-p-sso
Use kubectl commands to view resources
Once everything is set up, you can start viewing your deployments using the CLI. Here are some commands to help you start off:
# List all Namespaces within the cluster
kubectl get namespaces

# List all Pods in a specific Namespace 
kubectl get pods -n <namespace>

# List all Deployments in a specific Namespace
kubectl get deployments -n <namespace>

# Get detailed information of a specific Deployment
kubectl describe deployment <deployment-name> -n <namespace>

# Get the Deployment's manifest (current state) in YAML Format
kubectl get deployment <deployment-name> -n <namespace> -o yaml

# Port-Forward a Local Port to a Port on a Pod in a Deployment
kubectl port-forward pod/<pod-name> -n <namespace> <local-port>:<pod-port>

# Execute a Command in a Deployment
kubectl exec -it deployment/<deployment-name> -n <namespace> -- <command>

# Execute a Command in a Pod of a Deployment
kubectl exec -it <pod-name> -n <namespace> -- <command>

K9s
K9s is a terminal-based (CLI) utility that provides a text-based user interface (TUI) to interact with Kubernetes clusters. It allows users to navigate, observe, and manage their Kubernetes resources and workloads efficiently from the command line. K9s streamlines the monitoring of cluster components, viewing logs, and executing Kubernetes commands, making it a valuable tool for developers and system administrators working with Kubernetes.
Installing K9s
Navigate to the K9s website and follow their documentation for installing. Once Installed you can follow our steps for configuring your contexts to align with the CATS platform
k9s Official Website
ECR Troubleshooting in Workflow
Docker build step failed 403 on login
TODO: add to healthcheck. Some cron job that runs to constantly check login to ECR is working okay.
possible problems to explore.
•	expired token
•	wrong secret
•	wrong secret value
•	interface change
•	supply wrong value or structure
Steps to evaluate the issue:
1.	Verify the token has not expired by ensuring other projects are able to build. If other projects are not building that means that the token is no longer valid and users can no longer push to our ECR causing outage on pushing upgrades to the cluster. Immediately notify CATS Platform team if you suspect the token has expired.
2.	Verify the login method by using Docker Command Line to interact with the ECR.
3.	Check the ECR Credential service Job within the ECR Credentials namespace accessible by using kubectl or K9s. Runs on 30 min intervals so go verify the associated CronJob. Review Cron Job description. Check to see if a job or cron job is stuck.
4.	CronJob Leads us to [LRL_light_k8s_infra_credential_service]([9:42 AM] Ross Grinvalds LRL_light_k8s_infra_credential_service/main.go at main · EliLillyCo/LRL_light_k8s_infra_credential_service (github.com)) repository review for new code changes and ensure its working correctly.
5.	If no issues are found in steps 1-4 secret is working correctly.
6.	Go back to your repo and review your test as the test may be broken.
API Troubleshooting
Troubleshooting Steps:
work through the following steps to troubleshoot you ingress if you are failing to connect.
Recorded Troubleshooting Demo - Our API guru Natalie Pierce recently led a Cats Club demo on how to troubleshoot API connectivity issues. There is a recording of this session that may be helpful for our users and it is located here.

1. Ensure App is deployed correctly via a Authenticated route example
Have you deployed an ingress using the authenticated route? If not this is the first step in testing to see where your issues may be stemming from.
You can have multiple ingresses configured at the same time so ensure you have an authenticated route ingress available to you for testing. This will allow you to verify if you solution is deployed successfully by hitting the swagger page on your url via the /docs endpoint.
Below is an example of an ingress configured by the MD3 team that you can use as a reference. To see a more basic template navigate to the Ingress Section of the Docs Site:
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: blaze
  namespace: md3-prd
  annotations:
    lilly.com/user_info_headers: '[{"attribute": "id", "header": "X-USER"}, {"attribute":
      "name", "header": "X-WEBAUTH-NAME"}, {"attribute": "email", "header": "X-WEBAUTH-EMAIL"},
      {"attribute": "groups", "header": "X-WEBAUTH-GROUPS"}]'
    lilly.com/security_groups: |
      [
        {
          "Route": "/",
          "ADGroups": ["approved_mobius_chemview"]
        }
      ]
spec:
  rules:
  - host: blaze.apps.lrl.lilly.com
    http:
      paths:
      - path: '/'
        pathType: Prefix
        backend:
          service:
            name: blaze
            port:
              number: 8080

2. Ensure the configuration of your api route ingress resource is correct
It is possible you may have misconfigured your api route and this miss configuration is causing an error.
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: example-app
  namespace: example
  annotations:
    lilly.com/security_groups: |
      [
        {
          "Route": "/",
          "ADGroups": [ "ad_group1", "ad_group2" ]
        }
      ]
spec:
  rules:
  - host: example-app.apps-api.lrl.lilly.com
    http:
      paths:
      - path: '/'
        backend:
          serviceName: example-backend-service
          servicePort: 80
A. Compare your api route ingress configuration against the above template. If there are differences that may be causing your issue:
B. Are there any spacing or syntax errors with your ingress resource?
C. Ensure your service port maps correctly to the ports declared in your Service Resource
D. Does your serviceName correctly map to the name declared in your Service Resource?
E. Is your path correctly configured?
F. Is your route correctly configured?
H. Do the security groups you have declared exist? Is the account you are accessing from in the groups? Verify security group rules are running properly.
•	visit the idm portal to verify the existence of your group and users are added to the group

3. Is container running correctly
Check root path of both container and k8s spec this can cause the spec.api.json to not show up.
Verify that your fastapi is running locally:
perform a docker build of your container
docker build . -t my-tag
docker run my-tag
visit http://localhost:<your-port>/docs you should see the swagger spec for your fastapi endpoint if you don't see this or see an api spec not found you might have misconfigured the dockerfile, here is a sample dockerfile
FROM elilillyco-lilly-docker.jfrog.io/python:3.11

WORKDIR /app
COPY . /app/
RUN pip install -r requirements.txt

CMD [ "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers"] <---- may or may no
after verifying the container is running correctly locally, try pushing up a corresponding k8s deployment and visit your-user-facing-ingress/docs if you see api spec not found from kubernetes, you may need to set the root-path in your deployment file.
 spec:
      containers:
      - name: echo-server-reflector
        image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_light_k8s_infra_echo:dev-sha-a34f51d
        command: ["uvicorn"]
        args: ["app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8080",
          "--proxy-headers", "--root-path", "/"] 
        resources:
          limits:
            memory: "2Gi"
            cpu: "1"
          requests:
            memory: "2Gi"
            cpu: "1"
        ports:
        - containerPort: 8080
4. Use light client to hit google to ensure light client is set up correctly
A. Ensure you have properly configured the light client, and chosen the correct environment: {LRL_LIGHT_K8S_INFRA_APPS_TEST: DEV, LRL_LIGHT_K8S_INFRA_APPS_QA: QA, LRL_LIGHT_K8S_INFRA_APPS: PRD}
client = LIGHTClient(env="DEV") #this takes you through an azure ad workflow if you haven't done so recently
B. Test the light client against sample admin testing reflector pod, you should see a 200 response back
url = "https://admin-testing-main.apps-api-d.lrl.lilly.com/make_request?url=https://google.com&method=get"
headers = {
    "Content-Type": "application/json"
}
try:
    response = client.get(url=url, timeout=10)
except requests.exceptions.ConnectTimeout as e:
    response = requests.Response()
    response._content = e
    response.status_code = 503
if response.status_code != 200:
    print(response.status_code)
    print(response.json())
else:
    print(response.status_code)
    print(response.json())
D. Update your light client to hit your solutions end point.
url_prd = "https://my-not-user-facing-api-route.apps-api.lrl.lilly.com" #prd
url_qa = "https://my-not-user-facing-api-route.apps-api-q.lrl.lilly.com" #qa
url_dev = "https://my-not-user-facing-api-route.apps-api-d.lrl.lilly.com" #dev

headers = {
    "Content-Type": "application/json"
}

try:
    response = client.get(url=url, timeout=10)
except requests.exceptions.ConnectTimeout as e:
    response = requests.Response()
    response._content = e
    response.status_code = 503
if response.status_code != 200:
    print(response.status_code)
    print(response.json())
else:
    print(response.status_code)
    print(response.json())

Potential Errors:
1.	Invalid Token - If you are going to your api endpoint and getting an "Invalid Token" response via your browser do not worry, this is expected functionality. The API route is only accessible via script based access and cannot be accessed via a browser. That is why it is important to deploy two ingresses side by side so that you can verify that the solution has been successfully deployed via checking with your browser.
2.	500 Error - A 500 Internal Server Error is a generic error message, given when an unexpected condition was encountered by the web server and it could not fulfill the request made by the client. This error is a server-side issue, meaning the problem is not with your computer or internet connection but with the website's server itself. In this case you are hitting the CATS Platform's server but most likely failing to authenticate.
3.	502 Bad Gateway - s another type of HTTP status code that indicates a problem with the network communication between servers on the internet. Specifically, it occurs when one server on the internet receives an invalid response from another server it was trying to communicate with. This error is considered a server-side issue, meaning the problem usually isn't with your device or internet connection but rather with the website's server or the network infrastructure connecting to it. In this case we suggest verifying the ports you have configured and are targeting are configured correctly. Verify that the ports you have exposed within your applications dockerfile match up the the ports you have specified in your kuberntes resource deployment files.
Notes on Authentication:
1.	If you are outside the cluster you must always re authenticate to get past bouncer
2.	If you are inside the cluster already you can directly use the internal cluster networking to directly hit your endpoint because you are already authenticated.
Cross AWS Account Connection
If you are trying to connect from the CATS Production cluster to a different DWS AWS account that is not a production environment you will run into errors as this is not a supported pattern. You must make calls TO the same level environment as you are making requests FROM.
If you are trying to access a dev DWS AWS account you will need to deploy your solution in the infra_apps_test github repository.
If you are trying to access a QA DWS AWS account you will need to deploy your solution in the infra_apps_qa github repository.
If you are trying to access a Production DWS AWS account you will need to deploy your solution in the infra_apps github repository.
Get a -CA Account
A Cloud Administrator Account (-CA Account) is required to log into the CATS AWS accounts corresponding to each environment.
Set up AWS -CA Account to log into the Cluster. See helpful Docs here.
Edit this page




Temporal
Temporal provides a service for durably executing workflows.
The admin group for Temporal is CATS_Support. Admin access can be requested for CA accounts in myAccess.
High Level Architecture
The Temporal service consists of the following components:
•	The Temporal server provides the core functionality for Temporal. This includes scheduling workflows and processing API requests.
•	The Temporal UI provides app developers a way to monitor and debug their workflow executions.
•	The Lilly Temporal Operator backs the TemporalNamespace Kubernetes resource, which handles on and offboarding.
•	A RDS Postgres cluster is used as the primary data storage. The cluster contains two databases:
o	The default postgres database is used for Temporal state and visbility storage.
o	The lilly_temporal_operator database is used to store role mappings between AD groups and Temporal namespaces. As well as any other state the Lilly Temporal Operator needs to track.
•	A S3 bucket is used to archive data that is older than the retention period for projects that have archival enabled.
•	An example app is also deployed, which can be used for testing updates, demos, and debugging.
 
Code locations:
•	EliLillyCo/lilly-kubed-temporal
o	Temporal server with custom claim mapper and authorizer for Lilly authentication
o	Lilly Temporal Operator
o	Example app code
•	EliLillyCo/lilly-temporal-ui
o	Temporal UI code with customizations and fixes for oauth2-proxy
o	Eventually we would like to upstream most of these changes
•	EliLillyCo/cats-temporal-example
o	Example application code for the Temporal deployment in CATS cluster
o	We plan to upstream most of these changes in the future
•	LRL_light_k8s_infra_apps/projects/dev/cats-admin-examples-dev
o	Deployment configuration for the Temporal example application in CATS cluster
Authentication
Temporal allows access from Lilly developers and applications via Kubernetes service accounts.
Lilly Developers
Lilly Developers use the Temporal console to monitor, operate, and debug their workflow executions. The Temporal console authorization is implemented by the Bouncer service in CATS. When a developer visits the console, the following happens:
1.	Bouncer ensures the developer has authenticated with Lilly SSO. If the developer has authenticated successfully, then their access and identity token will be added as HTTP headers to the request before it is passed on to the Temporal console. Otherwise, Bouncer displays an unauthenticated error page.
2.	When the Temporal console receives the request, it starts rendering the page. Any API calls required to render the page include the user’s identity token.
3.	When the Temporal API receives a request, it checks the issuer of the token. If the token is from Lilly’s Microsoft tenant, the signature of the token is verified using the JWKS for Lilly’s Microsoft tenant. If the token is not issued from the Lilly Entra ID tenant or the signature is not valid, then the request is rejected. Valid tokens move on to authorization, see below.
Applications
Applications in Lilly Kubed can make API calls to Temporal using their Kubernetes service account.
1.	The application retrieves their Kubernetes service account token from the container’s file system or the Kubernetes API. The application will periodically need to retrieve a fresh token.
2.	When the application makes a request to the Temporal API it includes the service account token in the GRPC authorization header. This is normally done using a configuration option in the Temporal SDK.
3.	When the Temporal API receives a request, it checks the issuer of the token. If the token is from Lilly’s Microsoft tenant, the signature of the token is verified using the JWKS for Lilly’s Microsoft tenant. If the token is from Lilly Kubed, the token is validated using the Kubernetes TokenReview API. If the token is not from one of these issuers or the signature is not valid, then the request is rejected. Valid tokens move on to authorization, see below.
Authorization
Requests that pass authentication are then checked to ensure the requester is authorized to make the requested action. Resources in Temporal are organized into namespaces. Access to Temporal namespaces is based on access to corresponding Kubernetes namespaces.
Lilly Developers
If the request’s token was from Lilly’s Microsoft tenant, the following process is used for authorization.
1.	If the endpoint of the request is get cluster info, list namespaces, or one of the health check endpoints, it is allowed. Access to these endpoints is required for the basic functionality of the Temporal UI.
2.	The AD groups for the request’s Temporal namespace are looked up in the database.
3.	If the admin group is configured and the requester is a member of the group, the requester is marked as having admin access to the namespace. Skip to step 6.
4.	If the writer group is configured and the requester is a member of the group, the requester is marked as having write access to the namespace. Skip to step 6.
5.	If the reader group is configured and the requester is a member of the group, the requester is marked as having read access to the namespace.
6.	The required access level for the request is looked up, and if the requester is marked with the appropriate access level, the request is allowed. Otherwise, the request is denied.
Applications
If the request’s token was from a Kubernetes service account, the following process is used for authorization.
1.	If the endpoint of the request is one of the health check endpoints, it is allowed.
2.	If the request’s Temporal namespace matches the service account’s Kubernetes namespace or starts with the service account’s namespace and a dash, the requester is marked as having write access to the Temporal namespace.
3.	The required access level for the request is looked up, and if the requester is marked with the appropriate access level, the request is allowed. Otherwise, the request is denied.
Onboarding
Applications hosted in CATS can get access to Temporal by creating the TemporalNamespace custom resource. This resource creates a new Temporal namespace for the application. The properties of TemporalNamespace allow application developers to configure settings for their Temporal namespace. The application developers can configure a reader, writer, and/or admin AD group to provide developers access to the Temporal console. Kubernetes service accounts in the same namespace as the TemporalNamespace custom resource receive write access to the Temporal namespace.
Applications should only need a single Temporal namespace, but an app can create multiple Temporal namespaces if needed.
Offboarding
When a TemporalNamespace resource is removed from Kubernetes, the Temporal namespace will be offboarded.
Scaling Up Temporal
•	The Temporal server currently runs in "unified" mode. There are multiple options for scaling this up:
o	You can continue to use "unified" mode and horizontally scale using the replicas field in the deployment.
o	You can create separate deployments for each of the Temporal subservices and scale them individually.
•	RDS Postgres is currently be used to store state and visibility information. There might be a more performant option for the visibility storage.
•	The Temporal UI can be horizontally scaled using the replicas field in the deployment.
•	It is unlikely that the Temporal operator will need to be scaled beyond one replica. If this is needed for some reason, please see the kopf library documentation.
Verifying Temporal Health
You can use the Temporal example app to verify that Temporal is up and working as expected. Instructions for running the workflows are provided below. You can view the running workflows in the Temporal console under the namespace temporal-<env>, where <env> is the environment name.
Example App URLs:
•	DEV: https://temporal-example.dev.cats.lilly.com/
•	QA: https://temporal-example.qa.cats.lilly.com/
•	PROD: https://temporal-example.cats.lilly.com/
Temporal Console URLs:
•	DEV: https://temporal.dev.cats.lilly.com/
•	QA: https://temporal.qa.cats.lilly.com/
•	PROD: https://temporal.cats.lilly.com/
Hello World Workflow:
1.	Click on the Hello, World link.
2.	You should get back a JSON response containing the time and a greeting with your name.
Material Testing Workflow:
1.	Click on the Material Testing link.
2.	Create a new material or choose an existing one. Note, the data is stored in a SQLite database which is cleared on restarts.
3.	Click on the "Order" button, which will start the workflow. This workflow tests several features of Temporal.
4.	Wait for the "Get Shipping Label" button to appear and then click it.
5.	Wait for the simulation of the shipment to complete.
6.	Wait for the simulation of material testing to complete.
7.	You should get back a tensile strength value when the workflow is complete.
Debugging Tips
This section contains debugging tips for common situations:
•	App developers are expected to debug their own workflow code. The Temporal UI can be helpful for doing this.
•	If the app developer is having issues with onboarding, check the Lilly Temporal Operator logs. It will be helpful to have the timestamp when the TemporalNamespace was deployed.
•	If the app developer is getting an access denied issue:
o	Check if their AD group configuration is valid.
o	Check for errors when registering the AD group mapping in the Lilly Temporal Operator logs.
o	Information about authentication and authorization checks can be found in the Temporal server logs.
•	If the app developer's worker is having issues connecting to Temporal, start by checking the Istio configuration.
•	The Temporal server logs are helpful for debugging issues. You may need to adjust the log level to get more (or less) information.
Edit this page





Quality Overview
CATS is a GxP Qualified Platform under Security code RC4. We have all documentation up to date and approved in Veeva Vaults - Quality Docs.
Security Administration and SOP
The security plan documents the physical and logical security controls for the system which are based upon the classifications detailed in section 1.1 “Overview of Security Model" and the expectations of LQP-302-29 Computer Systems and Platform Security. The purpose of this Security Plan and Standard Operating Procedure (SOP) is to describe processes and procedures necessary to maintain and support the Cloud Applications and Technologies as a Service (CATS) platform to ensure it remains in a validated state.
Access to all computer systems and data must be controlled and managed with the goal of protecting company assets from unauthorized access, inadvertent or unauthorized alteration or destruction of systems or the data contained within the system. The Standard Operating Procedure (SOP) addresses the security administration procedures used to protect and limit access to the computer system, including source code. It describes how the system addresses access review, electronic signatures usage, and access to the computer system (including hardware, software, documentation, and data) to authorized users.
As not all of our users have access to view the Official Documents in Veeva Vault due to permission configuration we have an up to date copy of our CATS - Security Administration and SOP document available for download in the infra_apps repository.
GxP Qualified
As a platform, CATS is GxP-neutral and will be qualified appropriately for all types of data.
•	The highest classification of Confidential Information (CI) for the platform is Red CI.
•	The highest classification of Personal Information (PI) for the platform is Red PI.
•	The highest classification of Sensitive Personal Information (SPI) for the platform is Red SPI
As not all of our users have access to view the Official Documents in Veeva Vault due to permission configuration we have an up to date copy of our CATS - Qualification Plan document available for download in the infra_apps repository.
Disaster Recovery Plan
This plan is focused on the Cloud Applications and Technologies as a Service (CATS) Platform and how the platform team will handle the event of a disaster and how the recovery of the platform because of said disaster. A disaster causing a widespread loss of system usage invokes the execution of the Disaster Recovery Plan (DRP). The System Custodian declares whether a disaster has occurred, and implementation of a recovery plan is appropriate. Once declared, the System Custodian begins executing the DRP.
As not all of our users have access to view the Official Documents in Veeva Vault due to permission configuration we have an up to date copy of our CATS - Disaster Recovery Plan document available for download in the infra_apps repository.











CATS Chargeback Model Overview Coming 2026
Introduction
Starting in 2026, organizations with applications and services deployed onto the CATS platform will be charged back for incurred compute costs. Our Cloud Application Hosting Platform, CATS, employs a sophisticated chargeback model designed to allocate cloud computing and resource expenses equitably across all users. This model ensures that each department or project (referred to as a "cost center") is billed fairly for its actual usage as per cloud computing fundamentals. Chargebacks will be performed monthly, using the previous month's data.
Monitoring and Reporting
To provide transparency and enable efficient cost management, the CATS Team leverages Kubecost, a robust tool for monitoring cloud spending within our platform. The Kubecost dashboard is accessible at any time, offering detailed insights into the expenditure associated with your specific namespace or cost center.
Where can I see the expenses incurred for my cost center?
Please familiarize yourself with our Kubecost dashboard, where you can consult comprehensive costs by week, by month, or by any custom date at any time (more info can be found here). Depending on where your deployments are in CATS, you may need to look at costs incurred within one or more clusters. Your monthly chargeback will include a cumulative charge from all three clusters (dev, qa, and prod) in this dashboard:
•	Kubecost dashboard
Instructions to View Costs Associated with Your Cost Center
1.	Navigate to the "Monitor" tab on the left menu bar.
2.	Click on "Allocations" tab.
3.	Set your desired date range using the button that defaults to "Last 7 days" (we typically look at the past month's data).  
4.	Click on the "Namespace" button.
5.	Click into the "Find Label" box at the bottom of the pop-up, scroll down in the pop-up and click on "cost_center".
6.	Find your cost center in the table. Your total cost for the selected date range will be at the far right of the row. This is the amount we are charging back.
7.	For more details, click into your cost center, and explore the itemized breakdown of costs.
Monthly Spend Reports
Owners and stakeholders of each cost center will receive a monthly email summarizing the expenditure for each namespace under their purview over the preceding month. This detailed breakdown helps in understanding and managing costs effectively.
The collected metrics play a crucial role in annual business planning sessions, where the chargeback for each cost center is calculated. This process ensures that each area contributes fairly to the overall platform costs based on their resource usage.
Questions
For questions related to chargebacks, please reach out to Emily Richardson.
Edit this page








Release Process
Nonstandard Release Process
GITOPS Change Release Process (Flux/Merge queues)
This process is related to the application team workflows and is not reliant on an infrastructure change. Therefore, we would like to document the process of releasing this nonstandard change.
1.	Make announcement that we will be putting branch protection rules on main
2.	Delete all existing flux Custom Resource definitions
3.	Sync kyverno cluster policies to allow for generator policies to create imagepolicy, imagerepo, and imageupdateautomation
4.	Enable new action to autopush images to autocommit/my-namespace-branch
5.	Turn on merge queues to enable automerge on autocommit branches
6.	Validate and verify that: crs are available in argo, crs are reconciling images correctly in cluster, verify that autocommit images are being pushed and merge
Edit this page






Admin Onboarding Guide
Welcome to the CATS team! Please work through this list of activities and trainings to get more familiar with the CATS Platform and how we enable our customers!
The way the onboarding process will work is you will work on each item below step by step. After you have finished each section, you can check in with the rest of the platform team, giving you an opportunity to ask clarifying question and raise concerns about any blockers you may be facing.

1. Get Access
The following list should encompass all of the different items that you need to get access to in order to begin working as an Administrator for the CATS Platform.

GitHub
GitHub is the Lilly’s enterprise software for source code management. Anyone in Lilly who is looking for a version controlled source code managed tool should be using GitHub. It is a repository hosting service. Think of it as the “cloud” for code.
Get Access to GitHub
Get Access to CATS GitHub Group

StackOverflow for Lilly
Here at Lilly we have an internal instance of Stack Overflow where our employees can go to ask questions and get answers about technical problems. The CATS Platform encourages our customers to post their questions to this site where we can answer then and the answers are documented for the next customers to come along who may have a similar issue.
Follow the link below to trigger onboarding to Lilly Flow.
Get Access To Lilly Flow
Once you have access to Stack Overflow it is important for you to begin watching the CATS tag so that you can stay up to date with all of the CATS releated activity on Lilly Flow.
From the home page nagivate to Tags > "cats" then near the top of the page should be a blue button labeled "Watch Tag". Click it!
You can read through the collection of CATS articles and questions to get a better idea of how the site is used. CATS Collection
Note: Work with Cole Thomas to get you identified as a "Subject Matter Expert" for CATS.
Cloud Administrator Account
Here at Lilly there are two main types of account that you will use on an every day basis. Your normal standard account based off your given email address (example: thomas_cole_e@lilly.com) and a Cloud Administrator (CA) account (example: C233778-CA@llynet.com). In order to interact with cloud resources you must use your CA account. Follow the below instructions to get your CA Account.
Get a CA Account

JIRA
JIRA is a project management tool that helps teams plan, track, and manage agile projects, particularly using frameworks like Scrum or Kanban. Our team uses JIRA to organize and manage 2-week sprints, tracking tasks, progress, and collaboration throughout each sprint cycle.
Get access JIRA
Once you have JIRA access you need to be added to the CATS Project. Work with Jeffrey Hensley our team's scrum master to be added to our project with a "Developer Role".
Link to our JIRA Board and Active Sprint

Contentful
Contentful is where we manage the CATS Page on the "Developer Platform Front Door" site.
You won't need to do too much here daily but if updates are needed you will need Contentful Access. To begin just get access to contentful.
Get Access to Contentful

AD Groups
Active Directory Group Manager is the location where you can see what all AD groups you are in. There are three that you need to be added to as a part of the CATS Admin onboarding process.
aws_light_dev - This group gives you a role in AWS that allows you to access the CATS AWS accounts. This is the standard development role that customers will use to interact with the CATS AWS Account and their AWS Resources. To start out you will use this access to interact with our AWS Accounts. Your CA account will be added to this group.
Get Access via the Developer Front Door

lrl_cats_access_non_rids - This group is the group that provides users access to all of our dashboards, our ai chatbot called CatsBot, and ai agent called SPE Platforms Agent. Your normal account will be added to this group.
Get Access via the Developer Front Door.

cats_mailing_list - This group contains all of the users that are members of our mailing list. Members of this group will recieve communications related to the CATS Platform. Communications include notifications of downtimes, platform changes, release notes, etc.
Get Access via the Developer Front Door.

CATS_Support - This group is our general support group that we use for miscellaneous purposes when we don't have a specific group to use. It also allows you to recieve all support related emails in your inbox. Your normal account will be added to this group. Reach out to the group owner (Cole Thomas) and request you be added to the group
cats_argo_admin - this group is where we put all of our CA accounts so that we have admin access to everyone's projects when we are logged in with our CA account. Your CA account will be added to this group. Reach out to the group owner (Cole Thomas) and request you be added to the group

MyAccess
Navigate to MyAccess and request access to the role aws_light_admins.
1.	Navigate to MyAccess.
 
2.	Click "Manage My Access".
3.	Click "Add Access".
4.	Search aws_light_admins.
5.	Click the check mark next to aws_light_admins.
 
6.	Click the check mark to your CA account. If you do not have your CA. account yet STOP AND WAIT. Once your CA account is set up you can try again.
 
7.	Once you have selected your CA account click the green "Apply" button.
8.	Click the "Review and Submit" button at the top of the screen.
9.	Review the request you are submitting for accuracy and then click the "Submit" button at the bottom of the screen.
10.	Wait for the request to be approved.

LucidChart
Lucidchart is a cloud-based diagramming tool that allows users to create flowcharts, mind maps, organizational charts, and other visual representations to facilitate understanding and collaboration. It integrates with various productivity platforms, making it easy to share and collaborate on diagrams in real-time.
The CATS Team uses this product to build diagrams. The first thing you will do with lucid is review our architecture diagram.
Get access to LucidChart
Once you have access to lucid you can navigate to see our platform diagram here. You probably won't have access so reach out to Cole Thomas and he will add you to the project's workspace.

ServiceNow
We are currently in the middle of transitioning our support process to ServiceNow. Whenever we have new members join the team we have found one of the best ways for new hires to get to know the platform and how it works is to help our customers with the problems that they have raised. We will get you added to some groups so that you can help customers and improve your knowledge of the platform.

TASK 1:
Get Process User View
Answers to the form:
1. Request to grant access
2. Process User Access
3. No
4. Yes
5. Acknowledge

TASK 2:
Reach out to Cole Thomas and have him add you to the CATS-Platform-Support service now group.

Understanding AWS Roles
Upon completing your requests to join the necessary groups, you will gain access to various roles within the AWS Console. The table below provides a breakdown of the different AWS roles available. These roles are essential for both Tier II Support and the CATS Platform Team, as they enable proper interaction with the platform.
AWS Role Name	Details	Who needs this role?	How to get role
aws_light_devs	The standard role assigned to all platform customers. Every user should have this role associated with their CA account to interact with the platform. It is also critical for Tier II Support and the CATS Platform Team to hold this role, as it allows them to view and address issues from the customer’s perspective.	Application Developers -- Tier II Support -- CATS Platform Team	Get Added to the aws_light_devs AD group
aws_light_admins	This role grants elevated permissions beyond those provided by aws_light_devs. It is essential for support teams to efficiently assist customers with their issues.	Tier II Support -- CATS Platform Team	Request via MyAccess
aws_light_admins_expert	This role is restricted to select members of the CATS Platform Team. It provides the highest level of permissions within our AWS accounts.	Select CATS Platform Team members	Request via MyAccess

2. Review Platform Architecture
Now that you have all your access taken care of you can begin looking at the platform's architecture. We store the diagram in Lucid among other diagrams. Take a look at the platform architecture diagram to begin understanding how all the different components fit together.
Architecture Diagram
CATS Components List
3. Review DocSite
The DocSite, located at www.CATS.lilly.com, contains all the information around how to work with the CATS Platform. Reading through this entire site will answer a ton of questions as well as raise many new ones.
Before you begin reading through the site please navigate to the GitHub location for the DocSite and create a new branch. As you are reading through the content please use your branch to fix all spelling mistakes and broken links you come across. Once you have finished reading every page and clicking every link, please create a Pull Request and add Cole Thomas as a reviewer. This will be your first contribution to the platform!
4. Review Quality Documents
Thoroughly reviewing and understanding the quality documentation is essential for the ongoing maintenance of this platform. Annual updates are required to ensure that both our documentation and platform remain aligned with quality standards. Understanding these documents will also provide valuable context regarding the various components of CATS and the rationale behind our implementation decisions.
Documents in Veeva Vault:
•	CATS - Security Plan and Administration SOP
•	CATS - Qualification Plan
•	CATS - Disaster Recover Plan
•	Documents also located in Github
5. Review Application Deployment Repo
The CATS Platform consists of many repositories but to begin with we will focus on the two major repositories, the application deployment repo and the infrastructure repo.
LRL_light_k8s_infra_apps
This GitHub repository is used to deploy containerized applications into the Research AWS Light account. Our platform is developed using Amazon's fully managed Elastic Kubernetes Service (EKS) on Fargate. Since Fargate currently only supports Linux containers this will not support windows containers as of now.
This is the repository where all of the application teams deploy their solutions. You can see that it is broken up into sub folders of dev, qa, and prd. Each section allows users to have different development environments and separate those environments via namespace naming convention.
Click around and you can see there are many applications currently deployed. Last time I checked we had 207 instances of applications deployed in the production cluster.
6. Review Infrastructure Repo
Now that you have explored the application deployment repo it is time to take a look at the repository containing much of the infrastructure the platform is built off of. This repository contains the CDK stacks to deploy Light AWS infrastructure
LRL_light_k8s_infra
Click around the different folders and have a look at all the files. You will likely have many questions so feel free to write them down!
TASK: Execute a local build of the cluster. Hint, check out the Makefile.
7. Deploy Application on CATS
Work through the JUMP START Section of the DocSite and Deploy your first Application on the platform!
JUMP START Section
1.	Create a simple hello world fastAPI application
2.	Containerize your application via a dockerfile
3.	Write your workflow file
4.	write your k8s resource files and add them to the deployment repo
5.	get your application live!
Note: Once you are trying to deploy your solution taking a look at the dashboards that we offer as system services will help you with troubleshooting!
8. Explore Dashboard Offerings
You can find more info about all of the dashboards and links to their locations in our docsite here. Now that you have an application live in the cluster you can look up your application/namespace in all of the different dashboards to see how they work and what kind of information is available in each dashboard.
•	K8s Dashboard
•	Argo Dashboard
•	Metrics Dashboard
•	Traefik Dashboard
•	Logging Dashboard
9. Final Exam
Now that you have worked through all the above content please answer the following questions. This test is open book so please feel free to utilize CatsDocs or any other documentation you would like.
1.	Based off the below configuration, why are my automated deployments not happening?
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catsdocs-deployment
  namespace: cats-docs-dev
  annotations:
    app.lilly.com/flux.automated: "true"
    app.lilly.com/flux.simple.catsdocs: "283234040926;lrl_light_k8s_infra_apps_docs;glob:dev-sha-.*"
    wave.pusher.com/update-on-config-change: "true"
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: catsdocs
  template:
    metadata:
      labels:
        app.kubernetes.io/name: catsdocs
    spec:
      containers:
        - image: 283234040926.dkr.ecr.us-east-2.amazonaws.com/lrl_light_k8s_infra_apps_docs:dev-sha-d465756 # {"$imagepolicy": "cats-docs-dev:my-policy"}
          name: catsdocs
          resources:
            limits:
              memory: "2G"
              cpu: "1"
            requests:
              memory: "2G"
              cpu: "1"
          ports:
            - containerPort: 9090
2.	What does this annotation do?
annotations:
  app.lilly.com/sg-rule: |-
    {
    "ingress_rules": [
    {
        "namespace_allow_from": "llm-prd",
        "port": 5000
    }
    ],
    "egress_rules": []
    }
3.	What is Prometheus and what system services is it related to?
4.	If my namespace's pod does not start up due to the below error, what exactly is going wrong?
pod didn't trigger scale-up: 6 node(s) had untolerated taint {app: livedesign}, 167 node(s) had untolerated taint {dedicated: ec2}, 6 node(s) had untolerated taint {app: bioturing}, 12 node(s) had untolerated taint {app: chemistry42}, 18 node(s) had untolerated taint {app: bia-ds}, 16 node(s) had untolerated taint {app: blaze}
5.	A user comes to you and says their application is out of sync on the argo dashboard. What do you do to help them?
6.	If I want to create a new custom permission set for my application to assume how do i do it?
7.	A user comes to you and says they want to use AWS S3 to store files but when they go to the AWS console and navigate to S3, they cannot create or see any buckets. How do you help them?
8.	Create an issue in JIRA for something you think will benefit the platform, add it to the current sprint, assign it to yourself, prioritize it, and present it to the platform team at our next standup.
9.	When I navigate to one of the dashboards I get the below error, what do i need to do to fix it?
 
10.	When working on an issue for a customer, when do you think escalating the problem to the rest of the team is the right course of action?
After answering all the questions, please schedule a 30-minute meeting with the team so we can review your responses and address any potential misunderstandings. This isn't a formal test, but rather an opportunity to familiarize you with common customer inquiries and give you a chance to ask any questions you may have about the platform and its functionality. Don't Stress!
Edit this page







Administrator Tasks
1. Github token rotation
1.	go to github.com
2.	sign as also LRL-Light-admins@lists.lilly.com
3.	get the credentials from cyberark. go to lrl_light_admins@lists.lilly.com
4.	go over to github and log in as lrl_light_admins@lists.lilly.com and log in with the password
5.	go to setting > developer settings > personal access tokens > classic token
6.	if just rotating select the one you want to rotate
7.	get the token, go back and select configure on the token that was just rotated, this will open a login process.
8.	To log in go to LRL-Light-CICD@AM.lilly.com in cyberark and get the password
9.	The email for the login is LRL-Light-CICD@AM.lilly.com the password is what you just grabbed. This will complete the handoff.
2. Yearly refresh of Azure AD Client secret lrl-light-oidc.
The owner of the app App Registration in Azure will have to do this refresh. They will receive an email from FederationServices that notifies them that the secret will be expiring in one month. The email will look something like this:
 
There are two secrets that need to be refreshed at least yearly to maintain the OIDC authentication workflow.
•	LIGHT Web
•	LIGHT Web Non Prod
Note: there are some other secrets in here that you may get emails about. so reach out to the necessary party to let them know their secret is expiring.
•	Cortex -> Nathan Morin
•	Lilly Kubed - Chris Tornatta
•	bioturing - Abhi Malatpure
•	random secret you don't know? -> Nathan Morin / Ross Grinvalds
Method 1: Update Via Console
1.	Log into Azure Portal with your CA account: Azure Portal.
2.	Navigate to App Registrations and look up the application name that we want to rotate the secret for (LIGHT Web or LIGHT Web Non Prod).
3.	On the left hand side find the "Managed" section and go to "Certificates & Secrets".
4.	Create a new secret while trying to follow the naming convention for the secret you are replacing.
5.	Log into the AWS console and navigate to AWS Secret Manager service. Look up the secret lrl-light-oidc
6.	Replace the secret value for lrl-light-oidc with the value of the new secret you just created in Azure. (Note: Do not update the client ID.)
7.	Now that the secret has been rotated go back to the Azure Portal and delete the old secret.
Method 2: Update Via Command Line
1.	Edit AWS Secret Manager Secret above
2.	Login to Azure CLI az login --allow-no-subscriptions
3.	Run command az ad app credential reset --id <client id> --append, replacing the client id with the client id from the secret above
4.	Copy the secret output from this command into the above secret
5.	Secret is automatically synced with the cluster.
3. Create Custom Dashboard Backend Tasks
SUMMARY If you reading this an on the platform team then you have probably been asked to complete step number 3 for one of our users.
Completing the backend tasks consists of two tasks:
1.	Creating a dashboard provider
2.	mapping the dashboard provider to the configMap created by the application developer
________________________________________
TASK 1
To create a dashboard provider you can use the following template:
    {
    name: 'appsrepo[someName]',
    orgId: 1,
    folder: '',
    type: 'file',
    disableDeletion: false,
    //editable: true
    options: {
        path: '/var/lib/grafana/dashboards/appsrepo[someName]'  // has to equal values.dashboardProviders.'dashboardprovers.yaml'.providers.<self>.name
      }
    },
Note: when creating the dashboard provider's name, please follow the existing naming convention. The user has created a file called dashboard-configmap-[someName].yml, we are going to use whatever they have in [someName] as the name of the dashboard provider in the format 'appsrepo[someName]'
This dashboard provider is then placed next to the existing dashboard provider in the aws/lib/stacks/k8s/logging.ts file under:
dashboardProviders: {
          'dashboardproviders.yaml': {
            apiVersion: 1,
            providers: [
All together it should look something like this:
dashboardProviders: {
          'dashboardproviders.yaml': {
            apiVersion: 1,
            providers: [
                {
                    name: 'appsrepo[someName]',
                    orgId: 1,
                    folder: '',
                    type: 'file',
                    disableDeletion: false,
                    //editable: true
                    options: {
                        path: '/var/lib/grafana/dashboards/appsrepo[someName]'  // has to equal values.dashboardProviders.'dashboardprovers.yaml'.providers.<self>.name
                    }
                },
                {
                    //another dashboard provider
                }
                {
                    //another dashboard provider
                }
            ]
          }
________________________________________
TASK 2
Next we need to map the dashboard provider we just created to the file created containing the dashboard code.
This is handled directly after the dashboard providers section in the dashboardConfigMaps section
dashboardsConfigMaps: { // map these values.dashboardProviders.'dashboardprovers.yaml'.providers.<self>.name ==> the Configmap.metadata.name
          'appsrepocosts': "dashboard-configmap-costs", 
          'appsrepogeneral': "dashboard-configmap-general",
          'appsrepousage': "dashboard-configmap-usage",
        }
To map the dashboard provider to the configMap created by the user add a line to the dashboardsConfigMaps following the existing pattern.
    'appsrepo[someName]': "dashboard-configmap-[someName]",
Note: "dashboard-configmap-[someName]" should match the name of the file created by the user and placed in infra_apps
4. Release Notification Template
template is located HERE in the infra repo.
5. Setting Up Node Groups
Some users may require a dedicated node group and request a member of the CATS Platform team to provision them a GPU. This is not too difficult and is accomplished by adding the node group to the infrastructure stack here: infra_repo > aws > lib > stacks > eks-nodegroups.ts
Note: Currently we can NOT support more then 30 node groups at one time. We are working on a solution to this but have no answers yet. If someone needs a new node group then we will need to remove an old unused node group. Start reviewing the DEV node groups to see when last activity was. If activity is over 1 month old then let the team know that it will be removed. Dev is for testing and not for running continuous jobs. If the app team gives you trouble tell them they can keep their node group but need to begin moving their work to PRD when testing is complete. If they haven't used it for over a month is it really that important?
Node Group Template:
asgChain.push(addASG(this, "<env>", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.G4DN, ec2.InstanceSize.XLARGE8) }, { available: 0, rootVolSize: 100 }, { "app": "<app-name>:NoExecute", "nvidia.com/gpu": "true:NoSchedule", "instanceclass": "g4dn.8xlarge:NoExecute" }, { "app": "<app-name>" }, "<_app-name>", availabilityZone, undefined, true, getCapacity(<number>), [{Key: "CostCenter", Value: "<your-cost-center>"}])) // add note detailing Name of group dedicated instance in [env]
            }
Note: Update the fields above with information specific to the user's request. This template covers the basics. Review the next section labeled examples below if additional configuration is needed.

Label	Description
InstanceClass	Ask the user what kind of instance type and size they would like to run. The user should provide this information as members of the platform team do not have enough insight into their use case to provide accurate recommendations. What we can do is let them know if their requested class and instance size are compatible with our current version of Kubernetes. See this site here for a list of all options. See docs here for compatible types.
InstanceSize	Ask the user what kind of instance type and size they would like to run. The user should provide this information as members of the platform team do not have enough insight into their use case to provide accurate recommendations. What we can do is let them know if their requested class and instance size are compatible with our current version of Kubernetes. See this site here for a list of all options. See docs here for compatible types.
"instanceclass"	Combine instance class and size for this label based off of user's request.
<env>	Select the environment the user would like this dedicated node group to run in. "prd" / "qa" / "dev"
<app-name>	Use the app name that the user has defined in their deployment/namespace resource.
<_app-name>	Put an underscore before the app name for this field.
<getCapacity(<number>)>	This is the number of simultaneous jobs that can run on the node group. Please discuss with the user and ask them to provide you a number for this field. Replace "<number>" with the number they provide.
<your-cost-center>	User is required to label their dedicated node with their cost center. At this time, they will not be charged but we are getting all information in place to allow cost showback and eventually enable chargebacks. As of the time of me writing this, the service is still free!

Example Node Group Configurations
There are additional configurations that are possible and I have included some examples below for your review.
asgChain.push(addASG(this, "dev", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.M6I, ec2.InstanceSize.XLARGE32) }, { available: 0, rootVolSize: 100 }, { "app": "bia-ds:NoExecute", "instanceclass": "m6i.32xlarge:NoExecute" }, { "app": "bia-ds" }, "_bia-ds", availabilityZone, undefined, false, getCapacity(20), [{Key: "CostCenter", Value: "705A9R4"}])) // BIA Data Science group dedicated instances

asgChain.push(addASG(this, "prd", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.M6I, ec2.InstanceSize.XLARGE32) }, { available: 0, rootVolSize: 100 }, { "app": "bia-ds:NoExecute", "instanceclass": "m6i.32xlarge:NoExecute" }, { "app": "bia-ds" }, "_bia-ds", availabilityZone, undefined, false, getCapacity(50), [{Key: "CostCenter", Value: "705A9R4"}])) // BIA Data Science group dedicated instances

asgChain.push(addASG(this, "dev", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.G4DN, ec2.InstanceSize.XLARGE12) }, { available: 0, rootVolSize: 100 }, { "app": "chemistry42:NoExecute", "nvidia.com/gpu": "true:NoSchedule" }, { "app": "chemistry42", "component": "gpu-spot-large", "node.kubernets.io/compute.capacity": "SPOT" }, "_chemistry42", availabilityZone, "2", true, getCapacity(120))) //Chemistry42 dedicated instances

asgChain.push(addASG(this, "prd", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.C6I, ec2.InstanceSize.XLARGE8) }, { available: 0, rootVolSize: 50 }, { "app": "blaze:NoExecute" }, { "app": "blaze", "blaze/node-type": "worker-spot", "node.kubernetes.io/compute.capacity": "SPOT" }, "_blaze", availabilityZone, "2", false, 80)) //BLAZE dedicated SPOT instances

asgChain.push(addASG(this, "dev", { instanceType: ec2.InstanceType.of(ec2.InstanceClass.C6I, ec2.InstanceSize.XLARGE2) }, { available: 0, rootVolSize: 50 }, { "app": "blaze:NoExecute" }, { "app": "blaze", "blaze/node-type": "server" }, "_blaze", availabilityZone, undefined, false, 5)) //BLAZE dedicated instances
                
6. K8s Version Upgrade Process
Prior to K8s Upgrades: CNI and Kube-Proxy
1.	This link shows the Container Networking Information(CNI) plugin compatibility with various k8's versions. Make sure when upgrading the cluster that this matrix is not breached.
2.	This link shows the Kube-Proxy plugin compatibility with various k8's versions. This should be controlled at the cluster level as this is a plugin.
7. Add Domain to Amazon SES (Simple Email Service)
Amazon Simple Email Service (SES) allows applications to send emails through AWS infrastructure. This process guides administrators through registering a domain in SES to authorize email sending capabilities.
Prerequisites
•	AWS Console access with appropriate permissions
•	Domain ownership or administrative access
•	Access to manage Route53 DNS records (if using AWS DNS)
Steps to Set Up a Domain in SES
1.	Access the SES Console:
o	Log into the AWS Management Console
o	Navigate to the SES service dashboard
o	Select the appropriate AWS region for your email sending needs
2.	Register Your Domain:
o	In the left navigation panel, click on Identities
o	Click the Create identity button
o	Select Domain as the identity type
o	Enter your domain or subdomain name (e.g., apps-d.lrl.lilly.com)
3.	Configure DKIM Settings:
o	Under Advanced DKIM settings:
	Set DKIM signing key length to RSA_1024_BIT (recommended for better security)
	Enable Publish DNS records to Route53 (if your domain uses Route53)
	Enable DKIM signatures to improve email deliverability and authenticity
4.	Add Required Tags:
o	Configure any organization-specific tags required for resource tracking
o	Common tags include Environment, Application, Owner, and CostCenter
5.	Complete Registration:
o	Review your settings
o	Click Create identity to finalize the domain registration
6.	Verify Domain Status:
o	Monitor the identity status until it changes from "Pending verification" to "Verified"
o	This process typically takes 24-48 hours but may be faster when using Route53
Troubleshooting Email Sending Issues
If you encounter issues sending emails after domain verification:
1.	Check Production Access:
o	By default, new SES accounts are in sandbox mode with limited capabilities
o	Navigate to Account dashboard → Sending statistics
o	If "Production access" shows as "Sandbox", request production access:
	Click Request production access
	Complete the required form with your use case details
	Submit and wait for AWS approval
2.	Verify Email Sending Limits:
o	Check your daily sending quotas in the SES dashboard
o	Monitor your sending statistics to ensure you haven't exceeded quotas
3.	Review Email Content:
o	Ensure emails comply with anti-spam regulations
o	Verify that email headers and content are properly formatted
For additional assistance, consult the AWS SES documentation .
Check EKS Deprecations Guide
Under cluster information on the EKS screen in AWS, you will see an upgrade insights panel that shows the current and future EKS api deprecations. This might need a helm upgrade on certain services, upgrading code inside the CATS infrastructure repositories if one of these api's are being used.
 
Examples: batch/v1beta1--->batch/v1 (cronjobs) policy/v1beta1--->policy/v1 (podsecuritypolicies) policy/v1beta1--->policy/v1 (poddisruptionbudgets)
Execute K8's Version Upgrades
After verifying all of the above conditions on api deprecations and in cluster plugin upgrades, prior to performing a Kubernetes upgrade to a newer version i.e. 1.24-->1.25, you must perform the below task of scaling down autoscaler resources. Once the autoscaler is scaled down, you can go into the infrastructure stack and change the following const clusterVersion: eks.KubernetesVersion = eks.KubernetesVersion.V1_25; to a higher version. Then continue with the rest of the document and running Patching Job in Github Actions as well as returning back to the replicaset on the autoscaler, this should complete K8's version upgrades.
Node Patching Process after K8s Upgrade
When we increase the kubernetes version to a new version a patching process is required to run or else the nodes will not be moved to the correct version and will be stuck on the old version. This patching process will need to be manually run for each environment dev, qa, and production.
There are two main steps to running the patch jobs.
1.	Scale down the cluster autoscaler resource
2.	Run the patching job via GitHub Actions.
Scale Down Cluster autoscaler resource.
To scale down the cluster autoscaler resource you can either use kubectl commands or us k9s. If you have K9s up this will be the easiest route.
1.	Navigate to the namespace kube-system
2.	look up deployments on kube-system and select the deployment cluster-autoscaler
3.	If in k9s hit the s key to change the replica number to 0.
4.	Verify the cluster-autoscaler scales down to 0 and then move to next step.
Run Patching Job in GitHub Actions
To run the patching you will need to do it in one environment at at time.
1.	Navigate to the infra repo and go to the Actions tab
2.	On the left hand side select the option Run Patching (Deploy CDK Stack)
3.	On the right side of the screen select "Run Workflow" and then select the branch you want to run the patching on (dev / qa / main)
4.	Click the green "Run Workflow" button to kick off the patching process
Monitor Patching Process
Now that the patching process has kicked off you will need to navigate to CloudFormation in order to keep an eye on it. This process takes a couple of hours and after an hour the GitHub Actions credentials expire and so it will look like it has failed but do not worry it is still going on in CloudFormation.
1.	Within CloudFormation you should got to Stacks
2.	Search "light"
3.	Select the light-infra-stack
4.	Go to events tab to monitor the progress.
The update will include changes in two substacks, you will want to keep an eye on these as well:
•	ec2-node-groups-onprem-v1.NestedStack
•	ec2-node-groups-v1.NestedStack
Once the light-infra-stack says UPDATE_COMPLETE you can verify the nodes are on the correct version by following these steps:
1.	Within the AWS Console navigate to EKS
2.	Go to Clusters and select Light-infra
3.	Go to Compute and click into the Node names that look something like this fargate-ip-10-108-64-100.us-east-2.compute.internal
4.	Verify the Kubelet version is aligned with the K8s version you were targeting.
Scale Up Cluster autoscaler resource.
After patching is completed you will need to scale back up the Cluster autoscaler resource. To scale up the cluster autoscaler resource you can either use kubectl commands or us k9s. If you have K9s up this will be the easiest route.
1.	Navigate to the namespace kube-system
2.	look up deployments on kube-system and select the deployment cluster-autoscaler
3.	If in k9s hit the s key to change the replica number to 1.
4.	Verify the cluster-autoscaler scales up to 1.
Add New URL Patterns
If the team as agreed that introducing a new pattern is a good idea please follow these steps to get it created in the cluster
1.	Register a new Route53. This will give you 4 nameservers. Select public not private.
# Example Nameservers

ns-515.awsdns-00.net.
ns-232.awsdns-29.com.
ns-1342.awsdns-39.org.
ns-2044.awsdns-63.co.uk.
2.	Submit a Request to delegate the domain to the CATS Platform. This allows us to do DNS certification validation and also allows subdomains on the designated domain.
Submit Ticket to Kubecost Team
To submit at ticket to the kubecost team if there is something wrong with the system service follow this link here: https://kubecost.atlassian.net/servicedesk/customer/portal/
📄 Cost Center Validation and Appending to List
Purpose
This document guides admins on how to validate a cost center using ServiceNow and append it to the list of valid cost centers to pass CI (Configuration Item) validation. The goal is to ensure that users can validate and add cost center IDs effectively as part of the CI submission or update process
🔍 Step 1: Validate the Cost Center in ServiceNow
1.	Go to the ServiceNow Cost Center list using the link below:
👉 ServiceNow Cost Center Lookup
2.	Use the search bar to look up the cost center you want to validate.
3.	Confirm that:
o	The cost center exists in the list.
o	It is active and associated with the correct department/business unit.  
➕ Step 2: Append the Valid Cost Center to the Validation List
Once you've confirmed the cost center is valid:
1.	Open the file located at:
DEV	QA	PROD
DEV
QA
PROD

2.	Add the new cost center ID at the end of the list:
123456
654321
NEW_COST_CENTER_ID_HERE
3.	Save the file and Commit and push the changes to the repo.
4.	After, Trigger a new CI pipeline or wait for the scheduled run and ensure the CI step that performs cost center validation passes successfully.
Edit this page



Grafana Admin Tasks
Execute Org Creation Request
When users submit a request for our team to create them an organization in grafana you can follow the following steps to set up the org for them.
TODO: Brian, write out the steps here

