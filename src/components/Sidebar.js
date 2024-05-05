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
import useDebounce from '@/hooks/useDebounce';

const Sidebar = ({ subject }) => {
  const [width, setWidth] = useState(240);
  const [hidden, setHidden] = useState(false);
  const [topics, setTopics] = useState([]);
  const [minWidth, maxWidth] = [30, 850];
  // max width is 480 px
  // min is 0
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
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

    window.addEventListener('mouseup', () => {
      isResizing.current = false;
    });
  }, []);

  const onAddNewConversation = async () => {
    console.log('clicked');
    const docRef = await addDoc(collection(db, 'chats'), {
      user: auth?.currentUser?.email,
      messages: [],
      topic: '',
      subject,
      hasQuestionImage: false,
    });
    console.log('document added with ID: ', docRef.id);
    router.push(`/chat/${subject}/${docRef.id}/false`);
  };

  useEffect(() => {
    if (width === minWidth) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [width]);

  const loadChats = async (user) => {
    console.log('auth current user email exists');
    const chats = await getDocs(
      query(collection(db, 'chats'), where('user', '==', user.email))
    );
    chats.forEach((doc) => {
      setTopics((topics) => [...topics, doc.data().topic]);
    });
  };

  const debouncedLoadChats = useDebounce(loadChats, 10);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // debouncedLoadChats(user);

        // onSnapshot(doc(db, 'users', user.email), (doc) => {
        //   const userData = doc.data();
        //   setTopics(userData.topics);
        // });
        const loadChats = onSnapshot(
          query(
            collection(db, 'chats'),
            where('subject', '==', subject),
            where('user', '==', user.email)
          ),
          (querySnapshot) => {
            const topics = [];
            querySnapshot.forEach((doc) => {
              topics.push(doc.data().topic);
            });
            setTopics(topics);
          }
        );
      }
    });
  }, []);

  const onClickTopic = async (topic) => {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'chats'),
        where('topic', '==', topic),
        where('subject', '==', subject),
        where('user', '==', auth?.currentUser?.email)
      )
    );
    const docId = querySnapshot.docs[0].id;
    console.log('doc: ', querySnapshot.docs[0].isVariation);
    // const isVariation = querySnapshot.docs[0].isVariation;
    let isVariation = false;
    querySnapshot.forEach((doc) => (isVariation = doc.data().isVariation));
    router.push(`/chat/${subject}/${docId}/${isVariation}`);
  };

  return (
    <div
      ref={sidebarRef}
      className={` ${
        hidden ? 'bg-black' : 'bg-zinc-900'
      } text-white resize-x h-screen flex flex-row items-center justify-center`}
      style={{ width: `${width / 16}rem` }}
    >
      <div
        className={`flex flex-col items-center w-11/12 h-full  ${
          hidden ? 'hidden' : ''
        } `}
      >
        <button
          className={`hover:cursor-pointer p-2 bg-zinc-800 rounded-xl m-3   ${
            hidden ? 'hidden' : ''
          }`}
          onClick={onAddNewConversation}
        >
          + New Question
        </button>
        {topics.map((topic, index) => (
          <button
            className={`${
              hidden ? 'hidden' : ''
            } text-ellipsis overflow-hidden whitespace-nowrap h-6  my-1`}
            style={{ width: `${width / 16 - 4}rem` }}
            key={index}
            onClick={() => onClickTopic(topic)}
          >
            {topic}
          </button>
        ))}
        {/* <button
          className={`   ${
            hidden ? 'hidden' : ''
          } text-ellipsis overflow-hidden whitespace-nowrap h-6`}
          style={{ width: `${width / 16 - 4}rem` }}
        >
          Ball Bouncing on Wall AAAAAAAAAAAAAAA
        </button>
        <button
          className={`  ${
            hidden ? 'hidden' : ''
          } text-ellipsis overflow-hidden whitespace-nowrap h-6`}
          style={{ width: `${width / 16 - 4}rem` }}
        >
          Object on Inclined Plane
        </button> */}
      </div>
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
