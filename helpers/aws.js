const express = require('express');
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');

const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME } = require("../.env");

const app = express();

// Set up AWS configuration
aws.config.update({
  secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
  accessKeyId: 'AWS_ACCESS_KEY',
  region: 'AWS_REGION'
});

// Create an instance of the S3 service
const s3 = new aws.S3();

// Set up Multer-S3 middleware
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'AWS_S3_BUCKET_NAME',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname); // Generates a unique key for the file
    }
  })
});


module.exports = { upload };