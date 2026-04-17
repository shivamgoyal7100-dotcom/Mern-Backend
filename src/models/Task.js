const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, required: true, trim: true },
    inputText: { type: String, required: true },
    operation: {
      type: String,
      required: true,
      enum: ["uppercase", "lowercase", "reverse", "word_count"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "running", "success", "failed"],
      default: "pending",
      index: true,
    },
    result: { type: String, default: "" },
    logs: { type: [String], default: [] },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, status: 1, createdAt: -1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Task", taskSchema);
