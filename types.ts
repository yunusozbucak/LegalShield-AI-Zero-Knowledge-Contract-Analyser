export enum AppStage {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  VIEWING = 'VIEWING',
  DESTROYED = 'DESTROYED',
  ERROR = 'ERROR',
  ABOUT = 'ABOUT'
}

export interface RiskPoint {
  category: 'Termination' | 'Liability' | 'NDA' | 'Jurisdiction' | 'Other';
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  quote?: string; // Extracted text from the contract source
}

export interface AnalysisResult {
  summary: string;
  riskScore: number; // 0 to 100
  risks: RiskPoint[];
  keyDates?: string[];
  parties?: string[];
}

// Extending window for PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}