"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureAdmin, isUser, isAdminOrUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { application } = require("express");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: Admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: Admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: user or admin
 **/

router.get("/:username", isAdminOrUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    const applications = await User.getApplications(req.params.username);
    user.applications = applications;
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required:  user or admin
 **/

router.patch("/:username", isAdminOrUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required:  user or admin
 **/

router.delete("/:username", isAdminOrUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});


/** POST /[username]/apply/[id] 
 * 
 * Applies user with username to job with id.
 * 
 * Throws NotFound if either username or id is not found
 * 
 * Authorization required:  user or admin
*/
router.post("/:username/apply/:id", isAdminOrUser, async function(req, res, next){
  try{
    const {username, id} = req.params;await User.apply(username, id)
    return res.json({message: `${username} applied to job with id of ${id}`})
  }catch(e){
    next(e)
  }
})

/**GET /[username]/apply 
 * 
 * Returns all jobs user has applied for
 * 
 * Authorization required:  user or admin
*/
router.get("/:username/apply", isAdminOrUser, async function(req, res, next){
  try{
    const applications = await User.getApplications(req.params.username);
    return res.json({applications})
  }catch(e){
    next(e)
  }
})


module.exports = router;
