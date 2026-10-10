# Coleta em produção (Fase 2)

O que o código e o catálogo não mostram: o que está **quebrando agora**, como a autenticação está
configurada de verdade, e o que os números de negócio dizem quando separados por causa.

## 1. Erros nos logs

Período padrão: os últimos 7 dias, ou desde a auditoria anterior na reauditoria. Se o usuário apontar um
incidente, centre nele.

**No Supabase**, pelo MCP (`query_logs` ou `get_logs`) ou pelo painel. A fonte `edge_logs` traz as
requisições da API e das funções; `postgres_logs`, os erros do banco; `function_edge_logs`, as funções.
Os campos ficam em `log_attributes['...']` (`request.url`, `request.method`, `response.status_code`,
`request.sb.jwt.authorization.payload.role`, `request.sb.auth_user`, `request.headers.referer`). Comece
por `select distinct source from logs` se não souber o que existe. O resultado pode ser grande: agregue
no próprio SQL.

```sql
-- erros por rota, com o primeiro e o último instante e quantas pessoas
select regexp_replace(log_attributes['request.url'], '\?.*$', '') as rota,
       log_attributes['response.status_code'] as status,
       count(*) as n,
       count(distinct log_attributes['request.sb.auth_user']) as pessoas,
       min(timestamp) as primeiro, max(timestamp) as ultimo
from logs
where source = 'edge_logs' and log_attributes['response.status_code'] >= '400'
group by 1, 2 order by n desc limit 40;
```

```sql
-- mensagens de erro do banco
select event_message, count(*) n, min(timestamp) primeiro, max(timestamp) ultimo
from logs where source = 'postgres_logs' and event_message ~* 'error|denied|does not exist|violates'
group by 1 order by n desc limit 30;
```

Para cada grupo relevante:
- **Separe o ruído:** 401 de sessão vencida, 404 de rota inexistente esperada, chamadas da própria
  auditoria (requisições da API de gestão, consultas de conferência).
- **Ache a origem no tempo:** o primeiro instante, cruzado com o deploy, a PR ou a migração mais próxima
  (`git log --since`, histórico de deploys da hospedagem, `schema_migrations`).
- **Pessoas afetadas** e se é tela que o cliente usa.
- **Leitura como visitante quando devia ser como cliente** (papel `anon` em rota que só faz sentido
  autenticada) costuma ser condição de corrida na tela: a consulta saiu antes de a sessão existir, e o
  resultado vazio ficou guardado.

Cada erro relevante vira candidato da categoria "Saúde em produção" e alimenta o visual de mesmo nome.

Sem acesso aos logs, diga no relatório e marque o visual como não verificado.

## 2. Configuração de autenticação

No Supabase, `GET https://api.supabase.com/v1/projects/<ref>/config/auth` com o token da CLI (nunca
imprima o token). Campos que importam:

| Campo | O que diz |
|---|---|
| `disable_signup` | Cadastro público aberto ou fechado |
| `password_min_length`, `password_required_characters` | Força da senha |
| `password_hibp_enabled` ou equivalente | Proteção contra senha vazada |
| `mfa_totp_enroll_enabled`, `mfa_totp_verify_enabled` | MFA habilitado no provedor (habilitado não é exigido: confira se o sistema exige de quem deve) |
| `sessions_timebox`, `sessions_inactivity_timeout` | Prazo da sessão (a unidade é hora) |
| `rate_limit_*` | Limites de envio e de tentativa |
| `site_url`, `uri_allow_list` | Para onde o login pode devolver |

Sem acesso à API, peça ao usuário que confirme no painel. O cadastro aberto muda a gravidade de todo
achado que exige "estar logado".

## 3. Hospedagem e cabeçalhos

Requisição real às páginas de produção:

```bash
curl -sI https://<dominio> | grep -iE 'content-security-policy|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy'
```

CSP só em `Content-Security-Policy-Report-Only` não bloqueia nada. Confira os domínios de produção com o
usuário.

## 4. Dados de negócio, classificados

Para o eixo B e para os achados de "dinheiro": pedidos, assinaturas, ativação e atendimento. Regra: **nada
de taxa sem classificação**.

- Pedidos: por situação **e por causa** da falha (recusa do cartão, desistência, erro do provedor, erro
  nosso), por período, excluindo teste, sandbox e contas internas. Um incidente encerrado entra como
  incidente, com início e fim, não como taxa atual.
- Pagantes: quantos ativos, quantos usaram o fluxo crítico nos últimos 7 e 30 dias, quantos nunca
  entraram.
- Atendimento: chamados abertos agora, idade do mais antigo. Número de documento não vale; conte agora.

Diga a consulta de cada número e a hora em que foi medido.
