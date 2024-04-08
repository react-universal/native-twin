"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUMENT_SELECTORS = exports.extensionName = exports.configurationSection = exports.pluginId = exports.typeScriptExtensionId = void 0;
exports.typeScriptExtensionId = 'vscode.typescript-language-features';
exports.pluginId = '@native-twin/ts-plugin';
exports.configurationSection = 'nativeTwin';
const packageName = '@native-twin/vscode';
const publisher = 'native-twin';
// export const extensionChannelName = 'Native Twin Language Client';
// export const extensionServerChannelName = 'Native Twin Language Server';
exports.extensionName = `${publisher}.${packageName}`;
exports.DOCUMENT_SELECTORS = [
    {
        scheme: 'file',
        language: 'typescript',
    },
    {
        scheme: 'file',
        language: 'typescriptreact',
    },
    {
        scheme: 'file',
        language: 'javascript',
    },
    {
        scheme: 'file',
        language: 'javascriptreact',
    },
];
//# sourceMappingURL=config.js.map