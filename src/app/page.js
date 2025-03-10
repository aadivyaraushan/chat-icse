'use client';

// Import the Inter font from Google Fonts
import { Inter } from 'next/font/google';
// Import the router for client-side navigation
import { useRouter } from 'next/navigation';

// Configure Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] });

/**
 * Home Component
 * Landing page of the application that provides options to sign up or log in
 * Serves as the entry point for unauthenticated users
 *
 * @returns {JSX.Element} The landing page UI with navigation buttons
 */
export default function Home() {
  // Initialize Next.js router for navigation
  const router = useRouter();

  return (
    // Main container with full screen height and centered content
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white bg-black text-2xl ${inter.className}`}
    >
      {/* Main headline */}
      <h1 className='text-6xl font-bold '>Welcome!</h1>

      {/* Navigation buttons container */}
      <div className=' mt-2 '>
        {/* Sign up button - redirects to signup page */}
        <button
          className='rounded-xl bg-zinc-900 text-white p-3 w-28 mr-5 '
          onClick={() => router.push('signup')}
        >
          Sign up
        </button>

        {/* Log in button - redirects to login page */}
        <button
          className='rounded-xl bg-zinc-900 text-white p-3 w-28 '
          onClick={() => router.push('login')}
        >
          Log in
        </button>
      </div>
    </main>
  );
}
