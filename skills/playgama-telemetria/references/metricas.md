# Métricas, fórmulas e referências

Use o denominador indicado. Quando um evento não existir no jogo, a métrica fica "indisponível" e entra na auditoria de telemetria.

## Tráfego
- Usuários/dia e sessões/dia: `get_game_telemetry_timeseries` 1d (total). O dia corrente é parcial — projete só se disser que é projeção.
- Sessões por usuário no período = `unique_sessions / unique_users` da visão geral.

## Retenção (proxy)
A Playgama não entrega D1/D7. Duas aproximações:
1. **Sobreposição diária**: soma dos usuários únicos de cada dia (série 1d) − usuários únicos do período inteiro = número máximo de "usuário-dias" de retorno. Retorno ≈ esse número ÷ usuários únicos do período. Funciona bem para janelas curtas (3–7 dias).
2. **Sinais de retorno**: eventos que só quem volta dispara (presente diário, sequência do desafio diário, `return_visit` se existir).
Se o jogo tiver `return_visit` com `days_since_last`, use a distribuição dele — é a medida mais direta.

Referência casual web (orientativa): D1 de 20–30% é saudável; abaixo de 10% indica que falta motivo para voltar.

## Funil de entrada (sessões)
`core_initialization_started` → `platform_message_game_ready` → `tutorial_started` → `tutorial_completed` → `gameplay_30s` → `gameplay_60s`.
- Taxas de 30s/60s: dividir por sessões com `game_ready`.
- Tutorial: concluídos ÷ iniciados; olhe `tutorial_abandoned` (pours/segundos) para saber se saíram antes de interagir.

## Sessão
- Use a mediana (p50) como "sessão típica". A média é distorcida por abas abertas por horas (veja `max_duration_seconds`).
- p95 alto com mediana baixa = poucos jogadores muito engajados + maioria rápida.

## Progressão e dificuldade
- Conclusão por início = `progression_completed` ÷ `progression_started` (eventos).
- Profundidade: percentis de `step_index` em `progression_started` (p50 = até onde o jogador mediano chega; p90 = os 10% mais engajados).
- Pontos de dor: faixas de `step_index` em `progression_failed`, `level_stuck`, `progression_abandoned`; `attempt` alto = nível difícil.
- Abandono: campo `where` (ex.: `hidden` = saiu da aba/site, `home` = voltou ao menu) e `moves` (0 movimentos = saiu antes de jogar — investigar o que aparece no início do nível).
- Distribuição por tipo (`kind`) em `progression_started`; se o evento de conclusão/falha não tiver `kind`, registre na auditoria.
- `stars`, `moves`, `seconds` em `progression_completed`: medianas por faixa de nível indicam a curva.

## Anúncios (eventos padrão da Bridge)
- Intersticial: abertos, fechados, falhos. **Taxa de falha** = `failed ÷ (opened + failed)`. Acima de ~15% é perda relevante de receita.
- Cobertura = sessões com intersticial aberto ÷ sessões. Intensidade = abertos ÷ sessões que viram algum.
- Rewarded: `opened`, `rewarded` (completou), `failed`. Conclusão = `rewarded ÷ opened`.
- **Adesão ao rewarded** = usuários com `rewarded_opened` ÷ usuários. Referência Playgama: **30–40% dos jogadores**; **3–5 rewarded por sessão média** em projetos bem-sucedidos.
- Espaçamento do intersticial é definido pela Bridge (tipicamente 120–240 s). Não recomendar contadores próprios.
- Placement (onde o anúncio foi pedido) não vem nos eventos padrão — só com evento custom `ad_requested`.

## Receita (só com números fornecidos pelo usuário)
- eCPM estimado = receita ÷ (intersticiais abertos + rewarded completos) × 1000, na mesma janela da receita.
- Receita por usuário = receita ÷ usuários únicos da janela.
- Lembre o atraso do painel de receita (~24h): alinhe a janela de telemetria ao último dia que a receita cobre.

## Performance (`performance_sample`)
- `fps_avg` e `fps_p10`: veja p10 da distribuição (as 10% piores amostras). p10 ≤ 30 com meta 60 = parcela relevante em aparelhos fracos/economia de bateria.
- `frame_time_p95_ms`: p90 da distribuição acima de ~33 ms indica engasgos frequentes.
- `frames_over_250ms/500ms/1000ms` > 0 = travadas visíveis.
- `js_error_count` com máximo alto numa janela = erro em loop numa sessão.
- Confiabilidade: precisa de ≥ 30 sessões únicas com amostra.
- `window_ms` muito maior que `active_ms` é esperado (pausas/aba oculta excluídas).

## Erros e estabilidade
- `js_error`: agrupe por `error_code` e `game_version`; conte usuários afetados, não eventos.
- `save_load_failed` ÷ sessões; `webgl_context_lost`; `unhandled_rejection_count` nas amostras.
- Um evento que só aparece a partir de certa data provavelmente foi instrumentado naquela versão — não conclua que a versão anterior não tinha o erro.

## Comparação entre versões
- Janela = dias completos em que a versão era a dominante (confirme com `performance_sample` → `game_version`).
- Compare taxas, nunca contagens absolutas (o tráfego varia por dia).
- Mínimo: 1 dia completo por versão; marque como preliminar se tiver menos.

## Confiabilidade
- < 30 sessões: "não confiável". 30–100: "indicativo". > 100: "razoável".
- Diferenças entre versões menores que ~5 pontos percentuais com < 200 sessões por lado: provavelmente ruído.
