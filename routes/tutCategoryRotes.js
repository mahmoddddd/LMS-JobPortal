const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

const {
  postTutorialCategory,
  getAllTutCategories,
  getATutorialCategory,
  deleCategory,
  updateCategory,
} = require("../controllers/tutCategory");

router.post("/post-tutorial-category", isAuth, isAdmin, postTutorialCategory);

router.get("/getAll", isAuth, isAdmin, getAllTutCategories);
router.get("/get-cat/:id", isAuth, getATutorialCategory);
router.delete("/delete-cat/:id", isAuth, isAdmin, deleCategory);
router.put("/update-cat/:id", isAuth, isAdmin, updateCategory);

module.exports = router;
