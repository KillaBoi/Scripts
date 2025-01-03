@echo off
:: Navigate to the IPMI directory
cd "C:\Program Files\Dell\SysMgt\iDRACTools\IPMI"

:: Run the first IPMI command
ipmitool -I lanplus -H 192.168.8.144 -U root -P calvin raw 0x30 0x30 0x01 0x00

:: Run the second IPMI command
ipmitool -I lanplus -H 192.168.8.144 -U root -P calvin raw 0x30 0x30 0x02 0xff 0x1e

:: Notify user of completion
echo Commands executed successfully.
pause
