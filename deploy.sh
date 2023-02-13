#!/usr/bin/env bash

# ----------------------------------------------------------------------
# Copyright © 2023 Hosung Kim <hk196@duke.edu>
#
# All rights reserved
# ----------------------------------------------------------------------

echo "Copy FrondEnd Environment File"
cp ../.env.development frontend
echo "Copy BackEnd Environment File"
cp ../.env backend
make local