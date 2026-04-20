@echo off
title Student Bug Tracker - Startup
color 0A

echo.
echo  ============================================
echo   Student Bug Tracker - Starting Application
echo  ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Checking Node.js...
node --version
echo.

:: Check if PostgreSQL is running
echo [2/4] Checking PostgreSQL...
pg_isready >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL may not be running.
    echo Make sure PostgreSQL is started before the backend can connect.
    echo.
) else (
    echo PostgreSQL is running!
    echo.
)

:: Generate Prisma Client (in case it's missing)
echo [3/4] Generating Prisma Client...
cd /d "%~dp0backend"
call npx prisma generate 2>nul
echo.

:: Start Backend in a new window
echo [4/4] Starting servers...
echo.
echo Starting Backend (port 5000)...
start "Bug Tracker - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in a new window
echo Starting Frontend (port 3000)...
start "Bug Tracker - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  ============================================
echo   Both servers are starting!
echo  ============================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo   Health:   http://localhost:5000/api/v1/health
echo.
echo   The browser should open automatically.
echo   If not, open http://localhost:3000
echo.
echo   Press any key to close this window...
echo   (The servers will keep running in their own windows)
echo.
pause
