# GustPeMasura - AI-Powered Recipe Generator

GustPeMasura is a web application that helps users discover recipes based on the ingredients they have available. Using AI technology, it generates personalized recipe suggestions and allows users to save their favorite recipes for future reference.

## Features

- **AI-Powered Recipe Generation**: Enter your available ingredients and get customized recipe suggestions
- **User Authentication**: Secure login and registration system
- **Favorite Recipes**: Save and manage your favorite recipes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive UI**:
  - Flip cards for recipe viewing in favorites
  - Real-time recipe generation
  - Easy-to-use navigation
  - Dark mode support

## Technologies Used

- **Frontend**:

  - React.js
  - React Router for navigation
  - CSS3 with modern features (Grid, Flexbox, etc.)
  - react-icons for UI icons

- **Backend/Services**:

  - Firebase Authentication
  - Firebase Firestore Database
  - OpenAI API for recipe generation

- **Development Tools**:
  - Vite
  - Git for version control

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

## Features in Detail

### Home Page

- Welcome header with engaging call-to-action
- Ingredient input form
- Real-time recipe generation
- Recipe cards with favorite functionality

### Favorites Page

- Interactive flip cards for recipe viewing
- Easy removal of favorites
- Responsive grid layout
- Loading states and empty states

### Navigation

- Responsive navbar
- User authentication status awareness
- Easy access to all main features

### Authentication

- Secure user registration
- Email/password login
- Protected routes
- Persistent login state

## Usage

1. Register for an account or log in
2. Navigate to the Home page
3. Enter ingredients in the text area (separated by commas)
4. Click "Find Recipes" to generate recipe suggestions
5. Save recipes to favorites by clicking the heart icon
6. View and manage saved recipes in the Favorites page

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

Common issues and solutions:

- **Firebase Authentication Issues**: Ensure your Firebase configuration is correct
- **API Key Issues**: Verify your environment variables are properly set
- **Build Errors**: Make sure all dependencies are installed (`npm install`)
- **Firestore Rules**: Check if your security rules are properly configured

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- OpenAI for providing the AI capabilities
- Firebase for backend services
- React community for the amazing ecosystem

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/gustpemasura](https://github.com/yourusername/gustpemasura)

## Security

- All API keys should be kept secure and never committed to the repository
- Use environment variables for sensitive information
- Keep Firebase security rules updated
- Regularly update dependencies for security patches

### Installation

1. Clone the repository:
   bash
   git clone https://github.com/yourusername/gustpemasura.git
   cd gustpemasura

2. Install dependencies:
   bash
   npm install

3. Create a Firebase project:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Get your Firebase configuration

4. Create a `.env` file in the root directory and add your environment variables:
   env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_OPENAI_API_KEY=your_openai_api_key

5. Update Firestore Rules:
   firestore
   rules_version = '2';
   service cloud.firestore {
   match /databases/{database}/documents {
   match /favorites/{document} {
   allow read, write: if request.auth != null &&
   document.startsWith(request.auth.uid);
   }
   }
   }

6. Start the development server:
   bash
   npm run dev

7. Build for production:
   bash
   npm run build

## Project Structure

src/
├── components/
│ ├── Home.jsx # Main recipe generation page
│ ├── Favorites.jsx # Saved recipes page
│ ├── Recipe.jsx # Recipe card component
│ ├── Navbar.jsx # Navigation component
│ ├── Login.jsx # Login page
│ └── Register.jsx # Registration page
├── context/
│ └── AuthContext.jsx # Authentication context
├── firebase/
│ └── firebase.js # Firebase configuration
├── App.jsx # Main application component
└── main.jsx # Application entry point
