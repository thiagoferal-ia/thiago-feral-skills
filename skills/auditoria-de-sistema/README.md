# Auditoria de Sistema — segurança e prontidão, com prova

Skill que responde, com evidência, a duas perguntas: **onde este sistema está vulnerável** e **ele está pronto para ter clientes**. Cruza o repositório com o **banco ao vivo** e os **logs de produção**, e nenhum achado entra no relatório sem verificação.

Substitui e unifica duas auditorias anteriores deste repositório (segurança OWASP sobre Supabase e prontidão de repositório), corrigindo os erros que elas cometiam: dado velho tratado como atual, escolha deliberada lida como falha, pendência conhecida vendida como descoberta, padrão sem prova de alcance e contagem sem classificação.

## O que ela faz
- **Segurança**: OWASP ASVS, API Security Top 10 e modelagem de ameaças em cada porta de entrada (login, webhook, checkout, função pública, bucket, convite).
- **Banco ao vivo**: RLS e políticas por tabela sensível, permissões por papel, funções `SECURITY DEFINER`, buckets, `search_path`, extensões. Provas no papel de visitante ou de outro cliente, sempre em transação desfeita.
- **Saúde em produção**: erros 4xx/5xx da API, do banco e das funções, com o primeiro instante de cada um.
- **Verificação obrigatória**: cada candidato sai como ✅ confirmado, ◐ plausível, ✗ refutado, ↺ já conhecido (com o ID) ou ◇ escolha registrada.
- **Pontuação**: eixo A (maturidade estrutural) e eixo B (prontidão de produto) de 0 a 10, com travas que limitam o teto, cruzamento dos eixos num veredito e placar OWASP Top 10 derivado dos mesmos achados.
- **Relatório**: diagnóstico no chat e visuais numa página publicada; plano de correção e relatório completo sob pedido.
- **Reauditoria**: reconfere a auditoria anterior e lê o que quebrou desde as últimas mudanças, com visual "antes × depois".

## Estrutura
```
auditoria-de-sistema/
├── SKILL.md                      # o fluxo: fases 0 a 8, princípios, guardrails
├── references/                   # carregadas por fase
│   ├── repo_access.md            # 0 · ZIP, ambiente ou conector do GitHub
│   ├── fontes_de_verdade.md      # 0 · o que o projeto já declara
│   ├── team_questionnaire.md     # 0 · perguntas que nenhum código responde
│   ├── coleta_repositorio.md     # 1 · sondas do repositório
│   ├── coleta_banco.md           # 2 · sondas do banco ao vivo
│   ├── coleta_producao.md        # 2 · logs, autenticação e dados de negócio
│   ├── roteiro_seguranca.md      # 3 · ASVS, API Top 10, ameaças, OWASP e CWE
│   ├── verificacao.md            # 4 · vereditos e protocolos de prova
│   ├── axis_a_dimensions.md      # as 10 dimensões estruturais
│   ├── critical_path.md          # 5 · fluxo crítico
│   ├── axis_b_dimensions.md      # as 7 dimensões de produto
│   ├── pontuacao.md              # 6 · escalas, travas, cruzamento, placar OWASP
│   ├── wireframes.md             # 7 · visuais e página
│   ├── relatorio_template.md     # 7–8 · ordem do relatório
│   ├── plano_template.md         # 8 · plano de correção
│   └── reauditoria.md            # modo reauditoria
├── scripts/
│   └── pontuar.mjs               # calcula notas, travas, quadrante e placar OWASP
└── evals/
    └── calibracao.md             # gabarito anonimizado para validar mudanças na skill
```

## Requisitos
- **Repositório** do sistema: no ambiente, em ZIP ou pelo conector do GitHub.
- **Fortemente recomendado**: acesso ao **banco de produção** (no Supabase, pelo MCP ou pela API com o token da CLI) e aos **logs**. Sem banco, os achados de dados ficam como "plausível"; sem logs, "Saúde em produção" sai como não verificada.
- **Node.js** para o `scripts/pontuar.mjs` (no Claude Code).
- Funciona com qualquer stack e banco; o Supabase tem sondas próprias por ser comum.

## Instalação
**Claude Code**
```bash
git clone https://github.com/thiagoferal-ia/thiago-feral-skills.git
mkdir -p ~/.claude/skills
cp -r thiago-feral-skills/skills/auditoria-de-sistema ~/.claude/skills/
```

**claude.ai**: `cd skills && zip -r auditoria-de-sistema.zip auditoria-de-sistema` e suba o ZIP em *Customize → Skills → "+" → "+ Create skill"*.

## Uso
Peça em linguagem natural: "meu sistema é seguro?", "está pronto para clientes?", "posso lançar?", "audite o RLS", "o que minhas correções quebraram?", "refaça a auditoria".

> **Somente leitura.** A skill nunca altera código, banco, chave ou política durante a auditoria e nunca imprime o valor de um segredo. É orientação técnica e de produto, não parecer jurídico.

---
Skill desenvolvida por **Thiago Feral | Inteligência Artificial**.
