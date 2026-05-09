@echo off
echo Starting KPR Mess Token...
start http://localhost:5500
python -m http.server 5500
