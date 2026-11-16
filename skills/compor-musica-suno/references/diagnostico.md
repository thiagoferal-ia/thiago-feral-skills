# Diagnóstico depois de gerar

Peça à pessoa: **qual take, qual trecho (minuto ou linha), o que ouviu e o que queria.**
Depois: sintoma → causa → **uma** correção → gerar → comparar os dois takes.

**Primeiro passo, sempre:** abra a página da música e confira o Styles salvo. Se estiver diferente do que foi colado, o Variety estava acima de 0. Ponha em 0 e gere de novo antes de qualquer outro ajuste.

Se várias tentativas não resolverem, **simplifique** (menos tags, Styles mais curto) em vez de acrescentar.

## Estrutura e campos

| Sintoma | Causa provável | Correção |
|---|---|---|
| Sai sem voz | Instrumental marcado; campos trocados | Desmarcar Instrumental; letra no Lyrics, estilo no Styles |
| Ignora o gênero pedido | Variety acima de 0; Styles longo ou contraditório | Variety 0; gênero na frente; 4–7 descritores; subir Style Influence |
| Tag ignorada ou pulada | tag longa, colada na frase, contradita pelo Styles | tag curta, sozinha na linha; tirar a contradição |
| Tag cantada | tag longa ou parecida com letra | encurtar |
| Instrução cantada | instrução entre parênteses | mover para colchetes |
| Corre e pula partes | letra demais para a duração | enxugar a letra ou aumentar a duração |
| Não termina / repete o fim | sem marcador de fim | `[Outro]` + `[End]`; Crop |
| Termina abrupto | sem outro ou duração curta | `[Outro]` antes do `[End]`; Extend |
| Música "em onda" | mudanças de estilo demais e curtas | agrupar em poucos atos |

## Abertura e arranjo

| Sintoma | Causa provável | Correção |
|---|---|---|
| Intro longa antes do canto | primeira tag sem abertura; termos de trailer; Style Influence alto | tipo de abertura explícito; tirar cinematic/epic; Exclude de intro; Crop |
| Batida entra cedo | abertura sem restrição | `no drums, no beat` na tag inicial |
| Mix amontoado | arranjo denso em todas as seções | uma cor por seção; `clear uncluttered mix`; Exclude `wall of sound` |
| Refrão não cresce | só a tag `[Chorus]` | pedir a mudança audível; enxugar o verso |
| Ponte igual ao verso | sem quebra de textura | `[Bridge - drums fall away, sparse…]` |
| Instrumento indesejado insistente | termo gatilho no Styles ou na Voice/Persona | achar o termo; Exclude específico |
| Gênero escorrega para o default | ingredientes do gênero não nomeados | ver `generos.md` |

## Voz

| Sintoma | Causa provável | Correção |
|---|---|---|
| Canta em inglês | idioma não indicado | `sung in Brazilian Portuguese`; Exclude `English vocals` |
| Voz errada (gênero/idade) | voz descrita no fim do Styles | voz no começo; Exclude da voz indesejada |
| Grito onde não devia | grito, "aggressive" ou gênero pesado no Styles | grito só na tag da seção; Exclude de grito |
| Voz robótica | efeitos demais | `natural unprocessed vocal`; Exclude `autotune, vocoder` |
| Dueto não aparece | vozes simultâneas pedidas | alternar por linha, uma voz por tag |
| Voz muda entre seções | sem Voice; take inconsistente | Voices; Max Mode no take final |
| Palavra mal pronunciada | grafia, acento, palavra difícil | sinônimo, grafia como soa, refazer só o trecho |
| Perde o ritmo num ponto | linha longa ou vogais esticadas demais | encurtar a linha; refazer só aquele trecho |
| Linha corrida | frase colada na próxima | `[Silence]` no fim da linha que corre, sem pontuação antes; só em linhas escolhidas |

### Voz abafada ou enterrada (queixa comum no v6)
Separe a causa antes de corrigir:
- **Densidade:** a voz clareia quando a banda sai → instrumentos demais na faixa da voz. Diga por seção o que **não** toca embaixo da voz (`verse - acoustic guitar and bass only, no pads, no strings`) e exclua pads, cordas e camadas de synth.
- **Posição:** a voz está limpa, mas baixa → descreva posição, não qualidade: `lead vocal in front of the band, close-miked and dry`. Repita na tag do refrão se ela afundar ali. Termos de reverb e sala vão para o Exclude.
- **Render:** a faixa já é opaca desde a intro, ou soa chiada/borrada → não há prompt que resolva. Gere de novo (a qualidade varia mais entre gerações do que entre prompts), teste o v6-wild, encurte a faixa (os problemas se concentram na segunda metade de músicas longas; mantenha abaixo de ~3:30 ou gere a segunda metade à parte) ou use um áudio de referência de melodia.
- Voz clara no começo e enterrada no fim: Max Mode no take final.
- `radio-ready`, `mastered`, `crisp`, `professional` não fazem nada.
- Remaster: prefira o ajuste de variação sutil com foco em clareza; evite os que "abrem" o som (podem enterrar a voz); em faixas lo-fi ou escuras, use o ajuste natural ou pule.

## Moderação e bloqueios

| Sintoma | Causa provável | Correção |
|---|---|---|
| "Prompt contained inappropriate material" / "didn't pass our content checks" | nome de artista ou pessoa famosa, marca, letra existente, termos ofensivos ou difamatórios, palavrões em excesso. O título também é verificado | 1) salvar o original; 2) testar um Styles neutro com a mesma letra; 3) se passar, o problema está no Styles/título; se não, isolar a letra por partes; 4) descrever sem nomes. **Não tente burlar o filtro** |
| "Your lyrics contain copyrighted material" em letra própria | falso positivo da moderação | guardar rascunhos datados e prints; reescrever o trecho suspeito ou falar com support@suno.com |
| Falha genérica sem mensagem de moderação | instabilidade | simplificar, tentar mais tarde, checar o status do Suno |
