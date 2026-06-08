# Implementation plan template (`<App>_Plano_Implementacao_Correcoes.md`)

Generate after the audit report when the user accepts. This is the *doing* document: sequenced, with
dependencies, the DDL-vs-code split, and verification. Don't apply anything without per-change approval.

```markdown
# Plano de Implementação — Correções de Segurança <App>
**Projeto Supabase:** `<project_id>` · **Data:** <data> · **Base:** auditoria OWASP <edição>

## Princípios
- Rotacionar segredos ANTES de qualquer outra coisa (uma chave vazada continua válida até girar).
- Correções de **política/RLS/grant** = DDL → migration (histórico + reaplicável). Correções de
  **edge functions / api/** = fluxo de deploy do app. Marcar cada item com o trilho certo.
- Após cada bloco, rodar `get_advisors(security)` + as consultas da auditoria e mirar zero ERROR novo.
- Nada é aplicado sem aprovação item a item.

## Sequência

### ⏱️ Bloco 1 — Hoje (vazamento ativo)
| # | Item | OWASP | Trilho | Pré-requisito | Verificação |
|---|---|---|---|---|---|
| 1 | Rotacionar `service_role` (e chaves de 2º projeto) | A02/A04 | painel + deploy | — | chaves antigas inválidas |
| 2 | Confirmar sign-up público desabilitado | A07 | painel | — | setting = off |
| 3 | `REVOKE` anon/authenticated em matviews/views com PII | A01 | migration | — | consulta retorna sem anon |
| … | … | … | … | … | … |

### 📅 Bloco 2 — Esta semana (fechar antes do encadeamento)
(mesma tabela: RLS nas tabelas sem RLS; trocar `{public}`→papel; substituir `USING(true)`; assinatura de webhooks; fail-closed em crons; prova de posse + rate limit em lookups; buckets privados)

### 🔧 Bloco 3 — Contínuo (hardening + processo)
(search_path fixo + REVOKE EXECUTE; senha vazada; extensões fora do public; `npm audit`/SCA no CI;
remover endpoints de diagnóstico; logs sem PII; rotação programada; monitoramento/alertas)

## Migrations propostas (para revisão — não aplicar sem aval)
Blocos SQL prontos para os itens DDL (REVOKE/ENABLE RLS/DROP POLICY/CREATE POLICY com papel/permissão).
Um bloco por achado, comentado com o código do achado.

## Mudanças de código (edge functions / api/)
Por arquivo: o quê muda (ex.: validar `getUser(token)`; verificar assinatura HMAC; fail-closed),
referenciando um exemplo bom já existente no repo quando houver.

## Verificação final / re-auditoria
Reexecutar Fases 1–2; regenerar o mapa de acesso e o scorecard como prova; registrar a nova nota.
Lembrar: o salto para 10 depende de processo recorrente, não deste plano.
```
