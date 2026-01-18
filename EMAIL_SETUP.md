# Email Setup Guide

Your application is configured to send emails, but SMTP credentials need to be configured in Railway.

## Quick Setup Options

### Option 1: Gmail SMTP (Easiest - Free)

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Majal Post" as the name
   - Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

3. **Add to Railway Environment Variables**:
   - Go to your Railway project → Variables tab
   - Add these variables:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-16-char-app-password (remove spaces)
     SMTP_FROM_EMAIL=your-email@gmail.com
     SMTP_FROM_NAME=مجال بوست
     ```

### Option 2: SendGrid (Recommended for Production - Free tier: 100 emails/day)

1. Sign up at https://sendgrid.com
2. Create an API Key in SendGrid dashboard
3. Add to Railway:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM_EMAIL=noreply@majalpost.com (verify this domain in SendGrid)
   SMTP_FROM_NAME=مجال بوست
   ```

### Option 3: Mailgun (Free tier: 5,000 emails/month)

1. Sign up at https://mailgun.com
2. Get SMTP credentials from Mailgun dashboard
3. Add to Railway:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-smtp-username
   SMTP_PASS=your-mailgun-smtp-password
   SMTP_FROM_EMAIL=noreply@your-domain.com (must be verified domain)
   SMTP_FROM_NAME=مجال بوست
   ```

## After Adding Variables

1. Railway will automatically redeploy after you add environment variables
2. Check Railway logs to verify emails are being sent
3. Test by registering a new user

## Current Status

If `SMTP_USER` or `SMTP_PASS` are not set, emails will be silently skipped (registration still works, but no email is sent).

