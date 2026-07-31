# Análise aprofundada (sempre)

Toda análise entrega, além da tabela com faróis, estas camadas de profundidade. Elas transformam o *retrato* (o que cada criativo faz) em *decisão* (o que fazer e por quê). Adapte-se ao contexto: o funil de causa vale para qualquer criativo; padrões, realocação e projeção precisam de um lote (vários criativos com resultado).

**Princípio honesto que rege tudo:** com amostras pequenas (poucas vendas), padrões são hipóteses, não leis — diga isso. E todo padrão que dependa de métrica de fundo de funil (conversão de página, ROAS) precisa passar pelo teste de atribuição: se a métrica está na zona ‼️ (>8% de conversão de página), pode ser artefato de atribuição por visualização, não propriedade real do criativo → validar na plataforma de vendas antes de confiar.

---

## 1. Funil de causa (por criativo relevante)

Mapeie os degraus e ache onde o dinheiro vaza:

```
Impressão → (gancho 3s) → Vídeo assistido (thruplay) → (clique no link) → Site → (compra)
```

Cada degrau tem uma métrica-diagnóstico. O vazamento é o primeiro degrau fraco — e cada tipo pede uma ação diferente:

| Tipo de vazamento | Sinal | Ação |
| --- | --- | --- |
| **Gancho** | Gancho 3s abaixo da faixa (a maioria não para) | Recortar só os 2 primeiros segundos; o resto do vídeo pode estar ok |
| **Retenção** | Gancho ok, mas retenção baixa (param e desistem no meio) | Encurtar / reordenar o miolo do vídeo; entregar a promessa mais cedo |
| **Ponte (clique)** | Vídeo assistido, mas CTR de link baixo (assistem e não vão ao site) | CTA mais claro/cedo, copy da legenda, oferta explícita |
| **Página** | Clique vem, mas conversão de página baixa (chegam e não compram) | Descasamento entre o que o criativo promete e o que a página entrega; ou a própria página |
| **Entrega cara** | Funil inteiro ok, mas CPM alto trava a conta | Testar formato nativo 9:16 (CPM alto ≈ baixa relevância no posicionamento); ou aceitar que não escala |

Valor: sem o funil, criativos com problemas diferentes caem todos no balde "ROAS baixo / aguardar". Com o funil, cada um recebe uma ação concreta (cortar abertura vs. mexer na página vs. trocar formato).

---

## 2. Padrões entre os vencedores (quando há lote)

1. Separe os criativos em **vencedores** (lucro líquido positivo OU ROAS ≥ empate com amostra mínima) e o restante.
2. Compare as distribuições de CPM, gancho, retenção, CTR de link e conversão de página entre os dois grupos.
3. Procure o traço que os vencedores compartilham e os perdedores não têm.
4. **Stress-test obrigatório:** se o diferenciador for uma métrica de fundo de funil (conversão de página / ROAS) e ela estiver na zona ‼️, o padrão pode ser atribuição inflada → marque como "validar na plataforma de vendas antes de confiar". Busque também um padrão que não dependa de atribuição (ex.: combinação de gancho + CPM) como leitura de reserva.
5. Traduza em regra para a próxima leva de criativos ("o ponto doce é X + Y").

Com poucos vencedores (2–3) ou poucas vendas cada, apresente como **hipóteses direcionais para testar**, nunca como lei.

---

## 3. Simulação de realocação (quando há lote)

1. Classifique: **pausar** (mortos/stop-loss/eficiência < 3), **continuar testando** (imaturos, < ~10 vendas, sem veredito de corte), **concentrar** (provados: ROAS ≥ saudável com amostra).
2. Regra de disciplina: **não concentre antes da maturidade.** Em fase de teste, a ação é *podar o peso morto* (libera verba) e deixar os candidatos amadurecerem — não despejar verba num vencedor de 4 vendas.
3. Estime a economia: verba dos criativos pausados × dias até a próxima revisão = quanto se poupa sem perder nenhum candidato.

---

## 4. Projeção de escala (para candidatos provados)

Para um criativo com ROAS ≥ saudável e amostra suficiente, modele o resultado de escalar para o orçamento B:

```
faturamento_dia ≈ B × ROAS_bruto
vendas_dia      ≈ faturamento_dia ÷ ticket_bruto
lucro_dia       ≈ vendas_dia × liquido_por_venda − B × (1 + imposto)
```

Rode **três cenários** para revelar o headroom, porque escalar quase sempre sobe o CPM e derruba o ROAS:
- ROAS se mantém
- ROAS cai para um valor intermediário
- ROAS cai ao empate (lucro ≈ 0)

Amarre à **economia unitária**: o teto de escala é o lucro por venda. Se o lucro/venda é baixo, nenhuma otimização de campanha destrava escala — só aumentar o valor por cliente (order bump/upsell) muda o teto. Quando for o caso, diga isso explicitamente: a alavanca está fora do Gerenciador.

---

## Ordem de entrega na análise

Depois da tabela com faróis e totais: (1) padrões entre vencedores → (2) funil de causa dos que importam → (3) realocação → (4) projeção de escala dos candidatos. Encerre sempre com os caveats (tamanho de amostra, atribuição, teste vs. produção) e o próximo ponto de checagem.
