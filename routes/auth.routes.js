const router = require("express").Router();
const mongoose = require("mongoose");

// Handles password encryption
const bcryptjs = require("bcryptjs");
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// require (import) middleware functions
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

// Import the cloudinary configuration
const fileUploader = require('../config/cloudinary.config');

////////////////////////////////////////////////////////////////////////
///////////////////////////// SIGNUP ///////////////////////////////////
////////////////////////////////////////////////////////////////////////

// .get() route ==> to display the signup form to users
router.get("/signup", isLoggedOut, (req, res) => res.render("auth/signup"));

// .post() route ==> to process form data
router.post("/signup", isLoggedOut, fileUploader.single('profilePic'), (req, res, next) => {
  const { username, email, password } = req.body;

  // Validate mandatory fields
  if (!username || !email || !password) {
    res.render("auth/signup", {
      errorMessage: "All fields are mandatory. Please provide your username, email and password."
    });
    return;
  }

  // Validate password strength
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }

  // Hash the password and create a new user
  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        passwordHash: hashedPassword,
        profilePic: req.file ? req.file.path : '/images/default-profile.png' // Save profile picture URL or default
      });
    })
    .then((userFromDB) => {
      res.redirect("/user-profile");
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage: "Username and email need to be unique. Either username or email is already used."
        });
      } else {
        next(error);
      }
    });
});

////////////////////////////////////////////////////////////////////////
///////////////////////////// LOGIN ////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// .get() route ==> to display the login form to users
router.get("/login", isLoggedOut, (req, res) => res.render("auth/login"));

// .post() login route ==> to process form data
router.post("/login", isLoggedOut, (req, res, next) => {
  const { email, password } = req.body;

  // Validate mandatory fields
  if (email === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, email and password to login."
    });
    return;
  }

  // Find user by email and validate password
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.render("auth/login", { errorMessage: "Email is not registered. Try with other email." });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user;
        res.redirect("/user-profile");
      } else {
        res.render("auth/login", { errorMessage: "Incorrect password." });
      }
    })
    .catch((error) => next(error));
});

////////////////////////////////////////////////////////////////////////
///////////////////////////// LOGOUT ///////////////////////////////////
////////////////////////////////////////////////////////////////////////

// .post() route ==> to log out the user
router.post("/logout", isLoggedIn, (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// .get() route ==> to display the user profile
router.get("/user-profile", isLoggedIn, (req, res) => {
  res.render("users/user-profile", { user: req.session.currentUser }); // Pass the user data to the profile view
});

module.exports = router;
