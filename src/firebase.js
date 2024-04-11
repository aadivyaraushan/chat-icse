// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app };
