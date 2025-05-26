# Progressive Overload App

Progressive Overload is a fitness tracking application designed to help users monitor their workout progress and achieve their fitness goals. The app focuses on tracking progressive overload, a key principle in strength training.

## Features

- **User Authentication**: Sign up and log in using email/password or Google authentication.
- **Workout Tracking**: Log workouts with details like weight, reps, and sets.
- **Progressive Overload Analysis**: View progression history and track improvements over time.
- **Muscle Group Organization**: Exercises are categorized by muscle groups for easy navigation.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Styled Components
- **Backend**: Firebase Authentication, Firestore Database
- **Build Tool**: Vite
- **State Management**: Recoil
- **Icons**: Lucide React, React Icons

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account with a configured project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/progressive-overload.git
   cd progressive-overload
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a `.env` file in the root directory.
   - Add your Firebase configuration:
     ```properties
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the app in your browser:
   ```
   http://localhost:5173
   ```

### Build for Production

To build the app for production, run:
```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Usage

1. **Sign Up**: Create an account using your email or Google.
2. **Log Workouts**: Navigate to the "Workouts" or "Exercises" page to log your workouts.
3. **Track Progress**: View your progression history and analyze your improvements over time.
4. **Explore Exercises**: Browse exercises categorized by muscle groups.

## Project Structure

```
progressive-overload/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Application pages
│   ├── firebase.ts        # Firebase configuration
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
└── README.md              # Project documentation
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your fork:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.


## Acknowledgments

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
