'use client';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { app } from '../../lib/firebase';

const inter = Inter({ subsets: ['latin'] });

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth(app);

  const onSubmit = async () => {
    let errorThrown = false;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error) {
      errorThrown = true;
      setError(`${error.message.substring(10)}`);
    }
    if (!errorThrown) {
      router.push('subjects');
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white text-2xl bg-black ${inter.className}`}
    >
      <h1 className='text-6xl font-bold mb-1 '>Log In</h1>
      <div className='flex flex-col justify-center items-end mr-12'>
        <div className='mt-2 '>
          <label className=''>Email: </label>
          <input
            type='email'
            className='rounded-lg bg-zinc-900 '
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className='mt-2'>
          <label>Password: </label>
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
    </main>
  );
}
