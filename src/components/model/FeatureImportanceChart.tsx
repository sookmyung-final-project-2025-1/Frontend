'use client';

import { useMemo, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type FeatureImportancePayload = {
  calculatedAt: string;
  sampleSize: number;
  featureImportance: Record<string, number>;
};

export default function FeatureImportanceChart({
  data,
}: {
  data?: FeatureImportancePayload;
}) {
  const chartData = useMemo(() => {
    const dict = data?.featureImportance ?? {};
    const items = Object.entries(dict).map(([feature, importance]) => ({
      feature,
      importance: Number(importance) || 0,
    }));
    if (!items.length) return [];

    const sorted = items.sort((a, b) => b.importance - a.importance);
    const top = sorted.slice(0, 15);
    const total =
      top.reduce(
        (s, v) => s + (Number.isFinite(v.importance) ? v.importance : 0),
        0
      ) || 1;

    return top.map((d) => ({
      feature: d.feature,
      importance: d.importance,
      pct: d.importance / total,
    }));
  }, [data]);

  const yAxisWidth = useMemo(() => {
    const longest = chartData.reduce(
      (m, d) => Math.max(m, d.feature.length),
      0
    );
    return Math.min(240, Math.max(100, longest * 9));
  }, [chartData]);

  const xMax = useMemo(() => {
    const max = chartData.reduce((m, d) => Math.max(m, d.pct), 0);
    const withHeadroom = max > 0 ? max * 1.1 : 1;
    return Math.min(1, withHeadroom);
  }, [chartData]);

  const subtitle =
    data?.sampleSize || data?.calculatedAt
      ? `샘플 ${data?.sampleSize?.toLocaleString?.() ?? '-'} • 계산 시각 ${
          data?.calculatedAt
            ? new Date(data.calculatedAt).toLocaleString('ko-KR')
            : '-'
        }`
      : null;

  return (
    <div className='rounded-2xl border border-[#0E2975] bg-white shadow-sm'>
      <div className='p-4'>
        <div className='text-sm font-semibold text-slate-900'>
          Feature Importance
        </div>
        {subtitle && (
          <div className='mt-0.5 text-xs text-slate-500'>{subtitle}</div>
        )}

        <div className='mt-2 h-72'>
          {chartData.length === 0 ? (
            <div className='flex h-full items-center justify-center text-sm text-slate-500'>
              표시할 데이터가 없습니다.
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={chartData}
                layout='vertical'
                margin={{ top: 15, right: 35, bottom: 2, left: 5 }}
                barCategoryGap={12}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />

                <YAxis
                  type='category'
                  dataKey='feature'
                  width={yAxisWidth}
                  interval={0}
                  tick={{ fill: '#475569', fontSize: 12 }}
                  tickMargin={8}
                  axisLine={false}
                  tickLine={false}
                />

                <XAxis
                  type='number'
                  domain={[0, xMax]}
                  tickFormatter={(v) => `${Math.round((v as number) * 100)}%`}
                  tick={{ fill: '#64748B', fontSize: 12 }}
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
                    if (entry?.dataKey === 'pct') {
                      const v =
                        typeof value === 'number' ? value : Number(value);
                      const raw = (entry?.payload as any)?.importance;
                      return [
                        `${(v * 100).toFixed(2)}% (raw: ${raw})`,
                        '중요도',
                      ];
                    }
                    return [value as any, name as string];
                  }}
                />
                <Legend />

                <Bar
                  dataKey='pct'
                  name='중요도(%)'
                  fill='#f97315'
                  barSize={18}
                  fontSize={10}
                >
                  <LabelList
                    dataKey='pct'
                    position='right'
                    formatter={(label: ReactNode) => {
                      const v =
                        typeof label === 'number' ? label : Number(label);
                    return Number.isFinite(v)
                      ? `${(v * 100).toFixed(1)}%`
                      : (label as any);
                  }}
                    fill='#1f2937'
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
