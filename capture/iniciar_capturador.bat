@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo No se encontro Python. Instala Python 3 desde https://www.python.org/downloads/ marcando "Add python.exe to PATH".
  pause
  exit /b 1
)
echo Instalando dependencias...
python -m pip install -q -r requirements.txt
echo.
python sf6_capture.py %*
echo.
pause
