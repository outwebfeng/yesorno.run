'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function QuickMenu() {
  const t = useTranslations('Navigation');
  const [isOpen, setIsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const router = useRouter();
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'Home', label: 'Home', path: '/' },
    { id: 'Features', label: 'Features', path: '/#features' },
    { id: 'Introduction', label: 'Introduction', path: '/#introduction' },
    { id: 'FAQ', label: 'FAQ', path: '/#faq' },
  ];

  const toolsItems = [
    { id: 'YesWheel', label: 'YesWheel', path: '/yeswheel' },
    { id: 'NoWheel', label: 'NoWheel', path: '/nowheel' },
  ];

  // 处理菜单点击
  const handleMenuClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setIsToolsOpen(false);
  };

  // 使用强制导航
  const forceNavigate = (e: React.MouseEvent, path: string) => {
    e.stopPropagation(); // 阻止事件冒泡
    setTimeout(() => {
      window.location.href = path;
    }, 100);
    
    return false;
  };

  // 直接导航函数，不需要事件参数
  const directNavigate = (path: string) => {
    window.location.href = path;
  };

  // 点击外部关闭More Tools菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        
        {/* More Tools 下拉菜单 */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            onMouseEnter={() => setIsToolsOpen(true)}
            className='rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 ease-in-out hover:bg-orange-100 hover:text-[#FF782C] flex items-center'
          >
            {t('MoreTools')}
            <svg 
              className={`ml-1 h-4 w-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isToolsOpen && (
            <div 
              className="absolute z-10 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
              onMouseLeave={() => setIsToolsOpen(false)}
            >
              {toolsItems.map((item) => (
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
          <div className='absolute left-0 right-0 top-16 bg-white shadow-md z-50'>
            {/* 普通菜单项 */}
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={item.path}
                className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-100 hover:text-[#FF782C]'
              >
                {t(item.label)}
              </a>
            ))}
            
            {/* 移动端More Tools菜单项 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToolsOpen(!isToolsOpen);
                }}
                className='flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-100 hover:text-[#FF782C]'
              >
                {t('MoreTools')}
                <svg 
                  className={`h-4 w-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isToolsOpen && (
                <div 
                  className="bg-gray-50" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 子菜单链接 */}
                  <a 
                    href="/yeswheel" 
                    className='block w-full px-8 py-2 text-left text-sm text-gray-700 hover:bg-orange-100 hover:text-[#FF782C]'
                    onClick={(e) => forceNavigate(e, "/yeswheel")}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      directNavigate("/yeswheel");
                    }}
                  >
                    {t('YesWheel')}
                  </a>
                  <a 
                    href="/nowheel" 
                    className='block w-full px-8 py-2 text-left text-sm text-gray-700 hover:bg-orange-100 hover:text-[#FF782C]'
                    onClick={(e) => forceNavigate(e, "/nowheel")}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      directNavigate("/nowheel");
                    }}
                  >
                    {t('NoWheel')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
