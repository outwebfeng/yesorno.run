import { NextIntlClientProvider, useMessages } from 'next-intl';

import { Toaster } from '@/components/ui/sonner';

import './globals.css';

import { Suspense } from 'react';

import { GOOGLE_ADSENSE_ACCOUNT } from '@/lib/env';
import GoogleAdScript from '@/components/ad/GoogleAdScript';
import SeoScript from '@/components/seo/SeoScript';

import Loading from './loading';
import Script from 'next/script';

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name='google-adsense-account' content={GOOGLE_ADSENSE_ACCOUNT} />
        <GoogleAdScript />
        <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="/js/jquery.superwheel.js" strategy="beforeInteractive" />
      </head>
      <body className='relative mx-auto flex min-h-screen flex-col bg-[#f8f9fb] text-black'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Toaster
            position='top-center'
            toastOptions={{
              classNames: {
                error: 'bg-red-400',
                success: 'text-green-400',
                warning: 'text-yellow-400',
                info: 'bg-blue-400',
              },
            }}
          />
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </NextIntlClientProvider>
        <SeoScript />
      </body>
    </html>
  );
}
