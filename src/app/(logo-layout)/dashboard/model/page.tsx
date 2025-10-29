// src/app/(logo-layout)/dashboard/model/page.tsx
'use client';

import ConfidenceChart from '@/components/model/ConfidenceChart';
import FeatureImportanceChart from '@/components/model/FeatureImportanceChart';
import ModelDashboard from '@/components/model/ModelDashboard';
import SingleModelRunner from '@/components/model/SingleModelRunner';
import ThresholdSettings from '@/components/model/ThresholdSettings';
import { useDashboardData } from '@/contexts/DashboardActionsContext';
import { useState } from 'react';

export default function ModelPage() {
  const { confidenceRange, featureImportance, saveThreshold } =
    useDashboardData();
  const [threshold, setThreshold] = useState<number>(0.5);

  const handleSaveThreshold = async () => {
    await saveThreshold(threshold);
  };

  return (
    <div className='space-y-8'>
      <ModelDashboard />

      {/* ✅ 한 섹션으로 묶어서 border 공유 */}
      <section className='rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
        {/* 1행: 가중치(7) + 임계값(3) */}
        <h3 className='mb-6 text-xl font-semibold text-slate-900'>
          임계치 설정
        </h3>
        <ThresholdSettings
          onChange={setThreshold}
          onSave={handleSaveThreshold}
        />

        {/* 구분선 */}
        <div className='my-8 border-t border-[#0E2975]' />

        {/* 3행: 단일 모델 테스트(embedded) */}
        <SingleModelRunner embedded />
      </section>

      {/* 신뢰도 */}
      <section className='relative rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
        <h3 className='mb-6 text-xl font-semibold text-slate-900'>
          신뢰도 분석
        </h3>
        <ConfidenceChart range={confidenceRange} />
      </section>

      {/* 특성 중요도 */}
      <section className='relative rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
        <h3 className='mb-6 text-xl font-semibold text-slate-900'>
          특성 중요도
        </h3>
        <div className='h-[350px]'>
          <FeatureImportanceChart data={featureImportance} />
        </div>
      </section>
    </div>
  );
}
