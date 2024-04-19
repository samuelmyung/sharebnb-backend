"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Property = require("../models/property");
const Booking = require("../models/booking");



/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isHost field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use when they must be logged in and an host.
 *
 * If not, raises Unauthorized.
 */

// function ensureHost(req, res, next) {
//   if (res.locals.user?.username && res.locals.user?.isHost === true) return next();
//   throw new UnauthorizedError();
// }

/** Middleware to use when they must be logged in and the correct host.
 *
 * If not, raises Unauthorized.
 */

// async function ensureCorrectHost(req, res, next) {
//   const currentUser = res.locals.user?.username;
//   // if (
//   //   currentUser && (currentUser === req.params.username
//   //     || res.locals.user?.isHost === true))
//   return next();
//   //throw new UnauthorizedError();
//   const propertyId = req.params.id;
//   const property = await Property.get(propertyId);
//   const hostUsername = property.host_username;

//   if (
//     currentUser && (currentUser === hostUsername && currentUser === req.params.username))
//     return next();
//   throw new UnauthorizedError();
// }

/** Middleware to use when they must be logged in and the correct user.
 *
 * If not, raises Unauthorized.
 */

async function ensureCorrectUser(req, res, next) {
  const currentUser = res.locals.user?.username;

  if (
    currentUser && (currentUser === req.params.username))
    return next();
  throw new UnauthorizedError();
}

async function ensureCorrectUserBook(req, res, next) {
  const currentUser = res.locals.user?.username;
  const bookingId = req.params.bookingId;
  console.log("Bookingid", bookingId);

  const booking = await Booking.get(bookingId);
  const guestUsername = booking.guest_username;

  if (
    currentUser && (currentUser === req.params.username && currentUser === guestUsername))
    return next();
  throw new UnauthorizedError();
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureCorrectUserBook
};
