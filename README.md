# Email AI Processor

An AI-powered email processing system built with Firebase and React.

## Setup Instructions

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)

2. Enable the following services:
   - Authentication (Google Sign-in)
   - Firestore Database
   - Storage
   - Cloud Functions

3. Create a service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `service-account.json` in the project root

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the values with your Firebase configuration.

5. Install dependencies:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

6. Run the setup script:
   ```bash
   npm run setup
   ```

7. Deploy to Firebase:
   ```bash
   npm run deploy
   ```

## Features

- Email processing with AI analysis
- Attachment handling (PDF and images)
- Role-based access control
- Dynamic processing rules
- Todo list generation
- Partner dashboard
- Developer tools

## Roles

- **User**: Access to own emails and todos
- **Partner**: Access to all emails and dashboard
- **Admin**: Partner access plus rule management
- **Superuser**: Full access including developer tools

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run deploy
```