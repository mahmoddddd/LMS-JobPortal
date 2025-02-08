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

    const instructor = req.user;

    if (course.instructor.toString() !== instructor._id.toString()) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized. This course does not belong to you.",
      });
    }

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

    req.body.instructor = instructor._id;
    req.body.slug = lessonSlug;

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

module.exports = {
  createLesson,
};
