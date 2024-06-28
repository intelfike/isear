cd `dirname $0`
tsc --lib dom,es2015 --outFile ../../chrome/build/inject.js collect.ts
cp ../../chrome/build/inject.js ../../firefox/build
