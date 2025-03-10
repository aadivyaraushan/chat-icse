'use client'; // Ensures this component runs only on the client side in Next.js

import { Inter } from 'next/font/google'; // Import Inter font from Google Fonts
import { useRouter } from 'next/navigation'; // Import Next.js router for navigation
import { useEffect, useState } from 'react'; // Import React hooks for state management
import {
  getAuth,
  signInWithEmailAndPassword, // Firebase authentication for signing in users
} from 'firebase/auth';
import { app } from '../../lib/firebase'; // Import Firebase app instance
import { getAnalytics, logEvent } from 'firebase/analytics'; // Firebase Analytics for event tracking

const inter = Inter({ subsets: ['latin'] }); // Initialize the Inter font with Latin subset

export default function LogIn() {
  const router = useRouter(); // Initialize Next.js router

  // State for storing form input values and error messages
  const [email, setEmail] = useState(''); // Stores the user email input
  const [password, setPassword] = useState(''); // Stores the user password input
  const [error, setError] = useState(''); // Stores authentication errors
  const [isClient, setIsClient] = useState(false); // Ensures component runs only on the client

  // Ensure the component is mounted on the client before executing Firebase-related logic
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle login submission
  const onSubmit = async () => {
    if (!isClient) return; // Prevent execution on the server

    const auth = getAuth(app); // Get Firebase authentication instance
    const analytics = getAnalytics(app); // Get Firebase analytics instance

    try {
      // Attempt to sign in using Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      logEvent(analytics, 'login'); // Track login event in Firebase Analytics
      router.push('subjects'); // Navigate to the subjects page upon successful login
    } catch (error) {
      // Extract and display only the relevant part of the error message
      setError(error.message.substring(10));
    }
  };

  // Prevents rendering on the server
  if (!isClient) return null;

  return (
    // Main container with full-screen height, centered content, and styling
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white text-2xl bg-black ${inter.className}`}
    >
      {/* Page title */}
      <h1 className='text-6xl font-bold mb-1'>Log In</h1>

      {/* Form container with right-aligned inputs */}
      <div className='flex flex-col justify-center items-end mr-12'>
        {/* Email input field */}
        <div className='mt-2'>
          <label>Email: </label>
          <input
            type='email'
            className='rounded-lg bg-zinc-900'
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
            value={email} // Controlled component pattern
          />
        </div>

        {/* Password input field */}
        <div className='mt-2'>
          <label>Password: </label>
          <input
            type='password'
            className='rounded-lg bg-zinc-900'
            value={password} // Controlled component pattern
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
          />
        </div>
      </div>

      {/* Conditional error message display */}
      {error && <div className='mt-2 bg-red-500 rounded-xl p-2'>{error}</div>}

      {/* Submit button to trigger login */}
      <button className='bg-zinc-900 p-2 rounded-2xl mt-3' onClick={onSubmit}>
        Submit
      </button>
    </main>
  );
}
