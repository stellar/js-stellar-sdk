const fs = require('fs-extra');
const path = require('path');

const variants = ['default', 'no-axios', 'no-eventsource', 'minimal'];
const baseDir = path.resolve(__dirname, '../lib');
const defaultDir = path.join(baseDir, 'default');

// Files that change based on build config
const variantFiles = [
  'http-client/index.js',
  'horizon/call_builder.js'
];

async function createSymlink(source, target) {
  await fs.remove(target); // Remove existing file or symlink
  await fs.ensureSymlink(source, target);
}

async function isVariantFile(filePath) {
  return variantFiles.some(variantFile => filePath.endsWith(variantFile));
}

async function processDirectory(sourceDir, targetDir, variant) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    const relPath = path.relative(defaultDir, sourcePath);

    if (entry.isDirectory()) {
      await fs.ensureDir(targetPath);
      await processDirectory(sourcePath, targetPath, variant);
    } else if (await isVariantFile(relPath)) {
      const variantPath = path.join(baseDir, variant, relPath);
      if (await fs.pathExists(variantPath)) {
        // Do nothing, keep the variant-specific file
      } else {
        console.warn(`Variant file ${relPath} not found in ${variant} directory.`);
      }
    } else {
      await createSymlink(sourcePath, targetPath);
    }
  }
}

async function separateBuilds() {
  // Ensure the default directory exists
  await fs.ensureDir(defaultDir);

  // Create symlinks for non-variant files in other variant directories
  for (const variant of variants) {
    if (variant === 'default') continue;

    const variantDir = path.join(baseDir, variant);
    await fs.ensureDir(variantDir);

    await processDirectory(defaultDir, variantDir, variant);
  }
}

separateBuilds().catch(console.error);
