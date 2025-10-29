'use client';

import DailyStatsPanel from '@/components/dashboard/DailyStatsPanel';
import FraudTrend from '@/components/dashboard/FraudTrend';
import KpiCards from '@/components/dashboard/KpiCards';
import ProbChartWeekly from '@/components/dashboard/ProbChart';
import ProbChartMonthly from '@/components/dashboard/ProbChartMonthly';
import SystemHealth from '@/components/dashboard/SystemHealth';
import { useDashboardData } from '@/contexts/DashboardActionsContext';

export default function DashboardPage() {
  const { kpi, error, seriesProbRange } = useDashboardData();

  return (
    <div className='space-y-8'>
      {error.any && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-600'>
          일부 데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      <section>
        <KpiCards />
      </section>

      <section className='grid grid-cols-1 gap-8'>
        <div className='col-span-1'>
          <div className='relative rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
            <h2 className='text-xl font-semibold text-slate-900'>
              사기 거래 트렌드 분석
            </h2>
            <div>
              <FraudTrend />
            </div>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 gap-8'>
        <div className='col-span-1'>
          <div className='relative rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
            <h3 className='mb-6 text-xl font-semibold text-slate-900'>
              시스템 헬스 상태
            </h3>
            <div className='min-h-[500px]'>
              <SystemHealth />
            </div>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 gap-8'>
        <div className='col-span-1'>
          <div className='relative rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
            <h3 className='mb-6 text-xl font-semibold text-slate-900'>
              확률 분석
            </h3>
            <div className='flex flex-col space-y-6 w-full'>
              <DailyStatsPanel />
              <ProbChartWeekly />
              <ProbChartMonthly />
            </div>
          </div>
        </div>
      </section>
      {/* 
      <section className='grid grid-cols-1 gap-8'>
        <div className='col-span-1'>
          <div className='relative rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
            <h3 className='mb-6 text-xl font-semibold text-slate-900'>
              고위험 거래 조회
            </h3>
            <div className='min-h-[500px]'>
              <TablePlaceholder />
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
