import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'YesWheel' });

  return {
    title: t('title'),
    description: t('subTitle'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('subTitle'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('subTitle'),
    },
  };
} 