const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { uploadCourseMedia } = require("../controllers/uploadCtrl");

router.post(
  "/upload-media",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  uploadCourseMedia
);

module.exports = router;
