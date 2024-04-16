const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const { S3Client } = require("@aws-sdk/client-s3");
require('dotenv').config();

// Set up AWS configuration
// aws.config.update({
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   region: process.env.AWS_REGION
// });
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_SECRET_ACCESS_KEY, // store it in .env file to keep it safe
    secretAccessKey: process.env.AWS_ACCESS_KEY
  },
  region: process.env.AWS_REGION // this is the region that you select in AWS account
});

console.log("secret access_key: ", process.env.AWS_SECRET_ACCESS_KEY);
console.log("access_key: ", process.env.AWS_ACCESS_KEY);
console.log("aws_region: ", process.env.AWS_REGION);


const s3Storage = multerS3({
  s3: s3, // s3 instance
  bucket: process.env.AWS_S3_BUCKET_NAME, // change it as per your project requirement
  acl: "public-read", // storage access type
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName = Date.now() + "_" + file.fieldname + "_" + file.originalname;
    cb(null, fileName);
  }
});

console.log(process.env.AWS_S3_BUCKET_NAME);

// function to sanitize files and send error for unsupported files
function sanitizeFile(file, cb) {
  // Define the allowed extension
  const fileExts = [".png", ".jpg", ".jpeg", ".gif"];

  // Check allowed extensions
  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  // Mime type must be an image
  const isAllowedMimeType = file.mimetype.startsWith("image/");

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true); // no errors
  } else {
    // pass error msg to callback, which can be displaye in frontend
    cb("Error: File type not allowed!");
  }
}

// our middleware
const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 2 // 2mb file size
  }
});

module.exports = uploadImage;


// Create an instance of the S3 service
// const s3 = new aws.S3();

// Set up Multer-S3 middleware
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_S3_BUCKET_NAME,
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString() + '-' + file.originalname); // Generates a unique key for the file
//     }
//   })
// });

// module.exports = { upload };