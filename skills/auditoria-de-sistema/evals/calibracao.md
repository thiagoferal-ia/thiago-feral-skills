# Calibração: o gabarito que a skill tem de acertar

Para quem altera esta skill. Antes de considerar uma versão pronta, rode-a num sistema com auditoria
anterior já conferida à mão e compare os vereditos com o gabarito. Errar um item do gabarito é defeito
da skill, não do sistema auditado.

> Versão pública: o caso abaixo foi anonimizado (módulos, integrações, datas e contagens trocados por
> descrições genéricas). Mantenha o gabarito completo do seu sistema numa cópia privada.

## Caso 1 · SaaS de gestão sobre Supabase

Duas auditorias antigas (uma de repositório, uma OWASP) foram conferidas uma a uma contra o banco, o
código e os logs. O gabarito abaixo é o resultado da conferência. Numa rodada de calibração, a skill
precisa chegar ao mesmo veredito pela própria verificação, sem ler este arquivo.

| Item da auditoria antiga | Veredito correto | Por quê |
|---|---|---|
| Contas de um provedor antigo com senha padrão vazada | **Refutado** | As senhas foram trocadas por valor aleatório meses antes (há coluna com a data); o segredo não existe mais. Sobra só uma marca de "trocar senha" esquecida, desvio baixo |
| Segredos no histórico do git | **Refutado** (como segredo) · desvio de processo | A varredura acha poucas ocorrências: exemplo truncado, UUID de usuário, nome de chave do `localStorage` e chave de um login simulado de um arquivo que não existe mais. Nenhuma com poder hoje |
| Chamados de suporte parados | **Refutado** | A contagem do dia mostra zero abertos |
| "A maioria dos pedidos falha" | **Confirmado com outra forma** | Separado por causa: a maior parte é teste, recusa de cartão e desistência; o erro do sistema (URL de retorno fora do domínio cadastrado no provedor) se concentrou numa troca de domínio e parou. O achado real é "a causa da falha não é gravada" |
| View sem `security_invoker` | **Escolha registrada** | Documentada como intencional no estado do projeto |
| Extensão de rede em `public` | **Já conhecido** | Tem ID no registro de pendências |
| Postgres desatualizado | **Já conhecido** | Tem ID |
| Repositório não reproduz o banco (migrações) | **Já conhecido** | Tem ID; o banco tem mais migrações registradas que os arquivos do repositório |
| CSP só em modo relatório | **Já conhecido** | Tem ID |
| Contas administrativas sem segundo fator | **Confirmado**, alto | Nenhuma conta com fator verificado; MFA habilitado no provedor mas não exigido |
| Imagem de um módulo legível por todos | **Confirmado**, e mais grave que o relatado | A política de leitura do bucket vale para `public`, que inclui visitante sem conta |
| Função de rotina que qualquer cliente dispara | **Confirmado** | `SECURITY DEFINER`, executável por `authenticated`, chama a rede (custo de IA) |
| Tabelas de um módulo legíveis por visitante | **Confirmado** | Política `true` para visitante |
| Buckets listáveis | **Confirmado** | SELECT para `public` no bucket inteiro, mais uma política duplicada |
| Gatilhos com `search_path` aberto | **Confirmado**, baixo | Funções de gatilho sem `search_path` |
| Quem alterou o preço visível ao público | **Confirmado**, médio | Colunas de motivo e autor da alteração legíveis por visitante numa tabela pública de preços |
| Segredo de integração de mensagens em texto no banco | **Confirmado**, baixo | Só o serviço lê a tabela; risco baixo |
| Cópias de backup com dado pessoal | **Confirmado** | Schemas de cópia sem documentação, com dado de pessoas apagadas |
| CORS `*` no webhook | **Confirmado**, baixo | Webhook público; `*` aceitável, mas desnecessário |
| Exportação de dados só para administrador | **Confirmado** | O titular não exporta os próprios dados |

### O que as auditorias antigas não acharam e a skill tem de achar

| Item | Onde estava | Veredito |
|---|---|---|
| Uma tela central respondendo 400 para todo cliente | Logs da API: coluna inexistente referenciada pela consulta, desde uma entrega do mesmo dia | Confirmado, alto, saúde em produção |
| Pop-up de aceite dos termos voltando a quem já aceitou | Logs: leitura de preferências com papel `anon`, seguida de novo aceite | Confirmado, médio, saúde em produção |
| Política aberta a visitante chamando função sem permissão para `anon` | Log do banco: `permission denied for function` | Confirmado, alto, efeito colateral de correção (modo reauditoria) |

### Critério de aprovação

- Todos os refutados acima saem como refutados, com o motivo.
- Os já conhecidos apontam o ID; as escolhas registradas apontam o lugar.
- Os confirmados saem confirmados, com prova ao vivo.
- Os três achados de logs aparecem em "Saúde em produção".
- Nenhum item refutado ou já conhecido pesa na nota.

Acrescente aqui cada novo caso conferido à mão, anonimizado. O gabarito só cresce.
