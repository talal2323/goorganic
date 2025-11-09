@echo off
REM GOorganic Next.js 15 - Setup and Start Script
REM This script will install dependencies and start the development server

echo ========================================
echo  GOorganic Next.js 15 - Setup Script
echo ========================================
echo.

echo [1/3] Checking directory...
cd /d "d:\frontend 1\frontend-nextjs"
if errorlevel 1 (
    echo ERROR: Could not find directory
    pause
    exit /b 1
)
echo SUCCESS: Directory found
echo.

echo [2/3] Installing dependencies...
echo This may take a few minutes...
echo.
npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo SUCCESS: Dependencies installed
echo.

echo [3/3] Starting development server...
echo.
echo ========================================
echo  Server will start at:
echo  http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
