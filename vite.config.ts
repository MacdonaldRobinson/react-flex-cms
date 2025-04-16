import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // your entry point
      name: 'FlexCMS',
      fileName: (format) => `index.${format}.js`, // generate both es and cjs files
      formats: ['es', 'cjs'], // output ES module and CommonJS
    },
    outDir: 'build', // the output folder
    emptyOutDir: true, // clean the output folder before each build
    rollupOptions: {
      external: ['react', 'react-dom'], // don't bundle peer dependencies
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
