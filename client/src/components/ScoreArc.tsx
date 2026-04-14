// =============================================================
// ScoreArc — Radial score gauge SVG component
// Displays score 55–100 as a colored arc with animated fill
// =============================================================

import { getScoreHex, getScoreLabel } from '@/lib/coffeeTypes';

interface ScoreArcProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreArc({ score, size = 120, strokeWidth = 10 }: ScoreArcProps) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc spans 240 degrees (from 150° to 390°/30°)
  const startAngle = 150;
  const totalAngle = 240;

  // Normalize score 55–100 to 0–1
  const normalized = Math.max(0, Math.min(1, (score - 55) / 45));
  const fillAngle = normalized * totalAngle;

  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;
  const fillLength = (fillAngle / 360) * circumference;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  const trackPath = describeArc(cx, cy, radius, startAngle, startAngle + totalAngle);
  const fillPath = fillAngle > 0
    ? describeArc(cx, cy, radius, startAngle, startAngle + fillAngle)
    : '';

  const color = getScoreHex(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="oklch(0.88 0.008 60)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="score-arc"
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        )}
        {/* Score text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="'DM Mono', monospace"
          fill={color}
        >
          {score.toFixed(1)}
        </text>
        {/* /100 text */}
        <text
          x={cx}
          y={cy + size * 0.14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.1}
          fontFamily="'DM Sans', sans-serif"
          fill="oklch(0.52 0.02 60)"
        >
          / 100
        </text>
      </svg>
      <span
        className="text-xs font-medium tracking-wide uppercase"
        style={{ color, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em' }}
      >
        {label}
      </span>
    </div>
  );
}
