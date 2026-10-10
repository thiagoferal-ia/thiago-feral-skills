# Music Master — masterização, volume e metadados de música

Skill para deixar músicas **prontas para publicar**: mede, masteriza, padroniza o volume, organiza o álbum e exporta. Funciona com **qualquer gênero e qualquer origem** (Suno, Udio, DAW, gravações) — o processamento se adapta ao gênero e ao destino (YouTube, streaming, distribuidora, arquivo).

## O que ela faz
- **Análise** de cada faixa: loudness (LUFS), pico real, dinâmica (LRA) e equilíbrio de frequências; aponta faixas escuras, ásperas, já muito comprimidas e tags do Suno embutidas.
- **Masterização por perfil de gênero** (metal, eletrônico, pop/sertanejo, hip-hop/funk, acústico/MPB, orquestral, lo-fi, genérico): limpeza de subgrave, grave em mono, EQ leve, de-esser, compressão de cola e **um único limitador** com controle de pico real. Correções automáticas por faixa (ex.: reforço de agudos em faixa mais escura que o resto do álbum).
- **Faixa de teste + comparação nivelada**: gera trechos "A original" e "B master" no mesmo volume, para julgar qualidade e não volume.
- **Álbum**: a partir de uma ficha (`album.json`, que pode ser montada lendo um print da playlist), renumera as pastas, grava título, artista, álbum, gênero por faixa, nº "N/total", compositor, copyright, ISRC e **capa** em WAV, MP3 e FLAC — conferindo por hash que o áudio não mudou.
- **Exportação**: WAV 24-bit para distribuidora e MP3 320k para YouTube/redes, com tags e capa.
- **Modo rápido**: tira metadados e/ou aumenta o volume X% sem distorcer, com backup.

## Estrutura
```
music-master/
├── SKILL.md                 # o fluxo: modos, destinos, perguntas, relatório
├── references/
│   ├── presets.md           # perfis por gênero e ajustes automáticos
│   ├── manifest.md          # formato da ficha do álbum (album.json)
│   └── metadata.md          # tags por formato, capa, plataformas, nomes de arquivo
└── scripts/                 # Node, sem dependências; chamam ffmpeg/ffprobe
    ├── analyze.mjs          # medição
    ├── master.mjs           # masterização
    ├── compare.mjs          # A/B no mesmo volume
    ├── album.mjs            # renumeração, tags, capa, MP3
    ├── quick.mjs            # strip + ganho
    ├── presets.json         # valores dos perfis
    └── lib.mjs
```

## Requisitos
- **Claude Code** (os scripts rodam localmente).
- **Node.js 18+**.
- **ffmpeg** com ffprobe — Windows: `winget install Gyan.FFmpeg` · macOS: `brew install ffmpeg` · Linux: `apt install ffmpeg`. Os scripts encontram o ffmpeg no PATH, na pasta do winget ou pelas variáveis `FFMPEG`/`FFPROBE`.

## Instalação (Claude Code)
```bash
git clone https://github.com/thiagoferal-ia/thiago-feral-skills.git
mkdir -p ~/.claude/skills
cp -r thiago-feral-skills/skills/music-master ~/.claude/skills/
```

## Uso
Peça em linguagem natural, por exemplo:
- "Masteriza as músicas da pasta X, são metal sinfônico, vou subir no YouTube."
- "Tira os metadados dessas músicas do Suno e aumenta o volume em 25%."
- "Coloca artista, álbum, capa e gênero de cada faixa conforme esse print."

A skill sempre analisa antes, gera uma faixa de teste para você ouvir e só depois processa o lote. Os originais nunca são sobrescritos na masterização.

> A skill mede, mas não escuta: os ajustes são conservadores e a decisão final é do seu ouvido.

---
Skill desenvolvida por **Thiago Feral | Inteligência Artificial**.
