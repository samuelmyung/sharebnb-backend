"use strict";

const express = require("express");
const router = express.Router();

const { uploadImage } = require("../middleware/uploadImage");

// update profile image
router.post(
  "/uploadImage",
  uploadImage.single("image"), // our uploadImage middleware
  (req, res, next) => {
    res.json({
      message: 'File uploaded successfully!',
      fileUrl: req.file.location
    });

    // req.file = {
    //   fieldname, originalname,
    //   mimetype, size, bucket, key, location
    // };

    // location key in req.file holds the s3 url for the image
    let data = {};
    if (req.file) {
      data.image = req.file.location;
    }

    // HERE IS YOUR LOGIC TO UPDATE THE DATA IN DATABASE
  }
);
