import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./Recipe.css";

const Recipe = ({ recipe, userId, onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, [userId, recipe.id]);

  const checkIfFavorite = async () => {
    if (!userId) return;
    const docRef = doc(db, "favorites", `${userId}_${recipe.id}`);
    const docSnap = await getDoc(docRef);
    setIsFavorite(docSnap.exists());
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent card flip when clicking favorite button
    if (!userId) return;

    const favoriteRef = doc(db, "favorites", `${userId}_${recipe.id}`);

    try {
      if (isFavorite) {
        await deleteDoc(favoriteRef);
      } else {
        await setDoc(favoriteRef, {
          userId,
          recipeId: recipe.id,
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          dateAdded: new Date(),
        });
      }
      setIsFavorite(!isFavorite);
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleClick = (e) => {
    if (e.target.closest(".favorite-btn")) {
      return;
    }
    setIsFlipped(!isFlipped);
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
              className="favorite-btn"
              onClick={toggleFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {isFavorite ? (
                <FaHeart className="heart-filled" />
              ) : (
                <FaRegHeart />
              )}
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

        {/* Back of the card */}
        <div className="flip-card-back">
          <div className="card-header">
            <h3>{recipe.name}</h3>
            <button
              className="favorite-btn"
              onClick={toggleFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {isFavorite ? (
                <FaHeart className="heart-filled" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          </div>
          <div className="instructions-list">
            <h4>Instructions:</h4>
            <ol>
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="card-footer">
            <small>Click to see ingredients</small>
          </div>
        </div>
      </div>
    </div>
  );
};

Recipe.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
    instructions: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  userId: PropTypes.string,
  onFavoriteChange: PropTypes.func,
};

export default Recipe;
