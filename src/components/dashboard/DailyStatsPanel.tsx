// src/components/dashboard/DailyStatsPanel.tsx
'use client';

import { useStatsDailyQuery } from '@/hooks/queries/dashboard/useStatsDailyQuery';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* =========================
   유틸
   ========================= */
const pad2 = (n: number) => String(n).padStart(2, '0');
const daysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate(); // month는 1~12 가정

// KST(+09:00) 기준 ISO 문자열 생성 (00:00:00)
const kstStartISO = (y: number, m: number, d: number) =>
  `${y}-${pad2(m)}-${pad2(d)}T00:00:00+09:00`;
const kstNextDayISO = (y: number, m: number, d: number) => {
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 1);
  const ny = dt.getFullYear();
  const nm = dt.getMonth() + 1;
  const nd = dt.getDate();
  return `${ny}-${pad2(nm)}-${pad2(nd)}T00:00:00+09:00`;
};

const toPercent = (v: number) => {
  const pct = v <= 1 ? v * 100 : v;
  return `${pct.toFixed(2)}%`;
};

// '1970-..' 같은 연도를 현재 선택 연도로 치환해서 보여주기(표시용)
const forceDisplayYear = (s: string, displayYear: number) =>
  /^\d{4}-/.test(s) ? s.replace(/^\d{4}/, String(displayYear)) : s;

/* =========================
   타입
   ========================= */
type DailyResponse = {
  date: string;
  fraudRate: number; // 원본: 0~1 또는 0~100
  fraudRatePct: number; // 표시용: 0~100
  fraudCount: number;
  totalCount: number;
};

