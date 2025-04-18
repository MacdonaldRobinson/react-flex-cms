import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FlexCMS',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs']
    },
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  publicDir: 'public',
})
