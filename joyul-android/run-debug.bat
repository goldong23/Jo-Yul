@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"

cd /d "%PROJECT_DIR%"
call gradlew.bat assembleDebug || exit /b 1

if not exist "%ADB%" (
  echo adb.exe was not found at "%ADB%".
  echo Open Android Studio, create or connect a device, then run this project again.
  exit /b 1
)

"%ADB%" devices
"%ADB%" install -r "app\build\outputs\apk\debug\app-debug.apk" || exit /b 1
"%ADB%" shell monkey -p com.joyul.app 1

endlocal
