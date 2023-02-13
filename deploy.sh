#!/usr/bin/env bash

# ----------------------------------------------------------------------
# Copyright © 2023 Hosung Kim <hk196@duke.edu>
#
# All rights reserved
# ----------------------------------------------------------------------

echo "Copy FrondEnd Environment File"
cp /home/hk196/.env.development frontend

echo "Copy BackEnd Environment File"
cp /home/hk196/.env backend

(cd /home/hk196/jenkins_auto_deploy && make local)