import { readdirSync } from "fs";
import { resolve, parse } from "path";

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// read all pages from src/pages/*
const basePath = resolve(__dirname, "src/pages/");
const inputs = Object.fromEntries(readdirSync(basePath).map((f) => [parse(f).name, resolve(basePath, f)]));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact({
      babel: {
        plugins: ["macros"],
      },
    }),
    cssInjectedByJsPlugin(),
  ],
  build: {
    manifest: false,
    rollupOptions: {
      input: inputs,
      output: {
        dir: resolve(__dirname, "../static/dist"),
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
      preserveEntrySignatures: "exports-only",
    },
    cssCodeSplit: false,
  },
});
