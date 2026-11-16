---
name: playgama-telemetria
description: Análise completa e extensiva da telemetria de um jogo na Playgama (via MCP do Developer Console), com relatório em português, auditoria do que falta instrumentar e sugestões de aprimoramento priorizadas. Use sempre que o usuário pedir para analisar dados, métricas, estatísticas, telemetria, desempenho, retenção, funil, anúncios, receita ou "como está indo" de um jogo da Playgama (Juice Sort, Hex Orders, Unbolt, Stackway etc.), comparar builds/versões, medir o efeito de uma atualização, ou perguntar o que falta medir no jogo — mesmo que não diga "telemetria" nem "relatório".
---

# Análise de telemetria Playgama

Objetivo: transformar a telemetria pré-agregada da Playgama em um relatório que um desenvolvedor solo consiga ler e agir — o que está acontecendo, por quê (com evidência), o que mudar primeiro e como medir se funcionou.

Esta skill só **lê**. Nunca chame ferramentas que publicam ou alteram algo (`publish_sandbox`, `send_playgama_catalog_update`, `update_application_form`, `start_*`, `replace_in_app_products`, `confirm_*`). Se a análise sugerir uma publicação, recomende no texto; quem decide é o desenvolvedor.

Escreva para o usuário em português do Brasil, horários em Brasília (UTC−3). Perguntas vão no texto da resposta — não abra caixas de pergunta/modais.

## 0. Preparar as ferramentas

As ferramentas do conector Playgama costumam estar adiadas. Carregue de uma vez só com ToolSearch (`select:` com a lista separada por vírgula) as que terminam em: `list_applications`, `get_application`, `get_publications`, `get_launch_steps`, `get_sandbox_traffic`, `list_moderation_comments`, `get_game_telemetry_guide`, `get_game_telemetry_analytics`, `get_game_telemetry_timeseries`, `get_game_telemetry_event_analytics`, `get_game_telemetry_session_facts`, `get_game_guides`, `get_game_checklist`, `get_bridge_sdk_docs`.

Leia `get_game_telemetry_guide` no início de cada análise: o contrato dos dados pode ter mudado (schema_version, campos novos).

## 1. Contexto do jogo (antes de qualquer número)

1. `list_applications` → ache o jogo pelo título (sem filtro no servidor; compare você mesmo).
2. `get_application` → anote: data de criação, `applicationTasks` (data de publicação no catálogo = `publishedAt`), `activeArchives`, lista de `archives` (nome = versão, `createdAt`, `loadingTime`, `initialSize`), idiomas, dispositivos, se tem compras.
3. `get_publications` → versão viva no catálogo e no sandbox, com datas.
4. `get_sandbox_traffic` e `list_moderation_comments` → campanhas de tráfego e histórico de moderação (explicam picos e o começo da série).

Monte uma **linha do tempo de versões** (versão → horário em que entrou no ar). Ela é a base de toda comparação antes/depois.

**Separe o tráfego de teste do tráfego real.** Antes da publicação no catálogo o tráfego é quase sempre o próprio desenvolvedor (poucos usuários, muitas sessões, payload alto). Analise o período desde o catálogo como principal e cite o anterior só como contexto.

## 2. Coleta (do geral para o específico)

Limites: cada chamada aceita no máximo 31 dias (datas inclusivas). Para períodos maiores, quebre em janelas. Não tente reconstruir eventos brutos; pegue só o que responde às perguntas do relatório.

