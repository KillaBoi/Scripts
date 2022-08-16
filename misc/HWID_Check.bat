ECHO OFF
Color 07
TITLE HWID Check
:start
cls
ECHO Drives
wmic diskdrive get serialnumber
ECHO CPU 
wmic cpu get serialnumber
ECHO BIOS
wmic bios get serialnumber
ECHO SMBIOS
wmic path win32_computersystemproduct get uuid
ECHO Motherboard/MOBO
wmic baseboard get serialnumber
wmic path Win32_NetworkAdapter where "PNPDeviceID like '%%PCI%%' AND NetConnectionStatus=2 AND AdapterTypeID='0'" get MacAddress
pause>nul
goto start
