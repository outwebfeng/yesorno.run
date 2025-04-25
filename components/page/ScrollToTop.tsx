'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div>
      {isVisible && (
        <button
          type='button'
          onClick={scrollToTop}
          className='fixed bottom-6 right-6 flex items-center justify-center rounded-full shadow-lg p-3 bg-white text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 border border-[#FF782C]/20 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-orange-50 z-50'
          aria-label='Go to Top'
        >
          <ArrowUp className='h-5 w-5 text-[#532cff]' />
          <span className='sr-only'>Go to Top</span>
        </button>
      )}
    </div>
  );
}
