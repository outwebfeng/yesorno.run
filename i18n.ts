import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// en-US, zh-CN
export const languages = [
  {
    code: 'en-US',
    lang: 'en',
    label: 'English',
  },
  {
    code: 'zh-CN',
    lang: 'zh',
    label: '中文',
  }
];

export const locales = ['en', 'zh'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
