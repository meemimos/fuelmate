module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: [
      'react-native-reanimated/plugin',
      // Transform import.meta for web compatibility
      [
        'babel-plugin-transform-import-meta',
        {
          module: 'ES6',
        },
      ],
    ],
  };
};
