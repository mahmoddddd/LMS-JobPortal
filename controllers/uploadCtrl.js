const uploadToCloudinary = require("../services/cloudinary");

exports.uploadCourseMedia = async (req, res) => {
  try {
    const urls = {};
    if (req.files.image) {
      urls.image = await uploadToCloudinary(
        req.files.image[0].path,
        "lms/images"
      );
    }
    if (req.files.video) {
      urls.video = await uploadToCloudinary(
        req.files.video[0].path,
        "lms/videos"
      );
    }

    res.status(200).json({ message: "Upload successful", urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error });
  }
};
