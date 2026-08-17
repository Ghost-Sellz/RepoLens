import { HealthScore } from '@repolens/types';

export function ScoreCard({ health }: { health: HealthScore }) {
  const gradeColor: Record<string, string> = {
    'Excellent': '#10b981',
    'Good': '#3b82f6',
    'Fair': '#f59e0b',
    'Needs Work': '#f97316',
    'Critical': '#ef4444',
  };

  const color = gradeColor[health.grade] || '#737373';
  const circumference = 2 * Math.PI * 52;
  const dashoffset = circumference - (health.overall / 100) * circumference;

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex flex-col items-center">
      <h3 className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-4">Health Score</h3>
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#262626" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{health.overall}</span>
        </div>
      </div>
      <div className="mt-3 font-semibold" style={{ color }}>{health.grade}</div>
    </div>
  );
}
