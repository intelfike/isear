#!/bin/bash
cd `dirname $0`
sudo apt install -y nodejs
sudo apt install -y nodejs-dev node-gyp libssl1.0-dev npm
sudo npm install -g typescript
sudo npm isntall -g npx
sudo apt install closure-compiler
npm install --save google-closure-compiler

npm install --save-dev @types/chrome
npm install --save-dev @types/es6-promise
