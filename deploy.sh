#!/usr/bin/env bash

# ----------------------------------------------------------------------
# Copyright © 2023 Hosung Kim <hk196@duke.edu>
#
# All rights reserved
# ----------------------------------------------------------------------

JENKINS_DEPLOY_HOME="/var/lib/hypothetical_books"

cd $JENKINS_DEPLOY_HOME
tar -xzvf frontend-production-build.tar.gz
tar -xzvf backend-production-build.tar.gz

mv build /var/www/html
make deploy