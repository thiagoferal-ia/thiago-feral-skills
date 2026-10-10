# Metadados, capa e plataformas

## Onde cada formato guarda as tags

| Formato | O que o album.mjs grava | Quem lê |
|---|---|---|
| MP3 | ID3v2.3 (UTF-16) + ID3v1 + capa (APIC) | tudo, inclusive Explorer do Windows, YouTube, celulares |
| WAV | RIFF INFO (título, artista, álbum, ano, gênero, faixa, copyright) + bloco `id3 ` com todos os campos e capa | players (foobar, VLC, Mp3tag), DAWs, distribuidoras. **Explorer do Windows não mostra** |
| FLAC | Vorbis comments + capa | players, distribuidoras |
| M4A | atoms iTunes + capa | Apple, players |

Por que ID3v2.3 e não 2.4: o Windows e vários carros/players antigos leem mal a 2.4.

## Campos e onde aparecem

| Campo | ID3 | Comentário |
|---|---|---|
| Título | TIT2 | título real, com pontuação |
| Artista | TPE1 | "Artistas participantes" no Windows |
| Artista do álbum | TPE2 | agrupa o álbum nos players |
| Álbum | TALB | |
| Agrupamento | TIT1 | coleção/série; o Explorer não tem coluna para ele |
| Ano | TYER | |
| Nº da faixa | TRCK | "N/total" |
| Disco | TPOS | |
| Gênero | TCON | por faixa |
| Compositor | TCOM | |
| Copyright | TCOP | "℗ 2026 Nome" para gravação |
| ISRC | TSRC | código por gravação, emitido pela distribuidora; não invente |

## Capa

JPG quadrado, RGB, 3000×3000 (distribuidoras exigem ≥ 3000; MP3 aceita menor). Arquivo de até ~1–2 MB para não inchar cada faixa. Sem texto pequeno, logos de plataformas, URLs ou preços — distribuidoras rejeitam. Se o usuário só tiver a capa do Suno (geralmente 1024px ou menos), use para MP3/YouTube e avise que para distribuidora precisa de uma maior.

## Tags que a origem deixa nos arquivos

- **Suno**: `comment` com "made with suno", data e ID da geração; `lyrics-eng` com o prompt completo de estrutura e a letra; `sga`; capa embutida; artista = usuário do Suno. A masterização e o modo rápido removem tudo.
- **DAWs**: `encoder`, às vezes BWF (`bext`) com data/hora. Removidos na masterização.

## Plataformas

- **YouTube**: lê o áudio do vídeo, não as tags do MP3; as tags ajudam a organizar o arquivo e alguns fluxos (YouTube Music via distribuidora). Normaliza para ~-14 LUFS.
- **Distribuidoras** (DistroKid, ONErpm, CD Baby, Tratore): pedem WAV 16 ou 24-bit, 44,1 kHz ou mais, sem cortes no início; metadados são digitados no site delas (as tags do arquivo não substituem). Use `master.mjs --bits 16` se a distribuidora exigir 16-bit.
- **Spotify/Apple**: normalizam (~-14 / -16 LUFS). Master mais alto toca no mesmo volume, só com menos dinâmica.

## Nomes de arquivo

Proibidos no Windows: `\ / : * ? " < > |` e ponto/espaço no fim. O padrão é trocar por `_` (barra vira ` _ `, como o Suno exporta). Mantenha o título correto nas tags.
