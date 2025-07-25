@echo off
:: Navigate to the IPMI directory
cd "C:\impitool"

:: Check current status to see whether non pcie cooling is enabled or disabled
:: Enabled = 16 05 00 00 00 05 00 00 00 00
:: Disabled = 16 05 00 00 00 05 00 01 00 00
ipmitool -I lanplus -H 192.168.8.144 -U root -P calvin raw 0x30 0xce 0x01 0x16 0x05 0x00 0x00 0x00

:: Disable Non-Dell PCIE Cooling
ipmitool -I lanplus -H 192.168.8.144 -U root -P calvin raw 0x30 0xce 0x00 0x16 0x05 0x00 0x00 0x00 0x05 0x00 0x01 0x00 0x00


:: uncomment out if you need to reenable it
:: ipmitool -I lanplus -H 192.168.8.144 -U root -P calvin raw 0x30 0xce 0x00 0x16 0x05 0x00 0x00 0x00 0x05 0x00 0x00 0x00 0x00

:: uncomment out if you want default dell poweredge cooling
:: raw 0x30 0xce 0x01 0x16 0x05 0x00 0x00 0x00

:: Notify user of completion
echo Commands executed successfully.
pause
