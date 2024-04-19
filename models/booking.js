"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");


/** Related functions for bookings. */

class Booking {
  /** Create a booking from data
   *
   * data should be { guest_username, property_id, checkin_date, checkout_date, date_booked }
   *
   * Throws NotFoundError if the booking does not exist.
   *
   * Returns { guest_username, property_id, checkin_date, checkout_date, date_booked }
   **/
  static async create(data) {
    const bookingCheck = await db.query(`
        SELECT *
        FROM bookings
        WHERE property_id = $1
          AND ((checkin_date <= $2 AND checkout_date >= $2)
               OR (checkin_date <= $3 AND checkout_date >= $3))
    `, [data.property_id, data.checkin_date, data.checkout_date]);

    if (bookingCheck.rows.length > 0)
      throw new BadRequestError(`Booking conflicts with existing bookings`);

    const result = await db.query(`
        INSERT INTO bookings (guest_username,
                              property_id,
                              checkin_date,
                              checkout_date)
        VALUES ($1, $2, $3, $4)
        RETURNING
             id,
             guest_username,
             property_id,
             checkin_date,
             checkout_date,
             date_booked`, [
      data.guest_username,
      data.property_id,
      data.checkin_date,
      data.checkout_date
    ]);
    const booking = result.rows[0];
    return booking;
  }


  /** Given a booking id, return data about that booking.
  *
  * Returns { guest_username, property_id, checkin_date, checkout_date, date_booked }
  *
  * Throws NotFoundError if not found.
  **/
  static async get(id) {
    const result = await db.query(`
      SELECT
             id,
             guest_username,
             property_id,
             checkin_date,
             checkout_date,
             date_booked
      FROM bookings
      WHERE id = $1`, [id]);
    const booking = result.rows[0];
    if (!booking) throw new NotFoundError(`No booking found`);
    return booking;
  }


  /** Get all bookings for a specific user.
*
* Returns [{ guest_username, property_id, checkin_date, checkout_date, date_booked }...]
*
* Throws NotFoundError if not found.
**/
  static async getAll(guest_username) {
    const result = await db.query(`
    SELECT id,
           guest_username,
           property_id,
           checkin_date,
           checkout_date,
           date_booked
    FROM bookings
    WHERE guest_username = $1`, [guest_username]);
    const bookings = result.rows;
    if (!bookings) throw new NotFoundError(`No bookings found for this user`);
    return bookings;
  }


  /** Update property data with `data`.
    *
    * This is a "partial update" --- it's fine if data doesn't contain all the
    * fields; this only changes provided ones.
    *
    * Data can include: { checkin_date, checkout_date }
    *
    * Returns { guest_username, property_id, checkin_date, checkout_date, date_booked }
    *
    * Throws NotFoundError if not found.
    */

  static async update(propertyId, bookingId, data) {
    const allowedColumns = ["checkin_date", "checkout_date"];
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        checkin_date: "checkin_date",
        checkout_date: "checkout_date"
      }, allowedColumns);

    const propertyVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE bookings
        SET ${setCols}
        WHERE id = ${propertyVarIdx}
        RETURNING
                guest_username,
                property_id,
                checkin_date,
                checkout_date,
                date_booked`;
//between where new date is between start and end date
    console.log("#####################", querySql)
    console.log("data.property_id", data.property_id);
    console.log("data.checkin_date", data.checkin_date);
    console.log("data.checkout_date", data.checkout_date);
    const bookingCheck = await db.query(`
        SELECT *
        FROM bookings
        WHERE property_id = $1
        AND (($2 BETWEEN checkin_date AND checkout_date)
        OR ($3 BETWEEN checkin_date AND checkout_date))
        `, [propertyId, data.checkin_date, data.checkout_date, ]);


        // const bookingCheck = await db.query(`
        // SELECT *
        // FROM bookings
        // WHERE property_id = $1
        // AND id != $2
        // AND ((checkin_date <= $3 AND checkout_date >= $3)
        // OR (checkin_date <= $4 AND checkout_date >= $4))
        // `, [data.property_id, id, data.checkin_date, data.checkout_date]);

    console.log("#####################", bookingCheck)

    if (bookingCheck.rows.length > 0)
      throw new BadRequestError(`Booking conflicts with existing bookings`);

    const result = await db.query(querySql, [...values, bookingId]);
    const booking = result.rows[0];

    if (!booking) throw new NotFoundError(`No booking`);

    return booking;
  }



  /** Delete given booking from database; returns undefined.
   *
   * Throws NotFoundError if property not found.
   **/
  static async remove(id) {
    const result = await db.query(`
          DELETE
          FROM bookings
          WHERE id = $1
          RETURNING id`, [id]);
    const booking = result.rows[0];
    if (!booking) throw new NotFoundError(`No booking: ${id}`);
  }
}

module.exports = Booking;