export default function DailyStatsPanel() {
  // 기본값: 오늘
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [day, setDay] = useState<number>(now.getDate());

  // 선택 옵션
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const from = 2019;
    return Array.from(
      { length: current - from + 1 },
      (_, i) => from + i
    ).reverse();
  }, []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const days = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
    [year, month]
  );

  // API 파라미터 (해당 날짜 00시 ~ 다음날 00시)
  const startTime = kstStartISO(year, month, day);
  const endTime = kstNextDayISO(year, month, day);

  const { data, isLoading, error } = useStatsDailyQuery({ startTime, endTime });

  // 시각화용 데이터 가공 (+ 화면 표시는 선택한 연도로 강제)
  const chartData = useMemo<DailyResponse[]>(() => {
    if (!Array.isArray(data)) return [];
    return data.map((d) => {
      const rawRate = Number(d.fraudRate ?? 0);
      const pct = rawRate <= 1 ? rawRate * 100 : rawRate; // ★ 0~100으로 통일
      return {
        date: forceDisplayYear(String(d.date ?? ''), year),
        fraudRate: rawRate,
        fraudRatePct: pct, // ★ 표시용 키
        fraudCount: Number(d.fraudCount ?? 0),
        totalCount: Number(d.totalCount ?? 0),
      };
    });
  }, [data, year]);

  const empty = !isLoading && chartData.length === 0;

  return (
    <div className='w-full space-y-6 rounded-xl border border-[#0E2975] bg-white p-6 shadow-sm'>
      <header className='flex flex-col md:flex-row md:items-center gap-4'>
        <div className='flex-1'>
          <h3 className='text-xl font-semibold text-slate-900'>일별 통계</h3>
          <p className='text-sm text-slate-600'>
            선택한 날짜의 00:00부터 다음날 00:00까지(KST, +09:00) 구간으로
            조회합니다.
          </p>
        </div>

        {/* 날짜 선택 드롭다운 */}
        <div className='flex items-center gap-2'>
          <select
            value={year}
            onChange={(e) => {
              const y = Number(e.target.value);
              setYear(y);
              const maxDay = daysInMonth(y, month);
              if (day > maxDay) setDay(maxDay);
            }}
            className='rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => {
              const m = Number(e.target.value);
              setMonth(m);
              const maxDay = daysInMonth(year, m);
              if (day > maxDay) setDay(maxDay);
            }}
            className='rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className='rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 상태 표시 */}
      {isLoading && <div className='text-slate-500'>불러오는 중입니다…</div>}
      {error && (
        <div className='text-red-600'>
          데이터를 불러오지 못했습니다: {(error as any)?.message ?? '에러'}
        </div>
      )}

      {/* 차트들 */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        {/* 거래수/사기수 */}
        <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
          <h4 className='mb-2 text-lg font-semibold text-slate-900'>
            거래수 & 사기 거래수
          </h4>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={
                  empty
                    ? [{ date: '—', totalCount: 0, fraudCount: 0 }]
                    : chartData
                }
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
                <XAxis
                  dataKey='date'
                  stroke='#94A3B8'
                  tick={{ fill: '#64748B' }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke='#94A3B8'
                  tick={{ fill: '#64748B' }}
                />
                <Tooltip
                  formatter={(v, name) => {
                    const num = Number(v);
                    return [
                      num.toLocaleString(),
                      name === 'totalCount' ? '거래수' : '사기수',
                    ];
                  }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#0f172a',
                  }}
                  labelStyle={{ color: '#64748B' }}
                  itemStyle={{ color: '#1f2937' }}
                />
                <Legend
                  formatter={(value) =>
                    value === 'totalCount'
                      ? '거래수'
                      : value === 'fraudCount'
                        ? '사기수'
                        : value
                  }
                />
                <Bar
                  dataKey='totalCount'
                  radius={[4, 4, 0, 0]}
                  fill='#60A5FA'
                />
                <Bar
                  dataKey='fraudCount'
                  radius={[4, 4, 0, 0]}
                  fill='#F87171'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 사기율(%) */}
        <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
          <h4 className='mb-2 text-lg font-semibold text-slate-900'>
            사기율(%)
          </h4>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={
                  empty ? ([{ date: '—', fraudRatePct: 0 }] as any) : chartData
                }
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
                <XAxis
                  dataKey='date'
                  stroke='#94A3B8'
                  tick={{ fill: '#64748B' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke='#94A3B8'
                  tick={{ fill: '#64748B' }}
                  tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(2)}%`, '사기율']}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#0f172a',
                  }}
                  labelStyle={{ color: '#64748B' }}
                  itemStyle={{ color: '#1f2937' }}
                />
                <Legend
                  formatter={(v) => (v === 'fraudRatePct' ? '사기율' : v)}
                />
                <Line
                  type='monotone'
                  dataKey='fraudRatePct' // ★ 0~100 값 사용
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  stroke='#FCD34D'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 표 */}
      <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
        <h4 className='mb-3 text-lg font-semibold text-slate-900'>세부 내역</h4>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-200 text-slate-600'>
                <th className='px-4 py-2 text-left'>슬롯(날짜/시간)</th>
                <th className='px-4 py-2 text-right'>거래수</th>
                <th className='px-4 py-2 text-right'>사기수</th>
                <th className='px-4 py-2 text-right'>사기율</th>
              </tr>
            </thead>
            <tbody>
              {(empty ? [] : chartData).map((row) => (
                <tr key={row.date} className='border-b border-gray-100'>
                  <td className='px-4 py-2 text-slate-700'>{row.date}</td>
                  <td className='px-4 py-2 text-right text-slate-800'>
                    {row.totalCount?.toLocaleString()}
                  </td>
                  <td className='px-4 py-2 text-right text-slate-800'>
                    {row.fraudCount?.toLocaleString()}
                  </td>
                  <td className='px-4 py-2 text-right text-slate-800'>
                    {row.fraudRatePct.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {empty && (
                <tr>
                  <td
                    className='px-4 py-6 text-center text-slate-500'
                    colSpan={4}
                  >
                    선택한 날짜에 대한 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className='mt-2 text-xs text-slate-500'>
          * API 응답 스키마에 따라 <code>date</code> 슬롯은 시간/구간 단위일 수
          있습니다.
        </p>
      </div>
    </div>
  );
}
