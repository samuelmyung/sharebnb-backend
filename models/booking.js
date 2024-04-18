"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");


/** Related functions for bookings. */

class Booking {
  /** Create a booking from data
   *
   * data should be { guest_username, property_id, checkin_date, checkout_date, total_price }
   *
   * Throws NotFoundError if the property does not exist.
   *
   * Returns { guest_username, property_id, checkin_date, checkout_date, total_price }
   **/

  static async create(data) {
    const propertyPreCheck = await db.query(`
                SELECT id
                FROM properties
                WHERE id = $1`,
      [data.property_id]);
    const property = propertyPreCheck.rows[0];

    if (!property) throw new NotFoundError(`No property: ${data.property_id}`);

    const result = await db.query(`
        INSERT INTO bookings (guest_username,
                              property_id,
                              checkin_date,
                              checkout_date,
                              total_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
             guest_username,
             property_id,
             checkin_date,
             checkout_date,
             total_price`, [
      data.guest_username,
      data.property_id,
      data.checkin_date,
      data.checkout_date,
      data.total_price,
    ]);
    const booking = result.rows[0];

    return booking;
  }

  /** Given a property id, return data about bookings on that property.
   *
   * Returns [{ guest_username, property_id, checkin_date, checkout_date, total_price }]
   *
   * Throws NotFoundError if not found.
   **/

  static async getByPropertyId(property_id) {
    const bookingsRes = await db.query(`
        SELECT guest_username,
               property_id,
               checkin_date,
               checkout_date,
               total_price
        FROM properties
        WHERE property_id = $1`, [property_id]);

    const bookings = bookingsRes.rows;

    // if (!booking) throw new NotFoundError(`No booking found: ${}`);

    return bookings;
  }

  /** Given a guest username, return data about bookings on that property.
   *
   * Returns [{ guest_username, property_id, checkin_date, checkout_date, total_price }]
   *
   * Throws NotFoundError if not found.
   **/

  static async getByGuestUsername(guest_username) {
    const bookingsRes = await db.query(`
        SELECT guest_username,
               property_id,
               checkin_date,
               checkout_date,
               total_price
        FROM properties
        WHERE guest_username = $1`, [guest_username]);

    const bookings = bookingsRes.rows;

    // if (!booking) throw new NotFoundError(`No booking found: ${}`);

    return bookings;
  }

    /** Given a booking id, return data about that booking.
   *
   * Returns { guest_username, property_id, checkin_date, checkout_date, total_price }
   *
   * Throws NotFoundError if not found.
   **/

    static async getById(guest_username) {
      const bookingsRes = await db.query(`
          SELECT guest_username,
                 property_id,
                 checkin_date,
                 checkout_date,
                 total_price
          FROM properties
          WHERE guest_username = $1`, [guest_username]);

      const bookings = bookingsRes.rows;

      // if (!booking) throw new NotFoundError(`No booking found: ${}`);

      return bookings;
    }


}

module.exports = Booking;