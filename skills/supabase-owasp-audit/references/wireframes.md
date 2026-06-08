# Phase 4 — Wireframes (in-chat visual report)

Use the visualizer: call `read_me(["diagram","chart"])` once, then `show_widget` per visual. Rules that
matter most here:
- **Never stack two `show_widget` calls back-to-back** — always a sentence of prose between them.
- **Every visual has a legend** and uses the shared flag colors so a non-expert can read it cold.
- **Make nodes/cards clickable** via `sendPrompt('Detalhe o achado X')` so the reader can drill in.
- Flag palette: critical = red ramp / `--color-*-danger`; high = amber/`--color-*-warning`;
  good = teal/green/`--color-*-success`; neutral = gray/`--color-*-secondary`.
- SVG: `viewBox="0 0 680 H"`, `role="img"` + `<title>`/`<desc>`, classes on every `<text>`, the arrow
  marker in `<defs>`, no overlaps. HTML: CSS variables only (dark-mode safe), no emoji (use Tabler
  `<i class="ti ti-...">`), `border-radius` via tokens.

## Required visuals (always include)

1. **OWASP scorecard — the centerpiece.** Chart.js horizontal grouped bar: each of the 10 categories
   with `atual` (coral `#D85A30`) vs `meta` (teal `#1D9E75`), scale 0–10. Custom HTML legend (squares),
   `indexAxis:'y'`, wrapper height ~520px. This is the "nota da aplicação em cada critério" the user asks
   for. Label bars `A01 …` through `A10 …` using the current edition's names.

2. **Application structure with risk zones.** SVG structural/flow diagram, 3 layers (client/public →
   app: frontend, serverless, edge functions → Supabase: Postgres+RLS, views/matviews, storage/auth).
   Color protected nodes teal, risky nodes red, neutral gray. Draw the leak path (e.g. anon → matview)
   as a red dashed line. Legend: ponto de atenção / protegido / neutro.

3. **Strong points.** HTML card grid (`repeat(auto-fit,minmax(210px,1fr))`), each card a success-colored
   Tabler icon + short title + one-line detail. This tells the team what *not* to break.

4. **Weak points / points of attention.** HTML grid of finding cards (critical + high), each with the
   code (C1/H3…), a short title, a severity pill, and a priority icon (`ti-clock` today /
   `ti-calendar` this week). Clickable to expand.

5. **Correction pipeline.** SVG flow or HTML stepper showing the remediation sequence grouped
   ⏱️ Today → 📅 This week → 🔧 Continuous, with the score climbing at each stage (or pair it with the
   projection chart). "Rotate keys first" should be visibly the first step.

## Add when the app warrants (prefer a relevant extra over filler)

6. **Data-access map.** HTML grid heatmap: rows = sensitive assets, columns = `anon` / `authenticated` /
   `service_role`, cells colored correto/indevido/ressalva/esperado. The clearest "who can read what"
   view; build it straight from the Phase 2 queries. After fixes, regenerate it as proof.

7. **Risk matrix.** SVG 3×3, impact (y) × likelihood (x), zones green→amber→red, findings plotted as
   pills (red border = critical, amber = high). Position encodes urgency; note any assumption (e.g.
   sign-up closed) that moves a pill.

8. **Attack-path kill-chains.** SVG, one row per chain (4 steps, last node red = outcome). Makes
   "anyone on the internet can…" concrete. Great for the 1–2 worst findings.

9. **Webhook / endpoint integrity board.** Two HTML lists: webhooks (signed ✓ / unsigned ✗ / weak ⚠)
   and sensitive endpoints (validates caller ✓ / no auth ✗ / fail-open ⚠), using `ti-circle-check`,
   `ti-circle-x`, `ti-alert-triangle`.

10. **Score projection.** Chart.js line: headline score climbing across Today → This week → Continuous,
    plus a dashed reference line at the realistic ceiling (~9). Pairs with the "why not 10" note.

## Presentation flow
Lead with the textual report (prose). Then: scorecard → structure → strong points → weak points →
(data-access map / risk matrix / attack paths / integrity board as warranted) → correction pipeline →
projection. One sentence of context before each. Close by offering the two Markdown files (Phase 5).
