# Scoring — the 0–10 security score

The score must be defensible, not a vibe. Use three linked views.

## A. Overall score = mean of 7 dimensions
Score each 0–10 from what you observed, then average for the headline number.

| Dimension | What pulls it down |
|---|---|
| Secret management | Hardcoded keys, keys returned to clients, no rotation, secrets readable by low-priv roles |
| Access control (RLS) | RLS off, `USING(true)`, anon-readable views/matviews, public buckets |
| Authentication | Header-presence-as-auth, open sign-up + auto-role, weak token validation, MFA/leaked-pw off |
| Data exposure / PII | Any PII reachable by anon; enumerable lookups; emails/phones in views |
| Input & webhook integrity | Unsigned webhooks, unthrottled public writes, injection vectors |
| Configuration hardening | Mutable search_path, SECURITY DEFINER, extensions in public, permissive CORS |
| Monitoring / process | PII in logs, no CI dependency scanning, no alerting, no rotation cadence |

## B. Per-OWASP score (current vs target)
Score each of the 10 categories 0–10, current and target. This is the scorecard wireframe. Anchor:
- 2–3: one or more critical, internet-reachable findings in that category.
- 4–5: serious but gated findings, or several mediums.
- 6–7: only hardening items.
- 8–9: no findings + good practice.
- Provisional + note: categories not deeply assessed this pass.

Keep A (dimensions) and B (OWASP) roughly consistent — they're different axes over the same evidence, so
their averages should land in the same neighborhood, even though item-by-item they differ.

## C. Trajectory (the projection wireframe)
Show how the headline number climbs as fixes land:
- after the ⏱️ Today items (active leaks closed),
- after the 📅 This week items (gated highs closed),
- after 🔧 Continuous hardening.

## The "why not 10" rule — always include it
A single remediation pass tops out around ~9. The last point isn't a fix, it's a *practice*: dependency
scanning in CI, periodic pentests, monitoring/alerting, scheduled secret rotation, incident response.
State this so the target isn't mistaken for a finish line. Mark the realistic ceiling on the projection.

## Honesty checks
- Don't inflate categories you didn't test — say "not the focus of this pass".
- Tie every sub-score to named findings so the reader can audit the audit.
- If sign-up status is unconfirmed, score the auth/access dimensions for the worse case and flag the
  assumption.
