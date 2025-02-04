const { default: slugify } = require("slugify");
const BlogCat = require("../models/blogCatModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");

// POST - Create a Document Category
const postBlogCategory = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    // Assign the authenticated user's ID to the userId field
    req.body.userId = req.user._id;

    // Check if a category with the same title already exists
    const existingCategory = await BlogCat.findOne({ title: req.body.title });
    if (existingCategory) {
      return res.status(400).json({
        status: false,
        message: "Blog Category already exists",
      });
    }

    // Create the category
    const category = await BlogCat.create(req.body);

    res.status(201).json({
      status: true,
      message: "Blog Category Created Successfully",
      userId: category.userId,
      category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating Blog category: " + error.message,
    });
  }
});

// GET - Get All Document Categories
const getAllBlogCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await BlogCat.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: "Blog Categories Fetched Successfully",
      categories, // Removed unnecessary array wrapping
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching Blog categories: " + error.message,
    });
  }
});

// GET - Get a Single Doc Category by Slug
const getABlogCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params; // Use slug instead of title

  if (!slug) {
    return res.status(400).json({
      status: false,
      message: "Slug is required!",
    });
  }

  try {
    // Find the document  category by slug
    const blog = await BlogCat.findOne({ slug: slug });

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog Not Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog Category Retrieved Successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving blog category: " + error.message,
    });
  }
});
// DELETE - Delete a Document Category by ID
const deleteBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCategory = await BlogCat.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        status: false,
        message: "Blog Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog Category Deleted Successfully",
      deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting Blog category: " + error.message,
    });
  }
});

// PUT - Update a Document Category by ID
const updateBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    const updatedCategory = await BlogCat.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({
        status: false,
        message: "Blog Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog Category Updated Successfully",
      updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating Blog category: " + error.message,
    });
  }
});

module.exports = {
  postBlogCategory,
  getAllBlogCategories,
  getABlogCategory,
  deleteBlogCategory,
  updateBlogCategory,
};
