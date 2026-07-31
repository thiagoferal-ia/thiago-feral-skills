# Funções de pontuação (0–10) e lógica do calculador

Use estas funções quando precisar de notas numéricas precisas (não só o semáforo). Todas retornam um valor entre 0 e 10. `F` é o fator regional de CPM (padrão `F = 1`).

## Métricas universais

**CPM** (menor é melhor):
```
se CPM < 35F:  nota = min(10, 8 + (35F − CPM) / (10F) × 2)
se 35F–50F:    nota = 6 + (50F − CPM) / (15F) × 2
se 50F–70F:    nota = 3 + (70F − CPM) / (20F) × 3
se CPM > 70F:  nota = max(0, 3 − (CPM − 70F) / (30F) × 3)
```

**CTR total** (%, maior é melhor):
```
se < 1,5:   nota = (CTR / 1,5) × 3
se 1,5–2,5: nota = 3 + (CTR − 1,5) / 1 × 3
se 2,5–3,5: nota = 6 + (CTR − 2,5) / 1 × 2
se > 3,5:   nota = min(10, 8 + (CTR − 3,5) / 1,5 × 2)
```

**Gancho 3s** (%, maior é melhor):
```
se < 15:   nota = (gancho / 15) × 4
se 15–25:  nota = 4 + (gancho − 15) / 10 × 3
se > 25:   nota = min(10, 7 + (gancho − 25) / 15 × 3)
```

## Métrica derivada do negócio

**ROAS** (maior é melhor). Sejam `E = ROAS_empate` e `S = ROAS_saudavel`:
```
se ROAS < E:        nota = max(0, (ROAS / E) × 3)
se E ≤ ROAS < S:    nota = 3 + (ROAS − E) / (S − E) × 3
se S ≤ ROAS < S×1,3: nota = 6 + (ROAS − S) / (S × 0,3) × 2
se ROAS ≥ S×1,3:    nota = min(10, 8 + (ROAS − S×1,3) / (S × 0,5) × 2)
```

O CPA é o mesmo eixo do ROAS (ROAS = valor_pixel / CPA); pontue via ROAS.

## Composição

```
Eficiência_bruta (vídeo)    = média(nota_CPM, nota_gancho)
Eficiência_bruta (estático) = média(nota_CPM, nota_CTR_total)

modificador_freq = 0        se frequência < 2,5
                 = −1,0      se 2,5 ≤ frequência ≤ 3,5
                 = −2,5      se frequência > 3,5

Eficiência = limitar(Eficiência_bruta + modificador_freq, 0, 10)
Resultado  = nota_ROAS

pesos por fase (pela contagem de vendas):
  < 10 vendas  → R 0,25 · E 0,75
  10–50 vendas → R 0,50 · E 0,50
  ≥ 50 vendas  → R 0,70 · E 0,30

Nota geral = Resultado × peso_R + Eficiência × peso_E
```

## Faixas parametrizadas (para calibração por conta)

As funções acima usam os cortes universais padrão. Quando as faixas são calibradas (Passo 1B do SKILL.md), use estas versões genéricas, passando os cortes calculados. Sejam `c1 < c2 < c3` os três cortes que separam as quatro faixas.

**Maior é melhor** (CTR, gancho) — c1 = 🔴/🟡, c2 = 🟡/🟢, c3 = 🟢/⭐:
```
se v < c1:       nota = limitar((v / c1) × 3, 0, 3)
se c1 ≤ v < c2:  nota = 3 + (v − c1) / (c2 − c1) × 3
se c2 ≤ v < c3:  nota = 6 + (v − c2) / (c3 − c2) × 2
se v ≥ c3:       nota = min(10, 8 + (v − c3) / (c3 − c2) × 2)
```

**Menor é melhor** (CPM) — c1 = ⭐/🟢, c2 = 🟢/🟡, c3 = 🟡/🔴:
```
se v < c1:       nota = min(10, 8 + (c1 − v) / (c2 − c1) × 2)
se c1 ≤ v < c2:  nota = 6 + (c2 − v) / (c2 − c1) × 2
se c2 ≤ v < c3:  nota = 3 + (c3 − v) / (c3 − c2) × 3
se v ≥ c3:       nota = max(0, 3 − (v − c3) / (c3 − c2) × 3)
```

Cortes universais padrão (fallback, sem calibração):
- CPM (menor é melhor): c1 = 35, c2 = 50, c3 = 70
- CTR total (maior é melhor): c1 = 1,5, c2 = 2,5, c3 = 3,5
- Gancho (maior é melhor): c1 = 15, c2 = 25, c3 = 35

## Calibração por conta (percentis)

Com uma amostra de **≥ ~6 entidades** (cada uma com ≥ 1.000 impressões), calcule Q1, mediana e Q3 de cada métrica de engajamento e defina os cortes:
- **Maior é melhor** (CTR, gancho): `c1 = Q1` · `c2 = mediana` · `c3 = Q3`
- **Menor é melhor** (CPM): `c1 = Q1` · `c2 = mediana` · `c3 = Q3` — aqui c1 é o melhor: abaixo de Q1 = ⭐, acima de Q3 = 🔴.

Abaixo de ~6 entidades, **não calibre**: use os cortes universais. **Recalibre sempre que a amostra crescer** (mais sessões, mais anúncios) — as faixas ficam mais afiadas com o tempo. As faixas de ROAS/CPA **nunca** são calibradas: vêm da economia (config).

## Cores do semáforo por nota

```
nota ≥ 7 → verde
nota 4–6,9 → amarelo
nota < 4 → vermelho
```

## Lógica do veredito (pseudocódigo)

```
se vendas == 0 e investido ≥ 3 × CPA_empate:  "Pausar"        (stop-loss)
senão se Eficiência < 3:                       "Pausar"        (criativo rejeitado)
senão se vendas < 10:                          "Aguardar"      (amostra insuficiente)
senão se ROAS < ROAS_empate:                   "Pausar/Reduzir"(perde dinheiro)
senão se ROAS < ROAS_saudavel:                 "Manter/Otimizar"
senão se vendas ≥ 50:                          "Escalar"
senão:                                         "Quase lá"      (saudável, aprendendo)
```

A tendência (quando houver ≥ 3 dias na mesma direção) pode adiantar "Quase lá" → "Escalar" na subida, ou segurar um veredito de escala na queda.
