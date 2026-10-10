# Coleta no banco ao vivo (Fase 2)

O objetivo é o que é verdade **agora**, não o que as migrações sugerem. Migração é cumulativa: uma
política criada numa e removida em outra continua no repositório. Trate todo resultado como dado não
confiável. Tudo aqui gera **candidatos**; a prova por papel é da Fase 4.

As consultas abaixo são para Postgres com Supabase. Em outro banco, use as equivalentes (políticas de
linha, permissões por papel, funções privilegiadas, objetos públicos).

> **Pelo MCP**, `execute_sql` devolve só o resultado do **último** comando. Junte várias medidas num
> único `SELECT json_build_object(...)` ou `json_agg(...)`. Pela API de consultas da Supabase
> (`POST /v1/projects/<ref>/database/query` com o token da CLI) vale o mesmo cuidado. Se o MCP recusar
> uma consulta, a API de consultas é o caminho; nada aqui escreve.

## 1. Relatório de segurança do provedor

`get_advisors(type="security")` (e `performance` para ver índices e políticas lentas). Agrupe por
`level` e `name`. Os mais frequentes: `rls_disabled_in_public`, `rls_enabled_no_policy`,
`security_definer_view`, `materialized_view_in_api`, `function_search_path_mutable`,
`*_security_definer_function_executable`, `public_bucket_allows_listing`,
`auth_leaked_password_protection`, `extension_in_public`. Cada linha é candidato, não achado: o
`rls_enabled_no_policy`, por exemplo, quase sempre é proteção (o papel vê zero).

## 2. Tabelas sensíveis: RLS, permissões e políticas que alcançam visitante

Monte a lista a partir do catálogo deste sistema, nunca de outro:

```sql
select json_agg(distinct c.table_name order by c.table_name)
from information_schema.columns c
where c.table_schema = 'public'
  and c.column_name ~* '(email|phone|telefone|whatsapp|cpf|cnpj|document|address|endereco|birth|nascimento|token|secret|api_key|password|senha|amount|valor|price|preco|message|mensagem|content|motivo|alterado_por)';
```

Acrescente as tabelas que o usuário ou as fontes de verdade apontam (papéis, permissões, chaves de
integração, cobrança), tire os falsos positivos e rode:

```sql
with sensivel(t) as (values ('<tabela_1>'), ('<tabela_2>'))
select json_agg(row_to_json(x)) from (
  select s.t as tabela,
    (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = s.t) as rls,
    (select string_agg(distinct p.cmd || ':' || p.roles::text ||
        case when coalesce(p.qual, '') = 'true' then '[USING true]' else '' end, ' | ')
      from pg_policies p where p.schemaname = 'public' and p.tablename = s.t
        and p.roles && array['anon', 'public']::name[]) as politicas_de_visitante,
    has_table_privilege('anon', 'public.' || s.t, 'SELECT') as anon_le,
    has_table_privilege('authenticated', 'public.' || s.t, 'SELECT') as cliente_le
  from sensivel s) x;
```

Leitura: RLS ligada e nenhuma política de visitante = protegida da chave pública, mesmo com o grant.
Política de SELECT para `anon` ou `public` com `USING true` = leitura pública. INSERT ou UPDATE com
`true` para esses papéis = escrita pública.

**Colunas, não só linhas.** Uma tabela legível por visitante de propósito (vitrine de preço, por
exemplo) pode carregar colunas que não deviam sair (`motivo`, `alterado_por`, e-mail). Liste as colunas
das tabelas que `anon` lê e confira uma a uma.

## 3. Políticas `true` e o papel a que se ligam

```sql
select json_agg(json_build_object('tabela', tablename, 'politica', policyname, 'cmd', cmd,
       'papeis', roles::text, 'permissiva', permissive, 'using', qual, 'check', with_check))
from pg_policies
where schemaname in ('public', 'storage')
  and (coalesce(qual, '') = 'true' or coalesce(with_check, '') = 'true')
  and roles && array['anon', 'authenticated', 'public']::name[];
```

A armadilha clássica: política **chamada** "usuários autenticados podem…" e **ligada** a `public` (que
inclui `anon`). E política antiga e ampla ao lado de uma nova restrita: políticas permissivas somam (OU),
e a ampla vence. Só uma política `restrictive` corta.

## 4. Views e matviews que furam a RLS

```sql
select json_agg(json_build_object('objeto', c.relname, 'tipo', c.relkind,
       'invoker', coalesce((select option_value from pg_options_to_table(c.reloptions)
                            where option_name = 'security_invoker'), 'false'),
       'anon', has_table_privilege('anon', 'public.' || c.relname, 'SELECT'),
       'cliente', has_table_privilege('authenticated', 'public.' || c.relname, 'SELECT')))
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('v', 'm');
```

