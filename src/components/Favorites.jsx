import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import PropTypes from "prop-types";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaHeart, FaMinus } from "react-icons/fa";
import "./Favorites.css";

const RecipeCard = ({ recipe, userId, onFavoriteChange }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { currentUser } = useAuth();

  const handleClick = (e) => {
    if (e.target.closest(".remove-btn")) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    try {
      const favoriteRef = doc(db, "favorites", `${userId}_${recipe.id}`);
      await deleteDoc(favoriteRef);
      onFavoriteChange();
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addDoc(collection(db, "forum_posts"), {
        content: commentText,
        userId: currentUser.uid,
        userName: currentUser.email,
        category: "recipes",
        createdAt: serverTimestamp(),
        likes: 0,
        votes: {},
        comments: [],
        recipeId: recipe.id,
        recipeName: recipe.name,
      });
      setCommentText("");
      setShowComments(false);
    } catch (error) {
      console.error("Error creating recipe discussion:", error);
    }
  };

  return (
    <div
      className={`flip-card ${isFlipped ? "is-flipped" : ""}`}
      onClick={handleClick}
    >
      <div className="flip-card-inner">
        {/* Front of the card */}
        <div className="flip-card-front">
          <div className="card-header">
            <h3>{recipe.name}</h3>
            <button
              className="remove-btn"
              onClick={handleRemove}
              aria-label="Remove from favorites"
            >
              <FaMinus />
            </button>
          </div>
          <div className="ingredients-list">
            <h4>Ingredients:</h4>
            <ul>
              {recipe.ingredients.map((ing, index) => (
                <li key={index}>{ing}</li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <small>Click to see instructions</small>
          </div>
        </div>

        <div className="flip-card-back">
          <div className="card-header">
            <h3>Instructions</h3>
            <button
              className="remove-btn"
              onClick={handleRemove}
              aria-label="Remove from favorites"
            >
              <FaMinus />
            </button>
          </div>
          <ol className="instructions-list">
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <div className="card-footer">
            <small>Click to see ingredients</small>
          </div>
        </div>
      </div>
      <div className="recipe-actions">
        <button
          className="comment-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
        >
          💬 Discuss Recipe
        </button>
      </div>

      {showComments && (
        <div
          className="recipe-comment-form"
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts about this recipe..."
            className="comment-input"
          />
          <button onClick={handleComment} className="comment-submit-btn">
            Post Discussion
          </button>
        </div>
      )}
    </div>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
    instructions: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  onFavoriteChange: PropTypes.func.isRequired,
};

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchFavorites = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching favorites for user:", currentUser.uid);
      const q = query(
        collection(db, "favorites"),
        where("userId", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      console.log("Fetched favorites count:", querySnapshot.docs.length);

      const favoritesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Raw favorites data:", favoritesData);

      const formattedFavorites = favoritesData.map((fav) => ({
        id: fav.recipeId,
        name: fav.name,
        ingredients: fav.ingredients || [],
        instructions: fav.instructions || [],
      }));
      console.log("Formatted favorites:", formattedFavorites);

      setFavorites(formattedFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="favorites-container">
        <h1>My Favorite Recipes</h1>
        <div className="favorites-loading">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h1>My Favorite Recipes</h1>
      <div className="favorites-grid">
        {favorites.length === 0 ? (
          <div className="favorites-empty">
            No favorite recipes yet. Add some from the recipe finder!
          </div>
        ) : (
          favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              userId={currentUser?.uid}
              onFavoriteChange={fetchFavorites}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;
