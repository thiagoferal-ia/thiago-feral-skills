# Edição, vozes e lançamento

## Consertar sem refazer
Se o take é bom e só um trecho falhou, **proteja o que funciona** (curta ou salve o take antes de editar). Edição corrige problemas de precisão, não de identidade: se o gênero, a melodia ou a direção inteira estão errados, volte à ficha.

| Problema | Ferramenta |
|---|---|
| Uma palavra ou linha errada | Edição de letra do v6 / Edit Lyrics + Replace Section (o áudio do trecho é regenerado; mudar só o texto exibido não muda o som) |
| Uma seção fraca | Replace Section (selecione a menor região que falhou; reserve algumas tentativas) ou pedido em linguagem comum: "add strings only to the final chorus, keep the verses unchanged" |
| Falta uma seção ou um final | Extend (comece com uma tag estrutural; estenda da versão mais recente) |
| Sobra no começo ou no fim | Crop / Remove |
| Seções na ordem errada | Song Editor: mover seções |
| Mesma música em outro estilo | Cover (mantém letra e melodia) |
| Estrutura certa, som a polir | Remaster (não corrige estrutura, voz nem intro) |
| Mixagem fina, stems, MIDI | Get Stems; Studio (Premier); ou uma DAW externa |
| Gera uma versão nova inteira | Remix (não conserta trechos) |

Get Stems separa por instrumento, não por cantor: num dueto, as vozes costumam sair na mesma faixa.

## Vozes

### Voz de outro gênero em um trecho
Gere a faixa inteira com a voz principal, sem mencionar a outra na letra e com Exclude da outra. Depois insira a segunda voz só nos trechos dela com Replace Section, trocando o Vocal Gender apenas nessa operação.

### Mesma voz em várias faixas — Voices
- **Voices** substituiu Personas no menu Create; as **Style Personas** continuam disponíveis dentro do menu Voices. Para criar uma Voice a partir de uma música: abra a música na biblioteca → Create → Voice.
- Fonte: a faixa com a voz mais limpa e exposta. Nunca uma com grito ou efeito pesado — a aspereza contamina as próximas.
- A Persona carrega o Styles da faixa de origem: se trouxer termos indesejados (solo, BPM, arranjo), limpe e deixe só gênero + voz.
- Guarda timbre e entrega, não melodia nem fraseado.
- **A própria voz:** grave ou envie uma amostra; há verificação por leitura de frase. Só para maiores de 18 anos e não disponível em todos os países. Só a própria voz, nunca a de outra pessoa.

### Voices × v6: a documentação está desencontrada
O FAQ de Voices manda selecionar o **v5.5** porque "outros modelos não suportam o New Voices", mas o FAQ do v6 diz que todos os modelos anteriores foram aposentados. O artigo de troca de modelo só diz para usar um "modelo compatível". Até o Suno esclarecer:
1. Anexe a Voice e **abra o seletor de modelo**: use o que ele oferecer com a Voice anexada.
2. Faça um teste curto antes de usar numa faixa importante.
3. Se a voz não soar como a original, **suba o Audio Influence** e, para a própria voz, use uma gravação a cappella limpa.
4. Se o recurso não aparecer ou falhar, descreva a voz no Styles e use Max Mode para manter a consistência; se o problema continuar, fale com support@suno.com.
Custom Models foram migrados automaticamente para o v6; músicas antigas feitas com eles não mudam.

## Direitos (não é aconselhamento jurídico)
- **Free:** só uso pessoal, não comercial; assinar depois **não** dá licença retroativa.
- **Pro/Premier:** músicas feitas **enquanto assinante** têm uso comercial, mantido após cancelar. Regenere no plano pago o que for publicar.
- **A letra própria é da pessoa** em qualquer plano. O áudio gerado pode não ser protegível por copyright. Passar pela moderação não é liberação jurídica: para lançamento comercial, a pessoa deve verificar por conta própria.
- Uploads (áudio, Custom Models, Voices): só material que a pessoa tem direito de usar.

## Download, masterização e distribuição
- **Downloads são limitados por plano** (no fim de 2026: Free 7 no total, Pro 20/mês, Premier 60/mês; confira em suno.com/pricing). Ouça no navegador e baixe só a versão final, em **WAV**.
- **Masterizar ≠ Remaster.** Se a skill **`music-master`** estiver disponível (mesmo repositório, roda no Claude Code com Node e ffmpeg), passe para ela: masteriza por gênero, padroniza o volume, compara A/B no mesmo volume, grava tags e capa e exporta para YouTube, streaming ou distribuidora. Sem ela: BandLab Mastering (grátis), Matchering (iguala a uma faixa de referência; bom para álbum coerente) ou uma DAW.
- Referências de volume: cerca de −14 LUFS para Spotify e YouTube Music, −16 LUFS para Apple Music, pico verdadeiro em −1 dBTP. Gêneros pesados costumam ir mais alto. Masterização não desenterra uma voz nem tira chiado.
- Correções de EQ depois de baixar: um realce suave acima de ~8 kHz devolve brilho a um render escuro; um corte em 200–400 Hz reduz o som "de caixa". Não criam detalhe que o render não tem.
- **Distribuição:** use uma agregadora com política clara para IA e declare o uso de IA quando pedido. Publicar primeiro no YouTube é um teste gratuito de recepção.

## Álbuns e séries
A variedade entre faixas vem do contraste **entre** elas, não de abandonar o refrão:
- **Duração:** a maioria enxuta; épicos longos raros e espaçados.
- **Andamento e peso:** duas rápidas não ficam lado a lado.
- **Tipo de abertura:** não repetir em faixas vizinhas.
- **Quem lidera:** voz na frente × instrumento na frente; vozes diferentes por faixa.
- **Densidade:** uma faixa enxuta ao lado de uma cheia.
- **Identidade:** mesma Voice e um Styles-base comum; Custom Model se a pessoa tiver catálogo próprio (mínimo de 6 músicas que ela tenha direito de usar).
- **Novidade:** não reaproveitar personagens, imagens ou frases de faixas anteriores da série.
