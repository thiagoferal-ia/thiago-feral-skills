# Eixo A · Maturidade estrutural

71 itens em 10 dimensões. Cada item traz a evidência que o comprova e a **fonte** dela:

- **📁 Código** — verificável no repositório
- **🔌 Ambiente** — precisa de acesso ao banco, à infra ou ao sistema rodando
- **👥 Time** — não existe no código; vai para o questionário

Item sem fonte disponível não recebe nota: sai do denominador e reduz a cobertura.

**Vocabulário neutro:** onde este documento diz *cliente* no sentido de isolamento de dados, entenda a
unidade de particionamento do sistema — organização, conta, workspace, projeto, loja, filial. Sistemas
de usuário único não têm essa separação: marque os itens correspondentes como não aplicáveis.

| Dim | Nome | Peso | Itens |
|---|---|:---:|:---:|
| A1 | Arquitetura e organização | 1,0 | 7 |
| A2 | Modelo de dados e integridade | 1,3 | 8 |
| A3 | Identidade, autorização e isolamento | **1,6** | 7 |
| A4 | Segurança de aplicação | **1,6** | 8 |
| A5 | Qualidade e testes | 1,3 | 7 |
| A6 | Entrega e reversibilidade | 1,3 | 7 |
| A7 | Observabilidade e diagnóstico | 1,1 | 7 |
| A8 | Resiliência e continuidade | 1,3 | 8 |
| A9 | Conformidade e auditoria | 1,1 | 7 |
| A10 | Documentação e continuidade | 0,4 | 5 |

Soma dos pesos: 12,0.

---

## A1 · Arquitetura e organização — peso 1,0

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A1.1 | Separação entre entrada, regra de negócio e acesso a dados | Regra crítica não aparece dentro de controlador nem de template | 📁 |
| A1.2 | Cada regra de negócio existe em um único lugar | Busca pela regra retorna um ponto, não vários | 📁 |
| A1.3 | O domínio não depende do framework nem do banco | Camada de negócio isolável do framework | 📁 |
| A1.4 | Configuração externalizada por ambiente | Nenhum valor de ambiente literal no código | 📁 |
| A1.5 | Padrão consistente entre módulos | Dois módulos distintos têm a mesma estrutura e convenção | 📁 |
| A1.6 | Complexidade sob controle | Nenhum arquivo ou função desproporcional no caminho crítico | 📁 |
| A1.7 | Ausência de código morto no caminho crítico | Rotas e funções não referenciadas foram removidas | 📁 |

## A2 · Modelo de dados e integridade — peso 1,3

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A2.1 | Integridade referencial declarada no armazenamento | Constraint no schema, não apenas na aplicação | 📁 🔌 |
| A2.2 | Unicidade garantida onde o negócio exige | Índice ou constraint único nos identificadores naturais | 📁 🔌 |
| A2.3 | Tipos corretos | Valores monetários em tipo exato, datas com fuso explícito | 📁 |
| A2.4 | Exclusão lógica com data e autor | Colunas de exclusão presentes e populadas | 📁 🔌 |
| A2.5 | Índices nas colunas de filtro e junção mais usadas | Plano de execução sem varredura completa nas consultas quentes | 🔌 |
| A2.6 | Schema versionado e sequencial | Histórico completo; ambientes no mesmo ponto | 📁 🔌 |
| A2.7 | Sem estrutura semiestruturada como escape de modelagem em entidade central | Campos de negócio são colunas tipadas | 📁 |
| A2.8 | Transação cobrindo operações que precisam ser atômicas | Escrita multi-entidade dentro de transação explícita | 📁 |

## A3 · Identidade, autorização e isolamento — peso 1,6

Junto com A4, a dimensão de maior peso.

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A3.1 | Autorização verificada no servidor em toda entrada | Chamada direta à API, sem passar pela interface, é negada | 📁 🔌 |
| A3.2 | Separação entre contas aplicada no acesso ao dado, não na rota | Escopo padrão na camada de dados ou política no armazenamento | 📁 🔌 |
| A3.3 | Checagem de papel centralizada | Política declarada, não condicionais espalhadas | 📁 |
| A3.4 | Sessão com expiração, revogação e renovação | Credencial revogada deixa de funcionar de imediato | 📁 🔌 |
| A3.5 | Credencial de acesso armazenada com algoritmo moderno e recuperação por token de uso único | Configuração do algoritmo e fluxo de recuperação | 📁 |
| A3.6 | Acesso administrativo protegido, separado e registrado | Restrição verificável e trilha do uso | 📁 🔌 |
| A3.7 | **Teste automatizado de isolamento entre contas** | Teste que tenta ler dado alheio e espera negação | 📁 🔌 |

