#!/bin/bash
cd `dirname $0`
# 最新のnodejsをinstallしてください
# https://nodejs.org/ja
sudo npm install -g typescript
sudo npm isntall -g npx
sudo apt install closure-compiler
npm install --save google-closure-compiler

npm install --save-dev @types/chrome
npm install --save-dev @types/es6-promise
