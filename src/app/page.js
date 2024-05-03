'use client';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const router = useRouter();

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white bg-black text-2xl ${inter.className}`}
    >
      <h1 className='text-6xl font-bold '>Welcome!</h1>
      <div className=' mt-2 '>
        <button
          className='rounded-xl bg-zinc-900 text-white p-3 w-28 mr-5 '
          onClick={() => router.push('signup')}
        >
          Sign up
        </button>
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
