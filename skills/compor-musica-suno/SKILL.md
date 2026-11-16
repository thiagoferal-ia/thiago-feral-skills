---
name: compor-musica-suno
description: Cria músicas para o Suno (v6) do zero ou conserta faixas já geradas, em qualquer gênero e idioma. Conduz briefing, conceito e letra (com tradução linha a linha), monta a ficha pronta para colar — Title, Styles, Exclude, letra com tags de seção e configurações (Variety, Style Influence, Weirdness, Max Mode) — e diagnostica o resultado depois de gerar (intro longa, grito indesejado, voz abafada, gênero errado, canto em inglês, bloqueio de moderação). Cobre também Replace Section, Extend, Cover, Voices, direitos e lançamento. Use sempre que o usuário quiser fazer, escrever, compor, ajustar ou corrigir uma música no Suno, mesmo que não diga "skill" ou "prompt" (ex.: "faz uma música de aniversário pro meu pai no Suno", "o Suno tá ignorando meu estilo", "como deixo o refrão maior?", "a voz saiu enterrada", "make a Suno song", "Suno lyrics").
---

# Compor música para o Suno

Transforma uma ideia em uma ficha pronta para colar no Suno e ajuda a corrigir o resultado depois de gerar. Serve para qualquer gênero, idioma e nível de experiência.

> **Base atual: Suno v6** (lançado em 9/set/2026; todos os modelos anteriores foram aposentados). Tags são sugestões ao modelo, não comandos garantidos. Tudo aqui é **ponto de partida para testar**. Preços, limites e telas mudam: na dúvida, confira em help.suno.com e suno.com/pricing.

**Arquivos de referência** (leia quando o caso pedir):
- `references/generos.md` — o que nomear em cada gênero para não escorregar no default (funk, gospel, sertanejo, pagode, rock/metal, eletrônica, trilha…) e palavras com efeitos colaterais.
- `references/diagnostico.md` — tabela de sintoma → causa → correção, voz abafada, moderação.
- `references/edicao-e-lancamento.md` — edição local, Voices, direitos, download, masterização, distribuição, álbuns.

---

## 1. Como conduzir

### 1.1 Escolha o caminho
Leia o pedido e escolha. Na dúvida, pergunte em uma linha.

**Caminho rápido** — quem quer uma música pronta sem cerimônia (presente, piada, teste, iniciante).
1. Pergunte só o indispensável que ainda não foi dito (tema e gênero bastam; idioma e voz, se não der para deduzir).
2. Entregue a ficha completa de uma vez (formato 1.4).
3. Ofereça ajustes depois que a pessoa ouvir.

**Caminho detalhado** — quem está produzindo de verdade (lançamento, álbum, série, artista).
1. Briefing (1.2).
2. Conceito e estrutura: título, ângulo da letra, mapa de seções, tipo de abertura, caráter sonoro. **Espere aprovação.**
3. Letra completa no chat. **Espere aprovação.**
4. Ficha completa.
5. Ajuste pós-geração com `references/diagnostico.md`.
6. Edição e lançamento com `references/edicao-e-lancamento.md`.

### 1.2 Briefing (pergunte só o que faltar)
- Tema, história ou mensagem; para quem é a música
- Gênero principal (no máximo uma influência), clima, andamento aproximado
- Idioma da letra; tradução ao lado?
- Voz: masculina, feminina, dueto, coro; registro; limpa, rasgada, falada
- Duração; cantada ou instrumental
- Referências: se citar artista ou música, **traduza em características** (timbre, instrumentos, produção, época). O Suno remove ou bloqueia nomes de artistas.
- Plano: Free (só v6-mini, uso não comercial) ou Pro/Premier
- Letra própria ou escrita por você?

### 1.3 Regras de convivência
- O que a pessoa aprovou ou decidiu não volta à discussão.
- Pediu para "adicionar": escreva só o bloco novo, sem mexer no que já foi aprovado.
- Correção dada como direção ("ficou eletrônico demais") pede ajuste pontual, não recomeço.
- Letra fora do idioma da pessoa: tradução linha a linha ao lado, sem precisar pedir.
- Nunca use letras de terceiros, nomes de artistas ou marcas na ficha.

### 1.4 Formato da ficha (sempre igual, blocos separados para colar)

**Title:** …

**Styles:**
```
…
```

