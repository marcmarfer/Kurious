// Written from Node because `>` in Windows PowerShell saves UTF-16.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const PROJECT_ID = "jykwfosbirblmhpihuvm";

const target = process.argv.includes("--local")
  ? ["--local"]
  : ["--project-id", PROJECT_ID];

const types = execFileSync(
  "npx",
  ["supabase", "gen", "types", "typescript", ...target],
  { encoding: "utf8", shell: process.platform === "win32" },
);
writeFileSync("src/lib/supabase/database.types.ts", types);
