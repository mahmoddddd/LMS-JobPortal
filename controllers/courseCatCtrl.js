const { default: slugify } = require("slugify");
const CourseCategory = require("../models/courseCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");

// POST - Create a Course Category
const postCourseCategory = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    // Assign the authenticated user's ID to the userId field
    req.body.userId = req.user._id;

    // Check if a category with the same title already exists
    const existingCategory = await CourseCategory.findOne({
      title: req.body.title,
    });
    if (existingCategory) {
      return res.status(400).json({
        status: false,
        message: "Course Category already exists",
      });
    }

    // Create the category
    const category = await CourseCategory.create(req.body);

    res.status(201).json({
      status: true,
      message: "Course Category Created Successfully",
      //    userId: category.userId,
      category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating Course category: " + error.message,
    });
  }
});

// GET - Get All Course Categories
const getAllCourseCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await CourseCategory.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: "Course Categories Fetched Successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching Course categories: " + error.message,
    });
  }
});

// GET - Get a Single Course Category by Slug
const getACourseCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      status: false,
      message: "Slug is required!",
    });
  }

  try {
    // Find the course category by slug
    const category = await CourseCategory.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Course Category Not Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Course Category Retrieved Successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving Course category: " + error.message,
    });
  }
});

// DELETE - Delete a Course Category by ID
const deleteCourseCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCategory = await CourseCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        status: false,
        message: "Course Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Course Category Deleted Successfully",
      deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting Course category: " + error.message,
    });
  }
});

// PUT - Update a Course Category by ID
const updateCourseCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    const updatedCategory = await CourseCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        status: false,
        message: "Course Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Course Category Updated Successfully",
      updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating Course category: " + error.message,
    });
  }
});

module.exports = {
  postCourseCategory,
  getAllCourseCategories,
  getACourseCategory,
  deleteCourseCategory,
  updateCourseCategory,
};