**Exclude styles:**
```
…
```

**Lyrics:**
```
[Primeira tag com o tipo de abertura explícito]
…
[End]
```

**Configurações:** Modelo · Variety 0 · Style Influence · Weirdness · Vocal Gender · Duration · Max Mode · Instrumental on/off · Voice/Custom Model (se houver)

**Tradução** (se aplicável): tabela original | tradução.

**Se não sair como esperado:** 1 a 3 ajustes já previstos, para testar um de cada vez.

### 1.5 Se o Suno estiver conectado (Suno MCP)
Existe um conector oficial do Suno (beta, desde 28/out/2026) que gera, estende e faz covers direto da conversa, usando os créditos da conta. Se as ferramentas do Suno estiverem disponíveis nesta sessão: monte a ficha, mostre, **confirme antes de gerar** (gasta créditos) e, depois, peça para a pessoa ouvir. Se não estiverem, entregue a ficha para colar e não prometa gerar.

---

## 2. Campos e configurações

### 2.1 Modos de criação
- **Simple:** uma caixa de descrição. No v6 entende pedidos complexos e aceita combinar músicas da biblioteca, áudio, imagem e vídeo; escolhe sozinho entre criar, Cover, Remix ou Extend. Bom para iniciantes e para explorar ideias.
- **Advanced (Custom):** campos separados. É o modo desta skill para letra própria ou controle fino.
- **Speech (beta):** fala com trilha, não música cantada.
- **Sounds:** samples, loops e efeitos curtos (Pro/Premier).

### 2.2 Campos do modo Advanced

| Campo | Limite (v6) | O que vai aqui |
|---|---|---|
| **Lyrics** | 5.000 caracteres | Letra + tags de seção entre colchetes |
| **Styles** | 1.000 caracteres | O som **constante** da faixa |
| **Exclude styles** (More Options) | 1.000 caracteres | O que **não** deve aparecer, na faixa inteira |
| **Title** | ~100 caracteres | Nome; quase não afeta o som, mas passa pela moderação |

Erros comuns: letra no Styles e estilo no Lyrics; Instrumental marcado com letra (a letra é ignorada); texto "Exclude:" colado dentro do Styles.

### 2.3 Modelos
| Modelo | Plano | Uso |
|---|---|---|
| **v6** | Pro/Premier | Faixas finais; o mais preciso e consistente |
| **v6-wild** | Pro/Premier | Explorar ideias inesperadas; segue menos o prompt. Refine o achado depois no v6 |
| **v6-mini** | Todos | Testes rápidos e baratos |
| **Custom Model** | Pro/Premier | Treinado com as músicas da própria pessoa (ela precisa ter os direitos) |

Todos geram até ~8 min por geração. Cada geração custa 10 créditos e entrega **dois takes**.

### 2.4 Configurações (More Options)

| Controle | Valor de partida | O que faz |
|---|---|---|
| **Variety** | **0** | O Suno documenta que ele varia os resultados **reescrevendo o Styles**; em 0, as tags ficam como foram escritas. Use 0 sempre que houver um Styles escrito com cuidado. Suba só para explorar ideias, sabendo que o Styles deixa de ser o seu. |
| **Style Influence** | 55–70% | Quanto segue o Styles. Suba se instrumentos ou BPM pedidos não aparecem; acima de ~75% pode ficar rígido ou caprichar demais na intro. Antes de subir, deixe o Styles coerente. |
| **Weirdness** | 30–40% com plano definido; 50% = "normal" | Quanto foge do óbvio. Alto = estruturas incomuns e mais artefatos. Se sair sem graça, suba de 5 em 5. |
| **Audio Influence** | só com áudio ou Voice | Quanto o áudio de referência (ou a Voice) ancora o resultado. |
| **Vocal Gender** | o do lead; vazio em duetos | Valor único para a faixa inteira. |
| **Duration** | Auto (Custom se a duração importa) | É uma meta, não um corte exato. Letra demais para pouco tempo faz o Suno correr e pular partes. |
| **Max Mode** | desligado nos testes, **ligado no take final** | Gasta mais créditos. Recomendado para faixas acima de 2 min, covers fiéis e consistência de voz/estilo. |
| **My Taste / Personalize** | desligado ao testar | Personaliza pelo gosto da conta; é mais uma variável. |

