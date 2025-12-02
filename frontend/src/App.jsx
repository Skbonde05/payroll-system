import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Contact } from "./components/contact";
import { Login } from "./components/login";
import { Dashboard } from "./components/dashboard";
import JsonData from "./data/data.json";
import "./App.css";

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  const [currentPage, setCurrentPage] = useState("home"); // home | login | dashboard
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // store user details

  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  // 👇 now receives data from Login (email, password)
  const handleLogin = (loginData) => {
    // derive a simple "name" from email before '@'
    const username = loginData.email.split("@")[0];

    setIsLoggedIn(true);
    setUser({
      name: username,
      email: loginData.email,
    });
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage("home");
  };

  const handleBackToHome = () => {
    setCurrentPage("home"); // redirect to home page
  };

  return (
    <div>
      <Navigation
        user={user}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setCurrentPage("login")}
        onHomeClick={handleBackToHome}
        onLogout={handleLogout}
        onDashboardClick={() => setCurrentPage("dashboard")}
      />

      {currentPage === "home" && (
        <>
          <Header data={landingPageData.Header} />
          <Features data={landingPageData.Features} />
          <About data={landingPageData.About} />
          <Contact data={landingPageData.Contact} />
        </>
      )}

      {currentPage === "login" && (
        <Login onLogin={handleLogin} onBack={handleBackToHome} />
      )}

      {currentPage === "dashboard" && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
