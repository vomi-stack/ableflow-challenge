# AbleFlow Deployment Guide

## Netlify Deployment Setup

### Step 1: Environment Variables

Your Netlify site needs the Supabase environment variables configured. Add these in your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://mhedoqeyrnffsufkxrhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZWRvcWV5cm5mZnN1Zmt4cmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjcxNjQsImV4cCI6MjA4Njg0MzE2NH0.lndSHKakEO_D7v8dGrdLdUZl9fuzJcB-XRpa3h8bbbQ
```

### Step 2: Build Settings

Verify your build settings in Netlify:

- **Build command**: `npx next build` (already configured in netlify.toml)
- **Publish directory**: `.next` (already configured in netlify.toml)
- **Node version**: 18.x or higher

### Step 3: Deploy

After setting the environment variables:

1. Trigger a new deploy from the Netlify dashboard
2. Or push a new commit to trigger automatic deployment

### Troubleshooting

#### 404 Error After Deployment

If you're seeing a 404 error, it could be:

1. **Environment variables not set**: The app needs the Supabase credentials to function
2. **Build failed**: Check the deploy logs in Netlify dashboard
3. **First deployment**: The site may still be building

#### How to Check Deploy Status

1. Go to your Netlify dashboard
2. Select your site
3. Click on **Deploys** tab
4. Check if the latest deploy succeeded or failed
5. Click on the deploy to see detailed logs

#### Common Issues

**Issue**: Build fails with "Module not found"
- **Solution**: Ensure all dependencies are in package.json and run `npm install` locally to verify

**Issue**: "Site not found" error
- **Solution**: The site URL may have changed. Check your Netlify dashboard for the correct URL

**Issue**: White screen after deployment
- **Solution**: Check browser console for errors. Usually means environment variables are missing

### Local Testing

Before deploying, test the production build locally:

```bash
# Build the project
npm run build

# Start production server
npm start
```

Visit http://localhost:3000 to verify everything works.

### Deployment Checklist

- [ ] Environment variables configured in Netlify
- [ ] Build completes successfully locally (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Database migrations applied (automatic via Supabase)
- [ ] No console errors in production build

## Alternative: Deploy to Vercel

If you prefer Vercel (recommended for Next.js):

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Add environment variables when prompted or via dashboard

Vercel will automatically detect and configure your Next.js app.

## Post-Deployment Verification

After deployment, verify these features work:

1. **Project Board**: Create and drag tasks between columns
2. **System Monitoring**: Check service status displays correctly
3. **Incidents**: Simulate service degradation and verify incident creation
4. **Audit Logs**: Verify actions are being logged
5. **Analytics**: Check charts render properly

## Support

If you continue to have deployment issues:

1. Check Netlify deploy logs for specific errors
2. Verify environment variables are correctly set
3. Test the build locally to isolate the issue
4. Check Supabase connection is working
