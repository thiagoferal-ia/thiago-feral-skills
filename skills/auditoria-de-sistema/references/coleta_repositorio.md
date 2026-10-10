# Coleta no repositório (Fase 1)

Tudo o que sai daqui é **candidato**, não achado: a Fase 4 decide. Cite arquivo e linha de cada um e
nunca imprima o valor de um segredo.

Comandos por dimensão do eixo A. Os padrões abaixo são **hipóteses de busca, não verdades** — detecte a
stack primeiro e adapte-os. Convenções de nome variam por linguagem, framework e idioma do time.

**Regra geral:** ausência de resultado não é prova de ausência do problema. Um `grep` vazio pode
significar apenas que a convenção é outra. Confirme com leitura antes de dar nota 0.

**Sem terminal** (repositório pelo conector do GitHub): os comandos abaixo não rodam. Use os padrões como
termos de busca de código e siga a tradução de `repo_access.md`.

Exclua diretórios de dependência e artefato:

```bash
EXCL="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor --exclude-dir=dist \
--exclude-dir=build --exclude-dir=target --exclude-dir=venv --exclude-dir=.venv --exclude-dir=__pycache__"
```

---

## Fase 0 — Detecção de stack e tamanho

```bash
ls -a
cat package.json composer.json requirements.txt pyproject.toml go.mod Gemfile \
    pom.xml build.gradle Cargo.toml *.csproj mix.exs 2>/dev/null

find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.py' -o -name '*.php' \
  -o -name '*.go' -o -name '*.rb' -o -name '*.java' -o -name '*.kt' -o -name '*.cs' -o -name '*.rs' \
  -o -name '*.ex' \) $EXCL 2>/dev/null | wc -l

git log --oneline 2>/dev/null | wc -l
git log --format='%an' 2>/dev/null | sort | uniq -c | sort -rn
git log -1 --format='%ci' 2>/dev/null
```

Sem `.git`, declare a limitação: histórico de segredos e padrão de commits ficam fora do escopo.

**Antes de continuar**, identifique como este projeto nomeia as coisas: a coluna que separa contas, o
diretório de migrações, a convenção de teste. Ajuste as sondas seguintes a esses nomes. Perguntar ao
usuário custa uma mensagem e evita meia dúzia de falsos negativos.

## A1 · Arquitetura

```bash
find . -maxdepth 3 -type d $EXCL 2>/dev/null | sort

# Regra de negócio dentro de camada de entrada — adapte os termos ao domínio
grep -rn $EXCL -iE '(calc|total|price|amount|rate|fee|score|weight)' \
  --include='*controller*' --include='*route*' --include='*handler*' --include='*view*' . | head -20

# Configuração literal no código
grep -rn $EXCL -E "(https?://[a-z0-9.-]+|localhost:[0-9]{2,5}|[0-9]{1,3}(\.[0-9]{1,3}){3})" . \
  | grep -viE 'test|spec|example|sample|\.md:' | head -20

# Arquivos desproporcionais
find . -type f $EXCL -exec wc -l {} + 2>/dev/null | sort -rn | head -20
```

## A2 · Modelo de dados

```bash
find . -type d \( -iname 'migration*' -o -iname 'migrate' -o -iname 'schema*' -o -iname 'db' \) $EXCL

grep -rniE 'references|foreign key|constraint|belongs_to|ForeignKey' \
  --include='*.sql' --include='*migration*' --include='*model*' . | head
grep -rniE 'unique' --include='*.sql' --include='*migration*' . | head
grep -rniE 'create index|add_index|addIndex|\.index\(|@Index' . | head

# Valor monetário em ponto flutuante — achado frequente e caro. Adapte os termos ao idioma do projeto.
grep -rn $EXCL -iE '(float|double|real)[^a-z].{0,40}(price|amount|value|total|balance|cost)' .
grep -rn $EXCL -iE '(price|amount|value|total|balance|cost).{0,40}(float|double|real)[^a-z]' .

# Data sem fuso
grep -rn $EXCL -iE 'timestamp without time zone|datetime\(\)|new Date\(\)|datetime\.now\(\)' . | head

# Exclusão lógica — procure a convenção do projeto, em qualquer idioma
grep -rn $EXCL -iE 'deleted_at|removed_at|is_deleted|archived_at' . | head
```

## A3 · Autorização e isolamento

