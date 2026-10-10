# Derivar o fluxo crítico

O eixo B pesa 3,0 de 12,0 numa única dimensão — B4, a cobertura do fluxo crítico. Essa dimensão só pode
ser pontuada depois que o fluxo existe por escrito. Este arquivo traz o método.

## O erro que este método evita

**Nunca derive os elos a partir das telas que existem.** Se você abrir o sistema, listar o que ele faz e
chamar isso de fluxo crítico, o sistema passa a definir o próprio gabarito — e vai tirar nota alta com
cliente nenhum. O fluxo vem do *trabalho do cliente*, e o sistema é medido contra ele. Nessa ordem,
sempre.

## O método, em seis passos

### 0. Procure a cadeia já escrita

Antes de derivar qualquer coisa, inventarie a documentação do repositório: `docs/`, `README`,
`CONTRIBUTING`, registros de decisão, planos de produto, roadmap, definição de marcos, escopo por fase.

Procure especificamente por:

- **Definição de marco** — frases como "ao final desta fase o cliente consegue X de ponta a ponta"
  costumam conter a cadeia inteira em uma linha.
- **Sequência de execução ou ordem de dependência** — quando existe, já resolve a ordenação dos elos e
  explica por que cada um depende do anterior.
- **Escopo por fase ou por plano comercial** — separa o que é elo obrigatório do que é elo condicional
  ou add-on, respondendo de graça o passo 5.
- **Decisões declaradas com limitação** — certificações não buscadas, integrações adiadas, escopo
  cortado. Cada uma costuma impor um teto permanente a algum elo, por escolha e não por falha.

Quando a cadeia existe na documentação, ela é quase sempre mais completa que a inferida do código, e
traz a justificativa de cada dependência. Use-a como base e siga aos passos seguintes para validá-la —
não a copie sem passar pelo teste da substituição.

**A divergência entre a sequência planejada e a construída é achado, e dos fortes.** Se o plano ordena
A → B → C e o repositório mostra A e C prontos com B ausente, isso não é atraso: é um portão de
processo aberto, e costuma explicar a maior parte dos buracos do eixo B de uma vez só. Registre-o no
diagnóstico de processo.

Se não houver documentação alguma, siga do passo 1 — e registre a ausência como achado de A10.

### 1. Identifique quem paga e o que ele contratou

Quem paga nem sempre é quem usa. Escreva uma frase no formato:

> *[quem paga]* contrata este sistema para *[resultado que ele precisa produzir]*.

O resultado é um desfecho, não um recurso. "Emitir relatórios" é recurso. "Fechar o mês sem erro" é
desfecho. Se a frase contiver uma tela, refaça.

### 2. Descreva um ciclo completo desse trabalho

Ciclo é a menor unidade que produz valor e se repete. Pode durar minutos ou meses. Pergunte:

> Do momento em que o trabalho aparece até o momento em que ele está *concluído e liquidado*, o que
> acontece?

**O fim do ciclo é onde a obrigação do cliente termina — não onde a tela termina.** O erro mais comum
deste método é parar em "registrado" quando o ciclo real termina em "recebido", "entregue",
"homologado" ou "arquivado". Ciclo que para cedo demais produz sistema que ninguém adota.

### 3. Quebre o ciclo em elos

Elo é uma etapa que, se quebrar, impede o ciclo de terminar. Teste cada candidato:

> Se esta etapa não existisse no sistema, o cliente ainda conseguiria concluir o ciclo aqui dentro?

- **Não conseguiria** → é elo.
- **Conseguiria, com mais trabalho** → é recurso, não elo. Vai para B4 como qualidade operacional, não
  como elo da cadeia.

**Calibragem: 4 a 8 elos.** Menos que 4 costuma indicar granularidade grossa demais para revelar
buracos. Mais que 8 costuma indicar que recursos entraram na cadeia.

### 4. Aplique o teste da substituição

Para cada elo, pergunte:

> Para *este* elo, o cliente precisaria continuar usando a ferramenta anterior — planilha, caderno,
> outro sistema?

