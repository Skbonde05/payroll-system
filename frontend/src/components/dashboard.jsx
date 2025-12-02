import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import "./dashboard.css";

export const Dashboard = ({ user }) => {
  const [view, setView] = useState("home");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

useEffect(() => {
  const fetchData = async () => {
    try {
      const empRes = await axios.get(`${API_BASE}/employees`);
      const attRes = await axios.get(`${API_BASE}/attendance`);

      setEmployees(empRes.data);
      setAttendance(
        attRes.data.map((att) => ({
          ...att,
          date: new Date(att.date), // keep as Date
        }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  fetchData();
}, []);

  const calculateNetSalary = (emp) =>
    emp.basicSalary + emp.allowances - emp.deductions;

  const generateSalarySlip = (emp) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Salary Slip", 80, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${emp.name}`, 20, 40);
    doc.text(`Email: ${emp.email}`, 20, 50);
    doc.text(`Designation: ${emp.designation}`, 20, 60);
    doc.text(`Basic Salary: ₹${emp.basicSalary}`, 20, 80);
    doc.text(`Allowances: ₹${emp.allowances}`, 20, 90);
    doc.text(`Deductions: ₹${emp.deductions}`, 20, 100);
    doc.text(`Net Salary: ₹${calculateNetSalary(emp)}`, 20, 120);

    doc.save(`${emp.name}_SalarySlip.pdf`);
  };

  const attendanceColor = (status) => {
    switch (status) {
      case "Present":
        return "text-success";
      case "Absent":
        return "text-danger";
      case "Leave":
        return "text-warning";
      default:
        return "";
    }
  };

  // ---------- Derived stats for Home dashboard ----------

  const totalEmployees = employees.length;

  // Find latest attendance date (so your demo data always looks "today")
  const latestAttendanceDate =
    attendance.length > 0
      ? new Date(
          Math.max(
            ...attendance.map((a) => a.date.getTime())
          )
        )
      : null;

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const todaysAttendance =
    latestAttendanceDate && attendance.length > 0
      ? attendance.filter((a) => isSameDay(a.date, latestAttendanceDate))
      : [];

  const presentCount = todaysAttendance.filter(
    (a) => a.status === "Present"
  ).length;
  const absentCount = todaysAttendance.filter(
    (a) => a.status === "Absent"
  ).length;
  const leaveCount = todaysAttendance.filter(
    (a) => a.status === "Leave"
  ).length;

  const netSalaries = employees.map((e) => calculateNetSalary(e));
  const totalPayroll = netSalaries.reduce((sum, val) => sum + val, 0);
  const highestSalary =
    netSalaries.length > 0 ? Math.max(...netSalaries) : 0;
  const lowestSalary =
    netSalaries.length > 0 ? Math.min(...netSalaries) : 0;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <ul className="sidebar-menu">
          <li
            className={view === "home" ? "active" : ""}
            onClick={() => setView("home")}
          >
            Home
          </li>
          <li
            className={view === "employees" ? "active" : ""}
            onClick={() => setView("employees")}
          >
            Employees
          </li>
          <li
            className={view === "payroll" ? "active" : ""}
            onClick={() => setView("payroll")}
          >
            Payroll
          </li>
          <li
            className={view === "attendance" ? "active" : ""}
            onClick={() => setView("attendance")}
          >
            Attendance
          </li>
          <li
            className={view === "slips" ? "active" : ""}
            onClick={() => setView("slips")}
          >
            Salary Slips
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {view === "home" && (
          <div className="home-view">
            <h2>
              Welcome {user ? user.email.split("@")[0] : "Admin"} 👋
            </h2>
            <p>
              Manage payroll, employees, attendance, and reports in one
              place.
            </p>

            {/* Summary cards */}
            <div className="row mt-4">
              <div className="col-md-3 mb-3">
                <div className="card p-3 shadow-sm">
                  <h5>Total Employees</h5>
                  <h3>{totalEmployees}</h3>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card p-3 shadow-sm">
                  <h5>Present Today</h5>
                  <h3>{presentCount}</h3>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card p-3 shadow-sm">
                  <h5>Absent Today</h5>
                  <h3>{absentCount}</h3>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card p-3 shadow-sm">
                  <h5>On Leave Today</h5>
                  <h3>{leaveCount}</h3>
                </div>
              </div>
            </div>

            {/* Payroll + Attendance + Quick actions */}
            <div className="row mt-4">
              <div className="col-md-6 mb-3">
                <div className="card p-3 shadow-sm">
                  <h5>Payroll Snapshot</h5>
                  <p>Total Payroll: ₹{totalPayroll}</p>
                  <p>Highest Salary: ₹{highestSalary}</p>
                  <p>Lowest Salary: ₹{lowestSalary}</p>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="card p-3 shadow-sm">
                  <h5>
                    Today's Attendance{" "}
                    {latestAttendanceDate &&
                      `(${latestAttendanceDate.toLocaleDateString()})`}
                  </h5>
                  {todaysAttendance.length === 0 ? (
                    <p className="text-muted">No attendance data available.</p>
                  ) : (
                    <ul className="mb-2">
                      <li>Present: {presentCount}</li>
                      <li>Absent: {absentCount}</li>
                      <li>On Leave: {leaveCount}</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-12">
                <div className="card p-3 shadow-sm">
                  <h5>Quick Actions</h5>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <button
                      className="btn btn-primary btn-sm me-2 mb-2"
                      onClick={() => setView("employees")}
                    >
                      View Employees
                    </button>
                    <button
                      className="btn btn-secondary btn-sm me-2 mb-2"
                      onClick={() => setView("attendance")}
                    >
                      View Attendance
                    </button>
                    <button
                      className="btn btn-success btn-sm me-2 mb-2"
                      onClick={() => setView("payroll")}
                    >
                      View Payroll
                    </button>
                    <button
                      className="btn btn-info btn-sm mb-2"
                      onClick={() => setView("slips")}
                    >
                      Generate Salary Slips
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "employees" && (
          <div>
            <h3>Employee Records</h3>
            <table className="table table-striped mt-3">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id || emp.email}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.designation}</td>
                    <td>₹{emp.basicSalary}</td>
                    <td>₹{emp.allowances}</td>
                    <td>₹{emp.deductions}</td>
                    <td>₹{calculateNetSalary(emp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "payroll" && (
          <div>
            <h3>Payroll Overview</h3>
            <p>Total Payroll: ₹{totalPayroll}</p>
            <p>Highest Salary: ₹{highestSalary}</p>
            <p>Lowest Salary: ₹{lowestSalary}</p>
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id || emp.email}>
                    <td>{emp.name}</td>
                    <td>₹{calculateNetSalary(emp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "attendance" && (
          <div>
            <h3>Attendance Records</h3>
            <table className="table table-striped mt-3">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance
                  .slice() // avoid mutating state
                  .sort((a, b) => b.date - a.date) // newest first
                  .map((att, index) => (
                    <tr
                      key={att._id || `${att.employee}-${index}`}
                      className={attendanceColor(att.status)}
                    >
                      <td>{att.date.toLocaleDateString()}</td>
                      <td>{att.employee}</td>
                      <td>{att.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "slips" && (
          <div>
            <h3>Salary Slips</h3>
            <div className="row">
              {employees.map((emp) => (
                <div
                  key={emp._id || emp.email}
                  className="col-md-4 mb-3"
                >
                  <div className="card p-3 shadow-sm">
                    <h5>{emp.name}</h5>
                    <p>Email: {emp.email}</p>
                    <p>Designation: {emp.designation}</p>
                    <p>Net Salary: ₹{calculateNetSalary(emp)}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => generateSalarySlip(emp)}
                    >
                      Download Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
