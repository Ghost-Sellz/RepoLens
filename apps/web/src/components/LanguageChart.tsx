'use client';

import { LanguageStats } from '@repolens/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

export function LanguageChart({ languages }: { languages: LanguageStats[] }) {
  const data = languages.slice(0, 10).map((l, i) => ({
    name: l.name,
    value: l.lines,
    color: l.color || COLORS[i % COLORS.length],
  }));

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-4">Languages</h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#e5e5e5' }}
                formatter={(value: number, name: string) => [`${value.toLocaleString()} lines`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
              <span className="text-neutral-300">{item.name}</span>
              <span className="text-neutral-600 ml-auto">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
