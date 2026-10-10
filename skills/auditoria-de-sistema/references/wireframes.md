# Os visuais do relatório (Fase 7)

Os visuais existem para que quem não é da engenharia entenda o diagnóstico: o dono, o sócio, o gestor.
Se um visual só faz sentido para quem já leu o texto, ele não está fazendo o trabalho dele.

**Regra de presença:** há visuais **sempre presentes** e visuais **por gatilho**. Gatilho disparado, o
visual é obrigatório e entra sem perguntar. Gatilho não disparado, o visual não aparece nem é sugerido,
e uma linha no fim do relatório diz qual ficou de fora e por quê ("Caminho de ataque: nenhum
encadeamento provado"). A ausência também informa.

## Onde desenhar

O conteúdo é o mesmo em qualquer ambiente; muda o suporte. Confira a ferramenta antes de usar e nunca
chame uma que não existe.

- **Padrão: uma página publicada.** Um único arquivo HTML autocontido com todos os visuais, na ordem
  abaixo, publicado como página (no Claude Code, a ferramenta `Artifact`; carregue antes a skill de
  desenho de artefato quando ela existir, e siga o contrato dela). O diagnóstico em texto fica no chat,
  com o link da página.
- **No claude.ai com o visualizador em linha:** um widget por visual, intercalado com a prosa, com os
  nós clicáveis (`sendPrompt('Detalhe o achado C1')`).
- **Sem nenhum dos dois:** tabelas e barras em texto no chat.

Na página:
- Cores definidas no próprio arquivo como variáveis, em versão clara e escura, com fundo explícito no
  `body`. Bibliotecas só de CDN conhecida (Chart.js e ícones Tabler no cdnjs ou jsdelivr).
- Funciona na largura de celular, sem rolagem horizontal da página.
- Sem clique para aprofundar: cada achado leva o próprio código (C1, H3…) para o leitor pedir o detalhe
  no chat. Um sumário no topo com âncoras para cada visual.
- Título da página com o nome do sistema e a data; cabeçalho com o veredito em uma linha.
- Nada de segredo, nem mascarado pela metade: caminho e linha bastam.

## Regras que valem para todos

- **Legenda em todo visual que usa cor para codificar significado.**
- **Rótulos curtos.** O detalhe vai no texto.
- **Paleta fixa do começo ao fim:** vermelho = falha ou bloqueio, âmbar = atenção, verde-azulado = bom,
  cinza = neutro ou não verificado. Nunca troque no meio.
- **Veredito visível:** achado confirmado com marca cheia, plausível com marca vazada e a palavra
  "plausível". O leitor tem de ver de longe o que foi provado.
- **Na página, uma frase curta antes de cada visual** dizendo o que ele mostra e o que olhar primeiro.
  Na versão em widgets, a prosa fica fora e nunca há dois visuais seguidos.
- **Escreva no idioma do usuário.**

### Cor semântica: sempre o par, nunca o valor fixo

O tema inverte entre claro e escuro, e as variáveis de fundo e de texto invertem juntas. Valor fixo não
inverte, e o texto some.

| Fundo | Texto | Onde |
|---|---|---|
| `var(--bg-danger)` | `var(--text-danger)` | Falha, elo ausente, trava |
| `var(--bg-warning)` | `var(--text-warning)` | Atenção, elo parcial, plausível |
| `var(--bg-success)` | `var(--text-success)` | Resolvido, ponto forte |
| `var(--bg-accent)` | `var(--text-accent)` | Destaque neutro |
| `var(--fill-accent)` | `var(--on-accent)` | Preenchimento sólido |

Cor fixa só em elemento sem texto por cima (barra, ponto, seta). Linha inteira tingida e rótulo com o
mesmo fundo some: ou a linha é tingida e o rótulo fica sem fundo, ou a linha tem só uma borda lateral de
3px (`border-radius: 0` nesse lado) e o rótulo carrega o tingimento. Antes de publicar, procure
`color:` seguido de `#` em elemento com fundo tingido e corrija.

---

## Sempre presentes (8)

### 1. Funil da verificação

Logo depois do veredito. Do total de candidatos à divisão por veredito: confirmados, plausíveis, já
conhecidos, escolhas registradas, refutados. Barras horizontais ou funil, com o número de cada um. A
lista dos refutados, com o motivo de cada um, fica logo abaixo, recolhida (`<details>`). É o visual que
prova a precisão da auditoria.

### 2. Placar do eixo A

Barras horizontais, uma por dimensão, de 0 a 10: sigla e nome, barra, nota com uma casa e o peso. Cor
pela faixa: vermelho abaixo de 3, cinza de 3 a 7, verde-azulado acima de 7. Ordene da pior para a
melhor. Linhas de referência em 5,0 e 7,0. A parte não verificada aparece hachurada, para a cobertura
ser vista sem ser lida. HTML com `div`, não SVG.

### 3. Placar OWASP Top 10

Barras horizontais agrupadas (Chart.js, `indexAxis: 'y'`, altura por volta de 520px): cada categoria com
**atual** (coral) e **meta** (verde-azulado), de 0 a 10, rótulos `A01 …` a `A10 …` com os nomes da edição
vigente. Legenda própria em HTML. Categoria não avaliada aparece cinza com a palavra "não avaliada". Ao
lado de cada barra, os códigos dos achados que a puxaram para baixo. Abaixo, a média e a nota "por que
não 10".

### 4. Estrutura da aplicação com zonas de risco

SVG em três camadas: quem chega (visitante, cliente, provedores e seus webhooks) → aplicação (front,
rotas de servidor, funções) → dados (banco com RLS, views, storage, autenticação, agendadores). Nó
protegido em verde-azulado, nó com achado em vermelho (com o código), neutro em cinza. Caminho de
exposição provado em linha vermelha tracejada. `viewBox="0 0 680 H"`, `role="img"` com `<title>` e
`<desc>`, sem sobreposição.

### 5. Placar do eixo B, com a cadeia do fluxo crítico

Em cima, **a cadeia**: os elos em sequência, a nota de cada um e o elo mais fraco destacado. É o bloco
que mostra em uma olhada por que o cliente não adota (mais de 8 elos é granularidade errada). Embaixo,
as sete dimensões em barras, como no eixo A. Escrito no visual: a nota de B4 é a do elo mais fraco, não
a média.

### 6. Pontos fortes

Grade de cartões (`repeat(auto-fit, minmax(210px, 1fr))`): ícone de sucesso, título curto, onde está, uma
linha. Cobre segurança, estrutura e produto. Não é cortesia: diz o que a correção não pode quebrar. Com
menos de três, procure de novo antes de concluir que não há.

### 7. Pipeline de correção com a projeção

Três colunas (⏱️ Imediato, 📅 Próximo ciclo, 🔧 Contínuo) com os achados de cada horizonte e, ao fim de
cada uma, **as três notas projetadas** (A, B e OWASP). Abaixo, a curva da projeção (Chart.js, linha) com
uma linha tracejada no teto realista (por volta de 9). Marque o que libera trava (vem primeiro) e
**qual correção muda o quadrante**. Rotação de segredo vazado, quando houver, é visivelmente o primeiro
passo. Projeção conservadora.

### 8. Matriz de cruzamento (o fecho)

Quatro quadrantes: horizontal = eixo B, vertical = eixo A, divisões em 5,0. Nomes: **fundação sem porta**
(↖, âmbar), **pronto** (↗, verde-azulado), **canteiro de obras** (↙, cinza), **casa sem alicerce** (↘,
vermelho). Títulos no topo de cada célula, o ponto (B, A) no meio. Se o pipeline projeta mudança de
quadrante, seta pontilhada do ponto atual ao projetado. É o último visual; depois dele, só o diagnóstico
de processo.

---

## Por gatilho (13)

| Visual | Gatilho | Especificação |
|---|---|---|
| **Travas acionadas** | Alguma trava limitou a nota de um eixo | Cartões com borda esquerda vermelha: achado, eixo, teto, evidência, o que libera. Dizer que corrigir uma não libera se outra continuar. Sem trava, vira uma linha de confirmação no texto |
| **Pontos fracos** | Algum achado confirmado alto ou crítico | Grade de cartões: código, título, selo de gravidade, veredito, ícone do horizonte (`ti-clock` imediato, `ti-calendar` próximo ciclo) |
| **Saúde em produção** | Erros reais nos logs do período, fora o ruído | Tabela ou barras por rota ou função: quantos erros, pessoas afetadas, primeiro e último instante, e a mudança (PR, deploy, migração) mais próxima no tempo |
| **Antes × depois** | Modo reauditoria | Uma linha por achado anterior: fechado (verde-azulado), aberto (âmbar), regrediu (vermelho), novo (vermelho vazado); ao lado, a variação das três notas |
| **Decisões do dono** | Algum item depende do dono | Cartões: a decisão, o que fica travado enquanto ela não sai, a recomendação |
| **Mapa de acesso aos dados** | Algum dado sensível alcançável por papel indevido | Grade: linhas = dados sensíveis, colunas = papéis (`anon`, cliente, outro cliente, equipe, serviço); célula correta, indevida, ressalva ou esperada. Montado direto das provas da Fase 4 |
| **Caminho de ataque** | Encadeamento **provado** entre dois ou mais achados | SVG, uma linha por cadeia, até 4 passos, o último em vermelho (o resultado). Nunca inventar encadeamento para dramatizar |
| **Matriz de risco** | Mais de 5 achados confirmados | SVG 3×3: impacto (vertical) × probabilidade (horizontal), zonas do verde ao vermelho, achados como pílulas. Anotar a suposição que move uma pílula (ex.: cadastro fechado) |
| **Matriz risco × esforço** | Mais de 10 achados e a ordem de correção não é óbvia | Quadrantes risco × esforço com os códigos; o canto risco alto e esforço baixo em destaque |
| **Painel de webhooks e endpoints** | Algum webhook sem assinatura ou alguma função sem autenticação real | Duas listas: webhooks (assinado, sem assinatura, fraco) e funções sensíveis (valida o chamador, sem autenticação, falha aberta), com `ti-circle-check`, `ti-circle-x`, `ti-alert-triangle` |
| **Cobertura da auditoria** | Algum eixo abaixo de 80% de cobertura | Barras por dimensão: verificado, não verificado, não aplicável, e o que destravaria a cobertura |
| **Falha × desvio** | Mais desvios que falhas entre os achados | Duas colunas com os códigos e, em cada desvio, o gatilho que o torna falha |
| **Teste da substituição** | Algum elo do fluxo crítico ainda exige outra ferramenta | Os elos, marcando quais ainda dependem da ferramenta anterior e qual |

## Ordem na página

1. Cabeçalho: veredito em uma linha (pronto ou não, notas A, B e OWASP, quadrante, cobertura)
2. **Funil da verificação**
3. **Placar do eixo A**
4. **Placar OWASP Top 10**
5. **Estrutura com zonas de risco**
6. **Placar do eixo B com a cadeia**
7. *Saúde em produção*
8. *Travas*
9. *Pontos fracos*, seguidos dos condicionais de segurança que dispararam (mapa de acesso, caminho de
   ataque, painel de webhooks, matrizes)
10. **Pontos fortes**
11. **Pipeline de correção com a projeção**
12. *Antes × depois*
13. *Decisões do dono*
14. *Cobertura*, *falha × desvio*, *teste da substituição*
15. **Matriz de cruzamento**
16. Rodapé: visuais por gatilho que ficaram de fora e por quê

Em negrito, os sempre presentes; em itálico, os por gatilho.
