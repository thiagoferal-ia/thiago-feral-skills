# Questionários do time

Nenhum código responde a estas perguntas. Sem elas, a cobertura máxima fica em torno de 73% no eixo A e
bem abaixo disso no eixo B, que é majoritariamente externo ao repositório.

Envie os dois blocos na **Fase 0**, antes de começar. As respostas chegam enquanto você analisa.

## Como perguntar

Peça **evidência, não opinião**. "Vocês testam a cópia de segurança?" recebe sim. "Qual foi a data da
última restauração executada, e quem executou?" recebe a verdade — ou um silêncio que já é a resposta.

Se a pessoa responder com adjetivo ("temos um processo sólido"), peça o artefato: a data, o link, o
número, o print. Adjetivo não pontua.

---

## Bloco 0 — Contexto que calibra tudo

Não pontua, mas muda a leitura de quase todos os achados.

1. O que o sistema faz, e para quem? Quem paga por ele?
2. Está em produção? Há quanto tempo, e com quantos clientes?
3. Quantas pessoas trabalham nele hoje?
4. Que tipo de dado ele guarda? Há dado pessoal, financeiro ou sensível?
5. Existe alguma exigência contratual ou regulatória em vigor?
6. Qual é o próximo marco: primeiro cliente, escala, captação, venda?

O mesmo achado muda de cor conforme o contexto. Falta de fila com 3 clientes é desvio; com 300, é
falha. Uma auditoria que ignora isso produz um plano que o time vai, com razão, ignorar de volta.

---

## Bloco A — Eixo estrutural

**Continuidade — as mais importantes**
1. Qual a data da última restauração de cópia de segurança executada de verdade, e quem executou?
2. Existem tempo e ponto de recuperação definidos? Quais são os números?
3. Já houve reversão de publicação em produção? Quando, e quanto tempo levou?

**Entrega**
4. Toda alteração passa por revisão de outra pessoa? É obrigatório na ferramenta ou é combinado?
5. A branch principal é protegida contra envio direto?
6. Publicar com alteração de schema exige janela de indisponibilidade?

**Operação**
7. Quando ocorre um erro em produção, quem é avisado, por qual canal, e em quanto tempo?
8. Qual foi o último incidente relevante e quanto tempo levou para ser diagnosticado?
9. Existe uma tela que responde "está tudo bem agora?", ou o time descobre pelo cliente?

**Testes e dados**
10. O ambiente de teste usa dado real? Se sim, ele é anonimizado?
11. Quanto tempo leva a suíte completa?

**Privacidade e acesso**
12. Quem da equipe consegue acessar dado de cliente em produção, e isso fica registrado?
13. Alguém acessa o armazenamento de produção diretamente? Com qual credencial?
14. Já houve pedido de exclusão ou portabilidade por um titular? Como foi atendido?
15. Existe contrato com os terceiros que tratam dado de cliente?
16. Existe rotina de descarte de dado antigo, ou tudo fica para sempre?

**Time**
17. Se a pessoa que mais conhece o sistema sair amanhã, o que para de funcionar?
18. Quantas pessoas conseguem publicar hoje?

---

## Bloco B — Eixo de produto

**Fluxo crítico — faça estas primeiro**
1. Descreva um dia normal do seu cliente usando o sistema, do início ao fim do trabalho.
2. Existe alguma etapa em que ele precisa sair do sistema — planilha, papel, outra ferramenta, mensagem
   para vocês?
3. Um cliente já conseguiu completar um ciclo inteiro sozinho, sem ninguém do time por perto?

As respostas 1 e 2 alimentam diretamente a derivação da cadeia (`critical_path.md`). A resposta 3 é o
melhor indicador isolado de B4 que existe.

**Aquisição e receita**
4. Como uma pessoa que não conhece vocês descobre o produto hoje?
5. Ela consegue contratar e pagar sozinha, ou alguém do time precisa agir?
6. Já entrou dinheiro pelo caminho automático, ou toda cobrança foi manual até agora?
7. O que acontece hoje quando um cliente não paga?
8. Como um cliente cancela?

**Entrada**
9. Um cliente novo traz histórico de onde? Ele consegue trazer para dentro do sistema?
10. Quanto tempo leva entre o "sim" e o cliente trabalhando de verdade? Quem participa?

**Confiança e atendimento**
11. Como um cliente pede ajuda hoje, e quanto tempo leva para ser respondido?
12. Quando um cliente relata um problema, o time consegue diagnosticar sem consultar o banco?
13. O cliente consegue extrair os próprios dados se quiser sair?
14. O que vocês fazem quando o sistema fica indisponível? Como o cliente fica sabendo?

**Conformidade**
15. Quais normas se aplicam a este produto — do setor, da jurisdição, do tipo de dado?
16. Esse levantamento foi feito por alguém qualificado, ou é a percepção do time?
17. Existe termo de uso e política de privacidade aceitos de forma registrada?

A pergunta 16 costuma ser desconfortável e é a mais útil do bloco. Levantamento regulatório feito por
intuição é a origem mais comum de descoberta tardia e cara.

---

## Quando não houver respostas

Siga adiante. Marque como **não verificados**, retire do denominador e reporte a cobertura com
honestidade no cabeçalho:

> Eixo A 7,2 · cobertura 71% — 19 itens dependem de confirmação do time
> Eixo B 4,1 · cobertura 48% — a cadeia não foi validada com o usuário

Uma nota alta com cobertura baixa deve deixar o leitor desconfortável. É essa a intenção.

**Uma exceção:** se a cadeia do fluxo crítico não puder ser validada com o usuário, não pontue B4 por
conta própria. Reporte o eixo B como incompleto e diga exatamente o que falta. B4 pesa 3,0 de 12,0 —
estimá-la sem validação produz um número que parece rigoroso e não é.
