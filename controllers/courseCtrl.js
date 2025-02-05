const asyncHandler = require("express-async-handler");
const Course = require("../models/courseModel");
const slugify = require("slugify");
const mongoose = require("mongoose");
const courseCat = require("../models/courseCategoryModel");

const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    price,
    image,
    totalHours,
    isPublished,
    totleRating,
  } = req.body;

  // Validate required fields
  if (!title || !description || !category || price === undefined) {
    return res.status(400).json({
      status: false,
      message:
        "All fields are required: title, description, category, price, totalHours.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({
      status: false,
      message: "Invalid category ID.",
    });
  }

  const courseCategory = await courseCat.findById(category);
  if (!courseCategory) {
    return res.status(400).json({
      status: false,
      message: "Invalid category ID.",
    });
  }

  // Validate price (must be a non-negative number)
  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({
      status: false,
      message: "Price must be a non-negative number.",
    });
  }

  // Validate totalHours (must be a positive number)
  if (typeof totalHours !== "number" || totalHours <= 0) {
    return res.status(400).json({
      status: false,
      message: "Total hours must be a positive number.",
    });
  }

  // Validate totalRating (if provided, must be a non-negative number)
  if (
    totleRating !== undefined &&
    (typeof totleRating !== "number" || totleRating < 0)
  ) {
    return res.status(400).json({
      status: false,
      message: "Total rating must be a non-negative number.",
    });
  }

  // Generate a slug from the course title
  const slug = slugify(title.toLowerCase());

  // Check if a course with the same slug (title) already exists
  const existingCourse = await Course.findOne({ slug });
  if (existingCourse) {
    return res.status(400).json({
      status: false,
      message: "Course with this title already exists.",
    });
  }

  // Create the new course
  const newCourse = await Course.create({
    title,
    slug,
    description,
    instructor: req.user._id, // Associate the course with the logged-in user
    category,
    price,
    image: image || "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Default image if not provided
    isPublished: isPublished || false, // Default to unpublished if not provided
    totalHours,
    totleRating: totleRating || 0, // Default to 0 if not provided
  });

  // Return success response with the created course
  res.status(201).json({
    status: true,
    message: "Course created successfully.",
    course: newCourse,
  });
});

// GET - Get All Courses (with pagination)
const getAllCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const courses = await Course.find({ deletedAt: null })
    .skip(skip)
    .limit(limit)
    .populate("instructor category");

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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: false,
      message: "Invalid course ID.",
    });
  }

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

module.exports = {
  createCourse,
  getAllCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
};
