'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RepositoryAnalysis } from '@repolens/types';
import { ScoreCard } from '@/components/ScoreCard';
import { LanguageChart } from '@/components/LanguageChart';
import { StatsGrid } from '@/components/StatsGrid';
import { RecommendationsList } from '@/components/RecommendationsList';
import { SecurityFindings } from '@/components/SecurityFindings';
import { FrameworkBadges } from '@/components/FrameworkBadges';

export default function ReportPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const data = sessionStorage.getItem(`report-${id}`);
    if (data) {
      setAnalysis(JSON.parse(data));
    }
  }, [params.id]);

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">No Report Found</div>
          <p className="text-neutral-500 mb-4">The report could not be loaded.</p>
          <a href="/analyze" className="text-blue-500 hover:underline">Run a new analysis</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-neutral-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            RepoLens
          </a>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <a href="/analyze" className="hover:text-white transition-colors">Analyze</a>
            <a href="/docs" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">{analysis.name}</h1>
        <p className="text-neutral-500 mb-8">
          Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()} in {(analysis.duration / 1000).toFixed(2)}s
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ScoreCard health={analysis.health} />
          <StatsGrid analysis={analysis} />
          <FrameworkBadges frameworks={analysis.frameworks} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LanguageChart languages={analysis.languages} />
          <RecommendationsList recommendations={analysis.recommendations} />
        </div>

        <SecurityFindings findings={analysis.security} />
      </main>
    </div>
  );
}
