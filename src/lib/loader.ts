import {promises as fs} from 'fs';
import {ExistingRawSourceMap, LoadResult, SourceMapInput} from 'rollup';

function onSrcMapRead(v: string): ExistingRawSourceMap {
  return JSON.parse(v.trimEnd());
}

function onSrcMapError(): SourceMapInput {
  return {mappings: ''};
}

function onBothRead([code, map]: [string, SourceMapInput]): LoadResult {
  return {code, map};
}

function sourceMapLoader(id: string): Promise<LoadResult> {
  const code$ = fs.readFile(id, 'utf8');
  const map$ = fs.readFile(`${id}.map`, 'utf8')
    .then(onSrcMapRead, onSrcMapError);

  return Promise.all([code$, map$])
    .then(onBothRead);
}

function regularLoader(id): Promise<LoadResult> {
  return fs.readFile(id, 'utf8');
}

/** @internal */
export type Loader = (id: string) => Promise<LoadResult>;

/** @internal */
export function resolveLoader(sourceMap?: boolean): Loader { //tslint:disable-line:bool-param-default
  return sourceMap ? sourceMapLoader : regularLoader;
}
