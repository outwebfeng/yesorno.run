import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// en-US
export const languages = [
  {
    code: 'en-US',
    lang: 'en',
    label: 'English',
  }
];

export const locales = ['en'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
