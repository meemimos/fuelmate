const fs = require('fs');
const path = require('path');

// Find and patch files containing import.meta in node_modules
const root = process.cwd();
const nodeModulesPath = path.join(root, 'node_modules');

const patchFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace import.meta.env with a web-compatible alternative
    if (content.includes('import.meta.env')) {
      content = content.replace(
        /import\.meta\.env/g,
        '(typeof process !== "undefined" && process.env ? process.env : {})'
      );
      modified = true;
    }

    // Replace import.meta.url
    if (content.includes('import.meta.url')) {
      content = content.replace(
        /import\.meta\.url/g,
        'typeof document !== "undefined" ? (document.currentScript?.src || window.location.href) : ""'
      );
      modified = true;
    }

    // Replace other import.meta usage
    if (content.includes('import.meta') && !content.includes('import.meta.env') && !content.includes('import.meta.url')) {
      content = content.replace(/import\.meta/g, '{}');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched: ${filePath}`);
    }
  } catch (error) {
    // Ignore errors for files that don't exist or can't be read
  }
};

const findAndPatchFiles = (dir, maxDepth = 3, currentDepth = 0) => {
  if (currentDepth > maxDepth) return;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip certain directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }
        findAndPatchFiles(fullPath, maxDepth, currentDepth + 1);
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.map.js')) {
        // Check if file contains import.meta before reading
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('import.meta')) {
            patchFile(fullPath);
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
};

// Patch common packages that might use import.meta
const packagesToCheck = [
  'zustand',
  '@reduxjs/toolkit',
  'redux',
];

for (const pkg of packagesToCheck) {
  const pkgPath = path.join(nodeModulesPath, pkg);
  if (fs.existsSync(pkgPath)) {
    findAndPatchFiles(pkgPath, 5);
  }
}

// Also check pnpm store structure
const pnpmStore = path.join(nodeModulesPath, '.pnpm');
if (fs.existsSync(pnpmStore)) {
  const entries = fs.readdirSync(pnpmStore, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && (entry.name.includes('zustand') || entry.name.includes('redux'))) {
      const pkgPath = path.join(pnpmStore, entry.name, 'node_modules');
      if (fs.existsSync(pkgPath)) {
        findAndPatchFiles(pkgPath, 5);
      }
    }
  }
}

console.log('Import.meta patching complete');
