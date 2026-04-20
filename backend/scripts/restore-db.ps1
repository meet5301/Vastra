param(
  [Parameter(Mandatory=$true)]
  [string]$ArchivePath,
  [string]$MongoUri = $env:MONGO_URI,
  [switch]$Drop
)

if (-not $MongoUri) {
  Write-Error "MONGO_URI is required."
  exit 1
}

if (-not (Test-Path $ArchivePath)) {
  Write-Error "Archive not found: $ArchivePath"
  exit 1
}

Write-Host "Restoring from $ArchivePath"

$args = @("--uri=$MongoUri", "--archive=$ArchivePath", "--gzip")
if ($Drop) { $args += "--drop" }

mongorestore @args

if ($LASTEXITCODE -ne 0) {
  Write-Error "Restore failed"
  exit $LASTEXITCODE
}

Write-Host "Restore completed"