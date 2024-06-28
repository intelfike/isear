cd `dirname $0`
echo '@copy blacklist.html'
cp blacklist.html ../../chrome/build
cp blacklist.html ../../firefox/build/
echo '@compile blacklist'
tsc --lib dom,es2015 --outFile ../../chrome/build/blacklist.js collect.ts
cp ../../chrome/build/blacklist.js ../../firefox/build/
