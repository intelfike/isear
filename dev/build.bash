cd `dirname $0`

mkdir -p ../chrome/build
rm -rf ../chrome/build
mkdir ../chrome/build
mkdir -p ../firefox/build
rm -rf ../firefox/build
mkdir -p ../firefox/build

bash inject/build.bash
bash popup/build.bash
bash option/build.bash
bash blacklist/build.bash
bash background/build.bash

bash copy.bash

echo '#zip build'
cd ../chrome
rm -f isear.zip
zip -rq isear.zip build

echo '=== firefox ==='
echo '#create isear.xpi'
cd ../firefox
rm -f isear.xpi
zip -rq isear.xpi build
