import { RepositoryAnalysis } from '@repolens/types';

export function generateHTML(analysis: RepositoryAnalysis): string {
  const langChartData = analysis.languages.slice(0, 10).map(l =>
    JSON.stringify({ name: l.name, value: l.percentage, color: l.color })
  ).join(',');

  const recentCommits = analysis.git.commitFrequency
    ? [
        { label: '7 days', value: analysis.git.commitFrequency.last7Days },
        { label: '30 days', value: analysis.git.commitFrequency.last30Days },
        { label: '90 days', value: analysis.git.commitFrequency.last90Days },
      ]
    : [];

  const gradeColor = analysis.health.overall >= 90 ? '#10b981' :
    analysis.health.overall >= 75 ? '#3b82f6' :
    analysis.health.overall >= 60 ? '#f59e0b' :
    analysis.health.overall >= 40 ? '#f97316' : '#ef4444';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RepoLens Report — ${analysis.name}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      line-height: 1.6;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #737373; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 1.5rem; }
    .card h2 { font-size: 1.1rem; color: #a3a3a3; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .stat { font-size: 2rem; font-weight: 700; }
    .stat-label { font-size: 0.875rem; color: #737373; }
    .score-ring { width: 120px; height: 120px; position: relative; margin: 0 auto 1rem; }
    .score-ring svg { transform: rotate(-90deg); }
    .score-ring .value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.75rem; font-weight: 700; }
    .bar-chart { margin-top: 0.5rem; }
    .bar-row { display: flex; align-items: center; margin-bottom: 0.5rem; gap: 0.75rem; }
    .bar-label { width: 120px; font-size: 0.875rem; text-align: right; flex-shrink: 0; }
    .bar-track { flex: 1; height: 24px; background: #262626; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 8px; font-size: 0.75rem; font-weight: 600; color: #fff; min-width: 2rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #262626; }
    th { color: #737373; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; margin: 0.25rem; }
    .badge-green { background: #052e16; color: #22c55e; border: 1px solid #166534; }
    .badge-blue { background: #172554; color: #3b82f6; border: 1px solid #1e40af; }
    .badge-yellow { background: #422006; color: #f59e0b; border: 1px solid #92400e; }
    .badge-red { background: #450a0a; color: #ef4444; border: 1px solid #991b1b; }
    .finding { padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem; border-left: 3px solid; }
    .finding-high { background: #450a0a20; border-color: #ef4444; }
    .finding-medium { background: #42200620; border-color: #f59e0b; }
    .finding-low { background: #17255420; border-color: #3b82f6; }
    .rec { padding: 0.5rem 0; border-bottom: 1px solid #262626; }
    .rec:last-child { border-bottom: none; }
    .priority { font-weight: 700; font-size: 0.75rem; }
    .priority-HIGH { color: #ef4444; }
    .priority-MEDIUM { color: #f59e0b; }
    .priority-LOW { color: #3b82f6; }
    footer { text-align: center; color: #525252; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #262626; font-size: 0.875rem; }
    @media (max-width: 768px) { body { padding: 1rem; } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>RepoLens Report</h1>
    <p class="subtitle">${analysis.name} &middot; Analyzed ${new Date(analysis.analyzedAt).toLocaleDateString()} &middot; ${(analysis.duration / 1000).toFixed(2)}s</p>

    <div class="grid">
      <div class="card">
        <h2>Overview</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div><div class="stat">${analysis.files.total.toLocaleString()}</div><div class="stat-label">Files</div></div>
          <div><div class="stat">${analysis.lines.total.toLocaleString()}</div><div class="stat-label">Lines of Code</div></div>
          <div><div class="stat">${analysis.files.directories.toLocaleString()}</div><div class="stat-label">Directories</div></div>
          <div><div class="stat">${formatBytes(analysis.files.totalBytes)}</div><div class="stat-label">Total Size</div></div>
        </div>
      </div>

      <div class="card" style="text-align:center;">
        <h2>Health Score</h2>
        <div class="score-ring">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#262626" stroke-width="8"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="${gradeColor}" stroke-width="8" stroke-dasharray="${(analysis.health.overall / 100) * 326.7} 326.7" stroke-linecap="round"/>
          </svg>
          <div class="value" style="color:${gradeColor}">${analysis.health.overall}</div>
        </div>
        <div style="font-weight:600;color:${gradeColor}">${analysis.health.grade}</div>
      </div>

      <div class="card">
        <h2>Health Breakdown</h2>
        <div class="bar-chart">
          ${renderBar('Code Quality', analysis.health.codeQuality, '#3b82f6')}
          ${renderBar('Documentation', analysis.health.documentation, '#8b5cf6')}
          ${renderBar('Security', analysis.health.security, '#10b981')}
          ${renderBar('Testing', analysis.health.testing, '#f59e0b')}
          ${renderBar('Maintenance', analysis.health.maintenance, '#f97316')}
          ${renderBar('Configuration', analysis.health.configuration, '#06b6d4')}
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Languages</h2>
        ${analysis.languages.slice(0, 10).map(l => renderBar(l.name, l.percentage, l.color)).join('\n')}
      </div>

      <div class="card">
        <h2>Detected Stack</h2>
        <div>
          ${analysis.frameworks.map(f => `<span class="badge badge-${f.confidence === 'high' ? 'green' : f.confidence === 'medium' ? 'blue' : 'yellow'}">${f.name}</span>`).join('\n')}
          ${analysis.frameworks.length === 0 ? '<p style="color:#737373">No frameworks detected</p>' : ''}
        </div>
      </div>

      ${analysis.git.isGitRepo ? `
      <div class="card">
        <h2>Git Activity</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div><div style="color:#737373;font-size:0.8rem;">Branch</div><div>${analysis.git.currentBranch || 'N/A'}</div></div>
          <div><div style="color:#737373;font-size:0.8rem;">Commits</div><div>${analysis.git.totalCommits?.toLocaleString() || 'N/A'}</div></div>
          <div><div style="color:#737373;font-size:0.8rem;">Contributors</div><div>${analysis.git.contributors?.length || 0}</div></div>
          <div><div style="color:#737373;font-size:0.8rem;">Tags</div><div>${analysis.git.tags?.length || 0}</div></div>
        </div>
        ${analysis.git.commitFrequency ? `
        <div style="margin-top:1rem;">
          ${renderBar('7 days', Math.min(analysis.git.commitFrequency.last7Days, 50), '#3b82f6')}
          ${renderBar('30 days', Math.min(analysis.git.commitFrequency.last30Days, 50), '#8b5cf6')}
          ${renderBar('90 days', Math.min(analysis.git.commitFrequency.last90Days, 50), '#06b6d4')}
        </div>` : ''}
      </div>` : ''}

      ${analysis.dependencies ? `
      <div class="card">
        <h2>Dependencies</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div><div style="color:#737373;font-size:0.8rem;">Manager</div><div>${analysis.dependencies.manager}</div></div>
          <div><div style="color:#737373;font-size:0.8rem;">Total</div><div>${analysis.dependencies.total}</div></div>
          <div><div style="color:#737373;font-size:0.8rem;">Production</div><div>${analysis.dependencies.production}</div></div>
          <div><div style="color:#737373;font-size:0.8rem;">Dev</div><div>${analysis.dependencies.dev}</div></div>
        </div>
      </div>` : ''}
    </div>

    ${analysis.security.length > 0 ? `
    <div class="card" style="margin-bottom:1.5rem;">
      <h2>Security Findings</h2>
      ${analysis.security.map(f => `
        <div class="finding finding-${f.severity}">
          <span class="badge badge-${f.severity === 'high' ? 'red' : f.severity === 'medium' ? 'yellow' : 'blue'}">${f.severity.toUpperCase()}</span>
          ${f.message}${f.file ? ` <span style="color:#737373">(${f.file})</span>` : ''}
        </div>
      `).join('\n')}
    </div>` : ''}

    <div class="grid">
      <div class="card">
        <h2>Largest Files</h2>
        <table>
          <thead><tr><th>File</th><th>Lines</th><th>Size</th></tr></thead>
          <tbody>
            ${analysis.files.largest.map(f => `
              <tr><td style="font-family:monospace;font-size:0.85rem;">${f.path}</td><td>${f.lines.toLocaleString()}</td><td>${formatBytes(f.size)}</td></tr>
            `).join('\n')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Documentation</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <div>README: ${analysis.documentation.hasReadme ? '<span style="color:#22c55e">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>'}</div>
          <div>CONTRIBUTING: ${analysis.documentation.hasContributing ? '<span style="color:#22c55e">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>'}</div>
          <div>LICENSE: ${analysis.documentation.hasLicense ? '<span style="color:#22c55e">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>'}</div>
          <div>SECURITY: ${analysis.documentation.hasSecurity ? '<span style="color:#22c55e">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>'}</div>
          <div>CODE_OF_CONDUCT: ${analysis.documentation.hasCodeOfConduct ? '<span style="color:#22c55e">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>'}</div>
          <div>CHANGELOG: ${analysis.documentation.hasChangelog ? '<span style="color:#22c55e">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>'}</div>
        </div>
      </div>

      <div class="card">
        <h2>Testing</h2>
        <div>Framework: <strong>${analysis.testing.framework || 'Not detected'}</strong></div>
        <div>Test Files: ${analysis.testing.testFiles}</div>
        <div>Test/Source Ratio: ${analysis.testing.testSourceRatio}% (estimate)</div>
        <div>Score: ${analysis.testing.score}/100</div>
      </div>
    </div>

    ${analysis.cicd.detected.length > 0 ? `
    <div class="card" style="margin-bottom:1.5rem;">
      <h2>CI/CD</h2>
      <div>
        ${analysis.cicd.detected.map(t => `<span class="badge badge-green">${t}</span>`).join('\n')}
      </div>
    </div>` : ''}

    ${analysis.recommendations.length > 0 ? `
    <div class="card" style="margin-bottom:1.5rem;">
      <h2>Recommendations</h2>
      ${analysis.recommendations.map(r => `
        <div class="rec">
          <span class="priority priority-${r.priority}">[${r.priority}]</span>
          ${r.message}
        </div>
      `).join('\n')}
    </div>` : ''}

    <footer>
      Generated by <strong>RepoLens</strong> &middot; Repository analysis performed locally &middot; No data uploaded
    </footer>
  </div>
</body>
</html>`;
}

function renderBar(label: string, value: number, color: string): string {
  return `<div class="bar-row">
    <div class="bar-label">${label}</div>
    <div class="bar-track">
      <div class="bar-fill" style="width:${Math.min(value, 100)}%;background:${color}">${value}%</div>
    </div>
  </div>`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
