@echo off
echo ========================================================
echo   Running SceneSense Test Suites (Backend + Client)
echo ========================================================
echo.
echo [1/2] Running Backend Tests...
cd server
call npm.cmd test
if %errorlevel% neq 0 (
    echo Backend tests failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Running Frontend Tests...
cd client
call npm.cmd test
if %errorlevel% neq 0 (
    echo Frontend tests failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================================
echo   ALL TESTS PASSED SUCCESSFULLY!
echo ========================================================
pause
