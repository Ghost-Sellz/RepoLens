import { RepositoryAnalysis } from '@repolens/types';

export function StatsGrid({ analysis }: { analysis: RepositoryAnalysis }) {
  const stats = [
    { label: 'Files', value: analysis.files.total.toLocaleString() },
    { label: 'Lines', value: analysis.lines.total.toLocaleString() },
    { label: 'Code', value: analysis.lines.code.toLocaleString() },
    { label: 'Deps', value: analysis.dependencies?.total?.toLocaleString() || '0' },
  ];

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-4">Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
