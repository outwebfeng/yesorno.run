'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function QuickMenu() {
  const t = useTranslations('Navigation');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { id: 'Home', label: 'Home', path: '/' },
    { id: 'YesWheel', label: 'YesWheel', path: '/yeswheel' },
    { id: 'NoWheel', label: 'NoWheel', path: '/nowheel' },
    { id: 'Features', label: 'Features', path: '/#features' },
    { id: 'Introduction', label: 'Introduction', path: '/#introduction' },
    { id: 'FAQ', label: 'FAQ', path: '/#faq' },
  ];

  const handleMenuClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* 桌面端菜单 */}
      <nav className='hidden items-center space-x-1 lg:flex'>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.path)}
            className='rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 ease-in-out hover:bg-orange-100 hover:text-[#FF782C]'
          >
            {t(item.label)}
          </button>
        ))}
      </nav>

      {/* 移动端菜单 */}
      <div className='lg:hidden'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='text-gray-700 hover:text-[#FF782C] focus:outline-none'
          aria-label={t('toggleMenu')}
        >
          <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>

        {isOpen && (
          <div className='absolute left-0 right-0 top-16 bg-white shadow-md'>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-100 hover:text-[#FF782C]'
              >
                {t(item.label)}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
