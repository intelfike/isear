cd `dirname $0`
echo '@copy blacklist.html'
cp blacklist.html ../../build
cp blacklist.html ../../firefox/build/
echo '@compile blacklist'
tsc --lib dom,es2015 --outFile ../../build/blacklist.js collect.ts
cp ../../build/blacklist.js ../../firefox/build/
