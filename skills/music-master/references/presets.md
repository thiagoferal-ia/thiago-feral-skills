# Perfis por gênero

Valores reais em `scripts/presets.json` (é ele que o `master.mjs` lê; ajuste lá se quiser mudar um perfil).

| Perfil (`--preset`) | Gêneros | Mono abaixo de | Largura | Grave-médio | Brilho 12k | De-esser | Compressão | Alvo |
|---|---|---|---|---|---|---|---|---|
| `metal` | metal, rock, hard rock, sinfônico, power, doom, prog, punk | 110 Hz | 1,10 | -1 dB @250 | +1,5 | 0,3 | 1,5:1 @-16 | -10 |
| `electronic` | EDM, house, techno, trap, phonk, dubstep, drum & bass | 150 Hz | 1,15 | -1 dB @300 | +1,5 | 0,2 | 2:1 @-14 | -9 |
| `pop` | pop, sertanejo, pagode, axé, forró, gospel/worship, k-pop, reggaeton | 120 Hz | 1,10 | -1 dB @250 | +1,5 | 0,35 | 1,7:1 @-16 | -10 |
| `hiphop` | hip-hop, rap, funk carioca, R&B, drill, grime | 130 Hz | 1,05 | -1 dB @300 | +1,0 | 0,35 | 1,8:1 @-15 | -10 |
| `acoustic` | folk, MPB, bossa, jazz, blues, country, singer-songwriter, acústico | 80 Hz | 1,05 | -0,5 dB @250 | +1,0 | 0,3 | 1,3:1 @-20 | -14 |
| `orchestral` | clássico, trilha sonora, cinematic sem bateria, ambient, piano solo, new age | 60 Hz | 1,00 | — | +0,5 | — | — | -16 |
| `lofi` | lo-fi, chillhop, chill, bedroom | 100 Hz | 1,00 | -1 dB @250 | 0 | 0,2 | 1,5:1 @-18 | -12 |
| `generic` | misto, indefinido, trilha com voz | 110 Hz | 1,05 | -0,5 dB @250 | +1,0 | 0,3 | 1,4:1 @-18 | -12 |

## Como escolher

- Pelo elemento que define a energia: bateria e guitarras distorcidas → `metal`; batida eletrônica e sub forte → `electronic`; voz na frente com banda → `pop`; voz falada/rimada sobre beat → `hiphop`.
- Metal sinfônico/cinematic com orquestra **e** bateria → `metal`, mas considere `--target -11` se o material tiver muita dinâmica (LRA > 7): orquestra sofre cedo com limitação.
- Na dúvida entre dois perfis, use o mais conservador (menor compressão, alvo mais baixo) e deixe o usuário pedir mais.

## Ajustes automáticos por faixa (feitos pelo master.mjs)

| Sinal na análise | Correção |
|---|---|
| Faixa ≥ 5 dB mais escura (>12 kHz) que a mediana do álbum, ou "ar" < -24 dB | +1,5 dB extra de brilho |
| Grave-médio (120–500 Hz) > +4 dB acima dos médios | corte extra de 0,5 dB |
| Médio-agudo (2–6 kHz) > +1 dB acima dos médios | -1 dB em 3,5 kHz |

## Leitura da análise

- **LRA < 4**: material já muito comprimido (típico de IA) — não comprimir mais; o perfil já é leve.
- **Pico real > -1 dBTP na origem**: pouco espaço; qualquer ganho depende do limitador.
- **LUFS muito diferente entre faixas**: normal; a masterização iguala todas no mesmo alvo.
- **Gravações caseiras** com ruído de fundo: este pipeline não remove ruído; avise e sugira tratar antes (ex.: `afftdn` com cuidado, ou ferramenta dedicada).
