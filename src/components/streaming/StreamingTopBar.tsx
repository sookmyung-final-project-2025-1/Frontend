'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StreamMeta, TimeRange } from './types';

type Props = {
  playing: boolean;
  speed: number;
  online: boolean;

  onPlay: () => Promise<void> | void;
  onPause: () => Promise<void> | void;
  onSpeedChange: (v: number) => Promise<void> | void;
  onSeek: (iso: string) => Promise<void> | void;

  virtualTime?: string;
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;

  currentPosition: number; // 0..100
  onPositionChange: (pct: number) => Promise<void> | void;

  totalDuration: number; // hour 단위
  loading: boolean;

  streamMeta?: StreamMeta | null;

  onRefresh?: () => void; // ↻
};

function useClientPlaceholder(virtualTime?: string) {
  const [ph, setPh] = useState<string>(''); // SSR에서 공백, CSR에서 채움
  useEffect(() => {
    if (virtualTime && !Number.isNaN(Date.parse(virtualTime))) {
      setPh(
        new Date(virtualTime).toLocaleString('ko-KR', {
          hour12: false,
        })
      );
    } else {
      setPh(
        new Date().toLocaleString('ko-KR', {
          hour12: false,
        })
      );
    }
  }, [virtualTime]);
  return ph;
}

function formatDisplayTime(iso?: string) {
  if (!iso) return '';
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return iso;
  return new Date(parsed).toLocaleString('ko-KR', { hour12: false });
}

export default function StreamingTopBar({
  playing,
  speed,
  online,
  onPlay,
  onPause,
  onSpeedChange,
  onSeek,
  virtualTime,
  timeRange,
  onTimeRangeChange,
  currentPosition,
  onPositionChange,
  totalDuration,
  loading,
  streamMeta,
  onRefresh,
}: Props) {
  const ph = useClientPlaceholder(virtualTime);

  const [seekInput, setSeekInput] = useState<string>('');
  const [speedInput, setSpeedInput] = useState<string>(String(speed));

  const toIsoInput = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const normalized = trimmed.replace(' ', 'T');
    const parsed = Date.parse(normalized);
    if (!Number.isFinite(parsed)) return null;
    return new Date(parsed).toISOString();
  };

  useEffect(() => {
    setSpeedInput(String(speed));
  }, [speed]);

  const resolvedPositionPct = useMemo(
    () => currentPosition.toFixed(1),
    [currentPosition]
  );

  const handleEnterSeek = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const s = (seekInput || '').trim();
    if (!s) return;
    const iso = toIsoInput(s);
    if (!iso) return;
    await onSeek(iso);
    setSeekInput('');
  };

  const handleSpeedApply = async () => {
    const next = Number(speedInput);
    if (!Number.isFinite(next) || next <= 0) return;
    await onSpeedChange(next);
  };

  return (
    <div className='space-y-4'>
      {/* 상단 상태/액션 바 */}
      <div className='flex flex-wrap items-center gap-3 rounded-xl border border-[#0E2975] bg-white p-3 shadow-sm'>
        <div className='flex items-center gap-2'>
          <span
            className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-yellow-500'}`}
            title={
              online
                ? 'WebSocket connected'
                : 'WebSocket connecting/disconnected'
            }
          />
          <span className='text-sm text-slate-600'>
            {online ? '온라인' : '연결 중...'}
          </span>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          {!playing ? (
            <button
              onClick={() => onPlay()}
              className='rounded-md bg-emerald-500 px-3 py-1 text-sm text-white transition hover:bg-emerald-600 disabled:opacity-50'
              disabled={loading}
            >
              ▶ 재생
            </button>
          ) : (
            <button
              onClick={() => onPause()}
              className='rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-gray-100 disabled:opacity-50'
              disabled={loading}
            >
              ⏸ 일시정지
            </button>
          )}

          <button
            onClick={onRefresh}
            className='rounded-md border border-[#0E2975] bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-white/80 disabled:opacity-50'
            disabled={loading}
            title='상태 새로고침'
          >
            ↻ 새로고침
          </button>
        </div>
      </div>

      {/* 타임머신 & 속도 & 범위 */}
      <div className='space-y-3 rounded-xl border border-[#0E2975] bg-white p-3 shadow-sm'>
        <div className='flex flex-wrap items-center gap-3'>
          {/* 타임머신 입력 */}
          <div className='flex items-center gap-2'>
            <label className='text-sm text-slate-600'>타임머신 시점</label>
            <input
              placeholder={ph}
              suppressHydrationWarning
              value={seekInput}
              onChange={(e) => setSeekInput(e.target.value)}
              onKeyDown={handleEnterSeek}
              disabled={loading}
              className='w-64 rounded-md border border-[#0E2975] bg-white px-3 py-1 text-sm text-slate-800 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20 disabled:bg-gray-50'
            />
            <button
              onClick={async () => {
                if (!seekInput) return;
                const iso = toIsoInput(seekInput);
                if (!iso) return;
                await onSeek(iso);
                setSeekInput('');
              }}
              className='rounded-md bg-indigo-500 px-3 py-1 text-sm text-white transition hover:bg-indigo-600 disabled:opacity-50'
              disabled={loading || !seekInput || !toIsoInput(seekInput)}
            >
              이동
            </button>
          </div>

          {/* 속도 제어 */}
          <div className='flex items-center gap-2'>
            <label className='text-sm text-slate-600'>배속</label>
            <input
              type='number'
              step='0.1'
              min='0.1'
              value={speedInput}
              onChange={(e) => setSpeedInput(e.target.value)}
              className='w-20 rounded-md border border-[#0E2975] bg-white px-2 py-1 text-sm text-slate-800 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
            />
            <button
              onClick={handleSpeedApply}
              className='rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-gray-100 disabled:opacity-50'
              disabled={loading}
            >
              적용
            </button>
          </div>

          {/* 범위 */}
          <div className='flex items-center gap-2'>
            <label className='text-sm text-slate-600'>범위</label>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
              className='rounded-md border border-[#0E2975] bg-white px-2 py-1 text-sm text-slate-800 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
            >
              <option value='24h'>24시간</option>
              <option value='7d'>7일</option>
              <option value='30d'>30일</option>
            </select>
            <span className='text-xs text-slate-500'>총 {totalDuration}h</span>
          </div>
        </div>

        {/* 포지션 슬라이더 */}
        <div className='flex items-center gap-3'>
          <input
            type='range'
            min={0}
            max={100}
            value={currentPosition}
            onChange={(e) => onPositionChange(Number(e.target.value))}
            className='h-1 w-full cursor-pointer appearance-none rounded bg-gray-200 accent-blue-500'
            disabled={loading}
          />
          <span className='w-16 text-right text-sm text-slate-600'>
            {resolvedPositionPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
