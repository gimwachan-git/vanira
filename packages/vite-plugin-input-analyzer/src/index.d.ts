import type { Plugin } from "vite";

export interface InputAnalyzerOptions {
  logToConsole?: boolean;
  generateReport?: boolean;
  reportPath?: string;
  onAnalyze?: (inputConfig: Record<string, string>, analysis: InputAnalysis) => void;
}

export interface InputAnalysis {
  totalEntries: number;
  entryPaths: string[];
  entrySizes: Array<{ name: string; path: string; size: number }>;
  fileTypeStats: Record<string, number>;
  timestamp: string;
}

export declare function inputAnalyzer(options?: InputAnalyzerOptions): Plugin;

export default inputAnalyzer;
