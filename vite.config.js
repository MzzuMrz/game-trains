import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'physics': ['cannon-es'],
          'audio': ['howler']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'cannon-es', 'howler', 'zustand']
  }
});
