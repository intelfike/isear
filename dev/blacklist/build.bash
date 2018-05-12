cd `dirname $0`
echo '@copy blacklist.html'
cp blacklist.html ../../build
echo '@compile blacklist'
tsc --out ../../build/blacklist.js collect.ts
