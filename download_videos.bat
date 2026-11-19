@echo off
cd /d "%~dp0"
if not exist videos mkdir videos
set B=https://pub-3fb92949b9c2480b89feec5ec03f3540.r2.dev/cases
for %%N in (gates-ezra ai-labs-debate garfield-poehler mrbeast-colin-samir altman-uses-ai) do (
  echo Downloading %%N ...
  curl -L -o "videos\%%N.mp4" "%B%/%%N/01.mp4?v=2026-10-01g"
)
echo.
echo Done. Now open index.html from this same folder.
pause
