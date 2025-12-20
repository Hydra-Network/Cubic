// @ts-check
import { defineConfig } from "astro/config";

import icon from "astro-icon";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [icon()],

  server: {
    host: true,
    port: 4321,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
