@echo off

set exe=D:\jean.h.ma\project\MyTree.WinForm.ResourceManager\MyTree.Console.CombineFile\bin\Debug\MyTree.Console.CombineFile.exe

set files=animationFrame.js Object.extend.js String.format.js

set combineFile=..\box2dweb\global.js

%exe% %files% %combineFile%

pause