A dimensão mais importante do eixo A. **Descubra primeiro qual coluna separa as contas** — pode chamar
`tenant_id`, `account_id`, `org_id`, `workspace_id`, `company_id` ou um nome do domínio. Confirme com o
usuário e substitua nos comandos.

```bash
COL="tenant_id"   # <- ajuste

# Onde a separação é aplicada?
grep -rn $EXCL -iE "$COL" . | wc -l

# CRÍTICO: se aparece espalhado nas camadas de entrada, o escopo está na rota — nota máxima 2.
grep -rln $EXCL -iE "$COL" --include='*controller*' --include='*route*' --include='*handler*' . | wc -l

# Escopo na camada de dados ou política no armazenamento — o padrão correto
grep -rn $EXCL -iE 'global.?scope|defaultScope|addGlobalScope|row level security|create policy|@Filter' .

# Pontos de entrada e o middleware que os protege — cruze as duas listas
grep -rn $EXCL -E "(router|app|@(Get|Post|Put|Patch|Delete)Mapping|@app\.route)\.?(get|post|put|patch|delete)?\(" . | head -60
grep -rn $EXCL -iE 'requireAuth|isAuthenticated|login_required|authorize|can\(|@PreAuthorize|ensure_signed_in' . | head

# Armazenamento de credencial
grep -rn $EXCL -iE 'bcrypt|argon2|scrypt|pbkdf2|password_hash' .
grep -rn $EXCL -iE '\bmd5\b|\bsha1\b' .    # perto de senha, é trava

# A evidência de ouro: teste de isolamento entre contas
grep -rn $EXCL -iE '(cross.?tenant|other.?(tenant|account|org)|isolation|unauthorized)' \
  --include='*test*' --include='*spec*' .
```

Se a última sonda não retornar nada, A3.7 é **0** — e costuma ser o achado mais importante do eixo A.

## A4 · Segurança

