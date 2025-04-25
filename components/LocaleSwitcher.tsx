'use client';

import { useState } from 'react';
import { languages } from '@/i18n';
import { useLocale } from 'next-intl';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { usePathname, useRouter } from '../app/navigation';

export default function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [localeVal, setLocaleVal] = useState(currentLocale);

  const onValueChange = (newLocale: string) => {
    setLocaleVal(newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Select value={localeVal} defaultValue={currentLocale} onValueChange={onValueChange}>
      <SelectTrigger className='flex h-8 w-[65px] items-center gap-1 rounded-[4px] px-2'>
        <SelectValue placeholder='locale'>{localeVal.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem value={language.lang} key={language.code} className='hover:cursor-pointer hover:!bg-[#FF782C]'>
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
