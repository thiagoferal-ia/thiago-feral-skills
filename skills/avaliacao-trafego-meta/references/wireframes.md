# Wireframes e blocos de saída

Renderize os wireframes com a ferramenta de visualização (widgets inline no chat). Use variáveis de CSS do tema (`var(--surface-1)`, `var(--text-secondary)`, `var(--bg-success)`, etc.) para funcionar em modo claro e escuro. Cores do semáforo: verde = `--bg-success`/`--text-success`, amarelo = `--bg-warning`/`--text-warning`, vermelho = `--bg-danger`/`--text-danger`.

Substitua os valores entre `[colchetes]` pelos dados reais. Os limiares de cor vêm da config (Passo 1 do SKILL.md) e das faixas (Passo 4).

---

## 1. Farol detalhado (funil completo)

Tabela com as métricas agrupadas por etapa do funil, cada uma com um chip colorido pela faixa. Uma coluna por entidade (dá para comparar 2–3 lado a lado).

Seções e métricas (nesta ordem):
- **Entrega:** Investido, Impressões, Alcance, CPM (chip), Frequência (chip)
- **Engajamento:** Gancho 3s (chip), Retenção (chip), CTR total (chip)
- **Tráfego:** Cliques no link, CTR de link (chip), CPC de link (chip)
- **Conversão:** Vendas, Conversão da página (chip), CPA (chip), ROAS (chip)
- **Dinheiro & confiança:** Lucro real (chip), Confiança/nº de vendas (chip), Nota geral (chip grande), Veredito (chip)

Esqueleto HTML (adapte as linhas e cores):
```html
<style>
.fd{width:100%;border-collapse:collapse;font-size:14px}
.fd td,.fd th{padding:7px 10px;border-bottom:0.5px solid var(--border)}
.fd .sec td{background:var(--surface-1);font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.04em}
.fd .v{text-align:right;font-variant-numeric:tabular-nums}
.chip{display:inline-block;padding:2px 8px;border-radius:var(--radius);font-weight:500;font-size:13px}
.g{background:var(--bg-success);color:var(--text-success)}
.y{background:var(--bg-warning);color:var(--text-warning)}
.r{background:var(--bg-danger);color:var(--text-danger)}
</style>
<table class="fd">
  <thead><tr><th>Métrica</th><th class="v">[Entidade A]</th></tr></thead>
  <tbody>
    <tr class="sec"><td colspan="2">Entrega</td></tr>
    <tr><td>Investido</td><td class="v">[valor]</td></tr>
    <tr><td>CPM</td><td class="v"><span class="chip [g|y|r]">[valor]</span></td></tr>
    <!-- ...demais seções... -->
    <tr><td>Nota geral</td><td class="v"><span class="chip [g|y|r]" style="font-size:15px">[nota]</span></td></tr>
    <tr><td>Veredito</td><td class="v"><span class="chip [g|y|r]">[veredito]</span></td></tr>
  </tbody>
</table>
```

---

## 2. Cartão de veredito (resumo)

Linha por entidade com Resultado, Eficiência, Nota geral (destacada) e o veredito em badge. Bom para uma visão geral de várias entidades de uma vez.

```html
<style>
.sc{width:100%;border-collapse:collapse;font-size:14px}
.sc th,.sc td{padding:10px;border-bottom:0.5px solid var(--border)}
.pill{display:inline-block;min-width:34px;text-align:center;padding:3px 8px;border-radius:var(--radius);font-weight:500}
.big{font-size:18px;padding:5px 10px}
.vb{display:inline-block;padding:4px 10px;border-radius:var(--radius);font-size:12px;font-weight:500}
.g{background:var(--bg-success);color:var(--text-success)}.y{background:var(--bg-warning);color:var(--text-warning)}.r{background:var(--bg-danger);color:var(--text-danger)}
</style>
<table class="sc">
<thead><tr><th>Item</th><th>Resultado</th><th>Eficiência</th><th>Nota geral</th><th>Veredito</th></tr></thead>
<tbody>
<tr>
  <td>[nome]<br><span style="color:var(--text-muted);font-size:12px">[vendas · fase]</span></td>
  <td><span class="pill [g|y|r]">[R]</span></td>
  <td><span class="pill [g|y|r]">[E]</span></td>
  <td><span class="pill big [g|y|r]">[nota]</span></td>
  <td><span class="vb [g|y|r]">[veredito]</span></td>
</tr>
</tbody>
</table>
```

