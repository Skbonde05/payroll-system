// backend/seed.js  (robust replacement)
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";

dotenv.config();

const dataDir = path.resolve("./data");
const empPath = path.join(dataDir, "employees.json");
const attPath = path.join(dataDir, "attendance.json");

function safeReadJSON(p) {
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const parsed = JSON.parse(raw);
    // If file is already an array, return it
    if (Array.isArray(parsed)) return parsed;
    // If it's an object that contains a named array, return that array
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.employees)) return parsed.employees;
      if (Array.isArray(parsed.employee)) return parsed.employee;
      if (Array.isArray(parsed.data)) return parsed.data;
      if (Array.isArray(parsed.attendance)) return parsed.attendance;
      if (Array.isArray(parsed.records)) return parsed.records;
    }
    // Not an array — return as-is (will be wrapped later)
    return parsed;
  } catch (err) {
    console.error("Failed to read/parse JSON:", p, err.message);
    return null;
  }
}

const employeesRaw = safeReadJSON(empPath);
const attendanceRaw = safeReadJSON(attPath);

/* validators */
function validateEmployee(obj) {
  const problems = [];
  if (!obj || typeof obj !== "object") { problems.push("not-an-object"); return { valid: false, problems }; }
  if (!obj.name) problems.push("missing name");
  if (!obj.email) problems.push("missing email");
  if (!obj.designation) problems.push("missing designation");
  if (obj.basicSalary === undefined || obj.basicSalary === null || obj.basicSalary === "") problems.push("missing basicSalary");
  else if (isNaN(Number(obj.basicSalary))) problems.push("basicSalary-not-number");
  return { valid: problems.length === 0, problems };
}

function validateAttendance(obj) {
  const problems = [];
  if (!obj || typeof obj !== "object") { problems.push("not-an-object"); return { valid: false, problems }; }
  if (!obj.employee) problems.push("missing employee");
  if (!obj.date) problems.push("missing date");
  if (!obj.status) problems.push("missing status");
  return { valid: problems.length === 0, problems };
}

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI not set in .env — seeding will likely fail to connect.");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    if (!employeesRaw) throw new Error("employees.json missing or invalid JSON");
    if (!attendanceRaw) throw new Error("attendance.json missing or invalid JSON");

    // Normalize into arrays if necessary
    const employeesArray = Array.isArray(employeesRaw) ? employeesRaw : [employeesRaw];
    const attendanceArray = Array.isArray(attendanceRaw) ? attendanceRaw : [attendanceRaw];

    console.log("Clearing Employee and Attendance collections...");
    await Employee.deleteMany({});
    await Attendance.deleteMany({});

    // Process employees: validate, normalize, collect
    const validEmployees = [];
    const invalidEmployees = [];
    employeesArray.forEach((e, i) => {
      const { valid, problems } = validateEmployee(e);
      if (!valid) { invalidEmployees.push({ index: i, item: e, problems }); return; }
      validEmployees.push({
        name: String(e.name).trim(),
        email: String(e.email).trim(),
        designation: String(e.designation).trim(),
        basicSalary: Number(e.basicSalary),
        allowances: e.allowances !== undefined ? Number(e.allowances) : 0,
        deductions: e.deductions !== undefined ? Number(e.deductions) : 0,
      });
    });

    console.log(`Employees read: ${employeesArray.length}, valid: ${validEmployees.length}, invalid: ${invalidEmployees.length}`);
    if (invalidEmployees.length) {
      console.warn("Invalid employee entries (index + problems):");
      invalidEmployees.forEach(x => console.warn(`  index=${x.index} problems=${x.problems.join(", ")} item=`, x.item));
    }

    if (validEmployees.length) {
      const inserted = await Employee.insertMany(validEmployees, { ordered: false });
      console.log(`Inserted ${inserted.length} employees.`);
    } else {
      console.log("No valid employees to insert.");
    }

    // Process attendance: validate, normalize, collect
    const validAttendance = [];
    const invalidAttendance = [];
    attendanceArray.forEach((a, i) => {
      const { valid, problems } = validateAttendance(a);
      if (!valid) { invalidAttendance.push({ index: i, item: a, problems }); return; }
      validAttendance.push({
        employee: String(a.employee).trim(),
        date: String(a.date).trim(),
        status: String(a.status).trim()
      });
    });

    console.log(`Attendance read: ${attendanceArray.length}, valid: ${validAttendance.length}, invalid: ${invalidAttendance.length}`);
    if (invalidAttendance.length) {
      console.warn("Invalid attendance entries (index + problems):");
      invalidAttendance.forEach(x => console.warn(`  index=${x.index} problems=${x.problems.join(", ")} item=`, x.item));
    }

    if (validAttendance.length) {
      const insertedAtt = await Attendance.insertMany(validAttendance, { ordered: false });
      console.log(`Inserted ${insertedAtt.length} attendance records.`);
    } else {
      console.log("No valid attendance to insert.");
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
