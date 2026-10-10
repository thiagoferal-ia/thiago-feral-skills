# Roteiro de segurança (Fase 3)

O OWASP Top 10 é a lista que **comunica** risco e dá nome ao placar. Para **encontrar** vulnerabilidade,
esta skill usa três roteiros que dizem o que conferir, e a CWE como etiqueta técnica de cada achado.

| Roteiro | Papel |
|---|---|
| **OWASP ASVS** (Application Security Verification Standard) | Requisitos testáveis, um a um. Use o nível 1 para tudo e o nível 2 para autenticação, sessão, controle de acesso e dado sensível |
| **OWASP API Security Top 10** | As falhas típicas de API. É o mais relevante quando o banco fica exposto por API (Supabase, PostgREST, Hasura, Firebase) |
| **Modelagem de ameaças (STRIDE) nas portas de entrada** | Acha o que nenhuma lista acha: a falha do fluxo específico do sistema |
| **CWE** | O código preciso do tipo de falha, para pesquisa e correção |

Confira na Fase 0 se há edição mais nova do Top 10, do API Top 10 ou do ASVS; se houver, use a nova e
ajuste os nomes abaixo.

## 1. ASVS: os requisitos que mais acham coisa

Cada linha é uma pergunta de sim ou não. "Não" vira candidato, com a origem `ASVS <capítulo>`.

| Capítulo | Pergunta | Como conferir |
|---|---|---|
| Autenticação | Conta administrativa exige segundo fator, no servidor? | Configuração de MFA ao vivo; contagem de fatores por papel; a função administrativa recusa sessão sem o nível de garantia exigido? |
| Autenticação | Há limite de tentativas e proteção contra senha vazada? | Configuração do provedor; tabela de tentativas |
| Autenticação | Acesso novo é por link de uso único, sem senha gerada ou enviada? | Fluxos de provisionamento e convite |
| Sessão | A sessão expira por inatividade e por tempo máximo? Credencial revogada para de funcionar? | Configuração ao vivo; prova com sessão encerrada |
| Controle de acesso | Toda leitura e escrita é autorizada no servidor, não na interface? | Políticas ao vivo; chamada direta sem passar pela tela |
| Controle de acesso | O isolamento entre clientes está no acesso ao dado (política), não na rota? | Prova de leitura cruzada |
| Controle de acesso | Funções privilegiadas negam por padrão e concedem por decisão explícita? | Permissão de execução por papel |
| Validação | Entrada validada por schema no servidor, em cada ponto de entrada? | Funções e rotas |
| Arquivos | Upload com tipo real, tamanho e destino controlados; leitura de arquivo restrita ao dono? | Políticas do storage; buckets listáveis |
| Dados | Dado sensível exposto só a quem precisa (colunas, não só linhas)? | Colunas legíveis por `anon` e por cliente |
| Comunicação | Origem permitida (CORS) restrita onde há credencial; cabeçalhos de segurança aplicados (CSP bloqueante, HSTS)? | Resposta HTTP real |
| Configuração | Segredo fora do código e do histórico; segredo com poder rotacionável? | Varredura e cofre |
| Configuração | Dependências de produção sem vulnerabilidade alta ou crítica, com varredura automática? | Auditor do gerenciador, separando produção |
| Lógica de negócio | Operação de dinheiro e de integração é idempotente e confere assinatura do provedor? | Webhooks e chaves de idempotência |
| Registro | Evento de segurança é registrado e alguém é avisado? Log sem dado pessoal? | Trilhas, alertas, amostra de log |
| Erros | Falha fecha a porta (sem segredo configurado, a checagem barra, não pula)? | Leitura dos guards |

## 2. API Security Top 10 (2023)

| Código | Falha | Prova típica numa API sobre o banco |
|---|---|---|
| API1 | **Autorização por objeto quebrada** (trocar o ID e ler o alheio) | Ler, como cliente A, o registro do cliente B pelo ID |
| API2 | Autenticação quebrada | Função que aceita token não validado, ou sem token |
| API3 | **Autorização por propriedade** (campo que não devia sair ou ser escrito) | Coluna sensível legível; `UPDATE` em coluna de papel ou de plano pelo próprio cliente |
| API4 | Consumo de recurso sem limite | Consulta sem paginação, função cara sem limite de taxa, função que chama IA ou rede disparável por qualquer um |
| API5 | **Autorização por função** (chamar o que é de administrador) | Chamar, como cliente, a função ou rota de administrador |
| API6 | Fluxo de negócio sensível sem proteção | Checkout, convite, cupom ou cadastro abusável em massa |
| API7 | SSRF | Função que busca URL vinda do usuário |
| API8 | Configuração insegura | CORS `*` com credencial, `search_path` mutável, view que fura RLS, extensão em `public` |
| API9 | Inventário mal gerido | Função publicada que não existe mais no repositório (e o inverso); rota de teste no ar |
| API10 | Consumo inseguro de API de terceiro | Webhook sem assinatura; resposta do provedor usada sem validação |

