import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export default async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'NoWheel.Metadata' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yesorno.run';
  
  // 默认语言不显示语言代码，其他语言显示
  const localePath = locale === 'en' ? '' : `/${locale}`;
  const canonicalUrl = `${siteUrl}${localePath}/nowheel`;

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: canonicalUrl,
    },
  };
} 