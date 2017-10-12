cd `dirname $0`
echo '@copy manifest.json'
cp manifest.json build
echo '@copy popup.html'
cp popup/popup.html build
echo '@copy icons'
cp -r icons/ build
echo '@compile inject'
sh inject/build.sh
echo '@compile popup'
sh popup/build.sh
echo '@compile background'
sh background/build.sh
