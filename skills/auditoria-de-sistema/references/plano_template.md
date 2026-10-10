# Modelo do plano de correção (Fase 8, só se pedir)

O relatório diz o que está errado. O plano diz em que ordem consertar e como saber que funcionou. Nada é
aplicado sem aprovação item a item: a auditoria termina no plano.

Se o projeto tem regra de onde o plano vive (no chat, num documento, num registro de pendências), siga a
regra do projeto.

```markdown
# Plano de Correção · [Nome]

**Origem:** auditoria de [data] · **Eixo A** [X,X] · **Eixo B** [X,X] · **Quadrante** [nome] ·
**OWASP** [X,X]
**Meta:** [notas e quadrante alvo, com prazo. Sem meta declarada, sugira os dois eixos acima de 5,0
como primeiro marco e acima de 7,0 como segundo.]

## Ordem de ataque

Por dependência e destravamento, não por gravidade isolada:

1. **Rotacionar segredo vazado** antes de tudo: a chave vazada vale até girar.
2. **Conter exposição ativa** antes de corrigir a causa.
3. **Travas**: enquanto existir, o eixo não se move.
4. **O que bloqueia o resto** (sem ambiente separado, nada se testa com segurança).
5. **O que muda o quadrante.**
6. **Risco alto e esforço baixo.**
7. **Desvios com gatilho já disparado.**

## ⏱️ Imediato · [prazo]

| # | Ação | Achado | OWASP | Natureza | Esforço | Pré-requisito | Prova de que funcionou |
|---|---|---|---|---|:---:|---|---|

**Projeção:** Eixo A [X,X] · Eixo B [X,X] · OWASP [X,X] · Quadrante [nome]

## 📅 Próximo ciclo · [prazo]

(mesma tabela)

**Projeção:** …

## 🔧 Contínuo

| # | Prática | Cadência | Como saber que está acontecendo |
|---|---|---|---|
| 1 | Restaurar cópia de segurança em ambiente de teste | | Data do último restore registrada |
| 2 | Varredura de dependências que reprova a integração | | O pipeline falha com vulnerabilidade alta |
| 3 | Revisar acessos a produção e contas administrativas | | Lista com data de revisão |
| 4 | Percorrer o fluxo crítico como cliente | | Registro do percurso |
| 5 | Rodar a reauditoria | | Data da última e diferença das notas |

## Por natureza da mudança

| Natureza | Itens | Risco de aplicar | Reversível? |
|---|---|---|---|
| Segredo e configuração (painel, cofre) | | Baixo | Sim |
| Código de aplicação e funções | | Médio | Sim, por nova publicação |
| Banco: política, permissão, função (DDL) | | **Alto** | Só com plano de reversão escrito |
| Dados | | **Alto** | Só com cópia antes |
| Produto e jornada | | Médio | Afeta cliente ativo |
| Processo | | Nenhum | — |

Mudança de banco: proponha o SQL comentado com o código do achado, para revisão, e a consulta que prova
o resultado. Não aplique. Mudança de código: diga o arquivo, o que muda e o bom exemplo que já existe no
repositório, quando houver.

## Verificação

| Achado | Prova antes de começar a corrigir | Prova depois |
|---|---|---|

A melhor prova estrutural é um teste que falha se o problema voltar. A melhor prova de produto é alguém
de fora do time completando o ciclo sozinho. A melhor prova de segurança é a mesma consulta por papel da
auditoria, agora negada.

## Reauditoria

Ao fim de cada horizonte, rode a skill em modo reauditoria. O salto final para perto de 10 não é uma
correção, é prática recorrente: varredura no pipeline, teste de restauração, revisão de acessos,
monitoramento e reauditoria.
```
