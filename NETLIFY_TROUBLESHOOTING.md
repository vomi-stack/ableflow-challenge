# Netlify 404 Error - Troubleshooting Guide

## Current Issue
You're seeing "Site not found" at `https://ableflow-ai-task-rel-j1gm.bolt.host/`

This error means the site hasn't been successfully deployed to Netlify yet.

## Step-by-Step Fix

### Step 1: Check Your Netlify Dashboard

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Log in to your account
3. Find your site (look for "ableflow-ai-task-rel-j1gm" or similar)
4. Click on it to view the dashboard

### Step 2: Check Deploy Status

Look at the **Deploys** tab:

- **Green checkmark** = Deploy succeeded
- **Red X** = Deploy failed
- **Yellow/Orange** = Deploy in progress

### Step 3: If Deploy Failed

Click on the failed deploy to see the logs. Common issues:

#### Issue A: Missing Environment Variables

**Error in logs**: Something about "undefined" or Supabase connection

**Fix**:
1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Add both of these:

```
Variable name: NEXT_PUBLIC_SUPABASE_URL
Value: https://mhedoqeyrnffsufkxrhd.supabase.co

Variable name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZWRvcWV5cm5mZnN1Zmt4cmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjcxNjQsImV4cCI6MjA4Njg0MzE2NH0.lndSHKakEO_D7v8dGrdLdUZl9fuzJcB-XRpa3h8bbbQ
```

4. Save
5. Go to **Deploys** → **Trigger deploy** → **Deploy site**

#### Issue B: Build Command Error

**Error in logs**: Build fails with npm errors

**Fix**:
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Ensure:
   - Build command: `npx next build`
   - Publish directory: `.next`
3. Scroll down to **Environment** section
4. Set Node version to `18` or `20`
5. Trigger a new deploy

#### Issue C: Missing Dependencies

**Error in logs**: Module not found or ERESOLVE errors

**Fix**:
1. Go to **Site settings** → **Build & deploy** → **Environment variables**
2. Add this variable:
   ```
   Variable name: NPM_FLAGS
   Value: --legacy-peer-deps
   ```
3. Trigger a new deploy

### Step 4: If No Deploys Exist

If you see no deploys in the dashboard:

1. The site might not be connected to your Git repository
2. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
3. Click **Link repository**
4. Connect to your GitHub/GitLab account
5. Select your repository
6. Configure build settings as above

### Step 5: Manual Deploy (Alternative)

If automatic deploys aren't working, try manual deploy:

1. Download your project files
2. Go to your Netlify dashboard
3. Click **Add new site** → **Deploy manually**
4. Drag and drop your `.next` folder
5. Wait for deploy to complete

## Quick Diagnostic Checklist

- [ ] Netlify site exists in dashboard
- [ ] At least one deploy has been attempted
- [ ] Environment variables are set (both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Build command is `npx next build`
- [ ] Publish directory is `.next`
- [ ] Node version is 18 or higher
- [ ] Latest deploy shows green checkmark

## Still Not Working?

### Check the Deploy Log

1. Go to **Deploys** tab
2. Click on the latest deploy (even if failed)
3. Scroll through the log
4. Look for the **first error message** (not warnings)
5. Copy that error message

Common error patterns and fixes:

**"Cannot find module"**
→ Missing dependency, add NPM_FLAGS environment variable

**"undefined reading properties"**
→ Missing environment variables

**"Command failed with exit code 1"**
→ Check the lines above for the actual error

**"Build exceeded maximum time"**
→ Your build is too slow, contact Netlify support

## Alternative: Deploy to Vercel

If Netlify continues to have issues, Vercel is optimized for Next.js:

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/Login
3. Click **Import Project**
4. Connect your Git repository
5. Vercel auto-detects Next.js settings
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Click **Deploy**

Vercel typically "just works" with Next.js projects.

## Need More Help?

If you're still stuck, share:
1. Screenshot of your Netlify deploy logs
2. Screenshot of your environment variables page
3. Any error messages you see

The build works locally (we tested it), so this is purely a deployment configuration issue.
