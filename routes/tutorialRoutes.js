const router = require("express").Router();

const { isAuth, isAdmin } = require("../middlewares/authMiddleware.js");

const {
  postTutorial,
  getATutorial,
  updateTutorial,
  deleteTutorial,
  getAllTutorials,
} = require("../controllers/tutorial");

router.post("/post-tutorial", isAuth, isAdmin, postTutorial);
router.get("/get-tutorial/:slug/:type", isAuth, getATutorial);
router.put("/update-tutorial/:id", isAuth, isAdmin, updateTutorial);
router.delete("/delete-tutorial/:id", isAuth, isAdmin, deleteTutorial);
router.get("/allTut", isAuth, isAdmin, getAllTutorials);
module.exports = router;
