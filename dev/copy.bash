echo '@copy manifest.json'
cp manifest.json ../build/manifest.json
echo '@copy data'
cp -r ../data ../build

echo '@copy manifest.json for firefox'
cp manifest_firefox.json ../firefox/build/manifest.json
echo '@copy data for firefox'
cp -r ../data ../firefox/build
