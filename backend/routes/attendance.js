import express from "express";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// GET all attendance
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
