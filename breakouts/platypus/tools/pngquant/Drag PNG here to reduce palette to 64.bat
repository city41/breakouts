@echo off

set path=%~d0%~p0

:start
     
"%path%pngquant.exe" -force -verbose 64 %1
"%path%pngquant.exe" -force -verbose -ordered 64 %1

shift
if NOT x%1==x goto start