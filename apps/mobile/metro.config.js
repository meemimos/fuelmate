// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper module resolution for web
config.resolver.sourceExts.push('mjs', 'css');

// Transform node_modules that might contain import.meta
config.resolver.unstable_enablePackageExports = true;

// Configure transformer to handle ES modules
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Ensure Babel transforms are applied
  unstable_allowRequireContext: true,
  // Use custom transformer to replace import.meta
  babelTransformerPath: path.resolve(__dirname, 'metro-transformer.js'),
};

module.exports = config;
