import React from 'react';
import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  highlight?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendPositive = true,
  highlight = false,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:border-slate-700',
        highlight && 'border-brand-500/40 bg-gradient-to-br from-brand-500/10 via-slate-900/80 to-slate-900'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
            {value}
          </h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium">
              <span className={trendPositive ? 'text-emerald-400' : 'text-rose-400'}>{trend}</span>
              <span className="text-slate-400">vs last month</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'p-3 rounded-2xl border',
            highlight
              ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
