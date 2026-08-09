import { cn } from '@/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  showTrend?: boolean;
  className?: string;
}

export function MiniChart({
  data,
  width = 120,
  height = 36,
  color = 'var(--color-brand-400)',
  fillOpacity = 0.15,
  showTrend = false,
  className,
}: MiniChartProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const trendUp = data[data.length - 1] >= data[0];
  const trendIcon = trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  const flat = data[data.length - 1] === data[0];

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`mini-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#mini-${color.replace(/[^a-z0-9]/gi, '')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showTrend && (
        <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium', flat ? 'text-ink-400' : trendUp ? 'text-success-400' : 'text-danger-400')}>
          {flat ? <Minus className="h-3 w-3" /> : trendIcon}
        </span>
      )}
    </div>
  );
}
