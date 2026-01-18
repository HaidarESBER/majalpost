# Fix Railway Build Error

Railway failed because it doesn't know your backend is in the `backend` folder.

## Quick Fix (In Railway Dashboard)

1. Go to your Railway project dashboard
2. Click on your service (majalpost)
3. Go to **"Settings"** tab
4. Scroll to **"Source"** section
5. Set these:
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
6. Click **"Save"**
7. Railway will automatically redeploy

That's it! ✅

---

## Alternative: Create nixpacks.toml

If the above doesn't work, create `nixpacks.toml` in the root:

```toml
[phases.setup]
nixPkgs = ["nodejs-18", "npm"]

[phases.build]
cmds = ["cd backend && npm install", "cd backend && npm run build"]

[start]
cmd = "cd backend && npm start"
```

But the dashboard settings (Root Directory) should work fine!

