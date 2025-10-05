import { htmlModules } from "@vanira/vite-plugin-html-module";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [htmlModules()],
});
