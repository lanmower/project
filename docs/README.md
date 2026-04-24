# Email AI Processor Documentation

## Overview

The Email AI Processor is an AI-powered email processing system built with Firebase and React. It includes features for email analysis using AI, attachment handling, role-based access control, and more.

## Features

- **AI Analysis**: Process emails with advanced AI-driven criteria evaluation.
- **Attachment Handling**: Support for handling various file types like PDFs and images.
- **Role-Based Access Control**: Secure access based on user roles (User, Partner, Admin, Superuser).
- **Dynamic Processing Rules**: Create and manage custom rules for email processing.
- **Todo List Generation**: Automatically generate tasks based on received emails.
- **Partner Dashboard**: Visualize and manage email data effectively.
- **Developer Tools**: Access tools for troubleshooting and managing resources.

## Setup Instructions

Follow these steps to set up and run the application locally.

### 1. Create a Firebase Project

- Go to the [Firebase Console](https://console.firebase.google.com) and create a new project.

### 2. Enable Services

Enable the following Firebase services for your project:
- Authentication
- Firestore Database
- Storage
- Cloud Functions

### 3. Create a Service Account

- Navigate to Project Settings > Service Accounts
- Click "Generate New Private Key" to download your service account JSON file.
- Save the file as `service-account.json` in the project root.

### 4. Configure Environment Variables

Use the provided `.env.example` as a template for your environment settings. Copy it and fill in your Firebase configuration:

```bash
cp .env.example .env
