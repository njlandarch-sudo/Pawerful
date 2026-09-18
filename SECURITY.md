# Security Policy

## Reporting a vulnerability

Please do not publish secrets or exploitable security details in a public issue.

Use GitHub's private **Report a vulnerability** flow from the repository's **Security** tab when it is available. If private reporting is unavailable, contact the maintainer privately through the contact method listed on the maintainer's GitHub profile.

Include:

- the affected file or endpoint;
- clear reproduction steps;
- the likely impact;
- a suggested mitigation, if known.

Do not include real API keys, private pet images, or unrelated personal data in the report.

## Supported version

Pawerful is currently an early-stage project. Security fixes are applied to the latest version on `main`; older snapshots are not maintained.

## Deployment notes

Maintainers and self-hosters should:

- keep provider API keys server-side;
- rotate any credential that has ever been committed or displayed publicly;
- enable spending limits and usage alerts with AI providers;
- add rate limiting before exposing the analysis endpoint to significant public traffic;
- avoid returning raw provider error messages to end users;
- review provider data-retention terms before handling sensitive images.

