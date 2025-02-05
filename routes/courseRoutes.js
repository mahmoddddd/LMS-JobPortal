const express = require("express");
const router = express.Router();
const {
  isAuth,
  isAdmin,
  isBoth, // admin and instructors
} = require("../middlewares/authMiddleware");
const {
  createCourse,
  getAllCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseCtrl");

// POST - Create a Course (Only Admin or Instructors can create)
router.post("/", isAuth, isBoth, createCourse);

// GET - Get All Courses (Public access)
router.get("/", getAllCourses);

// GET - Get a Single Course by Slug (Public access)
router.get("/:slug", getCourseBySlug);

// PUT - Update a Course by ID (Only Admin or Instructors can update)
router.put("/:id", isAuth, isBoth, updateCourse);

// DELETE - Delete a Course by ID (Only Admin can delete)
router.delete("/:id", isAuth, isAdmin, deleteCourse);

module.exports = router;
