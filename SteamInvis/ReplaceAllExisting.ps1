# Script to set Steam to Invisible mode for all user accounts, toggle read-only, and launch it

# Define the default Steam installation path
$steamPath = "C:\Program Files (x86)\Steam"

# Check if Steam is running and terminate it
$steamProcess = Get-Process "Steam" -ErrorAction SilentlyContinue
if ($steamProcess) {
    Stop-Process -Name "Steam" -Force
    Start-Sleep -Seconds 2  # Wait for Steam to fully close
}

# Find all localconfig.vdf files in the userdata folder
$userDataPath = "$steamPath\userdata"
$configFolders = Get-ChildItem -Path $userDataPath -Directory

if ($configFolders.Count -eq 0) {
    Write-Host "No user config folders found in $userDataPath. Please ensure Steam is installed and has been logged into at least once."
    exit
}

# Loop through each user folder and update its localconfig.vdf
foreach ($folder in $configFolders) {
    $configFile = "$($folder.FullName)\config\localconfig.vdf"

    if (Test-Path $configFile) {
        # Check if the file is read-only and store its original state
        $isReadOnly = (Get-ItemProperty -Path $configFile).IsReadOnly

        # If read-only, temporarily remove the attribute
        if ($isReadOnly) {
            Set-ItemProperty -Path $configFile -Name IsReadOnly -Value $false
            Write-Host "Temporarily removed read-only attribute from $configFile"
            Start-Sleep -Milliseconds 500  # Brief pause to ensure the change takes effect
        }

        # Read the content of the file
        $content = Get-Content $configFile -Raw

        # Look for the FriendStoreLocalPrefs section for this account
        $pattern = '"FriendStoreLocalPrefs_(\d+)"\s*"{\\"ePersonaState\\":\d'
        if ($content -match $pattern) {
            # Replace the ePersonaState value with 7 within the JSON string
            $content = $content -replace '("FriendStoreLocalPrefs_\d+"\s*"){\\"ePersonaState\\":\d', '$1{\"ePersonaState\":7'
            Set-Content $configFile -Value $content
            Write-Host "Updated ePersonaState to 7 (Invisible) in $configFile for account $($folder.Name)"
        } else {
            Write-Host "Could not find ePersonaState in FriendStoreLocalPrefs for $($folder.Name). It may already be set to 7 or the file format has changed."
        }

        # Reapply the read-only attribute
        Set-ItemProperty -Path $configFile -Name IsReadOnly -Value $true
        Write-Host "Marked $configFile as read-only"
    } else {
        Write-Host "localconfig.vdf not found in $($folder.FullName). Skipping this account."
    }
}

# Launch Steam
#Start-Process "$steamPath\Steam.exe" -ArgumentList "-silent"
Write-Host "All complete, please start Steam manually."
