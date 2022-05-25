#!/bin/bash
cd ./API
node ./src/ &
cd ..
cd ./IONIC
ionic serve -p 8100 &
wait