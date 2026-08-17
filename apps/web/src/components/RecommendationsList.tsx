import { Recommendation } from '@repolens/types';

export function RecommendationsList({ recommendations }: { recommendations: Recommendation[] }) {
  const priorityColor: Record<string, string> = {
    HIGH: 'text-red-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-blue-400',
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-4">Recommendations</h3>
      <div className="space-y-3">
        {recommendations.slice(0, 8).map((rec, i) => (
          <div key={i} className="border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
            <span className={`font-bold text-xs ${priorityColor[rec.priority]}`}>[{rec.priority}]</span>
            <span className="text-sm text-neutral-300 ml-2">{rec.message}</span>
          </div>
        ))}
        {recommendations.length === 0 && (
          <p className="text-neutral-600 text-sm">No recommendations. Looking good!</p>
        )}
      </div>
    </div>
  );
}
