#!/bin/sh
DIR=$(cd $(dirname "$0"); pwd)   # dir where this script is installed
cd $DIR
PM_CWD=/BOLTVM/b1frontend/bolt-2dot0-frontend NODE_CONFIG_DIR=/BOLTVM/b1frontend/bolt-2dot0-frontend/server/config NODE_ENV=localhost SITES=en_ZA PORT=8000 BASEDOMAINSUFFIX=.vm /BOLTVM/b1mockserver/node/bin/forever start --append -l frontend-forever.log -o out.log -e error.log bin/www
