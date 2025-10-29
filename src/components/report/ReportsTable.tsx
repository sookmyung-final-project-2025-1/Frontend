'use client';

import { ReportItem } from '@/types/report-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  rows: ReportItem[];
  loading: boolean;
  page: number;
  size: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (id: number) => void;
};

export default function ReportsTable({
  rows,
  loading,
  page,
  size,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: Props) {
  return (
    <div className='rounded-xl border border-[#0E2975] bg-white shadow-sm overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-white'>
            <tr>
              {[
                'ID',
                '거래ID',
                '상태',
                '우선순위',
                '신고자',
                '사기확정',
                '신고일',
              ].map((h) => (
                <th
                  key={h}
                  className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600'
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {loading && rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className='px-6 py-12 text-center text-slate-500'
                >
                  불러오는 중...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className='px-6 py-12 text-center text-slate-500'
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.reportId}
                  className='cursor-pointer transition hover:bg-gray-100'
                  onClick={() => onRowClick(r.reportId)}
                >
                  <td className='px-4 py-3 text-sm text-slate-800'>
                    {r.reportId}
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-600'>
                    {r.transactionId}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    <Badge value={r.status} />
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    <span className='px-2 py-1 rounded bg-gray-100 text-slate-700'>
                      {r.priority ?? '-'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-600'>
                    {r.reportedBy}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    {r.isFraudConfirmed ? (
                      <span
                        className='px-2 py-1 rounded'
                        style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                      >
                        확정
                      </span>
                    ) : (
                      <span
                        className='px-2 py-1 rounded'
                        style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                      >
                        미확정
                      </span>
                    )}
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-500'>
                    {formatDate(r.reportedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단: 페이지네이션 + size */}
      <div className='flex items-center justify-between bg-white p-3'>
        <div className='flex items-center gap-2 text-sm text-slate-600'>
          <span>페이지당</span>
          <select
            className='rounded border border-[#0E2975] bg-white px-2 py-1 text-slate-800 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
            value={size}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}개
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center gap-1'>
          <button
            className='p-2 rounded-lg border border-gray-300 bg-white text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => onPageChange(0)}
            disabled={page <= 0}
            aria-label='first'
          >
            «
          </button>
          <button
            className='p-2 rounded-lg border border-gray-300 bg-white text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
            aria-label='prev'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
          <span className='px-2 text-sm text-slate-600'>
            {page + 1} / {Math.max(1, totalPages)}
          </span>
          <button
            className='p-2 rounded-lg border border-gray-300 bg-white text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label='next'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
          <button
            className='p-2 rounded-lg border border-gray-300 bg-white text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => onPageChange(Math.max(0, totalPages - 1))}
            disabled={page >= totalPages - 1}
            aria-label='last'
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    PENDING: { bg: '#fef3c7', fg: '#b45309', label: '대기' },
    UNDER_REVIEW: { bg: '#dbeafe', fg: '#1d4ed8', label: '검토중' },
    APPROVED: { bg: '#dcfce7', fg: '#166534', label: '승인' },
    REJECTED: { bg: '#fee2e2', fg: '#b91c1c', label: '거절' },
  };
  const c = map[value] ?? { bg: '#e5e7eb', fg: '#374151', label: value };
  return (
    <span
      className='px-2 py-1 rounded text-xs'
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {c.label}
    </span>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return '-';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString('ko-KR');
}
