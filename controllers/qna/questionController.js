const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../config/validateMongoDb");
const Question = require("../../models/qna/questionModel");
const Tag = require("../../models/qna/tagModel");
const slugify = require("slugify");

const createQuestion = asyncHandler(async (req, res) => {
  const { title, content, tags = [] } = req.body;
  const author = req.user._id;

  validateMongoDbId(author);

  tags.forEach((tag) => validateMongoDbId(tag));

  const existingTags = await Tag.find({ _id: { $in: tags } });

  const existingTagIds = existingTags.map((tag) => tag._id.toString());

  const missingTags = tags.filter((tag) => !existingTagIds.includes(tag));

  if (missingTags.length > 0) {
    return res.status(400).json({
      message: "Some tags do not exist in the database",
      missingTags,
    });
  }

  let slug = slugify(title, { lower: true, strict: true });

  let existingQuestion = await Question.findOne({ slug });
  let counter = 1;
  while (existingQuestion) {
    slug = `${slug}-${counter}`;
    existingQuestion = await Question.findOne({ slug });
    counter++;
  }
  const question = await Question.create({
    title,
    content,
    author,
    slug,
    tags: existingTagIds,
  });

  res.status(201).json(question);
});

// Get all questions with sorting, filtering, and pagination
const getAllQuestions = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Question.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const questions = await features.query
    .populate("author", "name email")
    .populate("tags", "name")
    .populate("answers");

  res.json(questions);
});

// Get a single question by ID
const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const question = await Question.findById(id)
    .populate("author", "name email")
    .populate("tags", "name")
    .populate({
      path: "answers",
      populate: { path: "author", select: "name email" },
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

  if (question.author.toString() !== user._id.toString() && !user.isAdmin) {
    res.status(403);
    throw new Error("You are not authorized to update this question");
  }

  // تحديث `slug` فقط إذا كان هناك تغيير في العنوان
  let slug = question.slug;
  if (title && title !== question.title) {
    slug = slugify(title, { lower: true, strict: true });

    // التأكد من أن الـ `slug` الجديد فريد
    let existingQuestion = await Question.findOne({ slug, _id: { $ne: id } });
    let counter = 1;
    while (existingQuestion) {
      slug = `${slug}-${counter}`;
      existingQuestion = await Question.findOne({ slug, _id: { $ne: id } });
      counter++;
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

  if (question.author.toString() !== user._id.toString() && !user.isAdmin) {
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
