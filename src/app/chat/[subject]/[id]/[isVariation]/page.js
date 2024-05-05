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
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { openai } from '@ai-sdk/openai';
import { getAuth } from 'firebase/auth';
import {
  getBlob,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { setLayerDimensions } from 'pdfjs-dist';
import { getAnalytics, logEvent } from 'firebase/analytics';
const inter = Inter({ subsets: ['latin'] });

const App = ({ params }) => {
  const subject = params.subject;
  const id = params.id;
  const isVariation = params.isVariation;
  const analytics = getAnalytics(app);
  const [questionShown, setQuestionShown] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [imageBuffer, setImageBuffer] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [answerShown, setAnswerShown] = useState(false);
  const [questionImage, setQuestionImage] = useState();
  const [imageDataDeletable, setImageDataDeletable] = useState(true);
  const {
    messages,
    input,
    isLoading,
    setMessages,
    handleInputChange,
    handleSubmit,
    setInput,
    append,
  } = useChat();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const router = useRouter();
  const [placeholder, setPlaceholder] = useState();

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('messages: ', messages);
    if (imageBuffer !== null && messages.length === 0) {
      console.log('in the if');
      setImageDataDeletable(false);
      console.log('image: ', imageBuffer);
      console.log(imageBuffer instanceof Uint8Array);
      const imageSnapshot = await uploadBytes(ref(storage, id), imageFile);
      console.log('Uploaded the question image on storage with ID');
      await updateDoc(doc(db, 'chats', id), {
        hasQuestionImage: true,
      });
      setQuestionImage(imageData);
      // append({
      //   role: 'user',
      //   content: [{ type: 'image', image: imageBuffer }],
      // });
      const openai = createOpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      const transcription = await generateText({
        model: openai('gpt-4-turbo'),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `
                Transcribe the image given and convert it to text. Use the following procedure:
                1. Under the heading 'question', describe the question text given in the image. Transcribe the instructions given to the student as a part of the question.
                2. Under the heading 'transcription', if there are any graphs or drawings given, describe them in detail. `,
              },
              { type: 'image', image: imageBuffer },
            ],
          },
        ],
      });

      append({
        role: 'user',
        content: transcription.text,
      });
    }
    handleSubmit(e);
  };

  // console.log([
  //   ...messages,
  //   {
  //     role: 'user',
  //     content: [...newContent, { type: 'text', text: input }],
  //   },
  // ]);
  // const message = {
  //   role: 'user',
  //   content: [...newContent, { type: 'text', text: input }],
  // };
  // setMessages((prevMessages) => [
  //   ...prevMessages,
  //   {
  //     role: 'user',
  //     content: [...newContent, { type: 'text', text: input }],
  //   },
  // ]);
  // try {
  //   append(message);
  // } catch (error) {
  //   console.error(error.message);
  // }

  // if (isVariation && !answerShown) {
  //   setAnswerShown(true);

  //   const prompt = `
  //   First, work out your own solution to the problem. Then, compare your solution to the student's solution and evaluate if the student's solution is correct or not. Don't decide if the student's solution is correct untl you have done the problem yourself.
  //   Question: ${messages[0].content}
  //   Answer: ${messages[1].content}
  //   `;

  //   const openai = createOpenAI({
  //     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  //   });

  //   const result = await generateText({
  //     model: openai('gpt-4-turbo'),
  //     prompt,
  //   });

  //   console.log(result.text);
  //   setMessages((messages) => [
  //     ...messages,
  //     {
  //       role: 'assistant',
  //       content: result.text,
  //     },
  //   ]);
  // } else {
  //   handleSubmit(e);
  // }

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

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   // if (questionShown) {
  //   handleSubmit(e);
  //   // } else {
  // for (let image of imageData) {
  //     console.log('image: ', image);
  //     append({
  //       role: 'user',
  //       content: image,
  //     });
  //   }
  // }
  // };

  const handlePaste = async (e) => {
    e.preventDefault();
    console.log('paste');
    console.log(e.clipboardData.items[0].type);
    const items = e.clipboardData.items;
    let textContent = '';
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/') && !questionShown) {
        const imageFile = items[i].getAsFile();
        const imageData = await readFileAsDataURL(imageFile);
        // adding to imageData (so that display on screen works)
        setImageData(imageData);
        setImageFile(imageFile);

        // setting image buffer for transcription call
        const reader = new FileReader();
        reader.onload = function (event) {
          const uint8Array = new Uint8Array(event.target.result);
          console.log('image added: ', uint8Array);
          setImageBuffer(uint8Array);
        };

        reader.onerror = function (error) {
          console.error('Error reading file: ', error);
        };

        reader.readAsArrayBuffer(imageFile);
      } else if (items[i].type.startsWith('text/')) {
        console.log('second if activated');
        // console.log(items[i]);
        // setInput((input) => input + items[i].getData(items[i].type));
        items[i].getAsString((value) => setInput((input) => input + value));
        // setInput((input) => input + e.target.value);

        // handleInputChange(e);

        // const text = await new Promise((resolve) => {
        //   const reader = new FileReader();
        //   reader.onload = () => resolve(reader.result);
        //   console.log(items[i]);
        //   reader.readAsText(items[i].getAsFile());
        // });
        // textContent += text;
      }

      setInput((input) => input + textContent);
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

  const onSelectDifficulty = async (difficulty) => {
    if (messages.length === 0) {
      setErrorMessage(
        'There needs to be a question to generate a variation of'
      );
    } else {
      const prompt = `
    Generate a ${difficulty} variation of the following question:
    ${messages[0].transcript ? messages[0].transcript : messages[0].content}

    Use the following guidelines to create variations:
    1. If the difficulty to generate is harder, then add a variable to the problem. A variable can be a new situation/context/condition or a new concept that can be integrated into the problem.
    2. If the difficulty to generate is similar, then maintain the exact same variables in the problem. Just change the figures in the problem.
    3. If the difficulty to generate is easier, then make the context of the problem easier and make the problem more direct. 

    Do not mention any guidelines on how to solve the problem.
    Also, ensure that the problems you generate can be solved by a student studying ${subject}
    Finally, even if the question includes the description of an image, do not describe any image in your generated question.

    `;
      console.log(prompt);

      const openai = createOpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });

      const result = await generateText({
        model: openai('gpt-4-turbo'),
        prompt,
      });

      console.log(result.text);

      const prevDoc = await getDoc(doc(db, 'chats', id));
      const topic = prevDoc.data().topic;

      logEvent(analytics, 'variation_generated', {
        type: difficulty,
      });

      const variationChat = await addDoc(collection(db, 'chats'), {
        messages: [
          {
            content: result.text,
            role: 'user',
          },
        ],
        subject: subject,
        topic: 'Variation: ' + topic,
        user: auth?.currentUser?.email,
        hasQuestionImage: false,
      });

      router.push(`/chat/${subject}/${variationChat.id}/true`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // load messages for chat page
      console.log('id: ', id);
      const chatData = await getDoc(doc(db, 'chats', id));
      console.log(chatData);
      const messages = chatData.data().messages;
      setMessages(messages);
      console.log('data loaded');
      setDataLoaded(true);
      // topic is handled in the sidebar
    };

    loadData();
  }, []);

  useEffect(() => {
    if (
      (questionShown && isVariation === 'false') ||
      (isVariation === 'true' && answerShown)
    ) {
      setPlaceholder('Talk about your working, thought process, etc.');
    } else if (isVariation === 'true' && !answerShown && questionShown) {
      setPlaceholder('Post your answer');
    } else if (!questionShown) {
      setPlaceholder('Paste a question (screenshot or text)');
    }
  }, [answerShown, isVariation, questionShown]);

  useEffect(() => {
    if (messages.length === 1) {
      console.log('generate topic running');
      setQuestionShown(true);
      const generateTopic = async () => {
        const question = messages[0];
        console.log('question: ', question);
        const topicPrompt =
          'Generate a phrase that summarises the given question in 3–4 words: ' +
          question.content;
        const openai = createOpenAI({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        });
        const { text } = await generateText({
          model: openai('gpt-3.5-turbo-instruct'),
          prompt: topicPrompt,
        });
        console.log(text);
        console.log('topic: ', text);
        // console.log('topic: ', topic);
        await updateDoc(doc(db, 'chats', id), {
          topic: text,
        });
      };

      generateTopic();
    }

    if (messages.length === 1) {
      console.log('in the case');
      if (messages[0].content) {
        if (
          messages[0].content.includes('transcription') ||
          messages[0].content.includes('Transcription')
        ) {
          console.log('it includes transcription');
          messages[0] = {
            content: messages[0].content,
            image: imageData,
            role: 'user',
          };
          setMessages(messages);
          setImageDataDeletable(true);
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    const updateMessages = async () => {
      if (!isLoading && dataLoaded) {
        await updateDoc(doc(db, 'chats', id), {
          messages,
        });
        console.log('messages updated');
      } else {
        console.log('currently loading');
      }
    };
    updateMessages();
  }, [isLoading]);

  useEffect(() => {
    console.log('error message: ', errorMessage);
  }, [errorMessage]);

  useEffect(() => {
    const getQuestionImage = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', id));
      if (chatDoc.data().hasQuestionImage) {
        const questionImage = await getDownloadURL(ref(storage, id));
        console.log('got image: ', questionImage);
        setQuestionImage(questionImage);
      } else {
        setQuestionImage(null);
      }
    };
    getQuestionImage();
  }, []);

  return (
    <div className='bg-black text-white flex flex-row w-screen h-screen'>
      <Sidebar subject={subject} />
      <div className='flex flex-col w-full   '>
        <div className='flex flex-col items-end'>
          {messages.length > 0 && (
            <button
              className='text-black bg-white rounded-md p-2 text-xl m-1 w-52'
              onMouseOver={() => setDropDownOpen(true)}
            >
              Generate variation
            </button>
          )}
          {/* {dropDownOpen && ( <ul>{
            ['Harder', 'Same difficulty', 'Easier'].map((element, i) => (
              <li key={i} className='p-3 border text-black bg-white'></li>
            ))}}</ul>) */}
          {dropDownOpen && (
            <div
              className=' z-10 flex flex-col w-52 bg-white text-black rounded-xl'
              onMouseLeave={() => setDropDownOpen(false)}
            >
              {['Harder', 'Similar', 'Easier'].map((element, i) => (
                <button
                  key={i}
                  className='p-2'
                  onClick={() => onSelectDifficulty(element)}
                >
                  {element}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className=' text-white bg-black h-full overflow-scroll overflow-x-hidden flow flow-col'>
          {messages.length > 0 && (
            <Message isFromUser={true}>
              {questionImage ? (
                <img src={questionImage} className='rounded-xl'></img>
              ) : (
                <p>{messages[0].content}</p>
              )}
            </Message>
          )}
          {messages.slice(1).map((message, index) => {
            {
              /* console.log('message: ', message); */
            }
            return (
              <div key={message.index}>
                <Message isFromUser={message.role === 'user'} key={index}>
                  {message.content}
                </Message>
              </div>
            );

            {
              /* if (!message.content.startsWith('data'))  {
              return (
                <div key={message.id}>
                  <Message isFromUser={message.role === 'user'}>
                    {message.content}
                  </Message>
                </div>
              );
            } else { */
            }
            {
              /* return (
              <div key={message.id}>
                <Message isFromUser={true}>
                  <img src={message.content} />
                </Message>
              </div>
            ); */
            }
            {
              /* } */
            }
          })}
          {/* {isVariation && !answerShown && (
            <button
              className='bg-white text-black rounded-md float-right text-xl p-2'
              onClick={() => getAnswer()}
            >
              Get answer
            </button>
          )} */}
        </div>{' '}
        <div className=' p-3 flex flex-row'>
          {imageData !== null && (
            <>
              <img
                src={imageData}
                alt='Pasted Image'
                className=' h-44 rounded-xl m-2'
              />
              {imageDataDeletable && (
                <button
                  className=' self-start text-black'
                  onClick={() => setImageData(null)}
                >
                  <p>X</p>
                </button>
              )}
            </>
          )}
        </div>
        {errorMessage !== '' && (
          <div className='bg-red-800 rounded-xl p-3 m-3'>
            <button
              className='float-right  hover:cursor-pointer'
              onClick={() => {
                setErrorMessage('');
              }}
            >
              X
            </button>
            {errorMessage}
          </div>
        )}
        <div className='  bg-black rounded-full w-full flex flex-row border-white border-2'>
          <form onSubmit={onSubmit} className='flex flex-row w-full'>
            <input
              className=' flex-3 bg-black p-4 rounded-full w-full  placeholder:text-zinc-400'
              placeholder={placeholder}
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
            />
            {/* <div>
                <input
                  type='file'
                  accept='image/*'
                  placeholder='Paste a question'
                />
              </div> */}
            <button type='submit'>
              <FontAwesomeIcon
                icon={faPaperPlane}
                className=' w-7 h-14 mr-5 text-white'
              />
            </button>
          </form>
        </div>
      </div>
      {/* <TextbookPane /> */}
    </div>
  );
};

export default App;
