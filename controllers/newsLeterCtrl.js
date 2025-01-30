const asyncHandler = require("express-async-handler");
const NewsLetter = require("../models/newsLetterModel");

const subscribeNewsLetter = asyncHandler(async (req, res) => {
  const email = req.user.email;
  if (!email) {
    return res.status(400).json({
      status: false,
      message: "Please provide an email",
    });
  }
  const findEmail = await NewsLetter.findOne({ email: email });
  if (findEmail) {
    return res.status(400).json({
      status: false,
      message: "Email already exists",
    });
  }
  try {
    const newsLetter = await NewsLetter.create({
      email,
    });
    res.status(201).json({
      status: true,
      message: "Subscribed to newsletter successfully",
      newsLetter,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to subscribe to newsletter",
      error: error.message,
    });
  }
});

const unsubscribeNewsLetter = asyncHandler(async (req, res) => {
  const email = req.user;

  if (!email) {
    return res.status(400).json({
      status: false,
      message: "Please provide an email",
    });
  }

  try {
    const findEmail = await NewsLetter.findOne({ email });

    if (!findEmail) {
      return res.status(404).json({
        status: false,
        message: "Email not found in subscriptions",
      });
    }

    await NewsLetter.deleteOne({ email });

    res.status(200).json({
      status: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to unsubscribe",
      error: error.message,
    });
  }
});

module.exports = { subscribeNewsLetter, unsubscribeNewsLetter };