## 3. Modelagem de ameaças nas portas de entrada

Liste as portas do sistema (cada caminho pelo qual algo de fora entra): login, cadastro, recuperação de
senha, link de acesso, convite, checkout, webhook de cada provedor, cada função pública, cada bucket,
cada página pública que lê dado, agendadores que chamam a rede.

Para cada porta, as seis perguntas do STRIDE, em linguagem simples:

| Letra | Pergunta |
|---|---|
| S · Falsificação | Alguém consegue se passar por outra pessoa ou por um provedor aqui? |
| T · Adulteração | Alguém consegue mudar dado que não é dele, ou o corpo da mensagem no caminho? |
| R · Repúdio | Se algo der errado aqui, existe registro de quem fez? |
| I · Vazamento | O que sai daqui que não deveria (dado, erro detalhado, existência de uma conta)? |
| D · Negação | Dá para derrubar ou encarecer o sistema por aqui? |
| E · Elevação | Dá para ganhar um papel ou um plano que não se tem? |

Resposta "sim" ou "não sei" vira candidato com origem `STRIDE <porta>/<letra>`.

## 4. Do achado ao placar OWASP Top 10 (2025)

Cada achado confirmado ou plausível recebe uma categoria principal (e, se fizer sentido, uma segunda).

| Código | Categoria | O que costuma cair aqui |
|---|---|---|
| A01 | Controle de acesso quebrado | RLS fraca, `USING (true)`, view que fura RLS, leitura cruzada, função sem guard, bucket listável, **SSRF** |
| A02 | Configuração insegura | `search_path` mutável, CORS amplo, extensão em `public`, rota de diagnóstico no ar, CSP só em relatório |
| A03 | Falhas na cadeia de suprimentos | Dependência vulnerável, sem varredura automática, artefato de build não verificado |
| A04 | Falhas criptográficas | Segredo no código, segredo em texto no banco, chave de provedor devolvida ao cliente |
| A05 | Injeção | SQL montado com texto, XSS (`dangerouslySetInnerHTML`, `innerHTML`), comando montado |
| A06 | Design inseguro | Papel concedido no cadastro, consulta que revela dado sem prova de posse, falta de limite em escrita pública |
| A07 | Falhas de autenticação | "Ter cabeçalho" tratado como autenticado, MFA ausente em conta administrativa, senha fraca aceita |
| A08 | Falhas de integridade | Webhook sem assinatura, dado de terceiro aceito sem conferência |
| A09 | Falhas de registro e alerta | Evento de segurança sem registro, sem alerta, dado pessoal em log |
| A10 | Tratamento de condições excepcionais | Checagem que pula quando falta o segredo, erro que vaza detalhe, padrão "permitir" na falha |

Pistas para quem usa Supabase:
- Tudo que a chave `anon` alcança da internet é A01 primeiro; se a causa é um descuido de configuração,
  também A02.
- `service_role` no código do cliente é A02 e A04.
- Webhook sem assinatura é A08; se ainda falha aberto sem o segredo, também A10.
- Papel concedido no cadastro com cadastro aberto é A06 encadeado em A07.

## 5. CWE mais comuns

| CWE | Nome curto |
|---|---|
| 284 / 285 / 639 | Controle de acesso impróprio / autorização imprópria / acesso por chave controlada pelo usuário |
| 862 / 863 | Autorização ausente / incorreta |
| 287 / 306 / 308 | Autenticação imprópria / ausente para função crítica / sem múltiplos fatores |
| 798 / 312 | Credencial embutida / dado sensível em texto |
| 345 / 347 | Autenticidade de dado não verificada / assinatura não conferida |
| 89 / 79 | Injeção de SQL / XSS |
| 200 / 359 | Exposição de informação / de dado pessoal |
| 770 / 400 | Recurso sem limite |
| 918 | SSRF |
| 1104 | Componente de terceiro sem manutenção |
| 532 | Dado sensível em log |
| 636 | Falha aberta |
