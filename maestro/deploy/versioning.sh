#!/bin/bash
set -euo pipefail

git rev-list --count main > ./client-cli/build_number.txt
git add client-cli/build_number.txt

CWD=$(pwd)
cd client-cli/ && make
cd $CWD