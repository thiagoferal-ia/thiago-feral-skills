# Audit report template (`<App>_Auditoria_Seguranca_OWASP.md`)

Generate this only after the in-chat report, when the user accepts. Fill every bracket. Keep the flag
system and cite evidence. Never include real secret values — reference location + "must rotate".

```markdown
# Auditoria de Segurança — <App>
### Referência: OWASP Top 10:<edição> · Análise de repositório + banco de dados ao vivo

**Projeto Supabase:** `<project_id>`
**Repositório:** <repo>
**Data:** <data>
**Escopo:** código (frontend, api/, edge functions, migrations) e estado real do banco (RLS, políticas, grants, advisors).

> Orientação técnica de segurança, não aconselhamento jurídico. Onde há dados pessoais, há implicação de privacidade — validar com o jurídico após a correção técnica.

## Legenda
**Gravidade:** 🔴 Crítico · 🟠 Alto · 🟡 Médio · 🔵 Baixo/Hardening — **Prioridade:** ⏱️ Hoje · 📅 Esta semana · 🔧 Contínuo

## 1. Pontuação de segurança
- Nota atual: `<barra>` <X>/10 — uma frase do porquê.
- Meta após correções: `<barra>` ~<Y>/10.
- Por que não 10: <processo contínuo>.
- Tabela por dimensão (atual → meta) e por categoria OWASP (atual → meta).

## 2. Resumo executivo
2–4 parágrafos: a fundação que está correta, depois os achados-chave e o risco de cabeçalho.
Tabela de distribuição (Crítico/Alto/Médio/Baixo × quantidade × tema).

## 3. Achados CRÍTICOS 🔴
Para cada: título com selo (`🔴 … · ⏱️ Hoje · OWASP A0x`), evidência (arquivo:linha ou consulta), impacto, remediação (passos, ordem importa).

## 4. Achados ALTOS 🟠
(mesmo formato)

## 5. Achados MÉDIOS 🟡
(lista com selo + OWASP + correção curta)

## 6. Baixo / Hardening 🔵
(lista)

## 7. O que já está bem feito ✅
Os pontos fortes — para não regredir.

## 8. Plano de ação priorizado
⏱️ Hoje (contém vazamento ativo) / 📅 Esta semana / 🔧 Contínuo. Nota de como a pontuação evolui a cada bloco.

---
*Auditoria baseada em OWASP Top 10:<edição>, leitura do repositório e inspeção do banco em <data>.*
```
