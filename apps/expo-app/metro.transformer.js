const upstreamTransformer = require('@expo/metro-config/babel-transformer');
const { inspect } = require('util');

/**
 * @typedef {import('metro-transform-worker').TransformWorker} TransformWorker
 * @typedef {import('metro-transform-worker').JsTransformOptions} JsTransformOptions
 * @typedef {import('metro-transform-worker').JsTransformerConfig} JsTransformerConfig
 *
 * @typedef {object} FuncParams
 * @prop {string} filename
 */

/**
 * Description
 * @param {FuncParams} config
 * @param {string} projectRoot
 * @param {string} filename
 * @param {Buffer|string} data
 * @param {JsTransformOptions} options
 * @returns {any}
 */
module.exports.transform = async (config) => {
  const { src, filename, options } = config;
  // Pass the source through the upstream Expo transformer.
  const result = upstreamTransformer.transform({ src, filename, options });
  if (filename.includes('Home')) {
    console.debug(inspect({ ...config, result }, false, null, true));
  }
  return result;
};
