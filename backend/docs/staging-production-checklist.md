# Staging And Production Separation Checklist

## Environment isolation
- Use separate MongoDB databases for staging and production.
- Use separate JWT secrets for staging and production.
- Use separate payment gateway modes: staging=`test`, production=`live`.
- Restrict `CORS_ORIGIN` per environment.

## Build and release gates
- Run API tests: `npm run test:api`
- Run smoke tests: `npm run test:smoke`
- Run all backend tests: `npm run test`
- Ensure no diagnostics errors in changed files.

## Deployment flow
1. Deploy backend to staging.
2. Run smoke checks for admin and brand flows on staging.
3. Validate payment mode and COD rules on staging.
4. Take fresh production backup before prod rollout.
5. Deploy backend to production.
6. Run smoke checks against production URLs.

## Post-deploy verification
- `/sitemap.xml` and `/robots.txt` respond with status 200.
- Auth signup/login works.
- Product listing pagination responses include `pagination` object.
- Order placement validates totals and applies COD charge.

## Rollback trigger conditions
- Auth route failure rate spike.
- Product listing API errors above baseline.
- Order placement failures > threshold.

## Rollback plan
1. Roll back application release.
2. Re-validate API smoke tests.
3. Restore database only if data corruption is confirmed.