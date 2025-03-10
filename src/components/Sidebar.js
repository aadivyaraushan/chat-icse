'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { app } from '../lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import useDebounce from '@/hooks/useDebounce';
import { getAnalytics } from 'firebase/analytics';

const Sidebar = ({ subject }) => {
  // State for controlling sidebar width and visibility
  const [width, setWidth] = useState(240); // Initial sidebar width in pixels
  const [hidden, setHidden] = useState(false); // Controls whether sidebar content is hidden
  const [topics, setTopics] = useState([]); // Stores chat topics from Firestore
  const [minWidth, maxWidth] = [30, 850]; // Constraints for sidebar resizing

  // References for DOM manipulation and resize tracking
  const sidebarRef = useRef(null); // Reference to the sidebar DOM element
  const isResizing = useRef(false); // Tracks whether user is currently resizing the sidebar

  // Hooks for navigation and Firebase services
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const analytics = getAnalytics(app);

  // Effect for handling sidebar resizing via mouse events
  useEffect(() => {
    // Update sidebar width when mouse moves during resize operation
    window.addEventListener('mousemove', (e) => {
      if (!isResizing.current) {
        return;
      }
      setWidth((previousWidth) => {
        const newWidth = previousWidth + e.movementX / 2;
        const isWidthInRange = newWidth >= minWidth && newWidth <= maxWidth;
        return isWidthInRange ? newWidth : previousWidth;
      });
    });

    // Stop resize operation when mouse button is released
    window.addEventListener('mouseup', () => {
      isResizing.current = false;
    });
  }, [maxWidth, minWidth]);

  // Function to create a new chat conversation in Firestore
  const onAddNewConversation = async () => {
    console.log('clicked');
    // Add new document to 'chats' collection with initial data
    const docRef = await addDoc(collection(db, 'chats'), {
      user: auth?.currentUser?.email,
      messages: [],
      topic: '',
      subject,
      hasQuestionImage: false,
    });
    console.log('document added with ID: ', docRef.id);

    // Log analytics event for conversation creation
    logEvent(analytics, 'subject_conversation_created', {
      subject,
    });

    // Navigate to the newly created chat
    router.push(`/chat/${subject}/${docRef.id}/false`);
  };

  // Effect to update sidebar visibility based on width
  useEffect(() => {
    // Hide sidebar content when width is at minimum
    if (width === minWidth) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [width, minWidth]);

  // Function to fetch user's chats from Firestore
  const loadChats = async (user) => {
    console.log('auth current user email exists');
    // Query Firestore for chats belonging to current user
    const chats = await getDocs(
      query(collection(db, 'chats'), where('user', '==', user.email))
    );
    // Add each chat topic to state
    chats.forEach((doc) => {
      setTopics((topics) => [...topics, doc.data().topic]);
    });
  };

  // Create debounced version of loadChats to avoid excessive calls
  const debouncedLoadChats = useDebounce(loadChats, 10);

  // Effect to listen for real-time updates to user's chats
  useEffect(() => {
    // Set up authentication state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Create real-time listener for chats matching subject and user
        const loadChats = onSnapshot(
          query(
            collection(db, 'chats'),
            where('subject', '==', subject),
            where('user', '==', user.email)
          ),
          (querySnapshot) => {
            const topics = [];
            // Extract topics from query results
            querySnapshot.forEach((doc) => {
              topics.push(doc.data().topic);
            });
            setTopics(topics);
          }
        );
      }
    });
  }, [auth, db]);

  // Function to handle clicking on a chat topic
  const onClickTopic = async (topic) => {
    // Query Firestore for the specific chat document
    const querySnapshot = await getDocs(
      query(
        collection(db, 'chats'),
        where('topic', '==', topic),
        where('subject', '==', subject),
        where('user', '==', auth?.currentUser?.email)
      )
    );
    // Get document ID from query result
    const docId = querySnapshot.docs[0].id;
    console.log('doc: ', querySnapshot.docs[0].isVariation);

    // Determine if chat is a variation type
    let isVariation = false;
    querySnapshot.forEach((doc) => (isVariation = doc.data().isVariation));

    // Navigate to the selected chat
    router.push(`/chat/${subject}/${docId}/${isVariation}`);
  };

  return (
    <div
      ref={sidebarRef}
      className={` ${
        hidden ? 'bg-black' : 'bg-zinc-900'
      } text-white resize-x h-screen flex flex-row items-center justify-center`}
      style={{ width: `${width / 16}rem` }} // Convert pixels to rem for responsive sizing
    >
      {/* Main sidebar content container */}
      <div
        className={`flex flex-col items-center w-11/12 h-full  ${
          hidden ? 'hidden' : ''
        } `}
      >
        {/* Button to create new conversation */}
        <button
          className={`hover:cursor-pointer p-2 bg-zinc-800 rounded-xl m-3   ${
            hidden ? 'hidden' : ''
          }`}
          onClick={onAddNewConversation}
        >
          + New Question
        </button>

        {/* Render list of existing chat topics */}
        {topics.map((topic, index) => (
          <button
            className={`${
              hidden ? 'hidden' : ''
            } text-ellipsis overflow-hidden whitespace-nowrap h-6  my-1`}
            style={{ width: `${width / 16 - 4}rem` }} // Adjust button width based on sidebar width
            key={index}
            onClick={() => onClickTopic(topic)}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Resize handle for sidebar */}
      <button
        className=' bg-zinc-100  w-2 h-10 rounded-xl'
        onMouseDown={() => {
          isResizing.current = true;
        }}
      ></button>
    </div>
  );
};

export default Sidebar;
