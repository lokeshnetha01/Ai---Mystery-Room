import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  optimizeDeps: {
    noDiscovery: true,
    include: ['axios', 'lucide-react', 'react', 'react-dom/client', 'react-router-dom']
  }
});
