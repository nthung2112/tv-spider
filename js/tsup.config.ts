import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: false,
  entry: ['./src/sites/*.ts'],
  format: ['esm'],
  sourcemap: false,
  minify: false,
  target: 'esnext',
  splitting: false,
  outDir: 'dist',
  platform: 'browser',
});
