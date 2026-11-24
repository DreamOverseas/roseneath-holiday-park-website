# Membership finance settings

Annual & Permanent · Finance → View ledger → Edit account settings saves to the selected RHPMembership document. The protected finance endpoint accepts only TenantId and OutstandingDebtA/B/C. The amounts are AUD decimals, including zero, with at most two decimal places. These schema fields are private, so the existing public membership Content API does not expose them; Strapi's Content Manager and the protected finance endpoint can still access them.

Existing Annual and Permanent memberships receive missing values only: A = 0, B = 3872, C = 1936. TenantId defaults to RHP-{padded site}-A for Annual and RHP-{padded site}-P for Permanent. Existing custom values are retained. The frontend uses the same defaults for new memberships until their settings are saved. Custom IDs remain unchanged when a membership type changes.

The summary and total use the selected membership's amounts; all recorded payments are subtracted once from A+B+C as before. Changing these settings does not create or alter ledger transactions. Historical reconciliation and transaction balances retain their existing meaning.

The main deployment builds the website, then checks the backend before publishing the build. All finance deployment entry points use `strapi-media360.service`. The deployment verifies that `strapi-svc` can read the three Roseneath modules and membership schema without being able to write their source. An unchanged backend gets a health check without a restart.

On backend changes, the deployer stops Strapi and saves its source and a verified SQLite backup under `~/rhp-finance-backups`. It runs the membership migration (and an optional bank import) on a database copy in a private network namespace, checks the login and protected finance routes, and verifies that existing ledger rows, bank records, and saved membership finance settings survived before starting the production service. A failed pre-start deployment restores the previous source and database. After the service has been started, recovery retains the live database and its backup so it cannot overwrite any new writes.

The optional bank import takes `import.json` from a private staging directory. Website source and releases use the main deployment workflow. Verification runs `npm test`, `npm run build`, Bash syntax checks and `python3 tests/strapi-deploy-db.test.py`.
