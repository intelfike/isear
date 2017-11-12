cd `dirname $0`
rm -rf ../build
mkdir ../build
echo '@copy manifest.json'
cp manifest.json ../build
echo '@copy icons'
cp -r ../data ../build

echo '@compile inject'
bash inject/build.bash
bash popup/build.bash
bash option/build.bash
echo '@compile background'
bash background/build.bash