import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["./src/sites/*.ts"],
  format: ["esm"],
  sourcemap: false,
  minify: false,
  target: "es2020",
  splitting: false,
  outDir: "dist",
  platform: "browser",
  esbuildPlugins: [
    {
      name: "cheerio-path-rewrite",
      setup(build) {
        build.onResolve({ filter: /^cheerio$/ }, () => {
          return { path: "./lib/cat.js", external: true };
        });
      },
    },
  ],
});
