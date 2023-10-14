cd `dirname $0`
tsc --lib dom,es2015 --outFile ../../build/inject.js collect.ts
cp ../../build/inject.js ../../firefox/build
