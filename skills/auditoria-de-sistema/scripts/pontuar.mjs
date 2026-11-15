#!/usr/bin/env node
// Pontuação da auditoria de sistema: as fórmulas, travas, estágios, o cruzamento e o placar OWASP de
// references/pontuacao.md, calculados aqui para que a nota não dependa de conta feita de cabeça.
//
// Uso: node scripts/pontuar.mjs notas.json [--json]
//
// Formato de notas.json:
// {
//   "A": { "itens": { "A1.1": 3, "A1.2": "nv", "A9.2": "na" }, "travas": ["segredo_no_historico"] },
//   "B": {
//     "itens": { "B1.1": 2, "B4.a": 3 },
//     "elos": { "Cotar": 3, "Faturar": 0 },
//     "travas": ["elo_ausente"]
//   },
//   "achados": [
//     { "codigo": "C1", "veredito": "confirmado", "gravidade": "critico",
//       "owasp": ["A01", "A02"], "horizonte": "imediato" }
//   ],
//   "owasp_avaliadas": ["A01", "A02", "A05", "A07"]
// }
// Achado: veredito "confirmado" ou "plausivel" (os demais não pesam); gravidade "critico", "alto",
// "medio" ou "baixo"; owasp com a categoria principal primeiro; horizonte "imediato", "proximo" ou
// "continuo". "owasp_avaliadas" lista as categorias percorridas a fundo nesta execução; a categoria
// principal de um achado confirmado ou plausível conta como avaliada sozinha. Categoria fora das duas
// fica "não avaliada", sem nota (nunca 9 de graça). Sem "achados" nem "owasp_avaliadas", o placar
// OWASP não é calculado.
// Quadrante: sai "indefinido" se algum eixo tiver cobertura abaixo de 50% ou se o eixo B estiver
// incompleto (sem "elos"); e nunca sai "Pronto" com achado crítico confirmado.
// Nota de item e de elo: inteiro de 0 a 4. "nv" = não verificado (sai da nota e reduz a
// cobertura). "na" = não aplicável (sai da nota e da cobertura). Item que não aparece conta
// como "nv". Sem "elos", B4 não é pontuada: a cadeia precisa estar validada com o usuário.

import { readFileSync } from 'node:fs';

const EIXOS = {
  A: {
    dims: {
      A1: [1.0, 7], A2: [1.3, 8], A3: [1.6, 7], A4: [1.6, 8], A5: [1.3, 7],
      A6: [1.3, 7], A7: [1.1, 7], A8: [1.3, 8], A9: [1.1, 7], A10: [0.4, 5],
    },
    travas: {
      travessia_entre_contas: 3, autorizacao_so_no_cliente: 3, credencial_recuperavel: 3,
      backup_nunca_restaurado: 4, segredo_no_historico: 4, sem_ambiente_separado: 4,
      schema_sem_versionamento: 5,
    },
    estagios: [[8.5, 'A5 · Governado'], [7, 'A4 · Industrial'], [5, 'A3 · Estruturado'],
      [3, 'A2 · Artesanal'], [0, 'A1 · Protótipo']],
  },
  B: {
    dims: {
      B1: [1.0, 5], B2: [2.0, 6], B3: [1.5, 5], B4: [3.0, 0], B5: [1.5, 5], B6: [1.0, 5],
      B7: [2.0, 5],
    },
    travas: {
      contratar_exige_intervencao: 3, exigencia_regulatoria_nao_atendida: 3, elo_ausente: 4,
      sem_importacao: 5, sem_atendimento: 6, sem_exportacao: 6,
    },
    estagios: [[8.5, 'B5 · Escalável'], [7, 'B4 · Comercializável'], [5, 'B3 · Operável'],
      [3, 'B2 · Demonstrável'], [0, 'B1 · Conceito']],
  },
};

const COBERTURA_MINIMA = 0.5;

const eNota = (v) => Number.isInteger(v) && v >= 0 && v <= 4;

