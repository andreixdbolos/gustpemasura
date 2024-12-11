import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FaBell } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", currentUser.uid),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

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

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read in Firestore
      await markAsRead(notification.id);

      // Navigate to the appropriate page
      if (notification.recipeName) {
        navigate(`/forum/recipe/${notification.postId}`);
      } else {
        navigate(`/forum`);
      }

      // Close the notifications dropdown
      setShowNotifications(false);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
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

        <div className="notification-container">
          <button
            className="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && notifications.length > 0 && (
            <div className="notification-dropdown">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p>
                    <strong>{notification.senderName}</strong>{" "}
                    {notification.type === "comment"
                      ? "commented on your post"
                      : "replied to your comment"}
                    {notification.recipeName
                      ? ` in ${notification.recipeName}`
                      : ""}
                  </p>
                  <small>
                    {notification.createdAt?.toDate().toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="nav-button logout-button">
          Log Out
        </button>
      </div>

      <button
        className={`hamburger-menu ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </nav>
  );
};

export default Navbar;
