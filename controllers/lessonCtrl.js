const Lesson = require("../models/lessonModel");
const asyncHandler = require("express-async-handler");
const Course = require("../models/courseModel");
const validateMongoDbId = require("../config/validateMongoDb");
const slugify = require("slugify");

const createLesson = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!validateMongoDbId(courseId)) {
      return res.status(400).json({
        status: false,
        message: "The Course ID is not valid",
      });
    }
    const course = await Course.findById(courseId).populate("lessons");
    if (!course) {
      return res.status(404).json({
        status: false,
        message: "Course not found",
      });
    }
    // sure that the u are the owner of the course
    const instructor = req.user;
    if (course.instructor.toString() !== instructor._id.toString()) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized. You can only add lessons to your own courses.",
      });
    }
    // to use a uniqe name for the lesson
    const isTitleTaken = course.lessons.some(
      (lesson) => lesson.title === req.body.title
    );
    if (isTitleTaken) {
      return res.status(400).json({
        status: false,
        message:
          "A lesson with this title already exists in this course. Please use another title.",
      });
    }

    let lessonSlug = slugify(req.body.title, { lower: true, strict: true });

    let existingLesson = await Lesson.findOne({ slug: lessonSlug });
    if (existingLesson) {
      lessonSlug = `${lessonSlug}-${Date.now()}`;
    }

    req.body.userId = instructor._id;

    req.body.slug = lessonSlug;

    req.body.courseId = courseId;

    const lesson = await Lesson.create(req.body);

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      status: true,
      message: "Lesson created successfully!",
      data: { lesson, updatedCourse: course },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
});
const deleteLesson = asyncHandler(async (req, res) => {
  const { lessonId, courseId } = req.params;
  validateMongoDbId(lessonId);
  validateMongoDbId(courseId);
  try {
    const lesson = await Lesson.findByIdAndDelete(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { lessons: lessonId } },
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const updateALesson = asyncHandler(async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    validateMongoDbId(courseId);
    validateMongoDbId(lessonId);

    const course = await Course.findById(courseId).populate("lessons");
    if (!course) {
      return res.status(404).json({
        status: false,
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: false,
        message:
          "Unauthorized. You can only update lessons in your own courses.",
      });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        status: false,
        message: "Lesson not found",
      });
    }

    if (req.body.title) {
      const isTitleTaken = course.lessons.some(
        (l) => l.title === req.body.title && l._id.toString() !== lessonId
      );
      if (isTitleTaken) {
        return res.status(400).json({
          status: false,
          message: "A lesson with this title already exists in this course.",
        });
      }

      let lessonSlug = slugify(req.body.title, { lower: true, strict: true });

      let existingLesson = await Lesson.findOne({ slug: lessonSlug });
      if (existingLesson && existingLesson._id.toString() !== lessonId) {
        lessonSlug = `${lessonSlug}-${Date.now()}`;
      }

      req.body.slug = lessonSlug;
    }

    req.body.courseId = courseId;
    const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, req.body, {
      new: true,
    });

    res.status(200).json({
      status: true,
      message: "Lesson updated successfully!",
      data: updatedLesson,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
});

const getAlesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  validateMongoDbId(lessonId);
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({ message: "Lesson Fetched successfully", lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllLessons = asyncHandler(async (req, res) => {
  try {
    const lesson = await Lesson.find();
    if (!lesson.length) {
      return res.status(404).json({ message: "No Lesson found" });
    }

    res
      .status(200)
      .json({ message: "All Lessons Fetched successfully", lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const getAllCourseLessons = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  try {
    validateMongoDbId(courseId);
    const course = await Course.findById(courseId)
      .select("lessons")
      .populate("lessons");

    if (!course || !course.lessons.length) {
      // Check if course exists and has lessons
      return res
        .status(404)
        .json({ message: "No lessons found for this course" });
    }

    res.status(200).json({
      message: "All lessons fetched successfully",
      lessons: course.lessons,
    });
  } catch (error) {
    res.status(500).json({ message: String(error) });
  }
});

module.exports = {
  createLesson,
  deleteLesson,
  updateALesson,
  getAlesson,
  getAllLessons,
  getAllCourseLessons,
};