function ler(itens, id) {
  const v = itens?.[id];
  if (v === undefined || v === 'nv') return 'nv';
  if (v === 'na') return 'na';
  if (!eNota(v)) throw new Error(`${id}: nota inválida ${JSON.stringify(v)} (use 0 a 4, "nv" ou "na")`);
  return v;
}

function somar(itens, ids) {
  let soma = 0, pontuados = 0, aplicaveis = 0;
  for (const id of ids) {
    const v = ler(itens, id);
    if (v === 'na') continue;
    aplicaveis++;
    if (v === 'nv') continue;
    soma += v;
    pontuados++;
  }
  return { soma, pontuados, aplicaveis };
}

function dimensao(itens, dim, n) {
  const ids = Array.from({ length: n }, (_, i) => `${dim}.${i + 1}`);
  const { soma, pontuados, aplicaveis } = somar(itens, ids);
  return { ids, nota: pontuados ? (soma / (4 * pontuados)) * 10 : null, pontuados, aplicaveis };
}

// B4 = menor valor entre o elo mais fraco e a média do bloco 2, nunca a média dos elos.
function dimensaoB4(entrada) {
  const ids = ['B4.a', 'B4.b', 'B4.c', 'B4.d'];
  const bloco2 = somar(entrada.itens, ids);
  const elos = Object.entries(entrada.elos ?? {});
  for (const [nome, v] of elos) {
    if (!eNota(v)) throw new Error(`elo "${nome}": nota inválida ${JSON.stringify(v)} (use 0 a 4)`);
  }
  if (!elos.length) {
    return { ids, nota: null, pontuados: bloco2.pontuados, aplicaveis: bloco2.aplicaveis + 1, eloMaisFraco: null };
  }
  const [nomeFraco, notaFraco] = elos.reduce((m, e) => (e[1] < m[1] ? e : m));
  const media2 = bloco2.pontuados ? bloco2.soma / bloco2.pontuados : null;
  const nota04 = media2 === null ? notaFraco : Math.min(notaFraco, media2);
  return {
    ids,
    nota: nota04 * 2.5,
    pontuados: bloco2.pontuados + elos.length,
    aplicaveis: bloco2.aplicaveis + elos.length,
    eloMaisFraco: { nome: nomeFraco, nota: notaFraco },
  };
}

function eixo(chave, entrada) {
  const cfg = EIXOS[chave];
  const dims = {};
  const conhecidos = new Set();
  let somaP = 0, somaW = 0, pont = 0, apl = 0;
  for (const [dim, [peso, n]] of Object.entries(cfg.dims)) {
    const r = dim === 'B4' ? dimensaoB4(entrada) : dimensao(entrada.itens, dim, n);
    r.ids.forEach((id) => conhecidos.add(id));
    delete r.ids;
    dims[dim] = { ...r, peso };
    pont += r.pontuados;
    apl += r.aplicaveis;
    if (r.nota !== null) {
      somaP += r.nota * peso;
      somaW += peso;
    }
  }
  const desconhecidos = Object.keys(entrada.itens ?? {}).filter((id) => !conhecidos.has(id));
  if (desconhecidos.length) throw new Error(`itens desconhecidos no eixo ${chave}: ${desconhecidos.join(', ')}`);

  const travas = (entrada.travas ?? []).map((t) => {
    if (!(t in cfg.travas)) {
      throw new Error(`trava desconhecida no eixo ${chave}: ${t} (válidas: ${Object.keys(cfg.travas).join(', ')})`);
    }
    return { trava: t, teto: cfg.travas[t] };
  });
  const media = somaW ? somaP / somaW : null;
  const teto = travas.length ? Math.min(...travas.map((t) => t.teto)) : null;
  const nota = media === null ? null : teto === null ? media : Math.min(media, teto);
  // Eixo B sem a cadeia validada (sem "elos") fica incompleto: nota parcial, sem estágio.
  const incompleto = chave === 'B' && !Object.keys(entrada.elos ?? {}).length;
  const estagio = nota === null || incompleto ? null : cfg.estagios.find(([min]) => nota >= min)[1];
  return { nota, media, teto, travas, estagio, incompleto, cobertura: apl ? pont / apl : 0, dims };
}

