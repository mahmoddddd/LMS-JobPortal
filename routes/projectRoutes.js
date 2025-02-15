const express = require("express");
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectByIdOrSlug,
  updateProject,
  deleteProject,
} = require("../controllers/projectCtrl");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");
// CRUD routes for projects
router.use(isAuth);
router.post("/post-projects", createProject);

router.put("/update-project/:id", updateProject);

router.delete("/delete-project/:id", isAdmin, deleteProject);

router.get("/getproject/:identifier", getProjectByIdOrSlug);

router.get("/projects", getAllProjects);

module.exports = router;
