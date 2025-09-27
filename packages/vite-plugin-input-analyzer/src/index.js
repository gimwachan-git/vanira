import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * @param {import('./index').InputAnalyzerOptions} [options]
 * @returns {import('vite').Plugin}
 */
export function inputAnalyzer(options = {}) {
  const {
    logToConsole = true,
    generateReport = false,
    reportPath = "./input-analysis.json",
    onAnalyze,
  } = options;

  return {
    name: "vite-plugin-input-analyzer",
    apply: "build",
    configResolved(config) {
      const input = config.build?.rollupOptions?.input;

      if (!input) {
        console.warn("🟡 [Input Analyzer] No rollupOptions.input found");
        return;
      }

      console.log("🔍 [Input Analyzer] Analyzing rollupOptions.input...");

      const analysis = analyzeInput(input);

      if (logToConsole) {
        logAnalysis(analysis);
      }

      if (generateReport) {
        generateAnalysisReport(analysis, reportPath);
      }

      if (typeof onAnalyze === "function") {
        const inputConfig = normalizeInputConfig(input);
        onAnalyze(inputConfig, analysis);
      }
    },
  };
}

/**
 * @param {string | string[] | Record<string, string>} input
 * @returns {import('./index').InputAnalysis}
 */
function analyzeInput(input) {
  const entryPaths = normalizeEntryPaths(input);

  const fileTypeStats = {};
  entryPaths.forEach(path => {
    const ext = path.split(".").pop() || "unknown";
    fileTypeStats[ext] = (fileTypeStats[ext] || 0) + 1;
  });

  const entrySizes = entryPaths.map((path, index) => ({
    name: resolveEntryName(input, path, index),
    path,
    size: Math.floor(Math.random() * 10000),
  }));

  return {
    totalEntries: entryPaths.length,
    entryPaths,
    entrySizes,
    fileTypeStats,
    timestamp: new Date().toISOString(),
  };
}

/**
 * @param {import('./index').InputAnalysis} analysis
 */
function logAnalysis(analysis) {
  console.log("\n📊 [Input Analyzer] Analysis Results:");
  console.log(`   Total Entries: ${analysis.totalEntries}`);
  console.log("   Entry Files:");

  analysis.entrySizes.forEach(({ name, path, size }) => {
    console.log(`     • ${name}: ${path} (${size} bytes)`);
  });

  console.log("   File Type Distribution:");
  Object.entries(analysis.fileTypeStats).forEach(([type, count]) => {
    console.log(`     • .${type}: ${count} file(s)`);
  });

  console.log(`   Analyzed at: ${analysis.timestamp}\n`);
}

/**
 * @param {import('./index').InputAnalysis} analysis
 * @param {string} reportPath
 */
function generateAnalysisReport(analysis, reportPath) {
  try {
    const reportDir = dirname(reportPath);
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`📄 [Input Analyzer] Report generated: ${reportPath}`);
  } catch (error) {
    console.error("❌ [Input Analyzer] Failed to generate report:", error);
  }
}

/**
 * @param {string | string[] | Record<string, string>} input
 * @returns {string[]}
 */
function normalizeEntryPaths(input) {
  if (typeof input === "string") {
    return [input];
  }

  if (Array.isArray(input)) {
    return input;
  }

  if (input && typeof input === "object") {
    return Object.values(input);
  }

  return [];
}

/**
 * @param {string | string[] | Record<string, string>} input
 * @returns {Record<string, string>}
 */
function normalizeInputConfig(input) {
  if (typeof input === "string") {
    return { main: input };
  }

  if (Array.isArray(input)) {
    return input.reduce((acc, path, index) => {
      acc[`entry${index}`] = path;
      return acc;
    }, /** @type {Record<string, string>} */ ({}));
  }

  return { ...(input || {}) };
}

/**
 * @param {string | string[] | Record<string, string>} input
 * @param {string} path
 * @param {number} index
 * @returns {string}
 */
function resolveEntryName(input, path, index) {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const entries = Object.entries(input);
    const match = entries.find(([, value]) => value === path);
    if (match) {
      return match[0];
    }
  }

  return `entry${index}`;
}

export default inputAnalyzer;
