// @ts-check
import { defineConfig } from "astro/config";

import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import compressor from "astro-compressor";
import dotenv from "dotenv";

dotenv.config();

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
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "/src/styles/abstracts" as *;`,
        },
      },
    },
  },
});
