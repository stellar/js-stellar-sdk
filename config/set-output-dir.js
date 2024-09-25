const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.env.OUTPUT_DIR || 'lib';
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
const tempTsconfigPath = path.resolve(__dirname, 'tsconfig.tmp.json');

const tsconfig = require(tsconfigPath);
tsconfig.compilerOptions.outDir = path.resolve(__dirname, '..', OUTPUT_DIR);
tsconfig.compilerOptions.declarationDir = path.resolve(__dirname, '..', OUTPUT_DIR);

fs.writeFileSync(tempTsconfigPath, JSON.stringify(tsconfig, null, 2), 'utf8');

console.log(`Set TypeScript outDir to ${OUTPUT_DIR} in temporary tsconfig file.`);