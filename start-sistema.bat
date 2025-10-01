@echo off
cd /d "C:\Users\marco\Downloads\CA.LTDA"
start /min cmd /k npm run dev
start "" "http://localhost:3000"