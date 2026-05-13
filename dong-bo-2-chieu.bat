@echo off
title ViralWindow Bi-Directional Sync
color 0B
echo.
echo  ====================================================
echo   VIRALWINDOW SYNC 2 CHIEU: Local ^<-^> TiDB Cloud
echo   Chien luoc: Last-Modified-Wins
echo   Dong bo moi 15 phut
echo  ====================================================
echo.

cd /d "D:\ViralWindow_Phan_Mem_Nhom_Kinh"
node backend/bidirectional_sync.js

pause
