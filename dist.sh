#!/bin/sh
VERSION=`/usr/local/bin/git-revision.sh`
echo "create a new version: $VERSION"
./scripts/version.sh
cd ./nodeapp/public
grunt release
cd ../..
