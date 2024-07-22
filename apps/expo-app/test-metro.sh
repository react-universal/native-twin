#env bin/zsh
npx metro build index.js \
-c=metro.config.js \
--minify=false \
--source-map=false \
--platform=ios \
--out=metro-test/bundled \
--dev=false \
--reset-cache=true
