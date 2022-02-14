#!/bin/bash
set -e
cp subgraph-smartbch.yaml subgraph.yaml 
cp package-smartbch.json package.json
yarn setup
