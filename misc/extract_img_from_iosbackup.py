from iOSbackup import iOSbackup
b=iOSbackup(udid="REPLACE_ME_WITH_UDID", backuproot="REPLACE_ME_WITH_LOCATION_TO_BACKUP_FOLDER")
print("\n\n")
b.getFolderDecryptedCopy(
	'Media',
	targetFolder='files',
	includeDomains='CameraRollDomain',
)
