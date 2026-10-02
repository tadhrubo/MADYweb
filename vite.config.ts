import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'next/image': path.resolve(__dirname, 'src/components/Image.tsx'),
      'next/link': path.resolve(__dirname, 'src/components/Link.tsx'),
      'next/dynamic': path.resolve(__dirname, 'src/utils/dynamic.tsx'),
      'next/script': path.resolve(__dirname, 'src/components/Script.tsx'),
      'next/font/google': path.resolve(__dirname, 'src/utils/fontGoogle.ts'),
      'next/font/local': path.resolve(__dirname, 'src/utils/fontLocal.ts')
    }
  },
  server: {
    watch: {
      ignored: ['**/asset/**', '**/screenshots/**']
    }
  }
})