Os valores de Style Influence e Weirdness vêm de testes de usuários, não do Suno: são pontos de partida.

**Regra de teste:** mude **uma** coisa por vez e ouça **os dois takes** (de preferência gere 2–3 vezes) antes de concluir. A diferença entre takes pode ser maior que o efeito da mudança.

---

## 3. Escrevendo a ficha

### 3.1 O princípio central
**O Styles fala mais alto que as tags, e o que está nele vaza para a faixa inteira.**
- **Styles = o que é constante:** voz, idioma do canto, gênero, timbre principal, produção.
- **Tags = o que muda:** abertura, andamento por seção, instrumentos que entram e saem, solos, vozes especiais, dinâmica.
- **Negação nunca no Styles** ("no drums" pode ser lido como "drums"). Negação vai no Exclude.

### 3.2 Styles
**Fórmula:** `[voz e idioma], [gênero principal + no máximo uma influência], [2–3 instrumentos centrais], [clima], [produção], [BPM se for constante]`
- 4 a 7 descritores, separados por vírgula, o mais importante primeiro.
- **Em inglês**, mesmo com letra em outro idioma.
- Letra em português: `sung in Brazilian Portuguese` junto da voz.
- Sem nomes de artistas ou músicas, sem "masterpiece", sem "radio-ready", sem números de dB.
- Dois gêneros opostos no mesmo nível confundem.
- Para cada gênero, nomeie os ingredientes que o identificam: ver `references/generos.md`.

**Fora do Styles (vai para as tags):**
- **BPM, se o andamento muda** (andamento único pode ficar no Styles).
- **Arranjo denso** ("full orchestra") em faixa que deve variar.
- **Solo** ("guitar solo"): espalha solo e cria intro de solo.
- **Verbos de arco** (building, rising, slowly grows): o Suno monta o arco sozinho e atropela as tags.
- **Termos de trailer** (cinematic, epic): puxam intro longa.
- **Vozes pontuais** (grito, rap, soprano, narrador): vazam para a faixa toda.

### 3.3 Exclude styles
- Poucas categorias específicas (menos de dez), não frases.
- Termos genéricos (`ambient`, `slow build-up`) abafam instrumentos.
- Vale para a faixa inteira: não exclua algo que deve aparecer em um trecho.

Blocos prontos:
- Sem grito: `harsh vocals, screaming, growls, shouting`
- Sem intro longa: `long intro, long instrumental intro, slow build intro`
- Sem intro de solo: `guitar solo intro, lead guitar intro`
- Sem a outra voz: `female vocals` ou `male vocals`
- Sem inglês na voz: `English vocals, English lyrics`
- Sem eletrônico: `EDM, synth bass, programmed drums, trap hi-hats`
- Voz natural: `autotune, vocoder, robotic vocals`
- Voz seca e na frente: `heavy reverb, room ambience`
- Sem mix amontoado: `wall of sound, dense orchestration`
- Sem som ao vivo: `live recording, crowd noise`
- Viola virando violino: `violin, orchestral strings`
- Instrumental: `vocals, singing` (e ligue Instrumental)

### 3.4 Letra e tags

**Sintaxe**
- `[Colchetes]` = instrução, **não é cantado**. `(Parênteses)` = **é cantado**, em geral como backing vocal ou eco: use só para o que deve ser ouvido, como `(ô, ô)`. Nunca escreva instruções entre parênteses.
- Tags em **inglês**, mesmo com letra em outro idioma.
- **Tag sozinha na linha**, acima do trecho; linha em branco entre seções.
- **Uma ideia por tag**, curta. Tag longa é ignorada ou cantada.
- **Escreva o refrão inteiro em cada repetição** (nada de "refrão 2x").
- Numere os versos; termine com `[Outro]` e `[End]`.
- Nada de notas de planejamento, emojis ou URLs na letra.

**Tags estruturais:** `[Intro]` `[Verse]` `[Pre-Chorus]` `[Chorus]` `[Post-Chorus]` `[Hook]` `[Bridge]` `[Breakdown]` `[Build]` `[Drop]` `[Interlude]` `[Instrumental Break]` `[Guitar Solo]` `[Piano Solo]` `[Final Chorus]` `[Outro]` `[End]`

