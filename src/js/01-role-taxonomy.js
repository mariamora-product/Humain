/* ===== Role taxonomy: category · family · grade · responsibility · employment ===== */
const CATS = [
  [
    "product",
    "Producto y gestión",
    1,
    {
      exec: "Chief Product Officer;VP of Product;Head of Product;Product Director",
      mgmt: "Group Product Manager;Product Operations Manager;Program Manager;Delivery Manager",
      lead: "Lead Product Manager;Principal Product Manager",
      spec: "Product Manager;Product Owner;Project Manager;Scrum Master / Agile Coach;Business Analyst",
    },
  ],
  [
    "pdesign",
    "Diseño de producto",
    1,
    {
      exec: "Head of Design;Chief Design Officer;VP of Design;Head of Product Design;Design Director",
      mgmt: "Design Manager;UX Research Manager",
      lead: "Lead Product Designer;Design Systems Lead;UX Research Lead",
      spec: "Product Designer;UX Designer;UI Designer;UX Researcher;Design Systems Designer;Content Designer / UX Writer;UX Engineer",
    },
  ],
  [
    "creative",
    "Diseño gráfico y creatividad",
    1,
    {
      exec: "Creative Director;Brand Director;Head of Brand Design",
      mgmt: "Design Studio Manager;Creative Operations Manager",
      lead: "Art Director;Lead Brand Designer;Motion Design Lead",
      spec: "Graphic Designer;Brand Designer;Visual Designer;Motion Designer;3D Designer;Illustrator;Video Editor;Photographer;Presentation Designer",
    },
  ],
  [
    "eng",
    "Ingeniería y desarrollo",
    1,
    {
      exec: "Chief Technology Officer;VP of Engineering;Head of Engineering;Engineering Director",
      mgmt: "Engineering Manager;Software Development Manager",
      lead: "Tech Lead;Staff Software Engineer;Principal Software Engineer;Software Architect",
      spec: "Frontend Developer;Backend Developer;Full-stack Developer;Mobile Developer;DevOps Engineer;Cloud Engineer;Platform Engineer;Site Reliability Engineer;Security Engineer",
    },
  ],
  [
    "data",
    "Datos e IA",
    1,
    {
      exec: "Chief Data Officer;Chief AI Officer;Head of Data;Head of AI;Director of Machine Learning",
      mgmt: "Data Engineering Manager;ML Engineering Manager",
      lead: "Lead Data Scientist;ML Tech Lead;Principal AI Engineer",
      spec: "Data Analyst;Data Scientist;Data Engineer;Analytics Engineer;Machine Learning Engineer;AI Engineer;LLM Engineer;AI Agent Engineer;MLOps Engineer;AI Evaluation Specialist",
    },
  ],
  [
    "qa",
    "Calidad y testing",
    1,
    {
      exec: "Head of Quality Engineering;QA Director",
      mgmt: "QA Manager",
      lead: "QA Lead;Test Automation Lead",
      spec: "Manual QA Engineer;QA Automation Engineer;Software Development Engineer in Test;Performance Test Engineer;Accessibility QA Specialist;Security Tester",
    },
  ],
  [
    "mkt",
    "Marketing y Growth",
    1,
    {
      exec: "Chief Marketing Officer;VP of Marketing;Head of Marketing;Growth Director",
      mgmt: "Marketing Manager;Growth Manager;Brand Marketing Manager;Demand Generation Manager",
      lead: "SEO Lead;Performance Marketing Lead;Content Lead",
      spec: "Content Marketing Specialist;Social Media Specialist;SEO Specialist;Performance Marketing Specialist;CRM / Lifecycle Marketing Specialist;Email Marketing Specialist;Marketing Analyst;Community Manager",
    },
  ],
  [
    "ops",
    "Operaciones y estrategia",
    1,
    {
      exec: "Chief Operating Officer;VP of Operations;Head of Operations;Strategy Director",
      mgmt: "Operations Manager;Business Operations Manager;Revenue Operations Manager",
      lead: "Operations Lead;Process Improvement Lead",
      spec: "Operations Analyst;Business Analyst;Process Analyst;Operations Coordinator;Revenue Operations Specialist",
    },
  ],
  [
    "sales",
    "Ventas y desarrollo de negocio",
    0,
    {
      exec: "Chief Revenue Officer;VP of Sales;Sales Director;Head of Business Development",
      mgmt: "Sales Manager;Account Management Manager",
      lead: "Sales Team Lead;Solutions Consulting Lead",
      spec: "Account Executive;Sales Development Representative;Business Development Representative;Account Manager;Sales Engineer;Partnerships Specialist",
    },
  ],
  [
    "cs",
    "Customer Success y soporte",
    0,
    {
      exec: "VP of Customer Success;Head of Customer Experience",
      mgmt: "Customer Success Team Manager;Support Manager;Implementation Manager",
      lead: "Customer Support Lead;Onboarding Lead",
      spec: "Customer Success Manager;Customer Support Specialist;Technical Support Engineer;Onboarding Specialist;Implementation Consultant",
    },
  ],
  [
    "people",
    "People y Talent",
    0,
    {
      exec: "Chief People Officer;CHRO;VP of People;Head of People;HR Director",
      mgmt: "HR Manager;Talent Acquisition Manager;People Operations Manager",
      lead: "Talent Acquisition Lead;People Partner Lead",
      spec: "Talent Acquisition Specialist;Technical Recruiter;HR Business Partner;People Operations Specialist;Compensation & Benefits Specialist;Learning & Development Specialist;Payroll Specialist",
    },
  ],
  [
    "fin",
    "Finanzas, legal y administración",
    0,
    {
      exec: "Chief Financial Officer;Chief Legal Officer;Finance Director;Head of Finance;Legal Director",
      mgmt: "Finance Manager;Accounting Manager;Legal Operations Manager",
      lead: "FP&A Lead;Accounting Lead",
      spec: "Financial Analyst;FP&A Analyst;Accountant;Controller;Billing Specialist;Legal Counsel;Compliance Specialist;Procurement Specialist",
    },
  ],
];
const CAT = {};
CATS.forEach(([id, es, feat], o) => (CAT[id] = { id, es, feat, o }));
const ARCH = { exec: "head", mgmt: "manager", lead: "lead", spec: "ic" };
const DELIVERY = new Set(["program-manager", "delivery-manager", "project-manager"]);
const SYN = {
  "product-designer": "ux ui diseño de producto figma producto",
  "ux-designer": "ux experiencia de usuario",
  "ui-designer": "ui interfaz visual",
  "ux-researcher": "ux research investigacion usuarios entrevistas",
  "frontend-developer": "front end front-end frontend react vue angular javascript typescript web",
  "backend-developer": "back end back-end node java python go api",
  "fullstack-developer": "full stack fullstack react node",
  "mobile-developer": "movil ios android swift kotlin flutter react native app",
  "devops-engineer": "devops ci cd docker kubernetes aws",
  "ai-engineer": "ia ai llm agentes",
  "llm-engineer": "ia llm gpt claude prompts",
  "ai-agent-engineer": "agent agente agentes ia automatizacion",
  "machine-learning-engineer": "ml machine learning modelos",
  "data-analyst": "datos sql bi dashboards analisis",
  "data-engineer": "datos etl pipelines sql spark",
  "data-scientist": "datos estadistica python modelos",
  "qa-automation-engineer": "qa test testing automatizacion cypress playwright selenium",
  "manual-qa-engineer": "qa manual testing pruebas",
  "graphic-designer": "grafico diseno adobe piezas",
  "motion-designer": "animacion video after effects",
  "art-director": "direccion de arte",
  "tech-lead": "lead tecnico",
  "product-owner": "po backlog",
  "project-manager": "pm proyecto gestion de proyectos",
  "scrum-master-agile-coach": "agile scrum",
  "seo-specialist": "seo posicionamiento",
  "social-media-specialist": "redes sociales social",
  "content-marketing-specialist": "contenido copy redaccion blog",
  "head-of-design": "diseno director de diseno",
};
const TPCAT = { product: "po", pdesign: "product", creative: "graphic", eng: "full", data: "full", qa: "auto", mkt: "mkt" };
const TPID = {
  "ux-researcher": "ux",
  "ux-research-lead": "ux",
  "motion-designer": "motion",
  "motion-design-lead": "motion",
  "art-director": "ad",
  "creative-director": "cd",
  "tech-lead": "tl",
  "manual-qa-engineer": "manual",
  "accessibility-qa-specialist": "manual",
  "social-media-specialist": "social",
  "seo-specialist": "perf",
  "seo-lead": "perf",
  "performance-marketing-specialist": "perf",
  "performance-marketing-lead": "perf",
  "marketing-manager": "mm",
  "devops-engineer": "devops",
  "mobile-developer": "mob",
  "frontend-developer": "front",
  "backend-developer": "back",
  "head-of-design": "hod",
  "design-manager": "hod",
  "lead-product-designer": "product",
  "design-systems-lead": "product",
};
/* Market references (Spain, gross annual EUR, full time). Researched in November 2026.
   g = [junior, mid, senior]; s = indexes into SRC. BASE (€/month, Mid, Spain) = gross mid × (1 + employer on-cost) / 12, rounded to €10. */
