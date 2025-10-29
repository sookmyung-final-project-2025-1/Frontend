'use client';

import {
  useConfidenceQuery,
  type UseConfidenceQueryArgs,
} from '@/hooks/queries/model/useConfidenceQuery';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function ConfidenceChart({
  range,
}: {
  range: UseConfidenceQueryArgs;
}) {
  const { data, isLoading, error } = useConfidenceQuery(range);

  // recharts용 데이터로 변환
  const chartData = useMemo(() => {
    const list = data?.timeSeries ?? [];
    const fmt =
      range.period === 'daily'
        ? (ts: number) =>
            new Date(ts).toLocaleDateString('ko-KR', {
              month: '2-digit',
              day: '2-digit',
            })
        : range.period === 'weekly'
          ? (ts: number) =>
              new Date(ts).toLocaleDateString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
              })
          : // hourly (default)
            (ts: number) =>
              new Date(ts).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              });

    return list.map((d) => {
      const t = Date.parse(d.timestamp);
      return {
        x: Number.isFinite(t) ? fmt(t) : d.timestamp,
        score: Number(d.confidenceScore) || 0, // 0~1
        tx: Number(d.transactionCount) || 0,
      };
    });
  }, [data?.timeSeries, range.period]);

  const currentScore = data?.currentConfidenceScore;

  return (
    <div className='rounded-2xl border border-[#0E2975] bg-white shadow-sm'>
      <div className='p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='text-sm font-semibold text-slate-900'>
            Confidence Score 추이
          </div>
          {typeof currentScore === 'number' && (
            <div className='rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700'>
              현재: {(currentScore * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div className='h-64'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center text-slate-500'>
              불러오는 중…
            </div>
          ) : error ? (
            <div className='flex h-full items-center justify-center text-red-600'>
              데이터를 불러오지 못했습니다.
            </div>
          ) : (chartData?.length ?? 0) === 0 ? (
            <div className='flex h-full items-center justify-center text-sm text-slate-600'>
              표시할 데이터가 없습니다.
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
                <XAxis
                  dataKey='x'
                  stroke='#94A3B8'
                  fontSize={12}
                  tick={{ fill: '#64748B' }}
                />
                <YAxis
                  domain={[0, 1]}
                  stroke='#94A3B8'
                  fontSize={12}
                  tick={{ fill: '#64748B' }}
                  tickFormatter={(v) => `${Math.round((v as number) * 100)}%`}
                  width={48}
                />
                <Tooltip
                  labelStyle={{ color: '#64748B' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#0f172a',
                  }}
                  formatter={(value, name, entry) => {
                    if (entry && entry.dataKey === 'score') {
                      const v =
                        typeof value === 'number' ? value : Number(value);
                      return [`${(v * 100).toFixed(1)}%`, 'Confidence'];
                    }
                    return [value as any, name as string];
                  }}
                />

                {/* 현재 스코어 기준선(있을 때만 표시) */}
                {typeof currentScore === 'number' && (
                  <ReferenceLine
                    y={currentScore}
                    stroke='#F59E0B'
                    strokeDasharray='4 4'
                    label={{
                      value: `현재 ${(currentScore * 100).toFixed(1)}%`,
                      position: 'insideTopRight',
                      fill: '#B45309',
                    }}
                  />
                )}

                <Area
                  type='monotone'
                  dataKey='score'
                  name='Confidence'
                  stroke='#34D399'
                  fill='#34D399'
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
