import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ["Present", "Absent", "Leave"], default: "Present" },
});

export default mongoose.model("Attendance", attendanceSchema);
