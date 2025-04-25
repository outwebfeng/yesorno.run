/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div className='flex w-screen flex-1 items-center justify-center'>
      <div className='flex flex-col items-center gap-4 px-4 text-center'>
        <img
          src='/images/404.png'
          className='h-auto w-full max-w-[323px] -translate-x-4 sm:h-[208px] sm:w-[323px]'
          alt='404'
        />
        <h1 className='text-sm text-black/40 sm:text-base'>{t('title')}</h1>
        <Link
          href='/'
          className='flex h-9 w-full max-w-[200px] items-center justify-center rounded-full border border-white/40 px-[10px] text-xs uppercase text-black/40 hover:cursor-pointer hover:opacity-80 sm:text-sm'
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
