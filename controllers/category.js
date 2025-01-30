const { default: slugify } = require("slugify");
const tutCategory = require("../models/tutCategory");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");

const postTutorialCategory = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    // Assign the authenticated user's ID to the userId field
    req.body.userId = req.user._id;
    const tutCat = await tutCategory.findOne({ title: req.body.title });
    if (tutCat) {
      return res.status(400).json({
        status: false,
        message: "Category already exists",
      });
    }
    const category = await tutCategory.create(req.body);
    res.status(201).json({
      status: true,
      message: "Category Created Successfully",
      userId: category.userId,
      category,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllTutCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await tutCategory.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: "Categories Fetched Successfully",
      AllCat: [categories],
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getATutorialCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const category = await tutCategory.findById(id);
    res.status(200).json({
      status: true,
      message: "Category Fetched Successfully",
      category,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await tutCategory.findByIdAndDelete(id);
    res.status(200).json({
      status: true,
      message: "Category Deleted Successfully",
      deletedCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }
    const updatedCategory = await tutCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: true,
      message: "Category Updateds Successfully",
      updatedCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  postTutorialCategory,
  getAllTutCategories,
  getATutorialCategory,
  deleCategory,
  updateCategory,
};
