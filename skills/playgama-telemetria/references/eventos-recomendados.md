# Instrumentação recomendada (referência para a auditoria)

Use esta lista para dizer o que falta no jogo. Adapte ao jogo: nem todo jogo tem baú, moeda ou subjogos — só cobre o que existe ou está planejado.

## Regras do contrato (guia oficial da Playgama)
- Nomes estáveis em `snake_case`; o que varia (nível, item, oferta) vai nos dados, nunca no nome.
- Valores categóricos com vocabulário fechado (ex.: `placement` ∈ {level_end, fail, restart, menu, resume}).
- Dados planos: string, número ou booleano.
- Sem dados pessoais, URLs, mensagens de erro, stack traces ou IDs de usuário.
- Não duplicar o que a Bridge já registra sozinha: sessão, `game_ready` e outras mensagens de plataforma, eventos de anúncio (opened/closed/failed/rewarded), compras.
- Um único adaptador no jogo envia tudo; `game_version` em **todos** os eventos custom.
- País não é exposto pela Bridge na Playgama; idioma sim (`bridge.platform.language`). Fuso horário do navegador serve como aproximação de região, só para estatística (nunca para escolher idioma — regra 3.4.2).

## Lista

| Área | Evento | Campos | Pergunta que responde |
|---|---|---|---|
| Contexto | `session_context` (1× por sessão, após init) | `language` (Bridge), `game_language` (aplicado), `device_type`, `os`, `orientation`, `timezone`, `audio_enabled`, `is_returning`, `game_version` | Quem joga, em que idioma/aparelho/região |
| Retenção | `return_visit` (1× por sessão) | `days_since_last` (0,1,2-3,4-7,8+), `sessions_total` (1,2,3-5,6-10,11+), `days_active` (faixas) | D1/D7 aproximados |
| Sessão | `session_summary` (ao ocultar a página, melhor esforço) | `levels_started`, `levels_completed`, `max_step_index`, `interstitials`, `rewarded`, `active_seconds` | Valor de uma sessão inteira |
| Navegação | `screen_view` | `screen` (home, level, map, shop, collection, themes, daily, chest, settings, subgame), `from` | Onde o jogador vai e onde sai |
| Progressão | `progression_started/completed/failed/abandoned/skipped`, `level_stuck` | sempre `step_index`, `kind`, `world`, `attempt`, `game_version`; em completed: `stars`, `moves`, `seconds`, `boosters_used`, `first_try` | Curva de dificuldade por tipo de nível |
| Onboarding | `tutorial_*`, `intro_shown`, `intro_closed` | `intro` (tipo de nível ou dica), `seconds`, `method` (button, x) | Se os avisos são lidos ou atrapalham |
| Anúncios | `ad_requested` | `type` (interstitial, rewarded), `placement`, `since_last_ad_s` (faixas) | Onde o anúncio aparece; causa de saídas |
| Rewarded | `rewarded_offer_shown`, `rewarded_offer_result` | `offer` (hint, extra_glass, skip, reveal, unfreeze, time, double_reward, daily_double, chest), `placement`, `result` (accepted, declined, ignored) | Adesão por oferta vs. 30–40% |
| Boosters | `booster_used` | `booster`, `source` (free, rewarded, coins, inventory), `step_index`, `kind` | Quais ajudas valem como recompensa |
| Economia | `currency_earned`, `currency_spent` | `currency`, `amount`, `source`/`sink` | Inflação, o que as pessoas compram |
| Baú / recompensas | `chest_progress`, `chest_opened` | `chest_type`, `keys`, `needed`, `source`, `reward_type` | Se o baú é entendido e usado |
| Metas | `daily_challenge_started/completed/failed`, `daily_gift_claimed` | `streak` (faixas), `stars`, `day_index`, `doubled` | Motivos para voltar |
| Coleção / temas | `collectible_obtained`, `set_completed`, `theme_unlocked`, `theme_equipped` | `set_id`, `item_id`, `rarity`, `source`, `theme_id` | Se a coleção prende |
| Subjogos | `subgame_unlocked/started/completed/abandoned` | `subgame_id`, `seconds`, `result` | Uso dos modos extras |
| Configurações | `settings_changed` | `setting` (sound, music, language, vibration), `value` | Quem silencia/troca idioma |
| Técnico | `boot_timing` | `ms_to_game_ready`, `ms_to_first_level` | Carregamento real dos jogadores |
| Técnico | `performance_sample` (já padrão) | + opcionais quando medidos de verdade: `long_task_*`, `memory_used_mb`, `asset_load_error_count` | Performance por aparelho |
| Técnico | `js_error`, `save_load_failed`, `webgl_context_lost` | + `screen`, `reason` (vocabulário fechado) | Onde o erro acontece |

## Também vale verificar no código
- Mensagens de plataforma recomendadas: `level_started`, `level_completed`, `level_failed`, `level_paused`, `level_resumed` via `platform.sendMessage` (outras plataformas parceiras usam).
- `advertisement.interstitial.autoShow` na config da Bridge: se listar uma mensagem de início de nível, a Bridge exibe intersticial no começo do nível.
