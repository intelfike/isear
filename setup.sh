cd `dirname $0`
cd ..
sudo apt install -y nodejs nodejs-legacy
sudo apt install -y npm
sudo npm install -g typescript
sudo npm install -g google-closure-compiler-js
npm install -D @types/chrome
npm i --save-dev  @types/es6-promise
