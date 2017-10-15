cd `dirname $0`
mkdir ../build
echo '@copy manifest.json'
cp manifest.json ../build
echo '@copy popup.html'
cp popup/popup.html ../build
echo '@copy icons'
cp -r icons/ ../build
echo '@compile inject'
bash inject/build.bash
echo '@compile popup'
bash popup/build.bash
echo '@compile background'
bash background/build.bash