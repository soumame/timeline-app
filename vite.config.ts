import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
