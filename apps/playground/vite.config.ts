import { inputAnalyzer } from "@vanira/vite-plugin-input-analyzer";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const main = resolve(__dirname, "pages/index.html");
const nested = resolve(__dirname, "pages/nested/index.html");

console.log("main", main);
console.log("nested", nested);

export default defineConfig({
  plugins: [
    inputAnalyzer({
      logToConsole: true,
      generateReport: true,
      reportPath: "./build-analysis.json",
      onAnalyze: (inputConfig, analysis) => {
        console.log("🎯 custom analysis callback:", {
          config: inputConfig,
          stats: `${analysis.totalEntries} entries`,
          fileType: analysis.fileTypeStats,
        });
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main,
        nested,
      },
    },
  },
});
