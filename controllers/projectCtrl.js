const Project = require("../models/projectModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const mongoose = require("mongoose");
const slugify = require("slugify");
const ProjectCategory = require("../models/projectCatModel");
const APIFeatures = require("../utils/apiFeatures");

//
// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { title, description, category, price, techStack, keywords } = req.body;

  if (!title || !description || !category) {
    res.status(400);
    throw new Error("Title, description, and category are required");
  }
  const slug = slugify(title.toLowerCase());

  const projectCategory = await ProjectCategory.findOne({ title: category });
  if (!projectCategory) {
    res.status(404);
    throw new Error("Project category not found");
  }

  const userId = req.user._id;

  // Create the project
  const project = new Project({
    title,
    slug,
    description,
    category: projectCategory.id,
    price: price || 0,
    techStack: techStack || [],
    keywords: keywords || [],
    userId,
  });

  await project.save();

  res.status(201).json({ success: true, data: project });
});

// Get all projects with filtering, sorting, pagination, and field limiting
const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const features = new APIFeatures(Project.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query
    const projects = await features.query.populate("category userId");

    res.status(200).json({
      success: true,
      results: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single project by ID or slug
const getProjectByIdOrSlug = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  let project;

  // Check if the identifier is a valid MongoDB ObjectId
  if (mongoose.isValidObjectId(identifier)) {
    // Search by ID
    project = await Project.findById(identifier).populate([
      { path: "category", select: "title" },
      { path: "userId", select: "-password" },
    ]);
  } else {
    // Search by slug
    project = await Project.findOne({ slug: identifier }).populate([
      { path: "category", select: "title" },
      { path: "userId", select: "-password" },
    ]);
  }
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.status(200).json({ success: true, data: project });
});

// Update a project by ID
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  if (req.body.title) {
    req.body.slug = slugify(req.body.title.toLowerCase());
  }

  const project = await Project.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  res.status(200).json({ success: true, data: project });
});

// Delete a project by ID
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res
    .status(200)
    .json({ message: "Project deleted successfully", success: true, data: {} });
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectByIdOrSlug,
  updateProject,
  deleteProject,
};
