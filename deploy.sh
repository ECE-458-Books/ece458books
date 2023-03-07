#!/usr/bin/env bash

# ----------------------------------------------------------------------
# Copyright © 2023 Hosung Kim <hk196@duke.edu>
#
# All rights reserved
# ----------------------------------------------------------------------

JENKINS_DEPLOY_HOME="/home/hk196/jenkins_auto_deploy"

echo "Copy FrondEnd Environment File"
cp /home/hk196/.env.production "${JENKINS_DEPLOY_HOME}/frontend"

echo "Copy BackEnd Environment File"
cp /home/hk196/.env "${JENKINS_DEPLOY_HOME}/backend"

cd $JENKINS_DEPLOY_HOME/frontend
npm run build
sudo cp ./build/* /var/www/html
make deploy