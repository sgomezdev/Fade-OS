import { build } from "esbuild";

await build({
  entryPoints: ["src/server.js"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "../dist-final/servidor.mjs",
  external: ["@prisma/client"],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
console.log("✓ Empaquetado listo");