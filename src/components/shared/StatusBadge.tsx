import React from 'react';
import { getStatusColor } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  const { bg, text, border } = getStatusColor(status);
  const formattedStatus = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formattedStatus}
    </span>
  );
}
