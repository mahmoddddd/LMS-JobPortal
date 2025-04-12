const express = require("express");
const {
  enrollInCourse,
  paymentWebhook,
  checkEnrollment,
  paymentSuccessHandler,
} = require("../controllers/enrollmentCtrl");
const { isAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Enroll in course
router.post("/enroll", isAuth, enrollInCourse);

// Stripe Webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook
);

// Check if user is enrolled
router.get("/check/:courseId", isAuth, checkEnrollment);

// Handle payment success
router.get("/payment-success", paymentSuccessHandler);

module.exports = router;
