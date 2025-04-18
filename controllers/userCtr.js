const { hash } = require("bcrypt");
const User = require("../models/userModel");
const TokenBlacklist = require("../models/tokenBlackListModel");

const asyncHandler = require("express-async-handler");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../config/jwtToken");
const validateMongoDbId = require("../config/validateMongoDb");
const { createHash } = require("crypto");
const crypto = require("crypto");
const sendEmail = require("./emailCtrl");
const { sendWhatsAppMessage } = require("./whatsappMessage");
const bcrypt = require("bcrypt");

/* Register A User */
const registerAUser = asyncHandler(async (req, res) => {
  const { email, password, firstname, mobile, profession, lastname, roles } =
    req.body;
  if (!mobile) {
    return res.status(400).json({
      status: false,
      message: "Please provide mobile number",
    });
  }
  const findUser = await User.findOne({
    $or: [{ email: email }, { mobile: mobile }],
  });
  if (findUser) {
    return res.status(400).json({
      status: false,
      message: "User already exists with this email or mobile already in use",
    });
  }

  let userRole = roles;
  if (roles === "admin") {
    return res.status(400).json({
      status: false,
      message: "You cannot make yourself an admin",
    });
  } else if (roles !== "instructor" && roles !== "user") {
    userRole = "user";
  }

  try {
    const newUser = await User.create({
      email,
      password,
      firstname,
      mobile,
      profession,
      lastname,
      roles: userRole,
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
        phoneVerified: true,
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

// Login A User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email: email });

  if (findUser && (await findUser.comparePassword(password))) {
    const accessToken = generateToken(findUser?._id);
    const refreshToken = generateRefreshToken(findUser?._id);

    // update refresh token in database
    findUser.refreshToken = refreshToken;
    await findUser.save();

    // HTTP Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      status: true,
      message: "user login successfully",
      id: findUser.id,
      token: accessToken,
      role: findUser?.roles,
      username: findUser?.firstname + findUser?.lastname,
      user_imag: findUser?.user_imag,
    });
  } else {
    throw new Error("invalid credentials");
  }
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ status: false, message: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken,
    });

    if (!user) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid refresh token" });
    }

    const newAccessToken = generateToken(user._id);

    res.status(200).json({
      status: true,
      token: newAccessToken,
    });
  } catch (error) {
    return res
      .status(403)
      .json({ status: false, message: "Invalid refresh token" });
  }
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const refreshToken = req.cookies?.refreshToken;

  try {
    // Add tokens to blacklist
    if (token) {
      await TokenBlacklist.create({
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });
    }

    // Remove refreshToken from user
    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }

    // Clear cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      status: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Logout failed",
      error: error.message,
    });
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

/* 
// for email only 
// Forgot Password Token

// const forgetPasswoordToken = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email: email });
//   if (!user) {
//     throw new Error("No user exists with this email.");
//   }
//   try {
//     const token = await user.createPasswordResetToken(); // Generate and set the password reset token
//     await user.save();
//     const resetLink = `http://localhost:4000/api/user/reset-password/${token}`;
//     const data = {
//       to: email,
//       text: `hey ${user.firstName} click on the link to reset your password ${resetLink}`,
//       subject: "Password Reset Request",
//       html: `<a href="${resetLink}">Click here to reset your password</a>`,
//     };
//     sendEmail(data);
//     res.status(200).json({
//       status: true,
//       message: "Password reset link has been sent to your email.",
//       resetLink,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Error occurred while generating reset token.",
//       error: error.message,
//     });
//   }
// });
*/
/////////////////////////////////////////////////////////////////

/*
//  for paasword only
// const forgetPasswoordToken = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email: email });

//   if (!user) {
//     throw new Error("No user exists with this email.");
//   }

//   try {
//     // إرسال رسالة WhatsApp وبريد إلكتروني للمستخدم
//     await sendWhatsAppMessage(user, email); // استدعاء الدالة لإرسال الرسالة على WhatsApp وبريد إلكتروني

//     res.status(200).json({
//       status: true,
//       message: "Password reset link sent successfully via email and WhatsApp.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Error sending reset link.",
//       error: error.message,
//     });
//   }
// });
*/

// For Email And Password
const forgetPasswoordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("No user exists with this email.");
  }

  try {
    // create Password Reset Token
    const token = await user.createPasswordResetToken();
    await user.save(); // Save the tokken in the database

    // link To Reset Password
    const resetLink = `http://localhost:${process.env.PORT}/api/user/reset-password/${token}`;

    // send WhatsApp
    await sendWhatsAppMessage(user, email);

    const emailData = {
      to: email,
      text: `Hello ${user.firstname},\nPlease use the following link to reset your password: ${resetLink}`,
      html: `<p>Hello <strong>${user.firstname}</strong>,</p>
             <p>Please use the following link to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };
    const userOne = await User.findOne({ email: email });

    console.log(userOne.firstname);
    await sendEmail(emailData);

    res.status(200).json({
      status: true,
      message: "Password reset link sent successfully via email and WhatsApp.",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error sending reset link.",
      error: error.message,
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const token = req.params.token; // Get the token from the route parameters

  // Hash the received token
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user with the hashed token and ensure the token is not expired
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Password reset token is invalid or has expired.");
  }

  // Update the user's password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: true,
    message: "Password reset successfully.",
  });
});

// Set A paassword and MObile Number If user signup with google
const setPasswordAndMobile = asyncHandler(async (req, res) => {
  const { password, mobile } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.googleId && !user.password) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res
          .status(400)
          .json({ message: "Mobile number already in use" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.mobile = mobile;
      user.phoneVerified = true;
      await user.save();

      return res.status(200).json({
        message: "Password and mobile number updated successfully",
        data: user,
      });
    }

    return res.status(400).json({
      message: "User did not sign up via Google or password already set", // if the user did not sign up via Google or password is already set
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  registerAUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  getAUser,
  blockUser,
  unblockUser,
  updatePassword,
  forgetPasswoordToken,
  resetPassword,
  setPasswordAndMobile,
};
