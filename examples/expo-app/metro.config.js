const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

// const monorepoPackages = {
//   '@medico/client': path.resolve(workspaceRoot, 'packages/client'),
//   '@medico/universal': path.resolve(workspaceRoot, 'packages/ui'),
//   '@medico/i18n': path.resolve(workspaceRoot, 'packages/i18n'),
// };

const config = getDefaultConfig(projectRoot);

config.resolver.assetExts.push('mjs', 'mjs.js', 'min.js');

// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
module.exports = config;
