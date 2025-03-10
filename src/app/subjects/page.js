import dynamic from 'next/dynamic';

// Ensures subjects is import4ed as a client-rendered component to avoid pre-rendering issues
const Subjects = dynamic(() => import('@/components/SubjectsComponent'), {
  ssr: false,
});

export default function Page() {
  return <Subjects />;
}
