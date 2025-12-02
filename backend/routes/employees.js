// backend/routes/employees.js
import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

// ✅ GET all employees — THIS WAS MISSING
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST: Add employee
router.post("/", async (req, res) => {
  try {
    const { name, email, designation, basicSalary, allowances, deductions } = req.body;

    if (!name || !email || !designation || basicSalary === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEmp = new Employee({
      name,
      email,
      designation,
      basicSalary,
      allowances,
      deductions
    });

    await newEmp.save();
    res.status(201).json(newEmp);

  } catch (err) {
    console.error("Employee insert error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
