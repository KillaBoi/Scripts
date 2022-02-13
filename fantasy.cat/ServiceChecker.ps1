Write-Host "Killa's All-in-One Checker"
Write-Host "Version 2.0.0 (13/02/2022 05:15)"
Write-Host ""
Write-Host "[INFO]"
Write-Host "RED = Actively Running on system" -ForegroundColor Red
Write-Host "YELLOW = Installed on system, not currently running" -ForegroundColor DarkYellow
Write-Host "GREEN = Service Not Found (only shows up if uncommented)" -ForegroundColor DarkGreen
Write-Host ""
Write-Host ""
Write-Host ""
Write-Host "[SERVICES]"
# very terrible variable defining
[Array] $Services = 'vgk', 'vgc', 'AALProtect', 'AALSvc', 'aswarpot', 'aswbidsh', 'aswbuniv', 'aswelam', 'aswkbd', 'aswmonflt', 'aswrvrt', 'aswsnx', 'aswsp', 'aswvmm', 'EasyAntiCheat', 'mklif', 'klhk', 'klim6', 'klkbdflt2', 'xhunter1', 'BEService', 'FACEIT', 'fantasy.driver', 'veracrypt', 'iqvw64e', 'Capcom', 'reWASDService', 'hidgamemap';
[Array] $Valorant = 'vgk', 'vgc';
[Array] $AlphaAntiLeak = 'AALProtect', 'AALSvc';
[Array] $AvastAV = 'aswarpot', 'aswbidsh', 'aswbuniv', 'aswelam', 'aswkbd', 'aswmonflt', 'aswrvrt', 'aswsnx', 'aswsp', 'aswvmm';
[Array] $EasyAntiCheat = 'EasyAntiCheat';
[Array] $KasperskyAV = 'mklif', 'klhk', 'klim6', 'klkbdflt2'; # I don't know why I added this even in the table tbh but might as well add it just in case a user has it potentially installed and it potentially causes issues
[Array] $Xigncode3 = 'xhunter1';
[Array] $BattlEye = 'BEService';
[Array] $FACEIT = 'FACEIT';
[Array] $AGMouseDriver = 'fantasy.driver';
[Array] $Veracrypt = 'veracrypt';
[Array] $ExploitableDriver = 'iqvw64e', 'Capcom';
[Array] $reWASD = 'reWASDService', 'hidgamemap';
Add-Type -AssemblyName PresentationCore,PresentationFramework
foreach ($ServiceName in $Services) {
    If (Get-Service $ServiceName -ErrorAction SilentlyContinue) {
        If ((Get-Service $ServiceName).Status -eq 'Running') {
            # These services are currently running on the system
            If ($Valorant.Contains($ServiceName)) {
                Write-Host "!!! Vanguard Anti-Cheat is still running on your system! Please uninstall it" -ForegroundColor Red
            }
            ElseIf ($AlphaAntiLeak.Contains($ServiceName)) {
                Write-Host "!!! AlphaAntiLeak is running on your system! Please uninstall it (and don't reinstall it, it is outdated, potentially a RAT and no longer required by any clients that were previously using it)" -ForegroundColor Red
            }
            ElseIf ($AvastAV.Contains($ServiceName)) {
                Write-Host "!!! Avast Anti-Virus is running on your system! Please uninstall it" -ForegroundColor Red
            }
            ElseIF ($EasyAntiCheat.Contains($ServiceName)) {
                Write-Host "!!! EasyAntiCheat is running on your system! Please uninstall it" -ForegroundColor Red
            }
            ElseIF ($KasperskyAV.Contains($ServiceName)) {
                Write-Host "!!! Kaspersky is running on your system which may be causing potential problems" -ForegroundColor Red # I don't know what to do with it tbh, so i'll just mention that it may be causing potential problems I guess?
            }
            ElseIF ($Xigncode3.Contains($ServiceName)) {
                Write-Host "!!! Wellbia Xigncode3 Anti-Cheat is running on your system! Please uninstall it" -ForegroundColor Red
            }
            ElseIF ($BattlEye.Contains($ServiceName)) {
                Write-Host "!!! BattlEye Anti-Cheat is running on your system! Please uninstall it" -ForegroundColor Red
            }
            ElseIF ($FACEIT.Contains($ServiceName)) {
                Write-Host "!!! FACEIT Anti-Cheat is running on your system! Please uninstall it to reduce the risk of a ban" -ForegroundColor Red
            }
            ElseIF ($AGMouseDriver.Contains($ServiceName)) {
                Write-Host "!!! You have the old obsolete Astrogalaxy Mouse Driver installed and running. Please remove it" -ForegroundColor Red
            }
            ElseIF ($Veracrypt.Contains($ServiceName)) {
                Write-Host "!!! Veracrypt is running on your system which may be causing potential problems" -ForegroundColor Red # potential issue causing pain here
            }
            ElseIF ($ExploitableDriver.Contains($ServiceName)) {
                [System.Windows.MessageBox]::Show("You have an exploitable driver installed on your system.`n`nUnless you've been using other cheats that may utilize this driver (whether it be for another game such as Valorant or Overwatch for example), this should not exist and may potentially mean you have been compromised. You may consider wiping your system before continuing.`n`n`nIf you need further information/don't understand any of this then please ask on the forums.",'ALERT','OK','Error')
                Write-Host "!!! You have an exploitable driver installed on your system. Unless you've been using other cheats (whether it be for another game such as Valorant), this should not exist and may potentially mean you have been compromised." -ForegroundColor Red # potential issue causing pain here
            }
            ElseIF ($reWASD.Contains($ServiceName)) {
                Write-Host "!!! reWASD is running on your system which has been known to cause problems. Please uninstall it." -ForegroundColor Red # potential pain inducing program reported in a thread
            }
        }
        Else {
            # Services that are listed here are installed on the system but NOT running.
            If ($Valorant.Contains($ServiceName)) {
                Write-Host "!! Vanguard Anti-Cheat is installed! Please uninstall it!" -ForegroundColor DarkYellow
            }
            ElseIf ($AlphaAntiLeak.Contains($ServiceName)) {
                Write-Host "!!! AlphaAntiLeak is installed on your system! Please uninstall it (and don't reinstall it, it is outdated, potentially a RAT and no longer required by any clients that were previously using it)" -ForegroundColor Red
            }
            ElseIf ($AvastAV.Contains($ServiceName)) {
                Write-Host "!! Avast Anti-Virus is installed on your system! Please uninstall it!" -ForegroundColor DarkYellow
            }
            ElseIF ($EasyAntiCheat.Contains($ServiceName)) {
                Write-Host "!! EasyAntiCheat is installed on your system!" -ForegroundColor DarkYellow # ???
            }
            ElseIF ($KasperskyAV.Contains($ServiceName)) {
                Write-Host "!! Kaspersky is installed on your system which may be causing potential problems" -ForegroundColor DarkYellow # I don't know what to do with it tbh, so i'll just mention that it may be causing potential problems I guess?
            }
            ElseIF ($Xigncode3.Contains($ServiceName)) {
                Write-Host "!! Wellbia Xigncode3 Anti-Cheat is installed on your system!" -ForegroundColor DarkYellow
            }
            ElseIF ($BattlEye.Contains($ServiceName)) {
                Write-Host "!! BattlEye Anti-Cheat is installed on your system!" -ForegroundColor DarkYellow
            }
            ElseIF ($FACEIT.Contains($ServiceName)) {
                Write-Host "!! FACEIT Anti-Cheat is installed on your system! Please uninstall it to reduce the risk of a ban" -ForegroundColor DarkYellow
            }
            ElseIF ($AGMouseDriver.Contains($ServiceName)) {
                Write-Host "!!! You have the old obsolete Astrogalaxy Mouse Driver installed. Please remove it." -ForegroundColor Red
            }
            ElseIF ($Veracrypt.Contains($ServiceName)) {
                Write-Host "!!! Veracrypt is installed on your system which may be causing potential problems" -ForegroundColor DarkYellow # ???
            }
            ElseIF ($ExploitableDriver.Contains($ServiceName)) {
                [System.Windows.MessageBox]::Show("You have an exploitable driver installed on your system.`n`nUnless you've been using other cheats that may utilize this driver (whether it be for another game such as Valorant or Overwatch for example), this should not exist and may potentially mean you have been compromised. You may consider wiping your system before continuing.`n`n`nIf you need further information/don't understand any of this then please ask on the forums.",'ALERT','OK','Error')
                Write-Host "!!! You have an exploitable driver installed on your system. Unless you've been using other cheats (whether it be for another game such as Valorant), this should not exist and may potentially mean you have been compromised." -ForegroundColor Red # potential issue causing pain here
            }
            ElseIF ($reWASD.Contains($ServiceName)) {
                Write-Host "!!! reWASD is installed on your system which has been known to cause problems. Please uninstall it." -ForegroundColor DarkYellow
            }
        }
    }
    Else {
        # Services that are not found on the system would execute this but I have commented it out since there's no need for it y'know?
        Write-Host "$ServiceName not found on system" -ForegroundColor DarkGreen
    }
}
Write-Host ""
Write-Host ""
Write-Host ""
Write-Host "[REGISTRY]"
if ((Get-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ -Name "HideFileExt").HideFileExt -eq '1') {
    Write-Host "!!! You have the File Explorer setting to hide File Extensions enabled. This may mean your 'key.txt' file is actually named 'key.txt.txt' and may be causing the software to close straight away." -ForegroundColor Red
} ElseIf ((Get-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ -Name "HideFileExt").HideFileExt -eq '0') {
    Write-Host "File Explorer setting to hide File Extensions is disabled" -ForegroundColor DarkGreen
} Else {
    Write-Host "Unable to find HideFileExt Registry Key" -ForegroundColor DarkYellow
}

Write-Host -NoNewLine 'Press any key to continue...';
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown');