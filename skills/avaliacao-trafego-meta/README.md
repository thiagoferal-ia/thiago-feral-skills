# Avaliação de Tráfego Meta — Score e Veredito (Venda Direta)

Skill para avaliar campanhas, conjuntos e anúncios de **venda direta** no Meta (Facebook/Instagram Ads), atribuindo nota de 0 a 10 e um veredito de ação — **escalar, manter, aguardar ou pausar**.

Funciona para **qualquer produto e anunciante**: coleta os números do negócio numa entrevista rápida e **deriva os limiares de lucro automaticamente** (empate de ROAS/CPA a partir de ticket, líquido e imposto).

## O que ela faz
- Nota 0–10 (Resultado + Eficiência, com peso por fase) e veredito com guarda-corpos de segurança.
- **Calibração das faixas** de CPM/CTR/gancho pela distribuição real da conta.
- **Faróis (🟢🟡🔴) por métrica**, colunas financeiras (investido, faturamento, lucro líquido) e `creative_id`.
- **Análise aprofundada** em toda avaliação: padrões entre vencedores (com stress-test de atribuição), funil de causa, realocação e projeção de escala.
- Regras de atribuição (≥3 dias de assentamento) e de amostra (~10 vendas) embutidas.
- Gera bloco de config e `.md` de continuidade para alimentar tendência entre sessões.

## Estrutura
```
avaliacao-trafego-meta/
├── SKILL.md                      # o motor: fluxo, config, faixas, veredito, saídas
└── references/
    ├── pontuacao.md              # funções de pontuação 0–10 e lógica de veredito
    ├── wireframes.md             # templates (farol detalhado, veredito, calculador, snapshot, sparklines)
    ├── analise-aprofundada.md    # método das 4 camadas de profundidade
    └── exemplo-completo.md       # exemplo genérico ponta a ponta
```

## Escopo
Cobre **venda direta** (objetivo Vendas/Compras, com pixel de compra) e ticket único. Lead, mensagem, app e e-commerce multiproduto ficam para uma v2.

## Uso
Instale como skill (Claude) ou consulte o `SKILL.md` diretamente. Na primeira análise, a skill faz uma entrevista curta para montar a config do negócio; nas seguintes, reutiliza o bloco de config salvo.

---
Skill desenvolvida por **Thiago Feral | Inteligência Artificial**.
