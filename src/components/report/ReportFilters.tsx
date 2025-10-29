'use client';

import { useEffect, useState } from 'react';

export type ReportFiltersValue = {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  reportedBy: string;
  startDate: string; // 'YYYY-MM-DD' or ''
  endDate: string; // 'YYYY-MM-DD' or ''
};

type Props = {
  value: ReportFiltersValue;
  onChange: (v: ReportFiltersValue) => void;
  isLoading?: boolean;
};

const STATUS_OPTIONS: ReportFiltersValue['status'][] = [
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
];

export default function ReportFilters({ value, onChange, isLoading }: Props) {
  const [local, setLocal] = useState<ReportFiltersValue>(value);

  useEffect(() => setLocal(value), [value]);

  const apply = () => onChange(local);
  const reset = () =>
    onChange({
      status: 'PENDING',
      reportedBy: '',
      startDate: '',
      endDate: '',
    });

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
      {/* 상태 */}
      <div>
        <label className='block text-xs mb-1 text-slate-600'>상태</label>
        <select
          className='w-full h-[40px] rounded-lg border border-[#0E2975] bg-white px-2 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          value={local.status}
          onChange={(e) =>
            setLocal((p) => ({
              ...p,
              status: e.target.value as ReportFiltersValue['status'],
            }))
          }
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 신고자 */}
      <div>
        <label className='block text-xs mb-1 text-slate-600'>신고자</label>
        <input
          className='w-full h-[40px] rounded-lg border border-[#0E2975] bg-white px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          placeholder='이메일/ID'
          value={local.reportedBy}
          onChange={(e) =>
            setLocal((p) => ({ ...p, reportedBy: e.target.value }))
          }
        />
      </div>

      {/* 시작일 */}
      <div>
        <label className='block text-xs mb-1 text-slate-600'>시작일</label>
        <input
          type='date'
          className='w-full h-[40px] rounded-lg border border-[#0E2975] bg-white px-3 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          value={local.startDate}
          onChange={(e) =>
            setLocal((p) => ({ ...p, startDate: e.target.value }))
          }
        />
      </div>

      {/* 종료일 */}
      <div>
        <label className='block text-xs mb-1 text-slate-600'>종료일</label>
        <input
          type='date'
          className='w-full h-[40px] rounded-lg border border-[#0E2975] bg-white px-3 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          value={local.endDate}
          onChange={(e) => setLocal((p) => ({ ...p, endDate: e.target.value }))}
        />
      </div>

      {/* 버튼 */}
      <div className='md:col-span-4 flex justify-end gap-2 mt-1'>
        <button
          onClick={reset}
          disabled={isLoading}
          className='px-3 py-2 rounded-lg border border-gray-300 bg-white text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
        >
          초기화
        </button>
        <button
          onClick={apply}
          disabled={isLoading}
          className='px-4 py-2 rounded-lg bg-blue-500 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
        >
          적용
        </button>
      </div>
    </div>
  );
}
