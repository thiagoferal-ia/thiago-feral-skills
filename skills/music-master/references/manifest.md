# Ficha do álbum (`album.json`)

Uma fonte única de verdade para ordem, títulos e tags. Salve-a junto das pastas do álbum para reaproveitar (ex.: adicionar faixas depois e rodar de novo).

```json
{
  "artist": "Soteria",
  "albumArtist": "Soteria",
  "album": "Dust & Shadow",
  "grouping": "The Long Night",
  "year": "2026",
  "genre": "Cinematic Symphonic Metal",
  "composer": "Soteria",
  "copyright": "℗ 2026 Soteria",
  "cover": "capa.jpg",
  "totalTracks": 12,
  "tracks": [
    { "n": 1,  "title": "Ex Nihilo", "genre": "Cinematic Symphonic Metal" },
    { "n": 2,  "title": "In the Beginning / The First Promise" },
    { "n": 4,  "title": "I Will Not Let You Go", "genre": "Symphonic Power Metal", "isrc": "BRXXX2600004" },
    { "n": 12, "title": "Watchman, What of the Night?", "file": "Watchman What of the Night" }
  ]
}
```

| Campo | Obrigatório | Observação |
|---|---|---|
| `artist`, `album` | sim | |
| `albumArtist` | não | padrão = `artist`; importante em coletâneas e feats |
| `grouping` | não | coleção/série/volume (ex.: obra em vários álbuns). Vai em ID3 TIT1 |
| `year` | recomendado | |
| `genre` | recomendado | padrão do álbum; `tracks[].genre` sobrescreve por faixa |
| `composer`, `copyright` | não | copyright de gravação usa ℗ (fonograma); © é da composição/arte |
| `cover` | não | caminho relativo ao JSON. JPG quadrado, 3000×3000 recomendado (mínimo 1400) |
| `totalTracks` | não | padrão = maior `n`. Gravado como "N/total" |
| `disc` | não | ex.: `"1/2"` para obras em mais de um disco |
| `tracks[].n`, `tracks[].title` | sim | título real, com `?` `/` `:` — o nome do arquivo é tratado à parte |
| `tracks[].file` | não | só quando o nome do arquivo não lembra o título |
| `tracks[].isrc`, `artist`, `composer`, `comment` | não | por faixa |

**Como os arquivos são casados com as faixas:** compara-se o título sem número inicial, sem "(Remastered)", sem acentos, pontuação e espaços. "07 - Answer by Fire.wav", "Answer by Fire (Remastered).mp3" e "answer-by-fire.flac" casam com `"Answer by Fire"`. Use `file` para casos que não casem.

**Lendo de um print** (Suno, Spotify, YouTube): pegue a ordem e os títulos da imagem; no Suno, o estilo abaixo de cada faixa é um bom gênero por faixa. Remova sufixos que não são título ("(Remastered)", "v5.5", contagem de plays). Confirme com o usuário títulos cortados por "…".
