# 🚀 Postman Setup for Elioti Backend

This guide will help you import and set up Postman to test the Elioti Backend API.

## 📁 Files Created

1. **`postman-environment.json`** - Environment variables for the API
2. **`postman-collection.json`** - Complete API collection with all endpoints
3. **`README-POSTMAN.md`** - This instruction file

## 🔧 Import Instructions

### Step 1: Import Environment

1. Open **Postman**
2. Click **"Environments"** in the left sidebar
3. Click **"Import"** button (top right)
4. Choose **"File"** tab
5. Click **"Upload Files"**
6. Select `postman-environment.json` from your backend folder
7. Click **"Import"**

### Step 2: Import Collection

1. Click **"Collections"** in the left sidebar
2. Click **"Import"** button (top right)
3. Choose **"File"** tab
4. Click **"Upload Files"**
5. Select `postman-collection.json` from your backend folder
6. Click **"Import"**

### Step 3: Select Environment

1. In the top-right corner of Postman, you'll see a dropdown
2. Select **"Elioti Backend - Local"** from the dropdown
3. This will activate all the environment variables

## 🏃‍♂️ Quick Start Guide

### 1. Start Your Backend Server

```bash
cd backend
npm install
npm run dev
```

Your server should start on `http://localhost:3000`

### 2. Test the API

#### **First: Register a User**
1. Open the collection **"Elioti API - Complete"**
2. Go to folder **"1. Authentication"**
3. Click **"POST Register User"**
4. Click **"Send"**

#### **Second: Login**
1. Go to **"POST Login User"**
2. Click **"Send"**
3. The token will be automatically saved to environment variables

#### **Third: Test Other Endpoints**
Now you can test any other endpoint - the authentication token will be automatically included.

## 📋 Available Endpoints

### 🔐 Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### 👤 User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/balance` - Get user balance
- `GET /user/stats` - Get user statistics

### 💰 Transactions
- `GET /transaction/dashboard` - Get dashboard data
- `GET /transaction/list` - Get all transactions
- `POST /transaction/create` - Create new transaction
- `PUT /transaction/update/{id}` - Update transaction
- `DELETE /transaction/delete/{id}` - Delete transaction
- `GET /transaction/alerts` - Get transaction alerts

### 📊 Dashboard
- `GET /home` - Get home dashboard
- `GET /dashboard` - Get dashboard statistics

### 🎯 Goals (Qellimet)
- `GET /goal` - Get all goals
- `POST /goal` - Create new goal
- `PUT /goal/{id}` - Update goal
- `DELETE /goal/{id}` - Delete goal

### 👤 Profile Management
- `GET /profile` - Get profile
- `PUT /profile` - Update profile

### ⚙️ Settings
- `GET /settings` - Get settings
- `PUT /settings` - Update settings

### 🤖 AI Chat
- `POST /ai-chat` - Send message to AI
- `GET /ai-chat/history` - Get chat history
- `POST /ai-chat/clear` - Clear chat history

### ❓ Help & Support
- `GET /help` - Get help articles
- `POST /help/contact` - Contact support

## 🔧 Environment Variables

The environment includes these variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3000` |
| `auth_token` | JWT authentication token | (auto-filled after login) |
| `user_id` | Current user ID | (auto-filled after login) |
| `email` | Test email | `test@example.com` |
| `password` | Test password | `Test123!` |
| `full_name` | Test user name | `Test User` |
| `day`, `month`, `year` | Date of birth | `15`, `01`, `1990` |

## 🎯 Testing Workflow

1. **Start with Registration** - Create a new user account
2. **Login** - Get authentication token
3. **Test User Profile** - Verify user data
4. **Create Transactions** - Add some test data
5. **Test Dashboard** - View financial overview
6. **Test Goals** - Create and manage financial goals
7. **Test AI Chat** - Interact with the AI assistant

## 🔍 Troubleshooting

### Common Issues:

1. **Server not running**
   - Make sure you've started the backend with `npm run dev`
   - Check that it's running on port 3000

2. **Import errors**
   - Make sure you're importing the correct files
   - Check that the JSON files are valid

3. **Authentication errors**
   - Make sure you've registered and logged in first
   - Check that the token is being saved correctly

4. **CORS errors**
   - The backend should handle CORS automatically
   - If you get CORS errors, check your backend configuration

### Environment Variables Not Working?

1. Make sure you've selected the correct environment from the dropdown
2. Check that the environment variables are properly set
3. Try refreshing the environment

## 📝 Notes

- All requests that require authentication will automatically include the Bearer token
- The login request automatically saves the token to environment variables
- You can modify the environment variables to test with different data
- The collection includes test scripts that provide feedback in the console

## 🎉 You're Ready!

Once you've imported both files and selected the environment, you're ready to test your Elioti Backend API! Start with the authentication endpoints and work your way through the collection.
