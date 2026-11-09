// @ts-check
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import compressor from "astro-compressor";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://yourdomain.com",
  integrations: [icon(), sitemap(), compressor()],
  image: {
    layout: "constrained",
    objectFit: "cover",
    objectPosition: "center",
    breakpoints: [500, 750, 828, 1080, 1280],
    responsiveStyles: true,
  },
  server: {
    port: 4321,
    host: "0.0.0.0",
  },
  vite: {
    server: {
      watch: {
        ignored: [
          "**/.astro/**",
          "**/node_modules/**",
          "**/.git/**",
          "**/dist/**",
          "**/bun.lock",
          "**/DumpStack.log.tmp",
          "**/dumpstack.log.tmp",
        ],
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [path.resolve(__dirname, "src/styles")],
          additionalData: `@use "abstracts" as *;\n`,
        },
      },
    },
  },
});