const MP = {
    n: "Michael Page",
    u: "https://eiposgrados.com/wp-content/uploads/2026/06/Estudio-de-Remuneracion-2026-Michael-Page-Spain.pdf",
    d: "Estudio de Remuneración 2026 (rangos por años de experiencia; copia alojada en eiposgrados.com)",
  },
  LHH = {
    n: "LHH",
    u: "https://www.lhh.com/es-es/guia-salarial/-/jssmedia/project/lhh/lhhes/pdfs/lhh-guia-salarial-2026.pdf",
    d: "Guía Salarial 2026 (salario fijo bruto anual, sin variable)",
  };
const REF = {
  product: { g: [42500, 60000, 76250], s: [MP], y: 2026, note: "Media de Product Owner y Product Manager." },
  pdesign: { g: [36500, 45500, 57500], s: [LHH], y: 2026, note: "Perfil UX/UI designer." },
  creative: { g: [30750, 35125, 41500], s: [MP], y: 2026, note: "Perfil diseñador gráfico." },
  eng: { g: [33722, 45688, 61000], s: [MP, LHH], y: 2026, note: "Media de perfiles de desarrollo backend y frontend." },
  data: { g: [44125, 58125, 76875], s: [MP, LHH], y: 2026, note: "Media de Data Engineer y Data Scientist." },
  qa: { g: [34750, 46750, 62500], s: [MP, LHH], y: 2026, note: "Media de QA Automation y QA." },
  mkt: { g: [38031, 44875, 52062], s: [MP, LHH], y: 2026, note: "Media de perfiles de marketing digital, SEO y paid media." },
};
const ATEP = { rate: 0.015, n: "BOE, Real Decreto-ley 3/2026 (tarifa de accidentes de trabajo)", u: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-2548" };
const ONCOST = {
  base: 0.3065 /* common contingencies, unemployment, FOGASA, training and MEI */,
  rate: 0.3065 + 0.015 /* + workplace accidents, CNAE 62 */,
  n: "BOE, Orden PJC/297/2026 (cotización 2026)",
  u: "https://boe.es/buscar/pdf/2026/BOE-A-2026-7296-consolidado.pdf",
};
const LVL_SRC = "media de las guías de Michael Page y LHH por categoría (junior ÷ mid y senior ÷ mid)";
const LEVELS = {
  n: "Levels.fyi",
  d: "mediana de compensación total de ingeniería de software, todos los niveles",
  y: 2026,
  u: "https://www.levels.fyi/t/software-engineer/locations/",
};
const FXREF = {
  n: "BCE",
  d: "tipo de referencia 12/11/2026 (1 € = 20,7113 MXN)",
  u: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
};
const BASE = {};
Object.keys(REF).forEach((k) => (BASE[k] = Math.round((REF[k].g[1] * (1 + ONCOST.rate)) / 12 / 10) * 10));
const ARCHM = { ic: 1, delivery: 1, lead: 1.2, manager: 1.45, head: 1.75 }; /* estimates: no source */
/* Country factors = employer labour cost per hour in the information and communication sector, against Spain (34,8 €/h, 2025, Eurostat API).
   EU: Eurostat lc_lci_lev (NACE J, 2025; Países Bajos 2024 against Spain 2024 = 33,3, its 2025 cell is confidential). US: BLS ECEC, Information, Q2 2026 ($84,28 × BCE).
   UK: ONS average labour compensation per hour worked, Information and communication, 2025 (Table_4, N35: £40,2745 ÷ 0,85687, BCE 2025 average = 47,0 €).
   Latin America has no comparable public series: Levels.fyi software-engineer medians, marked as estimates. */
const NAMEMAX = 60; /* project titles: short; the goal carries the detail */
const COUNTRY = {
  España: 1,
  Portugal: 0.81,
  Francia: 1.7,
  Alemania: 1.68,
  "Países Bajos": 1.74,
  Irlanda: 2.06,
  "Reino Unido": 1.35,
  Polonia: 0.84,
  "Estados Unidos": 2.19,
  México: 0.74,
  Colombia: 0.63,
  Argentina: 0.62,
  /* more of the EU and EFTA, same Eurostat series (NACE J, 2025; Spain 34,8 €/h) */
  Austria: 1.77,
  Bulgaria: 0.69,
  Chequia: 1.0,
  Chipre: 1.13,
  Croacia: 0.86,
  Dinamarca: 1.82,
  Eslovaquia: 0.89,
  Eslovenia: 1.1,
  Estonia: 1.1,
  Finlandia: 1.47,
  Grecia: 0.74,
  Hungría: 0.7,
  Italia: 1.1,
  Letonia: 0.8,
  Lituania: 0.92,
  Luxemburgo: 1.81,
  Malta: 0.7,
  Noruega: 2.12,
  Rumanía: 0.75,
  Suecia: 1.8,
};
const EUROSTAT = { n: "Eurostat (lc_lci_lev)", d: "coste laboral por hora del sector información y comunicaciones, 2025", u: "https://ec.europa.eu/eurostat/databrowser/view/lc_lci_lev/default/table" };
const BLS = { n: "BLS (ECEC)", d: "coste del empleador por hora en el sector Information, 2.º trimestre de 2026", u: "https://www.bls.gov/iag/tgs/iag51.htm" };
const ONS = { n: "ONS (labour costs and labour share)", d: "remuneración media por hora trabajada en información y comunicaciones, 2025", u: "https://www.ons.gov.uk/economy/economicoutputandproductivity/productivitymeasures/datasets/labourcostsandlabourshare" };
const GBPREF = { n: "BCE, media anual 2025", d: "1 € = 0,85687 £", u: "https://www.suomenpankki.fi/en/statistics/interest-rates-and-exchange-rates/exchange-rates/average-annual-exchange-rates-for-the-year-2025/" };
/* «Europa · cualquier país»: for hiring remotely inside the EU without knowing where yet.
   Factor = simple average of the EU countries in the list (same Eurostat series). It is an estimate: it is not weighted by employment. */
const EUANY = "Europa · cualquier país";
{
  const eu = ["España", "Portugal", "Francia", "Alemania", "Países Bajos", "Irlanda", "Polonia", "Austria", "Bulgaria", "Chequia", "Chipre", "Croacia", "Dinamarca", "Eslovaquia", "Eslovenia", "Estonia", "Finlandia", "Grecia", "Hungría", "Italia", "Letonia", "Lituania", "Luxemburgo", "Malta", "Rumanía", "Suecia"];
  COUNTRY[EUANY] = Math.round((eu.reduce((t, k) => t + COUNTRY[k], 0) / eu.length) * 100) / 100;
}
const CTRY_SRC = { Austria: "eu", Bulgaria: "eu", Chequia: "eu", Chipre: "eu", Croacia: "eu", Dinamarca: "eu", Eslovaquia: "eu", Eslovenia: "eu", Estonia: "eu", Finlandia: "eu", Grecia: "eu", Hungría: "eu", Italia: "eu", Letonia: "eu", Lituania: "eu", Luxemburgo: "eu", Malta: "eu", Noruega: "eu", Rumanía: "eu", Suecia: "eu", Portugal: "eu", Francia: "eu", Alemania: "eu", "Países Bajos": "eu", Irlanda: "eu", Polonia: "eu", "Estados Unidos": "bls", "Reino Unido": "ons" };
/* Freelance: Malt day rates in Spain (barómetro de tarifas, 2026) by area, for 0-2 / 3-7 / 8-15 years of experience.
   Monthly cost = day rate × working days (HPM / 8). The factor is that, for a mid profile, against the employee cost with Social Security. */
const MALT = {
  eng: [177, 245, 303, "Expertos en TI y desarrolladores"],
  qa: [177, 245, 303, "Expertos en TI y desarrolladores (Malt no publica QA)"],
  pdesign: [177, 215, 257, "Diseñadores UX"],
  creative: [171, 199, 231, "Gráficos y diseñadores"],
  product: [280, 323, 384, "Product managers"],
  data: [195, 288, 359, "Data scientists"],
  mkt: [190, 214, 282, "Consultores de marketing"],
};
const MALT_SRC = { n: "Malt, barómetro de tarifas freelance", u: "https://www.malt.es/t/barometro-tarifas" };
const FREEF = {}; /* 1,800 h/year ÷ 12 ÷ 8 h = 18.75 billable days a month */
Object.keys(BASE).forEach((k) => (FREEF[k] = MALT[k] ? Math.round(((MALT[k][1] * 1800) / 12 / 8 / BASE[k]) * 100) / 100 : 0.92));
/* contract factor: freelance depends on the area (Malt); the others are fixed */
const ctF = (r) => ((r.ct || "free") === "free" ? FREEF[F(r.id).cat] ?? 0.92 : CT[r.ct || "free"][1]);
const CSRC = {
  España: "spain",
  Portugal: "portugal",
  Francia: "france",
  Alemania: "germany",
  "Países Bajos": "netherlands",
  Irlanda: "ireland",
  "Reino Unido": "united-kingdom",
  Polonia: "poland",
  "Estados Unidos": "united-states",
  México: "mexico",
  Colombia: "colombia",
  Argentina: "argentina",
};
const GR = { intern: ["Becario", 0.45], junior: ["Junior", 0.78], mid: ["Mid", 1], senior: ["Senior", 1.27], staff: ["Staff", 1.76], principal: ["Principal", 2.44] };
/* staff / principal = senior × (Manfred 2025 band midpoints: staff 90K ÷ senior 65K, principal 125K ÷ 65K), five large tech companies only */
const MANFRED = { n: "Manfred, comparativa de salarios en tecnología 2025", u: "https://www.getmanfred.com/blog/comparativa-salarios-tecnologia-espana-2025" };
const GRSRC = new Set(["junior", "mid", "senior"]); /* staff / principal: estimates */
const STAFFOK = new Set([
  "product-designer",
  "ux-designer",
  "ui-designer",
  "ux-researcher",
  "design-systems-designer",
  "ux-engineer",
  "product-manager",
]);
const HOD_SCOPES = ["Diseño de producto", "Marca y gráfico", "UX Research", "Design systems", "Motion y creatividad"];
const slug = (t) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const norm = (t) => (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const FAM = {};
CATS.forEach(([cid, , , g]) => {
  for (const k of ["spec", "lead", "mgmt", "exec"])
    g[k].split(";").forEach((t) => {
      let id = slug(t.replace(" / Agile Coach", " agile coach"));
      if (t === "Scrum Master / Agile Coach") id = "scrum-master-agile-coach";
      if (t === "Full-stack Developer") id = "fullstack-developer";
      if (t === "Content Designer / UX Writer") id = "content-designer";
      if (t === "CRM / Lifecycle Marketing Specialist") id = "crm-lifecycle-specialist";
      if (FAM[id]) id = id + "-" + cid;
      let arch = ARCH[k];
      if (DELIVERY.has(id)) arch = "delivery";
      const exec = /^(Chief|VP |CHRO)/.test(t);
      const gr =
        arch === "ic"
          ? ["eng", "data"].includes(cid) || STAFFOK.has(id)
            ? ["intern", "junior", "mid", "senior", "staff", "principal"]
            : ["intern", "junior", "mid", "senior"]
          : arch === "delivery"
            ? ["junior", "mid", "senior"]
            : [];
      /* titles that already carry seniority (Lead, Staff, Principal, Manager, Head…) have no Nivel field:
         the level is implicit and only feeds the cost */
      const g0 = arch === "lead" ? (/Principal/.test(t) ? "principal" : /Staff/.test(t) ? "staff" : "senior") : null;
      FAM[id] = {
        id,
        t,
        cat: cid,
        arch,
        exec,
        gr,
        g0,
        syn: SYN[id] || "",
        cross: id === "head-of-design",
        tp: TPID[id] || (arch === "head" || arch === "manager" ? "po" : TPCAT[cid] || "po"),
      };
    });
});
/* legacy ids from previous catalog → family + config */
const MIG = {
  po: ["product-owner"],
  pm: ["project-manager"],
  sm: ["scrum-master-agile-coach"],
  hop: ["head-of-product"],
  product: ["product-designer"],
  ux: ["ux-researcher"],
  dl: ["product-designer", { lead: true, grade: "senior" }],
  hod: ["head-of-design", { scopes: HOD_SCOPES.slice(0, 2) }],
  graphic: ["graphic-designer"],
  motion: ["motion-designer"],
  ad: ["art-director"],
  cd: ["creative-director"],
  front: ["frontend-developer"],
  back: ["backend-developer"],
  full: ["fullstack-developer"],
  mob: ["mobile-developer"],
  devops: ["devops-engineer"],
  tl: ["tech-lead"],
  em: ["engineering-manager"],
  manual: ["manual-qa-engineer"],
  auto: ["qa-automation-engineer"],
  ql: ["qa-lead"],
  mkt: ["content-marketing-specialist"],
  social: ["social-media-specialist"],
  perf: ["performance-marketing-specialist"],
  mm: ["marketing-manager"],
  hom: ["head-of-marketing"],
};
const F = (id) => FAM[id] || { id, t: id, cat: "product", arch: "ic", gr: ["junior", "mid", "senior"], syn: "", tp: "po", unknown: true };
function regCustom(c) {
  FAM[c.id] = {
    id: c.id,
    t: c.t,
    cat: c.cat,
    arch: c.arch,
    gr: c.arch === "ic" ? ["junior", "mid", "senior"] : [],
    syn: "",
    tp: TPCAT[c.cat] || "po",
    custom: true,
    rate: c.rate || null,
  };
}
const ARCH_ES = {
  ic: "Especialista",
  delivery: "Coordinación de proyecto",
  lead: "Liderazgo técnico",
  manager: "Gestión de personas",
  head: "Dirección",
};
const AIDESC = {
  product: "Usa IA para redactar historias de usuario, resumir reuniones y analizar datos.",
  pdesign: "Usa IA para investigar, generar variantes y prototipar.",
  creative: "Usa IA para generar y retocar imágenes y adaptar piezas.",
  eng: "Programa con asistentes y agentes de código que revisa.",
  data: "Usa IA y modelos en su trabajo diario.",
  qa: "Genera y mantiene pruebas automáticas con IA.",
  mkt: "Usa IA para redactar, adaptar contenidos y analizar campañas.",
};
/* Per-person monthly rate. Precedence: the role's own figure > the company rate (Ajustes · Tarifas de la empresa) > a custom role's rate > illustrative reference > null (no data).
   pr (optional) gives the default country (the paying company's). src: "Tu tarifa" | "Tarifa de tu empresa" | "Ilustrativo" | "Sin datos". */
const gradeOf = (r) => {
  const f = F(r.id);
  return f.gr.length ? (f.gr.includes(r.grade) ? r.grade : "mid") : f.g0 || null;
};
const rateKey = (r) => r.id + "|" + (gradeOf(r) || "-");
/* How a reference cost is built, with what is sourced and what is an estimate. ct: contract type (freelance is always an estimate). */
function refBreak(r, country, ct) {
  const f = F(r.id),
    cat = f.cat,
    b = BASE[cat];
  if (!b) return null;
  const gk = gradeOf(r),
    g = gk ? GR[gk] : null,
    /* remote with a country chosen (another country, or «Europa · cualquier país») costs what that country costs */
    remote = r.loc === "remote" && !r.country,
    cn = r.country || country,
    cf = remote ? 1 : (COUNTRY[cn] ?? 1),
    am = f.exec ? 2.2 : ARCHM[f.arch],
    lf = g ? g[1] : 1,
    why = [];
  if (remote) why.push("en remoto se toma el coste de España (sin fuente)");
  else if (cn === EUANY) why.push(`factor de Europa (×${COUNTRY[EUANY].toFixed(2).replace(".", ",")}): media simple de los países de la UE, no ponderada por empleo`);
  else if (cn !== "España" && !CTRY_SRC[cn])
    why.push(`factor de país (${cn}, ×${(COUNTRY[cn] ?? 1).toFixed(2).replace(".", ",")}) de Levels.fyi sobre ingeniería de software: no hay una estadística oficial comparable`);
  if (f.exec) why.push("puesto directivo (multiplicador sin fuente)");
  else if (am !== 1) why.push("multiplicador de liderazgo (sin fuente)");
  if (gk && !GRSRC.has(gk)) why.push(`nivel ${g[0]} (proporción de Manfred en cinco tecnológicas grandes, no representa todo el mercado)`);
  if (ct === "free" && (cat === "qa" || !MALT[cat])) why.push("tarifa freelance de QA tomada de desarrollo (Malt no publica QA)");
  return { v: Math.round(b * am * lf * cf), cat, base: b, cf, cn, remote, am, lf, gk, g, exec: !!f.exec, why, sourced: !why.length };
}
const illus = (r, country) => {
  const x = refBreak(r, country, "emp");
  return x ? x.v : null;
};
function rateOf(r, pr) {
  if (r.rate) return { v: r.rate, src: "Tu tarifa" };
  const cr = (D.rates || {})[rateKey(r)];
  if (cr > 0) return { v: cr, src: "Tarifa de tu empresa" };
  const f = F(r.id);
  if (f.rate) return { v: f.rate, src: "Tu tarifa" };
  const country = (pr && ENT(pr.ent) && ENT(pr.ent).country) || "España",
    x = refBreak(r, country, r.ct || "free");
  return x ? { v: x.v, src: x.sourced ? "Ref. de mercado" : "Estimación", m: x } : { v: null, src: "Sin datos" };
}
const refNames = (cat) => REF[cat].s.map((x) => x.n).join(" y ") + " " + REF[cat].y;
/* where a person's cost comes from, in small text */
function provText(r, pr) {
  const RT = rateOf(r, pr),
    f = F(r.id);
  if (RT.src === "Tu tarifa") return "Tu tarifa";
  if (RT.src === "Tarifa de tu empresa") return "Tarifa de tu empresa";
  if (RT.src === "Sin datos") return "Sin referencia";
  if (RT.src === "Ref. de mercado") return "Ref. de mercado · " + refNames(RT.m.cat);
  const where = r.loc === "remote" ? "remoto" : r.country || (pr && ENT(pr.ent) && ENT(pr.ent).country) || "España";
  return `Estimación · ${where} · ${gradeOf(r) ? GR[gradeOf(r)][0] : ARCH_ES[f.arch]}`;
}
const provTitle = (r, pr) => {
  const RT = rateOf(r, pr);
  if (RT.src === "Ref. de mercado")
    return "Dato de mercado: " + REF[RT.m.cat].s.map((x) => x.n + " (" + x.d + ")").join("; ") + ". Pulsa para ver cómo se calcula.";
  if (RT.src === "Estimación") return "Estimación. Sin fuente propia para: " + RT.m.why.join("; ") + ". Pulsa para ver cómo se calcula.";
  return "";
};
/* compact provenance for tight columns: full text goes in a title attribute */
const ISO = {
  España: "ES",
  México: "MX",
  Francia: "FR",
  Alemania: "DE",
  Portugal: "PT",
  Italia: "IT",
  "Reino Unido": "UK",
  "Estados Unidos": "US",
  [EUANY]: "UE",
};
function provShort(r, pr) {
  const t = provText(r, pr);
  return t.replace(/ · ([^·]+) · /, (m, w) => ` · ${ISO[w] || w} · `);
}
/* the provenance label as a button that opens "De dónde sale este coste" (only for reference costs; the others are plain text) */
function provBtn(r, pr, ri, short) {
  const RT = rateOf(r, pr),
    t = short === "src" ? RT.src : short ? provShort(r, pr) : provText(r, pr);
  if (RT.src !== "Ref. de mercado" && RT.src !== "Estimación") return esc(t);
  return `<button class="lnk srcb ${RT.src === "Estimación" ? "est" : ""}" data-src="${esc(pr.id)}|${ri}" aria-haspopup="dialog" title="${esc(provTitle(r, pr))}">${esc(t)}</button>`;
}
const f2 = (x) => x.toFixed(2).replace(".", ",");
const srcLink = (x) =>
  `<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)}${I("external-link-alt")}<span class="sr"> (se abre en una pestaña nueva)</span></a>`;
function srcModalHTML(pr, r) {
  const RT = rateOf(r, pr),
    x = RT.m,
    ref = REF[x.cat],
    gross = ref.g[1],
    cn = x.remote ? "remoto" : x.cn,
    row = (l, sm, v, cls = "") =>
      `<div class="irow lrow ${cls}"><span>${l}${sm ? `<small>${sm}</small>` : ""}</span><span>${v}</span></div>`,
    est = '<b class="estt">Estimación</b>';
  const rows = [
    row(
      "Salario bruto anual de referencia",
      `Mid, España, jornada completa. ${esc(ref.note)} Fuente: ${ref.s.map(srcLink).join(" y ")}, ${ref.y}.`,
      eur(gross),
    ),
    row(
      `+ ${f2(ONCOST.rate * 100)} % Seguridad Social a cargo de la empresa`,
      `Contrato indefinido: ${f2(ONCOST.base * 100)} % de cotización general (${srcLink(ONCOST)}) y ${f2(ATEP.rate * 100)} % de accidentes de trabajo para programación y consultoría informática, CNAE 62 (${srcLink(ATEP)}).`,
      eur(gross * (1 + ONCOST.rate)),
    ),
    row("÷ 12 meses", "Coste mensual base, redondeado a 10 €.", eur(x.base) + "/mes"),
    row(
      `× Factor de país · ${esc(cn)}`,
      x.remote
        ? `${est} En remoto se toma el coste de España.`
        : x.cn === "España"
          ? "País de referencia."
          : x.cn === EUANY
            ? `${est} Media simple del coste laboral por hora del sector información y comunicaciones en los países de la UE, frente a España. No se pondera por empleo: sirve mientras no sepas el país. ${srcLink(EUROSTAT)}.`
          : CTRY_SRC[x.cn] === "eu"
            ? x.cn === "Países Bajos" ? `Coste laboral por hora del sector información y comunicaciones frente a España, 2024 (58 € frente a 33,3 €): el dato de 2025 de Países Bajos es confidencial. ${srcLink(EUROSTAT)}.` : `Coste laboral por hora del sector información y comunicaciones frente a España (34,8 €/h), 2025. ${srcLink(EUROSTAT)}.`
            : CTRY_SRC[x.cn] === "ons"
              ? `Remuneración por hora trabajada en información y comunicaciones (40,27 £/h, unos 47 € al cambio medio del BCE) frente al coste laboral por hora en España (34,8 €/h), ambos de 2025. ${srcLink(ONS)} y ${srcLink(EUROSTAT)}. Comparación orientativa: las dos medidas son parecidas, pero no idénticas.`
            : CTRY_SRC[x.cn] === "bls"
              ? `Coste del empleador por hora en el sector Information (84,28 $/h, 2.º trimestre de 2026) frente a España (34,8 €/h, 2025), al cambio del BCE. ${srcLink(BLS)}.`
              : `${est} No hay una estadística oficial comparable: mediana de ingeniería de software de <a href="${LEVELS.u}${CSRC[x.cn] || ""}" target="_blank" rel="noopener">Levels.fyi<span class="sr"> (se abre en una pestaña nueva)</span></a> frente a España.`,
      "× " + f2(x.cf),
    ),
    row(
      `× Factor de nivel · ${x.g ? x.g[0] : "Mid"}`,
      !x.g || GRSRC.has(x.gk)
        ? `Calculado como ${LVL_SRC}. Fuentes: ${[MP, LHH].map(srcLink).join(" y ")}, 2026.`
        : `${est} Las guías no publican este nivel. Se aplica sobre el senior la proporción de ${x.gk === "staff" ? "Staff (90.000 €)" : "Principal (125.000 €)"} frente a Senior (65.000 €) de ${srcLink(MANFRED)}: puntos medios de cinco tecnológicas grandes, que no representan todo el mercado.`,
      "× " + f2(x.lf),
    ),
  ];
  if (x.am !== 1) rows.push(row(`× Tipo de puesto · ${esc(ARCH_ES[F(r.id).arch])}`, `${est} Sin fuente.`, "× " + f2(x.am)));
  rows.push(row("Coste de referencia por persona al mes", "", eur(RT.v), "tot"));
  const free =
    (r.ct || "free") === "free"
      ? `<p class="note"><span>En freelance se usa la tarifa diaria de Malt en España (${esc((MALT[x.cat] || MALT.eng)[3])}: ${(MALT[x.cat] || MALT.eng)[1]} €/día con 3-7 años de experiencia) por 18,75 días al mes. Frente a un empleado, × ${f2(ctF(r))}: sale ${eur(RT.v * ctF(r))} al mes. Fuente: ${srcLink(MALT_SRC)}.</span></p>`
      : "";
  const fx =
    x.cn === "México"
      ? `<p class="note">Cifras en euros; el tipo de cambio de México es el del ${esc(FXREF.n)}: ${esc(FXREF.d)}.</p>`
      : "";
  return `<div class="scrim" data-close></div><div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">De dónde sale este coste</h2><p class="shsub">${dname(r)} · ${esc(cn)} · ${RT.src === "Ref. de mercado" ? "Ref. de mercado" : "Estimación"}</p></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="sbody"><div class="tbox">${rows.join("")}</div>${RT.src === "Estimación" && x.why.some((w) => !w.startsWith("factor freelance")) ? `<p class="note">Es una estimación porque: ${esc(x.why.filter((w) => !w.startsWith("factor freelance")).join("; "))}.</p>` : ""}${free}${fx}</div></div>`;
}
const dname = (r) => {
  const f = F(r.id),
    t = r.title || f.t,
    g = f.gr.length && r.grade && r.grade !== "mid" ? GR[r.grade][0] + " " : "";
  return esc(g + t + (r.lead && f.arch === "ic" ? " · Lead" : "")); /* escaped: always used inside HTML */
};
const CT = {
  free: ["Freelance", 0.92, 45, "Por proyecto o por horas. Factura sus horas; más flexible."],
  emp: ["Empleado", 1, 550, "Contrato laboral a jornada completa, gestionado con un proveedor de empleo (EOR)."],
  own: ["Plantilla interna", 0, 0, "Persona que ya trabaja en tu empresa: suma capacidad al proyecto, no coste."],
};
const DEF = {
  chat: "slack_pro",
  ui: "figma_pro",
  creative: "cc_pro",
  stock: "ss10",
  imgai: "firefly",
  code: "cursor",
  qa: "testrail",
  crm: "hubspot",
  pm: "linear",
  genai: "claude_std",
};
const TYPES = {
  digital: ["layer-group", "Plataforma o web app"],
  mobile: ["mobile-android", "App móvil"],
  web: ["globe", "Web o tienda online"],
  mkt: ["megaphone", "Contenido y marketing"],
  brand: ["palette", "Marca e identidad"],
  data: ["robot", "Datos, IA y automatización"],
  maint: ["setting", "Mantener o mejorar algo existente"],
  other: ["question-circle", "Otro"],
};
const PLAZO = [
  [3, "3 meses"],
  [6, "6 meses"],
  [12, "1 año"],
  [24, "2 años"],
  [0, "Sin fecha de fin"],
];
const SIZE = [
  ["s", "Pequeño"],
  ["m", "Mediano"],
  ["l", "Grande"],
  ["xl", "Muy grande"],
];
const NAV = [
  ["home", "home-alt", "Inicio"],
  ["notes", "bell", "Notificaciones"],
  ["projects", "layer-group", "Proyectos"],
  ["people", "users-alt", "Personas"],
  ["licenses", "key-skeleton", "Software e IA"],
  ["settings", "setting", "Ajustes"],
];
const SMOOTH = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const STORE = "humain21",
  LEGACY = "humain20"; /* previous key: only the user's own data (not the old demo) is migrated from it */
let D;
const save = () => {
  try {
    (D.projects || []).forEach(personify);
    localStorage.setItem(STORE, JSON.stringify(D));
  } catch (e) {}
};
let V = { view: "home", id: null, modal: null, open: null, draft: null, toast: null, menu: false, nav: false };
