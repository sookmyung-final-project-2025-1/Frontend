'use client';

import { useRouter } from 'next/navigation';

type Tx = {
  id: string | number;
  userId: string;
  amount: number;
  merchant: string;
  merchantCategory?: string;
  category?: string; // 백엔드가 category로 줄 수도 있어 대비
  isFraud: boolean;
  transactionTime?: string;
  createdAt?: string;
  updatedAt?: string;
  externalTransactionId: string;
};

type Props = {
  data: Tx[];
  isLoading: boolean;
  error: boolean;
  formatAmount: (n: number) => string;
  /** 호출 시 (t.transactionTime || t.createdAt || t.updatedAt)를 넘기도록 page.tsx에서 캡슐화 */
  formatDate: (t: Tx) => string;
};

export default function TransactionsTable({
  data,
  isLoading,
  error,
  formatAmount,
  formatDate,
}: Props) {
  const router = useRouter();

  return (
    <div className='min-h-[220px] overflow-hidden rounded-xl border border-[#0E2975] bg-white shadow-sm'>
      {error ? (
        <div className='flex items-center justify-center py-16 text-red-600'>
          데이터를 불러오지 못했습니다.
        </div>
      ) : isLoading && data.length === 0 ? (
        <div className='flex items-center justify-center py-16 text-slate-500'>
          불러오는 중…
        </div>
      ) : (
        <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-white'>
              <tr>
                {[
                  '거래 ID',
                  '사용자 ID',
                  '가맹점',
                  '카테고리',
                  '금액',
                  '사기 여부',
                  '거래 시간',
                ].map((h) => (
                  <th
                    key={h}
                    className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className='divide-y'>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-12 text-center text-slate-400'
                  >
                    거래 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                data.map((t, i) => (
                  <tr
                    key={String(t.id) ?? i}
                    className='cursor-pointer transition hover:bg-gray-100'
                  >
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-900'>
                      {t.id}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-700'>
                      {t.userId}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-700'>
                      {t.merchant}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-700'>
                      {t.merchantCategory ?? t.category ?? '—'}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900'>
                      {Number.isFinite(t.amount as any)
                        ? formatAmount(t.amount)
                        : '—'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.isFraud
                            ? 'border border-red-200 bg-red-100 text-red-700'
                            : 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {t.isFraud ? '사기' : '정상'}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-600'>
                      {formatDate(t)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
