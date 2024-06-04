import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [ "./src/script-name.ts" ],
  platform: "node",
  format: "esm",
  dts: false,
  sourcemap: false,
  clean: true,
  minify: true,
  bundle: true,
})
