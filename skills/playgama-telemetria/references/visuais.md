# Relatório visual — formato dos dados

O relatório visual é um HTML único, sem dependências externas: capa com número de destaque e tendência, menu de seções fixo, gráficos SVG animados e interativos (detalhe ao passar o mouse ou focar com o teclado), "Ver tabela" em todo gráfico, modo claro/escuro e layout para celular. As cores seguem uma paleta testada para daltonismo. Você escreve só o JSON; o template desenha.

```
node <skill>/scripts/montar-relatorio.mjs dados.json relatorio.html
```

Um exemplo completo e testado, com todos os tipos de bloco, está em `assets/exemplo-dados.json` — use como ponto de partida. O script valida o JSON e aponta erros; corrija e rode de novo até sair `ok`.

## Estrutura

```json
{
  "titulo": "Juice Sort — relatório de telemetria",
  "titulo_curto": "Telemetria Juice Sort",
  "sobretitulo": "Playgama · catálogo",
  "subtitulo": "Período, frescor dos dados, observações",
  "etiquetas": ["v0.1.25 no ar", "490 usuários"],
  "destaque": { "rotulo": "...", "valor": "~3%", "contexto": "...", "tendencia": [..], "tendencia_x": [..], "rotulo_tendencia": "usuários por dia", "marcos": [{ "x": "13/11", "rotulo": "Catálogo" }] },
  "secoes": [ { "titulo": "Resumo", "intro": "texto opcional", "blocos": [] } ],
  "rodape": "Fonte e limitações"
}
```

- `titulo_curto` vira o título da aba: 2 a 4 palavras.
- `destaque` é o número principal do relatório (um só): o achado mais importante, não o mais bonito.

## Blocos

Todo bloco com gráfico aceita `titulo`, `subtitulo` e `nota`.

| `tipo` | Para quê | Campos |
|---|---|---|
| `texto` | parágrafos e listas | `md` (`**negrito**`, `` `código` ``, listas `- ` / `1. `) |
| `kpis` | números de destaque com minitendência | `itens`: `{rotulo, valor, delta?, direcao?: up\|down\|neutral, bom?, nota?, tendencia?: [n], formato_tendencia?}` |
| `alerta` | conclusão, risco, hipótese | `nivel`: `bom`, `atencao`, `critico`, `info`; `titulo`, `md`, `rotulo?` (ex.: "Hipótese") |
| `grade` | colocar blocos lado a lado (vira coluna única no celular) | `colunas` (2 ou 3), `blocos` |
| `linha` | tendência de várias séries | `x`, `series: [{nome, valores}]` (`null` = sem dado), `formato`, `unidade?`, `y_min?`, `y_max?`, `marcos?: [{x, rotulo}]`, `destacar?: "nome da série"` (as outras ficam cinza), `suave?: false` |
| `area` | tendência de uma série, com preenchimento | mesmos campos de `linha` |
| `barras` | comparar categorias | `categorias`, `series`, `orientacao`: `h` (padrão) ou `v`, `formato`, `rotulos?` |
| `barras_empilhadas` | composição por categoria (abertos × falhos por dia) | igual a `barras` + `percentual?: true` (cada barra soma 100%) |
| `funil` | etapas que perdem gente | `etapas: [{rotulo, valor}]` — desenha o funil afunilado com a perda entre etapas |
| `segmentos` | um todo dividido em até 6 partes | `partes: [{rotulo, valor}]` |
| `mapa_calor` | grade de intensidade (dia × hora, nível × evento) | `linhas`, `colunas`, `valores` (matriz; `null` = sem dado, fica cinza), `formato`, `unidade?`, `min?`, `max?`, `rotulos?` |
| `metas` | onde está cada métrica em relação à meta | `itens: [{rotulo, valor, meta?, maximo?, formato?, menor_melhor?, nota?}]` |
| `halteres` | antes × depois por métrica (versões, períodos) | `rotulos_series: ["antes", "depois"]`, `itens: [{rotulo, antes, depois, menor_melhor?}]`, `formato` |
| `faixas` | distribuição (p10–mediana–p90) por linha | `itens: [{rotulo, p10, p50, p90, min?, max?}]`, `formato`, `rotulo_faixa?`, `rotulo_centro?` |
| `tabela` | números exatos | `colunas`, `linhas`, `alinhar?` (`l`/`r`) |
| `esquema` | processo, plano, ciclo de jogo | `etapas: [{rotulo, detalhe?, status?, status_texto?, seta?}]`, `numerar?: false` |
| `linha_do_tempo` | versões, campanhas, eventos | `itens: [{quando, oque, detalhe?, status?}]` |
| `recomendacoes` | ações priorizadas | `itens: [{prioridade, acao, evidencia, metrica, como_medir}]` |

`formato`: `int` (padrão), `dec`, `pct` (valores já em 0–100), `usd`, `seg`, `ms`.
`status`: `bom`, `atencao`, `critico`, `info` — sempre com ícone e palavra, nunca só cor.

## Qual visual usar

| Pergunta | Visual |
|---|---|
| Qual é o número que mais importa? | `destaque` na capa |
| Como estão os indicadores principais? | `kpis` com `tendencia` |
| Como evoluiu no tempo? | `area` (uma série) ou `linha` (várias); `marcos` para publicações e versões |
| Uma série importa mais que as outras? | `linha` com `destacar` |
| Em que horário/dia as pessoas jogam? | `mapa_calor` dia × faixa de horas |
| Onde as pessoas desistem? | `funil` |
| Em que nível as coisas acontecem? | `faixas` com p10/p50/p90 de `step_index` |
| Qual categoria é maior? | `barras` horizontal, do maior para o menor; cauda vira "Outros" |
| Do que é feito cada total? | `barras_empilhadas` |
| Como se divide um todo? | `segmentos` (até 6 partes) |
| Estamos perto da meta? | `metas` |
| A versão nova melhorou? | `halteres` |
| Qual o plano / o fluxo? | `esquema`; histórico em `linha_do_tempo` |

Regras que mantêm o relatório honesto:
- Duas medidas de escalas diferentes → dois gráficos, nunca dois eixos.
- Taxas quando o tráfego varia entre dias; contagens só para volume.
- No máximo 8 séries por gráfico; partes de um todo, no máximo 6.
- Não há pizza nem rosca: comparam pior que barras. Use `segmentos` ou `barras`.
- Dia parcial sempre marcado (ex.: `16/11*`) e explicado na `nota`.

## Entrega

1. Gere `relatorio-telemetria-<jogo>-<AAAA-MM-DD>.html` na pasta de trabalho.
2. Abra para conferir. Se o painel do navegador estiver disponível, sirva o arquivo por um servidor local e rode no console um teste de sobreposição de textos (comparar `getBBox()` dos `<text>` de cada `svg`) no tamanho de computador e de celular (375 px).
3. Envie o arquivo ao usuário para visualizar (SendUserFile com `display: render`, quando disponível).
4. Ofereça em uma linha publicar como página (Artifact privado) se ele quiser compartilhar. Para publicar, siga as regras do Artifact (carregar `artifact-design` antes).