1. **Visão geral** — `get_game_telemetry_analytics` (eventLimit 100) para: (a) vida inteira, (b) desde o catálogo. Guarde: inventário de eventos, sessões, usuários, duração (avg/p50/p95), `processed_at`.
2. **Série diária** — `get_game_telemetry_timeseries` 1d, total e para os eventos-chave: `core_initialization_started`, `advertisement_interstitial_opened`, `advertisement_interstitial_failed`, `advertisement_rewarded_rewarded`, `progression_completed`. Use 30m só se precisar ver o efeito de uma publicação no mesmo dia.
3. **Cada evento custom relevante** — `get_game_telemetry_event_analytics` sem `fieldName` (descobre campos e resumos numéricos) e, para campos categóricos que importam (`kind`, `reason`, `where`, `tip`, `error_code`, `game_version`...), de novo com `fieldName`.
4. **Performance** — `performance_sample` no período e por versão (`fieldName: game_version` mostra a cobertura por versão; para comparar valores, use janelas de datas em que uma versão dominava).
5. **Sequências** — `get_game_telemetry_session_facts` só para perguntas de ordem ("quem travou no nível X saiu depois?"). Comece com 20 sessões. Nunca filtre por `core_ping` nem `performance_sample`.

Rode chamadas independentes em paralelo. Dê uma linha de status ao usuário a cada bloco grande de coleta.

## 3. Frescor e atraso dos dados

- O dia corrente é parcial; os totais diários fecham por volta de 02:00 UTC (23:00 em Brasília). O atraso típico da telemetria é de ~20–40 min — confira `processed_at` e o último `last_event_at`.
- **Receita não existe no MCP.** Se o usuário der números de receita do console, use-os (eCPM estimado, receita por usuário) deixando claro o que é estimativa; o painel de receita costuma atrasar ~24h, então alinhe as janelas. Nunca invente receita.
- Para comparar builds, exija pelo menos 1 dia completo de cada versão no ar. Se não houver, diga que a comparação é preliminar.

## 4. Análise

Leia `references/metricas.md` para as fórmulas, referências de mercado/Playgama e limiares. Cubra, nesta ordem:

1. Tráfego e tendência (usuários/sessões por dia, crescimento).
2. Retenção (proxy de retorno; a Playgama não entrega D1/D7 prontos).
3. Funil de entrada (init → game_ready → tutorial → 30s → 60s).
4. Sessão (duração mediana; cauda de abas esquecidas).
5. Progressão e dificuldade (profundidade, conclusão, falhas, travamentos, abandonos, por tipo de nível).
6. Anúncios (intersticial e rewarded: volume, falha, por sessão/usuário, adesão ao rewarded vs. referência).
7. Performance (FPS, tempo de quadro, travadas).
8. Erros e estabilidade (js_error por código e versão, save, WebGL).
9. Comparação entre versões (o que a última atualização mudou).
10. **Auditoria de instrumentação pelos dados** — compare o inventário de eventos com `references/eventos-recomendados.md` (e com o plano de telemetria do jogo, se o usuário tiver um) e liste o que falta, o que está incompleto (ex.: evento sem `kind` ou `game_version`), campos com cobertura baixa, valores fora do vocabulário esperado e o que é ruído. Isso funciona só com o MCP.
11. **Auditoria do código (opcional, só se a pasta do jogo estiver acessível)** — o MCP não lê o código. Se o usuário der a pasta do jogo, confira também: se todos os eventos passam por um adaptador único; nomes e campos iguais ao plano; `game_version` em todos; nenhum evento duplicando o que a Bridge já registra; idioma via `bridge.platform.language`; nada de `localStorage`; `advertisement.interstitial.autoShow` na config da Bridge; onde `showInterstitial()` é chamado. Sem a pasta, diga no relatório que a auditoria foi feita só pelos dados.

Regras de leitura (do guia oficial — elas evitam conclusões erradas):
- `event_count` não é usuário nem sessão; use o denominador certo.
- Campo ausente ou `null` = indisponível, nunca zero.
- Menos de 30 sessões com amostra → diga que a conclusão não é confiável.
- A distribuição de `performance_sample` é por amostra, não por sessão; sessões longas pesam mais.
- As ferramentas não cruzam performance com progressão; não afirme correlação.
- Separe **evidência** de **hipótese**. Hipótese vai marcada como tal, com o dado que a confirmaria.

## 5. Recomendações

Cada sugestão precisa de: evidência (número + fonte), o que mudar, prioridade (impacto × esforço), a métrica que deve melhorar e como medir depois (qual evento, qual janela).

