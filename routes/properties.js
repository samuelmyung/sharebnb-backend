"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const Property = require("../models/property");

const propertyNewSchema = require("../schemas/propertyNew.json");
const propertyUpdateSchema = require("../schemas/propertyUpdate.json");
// const propertyFilterSchema = require("../schemas/propertyFilter.json");

//TODO: might not need new
const router = new express.Router();
require('dotenv').config();
const { uploadImage, s3, PutObjectCommand } = require("../middleware/uploadImage");



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


/** POST / { property } =>  { property }
 *
 * property should be { title, host_username, image, price_night, description, address }
 *
 * Returns { id, title, host_username, image, price_night, description, address }
 *
 * Authorization required: host
 */

router.post("/", async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    propertyNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const property = await Property.create(req.body);
  return res.status(201).json({ property });
});

/** GET /  =>
 *   { properties: [ { title, host_username, image, price_night, description, address }, ...] }
  *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  const properties = await Property.getAll();
  return res.json({ properties });
});

/** GET /  => Property by property id
 *   { property:  { title, host_username, image, price_night, description, address }
  *
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
  const property = await Property.get(req.params.id);
  return res.json(property);
});

/** POST /  => Property by property id
 *   { property:  { title, host_username, image, price_night, description, address }
  *
 * Authorization required: none
 */
router.patch("/:id", async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    propertyUpdateSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const property = await Property.update(req.params.id, req.body);
  return res.json({ property });
});

/** GET /  => Given checkin_date and check_out date,
 * Return all available properties:
 *   [{ title, host_username, image, price_night, description, address },...]
  *
 * Authorization required: none
 */
router.get("/:checkin_date/:checkout_date", async function (req, res, next) {
  console.log("DATES!", req.params);
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;
  // console.log(checkin_date, checkout_date);
  const properties = await Property.getAvailableProperties(startDate, endDate);
  return res.json(properties);
});


/** DELETE /  => Property by property id
 *   { property:  { title, host_username, image, price_night, description, address }
  *
 * Authorization required: none
 */
router.delete("/:id", async function (req, res, next) {
  await Property.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;
