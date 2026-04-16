# Appwrite Static Files Hosting Guide

## Deployment Steps

### 1. Build the Next.js Project
```bash
npm run build
```
This creates the `.next` directory with optimized static/server files.

### 2. Upload to Appwrite Static Files

You have two options:

#### **Option A: Using Appwrite Console (Web UI)**
1. Go to your Appwrite project dashboard
2. Navigate to **Storage**
3. Select or create a bucket for static files (or use `website` bucket if it exists)
4. Upload the contents of `.next/` directory
5. Configure bucket file permissions to public

#### **Option B: Using Appwrite CLI (Recommended)**
```bash
# Install Appwrite CLI if not already installed
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Set your project
appwrite project

# Deploy static files
appwrite deploy buckets
```

#### **Option C: Programmatic Deployment**
Create a deployment script using Appwrite SDK to upload files from `.next/static` directory.

### 3. Configure Static File Serving

In Appwrite Console:
- Go to **Storage → Buckets**
- Select your static files bucket
- Enable **File Preview**
- Set permissions to allow public read access
- Get your bucket endpoint: `https://{your-appwrite-endpoint}/v1/buckets/{bucket-id}/files/{file-id}/preview`

### 4. Next.js Configuration for Appwrite Hosting

Update `next.config.ts` to set proper base path:
```typescript
const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
  // ... rest of config
};
```

### 5. Environment Variables for Appwrite Hosting

Add to `.env.local` and your Appwrite Console:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=69dfbc4a003c09b3d072
NEXT_PUBLIC_APPWRITE_DATABASE_ID=69dfbdd600286a191644
APPWRITE_API_KEY=your_api_key
ADMIN_EMAIL=thefashioncompanysl@gmail.com
RESEND_API_KEY=your_resend_key
```

### 6. Deploy & Test

1. Build the project: `npm run build`
2. Upload `.next/` files to Appwrite
3. Test your app URL
4. Monitor logs in Appwrite Console

## Troubleshooting

**App returns 404:**
- Check that static files are uploaded to correct bucket
- Verify file permissions are set to public
- Check bucket endpoint configuration

**CSS/Images not loading:**
- Verify `assetPrefix` is set correctly
- Check that `.next/static/` directory was uploaded
- Ensure bucket has proper CORS settings

**API routes failing:**
- Appwrite Static Files only serves static content
- API routes must be configured separately (see next section)

## API Routes with Appwrite Functions

For dynamic API endpoints (login, signup, etc.), you need **Appwrite Functions**:

1. Go to **Functions** in Appwrite Console
2. Create a new function (Node.js runtime)
3. Deploy your API route logic as a function
4. Update frontend to call Appwrite Functions instead of Next.js API routes

Or use Next.js API routes deployed separately on another platform (Vercel, Railway, etc.)

## Quick Reference

| Component | Hosting |
|-----------|---------|
| Next.js Static Pages | Appwrite Static Files |
| Next.js API Routes | Appwrite Functions or External Server |
| Appwrite Backend | Appwrite Cloud (SGP) |
| Email Service | Resend SMTP |

---

**Note:** If you need dynamic API routes, consider using Appwrite Functions or deploying API layer separately while keeping frontend on Appwrite Static Files.
