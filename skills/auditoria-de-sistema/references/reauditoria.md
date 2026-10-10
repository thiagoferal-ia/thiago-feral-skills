# Modo reauditoria

Responde duas perguntas: **o que a auditoria anterior apontou continua de pé?** e **o que as mudanças
desde então quebraram?** A segunda nenhuma auditoria estática responde; é por isso que este modo lê
logs e mudanças, não só o catálogo.

## Entradas

- A auditoria anterior: o relatório (arquivo, página publicada ou texto no chat) com os códigos dos
  achados. Sem ela, rode o modo completo e diga que não há base de comparação.
- O período: da data da auditoria anterior até agora, ou desde a mudança que o usuário apontar.

## Passos

1. **Fase 0 normal**, relendo as fontes de verdade: o que mudou no registro de pendências e nas
   escolhas deliberadas desde a anterior?
2. **Reconferir cada achado anterior** pelo mesmo protocolo de prova (`verificacao.md`), com a mesma
   consulta quando houver. Estado novo de cada um:

   | Estado | Quando |
   |---|---|
   | Fechado | A prova agora é negada, ou o item mudou como o plano pedia |
   | Aberto | A prova continua passando |
   | Regrediu | Estava fechado numa reauditoria anterior, ou o registro diz resolvido, e a prova volta a passar |
   | Refutado agora | Na anterior era plausível e agora a prova mostra que não procede |

3. **Levantar o que mudou:** commits e PRs do período (`git log --since`), deploys da hospedagem,
   migrações aplicadas (`schema_migrations` do período), funções publicadas, configuração alterada
   (autenticação, chaves de funcionalidade).
4. **Ler os logs do período** (`coleta_producao.md`) e cruzar cada erro novo com a mudança mais próxima
   no tempo. Distinguir: erro que nasceu de uma correção, erro que nasceu de outra entrega no mesmo
   período, erro antigo que só agora apareceu.
5. **Varredura curta de novidade**: rodar as sondas das fases 1 a 3 só sobre o que mudou (arquivos,
   tabelas, funções, políticas tocadas no período). O que aparecer é "novo".
6. **Efeitos colaterais de cada correção:** para cada mudança de permissão, política, gatilho, sessão ou
   configuração feita no período, perguntar quem mais é afetado além do alvo (outros papéis, visitante,
   agendadores, telas que leem a mesma tabela) e provar com o papel.
7. **Pontuar de novo** e comparar as três notas.

## O que entra no relatório

- O visual **Antes × depois** (obrigatório neste modo).
- No chat, primeiro o que **regrediu** e o que **quebrou em produção** desde a anterior, cada um com a
  mudança que coincidiu e a evidência de que é ou não é causa. Atribuir um erro a uma mudança exige a
  linha do tempo; coincidência de horário sozinha é "provável", nunca "confirmado".
- Depois os fechados (curto), os abertos e os novos.
- Mantenha os códigos dos achados anteriores; achado novo recebe código novo.
