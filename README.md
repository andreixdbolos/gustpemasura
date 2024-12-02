# GustPeMasura - AI-Powered Recipe Generator

GustPeMasura is a web application that helps users discover recipes based on the ingredients they have available. Using AI technology, it generates personalized recipe suggestions and allows users to save their favorite recipes for future reference.

## Features

- **AI-Powered Recipe Generation**:

  - Enter your available ingredients and get customized recipe suggestions
  - Detailed recipes with precise measurements and timing
  - Step-by-step instructions with visual cues
  - Difficulty levels for each recipe
  - Nutritional information per serving

- **User Authentication**:

  - Secure login and registration system
  - Protected routes
  - Persistent login state

- **Recipe Management**:

  - Save and manage favorite recipes
  - Cooking history tracking
  - Recipe difficulty filtering
  - Serving size adjustments
  - Detailed cooking instructions with timers
  - Adjustable serving sizes with automatic measurement conversions
  - Recipe difficulty filtering (Easy, Medium, Hard)
  - Recipe completion tracking
  - Detailed nutritional information per serving

- **Cooking Mode**:

  - Step-by-step guidance
  - Built-in timers for each step
  - Visual progress tracking
  - Cooking tips and substitutions
  - Automatic timers for cooking steps
  - Ingredient reference panel
  - Progress tracking with step counter
  - Completion celebration animation
  - Quick access to cooking tips
  - Hands-free navigation between steps

- **User Interface**:

  - Responsive design for all devices
  - Dark/Light theme toggle
  - Interactive recipe cards
  - Easy navigation
  - Loading states and empty states
  - Accessibility features
  - Interactive flip cards for recipe details
  - Animated cooking mode transitions
  - Progress indicators
  - Emoji-enhanced ingredients list
  - Touch-friendly controls
  - Visual feedback for user actions

- **User Profile Features**:
  - Personalized cooking history
  - Favorite recipes collection
  - Progress tracking
  - Achievement system for completed recipes

## Technologies Used

- **Frontend**:

  - React.js
  - React Router for navigation
  - CSS3 with modern features (Grid, Flexbox)
  - react-icons for UI icons
  - PropTypes for type checking
  - Custom hooks for state management
  - Responsive CSS Grid and Flexbox layouts
  - CSS Variables for theming

- **Backend/Services**:

  - Firebase Authentication
  - Firebase Firestore Database
  - OpenAI API for recipe generation
  - Firestore real-time updates
  - Firebase Authentication with persistent sessions
  - OpenAI GPT API for recipe generation
  - Secure data validation

- **Development Tools**:
  - Vite
  - ESLint for code quality
  - Git for version control

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository: `bash
git clone https://github.com/yourusername/gustpemasura.git
cd gustpemasura   `

2. Install dependencies: `bash
npm install   `

3. Create a `.env` file in the root directory: `env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=your_openai_api_key   `

4. Start the development server: `bash
npm run dev   `

## Usage

1. Register for an account or log in
2. Navigate to the Home page
3. Enter ingredients in the text area (separated by commas)
4. Click "Find Recipes" to generate recipe suggestions
5. Filter recipes by difficulty level if desired
6. Save recipes to favorites by clicking the heart icon
7. Use cooking mode for step-by-step guidance
8. Track your cooking history
9. Toggle between light and dark themes

Advanced Features:

1. Use the difficulty filter to find recipes matching your skill level
2. Adjust serving sizes with automatic measurement conversion
3. Enable cooking mode for step-by-step guidance with built-in timers
4. Save favorite recipes for quick access
5. View your cooking history to track completed recipes
6. Access cooking tips and substitutions during preparation
7. Use the dark/light theme toggle for comfortable viewing

## Security

- All API keys are secured using environment variables
- Firebase security rules implemented for data protection
- Authentication required for all protected routes
- Regular security updates and dependency maintenance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- OpenAI for providing the AI capabilities
- Firebase for backend services
- React community for the amazing ecosystem
