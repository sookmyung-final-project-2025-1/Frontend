// src/components/dashboard/ProbChartMonthly.tsx
'use client';

import { useStatsMonthlyQuery } from '@/hooks/queries/dashboard/useStatsMonthlyQuery';
import { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* -------------------- 월 유틸 -------------------- */
const pad = (n: number) => String(n).padStart(2, '0');
const toMonthInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const monthStartLocal = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1, 0, 0, 0);
const monthInputToStartISO = (v: string) =>
  new Date(`${v}-01T00:00:00`).toISOString();

/* -------------------- 포맷터 -------------------- */
const fmtPct = (v: number) => `${v.toFixed(1)}%`;
const fmtKRW = (v: number) => `₩${Math.round(v).toLocaleString('ko-KR')}`;

/* -------------------- 타입 (응답 스키마) -------------------- */
type MonthlyPoint = {
  month: string; // 'YYYY-MM-01'
  totalCount: number;
  fraudCount: number;
  fraudRate: number; // 0~1
  totalAmount: number; // 합계 금액
  avgAmount: number; // 평균 금액
  uniqueUsers: number;
};

/* -------------------- 컴포넌트 -------------------- */
export default function ProbChartMonthly() {
  // 기본: 최근 3개월
  const today = new Date();
  const defaultStartMonth = addMonths(monthStartLocal(today), -2);
  const defaultEndMonth = monthStartLocal(today);

  const [startMonthLocal, setStartMonthLocal] = useState<string>(
    toMonthInput(defaultStartMonth)
  );
  const [endMonthLocal, setEndMonthLocal] = useState<string>(
    toMonthInput(defaultEndMonth)
  );

  // ISO 범위: [startMonth, endMonthNext)
  const startISO = useMemo(
    () => monthInputToStartISO(startMonthLocal),
    [startMonthLocal]
  );
  const endISO = useMemo(
    () => addMonths(new Date(`${endMonthLocal}-01T00:00:00`), 1).toISOString(),
    [endMonthLocal]
  );

  const invalidRange = useMemo(() => {
    const s = new Date(`${startMonthLocal}-01T00:00:00`).getTime();
    const e = new Date(`${endMonthLocal}-01T00:00:00`).getTime();
    return s > e;
  }, [startMonthLocal, endMonthLocal]);

  const {
    data = [],
    isLoading,
    error,
  } = useStatsMonthlyQuery({
    startTime: startISO,
    endTime: endISO,
  });

  // 응답 → 차트 데이터 매핑
  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const rows = (data as MonthlyPoint[]).map((p) => {
      const raw = p.month.slice(0, 7);
      const parsed = new Date(`${raw}-01T00:00:00`);
      const shifted = Number.isFinite(parsed.getTime())
        ? (() => {
            parsed.setFullYear(currentYear);
            return parsed.toISOString().slice(0, 7);
          })()
        : raw;
      return {
        monthLabel: shifted,
        totalCount: Number(p.totalCount) || 0,
        fraudCount: Number(p.fraudCount) || 0,
        fraudRatePct: (Number(p.fraudRate) || 0) * 100,
        totalAmount: Number(p.totalAmount) || 0,
        avgAmount: Number(p.avgAmount) || 0,
        uniqueUsers: Number(p.uniqueUsers) || 0,
      };
    });

    rows.sort((a, b) => a.monthLabel.localeCompare(b.monthLabel));
    return rows;
  }, [data]);

  const hasRange = Boolean(startISO && endISO && !invalidRange);

  return (
    <div className='rounded-2xl border border-[#0E2975] bg-white shadow-sm xl:col-span-2 h-fit'>
      <div className='p-6'>
        <div className='text-xl font-semibold text-slate-900'>월간 지표</div>

        {/* 컨트롤 */}
        <div className='mb-3 grid grid-cols-1 md:grid-cols-3 gap-3'>
          <div>
            <label className='block text-xs text-slate-600 mb-1'>시작월</label>
            <input
              type='month'
              value={startMonthLocal}
              onChange={(e) => setStartMonthLocal(e.target.value)}
              className='w-full rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
              max={endMonthLocal}
            />
          </div>
          <div>
            <label className='block text-xs text-slate-600 mb-1'>종료월</label>
            <input
              type='month'
              value={endMonthLocal}
              onChange={(e) => setEndMonthLocal(e.target.value)}
              className='w-full rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
              min={startMonthLocal}
              max={toMonthInput(today)}
            />
          </div>
          <div className='flex items-end'>
            <div
              className='flex h-[38px] w-full items-center justify-center rounded-lg border border-[#0E2975] bg-white text-slate-500 shadow-sm'
              title='기간은 월 단위로 조회됩니다 (종료월의 다음달 1일 00:00까지)'
            >
              월 단위 조회
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
          {/* 상태 */}
          <div className='mb-2 text-xs text-slate-600'>
            범위: <code className='text-slate-700'>{startMonthLocal}</code> ~{' '}
            <code className='text-slate-700'>{endMonthLocal}</code>
            {!invalidRange ? null : (
              <span className='ml-2 text-red-600'>
                (시작월이 종료월보다 늦습니다)
              </span>
            )}
          </div>

          {/* 1) 거래수 & 사기수 & 사기율(%) */}
          <div className='h-72 mb-6'>
            {!invalidRange && (!hasRange || isLoading) && (
              <div className='h-full flex items-center justify-center text-slate-500'>
                {hasRange ? '불러오는 중…' : '월 범위를 선택해 주세요'}
              </div>
            )}
            {!invalidRange && error && (
              <div className='h-full flex items-center justify-center text-red-600'>
                데이터를 불러오지 못했습니다.
              </div>
            )}
            {!invalidRange && !isLoading && !error && hasRange && (
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
                  <XAxis
                    dataKey='monthLabel'
                    stroke='#94A3B8'
                    fontSize={12}
                    tick={{ fill: '#64748B' }}
                  />

                  {/* 왼쪽 Y: 건수 */}
                  <YAxis
                    yAxisId='left'
                    stroke='#94A3B8'
                    fontSize={12}
                    width={48}
                    allowDecimals={false}
                    tick={{ fill: '#64748B' }}
                  />

                  {/* 오른쪽 Y: 사기율(%) */}
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    stroke='#94A3B8'
                    fontSize={12}
                    width={56}
                    domain={[0, 100]}
                    tickFormatter={fmtPct}
                    tick={{ fill: '#64748B' }}
                  />

                  <Tooltip
                    formatter={(value, name, entry) => {
                      const key = entry?.dataKey;
                      if (key === 'fraudRatePct') {
                        const v =
                          typeof value === 'number' ? value : Number(value);
                        return [fmtPct(v), '사기율'];
                      }
                      if (key === 'totalCount') {
                        const v =
                          typeof value === 'number' ? value : Number(value);
                        return [v.toLocaleString(), '전체 거래'];
                      }
                      if (key === 'fraudCount') {
                        const v =
                          typeof value === 'number' ? value : Number(value);
                        return [v.toLocaleString(), '사기 거래'];
                      }
                      return [value as any, name as string];
                    }}
                    labelFormatter={(label) => `월: ${label as string}`}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#64748B' }}
                    itemStyle={{ color: '#1f2937' }}
                  />

                  <Legend
                    formatter={(value) => {
                      if (value === 'totalCount') return '전체 거래';
                      if (value === 'fraudCount') return '사기 거래';
                      if (value === 'fraudRatePct') return '사기율';
                      return value;
                    }}
                  />

                  {/* 전체 거래(막대) */}
                  <Bar
                    yAxisId='left'
                    dataKey='totalCount'
                    name='전체 거래'
                    fill='#60A5FA'
                    radius={[4, 4, 0, 0]}
                  />

                  {/* 사기 거래(라인) */}
                  <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey='fraudCount'
                    name='사기 거래'
                    stroke='#EF4444'
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive
                  />

                  {/* 사기율(면적 + 라인) */}
                  <Area
                    yAxisId='right'
                    type='monotone'
                    dataKey='fraudRatePct'
                    name='사기율'
                    stroke='#34D399'
                    fill='#34D399'
                    fillOpacity={0.18}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='fraudRatePct'
                    name='사기율 라인'
                    stroke='#22C55E'
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    isAnimationActive
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 2) 금액 지표: 총 금액(₩, 좌) & 평균 금액(₩, 우) */}
          <div className='h-72'>
            {!invalidRange && !isLoading && !error && hasRange && (
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
                  <XAxis
                    dataKey='monthLabel'
                    stroke='#94A3B8'
                    fontSize={12}
                    tick={{ fill: '#64748B' }}
                  />

                  {/* 왼쪽 Y: 총 금액(₩) */}
                  <YAxis
                    yAxisId='left'
                    stroke='#94A3B8'
                    fontSize={12}
                    width={64}
                    tickFormatter={(v) => fmtKRW(Number(v))}
                    tick={{ fill: '#64748B' }}
                  />

                  {/* 오른쪽 Y: 평균 금액(₩) */}
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    stroke='#94A3B8'
                    fontSize={12}
                    width={64}
                    tickFormatter={(v) => fmtKRW(Number(v))}
                    tick={{ fill: '#64748B' }}
                  />

                  <Tooltip
                    formatter={(value, name, entry) => {
                      const key = entry?.dataKey;
                      if (key === 'totalAmount') {
                        return [fmtKRW(Number(value)), '총 금액'];
                      }
                      if (key === 'avgAmount') {
                        return [fmtKRW(Number(value)), '평균 금액'];
                      }
                      return [value as any, name as string];
                    }}
                    labelFormatter={(label) => `월: ${label as string}`}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#64748B' }}
                    itemStyle={{ color: '#1f2937' }}
                  />

                  <Legend
                    formatter={(value) => {
                      if (value === 'totalAmount') return '총 금액';
                      if (value === 'avgAmount') return '평균 금액';
                      return value;
                    }}
                  />

                  {/* 총 금액(면적) */}
                  <Area
                    yAxisId='left'
                    type='monotone'
                    dataKey='totalAmount'
                    name='총 금액'
                    stroke='#60A5FA'
                    fill='#60A5FA'
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />

                  {/* 평균 금액(라인) */}
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='avgAmount'
                    name='평균 금액'
                    stroke='#F59E0B'
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
