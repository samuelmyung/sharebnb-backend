const express = require("express");
const { NotFoundError } = require("./expressError");
const placesRoutes = require("./routes/places");

const app = express();
const cors = require("cors");

app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173' }));
app.use("/places", placesRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  throw new NotFoundError();
});


/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  /* istanbul ignore next (ignore for coverage) */
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

// Define route for file upload
// app.post('/upload', upload.single('file'), (req, res) => {
//   res.json({ message: 'File uploaded successfully!', fileUrl: req.file.location });
// });

module.exports = app;