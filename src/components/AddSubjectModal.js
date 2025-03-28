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
import { useEffect, useState } from 'react';
// Firebase app initialization
import { app } from '@/lib/firebase';
// Firebase analytics import
import { getAnalytics, logEvent } from 'firebase/analytics';

const AddSubjectModal = ({ showModal, setShowModal }) => {
  const [hasSlot, setHasSlot] = useState(true);
  const [subject, setSubject] = useState('Physics');
  const [curriculum, setCurriculum] = useState('IB');
  const [errorMessage, setErrorMessage] = useState('');

  const db = getFirestore(app);
  const auth = getAuth(app);
  const analytics = getAnalytics(app);

  const onSubmit = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth?.currentUser?.email));
      if (!userDoc.exists()) {
        setErrorMessage('User data not found.');
        return;
      }

      const subjectsNew = userDoc.data().subjects || [];
      const formattedSubject = `${curriculum.toLowerCase()}_${subject.toLowerCase()}`;

      if (subjectsNew.map((s) => s.toLowerCase()).includes(formattedSubject)) {
        setErrorMessage('You cannot repeat subjects');
        return;
      }

      const docRef = await addDoc(collection(db, 'chats'), {
        messages: [],
        subject: `${curriculum} ${subject}`,
        topic: '',
        user: auth?.currentUser?.email,
        isVariation: false,
        hasQuestionImage: false,
      });

      logEvent(analytics, 'subject_conversation_created', { subject });

      await updateDoc(doc(db, 'users', auth?.currentUser?.email), {
        subjects: [...subjectsNew, formattedSubject],
      });

      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding subject:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    showModal && (
      <div className='bg-zinc-900 rounded-3xl p-5 text-lg absolute inset-0 mx-auto my-auto w-96 h-96'>
        <button onClick={() => setShowModal(false)}>X</button>
        <h1 className='text-3xl font-bold text-center'>Add Subject</h1>
        {hasSlot ? (
          <div className='flex flex-col'>
            <div className='flex flex-row justify-end items-center mt-3'>
              <label>Curriculum: </label>
              <input
                className='rounded-xl w-64 text-white bg-zinc-800 p-1'
                onChange={(e) => setCurriculum(e.target.value)}
                value={curriculum}
              />
            </div>
            <div className='flex flex-row justify-end items-center mt-3'>
              <label>Name: </label>
              <input
                className='rounded-xl w-64 text-white bg-zinc-800 p-1'
                onChange={(e) => setSubject(e.target.value)}
                value={subject}
              />
            </div>
            {errorMessage && (
              <div className='bg-red-800 rounded-xl p-3 m-3'>
                <button
                  className='float-right hover:cursor-pointer'
                  onClick={() => setErrorMessage('')}
                >
                  X
                </button>
                {errorMessage}
              </div>
            )}
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
          <div className='mt-3'>
            <p>
              To add another subject, please share the app with one other user
              using the following link: (url)
            </p>
            <p className='text-sm mt-4'>
              (you&apos;ll be able to add another subject when they sign up)
            </p>
          </div>
        )}
      </div>
    )
  );
};

export default AddSubjectModal;
