import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import * as fs from 'fs';
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/certs/localhost+2-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/certs/localhost+2.pem')),
    },
  },
})