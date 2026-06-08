# OWASP Top 10:2025 — reference for the audit

> Always verify the live list in Phase 0 (`https://owasp.org/Top10/`). This snapshot reflects the
> 2025 edition (released January 2026). If a newer edition exists at run time, prefer it and adjust
> the category numbers/names below.

## The 2025 categories and what they map to in a Supabase app

| Code | Category | What it usually means here |
|---|---|---|
| **A01:2025** | Broken Access Control | Missing/weak RLS, `USING(true)` policies, anon-readable views/matviews, IDOR, endpoints that don't authenticate the caller. **SSRF is now part of A01** (server-side fetch of attacker-controlled URLs). |
| **A02:2025** | Security Misconfiguration | Hardcoded keys, SECURITY DEFINER views, mutable `search_path`, extensions in `public`, listable storage buckets, debug/diagnostic endpoints left in prod, permissive CORS. (Moved up to #2.) |
| **A03:2025** | Software Supply Chain Failures | Vulnerable/outdated dependencies, no `npm audit`/SCA in CI, unpinned or unverified build/deploy artifacts, risky postinstall scripts. (Expansion of 2021's "Vulnerable & Outdated Components".) |
| **A04:2025** | Cryptographic Failures | Secrets in source, weak/again-hardcoded tokens, plaintext storage of sensitive data, missing rotation, returning provider API keys to the client. |
| **A05:2025** | Injection | SQL injection (string-built SQL vs parameterized/PostgREST), XSS, command injection. Supabase's PostgREST + parameterized clients usually mitigate SQLi — verify any raw `pg` usage and `dangerouslySetInnerHTML`. |
| **A06:2025** | Insecure Design | Auto-granting roles on sign-up, lookups that reveal PII without proof-of-possession, no rate limiting on public writes, trust decisions baked into the wrong layer. |
| **A07:2025** | Authentication Failures | "Header present = authenticated", weak token validation, open sign-up where it shouldn't be, leaked-password protection off, missing MFA. (Renamed from "Identification and Authentication Failures".) |
| **A08:2025** | Software or Data Integrity Failures | Webhooks without signature verification (payment, messaging), unverified data feeds, trusting client-supplied integrity claims. |
| **A09:2025** | Security Logging & Alerting Failures | No/!insufficient logging of security events, **PII in logs**, no alerting on suspicious activity. (Renamed to emphasize *alerting*.) |
| **A10:2025** | Mishandling of Exceptional Conditions | Fail-open auth (no secret set → no check), unhandled errors that leak detail or default to "allow", logic that fails open under abnormal input. **New in 2025.** |

## Mapping cues specific to Supabase

- Anything reachable by the **public anon key** from the internet is A01 first; if it's a config slip
  (a bucket left listable, a view left granted to `anon`) it's also A02.
- **Hardcoded `service_role`** is both A02 (misconfig) and A04 (crypto/secret) — cite both.
- **Unsigned webhooks** are A08; if they also fail open when a secret is missing, add A10.
- **`handle_new_user` auto-granting a role** + open sign-up is A06 (design) chained into A07 (auth).
- **Dependencies / no CI scanning** is A03 now (not the old A06).

## Scoring the categories

Give each category a current 0–10 and a target 0–10 (see `scoring.md`). A category with multiple
critical findings lands low (2–4); one with only hardening items lands mid-high (6–7); one with no
findings and good practice lands high (8–9). Categories you did not assess deeply (e.g. a thorough SSRF
sweep) get a provisional score with an explicit "not the focus of this pass" note — never a confident
high score you didn't earn.
