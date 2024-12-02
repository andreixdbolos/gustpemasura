import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <section className="about-header">
        <h1>About GustPeMasura</h1>
        <p className="tagline">Your AI-Powered Kitchen Assistant</p>
      </section>

      <section className="about-content">
        <div className="about-description">
          <h2>What is GustPeMasura?</h2>
          <p>
            GustPeMasura is your intelligent cooking companion that transforms
            available ingredients into delicious recipes. Using advanced AI
            technology, we help you discover creative and practical cooking
            solutions based on what you have in your kitchen.
          </p>
        </div>

        <div className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🤖</span>
              <h3>AI-Powered Recipes</h3>
              <p>
                Get personalized recipe suggestions based on your ingredients
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⭐</span>
              <h3>Save Favorites</h3>
              <p>Keep track of your favorite recipes for quick access</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <h3>Cooking Mode</h3>
              <p>Step-by-step guidance with built-in timers</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📖</span>
              <h3>Cooking History</h3>
              <p>Track your culinary journey and completed recipes</p>
            </div>
          </div>
        </div>

        <div className="tutorial-section">
          <h2>How to Use GustPeMasura</h2>
          <div className="tutorial-steps">
            <div className="tutorial-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Enter Your Ingredients</h3>
                <p>
                  List the ingredients you have available in your kitchen,
                  separated by commas. The more ingredients you add, the more
                  recipe options you'll get!
                </p>
              </div>
            </div>

            <div className="tutorial-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Generate Recipes</h3>
                <p>
                  Click "Find Recipes" and let our AI suggest personalized
                  recipes based on your ingredients. You can filter recipes by
                  difficulty level to match your cooking expertise.
                </p>
              </div>
            </div>

            <div className="tutorial-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Start Cooking</h3>
                <p>
                  Choose a recipe and click "Start Cooking" to enter cooking
                  mode. Follow the step-by-step instructions with built-in
                  timers for perfect results every time.
                </p>
              </div>
            </div>

            <div className="tutorial-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Save and Track</h3>
                <p>
                  Save your favorite recipes and track your cooking history.
                  Build your personal cookbook with recipes you love!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="get-started-section">
          <h2>Ready to Cook?</h2>
          <p>Start your culinary journey with GustPeMasura today!</p>
          <Link to="/home" className="get-started-btn">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
