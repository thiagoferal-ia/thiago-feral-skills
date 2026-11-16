# Playgama Telemetria — análise completa de um jogo na Playgama

Skill que lê a telemetria de um jogo publicado na **Playgama** pelo MCP do Developer Console e entrega um **relatório visual completo**: o que está acontecendo, por quê (com evidência), o que mudar primeiro e como medir se funcionou. Também audita a instrumentação: diz quais eventos faltam ou estão incompletos.

## O que ela faz
- **Monta o contexto antes dos números:** linha do tempo das versões, data de entrada no catálogo e separação entre tráfego de teste e tráfego real.
- **Analisa 10 blocos:**
  - tráfego;
  - retenção (estimada, porque a Playgama não entrega D1/D7 prontos);
  - funil de entrada e sessão;
  - progressão e dificuldade (níveis onde os jogadores falham, travam e abandonam);
  - anúncios (falha, cobertura e adesão ao rewarded comparada com a referência da Playgama);
  - performance (FPS, tempo de quadro, travadas);
  - erros e estabilidade;
  - comparação entre versões;
  - auditoria da telemetria.
- **Recomenda com evidência:** cada sugestão traz o número que a sustenta, a métrica que deve melhorar e o evento que vai medir. As regras da Playgama são conferidas e citadas pelo número do item.
- **Gera uma página HTML** com capa, menu de seções e gráficos interativos:
  - número de destaque, indicadores com minitendência;
  - área, linha, barras, barras empilhadas, funil afunilado, partes de um todo;
  - mapa de calor, metas, antes × depois, faixas p10–p90;
  - esquemas, linha do tempo e tabela de recomendações.

  Tem modo claro e escuro, funciona no celular, e todo gráfico tem tabela. As cores são testadas para daltonismo.
- **Só lê.** Nunca publica, atualiza ou altera o jogo.

## Estrutura
```
playgama-telemetria/
├── SKILL.md                        # o fluxo completo
├── references/
│   ├── metricas.md                 # fórmulas, referências e limiares
│   ├── eventos-recomendados.md     # instrumentação recomendada (base da auditoria)
│   └── visuais.md                  # formato do JSON do relatório e qual gráfico usar
├── assets/
│   ├── relatorio-template.html     # o modelo da página (sem dependências externas)
│   └── exemplo-dados.json          # exemplo completo com todos os tipos de bloco
└── scripts/
    └── montar-relatorio.mjs        # valida o JSON e gera o HTML (Node, sem dependências)
```

## Requisitos
- **MCP da Playgama** (Developer Console) conectado ao Claude.
- **Node.js 18+** para gerar a página. Sem Node, a skill entrega o relatório em Markdown.
- **Pasta do jogo (opcional):** com ela, a skill também confere no código como a telemetria foi implementada. Sem ela, a auditoria é feita só pelos dados.
- A receita não está no MCP. Se você informar os números do console, a skill estima eCPM e receita por usuário.

## Instalação (Claude Code)
```bash
git clone https://github.com/thiagoferal-ia/thiago-feral-skills.git
mkdir -p ~/.claude/skills
cp -r thiago-feral-skills/skills/playgama-telemetria ~/.claude/skills/
```
Abra uma nova sessão e peça, por exemplo: *"analisa a telemetria do meu jogo na Playgama"*.

## Exemplos de pedido
- "Como está indo o Juice Sort desde que entrou no catálogo?"
- "A última atualização melhorou alguma coisa? Compara as versões."
- "Onde os jogadores estão desistindo?"
- "O que falta medir no meu jogo?"

## Atualidade
As regras e referências foram conferidas em **16/11/2026** na documentação da Playgama (guia de telemetria, requisitos e boas práticas de monetização). A skill relê o guia de telemetria no início de cada análise.

Não é afiliada à Playgama.
