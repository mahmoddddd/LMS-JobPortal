const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../config/validateMongoDb");
const QnA = require("../../models/qna/qnaModel");
const Answer = require("../../models/qna/answerModel");
const Question = require("../../models/qna/questionModel");
const ApiFeatures = require("../../utils/apiFeatures");

// Create a new QnA entry
const createQna = asyncHandler(async (req, res) => {
  const { question, answer, featured } = req.body;
  const user = req.user._id;

  // validateMongoDbId(user);
  // validateMongoDbId(question);
  // if (answer) validateMongoDbId(answer);
  [user, question, answer].forEach((id) => id && validateMongoDbId(id));

  const ifQuestion = await Question.findById(question);
  if (!ifQuestion) {
    res.status(404);
    throw new Error("Question not found");
  }
  const ifAnswer = await Answer.findById(answer);
  if (!ifAnswer) {
    res.status(404);
    throw new Error("Answer not found");
  }
  // if user enter same answer to the same question twice
  const existingQna = await QnA.findOne({ user, question, answer });
  if (existingQna) {
    return res
      .status(400)
      .json({ message: "You have already added this answer to the question." });
  }
  const qna = await QnA.create({ user, question, answer, featured });
  res.status(201).json(qna);
});

// Get all QnA entries with sorting, filtering, and pagination
const getAllQnas = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(QnA.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const qnas = await features.query
    .populate("user", "firstname email")
    .populate("question", "title content")
    .populate("answer", "content");

  res.json({
    qnas,
    numOfQnas: qnas.length,
  });
});

// Get a single QnA entry by ID
const getQnaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const qna = await QnA.findById(id)
    .populate("user", "name email")
    .populate("question", "title content")
    .populate("answer", "content");

  if (!qna) {
    res.status(404);
    throw new Error("QnA entry not found");
  }

  res.json(qna);
});

// Update a QnA entry
const updateQna = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;
  const user = req.user;

  validateMongoDbId(id);

  const qna = await QnA.findById(id);
  if (!qna) {
    res.status(404);
    throw new Error("QnA entry not found");
  }

  if (qna.user.toString() !== user._id.toString() && user.roles !== "admin") {
    res.status(403);
    throw new Error("You are not authorized to update this QnA entry");
  }

  const updatedQna = await QnA.findByIdAndUpdate(
    id,
    { featured },
    { new: true }
  );

  res.json(updatedQna);
});

// Delete a QnA entry
const deleteQna = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  validateMongoDbId(id);

  const qna = await QnA.findById(id);
  if (!qna) {
    res.status(404);
    throw new Error("QnA entry not found");
  }

  if (qna.user !== user._id && user.roles !== "admin") {
    res.status(403);
    throw new Error("You are not authorized to delete this QnA entry");
  }

  await QnA.findByIdAndDelete(id);
  res.json({ message: "QnA entry deleted successfully" });
});

module.exports = {
  createQna,
  getAllQnas,
  getQnaById,
  updateQna,
  deleteQna,
};
