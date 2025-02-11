const router = require("express").Router();

const {
  createLesson,
  deleteLesson,
  updateALesson,
  getAlesson,
  getAllLessons,
  getAllCourseLessons,
} = require("../controllers/lessonCtrl");
const { isAuth, isAdmin, isBoth } = require("../middlewares/authMiddleware");
router.post("/lesson/:courseId", isAuth, isBoth, createLesson);
router.delete("/:courseId/:lessonId", isAuth, isBoth, deleteLesson);
router.put("/:courseId/:lessonId", isAuth, isBoth, updateALesson);
router.get("/:lessonId", isAuth, getAlesson);
router.get("/", getAllLessons);
router.get("/allCouseLessons/:courseId", getAllCourseLessons);
module.exports = router;
