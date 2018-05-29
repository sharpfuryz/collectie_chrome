#!/bin/sh
DIR="$(pwd)"
EXT_DIR="$DIR/extension"
APP_BUILD_DIR="$DIR/app/build/."
cd app && yarn --silent && yarn build --silent 
cp -a $APP_BUILD_DIR $EXT_DIR
cd $DIR
mv $EXT_DIR/index.html $EXT_DIR/popup.html
echo "Done!"