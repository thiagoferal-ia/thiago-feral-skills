# Eixo B · Prontidão de produto

Sete dimensões que percorrem o ciclo de vida do cliente. A pergunta deste eixo não é *como foi feito*, é
**o cliente consegue usar e pagar**.

A maior parte da evidência **não está no código**. Nenhum `grep` diz se um cliente consegue trabalhar.
As fontes aqui são:

- **🖥️ Interface** — percorrer a jornada, como um cliente faria
- **📁 Código** — quando a existência do mecanismo é verificável
- **👥 Time** — processo, contrato, atendimento, números
- **🔗 Cadeia** — derivada em `critical_path.md`

| Dim | Nome | Peso | Itens |
|---|---|:---:|:---:|
| B1 | Descobrir e decidir | 1,0 | 5 |
| B2 | Comprar e pagar | **2,0** | 6 |
| B3 | Entrar e migrar | 1,5 | 5 |
| B4 | **Operar o fluxo crítico** | **3,0** | elos + 4 |
| B5 | Depender e confiar | 1,5 | 5 |
| B6 | Ser atendido | 1,0 | 5 |
| B7 | Permanecer conforme | **2,0** | 5 |

Soma dos pesos: 12,0. Dimensão inaplicável sai do denominador — nunca receba zero por algo que não
deveria existir neste sistema.

---

## B1 · Descobrir e decidir — peso 1,0

Pode alguém que não conhece o time entender, avaliar e decidir?

| # | Item | Evidência | Fonte |
|---|---|---|---|
| B1.1 | Existe apresentação pública do que o produto faz e para quem | Página, material ou catálogo acessível sem contato | 🖥️ |
| B1.2 | O preço é público ou há caminho claro para obtê-lo | Tabela, faixa ou formulário com retorno definido | 🖥️ 👥 |
| B1.3 | Existe prova antes da compra | Demonstração, avaliação gratuita, ambiente de teste ou caso verificável | 🖥️ 👥 |
| B1.4 | Os limites do produto são declarados | O comprador sabe o que o produto não faz antes de comprar | 🖥️ |
| B1.5 | Existe caminho de contato pré-venda com retorno | Canal e tempo de resposta reais | 🖥️ 👥 |

## B2 · Comprar e pagar — peso 2,0

Um sistema que não converte interesse em receita não tem clientes, tem usuários.

| # | Item | Evidência | Fonte |
|---|---|---|---|
| B2.1 | O interessado consegue virar pagante sem intervenção manual | Fluxo de contratação percorrido de ponta a ponta | 🖥️ 📁 |
| B2.2 | A cobrança recorrente funciona de fato | Cobrança emitida, paga e conciliada | 📁 👥 |
| B2.3 | Documento fiscal emitido conforme a jurisdição | Emissão real, não intenção declarada | 📁 👥 |
| B2.4 | Inadimplência tem tratamento definido | Aviso, suspensão, reativação — implementados, não planejados | 📁 👥 |
| B2.5 | O cliente consegue cancelar sozinho | Caminho existente e sem atrito artificial | 🖥️ 📁 |
| B2.6 | Mudança de plano funciona com proporcionalidade | Aumento e redução testados | 📁 👥 |

Se o sistema não é comercializado (ferramenta interna, projeto aberto, institucional), marque a
dimensão inteira como não aplicável.

## B3 · Entrar e migrar — peso 1,5

O cliente típico não começa do zero: ele já opera de algum jeito e traz um histórico.

| # | Item | Evidência | Fonte |
|---|---|---|---|
| B3.1 | Um cliente novo chega ao primeiro valor sem acompanhamento | Percurso do cadastro ao primeiro resultado útil | 🖥️ |
| B3.2 | Dados do sistema ou processo anterior podem ser importados | Importação real com volume representativo | 🖥️ 📁 |
| B3.3 | A configuração inicial é possível pelo próprio cliente | Nenhuma etapa exige o time do produto | 🖥️ 👥 |
| B3.4 | Mais de um usuário pode ser adicionado com papéis distintos | Convite e atribuição de papel funcionando | 🖥️ 📁 |
| B3.5 | Existe estado inicial utilizável | Nenhuma tela vazia sem próximo passo | 🖥️ |

B3.2 costuma ser subestimado e é frequentemente o bloqueador silencioso de adoção: sem importação, o
produto só serve para operações novas, que são uma fração pequena de qualquer mercado.

## B4 · Operar o fluxo crítico — peso 3,0

A dimensão que decide o eixo. Derive a cadeia com `references/critical_path.md` **antes** de pontuar.

### Bloco 1 — Cobertura da cadeia 🔗

Um item por elo, nota 0–4. A nota do bloco é a do **elo mais fraco**, nunca a média.

| Nota | Estado do elo |
|:---:|---|
| 0 | Não existe |
| 1 | Existe parcialmente; o cliente completa fora do sistema |
| 2 | Existe, mas exige contorno, retrabalho ou suporte |
| 3 | Funciona de forma autônoma para o caso normal |
| 4 | Funciona também nos casos de exceção do dia a dia |

