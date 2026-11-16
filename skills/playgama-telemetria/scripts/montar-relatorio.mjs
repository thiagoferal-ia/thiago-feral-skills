#!/usr/bin/env node
// Monta o relatório visual: injeta um JSON de dados no template HTML.
// Uso: node montar-relatorio.mjs <dados.json> <saida.html>
// Sem dependências. Valida a estrutura e avisa sobre problemas comuns.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Uso: node montar-relatorio.mjs <dados.json> <saida.html>");
  process.exit(2);
}

const here = dirname(fileURLToPath(import.meta.url));
const template = readFileSync(join(here, "..", "assets", "relatorio-template.html"), "utf8");
let dados;
try {
  dados = JSON.parse(readFileSync(inPath, "utf8"));
} catch (e) {
  console.error("JSON inválido:", e.message);
  process.exit(1);
}

const TIPOS = new Set(["texto", "kpis", "tabela", "alerta", "esquema", "linha_do_tempo", "recomendacoes", "linha", "area", "barras", "barras_empilhadas", "funil", "segmentos", "mapa_calor", "metas", "halteres", "faixas", "grade"]);
const erros = [], avisos = [];
if (!dados.titulo) erros.push("falta 'titulo'");
if (!Array.isArray(dados.secoes) || !dados.secoes.length) erros.push("falta 'secoes' (lista não vazia)");
if (dados.destaque) {
  if (!dados.destaque.valor) erros.push("destaque: falta 'valor'");
  if (dados.destaque.tendencia && dados.destaque.tendencia_x && dados.destaque.tendencia.length !== dados.destaque.tendencia_x.length) erros.push("destaque: 'tendencia' e 'tendencia_x' com tamanhos diferentes");
}
const checar = (b, w) => {
    if (!TIPOS.has(b.tipo)) { erros.push(`${w}: tipo desconhecido`); return; }
    if (b.tipo === "grade") { (b.blocos || []).forEach((x, i) => checar(x, `${w} › blocos[${i}] (${x.tipo})`)); return; }
    if (b.tipo === "mapa_calor") {
      (b.valores || []).forEach((r, ri) => { if (r.length !== (b.colunas || []).length) erros.push(`${w}: linha ${ri} tem ${r.length} valores para ${(b.colunas || []).length} colunas`); });
      if ((b.valores || []).length !== (b.linhas || []).length) erros.push(`${w}: 'valores' tem ${(b.valores || []).length} linhas para ${(b.linhas || []).length} rótulos`);
    }
    if (b.tipo === "metas") (b.itens || []).forEach((it, i) => { if (it.valor == null) erros.push(`${w}: item ${i} sem 'valor'`); });
    if (b.tipo === "halteres") (b.itens || []).forEach((it, i) => { if (it.antes == null || it.depois == null) erros.push(`${w}: item ${i} precisa de 'antes' e 'depois'`); });
    if (b.tipo === "faixas") (b.itens || []).forEach((it, i) => { if ([it.p10, it.p50, it.p90].some((v) => v == null)) erros.push(`${w}: item ${i} precisa de p10, p50 e p90`); });
    if (b.tipo === "barras_empilhadas") {
      (b.series || []).forEach((sr) => { if (!Array.isArray(sr.valores) || sr.valores.length !== (b.categorias || []).length) erros.push(`${w}: série "${sr.nome}" com tamanho diferente de 'categorias'`); });
    }
    if (b.tipo === "linha" || b.tipo === "area") {
      if (!Array.isArray(b.x)) erros.push(`${w}: falta 'x'`);
      (b.series || []).forEach((sr) => { if (!Array.isArray(sr.valores) || sr.valores.length !== (b.x || []).length) erros.push(`${w}: série "${sr.nome}" com ${sr.valores?.length} valores para ${b.x?.length} pontos em x`); });
      if ((b.series || []).length > 8) avisos.push(`${w}: mais de 8 séries — só as 8 primeiras aparecem; agrupe o resto em "Outros"`);
    }
    if (b.tipo === "barras") {
      (b.series || []).forEach((sr) => { if (!Array.isArray(sr.valores) || sr.valores.length !== (b.categorias || []).length) erros.push(`${w}: série "${sr.nome}" com tamanho diferente de 'categorias'`); });
      if ((b.series || []).some((sr) => sr.valores.some((v) => v < 0))) avisos.push(`${w}: valores negativos não são suportados (o eixo começa em 0)`);
    }
    if (b.tipo === "tabela") {
      const n = (b.colunas || []).length;
      (b.linhas || []).forEach((r, ri) => { if (r.length !== n) erros.push(`${w}: linha ${ri} tem ${r.length} células para ${n} colunas`); });
    }
    if (b.tipo === "funil" && !(b.etapas || []).length) erros.push(`${w}: funil sem 'etapas'`);
    if (b.tipo === "segmentos" && (b.partes || []).length > 6) avisos.push(`${w}: mais de 6 partes — agrupe o resto em "Outros"`);
};
(dados.secoes || []).forEach((s, si) => {
  const onde = `secoes[${si}] "${s.titulo || "?"}"`;
  if (!s.titulo) avisos.push(`${onde}: sem título`);
  (s.blocos || []).forEach((b, bi) => checar(b, `${onde} › blocos[${bi}] (${b.tipo})`));
});
const curto = dados.titulo_curto || dados.titulo || "";
if (curto.split(/\s+/).length > 4) avisos.push(`'titulo_curto' deveria ter 2–4 palavras (aba do navegador/artifact): "${curto}"`);

avisos.forEach((a) => console.warn("aviso:", a));
if (erros.length) { erros.forEach((e) => console.error("erro:", e)); process.exit(1); }

const json = JSON.stringify(dados).replace(/</g, "\\u003c");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const html = template.replace("__TITULO__", esc(curto || "Relatório")).replace("__DADOS_JSON__", () => json);
writeFileSync(outPath, html, "utf8");
console.log(`ok: ${outPath} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, ${dados.secoes.length} seções)`);
