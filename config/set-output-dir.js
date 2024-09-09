const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.env.OUTPUT_DIR || 'lib';
const VARIANT_FILES_ONLY = process.env.VARIANT_FILES_ONLY === 'true';
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
const tempTsconfigPath = path.resolve(__dirname, 'tsconfig.tmp.json');

const tsconfig = require(tsconfigPath);
tsconfig.compilerOptions.outDir = path.resolve(__dirname, '..', OUTPUT_DIR);
tsconfig.compilerOptions.declarationDir = path.resolve(__dirname, '..', OUTPUT_DIR);

if (VARIANT_FILES_ONLY) {
  const variantFiles = [
    'http-client/index.ts',
    'horizon/call_builder.ts'
  ];
  tsconfig.include = variantFiles.map(file => path.join('../src', file));
}

fs.writeFileSync(tempTsconfigPath, JSON.stringify(tsconfig, null, 2), 'utf8');

console.log(`Set TypeScript outDir to ${OUTPUT_DIR} in temporary tsconfig file.`);
if (VARIANT_FILES_ONLY) {
  console.log('Set to compile only variant files.');
}