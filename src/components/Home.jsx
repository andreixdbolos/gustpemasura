import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import Recipe from "./Recipe";

import "./Home.css";

const Home = () => {
  const { currentUser } = useAuth();
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);

  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const startingPrompt = `Generate a JSON file with recipe ideas using ONLY the following ingredients: ${ingredients}. Use this exact format to create recipes:

  {
    "recipes": [
      {
        "name": "Recipe Name",
        "ingredients": [
          "ingredient 1",
          "ingredient 2",
          "ingredient 3"
        ],
        "instructions": [
          "",
          "",
          ""
        ]
      }
    ]
  }
  Only give me the JSON, nothing else, no other text, add emojis to the ingredients.  
  `;

  const handleIngredientSubmit = async (e) => {
    e.preventDefault();

    if (!ingredients.trim()) {
      alert("Please enter some ingredients");
      return;
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: startingPrompt,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      // Remove ```json and ``` markers before parsing
      const cleanJson = data.choices[0].message.content
        .replace(/```json\n?/, "")
        .replace(/```$/, "");

      const parsedRecipes = JSON.parse(cleanJson);
      console.log("Parsed recipe data:", parsedRecipes);

      setRecipes(parsedRecipes.recipes);
      console.log("Final recipes state:", parsedRecipes.recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to get recipes. Please try again.");
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>What's Cooking Today?</h1>
        <p className="header-subtitle">
          Transform your ingredients into delicious meals!
        </p>
        <div className="header-description">
          Simply enter the ingredients you have, and let's create something
          amazing together.
        </div>
      </header>

      <section className="search-section">
        <form onSubmit={handleIngredientSubmit}>
          <textarea
            className="ingredient-input"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Enter your ingredients (separated by commas)"
          />
          <button type="submit" className="search-button">
            Find Recipes
          </button>
        </form>
      </section>

      <section className="recipes-section">
        {recipes.map((recipe, index) => (
          <Recipe
            key={index}
            recipe={{ ...recipe, id: `recipe_${index}` }}
            userId={currentUser?.uid}
          />
        ))}
      </section>
    </div>
  );
};

export default Home;
