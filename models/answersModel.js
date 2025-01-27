const resultSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // ID الطالب
    score: { type: Number, required: true }, // عدد الإجابات الصحيحة
    total_questions: { type: Number, required: true }, // عدد الأسئلة الكلي
    quiz_date: { type: Date, default: Date.now }, // تاريخ الاختبار
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
