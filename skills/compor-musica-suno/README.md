# Compor Música no Suno — da ideia à ficha pronta, e o conserto depois

Skill para **criar músicas no Suno (v6)** e **corrigir o que sair errado**. Funciona com qualquer gênero e idioma, para quem está começando e para quem produz álbuns. Nasceu de meses de produção real no Suno, cruzados com a documentação oficial (help.suno.com) e guias publicados — e diz com honestidade o que já foi testado e o que é ponto de partida.

## O que ela faz
- **Dois caminhos.** *Rápido*: poucas perguntas e a ficha completa de uma vez (presente, teste, iniciante). *Detalhado*: briefing → conceito e estrutura → letra → ficha, com aprovação em cada etapa (lançamento, álbum, série).
- **Ficha pronta para colar**: Title, Styles, Exclude, letra com tags de seção e todas as configurações (modelo, Variety, Style Influence, Weirdness, Vocal Gender, Duration, Max Mode), mais tradução linha a linha quando a letra não está no idioma de quem pediu.
- **O princípio que mais funciona**: o Styles descreve só o som constante; tudo o que muda (abertura, andamento, instrumentos, solos, vozes pontuais) vai nas tags de seção.
- **8 tipos de abertura** para acabar com a intro-clichê de 45 segundos.
- **Português e gêneros brasileiros**: funk, gospel/louvor, sertanejo, pagode, forró, MPB — com o que nomear para o Suno não escorregar no default de cada gênero.
- **Diagnóstico depois de gerar**: sintoma → causa → uma correção (intro longa, grito indesejado, voz abafada, gênero errado, canto em inglês, tag cantada, música que não termina, bloqueio de moderação…).
- **Edição sem refazer**: Replace Section, edição de letra do v6, Extend, Crop, Cover, Remaster; Voices e duetos; direitos por plano; download, masterização e distribuição.
- **Gera direto, se o Suno estiver conectado** (Suno MCP), sempre confirmando antes porque gasta créditos.

## Estrutura
```
compor-musica-suno/
├── SKILL.md                      # o fluxo, os campos, as configurações e a escrita da ficha
└── references/
    ├── generos.md                # guia por gênero + palavras com efeitos colaterais
    ├── diagnostico.md            # sintoma → causa → correção, voz abafada, moderação
    └── edicao-e-lancamento.md    # edição, Voices, direitos, download, masterização, álbuns
```

## Requisitos
- Uma conta no **Suno** (Free usa o v6-mini e só permite uso não comercial; Pro/Premier liberam v6, v6-wild e uso comercial).
- Opcional: **Suno MCP** conectado ao Claude, para gerar sem sair da conversa.
- Opcional: a skill [**music-master**](../music-master/) para masterizar e preparar o lançamento.

## Instalação
**claude.ai:** compacte a pasta e suba em *Customize → Skills → "+" → "+ Create skill"*.
```bash
cd skills && zip -r compor-musica-suno.zip compor-musica-suno
```
**Claude Code:**
```bash
git clone https://github.com/thiagoferal-ia/thiago-feral-skills.git
mkdir -p ~/.claude/skills
cp -r thiago-feral-skills/skills/compor-musica-suno ~/.claude/skills/
```

## Uso
Peça em linguagem natural, por exemplo:
- "Faz uma música de aniversário pro meu pai, sertanejo, no Suno."
- "Quero um louvor em português, voz feminina, refrão fácil de cantar."
- "O Suno está ignorando meu estilo e a intro demora demais."
- "A voz saiu enterrada no refrão, como resolvo?"

> O Suno trata tags como sugestões, não comandos. A skill dá pontos de partida e um método de teste (uma mudança por vez, ouvindo os dois takes); a decisão final é do seu ouvido.

---
Skill desenvolvida por **Thiago Feral | Inteligência Artificial**.
