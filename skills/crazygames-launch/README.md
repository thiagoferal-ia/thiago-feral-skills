# CrazyGames Launch — leve qualquer jogo web até a CrazyGames

Skill que conduz um jogo HTML5 do "tenho um build" até o "enviado na CrazyGames", e depois até o Full launch. Funciona com **qualquer engine**: Phaser, Pixi, Three.js, Unity WebGL, Godot, Construct, GameMaker, Cocos, Defold ou JavaScript puro. Quem pede também pode ser iniciante: a skill encontra os problemas antes do portal e entrega tudo mastigado.

## O que ela faz
- **Verifica o build e o SDK** pelas regras atuais da CrazyGames:
  - tamanho (inicial ≤ 50 MB, total ≤ 250 MB), limite de 1500 arquivos e `index.html` na raiz;
  - caminhos relativos;
  - SDK de outro portal ou rede de anúncios, login externo, links para fora do jogo, links de loja de apps;
  - trava de domínio e botão próprio de tela cheia;
  - quais chamadas do **SDK v3** estão presentes.

  Aceita uma pasta ou um zip.
- **Corrige o que dá**, com receitas para:
  - eventos de carregamento e de gameplay;
  - mudo que respeita o site;
  - anúncios que não travam o jogo (exigência inclusive na Basic, onde os anúncios vêm desligados);
  - save pelo módulo Data, com migração do localStorage.
- **Prepara a pasta de envio.** O portal **recusa .zip**: a skill entrega a pasta certa para o botão *Select folder*.
- **Faz as capas e os vídeos** nos tamanhos exatos:
  - capas em 1920x1080, 800x1200 e 800x800, conferindo a área dos selos no canto superior esquerdo;
  - vídeos sem som, com até 20 s e **começando pela capa**, em 1920x1080 e em **1080x1620 (2:3)**. O portal recusa 1080x1920.

  Ela grava o jogo no navegador, inclusive com WebGL, ou ajusta gravações que você entregar.
- **Escreve a ficha da loja**: categoria, até 5 tags, descrição e controles, em inglês.
- **Responde cada campo do formulário e cada item do checklist de QA** com o motivo, e marca o que você ainda precisa conferir no preview e no celular.
- **Explica o depois**:
  - prazo da revisão;
  - as métricas da Basic launch (tempo de jogo, retenção no dia 1, conversão no primeiro minuto e cliques na capa);
  - a passagem para o Full launch, com anúncios;
  - o bônus de +50% por exclusividade.

## Estrutura
```
crazygames-launch/
├── SKILL.md                 # o fluxo completo
├── references/
│   ├── requirements.md      # regras Basic e Full, limites, jogabilidade, anúncios, dinheiro (com fontes e data)
│   ├── sdk.md               # SDK v3 módulo a módulo + receitas de correção + outras engines
│   ├── form.md              # o formulário do portal, campo a campo, e o checklist de QA
│   └── media.md             # especificação de capas e vídeos, como gravar, como revisar
├── assets/
│   └── listing-template.md  # modelo da ficha da loja
├── scripts/                 # Node, sem dependências
│   ├── check_build.mjs      # verificação estática do build e do SDK (pasta ou zip)
│   ├── serve.mjs            # servidor local + página de gravação em tamanho exato
│   ├── stage.html
│   ├── recorder.js          # grava o canvas e tira capturas (funciona com WebGL)
│   └── media.mjs            # vídeos, capas, prévia da área dos selos, folha de quadros (ffmpeg)
└── evals/                   # 3 casos de teste (claude plugin eval)
```

## Requisitos
- **Claude Code**, porque os scripts rodam localmente. No claude.ai a skill orienta, mas não roda os scripts.
- **Node.js 18+**.
- **ffmpeg** para capas e vídeos: Windows `winget install Gyan.FFmpeg` · macOS `brew install ffmpeg` · Linux `apt install ffmpeg`.
- **Um navegador que o Claude controle** (opcional) para jogar e gravar. Sem ele, você grava a tela e a skill corta e redimensiona.

## Instalação (Claude Code)
```bash
git clone https://github.com/thiagoferal-ia/thiago-feral-skills.git
mkdir -p ~/.claude/skills
cp -r thiago-feral-skills/skills/crazygames-launch ~/.claude/skills/
```
Abra uma nova sessão e peça, por exemplo: *"coloca meu jogo na CrazyGames, o build está em dist/"*.

## Exemplos de pedido
- "Quero publicar meu jogo na CrazyGames pela primeira vez. Prepara tudo."
- "A CrazyGames recusou meu vídeo: Incorrect video dimensions (1080x1920)."
- "Meu jogo vai passar na CrazyGames? Está nesse zip."
- "Recebi o convite para o Full launch. O que preciso mudar?"

## Testes
Rodada inicial com 3 casos: kit completo de envio, vídeo recusado e jogo cheio de problemas. **100% dos critérios com a skill e 72% sem ela.** A maior diferença: sem a skill, o Claude manda subir um zip, que o portal recusa, e inventa campos do formulário.

## Atualidade
A CrazyGames muda as regras. As referências foram conferidas em **14/11/2026** na documentação oficial (docs.crazygames.com) e num envio real pelo portal. Os fatos têm data e fonte, e a skill relê a documentação quando tem acesso à web.

Não é afiliada à CrazyGames.
