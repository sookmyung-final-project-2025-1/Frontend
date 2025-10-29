'use client';

import { ReportStats } from '@/types/report-types';
import { AlertTriangle, BarChart3, Clock, ListChecks } from 'lucide-react';

type Props = {
  stats: ReportStats | null;
  statsLoading: boolean;
  pendingCount: number;
  pendingLoading: boolean;
};

export default function ReportStatsCards({
  stats,
  statsLoading,
  pendingCount,
  pendingLoading,
}: Props) {
  const total = stats
    ? stats.approvedReports + stats.rejectedReports + stats.pendingReports
    : 0;

  return (
    <div className='space-y-4'>
      {/* 상단 3카드 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card
          title='대기 중 신고'
          loading={pendingLoading}
          value={pendingCount.toLocaleString()}
          icon={<AlertTriangle className='w-5 h-5' />}
        />
        <Card
          title={`최근 통계 합계 (${stats?.period ?? '-'})`}
          loading={statsLoading}
          value={total.toLocaleString()}
          icon={<BarChart3 className='w-5 h-5' />}
        />
        <Card
          title='통계 키 수'
          loading={statsLoading}
          value={stats ? Object.keys(stats.reportReasons ?? {}).length : 0}
          icon={<ListChecks className='w-5 h-5' />}
        />
      </div>

      {/* 상세 통계 패널 */}
      <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Clock className='h-4 w-4' />
            상세 통계
          </div>
          <div className='text-xs text-slate-500'>
            계산시각:{' '}
            {stats ? new Date(stats.calculatedAt).toLocaleString('ko-KR') : '-'}
          </div>
        </div>

        {statsLoading && <div className='text-slate-500'>불러오는 중...</div>}
        {!statsLoading && !stats && (
          <div className='text-slate-500'>통계 데이터가 없습니다.</div>
        )}

        {stats && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            <KV label='기간' value={stats.period} />
            <KV label='총 신고' value={stats.totalReports} />
            <KV label='승인' value={stats.approvedReports} />
            <KV label='반려' value={stats.rejectedReports} />
            <KV label='대기' value={stats.pendingReports} />
            <KV
              label='승인율'
              value={`${(stats.approvalRate ?? 0).toFixed(1)}%`}
            />
            <KV
              label='골드 라벨 정확도'
              value={`${(stats.goldLabelAccuracy ?? 0).toFixed(1)}%`}
            />
            <KV
              label='평균 처리 시간'
              value={`${(stats.averageProcessingHours ?? 0).toFixed(2)}h`}
            />
          </div>
        )}

        {/* 사유 분포 */}
        {stats && (
          <div className='mt-4'>
            <div className='mb-2 text-sm text-slate-600'>사유별 신고 수</div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'>
              {Object.entries(stats.reportReasons ?? {}).map(([k, v]) => (
                <div
                  key={k}
                  className='flex items-center justify-between rounded-lg border border-[#0E2975] bg-white px-3 py-2 shadow-sm'
                >
                  <span className='text-xs text-slate-600'>{k}</span>
                  <span className='text-sm font-medium text-slate-900'>
                    {Number(v).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value: string | number;
  loading?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-slate-600'>{title}</p>
          <p className='text-2xl font-semibold text-slate-900'>
            {loading ? '불러오는 중...' : value}
          </p>
        </div>
        <div className='text-slate-500'>{icon}</div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string | number }) {
  return (
    <div className='rounded-lg border border-[#0E2975] bg-white p-3 shadow-sm'>
      <div className='text-xs text-slate-600'>{label}</div>
      <div className='text-sm font-medium text-slate-900'>{value}</div>
    </div>
  );
}
