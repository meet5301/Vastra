# Daily Backup And Restore Drill

## Goal
Validate that daily backup archives are created and can be restored successfully.

## Daily backup command
Run from backend folder:

```powershell
npm run backup:db
```

## Weekly restore drill
1. Pick latest backup archive from `./backups`.
2. Restore on staging DB first.
3. Verify key collections and record counts.
4. Run smoke tests after restore.

Restore example:

```powershell
npm run restore:db -- -ArchivePath ./backups/vastra-backup-YYYYMMDD-HHMMSS.gz -Drop
```

## Validation checklist
- Backup file exists and is non-empty.
- `mongorestore` exits with code 0.
- Auth login works after restore.
- Product list API responds with pagination.
- Admin users API responds for admin token.

## Incident fallback
- If production data corruption occurs:
  1. Freeze write traffic.
  2. Restore latest valid backup.
  3. Run smoke checks.
  4. Resume traffic.