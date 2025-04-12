const Enrollment = require("../models/enrollmentModel");
const asyncHandler = require("express-async-handler");
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Enroll in course
const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user._id;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });
  if (existingEnrollment) {
    res.status(400);
    throw new Error("You are already enrolled in this course");
  }

  // Free course
  if (course.price === 0 || course.isFree) {
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentStatus: "paid",
    });

    const user = await User.findById(userId);
    user.enrolledCourses.push(enrollment._id);
    await user.save();

    course.students.push(userId);
    course.enrolled += 1;
    await course.save();

    return res
      .status(200)
      .json({ message: "Enrolled successfully", enrollment });
  }

  // Paid course - create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: course.title },
          unit_amount: course.price * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `http://localhost:4000/api/enroll/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
    metadata: {
      userId: userId.toString(),
      courseId: courseId.toString(),
    },
  });

  res.json({ url: session.url });
});

// Webhook
const paymentWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const courseId = session.metadata.courseId;

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentStatus: "paid",
    });

    const user = await User.findById(userId);
    user.enrolledCourses.push(enrollment._id);
    await user.save();

    const course = await Course.findById(courseId);
    course.students.push(userId);
    course.enrolled += 1;
    await course.save();

    console.log("Enrollment done via webhook.");
  }

  res.json({ received: true });
};

// Check enrollment
const checkEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

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

// Payment Success handler
const paymentSuccessHandler = async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).send("Missing session_id");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata.userId;
    const courseId = session.metadata.courseId;

    const existing = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!existing) {
      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        paymentStatus: "paid",
      });

      const user = await User.findById(userId);
      user.enrolledCourses.push(enrollment._id);
      await user.save();

      const course = await Course.findById(courseId);
      course.students.push(userId);
      course.enrolled += 1;
      await course.save();
    }
    // info about the course
    const course = await Course.findById(courseId).populate(
      "instructor",
      "firstname lastname"
    );
    const user = await User.findById(userId);

    const formattedDate = new Date(course.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
      }
      h1 {
        color: #4CAF50;
      }
      .course-info {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
      }
      .btn {
        display: inline-block;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <h1>Payment Successful!</h1>
    <p>Thank you, ${user.firstname}, for your payment. You have been successfully enrolled in the course.</p>
    
    <div class="course-info">
      <h2>${course.title}</h2>
      <p><strong>Instructor:</strong> ${course.instructor.firstname} ${course.instructor.lastname}</p>
      <p><strong>Description:</strong> ${course.description}</p>
      <p><strong>Price:</strong> $${course.price}</p>
      <p><strong>Enrollment Date:</strong> ${formattedDate}</p>
    </div>
    
    <a href="${process.env.CLIENT_URL}/my-courses" class="btn">Go to My Courses</a>
    
    <p>An enrollment confirmation has been sent to your email: ${user.email}</p>
  </body>
  </html>
`);
  } catch (error) {
    console.error("Payment success handler error:", error);
    res.status(500).send(`
      <h1>Error Processing Payment</h1>
      <p>There was an error processing your payment. Please contact support.</p>
    `);
  }
};

module.exports = {
  enrollInCourse,
  paymentWebhook,
  checkEnrollment,
  paymentSuccessHandler,
};
