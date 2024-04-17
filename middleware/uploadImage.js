const multer = require('multer');
//TODO: need to use version 3 of aws-sdk/cli
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

//S3Client communicates with the bucket (we need to specify keys)
// Multer: middlewae that allows Express to pass multiplatform data
const s3 = new S3Client({
  // region: 'us-west-1'
  region: 'us-east-2'
});
// Set up AWS configuration
// s3.config.update();

// const s3 = new aws.S3();

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: process.env.AWS_SECRET_ACCESS_KEY, // store it in .env file to keep it safe
//     secretAccessKey: process.env.AWS_ACCESS_KEY
//   },
//   region: process.env.AWS_REGION // this is the region that you select in AWS account
// });

console.log("secret access_key: ", process.env.AWS_SECRET_ACCESS_KEY);
console.log("access_key: ", process.env.AWS_ACCESS_KEY);
console.log("aws_region: ", process.env.AWS_REGION);
console.log("bucket name", process.env.AWS_S3_BUCKET_NAME);


const s3Storage = multer.memoryStorage();


// our middleware
const uploadImage = multer({
  storage: s3Storage,
  limits: {
    fileSize: 1024 * 1024 * 2 // 2mb file size
  },
});

module.exports = { uploadImage, s3, PutObjectCommand };