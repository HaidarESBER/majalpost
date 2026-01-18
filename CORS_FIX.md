# Fix 405 Error - CORS Configuration

## The Problem
405 "Method Not Allowed" error when registering from Vercel frontend.

## The Solution

### Step 1: Check Your Vercel URL
1. Go to Vercel dashboard
2. Find your deployed project
3. Copy the URL (e.g., `https://majalpost.vercel.app`)

### Step 2: Update Railway FRONTEND_URL
1. Go to Railway dashboard
2. Click your backend service
3. Go to **"Variables"** tab
4. Find `FRONTEND_URL`
5. Update it to match your Vercel URL exactly:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
   Replace `your-vercel-url.vercel.app` with your actual Vercel URL

6. Railway will auto-redeploy

### Step 3: Verify API_URL in Vercel
1. Go to Vercel dashboard → Your project
2. Go to **"Settings"** → **"Environment Variables"**
3. Make sure you have:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api
   ```
   Replace with your actual Railway URL

### Step 4: Test Again
After Railway redeploys, try registering again from your Vercel site.

---

## Why This Happens

The CORS middleware checks if the request origin (Vercel URL) matches the `FRONTEND_URL` in Railway. If they don't match exactly, CORS blocks the request, which can appear as a 405 error.

Make sure:
- No trailing slashes
- Use `https://` (not `http://`)
- Exact match (case-sensitive domain)

