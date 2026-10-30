@echo off
title CellOn XI Web Edition
echo ========================================================
echo       Starting CellOn XI Mobile ERP & POS Web Edition
echo ========================================================
echo.
cd /d "%~dp0"
start http://localhost:5000
npm start
pause
