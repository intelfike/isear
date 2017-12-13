cd `dirname $0`
bash build.bash
cd ..

echo '=== chrome ==='

echo '#copy build/'
rm -rf deploy
cp -r build deploy
cd deploy

# コンパイル
echo '#compile inject.js'
google-closure-compiler-js inject.js > inject.min.js
rm inject.js
mv inject.min.js inject.js
echo '#compile popup.js'
google-closure-compiler-js popup.js > popup.min.js
rm popup.js
mv popup.min.js popup.js
echo '#compile option.js'
google-closure-compiler-js option.js > option.min.js
rm option.js
mv option.min.js option.js
echo '#compile background.js'
google-closure-compiler-js background.js > background.min.js
rm background.js
mv background.min.js background.js

cd ..
zip -r isear.zip deploy

echo '=== firefox ==='
cp -r deploy firefox
cd firefox
zip -r isear.zip deploy