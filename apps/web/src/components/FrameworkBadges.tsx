import { Framework } from '@repolens/types';

export function FrameworkBadges({ frameworks }: { frameworks: Framework[] }) {
  const confidenceStyle: Record<string, string> = {
    high: 'bg-green-900/30 text-green-400 border border-green-800/50',
    medium: 'bg-blue-900/30 text-blue-400 border border-blue-800/50',
    low: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50',
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-4">Detected Stack</h3>
      <div className="flex flex-wrap gap-2">
        {frameworks.map((fw) => (
          <span key={fw.name} className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceStyle[fw.confidence]}`}>
            {fw.name}
          </span>
        ))}
        {frameworks.length === 0 && (
          <p className="text-neutral-600 text-sm">No frameworks detected</p>
        )}
      </div>
    </div>
  );
}
