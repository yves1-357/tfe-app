@echo off
cd /d "%~dp0backend"
venv\Scripts\uvicorn.exe main:app --reload
