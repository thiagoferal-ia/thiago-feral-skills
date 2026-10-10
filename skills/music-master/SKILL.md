---
name: music-master
description: Masteriza, ajusta volume, limpa metadados e prepara álbuns de música de qualquer gênero e origem (Suno, Udio, DAW, gravações), com ffmpeg. Analisa loudness (LUFS), pico real e espectro, aplica um perfil por gênero com um único limitador, gera faixa de teste e comparação no mesmo volume, renumera faixas, grava tags e capa em WAV/MP3/FLAC e exporta para YouTube, streaming ou distribuidora. Use sempre que o usuário quiser masterizar, remasterizar, "melhorar a qualidade", aumentar ou padronizar o volume, normalizar LUFS, tirar ou colocar metadados, gênero, capa ou número de faixa, converter para MP3 para subir, ou organizar um álbum ou EP — mesmo que não diga "masterizar" (ex.: "deixa essas músicas do Suno mais altas", "coloca artista e álbum nesses MP3", "prepara pra subir no YouTube", "as faixas estão com volumes diferentes").
---

# music-master

Pipeline de áudio para quem gera ou grava músicas e precisa entregá-las prontas: medir, masterizar, organizar e exportar. Funciona com qualquer gênero; o perfil de processamento e o loudness vêm do gênero e do destino.

Os scripts ficam em `scripts/` (Node ≥ 18, sem dependências, só ffmpeg/ffprobe). Chame-os com `node <SKILL_DIR>/scripts/<nome>.mjs`. Eles passam argumentos direto ao ffmpeg, sem shell, então nomes com apóstrofo, acento, `&` ou vírgula funcionam — prefira-os a montar comandos ffmpeg na mão, que é onde surgem os erros de aspas e de codificação no Windows.

## Limite honesto, e por que ele molda o fluxo

Você mede, mas não escuta. Por isso: ajustes conservadores, uma faixa de teste aprovada pelo usuário antes do lote, e comparação no mesmo volume (a versão mais alta sempre parece melhor — sem nivelar, o usuário julga volume, não qualidade). Diga isso ao usuário uma vez, sem drama.

## Escolha o modo

| O usuário quer… | Modo | Script |
|---|---|---|
| tirar metadados e/ou subir o volume X%, sem "masterizar" | **Rápido** | `quick.mjs` |
| melhorar o som, masterizar, padronizar volume do álbum | **Masterização** | `analyze.mjs` → `master.mjs` → `compare.mjs` |
| artista, álbum, gênero, nº de faixa, capa, ordem do álbum | **Álbum** | `album.mjs` |
| arquivo para subir (YouTube, distribuidora) | **Exportação** | `album.mjs --mp3` (ou `master.mjs --format flac`) |

Os modos encadeiam: masterização → álbum → exportação é o caminho completo.

## Antes de mexer

1. **Localize os arquivos** e rode `analyze.mjs` na pasta. Mostre a tabela: ela revela formato de origem, loudness, picos, compressão existente, faixas escuras e tags do Suno embutidas.
2. **Pergunte só o que falta**, de uma vez:
   - **Gênero** (define o perfil — `references/presets.md`). Se cada faixa tem um gênero, use o perfil dominante do álbum para manter coesão.
   - **Destino** (define o alvo de loudness e o formato — tabela abaixo).
   - **Origem**: se só houver MP3 e a fonte permitir WAV (Suno Pro/Premier, Udio, DAW), recomende baixar em WAV antes — masterizar a partir de MP3 empilha perdas.
3. **Originais nunca são sobrescritos** na masterização: saída sempre em outra pasta. No modo rápido (que substitui no lugar), o script guarda backup em `_backup-original/` dentro da pasta — avise o usuário onde ficou.

## Destino → alvo

| Destino | Alvo integrado | Teto (pico real) | Formato |
|---|---|---|---|
| Streaming (Spotify, Apple, Deezer) via distribuidora | -14 LUFS (até o do gênero, se o usuário quiser mais "peso") | -1 dBTP | WAV 24-bit ou FLAC |
| YouTube / redes | alvo do perfil do gênero | **-1,5 dBTP** | WAV master + MP3 320k |
| Arquivo, pen drive, DJ, vídeo sem normalização | alvo do perfil (pode ir +1 dB) | -1 dBTP | WAV + MP3 |

Explique a normalização quando o usuário pedir "mais alto": Spotify/YouTube abaixam tudo que passa de ~-14 LUFS, então volume extra só custa dinâmica nessas plataformas. O teto de -1,5 dBTP quando o destino é MP3 existe porque a conversão para MP3 sobe o pico real em ~0,3–0,5 dB.

Ao recomendar "quanto aumentar", converta: +1 dB ≈ +12%, +1,5 dB ≈ +19%, +2 dB ≈ +26%. Acima de ~+1 dB sobre um master já limitado, o limitador começa a achatar transientes.

## Masterização

```bash
node <SKILL_DIR>/scripts/analyze.mjs "<pasta originais>"
node <SKILL_DIR>/scripts/master.mjs "<pasta originais>" --out "<pasta masters>" --preset <perfil> [--target -10] [--ceiling -1.5] --first
node <SKILL_DIR>/scripts/compare.mjs "<pasta originais>" "<pasta masters>" --out "<pasta masters>/_comparar"
# após aprovação da faixa de teste:
node <SKILL_DIR>/scripts/master.mjs "<pasta originais>" --out "<pasta masters>" --preset <perfil> [--target ...] [--ceiling ...]
```

