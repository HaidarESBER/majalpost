# Railway "Application failed to respond" - Troubleshooting

## Quick Fixes to Try:

### 1. Check Railway Logs
- Go to Railway dashboard → Your service → **"Logs"** tab
- Look for error messages
- Common errors:
  - MongoDB connection failed
  - Missing environment variables
  - Port binding errors

### 2. Verify Environment Variables
Make sure these are set in Railway (Settings → Variables):
- `MONGODB_URI` (required)
- `JWT_SECRET` (required)
- `PORT` (Railway sets this automatically, but can manually set to ensure)
- `NODE_ENV=production`
- `FRONTEND_URL` (your Vercel URL)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 3. Check Port Binding
Railway requires the app to listen on `0.0.0.0`, not `localhost`.

### 4. Common Issues:

**MongoDB Connection:**
- Check if `MONGODB_URI` is correct
- Verify MongoDB Atlas network access allows Railway IPs
- Connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/majalpost?retryWrites=true&w=majority`

**Missing Variables:**
- If any required env var is missing, the app will crash
- Check logs for "Missing required environment variable" errors

**Build Issues:**
- Make sure build succeeded
- Check if `npm run build` completes successfully
- Verify `npm start` command works

### 5. Test Locally First
```bash
cd backend
npm run build
npm start
```
If it works locally but not on Railway, it's an environment/config issue.

