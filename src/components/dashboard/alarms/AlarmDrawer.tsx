'use client';

import { useAlarm } from '@/hooks/queries/dashboard/useAlarm';
import { AlertTriangle, Bell, CheckCircle2, Info, X } from 'lucide-react';
import Link from 'next/link';

function SeverityIcon({ severity }: { severity: string }) {
  const s = severity?.toLowerCase?.() ?? '';
  if (s === 'critical' || s === 'high')
    return <AlertTriangle className='h-4 w-4 text-red-500' />;
  if (s === 'medium')
    return <AlertTriangle className='h-4 w-4 text-orange-500' />;
  if (s === 'low') return <Info className='h-4 w-4 text-sky-500' />;
  return <CheckCircle2 className='h-4 w-4 text-slate-500' />;
}

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

export default function AlarmsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data = [], isLoading, error } = useAlarm(20);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity pb-[20px] ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-[#0E2975] bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role='dialog'
        aria-modal='true'
      >
        {/* 전체를 세로 플렉스 레이아웃으로 */}
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex flex-none items-center justify-between border-b border-[#0E2975] p-4'>
            <div className='flex items-center gap-2'>
              <Bell className='h-5 w-5 text-slate-500' />
              <h3 className='font-semibold text-slate-900'>알람</h3>
            </div>
            <button
              onClick={onClose}
              className='rounded-md p-2 text-slate-500 transition hover:bg-gray-100'
              aria-label='닫기'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          {/* Scroll area: flex-1 + overflow-y-auto + 충분한 bottom padding */}
          <div className='flex-1 space-y-3 overflow-y-auto p-4 pb-24 [padding-bottom:calc(env(safe-area-inset-bottom)+6rem)]'>
            {isLoading && (
              <div className='py-8 text-center text-slate-500'>
                불러오는 중…
              </div>
            )}
            {error && (
              <div className='py-8 text-center text-red-600'>
                알람을 불러오지 못했습니다.
              </div>
            )}
            {!isLoading && !error && data.length === 0 && (
              <div className='py-8 text-center text-slate-500'>
                표시할 알람이 없습니다.
              </div>
            )}

            <ul className='divide-y divide-gray-200'>
              {data.map((a, i) => (
                <li
                  key={`${a.timestamp}-${i}`}
                  className='flex items-start gap-3 py-3'
                >
                  <SeverityIcon severity={a.severity} />
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='rounded-full border border-gray-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700'>
                        {a.severity.toUpperCase()}
                      </span>
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

          {/* Footer */}
          <div className='flex flex-none items-center justify-between border-t border-[#0E2975] p-4'>
            <span className='text-xs text-slate-500'>
              최근 {data.length}건 표시
            </span>
            <Link
              href='/dashboard/alarms'
              className='rounded-md border border-blue-500 bg-blue-500 px-3 py-1.5 text-sm text-white transition hover:bg-blue-600'
              onClick={onClose}
            >
              모두 보기
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
