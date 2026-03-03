// Custom Metro transformer to replace import.meta before Babel processes it
// Use Expo's transformer to ensure Babel config (including NativeWind preset) is applied
const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Replace import.meta.env with a web-compatible alternative BEFORE Babel processes it
  if (src.includes('import.meta')) {
    src = src.replace(
      /import\.meta\.env/g,
      '(typeof process !== "undefined" && process.env ? process.env : {})'
    );
    // Replace import.meta.url
    src = src.replace(
      /import\.meta\.url/g,
      'typeof document !== "undefined" ? (document.currentScript?.src || window.location.href) : ""'
    );
    // Replace other import.meta usage
    src = src.replace(/import\.meta/g, '{}');
  }
  
  // Use Expo's transformer which will apply Babel config (including NativeWind preset)
  return upstreamTransformer.transform({ src, filename, options });
};
