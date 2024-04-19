"use strict";

/** Routes for users. */
const express = require("express");
const jsonschema = require("jsonschema");
const { ensureCorrectUser } =
  require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const userNewSchema = require("../schemas/userNew.json");

const router = express.Router();


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, email, isHost }
 *
 * Authorization required: current user or Host
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const user = await User.get(req.params.username);
  return res.json({ user });
});


// /** PATCH /[username] { user } => { user }
//  *
//  * Data can include:
//  *   { firstName, lastName, password, email }
//  *
//  * Returns { username, firstName, lastName, email, isHost }
//  *
//  * Authorization required: current user or Host
//  **/

// router.patch("/:username", ensureCorrectUserOrHost, async function (req, res, next) {
//   const validator = jsonschema.validate(
//     req.body,
//     userUpdateSchema,
//     { required: true },
//   );
//   if (!validator.valid) {
//     const errs = validator.errors.map(e => e.stack);
//     throw new BadRequestError(errs);
//   }

//   const user = await User.update(req.params.username, req.body);
//   return res.json({ user });
// });


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: current user or Host
 **/

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  await User.remove(req.params.username);
  return res.json({ deleted: req.params.username });
});


module.exports = router;
