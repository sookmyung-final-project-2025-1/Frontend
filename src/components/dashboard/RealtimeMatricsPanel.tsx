'use client';

import {
  useMetricRealtime,
  type RealtimeMetric,
} from '@/hooks/queries/dashboard/useMetricRealtime';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function RealtimeOverview() {
  const { data: snap, refetch } = useMetricRealtime();
  const [series, setSeries] = useState<RealtimeMetric[]>([]);
  const lastTsRef = useRef<string | null>(null);

  // 스냅샷 버퍼링 (최근 60포인트)
  useEffect(() => {
    if (!snap?.timestamp) return;
    if (lastTsRef.current === snap.timestamp) return;
    lastTsRef.current = snap.timestamp;
    setSeries((prev) => {
      const next = [...prev, snap];
      return next.length > 60 ? next.slice(-60) : next;
    });
  }, [snap]);

  // ===== 시계열: 처리량/사기율 =====
  const throughputFraud = useMemo(
    () =>
      series.map((d) => ({
        time: new Date(d.timestamp).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        throughput: d.hourly.throughputPerHour ?? 0,
        fraudRatePct: (d.hourly.fraudRate ?? 0) * 100,
      })),
    [series]
  );

  // ===== 시계열: 최근 거래 수 =====
  const recentTxs = useMemo(
    () =>
      series.map((d) => ({
        time: new Date(d.timestamp).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        fraud: d.recentFraudTransactions ?? 0,
        total: (d.recentTransactions ?? 0) - (d.recentFraudTransactions ?? 0),
        totalAll: d.recentTransactions ?? 0,
      })),
    [series]
  );

  // ===== 우측 게이지: 평균 신뢰도 =====
  const avgConfPct = Math.max(
    0,
    Math.min(100, (snap?.hourly.averageConfidenceScore ?? 0) * 100)
  );

  // 최신 통계 요약
  const latestStats = snap
    ? {
        totalTransactions: snap.hourly.totalTransactions ?? 0,
        fraudRate: ((snap.hourly.fraudRate ?? 0) * 100).toFixed(2),
        throughput: snap.hourly.throughputPerHour ?? 0,
        recentTransactions: snap.recentTransactions ?? 0,
        recentFraud: snap.recentFraudTransactions ?? 0,
      }
    : null;

  return (
    <div className='space-y-6'>
      {/* 상단: 주요 지표 카드 */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='시간당 처리량'
          value={latestStats?.throughput.toLocaleString() ?? '-'}
          unit='건'
          trend={
            series.length >= 2
              ? (series[series.length - 1]?.hourly.throughputPerHour ?? 0) -
                (series[series.length - 2]?.hourly.throughputPerHour ?? 0)
              : 0
          }
        />
        <StatCard
          title='사기율'
          value={latestStats?.fraudRate ?? '-'}
          unit='%'
          trend={
            series.length >= 2
              ? (series[series.length - 1]?.hourly.fraudRate ?? 0) * 100 -
                (series[series.length - 2]?.hourly.fraudRate ?? 0) * 100
              : 0
          }
          isPercentage
        />
        <StatCard
          title='최근 거래'
          value={latestStats?.recentTransactions.toLocaleString() ?? '-'}
          unit='건'
        />
        <StatCard
          title='최근 사기 탐지'
          value={latestStats?.recentFraud.toLocaleString() ?? '-'}
          unit='건'
        />
      </div>

      {/* 메인 차트 영역 */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {/* 처리량/사기율 시계열 - 2컬럼 */}
        <div className='xl:col-span-2'>
          <Card title='처리량 및 사기율 추이'>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={throughputFraud}
                  margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#E2E8F0'
                    opacity={0.8}
                  />
                  <XAxis
                    dataKey='time'
                    stroke='#94A3B8'
                    fontSize={11}
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5F5' }}
                  />
                  <YAxis
                    yAxisId='left'
                    stroke='#3B82F6'
                    fontSize={11}
                    tick={{ fill: '#3B82F6' }}
                    axisLine={{ stroke: '#3B82F6' }}
                  />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    domain={[0, 'dataMax']}
                    tickFormatter={(v) => `${v.toFixed(1)}%`}
                    stroke='#EF4444'
                    fontSize={11}
                    tick={{ fill: '#EF4444' }}
                    axisLine={{ stroke: '#EF4444' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: '#0f172a',
                    }}
                    labelStyle={{ color: '#64748B' }}
                    formatter={(v: any, name: any) => {
                      if (name === '사기율(%)')
                        return [`${Number(v).toFixed(2)}%`, name];
                      return [Number(v).toLocaleString(), name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey='throughput'
                    name='처리량(건/시간)'
                    stroke='#3B82F6'
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3B82F6' }}
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='fraudRatePct'
                    name='사기율(%)'
                    stroke='#EF4444'
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, stroke: '#EF4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 신뢰도 게이지 - 1컬럼 */}
        <div className='xl:col-span-1'>
          <Card title='평균 신뢰도 점수'>
            <div className='h-80 flex flex-col items-center justify-center'>
              <div className='relative'>
                <RadialBarChart
                  width={240}
                  height={240}
                  cx='50%'
                  cy='50%'
                  innerRadius='65%'
                  outerRadius='95%'
                  barSize={16}
                  data={[{ name: 'Confidence', value: avgConfPct }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis
                    type='number'
                    domain={[0, 100]}
                    tick={false}
                  />
                  <RadialBar
                    dataKey='value'
                    cornerRadius={8}
                    background={{ fill: '#E2E8F0' }}
                    fill={
                      avgConfPct >= 80
                        ? '#22C55E'
                        : avgConfPct >= 60
                          ? '#F59E0B'
                          : '#EF4444'
                    }
                  />
                  <text
                    x='50%'
                    y='50%'
                    textAnchor='middle'
                    dominantBaseline='middle'
                    fill='#1f2937'
                    fontSize={28}
                    fontWeight={700}
                  >
                    {Number.isFinite(avgConfPct)
                      ? `${avgConfPct.toFixed(0)}%`
                      : '--'}
                  </text>
                </RadialBarChart>
              </div>

              {/* 상세 지표 */}
              <div className='mt-4 w-full space-y-3'>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-slate-600'>총 거래 수</span>
                  <span className='font-medium text-slate-900'>
                    {latestStats?.totalTransactions.toLocaleString() ?? '-'}
                  </span>
                </div>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-slate-600'>현재 사기율</span>
                  <span
                    className={`font-medium ${
                      Number(latestStats?.fraudRate ?? 0) > 5
                        ? 'text-red-600'
                        : Number(latestStats?.fraudRate ?? 0) > 2
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {latestStats?.fraudRate}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 하단: 거래량 바차트 */}
      <Card title='최근 거래 현황'>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={recentTxs}
              margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#E2E8F0'
                opacity={0.8}
              />
              <XAxis
                dataKey='time'
                stroke='#94A3B8'
                fontSize={11}
                tick={{ fill: '#64748B' }}
              />
              <YAxis
                stroke='#94A3B8'
                fontSize={11}
                tick={{ fill: '#64748B' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#0f172a',
                }}
                labelStyle={{ color: '#64748B' }}
                formatter={(v: any, name: any) => [
                  Number(v).toLocaleString(),
                  name,
                ]}
              />
              <Legend />
              <Bar
                dataKey='total'
                name='정상 거래'
                fill='#3B82F6'
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey='fraud'
                name='사기 거래'
                fill='#EF4444'
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-[#0E2975] bg-white shadow-sm'>
      <div className='p-6'>
        <div className='mb-4 text-base font-semibold text-slate-800'>
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  unit,
  trend,
  isPercentage = false,
}: {
  title: string;
  value: string | number;
  unit: string;
  trend?: number;
  isPercentage?: boolean;
}) {
  const trendColor =
    trend === undefined
      ? ''
      : trend > 0
        ? 'text-green-600'
        : trend < 0
          ? 'text-red-600'
          : 'text-slate-500';

  const trendIcon =
    trend === undefined ? '' : trend > 0 ? '↗' : trend < 0 ? '↘' : '→';

  return (
    <div className='rounded-lg border border-[#0E2975] bg-white p-4 shadow-sm'>
      <div className='mb-1 text-xs text-slate-500'>{title}</div>
      <div className='flex items-baseline justify-between'>
        <div className='flex items-baseline'>
          <span className='text-xl font-bold text-slate-900'>{value}</span>
          <span className='ml-1 text-sm text-slate-500'>{unit}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trendColor}`}>
            <span className='mr-1 text-base leading-none'>{trendIcon}</span>
            <span>{Math.abs(trend).toFixed(isPercentage ? 2 : 0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
