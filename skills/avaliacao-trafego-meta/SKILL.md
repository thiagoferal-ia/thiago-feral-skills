---
name: avaliacao-trafego-meta
description: >-
  Avalia o desempenho de campanhas, conjuntos e anúncios de VENDA DIRETA no Meta
  (Facebook/Instagram Ads), atribuindo nota de 0 a 10 e um veredito de ação —
  escalar, manter, aguardar ou pausar. Use SEMPRE que o usuário quiser avaliar ou
  dar score a anúncios/campanhas do Meta, decidir se deve escalar, pausar, manter
  ou reduzir uma campanha, entender ou interpretar métricas (ROAS, CPA, CPM, CTR,
  frequência, gancho, retenção), diagnosticar por que um anúncio vende pouco, ou
  comparar o desempenho de vários anúncios — mesmo que ele não peça a palavra
  score explicitamente. Funciona para qualquer produto e anunciante: coleta os
  números do negócio numa entrevista rápida e deriva os limiares de lucro
  automaticamente.
---

# Avaliação de Tráfego Meta — Score e Veredito (Venda Direta)

> **Créditos: Thiago Feral | Inteligência Artificial**

Esta skill transforma os números de uma campanha de venda direta no Meta em uma decisão clara. Para qualquer campanha, conjunto ou anúncio, ela produz uma **nota de 0 a 10** e um **veredito de ação** (Escalar / Manter / Aguardar / Pausar), fundamentado em regras explícitas — não em opinião.

O princípio que rege tudo: **nenhuma métrica decide sozinha, e a nota nunca manda mais que os guarda-corpos de segurança.** O score serve para *entender* a performance; o veredito serve para *agir*.

## Arquitetura: motor universal + config por operação

O que muda de um negócio para outro são os **números do negócio** (ticket, imposto, margem). O que é sempre igual é a **lógica** (como pontuar, quando escalar). Por isso a skill nunca usa valores fixos de lucro — ela **deriva** os limiares a partir de uma config coletada do usuário. Assim funciona para qualquer produto e qualquer anunciante.

## Escopo (importante)

Esta skill cobre **apenas campanhas de venda direta** (objetivo Vendas/Compras, com pixel de compra). Antes de rodar, confirme que é esse o caso. Se o objetivo for captura de lead, mensagem, instalação de app ou e-commerce com muitos produtos de ticket variável, avise o usuário que está fora do escopo e não force a análise — os limiares seriam inválidos.

---

## O fluxo (execute nesta ordem)

```
1.  CONFIG      — obter os números do negócio (entrevista) ou carregar um bloco salvo
1B. CALIBRAR    — quando há dados reais, ajustar as faixas de engajamento à distribuição da conta
2.  DADOS       — puxar as métricas no nível certo (anúncio/conjunto, nunca só campanha)
3.  CALCULAR    — derivar CPM, CTR, CPA, ROAS, conversão de página, retenção, etc.
4.  PONTUAR     — dar nota 0–10 a cada métrica pelas faixas (calibradas se houver; → semáforo)
5.  COMPOR      — Resultado + Eficiência → Nota geral (peso por fase)
6.  DIAGNÓSTICO — ler os faróis que não entram na nota mas mudam a decisão
7.  VEREDITO    — aplicar a árvore (guarda-corpos primeiro)
8.  TENDÊNCIA   — sobrepor direção + renderizar minigráficos (sparklines) quando há série temporal
8B. APROFUNDAR  — SEMPRE: funil de causa, padrões entre vencedores, realocação, projeção de escala (ver `references/analise-aprofundada.md`)
9.  ENTREGAR    — relatório + wireframes + bloco de config + .md de continuidade
```

---

## Passo 1 — Config da operação

Obtenha a config de um destes dois modos:

**Modo entrevista** (primeira vez). Faça estas perguntas, em linguagem simples (o usuário pode não ser gestor de tráfego). Uma pergunta por vez se ele preferir:

