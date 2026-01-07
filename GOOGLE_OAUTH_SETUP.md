# Google OAuth Setup Guide

## Issue: "The given client ID is not found"

This error occurs when the Google OAuth Client ID is not properly configured in Google Cloud Console.

## Steps to Fix:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project (or create a new one)

### 2. Enable Google Identity Services API
- Go to **APIs & Services** > **Library**
- Search for "Google Identity Services API"
- Click **Enable**

### 3. Create OAuth 2.0 Client ID
- Go to **APIs & Services** > **Credentials**
- Click **+ CREATE CREDENTIALS** > **OAuth client ID**
- If prompted, configure the OAuth consent screen first:
  - User Type: **External** (for testing) or **Internal** (for Google Workspace)
  - App name: Your app name
  - User support email: Your email
  - Developer contact: Your email
  - Click **Save and Continue**
  - Add scopes: `openid`, `profile`, `email`
  - Click **Save and Continue**
  - Add test users if needed
  - Click **Save and Continue**

### 4. Create OAuth Client ID
- Application type: **Web application**
- Name: "RoznaComaker Web Client"
- Authorized JavaScript origins:
  - `http://localhost:4200` (for development)
  - `https://yourdomain.com` (for production)
- Authorized redirect URIs:
  - `http://localhost:4200` (for development)
  - `https://yourdomain.com` (for production)
- Click **Create**

### 5. Copy the Client ID
- Copy the **Client ID** (not the Client Secret)
- It should look like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

### 6. Update the Code
- Open `RoznaComarker/src/app/services/google-auth.service.ts`
- Replace the `CLIENT_ID` value on line 13:
  ```typescript
  private readonly CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
  ```

### 7. Update Backend .env
- Open `ronzaComaker_backend/.env`
- Update `GOOGLE_CLIENT_ID`:
  ```env
  GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
  ```

## Important Notes:

1. **Client ID vs App ID**: 
   - The Firebase App ID (`1:705201289510:web:e41bae6f26f915e66da9e7`) is NOT the same as OAuth Client ID
   - You need to create a separate OAuth 2.0 Client ID

2. **Authorized Domains**:
   - Make sure `localhost` is added for development
   - Add your production domain when deploying

3. **Testing**:
   - After updating the Client ID, restart your Angular dev server
   - Clear browser cache if needed

## Current Client ID in Code:
The current Client ID (`705201289510-e41bae6f26f915e66da9e7.apps.googleusercontent.com`) appears to be incorrect or not properly configured.

Please follow the steps above to create a new OAuth Client ID and update it in the code.
