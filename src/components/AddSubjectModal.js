'use client';
import { useEffect, useState } from 'react';

const AddSubjectModal = ({ showModal, setShowModal }) => {
  const [hasSlot, setHasSlot] = useState(true);

  useEffect(() => {}, [showModal]);
  return (
    <>
      {showModal ? (
        <>
          <div className='bg-zinc-900 rounded-3xl p-5 text-lg absolute inset-0 mx-auto my-auto w-96 h-96  '>
            <button
              onClick={() => {
                setShowModal(false);
              }}
            >
              <p>X</p>
            </button>
            <h1 className='text-3xl font-bold text-center'>Add Subject</h1>
            {hasSlot ? (
              <div className='flex flex-col '>
                <div className='flex flex-row justify-end items-center mt-3  '>
                  <label>Name: </label>
                  <input className='rounded-xl  w-64 ' />
                </div>
                <div className='flex flex-row justify-end mt-3'>
                  <label>Textbook: </label>
                  <input className='rounded-xl text-base  w-64' type='file' />
                </div>
                <div className='flex flex-row justify-center items-center'>
                  <button
                    className='bg-zinc-800 p-2 rounded-2xl mt-3'
                    onClick={() => {
                      setShowModal(false);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className='mt-3'>
                <p>
                  To add another subject, please share the app with one other
                  user using the following link: (url)
                </p>
                <p className=' text-sm mt-4'>
                  (you’ll be able to add another subject when they sign up)
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default AddSubjectModal;
