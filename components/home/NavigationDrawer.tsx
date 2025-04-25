'use client';

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export default function NavigationDrawer({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const onClose = () => {
    setOpen(false);
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={cn('fixed z-50 h-screen w-screen overflow-hidden bg-white/60', isOpen ? 'block' : 'hidden')}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed right-0 top-16 z-[99999] h-[calc(100%-64px)] w-[276px] transform bg-white shadow-lg transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      />
    </>
  );
}
