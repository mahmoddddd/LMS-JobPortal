const { default: slugify } = require("slugify");
const DocCat = require("../models/docCatModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");

// POST - Create a Document Category
const postDocCategory = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    // Assign the authenticated user's ID to the userId field
    req.body.userId = req.user._id;

    // Check if a category with the same title already exists
    const existingCategory = await DocCat.findOne({ title: req.body.title });
    if (existingCategory) {
      return res.status(400).json({
        status: false,
        message: "Category already exists",
      });
    }

    // Create the category
    const category = await DocCat.create(req.body);

    res.status(201).json({
      status: true,
      message: "Category Created Successfully",
      userId: category.userId,
      category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating category: " + error.message,
    });
  }
});

// GET - Get All Document Categories
const getAllDocCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await DocCat.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: "Categories Fetched Successfully",
      categories, // Removed unnecessary array wrapping
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching categories: " + error.message,
    });
  }
});

// GET - Get a Single Doc Category by Slug
const getADocCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params; // Use slug instead of title

  if (!slug) {
    return res.status(400).json({
      status: false,
      message: "Slug is required!",
    });
  }

  try {
    // Find the document  category by slug
    const doc = await DocCat.findOne({ title: slug });

    if (!doc) {
      return res.status(404).json({
        status: false,
        message: "Doc Not Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Doc Retrieved Successfully",
      doc,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving Doc: " + error.message,
    });
  }
});
// DELETE - Delete a Document Category by ID
const deleteDocCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCategory = await DocCat.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Category Deleted Successfully",
      deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting category: " + error.message,
    });
  }
});

// PUT - Update a Document Category by ID
const updateDocCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    const updatedCategory = await DocCat.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Category Updated Successfully",
      updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating category: " + error.message,
    });
  }
});

module.exports = {
  postDocCategory,
  getAllDocCategories,
  getADocCategory,
  deleteDocCategory,
  updateDocCategory,
};
