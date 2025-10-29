'use client';

export default function JSONBlock({ value }: { value: unknown }) {
  if (value === null) {
    return <div className='text-sm text-slate-500'>값이 없습니다.</div>;
  }

  // 문자열이면 그대로, 객체면 pretty print
  const content =
    typeof value === 'string' ? value : JSON.stringify(value, null, 2);

  return (
    <pre className='whitespace-pre-wrap break-words rounded-lg border border-[#0E2975] bg-white p-4 text-sm text-slate-800 shadow-sm'>
      {content}
    </pre>
  );
}
