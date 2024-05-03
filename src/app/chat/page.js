'use client';
import Sidebar from '@/components/Sidebar';
import { Inter } from 'next/font/google';
// import dynamic from 'next/dynamic';
import TextbookPane from '@/components/TextbookPane';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import Message from '@/components/Message';
import { useState, useRef, useEffect } from 'react';
// import { sendMessage } from '../../backend';
import { useChat } from 'ai/react';
const inter = Inter({ subsets: ['latin'] });

const App = () => {
  const [message, setMessage] = useState();
  const [imageFile, setImageFile] = useState(null);
  const [questionShown, setQuestionShown] = useState(false);
  const inputRef = useRef(null);
  const { messages, input, setInput, handleInputChange, handleSubmit } =
    useChat();

  // const onSubmit = async () => {
  //   const response = await fetch('http://127.0.0.1:5000/sendMessage', {
  //     method: 'POST',
  //     cache: 'no-cache',
  //     credentials: 'same-origin',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     redirect: 'follow',
  //     referrerPolicy: 'no-referrer',
  //     body: JSON.stringify({ text: message }),
  //   });

  //   console.log(response.json());
  // };

  // const onSubmit = async () => {
  //   const messageHistory = [];
  //   for (let message of messages) {
  //     // messageHistory.push(message.message);
  //     if (message.fromUser) {
  //       messageHistory.push(new HumanMessage(message.message));
  //     } else {
  //       messageHistory.push(new AIMessage(message.message));
  //     }
  //   }
  //   const result = await sendMessage(message, messageHistory);
  //   setMessages((messages) => [...messages, { message, fromUser: true }]);
  //   const AIMessage = result.content;
  //   setMessages((messages) => [
  //     ...messages,
  //     { message: AIMessage, fromUser: false },
  //   ]);
  // };

  const onSubmit = async (e) => {
    handleSubmit(e);
  };

  const handleImagePaste = async (e) => {
    e.preventDefault();
    console.log('image pasted');
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const imageFile = items[i].getAsFile();
        const imageData = await readFileAsDataURL(imageFile);
        setImageFile(imageData);
        console.log('input ref done');
      }
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    console.log(imageFile);
  }, [imageFile]);

  return (
    <div className='bg-black text-white flex flex-row w-screen h-screen'>
      <Sidebar />
      <div className='flex flex-col w-full   '>
        <div className=' text-white bg-black h-full overflow-scroll overflow-x-hidden flow flow-col'>
          {messages.map((message) => (
            <div key={message.id}>
              <Message isFromUser={message.role === 'user'}>
                {message.content}
              </Message>
            </div>
          ))}
        </div>{' '}
        <div className='  bg-black rounded-full w-full flex flex-row border-white border-2'>
          <form onSubmit={onSubmit} className='flex flex-row w-full'>
            <input
              className=' flex-3 bg-black p-4 rounded-full w-full  placeholder:text-zinc-400'
              placeholder='Send a message'
              value={input}
              ref={inputRef}
              onChange={handleInputChange}
              onPaste={handleImagePaste}
            />
            {/* <div>
                <input
                  type='file'
                  accept='image/*'
                  placeholder='Paste a question'
                />
              </div> */}
            {/* <button>
              <FontAwesomeIcon
                icon={faPaperPlane}
                className=' w-7 h-14 mr-5 text-white'
              />
            </button> */}
          </form>
        </div>
      </div>
      <TextbookPane />
    </div>
  );
};

export default App;
