# Resend SMTP Setup Guide

## Quick Setup Steps

### 1. Create Resend Account & Get API Key
- Visit https://resend.com
- Sign up or log in
- Go to **API Keys** section
- Create a new API key (copy it securely)

### 2. Verify Your Sender Email
In Resend dashboard:
- Go to **Domains** or **Verified Senders**
- Add your email: `thefashioncompanysl@gmail.com`
- Follow verification process (check email for verification link)
- You can also add a custom domain if needed (e.g., noreply@yourdomain.com)

### 3. Update Local Environment
**File: `.env.local`**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=thefashioncompanysl@gmail.com
```
Replace `re_xxxxxxxxxxxxxxxxxxxxx` with your actual Resend API key.

### 4. Update Vercel Production Environment
In Vercel project dashboard:
1. Go to **Settings → Environment Variables**
2. Add these variables (for Production environment):

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | Your Resend API key |
| `ADMIN_EMAIL` | thefashioncompanysl@gmail.com |

3. Click **Save**

### 5. Redeploy on Vercel
- Vercel will automatically redeploy with new env vars
- Or manually trigger redeploy from Vercel dashboard

### 6. Test Email Verification
1. Go to your app: https://website-hazel-one-80.vercel.app
2. Click **Sign Up**
3. Enter test email and complete signup
4. Check your email inbox for verification email from Resend
5. Email should come from: `thefashioncompanysl@gmail.com`

## Verification Checklist
- [ ] Resend account created
- [ ] API key generated and copied
- [ ] Sender email verified in Resend
- [ ] `.env.local` updated with RESEND_API_KEY
- [ ] Vercel env vars updated (RESEND_API_KEY + ADMIN_EMAIL)
- [ ] Vercel redeployed
- [ ] Test signup email received successfully

## Troubleshooting

**Email not sending?**
- Check RESEND_API_KEY is correct (starts with `re_`)
- Verify sender email is verified in Resend dashboard
- Check browser console for error messages

**Wrong sender email?**
- Update `ADMIN_EMAIL` in `.env.local` and Vercel
- Make sure the new email is verified in Resend

**Still getting "onboarding@resend.dev"?**
- Clear browser cache
- Ensure Vercel has been redeployed after env change
- Check that ADMIN_EMAIL env var is set in Vercel Production

## Next Steps After Setup
- Monitor email delivery in Resend dashboard
- Set up email templates for better formatting (optional)
- Add "Verify Email" page if not already present
- Track email verification rates

---
**Note:** Your API key is sensitive. Never commit it to version control. Always use Vercel's secure env var system for production.
