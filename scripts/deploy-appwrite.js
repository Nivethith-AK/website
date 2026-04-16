#!/usr/bin/env node

/**
 * Appwrite Static Files Deployment Script
 * Deploys .next build directory to Appwrite Storage
 */

const fs = require('fs');
const path = require('path');
const { Client, Storage } = require('appwrite');

// Configuration
const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '69dfbc4a003c09b3d072';
const API_KEY = process.env.APPWRITE_API_KEY;
const BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || '69e060a0000f73f079d3';
const BUILD_DIR = path.join(__dirname, '.next');

if (!API_KEY) {
  console.error('❌ Error: APPWRITE_API_KEY environment variable is required');
  process.exit(1);
}

if (!fs.existsSync(BUILD_DIR)) {
  console.error('❌ Error: .next directory not found. Run "npm run build" first');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const storage = new Storage(client);

// Get all files in .next directory
function getFilesRecursive(dir, baseDir = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getFilesRecursive(fullPath, relativePath));
    } else {
      files.push({
        path: fullPath,
        name: relativePath.replace(/\\/g, '/') // Convert Windows paths to Unix-style
      });
    }
  });

  return files;
}

// Upload files to Appwrite
async function deployFiles() {
  try {
    console.log('🚀 Starting Appwrite deployment...\n');
    console.log(`📍 Endpoint: ${ENDPOINT}`);
    console.log(`📦 Project: ${PROJECT_ID}`);
    console.log(`🪣 Bucket: ${BUCKET_ID}\n`);

    const files = getFilesRecursive(BUILD_DIR);
    console.log(`📂 Found ${files.length} files to upload\n`);

    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
      try {
        const fileData = fs.readFileSync(file.path);
        const fileId = `${Date.now()}-${path.basename(file.name)}`.replace(/[^\w.-]/g, '_');

        console.log(`⬆️  Uploading: ${file.name}`);

        await storage.createFile(
          BUCKET_ID,
          fileId,
          new Blob([fileData], { type: 'application/octet-stream' }),
          [
            'role:all', // Make public
          ]
        );

        uploaded++;
      } catch (error) {
        console.error(`❌ Failed: ${file.name} - ${error.message}`);
        failed++;
      }
    }

    console.log(`\n✅ Deployment complete!`);
    console.log(`📊 Uploaded: ${uploaded} files`);
    console.log(`⚠️  Failed: ${failed} files`);

    if (failed === 0) {
      console.log(`\n🎉 All files deployed successfully!`);
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployFiles();
