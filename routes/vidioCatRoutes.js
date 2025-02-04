const router = require("express").Router();
const {
  postVidioCategory,
  getAllVidioCategories,
  getAVidioCategory,
  deleteVidioCategory,
  updateVidioCategory,
} = require("../controllers/vidioCatCtrl");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

// POST - Create a Vidio Category (Admin only)
router.post("/", isAuth, isAdmin, postVidioCategory);

// GET - Get All Vidio Categories (Public)
router.get("/", getAllVidioCategories);

// GET - Get a Single Vidio Category by ID (Public)
router.get("/:slug", getAVidioCategory);

// DELETE - Delete a Vidio Category by ID (Admin only)
router.delete("/:id", isAuth, isAdmin, deleteVidioCategory);

// PUT - Update a Vidio Category by ID (Admin only)
router.put("/:id", isAuth, isAdmin, updateVidioCategory);

module.exports = router;
