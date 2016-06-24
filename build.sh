#!/bin/sh -e

cd $(dirname "$0")
pwd

TAG=${1:-latest}


IMAGE=bolt-2dot0-frontend
BASE_FILE=docker.${IMAGE}
rm -f docker.${IMAGE}*
GIT_REV_FILE=${BASE_FILE}.$(git log --pretty=format:'%H' -n 1)
echo "git status\n======================" > ${GIT_REV_FILE}
git status >> ${GIT_REV_FILE}
echo "git diff\n======================" >> ${GIT_REV_FILE}
git diff >> ${GIT_REV_FILE}


REGISTRY_HOST=cs-registry-9425.slc01.dev.ebayc3.com
echo "REGISTRY_HOST=$REGISTRY_HOST"

sudo docker rmi $REGISTRY_HOST:5000/$IMAGE:$TAG || true

IMAGE_TAG=$TAG-$(date -u +%Y-%m-%d_%H-%M%Z)
#sudo docker build --build-arg GIT_REV_FILE=$GIT_REV_FILE -t "$REGISTRY_HOST:5000/$IMAGE:$IMAGE_TAG" .
#--build-arg required higher version docker engine
sudo docker build -t "$REGISTRY_HOST:5000/$IMAGE:$IMAGE_TAG" .
sudo docker tag "$REGISTRY_HOST:5000/$IMAGE:$IMAGE_TAG" "$REGISTRY_HOST:5000/$IMAGE:$TAG"
sudo docker push "$REGISTRY_HOST:5000/$IMAGE:$TAG"
