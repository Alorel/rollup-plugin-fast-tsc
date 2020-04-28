import * as spawn from 'cross-spawn';
import {join, relative} from 'path';
import {Plugin, PluginContext} from 'rollup';
import {init} from './lib/init';
import {Loader, resolveLoader} from './lib/loader';
import {spawnPromise} from './lib/spawnPromise';

const extRe = /\.tsx?$/;

interface Opts {
  /** Additional CLI args to pass to tsc */
  extraCliArgs?: string[];

  /**
   * Project dir
   * @default process.cwd()
   */
  mainPath?: string;

  /** Whether we're operating in watch mode */
  watch?: boolean;
}

function plugin(opts: Opts = {}): Plugin {
  const {
    extraCliArgs = [],
    mainPath = process.cwd(),
    watch = false
  } = opts;

  let tmpDirPath: string;
  // let cfg: ts.ParsedCommandLine;
  let loaderFn: Loader;

  const args: string[] = [
    require.resolve('typescript/bin/tsc'),
    ...extraCliArgs,
    '--outDir'
  ];

  let done: Promise<void> = init(mainPath)
    .then(({dir, config}) => {
      loaderFn = resolveLoader(extraCliArgs.includes('--sourceMap') || config.options.sourceMap);
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

  done
    .catch(() => {
      // noop - will be handled in buildStart
    });

  return {
    buildStart() {
      return done;
    },
    load(this: PluginContext, id) {
      if (!extRe.test(id)) {
        return null;
      }

      const newId = join(tmpDirPath, relative(process.cwd(), id))
        .replace(extRe, '.js');
      watch && this.addWatchFile(newId);

      return loaderFn(newId);
    },
    name: 'fast-tsc'

  };
}

export {
  Opts as FastTscPluginOpts,
  plugin as fastTscPlugin
};
