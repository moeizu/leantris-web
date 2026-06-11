import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Absolute Asset-Pfade: nötig für History-Mode-Routing auf verschachtelten Pfaden
  base: '/',
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
