#!/bin/bash
set +e
cp subgraph-smartbch-amber.yaml subgraph.yaml 
cp package-smartbch-amber.json package.json
yarn setup
