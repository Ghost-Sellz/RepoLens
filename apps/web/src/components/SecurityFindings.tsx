import { SecurityFinding } from '@repolens/types';

export function SecurityFindings({ findings }: { findings: SecurityFinding[] }) {
  if (findings.length === 0) return null;

  const severityStyle: Record<string, string> = {
    high: 'bg-red-900/20 border-red-800',
    medium: 'bg-yellow-900/20 border-yellow-800',
    low: 'bg-blue-900/20 border-blue-800',
  };

  const severityBadge: Record<string, string> = {
    high: 'bg-red-900/50 text-red-400 border border-red-800',
    medium: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
    low: 'bg-blue-900/50 text-blue-400 border border-blue-800',
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-8">
      <h3 className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-4">
        Security Findings ({findings.length})
      </h3>
      <div className="space-y-2">
        {findings.map((finding, i) => (
          <div key={i} className={`p-3 rounded-lg border-l-4 ${severityStyle[finding.severity]}`}>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${severityBadge[finding.severity]}`}>
              {finding.severity.toUpperCase()}
            </span>
            <span className="text-sm text-neutral-300 ml-2">{finding.message}</span>
            {finding.file && (
              <span className="text-xs text-neutral-600 ml-2">({finding.file})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
