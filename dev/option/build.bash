cd `dirname $0`
echo '@copy option.html'
cp option.html ../../build
cp option_en.html ../../build
echo '@compile option'
tsc --out ../../build/option.js collect.ts
