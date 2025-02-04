const { default: slugify } = require("slugify");
const Doc = require("../models/documentationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");

// POST - Create a Doc
const postDoc = asyncHandler(async (req, res) => {
  const { title, type, content, keywords, category } = req.body;
  if (!title || !type || !content || !keywords) {
    return res.status(400).json({
      status: false,
      message: "All fields are required!",
    });
  }
  try {
    const slug = slugify(title.toLowerCase());

    // Check if a document with the same slug already exists
    const existingDoc = await Doc.findOne({ slug });
    if (existingDoc) {
      return res.status(400).json({
        status: false,
        message: "A document with this title already exists.",
      });
    }

    const doc = await Doc.create({
      title,
      slug,
      type,
      content,
      keywords,
      category,
      userId: req.user._id, // Assign the user ID from the authenticated request
    });

    res.status(201).json({
      status: true,
      message: "Doc Created Successfully",
      doc,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating Doc: " + error.message,
    });
  }
});

// GET - Get a Single Doc by Slug
const getADoc = asyncHandler(async (req, res) => {
  const { slug } = req.params; // Use slug instead of title

  if (!slug) {
    return res.status(400).json({
      status: false,
      message: "Slug is required!",
    });
  }

  try {
    // Find the document by slug
    const doc = await Doc.findOne({ slug });

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

// GET - Get All Docs
const getAllDocs = asyncHandler(async (req, res) => {
  try {
    const docs = await Doc.find();

    if (!docs || docs.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No Docs Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "All Docs Retrieved Successfully",
      docs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving Docs: " + error.message,
    });
  }
});

// DELETE - Delete a Doc by ID
const deleteDoc = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDbId(id);

  try {
    const doc = await Doc.findByIdAndDelete(id);

    if (!doc) {
      return res.status(404).json({
        status: false,
        message: "Doc Not Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Doc Deleted Successfully",
      doc,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting Doc: " + error.message,
    });
  }
});

// PUT - Update a Doc by ID
const updateDoc = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDbId(id);

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    const updatedDoc = await Doc.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedDoc) {
      return res.status(404).json({
        status: false,
        message: "Doc Not Found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Doc Updated Successfully",
      doc: updatedDoc,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating Doc: " + error.message,
    });
  }
});

module.exports = {
  postDoc,
  getADoc,
  getAllDocs,
  deleteDoc,
  updateDoc,
};
