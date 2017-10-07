cd `dirname $0`
echo '@compile inject'
sh inject/build.sh
echo '@compile popup'
sh popup/build.sh
echo '@compile background'
sh background/build.sh
