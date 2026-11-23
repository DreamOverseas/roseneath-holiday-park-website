# Membership finance settings

Annual & Permanent · Finance → View ledger → Edit account settings saves to the selected RHPMembership document. The protected finance endpoint accepts only TenantId and OutstandingDebtA/B/C. The amounts are AUD decimals, including zero, with at most two decimal places. These schema fields are private, so the existing public membership Content API does not expose them; Strapi's Content Manager and the protected finance endpoint can still access them.

Existing Annual and Permanent memberships receive missing values only: A = 0, B = 3872, C = 1936. TenantId defaults to RHP-{padded site}-A for Annual and RHP-{padded site}-P for Permanent. Existing custom values are retained. The frontend uses the same defaults for new memberships until their settings are saved. Custom IDs remain unchanged when a membership type changes.

The summary and total use the selected membership's amounts; all recorded payments are subtracted once from A+B+C as before. Changing these settings does not create or alter ledger transactions. Historical reconciliation and transaction balances retain their existing meaning.

The main deployment installs the backend before building the frontend. It backs up the membership/finance source and SQLite database with Strapi stopped, extends the existing membership schema without replacing other attributes, initializes missing fields on existing draft/published rows, verifies an identical second migration makes no changes, restarts Strapi and checks authenticated and unauthenticated access. Saving settings updates only the four fields on existing copies of the selected document, preserving unrelated unpublished edits.

Verification: npm test; npm run build. Private live snapshots are stored outside the repository, never committed.
