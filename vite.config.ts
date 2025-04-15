import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FlexCMS',
      fileName: (format) => `flex-cms.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'styled-components',
        'firebase',
        'lodash',
        'reactjs-tiptap-editor',
        '@excalidraw/excalidraw'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': 'styled',
          firebase: 'firebase',
          lodash: '_',
          'reactjs-tiptap-editor': 'ReactTiptapEditor',
          '@excalidraw/excalidraw': 'Excalidraw'
        }
      }
    }
  }
});
