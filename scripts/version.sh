#!/bin/bash

VERSION=`/usr/local/bin/git-revision.sh`
VERSION_FILE='./nodeapp/app/config/version.js'

echo "var version = {};" > $VERSION_FILE
echo "version.number = '$VERSION';" >> $VERSION_FILE
echo "version.api = '1.0';" >> $VERSION_FILE
echo "module.exports = version;" >> $VERSION_FILE
