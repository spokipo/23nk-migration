// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",

  integrations: [
    tailwind(),
    react(),
  ],

  adapter: cloudflare({
  platformProxy: true
}),

  vite: {
    cacheDir: "node_modules/.cache/.vite",
  },

  image: {
    domains: ["static.wixstatic.com"],
  },

  server: {
    host: true,
  },

  devToolbar: {
    enabled: false,
  },
});