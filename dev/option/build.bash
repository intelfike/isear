cd `dirname $0`
echo '@copy option.html'
cp option.html ../../build
cp option_en.html ../../build
cp option.html ../../firefox/build/
cp option_en.html ../../firefox/build/
echo '@compile option'
tsc --lib dom,es2015 --outFile ../../build/option.js collect.ts
cp ../../build/option.js ../../firefox/build/
