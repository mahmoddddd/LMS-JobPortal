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

const updateUSerProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json("User Not FOuund");
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body, // Use the entire request body for updates
      { new: true }
    );

    res.json({
      status: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: "Something went wrong",
      details: error.message,
    });
  }
});

module.exports = {
  registerAUser,
  loginUser,
  getAllUsers,
  updateUSerProfile,
};
