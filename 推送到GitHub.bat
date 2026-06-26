@echo off
chcp 65001 >nul
echo ========================================
echo  南京泽舞文化传媒 - GitHub上传脚本
echo ========================================
echo.
echo 请在下方输入你的GitHub用户名：
set /p USERNAME=GitHub用户名: 
echo.
echo 正在连接远程仓库...
cd /d "C:\Users\LI\Documents\Kimi\Workspaces\公司网页\zewu-website"
git remote add origin https://github.com/%USERNAME%/zewu-website.git
git branch -M main
echo.
echo 正在推送到GitHub（可能需要输入密码/Token）...
git push -u origin main
echo.
echo ========================================
echo 推送完成！
echo 请访问: https://github.com/%USERNAME%/zewu-website
echo ========================================
pause
