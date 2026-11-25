/* ===== Hours model =====
   HPM: hours in one person-month. ONE constant for price (hours roles cost hours/HPM of a person) and for capacity.
   150 h = 1,800 h/year / 12: the maximum annual working time in Spain's 19th national collective agreement for consulting and IT (BOE-A-2025-7766). */
const HPM = 150;
const HPM_SRC = { n: "XIX Convenio de consultoría y tecnologías de la información (BOE, 2025)", u: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-7766" };
/* Productivity gain with AI per area, in %: v = value used, lo/hi = range found in the evidence.
   Only controlled studies are cited; where there is none, the value is an HUMAIN estimate and says so. */
const AIEV = {
  metr: { n: "METR (2025), ensayo controlado con 16 desarrolladores expertos: −19 %", u: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/" },
  cui: { n: "Cui y otros (2025), 3 ensayos con 4.867 desarrolladores: +26 % de tareas", u: "https://papers.ssrn.com/abstract=4945566" },
  noy: { n: "Noy y Zhang (2023, Science), redacción profesional: −40 % de tiempo", u: "https://www.science.org/doi/10.1126/science.adh2586" },
  figma: { n: "Figma y MeasuringU (2026), ensayo aleatorizado con 100 personas: −20 % de tiempo", u: "https://arxiv.org/pdf/2609.26725" },
  hou: { n: "Hou y otros (Information Systems Research), experimentos de diseño: expertos +57 % de tiempo al ejecutar", u: "https://pubsonline.informs.org/doi/full/10.1287/isre.2024.0937" },
  utgen: { n: "Deljouyi y otros (ICSE 2025), 32 personas: hasta −20 % de tiempo al corregir bugs", u: "https://arxiv.org/abs/2408.11710" },
  bcg: { n: "Dell'Acqua y otros (2023), 758 consultores de BCG: +12 % de tareas y 25 % más rápido", u: "https://www.hbs.edu/faculty/Pages/item.aspx?num=64700" },
};
const AIUP = {
  eng: { v: 10, lo: -19, hi: 26, src: ["metr", "cui"], why: "Los estudios van de −19 % a +26 %: se usa un valor prudente." },
  qa: { v: 10, lo: -19, hi: 26, src: ["metr", "cui", "utgen"], why: "Por analogía con desarrollo. El único experimento de QA mide una tarea concreta (corregir bugs con tests mejorados por IA): hasta un 20 % menos de tiempo." },
  mkt: { v: 30, lo: 15, hi: 60, src: ["noy"], why: "En laboratorio la redacción es mucho más rápida; se toma la mitad del efecto para trabajo real." },
  product: { v: 20, lo: 12, hi: 33, src: ["bcg"], why: "Tareas de análisis y escritura dentro de lo que la IA hace bien." },
  data: { v: 15, lo: 0, hi: 30, src: [], why: "Estimación de HUMAIN: no hay un estudio controlado para este perfil." },
  pdesign: { v: 10, lo: 0, hi: 20, src: ["figma"], why: "En el ensayo, el diseño fue un 20 % más rápido de media, pero en diseñadores solo fue significativo en la tarea más compleja: se toma la mitad." },
  creative: { v: 0, lo: -57, hi: 0, src: ["hou"], why: "La IA mejora la fase de ideas, pero los diseñadores expertos tardaron un 57 % más en ejecutar: no se cuenta ahorro de tiempo." },
};
const aiUpOf = (cat) => (AIUP[cat] ? AIUP[cat].v : 0);
/* The team is sized as if AI improved nobody: the evidence (AIUP) is shown as information only and never
   discounts people. AI_SIZING = true would bring back the old behaviour (own override or the area's evidence value). */
const AI_SIZING = false;
const upOf = (r) => (!AI_SIZING ? 0 : r.up == null ? aiUpOf(F(r.id).cat) : r.up);
/* Each size is the team in PLANS working for this many months: that fixes the amount of work.
   The chosen deadline then spreads that work (shorter deadline = more people). Estimate, editable per project. */
const REFM = { s: 3, m: 6, l: 12, xl: 12 };
const COORD = 0.15; /* extra coordination per doubling of the team when the deadline is shorter (estimate; QSM shows the direction, not the size) */
const QSMTYP = { n: "QSM (mediana de su base de proyectos)", u: "https://qsm.com/node/1482" };
const QSM = { n: "QSM, Putnam (491 proyectos)", u: "https://www.qsm.com/articles/team-size-can-be-key-successful-project" };
const CF = { ic: 1, delivery: 1, lead: 0.8, manager: 0.25, head: 0.2 }; /* share of a lead's time that counts as delivery capacity */
/* Estimated team need per project type and size (s, m, l, xl).
   [role, FTE needed (people-equivalent), core?]. core = full-time people (at least 1); the rest are part-time support
   roles (hours per month, min 40 h; 60 h for PO/PM) unless they need nearly a full person. */
const PLANS = {
  digital: {
    s: [
      ["full", 1, 1],
      ["product", 0.5],
      ["auto", 0.25],
      ["po", 0.2],
    ],
    m: [
      ["front", 1, 1],
      ["back", 1, 1],
      ["product", 1, 1],
      ["graphic", 0.4],
      ["auto", 0.5],
      ["po", 0.45],
    ],
    l: [
      ["front", 2, 1],
      ["back", 2, 1],
      ["product", 2, 1],
      ["graphic", 0.6],
      ["auto", 1],
      ["po", 0.8],
    ],
    xl: [
      ["front", 4, 1],
      ["back", 3, 1],
      ["product", 3, 1],
      ["graphic", 1],
      ["auto", 2],
      ["po", 1],
    ],
  },
  mobile: {
    s: [
      ["mob", 1, 1],
      ["product", 0.5],
      ["auto", 0.25],
      ["po", 0.2],
    ],
    m: [
      ["mob", 2, 1],
      ["back", 1, 1],
      ["product", 1, 1],
      ["auto", 0.5],
      ["po", 0.5],
    ],
    l: [
      ["mob", 3, 1],
      ["back", 2, 1],
      ["product", 2, 1],
      ["graphic", 0.6],
      ["auto", 1],
      ["po", 0.8],
    ],
    xl: [
      ["mob", 5, 1],
      ["back", 3, 1],
      ["product", 3, 1],
      ["graphic", 1],
      ["auto", 2],
      ["po", 1],
    ],
  },
  web: {
    s: [
      ["full", 1, 1],
      ["product", 0.4],
      ["manual", 0.2],
      ["po", 0.15],
    ],
    m: [
      ["front", 1, 1],
      ["back", 1, 1],
      ["product", 0.6],
      ["graphic", 0.5],
      ["manual", 0.4],
      ["po", 0.4],
    ],
    l: [
      ["front", 2, 1],
      ["back", 1, 1],
      ["product", 1, 1],
      ["graphic", 0.8],
      ["manual", 0.6],
      ["po", 0.6],
    ],
    xl: [
      ["front", 3, 1],
      ["back", 2, 1],
      ["product", 2, 1],
      ["graphic", 1],
      ["manual", 1],
      ["po", 1],
    ],
  },
  mkt: {
    s: [
      ["mkt", 1, 1],
      ["graphic", 0.4],
      ["pm", 0.2],
    ],
    m: [
      ["mkt", 1, 1],
      ["graphic", 1, 1],
      ["pm", 0.3],
    ],
    l: [
      ["mkt", 2, 1],
      ["graphic", 2, 1],
      ["pm", 0.5],
    ],
    xl: [
      ["mkt", 4, 1],
      ["graphic", 3, 1],
      ["pm", 1],
    ],
  },
  brand: {
    s: [
      ["graphic", 1, 1],
      ["ad", 0.3],
      ["pm", 0.2],
    ],
    m: [
      ["graphic", 1, 1],
      ["ad", 0.5],
      ["pm", 0.3],
    ],
    l: [
      ["graphic", 2, 1],
      ["ad", 0.5],
      ["pm", 0.4],
    ],
    xl: [
      ["graphic", 3, 1],
      ["ad", 0.8],
      ["pm", 0.6],
    ],
  },
  data: {
    s: [
      ["full", 1, 1],
      ["product", 0.3],
      ["auto", 0.2],
      ["po", 0.2],
    ],
    m: [
      ["full", 2, 1],
      ["product", 0.3],
      ["auto", 0.3],
      ["devops", 0.3],
      ["po", 0.4],
    ],
    l: [
      ["back", 2, 1],
      ["full", 1, 1],
      ["product", 0.5],
      ["auto", 0.5],
      ["devops", 1],
      ["po", 0.6],
    ],
    xl: [
      ["back", 3, 1],
      ["full", 2, 1],
      ["product", 0.6],
      ["auto", 1],
      ["devops", 1],
      ["po", 1],
    ],
  },
  maint: {
    s: [
      ["full", 1, 1],
      ["product", 0.3],
      ["pm", 0.2],
    ],
    m: [
      ["full", 1, 1],
      ["product", 0.3],
      ["auto", 0.3],
      ["pm", 0.3],
    ],
    l: [
      ["front", 1, 1],
      ["back", 1, 1],
      ["product", 0.6],
      ["auto", 0.5],
      ["pm", 0.5],
    ],
    xl: [
      ["front", 2, 1],
      ["back", 2, 1],
      ["product", 1],
      ["auto", 1],
      ["pm", 0.7],
    ],
  },
};
const SUPPORT_IDS = ["product-owner", "project-manager", "art-director", "tech-lead"]; /* never the "main" role of a team */
/* Builds the suggested team and the estimated work (hours) for a project. Pure: returns { roles, work } and touches nothing.
   Work depends on type and size only (PLANS × REFM), never on the deadline. Fixed deadline: the team is sized so the
   work fits in it (k = REFM / months, with extra coordination when the team grows). No end date: the PLANS team is a
   standing team and the work is its monthly capacity over 12 months. Each role is sized with its area's AI gain. */
const workOf = (pr) => {
  const plan = (PLANS[pr.type] || PLANS.digital)[pr.size || "m"] || PLANS.digital.m,
    fte = plan.reduce((a, [, x]) => a + x, 0);
  return { plan, fte, hours: fte * HPM * (pr.months ? REFM[pr.size || "m"] || 6 : 12) };
};
function buildTeam(pr, opts = {}) {
  const M = pr.months || 12,
    { plan, hours } = workOf(pr),
    k = pr.months ? (REFM[pr.size || "m"] || 6) / pr.months : 1,
    over = k > 1 ? 1 + COORD * Math.log2(k) : 1,
    noAI = !!opts.noAI;
  const roles = [];
  let work = hours * over;
  plan.forEach(([id, x, core]) => {
    const pm = id === "po" || id === "pm",
      f = F(MIG[id] ? MIG[id][0] : id),
      cf = CF[f.arch] || 1,
      ai = AI_SIZING && !noAI && f.cat in AIDESC,
      need = (x * k * over) / cf / (ai ? 1 + aiUpOf(f.cat) / 100 : 1); /* people-equivalent once the lead's reduced capacity is counted (AI: no discount) */
    if ((!core && need < 0.9) || (core && need < 0.6)) {
      const h = Math.min(HPM, Math.max(pm ? 60 : 40, Math.round((need * HPM) / 10) * 10));
      roles.push(mkRole(id, 0, h));
    } else roles.push(mkRole(id, Math.max(1, Math.round(need))));
  });
  const cnt = (g) => roles.filter((r) => F(r.id).cat === g).reduce((s, r) => s + r.n, 0),
    has = (id) => roles.some((r) => r.id === id);
  const lead = (id) => {
    roles.push(mkRole(id, 1));
    work += CF.lead * HPM * M; /* a lead's own delivery time is part of the work: it neither inflates nor hides coverage */
  };
  if (cnt("eng") + cnt("qa") >= 3 && !has("tech-lead")) lead("tech-lead");
  if (cnt("pdesign") >= 3) {
    const pd = roles.find((r) => r.id === "product-designer" && r.n);
    if (pd) {
      pd.lead = true;
      pd.grade = "senior";
    }
  }
  if ((cnt("creative") >= 3 || (pr.type === "mkt" && cnt("creative") >= 2)) && !has("art-director")) lead("art-director");
  if (!roles.some((r) => r.n >= 1)) {
    const main =
      roles.filter((r) => !SUPPORT_IDS.includes(r.id) && F(r.id).arch === "ic").sort((a, b) => b.hours - a.hours)[0] ||
      roles.find((r) => !SUPPORT_IDS.includes(r.id)) ||
      roles[0];
    if (main) {
      main.n = 1;
      main.hours = 0;
      main.ai = F(main.id).cat in AIDESC ? 1 : 0;
    }
  }
  roles.forEach((r) => {
    if (noAI) r.ai = 0;
  });
  /* rounding to whole people can leave the team short: top it up (hours first, then the largest team) until it covers 97 % */
  const capOf = (r) => {
    const up = upOf(r) / 100;
    return (r.n ? (r.n - r.ai) * HPM + r.ai * HPM * (1 + up) : r.hours * (1 + (r.ai ? up : 0))) * (CF[F(r.id).arch] || 1);
  };
  for (let g = 0; g < 40 && (roles.reduce((a, r) => a + capOf(r), 0) * M) / work < 0.97; g++) {
    const h = roles.filter((r) => !r.n && r.hours < HPM && !SUPPORT_IDS.includes(r.id)).sort((a, b) => b.hours - a.hours)[0];
    if (h) h.hours = Math.min(HPM, h.hours + 10);
    else {
      const p = roles.filter((r) => r.n && !SUPPORT_IDS.includes(r.id)).sort((a, b) => b.n - a.n)[0];
      if (!p) break;
      p.n += 1;
      if (p.ai) p.ai += 1;
    }
  }
  roles.forEach((r) => {
    r.ct = r.n >= 1 && !(pr.months && pr.months <= 3) ? "emp" : "free";
  });
  return { roles, work: Math.round(work) };
}
/* Estimated work (hours) from type, size and duration. Used when the project is edited: it does not touch the team or tools. */
function estimateWork(pr) {
  pr.work = buildTeam(pr).work;
}
/* Suggests a whole team (roles, tools and quantities) and the estimated work. */
function suggest(pr) {
  const t = buildTeam(pr);
  pr.work = t.work;
  pr.roles = t.roles;
  pr.shared = { pm: pick("pm"), chat: pick("chat"), genai: pick("genai") };
  pr.qty = {};
  personify(pr);
}
/* the general AIs of a project: the main one plus any extra (a team may hold two licences, say Claude and ChatGPT) */
const genaiAll = (pr) => [...new Set([(pr.shared || {}).genai, ...((pr.shared || {}).genaiX || [])].filter((x) => x && opt(x)))];
/* Seats needed per tool, from the project's roles and shared tools. Pure. */
function projNeed(pr) {
  const own = pr.own || [],
    qty = pr.qty || {};
  let ppl = 0,
    aiPpl = 0;
  const need = {},
    ft = {},
    qr = [],
    qs = {};
  const add = (id, q, r) => {
    const o = opt(id);
    if (!o || !q) return;
    if (isFig(id)) {
      const t = r ? figType(r) : "collab";
      ft[t] = (ft[t] || 0) + q;
    }
    need[id] = o.unit === "plan" ? Math.max(need[id] || 0, 1) : (need[id] || 0) + q;
  };
  pr.roles.forEach((r) => {
    ppl += r.n || (r.hours ? 1 : 0);
    aiPpl += ownAI(r, pr) ? 0 : r.ai;
    const q = {};
    for (const cat in r.tools) {
      const o = opt(r.tools[cat]),
        auto = !o ? 0 : o.unit === "plan" ? 1 : tcOf(cat, r.tools[cat]).ai ? r.ai : Math.max(1, r.n);
      q[cat] = tcOf(cat, r.tools[cat]).ai && ownAI(r, pr) ? 0 : ((r.qty || {})[cat] ?? auto);
      add(r.tools[cat], q[cat], r);
    }
    qr.push(q);
  });
  const sq = { pm: ppl, chat: ppl, genai: aiPpl };
  for (const cat in pr.shared) {
    const o = opt(pr.shared[cat]);
    qs[cat] = qty[cat] ?? (o && o.unit === "plan" ? 1 : sq[cat]);
    if (cat === "genai" && !aiPpl) continue;
    add(pr.shared[cat], qs[cat], null);
  }
  if (aiPpl) ((pr.shared || {}).genaiX || []).forEach((id) => add(id, aiPpl, null));
  return { need, ft, qr, qs, ppl, aiPpl, own };
}
/* Cost of each seat of a role. A person of the company counts at their real cost (the reference if it is unknown);
   another team's profile and a new hire count at the reference. inv = new money (only new hires). Pure. */
function seatCosts(r, pr) {
  const RT = rateOf(r, pr),
    /* a freelance with an hourly rate: the rate × the hours of a full month, then the dedication */
    ref = r.hrate && (r.ct || "free") === "free" ? r.hrate * HPM : (RT.v || 0) * ctF(r),
    ded = r.n ? 1 : r.hours / HPM,
    fill = arr(r.fill);
  return [...Array(seatsOf(r))].map((_, i) => {
    const f = fill[i] || { src: "new" },
      who = (f.src === "mine" || f.src === "shared") && f.pid ? PERSON(f.pid) || null : null,
      real = !!(who && who.cost > 0),
      v = (real ? who.cost : ref) * ded;
    return { f, who, v, ref: ref * ded, real, ded, inv: f.src === "new" };
  });
}
/* ±10 % around a reference, rounded to 100 € (the guides publish ranges that will replace it) */
const RANGE = 0.1,
  r100 = (v) => Math.round(v / 100) * 100,
  rangeOf = (v) => [r100(v * (1 - RANGE)), r100(v * (1 + RANGE))],
  rangeTxt = (v) => (v > 0 ? rangeOf(v).map(eur).join(" – ") : eur(0));
/* Project cost. Pure: reads the project and the licence inventory, writes nothing.
   monthly = everything the project uses (people + every licence seat); inv = new money (new hires + seats to buy);
   paid = what the company already pays (its people, other teams' profiles, free seats it reuses). */
/* a request on top of an approved project: a child project the person never has to manage by hand */
