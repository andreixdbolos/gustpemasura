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
  const startingPrompt = `Generate a JSON file with detailed recipe ideas using ONLY the following ingredients: ${ingredients}. GIVE ME MULTIPLE RECIPES.   Each recipe should include precise measurements, cooking times, and detailed step-by-step instructions. Use this exact format:

  {
    "recipes": [
      {
        "name": "Recipe Name",
        "servings": {
          "default": 4,
          "adjustments": {
            "2": "halve all ingredients",
            "6": "multiply all ingredients by 1.5",
            "8": "double all ingredients"
          }
        },
        "prepTime": "15 minutes",
        "cookTime": "25 minutes",
        "totalTime": "40 minutes",
        "difficulty": "easy/medium/hard",
        "ingredients": [
          "200g ingredient 1 🥕",
          "2 cups ingredient 2 🧅",
          "3 tablespoons ingredient 3 🧂"
        ],
        "instructions": [
          "Detailed step 1 with precise measurements and timing (e.g., 'Heat olive oil in a large pan over medium heat for 2 minutes')",
          "Step 2 with temperature guidance (e.g., 'Add onions and sauté for 5 minutes until translucent')",
          "Step 3 with visual cues (e.g., 'Simmer sauce for 10 minutes until it coats the back of a spoon')"
        ],
        "tips": [
          "Helpful tip 1 about ingredient substitution",
          "Tip 2 about preparation technique",
          "Storage and reheating guidance"
        ],
        "nutritionalInfo": {
          "calories": "per serving",
          "protein": "g",
          "carbs": "g",
          "fat": "g"
        }
      }
    ]
  }
  
  Important guidelines:
  - Include exact measurements in metric and imperial units
  - Specify cooking temperatures for all heating steps
  - Include visual cues for doneness
  - Break down complex steps into smaller, manageable tasks
  - Include timing for each step
  - Add emojis to ingredients
  - Make instructions extremely detailed and beginner-friendly
  
  Only give me the JSON, nothing else, no other text.`;

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
            temperature: 1,
            max_tokens: 2000,
            n: 1,
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
