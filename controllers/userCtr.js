const { hash } = require("bcrypt");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

/* Register A User */
const registerAUser = asyncHandler(async (req, res) => {
  const { email, password, firstname, mobile, profession, lastname } = req.body;

  // Check if user already exists
  const findUser = await User.findOne({ email });

  if (findUser) {
    return res.status(400).json({
      status: false,
      message: "User already exists with this email",
    });
  }

  try {
    // Create new user
    const newUser = await User.create({
      email,
      password,
      firstname,
      mobile,
      profession,
      lastname,
    });

    // Return success response
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

module.exports = {
  registerAUser,
};
