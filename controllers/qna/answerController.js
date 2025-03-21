const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../config/validateMongoDb");
const Answer = require("../../models/qna/answerModel");
const Question = require("../../models/qna/questionModel");
const ApiFeatures = require("../../utils/apiFeatures");

// Create a new answer
const createAnswer = asyncHandler(async (req, res) => {
  const { content, question } = req.body;
  const author = req.user._id;

  [author, question].forEach(validateMongoDbId);

  const existingQuestion = await Question.findById(question);
  if (!existingQuestion) {
    res.status(404);
    throw new Error("Question not found");
  }

  const answer = await Answer.create({ content, author, question });

  // Update question's answers array
  await Question.findByIdAndUpdate(question, {
    $push: { answers: answer._id },
    $inc: { answerCount: 1 },
  });

  res.status(201).json(answer);
});

// Get all answers
const getAllAnswers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Answer.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const answers = await features.query
    .populate("author", "firstname email")
    .populate("question", "title content");

  res.json(answers);
});

// Get a single answer by ID
const getAnswerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const answer = await Answer.findById(id)
    .populate("author", "firstname email")
    .populate("question", "title content");

  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  res.json(answer);
});

// Update an answer
const updateAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = req.user;

  validateMongoDbId(id);

  const answer = await Answer.findById(id);
  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  // Check if user is the author or an admin
  if (
    answer.author.toString() !== user._id.toString() &&
    !user.roles.includes("admin")
  ) {
    res.status(403);
    throw new Error("You are not authorized to update this answer");
  }

  const updatedAnswer = await Answer.findByIdAndUpdate(
    id,
    { content },
    { new: true }
  );

  res.json(updatedAnswer);
});

// Delete an answer
const deleteAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  validateMongoDbId(id);

  const answer = await Answer.findById(id);
  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  // Check if user is the author or an admin
  if (
    answer.author.toString() !== user._id.toString() &&
    !user.roles.includes("admin")
  ) {
    res.status(403);
    throw new Error("You are not authorized to delete this answer");
  }

  await Answer.findByIdAndDelete(id);

  // Update question's answers array
  await Question.findByIdAndUpdate(answer.question, {
    $pull: { answers: answer._id },
    $inc: { answerCount: -1 },
  });

  res.json({ message: "Answer deleted successfully" });
});

module.exports = {
  createAnswer,
  getAllAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
};
