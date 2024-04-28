import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import AddSubjectModal from '@/components/AddSubjectModal';
import { useState } from 'react';
const inter = Inter({ subsets: ['latin'] });

const Subjects = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const onSubmit = async (subject) => {
    router.push('app');
  };

  return (
    <main
      className={` min-h-screen p-24 text-white text-2xl bg-black  ${inter.className} flex flex-col justify-center items-center`}
    >
      <h1 className=' text-6xl font-bold text-center '>Subjects</h1>
      <div className='flex flex-row items-center justify-center'>
        <button
          className='m-4 bg-zinc-900 p-2 rounded-xl'
          onClick={() => onSubmit('physics')}
        >
          Physics
        </button>
        <button
          className='m-4 bg-zinc-900 p-2 rounded-xl'
          onClick={() => onSubmit('math')}
        >
          Math
        </button>
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
