SET HWID= "PCI\VEN_10EC&DEV_8131" "PCI\VEN_10EC&DEV_8136" "PCI\VEN_10EC&DEV_8137" "PCI\VEN_10EC&DEV_8168" "PCI\VEN_10EC&DEV_8161" "PCI\VEN_10EC&DEV_8169" "PCI\VEN_10EC&DEV_8167" "PCI\VEN_10EC&DEV_8125" "PCI\VEN_10EC&DEV_2502" "PCI\VEN_10EC&DEV_2600" "PCI\VEN_10EC&DEV_3000"

net stop DashClientService

devcon64.exe disable %HWID%

RTNicPgW64.exe /efuse /w

devcon64.exe rescan

devcon64.exe enable %HWID%

net start DashClientService
