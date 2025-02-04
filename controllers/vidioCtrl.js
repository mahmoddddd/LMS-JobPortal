const { default: slugify } = require("slugify");
const Vidio = require("../models/vidioModel");
const VidioCat = require("../models/vidioCatModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const mongoose = require("mongoose");
const postVidio = asyncHandler(async (req, res) => {
  try {
    const { title, description, video_Url, categoryId, keywords } = req.body;

    if (!title || !description || !video_Url || !categoryId || !keywords) {
      return res.status(400).json({
        status: false,
        message: "All fields are required!",
      });
    }

    // Validate if category is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid category ID",
      });
    }

    if (!Array.isArray(keywords)) {
      return res.status(400).json({
        status: false,
        message: "Keywords must be an array",
      });
    }
    // Generate a slug from the title
    req.body.slug = slugify(title.toLowerCase());

    // Assign the user ID from the authenticated request
    req.body.userId = req.user._id;

    const vidio = await Vidio.create({ ...req.body, category: categoryId });

    res.status(201).json({
      status: true,
      message: "Vidio Posted Successfully",
      category: categoryId,
      vidio,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error posting vidio: " + error.message,
    });
  }
});

// Get A Vidio
const getAvidio = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    throw new Error("title form IS Required please Enter the title");
  }
  try {
    const vidio = await Vidio.findOne({ slug: slug });
    if (!vidio) {
      throw new Error("Vidio Not Found");
    }
    res
      .status(200)
      .json({ status: true, message: "Vidio Getting successfully", vidio });
  } catch (error) {
    throw new Error(error);
  }
});

// Get All Vidios

const getAllVidios = asyncHandler(async (req, res) => {
  try {
    const vidio = await Vidio.find();
    if (!vidio) {
      throw new Error("Vidio Not Found");
    }
    res
      .status(200)
      .json({ status: true, message: "All Vidio Getting successfully", vidio });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a Vidio
const deletVidio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const vidio = await Vidio.findByIdAndDelete(id);
    if (!vidio) {
      throw new Error("Vidio Not Found");
    }
    res
      .status(200)
      .json({ status: true, message: "Vidio Deleted successfully", vidio });
  } catch (error) {
    throw new Error(error);
  }
});

// update A Vidio
const updateVidio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }
    const vidio = await Vidio.findByIdAndUpdate(id, req.body, { new: true });

    if (!vidio) {
      return res.status(404).json({
        status: false,
        message: "Vidio Not Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Vidio updated successfully",
      vidio,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating video: " + error.message,
    });
  }
});

module.exports = {
  postVidio,
  getAvidio,
  getAllVidios,
  deletVidio,
  updateVidio,
};
