const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
let userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
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
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: String,
      default: "user",
    },
    profession: {
      type: String,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // stripe
    stripe_account_id: String,
    stripe_seller: {},
    stripe_Session: {},
  },
  { timestamps: true }
);

// ========================
// Middleware: Password Hashing
// ========================
// This middleware is triggered before saving a user document to the database.
// It hashes the password only if it has been modified, preventing unnecessary rehashing.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip hashing if the password has not been modified

  const saltRounds = 10; // Define the number of salt rounds for hashing
  try {
    const hashedPassword = await bcrypt.hash(this.password, saltRounds); // Hash the password using bcrypt
    this.password = hashedPassword; // Replace the plain text password with the hashed password
    next(); // Proceed to the next middleware or save operation
  } catch (error) {
    return next(error); // Pass the error to the next middleware in case of failure
  }
});

// ========================
// Method: Compare Passwords
// ========================
// This method compares a user-provided password with the hashed password stored in the database.
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password); // Return true if passwords match, false otherwise
  } catch (error) {
    throw new Error("Error comparing password"); // Throw an error if comparison fails
  }
};

// ========================
// Method: Create Password Reset Token
// ========================
// This method generates a password reset token, hashes it, and sets expiration details.
userSchema.methods.createPasswordResetToken = async function () {
  // Generate a random token using 32 bytes and convert it to a hexadecimal string
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token using SHA-256 and store it in the passwordResetToken field
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the token expiration time (30 minutes from the current time)
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes in milliseconds

  return resetToken; // Return the raw (unhashed) token to be sent to the user
};

// ========================
// Export the User Model
// ========================
// This ensures the schema is registered with Mongoose and can be used to interact with the database
module.exports = mongoose.model("User", userSchema);
