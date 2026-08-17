import Link from 'next/link';
import { GitBranch, Shield, BarChart3, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            RepoLens
          </Link>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              RepoLens
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 mb-8">
            Understand any codebase in seconds.
          </p>
          <p className="text-neutral-500 mb-12 max-w-xl mx-auto">
            Analyze your repository locally. Generate actionable insights. No code uploaded.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/analyze"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all text-white"
            >
              Analyze Repository
            </Link>
            <code className="px-6 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-400 font-mono">
              npx repolens .
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <Shield className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-neutral-500">All analysis runs locally. No code leaves your machine.</p>
            </div>
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <BarChart3 className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-2">Deep Insights</h3>
              <p className="text-sm text-neutral-500">Languages, frameworks, dependencies, security, and more.</p>
            </div>
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <Zap className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-semibold mb-2">Fast Analysis</h3>
              <p className="text-sm text-neutral-500">Scan thousands of files in seconds with async I/O.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 px-6 py-4 text-center text-sm text-neutral-600">
        RepoLens &middot; Open Source &middot; MIT License
      </footer>
    </div>
  );
}
