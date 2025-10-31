# Google OAuth Setup Guide for Drawtopia

This guide will help you configure Google OAuth authentication in your Supabase project.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to your Supabase dashboard
- Admin access to your Drawtopia project

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Create a new project or select an existing one
   - Note down your project ID

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity" if available

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: `Drawtopia`
     - User support email: Your email
     - Developer contact information: Your email
   - Add your domain to "Authorized domains" if you have one
   - Save and continue through the scopes and test users sections

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Name it: `Drawtopia Web Client`
   - Add Authorized redirect URIs:
     - For development: `https://your-project-ref.supabase.co/auth/v1/callback`
     - For production: `https://your-production-domain.com/auth/v1/callback`
   - Click "Create"
   - **Save the Client ID and Client Secret** - you'll need these for Supabase

## Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to your Drawtopia project

2. **Configure Google OAuth Provider**
   - Go to "Authentication" > "Providers"
   - Find "Google" in the list and click to configure
   - Toggle "Enable sign in with Google"
   - Enter your Google OAuth credentials:
     - **Client ID**: The Client ID from Google Cloud Console
     - **Client Secret**: The Client Secret from Google Cloud Console
   - Set the redirect URL (this should match what you entered in Google Console):
     - `https://your-project-ref.supabase.co/auth/v1/callback`
   - Click "Save"

## Step 3: Update Environment Variables (if needed)

Your current setup should work with the existing environment variables, but ensure you have:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the signup or login page**
   - Go to `http://localhost:5173/signup` or `http://localhost:5173/login`

3. **Click "Sign up with Google" or "Login with Google"**
   - You should be redirected to Google's OAuth consent screen
   - After granting permission, you should be redirected back to your app
   - Check the browser's developer console for any errors

## Step 5: Handle OAuth Callback

The current implementation redirects users to `/dashboard` after successful authentication. Make sure you have a dashboard route, or update the redirect URL in the `signInWithGoogle` function in `/src/lib/auth.ts`.

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google Console exactly matches your Supabase callback URL
   - Check for trailing slashes or http vs https mismatches

2. **"invalid_client" error**
   - Double-check your Client ID and Client Secret in Supabase
   - Make sure the Google OAuth credentials are for a "Web application" type

3. **OAuth consent screen not configured**
   - Complete the OAuth consent screen setup in Google Cloud Console
   - Make sure to publish the app if you want external users to access it

4. **Users not being created in database**
   - Check if you have Row Level Security (RLS) policies that might be blocking user creation
   - Verify your database triggers and functions are working correctly

## Security Considerations

1. **Environment Variables**: Never commit your Google Client Secret to version control
2. **HTTPS**: Always use HTTPS in production for OAuth flows
3. **Redirect URIs**: Only add trusted domains to your authorized redirect URIs
4. **Scopes**: Only request the minimum scopes needed for your application

## Next Steps

After successful setup, you might want to:

1. **Customize user profiles**: Extract additional information from Google (name, profile picture)
2. **Handle existing users**: Decide how to handle users who sign up with email/phone and later use Google OAuth
3. **Add error handling**: Improve error messages and user experience for failed OAuth attempts
4. **Testing**: Test the OAuth flow in different browsers and scenarios

## Support

If you encounter issues:
1. Check the browser developer console for JavaScript errors
2. Check Supabase logs in the dashboard
3. Verify all URLs and credentials are correct
4. Test with a simple OAuth flow first before adding complex logic
