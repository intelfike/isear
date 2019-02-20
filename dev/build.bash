cd `dirname $0`

rm -rf ../build
rm -rf ../firefox/build
mkdir ../build
mkdir -p ../firefox
mkdir -p ../firefox/build

bash inject/build.bash
bash popup/build.bash
bash option/build.bash
bash blacklist/build.bash
bash background/build.bash

bash copy.bash
