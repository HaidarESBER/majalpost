# Fix Vercel Build - Set Root Directory

## The Problem
Vercel is trying to build from the root directory, but your Next.js app is in the `frontend` folder.

## The Solution

### Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. Go to Vercel dashboard
2. Click on your project
3. Go to **"Settings"** tab
4. Scroll down to **"Build & Development Settings"**
5. Find **"Root Directory"**
6. Click **"Edit"**
7. Enter: `frontend`
8. Click **"Save"**
9. Vercel will automatically redeploy

### Option 2: Create vercel.json in Root

Alternatively, create a `vercel.json` file in the root directory:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install"
}
```

But Option 1 is cleaner and recommended.

---

## After Fixing

Once you set the root directory to `frontend`, Vercel will:
- Install dependencies from `frontend/package.json`
- Run `npm run build` from the `frontend` directory
- Deploy the Next.js app correctly

The build should succeed!

