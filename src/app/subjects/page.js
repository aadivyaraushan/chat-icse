'use client';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import AddSubjectModal from '@/components/AddSubjectModal';
import { useEffect, useState } from 'react';
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
import { app } from '../../lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
const inter = Inter({ subsets: ['latin'] });

const Subjects = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const onSubmit = async (subject) => {
    console.log(subject);
    console.log(auth?.currentUser?.email);
    // access the user's latest topic
    const userDoc = await getDoc(doc(db, 'users', auth?.currentUser?.email));

    const latestTopic = userDoc.data().topics[userDoc.data().topics.length - 1];
    console.log(latestTopic);

    // // access the chat ID of the user's latest topic
    const querySnapshot = await getDocs(
      query(
        collection(db, 'chats'),
        where('topic', '==', latestTopic),
        where('user', '==', auth?.currentUser?.email),
        where('subject', '==', subject)
      )
    );
    console.log(querySnapshot.docs);

    // const isVariation = querySnapshot.docs[0].isVariation;
    let isVariation = false;
    querySnapshot.forEach((doc) => (isVariation = doc.data().isVariation));
    console.log('ID: ', querySnapshot.docs[0]);
    const latestId = querySnapshot.docs[0].id;
    // ok if the user has no chats at all then they would start with there being no latest topic right
    // actually hmm i have to figure out this architecture
    // so does the userDoc need to already exist or does it need to be created?
    // i think its better if it exists from log in
    // and the initial topic is set to be like empty.
    // ok makes sense.
    // route to the user's latest chat
    logEvent(analytics, 'app_opened');
    router.push(`chat/${subject}/${latestId}/${isVariation}`);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log('user: ', user);
      if (user) {
        console.log('new user email: ', user.email);
        const setUserSubjects = async () => {
          if (auth?.currentUser?.email) {
            const email = auth?.currentUser?.email;
            console.log('email: ', email);
            const userDoc = await getDoc(doc(db, 'users', email));
            if (userDoc.exists()) {
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
  }, []);

  useEffect(() => {
    console.log(subjects);
  }, [subjects]);

  return (
    <main
      className={` min-h-screen p-24 text-white text-2xl bg-black  ${inter.className} flex flex-col justify-center items-center`}
    >
      <h1 className=' text-6xl font-bold text-center '>Subjects</h1>
      <div className='flex flex-row items-center justify-center'>
        {/* <button
          className='m-4 bg-zinc-900 p-2 rounded-xl'
          onClick={() => onSubmit('math')}
        >
          Math
        </button> */}
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
        <button
          className='m-4 bg-zinc-900 p-2 rounded-xl'
          onClick={() => setShowModal(true)}
        >
          + New Subject
        </button>
      </div>
      {<AddSubjectModal showModal={showModal} setShowModal={setShowModal} />}
    </main>
  );
};

export default Subjects;
