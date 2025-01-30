const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const Tutorial = require("../models/tutorialModel");
const slugify = require("slugify").default;

// Create a new tutorial
const postTutorial = asyncHandler(async (req, res) => {
  try {
    const { title, tutorialCategory } = req.body;

    // Generate slugs for title and category if they exist
    req.body.slug = title ? slugify(title.toLowerCase()) : undefined;
    req.body.userId = req.user._id;
    req.body.tutorialCategorySlug = tutorialCategory
      ? slugify(tutorialCategory.toLowerCase())
      : undefined;

    const newTutorial = await Tutorial.create(req.body);
    res.status(201).json({
      status: true,
      message: "Tutorial Created Successfully",
      tutorial: newTutorial,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single tutorial and related topics
const getATutorial = asyncHandler(async (req, res) => {
  const { slug, type } = req.params;

  try {
    // Fetch the tutorial based on slug and category
    const tutorialData = await Tutorial.findOne({
      slug,
      tutorialCategorySlug: type,
    });

    if (!tutorialData) {
      return res.status(404).json({
        status: false,
        message: "Tutorial not found",
      });
    }
    // Fetch all tutorials in the same category
    const tutorialTopics = await Tutorial.find({
      tutorialCategorySlug: type,
    })
      .select("topicName title slug tutorialCategorySlug")
      .sort("createdAt");

    res.status(200).json({
      status: true,
      message: "Tutorial Found",
      tutorial: tutorialData,
      tutorialTopics,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update a tutorial
const updateTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    // Check if the tutorial exists before updating
    const existingTutorial = await Tutorial.findById(id);
    if (!existingTutorial) {
      return res.status(404).json({
        status: false,
        message: "No tutorial found with this ID",
      });
    }

    // Update slug if title is provided
    if (req.body.title) {
      req.body.slug = slugify(req.body.title.toLowerCase());
    }

    const updatedTutorial = await Tutorial.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      status: true,
      message: "Tutorial Updated Successfully",
      tutorial: updatedTutorial,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a tutorial
const deleteTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    // Check if the tutorial exists before deleting
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({
        status: false,
        message: "No tutorial found with this ID",
      });
    }

    await Tutorial.findByIdAndDelete(id);
    res.status(200).json({
      status: true,
      message: "Tutorial Deleted Successfully",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get all tutorials with pagination
const getAllTutorials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

  try {
    // Fetch tutorials with pagination
    const tutorials = await Tutorial.find()
      .select("title tutorialCategorySlug slug")
      .sort("createdAt")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalTutorials = await Tutorial.countDocuments(); // Get the total count of tutorials

    res.status(200).json({
      status: true,
      message: "Tutorials Found",
      tutorials,
      page,
      limit,
      totalPages: Math.ceil(totalTutorials / limit), // Calculate total pages
      totalTutorials,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  postTutorial,
  getATutorial,
  updateTutorial,
  deleteTutorial,
  getAllTutorials,
};
