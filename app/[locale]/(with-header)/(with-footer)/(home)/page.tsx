'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import YesNoWheel from '@/components/YesNoWheel';
import type { WheelSliceItem } from '@/components/YesNoWheel';
import { useCallback, useMemo } from 'react';

// 静态导入ScrollToTop组件
const ScrollToTop = dynamic(() => import('@/components/page/ScrollToTop'), { ssr: false });

export default function Page() {
  const t = useTranslations('Home');

  const defaultWheelItems: WheelSliceItem[] = useMemo(() => [
    {
      text: "YES",
      value: "yes",
      message: "Go for it!",
      background: "var(--wheel-color1)", 
      resultIcon: 'success',
      resultTitle: "Sure!",
      probability: 0.5
    },
    {
      text: "NO",
      value: "no",
      message: "You may need to consider not doing it!",
      background: "var(--wheel-color2)", 
      resultIcon: 'error',
      resultTitle: "Attention!",
      probability: 0.5
    },
  ], []);

  const handleSpinResult = useCallback((result: WheelSliceItem) => {
    console.log('Spin result in parent:', result);
    // You can access result.value, result.message etc. here
  }, []);

  return (
    <div className='relative w-full bg-gradient-to-b from-slate-50 to-white'>
      <div className='relative mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8'>
        {/* hero */}
        <section className='rounded-2xl py-12'>
          <div className='mb-6 flex flex-col items-center text-center sm:mb-8 lg:mx-auto'>
            <h1 className='mb-3 text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:mb-4 sm:text-3xl md:text-4xl lg:text-6xl animate-hardware'>
              {t('title')}
            </h1>
            <div className='max-w-6xl text-xs font-medium text-slate-600 sm:text-sm md:text-base'>
              {t('subTitle')}
            </div>
          </div>
          
          <YesNoWheel customItems={defaultWheelItems} sliceRepeats={3} onSpinComplete={handleSpinResult} />
        </section>


        {/* Features Section */}
        <section className='rounded-2xl bg-white p-8 shadow-xl backdrop-blur-sm bg-white/80 border border-slate-100'>
          <h2 id='features' className='mb-8 pb-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'
              style={{ contain: 'layout paint', minHeight: '2.5rem' }}>
            {t('Features.title')}
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            {t.raw('Features.items').map((item: { title: string; description: string }) => (
              <div
                key={`feature-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                className='rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1'
              >
                <h3 className='mb-3 text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>{item.title}</h3>
                <p className='leading-relaxed text-slate-700'>{item.description}</p>
              </div>
            ))}
          </div>

          {/* Welcome Section */}
          <h2 id='welcome' className='mb-8 mt-16 pb-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
            {t('Welcome.title')}
          </h2>
          <div className='rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md'>
            <p className='leading-relaxed text-slate-700'>{t('Welcome.description')}</p>
          </div>

          {/* What Is Section */}
          <h2 id='introduction' className='mb-8 mt-16 pb-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
            {t('WhatIs.title')}
          </h2>
          <div className='rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md'>
            <p className='leading-relaxed text-slate-700'>{t('WhatIs.description')}</p>
          </div>

          {/* How to Use Section */}
          <h2
            id='how-to-use'
            className='mb-8 mt-16 pb-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'
          >
            {t('HowToUse.title')}
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            {t.raw('HowToUse.steps').map((item: { step: string; description: string }, index: number) => (
              <div
                key={`step-${item.step.toLowerCase().replace(/\s+/g, '-')}`}
                className='rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1'
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <h3 className='text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>{item.step}</h3>
                </div>
                <p className='leading-relaxed text-slate-700'>{item.description}</p>
              </div>
            ))}
          </div>

          {/* Why Choose Section */}
          <h2
            id='why-choose'
            className='mb-8 mt-16 pb-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'
          >
            {t('WhyChoose.title')}
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            {t.raw('WhyChoose.items').map((item: { title: string; description: string }) => (
              <div
                key={`why-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                className='rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1'
              >
                <h3 className='mb-3 text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>{item.title}</h3>
                <p className='leading-relaxed text-slate-700'>{item.description}</p>
              </div>
            ))}
          </div>

          {/* Design Tips Section */}
          <h2
            id='design-tips'
            className='mb-8 mt-16 pb-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'
          >
            {t('DesignTips.title')}
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            {t.raw('DesignTips.tips').map((item: { tip: string; description: string }) => (
              <div
                key={`tip-${item.tip.toLowerCase().replace(/\s+/g, '-')}`}
                className='rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1'
              >
                <h3 className='mb-3 text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>{item.tip}</h3>
                <p className='leading-relaxed text-slate-700'>{item.description}</p>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <h2 id='faq' className='mb-8 mt-16 pb-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
            {t('Faq.title')}
          </h2>
          <div className='space-y-4'>
            {t.raw('Faq.questions').map((faqItem: { question: string; answer: string }, index: number) => (
              <details
                key={`faq-${faqItem.question.toLowerCase().replace(/\s+/g, '-')}`}
                className='group rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md'
              >
                <summary className='flex cursor-pointer list-none items-center justify-between font-medium'>
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs">
                      Q
                    </span>
                    <h3 className='text-xl font-semibold text-slate-800'>{faqItem.question}</h3>
                  </div>
                  <svg className="h-5 w-5 text-slate-500 group-open:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className='mt-4 pl-9'>
                  <p className='group-open:animate-fadeIn leading-relaxed text-slate-700'>{faqItem.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
        <ScrollToTop />
      </div>
    </div>
  );
}
