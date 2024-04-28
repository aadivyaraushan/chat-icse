import ChatPane from '@/components/ChatPane';
import SendMessage from '@/components/SendMessage';
import Sidebar from '@/components/Sidebar';
import { Inter } from 'next/font/google';
// import dynamic from 'next/dynamic';
import TextbookPane from '@/components/TextbookPane';
const inter = Inter({ subsets: ['latin'] });

const App = () => {
  return (
    <div className='bg-black text-white flex flex-row w-screen h-screen'>
      <Sidebar />
      <div className='flex flex-col w-full   '>
        <ChatPane />
        <SendMessage />
      </div>
      <TextbookPane />
    </div>
  );
};

export default App;
