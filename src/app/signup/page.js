'use client';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../lib/firebase';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

const inter = Inter({ subsets: ['latin'] });

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth(app);
  const db = getFirestore(app);

  const onSubmit = async () => {
    let errorThrown = false;
    try {
      if (grade <= 12 && grade >= 1) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(email);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', email), {
          topics: [''],
          grade,
          subjects: [],
        });
        console.log('user doc created');
        console.log('user signed up');
        const allowed = await isSupported();
        console.log(allowed);
        if (allowed) {
          const analytics = getAnalytics(app);
          logEvent(analytics, 'sign_up');
        }
      } else {
        errorThrown = true;
        setError('Grade must be in the range of 1 to 12');
      }
    } catch (error) {
      errorThrown = true;
      setError(`${error.message.substring(10)}`);
      console.error(error.message);
    }

    if (!errorThrown) {
      router.push('subjects');
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white text-2xl bg-black ${inter.className}`}
    >
      <h1 className='text-6xl font-bold mb-1 '>Sign Up</h1>
      <div className='flex flex-col justify-center items-end mr-12'>
        <div className='mt-2 flex flex-row w-full  justify-start'>
          <label className='mr-2 '>Email: </label>
          <input
            type='email'
            className='rounded-lg bg-zinc-900 '
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
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
      {error !== '' && (
        <div className='mt-2 bg-red-500 rounded-xl p-2'>{error}</div>
      )}
      <button className='bg-zinc-900 p-2 rounded-2xl mt-3' onClick={onSubmit}>
        Submit
      </button>
      <p className='text-xs'>
        Full disclosure: I will be using data regarding how people use the app
        for research purposes. This includes information like how frequently you
        use the app, what subjects you use it for, etc. Also, data will be
        collected from a form that you will be requested to fill in when using
        the app.
      </p>
    </main>
  );
}
