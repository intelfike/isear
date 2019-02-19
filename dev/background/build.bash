cd `dirname $0`
tsc --out ../../build/background.js collect.ts
cp ../../build/background.js ../../firefox/build/
