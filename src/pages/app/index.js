import Sidebar from '@/components/Sidebar';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

const App = () => {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 text-white text-2xl bg-black ${inter.className}`}
    >
      <Sidebar />
    </main>
  );
};

export default App;
