cd `dirname $0`
tsc --lib dom,es2015 --outFile ../../build/background.js collect.ts
cp ../../build/background.js ../../firefox/build/
