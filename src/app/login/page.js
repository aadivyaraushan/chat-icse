'use client'; // Directive to mark this as a client-side component in Next.js

import Image from 'next/image'; // Import the Next.js image component (imported but not used)
import { Inter } from 'next/font/google'; // Import the Inter font from Google Fonts
import { useRouter } from 'next/navigation'; // Import Next.js router for navigation
import { useEffect, useState } from 'react'; // Import React hooks for state and effects
import {
  getAuth,
  createUserWithEmailAndPassword, // Import but not used in this component
  signInWithEmailAndPassword, // Firebase auth for user login
} from 'firebase/auth';
import { app, db } from '../../lib/firebase'; // Import Firebase app and database instances
import { setDoc, doc, addDoc } from 'firebase/firestore'; // Import Firestore functions (not all used)
import { getAnalytics, logEvent } from 'firebase/analytics'; // Import Firebase Analytics for tracking
const inter = Inter({ subsets: ['latin'] }); // Initialize the Inter font with Latin subset

export default function LogIn() {
  // Initialize Next.js router for programmatic navigation
  const router = useRouter();

  // State for form fields and error handling
  const [email, setEmail] = useState(''); // State to store user email input
  const [password, setPassword] = useState(''); // State to store user password input
  const [error, setError] = useState(''); // State to store authentication errors

  // Initialize Firebase services
  const auth = getAuth(app); // Get Firebase authentication instance
  const analytics = getAnalytics(app); // Get Firebase analytics instance

  // Handle login form submission
  const onSubmit = async () => {
    let errorThrown = false;
    try {
      // Attempt to sign in using Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error) {
      // Handle authentication errors
;
      // Extract and display only the relevant part of the error message
      setError(`${error.message.substring(10)}`);
    }

    // If login is successful, log the event and redirect to subjects page
    if (!errorThrown) {
      logEvent(analytics, 'login'); // Track successful login in Firebase Analytics
      router.push('subjects'); // Navigate to subjects page
    }
  };

  return (
    // Main container with full screen height, centered content, and styling
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white text-2xl bg-black ${inter.className}`}
    >
      {/* Page title */}
      <h1 className='text-6xl font-bold mb-1 '>Log In</h1>

      {/* Form container with right-aligned inputs */}
      <div className='flex flex-col justify-center items-end mr-12'>
        {/* Email input field */}
        <div className='mt-2 '>
          <label className=''>Email: </label>
          <input
            type='email'
            className='rounded-lg bg-zinc-900 '
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
      {error !== '' && (
        <div className='mt-2 bg-red-500 rounded-xl p-2'>{error}</div>
      )}

      {/* Submit button to trigger login */}
      <button className='bg-zinc-900 p-2 rounded-2xl mt-3' onClick={onSubmit}>
        Submit
      </button>
    </main>
  );
}
