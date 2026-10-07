// The bundler cannot follow MapLibre's worker file, so it is served from public/.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = join(
  dirname(require.resolve("maplibre-gl/package.json")),
  "dist",
);
const target = join(process.cwd(), "public", "vendor", "maplibre-gl");

mkdirSync(target, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(source, file), join(target, file));
}
