# Pontuação (Fase 6)

Uma nota só, em dois eixos, mais o placar OWASP **calculado dos mesmos achados**. O placar OWASP não é
um segundo sistema de pontuação: é a parte de segurança vista pela lente que todo mundo conhece.

Só pesam achados **confirmados** e **plausíveis** (o plausível conta pela metade no placar OWASP). O
já conhecido pesa uma vez, no item dele. Refutado e escolha registrada não pesam.

## Escala por item (0–4)

Vale para os dois eixos. Pontuar direto em 0–10 gera nota inventada — a diferença entre 6 e 7 vira
opinião. Use a escala curta, ancorada em comportamento observável.

| Nota | Estado | Como se reconhece | Pergunta que decide |
|:---:|---|---|---|
| **0** | Ausente | Não existe | Existe alguma coisa? |
| **1** | Acidental | Existe em alguns pontos, sem padrão | É intencional ou aconteceu? |
| **2** | Padronizado | Consistente, mas depende de alguém lembrar | Se a pessoa esquecer, quebra? |
| **3** | Automatizado | Garantido por mecanismo — a falha bloqueia | A máquina impede o erro? |
| **4** | Governado | Automatizado, medido e revisado periodicamente | Alguém olha o indicador? |

A fronteira **2→3 é a mais importante da auditoria**: é onde a qualidade deixa de depender de disciplina
individual. Times chegam ao 2 por esforço; ao 3, só por decisão. Na dúvida, pergunte: *se uma pessoa
nova esquecer disso, o sistema deixa passar?* Se deixa, é 2.

No eixo B, a mesma escala se lê pela perspectiva do cliente: 2 é "funciona se alguém do time ajudar", 3
é "o cliente faz sozinho", 4 é "o cliente faz sozinho inclusive nas exceções".

## Fórmulas

Não calcule à mão. Registre as notas item a item num JSON e rode
`node scripts/pontuar.mjs notas.json` (o formato está no cabeçalho do script). O script aplica as
fórmulas, a exceção de B4, as travas, os estágios e o quadrante; o julgamento de cada nota continua
sendo seu. As fórmulas abaixo documentam o que ele calcula.

```
Nota da dimensão (0–10) = (Σ notas dos itens ÷ (4 × nº de itens pontuados)) × 10
Nota do eixo (0–10)     = Σ (nota da dimensão × peso) ÷ Σ pesos aplicáveis
Cobertura do eixo (%)   = itens pontuados ÷ itens aplicáveis × 100
```

Exceção única: **B4 não usa média** — ver `axis_b_dimensions.md`. A nota é o menor valor entre o elo
mais fraco da cadeia e a média dos quatro itens de qualidade operacional.

## Tratamento de itens sem nota

| Situação | O que fazer |
|---|---|
| **Não aplicável** — não faz sentido para este sistema | Sai do denominador. Não afeta a cobertura |
| **Não verificado** — falta acesso, resposta ou tempo | Sai do denominador **e** reduz a cobertura |
| **Verificado, ausente** | Nota 0. Isso é achado, não lacuna |

Nunca converta "não verificado" em zero nem em nota otimista. A tentação de fechar o número é forte e
destrói a credibilidade da auditoria inteira.

## Travas do eixo A

| Achado | Teto | Como confirmar |
|---|:---:|---|
| Dado de uma conta acessível por outra | **3,0** | Prova de comportamento, não leitura |
| Autorização verificada apenas no cliente | **3,0** | Chamada direta à API, sem a interface |
| Cópia de segurança inexistente ou nunca restaurada | **4,0** | Questionário: peça a data do último restore |
| Segredo de produção no histórico do repositório | **4,0** | Varredura no histórico completo |
| Sem ambiente separado — desenvolvimento toca produção | **4,0** | Configuração e questionário |
| Credencial de acesso armazenada de forma recuperável | **3,0** | Leitura do fluxo de autenticação |
| Schema sem versionamento; alterado à mão em produção | **5,0** | Ausência de histórico de migração |

## Travas do eixo B

| Achado | Teto | Como confirmar |
|---|:---:|---|
| Não é possível contratar e pagar sem intervenção manual | **3,0** | Percorrer o fluxo de contratação |
| Um elo do fluxo crítico ausente | **4,0** | Cadeia derivada e validada |
| Exigência regulatória aplicável não atendida | **3,0** | Mapeamento exigência → mecanismo |
| Sem importação de dados do processo anterior | **5,0** | Percorrer a entrada de um cliente com histórico |
| Sem canal de atendimento | **6,0** | Procurar como um cliente procuraria |
| O cliente não consegue extrair os próprios dados | **6,0** | Percorrer a exportação |

**Quando mais de uma trava incide, vale a menor.** Registre todas as acionadas — o time precisa saber
que corrigir uma não libera a nota. Trava apenas suspeitada, não provada, **não se aplica**: registre
como achado de alta severidade com a prova pendente e diga o que falta para confirmar.

## Estágios de cada eixo

**Eixo A · Maturidade estrutural**

| Estágio | Faixa | Sintoma diagnóstico |
|---|:---:|---|
| A1 · Protótipo | 0,0 – 2,9 | Publicação manual, conhecida por uma só pessoa |
| A2 · Artesanal | 3,0 – 4,9 | Toda entrega dá medo; incidente vira madrugada |
| A3 · Estruturado | 5,0 – 6,9 | Entrega previsível, mas descobre problema pelo cliente |
| A4 · Industrial | 7,0 – 8,4 | O sistema avisa antes do cliente; reverte em minutos |
| A5 · Governado | 8,5 – 10 | Resiliência e conformidade demonstradas, não afirmadas |

