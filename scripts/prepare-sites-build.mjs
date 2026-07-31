import { execFile } from "node:child_process";
import { cp, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const projectRoot = process.cwd();
const openNextDirectory = path.join(projectRoot, ".open-next");
const outputDirectory = path.join(projectRoot, "dist");
const serverDirectory = path.join(outputDirectory, "server");
const execFileAsync = promisify(execFile);
const wranglerCli = path.join(
  projectRoot,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(serverDirectory, { recursive: true });

await execFileAsync(
  process.execPath,
  [
    wranglerCli,
    "deploy",
    "--dry-run",
    "--outdir",
    serverDirectory,
    "--minify",
  ],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      XDG_CONFIG_HOME: path.join(projectRoot, ".wrangler", "config"),
    },
  },
);

await rename(
  path.join(serverDirectory, "worker.js"),
  path.join(serverDirectory, "index.js"),
);
await rm(path.join(serverDirectory, "worker.js.map"), { force: true });
await rm(path.join(serverDirectory, "README.md"), { force: true });

await cp(
  path.join(openNextDirectory, "assets"),
  path.join(outputDirectory, "client"),
  { recursive: true },
);
