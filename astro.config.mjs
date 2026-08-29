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

/**
 * Vite plugin: suppress EBUSY watcher crashes on Windows.
 *
 * On Windows, Vite's chokidar watcher can encounter locked OS files
 * (e.g. C:\DumpStack.log.tmp) and emit an unhandled 'error' event
 * that kills Node. This plugin catches those errors gracefully.
 */
function watcherErrorSuppressor() {
  return {
    name: "vite-plugin-watcher-error-suppressor",
    configureServer(server) {
      server.watcher.on("error", (/** @type {NodeJS.ErrnoException} */ err) => {
        if (err.code === "EBUSY" || err.code === "EPERM") {
          console.warn(
            `[watcher] Ignoring ${err.code} on ${err.path ?? "unknown path"}`
          );
        } else {
          throw err;
        }
      });
    },
  };
}

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
    plugins: [watcherErrorSuppressor()],
    server: {
      watch: {
        ignored: [
          "**/DumpStack.log.tmp",
          "**/hiberfil.sys",
          "**/pagefile.sys",
          "**/swapfile.sys",
          "**/.git/**",
          "**/dist/**",
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