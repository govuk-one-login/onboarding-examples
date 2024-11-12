import { rm, cp } from "node:fs/promises";
import { join } from "node:path";
import * as ts from "typescript";

const SRC_DIRECTORY = "src";
const DIST_DIRECTORY = "dist";
/**const COPY_DIRECTORIES = ["views", "public"]; */
const COPY_DIRECTORIES = ["views"];

/** Copy directories to dest directory */
async function copyDirectories() {
  for (const directory of COPY_DIRECTORIES) {
    const src = join(SRC_DIRECTORY, directory);
    const dest = join(DIST_DIRECTORY, directory);
    console.log(`📁 Copying ${src} to ${dest}`);
    await cp(src, dest, { recursive: true });
  }
}

/** Transpile typescript files to javascript */
async function transpileTypescript() {
  const configFileName = ts.findConfigFile("./", ts.sys.fileExists);

  if (!configFileName) {
    throw new Error("Could not find a valid 'tsconfig.json'");
  }

  const tsconfig = ts.getParsedCommandLineOfConfigFile(
    configFileName,
    undefined!,
    ts.sys as unknown as ts.ParseConfigFileHost
  );

  if (!tsconfig) {
    throw new Error("Failed to parse tsconfig.json");
  }

  console.log(`🏗️ Compiling TypeScript`);
  const program = ts.createProgram(tsconfig.fileNames, tsconfig.options);
  program.emit();
}

(async function build(): Promise<void> {
  // Clean dist folder
  console.log(`🧹 Cleaning ${DIST_DIRECTORY}`);
  await rm(DIST_DIRECTORY, { recursive: true, force: true });

  // Run build tasks in parallel
  await Promise.all([copyDirectories(), transpileTypescript()]);
})();
