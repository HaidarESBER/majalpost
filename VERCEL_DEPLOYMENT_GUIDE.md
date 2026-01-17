# Complete Vercel Deployment Guide for Majal Post

This guide will help you deploy your full-stack application to Vercel (free tier) with all required services.

## Overview

**Architecture:**
- **Frontend (Next.js)**: Deploy to Vercel (Free)
- **Backend (Express)**: Deploy to Railway or Render (Free tier)
- **Database (MongoDB)**: MongoDB Atlas (Free tier - 512MB)
- **File Storage**: Cloudinary or Vercel Blob (Free tier)

---

## Prerequisites

- GitHub account (free)
- Vercel account (free at vercel.com)
- MongoDB Atlas account (free at mongodb.com/cloud/atlas)
- Railway account (free at railway.app) OR Render account (free at render.com)
- Cloudinary account (free at cloudinary.com) OR Vercel account (includes Blob storage)

---

## Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (free)
3. Choose the **FREE (M0) tier**

### 1.2 Create a Cluster
1. Select your cloud provider (AWS recommended)
2. Choose a region closest to you
3. Keep default cluster name or change it
4. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.3 Set Up Database Access
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create username and password (save these!)
5. Set user privileges to **"Read and write to any database"**
6. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - *For production, restrict this after deployment*
4. Click **"Confirm"**

### 1.5 Get Your Connection String
1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `majalpost`
7. **Save this connection string!** You'll need it later.

**Your final connection string should look like:**
```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/majalpost?retryWrites=true&w=majority
```

---

## Step 2: Set Up File Storage (Cloudinary - Recommended)

### 2.1 Create Cloudinary Account
1. Go to https://cloudinary.com/users/register_free
2. Sign up (free tier includes 25GB storage + 25GB bandwidth/month)
3. Verify your email

