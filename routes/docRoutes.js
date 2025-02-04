const express = require("express");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/authMiddleware");
const {
  postDoc,
  getADoc,
  getAllDocs,
  deleteDoc,
  updateDoc,
} = require("../controllers/docCtrl");

router.post("/docs", isAuth, isAdmin, postDoc);

router.get("/docs/:slug", getADoc);

router.get("/docs", getAllDocs);

router.delete("/docs/:id", isAuth, isAdmin, deleteDoc);

router.put("/docs/:id", isAuth, isAdmin, updateDoc);

module.exports = router;
