# Guia de instalação de skills

Este guia vale para qualquer skill deste repositório. Os exemplos usam a skill
`supabase-owasp-audit`, mas o procedimento é o mesmo para as demais — basta trocar o nome.

> **Importante:** skills **não sincronizam entre superfícies**. Uma skill instalada no claude.ai
> não aparece automaticamente no Claude Code (e vice-versa). Instale em cada lugar onde for usar.

> **Fonte oficial:** Web → [support.claude.com](https://support.claude.com/en/articles/12512180-use-skills-in-claude) ·
> Claude Code → [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills).
> Os passos abaixo refletem esses docs; se a interface mudar, a fonte oficial prevalece.

---

## O que é uma skill, na prática

Uma skill é uma **pasta** com um arquivo `SKILL.md` (instruções + um cabeçalho YAML com `name` e
`description`) e, opcionalmente, uma pasta `references/` com material de apoio. O Claude lê a
`description` e decide sozinho quando usar a skill. Você não precisa "chamá-la" manualmente — embora
possa pedir explicitamente.

```
supabase-owasp-audit/
├── SKILL.md            ← obrigatório (o Claude lê isto)
└── references/         ← carregado sob demanda
    └── ...
```

---

## Método A — Claude Web (claude.ai)

A skill é enviada como um **arquivo ZIP** contendo a pasta da skill.

1. **Obtenha o ZIP da skill.** Duas formas:
   - Baixe o `.skill` já empacotado (é um ZIP — veja "Empacotar" abaixo), **ou**
   - Baixe/clone este repositório e compacte a pasta da skill:
     ```bash
     cd skills
     zip -r supabase-owasp-audit.zip supabase-owasp-audit
     ```
2. No claude.ai, abra **Customize → Skills** (em algumas contas: *Settings → Capabilities → Skills*).
3. Clique em **"+"** e depois em **"+ Create skill"**.
4. **Faça upload do ZIP** contendo a pasta da skill.
5. A skill aparece na lista e pode ser **ligada/desligada** por um toggle. Deixe ligada.
6. Para usar, comece uma conversa e descreva a tarefa (ex.: *"audite a segurança do meu app Supabase"*).
   Para esta skill, lembre de **conectar o Supabase** (MCP) e **anexar o ZIP do repositório** a ser auditado.

> Se o uploader aceitar só `.zip` e você tiver um `.skill`, **renomeie a extensão** de `.skill` para
> `.zip` — é o mesmo formato (um arquivo ZIP).

### Empacotar / renomear

- O `.skill` é um ZIP. Para transformá-lo em `.zip`: `cp supabase-owasp-audit.skill supabase-owasp-audit.zip`.
- Para criar do zero a partir da pasta: `zip -r supabase-owasp-audit.zip supabase-owasp-audit`.

---

## Método B — Claude Code (pasta local)

No Claude Code, a skill é só uma **pasta com `SKILL.md`** colocada num diretório que o Claude Code lê.
Há dois níveis:

| Nível | Caminho | Quando usar |
|---|---|---|
| **Pessoal (user)** | `~/.claude/skills/<skill>/` | Disponível em **todos** os seus projetos |
| **Projeto (project)** | `<repo>/.claude/skills/<skill>/` | Compartilhada com o time **via git** naquele projeto |

### Opção 1 — copiar a pasta (rápido)

```bash
# clone o hub uma vez
git clone https://github.com/<voce>/thiago-feral-skills.git

# instale como skill PESSOAL (vale em todos os projetos)
mkdir -p ~/.claude/skills
cp -r thiago-feral-skills/skills/supabase-owasp-audit ~/.claude/skills/

# ou instale só NESTE projeto (compartilha com o time via git)
mkdir -p .claude/skills
cp -r /caminho/thiago-feral-skills/skills/supabase-owasp-audit .claude/skills/
```

### Opção 2 — link simbólico (a skill acompanha o repo atualizado)

```bash
ln -s "$(pwd)/thiago-feral-skills/skills/supabase-owasp-audit" ~/.claude/skills/supabase-owasp-audit
```

### Verificar

```bash
ls ~/.claude/skills/supabase-owasp-audit/SKILL.md   # deve existir
```

Inicie uma **nova sessão** do Claude Code (`claude`) e peça algo que case com a descrição
(ex.: *"faça uma auditoria OWASP do meu app Supabase"*). O Claude carrega a skill automaticamente.

### Ligar / desligar

Para desativar temporariamente, renomeie a pasta com um underscore na frente (o Claude ignora):

```bash
mv ~/.claude/skills/supabase-owasp-audit ~/.claude/skills/_supabase-owasp-audit
```

Renomeie de volta para reativar.

### Windows / WSL

- Rodando no **WSL**, o caminho é `~/.claude/skills/` **dentro** da distro WSL — não no Windows.
- A pasta `.claude` é oculta; no Explorer ative *Exibir → Itens ocultos*.
- Referências internas no `SKILL.md` usam barra normal (`/`), mesmo no Windows.

---

## Problemas comuns

- **A skill não carrega:** confirme que `SKILL.md` está **diretamente** dentro de
  `~/.claude/skills/<skill>/` — e não aninhado um nível a mais (ex.:
  `~/.claude/skills/supabase-owasp-audit/supabase-owasp-audit/SKILL.md` está **errado**).
- **Não dispara sozinha:** descreva a tarefa em vez de tarefas triviais; o Claude tende a usar skills
  em pedidos substantivos. Você também pode pedir explicitamente para usar a skill.
- **Mudou de superfície e sumiu:** skills não sincronizam — reinstale na outra superfície.
