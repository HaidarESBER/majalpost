# Debug 405 Error - Step by Step

## Step 1: Test Railway Backend Directly

Open your browser and go to:
```
https://majalpost-production.up.railway.app/api
```

You should see JSON with API info. If this doesn't work, Railway backend isn't running properly.

## Step 2: Test Register Endpoint Directly

Test the register endpoint with curl or browser:

In browser, you can't POST directly, but check Railway logs:
1. Go to Railway dashboard
2. Click your service
3. Go to "Logs" tab
4. Try registering from Vercel
5. See if any requests appear in logs

## Step 3: Check Browser Console

1. Open your Vercel site
2. Press F12 (Developer Tools)
3. Go to "Console" tab
4. Try registering
5. Check for:
   - The actual URL being called
   - CORS errors
   - Network errors

## Step 4: Check Network Tab

1. In Developer Tools, go to "Network" tab
2. Try registering
3. Find the `/api/auth/register` request
4. Click on it
5. Check:
   - Request URL (should be Railway URL + /api/auth/register)
   - Request Method (should be POST)
   - Response status (405?)
   - Response headers (check for CORS headers)

## Step 5: Verify Environment Variables

In Vercel:
1. Settings → Environment Variables
2. Make sure `NEXT_PUBLIC_API_URL` is set
3. **Redeploy** (Environment variables don't update running deployments!)

In Railway:
1. Variables tab
2. Make sure `FRONTEND_URL` matches your Vercel URL exactly
3. Railway auto-redeploys

## Step 6: Force Redeploy

After changing environment variables:
- **Vercel**: Must manually redeploy OR push a new commit
- **Railway**: Auto-redeploys when variables change

## Common Issues:

1. **Environment variables not loaded** - Need to redeploy Vercel
2. **CORS blocking** - Check Railway logs for CORS errors
3. **Backend not running** - Check Railway logs for startup errors
4. **Wrong URL** - Check browser Network tab for actual URL being called

