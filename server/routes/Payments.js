const express = require("express");
const router = express.Router();

// import controllers and middlewares
const { capturePayment, verifySignature, sendPaymentSuccessEmail } = require("../controllers/Payments")
const { auth, isStudent } = require("../middlewares/auth");

// routes
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", verifySignature);
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

// export router
module.exports = router;