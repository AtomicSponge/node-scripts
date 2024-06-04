import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [ "./src/gh-sync-followers.ts" ],
  platform: "node",
  format: "esm",
  dts: false,
  sourcemap: false,
  clean: true,
  bundle: true,
})