**Instrução local:** descreva a **mudança audível**, não adjetivos vagos.
- ❌ `[Chorus - epic]`
- ✅ `[Chorus - full band, choir joins, drums double]`
- ✅ `[Bridge - drums fall away, sparse piano, close vocal]`
- ✅ `[Outro - repeat hook twice, instruments strip back, hard stop]`

**Função de cada seção:** intro estabelece o mundo (curta); verso conta a história (menos denso que o refrão); pré-refrão cria expectativa; refrão é o gancho (peça a mudança audível); ponte quebra o padrão; outro decide o fim.

**Andamento e mudanças**
- Andamento variável: BPM na tag de cada seção, com apoio (`faster`, `half-time`). O Suno aproxima e suaviza; mudanças funcionam melhor logo após uma parada.
- Saiu no dobro ou na metade: `half-time` ou ajuste o número.
- Mudar de estilo a cada linha deixa a música "em onda": agrupe em poucos atos.
- Arco muito nítido: gere em partes com Extend.

**Pausas, cortes e energia**
- Reticências viram pausa; mais pontos, pausa maior.
- Corte seco: frase isolada entre pausas, com `[all music stops, voice only]`. Não é confiável: gere várias vezes ou use Replace Section.
- Energia: frases curtas, repetidas, com `!`. Calma: frases espaçadas.
- MAIÚSCULAS indicam onde a voz sobe ou grita: use pouco.

### 3.5 A abertura
Sem instrução, o Suno preenche a abertura com o clichê do gênero. **A primeira tag decide a abertura**, e **instrução positiva vence a negativa**: diga o que a abertura **é**.

1. **Voz imediata:** `[Verse 1 - vocals start on the first beat, full band from bar one]`
2. **Riff/levada primeiro:** `[Intro - main rhythm instrument alone, drums join after two bars, then vocals]`
3. **Bateria primeiro:** `[Intro - drum fill alone, then the full band hits together]`
4. **Vozes a cappella:** `[Intro - a cappella voices, two lines, then the band enters]`
5. **Refrão primeiro:** a letra abre com `[Chorus - full band on the first beat]`
6. **Golpe único:** `[Intro - one single hit, a sustained chord, no build, then the verse]`
7. **Gancho melódico:** `[Intro - lead instrument plays the chorus melody, four bars, then verse]`
8. **Voz + um instrumento:** `[Verse 1 - voice and piano only, the full band enters on verse 2]`

Batida entrando cedo numa abertura calma: repita `no drums, no beat` na tag inicial.

### 3.6 Escrevendo a letra
- **Escreva como se canta:** o Suno canta exatamente o que está escrito. Contrações ("cê", "tô", "pra") só se combinarem com o sotaque desejado.
- **Mesma grafia sempre** para a mesma palavra.
- Linhas de tamanho parecido dentro de um bloco (perto de 10–12 sílabas).
- **Gancho:** frase curta, fácil de cantar, que resume a música e volta no refrão.
- **Letra enxuta que repete** funciona melhor que letra longa com uma imagem nova por linha.
- Palavra mal pronunciada: sinônimo, acento conferido, grafia como soa ou linha mais curta; depois refaça só aquele trecho.
- Números e siglas por extenso ou soletrados ("três e quinze", "D-J").
- Idiomas misturados: blocos separados (`[Verse - Spanish]`); confira com quem fala a língua.

### 3.7 Vozes
- **Voz principal:** no início do Styles; acerte o Vocal Gender.
- **Para a voz ficar na frente:** descreva posição, não qualidade: `lead vocal in front of the band, close-miked and dry`.
- **Dueto:** não peça as duas vozes juntas no Styles. **Alterne por bloco ou linha**, uma tag por voz, e uma tag "ambos" só num trecho final. Vocal Gender vazio.
- **Voz pontual de outro gênero** (ex.: soprano numa faixa masculina): duas etapas, ver `references/edicao-e-lancamento.md`.
- **Coro:** especifique (`male choir`, `gospel choir`, `children's choir`); "choir" genérico pode trazer vozes femininas.
- **Narrador:** voz grave, `spoken word`, `no singing`; não exclua o gênero dessa voz.
- **Mesma voz em várias faixas ou a própria voz da pessoa:** Voices — ver `references/edicao-e-lancamento.md` (a compatibilidade com o v6 está mal documentada; o arquivo traz o procedimento de teste).
