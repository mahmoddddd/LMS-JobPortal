const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../config/validateMongoDb");
const Comment = require("../../models/qna/commentModel");
const Question = require("../../models/qna/questionModel");
const Answer = require("../../models/qna/answerModel");

// Create a new comment
const createComment = asyncHandler(async (req, res) => {
  const { content, question, answer } = req.body;
  const user = req.user._id;

  validateMongoDbId(user);
  if (question) validateMongoDbId(question);
  if (answer) validateMongoDbId(answer);

  if (!question && !answer) {
    res.status(400);
    throw new Error("Comment must be linked to either a question or an answer");
  }

  const comment = await Comment.create({ user, content, question, answer });

  // Update question or answer with the new comment
  if (question) {
    await Question.findByIdAndUpdate(question, {
      $push: { comments: comment._id },
    });
  } else if (answer) {
    await Answer.findByIdAndUpdate(answer, {
      $push: { comments: comment._id },
    });
  }

  res.status(201).json(comment);
});

// Get all comments
const getAllComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find()
    .populate("user", "firstname email")
    .populate("question", "title")
    .populate("answer", "content");

  res.json(comments);
});

// Get a single comment by ID
const getCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const comment = await Comment.findById(id)
    .populate("user", "firstname email")
    .populate("question", "title")
    .populate("answer", "content");

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  res.json(comment);
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = req.user;

  validateMongoDbId(id);

  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Check if user is the author or an admin
  if (
    comment.user.toString() !== user._id.toString() &&
    !user.roles.includes("admin")
  ) {
    res.status(403);
    throw new Error("You are not authorized to update this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { content },
    { new: true }
  );

  res.json(updatedComment);
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  validateMongoDbId(id);

  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Check if user is the author or an admin
  if (
    comment.user.toString() !== user._id.toString() &&
    !user.roles.includes("admin")
  ) {
    res.status(403);
    throw new Error("You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(id);

  // Remove comment reference from question or answer
  if (comment.question) {
    await Question.findByIdAndUpdate(comment.question, {
      $pull: { comments: comment._id },
    });
  } else if (comment.answer) {
    await Answer.findByIdAndUpdate(comment.answer, {
      $pull: { comments: comment._id },
    });
  }

  res.json({ message: "Comment deleted successfully" });
});

module.exports = {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
};