| Campo | Pergunta |
| --- | --- |
| `moeda` | Qual a moeda da conta? |
| `ticket_bruto` | Por quanto você vende o produto? |
| `liquido_por_venda` | Quanto você recebe líquido por venda, depois das taxas da plataforma/checkout? |
| `imposto_midia` | Há imposto ou taxa sobre o valor gasto em anúncios na sua região? Qual %? |
| `valor_pixel` | Que valor o pixel registra por compra? (Normalmente o ticket bruto.) |
| `margem_operacao` | Com quanta folga de lucro você quer operar? (Padrão: 30%.) |

Se o usuário não souber `imposto_midia`, assuma 0% e avise que o resultado real pode ser pior. Se não souber `valor_pixel`, assuma `ticket_bruto`.

**Modo config salva.** Se o usuário colar um bloco de config de uma sessão anterior, use-o e pule a entrevista.

### Derivação (o coração da skill)

A partir da config, calcule os limiares de lucro. **Nunca** use números de empate fixos — sempre derive:

```
CPA_empate    = liquido_por_venda / (1 + imposto_midia)
ROAS_empate   = valor_pixel / CPA_empate
CPA_saudavel  = CPA_empate * (1 - margem_operacao)
ROAS_saudavel = valor_pixel / CPA_saudavel
lucro_por_venda(CPA) = liquido_por_venda - (CPA * (1 + imposto_midia))
```

Exemplo genérico (curso online): ticket R$ 197, líquido R$ 180, imposto 12%, margem 30% →
`CPA_empate = 180/1,12 = R$ 160,71` · `ROAS_empate = 197/160,71 = 1,23` · `CPA_saudável = 160,71×0,70 = R$ 112,50` · `ROAS_saudável = 197/112,50 = 1,75`.

> Nota: a Meta reporta ROAS sobre o `valor_pixel`. Logo ROAS = valor_pixel / CPA — **ROAS e CPA são o mesmo eixo** e nunca são pontuados separadamente.

---

## Passo 1B — Calibração das faixas por conta (recalibração com dados reais)

As faixas universais de CPM, CTR e gancho (Passo 4) valem para um mercado médio. Mas cada conta tem sua própria realidade de custo e engajamento. Quando houver dados reais suficientes, **recalibre as faixas de engajamento para a distribuição da própria conta** — assim "CPM bom" passa a significar "bom para esta conta", não um número genérico. Quanto mais dados a conta acumula (mais sessões, mais anúncios), mais afiadas ficam as faixas.

**Só o engajamento é recalibrado (CPM, CTR total, gancho).** As faixas de Resultado (ROAS/CPA) continuam absolutas — vêm da economia (Passo 1); lucro é lucro, independentemente da distribuição da conta.

**Como calibrar:**
1. Reúna uma amostra de referência: os anúncios do mesmo produto (ou da conta) num período recente (ex.: 30–90 dias), cada um com ≥ 1.000 impressões. Se houver conector, puxe; senão, use os que o usuário fornecer ou o snapshot de um `.md` de continuidade.
2. Exija um mínimo de **~6 entidades**. Abaixo disso, **não calibre** — use as faixas universais padrão (a amostra seria ruído).
3. Calcule os quartis (Q1, mediana, Q3) de CPM, CTR total e gancho na amostra.
4. Defina as faixas relativas (fórmulas em `references/pontuacao.md`):
   - Métrica em que **maior é melhor** (CTR, gancho): 🔴 < Q1 · 🟡 Q1–mediana · 🟢 mediana–Q3 · ⭐ > Q3
   - Métrica em que **menor é melhor** (CPM): 🔴 > Q3 · 🟡 mediana–Q3 · 🟢 Q1–mediana · ⭐ < Q1
5. Salve as faixas calibradas no bloco de config, para reuso e para acompanhar como evoluem entre sessões.

**Aviso importante:** faixas calibradas dizem "bom **relativo à sua conta**", não "bom em termos absolutos". Uma conta inteira ruim ainda terá seus "melhores" anúncios — por isso o veredito nunca se apoia só na nota de engajamento; o Resultado (economia absoluta) e os guarda-corpos é que mandam.

