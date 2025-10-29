'use client';
'use client';

import { Info, ListChecks, RefreshCw, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useDeployModelVersion } from '@/hooks/queries/model/useDeployModelVersion';
import { useGetAvailableVersion } from '@/hooks/queries/model/useGetAvailableVersion';
import { useGetModelVersionMetadata } from '@/hooks/queries/model/useGetModelVersionMetadata';
import { useReloadModelService } from '@/hooks/queries/model/useReloadModelService';

export default function ModelDashboard() {
  // 1) 버전 목록 가져오기
  const versionsQ = useGetAvailableVersion();

  // 선택 버전: 기본은 currentVersion
  const [selected, setSelected] = useState<string>('');
  useEffect(() => {
    if (!versionsQ.data) return;
    setSelected((prev) => prev || versionsQ.data.currentVersion);
  }, [versionsQ.data]);

  // 2) 선택 버전 메타데이터
  const metadataQ = useGetModelVersionMetadata(selected);

  // 3) 액션 훅
  const deployM = useDeployModelVersion();
  const reloadM = useReloadModelService();

  const current = versionsQ.data?.currentVersion ?? '-';
  const latest = versionsQ.data?.latestVersion ?? '-';
  const total = versionsQ.data?.totalCount ?? 0;
  const list = versionsQ.data?.versions ?? [];

  const canDeploy = useMemo(
    () =>
      !!selected &&
      selected !== current &&
      !deployM.isPending &&
      !versionsQ.isLoading,
    [selected, current, deployM.isPending, versionsQ.isLoading]
  );

  const handleDeploy = async () => {
    if (!selected) return;
    await deployM.mutateAsync({ version: selected });
    // 성공 후 목록/메타데이터 갱신
    await versionsQ.refetch();
    await metadataQ.refetch();
  };

  const handleReload = async () => {
    await reloadM.mutateAsync();
  };

  return (
    <div className='space-y-8 rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
      {/* 헤더 */}
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>모델 관리</h1>
        <p className='text-sm text-slate-800'>
          버전 배포 / 서비스 재로딩 / 메타데이터 확인
        </p>
      </div>

      {/* 상단 카드 */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          title='현재 버전'
          value={current}
          icon={<Info className='w-5 h-5' />}
          loading={versionsQ.isLoading}
        />
        <StatCard
          title='최신 버전'
          value={latest}
          icon={<UploadCloud className='w-5 h-5' />}
          loading={versionsQ.isLoading}
        />
        <StatCard
          title='버전 개수'
          value={total.toLocaleString()}
          icon={<ListChecks className='w-5 h-5' />}
          loading={versionsQ.isLoading}
        />
      </div>

      {/* 액션 + 버전 선택 */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* 배포/재로딩 액션 */}
        <div className='space-y-4 rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold'>액션</h3>
            <span className='text-xs text-slate-600'>
              선택 버전: {selected || '-'}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleDeploy}
              disabled={!canDeploy}
              className='rounded-lg bg-blue-500 px-3 py-2 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
              title={
                selected === current
                  ? '현재 버전과 동일합니다'
                  : '이 버전으로 배포'
              }
            >
              {deployM.isPending ? '배포 중...' : '선택 버전 배포'}
            </button>

            <button
              onClick={handleReload}
              disabled={reloadM.isPending}
              className='inline-flex items-center gap-2 rounded-lg border border-[#0E2975] bg-white px-3 py-2 text-slate-700 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50'
              title='모델 서비스 재로딩'
            >
              <RefreshCw className='h-4 w-4' />
              {reloadM.isPending ? '재로딩...' : '서비스 재로딩'}
            </button>
          </div>

          {(deployM.error || reloadM.error) && (
            <p className='text-sm text-red-600'>
              작업 실패. 콘솔 로그를 확인하세요.
            </p>
          )}
        </div>

        {/* 버전 목록 */}
        <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm lg:col-span-2'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='font-semibold'>사용 가능한 버전</h3>
            {versionsQ.isLoading && (
              <span className='text-xs text-slate-500'>불러오는 중...</span>
            )}
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
            {list.map((ver) => (
              <label
                key={ver}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                  ver === selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-[#0E2975] hover:bg-white/80'
                }`}
              >
                <input
                  type='radio'
                  name='version'
                  value={ver}
                  checked={ver === selected}
                  onChange={() => setSelected(ver)}
                  className='mr-2'
                />
                {ver}
                {ver === current && (
                  <span className='ml-2 text-xs text-green-600'>현재</span>
                )}
                {ver === latest && (
                  <span className='ml-2 text-xs text-amber-600'>최신</span>
                )}
              </label>
            ))}
            {list.length === 0 && !versionsQ.isLoading && (
              <div className='text-sm text-slate-500'>
                표시할 버전이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메타데이터 패널 */}
      <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='font-semibold'>메타데이터</h3>
          <span className='text-xs text-slate-500'>
            {metadataQ.isLoading ? '불러오는 중...' : selected || '-'}
          </span>
        </div>

        {!selected && <div className='text-slate-500'>버전을 선택하세요.</div>}

        {selected && (
          <>
            {metadataQ.error && (
              <div className='text-sm text-red-600'>
                메타데이터를 불러오지 못했습니다.
              </div>
            )}

            {/* 서버가 어떤 형태를 주더라도 일단 보기 좋게 JSON으로 */}
            {metadataQ.data && (
              <pre className='overflow-auto rounded-lg border border-[#0E2975] bg-gray-100 p-3 text-xs text-slate-800'>
                {JSON.stringify(metadataQ.data, null, 2)}
              </pre>
            )}

            {!metadataQ.isLoading && !metadataQ.data && !metadataQ.error && (
              <div className='text-slate-500'>데이터가 없습니다.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ------- 작은 카드 컴포넌트 ------- */

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className='rounded-xl border border-[#0E2975] bg-white p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-slate-600'>{title}</p>
          <p className='text-2xl font-semibold text-slate-900'>
            {loading ? '...' : value}
          </p>
        </div>
        <div className='text-slate-500'>{icon}</div>
      </div>
    </div>
  );
}
