cd `dirname $0`
tsc --out ../../build/inject.js collect.ts
cp ../../build/inject.js ../../firefox/build
