# Verificação (Fase 4)

A coleta acha candidatos. Esta fase decide quais são achados. **Nenhum candidato chega ao relatório sem
veredito**, e todo veredito tem evidência que outra pessoa consegue reproduzir.

## Os cinco vereditos

| Veredito | Quando | O que vai no relatório |
|---|---|---|
| ✅ **Confirmado** | Provado ao vivo: consulta e resultado, requisição e resposta, log com data | Achado completo, com a prova |
| ◐ **Plausível** | Evidência real, mas só no código ou na configuração; a prova ao vivo não foi possível | Achado com "prova pendente: o que falta para confirmar" e confiança reduzida |
| ✗ **Refutado** | Não procede | Uma linha na lista de refutados, com o motivo |
| ↺ **Já conhecido** | Tem ID aberto no registro do projeto | Uma linha apontando o ID; pesa na nota uma vez só |
| ◇ **Escolha registrada** | O projeto documentou que é deliberado | Uma linha apontando onde; se a revisão venceu, dizer |

Regressão (o registro diz resolvido, a medição diz aberto) é **confirmado**, com a marca "regrediu".

## Ordem de trabalho

1. **Deduplicar.** O mesmo problema visto pelo relatório do provedor, por uma sonda SQL e por um `grep`
   é um candidato só, com as três evidências.
2. **Cruzar com as fontes de verdade** (`fontes_de_verdade.md`): ID conhecido, escolha registrada,
   regra violada.
3. **Provar** pelo protocolo do tipo, abaixo.
4. **Classificar** o que sobrou (gravidade, horizonte, OWASP, ASVS ou API Top 10, CWE, falha ou desvio).

## Protocolos de prova por tipo

### Acesso a dado (RLS, view, função, bucket)

A prova é **ler como o papel que não deveria ler**, numa transação que não deixa nada:

```sql
begin;
select set_config('request.jwt.claims',
  json_build_object('sub', '<uuid de um usuário real do papel>', 'role', 'authenticated')::text, true);
set local role authenticated;              -- ou anon, sem claims
select count(*) from public.<tabela>;      -- o que esse papel enxerga
-- para "outro cliente": filtrar pelo id da organização alheia e esperar 0
rollback;
```

Para várias medidas de uma vez, termine com `do $$ ... raise exception 'PROVA a=% b=%', ... $$` e leia os
números na mensagem de erro; o erro desfaz tudo. Escrita (INSERT, UPDATE) se prova do mesmo jeito,
sempre dentro da transação desfeita.

Bucket: tente listar e baixar com a chave pública (`anon`) por HTTP. Função `SECURITY DEFINER`: chame com
o papel e confira se o guard interno barra.

### Função de borda e rota de API

Chame sem credencial, com credencial de cliente e com credencial de outro cliente. Anote o status e o
corpo. "Exige o cabeçalho" não é autenticação: se a função aceita qualquer token sem validá-lo, a prova
é uma chamada com token inventado.

### Webhook

Mande um corpo plausível sem assinatura (ou com assinatura errada) **para um ambiente que não seja
produção**, ou leia o código e marque como plausível. Nunca dispare webhook falso em produção.

### Segredo no código ou no histórico

Para cada ocorrência: o que é? Antes de tratar como segredo real, confira:
- é um valor de exemplo, truncado (`eyJ...`), um UUID, um nome de chave de armazenamento local, uma
  chave pública por desenho (a chave `anon` do Supabase, uma chave publicável)?
- o arquivo ainda existe? O valor ainda está em uso em algum lugar (cofre, variável de ambiente)?
- a chave dá acesso a quê, se alguém a usar hoje?

Só é confirmado o segredo real com poder hoje. Segredo real que já foi trocado é "refutado: rotacionado
em <data>", e o histórico continua sendo um desvio de processo.

### Configuração (autenticação, CORS, cabeçalhos, sessão)

Leia a configuração ao vivo (API de gestão do provedor, resposta HTTP real). Arquivo de configuração no
repositório é intenção.

### Dependência vulnerável

Rode o auditor do gerenciador de pacotes **separando produção de desenvolvimento**. Vulnerabilidade só em
ferramenta de build não alcança o usuário; diga isso e baixe a gravidade.

### Número de negócio (pedidos, falhas, ativação)

Antes de dizer "X% falham", classifique cada linha por causa e exclua o que não é cliente real (teste,
sandbox, contas internas). Mostre a distribuição por causa e por período: um incidente já encerrado não
é taxa atual.

### Erro em produção (logs)

Conte por rota ou função, ache o primeiro instante e o último, quantas pessoas distintas, e cruze com o
deploy ou a mudança mais próxima no tempo. Reproduza a chamada se for seguro (leitura).

## Padrões de falso positivo que já custaram caro

Confira cada um antes de confirmar:

| Padrão | Pergunta que desarma |
|---|---|
| Documento antigo como estado atual | "Remedi agora?" |
| Contagem de documento | "A consulta do documento, rodada hoje, dá o quê?" |
| Alerta de segredo genérico | "É segredo real, com poder, hoje?" |
| Escolha documentada | "Está nas escolhas deliberadas ou num ADR?" |
| Pendência com ID | "Tem ID aberto no registro?" |
| Taxa somando teste e incidente velho | "Separei por causa e por período?" |
| Política permissiva com nome tranquilizador | "Para quais papéis ela vale de verdade (`roles`)?" (o inverso também: nome assustador, papel restrito) |
| RLS ligada sem política | "Sem política, o papel vê zero: é proteção, não exposição" |
| Grant amplo com RLS | "O grant existe, mas a RLS filtra? Provei com o papel?" |
| Vulnerabilidade de dependência de desenvolvimento | "Chega ao usuário?" |

## Classificação do que sobreviveu

- **Gravidade pelo alcance:** visitante da internet (sem conta) > qualquer cliente logado (atenção se o
  cadastro é aberto) > cliente de outra organização > só a equipe. Combine com o impacto (dado pessoal,
  dinheiro, disponibilidade).
- **Falha ou desvio** (`pontuacao.md`): falha é risco agora; desvio funciona e vira dívida com gatilho.
- **Horizonte:** ⏱️ imediato para exposição ativa; 📅 próximo ciclo para o resto do que é falha; 🔧
  contínuo para processo.
- **Etiquetas:** categoria do OWASP Top 10, requisito do ASVS ou falha do API Top 10 que o achou, CWE.
- **Item dos eixos:** a qual item de `axis_a_dimensions.md` ou `axis_b_dimensions.md` ele pesa.

Registre cada achado assim:

```
{ codigo, titulo, veredito, gravidade, horizonte, alcance, owasp, origem (ASVS/API/STRIDE/sonda), cwe,
  item_do_eixo, evidencia (arquivo:linha | consulta → resultado | log), impacto, correcao, id_conhecido? }
```
