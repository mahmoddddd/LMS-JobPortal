const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../config/validateMongoDb");
const Tag = require("../../models/qna/tagModel");
const ApiFeatures = require("../../utils/apiFeatures");

// Create a new tag
const createTag = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const tag = await Tag.create({ name, description });
  res.status(201).json(tag);
});

// Get all tags with sorting, filtering, and pagination
const getAllTags = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Tag.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tags = await features.query;
  res.json(tags);
});

// Get a single tag by ID
const getTagById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const tag = await Tag.findById(id);
  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  res.json(tag);
});

// Update a tag
const updateTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const user = req.user;

  validateMongoDbId(id);

  const tag = await Tag.findById(id);
  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  if (!user.roles.includes("admin")) {
    res.status(403);
    throw new Error("You are not authorized to update this tag");
  }

  const updatedTag = await Tag.findByIdAndUpdate(
    id,
    { name, description },
    { new: true }
  );

  res.json(updatedTag);
});

// Delete a tag
const deleteTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  validateMongoDbId(id);

  const tag = await Tag.findById(id);
  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  if (!user.roles.includes("admin")) {
    res.status(403);
    throw new Error("You are not authorized to delete this tag");
  }

  await Tag.findByIdAndDelete(id);
  res.json({ message: "Tag deleted successfully" });
});

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
};
