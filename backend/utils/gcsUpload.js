const { Storage } = require('@google-cloud/storage');
const path = require('path'); // path is needed for extname in controllers

// Setup Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const uploadFileToGCS = (fileBuffer, mimetype, fileName) => {
  return new Promise((resolve, reject) => {
    const gcsFile = bucket.file(fileName);
    const stream = gcsFile.createWriteStream({
      metadata: {
        contentType: mimetype,
      },
      resumable: false,
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
    });

    stream.end(fileBuffer);
  });
};

module.exports = { uploadFileToGCS, bucket };