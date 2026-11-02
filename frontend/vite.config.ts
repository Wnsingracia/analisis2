import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild', // Usa esbuild en lugar de lightningcss para evitar conflictos con Tailwind v4
  },
});