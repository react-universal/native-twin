---
'@universal-labs/tailwind-ui': patch
'@universal-labs/primitives': patch
'@universal-labs/stylesheets': patch
'@universal-labs/styled': patch
'@universal-labs/core': patch
'@universal-labs/hooks': patch
---

hooks package added
core package now handle its own plugins through a preset which has the proper plugins for react native for tailwind
core package dont depends anymore on many postcss plugins to replace values for react native