const { default: slugify } = require("slugify");
const Blog = require("../models/blogModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const mongoose = require("mongoose");
// POST - Create a Blog
const createBlog = asyncHandler(async (req, res) => {
  const { title, description, categoryId, keywords } = req.body;

  // Validate required fields
  if (!title || !description || !categoryId || !keywords) {
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

  try {
    // Generate a slug from the title
    const slug = slugify(title.toLowerCase());

    // Check if a blog with the same slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({
        status: false,
        message: "A blog with this title already exists.",
      });
    }

    // Create the blog
    const blog = await Blog.create({
      title,
      slug,
      description,
      category: categoryId,
      keywords,
      userId: req.user._id, // Assign the user ID from the authenticated request
    });

    res.status(201).json({
      status: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating blog: " + error.message,
    });
  }
});

// GET - Get a Single Blog by Slug
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      status: false,
      message: "Slug is required!",
    });
  }

  try {
    // Find the blog by slug
    const blog = await Blog.findOne({ slug })
      .populate("userId", "firstname  email")
      .populate("category", "title");

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog retrieved successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving blog: " + error.message,
    });
  }
});

// GET - Get All Blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    // Fetch all blogs and populate user and category details
    const blogs = await Blog.find()
      .populate("userId", "firstname  email")
      .populate("category", "title");

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No blogs found",
      });
    }

    res.status(200).json({
      status: true,
      message: "All blogs retrieved successfully",
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving blogs: " + error.message,
    });
  }
});

// DELETE - Delete a Blog by ID
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDbId(id);

  try {
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog deleted successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting blog: " + error.message,
    });
  }
});

// PUT - Update a Blog by ID
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDbId(id);

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
    });

    if (!updatedBlog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating blog: " + error.message,
    });
  }
});

module.exports = {
  createBlog,
  getBlogBySlug,
  getAllBlogs,
  deleteBlog,
  updateBlog,
};
