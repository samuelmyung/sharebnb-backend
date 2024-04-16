"use strict";

const upload = require("../helpers/aws");


// Define route for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully!', fileUrl: req.file.location });
});
