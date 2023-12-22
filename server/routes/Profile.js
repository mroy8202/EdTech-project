const express = require("express");
const router = express.Router();

// import controllers and middleware functions
const { auth } = require("../middlewares/auth");
const { updateProfile, deleteAccount, getAllUserDetails, updateDisplayPicture, getEnrolledCourses } = require("../controllers/Profile");

// **************************************************************************************************************
//                                          Profile Routes
// **************************************************************************************************************

// delete user account
router.delete("/deleteProfile", deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

// export router
module.exports = router;