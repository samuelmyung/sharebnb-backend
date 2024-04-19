const express = require("express");
const { NotFoundError } = require("./expressError");
const propertiesRoutes = require("./routes/properties");
const usersRoutes = require("./routes/users");
const bookingsRoutes = require("./routes/bookings");
const authRoutes = require("./routes/auth");
const bookingsRoutes = require("./routes/bookings");
const { authenticateJWT } = require("./middleware/auth");


const app = express();
const cors = require("cors");

app.use(express.json());

app.use(cors({ origin: 'http://localhost:5175' }));
app.use(authenticateJWT);
app.use(cors({ origin: 'http://localhost:5173' }));
app.use("/properties", propertiesRoutes);
app.use("/users", usersRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/auth", authRoutes);



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