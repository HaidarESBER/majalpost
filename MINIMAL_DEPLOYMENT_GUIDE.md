# Minimal Deployment Guide - 3 Services Only

Deploy with just the essentials: MongoDB, Railway, Vercel.

---

## What You Need

1. **MongoDB Atlas** (free) - Database
2. **Railway** (free tier) - Backend hosting  
3. **Vercel** (free) - Frontend hosting

That's it. No Cloudinary, no extra services.

---

## Step 1: MongoDB Atlas (Already Done ✅)

You have:
```
mongodb+srv://majalpost:Majalpost123@cluster0.cbkbwwd.mongodb.net/majalpost?retryWrites=true&w=majority
```

✅ Done. Move on.

---

## Step 2: Deploy Backend to Railway

### 2.1 Sign Up
1. Go to https://railway.app/
2. Login with GitHub
3. Authorize Railway

### 2.2 Create Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `majalpost` repo
4. Railway auto-detects it's Node.js

### 2.3 Configure
1. Set **Root Directory** to: `backend`
2. Set **Start Command** to: `npm start`
3. Set **Build Command** to: `npm run build`

### 2.4 Add Environment Variables
Click **"Variables"** tab, add these:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://majalpost:Majalpost123@cluster0.cbkbwwd.mongodb.net/majalpost?retryWrites=true&w=majority
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=change-this-to-a-random-32-character-string-at-least
JWT_EXPIRES_IN=7d
UPLOAD_DIR=/tmp/uploads
THUMBNAIL_DIR=/tmp/uploads/thumbnails
MAX_FILE_SIZE=10485760
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=مجال بوست
```

**Note:** 
- Generate a random 32+ character string for `JWT_SECRET`
- Leave SMTP empty for now (emails won't work, but site will run)
- `FRONTEND_URL` - update after you deploy frontend

### 2.5 Deploy
Railway auto-deploys. Wait ~2 minutes.

Copy your Railway URL (like `https://majalpost-production.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Sign Up
1. Go to https://vercel.com/signup
2. Login with GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import `majalpost` repo
3. Configure:
   - **Root Directory:** `frontend`
   - Everything else auto-detects (Next.js)

### 3.3 Add Environment Variable
**Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api
```

Replace with your actual Railway URL from Step 2.

### 3.4 Deploy
Click **"Deploy"**. Wait 1-2 minutes.

Copy your Vercel URL (like `https://majalpost.vercel.app`)

---

## Step 4: Connect Them

### 4.1 Update Backend
Go back to Railway → Variables, update:
```
FRONTEND_URL=https://your-vercel-url.vercel.app
```
Replace with your actual Vercel URL.

Railway will auto-redeploy.

---

## That's It! 🎉

Your site is deployed. 

**What works:**
- ✅ Frontend (Vercel)
- ✅ Backend API (Railway)
- ✅ Database (MongoDB Atlas)
- ✅ Authentication, articles, etc.

**What doesn't work yet:**
- ❌ File uploads (would need Cloudinary - add later if needed)
- ❌ Email sending (would need SMTP config - add later if needed)

But your core site works!

---

## Generate JWT_SECRET (Quick)

Run this in PowerShell to generate a random secret:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Or just use: `majalpost-secret-key-2024-change-me-later-32chars`

---

## Test It

1. Visit your Vercel URL
2. Try registering/logging in
3. Create an article (without images for now)

Done! 🚀

