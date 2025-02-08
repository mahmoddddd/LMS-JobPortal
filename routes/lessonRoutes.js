const router = require("express").Router();

const { model } = require("mongoose");
const { createLesson } = require("../controllers/lessonCtrl");
const { isAuth, isAdmin, isBoth } = require("../middlewares/authMiddleware");
router.post("/lesson/:courseId", isAuth, createLesson);
module.exports = router;
