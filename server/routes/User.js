const express = require("express");
const router = express.Router();

// import controllers and middleware functions
const { login, signup, sendOTP, changePassword } = require("../controllers/Auth");
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword");
const { auth } = require("../middlewares/auth");

// Routes for login, signup, authentication

// **************************************************************************************************************
//                                      Authentication Routes
// **************************************************************************************************************

// Route for user login
router.post("/login", login);

// Route for user signup
router.post("/signup", signup);

// Route for sending OTP to the user's email
router.post("/sendOTP", sendOTP);

// Route for Changing the password
router.post("/changePassword", changePassword);

// **************************************************************************************************************
//                                      Reset Password
// **************************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);


// export router
module.exports = router;