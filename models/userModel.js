const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

let userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    user_imag: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      default: () => uuidv4(),
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    roles: {
      enum: ["user", "admin", "instructor"],
      type: String,
      default: "user",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    profession: {
      type: String,
      // default: "student",
      required: function () {
        return !this.googleId;
      },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    stripe_account_id: String,
    stripe_seller: {},
    stripe_Session: {},

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// It hashes the password only if it has been modified, preventing unnecessary rehashing.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip hashing if the password has not been modified

  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// This method compares a user-provided password with the hashed password stored in the database.
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error("Error comparing password");
  }
};

// This method generates a password reset token, hashes it, and sets expiration details.
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes in milliseconds

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
