cd `dirname $0`

echo '=== chrome ==='
rm -rf ../build
mkdir ../build
echo '@copy manifest.json'
cp manifest.json ../build
echo '@copy data'
cp -r ../data ../build

bash inject/build.bash
bash popup/build.bash
bash option/build.bash
bash blacklist/build.bash
bash background/build.bash

echo '=== firefox ==='
rm -rf ../firefox/build
mkdir -p ../firefox
echo '@copy build'
cp -r ../build ../firefox
echo '@copy manifest.json'
cp manifest_firefox.json ../firefox/build/manifest.json