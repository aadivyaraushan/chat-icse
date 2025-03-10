'use client';

// Firebase authentication import
import { getAuth } from 'firebase/auth';
// Firebase Firestore imports for database operations
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
// React hooks
import { useEffect, useState, useRef } from 'react';
// Firebase app initialization
import { app } from '@/lib/firebase';
// Firebase analytics import
import { getAnalytics, logEvent } from 'firebase/analytics';

/**
 * AddSubjectModal Component
 * Modal dialog to add a new subject to the user's profile
 * Creates a new chat document and updates the user's subject list
 *
 * @param {Object} props - Component props
 * @param {boolean} props.showModal - Controls visibility of the modal
 * @param {Function} props.setShowModal - Function to update modal visibility state
 */
const AddSubjectModal = ({ showModal, setShowModal }) => {
  // State for tracking if user has available subject slots
  const [hasSlot, setHasSlot] = useState(true);
  // State for subject name with default value
  const [subject, setSubject] = useState('Physics');
  // State for curriculum type with default value
  const [curriculum, setCurriculum] = useState('IB');
  // State for error messages during submission
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize Firebase services
  const db = getFirestore(app);
  const auth = getAuth(app);
  const analytics = getAnalytics(app);

  /**
   * Form submission handler
   * Creates a new chat document for the subject
   * Updates the user's subjects list in their profile
   * Shows error if subject already exists
   */
  const onSubmit = async () => {
    // Fetch current user document to get existing subjects
    const docSnap = await getDoc(doc(db, 'users', auth?.currentUser?.email));
    console.log('docsSnap: ', docSnap.data());
    const subjectsNew = await docSnap.data().subjects;
    console.log(subjectsNew);

    // Convert all subjects to lowercase for case-insensitive comparison
    for (let i = 0; i < subjectsNew; i++) {
      subjectsNew[i] = subjectsNew[i].toLowerCase();
    }

    // Check if subject already exists for this user
    if (subjectsNew.includes(`${curriculum}_${subject}`)) {
      // Display error if subject already exists
      setErrorMessage('You cannot repeat subjects');
    } else {
      // Create new chat document for this subject
      const docRef = await addDoc(collection(db, 'chats'), {
        messages: [],
        subject: `${curriculum} ${subject}`,
        topic: '',
        user: auth?.currentUser?.email,
        isVariation: false,
        hasQuestionImage: false,
      });

      console.log(
        'document added for new conversation in subject: ',
        docRef.id
      );

      // Log subject creation event to analytics
      logEvent(analytics, 'subject_conversation_created', {
        subject,
      });

      // Add subject to user's subjects list
      console.log(curriculum, subject);
      subjectsNew.push(`${curriculum} ${subject}`);

      // Update user document with new subjects list
      await updateDoc(doc(db, 'users', auth?.currentUser?.email), {
        subjects: subjectsNew,
      });

      // Close modal and refresh page to show new subject
      setShowModal(false);
      window.location.reload();
    }
  };

  // Empty effect hook, possibly for future modal state handling
  useEffect(() => {}, [showModal]);

  return (
    <>
      {showModal ? (
        <>
          {/* Modal container with dark background */}
          <div className='bg-zinc-900 rounded-3xl p-5 text-lg absolute inset-0 mx-auto my-auto w-96 h-96  '>
            {/* Close button (X) */}
            <button
              onClick={() => {
                setShowModal(false);
              }}
            >
              <p>X</p>
            </button>

            {/* Modal title */}
            <h1 className='text-3xl font-bold text-center'>Add Subject</h1>

            {/* Conditional rendering based on available slots */}
            {hasSlot ? (
              <div className='flex flex-col '>
                {/* Curriculum input field */}
                <div className='flex flex-row justify-end items-center mt-3  '>
                  <label>Curriculum: </label>
                  <input
                    className='rounded-xl  w-64 text-white bg-zinc-800 p-1 '
                    onChange={(e) =>
                      setCurriculum(e.target.value.toLowerCase())
                    }
                  ></input>
                </div>

                {/* Subject name input field */}
                <div className='flex flex-row justify-end items-center mt-3  '>
                  <label>Name: </label>
                  <input
                    className='rounded-xl  w-64 text-white bg-zinc-800 p-1  '
                    onChange={(e) => {
                      setSubject(e.target.value.toLowerCase());
                    }}
                  />
                </div>

                {/* Conditional error message display */}
                {errorMessage !== '' && (
                  <div className='bg-red-800 rounded-xl p-3 m-3'>
                    <button
                      className='float-right  hover:cursor-pointer'
                      onClick={() => {
                        setErrorMessage('');
                      }}
                    >
                      X
                    </button>
                    {errorMessage}
                  </div>
                )}

                {/* Submit button */}
                <div className='flex flex-row justify-center items-center'>
                  <button
                    className='bg-zinc-800 p-2 rounded-2xl mt-3'
                    onClick={onSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              /* Alternative content when user has no available slots */
              <div className='mt-3'>
                <p>
                  To add another subject, please share the app with one other
                  user using the following link: (url)
                </p>
                <p className=' text-sm mt-4'>
                  (you'll be able to add another subject when they sign up)
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Render nothing when modal is hidden
        <></>
      )}
    </>
  );
};

export default AddSubjectModal;
