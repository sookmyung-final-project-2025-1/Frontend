'use client';

import { ReactNode } from 'react';

export default function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className='rounded-xl border border-[#0E2975] bg-white p-6 shadow-sm'>
      <h3 className='mb-4 text-lg font-semibold text-slate-900'>{title}</h3>
      {children}
    </div>
  );
}
