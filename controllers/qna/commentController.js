const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../config/validateMongoDb");
const Comment = require("../../models/qna/commentModel");
const ApiFeatures = require("../../utils/apiFeatures");
const Question = require("../../models/qna/questionModel");
const Answer = require("../../models/qna/answerModel");
// Create a new comment
const createComment = asyncHandler(async (req, res) => {
  const { content, question, answer } = req.body;
  const user = req.user._id;

  validateMongoDbId(user);
  if (question) validateMongoDbId(question);
  if (answer) validateMongoDbId(answer);

  let ifQuestion = null;
  let ifAnswer = null;

  if (question) {
    ifQuestion = await Question.findById(question);
    if (!ifQuestion) {
      res.status(404);
      throw new Error("Question not found");
    }
  }

  if (answer) {
    ifAnswer = await Answer.findById(answer);
    if (!ifAnswer) {
      res.status(404);
      throw new Error("Answer not found");
    }
  }

  if (!question && !answer) {
    res.status(400);
    throw new Error("Comment must be linked to either a question or an answer");
  }

  const comment = await Comment.create({ user, content, question, answer });

  if (ifQuestion) {
    ifQuestion.comments.push(comment._id);
    await ifQuestion.save();
  }

  if (ifAnswer) {
    ifAnswer.comments.push(comment._id);
    await ifAnswer.save();
  }

  res.status(201).json(comment);
});

// Get all comments with sorting, filtering, and pagination
const getAllComments = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Comment.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const comments = await features.query
    .populate("user", "firstname email")
    .populate("question", "title content")
    .populate("answer", "content");

  res.json(comments);
});

// Get a single comment by ID
const getCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const comment = await Comment.findById(id)
    .populate("user", "firstname email")
    .populate("question", "title content")
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

  if (
    comment.user.toString() !== user._id.toString() &&
    user.roles !== "admin"
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

  if (
    comment.user.toString() !== user._id.toString() &&
    user.roles !== "admin"
  ) {
    res.status(403);
    throw new Error("You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(id);
  res.json({ message: "Comment deleted successfully" });
});

module.exports = {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
};
