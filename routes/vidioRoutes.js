const express = require("express");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/authMiddleware");
const {
  postVidio,
  getAvidio,
  getAllVidios,
  deletVidio,
  updateVidio,
} = require("../controllers/vidioCtrl");
router.post("/post-vidio", isAuth, isAdmin, postVidio);
router.get("/get-vidio/:slug", isAuth, getAvidio);
router.get("/getAll", isAuth, getAllVidios);
router.delete("/delete-vidio/:id", isAuth, isAdmin, deletVidio);
router.put("/update-vidio/:id", isAuth, isAdmin, updateVidio);
module.exports = router;
