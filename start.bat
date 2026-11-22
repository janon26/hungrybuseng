@echo off
if exist "C:\Users\jonri\.tools\nodejs\node-v20.18.1-win-x64" (
    set "PATH=C:\Users\jonri\.tools\nodejs\node-v20.18.1-win-x64;%PATH%"
)
echo Starting HungryBuseng local dev server...
npm run dev
