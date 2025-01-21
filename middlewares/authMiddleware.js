const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const validateMongoDbId = require("../config/validateMongoDb");

// Middleware to check if the user is authenticated
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

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database and attach it to the request object
      req.user = await User.findById(decoded.id).select("-password");

      // If no user is found, throw an error
      if (!req.user) {
        res.status(404);
        throw new Error("User not found. Authentication failed.");
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      res.status(401);
      throw new Error(
        `Not authorized. Token verification failed: ${error.message}`
      );
    }
  } else {
    // If no token is found
    res.status(401);
    throw new Error(
      "Not authorized. No token provided in the request headers."
    );
  }
});

// Middleware to check if the user is an admin
const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.roles === "admin") {
    next(); // User is an admin, proceed
  } else if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized. Please log in to access this resource.");
  } else {
    res.status(403);
    throw new Error(
      "Access denied. You do not have the required admin privileges."
    );
  }
});

// Middleware to check if the user is an instructor
const isInstructor = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.roles === "instructor") {
    next(); // User is an instructor, proceed
  } else if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized. Please log in to access this resource.");
  } else {
    res.status(403);
    throw new Error(
      "Access denied. You do not have the required instructor privileges."
    );
  }
});

module.exports = { isAuth, isAdmin, isInstructor };
