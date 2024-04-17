"use strict";

const express = require("express");
const router = express.Router();
require('dotenv').config();
const { uploadImage, s3, PutObjectCommand } = require("../middleware/uploadImage");

console.log("****************", uploadImage);

// update profile image
router.post(
  "/uploadImage",
  uploadImage.single('file'), // our uploadImage middleware
  async (req, res) => {
    const params = new PutObjectCommand({
      Bucket: "sharebnb-rithm",
      //TODO: UUID for a random key
      Key: req.file.originalname,
      Body: req.file.buffer,
    });

    await s3.send(params);
    res.send("Uploaded");
  });

module.exports = router;
