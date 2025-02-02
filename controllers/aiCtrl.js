const OpenAI = require("openai");
require("dotenv").config();

// تهيئة OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // استخدم المتغير البيئي
});

// وظيفة لإنشاء محادثة
const createChatCompletion = async (req, res) => {
  const { message } = req.body; // استقبال الرسالة من العميل

  if (!message) {
    return res.status(400).json({ error: "الرجاء إدخال رسالة." });
  }

  try {
    // استدعاء OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // استخدم هذا النموذج
      messages: [
        { role: "user", content: message }, // استخدام الرسالة من العميل
      ],
    });

    // إرجاع الإجابة إلى العميل
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("حدث خطأ:", error);
    res.status(500).json({ error: "You must pay for this service please" });
  }
};

module.exports = { createChatCompletion };
