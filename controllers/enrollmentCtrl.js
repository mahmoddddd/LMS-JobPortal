const Enrollment = require("../models/enrollmentModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const Course = require("../models/courseModel");
const User = require("../models/userModel");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Payment gateway

const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user._id;

  // ✅ Check if the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // ✅ Check if the user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });
  if (existingEnrollment) {
    res.status(400);
    throw new Error("You are already enrolled in this course");
  }

  // ✅ If the course is FREE, enroll the user immediately
  if (course.price === 0) {
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentStatus: "paid",
    });

    return res
      .status(200)
      .json({ message: "You have been enrolled successfully", enrollment });
  }

  //  If the course is PAID, create a Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // Accepts card payments
    mode: "payment",
    customer_email: req.user.email, // Send receipt to user email
    line_items: [
      {
        price_data: {
          currency: "usd", // Currency in USD
          product_data: { name: course.title }, // Course title
          unit_amount: course.price * 100, // Convert price to cents
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`, // Redirect on success
    cancel_url: `${process.env.CLIENT_URL}/payment-failed`, // Redirect on failure

    metadata: { userId: userId.toString(), courseId: courseId.toString() },
  });

  res.json({ url: session.url });
});

const paymentWebhook = async (req, res) => {
  console.log("🔔 Webhook received!", req.body);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Event type:", event.type);

  if (event.type === "checkout.session.completed") {
    console.log("🎉 Payment successful, enrolling user...");
    const session = event.data.object;
    console.log("Session Data:", session);
  }

  res.json({ received: true });
};

const checkEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  //  Check if the user is enrolled
  const enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });

  if (!enrollment || enrollment.paymentStatus !== "paid") {
    res.status(403);
    throw new Error("You are not enrolled in this course.");
  }

  res.json({ message: "Access granted" });
});

module.exports = { enrollInCourse, paymentWebhook, checkEnrollment };
