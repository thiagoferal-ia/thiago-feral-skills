# Fontes de verdade do projeto (Fase 0)

Antes de procurar problema, leia o que o projeto já declara sobre si. É o que separa uma descoberta de
uma repetição, e uma falha de uma escolha.

## O que procurar

Os nomes mudam de projeto para projeto. Procure pelo papel do arquivo, não pelo nome:

| Papel | Nomes comuns | O que tirar dele |
|---|---|---|
| **Regras** | `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `.cursorrules`, `docs/regras*` | As regras invioláveis (ex.: "gate de plano é no servidor", "função privilegiada nasce revogando"). Viram critério de verificação: violar uma regra declarada é achado com evidência dupla |
| **Estado medido** | `docs/ESTADO.md`, `STATUS.md`, `docs/state*`, painéis | Números com data e consulta. **Não use o número**: use a consulta para remedir. Número de documento é intenção do dia em que foi escrito |
| **Pendências e decisões** | `docs/pendencias.md`, `TODO.md`, `BACKLOG.md`, issues abertas, `docs/decisions/`, ADRs | Lista de IDs conhecidos (`PD-`, `DEC-`, `JUR-`, issue #) com o assunto de cada um |
| **Escolhas deliberadas** | seção "Escolhas deliberadas", "Riscos aceitos", "Won't fix", ADR com "aceitamos" | Lista de coisas que parecem falha e não são. Cada uma deveria ter motivo e data de revisão |
| **Arquitetura** | `docs/architecture.md`, diagramas, `README` | O mapa de onde cada coisa vive: base para o visual de estrutura |
| **Produto e plano** | `docs/produto/`, roadmap, escopo por plano | A cadeia do fluxo crítico (Fase 5) e o que cada plano libera |

Leia por busca, não por leitura integral: `grep` pelo assunto do candidato no registro de pendências é
mais barato e mais preciso que abrir o arquivo inteiro.

## As três listas que saem daqui

1. **IDs conhecidos:** `{id, assunto, estado}`. Na Fase 4, candidato que bate com um assunto em aberto
   vira "já conhecido" e aponta o ID. Se o registro diz "resolvido" e o candidato está confirmado, é
   **regressão**, e isso é mais grave que um achado novo.
2. **Escolhas registradas:** `{assunto, motivo, onde, revisar em}`. Candidato que bate vira "escolha
   registrada". Se a data de revisão passou, diga: a escolha venceu e precisa ser reconfirmada pelo
   dono, mas não é falha por isso.
3. **Regras do projeto:** cada regra que dá para conferir no código ou no banco vira sonda própria na
   Fase 3. Uma regra que o projeto declara e o sistema viola é achado forte, porque o próprio time disse
   que aquilo não pode acontecer.

## Quando o projeto não tem lugar para escolhas deliberadas

Diga isso no relatório como achado de processo (🔵), e proponha ao dono uma seção curta no documento de
estado do projeto, por exemplo:

```markdown
## Escolhas deliberadas

| Assunto | Por que é assim | Decidido por | Revisar em |
|---|---|---|---|
| `prompt_profile_view` sem security_invoker | a view agrega só contagens públicas | dono, 12/09 | 12/03 |
```

Não crie o arquivo nem a seção sem o dono pedir: a auditoria é somente leitura.

## Contradição entre a fonte e o que você mediu

Se o documento diz uma coisa e o banco ou o código mostra outra, reporte as duas, com a consulta, e diga
qual vale (o que está no ar). Documento desatualizado é achado de processo; nunca use o documento para
desmentir a medição.
