# Clerk Authentication Setup Guide for FamSchedule

This guide will walk you through setting up Clerk authentication for your FamSchedule app.

## Prerequisites

- A Clerk account (free tier available)
- Node.js and npm installed

## Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Start building for free" or "Sign up"
3. Create your account using email, Google, or GitHub

## Step 2: Create a New Application

1. Once logged in, click "Create application" in the Clerk Dashboard
2. Name your application: **FamSchedule**
3. Choose your preferred sign-in methods:
   - Email address (recommended)
   - Google (optional)
   - GitHub (optional)
   - Other social providers as needed
4. Click "Create application"

## Step 3: Get Your API Keys

1. After creating your application, you'll be taken to the dashboard
2. Navigate to **API Keys** in the left sidebar
3. You'll see your **Publishable Key** - it starts with `pk_test_` for development
4. Copy this key

## Step 4: Configure Environment Variables

1. Open the `.env.local` file in your project root (it was created automatically)
2. Replace `your_publishable_key_here` with your actual Clerk Publishable Key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

3. Save the file

## Step 5: Configure Clerk Application Settings

### Set up Application URLs

1. In your Clerk Dashboard, go to **Paths** under **User & Authentication**
2. Configure the following paths (these should match by default):
   - Sign-in path: `/sign-in`
   - Sign-up path: `/sign-up`
   - Home URL: `/`

### Configure Redirect URLs (for production)

When you deploy your app, update these in **Allowed redirect URLs**:
1. Go to **Home** > **Settings** > **URLs**
2. Add your production domain (e.g., `https://yourapp.com`)

## Step 6: Start Your Development Server

1. Make sure your `.env.local` file is saved
2. Run the development server:

```bash
npm run dev
```

3. Open your browser to the URL shown (usually `http://localhost:5173`)

## Step 7: Test Authentication

1. You should be redirected to the sign-in page automatically
2. Click "Sign up" to create a new account
3. Fill in your details and create an account
4. After signing up, you'll be automatically logged in and redirected to the main app
5. Your name should appear in the welcome banner

## Features Included

Your FamSchedule app now has:

- **Sign In/Sign Up Pages**: Beautiful, responsive authentication pages
- **Protected Routes**: Main schedule content is only accessible to authenticated users
- **User Profile**: View your profile information in Settings
- **Sign Out**: Sign out button in the Settings modal
- **Personalized Welcome**: Welcome banner shows your actual name

## Customization Options

### Customize Sign-In/Sign-Up Appearance

You can customize the Clerk components in:
- [src/components/SignInPage.tsx](src/components/SignInPage.tsx)
- [src/components/SignUpPage.tsx](src/components/SignUpPage.tsx)

Refer to [Clerk's appearance customization docs](https://clerk.com/docs/components/customization/overview) for more options.

### Add More Sign-In Methods

1. Go to your Clerk Dashboard
2. Navigate to **User & Authentication** > **Social Connections**
3. Enable additional providers (Google, GitHub, Apple, etc.)
4. Save changes - they'll be automatically reflected in your app

### User Profile Management

Clerk provides a pre-built UserProfile component. To add it:

```tsx
import { UserProfile } from '@clerk/clerk-react';

// Use it in your Settings or create a dedicated profile page
<UserProfile />
```

## Production Deployment

Before deploying to production:

1. Create a production instance in Clerk Dashboard
2. Get your production Publishable Key
3. Set `VITE_CLERK_PUBLISHABLE_KEY` in your production environment
4. Update allowed redirect URLs in Clerk Dashboard with your production domain

## Troubleshooting

### "Missing Clerk Publishable Key" Error

- Make sure your `.env.local` file exists and has the correct key
- Restart your development server after adding the key

### Infinite Redirect Loop

- Check that your Clerk paths are set to `/sign-in` and `/sign-up`
- Ensure your Publishable Key is correct

### Sign-in Page Not Showing

- Clear your browser cache
- Check browser console for errors
- Verify your Clerk application is active in the dashboard

## Support

- Clerk Documentation: [https://clerk.com/docs](https://clerk.com/docs)
- Clerk Discord Community: [https://clerk.com/discord](https://clerk.com/discord)
- FamSchedule Issues: Create an issue in your repository

## Free Tier Limits

Clerk's free tier includes:
- Up to 5,000 monthly active users
- Unlimited applications
- All authentication methods
- User management
- Email support

This is more than enough for personal projects and small family apps!
