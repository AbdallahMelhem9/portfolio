import { defineConfig } from 'vite';

// VITE_BASE is set by the GitHub Pages workflow to "/<repo-name>/".
// Locally (and on Vercel or a custom domain) it stays "/".
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  build: { target: 'es2020' },
});
