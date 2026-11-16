# Guia por gênero (pontos de partida)

Cada gênero tem um **default genérico** para o qual o Suno escorrega quando o prompt é vago. O trabalho é nomear os ingredientes que tiram a faixa desse default.

Legenda de confiança:
- **[fonte]** = recomendado por guias publicados sobre o Suno.
- **[sugestão]** = ponto de partida montado a partir de conhecimento musical geral, ainda não testado. Valide no primeiro take.

Regras que valem para todos:
- Gênero principal **na frente** do Styles. No máximo uma influência.
- Letra em português: `sung in Brazilian Portuguese` junto da voz e, se precisar, Exclude `English vocals`.
- Nomeie instrumentos e padrões rítmicos em inglês, com o nome brasileiro quando houver (tamborzão, cavaquinho, viola caipira).

---

## Funk brasileiro
**Default para onde escorrega:** pop latino / reggaeton genérico, ou trap escuro (no phonk). **[fonte]**

- Abra o Styles com `brazilian funk` ou `funk carioca` e cite o **tamborzão**: ele é a base rítmica que identifica o gênero. **[fonte]**
- Andamento típico: 130–150 BPM, conforme a vertente. **[fonte]**
- Voz: `call-and-response MC chant vocal` ou rap em português. **[fonte]**
- Grave: `deep punchy sub bass` ou `heavy 808`. **[fonte]**
- Vertentes: funk mandelão (grave distorcido, mais pesado), montagem, funk automotivo, brega funk. **[fonte]**
- Phonk brasileiro: ponha `Brazilian phonk, funk beat` **na frente**; se `phonk` vier primeiro, o Suno puxa o groove de trap em meio-tempo e perde a batida do funk. **[fonte]**

Ponto de partida:
```
brazilian funk (funk carioca), syncopated tamborzão drum pattern, deep punchy sub bass, call-and-response MC chant vocal sung in Brazilian Portuguese, bright synth stabs, tight percussive mix, 130 BPM
```
Exclude se escorregar: `reggaeton, latin pop, dembow` **[sugestão]**

## Gospel / louvor / worship
**Default para onde escorrega:** "pop cristão inspiracional" genérico, morno, por volta de 110 BPM. **[fonte]**

- Diga o **subgênero**: contemporary worship, traditional gospel, contemporary gospel, gospel choir, hymn-like worship, urban gospel. **[fonte]**
- Defina a **arquitetura vocal**: quem lidera, o papel do coro, se há chamada e resposta. É o que mais falta nos prompts que falham. **[fonte]**
- Base instrumental: piano, órgão (Hammond em gospel), pads, bateria ao vivo. **[fonte]**
- A dinâmica vai por tag: verso contido, refrão aberto, ponte de oração, refrão final maior. **[fonte]**

Pontos de partida:
```
contemporary worship, warm female worship lead vocal sung in Brazilian Portuguese, piano and pads, gentle live drums, singalong chorus, natural room reverb
```
```
gospel worship, soulful lead vocal with call-and-response choir, organ and piano, live drums, strong final chorus
```
Louvor congregacional brasileiro: descreva o coro como `congregational choir` e mantenha o refrão curto e repetível. **[sugestão]**

## Sertanejo
- `Brazilian viola caipira ten-string guitar` (só "viola" vira violino) + Exclude `violin, orchestral strings`. **[fonte]**
- Sanfona, banda completa; o coro de público no final é opcional. **[fonte]**
- Dueto: vozes alternadas, Vocal Gender vazio. Exclude `English vocals, rap, autotune`. **[fonte]**
- Andamento médio (90–100 BPM) é o mais comum. **[fonte]**
- Escreva como se canta: contrações e formas informais fazem parte do ritmo. **[fonte]**

```
male and female duet sung in Brazilian Portuguese, modern sertanejo, Brazilian viola caipira ten-string guitar, accordion, full band, polished radio mix, 95 BPM
```

## Pagode / samba
- Cavaquinho, pandeiro, surdo; backing vocals em grupo. **[fonte]**
- Respostas do coro entre parênteses na letra: `(ô, ô)`. **[fonte]**

```
romantic pagode, warm male vocal sung in Brazilian Portuguese, samba groove, cavaquinho strumming, pandeiro and surdo, group backing vocals, 94 BPM
```

## Forró / piseiro, MPB / bossa nova
- Forró: `accordion (sanfona), zabumba, triangle`; piseiro: teclado e grave eletrônico no lugar da zabumba. **[sugestão]**
- MPB/bossa: `nylon-string acoustic guitar`, voz intimista, arranjo enxuto; evite descritores de pista e de "big production". **[sugestão]**

## Rock / metal
- Grito só na tag da seção, nunca no Styles; evite `aggressive` (dispara grito). **[fonte: testes próprios no v5.5]**
- `industrial metal` espalha harsh pela faixa. **[testes no v5.5]**
- Solo grave e encorpado: `low register lead guitar, thick heavy tone` + Exclude `thin lead guitar, squealing guitar`. **[testes no v5.5]**
- Caixa seca de nu-metal vem de `down-tuned + mid-tempo + thick low end`; para bateria grande, `big reverberant drums, deep fat snare`. **[testes no v5.5]**
- Orquestra plena em toda seção = mix amontoado; uma cor dominante por seção. **[testes no v5.5]**

```
clean high male lead vocal, symphonic power metal, heavy distorted guitars, clean vocals throughout
```

## Eletrônica
- `four-on-the-floor`, sintetizador principal, `riser` e `drop` nas tags; uma parada total antes do drop. **[fonte]**

## Instrumental / trilha / jogo
- Nomeie instrumentos com precisão e diga que são reais; use só tags na letra; crie um motivo curto que volta; o solo ganha tag própria com base mais leve. Exclua MIDI, chiptune e vozes. **[fonte]**
- Para loop de jogo: mesmo BPM e tom em todas as fases; corte no início de um compasso. **[fonte]**

## Anos 80 / retrô
- Nomeie timbres da época (analog synths, gated reverb drums) e exclua sons modernos (EDM, supersaw). **[fonte]**

## Lo-fi / hip hop
```
mellow male rap vocal, lo-fi hip hop, dusty piano samples, vinyl warmth, 80 BPM
```
**[sugestão]**

---

## Palavras com efeitos colaterais observados

| Termo | Efeito | Alternativa | Origem |
|---|---|---|---|
| aggressive | grito/harsh | driving, intense, powerful | testes v5.5 |
| industrial metal | harsh espalhado | heavy metal + descrever o timbre | testes v5.5 |
| cinematic, epic | intro longa de trailer | symphonic, ou omitir | testes v5.5 |
| choir (genérico) | vozes femininas | male choir, men's choir | testes v5.5 |
| full orchestra em toda seção | mix amontoado | uma cor por seção + `clear uncluttered mix` | testes v5.5 |
| viola | violino | Brazilian viola caipira | fonte |
| phonk antes de funk | perde a batida do funk | Brazilian phonk, funk beat | fonte |
| muitos efeitos de voz | voz robótica | natural unprocessed vocal | fonte |
| radio-ready, mastered | nada | descrever posição e densidade | fonte |
| crisp, clear, professional (voz) | quase nada | in front of the band, close-miked, dry | fonte |
