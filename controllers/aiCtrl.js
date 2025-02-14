const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();
const User = require("../models/userModel");
const Course = require("../models/courseModel");

const API_URL = "https://api.aimlapi.com/v1/chat/completions";
const API_KEY = process.env.AIML_API_KEY;
const DATA_FILE = "chat_history.json";

const chatController = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const aiResponse = data.choices[0].message.content;
      saveChat({ question: message, answer: aiResponse });
      res.json({ response: aiResponse }, aiResponse);
    } else {
      res.status(500).json({ error: "Invalid AI response." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Save chat history to a JSON file
const saveChat = (chat) => {
  let chatHistory = fs.existsSync(DATA_FILE)
    ? JSON.parse(fs.readFileSync(DATA_FILE))
    : [];
  chatHistory.push(chat);
  fs.writeFileSync(DATA_FILE, JSON.stringify(chatHistory, null, 2));
};
const recommendCourses = async (req, res) => {
  const { id } = req.user;
  if (!id) return res.status(400).json({ error: "User ID is required." });

  try {
    // جلب بيانات المستخدم والكورسات اللي مشترك فيها
    const user = await User.findById(id).populate("enrolledCourses");
    if (!user) return res.status(404).json({ error: "User not found." });

    const enrolledTitles = user.enrolledCourses.map((c) => c.title).join(", ");

    // إرسال الطلب للذكاء الاصطناعي لتوليد ترشيحات جديدة بأسلوب بسيط ومُرقّم
    const aiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Recommend courses in a simple way, using numbered lists and short explanations.",
          },
          {
            role: "user",
            content: `I have completed these courses: ${enrolledTitles}. What courses should I take next? Please keep it simple and list them in a numbered format.`,
          },
        ],
      }),
    });

    const data = await aiResponse.json();
    if (data.choices && data.choices.length > 0) {
      const recommendations = data.choices[0].message.content;
      return res.json({ user: user.name, recommendations });
    } else {
      return res.status(500).json({ error: "Invalid AI response." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { chatController, recommendCourses };
