const express = require("express");
const router = express.Router();
const {
  postProjectCat,
  updateProjectCat,
  deletedProjectCat,
  getOneProjectCat,
  getAllProjectCat,
} = require("../controllers/projectCatCtrl");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

// Create a new project category
router.post("/", isAuth, isAdmin, postProjectCat);

// Update a project category by ID
router.put("/update/:id", isAuth, isAdmin, updateProjectCat);

// Delete a project category by ID
router.delete("/delete/:id", isAuth, isAdmin, deletedProjectCat);

// Get a project category by ID or slug
router.get("/one/:id?", isAuth, isAdmin, getOneProjectCat); // By ID
router.get("/one/slug/:slug", isAuth, isAdmin, getOneProjectCat); // By Slug

// Get all project categories with pagination, filtering, sorting, and limiting fields
router.get("/getAll", isAuth, isAdmin, getAllProjectCat);

module.exports = router;
