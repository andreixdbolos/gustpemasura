import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  if (!currentUser) return null; // Don't show navbar if user is not logged in

  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        onClick={() => navigate("/home")}
        role="button"
        tabIndex={0}
      >
        GustPeMasura
      </div>
      <div className="navbar-links">
        <button onClick={() => navigate("/home")} className="nav-button">
          Home
        </button>
        <button onClick={() => navigate("/favorites")} className="nav-button">
          My Favorites
        </button>
        <button onClick={handleLogout} className="nav-button logout-button">
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
