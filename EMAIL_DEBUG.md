# Email Debugging Guide

If emails are still not working after setting up SMTP credentials, follow these steps:

## 1. Check Railway Logs

Go to your Railway project → Deployments → Latest deployment → View Logs

Look for:
- "Email not sent (test mode or SMTP not configured)" - means SMTP credentials are missing
- "Sending email..." - email attempt started
- "Email sent successfully" - email was sent
- "Error sending email" - there was an error

## 2. Verify Environment Variables in Railway

Go to Railway → Your Backend Service → Variables

Make sure ALL these are set (no empty values):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password (no spaces, no quotes)
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=مجال بوست
```

**Common mistakes:**
- ❌ Using your Gmail password instead of App Password
- ❌ Adding spaces in the app password
- ❌ Using quotes around the password
- ❌ Wrong SMTP_PORT (should be 587 for Gmail)
- ❌ Missing SMTP_FROM_EMAIL

## 3. Test Gmail App Password

1. Make sure 2-Step Verification is enabled
2. Generate a NEW app password at https://myaccount.google.com/apppasswords
3. Copy it immediately (you won't see it again)
4. Paste it directly into Railway (no spaces, no quotes)

## 4. Check for Common Gmail Issues

**"Less secure app access" is deprecated** - You MUST use App Passwords now.

**Rate limits:** Gmail has daily sending limits:
- Free Gmail: ~500 emails/day
- Google Workspace: ~2000 emails/day

**If you see authentication errors:**
- Make sure you're using an App Password, not your regular password
- Make sure 2-Step Verification is enabled
- Try generating a new App Password

## 5. Alternative: Use a Different Service

If Gmail isn't working, try:

**SendGrid (Free tier: 100/day):**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_EMAIL=verified-email@yourdomain.com
```

**Mailgun (Free tier: 5000/month):**
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
SMTP_FROM_EMAIL=verified-email@yourdomain.com
```

## 6. After Changing Variables

1. Railway auto-redeploys when you change variables
2. Wait 1-2 minutes for deployment
3. Check logs again
4. Try registering a new user

## 7. If Still Not Working

Share the Railway logs showing:
- The "Sending email..." message
- Any error messages after it
- The SMTP configuration values (they'll be partially redacted)

