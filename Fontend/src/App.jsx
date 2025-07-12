import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Common/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Profile from "./components/Profile/Profile";
import SessionCreate from "./components/Session/SessionCreate";
import SessionRoom from "./components/Session/SessionRoom";
import FeedbackReport from "./components/Session/FeedbackReport";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/session/create" element={<SessionCreate />} />
            <Route path="/session/:id" element={<SessionRoom />} />
            <Route path="/report/:sessionId" element={<FeedbackReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
