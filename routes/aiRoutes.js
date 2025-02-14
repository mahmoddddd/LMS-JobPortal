const express = require("express");
const { chatController, recommendCourses } = require("../controllers/aiCtrl");
const { isAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/ask", chatController);
// recommend  a course from DB // still work on it
router.post("/recommend", isAuth, recommendCourses);

module.exports = router;
