#/bin/sh

SCRIPT_DIR=$(cd $(dirname $0); pwd)

MOUNT_HOST=$SCRIPT_DIR
MOUNT_CONTAINER=/app

docker run -p5173:5173 -p5174:5174 -v $MOUNT_HOST:/$MOUNT_CONTAINER -v $MOUNT_CONTAINER/node_modules roket/browser
