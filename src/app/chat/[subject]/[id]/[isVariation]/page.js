'use client';
import Sidebar from '@/components/Sidebar';
import { Inter } from 'next/font/google';
// Import the Inter font for use throughout the application
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import Message from '@/components/Message';
import { useState, useRef, useEffect } from 'react';
// Import React hooks for state management and side effects
import { useChat } from 'ai/react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
// Import Firestore functions for database operations
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
// Import Firebase Storage functions for handling file operations
import { useRouter } from 'next/navigation';
import { setLayerDimensions } from 'pdfjs-dist';
import { getAnalytics, logEvent } from 'firebase/analytics';
// Import Firebase Analytics for tracking user events
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
// Import KaTeX for rendering mathematical expressions
const inter = Inter({ subsets: ['latin'] });

const App = ({ params }) => {
  // Extract route parameters
  const subject = params.subject;
  const id = params.id;
  const isVariation = params.isVariation;
  const analytics = getAnalytics(app);
  // Initialize state variables for UI control and data management
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
  // Initialize chat functionality using the AI hook
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
  // Initialize Firebase services
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const router = useRouter();
  const [placeholder, setPlaceholder] = useState();

  // Function to format messages with LaTeX math support
  const formatMessage = (message) => {
    // Regular expression to detect LaTeX math inside \( ... \) or $$ ... $$
    const regex = /\\\((.*?)\\\)|\$\$(.*?)\$\$/g;

    let parts = [];
    let lastIndex = 0;
    message.replace(regex, (match, p1, p2, index) => {
      // Push normal text before the math expression
      if (index > lastIndex) {
        parts.push(message.slice(lastIndex, index));
      }

      // Push the extracted math expression as a React component
      parts.push(<InlineMath key={index} math={p1 || p2} />);

      // Update lastIndex to continue processing
      lastIndex = index + match.length;
    });

    // Push any remaining text after the last math expression
    if (lastIndex < message.length) {
      parts.push(message.slice(lastIndex));
    }

    return parts;
  };

  // Handle form submission for sending messages or uploading images
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('messages: ', messages);
    // If there's an image buffer and no messages yet, process the image
    if (imageBuffer !== null && messages.length === 0) {
      console.log('in the if');
      setImageDataDeletable(false);
      console.log('image: ', imageBuffer);
      console.log(imageBuffer instanceof Uint8Array);
      // Upload the image to Firebase Storage
      const imageSnapshot = await uploadBytes(ref(storage, id), imageFile);
      console.log('Uploaded the question image on storage with ID');
      // Update the chat document to indicate it has an image
      await updateDoc(doc(db, 'chats', id), {
        hasQuestionImage: true,
      });
      setQuestionImage(imageData);

      // Create OpenAI instance for image transcription
      const openai = createOpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      try {
        // Use GPT-4o to transcribe the image content
        const transcription = await generateText({
          model: openai('gpt-4o-mini'),
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

        // Add the transcription as a user message
        append({
          role: 'user',
          content: transcription.text,
        });
      } catch (e) {
        console.error(e.message);
      }
    }
    // Submit the form to process the input text
    handleSubmit(e);
  };

  useEffect(() => {
    console.log(imageDataDeletable);
  }, []);

  // Function to handle generating question variations of different difficulty levels
  const onSelectDifficulty = async (difficulty) => {
    if (messages.length === 0) {
      setErrorMessage(
        'There needs to be a question to generate a variation of'
      );
    } else {
      // Prepare the prompt for generating a variation
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

      // Initialize OpenAI for generating variations
      const openai = createOpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });

      // Generate the variation using GPT-4 Turbo
      const result = await generateText({
        model: openai('gpt-4-turbo'),
        prompt,
      });

      console.log(result.text);

      // Get the original question's topic
      const prevDoc = await getDoc(doc(db, 'chats', id));
      const topic = prevDoc.data().topic;

      // Log the variation generation event for analytics
      logEvent(analytics, 'variation_generated', {
        type: difficulty,
      });

      // Create a new chat document for the variation
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

      // Navigate to the new variation chat
      router.push(`/chat/${subject}/${variationChat.id}/true`);
    }
  };

  // Load existing chat data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Load messages for chat page from Firestore
      console.log('id: ', id);
      const chatData = await getDoc(doc(db, 'chats', id));
      console.log(chatData);
      const messages = chatData.data().messages;
      setMessages(messages);
      console.log('data loaded');
      if (messages.length > 0) {
        setQuestionShown(true);
      }
      setDataLoaded(true);
      // Topic data is handled in the sidebar component
    };

    loadData();
  }, []);

  // Debug log for question visibility state
  useEffect(() => {
    console.log('question shown: ', questionShown);
  }, [questionShown]);

  // Update input placeholder text based on current state
  useEffect(() => {
    console.log('variables within the placeholder effect');
    console.log('question shown: ', questionShown);
    console.log('is variation: ', isVariation);
    console.log('answer shown: ', answerShown);
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

  // Generate a topic summary when a new question is added
  useEffect(() => {
    if (messages.length === 1) {
      console.log('generate topic running');
      setQuestionShown(true);
      const generateTopic = async () => {
        const question = messages[0];
        console.log('question: ', question);
        // Prompt GPT to generate a short summary of the question
        const topicPrompt =
          'Generate a phrase that summarises the given question in 3–4 words: ' +
          question.content;
        const openai = createOpenAI({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        });
        const { text } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt: topicPrompt,
        });
        console.log(text);
        console.log('topic: ', text);
        // Update the chat document with the generated topic
        await updateDoc(doc(db, 'chats', id), {
          topic: text,
        });
      };

      generateTopic();
    }

    // Handle image transcription case
    if (messages.length === 1) {
      console.log('in the case');
      if (messages[0].content) {
        if (
          messages[0].content.includes('transcription') ||
          messages[0].content.includes('Transcription')
        ) {
          console.log('it includes transcription');
          // Add image data to the message object
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

  // Update Firestore with new messages when chat state changes
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

  // Debug log for error messages
  useEffect(() => {
    console.log('error message: ', errorMessage);
  }, [errorMessage]);

  // Fetch question image from Firebase Storage if it exists
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

  // Handle clipboard paste events to capture images or text
  const handlePaste = async (e) => {
    e.preventDefault();
    console.log('paste');
    console.log(e.clipboardData.items[0].type);
    const items = e.clipboardData.items;
    let textContent = '';
    for (let i = 0; i < items.length; i++) {
      // Handle pasted image content
      if (items[i].type.startsWith('image/') && !questionShown) {
        const imageFile = items[i].getAsFile();
        const imageData = await readFileAsDataURL(imageFile);
        // Add image to state for display
        setImageData(imageData);
        setImageFile(imageFile);

        // Convert image to buffer for AI processing
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
      }
      // Handle pasted text content
      else if (items[i].type.startsWith('text/')) {
        console.log('second if activated');
        items[i].getAsString((value) => setInput((input) => input + value));
      }

      setInput((input) => input + textContent);
    }
  };

  // Convert file to data URL for display
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className='bg-black text-white flex flex-row w-screen h-screen'>
      <Sidebar subject={subject} />
      <div className='flex flex-col w-full   '>
        <div className='flex flex-col items-end'>
          {/* Variation generation button, shown only when there are messages */}
          {messages.length > 0 && (
            <button
              className='text-black bg-white rounded-md p-2 text-xl m-1 w-52'
              onMouseOver={() => setDropDownOpen(true)}
            >
              Generate variation
            </button>
          )}
          {/* Dropdown menu for selecting variation difficulty */}
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
          {/* Display the question message with image if available */}
          {messages.length > 0 && (
            <Message isFromUser={true}>
              {questionImage ? (
                <img src={questionImage} className='rounded-xl'></img>
              ) : (
                <p>{formatMessage(messages[0].content)}</p>
              )}
            </Message>
          )}
          {/* Display all subsequent messages */}
          {messages.slice(1).map((message, index) => {
            return (
              <div key={message.index}>
                <Message isFromUser={message.role === 'user'} key={index}>
                  {formatMessage(message.content)}
                </Message>
              </div>
            );
          })}
        </div>{' '}
        {/* Display pasted image preview */}
        <div className=' p-3 flex flex-row'>
          {imageData !== null && (
            <>
              <img
                src={imageData}
                alt='Pasted Image'
                className=' h-44 rounded-xl m-2'
              />
              {imageDataDeletable === true && (
                <button
                  className=' self-start text-white'
                  onClick={() => setImageData(null)}
                >
                  <p>X</p>
                </button>
              )}
            </>
          )}
        </div>
        {/* Display error messages in a red banner */}
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
        {/* Message input form */}
        <div className='  bg-black rounded-full w-full flex flex-row border-white border-2'>
          <form onSubmit={onSubmit} className='flex flex-row w-full'>
            <input
              className=' flex-3 bg-black p-4 rounded-full w-full  placeholder:text-zinc-400'
              placeholder={placeholder}
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
            />
            <button type='submit'>
              <FontAwesomeIcon
                icon={faPaperPlane}
                className=' w-7 h-14 mr-5 text-white'
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
