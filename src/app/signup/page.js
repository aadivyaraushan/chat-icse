'use client';

// Import necessary dependencies
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// Firebase authentication imports
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../lib/firebase';
// Firebase database imports
import { getFirestore, setDoc, doc } from 'firebase/firestore';
// Firebase analytics imports
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

// Configure Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] });

/**
 * SignUp Component
 * Handles user registration with email, password, and grade level
 * Creates a new user document in Firestore and redirects to subjects page upon success
 */
export default function SignUp() {
  // Initialize Next.js router for navigation
  const router = useRouter();

  // Form state management
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Initialize Firebase services
  const auth = getAuth(app);
  const db = getFirestore(app);

  /**
   * Form submission handler
   * Creates new user authentication
   * Creates user document in Firestore
   * Logs signup event to analytics
   * Redirects to subjects page on success
   */
  const onSubmit = async () => {
    let errorThrown = false;
    try {
      // Validate grade is between 1-12
      if (grade <= 12 && grade >= 1) {
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(email);

        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', email), {
          topics: [''],
          grade,
          subjects: [],
        });
        console.log('user doc created');
        console.log('user signed up');

        // Log signup event if analytics is supported
        const allowed = await isSupported();
        console.log(allowed);
        if (allowed) {
          const analytics = getAnalytics(app);
          logEvent(analytics, 'sign_up');
        }
      } else {
        // Grade validation failed
        errorThrown = true;
        setError('Grade must be in the range of 1 to 12');
      }
    } catch (error) {
      // Handle Firebase authentication errors
      errorThrown = true;
      setError(`${error.message.substring(10)}`);
      console.error(error.message);
    }

    // Redirect to subjects page if no errors occurred
    if (!errorThrown) {
      router.push('subjects');
    }
  };

  return (
    // Main component layout with full-screen flex container
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white text-2xl bg-black ${inter.className}`}
    >
      {/* Page title */}
      <h1 className='text-6xl font-bold mb-1 '>Sign Up</h1>

      {/* Form container */}
      <div className='flex flex-col justify-center items-end mr-12'>
        {/* Email input field */}
        <div className='mt-2 flex flex-row w-full  justify-start'>
          <label className='mr-2 '>Email: </label>
          <input
            type='email'
            className='rounded-lg bg-zinc-900 '
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {/* Grade input field with number constraints */}
        <div className='mt-2 flex flex-row w-full justify-start'>
          <label className=' mr-2 '>Grade: </label>
          <input
            type='number'
            className='rounded-lg bg-zinc-900 '
            onChange={(e) => setGrade(e.target.value)}
            value={grade}
            max={12}
            min={1}
          />
        </div>

        {/* Password input field */}
        <div className='mt-2 flex flex-row w-full justify-start '>
          <label className='mr-2 '>Password: </label>
          <input
            type='password'
            className='rounded-lg bg-zinc-900'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Conditional error message display */}
      {error !== '' && (
        <div className='mt-2 bg-red-500 rounded-xl p-2'>{error}</div>
      )}

      {/* Submit button */}
      <button className='bg-zinc-900 p-2 rounded-2xl mt-3' onClick={onSubmit}>
        Submit
      </button>

      {/* Data usage disclosure */}
      <p className='text-xs'>
        Full disclosure: I will be using data regarding how people use the app
        for research purposes. This includes information like how frequently you
        use the app, what subjects you use it for, etc.
      </p>
    </main>
  );
}
