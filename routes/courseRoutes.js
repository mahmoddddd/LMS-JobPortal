const express = require("express");
const router = express.Router();
const {
  isAuth,
  isAdmin,
  isBoth, // admin and instructors
  isCourseOwner,
  restrictTo,
} = require("../middlewares/authMiddleware");
const {
  createCourse,
  getAllCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  courseByCategory,
  particularInstructorCourse,
  getInstructorCourses,
  getUserCourses,
} = require("../controllers/courseCtrl");

const upload = require("../middlewares/upload");

//  Create a course (Requires authentication + must be Instructor or Admin)
router.post(
  "/",
  isAuth,
  isBoth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createCourse
);
//  Get all courses (Public access)
router.get("/", isAuth, restrictTo("admin", "instructor"), getAllCourses);

//  Get courses by category (Public access)
router.get("/by-cat/:slug", courseByCategory);

//  Get courses by instructor ID (Public access)
router.get("/instructor/:id", particularInstructorCourse);

// Get My Courses As Instructor (Public access)
router.get("/my-courses", isAuth, isBoth, getInstructorCourses);

// Get My Courses As User (Public access)
router.get("/student-courses", isAuth, isBoth, getUserCourses);

//  Get a single course by slug (Public access)
router.get("/:slug", getCourseBySlug);

//  Update a course (Requires authentication + must be owner or Admin)
router.put("/:id", isAuth, isCourseOwner, updateCourse);

//  Delete a course (Requires authentication + must be Admin)
router.delete("/:id", isAuth, isCourseOwner, isAdmin, deleteCourse);

module.exports = router;