---

## 3. Calculador interativo

Ferramenta em que o usuário digita os números de qualquer anúncio e recebe métricas, notas e veredito na hora. Renderize como widget HTML. **Parametrize as constantes com a config**: substitua `NET`, `TAX`, `GROSS`, `ROAS_EMP`, `ROAS_SAU`, `CPA_EMP` pelos valores derivados no Passo 1.

Campos de entrada: Investido, Impressões, Alcance, Cliques no link, Vendas, Reproduções 3s (vídeo), Thruplays (vídeo).

Miolo do script (as funções de pontuação estão em `pontuacao.md`; a lógica de veredito também). Estrutura:
```javascript
var NET=[liquido], TAX=[1+imposto], GROSS=[valor_pixel];
var ROAS_EMP=[roas_empate], ROAS_SAU=[roas_saudavel], CPA_EMP=[cpa_empate];
// ler inputs -> calcular métricas (Passo 3 do SKILL.md)
// pontuar (funções de pontuacao.md, com ROAS_EMP/ROAS_SAU nas faixas de ROAS)
// Eficiência = média(CPM, gancho) + modificador de frequência
// pesos por fase pela contagem de vendas -> Nota geral
// veredito pela árvore (pontuacao.md), usando CPA_EMP no stop-loss (3×CPA_EMP)
// renderizar: chips de métrica + 3 notas + badge de veredito com justificativa
```
Pré-preencha os campos com um exemplo para o widget já renderizar algo ao abrir. Formate números com arredondamento (evita dízimas). Mantenha fundo transparente e sem `position: fixed`.

---

## 4. Bloco de config (para reusar sem refazer a entrevista)

Ao final, ofereça este bloco para o usuário salvar:
```markdown
# Config da operação — [nome do produto]
- Moeda: [ex. BRL]
- Ticket bruto: [valor]
- Líquido por venda: [valor]
- Imposto sobre mídia: [%]
- Valor do pixel por compra: [valor]
- Margem de operação: [%]
- Derivados: CPA_empate [valor] · ROAS_empate [valor] · CPA_saudável [valor] · ROAS_saudável [valor]
- Faixas de engajamento: [universais | calibradas em dd/mm com N anúncios]
  - Se calibradas — CPM (⭐<[Q1] 🟢[Q1–med] 🟡[med–Q3] 🔴>[Q3]) · CTR (Q1/med/Q3: [..]) · Gancho (Q1/med/Q3: [..])
```

---

## 5. `.md` de continuidade (memória entre sessões — alimenta a tendência)

Gere ao final de cada análise. Numa próxima sessão, o usuário cola de volta e a skill recupera a tendência sem reprocessar.

**O snapshot leva farol em CADA métrica e inclui as colunas financeiras + diagnósticos + o `creative_id`.** Em arquivo `.md`, use os marcadores 🟢 (bom) · 🟡 (atenção) · 🔴 (ruim) antes de cada valor. As cores de CPM, gancho e CTR usam as faixas de engajamento (calibradas se houver; Passo 1B); CPA e ROAS usam a economia (empate/saudável); Lucro líquido é 🟢 se positivo / 🔴 se negativo; Vendas usa a confiança (< 10 🔴 · 10–50 🟡 · ≥ 50 🟢). Regra de cor por banda: ⭐/🟢 → 🟢 · 🟡 → 🟡 · 🔴 → 🔴. Colunas financeiras: **Investido** (gasto de mídia do Gerenciador), **Faturamento** (vendas × ticket bruto), **Lucro líquido** (vendas × líquido − investido × (1+imposto)).

