import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@layouts': path.resolve(__dirname, './layouts'),
      '@pages': path.resolve(__dirname, './pages'),
      '@services': path.resolve(__dirname, './services'),
    },
  },
  server: {
    port: 5173,
  },
});
