# How to Get Your Google OAuth Client ID

## Option 1: Get from Firebase Console (Easiest)

Since you already have a Firebase project, the OAuth Client ID is automatically created:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **rozna-comaker**

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select **Project settings**

3. **Find OAuth Client IDs**
   - Scroll down to **Your apps** section
   - Find your **Web app** (the one with appId: `1:705201289510:web:e41bae6f26f915e66da9e7`)
   - Look for **OAuth 2.0 Client IDs** section
   - You'll see a Client ID like: `xxxxx-xxxxx.apps.googleusercontent.com`
   - **Copy this Client ID**

4. **Update Your Code**
   - Open `RoznaComarker/src/app/services/google-auth.service.ts`
   - Replace line 13 with your actual Client ID:
     ```typescript
     private readonly CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com';
     ```
   
   - Open `ronzaComaker_backend/.env`
   - Update line 4:
     ```env
     GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
     ```

## Option 2: Create New OAuth Client ID in Google Cloud Console

If you can't find it in Firebase Console:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select project: **rozna-comaker**

2. **Enable Google Identity Services API**
   - Go to **APIs & Services** > **Library**
   - Search for "Google Identity Services API"
   - Click **Enable** (if not already enabled)

3. **Configure OAuth Consent Screen** (if not done)
   - Go to **APIs & Services** > **OAuth consent screen**
   - User Type: **External** (for testing) or **Internal**
   - App name: **RoznaComaker**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `openid`, `profile`, `email`
   - Click **Save and Continue**
   - Add test users (your email) if using External
   - Click **Save and Continue**

4. **Create OAuth Client ID**
   - Go to **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Application type: **Web application**
   - Name: **RoznaComaker Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:4200` (for development)
     - Add your production domain later
   - Authorized redirect URIs:
     - `http://localhost:4200` (for development)
     - Add your production domain later
   - Click **Create**

5. **Copy the Client ID**
   - A popup will show your Client ID
   - Format: `xxxxx-xxxxx.apps.googleusercontent.com`
   - **Copy this Client ID**

6. **Update Your Code** (same as Option 1)

## Important Notes:

- ⚠️ **The current Client ID in your code is INVALID**
  - Current: `705201289510-e41bae6f26f915e66da9e7.apps.googleusercontent.com`
  - This was constructed from Firebase App ID, but it's not a valid OAuth Client ID

- ✅ **The correct Client ID format**:
  - Should be: `xxxxx-xxxxx.apps.googleusercontent.com`
  - You can only get it from Firebase Console or Google Cloud Console

- 🔄 **After updating**, restart your Angular dev server:
  ```bash
  # Stop the server (Ctrl+C)
  # Then restart
  ng serve
  ```

## Quick Check:

After updating, the error should disappear. If you still see "Client ID not found", double-check:
1. The Client ID is copied correctly (no extra spaces)
2. The OAuth consent screen is configured
3. `localhost:4200` is in authorized origins
4. You've restarted the dev server
