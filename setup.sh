cd `dirname $0`
cd ..
sudo apt install -y nodejs nodejs-legacy
sudo apt install -y npm
sudo npm install -g typescript

sudo npm install -g google-closure-compiler-js
cd /usr/local/lib/node_modules/google-closure-compiler-js/
sudo sed "s/ready(...arr)/ready.apply({}, arr)/" cmd.js | sudo tee cmd_tmp.js
sudo chmod 755 cmd_tmp.js
sudo mv cmd.js cmd_backup.js
sudo mv cmd_tmp.js cmd.js
cd `dirname $0`
cd ..

npm install -D @types/chrome
npm i --save-dev  @types/es6-promise