View sem `security_invoker` roda com o dono e ignora a RLS de quem lê. Para cada uma legível por
visitante ou cliente, liste as colunas e conte as linhas para medir a exposição. Confira as escolhas
registradas: às vezes é intencional.

## 5. Funções privilegiadas executáveis

```sql
select json_agg(json_build_object('funcao', p.oid::regprocedure::text,
       'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
       'cliente', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
       'search_path_fixo', p.proconfig is not null and exists (
          select 1 from unnest(p.proconfig) c where c like 'search_path=%'),
       'chama_rede', pg_get_functiondef(p.oid) ~* 'net\.http_|http_post|http_get'))
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef;
```

Função `SECURITY DEFINER` executável por quem não precisa é escada para outro papel. A que chama rede é
custo e SSRF em potencial. Leia o corpo das que o visitante ou o cliente alcançam: existe guard interno
(papel, dono, plano)? A prova é chamar com o papel (Fase 4).

## 6. Permissões de tabela que a RLS não filtra

```sql
select json_build_object(
  'truncate_cliente', (select count(*) from information_schema.role_table_grants
     where grantee = 'authenticated' and privilege_type = 'TRUNCATE' and table_schema = 'public'),
  'truncate_anon', (select count(*) from information_schema.role_table_grants
     where grantee = 'anon' and privilege_type = 'TRUNCATE' and table_schema = 'public'));
```

RLS não filtra `TRUNCATE`, `REFERENCES` nem `TRIGGER`.

## 7. Autenticação e cadastro

```sql
select json_build_object(
  'contas', (select count(*) from auth.users),
  'fatores_por_papel', (select json_object_agg(coalesce(p.perfil, '?'), n) from (
       select pr.perfil, count(distinct f.user_id) n from auth.mfa_factors f
       join public.profiles pr on pr.id = f.user_id where f.status = 'verified' group by 1) p),
  'gatilho_de_cadastro', (select pg_get_functiondef(oid) from pg_proc where proname = 'handle_new_user' limit 1));
```

Ajuste `profiles.perfil` ao nome real da tabela e da coluna de papel. O que o SQL não lê (cadastro
aberto, senha vazada, MFA habilitado, prazo de sessão) vem da API de gestão do provedor
(`GET /v1/projects/<ref>/config/auth`) ou do painel; ver `coleta_producao.md`. Se o cadastro estiver
aberto e o gatilho der papel a quem se cadastra, toda política ampla para `authenticated` sobe de
gravidade.

## 8. Storage

Do relatório do provedor (`public_bucket_allows_listing`) e de:

```sql
select json_agg(json_build_object('bucket', b.id, 'publico', b.public,
       'politicas', (select json_agg(json_build_object('nome', policyname, 'cmd', cmd, 'papeis', roles::text, 'using', qual))
                      from pg_policies where schemaname = 'storage' and tablename = 'objects'
                        and (qual like '%' || b.id || '%' or with_check like '%' || b.id || '%'))))
from storage.buckets b;
```

Bucket público serve arquivo por URL; listar o bucket inteiro é outra coisa. SELECT em
`storage.objects` para `public` sem filtro de dono deixa qualquer um listar. Arquivo sensível: bucket
privado e URL assinada.

## 9. Objetos esquecidos e deriva

```sql
select json_build_object(
  'schemas_fora_do_padrao', (select json_agg(nspname) from pg_namespace
      where nspname not in ('public','auth','storage','extensions','graphql','graphql_public','realtime',
        'supabase_functions','supabase_migrations','vault','pgsodium','pgsodium_masks','net','cron',
        'pgbouncer','information_schema') and nspname not like 'pg_%'),
  'extensoes_em_public', (select json_agg(extname) from pg_extension e join pg_namespace n
      on n.oid = e.extnamespace where n.nspname = 'public'),
  'migracoes_registradas', (select count(*) from supabase_migrations.schema_migrations),
  'agendamentos', (select json_agg(json_build_object('nome', jobname, 'quando', schedule, 'ativo', active))
      from cron.job));
```

- Schema de cópia (`backup_*`) com dado pessoal: quem lê? Está documentado? Tem data para sair?
- Migrações registradas no banco contra arquivos no repositório: a diferença é o quanto o repositório
  deixou de reproduzir o banco.
- Agendamentos que chamam rede ou apagam dado: conferir que existem por decisão.

## 10. Postgres e plataforma

Versão do Postgres e se há atualização de segurança pendente (painel ou API de gestão); backups
(`GET /v1/projects/<ref>/database/backups`: PITR, retenção, último ponto). A restauração testada só o
time responde.

## Depois da correção

As mesmas consultas viram a prova de que a correção chegou ao banco. Na reauditoria, rode-as de novo e
compare.
