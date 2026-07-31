# Exemplo completo (produto fictício)

Demonstração ponta a ponta com números inventados, para ilustrar o fluxo. Produto de exemplo: **um curso online genérico**.

## Passo 1 — Config e derivação

Respostas da entrevista:
- Moeda: BRL · Ticket bruto: R$ 197 · Líquido por venda: R$ 180 · Imposto sobre mídia: 12% · Valor do pixel: R$ 197 · Margem: 30%

Derivação:
```
CPA_empate    = 180 / 1,12       = R$ 160,71
ROAS_empate   = 197 / 160,71     = 1,23
CPA_saudavel  = 160,71 × 0,70    = R$ 112,50
ROAS_saudavel = 197 / 112,50     = 1,75
```

Faixas de ROAS resultantes: 🔴 < 1,23 · 🟡 1,23–1,75 · 🟢 1,75–2,28 · ⭐ > 2,28.

## Passo 2–3 — Dados e métricas de um anúncio em teste (vídeo)

Dados (janela de 5 dias, 4 já assentados): investido R$ 900 · impressões 30.000 · alcance 24.000 · cliques totais 1.050 · cliques no link 360 · vendas 6 · reproduções 3s 7.500 · thruplays 1.500.

Métricas:
```
CPM        = 900/30000×1000 = R$ 30,00
Frequência = 30000/24000    = 1,25
CTR total  = 1050/30000     = 3,50%
CTR link   = 360/30000      = 1,20%
CPC link   = 900/360        = R$ 2,50
Gancho 3s  = 7500/30000     = 25,0%
Retenção   = 1500/7500      = 20,0%
CPA        = 900/6          = R$ 150,00
ROAS       = 6×197/900      = 1,31
Conv. pág. = 6/360          = 1,67%
Lucro real = 6×180 − 900×1,12 = 1080 − 1008 = +R$ 72
```

## Passo 4–5 — Notas

Pontuação (funções de `pontuacao.md`):
- CPM 30,00 → **9,0** (< 35)
- Gancho 25,0% → **7,0** (limiar entre bom e excelente)
- CTR total 3,50% → **8,0**
- ROAS 1,31 → dentro de 🟡 (empate 1,23, saudável 1,75): 3 + (1,31−1,23)/(1,75−1,23)×3 = **3,5** → Resultado 3,5
- Frequência 1,25 → modificador **0**

Composição (vídeo):
```
Eficiência = média(CPM 9,0 · gancho 7,0) + 0 = 8,0
Fase: 6 vendas < 10 → teste → pesos R 0,25 · E 0,75
Nota geral = 3,5 × 0,25 + 8,0 × 0,75 = 0,875 + 6,0 = 6,9
```

## Passo 6 — Diagnósticos

- CTR de link 1,20% → 🟡 · CPC de link R$ 2,50 → 🟡 · Conversão de página 1,67% → 🔴 · Retenção 20% → 🟡 · Lucro real +R$ 72 → 🟢 · Confiança 6 vendas → 🔴
- Leitura: o criativo prende bem (gancho 25%, CTR 3,5%), mas a **conversão de página é baixa (1,67%)** — sinal de que o gargalo pode estar na página/oferta, não no anúncio. Como só há 6 vendas e 4 dias, ainda é cedo para concluir.

## Passo 7 — Veredito

Percorrendo a árvore: vendas ≠ 0; Eficiência 8,0 ≥ 3; **vendas 6 < 10 → AGUARDAR**. Justificativa: amostra insuficiente; os sinais estáveis são fortes, então vale deixar o teste amadurecer antes de julgar a economia. Não escalar, não pausar.

## Passo 9 — Blocos de saída

Bloco de config e `.md` de continuidade preenchidos conforme os templates de `wireframes.md`, registrando o snapshot do dia e o próximo ponto de checagem (ex.: revisar em 3 dias; observar se o ROAS cruza 1,23 e se a conversão de página sobe).

---

Observação: os números acima são fictícios e servem só para ilustrar o método. Em uma análise real, puxe os dados da conta (ou peça ao usuário) e siga exatamente os mesmos passos.