### Bloco 2 — Qualidade operacional (4 itens fixos)

| # | Item | Evidência | Fonte |
|---|---|---|---|
| B4.a | Um ciclo completo de trabalho acontece sem sair do sistema | Nenhum elo depende de ferramenta externa | 🖥️ 🔗 |
| B4.b | Erro de operação é corrigível pelo próprio usuário | Desfazer, editar, estornar, cancelar — sem chamar suporte | 🖥️ |
| B4.c | O fluxo funciona no dispositivo onde o trabalho acontece | Percorrido no contexto real de uso | 🖥️ |
| B4.d | O volume de um cliente típico é suportado sem degradação | Teste com volume representativo, não com dados de demonstração | 🔌 👥 |

### Nota final de B4

```
B4 = menor valor entre (nota do elo mais fraco) e (média do bloco 2)
```

O mínimo entre os blocos, e não a média, porque os dois são condições necessárias: cadeia completa que
o usuário não consegue corrigir sozinho não sustenta operação real, e qualidade operacional impecável
numa cadeia rompida não fecha ciclo nenhum.

## B5 · Depender e confiar — peso 1,5

Adoção exige que o cliente aposte a própria operação no sistema.

| # | Item | Evidência | Fonte |
|---|---|---|---|
| B5.1 | O cliente exporta os próprios dados sem pedir | Exportação disponível na interface, em formato utilizável | 🖥️ 📁 |
| B5.2 | Indisponibilidade tem comunicação prevista | Canal e responsável definidos antes do primeiro incidente | 👥 |
| B5.3 | O cliente sabe o que acontece com seus dados se cancelar | Prazo e procedimento declarados | 🖥️ 👥 |
| B5.4 | Trabalho em andamento não se perde | Rascunho, salvamento automático ou confirmação de saída | 🖥️ |
| B5.5 | Mudanças no produto são comunicadas antes de aparecerem | Registro de alterações ou aviso prévio | 🖥️ 👥 |

## B6 · Ser atendido — peso 1,0

| # | Item | Evidência | Fonte |
|---|---|---|---|
| B6.1 | Existe canal de atendimento com tempo de resposta declarado | Canal real e prazo praticado, não prometido | 🖥️ 👥 |
| B6.2 | Existe material de ajuda que cobre as dúvidas frequentes | Base de conhecimento ou ajuda contextual | 🖥️ |
| B6.3 | O suporte diagnostica sem acesso direto ao armazenamento | Ferramenta interna de diagnóstico | 📁 👥 |
| B6.4 | O cliente consegue relatar problema com contexto suficiente | Caminho de relato que captura o necessário | 🖥️ |
| B6.5 | Existe processo para o que o suporte não resolve | Escalonamento definido até a engenharia | 👥 |

B6.3 é o que separa suporte que escala de suporte que não escala. Quando diagnosticar exige consultar o
banco, o time de produto vira gargalo a partir de poucas dezenas de clientes.

## B7 · Permanecer conforme — peso 2,0

**Levante as exigências aplicáveis antes de avaliar.** Elas variam por setor, jurisdição, tipo de dado
tratado e porte do cliente. Não parta de uma lista pronta: pergunte ao time quais normas incidem, e
confirme se o levantamento foi feito por alguém qualificado.

| # | Item | Evidência | Fonte |
|---|---|---|---|
| B7.1 | As exigências aplicáveis estão levantadas e escritas | Relação de normas com origem identificada | 👥 |
| B7.2 | Cada exigência aplicável tem cobertura verificável | Mapeamento exigência → mecanismo no sistema | 📁 👥 |
| B7.3 | Termos e política de privacidade existem e são aceitos de forma registrada | Aceite vinculado à versão do documento | 🖥️ 📁 |
| B7.4 | Obrigações perante o titular dos dados são executáveis | Acesso, correção, exclusão e portabilidade funcionando | 📁 👥 |
| B7.5 | Registros exigidos por norma são retidos pelo prazo devido | Política de retenção coerente com a exigência | 📁 👥 |

Esta dimensão aponta risco, não emite parecer. Onde houver exigência não coberta, registre o achado e
recomende revisão especializada — jurídica, contábil ou setorial, conforme o caso.

---

## Nota sobre a fonte da evidência

O eixo B tem uma armadilha específica: **a existência de tela não é evidência de que o elo funciona**.
Muita interface conclui visualmente sem concluir de fato — grava um registro e não dispara o efeito,
mostra sucesso e deixa o trabalho pela metade.

Sempre que possível, percorra o fluxo de verdade em vez de inspecionar o código que o implementa. Onde
não for possível, marque o item como não verificado e diga o que faltou. Uma nota baixa e honesta é
mais útil que uma nota alta baseada em leitura de componente.
