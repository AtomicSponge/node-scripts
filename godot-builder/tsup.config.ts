import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [ "./src/godot-builder.ts" ],
  platform: "node",
  format: "esm",
  dts: false,
  sourcemap: false,
  clean: true,
  bundle: true,
  minify: false
})
