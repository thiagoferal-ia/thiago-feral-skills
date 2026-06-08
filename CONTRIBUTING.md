# Como adicionar uma skill ao hub

Cada skill é uma pasta dentro de `skills/` com um `SKILL.md` na raiz.

## Padrão mínimo

```
skills/<nome-da-skill>/
├── SKILL.md            # obrigatório: cabeçalho YAML (name, description) + instruções
├── README.md           # documentação para humanos (use a supabase-owasp-audit como modelo)
├── references/         # opcional: material carregado sob demanda
└── assets/             # opcional: banners, imagens
```

## Regras do `SKILL.md`

- **`name`**: minúsculas-com-hífens, igual ao nome da pasta.
- **`description`**: o gatilho. Diga **o que faz** e **quando usar**, com termos que o usuário usaria.
  Seja um pouco "insistente" — o Claude tende a subutilizar skills. Limite: **1024 caracteres**.
- Mantenha o corpo do `SKILL.md` enxuto (ideal < 500 linhas) e empurre detalhe para `references/`,
  apontando claramente quando ler cada arquivo.

## Checklist

- [ ] `SKILL.md` valida (name + description; description ≤ 1024 chars).
- [ ] `README.md` da skill criado, com requisitos e instalação.
- [ ] Skill registrada na tabela do catálogo no `README.md` do hub.
- [ ] Testada no Claude Code e/ou claude.ai.

## Empacotar para o claude.ai

```bash
cd skills && zip -r <nome-da-skill>.zip <nome-da-skill>
```
Suba o ZIP em *Customize → Skills → "+" → "+ Create skill"*.