function quadrante(A, B, achados) {
  const a = A.nota, b = B.nota;
  if (a === null || b === null) return 'indefinido: falta a nota de um dos eixos';
  if (B.incompleto) return 'indefinido: eixo B incompleto (o fluxo crítico não foi validado com o usuário, B4 sem nota)';
  if (A.cobertura < COBERTURA_MINIMA || B.cobertura < COBERTURA_MINIMA) {
    return `indefinido: cobertura abaixo de ${pct(COBERTURA_MINIMA)} (A ${pct(A.cobertura)}, B ${pct(B.cobertura)}); faltam respostas do time ou acesso`;
  }
  if (a >= 5 && b >= 5) {
    const criticos = achados.filter((x) => x.gravidade === 'critico' && x.veredito === 'confirmado').map((x) => x.codigo);
    if (criticos.length) return `Bloqueado por achado crítico confirmado (${criticos.join(', ')}): corrigir antes de receber clientes`;
    const base = a >= 7 && b >= 7 ? 'Pronto para escalar' : 'Pronto para os primeiros clientes';
    const plaus = achados.filter((x) => x.gravidade === 'critico' && x.veredito === 'plausivel').map((x) => x.codigo);
    return plaus.length ? `${base}, com ressalva: crítico plausível a provar (${plaus.join(', ')})` : base;
  }
  if (a >= 5) return 'Fundação sem porta';
  if (b >= 5) return 'Casa sem alicerce';
  return 'Canteiro de obras';
}

// Placar OWASP: cada categoria parte de 9, perde pontos por achado e tem teto pela pior gravidade.
const CATEGORIAS = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10'];
const DESCONTO = { critico: 6, alto: 4, medio: 1.5, baixo: 0.5 };
const TETO = { critico: 3, alto: 5, medio: 7, baixo: 7 };
const ORDEM = ['critico', 'alto', 'medio', 'baixo'];

function notaDaCategoria(cat, achados) {
  let nota = 9;
  let pior = null;
  for (const a of achados) {
    const pos = a.owasp.indexOf(cat);
    if (pos < 0) continue;
    const fator = (a.veredito === 'plausivel' ? 0.5 : 1) * (pos === 0 ? 1 : 0.5);
    nota -= DESCONTO[a.gravidade] * fator;
    if (a.veredito === 'confirmado' && pos === 0 && (pior === null || ORDEM.indexOf(a.gravidade) < ORDEM.indexOf(pior))) {
      pior = a.gravidade;
    }
  }
  if (pior) nota = Math.min(nota, TETO[pior]);
  return Math.max(1, nota);
}

function placarOwasp(achados, avaliadasDeclaradas) {
  for (const a of achados) {
    if (!['confirmado', 'plausivel', 'refutado', 'conhecido', 'escolha'].includes(a.veredito)) {
      throw new Error(`achado ${a.codigo}: veredito inválido ${JSON.stringify(a.veredito)}`);
    }
    if (!(a.gravidade in DESCONTO)) throw new Error(`achado ${a.codigo}: gravidade inválida ${JSON.stringify(a.gravidade)}`);
    if (!Array.isArray(a.owasp) || !a.owasp.length || a.owasp.some((c) => !CATEGORIAS.includes(c))) {
      throw new Error(`achado ${a.codigo}: owasp inválido ${JSON.stringify(a.owasp)} (use A01 a A10)`);
    }
  }
  const pesam = achados.filter((a) => a.veredito === 'confirmado' || a.veredito === 'plausivel');
  const restam = pesam.filter((a) => a.horizonte === 'continuo');
  for (const c of avaliadasDeclaradas) {
    if (!CATEGORIAS.includes(c)) throw new Error(`owasp_avaliadas: categoria inválida ${JSON.stringify(c)} (use A01 a A10)`);
  }
  const avaliadas = new Set([...avaliadasDeclaradas, ...pesam.map((a) => a.owasp[0])]);
  const categorias = {};
  for (const cat of CATEGORIAS) {
    if (!avaliadas.has(cat)) {
      categorias[cat] = { atual: null, meta: null, achados: [] };
      continue;
    }
    categorias[cat] = {
      atual: notaDaCategoria(cat, pesam),
      meta: notaDaCategoria(cat, restam),
      achados: pesam.filter((a) => a.owasp.includes(cat)).map((a) => a.codigo),
    };
  }
  const comNota = Object.values(categorias).filter((c) => c.atual !== null);
  const media = (k) => (comNota.length ? comNota.reduce((s, c) => s + c[k], 0) / comNota.length : null);
  return { categorias, atual: media('atual'), meta: media('meta') === null ? null : Math.min(9, media('meta')) };
}

