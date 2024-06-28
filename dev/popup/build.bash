cd `dirname $0`
echo '@copy popup.html'
cp popup.html ../../chrome/build/
cp popup.html ../../firefox/build/
echo '@compile popup'
tsc --lib dom,es2015 --outFile ../../chrome/build/popup.js collect.ts
cp ../../chrome/build/popup.js ../../firefox/build/
