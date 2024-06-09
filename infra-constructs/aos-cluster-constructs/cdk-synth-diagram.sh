#!/bin/bash
set -eEuo pipefail

DOT_LOC=$(echo $1 | tr ' ' '\n' | grep '/bin/dot$')
CDK_BIN_LOC="$2"

echo "dot exe is at: $DOT_LOC"
DOT_DIR=$(dirname -- $(realpath $DOT_LOC))
echo "dot dir is at: $DOT_DIR"
ls -l $DOT_LOC
echo "cdk-bin is at: $CDK_BIN_LOC"

cd $(dirname -- $CDK_BIN_LOC)/../
ls -l