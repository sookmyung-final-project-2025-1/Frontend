// src/app/(logo-layout)/dashboard/transactions/[transactionId]/TransactionDetailClient.tsx
'use client';

import TransactionDetailView from '@/components/transactions/detail/TransactionDetailView';
import { useFraudTransaction } from '@/hooks/queries/transaction/useFraudTransaction';
import { useTransactionDetail } from '@/hooks/queries/transaction/useTransactionDetail';

export default function TransactionDetailClient({
  transactionId,
}: {
  transactionId: string;
}) {
  const { data, isLoading, error } = useTransactionDetail(transactionId);
  const { data: fdata } = useFraudTransaction(transactionId);
  console.log(transactionId, fdata);

  const formatAmount = (amount?: number) =>
    typeof amount === 'number'
      ? new Intl.NumberFormat('ko-KR', {
          style: 'currency',
          currency: 'KRW',
        }).format(amount)
      : '-';

  const formatDate = (s?: string) => {
    if (!s) return '-';
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('ko-KR');
  };

  return (
    <div className='space-y-6 rounded-xl border border-[#0E2975] bg-white p-8 shadow-sm'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-slate-900'>거래 상세</h1>
        <div className='text-sm text-slate-800'>
          Transaction ID: {transactionId}
        </div>
      </div>

      <TransactionDetailView
        data={data}
        isLoading={isLoading}
        error={!!error}
        formatAmount={formatAmount}
        formatDate={formatDate}
      />
    </div>
  );
}
