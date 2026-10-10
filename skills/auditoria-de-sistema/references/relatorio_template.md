# Modelo do relatório

Duas peças. **No chat**, o diagnóstico em texto. **Na página publicada**, os visuais
(`wireframes.md`). O chat não redesenha o que a página mostra; a página não repete a prosa do chat.
Escreva no idioma do usuário.

## No chat (Fase 7)

```markdown
**[Pronto / Não pronto] para ter clientes.** Eixo A [X,X] · Eixo B [X,X] · [quadrante] ·
[travas ou "sem travas"] · cobertura A [XX]% B [XX]%. Visuais: [link da página]

**A verificação:** [N] candidatos → [n] confirmados · [n] plausíveis · [n] já conhecidos ·
[n] escolhas registradas · [n] refutados.

[Diagnóstico em prosa, um a três parágrafos: o que o sistema é, o que foi bem feito, e as duas ou três
coisas que decidem o veredito. Para quem decide orçamento e prazo.]

### O que está exposto agora
[Achados 🔴 e 🟠 confirmados, cada um com o bloco abaixo.]

### O que está quebrando em produção
[Os erros relevantes dos logs: rota, desde quando, quantas pessoas, causa provável, mudança que
coincidiu. Ou "nenhum erro de cliente no período".]

### Demais achados
[Tabela curta dos 🟡 e 🔵, e dos plausíveis com a prova pendente.]

### Já conhecidos e escolhas registradas
[Uma linha por item, com o ID ou o lugar.]

### Refutados
[Uma linha por item, com o motivo. Ex.: "C1 · senha das contas X: trocada em 16/08 (consulta)".]

### O que depende de você
[Cada decisão com o que fica travado enquanto ela não sai.]

### Por onde começar
[As três primeiras ações do pipeline, e qual delas muda o quadrante.]

Visuais condicionais fora desta página: [visual · motivo], ou "todos os condicionais entraram".
```

Bloco de cada achado confirmado ou plausível:

```markdown
**[🔴 C1] [Título curto]** · [✅ confirmado | ◐ plausível] · [OWASP A0X] · [CWE-NNN] · [⏱️|📅|🔧]
- **O que é:** [uma frase, sem jargão]
- **Quem alcança:** [visitante da internet | qualquer cliente | outro cliente | só a equipe]
- **Prova:** [consulta → resultado, requisição → resposta, ou "pendente: <o que falta>"]
- **Evidência:** [arquivo:linha, objeto do banco, log com data. Segredo mascarado]
- **Impacto:** [o que acontece na prática]
- **Correção:** [concreta; diga se é configuração, código ou banco]
```

Códigos dos achados: `C` crítico, `H` alto, `M` médio, `B` baixo, numerados por gravidade. Na
reauditoria, mantenha o código do achado anterior quando é o mesmo problema.

## Arquivo do relatório completo (Fase 8, só se pedir)

```markdown
# Auditoria de Sistema · [Nome]

**Data:** [data e hora] · **Modo:** [completa | reauditoria de <data>] · **Escopo:** [repositório e
versão, projeto de banco, período dos logs] · **Método:** coleta, verificação, eixos A e B, placar OWASP

## Veredito
| | |
|---|---|
| Pronto para ter clientes | **[SIM / NÃO]** |
| Eixo A · Maturidade estrutural | **[X,X] / 10** · estágio [N · Nome] |
| Eixo B · Prontidão de produto | **[X,X] / 10** · estágio [N · Nome] |
| Quadrante | **[Nome]** · [uma linha] |
| Segurança (OWASP, média) | **[X,X] / 10** |
| Travas | [achado + eixo + teto, ou "nenhuma"] |
| Cobertura | A [XX]% · B [XX]% |

## Contexto considerado
[Estágio, clientes, time, tipo de dado, cadastro aberto ou não. Como isso calibrou a gravidade.]

## Limitações desta execução
[Sem histórico, sem banco, sem logs, questionário não respondido, cadeia não validada.]

## Funil da verificação
| Veredito | Quantos | Itens |
|---|:---:|---|

## Placar OWASP Top 10
| Categoria | Atual | Meta | Achados |
|---|:---:|:---:|---|

## Eixo A · por dimensão
| Dim | Dimensão | Nota | Peso | Itens | Cobertura |
|---|---|:---:|:---:|:---:|:---:|

## Eixo B · o fluxo crítico
**Ciclo declarado:** [quem paga] contrata este sistema para [resultado].
| # | Elo | Nota | O que falta | Exige ferramenta externa? |
|---|---|:---:|---|:---:|
**Elo mais fraco:** [nome] · nota [N].
| Dim | Dimensão | Nota | Peso | Itens | Cobertura |
|---|---|:---:|:---:|:---:|:---:|

## Saúde em produção
| Rota ou função | Erro | Desde | Pessoas | Causa provável | Mudança que coincidiu |
|---|---|---|:---:|---|---|

## Achados
[Bloco de cada achado, por gravidade.]

## Desvios registrados
| # | Desvio | Eixo | Por que funciona hoje | Gatilho que o torna falha |
|---|---|:---:|---|---|

## Já conhecidos, escolhas registradas e refutados
[Três tabelas curtas, com ID, lugar ou motivo.]

## Pontos fortes
| # | O que está bem | Eixo | Onde | Por que preservar |
|---|---|:---:|---|---|

## Decisões do dono
| Decisão | O que trava enquanto não sai | Recomendação |
|---|---|---|

## Detalhamento por dimensão
[Item a item, com nota, evidência ou "não verificado: o que falta".]

## Diagnóstico de processo
| Portão | Situação | Consequência observada |
|---|---|---|

## Antes × depois (só na reauditoria)
| Código | Achado | Antes | Agora | Prova |
|---|---|---|---|---|

## Próximos passos
[Remeta ao plano de correção e ofereça a reauditoria depois das correções.]
```
