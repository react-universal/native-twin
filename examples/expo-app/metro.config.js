const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.assetExts.push('mjs', 'mjs.js', 'min.js');

// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
module.exports = config;
