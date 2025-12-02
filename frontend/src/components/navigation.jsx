import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa"; // user icon

export const Navigation = ({
  user,
  isLoggedIn,
  onLoginClick,
  onHomeClick,
  onLogout,
  onDashboardClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Extract username from email
  const getUsername = (email) => {
    if (!email) return "";
    return email.split("@")[0]; // everything before @
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <a
            className="navbar-brand page-scroll"
            onClick={onHomeClick}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <img
              src="img/logo.png"
              href="#header"
              alt="Smart Payroll Portal"
              style={{ height: "50px", marginRight: "10px" }}
            />
            <span style={{ fontSize: "20px", fontWeight: "bold", href: "#header" }}>
              Smart Payroll Portal
            </span>
          </a>
        </div>

        <div className="collapse navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            {/* Use anchors for landing page sections */}
            <li>
              <a
                href="#header"
                onClick={onHomeClick}
                style={{ cursor: "pointer" }}
                className="page-scroll"
              >
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="page-scroll">
                Features
              </a>
            </li>
            <li>
              <a href="#about" className="page-scroll">
                About
              </a>
            </li>
            <li>
              <a href="#contact" className="page-scroll">
                Contact
              </a>
            </li>

            {/* Login or User Dropdown */}
            <li style={{ marginLeft: "15px", position: "relative" }}>
              {isLoggedIn && user ? (
                <a
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px 10px",
                  }}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <FaUserCircle
                    size={22}
                    style={{ marginRight: "6px", color: "#007bff" }}
                  />
                  <span style={{ fontWeight: "bold" }}>
                    {getUsername(user.email)}
                  </span>
                </a>
              ) : (
                <a
                  onClick={onLoginClick}
                  style={{
                    cursor: "pointer",
                    padding: "8px 10px",
                    fontWeight: "bold",
                    color: "#007bff",
                  }}
                >
                  Login
                </a>
              )}

              {/* Dropdown Menu */}
              {dropdownOpen && isLoggedIn && user && (
                <ul
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    listStyle: "none",
                    padding: "10px 0",
                    margin: 0,
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                    zIndex: 999,
                  }}
                >
                  <li
                    style={{ padding: "8px 20px", cursor: "pointer" }}
                    onClick={() => {
                      setDropdownOpen(false);
                      onDashboardClick();
                    }}
                  >
                    Dashboard
                  </li>
                  <li
                    style={{
                      padding: "8px 20px",
                      cursor: "pointer",
                      color: "red",
                    }}
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
