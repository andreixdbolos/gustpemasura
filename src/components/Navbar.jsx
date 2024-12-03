import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <button
        onClick={() => handleNavigation("/home")}
        className="nav-logo"
        aria-label="Go to homepage"
      >
        GustPeMasura
      </button>

      <button
        className={`hamburger-menu ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        <button
          onClick={() => handleNavigation("/home")}
          className="nav-button"
        >
          Home
        </button>
        <button
          onClick={() => handleNavigation("/favorites")}
          className="nav-button"
        >
          My Favorites
        </button>
        <button
          onClick={() => handleNavigation("/history")}
          className="nav-button"
        >
          My Cooking History
        </button>
        <button
          onClick={() => handleNavigation("/forum")}
          className="nav-button"
        >
          Forum
        </button>
        <button
          onClick={() => handleNavigation("/about")}
          className="nav-button"
        >
          About
        </button>
        <button onClick={handleLogout} className="nav-button logout-button">
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
