cd `dirname $0`
echo '@copy option.html'
cp option.html ../../build
cp option_en.html ../../build
cp option.html ../../firefox/build/
cp option_en.html ../../firefox/build/
echo '@compile option'
tsc --out ../../build/option.js collect.ts
cp ../../build/background.js ../../firefox/build/