**Eixo B · Prontidão de produto**

| Estágio | Faixa | Sintoma diagnóstico |
|---|:---:|---|
| B1 · Conceito | 0,0 – 2,9 | Não é contratável; não existe caminho até a receita |
| B2 · Demonstrável | 3,0 – 4,9 | Mostra valor numa demonstração, não sustenta operação |
| B3 · Operável | 5,0 – 6,9 | Um cliente real trabalha, com acompanhamento próximo |
| B4 · Comercializável | 7,0 – 8,4 | O cliente entra, opera e paga sem o time por perto |
| B5 · Escalável | 8,5 – 10 | Cresce em clientes sem crescer o suporte na mesma proporção |

**O estágio 5 raramente compensa nos dois eixos.** O salto de 4 para 5 custa caro e só se paga com
cliente regulado, grande ou institucional, ou com volume alto o bastante para que o suporte seja o
gargalo. Para a maioria dos sistemas, o estágio 4 é o destino.

## O cruzamento

O veredito é o **mínimo dos dois eixos, nunca a média**. Um sistema 9 em estrutura e 2 em produto não é
"5,5, meio pronto" — é *não pronto*, porque nenhum cliente entra.

| Quadrante | Condição | Nome | Leitura |
|---|---|---|---|
| ↖ | A ≥ 5 · B < 5 | **Fundação sem porta** | Bem construído, ninguém consegue usar ou pagar |
| ↗ | A ≥ 5 · B ≥ 5 | **Pronto** | Pode receber clientes |
| ↙ | A < 5 · B < 5 | **Canteiro de obras** | Protótipo em construção |
| ↘ | A < 5 · B ≥ 5 | **Casa sem alicerce** | Vende sobre risco que cresce a cada cliente |

Com os dois eixos acima de 7,0, o veredito sobe de **pronto para os primeiros clientes** para **pronto
para escalar**.

### A assimetria dos dois quadrantes errados

Esta é a informação mais acionável da matriz, e vale dizê-la explicitamente no relatório:

**Sair de "fundação sem porta" é trabalho aditivo.** Constrói-se o que falta e nada do que já existe é
desperdiçado. Risco baixo, custo previsível, prazo estimável.

**Sair de "casa sem alicerce" é reforma com a casa habitada.** Retrofit de isolamento, de auditoria e de
schema com dado real e cliente pagante dentro. Custo alto, risco alto, e piora todo mês que passa. É o
único quadrante genuinamente perigoso — e o mais comum entre sistemas que cresceram rápido.

Um sistema preso à esquerda está preso no lugar certo. Diga isso; muda a decisão de prioridade do time.

## Nota projetada

Ao montar o pipeline de correção, recalcule **as duas notas** ao fim de cada horizonte:

1. Assuma que os itens corrigidos sobem para a nota realista — normalmente 3, raramente 4.
2. Remova as travas que a correção resolve.
3. Mostre as duas curvas e o momento em que o quadrante muda.

Seja conservador. Prometer 8,5 e entregar 7,1 queima a próxima auditoria. E deixe explícito **qual
correção move o quadrante** — é a única que tem prazo de verdade; o resto é melhoria.

## Falha ou desvio

| | Definição | Destino |
|---|---|---|
| **Falha** | Está errado e cria risco ou bloqueio agora | Plano de correção, com prazo e responsável |
| **Desvio** | Diverge do ideal, mas funciona e é estável | Dívida registrada, com **gatilho** definido |

Todo desvio precisa de gatilho — a condição que o converte em falha. "Revisar ao passar de N clientes",
"corrigir antes da primeira integração externa", "reavaliar quando o time dobrar". Desvio sem gatilho é
desvio esquecido.

O estágio do sistema muda a classificação: o mesmo achado é desvio antes do lançamento e falha depois.
Registre o estágio considerado, para que a reauditoria possa comparar.

## Placar OWASP Top 10 (atual × meta)

O script calcula cada categoria a partir da lista de achados (`achados` no JSON, formato no cabeçalho
de `scripts/pontuar.mjs`). A regra, para que a nota não seja inventada:

1. Cada categoria parte de **9** (sem achado e com boa prática verificada).
2. Cada achado tira pontos da categoria principal dele: crítico 6 · alto 4 · médio 1,5 · baixo 0,5. O
   **plausível** tira a metade. Categoria secundária leva metade do desconto.
3. Teto pela pior gravidade confirmada: com crítico, no máximo **3**; com alto, no máximo **5**; só
   médio ou baixo, no máximo **7**. Piso **1**.
4. Categoria **não avaliada** a fundo nesta execução fica sem nota e com a marca "não avaliada", nunca
   com 9 de graça.
5. **Meta** é a mesma conta sem os achados dos horizontes imediato e próximo ciclo. A média das metas não
   passa de **9**: o último ponto é prática recorrente, não correção.

Âncoras para conferir o resultado: 2 a 3, achado crítico alcançável da internet; 4 a 5, achado sério com
precondição, ou vários médios; 6 a 7, só endurecimento; 8 a 9, nada encontrado e boa prática.

**Coerência entre os placares.** A média OWASP e as dimensões A3 (identidade e isolamento) e A4
(segurança de aplicação) olham a mesma evidência e devem cair na mesma vizinhança. Se divergirem mais
de 2 pontos, revise as notas de item antes de publicar.

## Projeção

O pipeline de correção mostra as três notas (A, B e OWASP) ao fim de cada horizonte. Seja conservador:
item corrigido sobe para 3, raramente 4. Marque o teto realista (por volta de 9) e escreva por que não
é 10.
