const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../config/validateMongoDb");
const Question = require("../../models/qna/questionModel");
const Tag = require("../../models/qna/tagModel");
const slugify = require("slugify");
const ApiFeatures = require("../../utils/apiFeatures");

// Create a new question
const createQuestion = asyncHandler(async (req, res) => {
  const { title, content, tags = [] } = req.body;
  const author = req.user._id;

  validateMongoDbId(author);
  tags.forEach((tag) => validateMongoDbId(tag));

  const existingTags = await Tag.find({ _id: { $in: tags } });
  if (existingTags.length !== tags.length) {
    res.status(400);
    throw new Error("Some tags do not exist");
  }

  let slug = slugify(title, { lower: true, strict: true });
  let existingQuestion = await Question.findOne({ slug });
  if (existingQuestion) {
    slug = `${slug}-${Date.now()}`;
  }

  const question = await Question.create({
    title,
    content,
    author,
    slug,
    tags,
  });

  // update tags added to question
  await Tag.updateMany(
    { _id: { $in: tags } },
    { $push: { questions: question._id } }
  );

  res.status(201).json(question);
});

// Get all questions
const getAllQuestions = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Question.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const questions = await features.query
    .populate("author", "firstname email")
    .populate("tags", "name");

  res.json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// Get a single question by ID
const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const question = await Question.findById(id)
    .populate("author", "firstname email")
    .populate("tags", "name")
    .populate({
      path: "answers",
      populate: { path: "author", select: "firstname email" },
    });

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.json(question);
});

// Update a question
const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  const user = req.user;

  validateMongoDbId(id);
  tags?.forEach((tag) => validateMongoDbId(tag));

  const question = await Question.findById(id);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  // Check if user is the author or an admin
  if (
    question.author.toString() !== user._id.toString() &&
    !user.roles.includes("admin")
  ) {
    res.status(403);
    throw new Error("You are not authorized to update this question");
  }

  let slug = question.slug;
  if (title && title !== question.title) {
    slug = slugify(title, { lower: true, strict: true });
    const existingQuestion = await Question.findOne({ slug, _id: { $ne: id } });
    if (existingQuestion) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  const updatedQuestion = await Question.findByIdAndUpdate(
    id,
    { title, content, tags, slug },
    { new: true }
  );

  res.json(updatedQuestion);
});

// Delete a question
const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  validateMongoDbId(id);

  const question = await Question.findById(id);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  // Check if user is the author or an admin
  if (
    question.author.toString() !== user._id.toString() &&
    !user.roles.includes("admin")
  ) {
    res.status(403);
    throw new Error("You are not authorized to delete this question");
  }

  await Question.findByIdAndDelete(id);
  res.json({ message: "Question deleted successfully" });
});

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
