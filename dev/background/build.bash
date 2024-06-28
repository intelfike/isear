cd `dirname $0`
tsc --lib dom,es2015 --outFile ../../chrome/build/background.js collect.ts
cp ../../chrome/build/background.js ../../firefox/build/
