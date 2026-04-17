const express = require("express");
const Task = require("../models/Task");
const { auth } = require("../middleware/auth");
const { enqueueTask } = require("../services/queue");

const router = express.Router();

router.use(auth);

router.get("/", async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { title, inputText, operation } = req.body;
  if (!title || !inputText || !operation) {
    return res.status(400).json({ message: "title, inputText, and operation are required" });
  }
  const task = await Task.create({
    userId: req.user.userId,
    title,
    inputText,
    operation,
    status: "pending",
    logs: ["Task created"],
  });
  return res.status(201).json(task);
});

router.post("/:taskId/run", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.userId });
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  task.status = "pending";
  task.error = "";
  task.logs.push("Queued for execution");
  await task.save();

  const queuedToRedis = await enqueueTask({ taskId: task._id.toString() });
  if (!queuedToRedis) {
    task.logs.push("Redis unavailable. Worker will pick task from DB polling.");
    await task.save();
  }
  return res.json({
    message: queuedToRedis ? "Task queued" : "Task marked pending (DB polling mode)",
    taskId: task._id,
  });
});

router.get("/:taskId", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.userId }).lean();
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  return res.json(task);
});

module.exports = router;
