"use client";

import React, { useState } from 'react';
import { UrlInput } from '@/components/scraper/UrlInput';
import { SectionList } from '@/components/scraper/SectionList';
import { Workspace } from '@/components/generator/Workspace';
import { Section } from '@/lib/parse';
import Safelist from '@/components/Safelist';
import { Tooltip } from '@/components/ui/Tooltip';

export default function Home() {
  const [step, setStep] = useState<'input' | 'selection' | 'workspace'>('input');

  // State
  //hi
  const [currentUrl, setCurrentUrl] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [style, setStyle] = useState('Modern');

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
      if (data.screenshot) setScreenshot(data.screenshot);
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
          requirements: "Ensure it is fully responsive and uses modern design.",
          style
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
    return (
      <Workspace
        initialCode={generatedCode}
        screenshot={screenshot}
        onBack={() => setStep('selection')}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#030014] text-white relative flex flex-col items-center py-24 px-4 overflow-hidden selection:bg-pink-500/30">

      {/* Background Gradients - More Vibrant */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-3000" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />

      {/* Header / Branding */}
      <div className="text-center mb-16 space-y-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-pink-300 mb-4 shadow-lg shadow-pink-500/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          AI Powered Development
        </div>
        <h1 className="text-7xl md:text-9xl font-bold tracking-tight text-white mb-2 drop-shadow-2xl">
          Reactify<span className="text-pink-500">.</span>
        </h1>
        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
          The ultimate tool to transform any website into <span className="text-white font-semibold border-b border-pink-500/50 pb-0.5">Production React Code</span>.
        </p>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {step === 'input' && (
          <UrlInput onScrape={handleScrape} isLoading={isScraping} />
        )}

        {step === 'selection' && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center gap-4 mb-10 w-full justify-between max-w-2xl">
              <button
                onClick={() => setStep('input')}
                className="text-slate-400 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 group border border-transparent hover:border-white/10"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
              </button>
              <div className="bg-white/5 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 text-sm text-blue-200 font-mono shadow-xl shadow-blue-500/5 truncate max-w-md">
                {currentUrl}
              </div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-24 space-y-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-transparent border-t-pink-500 border-r-purple-500 border-b-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <p className="text-white text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400">Generating Magic...</p>
                  <p className="text-slate-400">Analyzing structure and writing clean React code.</p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-8">
                {/* Style Selector */}
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                    {[
                      { name: 'Minimal', desc: 'Clean layout with ample whitespace' },
                      { name: 'Modern', desc: 'Rounded corners, shadows, and gradients' },
                      { name: 'Dense', desc: 'Compact layout for high data density' },
                      { name: 'Brutalist', desc: 'High contrast, sharp edges, bold type' }
                    ].map((s) => (
                      <Tooltip key={s.name} content={s.desc}>
                        <button
                          onClick={() => setStyle(s.name)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${style === s.name ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                          {style === s.name && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-100 rounded-xl -z-10"></div>
                          )}
                          {s.name}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {sections.length > 0 ? (
                  <SectionList
                    sections={sections}
                    onSelect={handleGenerate}
                    selectedId={selectedSection?.id || null}
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-200 text-center backdrop-blur-sm">
                      <p className="font-semibold">No chunks found</p>
                      <p className="text-sm opacity-70 mt-1">Try scraping a different page.</p>
                    </div>
                    {screenshot && (
                      <div className="relative group w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/50">
                        <img src={screenshot} alt="Page Screenshot" className="w-full transition-all duration-700 group-hover:scale-105 group-hover:opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="text-center p-6">
                            <p className="text-white font-medium text-lg mb-2">Full Page Capture</p>
                            <p className="text-slate-400 text-sm">Select a specific region to convert</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 text-red-200 rounded-xl border border-red-500/20 backdrop-blur-md shadow-2xl max-w-md text-center animate-in fade-in slide-in-from-bottom-4 z-50">
          <p className="font-medium flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {error}
          </p>
        </div>
      )}

      {/* Tailwind Safelist - Hidden */}
      <div className="hidden">
        <Safelist />
      </div>
    </main>
  );
}
