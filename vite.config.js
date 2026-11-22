import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base keeps the build portable across Cloudflare Pages,
  // GitHub Pages project sites, and plain static hosting.
  base: './',
  build: {
    target: 'es2020',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        resume: 'resume.html'
      }
    }
  },
  server: {
    open: true
  }
});