O item A3.7 é o mais frequentemente ausente em auditorias de sistemas multiusuário e o mais valioso
quando presente. Se não existir, isso costuma ser o achado mais importante do eixo A.

## A4 · Segurança de aplicação — peso 1,6

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A4.1 | Nenhum segredo versionado | Varredura no histórico completo, não apenas no estado atual | 📁 |
| A4.2 | Consultas parametrizadas em todos os acessos | Ausência de concatenação de comando com entrada do usuário | 📁 |
| A4.3 | Validação de entrada por schema no servidor | Schema declarado por ponto de entrada | 📁 |
| A4.4 | Upload com tipo real, tamanho e destino controlados | Verificação de conteúdo, não apenas de extensão | 📁 |
| A4.5 | Saída serializada por lista de campos permitidos | O registro não é devolvido inteiro por padrão | 📁 |
| A4.6 | Limite de taxa em autenticação e pontos de entrada caros | Configuração ativa e testada | 📁 🔌 |
| A4.7 | Dependências sem vulnerabilidade alta ou crítica | Relatório de varredura recente, idealmente automatizado | 📁 |
| A4.8 | Cabeçalhos de segurança e política de origem restritiva | Resposta HTTP real inspecionada | 📁 🔌 |

**A3 e A4 recebem os achados de segurança.** Os candidatos dessas duas dimensões vêm do roteiro
(`roteiro_seguranca.md`: ASVS, API Top 10 e ameaças nas portas de entrada) e passam pela verificação
(`verificacao.md`) antes de virar nota. Achado confirmado contra o item baixa a nota dele; item sem achado
só recebe 3 ou 4 com o mecanismo provado, não pela ausência de achado.

## A5 · Qualidade e testes — peso 1,3

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A5.1 | Testes cobrindo os caminhos de receita e de segurança | Os fluxos que geram dinheiro e os que decidem permissão têm teste | 📁 |
| A5.2 | Testes rodam automaticamente e a falha bloqueia a integração | Pipeline e proteção de branch — não hook local contornável | 📁 👥 |
| A5.3 | Cada defeito corrigido gera teste de regressão | Correção acompanhada de teste no histórico | 📁 |
| A5.4 | Ambiente de teste com dado realista e sem dado pessoal real | Rotina de geração ou anonimização documentada | 👥 |
| A5.5 | Análise estática com falha bloqueante | Etapa de verificação no pipeline | 📁 |
| A5.6 | Revisão por outra pessoa obrigatória | Política aplicada pela ferramenta, não combinada | 👥 |
| A5.7 | Suíte rápida o suficiente para uso diário | Tempo de execução medido | 📁 👥 |

A fronteira decisiva desta dimensão é A5.2. Testes excelentes que rodam só quando alguém lembra são
nota 2, não 4 — a garantia depende de disciplina individual.

## A6 · Entrega e reversibilidade — peso 1,3

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A6.1 | Publicação automatizada e reproduzível | Processo versionado; ninguém envia arquivo à mão | 📁 |
| A6.2 | Reversão documentada e já executada ao menos uma vez | Registro de execução real, não procedimento teórico | 👥 |
| A6.3 | Alteração de schema compatível com a versão anterior | Publicação sem janela de indisponibilidade | 📁 👥 |
| A6.4 | Ambientes separados, com dados separados | Credenciais e armazenamentos distintos | 📁 🔌 |
| A6.5 | Infraestrutura descrita como código | Definição versionada da infra | 📁 |
| A6.6 | Histórico de versão legível e branch principal protegida | Commits rastreáveis; push direto bloqueado | 📁 👥 |
| A6.7 | Mecanismo para desligar funcionalidade sem nova publicação | Chave de funcionalidade existente e em uso | 📁 |

