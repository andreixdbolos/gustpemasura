import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Recipe from "./Recipe";
import "./CookingHistory.css";

const CookingHistory = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const historyRef = collection(db, "cooking_history");
        const q = query(
          historyRef,
          where("userId", "==", currentUser.uid),
          orderBy("completedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            servings: data.servings || { default: 4, adjustments: {} },
            prepTime: data.prepTime || "N/A",
            cookTime: data.cookTime || "N/A",
            totalTime: data.totalTime || "N/A",
            difficulty: data.difficulty || "medium",
            ingredients: data.ingredients || [],
            instructions: data.instructions || [],
            tips: data.tips || [],
            nutritionalInfo: data.nutritionalInfo || {
              calories: "N/A",
              protein: "N/A",
              carbs: "N/A",
              fat: "N/A",
            },
          };
        });

        console.log("Fetched history data:", historyData);
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching cooking history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="history-container">
        <h1>My Cooking History</h1>
        <div className="history-loading">Loading your cooking history...</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h1>My Cooking History</h1>
      <div className="history-grid">
        {history.length === 0 ? (
          <div className="history-empty">
            <p>You haven't completed any recipes yet.</p>
            <p>Start cooking and your completed recipes will appear here!</p>
          </div>
        ) : (
          history.map((recipe) => (
            <div key={recipe.id} className="history-item">
              <Recipe
                recipe={recipe}
                userId={currentUser?.uid}
                isHistoryView={true}
              />
              <div className="completion-date">
                Completed on:{" "}
                {new Date(recipe.completedAt.toDate()).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CookingHistory;
