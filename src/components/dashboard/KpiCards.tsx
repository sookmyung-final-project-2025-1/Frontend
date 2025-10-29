// src/components/dashboard/KpiPanel.tsx
'use client';

import type { Kpi } from '@/hooks/queries/dashboard/useKpiQuery';
import { useKpiQuery } from '@/hooks/queries/dashboard/useKpiQuery';
import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

/* ───────────── 날짜 유틸(YYYY-MM-DD) ───────────── */
const pad = (n: number) => String(n).padStart(2, '0');

const toLocalDateInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** date(YYYY-MM-DD) → ISO(UTC) 시작 00:00:00.000 */
const localDateToStartISO = (v: string) =>
  new Date(`${v}T00:00:00`).toISOString();

/** date(YYYY-MM-DD) → ISO(UTC) 종료 23:59:59.999 */
const localDateToEndISO = (v: string) =>
  new Date(`${v}T23:59:59.999`).toISOString();

/* ───────────── 포맷터 ───────────── */
const fmtInt = (v?: number) =>
  typeof v === 'number' ? v.toLocaleString('ko-KR') : '-';

const fmtPct01 = (v?: number) =>
  typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : '-';

const fmtPct100 = (v?: number) =>
  typeof v === 'number' ? `${v.toFixed(1)}%` : '-';

const fmtMs = (v?: number) => {
  if (typeof v !== 'number') return '-';
  if (v >= 1000) return `${(v / 1000).toFixed(2)} s`;
  return `${Math.round(v)} ms`;
};

const fmtKRW = (v?: number) =>
  typeof v === 'number'
    ? `₩${Math.round(v * 1000).toLocaleString('ko-KR')}`
    : '-';

/* ───────────── 카드 렌더러 ───────────── */
function KpiCards({ kpi }: { kpi?: Kpi | null }) {
  const items = [
    { label: '전체 거래 수', value: fmtInt(kpi?.totalTransactions) },
    { label: '사기 탐지 건수', value: fmtInt(kpi?.fraudTransactions) },
    { label: '오탐 비율', value: fmtPct100(kpi?.falsePositiveRate) },
    { label: '시간당 처리량', value: fmtInt(kpi?.throughputPerHour) },
    { label: '평균 거래 금액', value: fmtKRW(kpi?.averageTransactionAmount) },
    { label: '고유 사용자 수', value: fmtInt(kpi?.uniqueUsers) },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
      {items.map((k, i) => (
        <div
          key={i}
          className='rounded-2xl border border-[#0E2975] bg-white h-full shadow-sm'
        >
          <div className='flex h-full justify-between p-5'>
            <div className='text-sm text-slate-600'>{k.label}</div>
            <div className='mt-1 text-xl text-slate-900'>{k.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────── 컨트롤 + 데이터 패널 ───────────── */
export default function KpiPanel() {
  // 기본: 최근 30일 ~ 오늘
  const now = new Date();
  const startDefault = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [startLocal, setStartLocal] = useState<string>(
    toLocalDateInput(startDefault)
  );
  const [endLocal, setEndLocal] = useState<string>(toLocalDateInput(now));

  // 쿼리 파라미터(ISO로 변환)
  const startISO = useMemo(() => localDateToStartISO(startLocal), [startLocal]);
  const endISO = useMemo(() => localDateToEndISO(endLocal), [endLocal]);

  const kpiQ = useKpiQuery({
    startTime: startISO,
    endTime: endISO,
  });

  return (
    <section className='space-y-6 rounded-xl border border-[#0E2975] bg-white p-6 shadow-sm'>
      {/* 컨트롤 바 */}
      <div className='flex flex-col md:flex-row md:items-end gap-3'>
        <div className='flex-1'>
          <label className='mb-1 block text-sm text-slate-600'>시작 일자</label>
          <input
            type='date'
            value={startLocal}
            onChange={(e) => setStartLocal(e.target.value)}
            className='w-full rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          />
        </div>
        <div className='flex-1'>
          <label className='mb-1 block text-sm text-slate-600'>종료 일자</label>
          <input
            type='date'
            value={endLocal}
            onChange={(e) => setEndLocal(e.target.value)}
            className='w-full rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          />
        </div>

        <button
          onClick={() => kpiQ.refetch()}
          className='inline-flex h-[42px] items-center gap-2 rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600'
          title='새로고침'
        >
          <RefreshCw
            className={kpiQ.isFetching ? 'animate-spin w-4 h-4' : 'w-4 h-4'}
          />
          조회
        </button>
      </div>

      {/* 상태 텍스트 */}
      <div className='text-xs text-slate-500'>
        범위: {startLocal} ~ {endLocal}{' '}
        {kpiQ.isFetching ? '(불러오는 중…)' : ''}
      </div>

      {/* 카드 */}
      {kpiQ.error ? (
        <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm'>
          KPI 데이터를 불러오지 못했습니다.
        </div>
      ) : (
        <KpiCards kpi={kpiQ.data ?? null} />
      )}
    </section>
  );
}
