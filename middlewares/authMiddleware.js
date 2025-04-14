const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const TokenBlacklist = require("../models/tokenBlackListModel");

// Base Authentication Middleware
const isAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      // Check token blacklist
      const blacklisted = await TokenBlacklist.findOne({ token });
      if (blacklisted) {
        return res.status(401).json({
          status: false,
          message: "Session expired. Please log in again.",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      // Check if user has an active session (refreshToken exists)
      if (!user.refreshToken) {
        return res.status(401).json({
          status: false,
          message: "Session expired. Please log in again.",
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        status: false,
        message: `Authentication failed: ${error.message}`,
      });
    }
  } else {
    res.status(401).json({
      status: false,
      message: "No authentication token provided",
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

const isBoth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized. Please log in.",
    });
  }

  // Fetch the user's roles from the database (if not already available in req.user)
  const user = await User.findById(req.user._id).select("roles");

  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found.",
    });
  }

  // Check if the user has either "admin" or "instructor" role
  if (!user.roles.includes("admin") && !user.roles.includes("instructor")) {
    return res.status(403).json({
      status: false,
      message:
        "Access denied. You do not have the required instructor or admin privileges.",
    });
  }

  // If the user has the required role, proceed to the next middleware/route handler
  next();
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

// Middleware to check course ownership
const Course = require("../models/courseModel");
const isCourseOwner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({
      status: false,
      message: "Course not found.",
    });
  }

  if (
    course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      status: false,
      message: "You are not authorized to modify this course.",
    });
  }

  next();
});

// Middleware to check course category ownership
const CourseCat = require("../models/courseCategoryModel");
const isCourseCatOwner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const courseCat = await CourseCat.findById(id);
  if (!courseCat) {
    return res.status(404).json({
      status: false,
      message: "Course Category not found.",
    });
  }

  if (
    courseCat.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      status: false,
      message: "You are not authorized to modify this course category.",
    });
  }

  next();
});

const restrictTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. Please log in to access this resource.",
      });
    }

    if (!roles.some((role) => req.user.roles.includes(role))) {
      return res.status(403).json({
        status: false,
        message: "Access denied. You do not have the required privileges.",
      });
    }

    next();
  });
};

// Middleware to check blog ownership
const Blog = require("../models/blogModel");
const isBlogOwner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ status: false, message: "Blog not found" });
  }
  if (req.user.id !== blog.userId.toString() && req.user.roles !== "admin") {
    return res.status(403).json({
      status: false,
      message: "You are not authorized to modify this blog.",
    });
  }

  next();
});

module.exports = isBlogOwner;

module.exports = {
  isAuth,
  isAdmin,
  isInstructor,
  isBoth,
  isCourseOwner,
  isCourseCatOwner,
  isBlogOwner,
  restrictTo,
};
