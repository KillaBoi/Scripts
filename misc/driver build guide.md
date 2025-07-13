
# Windows Driver Signing & Microsoft Attestation Submission Guide

This guide walks through the steps to sign a kernel-mode driver and submit it to Microsoft for attestation signing.

---

## 📁 Prerequisites

- `driver.sys` — your compiled driver
- `driver.inf` — your driver INF install script
- Windows 10/11 Driver SDK installed (for `inf2cat`, `signtool`, `makecab`)
- Valid **EV Certificate** AND access to **Microsoft Partner Center**

---

## 🧾 Step 1: Create Catalog File (`.cat`)

> Required for submission and digital signature.

```cmd
inf2cat /driver:"C:\Path\To\driver_files" /os:10_X64
```

- Ensure `driver.sys`, `driver.inf` are in `driver_files\` folder
- This will generate `driver.cat`
  

⚠️ **DO NOT** Sign `.cat` or `.sys` for Microsoft Submission ⚠️

Let Microsoft sign it during attestation. Manually signing may cause rejections or blocks.

---

## 📦 Step 2: Create `PackageInfo.xml` (Optional but Recommended)

Save as: `driver_files\PackageInfo.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<PackageInfo>
  <PackageIdentifier>identifier</PackageIdentifier>
  <PackageVersion>1.0.0.0</PackageVersion>
</PackageInfo>
```

---

## 📄 Step 3: Prepare `build.ddf` to Make CAB

Save as: `build.ddf`

```ddf
.OPTION EXPLICIT
.Set CabinetNameTemplate=driver.cab
.Set DiskDirectory1=.
.Set CompressionType=MSZIP
.Set Cabinet=ON
.Set Compress=ON
.Set MaxDiskSize=0
.Set MaxCabinetSize=0
.Set ReservePerCabinetSize=8
.Set DestinationDir=driver_files

driver_files\driver.sys
driver_files\driver.inf
driver_files\driver.cat
driver_files\PackageInfo.xml
```

OR

```
.Set CabinetNameTemplate=driver.cab
.Set DiskDirectory1=.
.Set DiskDirectoryTemplate=.
.Set CompressionType=MSZIP
.Set Cabinet=on
.Set DestinationDir=driver_files

driver_files\driver.sys
driver_files\driver.inf
driver_files\driver.cat
```

---

## 📦 Step 4: Build CAB Package

From the same folder as `build.ddf`:

```cmd
makecab /f build.ddf
```

Produces `driver.cab` for upload.

Sign the generated `driver.cab` with your EV certificate.

---

## ☁️ Step 5: Submit to Microsoft for Attestation Signing

1. Go to: [Microsoft Partner Hardware Portal](https://partner.microsoft.com/dashboard/hardware)
2. Select **"Submit new hardware"**
3. Upload `driver.cab`
4. Choose **Attestation Signing**
5. Wait ~15–30 minutes
6. Download the returned, **signed** `.cab`

---

## 📥 Step 6: Extract and Use Signed Files

- Extract Microsoft-signed `driver.sys` and `driver.cat` from produced ZIP.
- Replace original files before distribution or installation

---

## 🧪 Optional: Local Install for Testing

Enable driver signing (optional for unsigned dev builds):

```cmd
bcdedit /set testsigning on
```

Reboot, then install:

```cmd
devcon install driver.inf Root\TestDevice
```

---

## ✅ Good Practices

- Never **pack** or **obfuscate** the `.sys` for submission
- **Avoid generic PnP IDs** like `Root\TestDevice`
- Use `VirusTotal` or another service to scan your driver before submitting, this ensures that you don't end up with a `BlockingDetectionFound` error.
- Use `inf2cat` and `dumpbin` to validate structure

---

## 📦 Folder Layout Example

```
C:\YourDriverProject\
├── build.ddf
├── driver.cab         <-- Output, sign and submit this to Microshit and pray it doesn't get rejected.
└── driver_files\
    ├── driver.sys
    ├── driver.inf
    ├── driver.cat
    └── PackageInfo.xml
```

---

# 🛡️ Microsoft Resources

- [Attestation Signing Overview](https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-attestation)
- [INF File Guidelines](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/overview-of-inf-files)
- [Driver Submission Dashboard](https://partner.microsoft.com/dashboard/hardware)