Diagnósticos fixos na tabela (não pontuam, mas guiam a decisão): **Freq** (frequência — 🟢<2,5 · 🟡2,5–3,5 · 🔴>3,5; sinal de fadiga/saturação), **Reten** (retenção de vídeo = thruplay÷gancho — 🔴<15% · 🟡15–30% · 🟢>30%), **Conv.pág** (conversão de página = vendas÷cliques no link — 🔴<2% · 🟡2–4% · 🟢>4%, com ‼️ acima de 8% = atribuição possivelmente inflada). O **`creative_id`** vai como última coluna — é o identificador à prova de rótulo (o nome do anúncio pode estar trocado; o creative_id não). O CTR de link é opcional na tabela principal (puxe no farol detalhado quando for decidir sobre um criativo específico).

```markdown
# Continuidade — [nome do anúncio/conjunto] — [data e horário]
- Nível: [anúncio/conjunto/campanha] · ID: [id]
- Janela avaliada: [datas] · dias assentados: [n]
- Fase: [teste/validação/produção] · vendas acumuladas: [n]

## Snapshot desta sessão (farol por métrica) — [dd/mm/aaaa hh:mm fuso]
| # | Investido | Vd | Faturam. | Lucro líq. | Freq | CPM | Gancho | Reten | CTR | Conv.pág | CPA | ROAS | Nota | Veredito | creative_id |
|---|-----------|----|----------|------------|------|-----|--------|-------|-----|----------|-----|------|------|----------|-------------|
| [nome] | R$ [v] | [n] | R$ [v] | 🟢 +R$ [v] | 🟢 [v] | 🟢 [v] | 🟢 [v] | 🟡 [v] | 🟡 [v] | 🟢 [v] | 🟢 [v] | 🟢 [v] | 🟢 [n] | 🟡 [veredito] | [creative_id] |
| **TOTAIS** | **R$ [soma]** | **[soma]** | **R$ [soma]** | **[soma]** | [média] | [CPM pond.] | [gancho pond.] | [reten pond.] | [CTR pond.] | [conv pond.] | [CPA pond.] | [ROAS pond.] | — | — | — |

Linha de totais: some Investido/Vendas/Faturamento/Lucro; as métricas de taxa vão **ponderadas** (CPM = gasto total ÷ impressões totais × 1000; ROAS = faturamento ÷ gasto; CPA = gasto ÷ vendas; gancho/CTR/conv = eventos totais ÷ base total). Avise quando a média mascarar a distribuição (ex.: CPM médio "bom" porque peças baratas de alto volume puxam a média, escondendo criativos caros).

## Tendência observada
- ROAS: [subindo/estável/caindo] · CPM: [subindo/estável/caindo] · Frequência: [valor] — [ok/vigiar/fadiga]

## Decisão e próximo ponto de checagem
- Ação: [...] · Revisar em: [data] · O que observar: [...]
```

---

## 6. Minigráficos de tendência (sparklines)

Quando houver série temporal (**≥ 3 dias**), renderize pequenos gráficos de linha para as métricas-chave — ROAS, CPM, CPA e frequência — lado a lado. No de ROAS, inclua a linha de empate (`ROAS_empate` da config) para leitura imediata. Altura pequena (~110px), rótulos mínimos, um `canvas` por métrica. Marque visualmente que os últimos 1–2 pontos são provisórios (atribuição não assentada) — ex.: último ponto com marcador vazado ou nota no rótulo.

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px">
  <div><div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">ROAS</div>
    <div style="position:relative;height:110px"><canvas id="spROAS" role="img" aria-label="Tendência de ROAS por dia com linha de empate">[valores]</canvas></div></div>
  <div><div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">CPM</div>
    <div style="position:relative;height:110px"><canvas id="spCPM" role="img" aria-label="Tendência de CPM por dia">[valores]</canvas></div></div>
  <div><div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">Frequência</div>
    <div style="position:relative;height:110px"><canvas id="spFreq" role="img" aria-label="Tendência de frequência por dia">[valores]</canvas></div></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
