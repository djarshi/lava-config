#!/bin/bash

cd ..
echo go http://localhost:8080/lava-config/index.html
python3 -m http.server