Qualquer "sim" é um elo ausente ou incompleto, mesmo que exista tela para ele. **Ninguém opera em dois
sistemas ao mesmo tempo**: um único elo dependendo da ferramenta antiga mantém a ferramenta antiga viva,
e o cliente não migra. Este teste captura buracos que a inspeção de tela não captura.

### 5. Valide com o usuário antes de pontuar

Apresente a cadeia e peça confirmação explícita — **inclusive quando ela veio pronta da documentação**.
Plano escrito é intenção declarada, não trabalho observado: escopos mudam, elos são cortados na prática,
e o documento pode estar desatualizado em relação ao que a operação realmente exige.

Duas perguntas fecham a validação:

1. Falta algum elo sem o qual o trabalho não termina?
2. Algum destes não é obrigatório para todo cliente?

Quando a cadeia veio da documentação, acrescente uma terceira: **o plano ainda descreve o produto que
vocês estão construindo?** Divergência entre plano e intenção atual é comum e muda a cadeia.

Elos que valem só para parte dos clientes viram elos condicionais: pontuam, mas com peso reduzido e nota
registrada à parte. Não os descarte — eles definem quais segmentos podem ser vendidos hoje.

## Como o resultado é usado

```
Elo 1 → Elo 2 → Elo 3 → Elo 4 → Elo 5
 3,0     4,0     0,0     3,0     2,0

Nota de cobertura da cadeia = 0,0  (o elo mais fraco, nunca a média)
```

A média daria 2,4 e sugeriria "parcialmente pronto". A realidade é 0: o ciclo não fecha, e nenhum
cliente adota. **Cobertura de fluxo não se mede em média, se mede no elo mais fraco.**

Cada elo recebe nota 0–4 na escala padrão:

| Nota | Estado do elo |
|:---:|---|
| 0 | Não existe |
| 1 | Existe parcialmente; o cliente completa fora do sistema |
| 2 | Existe e funciona, mas exige contorno, retrabalho ou suporte |
| 3 | Funciona de forma autônoma para o caso normal |
| 4 | Funciona também nos casos de exceção do dia a dia |

A nota 4 exige exceção tratada. Todo trabalho real tem cancelamento, correção, devolução, remarcação,
estorno, reprovação. Um elo que só atende o caminho feliz é 3, por melhor que seja.

## Exemplos do método aplicado

Dois domínios deliberadamente distantes um do outro, para mostrar que a forma da cadeia é a mesma e o
conteúdo nunca é.

**Sistema de gestão de fretes**
> Uma transportadora contrata este sistema para entregar cargas e receber por elas sem prejuízo.

Cotar → contratar → despachar → rastrear → comprovar entrega → faturar → receber

Note que o ciclo não termina em "entregue". Termina em "recebido" — é onde a obrigação se encerra. Um
sistema que faz os cinco primeiros elos com excelência e não fatura deixa a transportadora com duas
ferramentas, e ela fica com a antiga.

**Plataforma de cursos**
> Uma escola contrata este sistema para matricular alunos, entregar conteúdo e emitir certificado
> válido.

Divulgar → matricular → cobrar → entregar conteúdo → acompanhar progresso → avaliar → certificar

Aqui "certificar" é o elo terminal, e costuma ser o esquecido: sem certificado válido, o aluno não
conclui e a escola não pode vender o curso como formação.

Em ambos os casos, o elo que mais frequentemente falta é o **terminal** — aquele onde a obrigação se
encerra e o dinheiro ou o documento final se materializa. Procure ali primeiro.

## Quando o sistema não tem cliente pagante

Ferramenta interna, projeto de código aberto, sistema institucional. O método vale igual, com uma
substituição: onde se lê "quem paga", leia "quem depende do resultado". O elo terminal deixa de ser
financeiro e passa a ser o desfecho que justifica o sistema existir — o relatório entregue, o processo
homologado, o dado publicado.

Nesse caso, marque B2 (comprar e pagar) como não aplicável e retire seu peso do denominador. Não dê
zero a algo que não deveria existir.
