import dynamic from 'next/dynamic';
import Footer from '@/components/home/Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative flex min-h-screen flex-col'>
      <main className='relative z-1 mx-auto flex w-full flex-1 flex-col'>{children}</main>
      <Footer />
    </div>
  );
}