```bash
# Prefira ferramenta dedicada quando disponível
command -v gitleaks && gitleaks detect --no-git -v
command -v trufflehog && trufflehog filesystem .

# Fallback por padrão. NUNCA imprima o valor encontrado — só caminho e linha.
grep -rn $EXCL -iE '(api[_-]?key|secret|token|password|passwd|credential)\s*[:=]\s*["'"'"'][^"'"'"']{12,}' .
grep -rn $EXCL -E 'AKIA[0-9A-Z]{16}|eyJ[A-Za-z0-9_-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY' .

# Histórico (só com .git)
git log --all --name-only --format='' 2>/dev/null | sort -u | grep -iE '\.env|\.pem$|credential|secret'

# Comando concatenado com entrada
grep -rn $EXCL -E '(query|execute|raw|exec)\s*\(\s*[`"'"'"'].*(\$\{|\+ *[a-zA-Z_]|%s|f")' .

# Validação por schema
grep -rn $EXCL -iE 'zod|joi|yup|class-validator|pydantic|marshmallow|cerberus|FluentValidation|dry-schema' .

# Upload
grep -rn $EXCL -iE 'multipart|upload|FileField|MultipartFile' . | head
grep -rn $EXCL -iE 'mime.?type|magic.?number|content.?type|file.?signature' . | head

# Cabeçalhos e origem
grep -rn $EXCL -iE "cors|Access-Control-Allow-Origin|helmet|contentSecurityPolicy|X-Frame-Options|Strict-Transport" .

# Limite de taxa
grep -rn $EXCL -iE 'rate.?limit|throttle|slow.?down|limiter' .

# Dependências
npm audit --production 2>/dev/null | tail -25
pip-audit 2>/dev/null; composer audit 2>/dev/null; bundle audit 2>/dev/null; govulncheck ./... 2>/dev/null
```

## A5 · Testes

```bash
find . -type f \( -iname '*test*' -o -iname '*spec*' \) $EXCL 2>/dev/null | wc -l
ls .github/workflows .gitlab-ci.yml .circleci Jenkinsfile azure-pipelines.yml bitbucket-pipelines.yml 2>/dev/null

# O CI realmente roda os testes — e em qual gatilho?
grep -rniE 'on:|trigger|workflow_dispatch|push|pull_request' .github/workflows/ .gitlab-ci.yml 2>/dev/null | head
grep -rniE 'test|pytest|go test|phpunit|rspec|mvn|gradle' .github/workflows/ .gitlab-ci.yml 2>/dev/null | head

# Hook local não substitui CI: é contornável e vale nota 2, não 3.
ls .husky .git/hooks lefthook.yml pre-commit-config.yaml 2>/dev/null

# Presença de teste ≠ cobertura útil. O que decide a nota é isto:
grep -rln $EXCL -iE '(auth|permission|billing|payment|invoice|access)' \
  --include='*test*' --include='*spec*' .
```

## A6 · Entrega

```bash
ls Dockerfile docker-compose.yml Makefile Procfile 2>/dev/null
find . -name '*.tf' -o -name 'Pulumi.yaml' -o -name 'serverless.yml' -o -path '*k8s*' -o -name '*.bicep' $EXCL 2>/dev/null | head
grep -rniE 'rollback|revert|blue.?green|canary' .github/ .gitlab-ci.yml 2>/dev/null | head
grep -rn $EXCL -iE 'feature.?flag|unleash|launchdarkly|flagsmith|toggle' . | head
ls .env.example .env.sample env.template 2>/dev/null
```

## A7 · Observabilidade

```bash
grep -rn $EXCL -iE 'winston|pino|bunyan|structlog|logrus|zap|serilog|monolog|log4j|slf4j' . | head
grep -rn $EXCL -iE 'sentry|rollbar|bugsnag|datadog|newrelic|opentelemetry|honeybadger|elastic.?apm' . | head
grep -rn $EXCL -iE 'request.?id|correlation.?id|trace.?id|x-request-id' . | head

# Saída não estruturada em produção
grep -rn $EXCL -E 'console\.(log|error)|print\(|System\.out|puts ' . | wc -l

# Dado sensível no log
grep -rn $EXCL -iE 'log.{0,30}\b(password|secret|token|card|credential)\b' . | head
```

## A8 · Resiliência

```bash
grep -rn $EXCL -iE 'bull|sidekiq|celery|resque|sqs|rabbitmq|kafka|pg-boss|hangfire|quartz|delayed_job' . | head
grep -rn $EXCL -iE 'retry|backoff|dead.?letter|dlq' . | head
grep -rn $EXCL -iE 'idempoten' . | head
grep -rn $EXCL -iE 'timeout|circuit.?breaker|resilience4j|polly|opossum' . | head

# Consulta sem limite
grep -rn $EXCL -iE 'find_?all|select \*|\.all\(\)' . | grep -viE 'limit|paginate|take|first' | head
grep -rniE 'backup|snapshot|dump' --include='*.yml' --include='*.tf' --include='*.md' . 2>/dev/null | head
```

## A9 · Conformidade e auditoria

```bash
grep -rn $EXCL -iE 'audit.?(log|trail)|paper_trail|activity_log|versions|history_of' . | head
grep -rn $EXCL -iE 'consent|terms.?accept|privacy.?polic' . | head
grep -rn $EXCL -iE 'encrypt|cipher|pgcrypto|Fernet|AES|KMS' . | head
grep -rn $EXCL -iE 'anonymi|pseudonym|redact|scrub' . | head
grep -rn $EXCL -iE 'impersonat|sudo.?as|login.?as|act.?as' . | head

# Colunas de autoria — quantas entidades registram quem fez
grep -rn $EXCL -ioE '(created_by|updated_by|deleted_by|author_id|actor_id)' . | wc -l
```

## A10 · Documentação

```bash
wc -l README* 2>/dev/null
find . -iname 'adr*' -o -iname '*decision*record*' -o -iname 'runbook*' -o -iname 'CONTRIBUTING*' $EXCL 2>/dev/null | head
ls docs/ documentation/ 2>/dev/null
git log -1 --format='%ci' -- README.md 2>/dev/null
```

---

## Sondas do eixo B

O eixo B é majoritariamente externo ao código, mas algumas sondas indicam se o mecanismo sequer existe.
**Presença no código não prova que funciona** — confirme percorrendo o fluxo.

```bash
# B2 — cobrança: adapte aos provedores da jurisdição do sistema
grep -rn $EXCL -iE 'subscription|billing|checkout|invoice|payment|plan|trial|dunning' . | head -20

# B3 — entrada e migração
grep -rn $EXCL -iE 'onboarding|import|seed|migrate.?data|bulk.?(create|insert)|csv' . | head
# B5 — o cliente extrai os próprios dados
grep -rn $EXCL -iE 'export|download.?(data|csv|report)|backup.?account' . | head
# B6 — diagnóstico de suporte sem acesso ao banco
grep -rn $EXCL -iE 'admin.?panel|back.?office|internal.?tool|support.?dashboard' . | head
# B7 — termos, aceite e obrigações do titular
grep -rn $EXCL -iE 'terms|privacy|data.?(deletion|export|request)|right.?to.?(erasure|access)' . | head
```

---

## Cruzamento com o ambiente ao vivo

Quando houver acesso ao banco ou ao ambiente, **confirme sempre contra o estado real**. Migrações são
cumulativas e mentem sobre o estado final: uma política criada numa migração e removida em outra
continua no repositório.

Prioridade de cruzamento:
1. Políticas de acesso e separação entre contas realmente ativas (A3)
2. Constraints e índices realmente existentes (A2)
3. Permissões por papel nas entidades sensíveis (A3)
4. Configuração de cópia de segurança e data do último ponto (A8)
5. Cabeçalhos e política de origem na resposta real (A4)

---

## Segurança: o que o `grep` por dimensão não pega

### Mapa das portas de entrada

- Liste as rotas de servidor (`api/`, `pages/api`, `app/**/route.*`) e as funções de borda
  (`supabase/functions/*`). Para cada uma, anote em `supabase/config.toml` se `verify_jwt` está
  desligado: essas são alcançáveis da internet sem sessão e **precisam** se autenticar sozinhas ou
  conferir assinatura.
- O módulo do cliente do banco (em projetos Supabase, muitas vezes `src/integrations/supabase/client.ts`)
  deve levar só a chave pública. Decodifique o JWT: `"role":"anon"` é público por desenho;
  `"role":"service_role"` no cliente ou em código de servidor versionado é crítico. Fallback literal
  (`process.env.X || '<literal>'`) com chave pública pode ser intencional; confira as fontes de verdade.

```bash
# service_role (fragmento base64 de "role":"service_role")
grep -rIlE "InNlcnZpY2Vfcm9sZSI" $EXCL --include=*.ts --include=*.tsx --include=*.js --include=*.mjs .
grep -n "verify_jwt" supabase/config.toml 2>/dev/null
```

### Quem autentica o chamador

Para cada porta que faz trabalho privilegiado:
- **Valida** o chamador, ou só confere que o cabeçalho existe? `if (!authHeader) return 401` seguido de
  uso da chave de serviço sem `getUser(token)` **não** é autenticação (A07).
- Existe um auxiliar comum de autenticação? Anote onde ele é usado e, principalmente, onde não é.
- **Falha aberta** (A10): `const s = env.SEGREDO; if (s) { confere }` pula a checagem quando o segredo
  falta. Autenticação, agendador e webhook têm de falhar fechados.
- Função que devolve chave de provedor ao cliente (A04): no mínimo exige sessão; prefira token curto e
  restrito, nunca a chave longa.
- Função que chama rede ou IA (custo): quem consegue dispará-la? (API4)

### Webhooks e assinatura

```bash
grep -rinE "signature|hmac|crypto.subtle|sha256|x-hub-signature|svix|hottok|asaas-access-token|verify" supabase/functions/<webhook>/
```
- Webhook de pagamento **tem** de conferir token ou assinatura do provedor antes de gravar. Sem isso,
  pedido e estorno são forjáveis (crítico).
- Meta e WhatsApp: conferir `X-Hub-Signature-256` no POST, não só o `hub.verify_token` do GET.
- Procurar a instância por um token que vem no corpo é identificação fraca, não assinatura.
- Anote os bons exemplos (o webhook que confere HMAC) como modelo para os outros.

### CORS, injeção e XSS

- Lista de origens permitidas é bom; `*` é aceitável em webhook público, nunca em rota que depende de
  credencial ou cookie.
- SQL montado com texto em cliente `pg`/`postgres` direto; filtro do PostgREST montado com template de
  texto a partir de entrada do usuário.
- Front: `dangerouslySetInnerHTML`, `innerHTML` sem sanitizar, URL não confiável em `href`.

### Inventário de funções (API9)

Compare a lista de funções no repositório com a lista **publicada** no provedor (no Supabase,
`list_edge_functions` ou `supabase functions list`). Função publicada sem código no repositório continua
atendendo com o código velho; função de teste ou diagnóstico (`tmp-*`, `test-*`) no ar é achado.

### Logs e dado pessoal (A09)

`console.log` de corpo de requisição, e-mail, telefone ou conteúdo de mensagem põe dado pessoal no log.
Recomende registrar só IDs e um código de erro.
