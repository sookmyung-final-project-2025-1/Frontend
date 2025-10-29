'use client';

import { FraudTrendInterval } from '@/lib/faudTrendUtils';

type Props = {
  selectedDate: string;
  interval: FraudTrendInterval;
  onDateChange: (v: string) => void;
  onIntervalChange: (v: FraudTrendInterval) => void;
};

export default function Controls({
  selectedDate,
  interval,
  onDateChange,
  onIntervalChange,
}: Props) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div>
        <label className='mb-1 block text-sm text-slate-600'>조회 일자</label>
        <input
          type='date'
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className='w-full rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
        />
      </div>
      <div>
        <label className='mb-1 block text-sm text-slate-600'>간격</label>
        <select
          // ✅ 문자열로 매칭되도록 보장
          value={`${interval}`}
          onChange={(e) =>
            onIntervalChange(e.target.value as FraudTrendInterval)
          }
          className='h-[44px] w-full rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
        >
          <option value='hourly'>시간별 (1시간)</option>
          <option value='daily'>일별 (1일)</option>
          <option value='weekly'>주별 (7일)</option>
          <option value='monthly'>월별 (1개월)</option>
        </select>
      </div>
    </div>
  );
}
