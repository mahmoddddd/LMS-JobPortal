const { hash } = require("bcrypt");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../config/validateMongoDb");

/* Register A User */
const registerAUser = asyncHandler(async (req, res) => {
  const { email, password, firstname, mobile, profession, lastname } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser) {
    return res.status(400).json({
      status: false,
      message: "User already exists with this email",
    });
  }

  try {
    const newUser = await User.create({
      email,
      password,
      firstname,
      mobile,
      profession,
      lastname,
    });

    res.status(201).json({
      status: true,
      message: "User created successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        mobile: newUser.mobile,
        profession: newUser.profession,
        password: newUser.password,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: "Something went wrong",
      details: error.message,
    });
  }
});

/* login a user */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email: email });

  if (findUser && (await findUser.comparePassword(password))) {
    res.status(200).json({
      status: true,
      message: "user login sucsefuly",
      id: findUser.id,
      token: generateToken(findUser?._id),
      role: findUser?.roles,
      username: findUser?.firstname + findUser?.lastname,
      user_imag: findUser?.user_imag,
    });
  } else {
    throw new Error("invalid cradintial");
  }
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUusers = await User.find({}); // Fetch all users
    res.status(200).json({
      staus: true,
      Message: "All users Fetched sucsesfully",
      allUusers,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: "Something went wrong",
      details: error.message,
    });
  }
});

const getAUser = asyncHandler(async (req, res) => {
  const userId = req.params.id; // Access the user ID correctly
  const user = await User.findById(userId); // Find the user by ID

  if (!user) {
    return res.status(404).json({ status: false, message: "User not found" });
  }

  res.status(200).json({
    status: true,
    message: "User fetched successfully",
    user,
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    // Extract user ID from the authenticated user object
    const userId = req.user.id;
    // Validate MongoDB ID
    validateMongoDbId(userId);

    // Update the user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body, // Use the entire request body directly for updating
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: "Failed to update user profile",
      details: error.message,
    });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!validateMongoDbId(userId)) {
    return res.status(400).json({
      status: false,
      error: "Invalid MongoDB ID",
    });
  }
  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: "Failed to delete user",
      details: error.message,
    });
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!validateMongoDbId(userId)) {
    return res.status(400).json({
      status: false,
      error: "Invalid MongoDB ID",
    });
  }
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(400).json({
        status: false,
        message: "User is already blocked",
      });
    }

    // Block the user (set isBlocked to true)
    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      status: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: "Failed to block user",
      details: error.message,
    });
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (!validateMongoDbId(userId)) {
    return res.status(400).json({
      status: false,
      error: "Invalid MongoDB ID",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    if (!user.isBlocked) {
      return res.status(400).json({
        status: false,
        message: "User is not blocked",
      });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({
      status: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: "Failed to unblock user",
      details: error.message,
    });
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user; // Assuming _id comes from authentication middleware
  const { password } = req.body;

  if (!validateMongoDbId(_id)) {
    return res.status(400).json({
      status: false,
      error: "Invalid MongoDB ID",
    });
  }

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    // Use comparePassword to check if the new password matches the old one
    const isMatched = await user.comparePassword(password);
    if (isMatched) {
      return res.status(400).json({
        status: false,
        error: "Please enter a different password. This one is already in use.",
      });
    }

    // Update the password and save the user
    user.password = password;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: "Failed to update password",
      details: error.message,
    });
  }
});

module.exports = {
  registerAUser,
  loginUser,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  getAUser,
  blockUser,
  unblockUser,
  updatePassword,
};
