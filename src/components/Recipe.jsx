import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import {
  FaHeart,
  FaRegHeart,
  FaPlay,
  FaTimes,
  FaStopwatch,
} from "react-icons/fa";
import "./Recipe.css";
import Timer from "./Timer";

const Recipe = ({ recipe, userId, onFavoriteChange, isHistoryView }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

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

  const startCookingMode = (e) => {
    e.stopPropagation();
    setCookingMode(true);
    setCurrentStep(0);
    document.body.classList.add("cooking-mode");
  };

  const exitCookingMode = () => {
    setCookingMode(false);
    setCurrentStep(0);
    document.body.classList.remove("cooking-mode");
  };

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper function to detect if step needs a timer
  const needsTimer = (step) => {
    const timePattern = /(\d+)\s*(minute|min|minutes|mins?)/i;
    return timePattern.test(step);
  };

  // Extract time from step text
  const extractTime = (step) => {
    const timePattern = /(\d+)\s*(minute|min|minutes|mins?)/i;
    const match = step.match(timePattern);
    return match ? parseInt(match[1]) : null;
  };

  const handleCookingComplete = async () => {
    if (userId && !isHistoryView) {
      try {
        await addDoc(collection(db, "cooking_history"), {
          userId,
          ...recipe,
          completedAt: new Date(),
        });
      } catch (error) {
        console.error("Error saving to cooking history:", error);
      }
    }

    setShowCompletion(true);
    setTimeout(() => {
      setShowCompletion(false);
      exitCookingMode();
    }, 3000);
  };

  if (cookingMode) {
    return (
      <div className="cooking-mode-overlay">
        {showCompletion ? (
          <div className="completion-message">
            <h2>🎉 Congrats! You've done great!</h2>
            <p>Now enjoy your meal! 😋</p>
          </div>
        ) : (
          <div className="cooking-mode-container">
            <button className="exit-cooking-mode" onClick={exitCookingMode}>
              <FaTimes />
            </button>

            <h2>{recipe.name}</h2>

            <div className="recipe-meta">
              <div className="meta-item">
                <span>Prep Time:</span> {recipe.prepTime}
              </div>
              <div className="meta-item">
                <span>Cook Time:</span> {recipe.cookTime}
              </div>
              <div className="meta-item">
                <span>Difficulty:</span> {recipe.difficulty}
              </div>
              <div className="meta-item">
                <span>Servings:</span> {recipe.servings.default}
              </div>
            </div>

            <div className="cooking-progress">
              Step {currentStep + 1} of {recipe.instructions.length}
            </div>

            <div className="current-step">
              <p>{recipe.instructions[currentStep]}</p>
              {needsTimer(recipe.instructions[currentStep]) && (
                <Timer
                  minutes={extractTime(recipe.instructions[currentStep])}
                />
              )}
            </div>

            <div className="cooking-controls">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="cooking-control-btn"
              >
                Previous
              </button>

              {currentStep === recipe.instructions.length - 1 ? (
                <button
                  onClick={handleCookingComplete}
                  className="cooking-control-btn done-btn"
                >
                  Done! 🎉
                </button>
              ) : (
                <button onClick={nextStep} className="cooking-control-btn">
                  Next Step
                </button>
              )}
            </div>

            <div className="ingredients-reference">
              <h4>Ingredients:</h4>
              <ul>
                {recipe.ingredients.map((ing, index) => (
                  <li key={index}>{ing}</li>
                ))}
              </ul>
            </div>

            <div className="cooking-tips">
              <h4>Tips:</h4>
              <ul>
                {recipe.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

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
            <button className="start-cooking-btn" onClick={startCookingMode}>
              <FaPlay /> Start Cooking
            </button>
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
            <button className="start-cooking-btn" onClick={startCookingMode}>
              <FaPlay /> Start Cooking
            </button>
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
    servings: PropTypes.shape({
      default: PropTypes.number.isRequired,
      adjustments: PropTypes.object.isRequired,
    }).isRequired,
    prepTime: PropTypes.string.isRequired,
    cookTime: PropTypes.string.isRequired,
    totalTime: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
    instructions: PropTypes.arrayOf(PropTypes.string).isRequired,
    tips: PropTypes.arrayOf(PropTypes.string).isRequired,
    nutritionalInfo: PropTypes.shape({
      calories: PropTypes.string.isRequired,
      protein: PropTypes.string.isRequired,
      carbs: PropTypes.string.isRequired,
      fat: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  userId: PropTypes.string,
  onFavoriteChange: PropTypes.func,
  isHistoryView: PropTypes.bool,
};

export default Recipe;
