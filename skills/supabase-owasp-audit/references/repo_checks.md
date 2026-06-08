# Phase 1 — Repository analysis

Goal: find intent-level problems the database can't show — leaked secrets, missing auth, unsigned
webhooks, CORS, supply-chain hygiene. Cite file + line for every finding. Never paste secret values.

## 1. Map the project first
- `package.json` (stack, scripts, deps), `supabase/config.toml` (per-function `verify_jwt`),
  `vercel.json`/host config, `src/integrations/supabase/client.ts`, `api/` (serverless routes),
  `supabase/functions/*` (edge functions), `supabase/migrations/*`.
- List edge functions and note which have `verify_jwt = false` — those are internet-reachable without a
  Supabase JWT and MUST authenticate or verify a signature themselves.

## 2. Secret hunting (A02 / A04) — highest priority
```bash
# service_role JWTs (role:service_role base64 fragment) and generic keys
grep -rIlE "InNlcnZpY2Vfcm9sZSI" --include=*.ts --include=*.tsx --include=*.js --include=*.mjs . | grep -v node_modules
grep -rInE "service_role|SERVICE_ROLE_KEY|api[_-]?key|secret|token|bearer|password" \
  --include=*.ts --include=*.tsx --include=*.js --include=*.mjs . | grep -v node_modules | grep -vi "process.env\|Deno.env"
```
- Confirm `client.ts` only carries the **publishable/anon** key (decode the JWT payload: `"role":"anon"`
  is fine and public by design; `"role":"service_role"` in client/serverless source is critical).
- A hardcoded fallback (`process.env.X || '<literal>'`) is still a leak. Flag it.
- Check `.gitignore` covers `.env*`. Note: the ZIP may omit git history — secret-in-old-commit can't be
  confirmed from the ZIP alone.

## 3. Serverless routes & edge function auth (A01 / A07 / A10)
For each route/function that does privileged work:
- Does it **validate** the caller, or just check a header exists? `if (!authHeader) 401` followed by
  using `service_role` without `getUser(token)` is **not** authentication — flag it (A07).
- Is there a shared auth helper (e.g. `verifyAuth`)? Note where it's used and, more importantly,
  where it's **not**.
- **Fail-open patterns** (A10): `const s = env.SECRET; if (s) { check }` — if the secret is unset the
  check is skipped. Auth/cron/webhook code must fail **closed**.
- Token-vending endpoints that return a provider API key to the client (A04): require auth at minimum;
  prefer short-lived scoped tokens, and never return the raw long-lived key.

## 4. Webhook signature verification (A08)
For every inbound webhook (payments, messaging, calendar, email):
```bash
grep -rinE "signature|hmac|crypto.subtle|sha256|x-hub-signature|svix|hottok|verify" supabase/functions/<wh>/index.ts
```
- Payment webhooks (Hotmart/Kiwify/Stripe) **must** verify the provider token/signature before writing
  to sales tables — unsigned = forgeable orders/refunds. Critical.
- Meta/WhatsApp: validate `X-Hub-Signature-256` on POST, not just the GET `hub.verify_token` handshake.
- A webhook that looks up an instance by a token in the body is weak identification, not a signature.
- Note the good examples (e.g. an HMAC'd Zoom webhook) as the model to copy.

## 5. CORS & headers (A02)
- Allowlist (good) vs wildcard `*`. `*` is acceptable for public webhooks but never for routes relying
  on credentials/cookies. Check the shared CORS helper and any per-function overrides.

## 6. Injection & XSS (A05)
- Any raw SQL string concatenation (`pg`/`postgres` clients) → check for parameterization.
- PostgREST filters built from user input should use the SDK's encoding, not string templates.
- Frontend: `dangerouslySetInnerHTML`, unsanitized `innerHTML`, untrusted URLs in `href`.

## 7. Supply chain (A03)
- Is there `npm audit`/`osv-scanner`/Dependabot in CI? Are deps pinned? Any suspicious postinstall
  scripts? Leftover diagnostic/test endpoints (`tmp-*`, `test-*`) in production should be removed.

## 8. Logging (A09)
- `console.log` of request bodies, emails, phones, message content → PII in logs. Recommend logging IDs
  + an errorId only.

Record each finding as: `{code, title, severity, priority, owasp, evidence (file:line), impact, fix}`.