---

## Passo 2 — Puxar os dados no nível certo

Se houver conector do Meta disponível, puxe os dados; senão, peça os números ao usuário ou use o calculador (references/wireframes.md).

**Regra de ouro:** decida no nível de **anúncio ou conjunto**, nunca só no de campanha. A nota de campanha é uma média que esconde um anúncio ruim puxando os bons. Sempre desça um nível antes de decidir.

Métricas a coletar: investido, impressões, alcance, frequência, cliques totais, cliques no link, compras (vendas), valor de conversão/ROAS, e — para vídeo — reproduções de 3s e thruplays.

---

## Passo 3 — Calcular as métricas derivadas

```
CPM               = investido / impressões * 1000
Frequência        = impressões / alcance
CTR total         = cliques_totais / impressões * 100
CTR de link       = cliques_no_link / impressões * 100
CPC de link       = investido / cliques_no_link
Gancho 3s         = reproduções_3s / impressões * 100        (só vídeo)
Retenção          = thruplays / reproduções_3s * 100          (só vídeo)
CPA               = investido / vendas
ROAS              = vendas * valor_pixel / investido
Conversão página  = vendas / cliques_no_link * 100
Lucro real        = vendas * liquido_por_venda - investido * (1 + imposto_midia)
```

---

## Passo 4 — Pontuar cada métrica (0–10 → semáforo)

Há duas classes de métrica.

> Se você calibrou as faixas no Passo 1B, use as **faixas calibradas** no lugar das universais abaixo para CPM, CTR e gancho. As universais são o padrão/fallback quando não há dados suficientes.

**Universais** (propriedades do leilão da Meta — as faixas não dependem do produto):

| Métrica | 🔴 0–3 | 🟡 4–6 | 🟢 7–8 | ⭐ 9–10 |
| --- | --- | --- | --- | --- |
| CPM (moeda local) | > 70 | 50–70 | 35–50 | < 35 |
| CTR total | < 1,5% | 1,5–2,5% | 2,5–3,5% | > 3,5% |
| Gancho 3s | < 15% | 15–25% | — | > 25% |

> Se a conta opera num mercado de CPM estruturalmente diferente, multiplique as faixas de CPM por um fator regional (pergunte o CPM médio histórico da conta). CTR e gancho não mudam entre mercados.

**Derivadas do negócio** (faixas calculadas no Passo 1):

| Métrica | 🔴 | 🟡 | 🟢 | ⭐ |
| --- | --- | --- | --- | --- |
| ROAS | < ROAS_empate | empate → saudável | saudável → saudável×1,3 | > saudável×1,3 |
| CPA | > CPA_empate | saudável → empate | saudável×0,72 → saudável | < saudável×0,72 |

As **funções exatas de pontuação** (interpolação dentro de cada faixa) estão em `references/pontuacao.md`. Consulte-as quando precisar de notas numéricas precisas; para uma leitura rápida, o semáforo já basta.

---

## Passo 5 — Compor a nota

**Resultado** = a nota do ROAS/CPA.

**Eficiência** = média dos sinais **estáveis** (que se firmam rápido e não dependem de volume de venda), conforme o formato do criativo:
- **Vídeo:** média de {nota CPM, nota Gancho}
- **Estático:** média de {nota CPM, nota CTR total}

CTR de link, conversão de página e retenção **não** entram na nota — são diagnósticos (Passo 6), para não contar a mesma coisa duas vezes.

**Frequência é modificador só para baixo** (nunca infla a nota — frequência baixa em anúncio jovem é só "ainda não repetiu", não qualidade):
- < 2,5 → sem efeito
- 2,5–3,5 → **−1,0** na Eficiência + alerta de saturação
- > 3,5 → **−2,5** na Eficiência + alerta de fadiga

**Nota geral = peso por fase**, definido pela amostra de vendas (sem venda confiável, apoie-se no criativo; com venda, no dinheiro):

