'use client';

import { useAlarm } from '@/hooks/queries/dashboard/useAlarm';
import { AlertTriangle, Bell, CheckCircle2, Info } from 'lucide-react';

type BadgeProps = { severity: string };
const SeverityBadge = ({ severity }: BadgeProps) => {
  const s = severity?.toLowerCase?.() ?? '';
  const map = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-sky-100 text-sky-700 border-sky-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  } as const;
  const cls =
    map[s as keyof typeof map] ??
    'bg-blue-100 text-blue-700 border-blue-200';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}
    >
      {severity.toUpperCase()}
    </span>
  );
};

const SeverityIcon = ({ severity }: { severity: string }) => {
  const s = severity?.toLowerCase?.() ?? '';
  if (s === 'critical' || s === 'high') {
    return <AlertTriangle className='h-4 w-4 text-red-500' />;
  }
  if (s === 'medium') {
    return <AlertTriangle className='h-4 w-4 text-orange-500' />;
  }
  if (s === 'low') {
    return <Info className='h-4 w-4 text-sky-500' />;
  }
  return <CheckCircle2 className='h-4 w-4 text-slate-500' />;
};

function toLocal(ts: string) {
  try {
    return new Date(ts).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function AlarmsPanel() {
  // 원하는 수만큼 표시 (예: 50)
  const { data = [], isLoading, error } = useAlarm(50);

  return (
    <div className='space-y-4 rounded-xl border border-[#0E2975] bg-white p-5 shadow-sm'>
      <header className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Bell className='h-5 w-5 text-slate-500' />
          <h3 className='font-semibold text-slate-900'>알람</h3>
        </div>
        <span className='text-xs text-slate-600'>
          총 <b className='text-slate-900'>{data.length}</b>건
        </span>
      </header>

      {isLoading && (
        <div className='p-6 text-center text-slate-500'>불러오는 중…</div>
      )}

      {error && (
        <div className='p-6 text-center text-red-600'>
          알람을 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !error && data.length === 0 && (
        <div className='p-6 text-center text-slate-500'>
          표시할 알람이 없습니다.
        </div>
      )}

      {/* 리스트 */}
      <ul className='divide-y divide-gray-200'>
        {data.map((a, idx) => (
          <li
            key={`${a.timestamp}-${idx}`}
            className='flex items-start gap-3 py-3'
          >
            <div className='mt-0.5'>
              <SeverityIcon severity={a.severity} />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <SeverityBadge severity={a.severity} />
                <span className='truncate font-medium text-slate-900'>
                  {a.type}
                </span>
                <span className='text-xs text-slate-500'>
                  {toLocal(a.timestamp)}
                </span>
              </div>
              <p className='mt-1 whitespace-pre-wrap break-words text-slate-600'>
                {a.message}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
