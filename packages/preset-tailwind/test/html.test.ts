import { defineConfig, install, tw, extract } from '@native-twin/native-twin';
import { presetTailwind } from '../src';

install(
  defineConfig({
    mode: 'web',
    presets: [presetTailwind()],
  }),
);

const html1 = `<html><head></head><body class="min-h-screen min-w-full"><div class="bg-blue-200" /></body>`;
const html2 = `<html><head></head><body class="min-h-screen min-w-full"><div class="bg-red-200 hover:bg-blue-200" /></body>`;

describe('@native-twin/preset-tailwind - TW call', () => {
  it('Insert rules', () => {
    const result = extract(html1, tw);
    // console.log('EXTRACTED_1: ', result.css);
    expect(result.css).toStrictEqual(
      `.\\*\\,\\:\\:before\\,\\:\\:after {--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-transform:translateX(var(--tw-translate-x))
    translateY(var(--tw-translate-y)) rotate(var(--tw-rotate))
    skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));}
.\\:\\:backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-transform:translateX(var(--tw-translate-x))
    translateY(var(--tw-translate-y)) rotate(var(--tw-rotate))
    skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));}
.\\*\\,\\:\\:before\\,\\:\\:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor;}
.\\:\\:before\\,\\:\\:after{--tw-content:'';}
.html{-webkit-text-size-adjust:100%;-moz-tab-size:4;}
.body{margin:0;line-height:inherit;}
.hr{height:0;color:inherit;border-top-width:1px;}
.abbr\\:where\\(\\[title\\]\\){text-decoration:underline dotted;}
.h1\\,h2\\,h3\\,h4\\,h5\\,h6{font-size:inherit;font-weight:inherit;}
.a{color:inherit;text-decoration:inherit;}
.b\\,strong{font-weight:bolder;}
.code\\,kbd\\,samp\\,pre{font-feature-settings:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:1em;}
.small{font-size:80%;}
.sub\\\,sup{font-size:75%;position:relative;vertical-align:baseline;}
.sub{bottom:-0.25em;}
.sup{top:-0.5em;}
.table{text-indent:0;border-color:inherit;border-collapse:collapse;}
.button\\,input\\,optgroup\\,select\\,textarea{font-family:inherit;font-size:100%;line-height:inherit;color:inherit;margin:0;padding:0;}
.button\\\,select{text-transform:none;}
.button\\,\\[type\\=\\'button\\'\\]\\,\\[type\\=\\'reset\\'\\]\\,\\[type\\=\\'submit\\'\\]{-webkit-appearance:button;background-color:transparent;background-image:none;}
.\\:-moz-focusring{outline:auto;}
.\\:-moz-ui-invalid{box-shadow:none;}
.progress{vertical-align:baseline;}
.\\:\\:-webkit-inner-spin-button\\,\\:\\:-webkit-outer-spin-button{height:auto;}
.\\[type\\=\\'search\\'\\]{-webkit-appearance:textfield;outline-offset:-2px;}
.\\:\\:-webkit-search-decoration{-webkit-appearance:none;}
.\\:\\:-webkit-file-upload-button{-webkit-appearance:button;font:inherit;}
.summary{display:list-item;}
.blockquote\\,dl\\,dd\\,h1\\,h2\\,h3\\,h4\\,h5\\,h6\\,hr\\,figure\\,p\\,pre{margin:0;}
.fieldset{margin:0;padding:0;}
.legend{padding:0;}
.ol\\,ul\\,menu{list-style:none;margin:0;padding:0;}
.textarea{resize:vertical;}
.input\\:\\:placeholder\\,textarea\\:\\:placeholder{color:#9ca3af;}
.button\\,\\[role\\=\\"button\\"\\]{cursor:pointer;}
.\\:disabled{cursor:default;}
.img\\,svg\\,video\\,canvas\\,audio\\,iframe\\,embed\\,object{display:block;vertical-align:middle;}
.img\\,video{max-width:100%;height:auto;}
.\\[hidden\\]{display:none;}
.bg-blue-200{background-color:rgba(191,219,254,1);}
.min-h-screen{min-height:100vh;}
.min-w-full{min-width:100%;}`,
    );
    const result2 = extract(html2, tw);
    // console.log('EXTRACTED_2: ', result2.css);
    expect(result2.css).toStrictEqual(
      `.\\*\\,\\:\\:before\\,\\:\\:after {--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-transform:translateX(var(--tw-translate-x))
    translateY(var(--tw-translate-y)) rotate(var(--tw-rotate))
    skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));}
.\\:\\:backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-transform:translateX(var(--tw-translate-x))
    translateY(var(--tw-translate-y)) rotate(var(--tw-rotate))
    skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));}
.\\*\\,\\:\\:before\\,\\:\\:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor;}
.\\:\\:before\\,\\:\\:after{--tw-content:'';}
.html{-webkit-text-size-adjust:100%;-moz-tab-size:4;}
.body{margin:0;line-height:inherit;}
.hr{height:0;color:inherit;border-top-width:1px;}
.abbr\\:where\\(\\[title\\]\\){text-decoration:underline dotted;}
.h1\\,h2\\,h3\\,h4\\,h5\\,h6{font-size:inherit;font-weight:inherit;}
.a{color:inherit;text-decoration:inherit;}
.b\\,strong{font-weight:bolder;}
.code\\,kbd\\,samp\\,pre{font-feature-settings:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:1em;}
.small{font-size:80%;}
.sub\\\,sup{font-size:75%;position:relative;vertical-align:baseline;}
.sub{bottom:-0.25em;}
.sup{top:-0.5em;}
.table{text-indent:0;border-color:inherit;border-collapse:collapse;}
.button\\,input\\,optgroup\\,select\\,textarea{font-family:inherit;font-size:100%;line-height:inherit;color:inherit;margin:0;padding:0;}
.button\\\,select{text-transform:none;}
.button\\,\\[type\\=\\'button\\'\\]\\,\\[type\\=\\'reset\\'\\]\\,\\[type\\=\\'submit\\'\\]{-webkit-appearance:button;background-color:transparent;background-image:none;}
.\\:-moz-focusring{outline:auto;}
.\\:-moz-ui-invalid{box-shadow:none;}
.progress{vertical-align:baseline;}
.\\:\\:-webkit-inner-spin-button\\,\\:\\:-webkit-outer-spin-button{height:auto;}
.\\[type\\=\\'search\\'\\]{-webkit-appearance:textfield;outline-offset:-2px;}
.\\:\\:-webkit-search-decoration{-webkit-appearance:none;}
.\\:\\:-webkit-file-upload-button{-webkit-appearance:button;font:inherit;}
.summary{display:list-item;}
.blockquote\\,dl\\,dd\\,h1\\,h2\\,h3\\,h4\\,h5\\,h6\\,hr\\,figure\\,p\\,pre{margin:0;}
.fieldset{margin:0;padding:0;}
.legend{padding:0;}
.ol\\,ul\\,menu{list-style:none;margin:0;padding:0;}
.textarea{resize:vertical;}
.input\\:\\:placeholder\\,textarea\\:\\:placeholder{color:#9ca3af;}
.button\\,\\[role\\=\\"button\\"\\]{cursor:pointer;}
.\\:disabled{cursor:default;}
.img\\,svg\\,video\\,canvas\\,audio\\,iframe\\,embed\\,object{display:block;vertical-align:middle;}
.img\\,video{max-width:100%;height:auto;}
.\\[hidden\\]{display:none;}
.bg-red-200{background-color:rgba(254,202,202,1);}
.hover\\:bg-blue-200:hover{background-color:rgba(191,219,254,1);}`,
    );
  });
});
