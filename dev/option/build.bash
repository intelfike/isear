cd `dirname $0`
echo '@copy option.html'
cp option.html ../../chrome/build
cp option_en.html ../../chrome/build
cp option.html ../../firefox/build/
cp option_en.html ../../firefox/build/
echo '@compile option'
tsc --lib dom,es2015 --outFile ../../chrome/build/option.js collect.ts
cp ../../chrome/build/option.js ../../firefox/build/
