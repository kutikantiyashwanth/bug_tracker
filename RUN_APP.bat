@echo off
title Student Bug Tracker - Full Stack Launcher
color 0A
echo.
echo  ========================================
echo   Student Bug Tracker - Full Stack Start
echo  ========================================
echo.

:: Start Backend
echo  [1/2] Starting Backend Server (port 5000)...
start "Backend-Server" cmd /k "cd /d "%~dp0backend" && echo Starting backend... && npm run dev"

:: Wait for backend
echo  Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start Frontend
echo  [2/2] Starting Frontend Server (port 3000)...
start "Frontend-Server" cmd /k "cd /d "%~dp0frontend" && echo Starting frontend... && npm run dev"

:: Wait for frontend
echo  Waiting for frontend to initialize...
timeout /t 8 /nobreak >nul

:: Open browser
echo.
echo  Opening browser...
start http://localhost:3000

echo.
echo  ========================================
echo   Both servers are now running!
echo  ========================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000
echo   Health:    http://localhost:5000/api/v1/health
echo.
echo   Login:  admin@test.com / password123
echo.
echo   To stop: Close the two terminal windows
echo  ========================================
echo.
pause
