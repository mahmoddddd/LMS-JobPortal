const asyncHandler = require("express-async-handler");
const Course = require("../models/courseModel");
const slugify = require("slugify");
const mongoose = require("mongoose");
const courseCat = require("../models/courseCategoryModel");
const User = require("../models/userModel");
const validateMongoDbId = require("../config/validateMongoDb");

const uploadToCloudinary = require("../services/cloudinary");

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, isPublished } = req.body;

  const price = Number(req.body.price);
  const totalHours = Number(req.body.totalHours);
  const totleRating = req.body.totleRating ? Number(req.body.totleRating) : 0;

  const slug = slugify(title.toLowerCase());
  const existingCourse = await Course.findOne({ slug });
  if (existingCourse) {
    return res.status(400).json({
      status: false,
      message: "Course with this title already exists.",
    });
  }

  const instructor = req.user.id;

  // upload image for course
  let imageUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  if (req.files && req.files.image && req.files.image[0]) {
    imageUrl = await uploadToCloudinary(
      req.files.image[0].path,
      "lms/courses/images"
    );
  }

  // upload intro course video
  let videoUrl = null;
  if (req.files && req.files.video && req.files.video[0]) {
    videoUrl = await uploadToCloudinary(
      req.files.video[0].path,
      "lms/courses/videos"
    );
  }

  const newCourse = await Course.create({
    title,
    slug,
    description,
    category,
    instructor,
    price,
    image: imageUrl,
    video: videoUrl,
    isPublished: isPublished || false,
    totalHours,
    totleRating: totleRating || 0,
  });

  res.status(201).json({
    status: true,
    message: "Course created successfully.",
    course: newCourse,
    instructor,
  });
});

// GET - Get All Courses (with pagination)
const getAllCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const courses = await Course.find({ deletedAt: null })
    .skip(skip)
    .limit(limit);
  //  .populate("instructor category");
  const totalCourses = await Course.countDocuments({ deletedAt: null });

  res.status(200).json({
    status: true,
    message: "Courses fetched successfully.",
    data: {
      courses,
      totalCourses,
      page,
      totalPages: Math.ceil(totalCourses / limit),
    },
  });
});

// Get User Courses
const getUserCourses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  validateMongoDbId(userId);

  const courses = await Course.find({
    deletedAt: null,
    students: userId,
  });

  res.status(200).json({
    status: true,
    message: "User courses fetched successfully.",
    data: {
      courses,
    },
  });
});

// GET - Get a Single Course by Slug
const getCourseBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const course = await Course.findOne({ slug })
    .populate("instructor", "firstname  email ")
    .populate("category", "title");

  if (!course) {
    return res.status(404).json({
      status: false,
      message: "Course not found.",
    });
  }

  res.status(200).json({
    status: true,
    message: "Course fetched successfully.",
    course: {
      ...course.toObject(),
    },
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const { title, description, category, price, isPublished } = req.body;

  let course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({
      status: false,
      message: "Course not found.",
    });
  }

  // Generate a new slug if the title is changed
  let slug = course.slug;
  if (title && title !== course.title) {
    slug = slugify(title.toLowerCase());

    // if the title is changed, check if a course with the new slug already exists
    const existingCourse = await Course.findOne({ slug, _id: { $ne: id } });
    if (existingCourse) {
      return res.status(400).json({
        status: false,
        message: "Course with this title already exists.",
      });
    }
  }

  // Update the course with the new data
  course.title = title || course.title;
  course.slug = slug;
  course.description = description || course.description;
  course.category = category || course.category;
  course.price = price !== undefined ? price : course.price;
  course.isPublished =
    isPublished !== undefined ? isPublished : course.isPublished;

  await course.save();

  res.status(200).json({
    status: true,
    message: "Course updated successfully.",
    course,
  });
});

// DELETE - Delete a Course
const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  // search about course
  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({
      status: false,
      message: "Course not found.",
    });
  }
  if (course.deletedAt) {
    return res.status(400).json({
      status: false,
      message: "Course already deleted.",
    });
  }
  course.deletedAt = new Date();
  await course.save();

  res.status(200).json({
    status: true,
    message: "Course deleted successfully.",
  });
});

// Get all Courses By Category
const courseByCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await courseCat.findOne({ slug });
  if (!category) {
    return res.status(404).json({
      status: false,
      message: "Category not found.",
    });
  }

  const courses = await Course.find({ category: category._id });

  res.status(200).json({
    status: true,
    message: "Courses fetched successfully.",
    data: courses,
    deletedAt: null,
  });
});

// Get Pariquler instructor Course
const particularInstructorCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const instructor = await User.findById(id);
  if (!instructor || !["instructor", "admin"].includes(instructor.roles)) {
    return res.status(404).json({
      status: false,
      message: "Instructor not found.",
    });
  }

  const courses = await Course.find({
    instructor: instructor._id,
    deletedAt: null,
  });

  res.status(200).json({
    status: true,
    message: "Courses fetched successfully.",
    data: courses,
    totalCourses: courses.length,
  });
});

const getInstructorCourses = asyncHandler(async (req, res) => {
  // Get the authenticated instructor
  const instructorAccount = req.user;

  // Ensure the user has an instructor or admin role
  if (
    !instructorAccount ||
    !["instructor", "admin"].includes(instructorAccount.roles)
  ) {
    return res.status(403).json({
      status: false,
      message: "Access denied. Only instructors and admins can view courses.",
    });
  }

  try {
    // Retrieve courses assigned to the instructor
    const assignedCourses = await Course.find({
      instructor: instructorAccount._id,
      deletedAt: null,
    });

    res.status(200).json({
      status: true,
      message: "Instructor courses retrieved successfully.",
      data: assignedCourses,
      totalCourses: assignedCourses.length,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
    });
  }
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseBySlug,
  getUserCourses,
  updateCourse,
  deleteCourse,
  courseByCategory,
  particularInstructorCourse,
  getInstructorCourses,
};