const num = (v) => (v === null ? 'não pontuado' : v.toFixed(1).replace('.', ','));
const pct = (v) => `${Math.round(v * 100)}%`;

const [arquivo, bandeira] = process.argv.slice(2);
if (!arquivo) {
  console.error('uso: node scripts/pontuar.mjs notas.json [--json]');
  process.exit(1);
}
let resultado;
try {
  const entrada = JSON.parse(readFileSync(arquivo, 'utf8'));
  if ('owasp_nao_avaliadas' in entrada) {
    throw new Error('"owasp_nao_avaliadas" saiu do formato: liste em "owasp_avaliadas" as categorias percorridas a fundo');
  }
  const A = eixo('A', entrada.A ?? {});
  const B = eixo('B', entrada.B ?? {});
  const achados = entrada.achados ?? [];
  resultado = { A, B };
  if (entrada.achados || entrada.owasp_avaliadas) {
    resultado.owasp = placarOwasp(achados, entrada.owasp_avaliadas ?? []);
  }
  resultado.quadrante = quadrante(A, B, achados);
} catch (erro) {
  console.error(`erro: ${erro.message}`);
  process.exit(1);
}
const { A, B } = resultado;

if (bandeira === '--json') {
  console.log(JSON.stringify(resultado, null, 2));
} else {
  for (const [chave, r] of [['A', A], ['B', B]]) {
    const travado = r.teto !== null && r.media !== null && r.media > r.teto;
    const estagio = r.incompleto ? 'incompleto, nota parcial' : r.estagio ?? 'sem estágio';
    console.log(`Eixo ${chave}: ${num(r.nota)} · ${estagio} · cobertura ${pct(r.cobertura)}`);
    if (travado) console.log(`  média ${num(r.media)}, travada em ${num(r.teto)}`);
    for (const t of r.travas) console.log(`  trava: ${t.trava} (teto ${num(t.teto)})`);
    for (const [dim, d] of Object.entries(r.dims)) {
      const extra = d.eloMaisFraco ? ` · elo mais fraco: ${d.eloMaisFraco.nome} (${d.eloMaisFraco.nota})` : '';
      console.log(`  ${dim.padEnd(3)} ${num(d.nota).padStart(12)} · peso ${num(d.peso)} · ${d.pontuados}/${d.aplicaveis} itens${extra}`);
    }
  }
  console.log(`Quadrante: ${resultado.quadrante}`);
  if (resultado.owasp) {
    const o = resultado.owasp;
    console.log(`OWASP: ${num(o.atual)} atual · meta ${num(o.meta)}`);
    for (const [cat, c] of Object.entries(o.categorias)) {
      const qual = c.atual === null ? 'não avaliada' : `${num(c.atual)} → ${num(c.meta)}`;
      console.log(`  ${cat} ${qual.padStart(14)}${c.achados.length ? ' · ' + c.achados.join(', ') : ''}`);
    }
  }
}
