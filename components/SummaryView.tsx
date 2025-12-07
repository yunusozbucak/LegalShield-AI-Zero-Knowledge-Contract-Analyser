
import React, { useEffect } from 'react';
import { AnalysisResult } from '../types';
import { AlertTriangle, Timer, Lock, FileText, CheckCircle2, Quote, Activity, Copy, Eye, ShieldAlert } from 'lucide-react';

interface SummaryViewProps {
  data: AnalysisResult;
  timeLeft: number;
  sessionToken: string;
  onTimeExpired: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ data, timeLeft, sessionToken, onTimeExpired }) => {

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    document.addEventListener('contextmenu', handleContextMenu);
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getRiskColorClass = (score: number) => {
    if (score < 30) return 'text-green-600 dark:text-green-400';
    if (score < 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const isUrgent = timeLeft <= 10;

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 no-select select-none">
      
      {/* 1. Control Bar (Simplified Security Header) */}
      <div className={`mb-8 flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm transition-all ${isUrgent ? 'border-red-300 ring-4 ring-red-50 dark:ring-red-900/20' : ''}`}>
        <div className="flex items-center space-x-4">
             <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isUrgent ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                {isUrgent ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <Lock className="w-5 h-5" />}
             </div>
             <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Secure Session ID</p>
                <p className="text-sm font-mono text-legal-dark dark:text-gray-200 font-medium">{sessionToken}</p>
             </div>
        </div>

        <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Auto-Destruct</p>
                <p className={`text-sm font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    Data wipe in {timeLeft} seconds
                </p>
            </div>
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold font-mono transition-colors ${isUrgent ? 'bg-red-600 text-white' : 'bg-legal-dark dark:bg-gray-700 text-white'}`}>
                {timeLeft}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Metadata & Audit (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Risk Score - Minimalist */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Risk Score</span>
                <span className={`text-6xl font-light tracking-tighter mb-2 ${getRiskColorClass(data.riskScore)}`}>
                    {data.riskScore}
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                    {data.riskScore > 70 ? 'High Risk' : data.riskScore > 30 ? 'Medium Risk' : 'Low Risk'}
                </span>
            </div>

            {/* Document Info */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Contract Details</h3>
                 <div className="space-y-4">
                    <div>
                        <span className="text-xs text-gray-400 block mb-1">Parties</span>
                        {data.parties && data.parties.length > 0 ? (
                            <ul className="text-sm text-legal-dark dark:text-gray-200 font-medium space-y-1">
                                {data.parties.map((p, i) => <li key={i} className="leading-tight">{p}</li>)}
                            </ul>
                        ) : <span className="text-sm text-gray-300 italic">Not detected</span>}
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 block mb-1">Key Dates</span>
                         {data.keyDates && data.keyDates.length > 0 ? (
                            <ul className="text-sm text-legal-dark dark:text-gray-200 font-medium space-y-1">
                                {data.keyDates.map((d, i) => <li key={i} className="leading-tight">{d}</li>)}
                            </ul>
                        ) : <span className="text-sm text-gray-300 italic">Not detected</span>}
                    </div>
                 </div>
            </div>

            {/* Technical Audit */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                    <Activity className="w-3 h-3 mr-2" /> Audit Log
                </h3>
                <ul className="space-y-2">
                     <li className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Storage</span>
                        <span className="font-mono text-legal-primary dark:text-legal-light font-bold">RAM-ONLY</span>
                    </li>
                    <li className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Masking</span>
                        <span className="font-mono text-legal-primary dark:text-legal-light font-bold">ACTIVE</span>
                    </li>
                    <li className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Watermark</span>
                        <span className="font-mono text-legal-primary dark:text-legal-light font-bold flex items-center"><Eye className="w-3 h-3 mr-1"/> ON</span>
                    </li>
                    <li className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>DRM</span>
                        <span className="font-mono text-legal-primary dark:text-legal-light font-bold flex items-center"><Copy className="w-3 h-3 mr-1"/> BLOCK</span>
                    </li>
                </ul>
            </div>

        </div>

        {/* Right Column: Report Content (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
            
            {/* Executive Summary */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 shadow-sm">
                 <div className="flex items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 mr-3">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-legal-dark dark:text-white">Executive Summary</h2>
                 </div>
                 <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line font-light text-base">
                    {data.summary}
                 </div>
            </section>

            {/* Risks Analysis - Memo Style */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="flex items-center p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-legal-accent mr-3">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-legal-dark dark:text-white">Risk Analysis & Findings</h2>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.risks.map((risk, idx) => (
                        <div key={idx} className="p-8 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <span className={`w-2 h-2 rounded-full ${risk.severity === 'High' ? 'bg-red-500' : risk.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                    <h4 className="text-lg font-semibold text-legal-dark dark:text-gray-200">{risk.category}</h4>
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                    risk.severity === 'High' ? 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' : 
                                    risk.severity === 'Medium' ? 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-900 text-yellow-600 dark:text-yellow-400' : 
                                    'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400'
                                }`}>
                                    {risk.severity === 'High' ? 'CRITICAL' : risk.severity === 'Medium' ? 'MEDIUM' : 'LOW'}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{risk.description}</p>
                            
                            {/* Legal Quote - Styled like a legal citation */}
                            {risk.quote && (
                                <div className="mt-4 pl-4 border-l-2 border-legal-primary/20 dark:border-legal-light/20">
                                    <p className="font-serif italic text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-r-lg">
                                        <Quote className="inline w-3 h-3 text-gray-400 mr-2 -mt-1" />
                                        "{risk.quote}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

        </div>
      </div>
    </div>
  );
};

export default SummaryView;
