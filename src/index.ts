import * as spawn from 'cross-spawn';
import {join, relative} from 'path';
import {Plugin, PluginContext} from 'rollup';
import {sourceMapLoader} from './lib/sourceMapLoader';
import {spawnPromise} from './lib/spawnPromise';
import {tmpDir} from './lib/tmpDir';

const extRe = /\.tsx?$/;

interface Opts {
  baseDir?: string;

  /** Additional CLI args to pass to tsc */
  extraCliArgs?: string[];

  /** Whether we're operating in watch mode */
  watch?: boolean;
}

function plugin(opts: Opts = {}): Plugin {
  const {
    baseDir = process.cwd(),
    extraCliArgs = [],
    watch = false
  } = opts;

  let tmpDirPath: string;

  const args: string[] = [
    require.resolve('typescript/bin/tsc'),
    ...extraCliArgs,
    '--outDir'
  ];

  let initialised = false;

  function initialise(): Promise<void> {
    initialised = true;

    let done: Promise<void> = tmpDir()
      .then(dir => {
        args.push(tmpDirPath = dir);

        return spawnPromise(process.execPath, args);
      });

    if (watch) {
      // false positive - caught below
      done = done //tslint:disable-line:no-floating-promises
        .then(() => {
          // Don't return
          spawn(process.execPath, args.concat('--watch', '--preserveWatchOutput'));
        });
    }

    return done;
  }

  return {
    buildStart() {
      if (!initialised) {
        return initialise();
      }
    },
    load(this: PluginContext, id) {
      if (!extRe.test(id)) {
        return null;
      }

      const newId = join(tmpDirPath, relative(baseDir, id))
        .replace(extRe, '.js');
      watch && this.addWatchFile(newId);

      return sourceMapLoader(newId);
    },
    name: 'fast-tsc'
  };
}

export {
  Opts as FastTscPluginOpts,
  plugin as fastTscPlugin
};
