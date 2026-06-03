import { context } from 'esbuild';
import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';

const isWatchMode = process.argv.includes('--watch');
const isProduction = process.env.NODE_ENV === 'production';
const handlersDirectory = 'src/handlers';
const outputDirectory = 'dist/handlers';

const files = await readdir(handlersDirectory);
const entryPoints = files
  .filter((file) => file.endsWith('.ts'))
  .map((file) => join(handlersDirectory, file));

if (entryPoints.length === 0) {
  throw new Error(`No Lambda handler entry points found in ${handlersDirectory}`);
}

const buildContext = await context({
  bundle: true,
  entryNames: '[name]',
  entryPoints,
  format: 'esm',
  keepNames: true,
  logLevel: 'info',
  minify: isProduction,
  outdir: outputDirectory,
  platform: 'node',
  sourcemap: true,
  sourcesContent: true,
  target: 'node24',
  treeShaking: true
});

if (isWatchMode) {
  await buildContext.watch();
  const handlerNames = entryPoints.map((entryPoint) => basename(entryPoint)).join(', ');
  console.log(`Watching ${handlerNames}`);
} else {
  await buildContext.rebuild();
  await buildContext.dispose();
}
