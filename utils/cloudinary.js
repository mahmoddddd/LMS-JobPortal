const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadToCloudinary = async (localPath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      resource_type: "auto",
    });
    fs.unlinkSync(localPath);
    return result.secure_url;
  } catch (error) {
    throw error;
  }
};

module.exports = uploadToCloudinary;
