const { DefinePlugin } = require('webpack');
const withPlugins = require('next-compose-plugins');

/** @type {import('next').NextConfig} **/
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
    forceSwcTransforms: true,
    scrollRestoration: true,
    gzipSize: true,
    appDir: false,
  },
  transpilePackages: [
    'react-native',
    'react-native-svg',
    'react-native-web',
    '@react-universal/core',
  ],
  outputFileTracing: false,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  optimizeFonts: true,
  /**
   * Transformation to apply for both preview and dev server
   * @param config {import('webpack').Configuration}
   * @param options
   * @returns {import('webpack').Configuration}
   */
  webpack(config) {
    // Mix in aliases
    if (!config.resolve) {
      config.resolve = {};
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'react-native-web$': 'react-native-web',
      'react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo$':
        'react-native-web/dist/AccessibilityInfo',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter$':
        'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter',
    };

    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...(config.resolve?.extensions ?? []),
    ];

    if (!config.plugins) {
      config.plugins = [];
    }

    // Expose __DEV__ from Metro.
    config.plugins.push(
      new DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      }),
    );

    return config;
  },
};

const transformer = withPlugins(
  [
    // withTM,
    // withPWA,
    // [withExpo, { projectRoot: __dirname + '/../..' }],
  ].filter(Boolean),
  nextConfig,
);

module.exports = function (name, { defaultConfig }) {
  const config = transformer(name, {
    ...defaultConfig,
    ...nextConfig,
  });
  return config;
};
