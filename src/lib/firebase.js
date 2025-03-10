// Import Firebase core functionality
import { initializeApp } from 'firebase/app';

// Import Firebase authentication service
import { getAuth } from 'firebase/auth';

// Import Firestore database service
import { getFirestore } from 'firebase/firestore';

// Import Firebase analytics and support detection
import { getAnalytics, isSupported } from 'firebase/analytics';

// Load Firebase configuration from environment variables
// Configuration includes API keys, project IDs, and other Firebase-specific settings
const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);

// Initialize the Firebase application instance with the configuration
const app = initializeApp(firebaseConfig);

// Initialize the Firebase Authentication service with the app instance
const auth = getAuth(app);

// Initialize Cloud Firestore database with the app instance
const db = getFirestore(app);

// Initialize Firebase Analytics conditionally based on browser support
// This prevents errors in environments where analytics isn't supported
const analytics = isSupported().then((yes) => (yes ? getAnalytics(app) : null));

// Export the Firebase app instance for use in other parts of the application
export { app };
