const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
require('dotenv').config()

// Set up AWS configuration
aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION
});

console.log(process.env.AWS_SECRET_ACCESS_KEY);
console.log(process.env.AWS_ACCESS_KEY);
console.log(process.env.AWS_REGION);

// Create an instance of the S3 service
const s3 = new aws.S3();

// Set up Multer-S3 middleware
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname); // Generates a unique key for the file
    }
  })
});

module.exports = { upload };