### 2.2 Get Cloudinary Credentials
1. After login, you'll see your **Dashboard**
2. Copy these values (you'll need them later):
   - **Cloud Name** (e.g., `dxxxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

**Save these credentials!**

---

## Step 3: Deploy Backend to Railway (Free Tier)

### 3.1 Create Railway Account
1. Go to https://railway.app/
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway

### 3.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (`majalpost`)
4. Select the `backend` folder (if monorepo) or the entire repo

### 3.3 Configure Backend Deployment
1. Railway should auto-detect Node.js
2. Set **Root Directory** to `backend` (if deploying from monorepo)
3. Set **Start Command** to: `npm start`
4. Set **Build Command** to: `npm run build`

### 3.4 Add Environment Variables
In Railway dashboard, go to **"Variables"** tab and add:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/majalpost?retryWrites=true&w=majority
FRONTEND_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-change-this
JWT_EXPIRES_IN=7d
UPLOAD_DIR=/tmp/uploads
THUMBNAIL_DIR=/tmp/uploads/thumbnails
MAX_FILE_SIZE=10485760
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=مجال بوست
```

**Important:**
- Replace `MONGODB_URI` with your MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (at least 32 characters)
- Replace Cloudinary credentials with your actual values
- For `FRONTEND_URL`, you'll update this after deploying frontend
- For Gmail SMTP, you'll need to create an App Password (see Step 7)

### 3.5 Deploy Backend
1. Railway will automatically deploy
2. Wait for deployment to complete
3. Railway will generate a URL like: `https://your-app-name.up.railway.app`
4. **Copy this URL!** This is your backend API URL

**Test your backend:**
Visit: `https://your-app-name.up.railway.app/api/health`
(You may need to add a health endpoint first)

---

## Step 4: Update Backend for Cloudinary File Storage

You'll need to modify your backend to use Cloudinary instead of local file storage. This is important because serverless/hosted platforms don't have persistent file storage.

### Files to Update:
- `backend/src/middleware/upload.ts` - Change to use Cloudinary
- `backend/src/utils/imageProcessor.ts` - Update image processing to use Cloudinary
- `backend/src/routes/media.ts` - Update media routes

**Note:** I can help you implement Cloudinary integration if needed. For now, we'll proceed with the deployment guide.

---

## Step 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Authorize Vercel

### 5.2 Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository (`majalpost`)
3. Configure project settings:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`

### 5.3 Add Environment Variables
In Vercel dashboard, go to **"Settings"** → **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app/api
```

Replace `your-backend-url.up.railway.app` with your actual Railway backend URL from Step 3.

### 5.4 Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment (usually 1-3 minutes)
3. Vercel will give you a URL like: `https://majalpost.vercel.app`
4. **Copy this URL!** This is your frontend URL

---

## Step 6: Update Backend CORS and Frontend URL

### 6.1 Update Backend Environment Variables
Go back to Railway dashboard and update the `FRONTEND_URL` variable:

```
FRONTEND_URL=https://majalpost.vercel.app
```

Replace with your actual Vercel frontend URL.

### 6.2 Redeploy Backend
Railway should auto-redeploy when you update environment variables. If not, trigger a manual redeploy.

---

## Step 7: Set Up Email (Gmail SMTP - Optional but Recommended)

### 7.1 Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### 7.2 Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **"Mail"** and **"Other (Custom name)"**
3. Name it: `MajalPost`
4. Click **"Generate"**
5. Copy the 16-character password (save it!)
6. Use this as your `SMTP_PASS` in Railway environment variables

### 7.3 Update Backend Environment Variables
In Railway, update:
```
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

---

## Step 8: Update MongoDB Atlas Network Access (Security)

After deployment, restrict MongoDB access:

1. Go to MongoDB Atlas → **"Network Access"**
2. Remove the `0.0.0.0/0` entry
3. Add your Railway backend IP address (find it in Railway dashboard or use Railway's IP ranges)
4. Alternatively, keep `0.0.0.0/0` but enable MongoDB Atlas IP Access List feature

---

## Step 9: Test Your Deployment

### 9.1 Test Frontend
1. Visit your Vercel URL: `https://majalpost.vercel.app`
2. Check if the site loads

### 9.2 Test API Connection
1. Open browser console (F12)
2. Check for any CORS or API connection errors
3. Try logging in or creating an account

### 9.3 Test File Uploads
1. Try uploading an image/article
2. Verify it's stored in Cloudinary
3. Check if images display correctly

---

## Step 10: Set Up Custom Domain (Optional)

### 10.1 Add Domain to Vercel
1. Go to Vercel dashboard → Your project → **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS configuration instructions

### 10.2 Update Environment Variables
After adding custom domain:
- Update `FRONTEND_URL` in Railway to your custom domain
- Update `NEXT_PUBLIC_API_URL` in Vercel if you also add custom domain to backend

---

## Troubleshooting

### Backend Not Starting
- Check Railway logs: Dashboard → Your service → **"Logs"**
- Verify all environment variables are set correctly
- Check MongoDB connection string format

### CORS Errors
- Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check CORS middleware configuration
- Ensure no trailing slashes in URLs

### Database Connection Failed
- Verify MongoDB Atlas network access allows Railway IPs
- Check MongoDB connection string (username, password, cluster URL)
- Verify database user has correct permissions

### File Uploads Not Working
- Ensure Cloudinary credentials are correct
- Check file size limits
- Verify Cloudinary integration code is implemented

### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally

---

## Cost Summary (Free Tier)

✅ **Vercel**: Free (unlimited personal projects)
✅ **Railway**: Free ($5 credit/month, usually enough for small apps)
✅ **MongoDB Atlas**: Free (512MB storage)
✅ **Cloudinary**: Free (25GB storage, 25GB bandwidth/month)

**Total Monthly Cost: $0** (as long as you stay within free tier limits)

---

## Next Steps

1. Implement Cloudinary integration in backend (if not done)
2. Set up monitoring (Vercel Analytics, Railway metrics)
3. Configure backups for MongoDB
4. Set up staging environment
5. Add CI/CD optimizations

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Railway: $5 credit/month (typically ~100 hours of runtime)
- MongoDB Atlas: 512MB storage limit
- Cloudinary: 25GB/month bandwidth
- Vercel: 100GB bandwidth/month

⚠️ **Security:**
- Never commit `.env` files
- Use strong JWT secrets
- Restrict MongoDB network access after testing
- Keep dependencies updated

⚠️ **Backups:**
- Set up MongoDB Atlas backups (paid feature, or use manual exports)
- Document your environment variables securely
- Keep deployment configurations in version control

---

## Need Help?

If you encounter issues:
1. Check service logs (Railway, Vercel)
2. Verify all environment variables
3. Test API endpoints directly with Postman/curl
4. Check service status pages (Railway status, Vercel status)

Good luck with your deployment! 🚀

