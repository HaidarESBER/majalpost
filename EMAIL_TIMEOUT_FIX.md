# Email Connection Timeout Fix

## Problem
Getting "Connection timeout" errors when trying to send emails from Railway to Gmail SMTP.

## Root Cause
Railway may block or have issues with outbound SMTP connections on port 587. This is common with cloud platforms.

## Solutions

### Option 1: Try Port 465 with SSL (Recommended First Try)

Gmail supports port 465 with SSL/TLS. Update your Railway environment variables:

1. In Railway, set `SMTP_PORT` to `465`
2. The code will automatically use `secure: true` when port is 465
3. Redeploy and test again

### Option 2: Use a Transactional Email Service (Best Solution)

Instead of direct SMTP, use a service designed for applications:

#### Option 2a: Resend (Recommended - Simple & Modern)
- **Free tier**: 3,000 emails/month
- **API-based**: No SMTP needed
- **Setup**:
  1. Sign up at https://resend.com
  2. Get API key
  3. Add `RESEND_API_KEY` to Railway
  4. Update code to use Resend SDK

#### Option 2b: SendGrid
- **Free tier**: 100 emails/day
- **API-based**: Better than SMTP
- **Setup**:
  1. Sign up at https://sendgrid.com
  2. Get API key
  3. Add `SENDGRID_API_KEY` to Railway
  4. Update code to use SendGrid SDK

#### Option 2c: Mailgun
- **Free tier**: 5,000 emails/month for 3 months
- **API-based**: Reliable
- **Setup**: Similar to above

### Option 3: Use Railway's SMTP Relay (If Available)

Check if Railway offers an SMTP relay service in their documentation.

## Quick Fix to Try Now

1. **Change SMTP_PORT to 465 in Railway:**
   - Go to Railway dashboard
   - Your service → Variables
   - Change `SMTP_PORT` from `587` to `465`
   - Redeploy

2. **Test again**

If port 465 also times out, you'll need to switch to a transactional email service (Option 2).

## Why This Happens

- Cloud platforms (Railway, Heroku, etc.) often block or restrict outbound SMTP ports (25, 587, 465)
- Gmail may also block connections from cloud platform IP ranges
- Transactional email services (Resend, SendGrid) use APIs instead of SMTP, which work better from cloud platforms

