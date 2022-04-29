# DogeOps : Prepare Infra

The goal here is to create the necessary resources in AWS to store the image we are going to build.

The infrastructure is handled by Terraform, who loves its `.tfstate` files. To manage those files, we use a S3 backend.

This action uses the metadata from the target repo (the one calling this action), and minimal basic configuration from the project (`.dogeops` file) to dynamically configure Terraform to the right backend for the project. 