## A7 · Observabilidade e diagnóstico — peso 1,1

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A7.1 | Log estruturado com correlação de requisição e identificação da conta | Uma requisição rastreável ponta a ponta | 📁 🔌 |
| A7.2 | Erro capturado com alerta em canal ativo | O alerta chega a uma pessoa, não a um arquivo | 📁 👥 |
| A7.3 | Métrica de latência e taxa de erro por ponto de entrada | Série histórica consultável | 🔌 👥 |
| A7.4 | Uma tela que responde "está tudo bem agora?" | Painel único, não sete abas | 🔌 👥 |
| A7.5 | Log sem dado sensível | Amostra real inspecionada | 📁 🔌 |
| A7.6 | Processamento assíncrono rastreável | Estado, tentativas e falhas visíveis | 📁 🔌 |
| A7.7 | Tempo médio de diagnóstico conhecido | Métrica registrada em incidentes passados | 👥 |

## A8 · Resiliência e continuidade — peso 1,3

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A8.1 | Cópia de segurança automatizada com retenção definida | Configuração e execuções recentes | 🔌 👥 |
| A8.2 | **Restauração testada, com data registrada** | Registro do último teste real de restauração | 👥 |
| A8.3 | Tempo e ponto de recuperação declarados | Documento com números, não adjetivos | 👥 |
| A8.4 | Processamento assíncrono para tarefa longa | Mecanismo de fila em uso | 📁 |
| A8.5 | Nova tentativa com espera progressiva e destino para falha definitiva | Configuração inspecionada | 📁 🔌 |
| A8.6 | Idempotência em operações de dinheiro e de integração | Chave de idempotência aplicada | 📁 |
| A8.7 | Degradação controlada quando dependência externa cai | Tempo limite, disjuntor ou alternativa | 📁 |
| A8.8 | Proteção contra consulta que derruba o armazenamento | Limite de resultado, tempo limite, paginação obrigatória | 📁 |

## A9 · Conformidade e auditoria — peso 1,1

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A9.1 | Trilha de auditoria em operações sensíveis | Autor, data, valor anterior e origem | 📁 🔌 |
| A9.2 | Consentimento registrado e versionado | Aceite vinculado à versão do termo | 📁 🔌 |
| A9.3 | Exclusão e portabilidade executáveis | Procedimento testado, não apenas previsto | 📁 👥 |
| A9.4 | Dado sensível cifrado em repouso | Configuração de criptografia | 📁 🔌 |
| A9.5 | Política de retenção implementada | Rotina de descarte em execução | 📁 👥 |
| A9.6 | Acesso interno a dado de cliente controlado e registrado | Acesso administrativo auditado; acesso direto ao banco restrito | 👥 |
| A9.7 | Terceiros que tratam dado estão mapeados e contratados | Relação de subprocessadores | 👥 |

**Trilha de auditoria retrofitada é reescrita, não incremento.** Se o sistema guarda dado sensível e
A9.1 está ausente, trate como prioridade máxima mesmo em sistema pré-lançamento: o custo cresce a cada
mês de dado acumulado.

## A10 · Documentação e continuidade — peso 0,4

| # | Item | Evidência | Fonte |
|---|---|---|---|
| A10.1 | Instruções que permitem subir o projeto do zero | Alguém de fora consegue rodar seguindo o texto | 📁 |
| A10.2 | Decisões arquiteturais registradas | Registro datado das escolhas e do porquê | 📁 |
| A10.3 | Procedimento para incidentes comuns | Runbook por tipo de falha | 📁 |
| A10.4 | Representação atualizada de dados e infraestrutura | Data da última revisão visível | 📁 |
| A10.5 | Mais de uma pessoa opera cada área crítica | Fator ônibus maior que 1 | 👥 |

---

## Distribuição das fontes

Aproximadamente 45 itens são verificáveis só com o código, 22 pedem ambiente e 19 dependem do time.
**Sem as respostas do time, a cobertura máxima do eixo A fica em torno de 73%.** Diga isso ao usuário na
Fase 0 — o questionário não é burocracia, é o que separa uma nota confiável de um chute bem formatado.
