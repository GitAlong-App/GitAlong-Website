import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/** Long-lived vendor chunks, so app deploys don't bust the library cache. */
function vendorChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
  if (/[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/.test(id)) return 'router';
  if (/[\\/]node_modules[\\/]framer-motion[\\/]/.test(id)) return 'motion';
  if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(id)) return 'supabase';
  if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons';
  // Everything else (incl. Tone.js, which is imported lazily) stays with its importer.
  return undefined;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
});
