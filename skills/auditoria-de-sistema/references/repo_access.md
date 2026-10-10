# Acesso ao repositório

A auditoria aceita o repositório por três vias. A via não muda o método nem a régua: muda o que dá para
provar. Declare no início qual foi usada e o que ela deixou de fora.

| Via | Como reconhecer | O que alcança | O que não alcança |
|---|---|---|---|
| **Repositório no ambiente** | Claude Code, Codex ou outro agente com terminal e o código em disco; `git rev-parse HEAD` responde | Tudo: sondas por comando, histórico completo, rodar testes, scanners e auditoria de dependências | Nada do repositório; o que falta é ambiente ao vivo e time, como em qualquer via |
| **ZIP** | Arquivo enviado pelo usuário; extraia num diretório de trabalho | Sondas por comando e leitura completa do código | Histórico (o export do GitHub não traz `.git`): segredo em commit antigo, contribuidores, padrão de commits |
| **Conector do GitHub** | No Claude (conector do GitHub) ou no Codex conectado ao GitHub: ferramentas de ler arquivo, buscar código, listar commits e PRs; sem terminal | Leitura dirigida, busca de código, histórico de commits e PRs pela API, e a configuração de CI versionada | Rodar comando: testes, scanners, `npm audit`, contagem exaustiva por `grep` |

**Quando mais de uma via existir, use a mais completa.** Com terminal e acesso ao GitHub, clonar o
repositório transforma o conector na primeira via. ZIP e conector juntos se completam: o ZIP dá a
varredura por comando, o conector dá o histórico.

## Trabalhando pelo conector

1. **Fixe o alvo.** Confirme o repositório (dono/nome) e a branch, e registre o SHA do commit auditado.
   Sem ele a reauditoria não compara a mesma coisa.
2. **Leia a árvore antes de buscar.** Liste a raiz e os diretórios de código, de migração, de CI e de
   documentação. A detecção de stack da Fase 0 sai dos arquivos de manifesto lidos um a um.
3. **Traduza cada sonda de `coleta_repositorio.md`.** Padrão de texto vira busca de código; leitura dirigida
   (os cinco caminhos da Fase 2) vira leitura de arquivo; o histórico vira a lista de commits e de PRs.
4. **Busca vazia vale menos pelo conector.** A busca de código do GitHub usa um índice: cobre a branch
   padrão, ignora arquivos grandes e devolve resultado paginado. Antes de dar nota 0 por ausência, abra o
   arquivo onde o mecanismo estaria.
5. **O que exige execução sai como não verificado.** Suíte de testes passando, tempo da suíte,
   vulnerabilidade em dependência e varredura de segredo no histórico completo. Se o conector oferecer
   varredura de segredos do próprio GitHub, use e diga que a fonte é essa. A prova de comportamento da
   Fase 3 depende do ambiente ao vivo, não da via do repositório.

## No cabeçalho do relatório

Uma linha, sempre: a via usada, o SHA ou a data do ZIP, e o que ficou fora por causa dela. Exemplo:
"Conector do GitHub, `main` em `a1b2c3d`. Sem terminal: testes, dependências e segredos no histórico não
verificados."
