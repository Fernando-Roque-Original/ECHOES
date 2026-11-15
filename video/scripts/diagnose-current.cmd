@echo off
setlocal
set "ECHOS_URL=http://127.0.0.1:5175"
node "%~dp0diagnose-capture.mjs"
