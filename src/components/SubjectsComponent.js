'use client';

// Import necessary dependencies
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import AddSubjectModal from '@/components/AddSubjectModal';
import { useEffect, useState } from 'react';
// Firebase Firestore imports for database operations
import {
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { app } from '../lib/firebase';
// Firebase authentication imports
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// Firebase analytics import
import { getAnalytics, logEvent } from 'firebase/analytics';

// Configure Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] });

/**
 * Subjects Component
 * Displays a list of the user's subjects and allows them to add new ones
 * Handles navigation to specific subject chats
 */
const SubjectsComponent = () => {
  // Initialize Next.js router for navigation
  const router = useRouter();
  // State for controlling the "Add Subject" modal visibility
  const [showModal, setShowModal] = useState(false);
  // State to store the user's subjects loaded from Firestore
  const [subjects, setSubjects] = useState([]);

  // Initialize Firebase services
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  /**
   * Subject selection handler
   * Retrieves the latest chat for the selected subject and navigates to it
   * @param {string} subject - The selected subject name
   */
  const onSubmit = async (subject) => {
    console.log(subject);
    console.log(auth?.currentUser?.email);

    // Query for all chats with the current user and selected subject
    const querySnapshot = await getDocs(
      query(
        collection(db, 'chats'),
        where('user', '==', auth?.currentUser?.email),
        where('subject', '==', subject)
      )
    );
    console.log(querySnapshot.docs);

    // Determine if this is a variation chat (different UI/behavior)
    let isVariation = false;
    querySnapshot.forEach((doc) => (isVariation = doc.data().isVariation));
    console.log('ID: ', querySnapshot.docs[querySnapshot.docs.length - 1]);

    // Get the ID of the first chat document found
    const latestId = querySnapshot.docs[0].id;

    // Log app_opened event to Firebase Analytics
    logEvent(analytics, 'app_opened');

    // Navigate to the chat page with subject, chat ID, and variation flag
    router.push(`chat/${subject}/${latestId}/${isVariation}`);
  };

  /**
   * Effect hook to load user subjects when authentication state changes
   * Retrieves the current user's subjects from their Firestore document
   */
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log('user: ', user);
      if (user) {
        console.log('new user email: ', user.email);

        // Function to fetch and set the user's subjects
        const setUserSubjects = async () => {
          if (auth?.currentUser?.email) {
            const email = auth?.currentUser?.email;
            console.log('email: ', email);

            // Get the user document from Firestore
            const userDoc = await getDoc(doc(db, 'users', email));
            if (userDoc.exists()) {
              // Extract subjects array from user document
              const subjects = await userDoc.data().subjects;
              setSubjects(subjects);
            } else {
              console.error("User doesn't exist");
            }
          } else {
            console.log('email undefined');
          }
        };

        setUserSubjects();
      }
    });
  }, [auth, db]);

  // Debug effect to log subjects whenever they change
  useEffect(() => {
    console.log(subjects);
  }, [subjects]);

  return (
    // Main component layout with full-screen container
    <main
      className={` min-h-screen p-24 text-white text-2xl bg-black  ${inter.className} flex flex-col justify-center items-center`}
    >
      {/* Page title */}
      <h1 className=' text-6xl font-bold text-center '>Subjects</h1>

      {/* Subjects grid/list container */}
      <div className='flex flex-row items-center justify-center'>
        {/* Dynamically generate buttons for each subject */}
        {subjects &&
          subjects.map((subject, index) => (
            <button
              className='m-4 bg-zinc-900 p-2 rounded-xl'
              onClick={() => onSubmit(subject)}
              key={index}
            >
              {subject}
            </button>
          ))}

        {/* Button to add a new subject */}
        <button
          className='m-4 bg-zinc-900 p-2 rounded-xl'
          onClick={() => setShowModal(true)}
        >
          + New Subject
        </button>
      </div>

      {/* Add Subject Modal component (conditionally shown) */}
      {<AddSubjectModal showModal={showModal} setShowModal={setShowModal} />}
    </main>
  );
};

export default SubjectsComponent;
