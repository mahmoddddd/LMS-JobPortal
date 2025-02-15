const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ProjectCategory = require("../models/projectCatModel");
const validateMongoDbId = require("../config/validateMongoDb");
const APIFeatures = require("../utils/apiFeatures");

// Create a new project category
const postProjectCat = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      status: false,
      message: "Title is required to create a project category",
    });
  }

  let slug = slugify(title.toLowerCase());

  // Ensure the slug is unique
  let count = 1;
  while (await ProjectCategory.exists({ slug })) {
    slug = `${slugify(title.toLowerCase())}-${count}`;
    count++;
  }
  const { id } = req.user;
  const projectCat = await ProjectCategory.create({ title, slug, userId: id });

  // Send success response
  res.status(201).json({
    status: true,
    message: "Project category created successfully",
    data: projectCat,
  });
});

// Update a project category by ID
const updateProjectCat = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  validateMongoDbId(id);
  if (!title) {
    return res.status(400).json({
      status: false,
      message: "Title is required to update a project category",
    });
  }
  let slug = slugify(title.toLowerCase());
  let count = 1;
  while (await ProjectCategory.exists({ slug, _id: { $ne: id } })) {
    slug = `${slugify(title.toLowerCase())}-${count}`;
    count++;
  }
  const updatedProjectCat = await ProjectCategory.findByIdAndUpdate(
    id,
    { title, slug },
    { new: true, runValidators: true }
  );

  if (!updatedProjectCat) {
    return res.status(404).json({
      status: false,
      message: "Project category not found",
    });
  }
  res.status(200).json({
    status: true,
    message: "Project category updated successfully",
    data: updatedProjectCat,
  });
});

// Delete a project category by ID
const deletedProjectCat = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDbId(id);

  // Find and delete the project category
  const deletedProjectCat = await ProjectCategory.findByIdAndDelete(id);

  // Check if the document exists
  if (!deletedProjectCat) {
    return res.status(404).json({
      status: false,
      message: "Project category not found",
    });
  }

  // Send success response
  res.status(200).json({
    status: true,
    message: "Project category deleted successfully",
  });
});

// Get a project category by ID or slug
const getOneProjectCat = asyncHandler(async (req, res) => {
  const { id, slug } = req.params;

  let query;
  if (id) {
    // Validate MongoDB ID
    if (!validateMongoDbId(id)) {
      return res.status(400).json({ status: false, message: "Invalid ID" });
    }
    query = ProjectCategory.findById(id);
  } else if (slug) {
    query = ProjectCategory.findOne({ slug });
  } else {
    return res.status(400).json({
      status: false,
      message: "ID or Slug is required",
    });
  }

  const projectCat = await query;

  // Check if the document exists
  if (!projectCat) {
    return res.status(404).json({
      status: false,
      message: "Project category not found",
    });
  }

  // Send success response
  res.status(200).json({
    status: true,
    message: "Project category fetched successfully",
    data: projectCat,
  });
});

// Get all project categories with pagination, filtering, sorting, and limiting fields
const getAllProjectCat = asyncHandler(async (req, res) => {
  try {
    // Initialize APIFeatures
    const features = new APIFeatures(ProjectCategory.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query
    const projectCats = await features.query;

    // Send success response
    res.status(200).json({
      status: true,
      message: "All project categories fetched successfully",
      count: projectCats.length,
      data: projectCats,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = {
  postProjectCat,
  updateProjectCat,
  deletedProjectCat,
  getOneProjectCat,
  getAllProjectCat,
};
