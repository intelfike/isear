cd `dirname $0`
echo '@copy popup.html'
cp popup.html ../../build
cp popup.html ../../firefox/build/
echo '@compile popup'
tsc --lib dom,es2015 --outFile ../../build/popup.js collect.ts
cp ../../build/popup.js ../../firefox/build/
