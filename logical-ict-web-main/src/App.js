// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import RegisterForm from "./RegisterForm";
import Home from "./Home";
import AdminDashboard from "./AdminDashboard";
import ClassViewPage from "./ClassViewPage"; // 👈 new detailed page
import AdminUserList from "./AdminUserList";
import CodingLab from "./CodingLab";
import StudentProfile from "./StudentProfile";
import AdminEnrollments from "./AdminEnrollments";

export default function App() {
  const [userType, setUserType] = useState(null); // "student" | "admin"
  const [newUser, setNewUser] = useState(false);

  const handleStudentLogin = () => setUserType("student");
  const handleNewUser = () => setNewUser(true);
  const handleCompleteRegistration = () => {
    setNewUser(false);
    setUserType("student");
  };

  const handleAdminLogin = () => setUserType("admin");
  const handleLogout = () => {
    setUserType(null);
    setNewUser(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !userType && !newUser ? (
              <Login
                onLogin={handleStudentLogin}
                onNewUser={handleNewUser}
                onAdminLogin={handleAdminLogin}
              />
            ) : newUser ? (
              <RegisterForm onComplete={handleCompleteRegistration} />
            ) : userType === "student" ? (
              <Home onLogout={handleLogout} />
            ) : (
              <AdminDashboard onLogout={handleLogout} />
            )
          }
        />

        {/* 👇 New dynamic route for class view */}
        <Route
          path="/class/:batch/:className/:month"
          element={<ClassViewPage />}
          
        />
        <Route path="/admin-users" element={<AdminUserList />} />
        {/* 👈 2. Add the new route for the Coding Lab */}
        <Route path="/coding-lab" element={<CodingLab />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/admin-enrollments" element={<AdminEnrollments />} />

      </Routes>
    </Router>
  );
}