| Fase | Vendas | Peso Resultado | Peso Eficiência |
| --- | --- | --- | --- |
| Teste | < 10 | 25% | 75% |
| Validação | 10–50 | 50% | 50% |
| Produção | ≥ 50 | 70% | 30% |

`Nota geral = Resultado × peso_R + Eficiência × peso_E`

---

## Passo 6 — Diagnósticos, atribuição e dados mínimos

**Diagnósticos** (semáforo, fora da nota, mas mudam a decisão):

| Diagnóstico | 🔴 | 🟡 | 🟢 |
| --- | --- | --- | --- |
| CTR de link | < 0,8% | 0,8–1,3% | > 1,3% |
| CPC de link (moeda local) | > 3 | 2–3 | < 2 |
| Conversão da página | < 2% | 2–4% | > 4% (‼ > 8% = atribuição inflada) |
| Retenção de vídeo | < 15% | 15–30% | > 30% |
| Lucro real | negativo | ~0 | positivo |
| Confiança (nº de vendas) | < 10 | 10–50 | ≥ 50 |

Leitura-chave: **CTR de link fraco = problema no anúncio; CTR de link bom mas conversão de página baixa = problema na página/oferta.** Separar os dois evita trocar a peça errada.

**Regras de atribuição (obrigatórias):**
- Só julgue dados com **≥ 3 dias de assentamento**. Os últimos 1–2 dias são provisórios (a janela de 7 dias/clique ainda atribui vendas retroativamente): olhe a tendência, não o valor absoluto, e nunca decida pausar/escalar por eles.
- **Conversão de página > ~8% é bandeira de atribuição inflada** (visualização entrando na conta), não motivo de comemoração. Cruze com a plataforma de vendas.
- **A plataforma de vendas é a fonte da verdade** (o extrato líquido de reembolso). O Gerenciador é bússola.

**Dados mínimos:**
- Não pontue CPM/CTR abaixo de **~1.000 impressões** — é ruído.
- Abaixo de **~10 vendas**, o Resultado é indicativo, não conclusivo (já refletido no peso por fase).

---

## Passo 7 — Veredito (a árvore; guarda-corpos primeiro)

Avalie na ordem — o **primeiro** que bater define o veredito:

1. **Vendas = 0 e investido ≥ ~3 × CPA_empate** → **PAUSAR** (stop-loss).
2. **Eficiência < 3** → **PAUSAR** (o leilão rejeitou o criativo: entrega cara/fraca).
3. **Vendas < 10** → **AGUARDAR** (amostra insuficiente; deixe amadurecer, olhe os sinais estáveis).
4. **ROAS < ROAS_empate e vendas ≥ 10** → **PAUSAR / REDUZIR** (abaixo do empate com dado suficiente: perde dinheiro).
5. **ROAS entre empate e saudável** → **MANTER / OTIMIZAR** (lucra, margem apertada).
6. **ROAS ≥ ROAS_saudável e vendas ≥ 50** → **ESCALAR** (subir verba 20–30% a cada 48–72h).
7. **ROAS ≥ ROAS_saudável e vendas 10–50** → **QUASE LÁ** (saudável, mas ainda aprendendo; continue antes de escalar forte).

Sempre acompanhe o veredito de uma justificativa em uma frase (qual regra decidiu).

---

## Passo 8 — Tendência (minigráficos + sobreposição no veredito)

A série temporal pode vir de três fontes: dias puxados via `time_increment` do conector, vários dias analisados no mesmo chat, ou a tabela de snapshot de um `.md` de continuidade colado pelo usuário.

**Quando houver ≥ 3 dias, renderize minigráficos de tendência (sparklines)** para as métricas-chave — ROAS, CPM, CPA e frequência — usando o template em `references/wireframes.md`. No sparkline de ROAS, marque a linha de empate (ROAS_empate) para leitura imediata. Os sparklines são parte da entrega quando há série; não os substitua por texto.

