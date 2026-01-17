# How to Put Your Site on GitHub

Your code is already a Git repository, just needs to be connected to GitHub.

---

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `majalpost` (or whatever you want)
3. Description: (optional) "Majal Post - Blog Platform"
4. Choose: **Public** or **Private**
5. **DO NOT** check "Initialize with README" (you already have code)
6. Click **"Create repository"**

---

## Step 2: Connect Your Local Code to GitHub

After creating the repo, GitHub shows you commands. Use these:

### Option A: If you just created a NEW empty repo

Copy the commands GitHub gives you (they'll look like this):

```powershell
git remote add origin https://github.com/YOUR-USERNAME/majalpost.git
git branch -M main
git push -u origin main
```

**But wait!** You're on `master` branch, so first do this:

```powershell
# Add all your files
git add .

# Commit everything
git commit -m "Initial commit - Majal Post blog platform"

# Rename branch to main (GitHub uses 'main' now)
git branch -M main

# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/majalpost.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

---

## Step 3: Get Your GitHub URL

After creating the repo, you'll see a page with this URL format:
```
https://github.com/YOUR-USERNAME/majalpost
```

Copy this URL - you'll need it for the commands above.

---

## Quick Commands (Copy-Paste These)

**Replace `YOUR-USERNAME` and `majalpost` with your actual values!**

```powershell
# 1. Add all files
git add .

# 2. Commit
git commit -m "Initial commit - Majal Post blog platform"

# 3. Rename branch to main
git branch -M main

# 4. Add GitHub remote (REPLACE YOUR-USERNAME!)
git remote add origin https://github.com/YOUR-USERNAME/majalpost.git

# 5. Push to GitHub
git push -u origin main
```

---

## If You Get Errors

**"Remote origin already exists":**
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/majalpost.git
```

**"Authentication failed":**
- GitHub might ask for username/password
- Use a **Personal Access Token** instead of password
- Create one at: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Give it "repo" permissions
- Use the token as your password

**"Branch main does not exist":**
```powershell
git branch -M master main
git push -u origin main
```

---

## That's It! 🎉

Your code is now on GitHub at: `https://github.com/YOUR-USERNAME/majalpost`

You can now:
- Deploy to Railway (connects to GitHub)
- Deploy to Vercel (connects to GitHub)
- Share your code
- Collaborate with others

---

## Next Steps

After pushing to GitHub:
1. Deploy backend to Railway (see MINIMAL_DEPLOYMENT_GUIDE.md)
2. Deploy frontend to Vercel (see MINIMAL_DEPLOYMENT_GUIDE.md)