Antes de sugerir algo de anúncio, monetização ou UI, confira as regras com `get_game_checklist` / `get_game_guides` (página `monetization/best-practices`) e cite o número do item quando aplicável. Pontos que mais aparecem:
- Intersticial só em pausa lógica, nunca no meio ou no começo do jogo ativo (2.1.3); quem espaça é a Bridge — não sugerir timers próprios. Verifique também `advertisement.interstitial.autoShow` na config da Bridge.
- Rewarded opt-in, recusável, recompensa só se assistido até o fim, resgate no máximo 1× por tentativa (2.2.x).
- Todo pop-up precisa de X ou botão para fechar (1.6.5).
- Idioma só via `bridge.platform.language` (3.4.2); título no jogo igual ao do cadastro (3.5.1).

Ordene: o que mais pesa na receita e na retenção primeiro. Diga explicitamente o que **não** dá para concluir com os dados atuais e qual evento resolveria.

## 6. Relatório visual (padrão)

O relatório é entregue como **página HTML com gráficos, tabelas e esquemas**, gerada a partir de um JSON pelo template da skill. Leia `references/visuais.md` antes de montar o JSON: ele define a capa (`destaque`) e os blocos (`kpis` com minitendência, `area`, `linha`, `barras`, `barras_empilhadas`, `funil`, `segmentos`, `mapa_calor`, `metas`, `halteres`, `faixas`, `grade`, `esquema`, `linha_do_tempo`, `tabela`, `alerta`, `recomendacoes`, `texto`) e qual usar para cada pergunta. Parta de `assets/exemplo-dados.json`.

1. Monte `dados.json` seguindo o esqueleto abaixo; cada seção combina números de destaque, pelo menos um visual quando houver série ou comparação, e o texto de interpretação.
2. Rode `node <pasta-da-skill>/scripts/montar-relatorio.mjs dados.json relatorio-telemetria-<jogo>-<AAAA-MM-DD>.html` e corrija o que o script apontar.
3. Abra a página e olhe: o script valida a estrutura, não o layout.
4. Envie o HTML ao usuário e, na resposta, faça um resumo curto (5–8 linhas + prioridade nº 1) — o detalhe fica na página.

Visuais mínimos esperados: capa com `destaque` (o achado nº 1) e tendência de usuários/dia com marco da publicação; `kpis` com minitendências; `area` de usuários/dia; `mapa_calor` de sessões por dia × faixa de horas (série de 30 min agregada em horário de Brasília); `funil` de entrada; `faixas` de `step_index` por evento de progressão; `barras` por tipo de nível; `segmentos` de abandono por `where`; `barras_empilhadas` de intersticiais abertos × falhos por dia; `metas`; `halteres` entre versões; `linha_do_tempo`; `esquema` do plano; tabela de auditoria de telemetria; `recomendacoes`.

Se o usuário pedir só texto, ou o Node não estiver disponível, entregue em Markdown com tabelas no mesmo esqueleto.

### Esqueleto

Pule seções sem dados, dizendo por quê:

```
# Relatório de telemetria — <Jogo> (<período>)
Dados até <data/hora Brasília> · versão no ar <x> desde <data>

## Resumo (5–8 linhas: o que está bem, o que está mal, a prioridade nº 1)
## 1. Receita e frescor dos dados
## 2. Tráfego
## 3. Retenção
## 4. Funil de entrada
## 5. Progressão e dificuldade
## 6. Anúncios
## 7. Performance
## 8. Erros e estabilidade
## 9. Comparação entre versões
## 10. Auditoria de telemetria (falta / incompleto / ruído)
## 11. Recomendações priorizadas (tabela: prioridade, ação, evidência, métrica-alvo, como medir)
## 12. Limitações desta análise
```

Porcentagens com o denominador explícito na primeira menção ("75% dos níveis iniciados") e no máximo uma casa decimal. Gráficos mostram taxas quando o tráfego varia entre dias; contagens absolutas só para volume.
