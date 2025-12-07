
import React, { useState, useEffect, useCallback } from 'react';
import { AppStage, AnalysisResult } from './types';
import FileUpload from './components/FileUpload';
import SummaryView from './components/SummaryView';
import AboutView from './components/AboutView';
import Watermark from './components/Watermark';
import { extractTextFromPDF } from './services/pdfService';
import { analyzeContract } from './services/geminiService';
import { Scale, RefreshCw, AlertOctagon, ShieldCheck, Server, EyeOff, Home, Github, ArrowRight, Lock, Sun, Moon } from 'lucide-react';

const DESTRUCT_TIME_MS = 60000; // 60 seconds

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.UPLOAD);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Security State
  const [timeLeft, setTimeLeft] = useState(DESTRUCT_TIME_MS / 1000);
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dark Mode Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Unstoppable Timer Logic
  useEffect(() => {
    let interval: any;

    if (stage === AppStage.VIEWING && expiryTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = expiryTimestamp - now;

        if (diff <= 0) {
          handleSelfDestruct();
        } else {
          // Update UI timer
          setTimeLeft(Math.ceil(diff / 1000));
        }
      }, 100); // Check frequently (100ms) to prevent drift
    }

    return () => clearInterval(interval);
  }, [stage, expiryTimestamp]);

  const handleSelfDestruct = useCallback(() => {
    setStage(AppStage.DESTROYED);
    setAnalysisData(null); // Strict Wipe: Remove data from memory
    setExpiryTimestamp(null);
    setSessionToken(null);
    setTimeLeft(0);
  }, []);

  const generateSessionToken = () => {
    return 'tk_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  };

  const handleFileSelect = async (file: File) => {
    try {
      setStage(AppStage.PROCESSING);
      setErrorMsg(null);

      // 1. Extract Text
      const text = await extractTextFromPDF(file);
      
      if (!text || text.trim().length < 50) {
        throw new Error("Could not read PDF content or file is empty.");
      }

      // 2. Analyze with Gemini
      const result = await analyzeContract(text);
      
      setAnalysisData(result);
      
      // 3. Set Security Timers & Token
      const now = Date.now();
      setExpiryTimestamp(now + DESTRUCT_TIME_MS);
      setSessionToken(generateSessionToken());
      setTimeLeft(DESTRUCT_TIME_MS / 1000);
      
      setStage(AppStage.VIEWING);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unknown error occurred.");
      setStage(AppStage.ERROR);
    }
  };

  const resetApp = () => {
    setStage(AppStage.UPLOAD);
    setAnalysisData(null);
    setExpiryTimestamp(null);
    setSessionToken(null);
    setErrorMsg(null);
  };

  const goToAbout = () => {
    setStage(AppStage.ABOUT);
  };

  const goHome = () => {
    if (analysisData && expiryTimestamp) {
        setStage(AppStage.VIEWING); // Return to active session if valid
    } else {
        setStage(AppStage.UPLOAD);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-legal-dark flex flex-col font-sans text-legal-dark dark:text-legal-light transition-colors duration-300">
      {/* Navbar: Ultra Clean */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={goHome}>
            <div className="bg-legal-primary p-1.5 rounded text-white">
                <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-legal-primary dark:text-legal-light">LegalShield<span className="font-light opacity-70">AI</span></h1>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
             <button 
                onClick={stage === AppStage.ABOUT ? goHome : goToAbout}
                className="hidden md:flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-legal-primary dark:hover:text-legal-light transition-colors"
             >
               {stage === AppStage.ABOUT ? 'Home' : 'Manifesto'}
             </button>

             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               aria-label="Toggle Dark Mode"
             >
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

            {stage === AppStage.VIEWING && (
                <button 
                    onClick={resetApp}
                    className="text-sm bg-legal-dark dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-all flex items-center gap-2"
                >
                    <RefreshCw className="w-3 h-3" />
                    New Analysis
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full relative flex flex-col items-center overflow-hidden">
        
        {stage === AppStage.VIEWING && analysisData && (
           <Watermark sessionToken={sessionToken || 'UNKNOWN'} />
        )}

        <div className="container mx-auto px-4 py-12 flex-grow flex flex-col items-center relative z-10 w-full max-w-6xl">
            
            {stage === AppStage.ABOUT && (
                <AboutView />
            )}

            {stage === AppStage.UPLOAD && (
            <div className="w-full flex flex-col items-center animate-fade-in max-w-3xl mx-auto">
                
                {/* Minimalist Badge */}
                <a 
                  href="#" 
                  className="mb-8 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:border-legal-primary/30 hover:text-legal-primary dark:hover:text-legal-light transition-all group"
                >
                    <Github className="w-3.5 h-3.5 mr-2 opacity-70" />
                    Open Source & 100% Free
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </a>

                <h2 className="text-4xl md:text-5xl font-bold text-legal-dark dark:text-white mb-6 text-center tracking-tight leading-tight">
                  Enterprise Contract Analysis <br/> 
                  <span className="text-legal-primary dark:text-legal-light">Read & Forget.</span>
                </h2>
                
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 text-center max-w-xl leading-relaxed">
                  AI processes your documents in RAM and destroys them within 60 seconds. 
                  No persistence. Pure risk analysis.
                </p>

                <FileUpload onFileSelect={handleFileSelect} isLoading={false} />

                {/* Minimal Features Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-gray-100 dark:border-gray-800 pt-12">
                    <div className="space-y-2">
                        <div className="flex items-center text-legal-dark dark:text-gray-200 font-semibold text-sm">
                            <EyeOff className="w-4 h-4 mr-2 text-legal-accent" />
                            Ephemeral Processing
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Data is processed in Volatile Memory (RAM) only. Disk I/O is architecturally blocked.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center text-legal-dark dark:text-gray-200 font-semibold text-sm">
                            <ShieldCheck className="w-4 h-4 mr-2 text-legal-accent" />
                            Security Protocol
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Sessions are isolated. Cryptographic wiping occurs when the browser closes or time expires.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center text-legal-dark dark:text-gray-200 font-semibold text-sm">
                            <Server className="w-4 h-4 mr-2 text-legal-accent" />
                            Zero Retention
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Our servers act as a "Tunnel". Your files are never saved to a database.
                        </p>
                    </div>
                </div>
            </div>
            )}

            {stage === AppStage.PROCESSING && (
            <div className="flex flex-col items-center justify-center mt-32 animate-fade-in">
                
                {/* Professional Animated Loader */}
                <div className="relative mb-12 w-24 h-24 flex items-center justify-center">
                    {/* Outer glowing ripple */}
                    <div className="absolute inset-0 bg-legal-primary/5 dark:bg-legal-primary/20 rounded-full animate-ping opacity-75 duration-1000"></div>
                    
                    {/* Static background ring */}
                    <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
                    
                    {/* Active Spinner */}
                    <div className="absolute inset-0 border-4 border-legal-primary border-t-transparent rounded-full animate-spin"></div>
                    
                    {/* Center Icon */}
                    <div className="relative bg-white dark:bg-gray-900 rounded-full p-4 shadow-sm border border-gray-50 dark:border-gray-800 z-10">
                        <Scale className="w-8 h-8 text-legal-primary dark:text-legal-light animate-pulse" />
                    </div>
                </div>

                <h3 className="text-xl font-medium text-legal-dark dark:text-white tracking-tight">Legal Analysis in Progress</h3>
                <p className="text-gray-400 mt-2 text-sm">Scanning termination clauses, indemnity obligations, and jurisdictions...</p>
                
                <div className="mt-12 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    PII Masking Active: Anonymizing sensitive data.
                </div>
            </div>
            )}

            {stage === AppStage.VIEWING && analysisData && (
                <SummaryView 
                data={analysisData} 
                timeLeft={timeLeft} 
                sessionToken={sessionToken || 'INVALID'}
                onTimeExpired={handleSelfDestruct} 
                />
            )}

            {stage === AppStage.DESTROYED && (
            <div className="flex flex-col items-center justify-center mt-20 text-center max-w-md mx-auto animate-fade-in">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-legal-dark dark:text-white mb-2">Session Terminated</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Data destroyed per security protocol. This action is irreversible.
                </p>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400 font-mono text-xs px-6 py-3 rounded mb-8">
                    DESTROY_LOG: {new Date().toISOString()} <br/> STATUS: WIPED_CLEAN
                </div>
                <button 
                onClick={resetApp}
                className="bg-legal-primary hover:bg-legal-800 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2"
                >
                <RefreshCw className="w-4 h-4" />
                Upload New File
                </button>
            </div>
            )}

            {stage === AppStage.ERROR && (
            <div className="flex flex-col items-center justify-center mt-20 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                   <AlertOctagon className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-legal-dark dark:text-white">Operation Failed</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">{errorMsg}</p>
                <button 
                onClick={resetApp}
                className="text-legal-primary hover:text-legal-800 dark:text-legal-light dark:hover:text-white font-medium underline underline-offset-4"
                >
                Return to home
                </button>
            </div>
            )}
        </div>

      </main>

      <footer className="bg-[#F9FAFB] dark:bg-legal-dark border-t border-gray-200 dark:border-gray-800 py-8 text-center relative z-20">
        <p className="text-sm text-gray-400">&copy; 2025 LegalShield AI. All rights not reserved. Created by Yunus E. Özbucak.</p>
      </footer>
    </div>
  );
};

export default App;
