'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import LocaleSwitcher from '../LocaleSwitcher';
import QuickMenu from './QuickMenu';

export default function Navigation() {
  const t = useTranslations('Navigation');
  return (
    <header className='bg-frosted-glass sticky left-0 top-0 z-50 flex h-[64px] px-5 blur-[60%] filter lg:px-0'>
      <nav className='mx-auto flex max-w-pc flex-1 items-center justify-between bg-[#ffffff] px-4'>
        <div className='flex items-center gap-x-2'>
          <Link className='flex items-center gap-x-2 hover:opacity-80' href='/' title={t('title')}>
            <img
              src='/favicon.ico'
              alt={t('logoAlt')}
              title={t('logoTitle')}
              width={64}
              height={48}
              className='size-[40px] lg:size-16'
            />
            <span className='text-lg font-semibold text-[#FF782C]'>{t('logoTitle')}</span>
          </Link>
        </div>
        <QuickMenu />
        <div className='flex items-center gap-x-4'>
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}
