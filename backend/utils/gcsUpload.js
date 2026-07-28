const { Storage } = require('@google-cloud/storage');
const path = require('path'); // path is needed for extname in controllers

// Setup Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const uploadFileToGCS = async (fileBuffer, mimetype, fileName) => {
  const gcsFile = bucket.file(fileName);
  
  // Use the .save() method, which is more robust for buffer uploads in serverless environments.
  // It returns a promise that resolves upon successful upload.
  await gcsFile.save(fileBuffer, {
    metadata: {
      contentType: mimetype,
    },
    resumable: false, // Use simple upload for smaller files from memory
  });
  
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};

module.exports = { uploadFileToGCS, bucket };