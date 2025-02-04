const express = require("express");
const router = express.Router();
const {
  postDocCategory,
  getAllDocCategories,
  getADocCategory,
  deleteDocCategory,
  updateDocCategory,
} = require("../controllers/docCatCtrl");

const { isAuth, isAdmin } = require("../middlewares/authMiddleware"); // Import auth middlewares

// POST - Create a Document Category (Only authenticated admins can create)
router.post("/", isAuth, isAdmin, postDocCategory);

// GET - Get All Document Categories (Public route, no authentication required)
router.get("/", getAllDocCategories);

// GET - Get a Single Document Category by ID (Public route, no authentication required)
router.get("/:slug", getADocCategory);

// DELETE - Delete a Document Category by ID (Only authenticated admins can delete)
router.delete("/:id", isAuth, isAdmin, deleteDocCategory);

// PUT - Update a Document Category by ID (Only authenticated admins can update)
router.put("/:id", isAuth, isAdmin, updateDocCategory);

module.exports = router;
