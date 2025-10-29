'use client';

import { ReactNode } from 'react';

type Item = { k: ReactNode; v: ReactNode };

export default function KeyValueGrid({ items }: { items: Item[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {items.map((it, idx) => (
        <div
          key={idx}
          className='flex items-start justify-between gap-4 rounded-lg border border-[#0E2975] bg-white px-4 py-3 shadow-sm'
        >
          <div className='text-sm text-slate-600'>{it.k}</div>
          <div className='text-right text-sm text-slate-900 break-words'>
            {it.v ?? '-'}
          </div>
        </div>
      ))}
    </div>
  );
}
