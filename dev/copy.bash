echo '@copy manifest.json'
cp manifest.json ../chrome/build/manifest.json
cp style.css ../chrome/build/
echo '@copy data'
cp -r ../data ../chrome/build

echo '@copy manifest.json for firefox'
cp manifest_firefox.json ../firefox/build/manifest.json
cp style.css ../firefox/build/
echo '@copy data for firefox'
cp -r ../data ../firefox/build
