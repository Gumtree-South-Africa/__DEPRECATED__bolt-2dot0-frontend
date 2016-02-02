#!/bin/sh
DIR=$(cd $(dirname "$0"); pwd)   # dir where this script is installed
cd $DIR
NODE_CONFIG_DIR=/BOLTVM/b1frontend/bolt-2dot0-frontend/server/config NODE_ENV=vm /BOLTVM/b1mockserver/node/bin/forever start --append -l frontend-forever.log -o out.log -e error.log bin/www