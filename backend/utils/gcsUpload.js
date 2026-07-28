const { Storage } = require('@google-cloud/storage');
const path = require('path'); // path is needed for extname in controllers
const fs = require('fs');

// Setup Google Cloud Storage
const storage = new Storage();
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