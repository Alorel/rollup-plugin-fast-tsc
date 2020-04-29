import * as ts from 'typescript';
import {tmpDir} from './tmpDir';

/** @internal */
export interface InitResponse {
  config: ts.ParsedCommandLine;

  dir: string;
}

/** @internal */
export function init(mainPath: string, configName?: string): Promise<InitResponse> {
  return tmpDir()
    .then<InitResponse>(dir => {
      const fileName = ts.findConfigFile(mainPath, ts.sys.fileExists, configName); //tslint:disable-line:no-unbound-method max-line-length
      if (!fileName) {
        throw new Error('tsconfig not found');
      }

      const text = ts.sys.readFile(fileName)!;
      const loadedConfig = ts.parseConfigFileTextToJson(fileName, text).config;

      const config = ts.parseJsonConfigFileContent(
        {
          ...loadedConfig,
          compilerOptions: {
            ...loadedConfig.compilerOptions,
            outDir: dir
          }
        },
        ts.sys,
        process.cwd(),
        undefined,
        fileName
      );

      return {dir, config};
    });
}
