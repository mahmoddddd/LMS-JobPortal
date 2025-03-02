const BookSession = require("../models/sessionModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const mongoose = require("mongoose");
const APIFeatures = require("../utils/apiFeatures");
// Create a new book session
const createBookSession = asyncHandler(async (req, res) => {
  const { name, email, mobile, subject, desc, timeslot } = req.body;

  if (!name || !email || !mobile || !subject || !desc || !timeslot) {
    res.status(400);
    throw new Error("All fields are required");
  }
  // Create the book session
  const bookSession = new BookSession({
    name,
    email,
    mobile,
    subject,
    userId: req.user._id,
    desc,
    timeslot,
  });

  await bookSession.save();

  res.status(201).json({
    message: "Book session created successfully",
    success: true,
    data: bookSession,
  });
});

// Get all book sessions with filtering, sorting, pagination, and field limiting
const getAllBookSessions = asyncHandler(async (req, res) => {
  try {
    const features = new APIFeatures(BookSession.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query
    const bookSessions = await features.query.populate("userId");

    res.status(200).json({
      success: true,
      results: bookSessions.length,
      data: bookSessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single book session by ID
const getBookSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const bookSession = await BookSession.findById(id).populate({
    path: "userId",
    select: "-password",
  });

  if (!bookSession) {
    res.status(404);
    throw new Error("Book session not found");
  }

  res.status(200).json({ success: true, data: bookSession });
});

// Update a book session by ID
const updateBookSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const bookSession = await BookSession.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bookSession) {
    res.status(404);
    throw new Error("Book session not found");
  }

  res.status(200).json({ success: true, data: bookSession });
});

// Delete a book session by ID
const deleteBookSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const bookSession = await BookSession.findByIdAndDelete(id);

  if (!bookSession) {
    res.status(404);
    throw new Error("Book session not found");
  }

  res.status(200).json({
    message: "Book session deleted successfully",
    success: true,
    data: {},
  });
});

module.exports = {
  createBookSession,
  getAllBookSessions,
  getBookSessionById,
  updateBookSession,
  deleteBookSession,
};
