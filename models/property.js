"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for properties. */

class Property {
  /** Creates a property (from data), update db, return new property data.
     *
     * data should be { title, host_username, image, price_night,
     * description, address }
     *
     * Returns { id, title, host_username, image, price_night,
     * description, address }
     *
     * Throws BadRequestError if property already in database.
     * */
  static async create({ title, host_username, image, price_night, description, address }) {

    const duplicateCheck = await db.query(`
        SELECT title
        FROM properties
        WHERE title = $1`, [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate property: ${title}`);

    const result = await db.query(`
                INSERT INTO properties (title,
                                       host_username,
                                       image,
                                       price_night,
                                       description,
                                       address)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                    id,
                    title,
                    host_username,
                    image,
                    price_night,
                    description,
                    address`, [
      title,
      host_username,
      image,
      price_night,
      description,
      address
    ],
    );
    const property = result.rows[0];

    return property;
  }

  /** Find all properties.
   *
   *
   * Returns [{ title, host_username, image, price_night, description, address }, ...]
   * */
  static async getAll() {
    const properties = await db.query(`
        SELECT id,
                title,
                host_username,
                image,
                price_night,
                description,
                address
        FROM properties
        ORDER BY title`);
    return properties.rows;
  }

  /** Given a property id, return data about the property.
   *
   * Returns { title, host_username, image, price_night, description, address }
   *
   * Throws NotFoundError if not found.
   **/
  static async get(id) {
    const propertyRes = await db.query(`
        SELECT title,
                host_username,
                image,
                price_night,
                description,
                address
        FROM properties
        WHERE id = $1`, [id]);

    const property = propertyRes.rows[0];

    if (!property) throw new NotFoundError(`No property: ${id}`);

    return property;
  }

  /** Delete given property from database; returns undefined.
   *
   * Throws NotFoundError if property not found.
   **/
  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM properties
        WHERE id = $1
        RETURNING id`, [id]);
    const property = result.rows[0];

    if (!property) throw new NotFoundError(`No property: ${id}`);
  }


  /** Update property data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: { image, price_night, description }
     *
     * Returns { title, host_username, image, price_night, description, address }
     *
     * Throws NotFoundError if not found.
     */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        image: "image",
        price_night: "price_night",
        description: "description",

      });
    const propertyVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE properties
        SET ${setCols}
        WHERE id = ${propertyVarIdx}
        RETURNING
                title,
                host_username,
                image,
                price_night,
                description,
                address`;
    const result = await db.query(querySql, [...values, id]);
    const property = result.rows[0];

    if (!property) throw new NotFoundError(`No company: ${id}`);

    return property;
  }




  /** Given a check_in date and check_out date, return available properties.
   *
   * Returns [{ title, host_username, image, price_night, description, address },...]
   *
   **/
  static async getAvailableProperties(checkin_date, checkout_date) {
    const propertyRes = await db.query(`
        SELECT p.id,
               p.title,
               p.host_username,
               p.image,
               p.price_night,
               p.description,
               p.address
        FROM properties p
        LEFT JOIN bookings b ON p.id = b.property_id
        WHERE b.id IS NULL
            OR (b.checkout_date < $1 OR b.checkin_date > $2)
        ORDER BY p.id`, [checkin_date, checkout_date]);

    const properties = propertyRes.rows;

    return properties;
  }
}


module.exports = Property;