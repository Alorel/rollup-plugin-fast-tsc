const {copyFileSync, existsSync, writeFileSync} = require('fs');
const {join} = require('path');

for (const f of ['LICENSE', 'CHANGELOG.md', 'README.md']) {
  const fpath = join(__dirname, f);
  if (existsSync(fpath)) {
    copyFileSync(fpath, join(__dirname, 'dist', f));
  }
}

const pjson = require('./package.json');
delete pjson.devDependencies;
delete pjson.scripts;

writeFileSync(join(__dirname, 'dist', 'package.json'), JSON.stringify(
  pjson,
  null,
  2
));
