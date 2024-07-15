#env bin/zsh
npx metro build src/screens/Home.screen.tsx \
-c=metro.config.js \
--minify=false \
--source-map=false \
--platform=ios \
--out=metro-test/bundled \
--dev=false \
--reset-cache=true