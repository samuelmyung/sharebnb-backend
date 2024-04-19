"use strict";
const express = require("express");
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const { ensureHost } = require("../middleware/auth");
const Booking = require("../models/booking");
const bookingNewSchema = require("../schemas/bookingNew.json");

const router = new express.Router();
require('dotenv').config();

// const bookingUpdateSchema = require("../schemas/bookingUpdate.json");
// const bookingFilterSchema = require("../schemas/bookingFilter.json");

/** POST / { booking } =>  { booking }
 *
 * booking should be { guest_username, property_id, checkin_date, checkout_date, total_price }
 *
 * Returns { id, guest_username, property_id, checkin_date, checkout_date, total_price }
 *
 * Authorization required: user
 */
router.post("/", async function (req, res, next) {
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


/** DELETE /[bookings]  =>  { deleted: bookings }
 *
 * Authorization required: current user or Host
 **/
router.delete("/:id", async function (req, res, next) {
  await Booking.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;