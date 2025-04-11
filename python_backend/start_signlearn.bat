@echo off
echo Starting SignLearn with Home Page...
echo.
echo This will start:
echo 1. The Flask API server with video streaming on port 5001
echo 2. The Node.js server on port 5000
echo.
echo Press Ctrl+C to stop the servers
echo.

echo Starting Flask API server with video streaming...
start cmd /k python python_backend/api_server_stream.py

echo Starting Node.js server...
start cmd /k node server.js

echo.
echo Waiting for servers to start...
timeout /t 5 > nul

echo.
echo Servers started! You can now access:
echo - Home page: http://localhost:5000
echo - Dashboard: http://localhost:5000/dashboard
echo.
echo Opening home page in browser...
start "" "http://localhost:5000"
