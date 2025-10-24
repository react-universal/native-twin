#env bin/zsh
npx metro build $(pwd)/App.tsx \
-c=metro.config.js \
--minify=false \
--source-map=true \
--platform=ios \
--out=metro-test/bundled \
--dev=true \
--reset-cache=true
