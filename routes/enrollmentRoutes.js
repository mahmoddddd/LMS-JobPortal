const express = require("express");
const {
  enrollInCourse,
  paymentWebhook,
  checkEnrollment,
} = require("../controllers/enrollmentCtrl");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

//  Route to enroll in a course
router.post("/enroll", isAuth, enrollInCourse);

//  Stripe Webhook (Public - Stripe will call this)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook
);

// Check if a user is enrolled
router.get("/check/:courseId", isAuth, checkEnrollment);

module.exports = router;
