import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('FooterNavigation.privacyPolicy');

  return (
    <div className='prose mx-auto max-w-full p-4 sm:max-w-3xl sm:p-6'>
      <h1 className='mb-4 text-2xl font-bold sm:text-3xl'>{t('1-h1')}</h1>
      <p className='mb-4 text-sm sm:text-base'>{t('1-p')}</p>

      <h2 className='mb-3 text-xl font-semibold sm:text-2xl'>{t('2-h2')}</h2>
      <h3 className='mb-2 text-lg font-medium sm:text-xl'>{t('2-h3-1')}</h3>
      <p className='mb-3 text-sm sm:text-base'>{t('2-p-1')}</p>
      <h3 className='mb-2 text-lg font-medium sm:text-xl'>{t('2-h3-2')}</h3>
      <p className='mb-4 text-sm sm:text-base'>{t('2-p-3')}</p>

      <h2 className='mb-3 text-xl font-semibold sm:text-2xl'>{t('3-h2')}</h2>
      <p className='mb-4 text-sm sm:text-base'>{t('3-p')}</p>

      <h2 className='mb-3 text-xl font-semibold sm:text-2xl'>{t('4-h2')}</h2>

      <h2 className='mb-3 text-xl font-semibold sm:text-2xl'>{t('6-h2')}</h2>
      <p className='mb-4 text-sm sm:text-base'>{t('6-p')}</p>
    </div>
  );
}
