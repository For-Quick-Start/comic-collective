const { Storage } = require('@google-cloud/storage');
const path = require('path'); // path is needed for extname in controllers
const fs = require('fs');

// Setup Google Cloud Storage
let storage;
const gcsCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (gcsCredentials) {
  let credentials;
  try {
    // Try parsing as JSON (might be a raw JSON string)
    credentials = JSON.parse(gcsCredentials);
  } catch (e) {
    try {
      // If that fails, try decoding from Base64 (for Vercel)
      const decodedCreds = Buffer.from(gcsCredentials, 'base64').toString('utf-8');
      credentials = JSON.parse(decodedCreds);
    } catch (e2) {
      // If both fail, it's likely a file path for local dev, so we let the library handle it.
    }
  }
  storage = new Storage(credentials ? { credentials } : undefined);
} else {
  storage = new Storage(); // No credentials, will use ADC or other mechanisms
}

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const uploadFileFromPathToGCS = async (localPath, destinationPath) => {
  try {
    await bucket.upload(localPath, {
      destination: destinationPath,
      // Optional: Add metadata here if needed
      // metadata: { contentType: 'image/jpeg' },
    });
    return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
  } finally {
    // Clean up the temporary file from the local filesystem
    try {
      fs.unlinkSync(localPath);
    } catch (cleanupError) {
      console.error(`Failed to clean up temporary file: ${localPath}`, cleanupError);
    }
  }
};

const uploadFileToGCS = async () => {
  // This function is deprecated for Vercel environment due to stream issues.
  throw new Error('uploadFileToGCS with buffer is not supported in this environment. Use uploadFileFromPathToGCS instead.');
};

module.exports = { uploadFileFromPathToGCS, uploadFileToGCS, bucket };