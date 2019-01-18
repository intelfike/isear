cd `dirname $0`
cd ..

echo '=== chrome ==='

echo '#copy build/'
rm -rf deploy
cp -r build deploy
cd deploy

# コンパイル
echo '#compile inject.js'
closure-compiler inject.js > inject.min.js
rm inject.js
mv inject.min.js inject.js
echo '#compile popup.js'
closure-compiler popup.js > popup.min.js
rm popup.js
mv popup.min.js popup.js
echo '#compile option.js'
closure-compiler option.js > option.min.js
rm option.js
mv option.min.js option.js
echo '#compile blacklist.js'
closure-compiler blacklist.js > blacklist.min.js
rm blacklist.js
mv blacklist.min.js blacklist.js
echo '#compile background.js'
closure-compiler background.js > background.min.js
rm background.js
mv background.min.js background.js

echo '#zip deploy'
cd ..
rm -f isear.zip
zip -rq isear.zip deploy

echo '=== firefox ==='
echo '#copy deploy'
cp -r deploy firefox
echo '#copy manifest.json'
cd firefox
cp build/manifest.json deploy/manifest.json
echo '#create isear.xpi'
cd build
rm -f ../isear.xpi
zip -rq ../isear.xpi *
