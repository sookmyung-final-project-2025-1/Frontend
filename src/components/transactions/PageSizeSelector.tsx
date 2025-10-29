'use client';

type Props = {
  size: number;
  onChange: (size: number) => void;
};

export default function PageSizeSelector({ size, onChange }: Props) {
  return (
    <div className='flex items-center gap-2 mb-8'>
      <span className='text-sm text-slate-600'>페이지당 항목 수:</span>
      <select
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        className='rounded-lg border border-[#0E2975] bg-white px-3 py-1 text-sm text-slate-900 shadow-sm focus:border-[#0E2975] focus:outline-none focus:ring-2 focus:ring-[#0E2975]/20'
      >
        <option value={5}>5개</option>
        <option value={10}>10개</option>
        <option value={20}>20개</option>
        <option value={50}>50개</option>
      </select>
    </div>
  );
}
