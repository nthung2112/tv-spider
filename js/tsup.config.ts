import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: false,
  entry: ['./src/sites/*.ts'],
  format: ['esm'],
  sourcemap: false,
  minify: false,
  target: 'es2018',
  splitting: false,
  outDir: 'dist',
  platform: 'browser',
});