**Sobreponha a direção no veredito:**
- Métrica **subindo** rumo à faixa boa pode **adiantar** um veredito (ex.: "quase lá" → "escalar" com 3 dias de subida consistente).
- Métrica **caindo** dentro da faixa boa → segure a mão (um ROAS saudável em queda não é para escalar).
- Só considere "tendência" com **≥ 3 pontos (dias)** na mesma direção. Lembre da regra de atribuição: os últimos 1–2 dias são provisórios — pese a direção, não o valor absoluto deles.

Sem série temporal (só um retrato), pule os sparklines e siga com a análise pontual.

---

## Passo 8B — Análise aprofundada (SEMPRE)

Não pare no retrato. Toda análise entrega, além da tabela, as camadas que transformam diagnóstico em decisão — detalhadas em `references/analise-aprofundada.md`:

1. **Padrões entre os vencedores** (quando há lote): o que os criativos lucrativos têm em comum que os perdedores não têm — com **stress-test de atribuição** (padrão baseado em conversão de página na zona ‼️ pode ser artefato; validar na plataforma de vendas). Com poucos vencedores, são hipóteses direcionais, não leis.
2. **Funil de causa**: em qual degrau (gancho / retenção / ponte / página / entrega cara) o dinheiro vaza em cada criativo que importa, e a **ação específica** de cada tipo de vazamento.
3. **Realocação**: o que pausar (peso morto), o que continuar testando, o que concentrar — sem concentrar antes da maturidade.
4. **Projeção de escala** (para candidatos provados): quanto lucro ao escalar, em três cenários de ROAS, amarrada à economia unitária (o teto de escala é o lucro por venda).

Encerre sempre com os caveats (amostra, atribuição, teste vs. produção) e o próximo ponto de checagem.

---

## Passo 9 — Entregar

Produza, para cada entidade avaliada:

1. **Cabeçalho** — nome, nível, janela de dados, nº de dias assentados, config em uso, e **data + horário da análise** (com fuso).
2. **Wireframe detalhado** (funil completo com faróis) — renderize pelo template em `references/wireframes.md`.
3. **Wireframe de veredito** (Resultado / Eficiência / Nota geral + semáforo + veredito) — mesmo arquivo.
4. **Leitura em texto** — o "porquê" da nota e a ação recomendada.
5. **Tendência**, se houver histórico.
6. **Bloco de config** + **`.md` de continuidade** — templates em `references/wireframes.md`. O bloco de config permite reusar sem refazer a entrevista; o `.md` de continuidade guarda o snapshot desta sessão para alimentar a tendência na próxima. **O snapshot leva farol (🟢/🟡/🔴) em cada métrica, colunas financeiras (Investido, Faturamento, Lucro líquido), diagnósticos fixos que não pontuam mas guiam a decisão (Frequência = fadiga, Retenção de vídeo, Conversão de página), o `creative_id` de cada anúncio, e carimbo de data/horário** — versão heatmap em widget quando possível, ou markdown com marcadores 🟢🟡🔴 no texto. O `creative_id` é o identificador à prova de rótulo para decisões (promover/pausar), já que o nome do anúncio pode estar trocado.

Os wireframes no chat são parte da entrega — renderize-os com a ferramenta de visualização; não os substitua por texto.

Para um passo a passo completo já preenchido, veja `references/exemplo-completo.md`.

---

## Consulta rápida aos arquivos de apoio

- `references/pontuacao.md` — funções exatas de pontuação 0–10 por métrica (interpolação por faixa) e a lógica do calculador.
- `references/wireframes.md` — templates dos wireframes (farol detalhado, cartão de veredito, calculador interativo, **snapshot heatmap com farol por métrica**, sparklines de tendência) e dos blocos de config e continuidade.
- `references/analise-aprofundada.md` — o método das camadas de profundidade que toda análise entrega: funil de causa (taxonomia de vazamentos), padrões entre vencedores (com stress-test de atribuição), realocação e projeção de escala.
- `references/exemplo-completo.md` — um exemplo genérico ponta a ponta (produto fictício), do config ao veredito.

---

> Skill desenvolvida por **Thiago Feral | Inteligência Artificial**.
