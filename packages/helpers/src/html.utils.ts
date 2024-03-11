declare let __webpack_nonce__: string;

export function getNonce() {
  return typeof __webpack_nonce__ !== 'undefined' ? __webpack_nonce__ : null;
}