var dias=[/* rótulos dd/mm */], roas=[/* série */], empate=[ROAS_empate];
function spark(id, serie, cor, refLinha){
  var ds=[{data:serie,borderColor:cor,backgroundColor:cor,borderWidth:2,pointRadius:2,tension:0.3}];
  if(refLinha!=null){ds.push({data:serie.map(function(){return refLinha}),borderColor:'#d03b3b',borderDash:[5,4],borderWidth:1.5,pointRadius:0});}
  new Chart(document.getElementById(id),{type:'line',data:{labels:dias,datasets:ds},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
    scales:{x:{ticks:{maxRotation:0,color:'#898781',font:{size:10}},grid:{display:false}},
    y:{ticks:{color:'#898781',font:{size:10}},grid:{color:'rgba(137,135,129,0.2)'}}}}});
}
spark('spROAS', roas, '#2a78d6', empate);   // ROAS com linha de empate
// spark('spCPM', cpm, '#eda100', null);
// spark('spFreq', freq, '#1baf7a', null);
</script>
```

Interprete os sparklines junto do veredito (Passo 8 do SKILL.md): direção consistente por ≥ 3 dias pode adiantar ou segurar a decisão; nunca decida pela inclinação dos últimos 1–2 dias provisórios.

---

## 7. Snapshot com faróis por métrica (heatmap)

Quando puder renderizar widget, apresente o snapshot como uma tabela onde **cada célula de métrica é colorida pela sua faixa** (verde/amarelo/vermelho). É a versão visual do snapshot da seção 5 — vários criativos de uma vez, com o farol em cada métrica. Ordene por Nota geral (desc). Colunas típicas: Criativo · Vendas · CPM · Gancho · CTR · CPA · ROAS · Nota · Veredito.

Regras de cor (idênticas às do snapshot em texto): CPM/gancho/CTR pelas faixas de engajamento (calibradas se houver); CPA/ROAS pela economia; Lucro líquido 🟢 positivo / 🔴 negativo; Freq/Reten/Conv.pág pelos limiares de diagnóstico; Vendas pela confiança. Banda ⭐/🟢 → verde, 🟡 → amarelo, 🔴 → vermelho. Colunas: Criativo · Investido · Vendas · Faturamento · Lucro líquido · Freq · CPM · Gancho · Reten · CTR · Conv.pág · CPA · ROAS · Nota · Veredito · creative_id (última coluna, sem cor — identificador à prova de rótulo).

```html
<style>
.hm{width:100%;border-collapse:collapse;font-size:12.5px}
.hm th{padding:7px 6px;border-bottom:0.5px solid var(--border);color:var(--text-secondary);font-weight:400;font-size:11.5px;text-align:center}
.hm th.l,.hm td.l{text-align:left}
.hm td{padding:6px;border-bottom:2px solid var(--surface-0);text-align:center;font-variant-numeric:tabular-nums;border-radius:3px}
.g{background:var(--bg-success);color:var(--text-success);font-weight:500}
.y{background:var(--bg-warning);color:var(--text-warning);font-weight:500}
.r{background:var(--bg-danger);color:var(--text-danger);font-weight:500}
</style>
<div style="overflow-x:auto">
<table class="hm">
<thead><tr><th class="l">Criativo</th><th>Vendas</th><th>CPM</th><th>Gancho</th><th>CTR</th><th>CPA</th><th>ROAS</th><th>Nota</th><th class="l">Veredito</th></tr></thead>
<tbody>
<tr><td class="l" style="font-weight:500">[nome]</td><td class="[g|y|r]">[n]</td><td class="[g|y|r]">[CPM]</td><td class="[g|y|r]">[gancho]</td><td class="[g|y|r]">[CTR]</td><td class="[g|y|r]">[CPA]</td><td class="[g|y|r]">[ROAS]</td><td class="[g|y|r]">[nota]</td><td class="l [g|y|r]">[veredito]</td></tr>
<!-- ...uma linha por criativo, ordenadas por nota... -->
</tbody>
</table>
</div>
<div style="display:flex;gap:14px;margin-top:10px;font-size:12px;color:var(--text-secondary)">
  <span>🟢 bom</span><span>🟡 atenção</span><span>🔴 ruim</span>
</div>
```

Fallback em texto (quando o widget não renderizar): use a tabela markdown com os marcadores 🟢🟡🔴 antes de cada valor, exatamente como no snapshot da seção 5.
