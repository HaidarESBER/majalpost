# Vercel Environment Variables Setup

## Required Environment Variable

You **must** set this in Vercel:

### NEXT_PUBLIC_API_URL

1. Go to **Vercel Dashboard** → Your Project
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the sidebar
4. Add/Edit:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://majalpost-production.up.railway.app/api`
   - **Environment:** Production, Preview, Development (select all)
5. Click **"Save"**
6. **Redeploy** your project (Vercel should auto-redeploy, or trigger manually)

## Important Notes:

- ✅ Must include `/api` at the end
- ✅ Use `https://` (not `http://`)
- ✅ No trailing slash after `/api`
- ✅ Must be set for all environments (Production, Preview, Development)

## After Setting:

1. Wait for redeploy to complete
2. Clear browser cache or use incognito mode
3. Try registering again

The URL should look like:
```
https://your-railway-url.up.railway.app/api
```

