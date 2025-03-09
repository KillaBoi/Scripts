# Realtek EEProm Flashing Utility

## Commands you can use:

### Check MAC Address of adapter (and to see if the utility works)
`RTNicPgW64.exe /efuse /vmac`

### Flash specific MAC into EEPROM:

`RTNicPgW64.exe /efuse /nodeid XXXXXXXXXXXX`
<br>
<br>
Replace `XXXXXXXXXXXX` with a MAC address of your choosing.
<br>
You can use https://macaddress.io/ or https://www.macvendorlookup.com/ to find a specific OUI for your manufacturer (Realtek OUI's usually start with `00:E0:4C`)

