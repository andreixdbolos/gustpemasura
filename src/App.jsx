import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Favorites from "./components/Favorites";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import CookingHistory from "./components/CookingHistory";
import PrivateRoute from "./components/PrivateRoute";
import About from "./components/About";
import Forum from "./components/Forum/Forum";

import "./App.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">Welcome to GustPeMasura!</h1>
        <p className="landing-subtitle">Get Started with Home Cooking</p>
        <div className="landing-buttons">
          <Link to="/login" className="landing-btn landing-login-btn">
            Log In
          </Link>
          <Link to="/register" className="landing-btn landing-signup-btn">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <CookingHistory />
                  </PrivateRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/forum"
                element={
                  <PrivateRoute>
                    <Forum />
                  </PrivateRoute>
                }
              />
            </Routes>
            <ThemeToggle />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
