import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';

export default async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    metadataBase: new URL(BASE_URL),
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: './',
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}
