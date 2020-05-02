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

/** @internal */
export function sourceMapLoader(id: string): Promise<LoadResult> {
  const code$ = fs.readFile(id, 'utf8');
  const map$ = fs.readFile(`${id}.map`, 'utf8')
    .then(onSrcMapRead, onSrcMapError);

  return Promise.all([code$, map$])
    .then(onBothRead);
}
