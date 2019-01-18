cd `dirname $0`
echo '@copy popup.html'
cp popup.html ../../build
echo '@compile popup'
tsc --out ../../build/popup.js collect.ts
