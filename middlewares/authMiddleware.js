const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const isAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the token is in the headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(" ")[1];
      // console.log("Token extracted:", token); // Debuggs

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("Decoded token payload:", decoded); // Debugg

      // Find the user in the database and attach it to the request object
      const user = await User.findById(decoded.id).select("-password");
      // console.log("User found in database:", user); // Debugging

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found. Authentication failed.",
        });
      }

      req.user = user;
      //  console.log("User attached to request:", req.user); // Debugg
      next();
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: `Not authorized. Token verification failed: ${error.message}`,
      });
    }
  } else {
    // If no token is found
    return res.status(401).json({
      status: false,
      message: "Not authorized. No token provided in the request headers.",
    });
  }
});
// Middleware to check if the user is an admin
const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.roles === "admin") {
    next(); // User is an admin, proceed
  } else if (!req.user) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized. Please log in to access this resource.",
    });
  } else {
    return res.status(403).json({
      status: false,
      message: "Access denied. You do not have the required admin privileges.",
    });
  }
});

// Middleware to check if the user is an instructor
const isInstructor = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.roles === "instructor") {
    next(); // User is an instructor, proceed
  } else if (!req.user) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized. Please log in to access this resource.",
    });
  } else {
    return res.status(403).json({
      status: false,
      message:
        "Access denied. You do not have the required instructor privileges.",
    });
  }
});

module.exports = { isAuth, isAdmin, isInstructor };
