'use client';

import { useTranslations } from 'next-intl';

type ToolItem = {
  id: string;
  path: string;
  bgColor: string;
  hoverColor: string;
};

export default function MoreTools() {
  const t = useTranslations('Home.MoreTools');
  
  // 工具列表定义，包含背景颜色
  const toolItems: ToolItem[] = [
    { 
      id: 'yesOrNo', 
      path: '/', 
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-100',
      hoverColor: 'hover:from-indigo-100 hover:to-blue-200'
    },
    { 
      id: 'yesWheel', 
      path: '/yeswheel', 
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
      hoverColor: 'hover:from-green-100 hover:to-emerald-200'
    },
    { 
      id: 'noWheel', 
      path: '/nowheel', 
      bgColor: 'bg-gradient-to-br from-rose-50 to-red-100',
      hoverColor: 'hover:from-rose-100 hover:to-red-200'
    }
  ];

  // 直接使用原生JavaScript进行页面跳转
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <section className="py-12 bg-white rounded-2xl mb-12 shadow-sm">
      <div className="px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center mb-8">
          {t('title')}
        </h2>
        <p className="text-slate-600 text-center max-w-3xl mx-auto mb-10">
          {t('subTitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {toolItems.map((tool) => (
            <div 
              key={tool.id} 
              className="rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer"
              onClick={() => handleNavigate(tool.path)}
              onTouchEnd={() => handleNavigate(tool.path)} // 添加触摸事件支持
            >
              <div 
                className={`p-6 transition-all duration-300 h-full flex flex-col hover:-translate-y-1 ${tool.bgColor} ${tool.hoverColor}`}
              >
                <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {t(`tools.${tool.id}.label`)}
                </h3>
                <p className="text-slate-700 flex-grow">
                  {t(`tools.${tool.id}.description`)}
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                    {t('tryNow')}
                    <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 