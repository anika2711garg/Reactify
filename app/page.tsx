"use client";

import React, { useState } from 'react';
import { UrlInput } from '@/components/scraper/UrlInput';
import { SectionList } from '@/components/scraper/SectionList';
import { Workspace } from '@/components/generator/Workspace';
import { Section } from '@/lib/parse';

export default function Home() {
  const [step, setStep] = useState<'input' | 'selection' | 'workspace'>('input');

  // State
  //hi
  const [currentUrl, setCurrentUrl] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  // Loading states
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async (url: string) => {
    setIsScraping(true);
    setError('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Scraping failed');
      }

      setSections(data.sections || []);
      setCurrentUrl(url);
      setStep('selection');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsScraping(false);
    }
  };

  const handleGenerate = async (section: Section) => {
    setIsGenerating(true);
    setSelectedSection(section);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: section.html,
          requirements: "Ensure it is fully responsive and uses modern design."
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedCode(data.code);
      setStep('workspace');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 'workspace') {
    return <Workspace initialCode={generatedCode} />;
  }

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col items-center py-24 px-4 overflow-hidden selection:bg-indigo-500/30">

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none opacity-30" />

      {/* Header / Branding */}
      <div className="text-center mb-16 space-y-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          AI Component Architecture
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500">
          Scrape <span className="text-indigo-500">→</span> React
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Transform any website section into production-ready <span className="text-white font-medium">Tailwind & React</span> components instantly.
        </p>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {step === 'input' && (
          <UrlInput onScrape={handleScrape} isLoading={isScraping} />
        )}

        {step === 'selection' && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center gap-4 mb-10">
              <button
                onClick={() => setStep('input')}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to URL
              </button>
              <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm text-slate-300 font-mono">
                {currentUrl}
              </div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-24 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full blur-md"></div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white text-xl font-medium">Generative AI at work...</p>
                  <p className="text-slate-500">Analyzing structure and writing clean React code.</p>
                </div>
              </div>
            ) : (
              <SectionList
                sections={sections}
                onSelect={handleGenerate}
                selectedId={selectedSection?.id || null}
              />
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 backdrop-blur-sm max-w-md text-center animate-in fade-in zoom-in-95">
          {error}
        </div>
      )}
    </main>
  );
}
