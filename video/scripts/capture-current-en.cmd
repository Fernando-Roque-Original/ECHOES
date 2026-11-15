@echo off
setlocal
set "ECHOS_URL=http://127.0.0.1:5175"
set "ECHOS_REEL_DIR=echos-en-v2"
node "%~dp0capture-echos.mjs"
