const express = require("express");
const router = express.Router();
const {
  isAuth,
  isAdmin,
  isBoth, // admin and instructors
} = require("../middlewares/authMiddleware");
const {
  postCourseCategory,
  getAllCourseCategories,
  getACourseCategory,
  deleteCourseCategory,
  updateCourseCategory,
} = require("../controllers/courseCatCtrl");

// POST - Create a Course Category (Only Admin or Instructors can create)
router.post("/", isAuth, isBoth, postCourseCategory);

// GET - Get All Course Categories (Public access)
router.get("/all", getAllCourseCategories);

// GET - Get a Single Course Category by Slug (Public access)
router.get("/:slug", getACourseCategory);

// DELETE - Delete a Course Category by ID (Only Admin can delete)
router.delete("/:id", isAuth, isAdmin, deleteCourseCategory);

// PUT - Update a Course Category by ID (Only Admin or Instructors can update)
router.put("/:id", isAuth, isBoth, updateCourseCategory);

module.exports = router;
