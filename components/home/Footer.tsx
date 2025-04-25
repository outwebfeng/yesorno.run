import { HTMLAttributeAnchorTarget } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

function InfoLink({
  href,
  title,
  target,
  type,
}: {
  href: string;
  title: string;
  target?: HTMLAttributeAnchorTarget;
  type?: string;
}) {
  return (
    <Link href={href} title={title} className='whitespace-nowrap text-sm hover:opacity-70' target={target} type={type}>
      {title}
    </Link>
  );
}

export default function Footer() {
  const t = useTranslations('Footer');

  const SupportLinks = [
    // {
    //   title: 'holidaycalendar',
    //   href: 'https://holidaycalendar.net/',
    // },
  ];

  const INFO_LIST = [
    {
      title: t('privacy'),
      href: '/privacy-policy',
    },
    {
      title: t('termsConditions'),
      href: '/terms-of-service',
    },
  ];

  return (
    <footer className='w-full bg-[#ffffff] py-8'>
      <div className='mx-auto max-w-pc px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center sm:flex-row sm:items-start sm:justify-between'>
          <div className='mb-6 flex flex-col items-center sm:mb-0 sm:items-start'>
            <p className='mb-2 text-2xl font-bold text-[#FF782C] sm:text-3xl'>{t('title')}</p>
            <p className='text-center text-sm text-black/40 sm:text-left'>{t('subTitle')}</p>
            <p className='mt-2 text-center text-xs text-black/30 sm:text-left'>{t('copyright')}</p>
          </div>
          <div className='flex flex-col items-center sm:items-end'>
            <div className='mb-4 flex flex-col items-center sm:mb-2 sm:items-end'>
              <p className='mb-2 font-bold'>{t('support')}</p>
              {/* {SupportLinks.map((item) => (
                <a
                  href={item.href}
                  key={item.href}
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm hover:opacity-70'
                  title={item.title}
                >
                  {item.title}
                </a>
              ))} */}
            </div>
            <div className='flex flex-col items-center space-y-2 sm:items-end'>
              {INFO_LIST.map((item) => (
                <InfoLink key={item.href} href={item.href} title={item.title} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