O que `master.mjs` faz, para você explicar em linguagem simples:
- corta subgrave inaudível; grave abaixo da frequência do perfil em mono (crossover Linkwitz-Riley, sem problema de fase); estéreo levemente mais aberto acima disso;
- EQ corretiva leve (grave-médio, e médio-agudo só se a análise apontar aspereza); brilho em 12 kHz, com reforço automático em faixas bem mais escuras que o resto do álbum;
- de-esser e compressão de "cola" leves, conforme o perfil;
- **um único limitador no fim**, com sobreamostragem, ajustando ganho e teto até o loudness e o pico real baterem — e mede o resultado.
- remove todos os metadados de origem (prompt, letra e IDs do Suno saem aqui).

Fluxo com o usuário: gere **uma faixa** (`--first` ou `--only "nome"`) e os pares de comparação; peça para ouvir os arquivos "A original" e "B master" lado a lado. Só depois processe o lote. Se ele pedir mais volume depois, **refaça a partir dos originais** com outro `--target` — nunca aplique ganho sobre um master já limitado (dois limitadores em série degradam mais que um).

Leia os avisos da tabela: "limitador apertando a dinâmica" significa alvo alto demais para aquele material — ofereça baixar 1 dB.

Saída padrão: `<nome> (Remastered).wav`, 24-bit, mesma taxa de amostragem da origem. Mantenha versões anteriores em pastas nomeadas pelo alvo (ex.: `Masterizadas -10 LUFS`) para o usuário comparar.

## Álbum (metadados, ordem, capa)

Monte um `album.json` com a ficha do álbum (formato em `references/manifest.md`). Fontes válidas para a lista de faixas: um print da playlist do Suno/Spotify (leia títulos, ordem e gênero de cada faixa da imagem), uma lista colada, ou os próprios nomes dos arquivos. Mostre a ficha ao usuário antes de aplicar se algo foi inferido (títulos com `?` ou `/`, gêneros, ordem).

```bash
node <SKILL_DIR>/scripts/album.mjs --manifest album.json --dir "<pasta masters>" --also-rename "<pasta originais>;<outras pastas>" --dry-run
node <SKILL_DIR>/scripts/album.mjs --manifest album.json --dir "<pasta masters>" --also-rename "..." --mp3
```

Sempre rode `--dry-run` primeiro e mostre o plano de renomeação; arquivos sem correspondência são listados e não são tocados. O script:
- renumera em duas etapas (evita um nome sobrescrever outro) e troca `?`, `/` e outros caracteres proibidos por `_` no **nome do arquivo** — o título correto vai nas tags;
- grava tags sem regravar o áudio e confere por hash que o áudio ficou idêntico;
- em WAV grava dois blocos (RIFF INFO + ID3) e a capa; em MP3, ID3v2.3 + ID3v1 + capa;
- com `--mp3`, gera MP3 320k ao lado de cada WAV, já com tags e capa;
- relê os arquivos e imprime a tabela de verificação.

Avise sobre WAV: o Explorer do Windows não mostra tags de WAV mesmo quando elas estão lá (players e distribuidoras leem). Para conferir visualmente no Windows, use os MP3. Detalhes de campos, capa e plataformas: `references/metadata.md`.

## Modo rápido

```bash
node <SKILL_DIR>/scripts/quick.mjs "<pasta>" --gain-pct 25            # tira tags + aumenta 25%
node <SKILL_DIR>/scripts/quick.mjs "<pasta>" --gain-pct 25 --keep-tags
node <SKILL_DIR>/scripts/quick.mjs "<pasta>"                          # só tira tags (e capa)
```

Mantém o formato e não baixa o bitrate da origem. Se o ganho pedido levaria picos acima de 0 dB (comum em músicas de IA, que já vêm perto do máximo), o limitador segura — explique isso no relatório com os picos antes/depois.

## Relatório ao usuário

Fale em linguagem simples, curto. Inclua: onde estão os arquivos; tabela antes → depois (LUFS, pico real, LRA); ajustes por faixa que fugiram do perfil; avisos; o que ficou pendente (capa, ISRC, faixas faltando no manifesto). Termine com uma dica de escuta: comparar os arquivos A/B nivelados.

## Depois do áudio

Se a skill `music-to-video` (HyperFrames) estiver instalada e o usuário for publicar em vídeo, ofereça o próximo passo: transformar o MP3 masterizado em vídeo sincronizado com a batida (lyric video, slideshow com a capa, promo). Ela precisa de Python 3 com `librosa`, `numpy` e `soundfile`.

## Armadilhas conhecidas

- **Medir bandas com `bandpass` do ffmpeg** usa largura em Q por padrão (`w=60` vira Q 60) — por isso `lib.mjs` usa pares highpass/lowpass.
- **PowerShell 5.1**: `$hash[1]` em `[ordered]` retorna por posição, não por chave; stderr de executável nativo vira erro com `$ErrorActionPreference='Stop'`; scripts .ps1 sem BOM corrompem acentos. Use os scripts Node.
- **Bash do Git no Windows** converte caminhos e pode quebrar nomes com apóstrofo. Os scripts Node evitam o shell.
- **Gênero por faixa** pode diferir do perfil de masterização: o perfil é do álbum; o gênero da tag é de cada faixa.
