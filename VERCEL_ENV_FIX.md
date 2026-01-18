# CRITICAL: Environment Variable Not Loading

## The Problem
Your request URL shows: `/NEXT_PUBLIC_API_URL=majalpost-production.up.railway.app/api/auth/register`

This means the environment variable `NEXT_PUBLIC_API_URL` is **NOT being read**. Next.js is treating it as a literal string.

## The Fix

### Step 1: Check Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Look for `NEXT_PUBLIC_API_URL`
5. **Is it there?** If not, add it:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://majalpost-production.up.railway.app/api`
   - Environment: Select **ALL** (Production, Preview, Development)
   - Click **"Save"**

### Step 2: CRITICAL - Redeploy

**Environment variables in Next.js are baked into the build at BUILD TIME.**

After adding/changing the variable:
1. Go to **"Deployments"** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 3: Verify

After redeploy:
1. Visit your Vercel site
2. Open Browser Console (F12)
3. Type: `process.env.NEXT_PUBLIC_API_URL`
4. It should show: `"https://majalpost-production.up.railway.app/api"`

If it shows `undefined`, the variable isn't set correctly.

---

## Common Mistakes:

❌ Setting the variable but not redeploying
❌ Setting it only for "Production" but viewing Preview
❌ Typo in variable name (must be exactly `NEXT_PUBLIC_API_URL`)
❌ Missing `https://` in the value

✅ Set for ALL environments
✅ Include `https://` and `/api` at the end
✅ Redeploy after setting
✅ Wait for deployment to complete

