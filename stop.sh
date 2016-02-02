#!/bin/sh
DIR=$(cd $(dirname "$0"); pwd)   # dir where this script is installed
cd $DIR
forever stop bin/www