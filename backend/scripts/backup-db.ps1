param(
  [string]$MongoUri = $env:MONGO_URI,
  [string]$OutDir = "./backups"
)

if (-not $MongoUri) {
  Write-Error "MONGO_URI is required."
  exit 1
}

if (-not (Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archivePath = Join-Path $OutDir "vastra-backup-$timestamp.gz"

Write-Host "Creating backup at $archivePath"
mongodump --uri="$MongoUri" --archive="$archivePath" --gzip

if ($LASTEXITCODE -ne 0) {
  Write-Error "Backup failed"
  exit $LASTEXITCODE
}

Write-Host "Backup completed: $archivePath"