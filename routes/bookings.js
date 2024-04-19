"use strict";
const express = require("express");
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser, ensureCorrectUserBook } = require("../middleware/auth");
const router = new express.Router();
const Booking = require("../models/booking");

const bookingNewSchema = require("../schemas/bookingNew.json");
const bookingUpdateSchema = require("../schemas/bookingUpdate.json");


/** POST / { booking } =>  { booking }
 *
 * booking should be { guest_username, property_id, checkin_date, checkout_date, date_booked }
 *
 * Returns { id, guest_username, property_id, checkin_date, checkout_date, date_booked }
 *
 * Authorization required: user
 */
router.post("/", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    bookingNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }
  const booking = await Booking.create(req.body);
  return res.status(201).json({ booking });
});

/** GET /  => Get all user bookings
 *   { user_bookings: [{ guest_username, property_id, checkin_date, checkout_date, date_booked }...] }
  *
 * Authorization required: correctUser
 */
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const bookings = await Booking.getAll(req.params.username);
  return res.json({ bookings });
});

/** GET /  => Get a user booking
 *   { booking: { guest_username, property_id, checkin_date, checkout_date, date_booked } }
  *
 * Authorization required: correctUser
 */
router.get("/:username/:id", ensureCorrectUserBook, async function (req, res, next) {

  const booking = await Booking.get(req.params.id);
  return res.json({ booking });
});

/** POST /  => Booking Update
 *   { booking:  { guest_username, property_id, checkin_date, checkout_date, date_booked }
  *
 * Authorization required: Correct User Book
 */
router.patch("/:username/:propertyId/:bookingId", ensureCorrectUserBook, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    bookingUpdateSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const booking = await Booking.update(req.params.propertyId, req.params.bookingId, req.body);
  return res.json({ booking });
});

/** DELETE /[bookings]  =>  { deleted: bookings }
 *
 * Authorization required: current user or Host
 **/
router.delete("/:username/:id", ensureCorrectUserBook, async function (req, res, next) {
  await Booking.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});


module.exports = router;
