import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'next/image': path.resolve(__dirname, 'src/components/Image.tsx'),
      'next/link': path.resolve(__dirname, 'src/components/Link.tsx')
    }
  },
  server: {
    watch: {
      ignored: ['**/asset/**', '**/screenshots/**']
    }
  }
})
