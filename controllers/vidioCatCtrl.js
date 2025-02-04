const { default: slugify } = require("slugify");
const VidioCat = require("../models/vidioCatModel"); // Import the VidioCat model
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");

// POST - Create a Video Category
const postVidioCategory = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    // Assign the authenticated user's ID to the userId field
    req.body.userId = req.user._id;

    // Check if a category with the same title already exists
    const existingCategory = await VidioCat.findOne({ title: req.body.title });
    if (existingCategory) {
      return res.status(400).json({
        status: false,
        message: "Video Category already exists",
      });
    }

    // Create the category
    const category = await VidioCat.create(req.body);

    res.status(201).json({
      status: true,
      message: "Video Category Created Successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating Video category: " + error.message,
    });
  }
});

// GET - Get All Video Categories
const getAllVidioCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await VidioCat.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: "Video Categories Fetched Successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching Video categories: " + error.message,
    });
  }
});

// GET - Get a Single Video Category by Slug
const getAVidioCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      status: false,
      message: "Slug is required!",
    });
  }

  try {
    // Find the video category by slug
    const category = await VidioCat.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Video Category Not Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Video Category Retrieved Successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving video category: " + error.message,
    });
  }
});

// DELETE - Delete a Video Category by ID
const deleteVidioCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCategory = await VidioCat.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        status: false,
        message: "Video Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Video Category Deleted Successfully",
      deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting Video category: " + error.message,
    });
  }
});

// PUT - Update a Video Category by ID
const updateVidioCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    const updatedCategory = await VidioCat.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({
        status: false,
        message: "Video Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Video Category Updated Successfully",
      updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating Video category: " + error.message,
    });
  }
});

module.exports = {
  postVidioCategory,
  getAllVidioCategories,
  getAVidioCategory,
  deleteVidioCategory,
  updateVidioCategory,
};
