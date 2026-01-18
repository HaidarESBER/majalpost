# FIX CORS ERROR NOW

## The Problem
Error: "Not allowed by CORS"

This means your `FRONTEND_URL` in Railway doesn't match your Vercel URL.

## The Fix

### Step 1: Get Your Exact Vercel URL
Your Vercel URL is: `https://majalpost-1nef.vercel.app`

### Step 2: Set FRONTEND_URL in Railway
1. Go to **Railway Dashboard** → Your Service
2. Click **"Variables"** tab
3. Find `FRONTEND_URL`
4. Set it to EXACTLY:
   ```
   https://majalpost-1nef.vercel.app
   ```
   - Must start with `https://`
   - No trailing slash
   - Exact match (case-sensitive)

5. Save (Railway auto-redeploys)

### Step 3: Wait for Redeploy
Railway will automatically redeploy. Wait 1-2 minutes.

### Step 4: Test Again
Try registering again from your Vercel site.

---

## Important:
- The URL must match EXACTLY
- No trailing slash
- Use `https://` not `http://`
- Case-sensitive

After this fix + the rate limiter fix I just pushed, registration should work!

