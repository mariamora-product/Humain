const LANGK = "humain_lang";
let LANG = (() => {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "es") { localStorage.setItem(LANGK, q); return q; }
    const s = localStorage.getItem(LANGK);
    if (s === "en" || s === "es") return s;
  } catch (e) {}
  return "en";
})();
const LOC = () => (LANG === "en" ? "en-GB" : "es-ES");
const I = (n, c = "") => `<svg class="i ${c}" aria-hidden="true" focusable="false"><use href="#u-${n}"/></svg>`;
const numFmt = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const eur = (v) => (v < 0 ? "−" : "") + String(Math.round(Math.abs(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "\u00a0€";
const FX = 0.9024; /* USD → EUR: 1 / 1,1081, tipo de referencia del BCE del 12/11/2026 */
/* list prices are in the currency the vendor publishes for Spain: cur "EUR" stays as is, the rest are dollars */
const toEUR = (id, v) => (opt(id) && opt(id).cur === "EUR" ? v : v * FX);
const TC = {
  ui: {
    n: "Diseño de interfaces",
    roles: ["product", "ux", "dl", "hod"],
    opts: [
      { id: "figma_pro", n: "Figma Professional", p: 16, note: "asiento completo · Dev 12 $ · Collab 3 $ · pago anual · 20 $ mensual" },
      { id: "figma_org", n: "Figma Organization", p: 55, note: "asiento completo · Dev 25 $ · Collab 5 $ · solo pago anual · SSO y sistemas de diseño" },
    ],
  },
  research: {
    n: "Investigación con usuarios",
    roles: ["ux", "product"],
    optional: true,
    opts: [
      { id: "maze", n: "Maze Starter", p: 99, unit: "plan", note: "5 plazas · 1 estudio al mes · fuente: web oficial de Maze" },
      { id: "hotjar", n: "Contentsquare Growth (antes Hotjar)", p: 39, unit: "plan", note: "desde · pago anual · según sesiones" },
    ],
  },
  /* product analytics: priced by event or session volume, not per seat (sources: official pricing pages; FullStory publishes no price) */
  analytics: {
    n: "Analítica de producto",
    roles: ["po", "perf"],
    optional: true,
    opts: [
      { id: "posthog", n: "PostHog (pago por uso)", p: 50, unit: "plan", note: "≈2 M eventos/mes: el primer millón gratis y luego 0,00005 $/evento · sin pago por asiento · fuente: web oficial de PostHog" },
      { id: "mixpanel", n: "Mixpanel Growth", p: 120, unit: "plan", note: "≈1,5 M eventos/mes · pago anual (140 $ mensual) · el primer millón gratis · fuente: calculadora de Mixpanel" },
      { id: "amplitude", n: "Amplitude Plus", p: 0, unit: "plan", note: "gratis hasta 2 M eventos/mes; por encima, según volumen · asientos ilimitados · fuente: web oficial de Amplitude" },
      { id: "fullstory", n: "FullStory Business", p: 2354, unit: "plan", note: "sin precio público: mediana pagada 28.245 $/año (Vendr) · según sesiones" },
    ],
  },
  creative: {
    n: "Software creativo",
    roles: ["graphic", "motion", "ad", "cd", "mkt", "social"],
    opts: [
      { id: "cc_pro", n: "Adobe Creative Cloud Pro (equipos)", p: 86.55, cur: "EUR", note: "todas las apps · plan anual · sin IVA" },
      { id: "cc_one", n: "Adobe · una app (equipos)", p: 33.49, cur: "EUR", note: "p. ej. solo Illustrator · plan anual · sin IVA" },
      { id: "canva", n: "Canva Pro", p: 110 / 12, cur: "EUR", note: "por persona · 110 €/año · fuente: web oficial de Canva" },
    ],
  },
  stock: {
    n: "Banco de imágenes",
    roles: ["graphic", "ad", "social"],
    optional: true,
    opts: [
      { id: "ss10", n: "Shutterstock · 10 imágenes/mes", p: 25, unit: "plan", note: "compromiso anual" },
      { id: "ss50", n: "Shutterstock · 50 imágenes/mes", p: 55, cur: "EUR", unit: "plan", note: "suscripción anual · 660 €/año · fuente: web oficial de Shutterstock" },
      { id: "as10", n: "Adobe Stock · 10 recursos/mes", p: 29.99, cur: "EUR", unit: "plan", note: "compromiso anual" },
      { id: "as40", n: "Adobe Stock · paquete de 40 créditos", p: 269.99, cur: "EUR", unit: "plan", once: true, note: "compra puntual · 40 imágenes estándar o 5 vídeos HD · caducan al año · fuente: web oficial de Adobe Stock" },
      { id: "envato", n: "Envato Elements · ilimitado", p: 16.5, note: "por persona · pago anual" },
    ],
  },
  imgai: {
    n: "Imágenes con IA",
    roles: ["graphic", "motion", "ad", "mkt", "social"],
    ai: true,
    optional: true,
    opts: [
      { id: "mj", n: "Midjourney Basic", p: 8, note: "pago anual · 10 $ mensual" },
      { id: "firefly", n: "Adobe Firefly", p: 0, note: "incluido en Creative Cloud Pro" },
    ],
  },
  code: {
    n: "Asistente de código con IA",
    roles: ["front", "back", "full", "mob", "devops", "tl", "auto"],
    ai: true,
    opts: [
      { id: "copilot", n: "GitHub Copilot Business", p: 19 },
      { id: "cursor", n: "Cursor Teams", p: 30 },
      { id: "claude_prem", n: "Claude Team Premium (Claude Code)", p: 100, note: "pago anual · 125 $ mensual · uso intensivo" },
      { id: "codex", n: "ChatGPT Business (Codex)", p: 20, note: "pago anual · 25 $ mensual · Codex incluido" },
    ],
  },
  qa: { n: "Gestión de pruebas", roles: ["manual", "auto", "ql"], opts: [{ id: "testrail", n: "TestRail Professional", p: 38, note: "pago anual" }] },
  devices: {
    n: "Pruebas en navegadores y móviles",
    roles: ["manual", "auto"],
    optional: true,
    opts: [{ id: "bstack", n: "BrowserStack Live", p: 39, note: "desde · pago anual" }],
  },
  crm: {
    n: "Marketing y CRM",
    roles: ["mkt", "perf", "mm"],
    opts: [
      { id: "hubspot", n: "HubSpot Starter", p: 20, cur: "EUR", note: "por asiento · precio de lista · hay promociones desde 7 € · fuente: web oficial de HubSpot" },
      { id: "mailchimp", n: "Mailchimp Standard", p: 20, unit: "plan", note: "desde · según contactos" },
    ],
  },
  seo: {
    n: "SEO y analítica",
    roles: ["perf"],
    optional: true,
    opts: [{ id: "semrush", n: "Semrush SEO (antes Pro)", p: 117.33, unit: "plan", note: "pago anual · 139 $ mensual" }],
  },
  collab: {
    n: "Pizarras y colaboración",
    roles: [],
    optional: true,
    opts: [
      { id: "miro_st", n: "Miro Starter", p: 8, note: "por miembro · pago anual · 10 $ mensual" },
      { id: "miro_bz", n: "Miro Business", p: 20, note: "por miembro · pago anual · 25 $ mensual · SSO" },
    ],
  },
  chat: {
    n: "Mensajería",
    roles: [],
    optional: true,
    opts: [
      { id: "slack_pro", n: "Slack Pro", p: 7.25, note: "por usuario · pago anual · 8,75 $ mensual" },
      { id: "slack_bp", n: "Slack Business+", p: 15, note: "por usuario · pago anual · 18 $ mensual · IA incluida" },
    ],
  },
  docs: {
    n: "Documentación",
    roles: [],
    optional: true,
    opts: [
      { id: "notion_plus", n: "Notion Plus", p: 10, note: "por miembro · pago anual · 12 $ mensual" },
      { id: "notion_bz", n: "Notion Business", p: 20, note: "por miembro · pago anual · 24 $ mensual · Notion AI incluida" },
    ],
  },
  pm: {
    n: "Gestión de tareas",
    scope: "all",
    opts: [
      { id: "jira", n: "Jira Standard", p: 7.91, note: "por usuario · facturación mensual · varía según el tamaño del equipo · fuente: web oficial de Atlassian" },
      { id: "linear", n: "Linear Business", p: 16, note: "pago anual" },
      { id: "linear_b", n: "Linear Basic", p: 10, note: "pago anual" },
    ],
  },
  genai: {
    n: "IA general para el equipo",
    scope: "ai",
    ai: true,
    opts: [
      { id: "claude_std", n: "Claude Team Standard", p: 20, note: "pago anual · 25 $ mensual · mín. 2" },
      { id: "chatgpt", n: "ChatGPT Business", p: 20, note: "pago anual · 25 $ mensual · mín. 2" },
    ],
  },
  /* programs a Responsable asks for that the catalogue does not have yet: they travel with the team proposal */
  other: { n: "Otros programas", roles: [], optional: true, opts: [] },
};

/* the vendor's own SVG, when the company adds it to assets/tools/ (names below); until then the category icon */
const TOOLSVG = {
  figma_pro: "figma", figma_org: "figma", maze: "maze", hotjar: "contentsquare", cc_pro: "adobe-creative-cloud", cc_one: "adobe-creative-cloud",
  canva: "canva", ss10: "shutterstock", ss50: "shutterstock", as10: "adobe-stock", as40: "adobe-stock", envato: "envato", mj: "midjourney", firefly: "adobe-firefly",
  copilot: "github-copilot", cursor: "cursor", claude_prem: "claude", claude_std: "claude", codex: "chatgpt", chatgpt: "chatgpt",
  testrail: "testrail", bstack: "browserstack", hubspot: "hubspot", mailchimp: "mailchimp", semrush: "semrush", jira: "jira", linear: "linear", linear_b: "linear",
};
const TOOLOK = new Set();
[...new Set(Object.values(TOOLSVG))].forEach((f) => {
  const im = new Image();
  im.onload = () => {
    TOOLOK.add(f);
    clearTimeout(TOOLOK._t);
    TOOLOK._t = setTimeout(() => typeof render === "function" && render(), 60);
  };
  im.src = `assets/tools/${f}.svg`;
});
const toolIc = (oid) => {
  const f = TOOLSVG[oid];
  return f && TOOLOK.has(f)
    ? `<span class="tic"><img src="assets/tools/${f}.svg" alt="" aria-hidden="true" width="20" height="20"/></span>`
    : ""; /* no vendor file, no icon: the name alone */
};
const ALLOPTS = Object.values(TC).flatMap((c) => c.opts),
  opt = (id) => ALLOPTS.find((o) => o.id === id);
/* Roles: name, group, cost per person/month (€, full time, illustrative), AI-friendliness */
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
  base: 0.3065 /* contingencias comunes, desempleo, FOGASA, formación y MEI */,
  rate: 0.3065 + 0.015 /* + accidentes de trabajo, CNAE 62 */,
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
/* «Europa · cualquier país»: para quien contrata en remoto dentro de la UE sin saber aún dónde.
   Factor = media simple de los países de la UE de la lista (misma serie Eurostat). Es una estimación: no pondera por empleo. */
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
const FREEF = {}; /* 1.800 h/año ÷ 12 ÷ 8 h = 18,75 días facturables al mes */
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
/* ===== Who is looking, people and project states ===== */
const ST = {
  draft: ["Borrador", "draft"],
  pending: ["Pendiente", "pend"],
  changes: ["Cambios pedidos", "pend"],
  approved: ["Aprobado", "active"],
  active: ["En curso", "run"],
  done: ["Finalizado", "draft"],
  rejected: ["Rechazado", "rej"],
  cancelled: ["Cancelado", "draft"],
};
/* the stage shown to people: an approved project is «Aprobado» until its start month and «Finalizado» once its last month is over */
const stOf = (p) => {
  if (p.status !== "active") return p.status;
  if (p.start && mIdx(p.start) > 0) return "approved";
  const e = endsIn(p);
  return e !== null && e <= 0 ? "done" : "active";
};
const stPill = (p) => (p.archived ? `<span class="pill">Archivado</span>` : `<span class="pill ${ST[stOf(p)][1]}">${ST[stOf(p)][0]}</span>`);
const LVLS = ["junior", "mid", "senior"],
  LVLS_ALL = ["intern", "junior", "mid", "senior", "staff", "principal"],
  LV = { intern: -1, junior: 0, mid: 1, senior: 2, staff: 3, principal: 4 };
const isBoard = () => D.as === "board";
const meName = () => (D.me && D.me.name) || "Tú";
const canSee = (p) => (isBoard() ? p.status !== "draft" : p.owner === meName());
const PERSON = (id) => (D.people || []).find((x) => x.id === id);
const MGR = (name) => (D.managers || []).find((m) => m.name === name);
/* a Responsable can lead several teams: m.teams (the first is m.team); each person belongs to one of them (x.unit) */
const teamsOf = (owner) => {
  const m = MGR(owner);
  return m ? m.teams || [m.team] : owner ? [owner] : [];
};
const teamName = (owner) => {
  const t = teamsOf(owner);
  return t.length > 2 ? `Equipo de ${String(owner).split(" ")[0]}` : t.join(" y ");
};
const unitOf = (x) => {
  if (!x) return "";
  const ts = teamsOf(x.team);
  if (x.unit && ts.includes(x.unit)) return x.unit;
  /* no team set yet: designers go to «Diseño» when their lead has one (the demo's two-team lead), everyone else to the lead's first team */
  return ts.includes("Diseño") && ["pdesign", "creative"].includes(F(x.fid).cat) ? "Diseño" : ts[0] || "";
};
/* people are listed by area (the kind of role), not by a team someone had to create: designers, product managers, engineers... */
const areaOf = (x) => {
  const c = F(x.fid).cat;
  return ["pdesign", "creative"].includes(c) ? "Diseño" : (CATS.find((k) => k[0] === c) || [0, "Otros"])[1];
};
const areaCats = (a) => (a === "Diseño" ? ["pdesign", "creative"] : CATS.filter((k) => k[1] === a).map((k) => k[0]));
const AREAS = [...new Set(CATS.map((k) => (["pdesign", "creative"].includes(k[0]) ? "Diseño" : k[1])))];
const isLive = (p) => p.status === "active" && !p.archived;
/* months from now until a live project ends (null = continuous) */
const endsIn = (p) => (p.months ? (p.start ? mIdx(p.start) : 0) + p.months : null);
/* a person is busy when a seat of a project in progress (approved) points at them.
   For another project (except), only what still runs when that one starts counts: someone who finishes before is free for it. */
const projectsOf = (pid, except) => {
  const ex = except && D.projects.find((p) => p.id === except),
    from = ex && ex.status !== "active" ? Math.max(0, ex.start ? mIdx(ex.start) : 1) : null;
  return D.projects.filter((p) => isLive(p) && p.id !== except && (from === null || endsIn(p) === null || endsIn(p) > from) && p.roles.some((r) => (r.fill || []).some((f) => f.pid === pid)));
};
const isFree = (pid, except) => !projectsOf(pid, except).length && !((PERSON(pid) || {}).leaving); /* someone who is leaving is not available for a new project */
/* someone placed in a project that is not running yet (draft, changes, pending, approved) is not free any more, but not busy either */
const heldBy = (pid, except) => D.projects.filter((p) => !isLive(p) && !p.archived && p.id !== except && ["draft", "changes", "pending", "approved"].includes(p.status) && p.roles.some((r) => (r.fill || []).some((f) => f.pid === pid && f.src === "mine")));
const isOpen = (pid, except) => isFree(pid, except) && !heldBy(pid, except).length;
const visPeople = () => (D.people || []).filter((x) => isBoard() || x.team === meName());
/* free people of OTHER teams with this exact role */
const otherFree = (pr, fid, except = pr.id) => (D.people || []).filter((x) => x.team !== pr.owner && x.fid === fid && isFree(x.id, except));
/* The fill rule, seat by seat: a free person of my team (same role; else same area and same or higher level) ->
   part-time seats may share someone of my team who is already busy -> a free profile of another team (Dirección picks who) -> a new hire. */
function autoSeat(pr, r, U) {
  if (pr.startFrom === "new") return { src: "new" };
  const f = F(r.id),
    g = LV[gradeOf(r)] ?? 0,
    mine = (D.people || []).filter((x) => x.team === pr.owner && !U.ids.has(x.id)),
    fr = mine.filter((x) => isFree(x.id, pr.id));
  let x = fr.find((y) => y.fid === r.id) || fr.find((y) => F(y.fid).cat === f.cat && LV[y.lvl] >= g);
  if (x) {
    U.ids.add(x.id);
    return { src: "mine", pid: x.id };
  }
  if (!r.n) {
    x = mine.find((y) => y.fid === r.id);
    if (x) {
      U.ids.add(x.id);
      return { src: "shared", pid: x.id, part: true };
    }
  }
  return { src: "new" };
}
/* keeps one fill entry per seat: existing choices stay, new seats follow the rule; reset = fill every seat again */
function syncFill(pr, reset) {
  const U = { ids: new Set(), oc: {} };
  pr.roles.forEach((r) => {
    r.fill = reset ? [] : arr(r.fill).slice(0, seatsOf(r));
    r.fill.forEach((f) => {
      if (f.pid) U.ids.add(f.pid);
      if (f.src === "other") U.oc[r.id] = (U.oc[r.id] || 0) + 1;
    });
  });
  pr.roles.forEach((r) => {
    while (r.fill.length < seatsOf(r)) r.fill.push(autoSeat(pr, r, U));
  });
}
/* ===== One row = one person =====
   Each role holds one person (n = 1, or hours), with their own programs: r.tools = { optionId: optionId }.
   Old data (several people per role, one program per category, a team-wide AI) is turned into that shape. */
function tcOf(k, id) {
  if (TC[k]) return TC[k];
  for (const c in TC) if (TC[c].opts.some((o) => o.id === id)) return TC[c];
  return {};
}
function hasAiTool(r) {
  return Object.values(r.tools || {}).some((id) => id && tcOf("", id).ai);
}
function personify(pr) {
  if (!pr || !Array.isArray(pr.roles)) return pr;
  pr.shared = pr.shared || {};
  const gen = [pr.shared.genai, ...arr(pr.shared.genaiX)].filter((x) => x && opt(x)),
    out = [];
  pr.roles.forEach((r) => {
    if (!r || typeof r !== "object") return;
    if (!r.uid) r.uid = "r" + Math.random().toString(36).slice(2, 9);
    const legacy = Object.keys(r.tools || {}).some((k) => TC[k]),
      needGen = gen.length && (r.ai || 0) > 0 && !hasAiTool(r);
    if (!legacy && !needGen && !(r.n > 1)) {
      r.ai = hasAiTool(r) ? 1 : 0;
      r.qty = r.qty || {};
      out.push(r);
      return;
    }
    const k = r.n > 1 ? r.n : 1;
    for (let i = 0; i < k; i++) {
      const p = JSON.parse(JSON.stringify(r)),
        usesAI = i < (r.ai || 0);
      if (r.n > 1) p.n = 1;
      p.fill = r.fill && r.fill[i] ? [r.fill[i]] : [];
      if (legacy) {
        const t = {};
        for (const c in r.tools) {
          const id = r.tools[c];
          if (!id || !opt(id)) continue;
          if (tcOf(c, id).ai && !usesAI) continue;
          t[id] = id;
        }
        p.tools = t;
      }
      p.tools = p.tools || {};
      if (usesAI) gen.forEach((g) => (p.tools[g] = g));
      p.qty = {};
      p.ai = hasAiTool(p) ? 1 : 0;
      if (i > 0) p.uid = r.uid + "_" + i;
      out.push(p);
    }
  });
  pr.roles = out;
  pr.shared.genai = null;
  pr.shared.genaiX = [];
  return pr;
}
/* the person form: -1 adds someone, an index edits that person */
function openPerson(pr, i) {
  const r = i >= 0 ? pr.roles[i] : null,
    f = r ? (r.fill || [])[0] || { src: "new" } : null;
  V.draft = r
    ? { ri: i, lvl: r.grade || "", rate: r.rate || "", hrate: r.hrate || "", cat: F(r.id).cat, fid: r.id, who: (f.src === "mine" || f.src === "shared") && f.pid ? f.pid : "new", ded: r.n ? "full" : String(r.hours || 80), tools: Object.values(r.tools || {}).filter((x) => x && opt(x)), country: r.country || "", ct: r.ct || "emp", more: false, pOpen: false, err: "" }
    : { ri: -1, cat: "", fid: "", who: "new", ded: "full", tools: [], country: "", ct: pr.months && pr.months <= 3 ? "free" : "emp", more: false, pOpen: false, err: "" };
  V.modal = "pform";
  render();
}
/* the programs HUMAIN suggests for one person of a role */
function defTools(fid, pr) {
  const r = mkRole(fid, 1),
    ids = Object.values(personify({ roles: [r], shared: { genai: F(fid).cat in AIDESC ? pick("genai") : null } }).roles[0].tools);
  return ids.map((id) => {
    const c = pr ? compOpts(catOfOpt(id), pr) : [];
    return c.length && !c.some((o) => o.id === id) ? c[0].id : id;
  });
}
/* what a Responsable can ask for: one entry per product (Figma, Miro…), not per plan;
   the plan is the one the company already has, or the first one when it has none */
function toolChoices(cat) {
  const P0 = P() || { ent: (D.ents || [])[0] && D.ents[0].id },
    groups = {};
  ALLOPTS.filter((o) => o.p > 0 && (!cat || catOfOpt(o.id) === cat)).forEach((o) => {
    const k = catOfOpt(o.id) + "|" + o.n.split(/[ ·(]/)[0];
    (groups[k] = groups[k] || []).push(o);
  });
  const clean = (n) => n.replace(/\s*\(.*?\)/g, "").split(" · ")[0].trim(),
    seen = new Set();
  return Object.values(groups)
    .map((g) => {
      const own = (D.licenses || []).find((l) => g.some((o) => o.id === l.opt)),
        o = own ? g.find((x) => x.id === own.opt) : g[0];
      let lab = clean(o.n);
      if (g.length > 1) {
        /* the words every plan shares: «Figma», «Adobe Stock», «Miro» */
        const ws = g.map((x) => clean(x.n).split(" "));
        let i = 0;
        while (ws.every((w) => w[i] && w[i] === ws[0][i])) i++;
        lab = ws[0].slice(0, Math.max(1, i)).join(" ");
        if (lab === "Adobe") lab = "Adobe Creative Cloud";
      }
      return [o.id, lab];
    })
    .filter(([, l]) => !seen.has(l) && seen.add(l));
}
/* the tools every person of a project uses (Jira, Slack…): not chosen per person, counted for all */
const teamTools = (pr) => ["pm", "chat"].map((k) => pr && pr.shared && pr.shared[k] && opt(pr.shared[k])).filter(Boolean).map((o) => o.n);
const andList = (xs) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1]);
/* the programs a person uses in the running projects of the viewer (not the team-wide ones) */
function toolsOfPerson(pid) {
  const out = new Set();
  D.projects
    .filter((q) => !q.archived && !q.full && isLive(q))
    .forEach((q) => q.roles.forEach((r) => (r.fill || []).some((f) => f && f.pid === pid) && Object.values(r.tools || {}).forEach((t) => t && opt(t) && out.add(t))));
  return [...out].sort(toolSort);
}
const toolChip = (t) => `<span class="pchip${isAiTool(t) ? " ai" : ""}"${short0(opt(t).n) !== opt(t).n ? ` title="${esc(opt(t).n)}"` : ""}>${esc(opt(t).n.replace(/\s*\(.*?\)/g, "").split(" · ")[0])}</span>`;
/* the plans of a kind of program the company already pays for: then that plan is the only choice */
function compOpts(cat, pr) {
  const have = new Set((D.licenses || []).filter((l) => inScope(l, pr)).map((l) => l.opt));
  return ((TC[cat] || {}).opts || []).filter((o) => have.has(o.id));
}
/* one plan per kind of program (Figma Professional or Organization), except general AI: Claude and ChatGPT can go together */
const multiCat = (cat) => cat === "genai" || cat === "other";
/* AI preference: "none" drops every AI tool, "own" keeps only AI tools with free seats already paid, "rec" as suggested */
function applyAiPref(pr) {
  const pref = pr.aiPref || "rec";
  if (pref === "rec") return;
  const keep = (id) => pref === "own" && id && freeSeatsFor(id, pr) > 0;
  pr.roles.forEach((r) => {
    for (const ck in r.tools)
      if (tcOf(ck, r.tools[ck]).ai && !keep(r.tools[ck])) {
        if (TC[ck]) r.tools[ck] = null;
        else delete r.tools[ck];
      }
    if (pref === "none") r.ai = 0;
    if (!Object.keys(r.tools).some((k) => TC[k])) r.ai = hasAiTool(r) ? 1 : 0;
  });
  if (pr.shared && !keep(pr.shared.genai)) pr.shared.genai = null;
  if (pr.shared && pr.shared.genaiX) pr.shared.genaiX = pr.shared.genaiX.filter(keep);
}
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const startLabel = (p) => {
  if (!p.start) return "";
  const [y, m] = p.start.split("-").map(Number),
    d = new Date(y, m - 1, 1),
    t = d.toLocaleDateString(LOC(), { month: "long" });
  return (mIdx(d) < 0 ? "empezó en " : "empieza en ") + t + (y !== new Date().getFullYear() ? " de " + y : "");
};
const P = () => D.projects.find((p) => p.id === V.id),
  ENT = (id) => D.entities.find((e) => e.id === id);
const multi = () => D.entities.length > 1,
  inEnt = (p) => D.ent === "all" || p.ent === D.ent;
const catsFor = (id) =>
  Object.entries(TC)
    .filter(([, c]) => c.roles && c.roles.includes(id))
    .map(([k]) => k);
/* ===== Seats belong to people =====
   A licence has the seats contracted, its holders (people of HUMAIN with a seat) and `other` (seats of people outside HUMAIN).
   A project only adds seats for the people on it who don't hold one yet: new hires, or someone whose role never needed the tool.
   A project uses seats from its start month to its last month; one finished or not started yet uses none today. */
const inScope = (l, p) => l.scope === "group" || l.scope === p.ent;
const startKey = (p) => p.start || "";
/* projects are served in order of start date, so per-project allocations add up to the licence totals */
const servedBefore = (a, b) => startKey(a) < startKey(b) || (startKey(a) === startKey(b) && D.projects.indexOf(a) > D.projects.indexOf(b));
/* months from now in which a project uses seats: [first, last+1) */
const spanOf = (p) => {
  const s = p.start ? mIdx(p.start) : p.status === "active" ? 0 : 1,
    s0 = p.status === "active" ? s : Math.max(0, s);
  return [s0, p.months ? s + p.months : Infinity];
};
const overlaps = (a, b) => {
  const [s1, e1] = spanOf(a),
    [s2, e2] = spanOf(b);
  return s1 < e2 && s2 < e1;
};
/* the people of a project who use a tool: those named on the seats of the roles that use it (the shared tools: the whole team, AI only for roles with AI) */
function usersOf(pr, oid) {
  const ids = new Set(),
    sh = pr.shared || {};
  pr.roles.forEach((r) => {
    const uses = Object.entries(r.tools || {}).some(([c, id]) => id === oid && !(tcOf(c, id).ai && ownAI(r, pr))) || sh.pm === oid || (genaiAll(pr).includes(oid) && r.ai > 0 && !ownAI(r, pr));
    if (uses) (r.fill || []).forEach((f) => f.pid && ids.add(f.pid));
  });
  return [...ids];
}
const holdersOf = (oid, pr) => D.licenses.filter((l) => l.opt === oid && inScope(l, pr)).flatMap((l) => l.holders || []);
/* seats of a tool for a project: q needed; `has` of them are people who already hold one; `add` are new seats for this project */
function seatSplit(pr, oid) {
  const o = opt(oid),
    q = (pr.own || []).includes(oid) ? 0 : projNeed(pr).need[oid] || 0;
  if (!q || !o || o.unit === "plan" || o.once) return { q, has: 0, hasP: [], add: q };
  const H = new Set(holdersOf(oid, pr)),
    hasP = usersOf(pr, oid)
      .filter((pid) => H.has(pid))
      .slice(0, q);
  return { q, has: hasP.length, hasP, add: q - hasP.length };
}
const needOfOpt = (p, oid) => seatSplit(p, oid).add;
/* company setting: freelancers bring their own AI (paid within their rate) or use the company's accounts (a seat on the project);
   sent proposals and approved projects keep the setting they were sent with; drafts follow the current one */
const ownAI = (r, pr) => ((pr && pr.freeAI) || D.freeAI) === "own" && (r.ct || "free") === "free";
/* the single source of truth for a licence: held by people, used by projects running now, reserved by approved projects that start later */
function seatInventory(l) {
  const live = D.projects.filter((p) => isLive(p) && inScope(l, p)),
    run = live.filter((p) => stOf(p) === "active" && needOfOpt(p, l.opt) > 0),
    fut = live.filter((p) => stOf(p) === "approved" && needOfOpt(p, l.opt) > 0).sort((a, b) => startKey(a).localeCompare(startKey(b))),
    held = (l.holders || []).length + (l.other || 0),
    inproj = run.reduce((s, p) => s + needOfOpt(p, l.opt), 0),
    reserved = fut.reduce((s, p) => s + needOfOpt(p, l.opt), 0),
    contracted = l.seats,
    used = held + inproj,
    missing = Math.max(0, used - contracted);
  return { contracted, used, held, inproj, reserved, free: Math.max(0, contracted - used), missing, later: Math.max(0, used + reserved - contracted) - missing, ps: run, fut };
}
/* free seats of a tool that a given project can count on for its new seats (pr = the project, approved or a proposal) */
function freeSeatsFor(oid, pr) {
  let f = 0;
  for (const l of D.licenses) {
    if (l.opt !== oid || !inScope(l, pr)) continue;
    let used = (l.holders || []).length + (l.other || 0);
    for (const p of D.projects) {
      if (p.id === pr.id || !isLive(p) || !inScope(l, p) || stOf(p) === "done" || !overlaps(p, pr)) continue;
      if (isLive(pr) && !servedBefore(p, pr)) continue;
      used += needOfOpt(p, oid);
    }
    f += Math.max(0, l.seats - used);
  }
  return f;
}
const FIGT = { full: ["Full", 16, "diseño"], dev: ["Dev", 12, "desarrollo"], collab: ["Collab", 3, "producto y resto"] },
  figType = (r) =>
    ["pdesign", "creative"].includes(F(r.id).cat) ? "full" : ["eng", "data", "qa"].includes(F(r.id).cat) ? "dev" : "collab",
  isFig = (id) => id === "figma_pro" || id === "figma_org",
  /* monthly price in € of one seat type: both plans are listed in US$ on Figma's Spanish pricing page */
  figSeat = (id, t) => toEUR(id, id === "figma_org" ? { full: 55, dev: 25, collab: 5 }[t] : FIGT[t][1]);
/* dates: everything relative to today */
const DAY = 864e5,
  HOUR = 36e5;
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hashStr = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
/* default renewal: a stable day 3-11 months ahead, derived from the licence and stored */
function defaultRenew(l) {
  const h = hashStr(l.opt + "|" + l.scope),
    n = new Date();
  return isoDay(new Date(n.getFullYear(), n.getMonth() + 3 + (h % 9), 1 + (h % 28)));
}
const RENEW = (l) => l.renew || defaultRenew(l);
const rel = (ts) => {
  const m = Math.round((Date.now() - ts) / 6e4);
  if (!(m > 0)) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  /* usual pattern: relative for the last week, then the date; the year only when it is not this year */
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  const dt = new Date(ts), sameY = dt.getFullYear() === new Date().getFullYear();
  return dt.toLocaleDateString(LOC(), sameY ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" }).replace(/\.$/, "").replace(/ de /g, " ");
};
const cap1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const CAP = { claude_std: [150, "Claude Enterprise"], claude_prem: [150, "Claude Enterprise"], jira: [100000, "Jira Enterprise"] };
/* where each vendor's seats are managed (name, address). TestRail and custom programs carry their own address on the contract */
const VEND = {
  maze: ["Maze", "https://app.maze.co/"], hotjar: ["Contentsquare", "https://app.contentsquare.com/"], posthog: ["PostHog", "https://app.posthog.com/"], mixpanel: ["Mixpanel", "https://mixpanel.com/"], amplitude: ["Amplitude", "https://app.amplitude.com/"], fullstory: ["FullStory", "https://app.fullstory.com/"],
  canva: ["Canva", "https://www.canva.com/"], ss10: ["Shutterstock", "https://www.shutterstock.com/account"], ss50: ["Shutterstock", "https://www.shutterstock.com/account"], envato: ["Envato", "https://elements.envato.com/"], mj: ["Midjourney", "https://www.midjourney.com/account"],
  cursor: ["Cursor", "https://cursor.com/dashboard"], chatgpt: ["ChatGPT", "https://chatgpt.com/admin"], codex: ["ChatGPT", "https://chatgpt.com/admin"], bstack: ["BrowserStack", "https://www.browserstack.com/accounts"],
  mailchimp: ["Mailchimp", "https://admin.mailchimp.com/"], semrush: ["Semrush", "https://www.semrush.com/accounts/"], miro_st: ["Miro", "https://miro.com/app/settings/"], miro_bz: ["Miro", "https://miro.com/app/settings/"],
  slack_pro: ["Slack", "https://app.slack.com/"], slack_bp: ["Slack", "https://app.slack.com/"], notion_plus: ["Notion", "https://www.notion.so/"], notion_bz: ["Notion", "https://www.notion.so/"], testrail: ["TestRail", ""],
};
const ADM = (id) =>
    VEND[id] ? VEND[id][0] : (opt(id) || {}).admin ? (opt(id) || {}).n.split(" ")[0] :
    id.startsWith("figma")
      ? "Figma Admin"
      : id.startsWith("cc") || id.startsWith("as") || id === "firefly"
        ? "Adobe Admin Console"
        : id === "jira"
          ? "Atlassian Admin"
          : id.startsWith("claude")
            ? "la consola de Claude"
            : id === "copilot"
              ? "GitHub"
              : id.startsWith("linear")
                ? "Linear"
                : id === "hubspot"
                  ? "HubSpot"
                  : "el panel del proveedor",
  /* where each vendor's seats are bought or removed: a link, so nobody has to look for it */
  ADMU = (id) =>
    VEND[id] ? VEND[id][1] : (opt(id) || {}).admin ? (opt(id) || {}).admin :
    id.startsWith("figma")
      ? "https://www.figma.com/"
      : id.startsWith("cc") || id.startsWith("as") || id === "firefly"
        ? "https://adminconsole.adobe.com/"
        : id === "jira"
          ? "https://admin.atlassian.com/"
          : id.startsWith("claude")
            ? "https://claude.ai/"
            : id === "copilot"
              ? "https://github.com/settings/organizations"
              : id.startsWith("linear")
                ? "https://linear.app/"
                : id === "hubspot"
                  ? "https://app.hubspot.com/"
                  : "",
  /* a contract can carry its own panel address (TestRail and others live on the company's own domain) */
  ADML = (id, l) => {
    const u = (l && l.admin) || ADMU(id);
    return u
      ? `<a class="xl" href="${esc(u)}" target="_blank" rel="noopener">${ADM(id)}${I("external-link-alt")}<span class="sr"> (se abre en una pestaña nueva)</span></a>`
      : ADM(id);
  },
  /* the integration that reads a tool's seats, holders and renewal; "" when the vendor has none */
  INTGOF = (id) =>
    !id
      ? ""
      : isFig(id)
        ? "Figma"
        : id === "jira"
          ? "Jira"
          : id.startsWith("cc") || id.startsWith("as") || id === "firefly"
            ? "Adobe Admin Console"
            : id.startsWith("claude")
              ? "Claude Team"
              : id === "chatgpt" || id === "codex"
                ? "ChatGPT Business"
                : id === "copilot"
                  ? "GitHub"
                  : id === "hubspot"
                    ? "HubSpot"
                    : "",
  SYNC = (id) => isFig(id) || id === "jira" || (!!INTGOF(id) && !!(D.intg || {})[INTGOF(id)]);
/* Premium (managed service) fees. Off: HUMAIN has one plan; kept in case a managed service is offered later. */
const MANAGED = false;
function pick(cat) {
  const has = TC[cat].opts.find((o) => D.licenses.some((l) => l.opt === o.id));
  if (has) return has.id;
  const d = DEF[cat];
  if (d) return d;
  return TC[cat].optional ? null : TC[cat].opts[0].id;
}
function mkRole(id, n, hours) {
  let extra = {};
  if (MIG[id]) {
    extra = MIG[id][1] || {};
    id = MIG[id][0];
  }
  const f = F(id),
    ai = f.cat in AIDESC ? (n ? n : hours ? 1 : 0) : 0;
  const tools = {};
  catsFor(f.tp).forEach((k) => (tools[k] = pick(k)));
  if (tools.imgai === "firefly" && tools.creative !== "cc_pro") tools.imgai = null;
  return Object.assign(
    {
      id,
      n,
      hours: hours || 0,
      ai,
      tools,
      qty: {},
      grade: f.arch === "ic" || f.arch === "delivery" ? "mid" : f.gr[0] || null,
      ct: "free",
      up: null,
      lead: false,
      reports: f.arch === "manager" ? 4 : f.arch === "head" ? 6 : 0,
      scopes: f.cross ? HOD_SCOPES.slice(0, 2) : f.arch === "head" ? [f.cat] : [],
    },
    extra,
  );
}
/* ===== Hours model =====
   HPM: hours in one person-month. ONE constant for price (hours roles cost hours/HPM of a person) and for capacity.
   150 h = 1.800 h/año / 12: jornada anual máxima del XIX Convenio colectivo estatal de consultoría y TI (BOE-A-2025-7766). */
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
/* ===== Changes to a running project: a full copy of the team, edited, and sent; the approved one keeps running meanwhile ===== */
const propOf = (src) => D.projects.find((x) => x.parent === src.id && x.full && ["draft", "pending", "changes"].includes(x.status));
const baseOf = (pr) => (pr && pr.full ? D.projects.find((x) => x.id === pr.parent) : null);
function proposeOn(src) {
  const c = clone(src);
  c.id = "p" + Date.now();
  c.parent = src.id;
  c.full = true;
  c.status = "draft";
  c.archived = false;
  c.review = null;
  c.reply = "";
  c.justif = "";
  delete c.sentAt;
  return c;
}
/* what changed, person by person: new, removed, and for the ones that stay, new programs and a new dedication */
function diffOf(pr) {
  const b = baseOf(pr);
  if (!b) return null;
  const bm = Object.fromEntries(b.roles.map((r) => [r.uid, r])),
    cm = new Set(pr.roles.map((r) => r.uid)),
    out = { added: [], removed: b.roles.filter((r) => !cm.has(r.uid)), tools: [], ded: [], bm };
  pr.roles.forEach((r) => {
    const o = bm[r.uid];
    if (!o) return out.added.push(r);
    const ot = new Set(Object.values(o.tools || {}));
    Object.values(r.tools || {}).filter((t) => t && !ot.has(t)).forEach((t) => out.tools.push([r, t]));
    if ((o.n || 0) !== (r.n || 0) || (o.hours || 0) !== (r.hours || 0)) out.ded.push([r, o]);
  });
  out.count = out.added.length + out.removed.length + out.tools.length + out.ded.length;
  return out;
}
function amendOf(src) {
  const c = clone(src),
    left = endsIn(src);
  c.id = "p" + Date.now();
  c.name = src.name + " · ampliación";
  c.parent = src.id;
  c.status = "draft";
  c.archived = false;
  c.review = null;
  c.justif = "";
  c.roles = [];
  c.own = [];
  c.qty = {};
  c.shared = {};
  c.work = null;
  delete c.sentAt;
  c.start = monthKey();
  delete c.end;
  if (left !== null) c.months = Math.max(1, left);
  return c;
}
function cost(pr) {
  const M = pr.months || 12,
    N = projNeed(pr),
    { need, ft, ppl, aiPpl } = N,
    own = N.own;
  let people = 0,
    peopleNew = 0,
    capH = 0,
    fee = 0;
  const missing = [];
  pr.roles.forEach((r) => {
    const C = CT[r.ct || "free"];
    fee += MANAGED ? C[2] * (r.n || (r.hours ? 1 : 0)) : 0;
    const f = F(r.id),
      RT = rateOf(r, pr),
      base = (RT.v || 0) * ctF(r),
      fr = r.n ? r.ai / r.n : r.ai,
      up = upOf(r) / 100,
      cf = CF[f.arch] || 1;
    if (RT.v == null && r.ct !== "own") missing.push(dname(r));
    const sc = seatCosts(r, pr);
    people += Math.round(sc.reduce((a, x) => a + x.v, 0)); /* each role is rounded once so totals equal the sum of the lines shown */
    peopleNew += Math.round(sc.reduce((a, x) => a + (x.inv ? x.v : 0), 0));
    capH += (r.n ? (r.n - r.ai) * HPM + r.ai * HPM * (1 + up) : r.hours * (1 + up * fr)) * M * cf;
  });
  const tools = Object.entries(need).map(([id, q]) => {
    const o = opt(id),
      isOwn = own.includes(id),
      sp = isOwn ? { has: 0, hasP: [] } : seatSplit(pr, id),
      pool = isOwn ? 0 : Math.min(q - sp.has, freeSeatsFor(id, pr)),
      free = isOwn ? 0 : sp.has + pool,
      buy = isOwn ? 0 : q - free,
      pp =
        isFig(id) && q
          ? Object.entries(ft).reduce(
              (a, [t, n]) => a + n * FIGT[t][1] * (id === "figma_org" ? { full: 55 / 16, dev: 25 / 12, collab: 5 / 3 }[t] : 1),
              0,
            ) / Object.values(ft).reduce((a, b) => a + b, 0)
          : o.p,
      per = o.once ? Math.ceil(M / 12) / M : 1 /* one-off pack: one per year of project, spread over its months */,
      m = Math.round(toEUR(id, buy * pp) * per),
      saved = Math.round(toEUR(id, (isOwn ? q : free) * pp) * per);
    return { id, n: o.n, q, has: sp.has, hasP: sp.hasP, pool, free, buy, own: isOwn, m, saved, plan: o.unit === "plan" };
  });
  const toolsM = tools.reduce((s, t) => s + t.m, 0),
    saved = tools.reduce((s, t) => s + t.saved, 0),
    api = 0 /* AI usage comes inside the seats up to their limit (Claude Team, ChatGPT Business, Cursor Teams); overage is pay-as-you-go and not estimated */,
    monthly = people + toolsM + saved + api + fee,
    og = !pr.months,
    total = monthly * M,
    inv = peopleNew + toolsM + api + fee,
    invTotal = inv * M,
    paid = monthly - inv;
  const lead = pr.roles.some((r) => r.n >= 1),
    cov = pr.work ? capH / pr.work : null,
    inBudget = !pr.budget || (og ? inv <= pr.budget : invTotal <= pr.budget);
  return {
    missing,
    fee,
    people,
    peopleNew,
    inv,
    invTotal,
    paid,
    M,
    toolsM,
    api,
    monthly,
    total,
    ppl,
    aiPpl,
    tools,
    cov,
    inBudget,
    og,
    saved,
    lead,
    need,
    ft,
    qr: N.qr,
    qs: N.qs,
  };
}
/* ===== Schedule: ONE function for when a project spends money, used by both the project total and the forecast.
   i = months from now (0 = this month). No ramp-up: a project active this month runs at 100%. ===== */
const mIdx = (d) => {
  const x = typeof d === "string" && /^\d{4}-\d{2}$/.test(d) ? new Date(+d.slice(0, 4), +d.slice(5) - 1, 1) : new Date(d),
    n = new Date();
  return (x.getFullYear() - n.getFullYear()) * 12 + x.getMonth() - n.getMonth();
};
function schedShare(p, i) {
  /* a project in progress spends from its start month; a proposal would spend from its planned start (never before this month) */
  const st = p.status === "active" ? (p.start ? mIdx(p.start) : 0) : Math.max(0, p.start ? mIdx(p.start) : 1);
  if (i < st) return 0;
  const k = i - st;
  return p.months ? Math.max(0, Math.min(1, p.months - k)) : 1;
}
/* ===== With-AI vs without-AI comparison. Pure: builds two variants of the same project and prices them with cost(). =====
   Both start from the same team and the same estimated work. Each role keeps its share of the work; the only
   difference is how many people that share needs: without AI at 100 % productivity, with AI at (1 + gain).
   Gain by scenario: "zero" (no gain: AI only adds licences), "est" (evidence per area, AIUP.v), "high" (top of the range).
   Same deadline in both: the saving can only come from the AI gain, never from trimming a role below its share. */
const clone = (x) => JSON.parse(JSON.stringify(x));
const AIOK = (r) => F(r.id).cat in AIDESC;
const MINH = (id) => (id === "product-owner" || id === "project-manager" ? 60 : 40);
const rosterSig = (roles) => JSON.stringify(roles.map(({ people, ...r }) => r));
const CMPSC = [
  ["zero", "Sin mejora"],
  ["est", "Según estudios"],
  ["high", "Optimista"],
];
function cmpVariants(pr, sc = "est") {
  const W = pr.work || buildTeam(pr).work,
    M = pr.months || 12,
    base = pr.roles.length ? clone(pr.roles) : buildTeam(pr).roles,
    mk = (roles, ai) => ({
      ...pr,
      roles,
      work: W,
      qty: {},
      own: pr.own || [],
      shared: { ...pr.shared, ...(ai && !(pr.shared || {}).genai ? { genai: pick("genai") } : {}) },
    });
  /* hours of work per month each role is carrying now (its capacity, scaled so the team carries exactly W) */
  const capOf = (r) => {
    const up = upOf(r) / 100,
      fr = r.n ? r.ai / r.n : r.ai;
    return (r.n ? (r.n - r.ai) * HPM + r.ai * HPM * (1 + up) : r.hours * (1 + up * fr)) * (CF[F(r.id).arch] || 1);
  };
  const tot = base.reduce((a, r) => a + capOf(r), 0) * M,
    sh = tot ? W / tot : 1;
  const size = (r, gain, ai) => {
    const cf = CF[F(r.id).arch] || 1,
      x = (capOf(r) * sh) / (HPM * cf * (1 + gain / 100)),
      o = { ...clone(r), qty: {} };
    if (r.n >= 1 || x >= 0.9) {
      o.n = Math.max(1, Math.round(x));
      o.hours = 0;
    } else {
      o.n = 0;
      o.hours = Math.min(HPM, Math.max(MINH(r.id), Math.round((x * HPM) / 10) * 10));
    }
    o.ai = ai ? (o.n ? o.n : 1) : 0;
    o.up = ai ? (sc === "est" ? r.up : sc === "high" ? (AIUP[F(r.id).cat] || {}).hi || 0 : 0) : null;
    return o;
  };
  const gainOf = (r) => (sc === "zero" ? 0 : sc === "high" ? (AIUP[F(r.id).cat] || {}).hi || 0 : upOf(r));
  /* rounding can leave a variant short: add the cheapest step until it covers 95 % */
  const fit = (roles, ai) => {
    let k = cost(mk(roles, ai));
    for (let g = 0; g < 40 && k.cov != null && k.cov < 0.95; g++) {
      let best = null;
      roles.forEach((r, i) => {
        const c = r.n ? { ...r, n: r.n + 1, ai: r.ai ? r.ai + 1 : 0 } : r.hours < HPM ? { ...r, hours: Math.min(HPM, r.hours + 10) } : null;
        if (!c) return;
        const t = roles.map((x, j) => (j === i ? c : x)),
          kk = cost(mk(t, ai)),
          gain = (kk.cov - k.cov) / Math.max(1, kk.monthly - k.monthly);
        if (kk.cov > k.cov && (!best || gain > best.gain)) best = { t, kk, gain };
      });
      if (!best) break;
      roles = best.t;
      k = best.kk;
    }
    return roles;
  };
  const sinR = fit(base.map((r) => size(r, 0, false)), false),
    conR = fit(base.map((r) => (AIOK(r) ? size(r, gainOf(r), true) : size(r, 0, false))), true);
  const A = mk(sinR, false),
    B = mk(conR, true);
  return { sin: { pr: A, K: cost(A) }, con: { pr: B, K: cost(B) }, W, T: 0.95, sc };
}
/* the project's team is "customised" when it is neither the suggested team nor one of the two variants */
function teamCustomised(pr, V2) {
  if (!pr.roles.length) return false;
  const cur = rosterSig(pr.roles);
  return ![buildTeam(pr).roles, V2.sin.pr.roles, V2.con.pr.roles].some((r) => rosterSig(r) === cur);
}
function applyVariant(pr, which, sc) {
  const v = cmpVariants(pr, sc)[which === "ai" ? "con" : "sin"];
  pr.roles = clone(v.pr.roles);
  syncFill(pr);
  pr.shared = { ...v.pr.shared };
  pr.qty = {};
  pr.months = v.pr.months;
  if (pr.work == null) pr.work = v.W;
  return v;
}
const mFmt = (m) => String(Math.round(m * 10) / 10).replace(".", ",");
const dEur = (d) => (Math.abs(d) < 0.5 ? "Sin cambio" : (d > 0 ? "+" : "") + eur(d));
/* rows for the comparison: [label, sin value, con value, delta chip text, "good" | "bad" | "eq"] */
function cmpRows(pr, V2) {
  const a = V2.sin.K,
    b = V2.con.K,
    chip = (d, txt, lessIsGood = true) => [txt, Math.abs(d) < 0.5 ? "eq" : d < 0 === lessIsGood ? "good" : "bad"],
    rows = [];
  const dp = b.ppl - a.ppl,
    dm = V2.con.pr.months - V2.sin.pr.months,
    dmo = b.monthly - a.monthly,
    dt = b.total - a.total,
    dl = b.toolsM + b.api - (a.toolsM + a.api);
  rows.push([
    "Personas",
    `${a.ppl}`,
    `${b.ppl}`,
    ...chip(dp, dp === 0 ? "" : `${dp > 0 ? "+" : "−"}${Math.abs(dp)} persona${Math.abs(dp) > 1 ? "s" : ""}`),
  ]);
  rows.push([
    "Plazo",
    plazo(V2.sin.pr),
    plazo(V2.con.pr),
    ...chip(dm, dm === 0 ? "" : `${dm > 0 ? "+" : "−"}${mFmt(Math.abs(dm))} meses`),
  ]);
  rows.push(["Coste al mes", eur(a.monthly), eur(b.monthly), ...chip(dmo, dEur(dmo))]);
  rows.push([a.og ? "Coste de 12 meses" : "Coste total", eur(a.total), eur(b.total), ...chip(dt, dEur(dt))]);
  rows.push([
    "Licencias",
    eur(a.toolsM) + "/mes",
    eur(b.toolsM) + "/mes",
    ...chip(b.toolsM - a.toolsM, dEur(b.toolsM - a.toolsM) + (Math.abs(b.toolsM - a.toolsM) < 0.5 ? "" : "/mes")),
  ]);
  rows.push([
    "Uso de IA",
    "—",
    `${b.aiPpl} persona${b.aiPpl !== 1 ? "s" : ""} con IA${b.api ? " · API " + eur(b.api) + "/mes" : ""}`,
    "",
    "eq",
  ]);
  return rows;
}
const teamList = (roles) =>
  `<ul class="cteam">${roles.map((r) => `<li><b>${r.n ? r.n + " ×" : r.hours + " h/mes ·"}</b> ${dname(r)}${r.ai ? ` <em>IA</em>` : ""}</li>`).join("")}</ul>`;
function cmpModalHTML(pr) {
  const sc = pr.cmpSc || "est",
    V2 = cmpVariants(pr, sc),
    rows = cmpRows(pr, V2),
    d = V.draft || {},
    saveTot = V2.sin.K.total - V2.con.K.total,
    dppl = V2.sin.K.ppl - V2.con.K.ppl,
    col = (k, v, ai) => {
      const idx = ai ? 2 : 1;
      return `<section class="ccol ${ai ? "ai" : ""}" aria-labelledby="cc-${k}"><h3 id="cc-${k}">${ai ? "Con IA" : "Sin IA"}</h3><small class="csub">${ai ? "IA donde aplica" : "El mismo trabajo, sin IA"}</small>${rows
        .map((r) => `<div class="cr"><span>${r[0]}</span><b>${r[idx]}</b>${ai && r[3] ? `<em class="dd ${r[4]}">${r[3]}</em>` : ""}</div>`)
        .join(
          "",
        )}<div class="cr cteamr"><span>Equipo</span>${teamList(v.pr.roles)}</div><button class="btn ${ai ? "btn-p" : "btn-s"} cuse" data-cmpuse="${k}">Usar equipo</button></section>`;
    };
  const head =
    saveTot > 0.5
      ? `Con IA ahorras ${eur(saveTot)}${dppl > 0 ? ` y ${dppl} persona${dppl > 1 ? "s" : ""}` : ""}.`
      : saveTot < -0.5
        ? V2.con.K.cov > V2.sin.K.cov * 1.03
          ? `Con IA, el mismo equipo tiene un ${Math.round((V2.con.K.cov / V2.sin.K.cov - 1) * 100)} % más de capacidad por ${eur(V2.con.K.monthly - V2.sin.K.monthly)} más al mes: es demasiado pequeño para necesitar menos personas.`
          : `Con este supuesto, la IA cuesta ${eur(-saveTot)} más de lo que ahorra.`
        : "Con este supuesto, la IA no cambia el coste de este proyecto.";
  return `<div class="scrim" data-close></div><div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Comparar con IA y sin IA</h2><p class="shsub">${esc(pr.name)} · mismo trabajo estimado (${numFmt(V2.W)} horas)</p></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="cassume"><div><b>Mejora con IA</b><small>${sc === "zero" ? "La IA no acelera a nadie: solo suma sus licencias." : sc === "high" ? "El valor más alto de los estudios para cada área. Úsalo como techo, no como previsión." : "Un valor por área a partir de estudios controlados: desarrollo +10 %, contenido +30 %, producto +20 %; el resto, estimación."}</small></div><span class="seg" role="radiogroup" aria-label="Mejora con IA">${CMPSC.map(([k, t]) => `<button role="radio" aria-checked="${sc === k}" data-cmpup="${k}">${t}</button>`).join("")}</span></div>
  <p class="chead ${saveTot > 0.5 ? "good" : ""}" role="status">${head}</p>
  <div class="cmp">${col("noai", V2.sin, false)}${col("ai", V2.con, true)}</div>
  ${d.confirm ? `<div class="alert warn cconf" role="alertdialog" aria-label="Confirmar cambio de equipo">${I("exclamation-triangle")}<span><b>Vas a sustituir el equipo actual de «${esc(pr.name)}».</b> Se perderán los cambios que hayas hecho en puestos, herramientas y asientos. ${pr.status === "active" ? "El proyecto está en marcha: tendrás que guardar los cambios." : ""}</span><span class="cconfb"><button class="btn btn-s" data-cmpno>Cancelar</button><button class="btn btn-p" data-cmpyes>Usar ${d.confirm === "ai" ? "con IA" : "sin IA"}</button></span></div>` : ""}
</div>`;
}

/* ===== First run: an empty company. The SRC example is only loaded when the user asks for it. ===== */
function emptyData() {
  D = {
    org: "Mi empresa",
    ent: "all",
    entities: [{ id: "e1", name: "Mi empresa", country: "España", cur: "EUR", vat: "21% IVA" }],
    licenses: [],
    users: [],
    me: null,
    as: "manager",
    managers: [],
    people: [],
    projects: [],
    custom: [],
    croles: [],
    notes: [],
    intg: {},
    requests: [],
    rates: {},
    setup: false,
    demo: false,
  };
  save();
}
/* ===== Seed data (the SRC demo): three teams, two projects in progress, one proposal waiting for Dirección, one draft ===== */
const SEED_PEOPLE = [
  ["Lucy Morgan", "product-designer", "senior", "Emma Walker"],
  ["Daniel Price", "frontend-developer", "mid", "Emma Walker"],
  ["Sophie Hall", "product-owner", "senior", "Emma Walker"],
  ["Grace Collins", "ux-designer", "mid", "Emma Walker"],
  ["Thomas Wright", "manual-qa-engineer", "mid", "Emma Walker"],
  ["Charlotte Evans", "graphic-designer", "mid", "Emma Walker"],
  ["Ellen Parker", "content-marketing-specialist", "senior", "Nora Mitchell"],
  ["Paul Fisher", "graphic-designer", "mid", "Nora Mitchell"],
  ["Anna Cooper", "social-media-specialist", "junior", "Nora Mitchell"],
  ["Mark Bailey", "mobile-developer", "senior", "Lucas Reed"],
  ["Jack Murphy", "mobile-developer", "mid", "Lucas Reed"],
  ["Victoria Shaw", "backend-developer", "senior", "Lucas Reed"],
  ["Ian Ross", "tech-lead", "senior", "Lucas Reed"],
  ["Ryan Ward", "qa-automation-engineer", "mid", "Lucas Reed"],
  ["David Lewis", "backend-developer", "mid", "Lucas Reed"],
  ["Matthew Hill", "frontend-developer", "mid", "Lucas Reed"],
];
/* real monthly cost of a person: the reference of their role and level, a little above or below, rounded to 10 € */
function personCost(x) {
  const ent = ENT(x.ent),
    ref = illus({ id: x.fid, grade: x.lvl }, (ent && ent.country) || "España");
  return ref ? Math.round((ref * (0.94 + (hashStr(x.name) % 13) / 100)) / 10) * 10 : null;
}
/* seats of a project already approved: named people where given, the rest still being hired */
function seedFill(pr, mine, other) {
  const take = (m, id) => (m[id] && m[id].length ? m[id].shift() : null);
  pr.roles.forEach((r) => {
    r.fill = [...Array(seatsOf(r))].map(() => {
      const a = take(mine, r.id);
      if (a) return { src: "mine", pid: a };
      const o = take(other, r.id);
      return o ? { src: "other", pid: o } : { src: "new", hiring: true };
    });
  });
}
function seedData() {
  const now = new Date(),
    mk = (dm) => monthKey(new Date(now.getFullYear(), now.getMonth() + dm, 1));
  D = {
    setup: true,
    demo: true,
    rates: {},
    as: "manager",
    me: { name: "Emma Walker", role: "Responsable", team: "Producto digital" },
    managers: [
      { name: "Emma Walker", team: "Producto digital", teams: ["Producto digital", "Diseño"], ent: "es" },
      { name: "Nora Mitchell", team: "Marketing", ent: "es" },
      { name: "Lucas Reed", team: "Desarrollo", ent: "es" },
    ],
    org: "SRC",
    logo: "brand/src-isotipo.svg",
    ent: "all",
    seedv: 4,
    entities: [{ id: "es", name: "SRC España", country: "España", cur: "EUR", vat: "21% IVA" }],
    licenses: [
      { opt: "figma_pro", scope: "group", seats: 14, other: 9 },
      { opt: "cc_pro", scope: "group", seats: 6, other: 6 },
      { opt: "jira", scope: "es", seats: 25, other: 21 },
      { opt: "copilot", scope: "es", seats: 10, other: 5 },
    ],
    users: [
      ["Emma Walker", "Responsable de proyecto", "SRC"],
      ["Nora Mitchell", "Responsable de proyecto", "SRC"],
      ["Lucas Reed", "Responsable de proyecto", "SRC"],
    ],
    people: [],
    projects: [],
    custom: [],
    croles: [],
    notes: [],
    intg: {},
    requests: [],
  };
  D.people = SEED_PEOPLE.map(([name, fid, lvl, team], i) => {
    const x = { id: "u" + (i + 1), name, fid, lvl, team, ent: MGR(team).ent };
    x.cost = personCost(x);
    return x;
  });
  const pid = (n) => D.people.find((x) => x.name === n).id,
    base = (o) => ({ budget: 0, own: [], startFrom: "team", aiPref: "rec", goal: "", justif: "", review: null, ...o });
  /* in progress: Emma's booking app (3 people of her team, a backend developer lent by Desarrollo, a QA being hired) */
  const a = base({
    id: "p1",
    name: "App de reservas",
    owner: "Emma Walker",
    goal: "Que los clientes reserven y paguen desde el móvil sin llamar a la tienda.",
    type: "digital",
    size: "m",
    months: 6,
    ent: "es",
    status: "active",
    start: mk(-2),
    justif: "Las reservas por teléfono nos cuestan dos personas de atención al cliente y perdemos las de fuera de horario.",
    review: { by: "Dirección", ts: Date.now() - 64 * DAY, decision: "approve", comment: "" },
  });
  suggest(a);
  a.roles = a.roles.filter((r) => r.id !== "graphic-designer");
  seedFill(a, { "frontend-developer": [pid("Daniel Price")], "product-designer": [pid("Lucy Morgan")], "product-owner": [pid("Sophie Hall")] }, { "backend-developer": [pid("David Lewis")] });
  /* in progress: Lucas's mobile app, with his own team and a product designer still being hired */
  const c = base({
    id: "p3",
    name: "App móvil",
    owner: "Lucas Reed",
    goal: "La app de fidelización para iOS y Android.",
    type: "mobile",
    size: "m",
    months: 6,
    ent: "es",
    status: "active",
    start: mk(-3),
    justif: "Sustituye a la app actual, que ya no pasa la revisión de las tiendas.",
    review: { by: "Dirección", ts: Date.now() - 95 * DAY, decision: "approve", comment: "" },
  });
  suggest(c);
  c.roles = c.roles.filter((r) => r.id !== "product-owner");
  seedFill(
    c,
    {
      "mobile-developer": [pid("Mark Bailey"), pid("Jack Murphy")],
      "backend-developer": [pid("Victoria Shaw")],
      "tech-lead": [pid("Ian Ross")],
      "qa-automation-engineer": [pid("Ryan Ward")],
    },
    {},
  );
  /* in progress, ending this month: Emma's corporate website, with a developer lent by Desarrollo */
  const w = base({
    id: "p5",
    name: "Web corporativa",
    owner: "Emma Walker",
    goal: "Renovar la web para que los clientes encuentren tiendas y horarios sin llamar.",
    type: "web",
    size: "s",
    months: 4,
    ent: "es",
    status: "active",
    start: mk(-3),
    justif: "La web actual no se adapta al móvil y es por donde entra el 70 % de las visitas.",
    review: { by: "Dirección", ts: Date.now() - 100 * DAY, decision: "approve", comment: "" },
  });
  suggest(w);
  w.roles = w.roles.filter((r) => r.id !== "product-owner");
  seedFill(w, { "product-designer": [pid("Grace Collins")], "manual-qa-engineer": [pid("Thomas Wright")] }, { "fullstack-developer": [pid("Matthew Hill")] });
  /* in progress, ending this month: Nora's brand refresh with her whole team */
  const e = base({
    id: "p6",
    name: "Nueva imagen de marca",
    owner: "Nora Mitchell",
    goal: "Actualizar la identidad y las plantillas antes del lanzamiento de la app.",
    type: "mkt",
    size: "s",
    months: 5,
    ent: "es",
    status: "active",
    start: mk(-4),
    justif: "La campaña de lanzamiento necesita la marca nueva lista.",
    review: { by: "Dirección", ts: Date.now() - 128 * DAY, decision: "approve", comment: "" },
  });
  suggest(e);
  e.roles = e.roles.filter((r) => r.id !== "project-manager");
  e.roles.push({ ...e.roles.find((r) => r.id === "content-marketing-specialist"), id: "social-media-specialist", grade: "junior" });
  seedFill(e, { "content-marketing-specialist": [pid("Ellen Parker")], "graphic-designer": [pid("Paul Fisher")], "social-media-specialist": [pid("Anna Cooper")] }, {});
  /* approved, starts in two months: Lucas's in-store payments, with a developer who frees up first and two new hires */
  const t = base({
    id: "p7",
    name: "Pagos en tienda",
    owner: "Lucas Reed",
    goal: "Cobrar con el móvil en caja sin datáfono.",
    type: "web",
    size: "s",
    months: 4,
    ent: "es",
    status: "active",
    start: mk(2),
    justif: "El datáfono nos cobra una comisión por operación y falla en hora punta.",
    review: { by: "Dirección", ts: Date.now() - 6 * DAY, decision: "approve", comment: "" },
  });
  suggest(t);
  t.roles = t.roles.filter((r) => r.id !== "product-owner");
  seedFill(t, { "fullstack-developer": [pid("Matthew Hill")] }, {});
  D.projects = [a, c, w, e, t];
  /* waiting for Dirección: Nora's launch campaign (her people, a designer of another team, new hires) */
  const b = base({
    id: "p2",
    name: "Campaña de lanzamiento",
    owner: "Nora Mitchell",
    goal: "Dar a conocer la nueva app en España durante su primer trimestre.",
    type: "mkt",
    size: "m",
    months: 6,
    budget: 25000,
    ent: "es",
    status: "pending",
    start: mk(1),
    sentAt: Date.now() - 2 * DAY,
    justif: "La app sale el mes que viene y no tenemos a nadie para la campaña: Elena y Pablo la llevan, pero necesitamos más diseño y alguien que coordine.",
  });
  suggest(b);
  b.roles.forEach((r) => {
    if (r.id === "graphic-designer") r.n = r.ai = 2; /* the launch needs more design than the template */
  });
  applyAiPref(b);
  D.projects.push(b);
  syncFill(b, true);
  /* draft not sent yet: Emma's customer portal */
  const d = base({
    id: "p4",
    name: "Portal de clientes",
    owner: "Emma Walker",
    goal: "Un área privada donde los clientes vean sus pedidos y facturas.",
    type: "web",
    size: "m",
    months: 6,
    ent: "es",
    status: "draft",
    start: mk(1),
  });
  suggest(d);
  D.projects.push(d);
  syncFill(d, true);
  D.projects = [d, b, t, a, w, c, e];
  soloSeed();
  /* who holds which seat: everyone keeps the tools of their role (those of the projects they are on, or their role's usual ones), Jira, and Claude when their role works with AI */
  const paidSeat = (oid) => oid && opt(oid) && opt(oid).p > 0 && opt(oid).unit !== "plan" && !opt(oid).once;
  const licFor = (oid, ent) => {
    let l = D.licenses.find((y) => y.opt === oid && (y.scope === "group" || y.scope === ent));
    if (!l) D.licenses.push((l = { opt: oid, scope: ent, seats: 0, other: 0 }));
    l.holders = l.holders || [];
    return l;
  };
  D.people.forEach((x) => {
    const tools = new Set(),
      on = [a, c, w, e].flatMap((p) => p.roles.filter((r) => (r.fill || []).some((f) => f.pid === x.id)).map((r) => [p, r]));
    if (on.length)
      on.forEach(([p, r]) => {
        Object.values(r.tools).forEach((id) => tools.add(id));
        tools.add(p.shared.pm);
        if (r.ai) tools.add(p.shared.genai);
      });
    else {
      const r = mkRole(x.fid, 1);
      Object.values(r.tools).forEach((id) => tools.add(id));
      tools.add("jira");
      if (r.ai) tools.add("claude_std");
    }
    tools.forEach((oid) => paidSeat(oid) && !licFor(oid, x.ent).holders.includes(x.id) && licFor(oid, x.ent).holders.push(x.id));
  });
  /* tools the projects in progress and approved need for their new people, even if nobody holds them yet */
  [a, c, w, e, t].forEach((pr) => Object.keys(projNeed(pr).need).forEach((oid) => paidSeat(oid) && needOfOpt(pr, oid) > 0 && licFor(oid, pr.ent)));
  /* contracts sized like real ones: a few spare seats here and there; Jira España one short (a task for Dirección), Copilot México exact, so «Pagos en tienda» needs one before it starts */
  const spare = { "figma_pro|group": 1, "cc_pro|group": 0, "jira|es": -1, "copilot|mx": 0, "claude_std|es": 2, "jira|mx": 0 };
  D.licenses.forEach((l) => {
    const k = l.opt + "|" + l.scope;
    l.holders = l.holders || [];
    l.seats = Math.max(1, seatInventory(l).used + (k in spare ? spare[k] : hashStr(k) % 3));
  });
  /* in April, Adobe's renewal went down by two seats nobody used */
  D.trims = [{ opt: "cc_pro", scope: "group", n: 2, ts: new Date(now.getFullYear(), 3, 14).getTime() }];
  /* HubSpot renews in two months with a seat nobody uses: a saving for Dirección to decide */
  const hub = D.licenses.find((l) => l.opt === "hubspot");
  if (hub) hub.renew = isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 58));
  const jira = D.licenses.find((l) => l.opt === "jira" && l.scope === "es"),
    jiraGap = jira ? seatInventory(jira).missing : 0;
  D.licenses.forEach((l) => {
    if (SYNC(l.opt)) l.synced = Date.now() - 2 * HOUR;
  });
  D.notes = [
    { ic: "file-alt", k: "rev", to: "board", t: "Emma Walker ha enviado «Campaña de lanzamiento»", s: "Pendiente de tu aprobación", p: "p2", ts: b.sentAt, r: 0 },
    ...(jiraGap
      ? [{ ic: "key-skeleton", k: "lic", to: "board", t: "Faltan asientos de Jira Standard", s: `Los proyectos en curso usan ${jiraGap} más de los contratados`, p: "p1", ts: Date.now() - 2 * HOUR, r: 0 }]
      : []),
    /* recent and unread: a reminder about the draft; old and read: an approval */
    { ic: "file-alt", k: "team", to: "Emma Walker", t: "«Portal de clientes» sigue en borrador", s: "Envíalo a Dirección cuando el equipo esté listo", p: "p4", ts: Date.now() - 3 * HOUR, r: 0 },
    /* old and read: an approval */
    { ic: "check-circle", k: "ok", to: "Emma Walker", t: "Dirección ha aprobado «App de reservas»", s: "", p: "p1", ts: Date.now() - 64 * DAY, r: 1 },
  ];
  save();
  return D;
}
/* ===== Load + repair saved data. Anything unrecoverable falls back to the seed. ===== */
const num = (v, d = 0, min = 0, max = 1e9) => {
  v = Number(v);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d;
};
const arr = (v) => (Array.isArray(v) ? v : []);
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const str = (v, d) => (typeof v === "string" && v.trim() ? v : d);
const agoMs = (a) => {
  a = String(a || "");
  let m;
  if (/ayer/i.test(a)) return 26 * HOUR;
  if ((m = a.match(/(\d+)\s*min/i))) return m[1] * 6e4;
  if ((m = a.match(/(\d+)\s*h/i))) return m[1] * HOUR;
  if ((m = a.match(/(\d+)\s*d/i))) return m[1] * DAY;
  return 0;
};
const registered = { opts: [], roles: [] };
function registerCustom() {
  D.custom.forEach((c) => {
    TC[c.cat].opts.push(c);
    ALLOPTS.push(c);
    registered.opts.push(c);
  });
  D.croles.forEach((c) => {
    regCustom(c);
    registered.roles.push(c.id);
  });
}
function unregisterCustom() {
  registered.opts.forEach((c) => {
    TC[c.cat].opts = TC[c.cat].opts.filter((o) => o !== c);
    const i = ALLOPTS.indexOf(c);
    if (i >= 0) ALLOPTS.splice(i, 1);
  });
  registered.roles.forEach((id) => delete FAM[id]);
  registered.opts = [];
  registered.roles = [];
}
const seatsOf = (r) => r.n || 1; /* a role has one seat per person; a part-time (hours) role has one */
function repairRole(r, p) {
  if (MIG[r.id]) {
    const [nid, ex] = MIG[r.id];
    r.id = nid;
    Object.assign(r, ex || {});
  }
  if (!FAM[r.id]) return null; /* unknown role: drop it */
  const f = F(r.id);
  r.grade = r.grade || { jr: "junior", mid: "mid", sr: "senior" }[r.lv] || (f.arch === "ic" ? "mid" : f.gr[0] || null);
  if (!CT[r.ct]) r.ct = "free";
  r.n = Math.round(num(r.n, 0, 0, 500));
  r.hours = num(r.hours, 0, 0, HPM);
  if (!r.n && !r.hours) r.hours = 40;
  r.ai = Math.round(num(r.ai, 0, 0, Math.max(1, r.n)));
  r.up = r.up == null ? null : num(r.up, 0, -50, 100);
  r.reports = r.reports == null ? (f.arch === "manager" ? 4 : f.arch === "head" ? 6 : 0) : num(r.reports);
  r.scopes = Array.isArray(r.scopes) ? r.scopes : f.cross ? HOD_SCOPES.slice(0, 2) : f.arch === "head" ? [f.cat] : [];
  r.qty = isObj(r.qty) ? r.qty : {};
  /* seats: one fill entry per seat ({src: mine|other|new|shared, pid?}). Legacy data: the names in "people" are kept aside
     for repairData, which turns them into people of the register; the old boolean "hired" becomes seats being hired */
  const live = p && p.status === "active";
  if (!Array.isArray(r.fill)) {
    const names = arr(r.people)
      .filter((x) => isObj(x) && str(x.name) && !x.noname)
      .map((x) => String(x.name).slice(0, 80));
    r.fill = r.hired === true && live ? [...Array(seatsOf(r))].map(() => ({ src: "new", hiring: true })) : [];
    if (names.length && live) r._legacy = names.slice(0, seatsOf(r));
  }
  delete r.people;
  delete r.hired;
  r.fill = r.fill
    .filter(isObj)
    .slice(0, seatsOf(r))
    .map((f) => {
      const o = { src: ["mine", "other", "new", "shared"].includes(f.src) ? f.src : "new" };
      if (typeof f.pid === "string" && f.pid) o.pid = f.pid;
      if (f.part) o.part = true;
      if (f.hiring && o.src === "new") o.hiring = true;
      return o;
    });
  if (r.hrate != null) {
    const hv = num(r.hrate);
    if (hv) r.hrate = hv;
    else delete r.hrate;
  }
  if (r.rate != null) {
    const v = num(r.rate);
    if (v) r.rate = v;
    else delete r.rate;
  }
  const tools = {};
  if (isObj(r.tools)) for (const k in r.tools) if (TC[k] || opt(k)) tools[k] = r.tools[k] && opt(r.tools[k]) ? r.tools[k] : null;
  r.tools = tools;
  delete r.lv;
  return r;
}
function repairData() {
  const ents = [],
    seen = new Set();
  arr(D.entities).forEach((e) => {
    if (!isObj(e) || typeof e.id !== "string" || !e.id || e.id === "all" || e.id === "group" || seen.has(e.id)) return;
    seen.add(e.id);
    ents.push({ ...e, id: e.id, name: str(e.name, "Empresa"), country: str(e.country, "—"), cur: str(e.cur, "EUR"), vat: str(e.vat, "—") });
  });
  if (!ents.length) throw new Error("sin empresas");
  D.entities = ents;
  D.org = str(D.org, "Mi empresa");
  if (typeof D.logo !== "string") delete D.logo;
  D.ent = D.ent === "all" || seen.has(D.ent) ? D.ent : "all";
  D.users = arr(D.users).filter((u) => Array.isArray(u) && u.length >= 3);
  /* Dirección is a user too: the demo's James Carter appears in «Usuarios y permisos» */
  if (D.me && !D.users.some((u) => u[0] === "James Carter")) D.users.unshift(["James Carter", "Dirección", "SRC"]);
  D._me0 = D.me;
  D.me =
    isObj(D.me) && str(D.me.name)
      ? { name: String(D.me.name), role: str(D.me.role, "Administración") }
      : D.users[0]
        ? { name: String(D.users[0][0]), role: String(D.users[0][1]) }
        : null;
  D.setup = D.setup !== false;
  D.as = D.as === "board" ? "board" : "manager";
  D.managers = arr(D.managers)
    .filter((m) => isObj(m) && str(m.name))
    .map((m) => {
      const team = str(m.team, "Equipo"),
        teams = [...new Set([team, ...arr(m.teams).filter((t) => str(t)).map((t) => String(t).slice(0, 60))])];
      /* demo data saved before teams existed: Emma Walker (SRC) leads «Producto digital» and «Diseño» */
      if (teams.length === 1 && m.name === "Emma Walker" && D.org === "SRC" && team === "Producto digital") teams.push("Diseño");
      return { name: String(m.name).slice(0, 80), team, ...(teams.length > 1 ? { teams } : {}), ent: seen.has(m.ent) ? m.ent : ents[0].id };
    });
  if (D.me) {
    const m = D.managers.find((x) => x.name === D.me.name),
      t = isObj(D._me0) ? D._me0.team : null;
    D.me.team = str(t, m ? m.team : "Mi equipo");
    if (!m) D.managers.unshift({ name: D.me.name, team: D.me.team, ent: ents[0].id });
  }
  delete D._me0;
  const pids = new Set();
  D.people = arr(D.people)
    .filter((x) => isObj(x) && str(x.name) && FAM[x.fid])
    .map((x, i) => {
      let id = str(x.id, "u" + Date.now() + i);
      while (pids.has(id)) id += "x";
      pids.add(id);
      const o = { id, name: String(x.name).slice(0, 80), fid: x.fid, lvl: LVLS_ALL.includes(x.lvl) ? x.lvl : "mid", team: str(x.team, meName()), ...(str(x.unit) ? { unit: String(x.unit).slice(0, 60) } : {}), ent: seen.has(x.ent) ? x.ent : ents[0].id },
        c = num(x.cost);
      if (c > 0) o.cost = Math.round(c);
      return o;
    });
  D.rates = isObj(D.rates)
    ? Object.fromEntries(
        Object.entries(D.rates)
          .filter(([k, v]) => FAM[k.split("|")[0]] && Number(v) > 0)
          .map(([k, v]) => [k, Math.round(Number(v))]),
      )
    : {};
  D.intg = isObj(D.intg) ? D.intg : {};
  D.requests = arr(D.requests);
  D.licenses = arr(D.licenses)
    .filter((l) => isObj(l) && opt(l.opt))
    .map((l) => {
      l.scope = l.scope === "group" || seen.has(l.scope) ? l.scope : "group";
      l.seats = Math.round(num(l.seats));
      l.other = Math.round(num(l.other));
      l.holders = arr(l.holders).filter((pid) => typeof pid === "string");
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      if (typeof l.renew === "string" && !isNaN(new Date(l.renew))) {
        /* a renewal date in the past rolls forward whole years */
        const r = new Date(l.renew + "T12:00");
        while (r < t) r.setFullYear(r.getFullYear() + 1);
        l.renew = isoDay(r);
      } else l.renew = defaultRenew(l);
      delete l.reqUp;
      return l;
    });
  D.licenses.forEach((l) => {
    if (SYNC(l.opt) && !(l.synced > 0)) l.synced = Date.now() - 2 * HOUR;
  });
  const ids = new Set();
  D.projects = arr(D.projects)
    .filter(isObj)
    .map((p, i) => {
      let id = str(p.id, "p" + Date.now() + i);
      while (ids.has(id)) id += "x";
      ids.add(id);
      p.id = id;
      p.name = str(p.name, "Proyecto sin nombre").slice(0, 120);
      p.type = TYPES[p.type] ? p.type : "other";
      p.size = SIZE.some((x) => x[0] === p.size) ? p.size : "m";
      p.months = num(p.months, 0, 0, 120);
      p.budget = num(p.budget);
      delete p.price; /* no clients, sale prices or margins any more */
      delete p.client;
      p.owner = str(p.owner, meName());
      p.goal = typeof p.goal === "string" ? p.goal.slice(0, 300) : "";
      p.justif = typeof p.justif === "string" ? p.justif.slice(0, 2000) : "";
      p.startFrom = p.startFrom === "new" ? "new" : "team";
      p.aiPref = ["rec", "own", "none"].includes(p.aiPref) ? p.aiPref : "rec";
      p.review = isObj(p.review)
        ? {
            by: str(p.review.by, "Dirección"),
            ts: num(p.review.ts, 0, 0, 1e15),
            decision: ["approve", "changes", "reject"].includes(p.review.decision) ? p.review.decision : "",
            comment: typeof p.review.comment === "string" ? p.review.comment.slice(0, 1000) : "",
          }
        : null;
      if (p.sentAt != null) p.sentAt = num(p.sentAt, 0, 0, 1e15);
      p.archived = p.archived === true;
      p.cmpSc = ["zero", "est", "high"].includes(p.cmpSc) ? p.cmpSc : "est";
      delete p.cmpUp;
      p.ent = seen.has(p.ent) ? p.ent : ents[0].id;
      p.status = ST[p.status] ? p.status : "draft"; /* old data only had "active" and "draft" */
      p.own = arr(p.own).filter((x) => typeof x === "string");
      p.qty = isObj(p.qty) ? p.qty : {};
      p.shared = isObj(p.shared) ? p.shared : {};
      for (const k of ["pm", "chat", "genai"]) if (!(k in p.shared) || (p.shared[k] && !opt(p.shared[k]))) p.shared[k] = pick(k);
      p.shared.genaiX = arr(p.shared.genaiX).filter((x) => opt(x) && x !== p.shared.genai);
      p.roles = arr(p.roles)
        .filter(isObj)
        .map((r) => repairRole(r, p))
        .filter(Boolean);
      personify(p);
      /* start month: "YYYY-MM" (old data stored a full date, and only for projects in progress) */
      p.start =
        typeof p.start === "string" && /^\d{4}-\d{2}$/.test(p.start)
          ? p.start
          : typeof p.start === "string" && !isNaN(new Date(p.start))
            ? monthKey(new Date(p.start))
            : monthKey();
      if (p.work != null) p.work = num(p.work);
      delete p.bought; /* seats are now derived from the inventory, not stored per project */
      return p;
    });
  /* seats: old names become people of the owner's team; a seat pointing at a person who no longer exists goes back to a new hire */
  D.projects.forEach((p) =>
    p.roles.forEach((r) => {
      (r._legacy || []).forEach((name, i) => {
        let x = D.people.find((y) => y.name === name && y.team === p.owner);
        if (!x) {
          let id = "u" + hashStr(p.id + "|" + r.id + "|" + name + "|" + i);
          while (pids.has(id)) id += "x";
          pids.add(id);
          x = { id, name, fid: r.id, lvl: LVLS.includes(r.grade) ? r.grade : LV[r.grade] > 2 ? "senior" : "mid", team: p.owner, ent: p.ent };
          D.people.push(x);
        }
        r.fill[i] = { src: "mine", pid: x.id };
      });
      delete r._legacy;
      r.fill = r.fill.map((f) =>
        /* the Responsable only manages their own people: an «other team» seat in a project still being edited becomes a hire (Dirección can cover it when reviewing) */
        f.src === "other" && (p.status === "draft" || p.status === "changes")
          ? { src: "new" }
          : f.pid && !PERSON(f.pid) ? { src: f.src === "other" ? "other" : "new" } : (f.src === "mine" || f.src === "shared") && !f.pid ? { src: "new" } : f,
      );
      while (r.fill.length < seatsOf(r)) r.fill.push(p.status === "active" ? { src: "new", hiring: true } : { src: "new" });
    }),
  );
  D.people.forEach((x) => {
    const ts = teamsOf(x.team);
    if (ts.length > 1 && !ts.includes(x.unit)) x.unit = ts.includes("Diseño") && ["pdesign", "creative"].includes(F(x.fid).cat) ? "Diseño" : ts[0];
  }
  );
  /* notes: relative times come from stored timestamps; old seed notes get their new wording */
  D.trims = arr(D.trims).filter((x) => isObj(x) && opt(x.opt) && num(x.n) > 0);
  D.notes = arr(D.notes)
    .filter(isObj)
    .map((n) => {
      if (/asignado en|^Buscando /.test(n.t || "")) {
        const adobe = /asignado/.test(n.t);
        n = {
          ic: adobe ? "key-skeleton" : "users-alt",
          t: adobe ? "Faltan asientos de Adobe Creative Cloud" : "«App de reservas» está en marcha",
          s: adobe ? "Los proyectos en marcha usan 1 más de los contratados" : "Siguiente paso: cubrir los puestos y revisar las licencias",
          p: "p1",
          r: n.r,
          ts: n.ts,
          ago: n.ago,
        };
      }
      if (/^Contratad /.test(n.s || "")) n.s = "Siguiente paso: cubrir los puestos y revisar las licencias";
      n.t = str(n.t, "");
      n.s = str(n.s, "");
      if (!["lic", "team", "rev"].includes(n.k)) n.k = /^Faltan asientos/.test(n.t) ? "lic" : /está en marcha$/.test(n.t) ? "team" : "";
      if (typeof n.to !== "string" || !n.to) delete n.to;
      n.ic = str(n.ic, "bell");
      n.r = n.r ? 1 : 0;
      if (!(n.ts > 0)) n.ts = Date.now() - agoMs(n.ago);
      delete n.ago;
      return n;
    });
  /* data saved before the example flag existed: the SRC seed is recognised by its two projects */
  D.demo =
    D.demo === true ||
    (D.demo === undefined && D.org === "SRC" && D.projects.some((p) => p.id === "p1") && D.projects.some((p) => p.id === "p2"));
  D.tax = 1;
}
function loadData() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORE));
  } catch (e) {}
  /* first visit with the new key: the user's own data under the old key is migrated; the old demo is replaced by the new one */
  if (!isObj(raw))
    try {
      const old = JSON.parse(localStorage.getItem(LEGACY));
      if (isObj(old) && old.demo !== true && !(old.demo === undefined && old.org === "SRC")) raw = old;
    } catch (e) {}
  /* the example company changed (Spain and the UK): saved copies of the old example are replaced by the new one */
  if (isObj(raw) && raw.org === "SRC" && raw.seedv !== 4) raw = null;
  if (isObj(raw)) {
    D = raw;
    try {
      /* custom catalogue first: roles and licences may refer to it */
      D.custom = arr(D.custom).filter((c) => isObj(c) && TC[c.cat] && str(c.id) && str(c.n) && Number.isFinite(Number(c.p)));
      D.croles = arr(D.croles).filter(
        (c) => isObj(c) && str(c.id) && str(c.t) && CAT[c.cat] && ["ic", "lead", "manager", "head"].includes(c.arch),
      );
      registerCustom();
      repairData();
      save();
      return;
    } catch (e) {
      console.warn("Datos guardados no válidos, se usan los iniciales", e);
      unregisterCustom();
    }
  }
  seedData();
}
const fdate = (iso) => new Date(iso + "T12:00").toLocaleDateString(LOC(), { day: "numeric", month: "short", year: "numeric" });
loadData();
/* each note goes to Dirección ("board"), to one manager, or to everyone (no "to") */
const noteViewer = () => (D.as === "board" ? "board" : meName());
/* a notification can be deleted by whoever it is shown to; a shared one stays for the others */
const myNotes = () => D.notes.filter((n) => (!n.to || n.to === noteViewer()) && !(n.hid || []).includes(noteViewer()));
const unread = () => myNotes().filter((n) => !n.r && n.ts > (D.seenAt || 0)).length;
/* while the notifications page is open, "new" is judged against the previous visit, so the user still sees what arrived */
const isNew = (n) => !n.r && n.ts > (V.view === "notes" && V.notesPrev != null ? V.notesPrev : D.seenAt || 0);
function bell(cls = "") {
  const n = unread();
  return `<button class="bell ${cls}" data-bell aria-label="Notificaciones${n ? `, ${n} sin leer` : ""}" ${V.view === "notes" ? 'aria-current="page"' : ""}>${I("bell")}${n ? `<span class="bdg">${n}</span>` : ""}</button>`;
}
const ME = () => (D.me && D.as === "board" ? { name: "James Carter", role: "Dirección" } : D.me || { name: "Tu cuenta", role: "Administración" });
const meIni = () => (D.me ? esc(initials(ME().name)) : I("user"));
const initials = (t) =>
  String(t)
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
const plazo = (pr) =>
  pr.end
    ? "Hasta el " + fdate(pr.end)
    : pr.months
      ? PLAZO.find((x) => x[0] === pr.months)?.[1] || String(pr.months).replace(".", ",") + (pr.months === 1 ? " mes" : " meses")
      : "Sin fecha de fin";
/* an (i) next to a term that needs context: the system tooltip on hover, keyboard focus and tap */
const itip = (t) => `<button type="button" class="itip" title="${esc(t)}" aria-label="Más información: ${esc(t)}">${I("info-circle")}</button>`;
const stp = (attr, v, min, max, l) =>
  `<span class="stp"><button data-${attr} data-d="-1" ${v <= min ? "disabled" : ""} aria-label="Menos ${l}">−</button><b>${v}</b><button data-${attr} data-d="1" ${v >= max ? "disabled" : ""} aria-label="Más ${l}">+</button></span>`;
const price = (o) =>
  o.req && !o.p
    ? `<small class="ptbc">Precio por confirmar</small>`
    : o.p === 0
    ? "Gratis"
    : `${eur(toEUR(o.id, o.p))}<small>${o.once ? " pago único" : "/" + (o.unit === "plan" ? "mes" : "persona·mes")}</small>`;
function scoped() {
  return D.projects.filter((p) => inEnt(p) && !p.archived && canSee(p));
}
/* «Tareas pendientes» (manager and Dirección): only real tasks */
function pending(ps) {
  const out = [];
  if (isBoard()) {
    ps.filter((p) => p.status === "pending")
      .sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0))
      .forEach((p) => {
        const k = cost(p);
        const hire = p.parent && p.roles.length === 1 && ((p.roles[0].fill || [])[0] || {}).src === "new",
          par = hire && D.projects.find((q) => q.id === p.parent),
          inv = `inversión nueva ${eur(k.og ? k.inv : k.invTotal)}${k.og ? "/mes" : ""}`;
        out.push(hire ? ["user-plus", "", `${esc(p.owner)} pide ${esc(FAM[p.roles[0].id].t)} para «${esc(par ? par.name : p.name)}» · ${inv}`, "Revisar", `data-gop="${p.id}"`] : ["file-alt", "", `«${esc(p.name)}» · ${esc(p.owner)} · ${inv}`, "Revisar", `data-gop="${p.id}"`]);
      });
    const lics = D.licenses.filter((l) => D.ent === "all" || l.scope === "group" || l.scope === D.ent).map((l) => [l, seatInventory(l)]),
      sh = lics.filter(([, inv]) => inv.missing > 0),
      soon = lics.filter(([, inv]) => !inv.missing && inv.later > 0);
    if (sh.length) {
      const [l, inv] = sh[0];
      out.push([
        "exclamation-triangle",
        "warn",
        sh.length === 1
          ? `${esc(opt(l.opt).n)}: ${inv.missing > 1 ? "faltan " + inv.missing + " asientos" : "falta 1 asiento"} en el contrato`
          : `Faltan asientos en ${sh.length} licencias: ${sh
              .slice(0, 2)
              .map(([l, inv]) => `${esc(opt(l.opt).n.split(" (")[0])} (${inv.missing})`)
              .join(", ")}${sh.length > 2 ? ` y ${sh.length - 2} más` : ""}`,
        "Revisar",
        'data-nav="licenses"',
      ]);
    }
    if (soon.length) {
      const n = soon.reduce((a, [, inv]) => a + inv.later, 0),
        first = soon.map(([, inv]) => inv.fut[0]).sort((a, b) => startKey(a).localeCompare(startKey(b)))[0];
      out.push(["key-skeleton", "", `${n} asiento${n > 1 ? "s" : ""} por comprar antes de ${monthIn(Math.max(0, mIdx(first.start)))} para «${esc(first.name)}»`, "Revisar", 'data-nav="licenses"']);
    }
    return out;
  }
  const mine = ps.filter((p) => p.owner === meName());
  mine.filter((p) => p.status === "changes").forEach((p) => out.push(["pen", "warn", `Dirección pide cambios en «${esc(p.name)}»`, "Revisar", `data-gop="${p.id}"`]));
  mine.filter((p) => p.status === "draft").forEach((p) => out.push(["file-alt", "", `«${esc(p.name)}» está en borrador sin enviar`, "Revisar", `data-gop="${p.id}"`]));
  mine.filter(isLive).forEach((p) => {
    const h = hiringOf(p);
    if (h) out.push(["user-plus", "", `«${esc(p.name)}»: ${h === 1 ? "1 persona en contratación. Indica cuándo se incorpora" : `${h} personas en contratación. Indica cuándo se incorporan`}`, "Ver", `data-gop="${p.id}"`]);
  });
  return out;
}
const pendRow = ([ic, c, t, lab, act]) =>
  `<button class="arow rl ${c}" ${act}>${I(ic)}<span class="art">${t}</span><span class="arl">${lab}</span></button>`;
const fdateS = (d) => new Date(d).toLocaleDateString(LOC(), { day: "numeric", month: "short" }).replace(".", "");
const pct = (v) => (v < -999 ? "< −999 %" : Math.round(v).toLocaleString(LOC()).replace("-", "−") + " %");
const monthName = () => new Date().toLocaleDateString(LOC(), { month: "long" });
function welcomeHTML() {
  return `<div class="hero2 welcome"><div class="hglow"></div><div class="hcont"><div class="step" style="color:#ffffff99">Bienvenido a HUMAIN</div><h1>Empieza por tu primer proyecto</h1><p>Pide las personas, el software y la IA de tus proyectos con su coste completo: lo que la empresa ya paga y lo que es inversión nueva.</p><div class="hact"><button class="btn btn-l" data-setup>Nuevo proyecto</button><button class="lnk wl" data-loadseed>Restaurar datos</button></div></div></div>
  <div class="how">${[
    ["1", "Cuéntanos el proyecto", "Tipo, tamaño y plazo. HUMAIN propone el equipo, su software y su IA."],
    ["2", "Primero, tu equipo", "Usa a las personas libres de tu equipo y las licencias que ya pagáis antes de contratar o comprar."],
    ["3", "Envíalo a Dirección", "Con el coste completo y la inversión nueva separados, para que decida con todo delante."],
  ]
    .map(
      ([n, t, d]) =>
        `<div class="card"><div class="step">Paso ${n}</div><h2>${t}</h2><p class="note" style="margin-top:6px">${d}</p></div>`,
    )
    .join("")}</div>`;
}
function pageHome() {
  if (!D.setup && !D.projects.length) return welcomeHTML();
  const board = isBoard(),
    ps = scoped(),
    act = ps.filter(isLive),
    nPend = ps.filter((p) => p.status === "pending").length,
    alerts = pending(ps),
    now = new Date(),
    hr = now.getHours(),
    hi = hr < 14 ? "Buenos días" : hr < 21 ? "Buenas tardes" : "Buenas noches";
  /* month line: what the projects in progress cost this month, prorated to today */
  const dIM = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    mFrac = now.getDate() / dIM,
    mNow = act.reduce((t, p) => t + cost(p).monthly * schedShare(p, 0), 0),
    mSpent = Math.round((mNow * mFrac) / 100) * 100;
  const split = { p: 0, s: 0, a: 0 };
  act.forEach((pr) => {
    const k = cost(pr),
      f = schedShare(pr, 0);
    split.p += k.people * f;
    k.tools.forEach((t) => (split[isAiTool(t.id) ? "a" : "s"] += (t.m + (t.saved || 0)) * f));
  });
  const heroMsg = board
    ? ""
    : !ps.length
      ? "Crea tu primer proyecto: HUMAIN propone el equipo, su software y su IA."
      : alerts.length
        ? ""
        : "Todo al día: no tienes nada pendiente.";
  const tasks = `<div class="card"><div class="ch"><h2>Tareas pendientes</h2>${alerts.length ? `<span class="cbadge" aria-label="${alerts.length} pendientes">${alerts.length}</span>` : ""}</div>${alerts.length ? alerts.slice(0, 3).map(pendRow).join("") : `<p class="note">Nada pendiente.</p>`}${alerts.length > 3 ? `<button class="more lk" data-nav="tasks">Ver las ${alerts.length} tareas ${I("angle-right")}</button>` : ""}</div>`;
  return `<div class="hero2"><div class="hglow"></div><div class="hcont"><div class="step ent-eb" style="color:#ffffff99">${esc(board ? "Dirección" : teamName(meName()))}</div><h1>${hi}${D.me ? ", " + esc(ME().name.split(" ")[0]) : ""}</h1>${heroMsg ? `<p>${heroMsg}</p>` : ""}<div class="hact">${board ? (nPend ? `<button class="btn btn-l" data-pfilter="pending">Ver propuestas · ${nPend}</button>` : `<button class="btn btn-l" data-nav="projects">Ver proyectos</button>`) : `<button class="btn btn-l" data-new>Nuevo proyecto</button>`}</div></div>${mNow > 0 ? heroMonth(mSpent, mNow, mFrac, dIM - now.getDate(), split) : ""}</div>
  ${`<div class="grid2 hl">${tasks}${board ? homeInvest(ps) : homeTeam(Math.max(3, Math.min(alerts.length, 3)))}</div>${homeSpend(act, board)}`}
  ${homeProjects(ps, board)}`;
}
/* hero panel: this month's spend and what it goes to (people, software, AI) */
function heroMonth(spent, total, frac, left, sp) {
  const T = sp.p + sp.s + sp.a || 1,
    pc = (v) => Math.max(v > 0 ? 2 : 0, Math.round((v / T) * 100)),
    seg = [
      ["p", "Personas", sp.p],
      ["s", "Software", sp.s],
      ["a", "IA", sp.a],
    ];
  return `<div class="hsum"><span class="hsl">${cap1(monthName())} · quedan ${left} día${left !== 1 ? "s" : ""}</span><b class="hsv">${eur(spent)}</b><span class="hst">de ${eur(Math.round(total / 100) * 100)} este mes</span><div class="hbar" aria-hidden="true"><i style="width:${Math.round(frac * 100)}%"></i></div></div>`;
}
/* Gasto por recurso: what this month's projects in progress spend on people, software and AI */
function homeSpend(act, board) {
  if (!act.length) return "";
  const sp = { p: 0, s: 0, a: 0 },
    ids = { s: new Set(), a: new Set() };
  let seatsN = 0,
    reused = 0;
  act.forEach((pr) => {
    const k = cost(pr),
      f = schedShare(pr, 0);
    sp.p += k.people * f;
    pr.roles.forEach((r) => (seatsN += (r.fill || []).length));
    k.tools.forEach((t) => {
      const w = isAiTool(t.id) ? "a" : "s";
      sp[w] += (t.m + (t.saved || 0)) * f;
      ids[w].add(t.id);
      reused += t.free || 0;
    });
  });
  const T = sp.p + sp.s + sp.a || 1,
    pc = (v) => (v > 0 && v / T < 0.01 ? "< 1 %" : Math.round((v / T) * 100) + " %"),
    w = (v) => Math.max(v > 0 ? 1.5 : 0, (v / T) * 100);
  const tile = (k, n, v, sub) => `<div class="gst"><span class="gsl"><i class="k${k}"></i>${n}</span><b>${eur(v)}<em>/mes</em></b><small>${pc(v)} · ${sub}</small></div>`;
  return `<section class="card gspend"><div class="ch"><h2>Gasto por recurso</h2><small>${board ? "Toda la empresa" : "Tus proyectos"} · ${monthName()}</small></div><div class="gsb" aria-hidden="true"><i class="kp" style="width:${w(sp.p)}%"></i><i class="ks" style="width:${w(sp.s)}%"></i><i class="ka" style="width:${w(sp.a)}%"></i></div><div class="gsg">${tile("p", "Personas", sp.p, `${seatsN} puesto${seatsN !== 1 ? "s" : ""}`)}${tile("s", "Software", sp.s, `${ids.s.size} herramienta${ids.s.size !== 1 ? "s" : ""}`)}${tile("a", "IA", sp.a, `${ids.a.size} herramienta${ids.a.size !== 1 ? "s" : ""}`)}</div>${reused ? `<p class="note gsn">${reused} asiento${reused !== 1 ? "s" : ""} que ya pagáis cubren estos proyectos: no hace falta comprarlos.</p>` : ""}</section>`;
}
/* month name n months from now ("marzo") */
const monthIn = (n) => new Date(new Date().getFullYear(), new Date().getMonth() + n, 1).toLocaleDateString(LOC(), { month: "long" });
/* when someone is free: now, from a month on, or not foreseen (a continuous project) */
function avail(x) {
  const ps = projectsOf(x.id);
  if (!ps.length) return { n: 0, label: "Libre", tone: "active", ps };
  const ends = ps.map(endsIn),
    n = ends.some((e) => e === null) ? null : Math.max(...ends);
  if (n === null) return { n, label: "Sin fecha de fin", tone: "draft", ps };
  const y = new Date(new Date().getFullYear(), new Date().getMonth() + n, 1).getFullYear();
  return { n, label: n <= 0 ? "Libre este mes" : `Libre en ${monthIn(n)}${n > 11 ? " de " + y : ""}`, tone: "draft", ps };
}
/* Tu equipo: who is free now and who frees up soon — what a manager needs to plan the next project */
function homeTeam(rows = 5) {
  const ppl = visPeople(),
    free = ppl.filter((x) => isOpen(x.id)),
    soon = ppl
      .filter((x) => !isOpen(x.id))
      .map((x) => {
        const ends = projectsOf(x.id).map(endsIn);
        return { x, n: ends.some((e) => e === null) ? null : Math.max(...ends), held: !projectsOf(x.id).length };
      })
      .filter((o) => o.n !== null && o.n <= 4)
      .sort((a, b) => a.n - b.n);
  const row = (x, sub, tone) =>
    `<div class="tmr"><span class="av sm" aria-hidden="true">${esc(initials(x.name))}</span><span class="tmn"><b>${esc(x.name)}</b><small>${esc(F(x.fid).t)}${lvlName(x) ? " · " + esc(lvlName(x)) : ""}</small></span><span class="pill ${tone}">${sub}</span></div>`;
  const list = [...free.map((x) => row(x, "Libre", "active")), ...soon.map((o) => row(o.x, o.held ? "Propuesta" : o.n <= 0 ? "Libre este mes" : `Libre en ${monthIn(o.n)}`, o.held ? "pend" : "draft"))];
  return `<div class="card hteam"><div class="ch"><h2>Tu equipo</h2><small>${free.length} de ${ppl.length} libres</small></div>${list.length ? list.slice(0, rows).join("") : `<p class="note">Todo tu equipo está asignado y nadie se libera en los próximos meses.</p>`}<button class="more lk" data-nav="people">${list.length > rows ? `Ver todo tu equipo · ${ppl.length}` : "Ver tu equipo"} ${I("angle-right")}</button></div>`;
}
/* Dirección: what is committed and what is waiting for a decision */
function homeInvest(ps) {
  const act = ps.filter(isLive),
    pend = ps.filter((p) => p.status === "pending"),
    sum = (arr, f) => arr.reduce((t, p) => t + f(cost(p)), 0),
    monthly = sum(act, (k) => k.monthly),
    invPend = sum(pend, (k) => (k.og ? k.inv : k.invTotal));
  const sv = savings(),
    row = (ic, l, v, sub) => `<div class="tmr noav"><span class="tmn"><b>${l}</b><small>${sub}</small></span><b class="tmv">${v}</b></div>`;
  return `<div class="card hteam"><div class="ch"><h2>Inversión</h2><small>${cap1(monthName())}</small></div>${row("wallet", "En curso", `${eur(monthly)}<small>/mes</small>`, `${act.length} proyecto${act.length !== 1 ? "s" : ""}`)}${row("clock", "Pendiente de aprobar", eur(invPend), `${pend.length} propuesta${pend.length !== 1 ? "s" : ""} · inversión nueva`)}${row("check-circle", "Ahorrado este año", eur(sv.total || 0), "licencias que no hizo falta comprar")}<button class="more lk" data-nav="projects">Ver proyectos · ${ps.length} ${I("angle-right")}</button></div>`;
}
/* the one next step each project is waiting for */
function nextStep(p, board) {
  if (p.status === "draft") return "Siguiente: enviar a Dirección";
  if (p.status === "changes") return board ? "Esperando a que lo reenvíe" : "Siguiente: revisar y reenviar";
  if (p.status === "pending") return board ? "Espera tu decisión" : "Esperando a Dirección";
  if (p.status === "rejected") return "Rechazado por Dirección";
  if (p.status === "cancelled") return p.cancel && p.cancel.by === "b" ? "Cancelado por Dirección" : "Cancelado";
  if (p.status === "done") return "Finalizado";
  const h = hiringOf(p);
  return h ? `${h} ${h === 1 ? "persona" : "personas"} en contratación` : "Equipo completo";
}
function homeProjects(ps, board) {
  if (!ps.length) return "";
  const order = (p) => (board ? { pending: 0, changes: 1, active: 2, draft: 3, done: 4, rejected: 5 } : { changes: 0, draft: 1, pending: 2, active: 3, done: 4, rejected: 5 })[p.status];
  const list = [...ps].filter((p) => !p.archived).sort((a, b) => order(a) - order(b));
  const card = (p) => {
    const c = cost(p),
      live = isLive(p),
      st = p.start ? mIdx(p.start) : 0,
      cur = Math.min(p.months || 1, Math.max(1, 1 - st)),
      prog = live && p.months && st <= 0 ? `<div class="hpb" aria-hidden="true"><i style="width:${Math.round((cur / p.months) * 100)}%"></i></div><small class="hpm">Mes ${cur} de ${p.months}</small>` : `<small class="hpm">${p.months ? `${p.months} ${p.months === 1 ? "mes" : "meses"}` : "Servicio continuo"}${p.start && st > 0 ? ` · empieza en ${monthIn(st)}` : ""}</small>`;
    return `<button class="hpc" data-openp="${p.id}"><span class="hpt"><span class="pic">${I(p.parent ? "pen" : TYPES[p.type][0])}</span><b>${p.parent ? "Cambios en «" + esc(p.name) + "»" : esc(p.name)}</b>${stPill(p)}</span><span class="hps">${board ? esc(p.owner) + " · " : ""}${esc(nextStep(p, board))}</span>${prog}<span class="hpf"><span><small>Coste</small><b>${eur(c.monthly)}<em>/mes</em></b></span><span><small>Inversión nueva</small><b>${eur(c.og ? c.inv : c.invTotal)}${c.og ? "<em>/mes</em>" : ""}</b></span>${hpTeam(p)}</span></button>`;
  };
  return `<section class="hproj"><div class="sech"><h2>${board ? "Proyectos de la empresa" : "Tus proyectos"}</h2>${list.length > 6 ? `<button class="more lk" data-nav="projects">Ver los ${list.length} ${I("angle-right")}</button>` : ""}</div><div class="cards">${list.slice(0, 6).map(projCard).join("")}</div></section>`;
}
/* the "en marcha" subtitle is computed from the project's current seats, never stored */
const hiringOf = (pr) => pr.roles.reduce((a, r) => a + (r.fill || []).filter((f) => f.src === "new" && f.hiring).length, 0);
function noteSub(n) {
  const pr = n.k === "team" && !n.s && D.projects.find((p) => p.id === n.p);
  if (!pr || pr.status !== "active") return n.s;
  const h = hiringOf(pr);
  return h ? `${h} ${h === 1 ? "persona" : "personas"} en contratación` : "Equipo completo";
}
function noteRow(n) {
  const i = D.notes.indexOf(n),
    lic = n.k === "lic",
    hasP = n.p && D.projects.some((p) => p.id === n.p && canSee(p)),
    verb = lic ? "Ver software e IA" : hasP ? "Ver proyecto" : "",
    nw = isNew(n),
    body = `<span class="nic">${I(noteIc(n))}${nw ? '<i class="ndot" aria-hidden="true"></i>' : ""}</span><span class="nb"><span class="nt">${nw ? '<span class="sr">Sin leer: </span>' : ""}${esc(n.t)}</span><small>${esc(noteSub(n))}</small><em>${cap1(rel(n.ts))}</em></span>`,
    cls = `nitem rl ${nw ? "new" : ""} ${lic && /^Falta/.test(n.t) ? "nalert" : ""} ${n.ic === "check-circle" ? "nok" : ""} ${verb ? "op" : "st"}`,
    /* Gmail-style row actions: they appear on hover or focus, and always on touch screens */
    acts = `<span class="nact${nw ? "" : " one"}">${nw ? `<button class="ib s" data-nread="${i}" data-tt="Marcar como leída" aria-label="Marcar como leída: ${esc(n.t)}">${I("check")}</button>` : ""}<button class="ib s" data-ndis="${i}" data-tt="Eliminar" aria-label="Eliminar: ${esc(n.t)}">${I("trash-alt")}</button><span class="pmw nmore"><button class="ib s" data-pmenu="n${i}" aria-label="Más acciones: ${esc(n.t)}" aria-haspopup="menu" aria-expanded="${V.menu === "pm:n" + i}">${I("ellipsis")}</button>${V.menu === "pm:n" + i ? `<span class="amenu pm" role="menu">${nw ? `<button role="menuitem" data-nread="${i}">Marcar como leída</button>` : ""}<button role="menuitem" data-ndis="${i}">Eliminar</button></span>` : ""}</span></span>`;
  return `<div class="${cls}">${verb ? `<button class="nmain" data-nopen="${i}" aria-label="${verb}: ${esc(n.t)}">${body}</button>` : `<div class="nmain">${body}</div>`}${acts}</div>`;
}
/* every pending task, from Inicio's «Ver las N tareas» */
function pageTasks() {
  const al = pending(scoped());
  return `<button class="backl" data-nav="home">${I("angle-left")}Inicio</button><div class="ph"><div><h1 style="margin-top:4px">Tareas pendientes</h1></div></div>${al.length ? `<div class="card tlist">${al.map(pendRow).join("")}</div>` : `<div class="empty etab">${EMPTY_ILL}<b>Todo al día</b><p>Cuando haya algo que revisar o marcar, aparecerá aquí y en tu Inicio.</p></div>`}`;
}
function pageNotes() {
  const newN = myNotes().filter((n) => isNew(n)).length;
  return `<div class="ph"><div><h1>Notificaciones</h1></div>${newN ? `<div class="phact"><button class="btn btn-s sm" data-nreadall>Marcar todas como leídas</button></div>` : ""}</div>${myNotes().length ? `<div class="nlist">${myNotes().map(noteRow).join("")}</div>` : ""}${myNotes().length ? "" : `<div class="empty etab">${EMPTY_BELL}<b>No tienes notificaciones</b><p>${isBoard() ? "Aquí verás los proyectos que te envían los Responsables, las peticiones y los avisos de licencias." : "Aquí verás las respuestas de Dirección y los avisos que afectan a tu equipo."}</p></div>`}`;
}
const pmenu = (p, cls = "") => {
  const open = V.menu === "pm:" + p.id,
    items = `${cls === "pg" && !isBoard() && p.owner === meName() && !p.parent && ["active", "approved"].includes(stOf(p)) ? `<button role="menuitem" class="mo" data-extend="${p.id}">${I("pen")}${propOf(p) ? "Ver cambios propuestos" : "Proponer cambios"}</button>` : ""}${threadOf(p).filter((x) => x.t || x.who === "b").length > 1 ? `<button role="menuitem" data-phist="${p.id}">${I("comment-alt")}Ver historial</button>` : ""}<button role="menuitem" data-pexp="${p.id}">${I("print")}Exportar propuesta</button>${!isBoard() && p.owner === meName() && !p.parent ? `<button role="menuitem" data-pdup="${p.id}">${I("copy")}${p.status === "rejected" || p.status === "cancelled" || stOf(p) === "done" ? "Duplicar como nuevo proyecto" : "Duplicar como escenario"}</button>` : ""}${p.parent ? "" : p.archived ? (cls === "pg" ? "" : `<button role="menuitem" data-punarch="${p.id}">${I("archive")}Restaurar</button>`) : `<button role="menuitem" data-parch="${p.id}">${I("archive")}Archivar</button>`}${!p.parent && !p.archived && ["approved", "active"].includes(stOf(p)) && (isBoard() || p.owner === meName()) ? `<button role="menuitem" class="danger" data-pcancel="${p.id}">${I("times-circle")}Cancelar proyecto</button>` : !isBoard() && p.owner === meName() ? `<button role="menuitem" class="danger" data-pdel="${p.id}">${I("trash-alt")}${p.parent ? "Cancelar petición" : "Eliminar…"}</button>` : ""}`;
  /* in lists of cards the ⋯ is always there, even with one action, so every card looks the same */
  return `<div class="pmw ${cls}"><button class="ib s" data-pmenu="${p.id}" aria-label="Más acciones de ${esc(p.name)}" aria-haspopup="menu" aria-expanded="${open}">${I("ellipsis")}</button>${open ? `<div class="amenu pm" role="menu">${items}</div>` : ""}</div>`;
};
function projCard(p) {
  const c = cost(p);
  return `<div class="pcw ${p.archived ? "arch" : ""}"><button class="pcard" data-openp="${p.id}"><div class="pc1"><span class="pic">${I(p.parent ? "pen" : TYPES[p.type][0])}</span><div><h2>${p.parent ? "Cambios en «" + esc(p.name) + "»" : esc(p.name)}</h2><small>${isBoard() ? esc(p.owner) + " · " : ""}${plazo(p)}${p.start ? " · " + startLabel(p) : ""}</small></div>${stPill(p)}</div><div class="pc2"><span>${c.ppl} puesto${c.ppl !== 1 ? "s" : ""} · inversión nueva ${eur(c.og ? c.inv : c.invTotal)}${c.og ? "/mes" : ""}</span><b>${eur(c.monthly)}<small>/mes</small></b></div></button>${pmenu(p)}</div>`;
}
/* empty tab: an illustration and what will appear there */
const EMPTY_ILL = `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="38" y="34" width="104" height="74" rx="12" fill="#E4EDEC" transform="rotate(-6 90 71)"/><rect x="52" y="26" width="104" height="80" rx="12" fill="#fff" stroke="#D6E4E2" stroke-width="2"/><rect x="66" y="42" width="22" height="22" rx="6" fill="#BFE6DE"/><path d="M72 53h10M77 48v10" stroke="#0D3A3E" stroke-width="2.4" stroke-linecap="round"/><rect x="96" y="44" width="46" height="6" rx="3" fill="#0D3A3E" opacity=".85"/><rect x="96" y="56" width="32" height="5" rx="2.5" fill="#C9DCD9"/><rect x="66" y="76" width="76" height="6" rx="3" fill="#ECEAE5"/><rect x="66" y="88" width="54" height="6" rx="3" fill="#ECEAE5"/><circle cx="160" cy="30" r="13" fill="#F6E2D7"/><path d="M160 23v14M153 30h14" stroke="#A9553A" stroke-width="2.4" stroke-linecap="round"/><circle cx="40" cy="26" r="4" fill="#D98466"/><circle cx="172" cy="72" r="3" fill="#12897F"/></svg>`;
/* one illustration per tab, same family: rounded shapes, mint / petrol / terracotta / beige, oval shadow, floating dots */
const EMPTY_BELL = `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="38" y="34" width="104" height="74" rx="12" fill="#E4EDEC" transform="rotate(-6 90 71)"/><rect x="48" y="26" width="104" height="80" rx="12" fill="#fff" stroke="#D6E4E2" stroke-width="2"/><circle cx="100" cy="38" r="4" fill="#0D3A3E"/><path d="M100 39c-12 0-20 9-20 21v11l-6 9h52l-6-9V60c0-12-8-21-20-21z" fill="#D98466"/><path d="M88 50c-4 3-6 7-6 12v9h5V62c0-4 1-8 3-10z" fill="#F6E2D7" opacity=".75"/><rect x="72" y="79" width="56" height="7" rx="3.5" fill="#A9553A"/><path d="M93 90h14a7 7 0 0 1-14 0z" fill="#0D3A3E"/><circle cx="146" cy="94" r="21" fill="#BFE6DE"/><circle cx="146" cy="94" r="15" fill="#12897F"/><path d="M139 94.5l5 5 9-10" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="28" r="4" fill="#D98466"/><circle cx="168" cy="44" r="3" fill="#12897F"/><circle cx="34" cy="86" r="3" fill="#BFE6DE"/></svg>`;
const EMPTY_ILLS = {
  draft: `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="44" y="30" width="92" height="82" rx="12" fill="#E4EDEC" transform="rotate(-6 90 71)"/><path d="M60 24h62l18 18v62a10 10 0 0 1-10 10H60a10 10 0 0 1-10-10V34a10 10 0 0 1 10-10z" fill="#fff" stroke="#D6E4E2" stroke-width="2"/><path d="M122 24v12a6 6 0 0 0 6 6h12" fill="#E4EDEC" stroke="#D6E4E2" stroke-width="2" stroke-linejoin="round"/><rect x="64" y="44" width="40" height="6" rx="3" fill="#0D3A3E" opacity=".85"/><rect x="64" y="58" width="56" height="5" rx="2.5" fill="#C9DCD9"/><rect x="64" y="70" width="48" height="5" rx="2.5" fill="#ECEAE5"/><rect x="64" y="82" width="30" height="5" rx="2.5" fill="#ECEAE5"/><g transform="rotate(40 138 92)"><rect x="132" y="56" width="12" height="52" rx="4" fill="#D98466"/><rect x="132" y="56" width="12" height="9" rx="4" fill="#A9553A"/><rect x="132" y="63" width="12" height="4" fill="#BFE6DE"/><path d="M132 106h12l-6 12z" fill="#F6E2D7"/><path d="M136 114h4l-2 4z" fill="#0D3A3E"/></g><circle cx="40" cy="30" r="4" fill="#D98466"/><circle cx="168" cy="40" r="3" fill="#12897F"/></svg>`,
  pending: `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="38" y="34" width="104" height="74" rx="12" fill="#E4EDEC" transform="rotate(-6 90 71)"/><rect x="48" y="26" width="104" height="80" rx="12" fill="#fff" stroke="#D6E4E2" stroke-width="2"/><rect x="62" y="42" width="22" height="22" rx="6" fill="#BFE6DE"/><path d="M68 53h10" stroke="#0D3A3E" stroke-width="2.4" stroke-linecap="round"/><rect x="92" y="44" width="46" height="6" rx="3" fill="#0D3A3E" opacity=".85"/><rect x="92" y="56" width="32" height="5" rx="2.5" fill="#C9DCD9"/><rect x="62" y="76" width="60" height="6" rx="3" fill="#ECEAE5"/><rect x="62" y="88" width="40" height="6" rx="3" fill="#ECEAE5"/><path d="M153 102l15 15" stroke="#0D3A3E" stroke-width="7" stroke-linecap="round"/><circle cx="140" cy="88" r="20" fill="#F6E2D7" fill-opacity=".85" stroke="#A9553A" stroke-width="5"/><path d="M131 82a11 11 0 0 1 9-5" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="40" cy="26" r="4" fill="#D98466"/><circle cx="170" cy="58" r="3" fill="#12897F"/></svg>`,
  approved: `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="40" y="34" width="100" height="76" rx="12" fill="#E4EDEC" transform="rotate(-6 90 71)"/><rect x="50" y="28" width="100" height="82" rx="12" fill="#fff" stroke="#D6E4E2" stroke-width="2"/><path d="M50 40a12 12 0 0 1 12-12h76a12 12 0 0 1 12 12v8H50z" fill="#BFE6DE"/><rect x="70" y="20" width="6" height="16" rx="3" fill="#0D3A3E"/><rect x="124" y="20" width="6" height="16" rx="3" fill="#0D3A3E"/><g fill="#ECEAE5"><rect x="62" y="58" width="12" height="9" rx="3"/><rect x="80" y="58" width="12" height="9" rx="3"/><rect x="62" y="74" width="12" height="9" rx="3"/><rect x="62" y="90" width="12" height="9" rx="3"/><rect x="80" y="90" width="12" height="9" rx="3"/></g><rect x="80" y="74" width="12" height="9" rx="3" fill="#C9DCD9"/><circle cx="124" cy="82" r="17" fill="#0F7A70"/><path d="M116 82l6 6 11-12" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="160" cy="30" r="13" fill="#F6E2D7"/><circle cx="160" cy="30" r="3.5" fill="#A9553A"/><circle cx="38" cy="30" r="4" fill="#D98466"/><circle cx="170" cy="76" r="3" fill="#12897F"/></svg>`,
  active: `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="62" y="30" width="76" height="82" rx="14" fill="#E4EDEC" transform="rotate(-6 100 71)"/><path d="M76 30h48c0 22-16 30-16 40s16 18 16 40H76c0-22 16-30 16-40s-16-18-16-40z" fill="#fff" stroke="#D6E4E2" stroke-width="2" stroke-linejoin="round"/><path d="M84 46h32c-3 8-10 13-12 17h-8c-2-4-9-9-12-17z" fill="#D98466"/><path d="M99.2 63h1.6v28h-1.6z" fill="#D98466"/><path d="M82 108c2-10 9-16 18-16s16 6 18 16z" fill="#D98466"/><path d="M90 104c3-5 6-7 10-7" stroke="#F6E2D7" stroke-width="2.4" stroke-linecap="round" fill="none"/><rect x="68" y="20" width="64" height="12" rx="6" fill="#0D3A3E"/><rect x="68" y="108" width="64" height="12" rx="6" fill="#0D3A3E"/><rect x="74" y="24" width="20" height="3" rx="1.5" fill="#BFE6DE"/><circle cx="150" cy="40" r="13" fill="#BFE6DE"/><path d="M150 34v6l4 3" stroke="#0D3A3E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="46" cy="34" r="4" fill="#D98466"/><circle cx="156" cy="88" r="3" fill="#12897F"/></svg>`,
  done: `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="40" y="34" width="100" height="76" rx="12" fill="#E4EDEC" transform="rotate(-6 90 71)"/><rect x="50" y="28" width="100" height="82" rx="12" fill="#fff" stroke="#D6E4E2" stroke-width="2"/><rect x="64" y="44" width="40" height="6" rx="3" fill="#0D3A3E" opacity=".85"/><rect x="64" y="58" width="56" height="5" rx="2.5" fill="#C9DCD9"/><rect x="64" y="70" width="44" height="5" rx="2.5" fill="#ECEAE5"/><path d="M146 74v36" stroke="#0D3A3E" stroke-width="3" stroke-linecap="round"/><path d="M146 76h22l-6 8 6 8h-22z" fill="#12897F"/><circle cx="40" cy="30" r="4" fill="#D98466"/><circle cx="170" cy="40" r="3" fill="#12897F"/></svg>`,
  rejected: `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="40" y="34" width="100" height="76" rx="12" fill="#E4EDEC" transform="rotate(-6 90 71)"/><rect x="50" y="28" width="100" height="82" rx="12" fill="#fff" stroke="#D6E4E2" stroke-width="2"/><rect x="64" y="44" width="40" height="6" rx="3" fill="#0D3A3E" opacity=".85"/><rect x="64" y="58" width="56" height="5" rx="2.5" fill="#C9DCD9"/><rect x="64" y="70" width="44" height="5" rx="2.5" fill="#ECEAE5"/><circle cx="130" cy="92" r="18" fill="#F6E2D7" stroke="#A9553A" stroke-width="3"/><path d="M123 85l14 14M137 85l-14 14" stroke="#A9553A" stroke-width="3.4" stroke-linecap="round"/><circle cx="40" cy="30" r="4" fill="#D98466"/><circle cx="168" cy="44" r="3" fill="#12897F"/></svg>`,
  archived: `<svg class="eill" viewBox="0 0 200 140" aria-hidden="true" focusable="false"><ellipse cx="100" cy="124" rx="72" ry="8" fill="#ECEAE5"/><rect x="52" y="30" width="96" height="40" rx="8" fill="#E4EDEC" transform="rotate(-5 100 50)"/><rect x="58" y="22" width="84" height="56" rx="8" fill="#fff" stroke="#D6E4E2" stroke-width="2" transform="rotate(3 100 50)"/><rect x="70" y="36" width="34" height="5" rx="2.5" fill="#0D3A3E" opacity=".85" transform="rotate(3 100 50)"/><rect x="70" y="47" width="52" height="4" rx="2" fill="#C9DCD9" transform="rotate(3 100 50)"/><rect x="70" y="56" width="40" height="4" rx="2" fill="#ECEAE5" transform="rotate(3 100 50)"/><path d="M48 64h104a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H48a4 4 0 0 1-4-4V68a4 4 0 0 1 4-4z" fill="#12897F"/><path d="M52 82h96v32a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z" fill="#BFE6DE"/><path d="M52 82h96v6H52z" fill="#0F7A70" opacity=".25"/><rect x="82" y="94" width="36" height="14" rx="7" fill="#fff" stroke="#0D3A3E" stroke-width="2"/><rect x="92" y="99" width="16" height="4" rx="2" fill="#0D3A3E"/><circle cx="36" cy="34" r="4" fill="#D98466"/><circle cx="170" cy="46" r="3" fill="#12897F"/><circle cx="162" cy="100" r="5" fill="#F6E2D7"/></svg>`,

};
function emptyTab(f) {
  const b = isBoard(),
    T = {
      draft: ["No tienes borradores", "Si empiezas un proyecto y no lo envías, se guarda aquí para que lo retomes cuando quieras."],
      pending: b ? ["No hay propuestas por revisar", "Te avisaremos en cuanto un Responsable te envíe un proyecto."] : ["Ningún proyecto en revisión", "Cuando envíes uno a Dirección, lo verás aquí hasta que te responda."],
      approved: ["Ningún proyecto esperando su inicio", "Los proyectos aprobados se quedan aquí hasta el mes en que empiezan."],
      active: ["Ningún proyecto en marcha", "Cuando empiece un proyecto aprobado, aquí verás cómo avanza mes a mes."],
      done: ["Aún no has cerrado ningún proyecto", "Los terminados se quedan aquí para consultarlos cuando lo necesites."],
      rejected: ["Ningún proyecto rechazado", "Si Dirección rechaza uno, lo verás aquí junto a su comentario."],
      archived: ["No hay proyectos archivados", "Archiva los que ya no necesites tener a la vista."],
    }[f] || ["No hay proyectos aquí", ""];
  return `<div class="empty etab">${EMPTY_ILLS[f] || EMPTY_ILL}<b>${T[0]}</b>${T[1] ? `<p>${T[1]}</p>` : ""}</div>`;
}
/* tabs follow the life of a project; the last ones only appear when they hold something */
const PF = {
  all: [() => true, "Todos"],
  /* who has the ball: changes asked → the Responsable must act, so it gets its own tab (not a draft) */
  changes: [(p) => p.status === "changes", "Cambios pedidos", 1],
  draft: [(p) => p.status === "draft", "Borradores", 1],
  pending: [(p) => p.status === "pending", "Pendientes"],
  approved: [(p) => stOf(p) === "approved", "Aprobados", 1],
  active: [(p) => stOf(p) === "active", "En curso"],
  done: [(p) => stOf(p) === "done", "Finalizados", 1],
  rejected: [(p) => p.status === "rejected", "Rechazados", 1],
  cancelled: [(p) => p.status === "cancelled", "Cancelados", 1],
};
function pageProjects() {
  const all = D.projects.filter((p) => inEnt(p) && canSee(p) && !(p.full && p.status === "draft") && !(p.parent && !p.full)),
    live = all.filter((p) => !p.archived),
    arch = all.filter((p) => p.archived),
    f = V.pf || "all",
    ps = f === "archived" ? arch : live.filter(PF[f] ? PF[f][0] : PF.all[0]),
    cnt = (k) => (k === "archived" ? arch : live.filter(PF[k][0])).length;
  return `<div class="ph"><div><div class="step ent-eb">${esc(isBoard() ? "Dirección" : teamName(meName()))}</div><h1>Proyectos</h1></div>${isBoard() ? "" : `<button class="btn btn-p sm" data-new>Nuevo proyecto</button>`}</div>${
    all.length
      ? `<div class="tabs pf" role="tablist" aria-label="Filtrar proyectos">${[...Object.keys(PF).filter((k) => (!PF[k][2] || cnt(k) || f === k) && !(k === "draft" && isBoard())).map((k) => [k, PF[k][1]]), ...(arch.length || f === "archived" ? [["archived", "Archivados"]] : [])]
          .map(([k, t]) => `<button class="tab" role="tab" data-pfilter="${k}" aria-selected="${f === k}">${t}<span class="tcn">${cnt(k)}</span></button>`)
          .join("")}</div>`
      : ""
  }${ps.length ? `<div class="cards">${ps.map(projCard).join("")}</div>` : all.length ? emptyTab(f) : `<div class="empty">${I("layer-group")}<b>Aún no tienes proyectos</b><p>Crea uno y HUMAIN propondrá las personas, el software y la IA que necesita.</p>${isBoard() ? "" : `<button class="btn btn-p sm" data-new>Nuevo proyecto</button>`}</div>`}`;
}
/* ===== Equipo: the register of people. A manager sees her team; Dirección sees every team. ===== */
/* a team with nobody yet: its card with a way to add the first person */
const tact = (lead, t) => {
  const k = esc(lead + "||" + t),
    mine = (D.people || []).filter((x) => x.team === lead && areaOf(x) === t);
  return `<div class="pmw tact"><button class="ib" data-pmenu="${k}" aria-label="Acciones de ${esc(t)}" aria-haspopup="menu" aria-expanded="${V.menu === "pm:" + lead + "||" + t}">${I("ellipsis")}</button>${V.menu === "pm:" + lead + "||" + t ? `<div class="amenu pm" role="menu"><button role="menuitem" data-addperson="${esc(k)}">${I(EVIC.hire)}Añadir persona</button>${isBoard() ? "" : `${mine.some((x) => isOpen(x.id)) ? `<button role="menuitem" data-asgopen="${k}">${I(EVIC.assign)}Asignar a un proyecto</button>` : ""}${mine.some((x) => projectsOf(x.id).some((q) => q.owner === meName())) ? `<button role="menuitem" data-pxopen="${k}">${I(EVIC.unassign)}Sacar de un proyecto</button>` : ""}<button role="menuitem" class="danger" data-leaveopen="${k}">${I(EVIC.leave)}Dar de baja a alguien</button>`}</div>` : ""}</div>`;
};
/* a monthly cost is real (someone typed it), an estimate (market reference) or missing */
const costOf = (x) => {
  if (x.cost > 0) return { v: x.cost, k: "real" };
  const e = illus({ id: x.fid, grade: x.lvl }, ENT(x.ent).country);
  return e ? { v: e, k: "est" } : { v: 0, k: "none" };
};
/* Dirección starts hidden when the company chose «Solo totales»; Responsables start visible. The eye flips it for the session, for anyone. */
V.costRoles = V.costRoles || {};
/* each eye reveals one row; the figure is still the average of the puesto, never one person's salary */
const costMasked = (x) => !V.costRoles[x.id];
/* when shown, the figure is the average of the cargo (same puesto) across everyone listed, never one person's own salary */
const cargoCost = (x, pool) => {
  const cs = (pool || []).filter((y) => y.fid === x.fid).map(costOf),
    n = cs.length || 1,
    v = Math.round(cs.reduce((a, c) => a + c.v, 0) / n);
  return { v, k: cs.length && cs.every((c) => c.k === "real") ? "real" : v ? "est" : "none" };
};
const teamCost = (xs) => {
  const cs = xs.map(costOf),
    sum = cs.reduce((a, c) => a + c.v, 0),
    real = cs.filter((c) => c.k === "real").length;
  return sum ? ` · ${real < xs.length ? "~" : ""}${eur(sum)}/mes${real < xs.length ? ` · ${real} de ${xs.length} con cifra real` : ""}` : "";
};
function pagePeople() {
  const board = isBoard(),
    ppl = visPeople(),
    head = `<div class="ph"><div><h1>Personas</h1></div>${D.me ? `<div class="phact">${isBoard() ? `<button class="btn btn-p sm" data-addperson>Añadir persona</button>` : `<button class="btn btn-p sm dsk" data-addperson>Añadir persona</button><div class="pmw"><button class="ib" data-pmenu="pplh" aria-label="Más acciones" aria-haspopup="menu" aria-expanded="${V.menu === "pm:pplh"}">${I("ellipsis")}</button>${V.menu === "pm:pplh" ? `<div class="amenu pm" role="menu"><button role="menuitem" class="mo" data-addperson>${I(EVIC.hire)}Añadir persona</button><button role="menuitem" class="danger" data-leaveopen="${esc(meName())}||">${I(EVIC.leave)}Dar de baja a alguien</button></div>` : ""}</div>`}</div>` : ""}</div>`;
  if (!ppl.length)
    return (
      head +
      `<div class="empty">${I("users-alt")}<b>Aún no hay nadie en ${board ? "la empresa" : "tu equipo"}</b><p>Añade a las personas de tu equipo: HUMAIN las propondrá primero cuando estén libres.</p>${D.me ? `<button class="btn btn-p sm" data-addperson>Añadir persona</button>` : ""}</div>`
    );
  const row = (x) => {
    const av = avail(x),
      /* Dirección does not see drafts: someone only in a draft reads as free for them */
      hb = heldBy(x.id).filter((q) => !board || q.status !== "draft"),
      ps = av.ps,
      /* «En proyecto» rather than «Ocupado/a»: it reads the same for everyone */
      inP = ps.length ? `<small class="avp">${ps.map((p) => esc(p.name)).join(" y ")}${av.n !== null ? " · " + av.label.toLowerCase() : ""}</small>` : "",
      mine = !board && ps.filter((q) => q.owner === meName()),
      /* person actions live in their own ⋯ menu, not as loose links in the row */
      pmo = V.menu === "pm:x" + x.id,
      pxm2 = !board && x.team === meName() && !x.leaving
        ? `<span class="pmw xpm"><button class="ib s" data-pmenu="x${esc(x.id)}" aria-label="Acciones de ${esc(x.name)}" aria-haspopup="menu" aria-expanded="${pmo}">${I("ellipsis")}</button>${pmo ? `<span class="amenu pm" role="menu">${isOpen(x.id) ? `<button role="menuitem" data-asgx="${esc(x.id)}">${I(EVIC.assign)}Asignar a un proyecto</button>` : ps.length ? `<button role="menuitem" data-movex="${esc(x.id)}">${I("exchange")}Mover a otro proyecto</button>` : ""}${mine && mine.length ? `<button role="menuitem" data-pxx="${esc(x.id)}">${I(EVIC.unassign)}Sacar de un proyecto</button>` : ""}<button role="menuitem" class="danger" data-leavex="${esc(x.id)}">${I(EVIC.leave)}Dar de baja</button></span>` : ""}</span>`
        : "",
      pxm = "",
      st = `<span class="avs">${x.leaving ? `<span class="pill leave">Se va el ${esc(fmtShort(x.leaving.date))}</span>` : ps.length ? `<span class="pill draft">En proyecto</span>` : hb.length ? `<span class="pill pend" title="Está en una propuesta que aún no ha empezado">Propuesta</span>` : `<span class="pill active">Libre</span>`}${inP || !hb.length ? inP : `<small class="avp">En ${hb.map((p) => "«" + esc(p.name) + "»").join(" y ")}, sin empezar</small>`}${pxm}</span>`,
      cc = cargoCost(x, ppl),
      cv = costMasked(x) ? "∗∗∗∗" : cc.k === "none" ? "—" : (cc.k === "est" ? "~" : "") + eur(cc.v);
    return `<div class="tr c4"><span class="xn xav"><span class="av sm" aria-hidden="true">${esc(initials(x.name))}</span><b>${esc(x.name)}</b></span><span class="sc xd">${esc(F(x.fid).t)}${lvlName(x) || (board && D.managers.length > 1) ? `<small>${[lvlName(x), board && D.managers.length > 1 ? esc(x.team) : ""].filter(Boolean).join(" · ")}</small>` : ""}</span><span class="xd">${st}</span><span class="cost ${cc.k}"><b${costMasked(x) ? ' class="mk"' : ""}>${cv}</b>${costMasked(x) ? "" : cc.k === "none" ? "<small>Sin dato</small>" : "<small>Media del cargo</small>"}<button class="ib s ceye" data-costeye="${esc(x.id)}" aria-label="${costMasked(x) ? "Mostrar" : "Ocultar"} el coste medio de ${esc(F(x.fid).t)}" title="${costMasked(x) ? "Mostrar" : "Ocultar"} el coste medio del puesto" aria-pressed="${!costMasked(x)}">${I(costMasked(x) ? "eye" : "eye-slash")}</button>${pxm2}</span><span class="xm"><span>${esc(F(x.fid).t)}${lvlName(x) ? " · " + lvlName(x) : ""}</span>${st}</span>${(() => { const ts = toolsOfPerson(x.id); return ts.length ? `<span class="xtools">${ts.map(toolChip).join("")}</span>` : ""; })()}</div>`;
  };
  const th = `<div class="tr th c4"><span>Nombre</span><span>Puesto y nivel</span><span>Estado</span><span class="cost">Coste al mes</span></div>`,
    tbl = (xs, title) =>
      `<div class="tbl pgrp ppl4">${title ? `<div class="pgh">${title}</div>` : ""}${th}${xs.map(row).join("")}</div>`;
  /* by area by default; the same people can also be read project by project */
  const pv = V.pview === "project" ? "project" : "area",
    viewSeg = `<div class="seg pz pvs" role="radiogroup" aria-label="Ver personas por"><button role="radio" data-pview="area" aria-checked="${pv === "area"}">Por área</button><button role="radio" data-pview="project" aria-checked="${pv === "project"}">Por proyecto</button></div>`,
    groups = (withTact) => {
      const sub = (xs, noCost, extra) => {
        const f = xs.filter((x) => isOpen(x.id)).length;
        return `<small>${xs.length} persona${xs.length !== 1 ? "s" : ""} · ${extra || (f ? `${f} libre${f !== 1 ? "s" : ""}` : "nadie libre")}${noCost ? "" : teamCost(xs)}</small>`;
      };
      if (pv === "project") {
        const ps = D.projects.filter((q) => !q.archived && (isLive(q) || ["draft", "changes", "pending", "approved"].includes(q.status))).sort((a, b) => Number(isLive(b)) - Number(isLive(a))),
          out = ps.map((q) => {
            const xs = ppl.filter((x) => q.roles.some((r) => (r.fill || []).some((f) => f.pid === x.id)));
            return xs.length ? tbl(xs, `<b>${esc(q.name)}</b>${sub(xs, true, isLive(q) ? "" : "propuesta sin aprobar")}`) : "";
          }),
          fr = ppl.filter((x) => isOpen(x.id));
        return out.join("") + (fr.length ? tbl(fr, `<b>Sin proyecto</b>${sub(fr, true)}`) : "");
      }
      /* teams the Responsable (or Dirección) created: their own group, before the areas; people placed in one leave their area group */
      const own = [],
        inOwn = (x) => own.includes(x.unit);
      return (
        own
          .map((t) => {
            const xs = ppl.filter((x) => x.unit === t);
            return xs.length
              ? tbl(xs, `<b>${esc(t)}</b>${sub(xs)}`)
              : `<div class="card tempty"><div class="tehd"><span><b>${esc(t)}</b><small>Equipo nuevo · aún sin personas</small></span></div><div class="tebody"><p>Añade a alguien de la empresa a este equipo.</p><button class="btn btn-s sm" data-addperson="${esc(meName())}||${esc(t)}">${I("plus")}Añadir persona</button></div></div>`;
          })
          .join("") +
        AREAS.map((t) => {
          const xs = ppl.filter((x) => areaOf(x) === t && !inOwn(x)).sort((a, b) => Number(isOpen(b.id)) - Number(isOpen(a.id)));
          return xs.length ? tbl(xs, `<b>${esc(t)}</b>${sub(xs)}`) : "";
        }).join("")
      );
    };
  if (!board) {
    /* a readable summary instead of a bare count: how many, how many free, who frees up next */
    const fr = ppl.filter((x) => isOpen(x.id)).length,
      nx = ppl.map((x) => avail(x)).filter((a) => a.n > 0 && a.n !== null).sort((a, b) => a.n - b.n),
      soon = nx.length ? nx.filter((a) => a.n === nx[0].n).length : 0;
    const tcount = {};
    ppl.forEach((x) => toolsOfPerson(x.id).forEach((t) => (tcount[t] = (tcount[t] || 0) + 1)));
    const tsum = Object.entries(tcount).sort((a, b) => toolSort(a[0], b[0])),
      tt = andList([...new Set(D.projects.filter((q) => q.owner === meName() && isLive(q) && !q.full).flatMap(teamTools))]),
      toolsLine = tsum.length || tt ? `<div class="tusage"><small>Programas de tu equipo</small><div>${tsum.map(([t, n]) => toolChip(t).replace("</span>", n > 1 ? ` <b>×${n}</b></span>` : "</span>")).join("")}</div></div>` : "";
    const sum = `<div class="sech tsum"><h2>Tu equipo</h2><p><b>${ppl.length} personas</b><span>${fr ? `${fr} libre${fr > 1 ? "s" : ""}` : "Nadie libre"}</span>${soon ? `<span>${soon} se libera${soon > 1 ? "n" : ""} en ${monthIn(nx[0].n)}</span>` : ""}</p></div>`;
    /* Personas is about people; the team's programs as a whole live in Software e IA (each person still shows theirs) */
    return `${head}${sum}${toolReqHTML("person")}${viewSeg}${groups(true)}`;
  }
  return `${head}${toolReqHTML("person")}${viewSeg}${groups(false)}`;
}
/* ===== Software e IA. Contracts are Dirección's: it sees what to do (seats to buy, unused seats before a renewal) and every tool with who holds its seats.
   A Responsable sees the tools of her team and whether her projects have their seats. ===== */
const licPrice = (l) => toEUR(l.opt, opt(l.opt).p);
const licMonthly = (l) => {
  const o = opt(l.opt);
  return o.unit === "plan" ? licPrice(l) : o.once ? (l.seats * licPrice(l)) / 12 : l.seats * licPrice(l);
};
const licDays = (l) => Math.max(0, Math.round((new Date(RENEW(l) + "T12:00") - new Date()) / DAY));
/* Ahorrado este año: only money that would otherwise have been spent.
   Free seats reused by projects approved this year (instead of buying new ones, for the project's months),
   and unused seats removed before a renewal this year (a year of those seats). Seats people already held are not a saving. */
function savings() {
  const y = new Date().getFullYear(),
    thisYear = (ts) => ts && new Date(ts).getFullYear() === y;
  let reuse = 0,
    reuseN = 0;
  D.projects
    .filter((p) => isLive(p) && p.review && thisYear(p.review.ts))
    .forEach((p) =>
      cost(p).tools.forEach((t) => {
        if (!t.pool || t.plan || opt(t.id).once) return;
        reuseN += t.pool;
        reuse += t.pool * toEUR(t.id, opt(t.id).p) * (p.months || 12);
      }),
    );
  const tr = (D.trims || []).filter((x) => thisYear(x.ts)),
    trim = tr.reduce((a, x) => a + x.n * toEUR(x.opt, opt(x.opt).p) * 12, 0),
    trimN = tr.reduce((a, x) => a + x.n, 0);
  return { total: reuse + trim, reuse, reuseN, trim, trimN };
}
/* seats that can go at a renewal: free and not reserved by an approved project that starts later */
const trimmable = (inv) => Math.max(0, inv.free - inv.reserved);
const shortDate = (d) => new Date(d + "T12:00").toLocaleDateString(LOC(), { month: "short", year: "numeric" }).replace(".", "");
const licWhere = (l) => (l.scope === "group" ? "Todo el grupo" : ENT(l.scope).name);
const firstNames = (ids, max = 3) => {
  const ns = ids.map((pid) => (PERSON(pid) || { name: "" }).name.split(" ")[0]).filter(Boolean);
  return ns.length <= max ? ns.join(", ").replace(/, ([^,]*)$/, " y $1") : `${ns.slice(0, max).join(", ")} y ${ns.length - max} más`;
};
/* tool requests: a Responsable asks for software nobody has contracted yet; Dirección decides */
const TREQ = { pending: ["Pendiente", "pend"], changes: ["Cambios pedidos", "pend"], approved: ["Aprobada", "active"], rejected: ["Rechazada", "rej"] };
/* who in my teams already holds this tool through a project of mine */
const reqName = (r) => (r.asg ? "Asignar: " + r.asg : r.kind === "person" ? "Contratar: " + ((F(r.fid) || {}).t || "persona") : (opt(r.opt) || {}).n || "Herramienta");
const trCost = (r) => {
  const o = opt(r.opt);
  if (!o || !(o.p > 0)) return "";
  const n = o.unit === "plan" ? 1 : Math.max(1, (r.who || "").split(",").filter((x) => x.trim()).length),
    m = toEUR(o.id, o.p) * n,
    f = (v) => (Math.abs(v - Math.round(v)) < 0.005 ? eur(v) : v.toFixed(2).replace(".", ",") + "\u00a0€");
  return `<span class="trcost"><b>${f(m)}<em>/mes</em></b><small>${n > 1 ? n + " personas · " : o.unit === "plan" ? "plan · " : "por persona · "}${eur(m * 12)}/año</small></span>`;
};
const editSnap = (d, amend) => {
  if (!d.editReq) return null;
  const it = amend ? D.projects.find((x) => x.id === d.editReq) : (D.toolReqs || []).find((x) => x.id === d.editReq);
  return it ? { amend, old: JSON.parse(JSON.stringify(it)), notes: D.notes.filter((n) => n.p === d.editReq) } : null;
};
const editUndo = (eo, newId) => {
  if (!eo) return;
  V.undo = { edit: true, amend: eo.amend, old: eo.old, notes: eo.notes, newId };
  V.toastAct = "Deshacer";
};
const trCostP = (r) => {
  const c = D.projects.find((q) => q.id === r.id);
  if (!c) return "";
  const k = cost(c);
  return k && k.monthly > 0 ? `<span class="trcost"><b>${eur(k.monthly)}<em>/mes</em></b><small>${c.months || 12} ${(c.months || 12) === 1 ? "mes" : "meses"} · ${eur(k.monthly * (c.months || 12))}</small></span>` : "";
};
const fmtShort = (iso) => new Date(iso + "T12:00:00").toLocaleDateString(LOC(), { day: "numeric", month: "short" }).replace(".", "");
const hasToolOpt = (pid, opt) => D.projects.some((q) => !q.archived && q.owner === meName() && q.roles.some((r) => r.tools && Object.values(r.tools).includes(opt) && (r.fill || []).some((f) => f && f.pid === pid)));
const toolReqPeople = (opt) => (D.people || []).filter((x) => x.team === meName()).map((x) => ({ x, has: !!opt && hasToolOpt(x.id, opt) }));
/* a hiring request for a project is an amendment inside that project; the Responsable reads it here as a request too */
const personReqs = (all) =>
  D.projects
    .filter((c) => c.parent && !c.full && (all || c.owner === meName()) && !c.archived && c.sentAt && c.roles.length === 1 && ["new", "mine"].includes(((c.roles[0].fill || [])[0] || {}).src))
    .map((c) => {
      const st = stOf(c),
        par = D.projects.find((q) => q.id === c.parent);
      return { id: c.id, kind: "person", why: (c.justif || "").trim(), fid: c.roles[0].id, asg: ((c.roles[0].fill || [])[0] || {}).src === "mine" ? (PERSON(c.roles[0].fill[0].pid) || {}).name || "persona" : "", by: c.owner, ts: c.sentAt, status: st === "rejected" ? "rejected" : ["approved", "active"].includes(st) ? "approved" : "pending", comment: (c.review && c.review.comment) || "", forName: "Para «" + (par ? par.name : "proyecto") + "»", remindedAt: c.remindedAt, amend: true, hid: c.hidReq || [] };
    });
function toolReqHTML(kind) {
  const b = isBoard(),
    all = b ? (kind === "person" ? [...(D.toolReqs || []).filter((r) => r.kind === "person"), ...personReqs(true)].sort((x, y) => y.ts - x.ts) : (D.toolReqs || []).filter((r) => r.kind !== "person")) : kind === "person" ? [...(D.toolReqs || []).filter((r) => r.kind === "person"), ...personReqs()].sort((x, y) => y.ts - x.ts) : (D.toolReqs || []).filter((r) => r.kind !== "person");
  const xs = all.filter((r) => !(r.hid || []).includes(noteViewer()) && (b ? r.status === "pending" || r.ts > Date.now() - 14 * 864e5 : r.by === meName())).slice(0, b ? 6 : 4);
  if (!xs.length) return "";
  const row = (r) => {
    return `<div class="treq clk" data-opentr="${r.id}"><div class="trm"><b><button class="tlink" data-opentr="${r.id}">${esc(reqName(r))}</button></b><small>${b ? esc(r.by) + " · " : ""}${esc(r.forName || "Para tu equipo")} · pedida el ${esc(fmtShort(new Date(r.ts).toISOString().slice(0, 10)))}</small></div>${r.amend ? trCostP(r) : r.kind !== "person" ? trCost(r) : ""}<span class="trr"><span class="pill ${TREQ[r.status][1]}">${TREQ[r.status][0]}</span>${r.status === "pending" ? `<span class="trmw"><button class="ib s" data-trmenu="${r.id}" aria-label="Más acciones de la petición" aria-haspopup="menu" aria-expanded="${V.menu === "tr:" + r.id}">${I("ellipsis")}</button>${V.menu === "tr:" + r.id ? `<div class="amenu trm2" role="menu"><button role="menuitem" data-opentr="${r.id}">${I("eye")}Ver petición</button>${b ? `<button role="menuitem" data-treq="${r.id}|ok">${I("check-circle")}Aprobar</button><button role="menuitem" class="danger" data-trrj="${r.id}">${I("times-circle")}Rechazar</button>` : `<button role="menuitem" data-tredit="${r.id}">${I("pen")}Editar</button>${r.remindedAt && Date.now() - r.remindedAt < 864e5 ? `<button role="menuitem" disabled data-tt="Ya has recordado a Dirección hoy. Podrás volver a hacerlo mañana.">${I("bell")}Recordar a Dirección</button>` : `<button role="menuitem" data-trremind="${r.id}">${I("bell")}Recordar a Dirección</button>`}<button role="menuitem" class="danger" data-trcancel="${r.id}">${I("times-circle")}Cancelar petición</button>`}</div>` : ""}</span>` : `<span class="trmw"><button class="ib s" data-trmenu="${r.id}" aria-label="Más acciones de la petición" aria-haspopup="menu" aria-expanded="${V.menu === "tr:" + r.id}">${I("ellipsis")}</button>${V.menu === "tr:" + r.id ? `<div class="amenu trm2" role="menu"><button role="menuitem" data-opentr="${r.id}">Ver petición</button><button role="menuitem" data-trhide="${r.id}">Quitar de la lista</button></div>` : ""}</span>`}</span>${r.comment && r.status === "rejected" ? `<section class="rvc hasic rejected" role="status"><i class="rvic" aria-hidden="true">${I("building")}</i><div class="rvx"><small class="rvl">Respuesta de Dirección</small><p>${esc(r.comment)}</p></div></section>` : ""}</div>`;
  };
  const np = xs.filter((r) => ["pending", "changes"].includes(r.status)).length,
    nres = xs.length - np;
  /* same pattern as the tables: one card, title and count inside it, a row per request */
  return `<section class="tbl pgrp treqs"><div class="pgh"><b>${b ? (kind === "person" ? "Peticiones de personas" : "Peticiones de herramientas") : "Tus peticiones"}</b><small>${xs.length} ${xs.length === 1 ? "petición" : "peticiones"}${np ? ` · ${np} pendiente${np !== 1 ? "s" : ""}` : ""}</small>${nres ? `<button class="lnk tsa" data-trclear="${kind}">Limpiar lista</button>` : ""}</div>${xs.map(row).join("")}</section>`;
}
function pageLicenses() {
  return isBoard() ? pageLicBoard() : pageLicTeam();
}
function pageLicBoard() {
  const vis = D.licenses.map((l, i) => ({ l, i, inv: seatInventory(l) })).filter(({ l }) => D.ent === "all" || l.scope === "group" || l.scope === D.ent);
  const head = `<div class="ph"><div><h1>Software e IA</h1></div>${vis.length ? `<button class="btn btn-p sm" data-addlic>Registrar licencia</button>` : ""}</div>`;
  if (!vis.length)
    return `${head}<div class="empty">${I("key-skeleton")}<b>Aún no hay licencias registradas</b><p>Registra las que ya tenéis contratadas (Figma, Jira…) o conéctalas para que se actualicen solas. HUMAIN contará primero con sus asientos libres al calcular el coste de un proyecto.</p><button class="btn btn-p sm" data-addlic>Registrar licencia</button></div>`;
  const seatLic = vis.filter(({ l }) => opt(l.opt).unit !== "plan" && !opt(l.opt).once),
    spend = vis.reduce((a, { l }) => a + licMonthly(l), 0),
    unused = seatLic.reduce((a, { inv }) => a + inv.free, 0),
    unusedE = seatLic.reduce((a, { l, inv }) => a + inv.free * licPrice(l), 0),
    cap = seatLic.reduce((a, { l }) => a + l.seats, 0),
    inUse = seatLic.reduce((a, { l, inv }) => a + Math.min(inv.used, l.seats), 0),
    sv = savings();
  const KTIP = {
    Gasto: "Lo que pagáis cada mes por todos los contratos de software e IA.",
    Aprovechamiento: "Asientos en uso entre asientos contratados. Los libres se usan primero en los proyectos nuevos, antes de comprar.",
    "Ahorrado este año": "Lo que no habéis tenido que comprar porque un proyecto usó asientos libres, más los asientos quitados antes de renovar. Contado a un año.",
  };
  const kpi = (l, v, t, tone, ic) => `<div class="lvkc ${tone}">${ic ? `<span class="lvkf" role="img" aria-label="${ic === "smile" ? "Bien" : ic === "meh" ? "Regular" : "Mal"}">${I(ic)}</span>` : ""}<span class="lvkl">${l}${KTIP[l] ? itip(KTIP[l]) : ""}</span><b>${v}</b><span>${t}</span></div>`;
  const svWhy = [sv.reuseN ? `${sv.reuseN} asiento${sv.reuseN !== 1 ? "s" : ""} libre${sv.reuseN !== 1 ? "s" : ""} reutilizado${sv.reuseN !== 1 ? "s" : ""}` : "", sv.trimN ? `${sv.trimN} quitado${sv.trimN !== 1 ? "s" : ""} antes de renovar` : ""].filter(Boolean).join(" · ");
  const kpis = `<div class="lvk">${kpi("Gasto", `${eur(spend)}<em>/mes</em>`, `${vis.length} contrato${vis.length !== 1 ? "s" : ""}`, "run", "")}${kpi("Aprovechamiento", `${cap ? Math.round((inUse / cap) * 100) : 0} %`, unused ? `${unused} asiento${unused !== 1 ? "s" : ""} sin usar · ${eur(unusedE)}/mes` : "Todos los asientos en uso", !cap || inUse / cap >= 0.85 ? "ok" : inUse / cap >= 0.6 ? "warn" : "bad", !cap || inUse / cap >= 0.85 ? "smile" : inUse / cap >= 0.6 ? "meh" : "frown")}${kpi("Ahorrado este año", eur(sv.total), svWhy || "Aún sin ahorro registrado", sv.total ? "ok" : "warn", sv.total ? "smile" : "meh")}</div>`;
  /* what to do: buy now, buy before a start date, trim before a renewal */
  const pnames = (ps) => ps.map((p) => `«${esc(p.name)}»`).join(", ").replace(/, ([^,]*)$/, " y $1");
  const acts = [];
  seatLic.forEach(({ l, i, inv }) => {
    const o = opt(l.opt),
      n = inv.missing + inv.later;
    if (inv.missing)
      acts.push([0, `<div class="lva"><p><b>Comprar ${inv.missing} asiento${inv.missing > 1 ? "s" : ""} de ${esc(o.n)}</b> · ${esc(licWhere(l))}<small>Para ${pnames(inv.ps.filter((p) => needOfOpt(p, l.opt) > 0))}, en curso. Hazlo en ${ADML(l.opt, l)}${SYNC(l.opt) ? "; HUMAIN lo verá en la próxima sincronización" : ""}.</small></p>${SYNC(l.opt) ? `<span class="pill draft lauto" role="status"><span class="lsy live" aria-hidden="true"></span>Sincronizando…</span>` : `<button class="btn btn-s sm" data-bought="${i}" aria-label="Ya está comprado">Ya lo he comprado</button>`}</div>`]);
    else if (inv.later) {
      const f = inv.fut[0];
      acts.push([1, `<div class="lva"><p><b>Comprar ${inv.later} asiento${inv.later > 1 ? "s" : ""} de ${esc(o.n)} antes de ${monthIn(Math.max(0, mIdx(f.start)))}</b> · ${esc(licWhere(l))}<small>Para ${pnames(inv.fut)}, que empieza en ${monthIn(Math.max(0, mIdx(f.start)))}. Hazlo en ${ADML(l.opt, l)}.</small></p>${SYNC(l.opt) ? `<span class="pill draft lauto" role="status"><span class="lsy live" aria-hidden="true"></span>Sincronizando…</span>` : `<button class="btn btn-s sm" data-bought="${i}" aria-label="Ya está comprado">Ya lo he comprado</button>`}</div>`]);
    }
    const dl = licDays(l);
    const tm = trimmable(inv);
    if (tm && !n && dl <= 120)
      acts.push([2, `<div class="lva"><p><b>Quitar ${tm} asiento${tm > 1 ? "s" : ""} de ${esc(o.n)} antes de renovar</b> · ${esc(licWhere(l))}<small>Renueva en ${dl} días y ${tm > 1 ? `hay ${tm} sin usar` : "hay 1 sin usar"}. Si no ${tm > 1 ? "los" : "lo"} vais a necesitar, quíta${tm > 1 ? "los" : "lo"} en ${ADML(l.opt, l)} y ahorra ${eur(tm * licPrice(l) * 12)} al año.</small></p>${SYNC(l.opt) ? `<span class="pill draft lauto" role="status"><span class="lsy live" aria-hidden="true"></span>Sincronizando…</span>` : `<button class="btn btn-s sm" data-trimmed="${i}" aria-label="Ya está quitado">Ya lo he quitado</button>`}</div>`]);
  });
  (D.people || []).filter((x) => x.leaving && x.leaving.tools && x.leaving.tools.length).forEach((x) => acts.push([3, `<div class="lva"><p><b>Quitar los asientos de ${esc(x.name)}</b> · se va el ${esc(fmtShort(x.leaving.date))}<small>Usaba ${x.leaving.tools.map((t) => esc((opt(t) || { n: t }).n)).join(", ").replace(/, ([^,]*)$/, " y $1")}. Si no los necesita otra persona, quítalos antes de renovar y ahorras ese coste.</small></p></div>`]));
  acts.sort((a, b) => a[0] - b[0]);
  const todo = `<section class="card lvc"><div class="ch"><h2>Qué hacer</h2></div>${acts.length ? acts.map((a) => a[1]).join("") : `<p class="note">Todo en orden: no falta ningún asiento y nada renueva pronto con asientos sin usar.</p>`}</section>`;
  /* one row per tool, all its contracts together */
  const groups = {};
  vis.forEach((x) => (groups[x.l.opt] = groups[x.l.opt] || []).push(x));
  const row = (oid) => {
    const xs = groups[oid],
      o = opt(oid),
      plan = o.unit === "plan" || o.once,
      cap = xs.reduce((a, x) => a + x.l.seats, 0),
      used = xs.reduce((a, x) => a + Math.min(x.inv.used, x.l.seats), 0),
      free = xs.reduce((a, x) => a + x.inv.free, 0),
      miss = xs.reduce((a, x) => a + x.inv.missing, 0),
      later = xs.reduce((a, x) => a + x.inv.later, 0),
      res = xs.reduce((a, x) => a + x.inv.reserved, 0),
      fut = xs.flatMap((x) => x.inv.fut).sort((a, b) => startKey(a).localeCompare(startKey(b)))[0],
      ren = xs.map((x) => RENEW(x.l)).sort()[0],
      open = V.lopen === oid,
      sub = xs.length > 1 || xs[0].l.scope !== "group"
          ? xs.map((x) => (x.l.scope === "group" ? "Grupo" : ENT(x.l.scope).country)).join(" · ")
          : "Todo el grupo";
    const mo = xs.reduce((a, x) => a + licMonthly(x.l), 0),
      dl = Math.min(...xs.map((x) => licDays(x.l))),
      fm = fut ? monthIn(Math.max(0, mIdx(fut.start))) : "",
      pct = (v) => Math.min(100, Math.round((v / Math.max(1, cap)) * 100));
    /* status: what needs Dirección, then the renewal date under it */
    const st = miss
      ? `<span class="pill pend" tabindex="0" title="Hay personas usando la herramienta sin asiento contratado. Cómpralo ya.">Falta ${miss}</span>`
      : later
        ? `<span class="pill pend" tabindex="0" title="Un proyecto aprobado los necesitará. Cómpralos antes de que empiece.">Por comprar</span>`
        : !plan && free && dl <= 120
          ? `<span class="pill draft" tabindex="0" title="Renueva en menos de 4 meses y tiene asientos sin usar: buen momento para quitarlos.">Renueva pronto</span>`
          : `<span class="pill active">Al día</span>`;
    const sub2 = miss && later ? `y ${later} antes de ${fm}` : later ? `${later} antes de ${fm}` : `Renueva ${dl <= 120 ? `en ${dl} días` : shortDate(ren)}`;
    /* the bar is the contract: full and red when people are left without a seat; seats reserved for approved projects that fit show light */
    const resIn = Math.max(0, res - later),
      bar = `<i class="lvb${miss ? " over" : later ? " soon" : ""}" aria-hidden="true"><i style="width:${pct(used)}%"></i></i>`,
      futs = [...new Map(xs.flatMap((x) => x.inv.fut).map((p) => [p.id, p])).values()];
    const use = plan
      ? `<span class="lvu"><span>${o.once ? "Compra puntual" : "Tarifa plana"}</span></span>`
      : `<span class="lvu"><span><b${miss ? ' class="neg"' : ""}>${used + miss}</b> de ${cap} en uso</span><span class="lvfree${miss ? " neg" : ""}">${miss ? `${miss} sin asiento` : free ? `${free} libre${free !== 1 ? "s" : ""}` : "Sin libres"}</span>${bar}${res ? `<small>${res} reservado${res > 1 ? "s" : ""} para ${pnames(futs)}, que empieza${futs.length > 1 ? "n" : ""} en ${fm}</small>` : ""}</span>`;
    /* the table stays short: the detail (seats, what to buy, sync, editing) opens in a sheet, like a person's */
    if (V.modal === "licd" && V.lsheet === oid)
      LSHEET = `<div class="shead"><div><h2 id="mt">${esc(o.n)}</h2><p class="shsub">${esc(sub || "")} · ${eur(mo)}/mes</p></div><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><div class="lsh0"><div class="lsh0s">${st}${/^Renueva/.test(sub2) ? "" : `<small>${sub2}</small>`}</div>${use}</div>${xs.map((l) => licDetail(l)).join("")}`;
    return `<div class="lvr"><button class="lvrow rl" data-lopen="${oid}" aria-haspopup="dialog"><span class="lvn"><b>${toolIc(oid)}${esc(o.n)}</b><small>${esc(sub || "")} · ${eur(mo)}/mes</small></span>${use}<span class="lvf">${st}<small>${sub2}</small></span>${I("angle-right")}</button></div>`;
  };
  const table = (ai, t) => {
    const ids = Object.keys(groups).filter((oid) => isAiTool(oid) === ai);
    const f = ids.reduce((a, oid) => a + groups[oid].reduce((b, x) => b + x.inv.free, 0), 0),
      mo = ids.reduce((a, oid) => a + groups[oid].reduce((b, x) => b + licMonthly(x.l), 0), 0);
    return ids.length ? `<section class="tbl pgrp lvc lvtab"><div class="pgh"><b>${t}</b><small>${ids.length} herramienta${ids.length > 1 ? "s" : ""} · ${eur(mo)}/mes · ${f} asiento${f !== 1 ? "s" : ""} libre${f !== 1 ? "s" : ""}</small></div><div class="lvh"><span>Herramienta</span><span>Uso</span><span>Estado</span><span></span></div>${ids.map(row).join("")}</section>` : "";
  };
  const allNote = (() => { const ts = [pick("pm"), pick("chat")].filter((x) => x && opt(x)).map((x) => opt(x).n); return ts.length ? `<p class="swall">${esc(andList(ts))} van para todo el equipo de cada proyecto, así que no se eligen por persona.</p>` : ""; })();
  /* order: the numbers first, then what to act on (requests, then «Qué hacer»), then the inventory */
  return `${head}${kpis}${toolReqHTML("tool")}${todo}${table(false, "Software")}${table(true, "IA")}${allNote}`;
}
/* one contract of a tool: who holds its seats, which projects add seats, its terms and the manual data */
let LSHEET = "";
function licDetail({ l, i, inv }) {
  const o = opt(l.opt),
    plan = o.unit === "plan" || o.once,
    hs = l.holders || [],
    byTeam = {};
  hs.forEach((pid) => {
    const x = PERSON(pid);
    if (x) (byTeam[x.team] = byTeam[x.team] || []).push(pid);
  });
  const ft = isFig(l.opt) ? hs.reduce((a, pid) => ((a[figType({ id: (PERSON(pid) || {}).fid })] = (a[figType({ id: (PERSON(pid) || {}).fid })] || 0) + 1), a), {}) : null;
  const who = hs.length
    ? Object.entries(byTeam)
        .map(([tm, ids]) => `<li><span>${esc(teamName(tm))}</span>${esc(firstNames(ids, 6))}</li>`)
        .join("")
    : "";
  const projs = [
    ...inv.ps.map((p) => `<li><span>«${esc(p.name)}»</span>${needOfOpt(p, l.opt)} asiento${needOfOpt(p, l.opt) > 1 ? "s" : ""} para personas que no lo tenían · en curso</li>`),
    ...inv.fut.map((p) => `<li><span>«${esc(p.name)}»</span>${needOfOpt(p, l.opt)} reservado${needOfOpt(p, l.opt) > 1 ? "s" : ""} · desde ${monthIn(Math.max(0, mIdx(p.start)))}</li>`),
  ].join("");
  const rn = new Date(RENEW(l) + "T12:00").toLocaleDateString(LOC(), { day: "numeric", month: "long", year: "numeric" });
  const edit =
    V.ledit === i
      ? `<div class="ledit">${plan ? "" : `<div class="lctr"><div><span>Asientos contratados</span><small>Según tu contrato con el proveedor</small></div>${stp(`seats="${i}"`, (V.ldraft || l).seats, 0, CAP[l.opt] ? CAP[l.opt][0] : 9999, "asientos")}</div><div class="lctr"><div><span>Asientos fuera de HUMAIN</span><small>Personas ${l.scope === "group" ? "del grupo" : "de " + esc(ENT(l.scope).name)} con asiento que no están en HUMAIN</small></div>${stp(`lother="${i}"`, (V.ldraft || l).other, 0, 999, "asientos fuera de HUMAIN")}</div>`}<div class="lctr"><label for="lren-${i}"><span>${o.once ? "Caduca el" : "Renovación"}</span><small>Fecha en la que se renueva o caduca el contrato</small></label><input id="lren-${i}" class="big md" type="date" data-lren value="${esc((V.ldraft || l).renew || RENEW(l))}"/></div>${ADMU(l.opt) ? "" : `<div class="lctr ladm"><label for="ladm-${i}"><span>Enlace al panel del proveedor</span><small>Opcional. ${plan ? "Así podrás abrirlo desde aquí" : "Así «Comprar» y «Quitar» llevan directamente a él"}</small></label><input id="ladm-${i}" class="big md" type="url" inputmode="url" data-ladm placeholder="https://tuempresa.testrail.io" value="${esc((V.ldraft || l).admin || "")}"/></div>`}<p class="lnote lsnote">${I("info-circle")}<span>Esto solo actualiza los datos en HUMAIN. ${plan ? "Para cambiar el plan" : "Para comprar o quitar asientos"}, hazlo en ${ADML(l.opt, l)}.</span></p><div class="lsave"><button class="btn btn-s sm" data-lcancel>Cancelar</button><button class="btn btn-p sm" data-lsave="${i}">Guardar</button></div></div>`
      : "";
  /* the contract read as a sum: where each seat goes, so the number in the header adds up */
  const many = D.licenses.filter((y) => y.opt === l.opt).length > 1,
    rowL = (t, sub, v, cls = "") => `<div class="lsr${cls}"><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ""}</span><em>${v}</em></div>`,
    ftTxt = (ids) => (ft ? " · " + Object.entries(ids.reduce((a, pid) => ((a[figType({ id: (PERSON(pid) || {}).fid })] = (a[figType({ id: (PERSON(pid) || {}).fid })] || 0) + 1), a), {})).map(([t, k]) => `asiento ${FIGT[t][0]}${k > 1 ? " ×" + k : ""}`).join(", ") : ""),
    seatRows = [
      ...Object.entries(byTeam).map(([tm, ids]) => rowL(esc(teamName(tm)), esc(firstNames(ids, 6)) + ftTxt(ids), ids.length)),
      l.other ? rowL("Fuera de HUMAIN", "Personas de la empresa que usan la herramienta pero no están dadas de alta aquí", l.other) : "",
      ...inv.ps.filter((p) => needOfOpt(p, l.opt) > 0).map((p) => rowL(`«${esc(p.name)}»`, "Proyecto en curso · para quien aún no tenía asiento", needOfOpt(p, l.opt))),
      rowL("Libres", inv.later ? `${inv.fut.map((p) => `«${esc(p.name)}»`).join(" y ")} necesitará${inv.fut.length > 1 ? "n" : ""} ${inv.fut.reduce((a, p) => a + needOfOpt(p, l.opt), 0)} en ${monthIn(Math.max(0, mIdx(inv.fut[0].start)))}: ${inv.free ? `con ${inv.free === 1 ? "el libre" : "los " + inv.free + " libres"} no llega, ` : ""}faltan ${inv.later}` : inv.fut.length ? inv.fut.map((p) => `${needOfOpt(p, l.opt)} se reservará${needOfOpt(p, l.opt) > 1 ? "n" : ""} para «${esc(p.name)}», que empieza en ${monthIn(Math.max(0, mIdx(p.start)))}`).join("; ") : inv.free ? "Se pueden dar a otra persona o quitar al renovar" : "No queda ninguno", inv.free),
    ].join(""),
    planRows = inv.ps.concat(inv.fut).map((p) => rowL(`«${esc(p.name)}»`, isLive(p) ? "En curso" : "Empieza en " + monthIn(Math.max(0, mIdx(p.start))), "")).join("");
  return `<div class="lvx lvx2"><p class="lvxh2">${many ? `<b>${esc(licWhere(l))}</b> · ` : ""}${o.once ? "Compra puntual · caduca el " + rn : plan ? "Tarifa plana · renueva el " + rn : `Contrato anual de ${l.seats} asientos · renueva el ${rn}`}${many ? ` · ${eur(licMonthly(l))}/mes` : ""}</p>${
    plan
      ? `<h3 class="lsh">Proyectos que la usan</h3>${planRows || `<p class="note">Ningún proyecto la usa ahora.</p>`}`
      : `<h3 class="lsh">${inv.missing ? `Quién la usa · ${l.seats + inv.missing} personas para ${l.seats} asientos` : `En qué se usan los ${l.seats} asientos`}</h3>${seatRows}`
  }${
    !plan && (inv.missing || inv.later)
      ? (() => {
          const u = l.admin || ADMU(l.opt),
            k = inv.missing || inv.later,
            ps = (inv.missing ? inv.ps.filter((p) => needOfOpt(p, l.opt) > 0) : inv.fut).map((p) => `«${esc(p.name)}»`).join(", ");
          return `<div class="lbuy"><div><b>${inv.missing ? `Falta${k > 1 ? "n" : ""} ${k} asiento${k > 1 ? "s" : ""} de ${esc(o.n)}` : `Hay que comprar ${k} asiento${k > 1 ? "s" : ""} antes de que empiece${inv.fut.length > 1 ? "n" : ""} ${ps}`}</b><small>${inv.missing ? `Para ${ps}, en curso.` : "Compra anticipada para que estén listos a tiempo."}${SYNC(l.opt) ? " Cuando lo compres, HUMAIN lo verá en la próxima sincronización." : ""}</small></div><div class="lbacts">${u ? `<a class="btn btn-p sm" href="${esc(u)}" target="_blank" rel="noopener">Comprar en ${ADM(l.opt)}${I("external-link-alt")}<span class="sr"> (se abre en una pestaña nueva)</span></a>` : ""}${SYNC(l.opt) ? "" : `<button class="btn btn-s sm" data-bought="${i}">Ya lo he comprado</button>`}</div></div>`;
        })()
      : ""
  }<div class="lfoot">${SYNC(l.opt) ? `<span class="lsync">${I("check-circle")}Sincronizado con ${esc(o.n.split(" ")[0])} ${rel(l.synced || Date.now())}</span>` : ""}${SYNC(l.opt) || V.ledit === i ? "" : `<div class="lman"><p><span><b>Datos introducidos a mano.</b> ${!plan && INTGOF(l.opt) ? `Si conectas ${esc(INTGOF(l.opt))}, se actualizan solos.` : "Actualízalos cuando cambie el contrato."}</span></p><div class="lmacts">${!plan && INTGOF(l.opt) ? `<button class="btn btn-s sm" data-intg="${esc(INTGOF(l.opt))}">${I("link")}Conectar ${esc(INTGOF(l.opt))}</button>` : ""}<button class="${!plan && INTGOF(l.opt) ? "lnk" : "btn btn-s sm"}" data-ledit="${i}">${I("pen")}${plan ? (l.admin || ADMU(l.opt) ? "Editar" : "Añadir enlace al panel") : "Actualizar a mano"}</button>${l.admin || ADMU(l.opt) ? `<a class="lnk" href="${esc(l.admin || ADMU(l.opt))}" target="_blank" rel="noopener">${I("external-link-alt")}Abrir ${ADM(l.opt)}<span class="sr"> (se abre en una pestaña nueva)</span></a>` : ""}</div></div>`}</div>${edit}</div>`;
}
/* Responsable: the tools of her team, who has them, and whether her projects have their seats */
function pageLicTeam() {
  const team = visPeople().map((x) => x.id),
    mine = D.projects.filter((p) => p.owner === meName() && !p.archived && stOf(p) !== "done" && p.status !== "rejected" && p.status !== "cancelled"),
    ids = new Set();
  D.licenses.forEach((l) => (l.holders || []).some((pid) => team.includes(pid)) && ids.add(l.opt));
  mine.forEach((p) => Object.keys(projNeed(p).need).forEach((oid) => ids.add(oid)));
  /* what this page is for (Responsable): the tools of her team, asking for one, and following what she asked. Contracts are Dirección's */
  const head = `<div class="ph"><div><h1>Software e IA</h1></div><button class="btn btn-p sm" data-toolreq>Pedir una herramienta</button></div><p class="sub">Qué programas e IA tiene tu equipo, si tus proyectos tienen sus asientos y lo que has pedido. Los contratos y las compras los gestiona Dirección.</p>${toolReqHTML("tool")}`;
  if (!ids.size) return `${head}<div class="empty">${I("key-skeleton")}<b>Aún no hay herramientas</b><p>Cuando Dirección añada las licencias que ya paga la empresa, verás aquí quién de tu equipo tiene cada una.</p></div>`;
  const row = (oid) => {
    const o = opt(oid),
      ls = D.licenses.filter((l) => l.opt === oid),
      have = [...new Set(ls.flatMap((l) => l.holders || []))].filter((pid) => team.includes(pid)),
      uses = (p) => (projNeed(p).need[oid] || 0) > 0,
      live = mine.filter((p) => isLive(p) && uses(p)),
      props = mine.filter((p) => !isLive(p) && uses(p)),
      short = ls.map((l) => [l, seatInventory(l)]).filter(([l, inv]) => (inv.missing && inv.ps.some((p) => live.includes(p))) || (inv.later && inv.fut.some((p) => live.includes(p)))),
      freeAll = ls.reduce((a, l) => a + seatInventory(l).free, 0),
      plan = o.unit === "plan" || o.once;
    const waitP = live.filter((p) => short.some(([, inv]) => inv.ps.includes(p) || inv.fut.includes(p)));
    /* a tag only when it says something (missing or covered), the detail under it */
    const [tag, note] = short.length
      ? [`<span class="pill pend">Por comprar</span>`, `${waitP.map((p) => esc(p.name)).join(" y ")} · Dirección ya está avisada`]
      : live.length
        ? [`<span class="pill active">Cubierto</span>`, `Para ${live.map((p) => esc(p.name)).join(" y ")}`]
        : props.length
          ? (() => {
              const add = props.reduce((a, p) => a + needOfOpt(p, oid), 0);
              const pend = props.some((p) => p.status === "pending");
              return [`<span class="pill ${pend ? "pend" : "draft"}">${pend ? "Pendiente" : "En borrador"}</span>`, `La pide ${props.map((p) => `«${esc(p.name)}»`).join(" y ")}, sin aprobar · ${plan ? (o.once ? "compra puntual" : "tarifa plana") : !add ? "tu equipo ya la tiene" : !ls.length ? "la empresa aún no la tiene" : freeAll ? `${freeAll} libre${freeAll > 1 ? "s" : ""} en la empresa` : `${add} asiento${add > 1 ? "s" : ""} nuevo${add > 1 ? "s" : ""}`}`];
            })()
          : [`<span class="pill draft">Sin uso</span>`, "Ninguno de tus proyectos la usa ahora"];
    return `<div class="lvtr"><span class="lvn"><b>${toolIc(o.id)}${esc(o.n)}</b><small class="lvcat">${esc(TC[catOfOpt(oid)].n)}</small></span><span class="lvw">${have.length && have.length <= 2 ? `<span class="lvwb lvst"><span class="avg" aria-hidden="true">${have.map((pid) => `<i>${esc(initials(PERSON(pid).name))}</i>`).join("")}</span><span class="avn">${have.length === 1 ? esc(PERSON(have[0]).name) : esc(firstNames(have, 2))}</span></span>` : have.length ? `<button type="button" class="lvwb" data-lvopen="${esc(oid)}" aria-expanded="${V.lvopen === oid}"><span class="avg" aria-hidden="true">${have.slice(0, 3).map((pid) => `<i>${esc(initials(PERSON(pid).name))}</i>`).join("")}${have.length > 3 ? `<i>+${have.length - 3}</i>` : ""}</span><span class="avn">${have.length <= 2 ? esc(firstNames(have, 2)) : `${have.length} personas`}</span>${I("angle-down")}</button>${V.lvopen === oid ? `<ul class="lvwl">${have.map((pid) => `<li><b>${esc(PERSON(pid).name)}</b><small>${esc(F(PERSON(pid).fid).t)}</small></li>`).join("")}</ul>` : ""}` : `<small>Nadie de tu equipo</small>`}</span><span class="lvp">${tag}</span><small class="lvq">${note}</small></div>`;
  };
  const list = [...ids].sort((a, b) => opt(a).n.localeCompare(opt(b).n)),
    tcm = (k) => {
      if (!isBoard()) return "";
      const open = V.menu === "tc:" + k;
      return `<div class="pmw tact"><button class="ib" data-tcmenu="${k}" aria-label="Acciones de ${esc(TC[k].n)}" aria-haspopup="menu" aria-expanded="${open}">${I("ellipsis")}</button>${open ? `<div class="amenu pm" role="menu"></div>` : ""}</div>`;
    },
    group = (ai, t) => {
      const xs = list.filter((oid) => isAiTool(oid) === ai);
      const nb = xs.filter((oid) => row(oid).includes("Por comprar")).length,
        cats = Object.keys(TC).filter((k) => !!TC[k].ai === ai && (TC[k].opts || []).some((o) => o.p > 0) || xs.some((oid) => catOfOpt(oid) === k));
      if (!cats.length) return "";
      /* categories with nothing yet go last */
      cats.sort((p, q) => Number(!xs.some((oid) => catOfOpt(oid) === p)) - Number(!xs.some((oid) => catOfOpt(oid) === q)));
      const empty = cats.filter((k) => !xs.some((oid) => catOfOpt(oid) === k));
      if (!xs.length) return "";
      /* one card per kind, like Personas: the header says what it is and how many, the category goes under each tool */
      const ord = (oid) => cats.indexOf(catOfOpt(oid));
      return `<section class="tbl pgrp lvc lvtab"><div class="pgh"><b>${t}</b><small>${xs.length} herramienta${xs.length !== 1 ? "s" : ""}${nb ? ` · ${nb} por comprar` : ""}</small></div><div class="lvh lvh4"><span>Herramienta</span><span>Tienen asiento en tu equipo</span><span>Estado</span><span>Tus proyectos</span></div>${[...xs].sort((a, b) => ord(a) - ord(b) || opt(a).n.localeCompare(opt(b).n)).map(row).join("")}</section>`;
    };
  return `${head}${group(false, "Software")}${group(true, "IA")}`;
}
const INTG = [
  [
    "Licencias",
    "Lee asientos, uso y renovaciones",
    [
      ["Figma", "on"],
      ["Jira", "on"],
      ["Adobe Admin Console", ""],
      ["Google Workspace", ""],
      ["Microsoft 365", ""],
      ["Claude Team", ""],
      ["ChatGPT Business", ""],
      ["GitHub", ""],
      ["HubSpot", ""],
    ],
  ],
  [
    "Personas y sueldos",
    "Lee puestos, niveles y bandas salariales",
    [
      ["Deel", ""],
      ["Factorial", ""],
      ["Personio", ""],
    ],
  ],
  [
    "Avisos",
    "Recibe tus tareas pendientes donde trabajas",
    [
      ["Slack", ""],
      ["Microsoft Teams", ""],
    ],
  ],
  [
    "Asistentes de IA",
    "Pregunta a HUMAIN desde tu asistente",
    [
      ["Claude", "soon"],
      ["ChatGPT", "soon"],
    ],
  ],
];
const intChip = ([n, st]) => {
  const mine = !!(D.intg || {})[n];
  if (st === "soon") return `<span class="ichip soon" aria-disabled="true">${n}</span>`;
  if (st === "on") return `<span class="ichip on" tabindex="0" title="Sincronizado hace 2 h">${I("check-circle")}${n} · Conectado</span>`;
  if (mine) {
    const open = V.menu === "im:" + n;
    return `<span class="ichipw"><button class="ichip on" data-imenu="${n}" aria-haspopup="menu" aria-expanded="${open}">${I("check-circle")}${n} · Conectado</button>${open ? `<div class="amenu pm" role="menu"><button role="menuitem" class="danger" data-intgoff="${n}"><span>Desconectar</span></button></div>` : ""}</span>`;
  }
  return `<button class="ichip" data-intg="${n}">${n}<em>Conectar</em></button>`;
};
const intGroup = (g, xs) => {
  const on = (x) => x[1] === "on" || (x[1] !== "soon" && !!(D.intg || {})[x[0]]);
  const sorted = [...xs.filter(on), ...xs.filter((x) => !on(x))];
  const open = !!(V.intMore || {})[g],
    shown = sorted.length > 4 && !open ? sorted.slice(0, 4) : sorted;
  return `<div class="ichips">${shown.map(intChip).join("")}</div>${sorted.length > 4 ? `<button class="lnk imore" data-intmore="${esc(g)}" aria-expanded="${open}">${open ? `Ver menos${I("angle-up")}` : `Ver ${sorted.length - 4} más${I("angle-down")}`}</button>` : ""}`;
};
const emailErr = (v, d) =>
  !v ? "Escribe un correo" : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Escribe un correo válido, por ejemplo lucia@empresa.com" : D.users.some((u) => u[0].toLowerCase() === v.toLowerCase()) ? "Esa persona ya tiene acceso" : "";
const emailOk = (v, d) => !emailErr(v, d);
const ROLES = ["Administrador global", "Admin. de empresa", "Responsable de proyecto", "Solo lectura"];
const roleKey = (r) => (/^Administradora global$/.test(r) ? "Administrador global" : r);
const isMe = (u) => u[0] === ME().name;
const userRow = (u, i) => {
  const [n, r, s, pend] = u,
    me = isMe(u),
    open = V.menu === "um:" + i;
  const menu = me
    ? ""
    : `<div class="pmw rmw"><button class="ib s" data-umenu="${i}" aria-label="Más acciones de ${esc(n)}" title="Más acciones" aria-haspopup="menu" aria-expanded="${open}">${I("ellipsis-h")}</button>${open ? `<div class="amenu pm" role="menu">${pend ? `<button role="menuitem" data-uresend="${i}"><span>Reenviar invitación</span></button>` : ""}<button role="menuitem" data-uedit="${i}"><span>Cambiar rol</span></button><button role="menuitem" class="danger" data-udel="${i}"><span>${pend ? "Cancelar invitación" : "Quitar acceso"}</span></button></div>` : ""}</div>`;
  return `<div class="line uline"><span class="av sm" aria-hidden="true">${esc(initials(n.includes("@") ? n.split("@")[0].replace(/[._-]/g, " ") : n))}</span><span class="un"><b>${esc(n)}</b>${me ? "<small class=\"me\">Tú</small>" : ""}${pend ? '<em class="pill pend ualert">Pendiente</em>' : ""}<small class="us">${esc(s)}</small></span><span class="pill ur">${esc(roleKey(r))}</span><span class="um">${menu}</span></div>`;
};
const HUMAIN_SEAT = 29;
function pageSettings() {
  return `<div class="ph"><div><div class="step">${esc(D.org)}</div><h1>Ajustes</h1></div></div>
 ${isBoard() ? `<div class="rcard"><div class="rh"><h2>Marca de la empresa</h2></div><div class="line"><span style="display:flex;gap:12px;align-items:center"><button class="wsav lg lgbtn" data-logoup aria-label="Cambiar logo">${
   D.logo ? `<img src="${esc(D.logo)}" alt="Logo actual"/>` : esc(initials(D.org))
 }</button><span>Logo<small>PNG o SVG cuadrado</small></span></span><span class="logoact"><button class="btn btn-s" data-logoup>${D.logo ? "Cambiar" : "Subir logo"}</button><button class="ib s ibsec" ${D.logo ? "data-logodel" : "disabled"} aria-label="Quitar logo" title="${D.logo ? "Quitar logo" : "No hay logo que quitar"}">${I("trash-alt")}</button></span></div><input id="lgf" type="file" accept="image/*" hidden/></div>` : ""}
 ${isBoard() ? `<div class="rcard"><div class="rh"><h2>Empresas</h2><button class="ib s" data-addent aria-label="Añadir empresa">${I("plus")}</button></div>${D.entities
   .map((e) => {
     const n = D.projects.filter((p) => p.ent === e.id).length,
       why = n
         ? `No se puede eliminar: tiene ${n} proyecto${n !== 1 ? "s" : ""}`
         : D.entities.length < 2
           ? "Necesitas al menos una empresa"
           : "";
     return `<div class="line"><span>${esc(e.name)}<small>${esc(e.country)} · ${esc(e.vat)}</small>${why ? `<small class="why2">${why}</small>` : ""}</span><span class="eact">${n ? "" : `<span class="pill">0 proyectos</span>`}<button class="ib s" ${why ? "disabled" : `data-delent="${e.id}"`} aria-label="Eliminar ${esc(e.name)}" title="${why || "Eliminar empresa"}">${I("trash-alt")}</button></span></div>`;
   })
   .join("")}${D.entities.length === 1 ? '<p class="note">Con una sola empresa no se muestra el selector de empresa.</p>' : ""}</div>` : ""}
 ${!isBoard() ? `<div class="rcard"><div class="rh"><h2>IA en los proyectos</h2></div><div class="line"><span>${(D.freeAI || "company") === "company" ? "Se usa la IA de la empresa" : "Cada persona usa su propia IA"}<small>${(D.freeAI || "company") === "company" ? "Los asientos de IA cuentan como coste del proyecto." : "La pagan dentro de su tarifa: no se suma licencia de IA."} Lo decide Dirección; si alguien de tu equipo necesita una IA, pídela en Software e IA.</small></span></div></div>` : ""}
 ${isBoard() ? `<div class="rcard"><div class="rh"><h2>IA en los proyectos</h2></div>${seg(
   "Qué IA usan en los proyectos",
   "freeai",
   0,
   [["company", "La de la empresa", isBoard() ? "" : "Lo decide Dirección"], ["own", "Su propia IA", isBoard() ? "" : "Lo decide Dirección"]],
   D.freeAI || "company",
   (D.freeAI || "company") === "company" ? "Usan vuestras cuentas: los datos quedan en la empresa y su asiento cuenta como coste del proyecto. Se aplica a los borradores y a las propuestas nuevas." : "Usan su propia cuenta y la pagan dentro de su tarifa: no se suma licencia de IA. Se aplica a los borradores y a las propuestas nuevas.",
 )}</div>` : ""}
 ${isBoard() ? `<div class="rcard"><div class="rh"><h2>Integraciones</h2></div>${INTG.map(
   ([g, d, xs]) =>
     `<div class="igr"><div class="igh2"><b>${g}${xs.every((x) => x[1] === "soon") ? '<em class="soonlbl">Próximamente</em>' : ""}</b><small>${d}</small></div>${intGroup(g, xs)}</div>`,
 ).join("")}</div>` : ""}
 ${isBoard() ? `<div class="rcard ucard"><div class="rh"><h2>Usuarios y permisos</h2><button class="btn btn-s sm" data-invite aria-label="Invitar a alguien">Invitar</button></div>${D.users.map(userRow).join("")}</div>` : ""}
 ${isBoard() ? `<div class="rcard"><div class="rh"><h2>Tu suscripción a HUMAIN</h2></div>${(() => {
   /* one plan: per user with access, billed monthly on the 1st */
   const n = Math.max(1, D.users.length),
     nx = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString(LOC(), { day: "numeric", month: "long" });
   return `<div class="line"><span>HUMAIN<small>${eur(HUMAIN_SEAT)} por usuario al mes · ${n} usuario${n !== 1 ? "s" : ""} · próxima factura el ${nx}</small></span><span class="rc">${eur(HUMAIN_SEAT * n)}<small>/mes</small></span></div>`;
 })()}</div>` : ""}
  ${ratesCard()}
  ${isBoard() ? `<div class="rcard"><div class="rh"><h2>Datos de la cuenta</h2></div><div class="line"><span>Borrar todos los datos<small>Borra proyectos, personas, licencias y ajustes de toda la empresa. No se puede deshacer.</small></span><button class="btn btn-del wide sm" data-fresh>Borrar todo</button></div></div>` : ""}
  ${sourcesCard()}`;
}
function sourcesCard() {
  const L = (x) =>
    `<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)}${I("external-link-alt")}<span class="sr"> (se abre en una pestaña nueva)</span></a>`;
  /* references at the end of Ajustes, folded: they back the figures but are rarely read */
  const open = !!V.srcOpen,
    n = (sourcesCard.n = sourcesCard.n || 15);
  if (!open) return `<div class="rcard srcs"><button class="rh srch" data-srcs aria-expanded="false"><span class="srt"><h2>Fuentes de las referencias</h2><small>De dónde salen los sueldos, los factores y los precios</small></span>${I("angle-down")}</button></div>`;
  return `<div class="rcard srcs"><button class="rh srch" data-srcs aria-expanded="true"><span class="srt"><h2>Fuentes de las referencias</h2><small>De dónde salen los sueldos, los factores y los precios</small></span>${I("angle-up")}</button>
  <div class="line"><span>${L(MP)}<small>Sueldos brutos de España por años de experiencia: producto, diseño gráfico, desarrollo, datos, QA y marketing · 2026</small></span></div>
  <div class="line"><span>${L(LHH)}<small>Guía salarial de España (fijo bruto anual): diseño UX/UI, desarrollo, datos, QA y marketing · 2026</small></span></div>
  <div class="line"><span>${L(EUROSTAT)}<small>Factor por país en la UE: coste laboral por hora del sector información y comunicaciones frente a España · 2025 (Países Bajos, 2024: su dato de 2025 es confidencial)</small></span></div>
  <div class="line"><span>${L(ONS)}<small>Factor de Reino Unido: remuneración por hora trabajada en información y comunicaciones, 2025, pasada a euros con la media del BCE de ese año (${L(GBPREF)}). Comparación orientativa: medida parecida a la de Eurostat, no idéntica</small></span></div>
  <div class="line"><span>${L(BLS)}<small>Factor de Estados Unidos: coste del empleador por hora en el sector Information · 2.º trimestre de 2026</small></span></div>
  <div class="line"><span>${L(MALT_SRC)}<small>Tarifas diarias freelance en España por perfil y años de experiencia · 2026</small></span></div>
  <div class="line"><span>${L(HPM_SRC)}<small>Jornada: 1.800 horas al año (150 al mes) · 2025-2027</small></span></div>
  <div class="line"><span>${L({ n: "Levels.fyi", u: "https://www.levels.fyi/t/software-engineer" })}<small>Latinoamérica: mediana de ingeniería de software frente a España (estimación: no hay estadística oficial comparable) · noviembre de 2026</small></span></div>
  <div class="line"><span>Precios de licencias<small>Web oficial de cada proveedor, con pago anual salvo que se indique, consultada el 14/11/2026. Por ejemplo, ${[
    ["Canva", "https://www.canva.com/es_es/precios/"],
    ["Jira", "https://www.atlassian.com/en/software/jira/pricing"],
    ["Maze", "https://maze.co/pricing/"],
    ["HubSpot", "https://www.hubspot.com/pricing/sales?currencyCode=EUR"],
    ["Figma", "https://www.figma.com/es-es/pricing/"],
    ["Adobe Stock", "https://stock.adobe.com/es/Plans"],
    ["Shutterstock", "https://www.shutterstock.com/es/pricing"],
  ]
    .map(([n, u]) => L({ n, u }))
    .join(", ").replace(/, ([^,]*)$/, " y $1")}.</small></span></div>
  <div class="line"><span>${L(ONCOST)}<small>Seguridad Social a cargo de la empresa en España: ${f2(ONCOST.base * 100)} % sobre el bruto (contrato indefinido) · 2026</small></span></div>
  <div class="line"><span>${L(ATEP)}<small>Accidentes de trabajo y enfermedades profesionales para programación y consultoría informática (CNAE 62): ${f2(ATEP.rate * 100)} % (0,80 % IT + 0,70 % IMS) · 2026</small></span></div>
  <div class="line"><span>${L(FXREF)}<small>Tipo de cambio usado para México: ${esc(FXREF.d)}</small></span></div>
  <div class="line"><span>${L(MANFRED)}<small>Niveles Staff y Principal: proporción frente a Senior en cinco tecnológicas grandes de España · 2025</small></span></div>
  <p class="note">Se marca como estimación lo que no tiene una fuente completa: liderazgo, niveles Staff y Principal, Latinoamérica, QA freelance, trabajo en remoto y la mejora con IA en datos.</p></div>`;
}
/* HR tools that hold the company's pay bands; connecting one fills «Tarifas de la empresa» */
const HRTOOLS = ["Deel", "Factorial", "Personio"],
  isHR = (n) => HRTOOLS.includes(n),
  hrOn = () => HRTOOLS.find((n) => (D.intg || {})[n]);
/* the company's monthly cost per role and level as the HR tool has it: the midpoint of its band, near the market */
function rateRows() {
  const seen = new Map();
  D.projects
    .filter((p) => !p.archived)
    .forEach((p) =>
      p.roles.forEach((r) => {
        if (r.ct === "own") return;
        const k = rateKey(r);
        if (!seen.has(k)) seen.set(k, { id: r.id, grade: gradeOf(r), n: new Set() });
        seen.get(k).n.add(p.id);
      }),
    );
  return [...seen.entries()].sort((a, b) => F(a[1].id).t.localeCompare(F(b[1].id).t));
}
function importRates(by) {
  let n = 0;
  rateRows().forEach(([k, x]) => {
    const rb = refBreak({ id: x.id, grade: x.grade }, "España", "emp");
    if (!rb || !rb.v) return;
    const f = 0.93 + (hashStr(by + k) % 15) / 100; /* bands sit between 7 % below and 7 % above the market */
    D.rates[k] = Math.round((rb.v * f) / 10) * 10;
    n++;
  });
  D.ratesSrc = { by, ts: Date.now() };
  return n;
}
/* where the company's figure sits against the market range (±10 %). For Dirección it is a slider over the market band:
   drag the dot to set the figure; the field beside it follows */
const RB = (ref) => [Math.round((ref * 0.7) / 10) * 10, Math.round((ref * 1.3) / 10) * 10];
const rbPos = (v, ref) => {
  const [a, b] = rangeOf(ref);
  return v < a ? "low" : v > b ? "high" : "in";
};
const rbLab = (pos) => (pos === "low" ? "Por debajo del mercado" : pos === "high" ? "Por encima del mercado" : "");
const rateBand = (v, ref, k, name) => {
  if (!ref) return "";
  const [lo, hi] = RB(ref),
    x = (q) => Math.max(0, Math.min(100, ((q - lo) / (hi - lo)) * 100)),
    [a, b] = rangeOf(ref),
    pos = rbPos(v, ref),
    lab = rbLab(pos);
  if (k && isBoard())
    return `<span class="rband ${pos}"><input type="range" class="rrange" min="${lo}" max="${hi}" step="10" value="${Math.max(lo, Math.min(hi, v))}" data-crange="${esc(k)}" data-ref="${ref}" style="--a:${x(a)}%;--b:${x(b)}%" aria-label="Ajustar la tarifa de ${esc(name)}" aria-valuetext="${eur(v)} al mes${lab ? ", " + lab.toLowerCase() : ""}"/></span>`;
  return `<span class="rband ${pos}" title="Franja: rango de mercado (±10 %). Punto: la cifra que se usa en los proyectos."><i class="rbt" aria-hidden="true"><i class="rbr" style="left:${x(a)}%;right:${100 - x(b)}%"></i><i class="rbm" style="left:${x(v)}%"></i></i></span>`;
};
function ratesCard() {
  const rows = rateRows(),
    src = D.ratesSrc,
    hr = hrOn();
  const head = `<div class="rh"><h2>Tarifas de la empresa</h2>${isBoard() && !hr ? `<button class="btn btn-s sm" data-intg="Deel">Importar desde Deel</button>` : ""}</div>`,
    intro = `<p class="note" style="margin:0 0 6px">${isBoard() ? "" : "Las fija Dirección. "}Coste mensual para la empresa a jornada completa (salario y Seguridad Social), por puesto y nivel. Sustituye a la referencia de mercado en todos los proyectos; y si un puesto tiene su propio coste en el proyecto, manda ese.</p>${
      src ? `<p class="rsrc">${I("check-circle")}Importadas de ${esc(src.by)} ${rel(src.ts)}. Si cambias una cifra aquí, se queda la tuya; si la borras, se usa la referencia de mercado.</p>` : ""
    }`;
  /* long lists fold: the first 4 rates, then «Ver las N tarifas» */
  const SHOW = 4, all = V.ratesAll || rows.length <= SHOW + 1;
  return `<div class="rcard rates">${head}${intro}${
    rows.length
      ? (all ? rows : rows.slice(0, SHOW))
          .map(([k, x]) => {
            const rb = refBreak({ id: x.id, grade: x.grade }, "España", "emp"),
              ref = rb && rb.v,
              v = D.rates[k] || 0;
            return `<div class="line"><span>${esc(F(x.id).t)}${x.grade && !F(x.id).g0 ? " · " + GR[x.grade][0] : ""}<small>${ref ? `${rb.sourced ? "Mercado" : "Estimación"}: ${rangeTxt(ref)}` : "Sin referencia"} · en ${x.n.size} proyecto${x.n.size !== 1 ? "s" : ""}<span class="rbo">${ref ? rbLab(rbPos(v || ref, ref)) : ""}</span></small></span>${rateBand(v || ref, ref, k, F(x.id).t + (x.grade ? " " + GR[x.grade][0] : ""))}${isBoard() ? `<span class="rate"><input class="hin wide" data-crate="${esc(k)}" inputmode="numeric" ${isBoard() ? "" : 'disabled title="Las fija Dirección"'} placeholder="${ref ? numFmt(ref) : "€/mes"}" value="${D.rates[k] ? numFmt(D.rates[k]) : ""}" aria-label="Tarifa mensual para ${esc(F(x.id).t)}${x.grade ? " " + GR[x.grade][0] : ""}"/></span>` : `<span class="rc">${v || ref ? `${eur(v || ref)}<small>/mes</small>` : '<em class="nd">Sin cifra</em>'}</span>`}</div>`;
          })
          .join("") + (rows.length > SHOW + 1 ? `<button class="lnk rmore" data-ratesall aria-expanded="${!!V.ratesAll}">${V.ratesAll ? "Ver menos" : "Ver las " + rows.length + " tarifas"}${I(V.ratesAll ? "angle-up" : "angle-down")}</button>` : "")
      : `<p class="note">Cuando tus proyectos tengan puestos podrás fijar aquí su coste.</p>`
  }</div>`;
}
const roleSum = (r, pr) => {
  const RT = rateOf(r, pr),
    c = Math.round(seatCosts(r, pr).reduce((a, x) => a + x.v, 0)),
    f = F(r.id),
    t = Object.values(r.tools).filter(Boolean).length;
  return {
    c,
    nodata: RT.v == null && r.ct !== "own",
    txt: [
      r.n ? `${r.n} persona${r.n > 1 ? "s" : ""}` : `${r.hours} h/mes`,
      CT[r.ct || "free"][0],
      pr && pr.status === "active" ? `${(r.people || []).length}/${seatsOf(r)} cubiertos` : null,
      f.arch === "ic" || f.arch === "delivery" ? null : ARCH_ES[f.arch],
      f.arch === "head" && r.scopes?.length ? r.scopes.map((x) => (CAT[x] ? CAT[x].es : x)).join(" + ") : null,
      r.ai ? (r.n > 1 ? `${r.ai} con IA` : "con IA") : null,
      t ? `${t} herramienta${t > 1 ? "s" : ""}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  };
};
const seg = (lab, attr, i, opts, cur, note) =>
  `<div class="line"><span>${lab}${note ? ` <small>${note}</small>` : ""}</span><span class="seg" role="radiogroup" aria-label="${lab}">${opts.map(([k, t, dis]) => `<button role="radio" aria-checked="${cur === k}" data-${attr}="${i}" data-v="${k}" ${dis ? `disabled title="${dis}"` : ""}>${t}</button>`).join("")}</span></div>`;
/* example-data tag under the company selector: quiet info chip that opens a tiny popover */
const demoTag = () => "";
/* ===== Printable proposal ===== */
function pageExport() {
  const pr = P(),
    K = cost(pr),
    Mx = K.og ? 1 : K.M,
    per = K.og ? "/mes" : "",
    today = new Date().toLocaleDateString(LOC(), { day: "numeric", month: "long", year: "numeric" }),
    tools = K.tools.filter((t) => t.q > 0),
    SRC = { mine: "su equipo", shared: "compartida", other: "otro equipo", new: "nueva" };
  const lvl = (r) => {
    const f = F(r.id);
    return gradeOf(r) ? GR[gradeOf(r)][0] : f.arch === "ic" || f.arch === "delivery" ? "—" : ARCH_ES[f.arch];
  };
  const origin = (r) => {
    const c = {};
    (r.fill || []).forEach((f) => (c[f.src] = (c[f.src] || 0) + 1));
    return Object.entries(c)
      .map(([k, n]) => `${n} ${SRC[k]}${n > 1 && k !== "shared" ? (k === "new" ? "s" : "") : ""}`)
      .join(" · ");
  };
  return `<div class="xbar noprint"><button class="backl" data-expback>${I("angle-left")}Volver al proyecto</button><button class="btn btn-p sm" data-doprint>Descargar PDF</button></div>
  <article class="paper xdoc" aria-label="Propuesta de ${esc(pr.name)}">
  <div class="xdh"><span class="xbrand xorg">${D.logo ? `<img src="${esc(D.logo === "brand/src-isotipo.svg" ? "brand/src-isotipo-print.svg" : D.logo)}" alt="" class="xolg"/>` : `<span class="xoin" aria-hidden="true">${esc(initials(D.org))}</span>`}<span class="xon"><b>${esc(D.org)}</b>${ENT(pr.ent) && ENT(pr.ent).name !== D.org ? `<small>${esc(ENT(pr.ent).name)}</small>` : ""}</span></span><div class="xdt"><b>Propuesta de equipo y coste</b><dl><dt>Nº</dt><dd>${docNo(pr)}</dd><dt>Fecha</dt><dd>${today}</dd><dt>Estado</dt><dd>${docSt(pr)}</dd></dl></div></div>
  <h1>${esc(pr.name)}</h1>
  <div class="xparties"><div><small>Empresa</small><b>${esc(ENT(pr.ent).name || "—")}</b><span>${esc(ENT(pr.ent).country || "")}</span></div><div><small>Preparada por</small><b>${esc(pr.owner)}</b><span>Responsable · ${esc(teamName(pr.owner))}</span></div><div><small>Para</small><b>Dirección</b><span>Aprobación del equipo y el coste</span></div></div>
  <table class="xmeta"><tbody><tr><th>Tipo de proyecto</th><td>${esc(TYPES[pr.type][1])}</td><th>Plazo</th><td>${plazo(pr)}</td></tr><tr><th>Inicio</th><td>${pr.start ? cap1(startLabel(pr)) : "Por definir"}</td><th>Puestos</th><td>${K.ppl}</td></tr>${pr.goal ? `<tr><th>Objetivo</th><td colspan="3">${esc(pr.goal)}</td></tr>` : ""}</tbody></table>
  ${pr.justif ? `<h2>Por qué se necesita</h2><p class="xn" style="font-size:14px;color:inherit">${esc(pr.justif)}</p>` : ""}
  <h2>Personas</h2>${
    pr.roles.length
      ? `<div class="xtw"><table class="xt xteam"><thead><tr><th>Puesto</th><th>Nivel</th><th>Dedicación</th><th>Quién</th><th class="r">Coste al mes</th></tr></thead><tbody>${pr.roles
          .map((r) => {
            const c = roleSum(r, pr);
            return `<tr><td>${dname(r)}</td><td>${lvl(r)}</td><td>${r.n ? `${r.n} × jornada completa` : `${r.hours} h/mes`}</td><td>${origin(r)}</td><td class="r">${c.nodata ? "Sin coste" : eur(c.c)}<small>${esc(provText(r, pr))}</small></td></tr>`;
          })
          .join("")}<tr class="tot"><td>Personas</td><td></td><td></td><td></td><td class="r">${eur(K.people)}</td></tr></tbody></table></div>`
      : `<p class="xn">Este proyecto aún no tiene equipo.</p>`
  }
  <h2>Software e IA</h2>${
    tools.length
      ? `<div class="xtw"><table class="xt"><thead><tr><th>Herramienta</th><th>Asientos</th><th>Ya los tenéis</th><th>Nuevos</th><th class="r">Coste al mes</th></tr></thead><tbody>${tools
          .map(
            (t) =>
              `<tr><td>${esc(t.n)}${isAiTool(t.id) ? " · IA" : ""}</td><td>${opt(t.id).once ? "Compra puntual" : t.plan ? "Tarifa plana" : t.q}</td><td>${t.own ? "Propia" : t.plan ? (t.buy ? "No" : "Sí") : t.free}</td><td>${t.own ? "—" : t.plan ? (t.buy ? "Sí" : "—") : t.buy}</td><td class="r">${eur(t.m + t.saved)}</td></tr>`,
          )
          .join("")}<tr class="tot"><td colspan="4">Software e IA</td><td class="r">${eur(K.toolsM + K.saved)}</td></tr></tbody></table></div>`
      : `<p class="xn">Este equipo no necesita licencias.</p>`
  }
  <div class="xtotw"><table class="xtot"><tbody><tr><td>Personas</td><td class="r">${eur(K.people)}/mes</td></tr><tr><td>Software e IA</td><td class="r">${eur(K.toolsM + K.saved)}/mes</td></tr>${K.api ? `<tr><td>Uso de agentes (API)</td><td class="r">${eur(K.api)}/mes</td></tr>` : ""}${K.fee ? `<tr><td>Gestión HUMAIN</td><td class="r">${eur(K.fee)}/mes</td></tr>` : ""}<tr class="sub"><td>Total al mes</td><td class="r">${eur(K.monthly)}</td></tr>${K.og ? "" : `<tr><td>Duración</td><td class="r">× ${Mx} ${Mx === 1 ? "mes" : "meses"}</td></tr>`}<tr class="grand"><td>Coste del proyecto</td><td class="r">${eur(K.monthly * Mx)}${per}</td></tr><tr class="split"><td>De ello, inversión nueva</td><td class="r">${eur(K.inv * Mx)}${per}</td></tr><tr class="split"><td>De ello, ya lo pagáis</td><td class="r">${eur(K.paid * Mx)}${per}</td></tr></tbody></table></div>
  ${(() => {
    const rv = pr.review;
    if (rv && rv.decision === "approve" && rv.ts > 9e11) return `<div class="xsign ok"><b>Aprobada por Dirección</b><span>el ${new Date(rv.ts).toLocaleDateString(LOC(), { day: "numeric", month: "long", year: "numeric" })}${rv.comment ? ` · «${esc(rv.comment)}»` : ""}</span></div>`;
    return `<div class="xsigns"><div><small>Responsable</small><b>${esc(pr.owner)}</b><i></i><span>Firma y fecha</span></div><div><small>Dirección</small><b>&nbsp;</b><i></i><span>Firma y fecha</span></div></div>`;
  })()}
  <h2>Supuestos</h2><ul class="xa"><li>Las personas de la empresa cuentan con su coste real. Los perfiles de otro equipo y las contrataciones nuevas, con referencias de mercado (guías salariales de España, más la Seguridad Social de la empresa) o estimaciones, según se indica en cada puesto, con un rango orientativo de ±10 %. No son ofertas de contratación.</li><li>Inversión nueva: contrataciones nuevas y asientos de licencia que hay que comprar. Lo demás ya lo paga la empresa.</li><li>Las licencias están a precio de lista (USD) a ${String(FX).replace(".", ",")} €; quien ya tiene una herramienta usa su asiento, y para el resto se usan primero los asientos libres que la empresa ya paga.</li><li>La mejora con IA que miden los estudios es informativa: no se descuenta del equipo.</li><li>El uso de IA va incluido en cada asiento hasta su límite; lo que pase de ahí se paga por uso y no está incluido.</li><li>Jornada de ${HPM} h al mes (1.800 h al año, convenio de consultoría y tecnologías de la información).</li><li>Importes estimados en euros, sin impuestos.</li></ul>
  <div class="xf"><span class="xfby"><img src="brand/isotipo.svg" alt="" class="xfiso"/>${docNo(pr)} · Generado con HUMAIN el ${today}</span><span>Importes estimados en euros, sin IVA</span></div></article>`;
}
/* ===== Software and AI of a proposal: one line per licence, what is already paid and what is new ===== */
const catOfOpt = (id) => Object.keys(TC).find((k) => TC[k].opts.some((o) => o.id === id)),
  isAiTool = (id) => !!(catOfOpt(id) && TC[catOfOpt(id)].ai);
/* Dirección decides from this card, so it starts open for them; the Responsable starts with it folded */
const askOpen = (pr) => (isBoard() ? V.askopen !== "x" + pr.id : V.askopen === pr.id);
/* what the edit form compares against: «Guardar cambios» stays off until something differs from the request as it was sent */
const askSig = (d) => JSON.stringify([d.opt || "", d.where || "", d.pid || "", d.fid || "", (d.whoIds || []).slice().sort(), (d.why || "").trim(), d.when || ""]);
/* ===== «Supuestos del cálculo»: every number the estimate rests on, with its source; the estimated work is editable ===== */
function assumeCard(pr, K) {
  if (!pr.roles.length && !pr.work) return "";
  const open = V.assume === pr.id,
    w0 = pr.type && pr.type !== "other" ? buildTeam(pr).work : null,
    cats = [...new Set(pr.roles.filter((r) => r.ai).map((r) => F(r.id).cat))].filter((c) => AIUP[c]),
    L = (x) => `<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)}${I("external-link-alt")}<span class="sr"> (se abre en una pestaña nueva)</span></a>`,
    pctS = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "\u00a0%";
  const body = `<div class="asm" id="asm-${pr.id}">
  <div class="line"><span>Trabajo estimado <small>${w0 && pr.work !== w0 ? `Valor tuyo. Según tipo y tamaño: ${w0.toLocaleString(LOC())} h. <button class="lnk" data-workreset>Usar</button>` : `Sale de las plantillas de HUMAIN por tipo y tamaño: cámbialo si conoces mejor el alcance. Como contraste, una app digital mediana (4,3 personas durante 6 meses, 26 personas-mes) coincide con el proyecto típico de ${L(QSMTYP)}: 4,9 personas, 5,1 meses y 25,8 personas-mes.`}</small></span><span class="inu sm"><input class="hin wide" data-work inputmode="numeric" value="${pr.work ? numFmt(pr.work) : ""}" aria-label="Trabajo estimado en horas"/><span class="u" aria-hidden="true">h</span></span></div>
  <div class="line"><span>Jornada completa <small>1.800 h al año. ${L(HPM_SRC)}</small></span><b class="av2">${HPM} h/mes</b></div>
  ${cats.length ? `<div class="line col"><span>Mejora con IA por área <small>Cuánto más trabajo saca una persona que usa IA según los estudios. Es informativa: el equipo se calcula como si la IA no ahorrara tiempo.</small></span><ul class="asl">${cats
    .map((c) => {
      const a = AIUP[c];
      return `<li><b>${esc(CATS.find((x) => x[0] === c)[1])}</b><span class="asv">${pctS(a.v)}</span><small>${a.why} Rango: de ${pctS(a.lo)} a ${pctS(a.hi)}.${a.src.length ? " " + a.src.map((k) => L(AIEV[k])).join(" · ") : ""}</small></li>`;
    })
    .join("")}</ul></div>` : ""}
  ${pr.months && (REFM[pr.size || "m"] || 6) / pr.months > 1 ? `<div class="line"><span>Coordinación <small>El plazo es más corto de lo habitual para este tamaño, así que el equipo crece y se suma un ${Math.round(COORD * 100)} % de trabajo cada vez que se duplica. Estimación: ${L(QSM)} muestra que los equipos grandes necesitan bastante más esfuerzo para el mismo resultado, pero no da una cifra aplicable.</small></span></div>` : ""}
  <div class="line"><span>Coste de cada persona <small>Guías salariales de Michael Page y LHH 2026 más la Seguridad Social de la empresa (${f2(ONCOST.rate * 100)} %). Fuentes completas en Ajustes.</small></span><button class="lnk" data-nav="settings">Ver fuentes</button></div>
  <div class="line"><span>Licencias <small>Precio de lista de cada proveedor, con pago anual salvo que se indique, comprobado en su web el 14/11/2026. Los que se publican en dólares, a ${String(FX).replace(".", ",")} € por dólar (BCE). Los asientos que ya pagas no suman.</small></span></div>
  <div class="line"><span>Uso de IA <small>Va incluido en cada asiento hasta su límite (${L({ n: "Claude Team", u: "https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan" })}, ${L({ n: "ChatGPT Business", u: "https://help.openai.com/en/articles/12003714-chatgpt-business-models-and-limits" })}, ${L({ n: "Cursor Teams", u: "https://cursor.com/en-US/business/teams" })}). Lo que pase de ese límite se paga por uso y no entra en la estimación.</small></span></div>
  </div>`;
  return `<div class="rcard asmc"><button class="advbtn" data-assume aria-expanded="${open}" aria-controls="asm-${pr.id}"><span class="advt">Supuestos del cálculo<small>Trabajo estimado, jornada, mejora con IA y de dónde sale cada coste</small></span>${I(open ? "angle-up" : "angle-down")}</button>${open ? body : ""}</div>`;
}
/* ===== The proposal ===== */
const canEdit = (pr) => !isBoard() && pr.owner === meName() && (pr.status === "draft" || pr.status === "changes") && !pr.archived;
const dedTxt = (r) => (r.n ? "jornada completa" : r.hours === HPM / 2 ? "media jornada" : `${Math.round(r.hours / 4)} h/semana`);
const lvlName = (x) => (F(x.fid).gr.length && GR[x.lvl] ? GR[x.lvl][0] : "");
const personTxt = (x) => `${F(x.fid).t} ${lvlName(x).toLowerCase()}`;
const sharedIn = (pr, pid) =>
  projectsOf(pid, pr.id)
    .map((p) => `«${esc(p.name)}»`)
    .join(" y ");
/* origin picker of a seat: free people of my team, people of my team already busy (shared), another team's profile, a new hire */
function srcOptions(pr, r, ri, i, noNew) {
  const used = new Set(pr.roles.flatMap((x, a) => (x.fill || []).filter((f, b) => f.pid && !(a === ri && b === i)).map((f) => f.pid))),
    cat = F(r.id).cat,
    cur0 = ((r.fill || [])[i] || {}).pid,
    /* only people who do this kind of work: for a designer, other designers */
    mine = (D.people || []).filter((x) => x.team === pr.owner && !used.has(x.id) && (F(x.fid).cat === cat || x.id === cur0)),
    rank = (x) => (x.fid === r.id ? 0 : F(x.fid).cat === cat ? 1 : 2),
    srt = (xs) => xs.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)),
    cur = (r.fill || [])[i] || { src: "new" };
  return [
    ...srt(mine.filter((x) => isFree(x.id, pr.id))).map((x) => ["mine:" + x.id, `Tu equipo · ${x.name} (${personTxt(x)})`]),
    ...srt(mine.filter((x) => !isFree(x.id, pr.id))).map((x) => ["shared:" + x.id, `Compartir · ${x.name} (en ${projectsOf(x.id, pr.id).map((p) => p.name).join(" y ")})`]),
    ...(noNew ? [] : [["new", "Contratación nueva"]]),
  ];
}
const srcVal = (f) => (f.src === "mine" || f.src === "shared") && f.pid ? f.src + ":" + f.pid : f.src;
function seatLine(pr, r, ri, i, x, ed, open, noPen) {
  const f = x.f,
    board = isBoard(),
    who = f.pid ? PERSON(f.pid) : null,
    named = who && (f.src !== "other" || board || pr.status === "active"),
    role = `${dname(r)} · ${dedTxt(r)}`,
    aiTag = i < r.ai ? `<em class="pill ai">Con IA</em>` : "";
  let title, meta, tag, note = "";
  if (f.src === "new") {
    title = dname(r);
    meta = cap1(dedTxt(r));
    tag = f.hiring && pr.status === "active" ? `<span class="pill run">En contratación</span>` : `<span class="pill active" tabindex="0" title="Contratación nueva: cuenta como inversión nueva.">Nueva</span>`; /* new money: same family as «Por comprar» */
    if (f.byBoard && pr.status === "pending") meta += " · Dirección prefiere contratar";
  } else if (f.src === "other") {
    title = named ? esc(who.name) : role;
    meta = named ? `${role} · ${esc(unitOf(who))}` : pr.status === "active" ? "Asignada por Dirección" : "Por asignar";
    tag = `<span class="pill" tabindex="0" title="Alguien de otro equipo de la empresa. Cuenta a su coste real y no es inversión nueva.">Otro equipo</span>`;
  } else {
    title = esc(who.name);
    meta = role;
    tag = `<span class="pill">${board || teamsOf(meName()).length > 1 ? esc(unitOf(who)) : "Tu equipo"}</span>`;
    if (f.src === "shared") {
      const where = sharedIn(pr, who.id);
      note = f.part
        ? `<p class="snote">Dedicación parcial${where ? `: también está en ${where}` : ""}.</p>`
        : `<p class="snote warnt">${I("exclamation-triangle")}<span>${ed ? `Compartir a ${esc(who.name.split(" ")[0])} ahorra ${eur(x.ref)}/mes de inversión, pero ya` : "Ya"} está en ${where || "otro proyecto"}.</span></p>`;
    }
  }
  const cost = x.real
    ? `<b>${eur(x.v)}<small>/mes</small></b><small>Coste real</small>`
    : `<b>${eur(x.v)}<small>/mes</small></b><small>${rangeTxt(x.v)}</small><small class="one" title="${esc(provText(r, pr))}">${provBtn(r, pr, ri, "src")}</small>`;
  const act =
    ed
      ? noPen && f.src === "new"
        ? `<span class="sapl">Por contratar</span>`
        : ddHTML({ id: `src-${ri}-${i}`, size: "sm", ariaLabel: `Quién ocupa este puesto de ${F(r.id).t}`, value: srcVal(f), shown: { mine: "Tu equipo", shared: "Compartida", other: "Otro equipo", new: "Contratación nueva" }[f.src], options: srcOptions(pr, r, ri, i, noPen) })
      : board && pr.status === "pending" && (f.src === "other" || f.src === "new")
        ? (() => {
            const cand = otherFree(pr, r.id).filter((y) => y.id === f.pid || !pr.roles.some((rr) => (rr.fill || []).some((g) => g.pid === y.id)));
            if (f.src === "new" && cand.length) {
              const c0 = cand[0];
              return `<div class="sugg"><span class="sgic" aria-hidden="true">${I("user-check")}</span><span class="sgtx"><b>${esc(c0.name.split(" ")[0])} está libre</b><small>${esc(F(c0.fid).t)} · ${esc(teamName(c0.team))}. Ahorra ${eur(x.v)}/mes de inversión nueva.</small></span><button class="btn btn-s sm" data-asgq="${ri}|${i}|${c0.id}">Asignar</button></div>${cand.length > 1 ? `<div class="sgmore"><span>O elige a otra persona</span>${ddHTML({ id: `asg-${ri}-${i}`, size: "sm", ariaLabel: "Asignar a otra persona libre", placeholder: `${cand.length - 1} más`, value: "", options: cand.slice(1).map((y) => [y.id, `${y.name} · ${teamName(y.team)}`]) })}</div>` : ""}`;
            }
            return cand.length
              ? `<span class="sapl">${f.src === "other" ? "¿Quién ocupa el puesto?" : "¿Alguien libre lo cubre?"}</span>` + ddHTML({ id: `asg-${ri}-${i}`, size: "sm", ariaLabel: `Asignar a una persona de otro equipo o contratar`, placeholder: "Asignar a…", value: f.src === "new" ? "new" : f.pid || "", options: [...cand.map((y) => [y.id, `${y.name} · ${teamName(y.team)} · ${eur(y.cost || 0)}`]), ["new", "Contratar a alguien nuevo"]] })
              : f.src === "new"
                ? ""
                : `<span class="sapl">Nadie libre en otros equipos: se contratará</span>`;
          })()
        : f.src === "new" && f.hiring && pr.status === "active" && (board || pr.owner === meName())
          ? `<div class="hirel hirel2">${I("clock")}<span><b>Contratación en curso</b><small>Cuando la persona se incorpore, notifícalo para ponerle nombre y que cuente en ${board ? "el equipo de " + esc(pr.owner.split(" ")[0]) : "tu equipo"}.</small></span><button class="btn btn-s sm" data-hired="${ri}|${i}">${I("user-check")}Notificar contratación</button></div>`
          : "";
  const pen =
    noPen
      ? ""
      : ed
      ? `<button class="ib s" data-ropen="${ri}" aria-expanded="${!!open}" aria-label="${open ? "Cerrar la edición de" : "Editar el puesto"} ${esc(F(r.id).t)}" title="${open ? "Cerrar" : "Editar puesto"}">${I(open && i === 0 ? "times" : "pen")}</button>`
      : ed
        ? `<span class="ibsp" aria-hidden="true"></span>`
        : "";
  const rm = ed ? `<button class="ib s srm" data-seatrm="${ri}|${i}" aria-label="Quitar este puesto: ${esc(f.pid && who ? who.name : dname(r))}" title="Quitar este puesto">${I("times")}</button>` : "";
  /* compact (area rows): the role name, its AI tag and its schedule are already in the row header, so a seat only says who fills it */
  const multi = seatsOf(r) > 1,
    sn = noPen
      ? !multi
        ? ""
        : f.src === "new" || (f.src === "other" && !named)
          ? `<b>Puesto ${i + 1}${aiTag}</b>`
          : `<b>${title}${aiTag}</b>`
      : `<b>${title}${aiTag}</b><small>${meta}</small>`;
  return `<div class="sline src-${f.src}${i ? " cont" : ""}${ed ? " ed" : act ? " act nt" : " nt"}${noPen && !sn ? " nosn" : ""}"><span class="sn">${sn}${ed ? "" : `<span class="stag">${tag}</span>`}${note}</span><span class="scost">${cost}</span>${ed || act ? `<span class="sact2">${act}${pen}${rm}</span>` : ""}</div>`;
}
/* ===== The team by area: one folded row per profile; unfolded, its card with people, programs and AI ===== */
const rOpen = (pr, i, ed) => {
  const v = (V.rx || {})[pr.id + ":" + i];
  return v === undefined ? !ed : v;
};
function areaTeam(pr, K, ed) {
  const ord = { head: 0, manager: 1, lead: 2, delivery: 3, ic: 4 },
    cix = (r) => CATS.findIndex((c) => c[0] === F(r.id).cat),
    W = pr.roles.map((r, i) => [r, i]).sort((a, b) => cix(a[0]) - cix(b[0]) || ord[F(a[0].id).arch] - ord[F(b[0].id).arch]),
    groups = [],
    DF = diffOf(pr);
  if (DF) DF.removed.forEach((r) => W.push([r, -1]));
  W.sort((a, b) => cix(a[0]) - cix(b[0]) || ord[F(a[0].id).arch] - ord[F(b[0].id).arch]);
  W.forEach(([r, i]) => {
    /* same areas as Personas: product design and graphic design are one «Diseño» */
    const cat = ["pdesign", "creative"].includes(F(r.id).cat) ? "pdesign" : F(r.id).cat;
    let g = groups.find((x) => x.cat === cat);
    if (!g) groups.push((g = { cat, items: [] }));
    g.items.push([r, i]);
  });
  const row = ([r, i]) => {
    const gone = i < 0,
      bo = DF && DF.bm[r.uid],
      isNew = DF && !gone && !bo,
      newT = new Set(DF && bo ? Object.values(r.tools || {}).filter((t) => t && !Object.values(bo.tools || {}).includes(t)) : []),
      dedCh = bo && !gone && ((bo.n || 0) !== (r.n || 0) || (bo.hours || 0) !== (r.hours || 0));
    const x = seatCosts(r, pr)[0],
      f = x.f,
      board = isBoard(),
      who = f.pid && PERSON(f.pid) && (f.src !== "other" || board || pr.status === "active" || pr.full) ? PERSON(f.pid) : null,
      nw = f.src === "new",
      title = who ? who.name : dname(r),
      sub = (who ? `${dname(r)} · ${dedTxt(r)}` : `${nw ? (f.hiring && pr.status === "active" ? "En contratación" : "Por contratar") : "Por asignar"} · ${dedTxt(r)}`) + (dedCh ? ` (antes ${dedTxt(bo)})` : ""),
      tl = Object.values(r.tools || {}).filter((y) => y && opt(y)).map((y) => opt(y).n),
      pills = (r.ai > 0 ? `<em class="pill ai">Con IA</em>` : "") + (isNew ? `<em class="pill dnew">Nuevo</em>` : "") + (gone ? `<em class="pill dgone">Se quita</em>` : ""),
      short = (n) => n.replace(/\s*\(.*?\)/g, "").split(" · ")[0],
      chips = Object.values(r.tools || {})
        .filter((y) => y && opt(y))
        .map((y) => `<span class="pchip${isAiTool(y) ? " ai" : ""}">${esc(short(opt(y).n))}</span>`)
        .join(""),
      acts = "",
      extra = !gone && !ed && ((board && pr.status === "pending" && (f.src === "new" || f.src === "other")) || (nw && f.hiring && pr.status === "active")) ? seatLine(pr, r, i, 0, x, false, false, true) : "",
      extraOk = /class="dd|data-hire|class="sugg|class="hirel/.test(extra);
    const tl2 = Object.values(r.tools || {}).filter((y) => y && opt(y)).sort(toolSort),
      px = (V.px || {})[pr.id + ":" + i],
      shown = px ? tl2 : tl2.slice(0, tl2.length > 4 ? 3 : 4),
      more = tl2.length - shown.length,
      chipsH = shown.map((y) => `<span class="pchip${isAiTool(y) ? " ai" : ""}${opt(y).req ? " preq" : ""}${newT.has(y) || isNew ? " dnew" : ""}${ed && !gone ? " pfc" : ""}"${short(opt(y).n) !== opt(y).n ? ` title="${esc(opt(y).n)}"` : ""}>${newT.has(y) ? "+ " : ""}${esc(short(opt(y).n))}${ed && !gone ? `<button type="button" data-tchiprm="${i}|${esc(y)}" aria-label="Quitar ${esc(opt(y).n)} a ${esc(title)}">${I("times")}</button>` : ""}</span>`).join("") + (more ? `<button type="button" class="pchip more" data-pmore="${i}" aria-expanded="false" aria-label="Ver ${more} programas más: ${esc(tl2.slice(shown.length).map((y) => opt(y).n).join(", "))}">+${more}</button>` : px && tl2.length > 4 ? `<button type="button" class="pchip more" data-pmore="${i}" aria-expanded="true">Ver menos</button>` : ""),
      btns = gone
        ? ed
          ? `<span class="pacts"><button class="lnk" data-unrm="${esc(r.uid)}">Deshacer</button></span>`
          : ""
        : ed
        ? `<span class="pacts"><button class="ib s" data-pedit="${i}" aria-label="Editar a ${esc(title)}" title="Editar">${I("pen")}</button><button class="ib s" data-seatrm="${i}|0" aria-label="Quitar a ${esc(title)} del proyecto" title="Quitar del proyecto">${I("trash-alt")}</button></span>`
        : "";
    return `<div class="arw prow${gone ? " dgonew" : ""}${isNew ? " dneww" : ""}" id="${gone ? "gone-" + esc(r.uid) : "role-" + i}"><div class="pr3"><span class="pav${who ? "" : " nw"}" aria-hidden="true">${who ? esc(initials(who.name)) : I("user-plus")}</span><b class="pname">${esc(title)}${pills}</b><span class="pmain"><small class="psub">${esc(cap1(sub.replace(/\d+\u00a0% · /, "")))}</small><small class="pcost3"><strong>${eur(x.v)}</strong>/mes</small></span>${btns}<span class="pchips">${chipsH || `<small class="pnone">Sin programas propios</small>`}</span></div>${extraOk ? `<div class="rficha">${extra}</div>` : ""}${gone ? `<p class="gonel">${I("info-circle")}<span>${who ? `Si Dirección aprueba los cambios, ${esc(who.name.split(" ")[0])} deja el proyecto y queda <b>libre</b> en Personas para otro proyecto.` : "Si Dirección aprueba los cambios, este puesto deja de cubrirse."}</span></p>` : ""}</div>`;
  };
  return groups
    .map((g) => {
      const label = g.cat === "pdesign" ? "Diseño" : CATS.find((c) => c[0] === g.cat)[1],
        ppl = g.items.filter(([, i]) => i >= 0).reduce((a, [r]) => a + seatsOf(r), 0);
      const rows = g.items.map(row).join(""),
        key = pr.id + ":" + g.cat,
        /* a running project is read, not edited: each area folds into one line (people, cost) so what needs
           attention (requests, hiring) stays on top. Areas with a pending action stay open. */
        fold = !ed && ["active", "done"].includes(pr.status) && !/class="rficha"/.test(rows);
      if (!fold) return `<section class="rcard blk area" aria-label="${esc(label)}"><div class="rh"><h2>${esc(label)}</h2><span class="cnt">${ppl}</span></div>${rows}</section>`;
      const open = (V.aopen || []).includes(key),
        mo = g.items.filter(([, i]) => i >= 0).reduce((a, [r]) => a + seatCosts(r, pr).reduce((t, x) => t + x.v, 0), 0),
        avs = g.items.filter(([, i]) => i >= 0).map(([r]) => { const f = (r.fill || [])[0] || {}, w = f.pid && PERSON(f.pid); return w ? `<i class="hav">${esc(initials(w.name))}</i>` : `<i class="hav nw">${I("user-plus")}</i>`; }),
        sh = avs.slice(0, avs.length > 4 ? 3 : 4);
      return `<section class="rcard blk area afold${open ? " open" : ""}" aria-label="${esc(label)}"><button class="rh afh" data-afold="${esc(key)}" aria-expanded="${open}"><h2>${esc(label)}</h2><span class="cnt">${ppl}</span><span class="afs">${open ? "" : `<span class="havs">${sh.join("")}${avs.length > sh.length ? `<i class="hav more">+${avs.length - sh.length}</i>` : ""}</span><span class="afm"><b>${eur(mo)}</b>/mes</span>`}${I("angle-down")}</span></button>${open ? rows : ""}</section>`;
    })
    .join("") + (pr.roles.length ? "" : `<section class="rcard blk"><div class="rh"><h2>Personas</h2><span class="cnt">0</span></div><p class="note">Aún no hay nadie. Añade a la primera persona.</p></section>`) +
    (ed ? `<div class="addrow"><button class="btn btn-s addp" data-addrole>${I("plus")}Añadir persona</button>${pr.work && !pr.full ? `<button class="btn btn-s resug" data-resuggest title="HUMAIN vuelve a proponer el equipo según el trabajo. Puedes deshacerlo.">${I("exchange")}Volver a proponer el equipo</button>` : ""}</div>` : "") +
    "";
}
/* side panel: the three figures, the budget, why it is needed and the action that fits the state and who is looking */
/* móvil: las dos cifras arriba; el panel completo (justificación y decisión) sigue al final */
function mobSum(pr, K) {
  const Mx = K.og ? 1 : K.M,
    per = K.og ? "/mes" : "";
  return `<div class="msum" aria-hidden="true"><div><small>Coste del proyecto</small><b>${eur(K.monthly * Mx)}${per}</b></div><div><small>Inversión nueva</small><b class="inv">${eur(K.inv * Mx)}${per}</b></div></div>`;
}
function panelHTML(pr, K) {
  const BK = pr.full && baseOf(pr) ? cost(baseOf(pr)) : null;
  if (BK) K = { ...K, inv: Math.max(0, K.inv - BK.inv), paid: Math.max(0, K.paid - BK.paid), peopleNew: Math.max(0, K.peopleNew - BK.peopleNew) };
  const og = K.og,
    Mx = og ? 1 : K.M,
    per = og ? "/mes" : "",
    proj = K.monthly * Mx,
    inv = K.inv * Mx,
    paid = K.paid * Mx,
    refNew = K.peopleNew * Mx,
    lo = r100(inv - refNew * RANGE),
    hi = r100(inv + refNew * RANGE),
    ed = canEdit(pr),
    mine = !isBoard() && pr.owner === meName(),
    rv = pr.review,
    when = (ts) => !(ts > 9e11) ? "" : fdateS(ts) + (new Date(ts).getFullYear() !== new Date().getFullYear() ? " de " + new Date(ts).getFullYear() : "");
  let budget = "";
  if (pr.budget) {
    const d = pr.budget - inv;
    budget = `<div class="frow"><span>Presupuesto${og ? " al mes" : ""}</span><b>${eur(pr.budget)}</b></div>${
      d >= 0
        ? `<p class="fnote ok">${I("check-circle")}<span>La inversión nueva cabe: quedan ${eur(d)}${per}.</span></p>`
        : `<div class="lup warn" role="status">${I("exclamation-triangle")}<div><b>Se pasa en ${eur(-d)}${per}</b><small>${isBoard() ? "La inversión nueva supera el presupuesto que puso " + esc(pr.owner.split(" ")[0]) + "." : "La inversión nueva supera el presupuesto. Puedes enviarla igualmente."}</small></div></div>`
    }`;
  }
  const just = ed
    ? `<div class="field jf"><label for="pj">Por qué lo necesitas</label><textarea id="pj" class="big md" data-justif rows="4" placeholder="Qué consigue la empresa con este proyecto y qué pasa si no se hace" ${V.jerr ? 'aria-invalid="true" aria-describedby="pje"' : ""}>${esc(pr.justif || "")}</textarea>${V.jerr ? `<p class="ferr" id="pje" role="alert">Explica por qué lo necesitas antes de enviarla.</p>` : ""}</div>`
    : pr.justif
      ? `<div class="just"><small>${mine ? "Por qué lo necesitas" : "Por qué lo necesita"}</small><p>${esc(pr.justif)}</p></div>`
      : "";
  let act = "";
  if (ed) act = `${pr.roles.length ? "" : `<div class="alert info" role="note">${I("info-circle")}<span>Añade al menos una persona para poder enviarlo.</span></div>`}<button class="btn btn-p full" data-send ${pr.roles.length ? "" : "disabled"}>${pr.status === "changes" ? "Reenviar a Dirección" : "Enviar a Dirección"}</button><button class="btn btn-s full" data-savedraft>Guardar borrador</button>`;
  else if (mine && pr.status === "pending")
    act = `<p class="fnote"><span>Enviada a Dirección el ${when(pr.sentAt || Date.now())}.</span></p><button class="btn btn-s full" data-withdraw>Retirar</button>`;
  else if (isBoard() && pr.status === "pending" && !pr.archived)
    act = V.rmode
      ? `<div class="field jf"><label for="rc">${V.rmode === "changes" ? `¿Qué cambios le pides a ${esc(pr.owner.split(" ")[0])}?` : `¿Por qué la rechazas?`}</label><textarea id="rc" class="big md" data-rcomment rows="3" placeholder="Por ejemplo: ¿Podríais valorar empezar con un equipo más pequeño? Así encajaría mejor en el presupuesto de este trimestre." ${V.rerr ? 'aria-invalid="true" aria-describedby="rce"' : ""}>${esc(V.rcomment || "")}</textarea>${V.rerr ? `<p class="ferr" id="rce" role="alert">${V.rerr}</p>` : ""}${V.rmode === "reject" ? `<p class="fnote2">${esc(pr.owner.split(" ")[0])} la verá en «Rechazados» con tu motivo; no se borra.</p>` : ""}</div><div class="rvb"><button class="btn btn-p full" ${V.rmode === "changes" ? "data-askchg" : "data-reject"}>${V.rmode === "changes" ? "Enviar cambios" : "Rechazar propuesta"}</button><button class="btn btn-s full" data-rcancel>Cancelar</button></div>`
      : `${newProgHTML(pr)}<div class="rvb"><button class="btn btn-p full" data-approve>Aprobar</button>${pr.parent && !pr.full ? "" : `<button class="btn btn-s full" data-askchg>Sugerir cambios</button>`}<button class="btn btn-dt full" data-reject>Rechazar</button></div>`;
  else if (pr.status === "active" && rv && rv.decision === "approve") act = `<p class="fnote ok">${I("check-circle")}<span>Aprobada por Dirección${when(rv.ts) ? " el " + when(rv.ts) : ""}.</span></p>`;
  else if (pr.status === "rejected" && rv) act = `<p class="fnote">${I("times-circle")}<span>Rechazada por Dirección${when(rv.ts) ? " el " + when(rv.ts) : ""}.</span></p>`;
  return `<div class="side pnl">${BK ? `<div class="fig"><small>Diferencia de coste</small><b>${K.monthly - BK.monthly > 0 ? "+ " : K.monthly - BK.monthly < 0 ? "− " : ""}${eur(Math.abs(K.monthly - BK.monthly))}<em>/mes</em></b><span>Pasa de ${eur(BK.monthly)} a ${eur(K.monthly)} al mes</span></div>` : `<div class="fig"><small>Coste del proyecto${itip("Todo lo que usa el proyecto: personas a su coste y asientos de licencia, también los que la empresa ya paga.")}</small><b>${eur(proj)}${og ? "<em>/mes</em>" : ""}</b><span>${og ? "servicio continuo" : `${eur(K.monthly)}/mes × ${String(K.M).replace(".", ",")} meses`}</span></div>`}
  <div class="fig fnew"><small>Inversión nueva${itip("Dinero nuevo que hay que aprobar: contrataciones y asientos de licencia que hay que comprar. Lo que ya pagáis no cuenta aquí.")}</small><b>${eur(inv)}${og ? "<em>/mes</em>" : ""}</b><span>${refNew > 0 ? `${eur(lo)} – ${eur(hi)} · rango orientativo ±10\u00a0%` : "sin contrataciones nuevas"}</span></div>
  <div class="frow"><span>Ya lo pagáis<small>Personas de la empresa y licencias libres</small></span><b>${eur(paid)}${per}</b></div>
  ${budget}${pr.parent && !ed ? "" : just}${act}</div>`;
}
function pageProject() {
  const pr = P(),
    K = cost(pr),
    ed = canEdit(pr),
    rv = pr.review;
  const par = pr.parent && D.projects.find((x) => x.id === pr.parent),
    kids = D.projects.filter((x) => x.parent === pr.id && !x.archived),
    mine = !isBoard() && pr.owner === meName() && !pr.archived,
    closed = pr.status === "rejected" || pr.status === "cancelled" || stOf(pr) === "done";
  const sub = [par ? (pr.full ? "Cambios propuestos" : `Ampliación de «${esc(par.name)}»`) : "", plazo(pr), startLabel(pr), isBoard() ? (D.managers.length > 1 ? `${esc(pr.owner)} · ${esc(teamName(pr.owner))}` : esc(pr.owner)) : "", multi() && isBoard() ? esc(ENT(pr.ent).name) : ""].filter(Boolean).join(" · ");
  const narrow = matchMedia("(max-width:900px)").matches;
  /* mobile: a bar fixed at the bottom with the money and the next step, so «Enviar» or «Aprobar» is never far away */
  const mbAct = ed ? (pr.status === "changes" ? "Revisar y reenviar" : "Revisar y enviar") : isBoard() && pr.status === "pending" ? "Revisar y decidir" : "",
    mbar = narrow && mbAct && pr.roles.length ? `<div class="mbar" role="region" aria-label="Resumen"><span class="mbv">${pr.full && baseOf(pr) ? (() => { const dm = K.monthly - cost(baseOf(pr)).monthly; return `<b>${dm > 0 ? "+ " : dm < 0 ? "− " : ""}${eur(Math.abs(dm))}/mes</b><small>diferencia de coste</small>`; })() : `<b>${eur(K.og ? K.inv : K.invTotal)}</b><small>inversión nueva</small>`}</span><button class="btn btn-p" data-mbar>${mbAct}</button></div>` : "";
  return `<div class="phw"><button class="backl" data-nav="projects">${I("angle-left")}Proyectos</button><div class="ph"><div><h1 style="margin-top:4px">${esc(pr.name)}</h1><p class="sub" style="margin:0">${cap1(sub)}</p>${pr.goal ? `<p class="pgoal">${esc(pr.goal)}</p>` : ""}</div><div class="pact">${mine && !pr.parent && ["active", "approved"].includes(stOf(pr)) ? `<button class="btn btn-s sm" data-extend="${pr.id}">${propOf(pr) ? "Ver cambios propuestos" : "Proponer cambios"}</button>` : ""}${mine && closed ? `<button class="btn btn-s sm" data-pdup="${pr.id}">Duplicar como nuevo proyecto</button>` : ""}${ed && !pr.parent ? `<button class="ib" data-edit aria-label="Editar proyecto" title="Editar proyecto">${I("pen")}</button>` : ""}${pmenu(pr, "pg")}</div></div></div>
 <div class="phm">${stPill(pr)}${par && !pr.full ? `<span class="phn">«${esc(par.name)}» sigue como estaba aprobado. Solo se decide lo que añades.</span>` : ""}</div>${(() => {
   const op = !pr.parent && propOf(pr);
   if (op) return `<div class="propban" role="status">${I("pen")}<span><b>${op.status === "draft" ? "Tienes cambios sin enviar" : op.status === "changes" ? "Dirección pide cambios en tu propuesta" : "Cambios pendientes de aprobar"}</b><small>Lo aprobado sigue en marcha hasta que Dirección decida.</small></span><button class="btn btn-s sm" data-extend="${pr.id}">Ver cambios</button></div>`;
   if (!pr.full) return "";
   const df = diffOf(pr),
     b = baseOf(pr),
     dm = cost(pr).monthly - cost(b).monthly;
   const prv = pr.prevRv && pr.status === "draft" ? `<section class="rvc rejected hasic" role="status"><i class="rvic" aria-hidden="true">${I("building")}</i><div class="rvx"><small class="rvl">Dirección rechazó tu petición anterior</small><p>${esc(pr.prevRv.comment)}</p></div></section>` : "";
   return prv + `<div class="propban" role="status">${I("pen")}<span><b>${pr.status === "draft" ? "Cambios sin enviar" : pr.status === "pending" ? "Cambios enviados a Dirección" : pr.status === "changes" ? "Dirección pide cambios" : "Cambios"}</b><small>${df.count ? `${df.count} cambio${df.count !== 1 ? "s" : ""} · ` : "Aún no has cambiado nada · "}lo aprobado sigue en marcha</small></span>${ed && pr.status === "draft" ? `<button class="lnk" data-pdiscard="${pr.id}">Descartar</button>` : ""}</div><div class="propdelta"><span>Diferencia de coste<small>Pasa de ${eur(cost(b).monthly)} a ${eur(cost(pr).monthly)} al mes</small></span><b class="${dm > 0 ? "up" : dm < 0 ? "down" : ""}">${dm > 0 ? "+ " : dm < 0 ? "− " : ""}${eur(Math.abs(dm))}<small>/mes</small></b></div>`;
 })()}
 <div class="cfg"><div class="cmain">
 ${(pr.status === "changes" || pr.status === "rejected") && rv && rv.comment ? (() => { const mn = (V.rvfold || []).includes(pr.id), xs = `${mine && !ed && pr.status === "changes" ? `<button class="btn btn-s sm" data-edit>Editar y reenviar</button>` : ""}${mine && pr.parent && pr.status === "rejected" ? `<button class="btn btn-s sm" data-renew="${pr.id}">Crear nueva petición</button>` : ""}${isBoard() && pr.status === "changes" ? `<p class="rvwait">Esperando a ${esc(pr.owner.split(" ")[0])}: lo edita y te lo reenvía. Te avisaremos.</p>` : ""}`; return `<section class="rvc ${pr.status} hasic rvone${mn ? " min" : ""}" data-rvid="${pr.id}" role="status"><button class="rvhd" data-rvfold="${pr.id}" aria-expanded="${!mn}" aria-label="${mn ? "Mostrar" : "Plegar"} el mensaje de Dirección"><i class="rvic" aria-hidden="true">${I("building")}</i><span class="rvtx"><span class="rvl">${pr.status === "changes" ? "Dirección pide cambios" : "Respuesta de Dirección"}</span><span class="rvq">«${esc(rv.comment)}»</span></span><span class="rvch" aria-hidden="true">${I("angle-down")}</span></button>${!mn && xs.trim() ? `<div class="rvb">${xs}</div>` : ""}</section>`; })() : ""}${pr.status === "cancelled" && pr.cancel ? `<section class="rvc rejected hasic rvcx" role="status"><i class="rvic" aria-hidden="true">${pr.cancel.by === "b" ? I("building") : esc(initials(pr.owner))}</i><div class="rvx"><small class="rvl">Cancelado por ${pr.cancel.by === "b" ? "Dirección" : esc(pr.owner.split(" ")[0])} · ${esc(fmtShort(new Date(pr.cancel.ts).toISOString().slice(0, 10)))}</small><p>${esc(pr.cancel.t)}</p><p class="rvwait">Las personas y los asientos que usaba quedan libres.</p></div></section>` : ""}${pr.reply && pr.status === "pending" ? (() => {
    const q = threadOf(pr).filter((x) => x.who === "b" && x.k === "changes" && x.t).pop(),
      fid = pr.id + ":r", mn = (V.rvfold || []).includes(fid);
    /* same component as Dirección's message: the header folds it; the avatar is the person who wrote it */
    return `<section class="rvc reply hasic rvone${mn ? " min" : ""}" data-rvid="${fid}" role="status"><button class="rvhd" data-rvfold="${fid}" aria-expanded="${!mn}" aria-label="${mn ? "Mostrar" : "Plegar"} la respuesta de ${esc(pr.owner.split(" ")[0])}"><i class="rvic rvav" aria-hidden="true">${esc(initials(pr.owner))}</i><span class="rvtx"><span class="rvl">Respuesta de ${esc(pr.owner.split(" ")[0])}</span><span class="rvq">«${esc(pr.reply)}»</span></span><span class="rvch" aria-hidden="true">${I("angle-down")}</span></button>${!mn && q ? `<div class="rvb"><p class="rvctx"><b>${isBoard() ? "Pediste" : "Dirección pidió"}:</b> «${esc(q.t)}»</p></div>` : ""}</section>`;
  })() : ""}${kids.length ? `<div class="card ampc"><div class="ch"><h2>Peticiones</h2><p class="note">Lo que has pedido después de aprobar el proyecto. Dirección decide cada petición por separado.</p></div>${kids.map((k) => `<button class="linkrow rl" data-openp="${k.id}"><span class="ampt"><b>${esc(k.name)}</b><small>${(() => { const c = cost(k), n = (k.roles || []).length; return `${n} puesto${n !== 1 ? "s" : ""} · ${eur(c.monthly)}/mes de inversión nueva`; })()}</small></span><span>${stPill(k)}</span></button>`).join("")}</div>` : ""}

 ${pr.archived ? `<div class="alert"><span>Este proyecto está archivado: no cuenta en los totales ni en la previsión.</span><button class="lnk" data-punarch="${pr.id}">Restaurar</button></div>` : ""}

 ${!closed && pr.roles.length && !K.lead && pr.roles.some((r) => r.ai > 0) ? `<div class="alert warn">${I("exclamation-triangle")}<span>Hace falta al menos una persona a jornada completa que lleve el proyecto y revise el trabajo de la IA.</span></div>` : ""}${K.missing.length ? `<div class="alert warn">${I("exclamation-triangle")}<span>Sin coste estimado: ${K.missing.join(", ")}. Indica una cifra en cada puesto para que el total sea completo.</span></div>` : ""}
 ${pr.full ? "" : mobSum(pr, K)}
 ${par && !pr.full ? `<div class="reqh"><h2>Lo que pides</h2><p>${pr.roles.length} persona${pr.roles.length !== 1 ? "s" : ""} más · ${eur(K.monthly)}/mes de inversión nueva</p></div>` : ""}${areaTeam(pr, K, ed)}
 ${narrow ? "" : assumeCard(pr, K)}
 
 </div><aside class="cside" aria-label="Resumen y decisión">${panelHTML(pr, K)}</aside></div>${narrow ? `<div class="asmtail">${assumeCard(pr, K)}</div>` : ""}${mbar}`;
}
/* demo controls: outside the product chrome, so nobody mistakes them for a feature */
function demoHTML() {
  if (!D.me) return "";
  /* every Responsable of the demo company, so the answer to a project of Nora or Lucas can be followed from their side */
  const who = [
    ...(D.managers || []).map((m) => ["m:" + m.name, m.name, "Responsable"]),
    ["board", "James Carter", "Dirección"],
  ];
  if (!who.some((w) => w[0] === "m:" + D.me.name)) who.unshift(["m:" + D.me.name, D.me.name, D.me.role]);
  const cur = D.as === "board" ? who[who.length - 1] : who.find((w) => w[0] === "m:" + D.me.name) || who[0];
  return V.demo
    ? `<div class="demop" role="dialog" aria-label="Controles de la demo"><div class="demoh"><b>Controles de la demo</b><button class="demox" data-demo aria-label="Cerrar">${I("times")}</button></div><p>No forman parte de HUMAIN: sirven para enseñar el prototipo desde los dos lados. Prueba a enviar «Portal de clientes» como Emma y a decidir como James.</p><span class="demol">Ver como</span>${who
        .map(([k, n, r]) => `<button class="demoo" data-as="${k}" aria-pressed="${cur[0] === k}"><span><b>${esc(n)}</b><small>${esc(r)}</small></span>${cur[0] === k ? I("check") : ""}</button>`)
        .join("")}<button class="demor" data-demoreset>Reiniciar la demo</button></div>`
    : `<button class="demob" data-demo aria-label="Controles de la demo">${I("exchange")}<span>Demo · ${esc(cur[2])}</span></button>`;
}
function shell() {
  /* a missing or unknown workspace falls back to "all" (same rule as repairData) */
  if (D && D.ent !== "all" && !ENT(D.ent)) D.ent = "all";
  const navs = NAV.map(
    ([k, ic, t]) =>
      `<button class="nv" data-nav="${k}" ${k === "notes" && unread() ? `aria-label="Notificaciones, ${unread()} sin leer"` : ""} aria-current="${V.view === k || (k === "projects" && V.view === "project") || (k === "home" && V.view === "tasks") ? "page" : "false"}">${I(ic)}<span class="nvt">${t}</span>${k === "notes" && unread() ? `<span class="nvb" aria-hidden="true">${unread()}</span>` : ""}</button>`,
  ).join("");
  const cur = esc(D.ent === "all" ? D.org : ENT(D.ent).name),
    ini = esc(initials(D.org)),
    av = `<span class="wsav">${D.logo ? `<img src="${esc(D.logo)}" alt=""/>` : ini}</span>`;
  /* the example shows the selector even with one company: the next one (UK) is listed, switched off until after the demo */
  const sel = !multi() && !D.demo ? "" : `<div class="ws">${`<button class="wsbtn" data-ws aria-expanded="${!!V.ws}" aria-haspopup="menu" ${D.demo && !V.ws ? 'title="SRC es una empresa ficticia, creada para esta demo."' : ""}>${av}<span class="wsn"><b>${cur}</b><small>${multi() ? (D.ent === "all" ? D.entities.length + " empresas" : esc(D.org)) : esc(D.entities[0].country)}</small></span>${I("angle-down")}</button>`}${V.ws && !multi() ? `<div class="wsmenu" role="menu"><button role="menuitemradio" aria-checked="true" data-ws><span><b>${esc(D.entities[0].name)}</b><small>${esc(D.entities[0].country)}</small></span>${I("check")}</button><button role="menuitem" disabled data-tt="Reino Unido estará disponible más adelante."><span><b>SRC Reino Unido</b><small>Próximamente</small></span></button></div>` : ""}${V.ws && multi() ? `<div class="wsmenu" role="menu">${[["all", "Todas las empresas", D.org], ...D.entities.map((e) => [e.id, e.name, e.country])].map(([v, t, sub]) => `<button role="menuitemradio" aria-checked="${D.ent === v}" data-setent="${v}"><span><b>${esc(t)}</b><small>${esc(sub)}</small></span>${D.ent === v ? I("check") : ""}</button>`).join("")}</div>` : ""}${demoTag()}</div>`;
  return { navs, sel };
}
/* mobile: the fixed summary bar's real height becomes the content's bottom spacer */
function syncBar() {
  const cs = document.querySelector(".cside"),
    h = cs && getComputedStyle(cs).position === "fixed" ? Math.ceil(cs.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty("--sbh", (h || 0) + "px");
}
window.addEventListener("resize", syncBar);
/* Desplegable propio (dd): sustituye al <select> nativo. Lista en <body> (position:fixed) para que no la recorte el modal. */
const DDR = {};
const ddLabel = (id, v) => {
  const o = DDR[id].options.find((x) => x[0] === v);
  return o ? o[1] : "";
};
/* simplified flags for the countries HUMAIN prices (drawn, not emoji: Windows shows emoji flags as letters) */
const FLAGS = {
  España: '<rect width="20" height="14" fill="#AA151B"/><rect y="3.5" width="20" height="7" fill="#F1BF00"/>',
  Portugal: '<rect width="20" height="14" fill="#DA291C"/><rect width="8" height="14" fill="#046A38"/><circle cx="8" cy="7" r="2.6" fill="#FFE900"/>',
  Francia: '<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#002654"/><rect x="13.33" width="6.67" height="14" fill="#CE1126"/>',
  Alemania: '<rect width="20" height="14" fill="#DD0000"/><rect width="20" height="4.67" fill="#000"/><rect y="9.33" width="20" height="4.67" fill="#FFCE00"/>',
  "Países Bajos": '<rect width="20" height="14" fill="#fff"/><rect width="20" height="4.67" fill="#AE1C28"/><rect y="9.33" width="20" height="4.67" fill="#21468B"/>',
  Irlanda: '<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#169B62"/><rect x="13.33" width="6.67" height="14" fill="#FF883E"/>',
  "Reino Unido": '<rect width="20" height="14" fill="#012169"/><path d="M0 0L20 14M20 0L0 14" stroke="#fff" stroke-width="2.8"/><path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" stroke-width="1"/><path d="M10 0V14M0 7H20" stroke="#fff" stroke-width="4.2"/><path d="M10 0V14M0 7H20" stroke="#C8102E" stroke-width="2.4"/>',
  Polonia: '<rect width="20" height="14" fill="#DC143C"/><rect width="20" height="7" fill="#fff"/>',
  "Estados Unidos": '<rect width="20" height="14" fill="#fff"/>' + [0, 1, 2, 3, 4, 5, 6].map((k) => `<rect y="${(k * 2 * 14) / 13}" width="20" height="${14 / 13}" fill="#B22234"/>`).join("") + '<rect width="8.5" height="7.54" fill="#3C3B6E"/>',
  México: '<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#006847"/><rect x="13.33" width="6.67" height="14" fill="#CE1126"/><circle cx="10" cy="7" r="1.7" fill="#8C6A3F"/>',
  Colombia: '<rect width="20" height="14" fill="#CE1126"/><rect width="20" height="7" fill="#FCD116"/><rect y="7" width="20" height="3.5" fill="#003893"/>',
  Argentina: '<rect width="20" height="14" fill="#74ACDF"/><rect y="4.67" width="20" height="4.67" fill="#fff"/><circle cx="10" cy="7" r="1.5" fill="#F6B40E"/>',
};
{
  const v3 = (a, b, c) => `<rect width="20" height="14" fill="${b}"/><rect width="6.67" height="14" fill="${a}"/><rect x="13.33" width="6.67" height="14" fill="${c}"/>`,
    h3 = (a, b, c) => `<rect width="20" height="14" fill="${b}"/><rect width="20" height="4.67" fill="${a}"/><rect y="9.33" width="20" height="4.67" fill="${c}"/>`,
    nx = (bg, cr, in2) => `<rect width="20" height="14" fill="${bg}"/><rect x="5" width="3" height="14" fill="${cr}"/><rect y="5.5" width="20" height="3" fill="${cr}"/>${in2 ? `<rect x="5.9" width="1.2" height="14" fill="${in2}"/><rect y="6.4" width="20" height="1.2" fill="${in2}"/>` : ""}`;
  FLAGS[EUANY] = '<rect width="20" height="14" fill="#003399"/>' + [...Array(12)].map((_, k) => `<circle cx="${(10 + 4.2 * Math.sin((k * Math.PI) / 6)).toFixed(2)}" cy="${(7 - 4.2 * Math.cos((k * Math.PI) / 6)).toFixed(2)}" r="0.65" fill="#FFCC00"/>`).join("");
  Object.assign(FLAGS, {
    Italia: v3("#009246", "#fff", "#CE2B37"),
    Austria: h3("#C8102E", "#fff", "#C8102E"),
    Bulgaria: h3("#fff", "#00966E", "#D62612"),
    Chequia: '<rect width="20" height="14" fill="#D7141A"/><rect width="20" height="7" fill="#fff"/><path d="M0 0L9 7L0 14Z" fill="#11457E"/>',
    Chipre: '<rect width="20" height="14" fill="#fff"/><ellipse cx="10" cy="6.5" rx="4" ry="2" fill="#D57800"/><path d="M7 10.5h6" stroke="#4E5B31" stroke-width="1"/>',
    Croacia: h3("#FF0000", "#fff", "#171796"),
    Dinamarca: nx("#C8102E", "#fff"),
    Eslovaquia: h3("#fff", "#0B4EA2", "#EE1C25"),
    Eslovenia: h3("#fff", "#005DA4", "#ED1C24"),
    Estonia: h3("#0072CE", "#000", "#fff"),
    Finlandia: nx("#fff", "#002F6C"),
    Grecia: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<rect y="${(k * 14) / 9}" width="20" height="${14 / 9}" fill="${k % 2 ? "#fff" : "#0D5EAF"}"/>`).join("") + '<rect width="7.8" height="7.8" fill="#0D5EAF"/><rect x="3.1" width="1.6" height="7.8" fill="#fff"/><rect y="3.1" width="7.8" height="1.6" fill="#fff"/>',
    Hungría: h3("#CE2939", "#fff", "#477050"),
    Letonia: '<rect width="20" height="14" fill="#9E3039"/><rect y="5.6" width="20" height="2.8" fill="#fff"/>',
    Lituania: h3("#FDB913", "#006A44", "#C1272D"),
    Luxemburgo: h3("#EF3340", "#fff", "#00A3E0"),
    Malta: '<rect width="20" height="14" fill="#CF142B"/><rect width="10" height="14" fill="#fff"/>',
    Noruega: nx("#BA0C2F", "#fff", "#00205B"),
    Rumanía: v3("#002B7F", "#FCD116", "#CE1126"),
    Suecia: nx("#006AA7", "#FECC02"),
  });
}
const flagSVG = (c) => (FLAGS[c] ? `<svg class="flag" viewBox="0 0 20 14" aria-hidden="true" focusable="false">${FLAGS[c]}</svg>` : "");
/* lists of names read in alphabetical order (scales such as months, hours, levels or contract types keep their own order);
   options that are not names («Contratar a alguien nuevo», «Para el equipo») stay where they were, first or last */
const DDSORT = /^(ptype|rcat|rpos|crc|asktool|askwhere|askfid|askpid|pf-cat|pf-fid|pf-who|pf-country|pcountry|country-|pfid|licopt|pxsel|asgs|asgp|asg-|tlead|pteam|irl)/;
const PINNED = new Set(["", "new", "reg", "team", "none", "other", "custom", "all", "auto"]);
function ddSort(options) {
  const out = [];
  let seg = [];
  const flush = () => {
    if (!seg.length) return;
    const head = [], tail = [], mid = [];
    seg.forEach((o, i) => (o[0] === EUANY ? head : PINNED.has(String(o[0])) ? (i < seg.length / 2 ? head : tail) : mid).push(o));
    mid.sort((a, b) => String(a[1]).localeCompare(String(b[1]), "es", { sensitivity: "base" }));
    out.push(...head, ...mid, ...tail);
    seg = [];
  };
  options.forEach((o) => {
    if (String(o[0]).startsWith("§")) {
      flush();
      out.push(o);
    } else seg.push(o);
  });
  flush();
  return out;
}
const ddHTML = ({ id, value, options, placeholder = "", disabled = false, ariaLabel = "", size = "big", shown = "" }) => {
  if (DDSORT.test(id)) options = ddSort(options);
  DDR[id] = { options, value, placeholder, size, ariaLabel };
  /* a single option that is already chosen leaves nothing to pick: shown, not openable */
  const real = options.filter((o) => !String(o[0]).startsWith("§"));
  if (real.length === 1 && real[0][0] === value) disabled = true;
  const t = shown || ddLabel(id, value);
  return `<button type="button" id="${id}" class="dsel ${size === "sm" ? "sm" : "big md"}" data-dd="${id}" aria-haspopup="listbox" aria-expanded="false"${ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""} ${disabled ? "disabled" : ""}><span class="ddt${t ? "" : " ddph"}">${flagSVG(t)}${esc(t || placeholder)}</span>${I("angle-down")}</button>`;
};
const ddSync = (id) => {
  const b = document.getElementById(id),
    r = DDR[id];
  if (!b || !r) return;
  const t = ddLabel(id, r.value),
    s = b.querySelector(".ddt");
  s.innerHTML = flagSVG(t) + esc(t || r.placeholder);
  s.classList.toggle("ddph", !t);
};
const ddList = () => document.querySelector(".ddl");
function ddClose(focus) {
  const l = ddList(),
    id = V.dd;
  if (l) l.remove();
  V.dd = null;
  if (!id) return;
  const b = document.getElementById(id);
  if (b) {
    b.setAttribute("aria-expanded", "false");
    b.querySelector("use")?.setAttribute("href", "#u-angle-down");
    if (focus) b.focus({ preventScroll: true });
  }
}
function ddOpen(b, focusOpt) {
  if (b.disabled) return;
  ddClose();
  const id = b.dataset.dd,
    r = DDR[id];
  if (!r) return;
  V.dd = id;
  b.setAttribute("aria-expanded", "true");
  b.querySelector("use")?.setAttribute("href", "#u-angle-up");
  const l = document.createElement("div");
  l.className = "ddl";
  l.setAttribute("role", "listbox");
  l.setAttribute("aria-label", r.ariaLabel || ddLabel(id, r.value) || r.placeholder);
  l.innerHTML = r.options
    .map(
      ([v, t, dis]) =>
        v.startsWith("§")
          ? `<div class="ddg" role="presentation">${esc(t)}</div>`
          : `<div class="ddo" role="option" tabindex="-1" data-ddv="${esc(v)}" aria-selected="${v === r.value}"${dis ? ' aria-disabled="true"' : ""}><span class="ddot">${flagSVG(t)}${esc(t)}</span>${v === r.value ? I("check") : ""}</div>`,
    )
    .join("");
  /* long lists: a search box on top, so typing takes you to the option */
  const long = r.options.filter((o) => !String(o[0]).startsWith("§")).length > 12;
  if (long) {
    const sw = document.createElement("div");
    sw.className = "dds";
    sw.innerHTML = `<input class="dds-i" type="search" placeholder="Buscar…" aria-label="Buscar en la lista" autocomplete="off"/>`;
    l.prepend(sw);
    const inp = sw.firstChild;
    inp.oninput = () => {
      const q = norm(inp.value);
      let any = false,
        grp = null,
        gAny = false;
      const flush = () => {
        if (grp) grp.hidden = !gAny;
      };
      [...l.children].forEach((c) => {
        if (c.classList.contains("ddg")) {
          flush();
          grp = c;
          gAny = false;
        } else if (c.classList.contains("ddo")) {
          const ok = !q || norm(c.textContent).includes(q);
          c.hidden = !ok;
          if (ok) {
            gAny = true;
            any = true;
          }
        }
      });
      flush();
      let none = l.querySelector(".ddn");
      if (!any && !none) {
        none = document.createElement("div");
        none.className = "ddn";
        none.textContent = "Nada coincide";
        l.appendChild(none);
      } else if (any && none) none.remove();
    };
  }
  document.body.appendChild(l);
  /* inside a scrolling sheet, scroll the field up so the list opens below it instead of covering the label */
  const sc = b.closest(".sheet");
  if (sc && sc.scrollHeight > sc.clientHeight) {
    const a0 = b.getBoundingClientRect(),
      vv0 = window.visualViewport,
      room = (vv0 ? vv0.height + vv0.offsetTop : innerHeight) - a0.bottom - 12,
      need = Math.min(320, l.scrollHeight + 14) - room,
      top0 = sc.getBoundingClientRect().top + 72;
    if (need > 0) {
      const can = Math.min(need, a0.top - top0, sc.scrollHeight - sc.clientHeight - sc.scrollTop);
      if (can > 0) {
        V.ddScrollAt = Date.now();
        sc.scrollTop += can;
      }
    }
  }
  const a = b.getBoundingClientRect(),
    w = Math.max(a.width, r.size === "sm" ? 200 : 0);
  l.style.width = w + "px";
  l.style.left = Math.max(8, Math.min(a.left, innerWidth - 8 - w)) + "px";
  const vv = window.visualViewport,
    below = (vv ? vv.height + vv.offsetTop : innerHeight) - a.bottom - 12,
    above = a.top - 12,
    h = l.scrollHeight + 14;
  if (h > below && above > below && !(sc && below >= 160)) {
    l.style.maxHeight = Math.min(320, above) + "px";
    l.style.top = Math.max(8, a.top - 4 - Math.min(h, 320, above)) + "px";
  } else {
    l.style.maxHeight = Math.min(320, Math.max(below, 120)) + "px";
    l.style.top = a.bottom + 4 + "px";
  }
  const si = l.querySelector(".dds-i");
  if (si && (!focusOpt || !r.value) && matchMedia("(hover:hover)").matches) si.focus({ preventScroll: true });
  else if (focusOpt) {
    const o = l.querySelector('[aria-selected="true"]') || l.querySelector(".ddo:not([aria-disabled])");
    o?.focus({ preventScroll: true });
    o?.scrollIntoView({ block: "nearest" });
  } else l.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
}
function ddPick(id, v) {
  const r = DDR[id];
  ddClose(true);
  if (!r || r.value === v) return;
  r.value = v;
  ddSync(id);
  const d = V.draft;
  if (id === "ptype") {
    d.type = v;
    d.typeErr = false;
    render();
  } else if (id === "crc") d.cat = v;
  else if (id === "irl") {
    d.role = v;
    const sc = document.getElementById("isc");
    if (d.role === "Administrador global") {
      d.scope = "Todas";
      DDR.isc.value = "Todas";
      ddSync("isc");
      sc.disabled = true;
    } else sc.disabled = false;
  } else if (id === "isc") d.scope = v;
  else if (id.startsWith("country-")) {
    P().roles[id.slice(8)].country = v;
    save();
    render();
  } else if (id === "paipref" || id === "pct") {
    d[id === "pct" ? "ct" : "aiPref"] = v;
    render();
  } else if (id.startsWith("pf-")) {
    const d = V.draft,
      k = id.slice(3);
    if (k === "cat") {
      if (d.cat !== v) Object.assign(d, { cat: v, fid: "", tools: [], who: "new" });
    } else if (k === "fid") {
      if (d.fid !== v) Object.assign(d, { fid: v, tools: defTools(v, P()), who: "new", err: "", lvl: "" });
    } else d[k] = v;
    render();
  } else if (id === "pext") {
    V.draft.ext = v;
    render();
  } else if (id === "pstart") {
    d.smode = v === "now" ? "now" : "pick";
    if (v !== "now") d.start = v;
  }
  else if (id === "pcountry") d.country = v;
  else if (id === "lvp") { d.sel = v; d.err = ""; render(); }
  else if (id === "plvl") { d.lvl = v; render(); }
  else if (id === "lvr") { d.why = v; }
  else if (id === "asgp") { d.sel = v; d.slot = ""; d.err = ""; render(); }
  else if (id === "asgs") { d.slot = v; d.err = ""; render(); }
  else if (id === "pxsel") {
    d.sel = v;
    d.err = "";
  } else if (id.startsWith("rtf-")) {
    d.people[Number(id.slice(4))].fid = v;
    { const b = document.querySelector("#modal [data-regadd]"); if (b) { const l = d.people[d.people.length - 1]; b.disabled = !(l && l.n.trim() && l.fid); } }
  } else if (id.startsWith("rchg-")) {
    const pr = P(),
      i = Number(id.slice(5)),
      old = pr.roles[i];
    if (old && old.id !== v) {
      pr.roles[i] = Object.assign(mkRole(v, old.n, old.hours), { ct: old.ct, up: old.up, fill: old.fill, ai: old.ai });
      save();
      render();
    }
  } else if (id === "asktool") {
    V.draft.opt = v;
    V.draft.err = "";
    /* asked from a person's menu: keep that person chosen unless they already have this program */
    V.draft.whoIds = V.draft.forPid && toolReqPeople(v).some(({ x, has }) => x.id === V.draft.forPid && !has) ? [V.draft.forPid] : [];
    render();
  } else if (id === "rcat") {
    V.rcat = v;
    V.rpos = "";
    render();
  } else if (id === "rpos") {
    V.rpos = v;
    render();
  } else if (id === "askwhere") {
    if (v === "new") {
      V.askBack = V.draft;
      if (D.setup) V.draft = newDraft();
      else V.draft = { name: "", err: "" };
      V.modal = D.setup ? "new" : "setup";
    } else V.draft.where = v;
    render();
  } else if (id === "askpid") {
    V.draft.pid = v;
    V.draft.err = "";
    render();
  } else if (id === "askfid") {
    V.draft.fid = v;
    V.draft.err = "";
    render();
  } else if (id === "mvs") {
    d.slot = v;
    d.err = "";
    render();
  } else if (id === "licopt") {
    d.opt = v;
    d.err = "";
    render();
  } else if (id === "pfid") {
    d.fid = v;
    d.asg = "";
    render();
  } else if (id === "pasg") {
    d.asg = v;
    render();
  } else if (id === "pteam") [d.team, d.unit] = v.split("||");
  else if (id === "tlead") { d.lead = v; d.sel = []; }
  else if (id.startsWith("src-") || id.startsWith("asg-")) {
    const [ri, i] = id.slice(4).split("-").map(Number),
      pr = P(),
      r = pr && pr.roles[ri];
    if (!r || !r.fill || !r.fill[i]) return;
    /* Dirección can give the seat to someone of another team or decide to hire instead (it then counts as new investment) */
    if (id.startsWith("asg-")) r.fill[i] = v === "new" ? { src: "new", byBoard: true } : { src: "other", ...(v ? { pid: v } : {}) };
    else {
      const [src, pid] = v.split(":");
      r.fill[i] = pid ? { src, pid } : { src };
    }
    save();
    render();
  }
}
document.addEventListener(
  "pointerdown",
  (e) => {
    if (!V.dd || e.target.closest(".ddl") || e.target.closest(`[data-dd="${V.dd}"]`)) return;
    ddClose();
    if (!e.target.closest(".dsel")) {
      V._ddSwallow = true;
      setTimeout(() => (V._ddSwallow = false), 400);
    }
  },
  true,
);
document.addEventListener(
  "click",
  (e) => {
    if (V._ddSwallow) {
      V._ddSwallow = false;
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    const o = e.target.closest(".ddo");
    if (o) {
      e.stopPropagation();
      if (o.getAttribute("aria-disabled") !== "true") ddPick(V.dd, o.dataset.ddv);
      return;
    }
    const b = e.target.closest("[data-dd]");
    if (b) {
      e.stopPropagation();
      if (V.dd === b.dataset.dd) ddClose(true);
      else ddOpen(b);
    }
  },
  true,
);
document.addEventListener(
  "keydown",
  (e) => {
    const t = e.target.closest ? e.target.closest("[data-dd]") : null;
    if (t && !V.dd && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      e.stopPropagation();
      ddOpen(t, true);
      return;
    }
    if (!V.dd) return;
    const l = ddList(),
      opts = l ? [...l.querySelectorAll(".ddo:not([aria-disabled]):not([hidden])")] : [],
      inSearch = document.activeElement && document.activeElement.classList.contains("dds-i"),
      cur = opts.indexOf(document.activeElement);
    const go = (i) => {
      const o = opts[Math.max(0, Math.min(opts.length - 1, i))];
      o?.focus({ preventScroll: true });
      o?.scrollIntoView({ block: "nearest" });
    };
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      ddClose(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      e.stopImmediatePropagation();
      ddClose(true);
    } else if (inSearch && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (opts[0]) ddPick(V.dd, opts[0].dataset.ddv);
    } else if (inSearch && (e.key === "Home" || e.key === "End" || e.key.length === 1)) {
      return;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      go(cur + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      go(cur < 0 ? opts.length - 1 : cur - 1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      go(e.key === "Home" ? 0 : opts.length - 1);
    } else if ((e.key === "Enter" || e.key === " ") && document.activeElement.classList.contains("ddo")) {
      e.preventDefault();
      e.stopPropagation();
      const o = document.activeElement;
      if (o.getAttribute("aria-disabled") !== "true") ddPick(V.dd, o.dataset.ddv);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase(),
        n = opts.findIndex((o, i) => i > cur && o.textContent.toLowerCase().startsWith(k)),
        m = n >= 0 ? n : opts.findIndex((o) => o.textContent.toLowerCase().startsWith(k));
      if (m >= 0) go(m);
    }
  },
  true,
);
document.addEventListener("keyup", (e) => {
  if (e.key === " " && e.target.closest && e.target.closest("[data-dd]")) e.preventDefault();
});
document.addEventListener(
  "scroll",
  (e) => {
    if (V.dd && !(e.target.closest && e.target.closest(".ddl")) && !(V.ddScrollAt && Date.now() - V.ddScrollAt < 300)) ddClose();
  },
  true,
);
addEventListener("resize", () => {
  V.dd && ddClose();
  const n = matchMedia("(max-width:900px)").matches;
  if (n !== V.wasNarrow) {
    V.wasNarrow = n;
    if (V.view === "project") render();
  }
});
/* «Descargar PDF»: the proposal is drawn into a real A4 PDF in the page (html2pdf) and handed to the viewer's download.
   Inside claude.ai downloads go through the page's downloads capability; opened as a file, through a normal link. */
let _pdfLib;
const loadPdfLib = () =>
  (_pdfLib =
    _pdfLib ||
    new Promise((ok, ko) => {
      if (window.html2pdf) return ok();
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      sc.onload = () => ok();
      sc.onerror = () => {
        _pdfLib = null;
        ko(new Error("lib"));
      };
      document.head.appendChild(sc);
    }));
async function exportPDF(btn) {
  const el = document.querySelector(".paper"),
    pr = P();
  if (!el || !pr || V.pdfBusy) return;
  V.pdfBusy = true;
  const label = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="ispin sm" aria-hidden="true"></span>Preparando PDF…`;
  }
  const filename = `Propuesta ${pr.name.replace(/[\\/:*?"<>|]/g, "")}.pdf`;
  let msg = "";
  try {
    await loadPdfLib();
    document.body.classList.add("pdfing");
    /* a heading never stays alone at the foot of a page: it travels with the short block under it */
    el.querySelectorAll("h2").forEach((h) => {
      const n = h.nextElementSibling;
      if (!n || n.offsetHeight > 420) return;
      const w = document.createElement("div");
      w.className = "xkeep";
      h.before(w);
      w.append(h, n);
    });
    const blob = await window
      .html2pdf()
      .set({
        margin: [12, 12, 14, 12],
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["tr", "h2", ".xkeep", ".xcov", "li"] },
      })
      .from(el)
      .outputPdf("blob");
    document.body.classList.remove("pdfing");
    render();
    const dl = window.claude && window.claude.use ? await window.claude.use("downloads").catch(() => null) : null;
    if (dl) {
      try {
        await dl.save({ filename, data: blob });
        msg = "PDF descargado";
      } catch (e) {
        msg = e && e.code === "declined" ? "" : "No se ha podido descargar el PDF";
      }
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 4000);
      msg = "PDF descargado";
    }
  } catch (e) {
    document.body.classList.remove("pdfing");
    msg = "No se ha podido preparar el PDF. Inténtalo de nuevo.";
  }
  V.pdfBusy = false;
  if (btn && btn.isConnected) {
    btn.disabled = false;
    btn.innerHTML = label;
  }
  if (msg) {
    V.toast = msg;
    render();
  }
}
function render() {
  _render();
  try { chipsPass(); } catch (e) {}
  try { pillTips(); } catch (e) {}
  try { headerPass(); } catch (e) {}
  try { tabsFade(); } catch (e) {}
  /* the account menu opens over the demo chip: hide the chip while it's open */
  document.body.classList.toggle("acctopen", V.menu === "side");
}
/* tabs that scroll sideways fade at the edge that has more, so hidden tabs are discoverable */
function tabsFade() {
  document.querySelectorAll(".tabs").forEach((t) => {
    const upd = () => {
      t.classList.toggle("more-r", t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
      t.classList.toggle("more-l", t.scrollLeft > 2);
    };
    upd();
    t.onscroll = upd;
  });
}
addEventListener("resize", () => { try { tabsFade(); } catch (e) {} });
const acctMenu = (cls) =>
  `<div class="${cls}" role="menu"><div class="am1"><b>${esc(ME().name)}</b><small>${esc(ME().role)}</small></div><button role="menuitem" data-profile><span>Perfil</span></button><button role="menuitem" class="amlang2" data-langopen><span>Idioma</span><em class="notr">${LANG === "en" ? flagSVG("Reino Unido") + "English" : flagSVG("España") + "Español"}</em>${I("angle-right")}</button></div>`;
const VIEWT = {
  home: "Inicio",
  tasks: "Tareas pendientes",
  notes: "Notificaciones",
  projects: "Proyectos",
  people: "Personas",
  licenses: "Software e IA",
  settings: "Ajustes",
  export: "Propuesta",
};
/* focus: a stable key for the focused element, to give focus back after every re-render */
const focusKey = (el) => {
  if (!el || el === document.body || !el.closest) return null;
  const root = el.closest("#modal,#side,#top,#app");
  if (!root) return null;
  const attrs = el.getAttributeNames().filter((n) => (n.startsWith("data-") && n !== "data-sl" && n !== "data-tt") || n === "id" || n === "aria-label");
  return {
    root: root.id,
    tag: el.tagName,
    attrs: attrs.map((n) => [n, el.getAttribute(n)]),
    sel: el.selectionStart != null && el.type !== "checkbox" ? [el.selectionStart, el.selectionEnd] : null,
  };
};
const findKey = (k) => {
  const root = document.getElementById(k.root);
  if (!root) return null;
  const q = k.tag.toLowerCase() + k.attrs.map(([n, v]) => `[${n}="${CSS.escape(v)}"]`).join("");
  const el = root.querySelector(q);
  if (el || !k.attrs.some(([n]) => n === "aria-label" || n === "placeholder")) return el;
  const q2 = k.tag.toLowerCase() + k.attrs.filter(([n]) => n !== "aria-label" && n !== "placeholder").map(([n, v]) => `[${n}="${CSS.escape(v)}"]`).join("");
  return q2 === k.tag.toLowerCase() ? null : root.querySelector(q2);
};
const focusEl = (el, k) => {
  if (!el) return false;
  el.focus({ preventScroll: true });
  if (k && k.sel)
    try {
      el.setSelectionRange(k.sel[0], k.sel[1]);
    } catch (e) {}
  return document.activeElement === el;
};
function _render() {
  ddClose();
  if (V.view === "notes") {
    if (V.notesPrev == null) {
      V.notesPrev = D.seenAt || 0;
      D.seenAt = Date.now();
      save();
    }
  } else V.notesPrev = null;
  const prevFocus = focusKey(document.activeElement),
    wasModal = V._lastModal;
  const { navs, sel } = shell();
  document.getElementById("side").innerHTML =
    `<button class="brandrow" data-nav="home" aria-label="HUMAIN · Ir a Inicio"><img class="iso" src="brand/isotipo.svg" alt=""/><img class="logo" src="brand/logo-marfil-bold.png" alt="HUMAIN"/></button>${sel}<nav>${navs}</nav>${D.demo ? `<div class="sdemo" role="group" aria-label="Demo: ver como"><small>Demo · ver como</small><div class="sdseg"><button data-as="m:${esc((D.managers[0] || {}).name || "")}" aria-pressed="${D.as !== "board"}">Responsable</button><button data-as="board" aria-pressed="${D.as === "board"}">Dirección</button></div><button class="sdreset" data-demoreset>Reiniciar la demo</button></div>` : ""}<div class="sacct">${V.menu === "side" ? acctMenu("amenu up") : ""}<div class="sarow"><button class="accbtn" data-acct="side" aria-haspopup="menu" aria-expanded="${V.menu === "side"}"><span class="av">${meIni()}</span><span class="wsn"><b>${esc(ME().name)}</b><small>${multi() || D.demo ? esc(ME().role) : `<span class="wsav xs" aria-hidden="true">${D.logo ? `<img src="${esc(D.logo)}" alt=""/>` : esc(initials(D.org).slice(0, 1))}</span>${esc(D.org)} · ${esc(ME().role)}`}</small></span></button></div></div>`;
  document.getElementById("demo").innerHTML = demoHTML();
  document.getElementById("top").innerHTML =
    `<button class="ib dk mob" data-hamb aria-label="Menú">${I("bars")}</button><button class="isob mob" data-nav="home" aria-label="HUMAIN · Ir a Inicio"><img class="wm" src="brand/logo-marfil-bold.png" alt="HUMAIN"/></button><span class="mob" style="flex:1"></span><span class="bwrap mob">${bell()}</span><button class="av" data-acct="top" aria-label="Tu cuenta" aria-expanded="${V.menu === "top"}">${meIni()}</button>${V.menu === "top" ? acctMenu("amenu") : ""}`;
  document.body.classList.toggle("navopen", V.nav);
  if (V.view === "project" && !P()) V.view = "projects";
  if (V.view === "export" && !P()) V.view = "projects";
  const pg =
    {
      home: pageHome,
      projects: pageProjects,
      people: pagePeople,
      licenses: pageLicenses,
      settings: pageSettings,
      project: pageProject,
      notes: pageNotes,
      tasks: pageTasks,
      export: pageExport,
    }[V.view] || pageHome;
  document.body.classList.toggle("exp", V.view === "export");
  document.getElementById("app").innerHTML = pg();
  syncBar();
  document.title = (V.view === "project" && P() ? P().name : VIEWT[V.view] || "HUMAIN") + " · HUMAIN";
  const m = document.getElementById("modal"),
    prevSheet = m.querySelector(".sheet"),
    keepTop = prevSheet ? prevSheet.scrollTop : 0,
    keepModal = V._lastModal === V.modal;
  V._lastModal = V.modal;
  if (V.modal === "new" || V.modal === "edit") {
    const d = V.draft,
      edit = V.modal === "edit",
      step = edit ? 1 : d.step || 1,
      og = d.months === 0,
      months12 = [...Array(12)].map((_, i) => {
        const x = new Date(new Date().getFullYear(), new Date().getMonth() + i + 1, 1);
        return [monthKey(x), cap1(x.toLocaleDateString(LOC(), { month: "long", year: "numeric" }))];
      });
    const budgetF = `<div class="field"><label for="pb">Presupuesto <small class="opt-l">Opcional</small></label><div class="inu"><input id="pb" class="big md" inputmode="numeric" value="${d.budget ? numFmt(d.budget) : ""}" placeholder="0" aria-describedby="pbh"/><span class="u" aria-hidden="true">${og ? "€/mes" : "€"}</span></div><p class="note fh" id="pbh">${og ? "Lo máximo de inversión nueva al mes." : "Lo máximo de inversión nueva en todo el proyecto."} Te avisamos si la propuesta se pasa.</p></div>`;
    const extOk = [];
    const s1 = `${d.newTeam !== undefined ? `<div class="field"><label for="ptn">Nombre del equipo <span class="req" aria-hidden="true">*</span></label><input id="ptn" class="big md" value="${esc(d.newTeam)}" placeholder="Marketing" autocomplete="off"/></div>` : ""}<div class="field"><label for="pn">Nombre del proyecto</label><input id="pn" class="big md" value="${esc(d.name)}" placeholder="App de reservas" maxlength="${NAMEMAX}" aria-describedby="pnc"/><p class="fcount" id="pnc"><span>Corto y reconocible. Los detalles van en el objetivo.</span><span><b id="pncn">${(d.name || "").length}</b>/${NAMEMAX}</span></p></div>
  <div class="field"><label for="pgoal">Objetivo <small class="opt-l">Opcional</small></label><textarea id="pgoal" class="big md" rows="2" maxlength="300" placeholder="Que los clientes reserven desde el móvil sin llamar">${esc(d.goal || "")}</textarea><p class="note fh" id="pgoaln"><span>Máximo 300 caracteres · ${(d.goal || "").length}/300</span></p></div>
  <div class="field"><label for="ptype">Tipo de proyecto <span class="req" aria-hidden="true">*</span></label>${ddHTML({ id: "ptype", value: d.type || "", placeholder: "Elige un tipo", ariaLabel: "Tipo de proyecto", options: Object.entries(TYPES).map(([k, [ic, t]]) => [k, t]) })}${d.typeErr && !d.type ? `<p class="ferr" role="alert">Elige un tipo de proyecto</p>` : ""}</div>
  ${d.type === "other" ? `<div class="field"><label for="pdesc">Descríbelo</label><input id="pdesc" class="big md" value="${esc(d.desc || "")}" placeholder="Traducir la web a 5 idiomas"/><p class="note" style="margin-top:6px">Empezarás con el equipo vacío y podrás añadir los puestos tú.</p></div>` : ""}<div class="field"><label>Tamaño</label><div class="seg pz" role="radiogroup" aria-label="Tamaño">${SIZE.map(([k, t]) => `<button role="radio" data-dset="size" data-v="${k}" aria-checked="${d.size === k}">${t}</button>`).join("")}</div>${d.type && d.type !== "other" ? (() => {
    const w = workOf({ type: d.type, size: d.size || "m", months: 1 }),
      fte = String(Math.round(w.fte * 10) / 10).replace(".", ",");
    return `<p class="note fh">Unas ${Math.round(w.hours / 100) * 100 >= 1000 ? (Math.round(w.hours / 100) * 100).toLocaleString(LOC()) : Math.round(w.hours / 10) * 10} horas de trabajo: lo que hacen ${fte} personas en ${REFM[d.size || "m"]} meses. Es una estimación; podrás ajustarla.</p>`;
  })() : ""}</div>
  <div class="field"><label>Duración</label><div class="seg pz ${og ? "off" : ""}" role="radiogroup" aria-label="Duración">${[[3, "3 meses"], [6, "6 meses"], [12, "1 año"]]
    .map(([k, t]) => `<button role="radio" data-dset="months" data-v="${k}" aria-checked="${!og && !d.dk && d.months === k}" ${og ? "disabled" : ""}>${t}</button>`)
    .join("")}<button role="radio" data-dset="dk" data-v="1" aria-checked="${!og && !!d.dk}" ${og ? "disabled" : ""}>No lo sé</button></div>${!og && d.dk ? `<p class="note fh">Se toma la duración típica de este tamaño: ${plazo({ months: REFM[d.size || "m"] || 6 }).toLowerCase()}.</p>` : ""}
  <label class="ownchk pzc"><input type="checkbox" data-ongoing ${og ? "checked" : ""}/><span>Es un servicio continuo<small>Sin fecha de fin: un equipo estable que se paga cada mes, como un mantenimiento.</small></span></label></div>
  <div class="field"><label>Empieza</label>${ddHTML({ id: "pstart", value: d.smode === "pick" && d.start ? d.start : "now", ariaLabel: "Cuándo empieza", options: [["now", "Este mes · " + new Date().toLocaleDateString(LOC(), { month: "long", year: "numeric" })], ...months12] })}</div>`;
    const emp = d.type === "other" || d.empty === "1";
    const s2 = `${d.type === "other" ? "" : `<div class="field"><label id="eql">Cómo montas el equipo</label><div class="opcards" role="radiogroup" aria-labelledby="eql"><button type="button" class="opcard" role="radio" data-dset="empty" data-v="" aria-checked="${!emp}"><i class="opic" aria-hidden="true">${I("robot")}</i><span class="optx"><b>Propuesta de HUMAIN</b><span>Te proponemos equipo, programas e IA para el proyecto.</span></span><i class="opdot" aria-hidden="true"></i></button><button type="button" class="opcard" role="radio" data-dset="empty" data-v="1" aria-checked="${emp}"><i class="opic" aria-hidden="true">${I("pen")}</i><span class="optx"><b>Lo monto yo</b><span>Empiezas en blanco y añades a cada persona.</span></span><i class="opdot" aria-hidden="true"></i></button></div></div>`}
  ${budgetF}
  <button class="advbtn advcard" data-nadv aria-expanded="${!!d.adv}" aria-controls="nadv"><span class="advic" aria-hidden="true">${I("setting")}</span><span class="advt">Ajustes por defecto<small>${esc([...(emp ? [] : [d.startFrom === "new" ? "Todo nuevo" : "Primero tu equipo", { rec: "IA recomendada", own: "Solo IA que ya tenéis", none: "Sin IA" }[d.aiPref || "rec"]]), { remote: "Remoto", hybrid: "Híbrido", onsite: "Presencial" }[d.mod || "remote"], d.country || ENT(d.ent).country, { auto: "contrato automático", emp: "empleados", free: "freelance" }[d.ct || "auto"]].join(" · "))}</small></span>${I(d.adv ? "angle-up" : "angle-down")}</button>
  ${d.adv ? `<div class="advbox" id="nadv">${emp ? "" : `<div class="field advsw"><div class="advsr"><span id="sfl"><b>Empezar por mi equipo</b><small>${d.startFrom === "new" ? "Todos los puestos serán contrataciones nuevas." : "Primero las personas libres de tu equipo; lo que falte, contratación nueva."}</small></span><button type="button" class="tog" role="switch" aria-labelledby="sfl" aria-checked="${d.startFrom !== "new"}" data-dset="startFrom" data-v="${d.startFrom === "new" ? "team" : "new"}"></button></div></div>
  <div class="field"><label>IA</label>${ddHTML({ id: "paipref", value: d.aiPref || "rec", ariaLabel: "IA", options: [["rec", "Recomiéndame"], ["own", "Solo la que ya tenemos"], ["none", "Sin IA"]] })}<p class="note fh">${{ rec: "HUMAIN propone las herramientas de IA de cada puesto.", own: "Solo herramientas de IA con asientos libres que ya pagáis.", none: "Ninguna herramienta de IA." }[d.aiPref || "rec"]}</p></div>`}<div class="field"><label>Modalidad</label><div class="seg pz" role="radiogroup" aria-label="Modalidad">${[["remote", "Remoto"], ["hybrid", "Híbrido"], ["onsite", "Presencial"]].map(([k, t]) => `<button role="radio" data-dset="mod" data-v="${k}" aria-checked="${(d.mod || "remote") === k}">${t}</button>`).join("")}</div></div><div class="field"><label for="pcountry">País</label>${ddHTML({ id: "pcountry", value: d.country || ENT(d.ent).country, ariaLabel: "País", options: Object.keys(COUNTRY).map((c) => [c, c]) })}</div><div class="field"><label>Tipo de contrato</label>${ddHTML({ id: "pct", value: d.ct || "auto", ariaLabel: "Tipo de contrato", options: [["auto", "Automático"], ["emp", "Empleados"], ["free", "Freelance"]] })}${(d.ct || "auto") === "auto" ? `<p class="note fh">HUMAIN elige por ti: freelance si el proyecto dura hasta 3 meses o el puesto es por horas, y empleado en el resto. Lo puedes cambiar en cada puesto.</p>` : ""}</div></div>` : ""}`;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div>${V.askBack && step === 1 ? `<button class="backl2" data-askback>${I("angle-left")}Añadir persona</button>` : ""}<h2 id="mt">${edit ? "Editar proyecto" : "Nuevo proyecto"}</h2>${edit ? "" : `<p class="shsub">Paso ${step} de 2 · ${step === 1 ? "El proyecto" : "Con qué cuentas"}</p>`}</div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  ${!edit && step === 1 && extOk.length ? `<div class="field"><label id="kql">Qué quieres hacer</label><div class="opcards" role="radiogroup" aria-labelledby="kql"><button type="button" class="opcard" role="radio" data-dset="kind" data-v="" aria-checked="${d.kind !== "ext"}"><i class="opic" aria-hidden="true">${I("folder-plus")}</i><span class="optx"><b>Proyecto nuevo</b><span>Un proyecto que aún no existe.</span></span><i class="opdot" aria-hidden="true"></i></button><button type="button" class="opcard" role="radio" data-dset="kind" data-v="ext" aria-checked="${d.kind === "ext"}"><i class="opic" aria-hidden="true">${I("user-plus")}</i><span class="optx"><b>Ampliar uno en curso</b><span>Más personas, programas o IA para un proyecto que ya funciona.</span></span><i class="opdot" aria-hidden="true"></i></button></div></div>` : ""}${!edit && d.kind === "ext" ? `<div class="field"><label for="pext">Proyecto</label>${ddHTML({ id: "pext", value: d.ext || "", placeholder: "Elige un proyecto", ariaLabel: "Proyecto", options: extOk.map((x) => [x.id, x.name]) })}</div><div class="alert info" role="note">${I("info-circle")}<span>Añades a las personas que faltan y lo envías a Dirección. El proyecto sigue como estaba aprobado.</span></div>` : step === 1 ? s1 : s2}${edit ? budgetF : ""}
  <div class="sact">${!edit && d.kind === "ext" ? `<button class="btn btn-p" ${d.ext ? `data-extend="${d.ext}"` : "disabled"}>Continuar</button>` : edit ? `<button class="btn btn-p" data-saveedit>Guardar</button>` : step === 1 ? `<button class="btn btn-p" data-nstep="2">Siguiente</button>` : `<button class="btn btn-s wide" data-nstep="1">Atrás</button><button class="btn btn-p" data-create>${emp ? "Crear proyecto" : "Generar propuesta"}</button>`}</div></div>`;
    const pn = document.getElementById("pn");
    if (pn)
      pn.oninput = (e) => {
        d.name = e.target.value;
        const c = document.getElementById("pncn");
        if (c) c.textContent = d.name.length;
      };
    const ptn = document.getElementById("ptn");
    if (ptn)
      ptn.oninput = (e) => {
        d.newTeam = e.target.value;
        const nb = document.querySelector("[data-nstep='2']");
        if (nb) nb.disabled = !(d.type && d.newTeam.trim());
      };
    const pg = document.getElementById("pgoal");
    if (pg)
      pg.oninput = (e) => {
        d.goal = e.target.value;
        const n = document.querySelector("#pgoaln span");
        if (n) n.textContent = `Máximo 300 caracteres · ${d.goal.length}/300`;
      };
    const pdz = document.getElementById("pdesc");
    if (pdz) pdz.oninput = (e) => (d.desc = e.target.value);
    const pbI = document.getElementById("pb");
    if (pbI) pbI.oninput = (e) => (d.budget = Number(e.target.value.replace(/\D/g, "")) || 0);
  } else if (V.modal === "pform") {
    const d = V.draft,
      pr = P(),
      fam = d.fid ? F(d.fid) : null,
      ordA = { ic: 0, delivery: 0, lead: 1, manager: 2, head: 3 },
      cs = CATS.filter(([cid]) => Object.values(FAM).some((f) => f.cat === cid)),
      fams = Object.values(FAM)
        .filter((f) => f.cat === d.cat)
        .sort((a, b) => ordA[a.arch] - ordA[b.arch] || a.t.localeCompare(b.t)),
      used = new Set(pr.roles.flatMap((x, a) => (a === d.ri ? [] : (x.fill || []).map((g) => g.pid).filter(Boolean)))),
      mine = fam ? (D.people || []).filter((x) => x.team === pr.owner && !used.has(x.id) && F(x.fid).cat === fam.cat && (isFree(x.id, pr.id) || x.id === d.who)) : [],
      whoOpts = [...mine.map((x) => [x.id, `${x.name} · ${F(x.fid).t}`]), ["new", "Contratar a alguien nuevo"], ["reg", "Alguien de la empresa que no está registrado en el sistema"]],
      dedOpts = [["full", "Jornada completa"], [String(HPM / 2), "Media jornada"], ["custom", "Por horas"]];
    if (d.ded !== "full" && d.ded !== "custom" && d.ded !== String(HPM / 2)) {
      d.hrs = d.hrs || String(Math.round(Number(d.ded) / 4));
      d.ded = "custom";
    }
    const rec = fam ? [...catsFor(fam.tp), ...(fam.cat in AIDESC ? ["genai"] : [])] : [],
      others = Object.keys(TC).filter((k) => k !== "pm" && k !== "chat" && !rec.includes(k)),
      row = (o) => {
        const on = d.tools.includes(o.id);
        return `<button type="button" class="msopt" role="checkbox" aria-checked="${on}" data-pft="${o.id}"><i class="mscb" aria-hidden="true">${on ? I("check") : ""}</i><span>${esc(o.n)}${isAiTool(o.id) ? `<em class="pill ai">IA</em>` : ""}<small>${o.req ? "Nuevo · lo revisa Dirección" : esc(TC[catOfOpt(o.id)].n.replace(/ para (todo )?el equipo$/, ""))}${compOpts(catOfOpt(o.id), pr).includes(o) ? " · ya lo tenéis" : ""}</small></span><span class="tp">${price(o)}</span></button>`;
      },
      grp = (t, ks) => {
        const os = ks.flatMap((k) => {
          const c = multiCat(k) ? [] : compOpts(k, pr);
          return c.length ? TC[k].opts.filter((o) => c.includes(o) || d.tools.includes(o.id)) : TC[k].opts;
        });
        return os.length ? `<div class="msg"><small>${t}</small>${os.map(row).join("")}</div>` : "";
      },
      hasAI = d.tools.some(isAiTool),
      pmN = andList(teamTools(pr));
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet pform" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">${d.ri >= 0 ? "Editar persona" : "Añadir persona"}</h2></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label>Área</label>${ddHTML({ id: "pf-cat", value: d.cat || "", placeholder: "Elige un área", ariaLabel: "Área", options: cs.map(([cid, es]) => [cid, es]) })}</div>
  <div class="field"><label>Puesto</label>${d.cat ? ddHTML({ id: "pf-fid", value: d.fid || "", placeholder: "Elige un puesto", ariaLabel: "Puesto", options: fams.map((f) => [f.id, f.t]) }) : `<div class="alert info" role="note">${I("info-circle")}<span>Elige antes el área y te mostraremos sus puestos.</span></div>`}${d.err ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}</div>
  ${
    fam
      ? `<div class="field"><label>Quién</label>${ddHTML({ id: "pf-who", value: d.who || "new", ariaLabel: "Quién", options: whoOpts })}${d.who === "reg" ? `<div class="pfreg"><label for="pf-regn">Nombre <span class="req" aria-hidden="true">*</span></label><input id="pf-regn" class="big md" value="${esc(d.regn || "")}" placeholder="Amy Clarke" autocomplete="off"/>${d.regErr ? `<p class="ferr" role="alert">Escribe su nombre.</p>` : ""}<p class="note fh">Ya trabaja en la empresa: no se contrata. La añadimos también a tu equipo en Personas.</p></div>` : mine.length || (d.who && d.who !== "new") ? "" : `<div class="alert info fh2" role="note">${I("info-circle")}<span>No tienes a nadie libre con este perfil en tu equipo, así que se contratará.</span></div>`}</div>
  ${fam.gr && fam.gr.length > 1 ? `<div class="field"><label>Nivel</label>${ddHTML({ id: "pf-lvl", value: d.lvl || (fam.arch === "lead" ? fam.gr[0] : "mid"), ariaLabel: "Nivel", options: fam.gr.map((g) => [g, GR[g][0]]) })}</div>` : ""}
  <div class="field"><label>Dedicación</label>${ddHTML({ id: "pf-ded", value: d.ded || "full", ariaLabel: "Dedicación", options: dedOpts })}${d.ded === "custom" ? `<div class="pfhrs"><input id="pf-hrs" class="hin" type="number" inputmode="numeric" min="1" max="36" value="${esc(d.hrs || "")}" placeholder="15" aria-label="Horas a la semana"/><span>horas a la semana</span></div>${d.hrsErr ? `<p class="ferr" role="alert">Pon entre 1 y 36 horas a la semana.</p>` : ""}` : ""}</div>
  <div class="field"><label id="pfpl">Programas${hasAI ? `<em class="pill ai">Con IA</em>` : ""}</label><div class="msw"><button type="button" class="dsel big md msb" data-pfp aria-expanded="${!!d.pOpen}" aria-labelledby="pfpl"><span class="ddt${d.tools.length ? "" : " ddph"}">${d.tools.length ? `${d.tools.length} ${d.tools.length === 1 ? "programa elegido" : "programas elegidos"}` : "Elige los programas"}</span>${I(d.pOpen ? "angle-up" : "angle-down")}</button>${
        d.pOpen ? `<div class="mspanel" role="group" aria-label="Programas">${grp("Para este puesto", rec)}${grp("Más programas", others)}${pfNewHTML(d)}</div>` : ""
      }</div>${d.tools.length ? `<div class="pfchips">${[...d.tools].sort(toolSort).map((id) => `<span class="pchip pfc${isAiTool(id) ? " ai" : ""}${opt(id).req ? " preq" : ""}"${short0(opt(id).n) !== opt(id).n ? ` title="${esc(opt(id).n)}"` : ""}>${esc(opt(id).n.replace(/\s*\(.*?\)/g, "").split(" · ")[0])}<button type="button" data-pft="${id}" aria-label="Quitar ${esc(opt(id).n)}">${I("times")}</button></span>`).join("")}</div>` : ""}<p class="note fh">Si eliges una IA, lleva la etiqueta «Con IA».</p></div>
  <div class="pfrow2"><div class="field"><label>País</label>${ddHTML({ id: "pf-country", value: d.country || (ENT(pr.ent) || {}).country || Object.keys(COUNTRY)[0], ariaLabel: "País", options: Object.keys(COUNTRY).map((c) => [c, c]) })}</div><div class="field"><label>Contrato</label>${ddHTML({ id: "pf-ct", value: d.ct || "emp", ariaLabel: "Tipo de contrato", options: [["emp", "Empleado"], ["free", "Freelance"], ...(d.ct === "own" ? [["own", "Plantilla interna"]] : [])] })}</div></div>
  ${(d.ct || "emp") === "free" ? (() => { const hrs = d.ded === "full" || !d.ded ? HPM : d.ded === "custom" ? Math.round(Number(d.hrs || 0) * 4) || HPM : Number(d.ded) || HPM, rr = { id: fam.id, grade: d.lvl, country: d.country, ct: "free", n: 1 }, refH = Math.round(((rateOf(rr, pr).v || 0) * ctF(rr)) / HPM), hv = Number(String(d.hrate || "").replace(/\D/g, "")) || refH; return `<div class="field"><label for="pf-hrate">Tarifa por hora <small class="opt-l">Opcional</small></label><div class="inu"><input id="pf-hrate" class="big md" inputmode="numeric" placeholder="${refH || "€"}" value="${esc(d.hrate || "")}" aria-label="Tarifa por hora"/><span class="u" aria-hidden="true">€/h</span></div><p class="note fh">${hrs} h al mes × ${eur(hv)}/h = <b>${eur(hv * hrs)}/mes</b>.${d.hrate ? "" : " Vacío, usamos la tarifa de mercado."}</p></div>`; })() : `<div class="field"><label for="pf-rate">Coste al mes <small class="opt-l">Opcional</small></label><div class="inu"><input id="pf-rate" class="big md" inputmode="numeric" placeholder="${(() => { const rr = { id: fam.id, grade: d.lvl, country: d.country, ct: d.ct || "emp", n: 1 }; const x = rateOf(rr, pr); return x.v ? eur(x.v).replace(/\s?€/, "") : "€"; })()}" value="${esc(d.rate || "")}" aria-label="Coste al mes"/><span class="u" aria-hidden="true">€/mes</span></div><p class="note fh">Si lo sabes, pon lo que cuesta de verdad a jornada completa. Vacío, usamos la referencia de mercado del nivel.</p></div>`}`
      : ""
  }
  ${""}
  <div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-p" data-pfsave>${d.ri >= 0 ? "Guardar" : "Añadir persona"}</button></div></div>`;
  } else if (V.modal === "role") {
    const q = norm(V.rq || ""),
      fams = Object.values(FAM),
      item = (f) =>
        `<div class="rpw"><button class="rp" data-addr="${f.id}"><span>${esc(f.t)}${q ? `<small>${CAT[f.cat].es}</small>` : ""}</span>${f.arch === "manager" ? '<em class="lv1">Gestión</em>' : f.arch === "head" ? '<em class="lv2">Dirección</em>' : f.custom ? "<em>Propio</em>" : ""}</button>${f.custom ? `<button class="ib s tdel" data-delrole="${f.id}" aria-label="Eliminar ${esc(f.t)} del catálogo">${I("trash-alt")}</button>` : ""}</div>`,
      ord = { ic: 0, delivery: 0, lead: 1, manager: 2, head: 3 };
    let body;
    if (q) {
      const hits = fams.filter((f) => norm(f.t + " " + f.syn + " " + CAT[f.cat].es).includes(q)).slice(0, 40);
      body = hits.length
        ? `<div class="rres">${hits.map(item).join("")}</div>`
        : `<p class="note" style="padding:8px 4px">No hay resultados para «${esc(V.rq)}». Puedes crearlo como rol personalizado.</p>`;
    } else {
      const cs = CATS.filter(([id, , feat]) => feat || V.rall),
        cur = cs.find(([id]) => id === V.rcat) ? V.rcat : cs[0][0],
        l = fams.filter((f) => f.cat === cur).sort((a, b) => ord[a.arch] - ord[b.arch]);
      body = `<div class="field rcatf"><label for="rcat">Área</label>${ddHTML({ id: "rcat", value: cur, ariaLabel: "Área", options: cs.map(([cid, es]) => [cid, es]) })}</div><div class="field"><label for="rpos">Puesto</label>${ddHTML({ id: "rpos", value: V.rpos && l.some((f) => f.id === V.rpos) ? V.rpos : "", placeholder: "Elige un puesto", ariaLabel: "Puesto", options: l.map((f) => [f.id, f.t + (f.arch === "manager" ? " · Gestión" : f.arch === "head" ? " · Dirección" : f.custom ? " · Propio" : "")]) })}</div>${V.rall ? "" : `<button class="lnk rallb" data-rall>Ver todas las áreas</button>`}`;
    }
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Añadir rol</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div><div class="rsearch"><label class="sr" for="rq">Buscar rol</label><input id="rq" class="big md" placeholder="Busca por puesto o habilidad: «ux», «react», «agentes»…" value="${esc(V.rq || "")}" autocomplete="off"/></div>${body}<div class="sact"><button class="btn btn-s wide" data-crole>Crear rol</button>${q ? "" : `<button class="btn btn-p" ${V.rpos ? `data-addr="${V.rpos}"` : "disabled"}>Añadir puesto</button>`}</div></div>`;
    const rq = document.getElementById("rq");
    rq.oninput = (e) => {
      V.rq = e.target.value;
      render();
    };
  } else if (V.modal === "crole") {
    const d = V.draft;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Crear rol personalizado</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label for="crn">Nombre del puesto</label><input id="crn" class="big md" value="${esc(d.t || "")}" placeholder="Shopify Developer"/></div>
  <div class="field"><label for="crc">Área</label>${ddHTML({ id: "crc", value: d.cat, ariaLabel: "Área", placeholder: "Elige un área", options: CATS.map(([id, es]) => [id, es]) })}</div>
  <div class="field"><label>Tipo de puesto</label><div class="chips">${[
    ["ic", "Especialista"],
    ["lead", "Liderazgo técnico"],
    ["manager", "Gestión de personas"],
    ["head", "Dirección"],
  ]
    .map(([k, t]) => `<button class="chip" data-dset="arch" data-v="${k}" aria-pressed="${d.arch === k}">${t}</button>`)
    .join("")}</div></div>
  <div class="field"><label for="crr">Coste estimado por persona al mes <small style="font-weight:400;color:var(--ink3)">· opcional</small></label><input id="crr" class="big md" inputmode="numeric" value="${d.rate || ""}" placeholder="€"/></div>
  <div class="sact"><button class="btn btn-s wide" data-backrole>Volver</button><button class="btn btn-p" data-savecrole>Crear</button></div></div>`;
    document.getElementById("crn").oninput = (e) => (d.t = e.target.value);
    document.getElementById("crr").oninput = (e) => (d.rate = Number(e.target.value.replace(/\D/g, "")) || 0);
  } else if (V.modal === "pcancel" && V.draft) {
    const d = V.draft, q = D.projects.find((x) => x.id === d.pid), b = isBoard();
    const hire = q.roles.reduce((a, r) => a + (r.fill || []).filter((f) => f && f.src === "new").length, 0),
      own = q.roles.reduce((a, r) => a + (r.fill || []).filter((f) => f && (f.src === "mine" || f.src === "shared") && f.pid).length, 0);
    const cons = [hire ? `${hire === 1 ? "Se para la contratación que faltaba" : "Se paran las " + hire + " contrataciones que faltaban"}.` : "", own ? `${own === 1 ? "La persona de la empresa queda libre" : "Las " + own + " personas de la empresa quedan libres"} para otros proyectos.` : "", "Los asientos de software e IA que usaba quedan libres.", "Quien ya se haya incorporado sigue en el equipo."].filter(Boolean);
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet cfm" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Cancelar el proyecto</h2><p class="shsub">${esc(q.name)}</p></div><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="alert warn pcxw" role="note">${I("exclamation-triangle")}<ul>${cons.map((c) => `<li>${c}</li>`).join("")}</ul></div>
  <div class="field pcxf"><label for="pcx">¿Por qué se cancela?</label><textarea id="pcx" class="big md" rows="3" placeholder="${b ? "Por ejemplo: cambian las prioridades del trimestre; lo retomamos más adelante." : "Por ejemplo: el cliente ha pospuesto el lanzamiento al año que viene."}">${esc(d.t || "")}</textarea>${d.err ? `<p class="ferr" role="alert">Explica en una frase por qué se cancela.</p>` : `<p class="fnote2">${b ? "Lo verá " + esc(q.owner.split(" ")[0]) + " en el proyecto y en su aviso." : "Lo verá Dirección en el proyecto y en su aviso."} Puedes deshacerlo justo después.</p>`}</div>
  <div class="sact"><button class="btn btn-s" data-close>Volver</button><button class="btn btn-del" data-pcancelok>Cancelar proyecto</button></div></div>`;
    document.getElementById("pcx").oninput = (e) => { d.t = e.target.value; if (d.err && d.t.trim()) { d.err = false; } };
  } else if (V.modal === "licd") {
    m.innerHTML = LSHEET ? `<div class="scrim" data-close></div><div class="sheet lsheet" role="dialog" aria-modal="true" aria-labelledby="mt">${LSHEET}</div>` : "";
    LSHEET = "";
  } else if (V.modal === "hist") {
    const hp = D.projects.find((q) => q.id === V.draft.pid), lbl = { sent: "Envía la propuesta", resent: "Reenvía con cambios", changes: "Pide cambios", reject: "Rechaza", approve: "Aprueba", cancel: "Cancela el proyecto" };
    const t = threadOf(hp).filter((x) => x.t || x.who === "b");
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Historial</h2><p class="shsub">${esc(hp.name)}</p></div><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><ol class="thrl hstl">${t
      .map((x) => {
        const b = x.who === "b";
        return `<li class="${b ? "tb" : "tm"}${x.t ? "" : " nomsg"}"><i class="thav" aria-hidden="true">${b ? I("building") : esc(initials(hp.owner))}</i><div><small><b>${b ? "Dirección" : esc(hp.owner)}</b> · ${lbl[x.k] || ""} · ${esc(fmtShort(new Date(x.ts).toISOString().slice(0, 10)))}</small>${x.t ? `<p>«${esc(x.t)}»</p>` : ""}</div></li>`;
      })
      .join("")}</ol><div class="sact hsta"><button class="btn btn-p" data-close>Cerrar</button></div></div>`;
  } else if (V.modal === "lang") {
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Idioma</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="lglist notr" role="radiogroup" aria-label="${LANG === "en" ? "App language" : "Idioma de la aplicación"}">${[["es", "España", "Español"], ["en", "Reino Unido", "English"]].map(([k, fl, nm]) => `<button type="button" class="lgopt${LANG === k ? " on" : ""}" role="radio" aria-checked="${LANG === k}" data-setlang="${k}"><span class="lgn">${flagSVG(fl)}<b>${nm}</b></span>${LANG === k ? I("check") : ""}</button>`).join("")}</div>
  <div class="sact"><button class="btn btn-p" data-close>Hecho</button></div></div>`;
  } else if (V.modal === "profile") {
    const d = V.draft;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Perfil</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="profh"><span class="profav" aria-hidden="true">${esc(initials(ME().name))}</span><span><b>${esc(ME().name)}</b><small>${esc(ME().role)} · ${esc(D.org || "")}</small></span></div>
  <div class="field"><label for="pft">Cargo</label><input id="pft" class="big md" value="${esc(d.title || "")}" maxlength="60"/></div>
  <div class="field"><label for="pfe">Correo</label><input id="pfe" class="big md" type="email" value="${esc(d.email || "")}" placeholder="nombre@empresa.com" autocomplete="email"/>${d.err ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}</div>
  <div class="field"><label for="pfph">Teléfono <small class="opt-l">Opcional</small></label><input id="pfph" class="big md" type="tel" value="${esc(d.phone || "")}" placeholder="+34 600 000 000" autocomplete="tel"/></div>
  <div class="alert info" role="note">${I("info-circle")}<span>Tu nombre y tu rol los gestiona tu empresa. Para cambiarlos, habla con Dirección.</span></div>
  <div class="sact"><button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-p" data-profsave>Guardar</button></div></div>`;
  } else if (V.modal === "move" && V.draft) {
    const d = V.draft, x = PERSON(d.sel), from = movableFrom(x.id), sl = moveSlots(x, from.map((q) => q.id)), cur = sl.find((o) => o.v === d.slot);
    const live = from.filter(isLive), dl = cur && cur.live;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Mover a otro proyecto</h2><p class="shsub">${esc(x.name)} · ${esc(F(x.fid).t)}</p></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label>Ahora está en</label><p class="mvfrom">${from.map((q) => "«" + esc(q.name) + "»").join(" y ") || "—"}</p></div>
  <div class="field"><label for="mvs">¿A qué proyecto y puesto va?</label>${sl.length ? ddHTML({ id: "mvs", value: d.slot, ariaLabel: "Proyecto y puesto", placeholder: "Elige proyecto y puesto", options: sl.map((o) => [o.v, o.l]) }) : `<div class="alert info" role="note">${I("info-circle")}<span>Ningún otro proyecto tuyo tiene una plaza de <b>${esc(CAT[F(x.fid).cat].es.toLowerCase())}</b> por cubrir.</span></div>`}${d.err ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}</div>
  ${sl.length ? `<div class="field"><label>¿Y su puesto en ${from.length === 1 ? "«" + esc(from[0].name) + "»" : "sus proyectos"}?</label><div class="seg pz" role="radiogroup" aria-label="Qué pasa con su puesto"><button type="button" role="radio" data-dset="keep" data-v="hire" aria-checked="${d.keep !== "drop"}">Contratar a otra persona</button><button type="button" role="radio" data-dset="keep" data-v="drop" aria-checked="${d.keep === "drop"}">Quitar el puesto</button></div></div>
  <div class="alert info" role="note">${I("info-circle")}<span>${live.length || dl ? `Los proyectos en marcha no cambian sin Dirección: te dejamos preparados los cambios propuestos${live.length ? " en " + live.map((q) => "«" + esc(q.name) + "»").join(" y ") : ""}${dl ? (live.length ? " y" : "") + " en «" + esc(cur.p.name) + "»" : ""} para que los envíes.` : "Los dos son borradores: el cambio se hace ya."}</span></div>` : ""}
  <div class="sact">${sl.length ? `<button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-p" data-movedo>Mover</button>` : `<button class="btn btn-s" data-close>Cerrar</button>`}</div></div>`;
  } else if (V.modal === "lic") {
    const d = V.draft;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Registrar licencia</h2><p class="shsub">Una que ya tengáis contratada. Las compras y las bajas de asientos se hacen en el panel de cada programa; aquí solo se lleva la cuenta.</p></div><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label for="licopt">Herramienta</label>${ddHTML({ id: "licopt", value: d.opt || "", ariaLabel: "Herramienta", placeholder: "Elige una herramienta", options: [...Object.keys(TC).flatMap((k) => { const os = TC[k].opts.filter((o) => o.p > 0); return os.length ? [["§" + k, TC[k].n], ...os.map((o) => [o.id, o.n])] : []; }), ["new", "Otro programa que no está en la lista"]] })}${d.err ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}</div>
  ${d.opt === "new" ? `<div class="field"><label for="licn">Nombre</label><input id="licn" class="big md" value="${esc(d.nn || "")}" placeholder="Por ejemplo: Miro Business" autocomplete="off"/></div>
  <div class="field"><label>Tipo</label><div class="seg pz" role="radiogroup" aria-label="Tipo"><button type="button" role="radio" data-dset="nai" data-v="" aria-checked="${!d.nai}">Programa</button><button type="button" role="radio" data-dset="nai" data-v="1" aria-checked="${!!d.nai}">IA</button></div></div>
  <div class="field"><label for="licp">Precio por asiento</label><div class="pfhrs"><input id="licp" class="hin" inputmode="decimal" value="${esc(d.np || "")}" placeholder="12"/><span>€ al mes</span></div></div>` : ""}
  ${d.opt && d.opt !== "new" && ADMU(d.opt) ? `<p class="lpan">${I("external-link-alt")}<span>Se contrata en ${ADML(d.opt)}</span></p>` : ""}
  ${d.opt && (d.opt === "new" || !ADMU(d.opt)) ? `<div class="field"><label for="ladm">Enlace al panel del programa <small class="opt-l">Opcional</small></label><input id="ladm" class="big md" type="url" inputmode="url" value="${esc(d.adm || "")}" placeholder="https://…" autocomplete="off"/><p class="note fh">Donde compráis y quitáis asientos. Lo enlazaremos cuando haya que hacerlo.</p></div>` : ""}
  ${multi() ? `<div class="field"><label>¿Quién la paga?</label><div class="chips">${[["group", "Todo el grupo"], ...D.entities.map((e) => [e.id, e.name])].map(([v, t]) => `<button class="chip" data-dset="scope" data-v="${v}" aria-pressed="${d.scope === v}">${esc(t)}</button>`).join("")}</div></div>` : ""}
  ${(() => {
    const n = INTGOF(d.opt),
      perSeat = !(d.opt && opt(d.opt) && (opt(d.opt).unit === "plan" || opt(d.opt).once)),
      /* who has a seat: people in HUMAIN are picked; anyone else in the company is just a number */
      ppl = (D.people || []).filter((x) => !x.leaving && (d.scope === "group" || !x.ent || x.ent === d.scope)).sort((a, b) => a.name.localeCompare(b.name, "es")),
      hold = d.hold || [],
      manual = `${perSeat ? `<div class="field"><label>¿Cuántos asientos pagas?</label>${stp('dseats="seats"', d.seats, 1, 500, "asientos")}</div>
  <div class="field"><label id="lhold">¿Quién tiene asiento? <small class="opt-l">Opcional</small></label><p class="note fh" style="margin:0 0 8px">Marca a quien ya la usa. Así sabremos cuántos quedan libres para los proyectos.</p>${d.holdOpen ? `<div class="trw tmpl" role="group" aria-labelledby="lhold">${ppl.map((x) => { const on = hold.includes(x.id); return `<button type="button" class="trwr${on ? " on" : ""}" role="checkbox" aria-checked="${on}" data-lhold="${esc(x.id)}"><span class="trwc" aria-hidden="true"></span><span class="trwn"><b>${esc(x.name)}</b><small>${esc(F(x.fid).t)}</small></span></button>`; }).join("")}</div>` : `<button type="button" class="btn btn-s sm" data-dset="holdOpen" data-v="1">${hold.length ? hold.length + " persona" + (hold.length > 1 ? "s" : "") + " elegida" + (hold.length > 1 ? "s" : "") : "Elegir personas"}</button>`}</div>
  <div class="field"><label>Personas de la empresa que no están en HUMAIN</label>${stp('dseats="other"', d.other || 0, 0, 500, "personas fuera de HUMAIN")}<p class="note fh">Usan la herramienta pero no están dadas de alta aquí.</p></div>
  ${hold.length + (d.other || 0) > d.seats ? `<p class="ferr" role="alert">Hay ${hold.length + (d.other || 0)} personas con asiento y pagas ${d.seats}. Sube los asientos o revisa quién la usa.</p>` : `<p class="note">${d.seats - hold.length - (d.other || 0)} asiento${d.seats - hold.length - (d.other || 0) !== 1 ? "s" : ""} libre${d.seats - hold.length - (d.other || 0) !== 1 ? "s" : ""} para los proyectos.</p>`}` : ""}
  <div class="sact"><button class="btn btn-p" data-savelic>Registrar</button></div>`;
    /* with an integration nothing is typed: HUMAIN reads seats, holders and renewal and keeps them up to date */
    if (d.opt && d.opt !== "new" && SYNC(d.opt))
      return `<div class="alert ok lconn">${I("check-circle")}<span><b>${esc(n)} ya está conectado</b>HUMAIN leerá los asientos, quién los tiene y la renovación, y los mantendrá al día.</span></div><div class="sact"><button class="btn btn-p" data-savelic>Registrar</button></div>`;
    if (d.opt && d.opt !== "new" && n && !d.manual)
      return `<div class="lconn2"><b>Conecta ${esc(n)} y no tendrás que meter nada a mano</b><p>HUMAIN leerá los asientos contratados, quién tiene cada uno y la renovación, y los mantendrá al día. No podrá comprar ni quitar asientos.</p></div><div class="sact"><button class="btn btn-s" data-dset="manual" data-v="1">Introducir a mano</button><button class="btn btn-p" data-licconn>Conectar ${esc(n)}</button></div>`;
    return manual;
  })()}</div>`;
  } else if (V.modal === "tool") {
    const d = V.draft;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Otra herramienta</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">${TC[d.cat].n}. Se guarda en el catálogo de la empresa y podrás usarla en cualquier proyecto.</p>
  <div class="field"><label for="tn">Nombre</label><input id="tn" class="big md" placeholder="Freepik Premium"/></div>
  <div class="field"><label for="tpr">Precio en €</label><input id="tpr" class="big md" inputmode="decimal" placeholder="0"/></div>
  <div class="field"><label>Se paga</label><div class="chips">${[
    ["seat", "Por persona al mes"],
    ["plan", "Tarifa fija al mes"],
  ]
    .map(([v, t]) => `<button class="chip" data-dset="unit" data-v="${v}" aria-pressed="${d.unit === v}">${t}</button>`)
    .join("")}</div></div>
  <div class="sact"><button class="btn btn-p" data-savetool>Añadir</button></div></div>`;
    const tn = document.getElementById("tn"),
      tp = document.getElementById("tpr");
    tn.value = d.n || "";
    tp.value = d.pe || "";
    tn.oninput = (e) => (d.n = e.target.value);
    tp.oninput = (e) => (d.pe = e.target.value);
  } else if (V.modal === "inv") {
    const [eid] = V.draft.split("|"),
      e = ENT(eid),
      ps = D.projects.filter((p) => p.ent === eid && isLive(p) && canSee(p)).map((p) => [p, cost(p)]),
      sub = ps.reduce((s, [, k]) => s + k.monthly, 0),
      vat = parseFloat(e.vat) || 0,
      tax = (sub * vat) / 100;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><span class="pill warnp">Estimado</span><h2 id="mt">Coste de ${new Date().toLocaleDateString(LOC(), { month: "long" })}</h2><p class="shsub">${esc(e.name)} · según los proyectos en curso hoy</p></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="sbody">${ps.map(([p, k]) => `<div class="igrp"><div class="igh"><b>${esc(p.name)}</b><span>${eur(k.monthly)}</span></div><div class="irow"><span>Personas · ${k.ppl}</span><span>${eur(k.people)}</span></div><div class="irow"><span>Software e IA</span><span>${eur(k.toolsM + k.saved)}</span></div>${k.api ? `<div class="irow"><span>Uso de agentes (API)</span><span>${eur(k.api)}</span></div>` : ""}${k.fee ? `<div class="irow"><span>Gestión HUMAIN</span><span>${eur(k.fee)}</span></div>` : ""}</div>`).join("")}
  <div class="tbox"><div class="irow tot"><span>Total estimado</span><span>${eur(sub)}</span></div></div>
  <p class="note">El importe final depende de las horas y del uso real de IA del mes.</p></div></div>`;
  } else if (V.modal === "trv" && V.draft && V.draft.trv) {
    const r = (D.toolReqs || []).find((x) => x.id === V.draft.trv) || personReqs(true).find((x) => x.id === V.draft.trv);
    if (!r) {
      V.modal = null;
    } else {
      const bd = isBoard(),
        o = opt(r.opt) || {},
        row = (k, v) => `<div class="trvr"><span>${k}</span><b>${v}</b></div>`;
      m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">${esc(reqName(r))}</h2><p class="shsub">${r.amend ? "Petición de persona" : "Petición de herramienta"}</p></div><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><div class="trvl">${row("Estado", `<span class="pill ${TREQ[r.status][1]}">${TREQ[r.status][0]}</span>`)}${row("Pedida por", esc(r.by))}${(() => {
        const f = (r.forName || "Para tu equipo").replace(/^Para /, "");
        return row(/^«/.test(f) ? "Proyecto" : "Equipo", esc(cap1(f))) + (r.who ? row("Para", esc(r.who)) : "");
      })()}${row("Fecha", esc(fmtShort(new Date(r.ts).toISOString().slice(0, 10))))}${row("Coste", (r.amend ? trCostP(r) : trCost(r)).replace(/<[^>]+>/g, (t) => (t === "</b>" ? " · " : "")).trim() || "—")}</div>${r.comment && r.status === "rejected" ? `<section class="rvc hasic rejected trvrv" role="status"><i class="rvic" aria-hidden="true">${I("building")}</i><div class="rvx"><small class="rvl">Respuesta de Dirección</small><p>${esc(r.comment)}</p></div></section>` : ""}${r.amend ? reqAsked(r.id) : ""}${r.why ? `<div class="just inreq reasn"><small>Motivo</small><p>${esc(r.why)}</p></div>` : ""}${(() => {
        const hide = `<button class="btn btn-g trhide" data-trhide="${r.id}">Quitar de la lista</button>`;
        const acts = bd
          ? r.status === "pending"
            ? `<button class="btn btn-s" data-trrj="${r.id}">Rechazar</button><button class="btn btn-p" data-treq="${r.id}|ok">Aprobar</button>`
            : `${hide}<button class="btn btn-s mclose" data-close>Cerrar</button>`
          : r.amend && r.status === "rejected"
            ? `${hide}<button class="btn btn-s mclose" data-close>Cerrar</button><button class="btn btn-p" data-renew="${r.id}">Ajustar y volver a pedir</button>`
            : r.status === "pending"
              ? `<button class="btn btn-s mclose" data-close>Cerrar</button><button class="btn btn-p" data-tredit="${r.id}">Editar</button>`
              : `${hide}<button class="btn btn-s mclose" data-close>Cerrar</button>`;
        return acts ? `<div class="sact">${acts}</div>` : "";
      })()}</div>`;
    }
  } else if (V.modal === "resend" && V.draft && V.draft.resend) {
    const d = V.draft,
      rp = D.projects.find((x) => x.id === d.resend);
    if (!rp) V.modal = null;
    else {
      m.innerHTML = `<div class="scrim" data-close></div><div class="sheet cfm" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Reenviar a Dirección</h2><p class="shsub">${esc(rp.name)}</p></div><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div>${rp.review && rp.review.comment ? `<section class="rvc hasic changes" style="margin:8px 24px 0" role="status"><i class="rvic" aria-hidden="true">${I("building")}</i><div class="rvx"><small class="rvl">Dirección pidió</small><p>${esc(rp.review.comment)}</p></div></section>` : ""}<div class="field" style="margin:16px 24px 0"><label for="rsr">¿Qué has cambiado? <span class="fopt">(opcional)</span></label><textarea id="rsr" class="big md" rows="3" placeholder="Por ejemplo: he quitado la licencia de Claude y dejado un solo graphic designer.">${esc(d.reply || "")}</textarea><p class="fnote2">Dirección lo verá junto al proyecto.</p></div><div class="sact"><button class="btn btn-s" data-close>Volver</button><button class="btn btn-p" data-resendok>Reenviar a Dirección</button></div></div>`;
      const ta = document.getElementById("rsr");
      ta.oninput = (e) => (d.reply = e.target.value.slice(0, 600));
      ta.focus();
    }
  } else if (V.modal === "trrj" && V.draft && V.draft.trrj) {
    const d = V.draft,
      r = (D.toolReqs || []).find((x) => x.id === d.trrj) || personReqs(true).find((x) => x.id === d.trrj);
    if (!r) V.modal = null;
    else {
      m.innerHTML = `<div class="scrim" data-close></div><div class="sheet cfm" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Rechazar petición</h2><p class="shsub">${esc(reqName(r))}</p></div><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><div class="field" style="margin:8px 24px 0"><label for="rjc">¿Por qué la rechazas?</label><textarea id="rjc" class="big md" rows="3" ${d.err ? 'aria-invalid="true" aria-describedby="rje"' : ""}>${esc(d.comment || "")}</textarea>${d.err ? `<p class="ferr" id="rje" role="alert">${esc(d.err)}</p>` : `<div class="alert info fh2" role="note">${I("info-circle")}<span>${esc(r.by.split(" ")[0])} lo verá junto a la petición rechazada.</span></div>`}</div><div class="sact"><button class="btn btn-s" ${d.from ? "data-trrjback" : "data-close"}>Volver</button><button class="btn btn-del" data-trrjok>Rechazar petición</button></div></div>`;
      const ta = document.getElementById("rjc");
      ta.oninput = (e) => (d.comment = e.target.value);
      ta.focus();
    }
  } else if (V.modal === "ent") {
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Añadir empresa</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><div class="field"><label for="en">Nombre</label><input id="en" class="big md" placeholder="SRC Portugal"/></div><div class="field"><label for="ec">País</label><input id="ec" class="big md" placeholder="Portugal"/></div><div class="sact"><button class="btn btn-p" data-saveent>Añadir</button></div></div>`;
  } else if (V.modal === "contact") {
    const d = V.draft;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Hablar con nosotros</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">Cuéntanos qué necesitas y te escribiremos.</p>
  <div class="field"><label for="cn">Nombre</label><input id="cn" class="big md" value="${esc(d.name)}" autocomplete="name"/></div>
  <div class="field"><label for="ce">Correo electrónico</label><input id="ce" class="big md" type="email" value="${esc(d.email)}" autocomplete="email"/></div>
  <div class="field"><label for="cm">Mensaje <small style="font-weight:400;color:var(--ink3)">· opcional</small></label><textarea id="cm" class="big md" rows="3">${esc(d.msg)}</textarea>${d.err ? `<p class="note" role="alert" style="margin-top:6px;color:var(--bad,#B4472B)">${esc(d.err)}</p>` : ""}</div>
  <div class="sact"><button class="btn btn-p" data-sendcontact>Enviar</button></div></div>`;
    document.getElementById("cn").oninput = (e) => (d.name = e.target.value);
    document.getElementById("ce").oninput = (e) => (d.email = e.target.value);
    document.getElementById("cm").oninput = (e) => (d.msg = e.target.value);
  } else if (V.modal === "reset") {
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet cfm" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Restaurar datos iniciales</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">Se borrarán tus proyectos, licencias, empresas y ajustes, y volverás a los datos iniciales. No se puede deshacer.</p><div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-del" data-resetok>Restaurar</button></div></div>`;
  } else if (V.modal === "setup") {
    const d = V.draft;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">¿Cómo se llama tu empresa?</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">Aparecerá en tus propuestas. Podrás cambiarlo después en Ajustes.</p>
  <div class="field"><label for="sn">Nombre de la empresa</label><input id="sn" class="big md" value="${esc(d.name)}" placeholder="Estudio Norte" autocomplete="organization" ${d.err ? 'aria-describedby="sne" aria-invalid="true"' : ""}/>${d.err ? `<p class="note" id="sne" role="alert" style="margin-top:6px;color:var(--err)">${esc(d.err)}</p>` : ""}</div>
  <div class="sact"><button class="btn btn-p" data-setupok>Continuar</button></div></div>`;
    const sn = document.getElementById("sn");
    sn.oninput = (e) => (d.name = e.target.value);
    sn.onkeydown = (e) => e.key === "Enter" && document.querySelector("[data-setupok]").click();
  } else if (V.modal === "fresh") {
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Borrar todos los datos</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">Se borrarán tus proyectos, licencias y empresas y empezarás con tu empresa vacía. No se puede deshacer.</p><div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-del" data-freshok>Borrar todo</button></div></div>`;
  } else if (V.modal === "src" && P() && P().roles[V.draft.ri] && rateOf(P().roles[V.draft.ri], P()).m) {
    m.innerHTML = srcModalHTML(P(), P().roles[V.draft.ri]);
  } else if (V.modal === "cmp" && P()) {
    m.innerHTML = cmpModalHTML(P());
  } else if (V.modal === "hired" && V.draft && D.projects.some((x) => x.id === V.draft.pid)) {
    const d = V.draft,
      q = D.projects.find((x) => x.id === d.pid),
      r = q.roles[d.ri];
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Notificar contratación</h2><p class="shsub">${dname(r)} · ${esc(q.name)}</p></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <p class="sub" style="margin-bottom:18px">Pasará a ${isBoard() ? "las Personas de " + esc(q.owner.split(" ")[0]) : "tus Personas"}, asignada a este proyecto. Si conectas la plataforma de RR. HH., llegará sola.</p>
  <div class="field"><label for="hn">Nombre de la persona <span class="req" aria-hidden="true">*</span></label><input id="hn" class="big md" value="${esc(d.name)}" placeholder="Amy Clarke" autocomplete="off" aria-required="true" ${d.err ? 'aria-describedby="hne" aria-invalid="true"' : ""}/>${d.err ? `<p class="ferr" id="hne" role="alert">${esc(d.err)}</p>` : ""}</div>
  <div class="field"><label for="hc">Lo que cuesta a la empresa <small class="opt-l">Opcional</small></label><div class="inu"><input id="hc" class="big md" inputmode="numeric" value="${d.cost ? numFmt(d.cost) : ""}" placeholder="${(() => { const v = illus({ id: r.id, grade: gradeOf(r) }, "España"); return v ? numFmt(v) : "0"; })()}"/><span class="u" aria-hidden="true">€/mes</span></div><p class="note fh">Salario y Seguridad Social. Si lo dejas vacío, se usa el coste de referencia del puesto.</p></div>
  <div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-p" data-hiredok>Notificar</button></div></div>`;
    document.getElementById("hc").oninput = (e) => (d.cost = Number(e.target.value.replace(/\D/g, "")) || 0);
    const hn = document.getElementById("hn");
    hn.oninput = (e) => (d.name = e.target.value);
    hn.onkeydown = (e) => e.key === "Enter" && document.querySelector("[data-hiredok]").click();
  } else if (V.modal === "ask" && V.draft) {
    const d = V.draft,
      live = D.projects.filter((x) => x.owner === meName() && !x.archived && ["active", "approved"].includes(stOf(x)) && !x.parent),
      isT = d.kind === "tool",
      freeMine = visPeople().filter((x) => isOpen(x.id)),
      pidOpts = [...(freeMine.length ? [["§free", "Libres en tu equipo"], ...freeMine.map((x) => [x.id, `${x.name} · ${F(x.fid).t}`])] : []), ["§other", "Otra opción"], ["reg", "Alguien que ya trabaja aquí y no está registrada"], ["new", "Contratar a alguien nuevo"]],
      reg = d.pid === "reg",
      hire = d.pid === "new",
      sameFree = d.pid === "new" && d.fid ? freeMine.filter((x) => x.fid === d.fid) : [],
      /* in a team, only the kinds of role it already has (design team: design roles, any level) */
      tcats = d.team ? areaCats(d.team) : [],
      fids = CATS.flatMap(([cid, es]) => {
        if (tcats.length && !tcats.includes(cid)) return [];
        const l = Object.values(FAM)
          .filter((f) => f.cat === cid && f.arch !== "head" && !f.exec)
          .sort((a, b) => a.t.localeCompare(b.t));
        return l.length ? [["§" + cid, es], ...l.map((f) => [f.id, f.t])] : [];
      }),
      prev = (() => {
        const src = live.find((x) => x.id === d.where);
        if (isT || !hire || !src || !d.fid) return "";
        const c = amendOf(src);
        const nr = mkRole(d.fid, 1);
        nr.ct = c.months && c.months <= 3 ? "free" : "emp";
        nr.fill = [{ src: "new" }];
        c.roles.push(nr);
        syncFill(c);
        const mo = cost(c).monthly;
        if (!mo) return "";
        return eur(mo) + "/mes · inversión nueva";
      })();
    /* the message sits under the field it is about */
    const ef = !d.err ? "" : /por qué/.test(d.err) ? "why" : /nombre/.test(d.err) ? "rn" : /puesto/.test(d.err) ? "fid" : /dónde/.test(d.err) ? "where" : /herramienta/.test(d.err) ? "opt" : /a quién/.test(d.err) ? "pid" : "",
      fe = (k) => (ef === k ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : "");
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">${isT ? "Pedir una herramienta" : d.team ? `Añadir persona a ${esc(d.team)}` : "Añadir persona"}</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  ${
    isT
      ? `<div class="field"><label for="asktool">Herramienta</label>${ddHTML({ id: "asktool", value: d.opt || "", ariaLabel: "Herramienta", placeholder: d.cat && TC[d.cat] ? "Elige en " + TC[d.cat].n.toLowerCase() : "Elige una herramienta", options: toolChoices(d.cat) })}${fe("opt") || `<p class="note fh">Con el plan que ya tiene la empresa.</p>`}</div><div class="field"><label for="askwhere">¿Para qué?</label>${ddHTML({ id: "askwhere", value: d.where || "team", ariaLabel: "Para qué", placeholder: "Elige para qué", options: [["team", "Para el equipo (uso general)"], ...(live.length ? [["§p", "Proyectos"], ...live.map((x) => [x.id, x.name])] : [])] })}<p class="note fh">Solo proyectos en curso. Para uno nuevo, elígela dentro de su propuesta.</p></div><div class="field"><label>Para quién</label>${d.opt ? `${toolReqPeople(d.opt).length > 8 ? `<div class="trsrch">${I("search")}<input type="search" class="big md" data-trq placeholder="Buscar por nombre o puesto" aria-label="Buscar personas" autocomplete="off"/></div>` : ""}<div class="trw" role="group" aria-label="Para quién">${toolReqPeople(d.opt).sort((p, q) => Number(p.has) - Number(q.has)).map(({ x, has }) => { const on = (d.whoIds || []).includes(x.id); return `<button type="button" class="trwr${on ? " on" : ""}" role="checkbox" aria-checked="${on}" data-trwp="${esc(x.id)}" ${has ? "disabled" : ""}><span class="trwc" aria-hidden="true"></span><span class="trwn"><b>${esc(x.name)}</b><small>${esc(F(x.fid).t)}</small></span>${has ? `<span class="trwt">Ya la tiene</span>` : ""}</button>`; }).join("")}</div>` : `<p class="note">Elige primero la herramienta.</p>`}</div>`
      : `<div class="field"><label for="askpid">¿Quién?</label>${ddHTML({ id: "askpid", value: d.pid, ariaLabel: "Quién", placeholder: "Elige a alguien", options: pidOpts })}${fe("pid")}</div>
  ${reg ? "" : live.length ? `<div class="field"><label for="askwhere">¿En qué proyecto?</label>${ddHTML({ id: "askwhere", value: d.where, ariaLabel: "En qué proyecto", placeholder: "Elige un proyecto", options: live.map((x) => [x.id, x.name]) })}${fe("where") || `<div class="alert info fh2" role="note">${I("info-circle")}<span>¿Es para un proyecto nuevo? Créalo primero y añade ahí a la persona.</span></div>`}</div>` : `<p class="askn"><span>No tienes ningún proyecto en marcha. <button class="lnk" data-new>Crea uno primero</button></span></p>`}
  ${
    reg
      ? `<div class="field"><label for="askrn">Nombre y apellidos</label><input id="askrn" class="big md" value="${esc(d.rname || "")}" placeholder="Amy Clarke" autocomplete="off"/>${fe("rn")}</div><div class="field"><label for="askfid">Puesto</label>${ddHTML({ id: "askfid", value: d.fid, ariaLabel: "Puesto", placeholder: "Elige un puesto", options: fids })}${fe("fid")}</div>`
      : hire
      ? `<div class="field"><label for="askfid">Puesto</label>${ddHTML({ id: "askfid", value: d.fid, ariaLabel: "Puesto", placeholder: "Elige un puesto", options: fids })}${fe("fid")}</div>
  ${sameFree.length ? `<p class="askn blk"><span><b>Ya tienes ${sameFree.length === 1 ? "a alguien libre" : sameFree.length + " personas libres"} con este puesto:</b> ${sameFree.map((x) => esc(x.name)).join(", ")}. Asígnal${sameFree.length === 1 ? "a" : "as"} a un proyecto antes de pedir a alguien nuevo.</span></p>` : ""}<div class="field"><label>Desde cuándo</label><div class="seg pz" role="radiogroup" aria-label="Desde cuándo"><button role="radio" data-dset="when" data-v="now" aria-checked="${d.when !== "next"}">Este mes</button><button role="radio" data-dset="when" data-v="next" aria-checked="${d.when === "next"}">El mes que viene</button></div></div>`
      : ""
  }`
  }
  ${isT || hire ? `<div class="field"><label for="try">Por qué la necesitas</label><textarea id="try" class="big" rows="2" placeholder="${isT ? "Qué permite hacer que hoy no podéis" : "Qué aporta al proyecto"}">${esc(d.why)}</textarea>${fe("why")}</div>` : ""}${d.err && !ef ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}
  ${prev && !hire ? `<p class="askc"><span>Coste estimado <b>${prev}</b></span></p>` : ""}
  ${isT ? "" : reg ? `<p class="askn ok">${I("check-circle")}<span>Se añade a tu equipo. No necesita aprobación.</span></p>` : hire ? `<p class="askn">${I("info-circle")}<span>${prev ? `Coste estimado <b>${prev}</b>. ` : ""}Dirección tendrá que aprobarlo antes de contratar.</span></p>` : d.pid ? `<p class="askn ok">${I("check-circle")}<span>No necesita aprobación: ya lo pagáis. Dirección recibe un aviso.</span></p>` : ""}
  <div class="sact${isT ? " nodiv" : ""}"><button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-p" ${isT ? "data-sendtreq" : "data-sendask"} ${sameFree.length || (d.editReq && askSig(d) === d.sig) ? "disabled" : ""}>${d.editReq ? "Guardar cambios" : reg ? "Añadir al equipo" : isT || hire || !d.pid ? "Enviar a Dirección" : "Asignar al proyecto"}</button></div></div>`;
    document.getElementById("try")?.addEventListener("input", (e) => {
      d.why = e.target.value;
      const bb = document.querySelector(".sact [data-sendask],.sact [data-sendtreq]");
      if (bb && d.editReq) bb.disabled = askSig(d) === d.sig || !!sameFree.length;
    });
    document.getElementById("askrn")?.addEventListener("input", (e) => (d.rname = e.target.value));
  } else if (V.modal === "leave" && V.draft) {
    const d = V.draft,
      team = (D.people || []).filter((x) => x.team === d.lead && (!d.team || areaOf(x) === d.team) && !x.leaving),
      who = team.find((x) => x.id === d.sel),
      ps = who ? projectsOf(who.id).filter((q) => q.owner === meName()) : [],
      today = new Date().toISOString().slice(0, 10);
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Dar de baja a alguien</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label for="lvp">¿Quién se va?</label>${ddHTML({ id: "lvp", value: d.sel, ariaLabel: "Quién", placeholder: "Elige a alguien", options: team.map((x) => [x.id, `${x.name} · ${F(x.fid).t}`]) })}</div>
  <div class="field"><label for="lvr">Motivo</label>${ddHTML({ id: "lvr", value: d.why || "quit", ariaLabel: "Motivo", options: [["quit", "Se va por su cuenta"], ["fired", "Despido"], ["end", "Fin de contrato"], ["other", "Otro"]] })}</div>
  <div class="field"><label for="lvd">¿Cuándo es su último día?</label><input id="lvd" class="big md" type="date" min="${today}" value="${esc(d.date || "")}"/>${d.err ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}</div>
  ${who ? `<div class="alert warn lvwarn" role="note">${I("exclamation-triangle")}<span>${ps.length ? `Su puesto en ${ps.map((p) => "«" + esc(p.name) + "»").join(" y ")} queda sin cubrir: podrás asignar a alguien libre o pedir una persona. ` : ""}Dirección recibe un aviso y verá qué asientos de software e IA se pueden quitar. No necesita aprobación.</span></div>` : ""}
  <div class="sact"><button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-del" data-leavedo>${who ? "Dar de baja a " + esc(who.name.split(" ")[0]) : "Dar de baja"}</button></div></div>`;
    document.getElementById("lvd").oninput = (e) => (d.date = e.target.value);
  } else if (V.modal === "asg" && V.draft) {
    const d = V.draft,
      free = (D.people || []).filter((x) => x.team === d.lead && areaOf(x) === d.team && isOpen(x.id)),
      who = free.find((x) => x.id === d.sel),
      /* open seats: any uncovered seat of a draft, and in a running project the seats still being hired (the person covers the hire) */
      slots = D.projects
        .filter((q) => q.owner === meName() && !q.archived && !q.full && (q.status === "draft" || q.status === "changes" || isLive(q)))
        .flatMap((q) => q.roles.flatMap((r, ri) => Array.from({ length: seatsOf(r) }, (_, i) => [r, i]).filter(([r2, i]) => (!who || F(r2.id).cat === F(who.fid).cat) && (isLive(q) ? r2.fill?.[i] && r2.fill[i].src === "new" : !r2.fill?.[i] || (r2.fill[i].src !== "mine" && r2.fill[i].src !== "shared"))).map(([r2, i]) => ({ v: q.id + "|" + ri + "|" + i, l: `${q.name} · ${F(r2.id).t}${isLive(q) ? " · por contratar" : ""}`, m: !!who && who.fid === r2.id, live: isLive(q) }))))
        .sort((a, b) => Number(b.m) - Number(a.m)),
      opts = slots.map((o) => [o.v, o.l + (o.m ? " (su puesto)" : "")]),
      cur = slots.find((o) => o.v === d.slot);
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Asignar a un proyecto</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label for="asgp">¿Quién?</label>${ddHTML({ id: "asgp", value: d.sel, ariaLabel: "Quién", placeholder: "Elige a alguien libre", options: free.map((x) => [x.id, `${x.name} · ${F(x.fid).t}`]) })}</div>
  <div class="field"><label for="asgs">¿En qué puesto?</label>${opts.length ? ddHTML({ id: "asgs", value: d.slot, ariaLabel: "Puesto", placeholder: "Elige proyecto y puesto", options: opts }) : `<div class="alert info" role="note">${I("info-circle")}<span>${who ? `Ningún proyecto tuyo tiene una plaza de <b>${esc(CAT[F(who.fid).cat].es.toLowerCase())}</b> por cubrir. Para contar con ${esc(who.name.split(" ")[0])}, añádela desde el proyecto con «Añadir persona».` : "No tienes proyectos abiertos con puestos por cubrir. Crea uno o abre un borrador."}</span></div>`}${d.err ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}</div>
  ${opts.length ? "" : "<!--"}<div class="alert info" role="note">${I("info-circle")}<span>Es alguien que ya pagáis: no suma coste nuevo. ${cur && cur.live ? "Ocupa la plaza que se iba a contratar, así que esa contratación ya no hace falta." : "En un borrador, se aprueba junto con el proyecto."}</span></div>${opts.length ? "" : "-->"}
  <div class="sact">${opts.length ? `<button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-p" data-asgdo>Asignar</button>` : `<button class="btn btn-s" data-close>Cerrar</button>`}</div></div>`;
  } else if (V.modal === "px" && V.draft) {
    const d = V.draft,
      opts = (D.people || [])
        .filter((x) => x.team === d.lead && areaOf(x) === d.team && (!d.only || x.id === d.only))
        .flatMap((x) => projectsOf(x.id).filter((q) => q.owner === meName()).map((q) => [x.id + "|" + q.id, d.only ? q.name : `${x.name} · ${q.name}`])),
      solo = d.only && PERSON(d.only);
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">${solo ? "Sacar a " + esc(solo.name.split(" ")[0]) + " de un proyecto" : "Sacar de un proyecto"}</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  ${solo && opts.length === 1 ? `<p class="pxone">Sale de <b>«${esc(opts[0][1])}»</b>.</p>` : ""}<div class="field"${solo && opts.length === 1 ? " hidden" : ""}><label for="pxsel">${d.only ? "¿De qué proyecto?" : "¿Quién?"}</label>${ddHTML({ id: "pxsel", value: d.sel, ariaLabel: d.only ? "Proyecto" : "Quién", placeholder: d.only ? "Elige un proyecto" : "Elige a alguien", options: opts })}${d.err ? `<p class="ferr" role="alert">${esc(d.err)}</p>` : ""}</div>
  <p class="askn ok">${I("check-circle")}<span>${solo ? esc(solo.name.split(" ")[0]) + " sigue" : "Sigue"} en ${esc(d.team)} y queda libre para otro proyecto. No necesita aprobación: Dirección recibe un aviso.</span></p>
  <div class="sact"><button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-p" data-pxdo>Sacar del proyecto</button></div></div>`;
  } else if (V.modal === "regteam" && V.draft) {
    const regFull = (x) => { const l = x.people[x.people.length - 1]; return !!(l && l.n.trim() && l.fid); },
      d = V.draft,
      fids = CATS.flatMap(([cid, es]) => {
        const l = Object.values(FAM)
          .filter((f) => f.cat === cid && f.arch !== "head" && !f.exec)
          .sort((a, b) => a.t.localeCompare(b.t));
        return l.length ? [["§" + cid, es], ...l.map((f) => [f.id, f.t])] : [];
      });
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Registrar equipo existente</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <p class="note">Para un equipo que ya trabaja en la empresa. No necesita aprobación.</p>
  <div class="field"><label for="rtn">Nombre del equipo <span class="req" aria-hidden="true">*</span></label><input id="rtn" class="big md" value="${esc(d.name)}" placeholder="Marketing" autocomplete="off"/></div>
  <div class="field"><label>Personas</label>${d.people
    .map(
      (q, i) =>
        `<div class="rtrow"><input class="big md rtn" data-rti="${i}" value="${esc(q.n)}" placeholder="Nombre y apellidos" autocomplete="off" aria-label="Nombre y apellidos de la persona ${i + 1}"/>${ddHTML({ id: "rtf-" + i, value: q.fid, ariaLabel: "Puesto", placeholder: "Puesto", options: fids })}<button class="ib s" data-regdel="${i}" aria-label="Quitar a esta persona" ${d.people.length > 1 ? "" : "disabled"}>${I("trash-alt")}</button></div>`,
    )
    .join("")}<button class="lnk" data-regadd ${regFull(d) ? "" : "disabled"}>Añadir otra persona</button></div>
  ${d.err ? `<p class="ferr" role="alert" style="margin:0 24px">${esc(d.err)}</p>` : ""}
  <div class="sact"><button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-p" data-saveregteam>Registrar equipo</button></div></div>`;
    document.getElementById("rtn").oninput = (e) => (d.name = e.target.value);
    m.querySelectorAll("[data-rti]").forEach((el) => (el.oninput = (e) => { d.people[Number(el.dataset.rti)].n = e.target.value; const b = m.querySelector("[data-regadd]"); if (b) b.disabled = !regFull(d); }));
  } else if (V.modal === "hire") {
    const live = D.projects.filter((x) => x.owner === meName() && !x.archived && ["active", "approved"].includes(stOf(x)) && !x.parent);
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Pedir una contratación</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <p class="note">Dirección aprueba cada contratación antes de que empiece. ¿Para qué la necesitas?</p>
  ${live.length ? `<p class="hgl">Sumar a un proyecto en marcha</p><div class="hlist">${live.map((x) => `<button class="hrow" data-extend="${x.id}"><span><b>${esc(x.name)}</b><small>Dirección solo aprueba lo que se añade</small></span><span class="rchev" aria-hidden="true">${I("angle-right")}</span></button>`).join("")}</div><p class="hgl">O empezar algo nuevo</p>` : ""}<div class="hlist"><button class="hrow" data-new><span><b>Un proyecto nuevo</b><small>Para una persona o un equipo, con su propio plazo y presupuesto</small></span><span class="rchev" aria-hidden="true">${I("angle-right")}</span></button></div></div>`;
  } else if (V.modal === "team" && V.draft) {
    const d = V.draft;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">${d.edit ? "Renombrar equipo" : "Nuevo equipo"}</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label for="tmn">Nombre <span class="req" aria-hidden="true">*</span></label><input id="tmn" class="big md" value="${esc(d.name)}" placeholder="Diseño" autocomplete="off" aria-required="true" ${d.err ? 'aria-describedby="tme" aria-invalid="true"' : ""}/>${d.err ? `<p class="ferr" id="tme" role="alert">${esc(d.err)}</p>` : ""}</div>
  ${d.edit ? "" : isBoard() ? `<div class="field"><label for="tlead">Responsable</label>${ddHTML({ id: "tlead", value: d.lead, ariaLabel: "Responsable", options: D.managers.map((x) => [x.name, `${x.name} · ${teamName(x.name)}`]) })}</div>` : ""}
  ${d.edit ? "" : (() => {
    const ppl = (D.people || []).filter((x) => x.team === d.lead && !x.leaving).sort((a, b) => a.name.localeCompare(b.name, "es")), sel = d.sel || [];
    return `<div class="field"><label id="tmpl">Quién está en el equipo <span class="req" aria-hidden="true">*</span></label>${ppl.length ? `<div class="trw tmpl" role="group" aria-labelledby="tmpl">${ppl.map((x) => { const on = sel.includes(x.id); return `<button type="button" class="trwr${on ? " on" : ""}" role="checkbox" aria-checked="${on}" data-tmp="${esc(x.id)}"><span class="trwc" aria-hidden="true"></span><span class="trwn"><b>${esc(x.name)}</b><small>${esc(F(x.fid).t)} · ahora en ${esc(unitOf(x) || areaOf(x))}</small></span></button>`; }).join("")}</div>` : `<p class="note">Aún no hay nadie en ${isBoard() ? "el equipo de " + esc(d.lead.split(" ")[0]) : "tu equipo"}. Añade primero a las personas.</p>`}${d.perr ? `<p class="ferr" role="alert">${esc(d.perr)}</p>` : `<p class="note fh">Al menos una persona. Se mueve a este equipo; sus proyectos no cambian.</p>`}</div>`;
  })()}
  <div class="sact"><button class="btn btn-s" data-close>Cancelar</button><button class="btn btn-p" data-saveteam>${d.edit ? "Guardar" : "Crear equipo"}</button></div></div>`;
    document.getElementById("tmn").oninput = (e) => (d.name = e.target.value);
  } else if (V.modal === "person" && V.draft) {
    const d = V.draft,
      fids = Object.values(FAM)
        .filter((f) => f.arch !== "head" && !f.exec)
        .sort((a, b) => a.t.localeCompare(b.t))
        .map((f) => [f.id, f.t]);
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Añadir persona</h2><p class="shsub">Alguien que ya trabaja en la empresa.${isBoard() ? "" : " Para contratar, hazlo desde un proyecto."}</p></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="field"><label for="psn">Nombre <span class="req" aria-hidden="true">*</span></label><input id="psn" class="big md" value="${esc(d.name)}" placeholder="Amy Clarke" autocomplete="off" aria-required="true" ${d.err ? 'aria-describedby="pse" aria-invalid="true"' : ""}/>${d.err ? `<p class="ferr" id="pse" role="alert">${esc(d.err)}</p>` : ""}</div>
  <div class="field"><label for="pfid">Puesto</label>${ddHTML({ id: "pfid", value: d.fid, ariaLabel: "Puesto", options: fids })}</div>
  ${!d.fid || (F(d.fid).gr && F(d.fid).gr.length) ? `<div class="field"><label>Nivel</label>${ddHTML({ id: "plvl", value: d.lvl || "mid", ariaLabel: "Nivel", options: (F(d.fid).gr && F(d.fid).gr.length ? F(d.fid).gr : ["intern", ...LVLS]).map((k) => [k, GR[k][0]]) })}</div>` : ""}
  ${(() => {
    /* no «Equipo» field: the area comes from the puesto. Dirección only says whose team it is, when there is more than one Responsable */
    if (!isBoard() || D.managers.length < 2) return "";
    const opts = D.managers.map((x) => [x.name + "||" + teamsOf(x.name)[0], x.name]);
    return `<div class="field"><label for="pteam">Responsable</label>${ddHTML({ id: "pteam", value: d.team + "||" + teamsOf(d.team)[0], ariaLabel: "Responsable", options: opts })}</div>`;
  })()}
  ${regAsgHTML(d)}
  <div class="field"><label for="psc">Lo que cuesta hoy a la empresa <small class="opt-l">Opcional</small></label><div class="inu"><input id="psc" class="big md" inputmode="numeric" value="${d.cost ? numFmt(d.cost) : ""}" placeholder="${(() => { const v = illus({ id: d.fid, grade: d.lvl }, "España"); return v ? numFmt(v) : "0"; })()}" aria-describedby="psch"/><span class="u" aria-hidden="true">€/mes</span></div><p class="note fh" id="psch">Lo que cobra esta persona ahora (salario y Seguridad Social, al mes). Sirve para calcular el coste real de sus proyectos. Si lo dejas vacío, usamos la referencia de mercado de su puesto y nivel.</p></div>
  <div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-p" data-savep>Añadir</button></div></div>`;
    document.getElementById("psn").oninput = (e) => (d.name = e.target.value);
    document.getElementById("psc").oninput = (e) => (d.cost = Number(e.target.value.replace(/\D/g, "")) || 0);
  } else if (V.modal === "del" && D.projects.some((x) => x.id === V.draft)) {
    const p = D.projects.find((x) => x.id === V.draft);
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet cfm" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Eliminar «${esc(p.name)}»</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">Se borrará el proyecto «${esc(p.name)}» con su equipo y sus costes. No se puede deshacer. Si solo quieres quitarlo de la vista, archívalo.</p><div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-del" data-pdelok>Eliminar proyecto</button></div></div>`;
  } else if (V.modal === "trcx" && V.draft && V.draft.trcx) {
    const r = (D.toolReqs || []).find((q) => q.id === V.draft.trcx) || personReqs().find((q) => q.id === V.draft.trcx);
    if (!r) V.modal = null;
    else m.innerHTML = `<div class="scrim" data-close></div><div class="sheet cfm" role="alertdialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">¿Cancelar la petición?</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin:0 24px 18px">Se cancelará «${esc(reqName(r))}» y Dirección ya no la verá. Podrás deshacerlo unos segundos después.</p><div class="sact"><button class="btn btn-s wide" data-close>Volver</button><button class="btn btn-del" data-trcancelok>Cancelar petición</button></div></div>`;
  } else if (V.modal === "intg" && V.draft) {
    const n = esc(V.draft),
      notify = /Slack|Teams/.test(V.draft),
      hr = isHR(V.draft),
      can = notify
        ? ["Enviarte mensajes con tus tareas pendientes y avisos", "Saber a qué persona de HUMAIN corresponde cada cuenta"]
        : hr
          ? ["Ver los puestos y niveles de la empresa", "Ver las bandas salariales y el coste mensual de cada puesto", "Saber en qué equipo está cada persona"]
          : ["Ver cuántos asientos tenéis contratados y de qué tipo", "Ver quién tiene cada asiento: nombre y correo", "Ver la fecha de renovación y el precio del contrato"],
      cant = notify ? "No leerá vuestras conversaciones ni canales." : hr ? "No podrá cambiar sueldos ni ver nóminas." : "No podrá comprar ni quitar asientos, ni ver vuestros archivos o proyectos en " + n + ".";
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Conectar ${n}</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div>${
      V.intgWait
        ? `<div class="iwait" role="status"><span class="lsy live" aria-hidden="true"></span><div><b>Esperando a ${n}</b><p>Inicia sesión en la ventana de ${n} con una cuenta de administrador y acepta los permisos. Esta ventana se cerrará sola.</p></div></div><div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button></div>`
        : `<p class="sub">Abriremos ${n} en una ventana nueva para que inicies sesión con una cuenta de administrador y des permiso a HUMAIN.</p><div class="iperm"><h3>HUMAIN podrá</h3><ul>${can.map((c) => `<li>${I("check")}${c}</li>`).join("")}</ul><p>${cant}</p></div><div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-p" data-intggo>${I("external-link-alt")}Continuar en ${n}</button></div>`
    }</div>`;
  } else if (V.modal === "intgoff" && V.draft) {
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">¿Desconectar ${esc(V.draft)}?</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">Dejarás de sincronizar las licencias de ${esc(V.draft)}. Puedes volver a conectarlo cuando quieras.</p><div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-del" data-intgoffok>Desconectar</button></div></div>`;
  } else if (V.modal === "invite" && V.draft) {
    const d = V.draft,
      edit = d.mode === "edit",
      glob = d.role === "Administrador global";
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">${edit ? "Cambiar rol de " + esc(d.name) : "Invitar a alguien"}</h2><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  ${edit ? "" : `<div class="field"><label for="iem">Correo</label><input id="iem" class="big md" type="email" autocomplete="off" value="${esc(d.email)}" placeholder="lucia@empresa.com" aria-describedby="ierr" required/><p class="ferr" id="ierr" role="alert"></p></div>`}
  <div class="field"><label for="irl">Rol</label>${ddHTML({ id: "irl", value: d.role, ariaLabel: "Rol", options: ROLES.map((r) => [r, r]) })}</div>
  <div class="field"><label for="isc">Empresa</label>${ddHTML({ id: "isc", value: glob ? "Todas" : d.scope === "Todas" ? "Todas" : d.scope, ariaLabel: "Empresa", disabled: glob, options: [["Todas", "Todas"], ...D.entities.map((e) => [e.name, e.name])] })}</div>
  <div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-p" data-uinviteok ${edit || emailOk(d.email, d) ? "" : "disabled"}>${edit ? "Guardar" : "Enviar invitación"}</button></div></div>`;
    const btn = m.querySelector("[data-uinviteok]"),
      em = document.getElementById("iem"),
      showErr = () => {
        const e = emailErr(d.email, d);
        document.getElementById("ierr").textContent = e;
        em.setAttribute("aria-invalid", e ? "true" : "false");
      };
    if (em) {
      em.oninput = () => {
        d.email = em.value.trim();
        btn.disabled = !emailOk(d.email, d);
        if (document.getElementById("ierr").textContent) showErr();
      };
      em.onblur = () => {
        if (d.email) showErr();
      };
      em.onkeydown = (e) => {
        if (e.key === "Enter" && !btn.disabled) btn.click();
        else if (e.key === "Enter") showErr();
      };
    }
  } else if (V.modal === "udel" && D.users[V.draft]) {
    const u = D.users[V.draft];
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">${u[3] ? "¿Cancelar la invitación a " : "¿Quitar el acceso a "}${esc(u[0])}?</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">${u[3] ? "Ya no podrá unirse con esa invitación." : "Dejará de ver los datos de HUMAIN. Podrás volver a invitarla cuando quieras."}</p><div class="sact"><button class="btn btn-s wide" data-close>Volver</button><button class="btn btn-del" data-udelok>${u[3] ? "Cancelar invitación" : "Quitar acceso"}</button></div></div>`;
  } else if (V.modal === "delent" && ENT(V.draft)) {
    const e = ENT(V.draft),
      nl = D.licenses.filter((l) => l.scope === e.id).length;
    m.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><h2 id="mt">Eliminar «${esc(e.name)}»</h2><button class="ib" data-close aria-label="Cerrar">${I("times")}</button></div><p class="sub" style="margin-bottom:18px">La empresa «${esc(e.name)}» no tiene proyectos.${nl ? ` Se quitarán también sus ${nl} licencia${nl > 1 ? "s" : ""}.` : ""} No se puede deshacer.</p><div class="sact"><button class="btn btn-s wide" data-close>Cancelar</button><button class="btn btn-del" data-delentok>Eliminar empresa</button></div></div>`;
  } else m.innerHTML = "";
  {
    const ns = m.querySelector(".sheet");
    if (ns) ns.tabIndex = -1;
    if (ns && keepModal) ns.scrollTop = keepTop;
  }
  /* focus: opening a modal focuses its first field; closing returns to the opener; any other render keeps focus where it was */
  if (V.modal && !wasModal) {
    V._opener = prevFocus;
    const sh = m.querySelector(".sheet"),
      touch = window.matchMedia && matchMedia("(pointer:coarse)").matches /* on a phone, focusing a field opens the keyboard before anyone tapped it */,
      first =
        !touch &&
        sh &&
        sh.querySelector("input:not([type=hidden]):not([type=date]),select,textarea"); /* without a field the dialog itself takes focus, so no button shows a ring nobody asked for */
    (first || sh)?.focus({ preventScroll: true });
    const fer = sh && sh.querySelector(".ferr");
    if (fer) fer.scrollIntoView({ block: "center" });
  } else if (!V.modal && wasModal) {
    const k = V._opener;
    V._opener = null;
    if (!(k && focusEl(findKey(k), k))) document.getElementById("app").focus({ preventScroll: true });
  } else if (prevFocus && document.activeElement !== findKey(prevFocus)) {
    const el = findKey(prevFocus);
    if (el && !el.disabled) focusEl(el, prevFocus);
  }
  if (V._focusMenu) {
    V._focusMenu = false;
    document.querySelector(".amenu.pm [role=menuitem]")?.focus();
  }
  if (V.toast) {
    const box = document.getElementById("toasts");
    const act = V.toastAct;
    box.insertAdjacentHTML("beforeend", `<div class="toast">${I("check-circle")}<span>${esc(V.toast)}</span>${act ? `<button class="tact" data-undotr>${act}</button>` : ""}</div>`);
    V.toast = null;
    V.toastAct = null;
    clearTimeout(window._tt);
    window._tt = setTimeout(
      () =>
        document.querySelectorAll(".toast").forEach((e) => {
          e.classList.add("out");
          setTimeout(() => e.remove(), 300);
        }),
      act ? 7000 : 2500,
    );
  }
}
/* the new-project form: what the user chose, turned into project fields */
const newDraft = () => ({
  step: 1,
  name: "",
  goal: "",
  type: null,
  size: "m",
  months: REFM.m,
  dk: false,
  smode: "now",
  start: null,
  startFrom: "team",
  empty: "",
  aiPref: "rec",
  budget: 0,
  ent: (MGR(meName()) || {}).ent || (D.ent !== "all" && ENT(D.ent) ? D.ent : D.entities[0].id),
  mod: "remote",
  country: null,
  ct: "auto",
  adv: false,
});
function applyDraft(d) {
  return {
    name: d.name,
    goal: (d.goal || "").trim().slice(0, 300),
    type: d.type,
    size: d.size,
    months: d.months === 0 ? 0 : d.dk ? REFM[d.size || "m"] || 6 : d.months,
    dk: !!d.dk,
    end: null,
    budget: d.budget || 0,
    start: d.smode === "pick" && d.start ? d.start : monthKey(),
  };
}
/* Dirección approves: the project is in progress; another team's profiles become the person Dirección chose (or the first
   free one); new hires stay «En contratación». Tools no contract covers yet get a 0-seat licence, so the gap shows in Software e IA. */
/* Dirección decides a request from its row or its detail, never leaving the page */
function boardDecide(id, a, cm) {
  if (!isBoard()) return;
  const r = (D.toolReqs || []).find((x) => x.id === id),
    pr = !r && D.projects.find((x) => x.id === id && x.parent && x.status === "pending"),
    snap = JSON.stringify({ projects: D.projects, toolReqs: D.toolReqs || [], people: D.people, licenses: D.licenses, notes: D.notes }),
    undoable = () => {
      V.undo = { decision: true, snap };
      V.toastAct = "Deshacer";
    };
  if (pr) {
    pushThread(pr, { who: "b", k: a === "ok" ? "approve" : "reject", t: cm, ts: Date.now() });
    pr.review = { by: "Dirección", ts: Date.now(), decision: a === "ok" ? "approve" : "reject", comment: cm };
    if (a === "ok") approveProject(pr);
    else pr.status = "rejected";
    D.notes.unshift({ ic: a === "ok" ? "check-circle" : "times-circle", k: "team", to: pr.owner, t: a === "ok" ? `Dirección ha aprobado «${pr.name}»` : `Dirección ha rechazado «${pr.name}»`, s: cm, p: pr.id, ts: Date.now(), r: 0 });
    save();
    V.toast = a === "ok" ? "Petición aprobada" : "Petición rechazada";
    undoable();
    render();
    return;
  }
  if (!r || r.status !== "pending") return;
  r.status = a === "ok" ? "approved" : "rejected";
  if (a !== "ok") r.comment = cm;
  D.notes.unshift({ ic: a === "ok" ? "check-circle" : "times-circle", k: "lic", to: r.by, t: `${reqName(r)}: petición ${a === "ok" ? "aprobada" : "rechazada"}`, s: a === "ok" ? "Dirección la contratará" : cm, p: "", ts: Date.now(), r: 0 });
  save();
  if (a === "ok" && r.kind === "person") {
    D.people.push({ id: "u" + Date.now(), name: "Por contratar · " + ((F(r.fid) || {}).t || "persona"), fid: r.fid, lvl: "mid", team: r.by, ent: (MGR(r.by) || {}).ent || D.entities[0].id });
    save();
    V.toast = "Aprobada: entra libre en el equipo";
    undoable();
  } else if (a === "ok" && !D.licenses.some((l) => l.opt === r.opt)) {
    V.draft = { opt: r.opt, scope: D.ent === "all" ? "group" : D.ent, seats: 1, other: 0 };
    V.modal = "lic";
  } else {
    V.toast = a === "ok" ? "Petición aprobada" : "Petición rechazada";
    undoable();
  }
  render();
}
function approveProject(pr) {
  adoptNewProgs(pr);
  const taken = new Set();
  pr.roles.forEach((r) =>
    (r.fill || []).forEach((f) => {
      if (f.pid) taken.add(f.pid);
    }),
  );
  pr.roles.forEach((r) => {
    r.fill = (r.fill || []).map((f) => {
      if (f.src === "other") {
        if (f.pid && isFree(f.pid, pr.id)) return f;
        const x = otherFree(pr, r.id).find((y) => !taken.has(y.id));
        if (x) {
          taken.add(x.id);
          return { src: "other", pid: x.id };
        }
        return { src: "new", hiring: true };
      }
      return f.src === "new" ? { src: "new", hiring: true } : f;
    });
  });
  pr.status = "active";
  if (!pr.start || mIdx(pr.start) < 0) pr.start = monthKey();
  const base = baseOf(pr);
  if (base) {
    base.roles = clone(pr.roles);
    base.shared = clone(pr.shared || {});
    base.qty = clone(pr.qty || {});
    pr.status = "approved";
    pr.merged = true;
    pr.archived = true;
  }
  cost(pr).tools.forEach((t) => {
    if (t.buy > 0 && !t.plan && opt(t.id).p > 0 && !D.licenses.some((l) => l.opt === t.id && inScope(l, pr))) {
      const nl = { opt: t.id, scope: pr.ent, seats: 0, other: 0 };
      nl.renew = defaultRenew(nl);
      D.licenses.push(nl);
    }
  });
}
const go = (v, id) => {
  V.toast = null;
  V.toastAct = null;
  V.view = v;
  if (id) V.id = id;
  V.open = null;
  V.nav = false;
  V.menu = false;
  render();
  scrollTo(0, 0);
};
function useVariant(pr, which) {
  applyVariant(pr, which, pr.cmpSc || "est");
  save();
  V.modal = null;
  V.draft = null;
  V.toast = which === "ai" ? "Equipo con IA aplicado al proyecto" : "Equipo sin IA aplicado al proyecto";
  render();
}
/* free text in the proposal panel: stored as typed, no re-render */
document.addEventListener("input", (e) => {
  if (e.target.matches && e.target.matches("[data-trq]")) {
    const q = e.target.value.trim().toLowerCase();
    e.target.closest(".field").querySelectorAll(".trwr").forEach((b) => (b.hidden = !!q && !b.textContent.toLowerCase().includes(q)));
    return;
  }
  const t = e.target;
  if (t.dataset && t.dataset.justif !== undefined && P()) {
    P().justif = t.value.slice(0, 2000);
    if (V.jerr && t.value.trim()) {
      V.jerr = false;
      t.removeAttribute("aria-invalid");
      document.getElementById("pje")?.remove();
    }
    save();
  } else if (t.dataset && t.dataset.rcomment !== undefined) V.rcomment = t.value.slice(0, 1000);
  else if (t.dataset && t.dataset.ladm !== undefined && V.ldraft) V.ldraft.admin = t.value.slice(0, 300);
  else if (t.dataset && t.dataset.lren !== undefined && V.ldraft) V.ldraft.renew = t.value;
  else if (t.dataset && t.dataset.crange !== undefined) {
    /* dragging: the field and the label follow without re-rendering; the figure is saved on release */
    const v = Number(t.value),
      ref = Number(t.dataset.ref),
      line = t.closest(".line"),
      pos = rbPos(v, ref),
      f = line && line.querySelector("[data-crate]"),
      band = t.closest(".rband");
    if (f) f.value = numFmt(v);
    if (band) band.className = "rband " + pos;
    const so = line && line.querySelector(".rbo");
    if (so) so.textContent = rbLab(pos);
    t.setAttribute("aria-valuetext", `${eur(v)} al mes${rbLab(pos) ? ", " + rbLab(pos).toLowerCase() : ""}`);
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.leadchk !== undefined) {
    const r = P().roles[t.dataset.leadchk];
    r.lead = t.checked;
    if (r.lead && r.grade === "junior") r.grade = "mid";
    save();
    render();
    return;
  }
  if (t.dataset.ongoing !== undefined) {
    const d = V.draft;
    if (t.checked) {
      d.prevMonths = d.months || d.prevMonths || REFM[d.size || "m"] || 6;
      d.months = 0;
      d.custom = false;
      V.calOpen = false;
    } else d.months = d.prevMonths || REFM[d.size || "m"] || 6;
    d.mTouched = true;
    render();
    return;
  }
  if (t.dataset.work !== undefined) {
    const v = Number(t.value.replace(/\D/g, ""));
    if (v > 0) P().work = v;
    save();
    render();
    return;
  }
  if ((t.dataset.crange !== undefined || t.dataset.crate !== undefined) && isBoard()) {
    /* saved on release (slider) or on leaving the field; a toast says what changed and how far it reaches */
    const k = t.dataset.crange !== undefined ? t.dataset.crange : t.dataset.crate,
      v = t.dataset.crange !== undefined ? Number(t.value) : Number(t.value.replace(/\D/g, "")),
      row = rateRows().find(([kk]) => kk === k),
      nm = row ? F(row[1].id).t + (row[1].grade ? " · " + GR[row[1].grade][0] : "") : "Tarifa",
      n = row ? row[1].n.size : 0;
    if (v) D.rates[k] = v;
    else delete D.rates[k];
    save();
    V.toast = `${nm}: ${v ? eur(v) + "/mes" : "vuelve a la referencia de mercado"}. Guardado y aplicado a ${n} proyecto${n !== 1 ? "s" : ""}.`;
    render();
    return;
  }
  if (t.dataset.rate !== undefined) {
    const r = P().roles[t.dataset.rate],
      v = Number(t.value.replace(/\D/g, ""));
    if (v) r.rate = v;
    else delete r.rate;
    save();
    render();
    return;
  }
  if (t.dataset.crname) {
    const c = D.croles.find((x) => x.id === t.dataset.crname);
    if (c && t.value.trim()) {
      c.t = t.value.trim();
      FAM[c.id].t = c.t;
      save();
      render();
    }
    return;
  }
  if (t.id === "lgf" && t.files[0]) {
    const f = t.files[0];
    if (f.size > 400000) {
      V.toast = "El logo debe pesar menos de 400 KB";
      render();
      return;
    }
    const rd = new FileReader();
    rd.onload = () => {
      D.logo = rd.result;
      save();
      V.toast = "Logo actualizado";
      render();
    };
    rd.readAsDataURL(f);
    return;
  }
  if (t.dataset.hin) {
    const r = P().roles[t.dataset.hin];
    r.hours = Math.max(1, Math.min(HPM, Number(t.value.replace(/\D/g, "")) || r.hours));
    save();
    render();
    return;
  }
  if (t.dataset.ownp) {
    const pr = P(),
      id = t.dataset.ownp;
    pr.own = pr.own.includes(id) ? pr.own.filter((x) => x !== id) : [...pr.own, id];
    save();
    render();
  }
});
document.addEventListener("click", (e) => {
  if (V.nav && !e.target.closest("#side") && !e.target.closest("[data-hamb]")) {
    V.nav = false;
    render();
    return;
  }
  const tp = e.target.closest("[data-tip]");
  if (tp) {
    document.querySelectorAll(".tip").forEach((x) => x.remove());
    const r = tp.querySelector(".i")?.getBoundingClientRect() || tp.getBoundingClientRect(),
      d = document.createElement("div");
    d.className = "tip";
    d.setAttribute("role", "status");
    d.textContent = tp.dataset.tip;
    document.body.appendChild(d);
    d.style.left = Math.max(8, Math.min(innerWidth - d.offsetWidth - 8, r.right - d.offsetWidth + 8)) + "px";
    d.style.top = r.top + scrollY - d.offsetHeight - 10 + "px";
    setTimeout(() => d.remove(), 2200);
    return;
  }
  const t = e.target.closest("button,[data-close],.treq.clk");
  if (!t) {
    if (V.menu || V.ws || V.dpop) {
      V.menu = false;
      V.ws = false;
      V.dpop = false;
      render();
    }
    return;
  }
  const ds = t.dataset,
    pr = V.view === "project" ? P() : null;
  if (!("acct" in ds) && !("pmenu" in ds) && !("rmenu" in ds) && !("imenu" in ds) && !("umenu" in ds) && !("pxmenu" in ds) && !("pxask" in ds) && !("trmenu" in ds) && !("tcmenu" in ds) && V.menu && !t.closest(".amenu")) V.menu = false;
  if (!("ws" in ds) && V.ws && !t.closest(".wsmenu")) V.ws = false;
  if (!("demotag" in ds) && V.dpop && !t.closest(".dpop")) V.dpop = false;
  if ("new" in ds) V.askBack = null;
  if ("new" in ds && !D.setup) {
    V.draft = { name: "", err: "" };
    V.modal = "setup";
    render();
  } else if ("new" in ds) {
    V.draft = newDraft();
    V.modal = "new";
    render();
  } else if ("newteam" in ds) {
    V.menu = false;
    V.askBack = null;
    if (!D.setup) {
      V.draft = { name: "", err: "" };
      V.modal = "setup";
    } else {
      V.draft = { ...newDraft(), newTeam: "" };
      V.modal = "new";
    }
    render();
  } else if ("regteam" in ds) {
    V.menu = false;
    V.draft = { name: "", people: [{ n: "", fid: "" }], err: "" };
    V.modal = "regteam";
    render();
  } else if ("regadd" in ds) {
    const l = V.draft.people[V.draft.people.length - 1];
    if (l && !(l.n.trim() && l.fid)) return;
    V.draft.people.push({ n: "", fid: "" });
    render();
    /* make the new row obvious: on a phone it lands below the fold */
    setTimeout(() => {
      const r = document.querySelectorAll("#modal .rtrow .rtn");
      const last = r[r.length - 1];
      if (last) { last.scrollIntoView({ block: "center", behavior: "smooth" }); last.focus({ preventScroll: true }); }
    }, 30);
  } else if (ds.regdel) {
    V.draft.people.splice(Number(ds.regdel), 1);
    if (!V.draft.people.length) V.draft.people.push({ n: "", fid: "" });
    render();
  } else if ("saveregteam" in ds) {
    const d = V.draft,
      n = (d.name || "").trim().slice(0, 60),
      owner = meName(),
      ppl = d.people.filter((q) => q.n.trim() && q.fid);
    if (!n) d.err = "Escribe el nombre del equipo.";
    else if (teamsOf(owner).some((t) => t.toLowerCase() === n.toLowerCase())) d.err = "Ya tienes un equipo con ese nombre.";
    else if (d.people.some((q) => q.n.trim() && !q.fid) || d.people.some((q) => !q.n.trim() && q.fid)) d.err = "Cada persona necesita nombre y puesto.";
    else d.err = "";
    if (d.err) {
      render();
      return;
    }
    const mm = MGR(owner);
    mm.teams = [...teamsOf(owner), n];
    ppl.forEach((q, i) => D.people.push({ id: "u" + Date.now() + i, name: q.n.trim().slice(0, 80), fid: q.fid, lvl: "mid", team: owner, unit: n, ent: mm.ent || D.entities[0].id }));
    save();
    V.modal = null;
    V.toast = `Equipo «${n}» registrado${ppl.length ? ` con ${ppl.length} persona${ppl.length !== 1 ? "s" : ""}` : ""}`;
    render();
  } else if ("askback" in ds) {
    V.draft = V.askBack;
    V.askBack = null;
    V.modal = "ask";
    render();
  } else if ("close" in ds) {
    V.askBack = null;
    V.modal = null;
    render();
  } else if (ds.nav) {
    if (ds.nav === "projects") V.pf = "all";
    go(ds.nav);
  } else if ("demotag" in ds) {
    V.dpop = !V.dpop;
    V.ws = false;
    render();
  } else if ("ws" in ds) {
    V.ws = !V.ws;
    render();
  } else if (ds.setent) {
    D.ent = ds.setent;
    V.ws = false;
    save();
    if (V.view === "project") V.view = "projects";
    render();
  } else if ("logoup" in ds) {
    document.getElementById("lgf").click();
  } else if ("logodel" in ds) {
    delete D.logo;
    save();
    render();
  } else if ("bell" in ds) {
    go("notes");
  } else if (ds.nopen !== undefined) {
    const n = D.notes[ds.nopen];
    if (n) {
      n.r = 1;
      save();
      if (n.k === "lic") go("licenses");
      else if (n.p && D.projects.some((p) => p.id === n.p && canSee(p))) go("project", n.p);
      else render();
    }
  } else if (ds.gop) {
    go("project", ds.gop);
  } else if ("hamb" in ds) {
    V.nav = !V.nav;
    render();
  } else if ("acct" in ds) {
    V.menu = V.menu === ds.acct ? false : ds.acct;
    render();
  } else if (ds.lother) {
    /* contract edits stay in a draft until «Guardar» */
    if (!V.ldraft) return;
    V.ldraft.other = Math.max(0, Math.min(999, V.ldraft.other + Number(ds.d)));
    render();
  } else if (ds.ledit) {
    if (!isBoard()) return;
    const l = D.licenses[ds.ledit];
    V.ledit = Number(ds.ledit);
    V.ldraft = { seats: l.seats, other: l.other, admin: l.admin || "", renew: RENEW(l) };
    render();
  } else if (ds.lopen) {
    V.lsheet = ds.lopen;
    V.modal = "licd";
    V.ledit = null;
    V.ldraft = null;
    render();
  } else if (ds.bought !== undefined) {
    /* Dirección bought the seats in the vendor's console: the contract grows and the owners of the projects waiting for them are told */
    if (!isBoard()) return;
    const l = D.licenses[ds.bought],
      inv = l && seatInventory(l);
    if (!inv) return;
    const n = inv.missing + inv.later,
      o = opt(l.opt),
      ps = [...inv.ps, ...inv.fut].filter((p) => needOfOpt(p, l.opt) > 0);
    l.seats += n;
    if (SYNC(l.opt)) l.synced = Date.now();
    /* one notice per owner, naming all her projects that were waiting */
    [...new Set(ps.map((p) => p.owner))].forEach((ow) => {
      const mine = ps.filter((p) => p.owner === ow);
      D.notes.unshift({ ic: "check-circle", k: "lic", to: ow, t: `${n > 1 ? "Ya están" : "Ya está"} ${n > 1 ? "los asientos" : "el asiento"} de ${o.n}`, s: `Para ${mine.map((p) => `«${p.name}»`).join(" y ")}`, p: mine[0].id, ts: Date.now(), r: 0 });
    });
    save();
    V.toast = `Asiento${n > 1 ? "s" : ""} añadido${n > 1 ? "s" : ""}. ${[...new Set(ps.map((p) => p.owner.split(" ")[0]))].join(" y ")} ya lo sabe${ps.length > 1 && new Set(ps.map((p) => p.owner)).size > 1 ? "n" : ""}.`;
    render();
  } else if (ds.trimmed !== undefined) {
    /* Dirección removed unused seats in the vendor's console: smaller contract, a year of those seats saved */
    if (!isBoard()) return;
    const l = D.licenses[ds.trimmed],
      tm = l ? trimmable(seatInventory(l)) : 0;
    if (!tm) return;
    l.seats -= tm;
    D.trims = D.trims || [];
    D.trims.push({ opt: l.opt, scope: l.scope, n: tm, ts: Date.now() });
    save();
    V.toast = `Contrato actualizado. Ahorras ${eur(tm * licPrice(l) * 12)} al año.`;
    render();
  } else if ("srcs" in ds) {
    V.srcOpen = !V.srcOpen;
    render();
  } else if ("lcancel" in ds) {
    V.ledit = null;
    V.ldraft = null;
    render();
  } else if (ds.lsave !== undefined) {
    const l = D.licenses[ds.lsave];
    if (l && V.ldraft) {
      l.seats = V.ldraft.seats;
      l.other = V.ldraft.other;
      if (/^\d{4}-\d{2}-\d{2}$/.test(V.ldraft.renew || "")) l.renew = V.ldraft.renew;
      const u = (V.ldraft.admin || "").trim();
      if (u) l.admin = /^https?:\/\//i.test(u) ? u : "https://" + u;
      else delete l.admin;
      save();
      V.toast = "Contrato guardado";
    }
    V.ledit = null;
    V.ldraft = null;
    render();
  } else if (ds.src !== undefined) {
    const [pid, ri] = ds.src.split("|");
    if (D.projects.some((x) => x.id === pid)) {
      V.id = pid;
      V.draft = { ri: Number(ri) };
      V.modal = "src";
      render();
    }
  } else if ("setup" in ds) {
    V.draft = { name: D.setup ? D.org : "", err: "" };
    V.modal = "setup";
    render();
  } else if ("setupok" in ds) {
    const d = V.draft,
      n = d.name.trim();
    if (!n) {
      d.err = "Escribe el nombre de tu empresa.";
      render();
      return;
    }
    D.org = n.slice(0, 80);
    D.entities[0].name = D.org;
    D.setup = true;
    save();
    V.draft = newDraft();
    V.modal = "new";
    render();
  } else if ("loadseed" in ds) {
    unregisterCustom();
    seedData();
    V.view = "home";
    V.modal = null;
    V.toast = "Datos iniciales restaurados";
    render();
  } else if ("fresh" in ds) {
    V.nav = false;
    V.dpop = false;
    V.modal = "fresh";
    render();
  } else if ("freshok" in ds) {
    V.nav = false;
    unregisterCustom();
    emptyData();
    V.view = "home";
    V.modal = null;
    V.menu = false;
    V.toast = "Empiezas de cero";
    render();
  } else if ("pendall" in ds) {
    V.pendAll = !V.pendAll;
    render();
  } else if ("cmp" in ds) {
    V.draft = {};
    V.modal = "cmp";
    render();
  } else if (ds.cmpup) {
    pr.cmpSc = ds.cmpup;
    save();
    render();
  } else if (ds.cmpuse) {
    const V2 = cmpVariants(pr, pr.cmpSc || "est");
    if (teamCustomised(pr, V2)) {
      V.draft = { confirm: ds.cmpuse };
      render();
    } else useVariant(pr, ds.cmpuse);
  } else if ("cmpyes" in ds) useVariant(pr, V.draft.confirm);
  else if ("cmpno" in ds) {
    V.draft = {};
    render();
  } else if ("expo" in ds) {
    go("export", pr.id);
  } else if (ds.pexp) {
    V.menu = false;
    go("export", ds.pexp);
  } else if ("expback" in ds) {
    go("project", V.id);
  } else if ("doprint" in ds) {
    exportPDF(t.closest("[data-doprint]"));
  } else if (ds.rmenu) {
    V.menu = V.menu === "rm:" + ds.rmenu ? false : "rm:" + ds.rmenu;
    V._focusMenu = !!V.menu;
    render();
  } else if ("mbar" in ds) {
    const c = document.querySelector(".cside");
    if (c) scrollTo({ top: c.getBoundingClientRect().top + scrollY - 72, behavior: "smooth" });
  } else if (ds.pmenu) {
    V.menu = V.menu === "pm:" + ds.pmenu ? false : "pm:" + ds.pmenu;
    V._focusMenu = !!V.menu;
    render();
  } else if (ds.pdup) {
    const src = D.projects.find((x) => x.id === ds.pdup);
    if (src) {
      const c = clone(src);
      c.id = "p" + Date.now();
      c.name = src.name + (src.status === "rejected" || src.status === "cancelled" || stOf(src) === "done" ? " (copia)" : " (escenario)");
      delete c.parent;
      c.status = "draft";
      c.archived = false;
      c.review = null;
      delete c.sentAt;
      c.start = monthKey();
      D.projects.unshift(c);
      syncFill(c, true);
      save();
      V.menu = false;
      V.toast = src.status === "rejected" || src.status === "cancelled" || stOf(src) === "done" ? "Proyecto duplicado como borrador" : "Escenario creado como borrador";
      go("project", c.id);
    }
  } else if (ds.parch) {
    const p = D.projects.find((x) => x.id === ds.parch);
    if (p) {
      p.archived = true;
      save();
      V.menu = false;
      V.toast = `«${p.name}» archivado`;
      if (V.view === "project") V.view = "projects";
      render();
    }
  } else if (ds.punarch) {
    const p = D.projects.find((x) => x.id === ds.punarch);
    if (p) {
      p.archived = false;
      save();
      V.menu = false;
      V.toast = `«${p.name}» restaurado`;
      render();
    }
  } else if (ds.pdel) {
    V.menu = false;
    const q = D.projects.find((x) => x.id === ds.pdel);
    if (q && q.parent) {
      V.draft = { trcx: ds.pdel };
      V.modal = "trcx";
    } else {
      V.draft = ds.pdel;
      V.modal = "del";
    }
    render();
  } else if ("pdelok" in ds) {
    const id = V.draft;
    D.projects = D.projects.filter((x) => x.id !== id);
    D.notes = D.notes.filter((n) => n.p !== id);
    save();
    V.modal = null;
    V.toast = "Proyecto eliminado";
    if (V.view === "project" || V.view === "export") V.view = "projects";
    render();
  } else if (ds.freeai !== undefined && isBoard()) {
    if (!isBoard() || !ds.v) return;
    const was = D.freeAI || "company";
    D.projects.forEach((p) => p.status !== "draft" && !p.freeAI && (p.freeAI = was));
    D.freeAI = ds.v;
    save();
    V.toast = ds.v === "own" ? "Los freelance usan su propia IA" : "Los freelance usan la IA de la empresa";
    render();
  } else if (ds.delent) {
    V.draft = ds.delent;
    V.modal = "delent";
    render();
  } else if ("delentok" in ds) {
    const id = V.draft;
    if (!D.projects.some((p) => p.ent === id) && D.entities.length > 1) {
      D.entities = D.entities.filter((e) => e.id !== id);
      D.licenses = D.licenses.filter((l) => l.scope !== id);
      if (D.ent === id) D.ent = "all";
      save();
      V.toast = "Empresa eliminada";
    }
    V.modal = null;
    render();
  } else if (ds.radv !== undefined) {
    V.radv = V.radv || {};
    const k = pr.id + ":" + ds.radv;
    V.radv[k] = !V.radv[k];
    /* keep the button where it was on screen: re-rendering must not move the page */
    const top0 = t.getBoundingClientRect().top;
    render();
    const nb = document.querySelector(`[data-radv="${ds.radv}"]`);
    if (nb) scrollBy(0, nb.getBoundingClientRect().top - top0);
  } else if (ds.crateclr && isBoard()) {
    delete D.rates[ds.crateclr];
    save();
    render();
  } else if (ds.seats !== undefined) {
    const l = D.licenses[ds.seats];
    if (!V.ldraft) return;
    V.ldraft.seats = Math.max(0, Math.min(CAP[l.opt] ? CAP[l.opt][0] : 9999, V.ldraft.seats + Number(ds.d)));
    render();
  } else if ("invite" in ds) {
    V.draft = { mode: "new", email: "", role: "Responsable de proyecto", scope: "Todas" };
    V.modal = "invite";
    render();
  } else if (ds.intmore) {
    V.intMore = V.intMore || {};
    V.intMore[ds.intmore] = !V.intMore[ds.intmore];
    render();
  } else if (ds.umenu) {
    V.menu = V.menu === "um:" + ds.umenu ? false : "um:" + ds.umenu;
    V._focusMenu = !!V.menu;
    render();
  } else if (ds.uresend) {
    V.menu = false;
    V.toast = "Invitación reenviada a " + D.users[ds.uresend][0];
    render();
  } else if (ds.uedit) {
    const u = D.users[ds.uedit];
    V.menu = false;
    V.draft = { mode: "edit", idx: Number(ds.uedit), name: u[0], role: roleKey(u[1]), scope: u[2] };
    V.modal = "invite";
    render();
  } else if (ds.udel) {
    V.menu = false;
    V.draft = Number(ds.udel);
    V.modal = "udel";
    render();
  } else if ("udelok" in ds) {
    const u = D.users[V.draft];
    if (u) {
      D.users.splice(V.draft, 1);
      save();
      V.toast = u[3] ? "Invitación a " + u[0] + " cancelada" : u[0] + " ya no tiene acceso";
    }
    V.modal = null;
    render();
  } else if ("uinviteok" in ds) {
    const d = V.draft;
    if (d.mode === "edit") {
      const u = D.users[d.idx];
      if (u) {
        u[1] = d.role;
        u[2] = d.role === "Administrador global" ? "Todas" : d.scope;
        V.toast = "Rol de " + u[0] + " actualizado";
      }
    } else {
      if (!emailOk(d.email, d)) return;
      D.users.push([d.email, d.role, d.role === "Administrador global" ? "Todas" : d.scope, "pend"]);
      V.toast = "Invitación enviada a " + d.email;
    }
    save();
    V.modal = null;
    render();
  } else if (ds.imenu) {
    V.menu = V.menu === "im:" + ds.imenu ? false : "im:" + ds.imenu;
    V._focusMenu = !!V.menu;
    render();
  } else if (ds.intgoff) {
    V.menu = false;
    V.draft = ds.intgoff;
    V.modal = "intgoff";
    render();
  } else if ("intgoffok" in ds) {
    D.intg = D.intg || {};
    D.intg[V.draft] = false;
    if (D.ratesSrc && D.ratesSrc.by === V.draft) delete D.ratesSrc; /* the figures stay as the company's own */
    save();
    V.toast = V.draft + " desconectado";
    V.modal = null;
    render();
  } else if (ds.intg) {
    /* like a real OAuth connection: HUMAIN explains what it will read, then the tool opens to sign in and grant access */
    V.modal = "intg";
    V.draft = ds.intg;
    V.intgWait = false;
    render();
  } else if ("intggo" in ds) {
    const n = V.draft;
    V.intgWait = true;
    render();
    clearTimeout(V.intgT);
    V.intgT = setTimeout(() => {
      if (V.modal !== "intg" || V.draft !== n) return;
      D.intg = D.intg || {};
      D.intg[n] = true;
      D.licenses.forEach((l) => {
        if (SYNC(l.opt) && !(l.synced > 0)) l.synced = Date.now();
      });
      const imp = isHR(n) ? importRates(n) : 0;
      save();
      V.modal = null;
      V.intgWait = false;
      V.toast = imp ? `${n} conectado: ${imp} tarifa${imp !== 1 ? "s" : ""} importada${imp !== 1 ? "s" : ""}` : `${n} conectado`;
      render();
    }, 2200);
  } else if (ds.dset) {
    const d = V.draft;
    if (ds.dset === "dk") {
      d.dk = true;
      d.months = REFM[d.size || "m"] || 6;
    } else d[ds.dset] = ds.dset === "months" ? Number(ds.v) : ds.v;
    /* only «No lo sé» follows the size (the typical duration of a team of that size); a duration the person sees selected never changes by itself */
    if (ds.dset === "size" && d.months !== 0 && d.dk) d.months = REFM[ds.v] || 6;
    if (ds.dset === "months") {
      d.mTouched = true;
      d.dk = false;
    }
    if (ds.dset === "smode" && ds.v === "pick" && !d.start) d.start = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
    render();
  } else if (ds.pickday) {
    V.draft.end = ds.pickday;
    V.calOpen = false;
    render();
  } else if (ds.calnav) {
    const d = V.draft,
      b = d.cal ? new Date(d.cal + "-01T12:00") : d.end ? new Date(d.end + "T12:00") : new Date(Date.now() + 14 * 864e5);
    b.setDate(1);
    b.setMonth(b.getMonth() + Number(ds.calnav));
    d.cal = `${b.getFullYear()}-${String(b.getMonth() + 1).padStart(2, "0")}`;
    render();
  } else if ("dcustom" in ds) {
    V.calOpen = !(V.draft.custom && V.calOpen);
    V.draft.custom = true;
    V.draft.months = V.draft.months || 6;
    render();
  } else if (ds.dseats) {
    const d = V.draft,
      k = ds.dseats;
    d[k] = Math.max(k === "seats" ? 1 : 0, d[k] + Number(ds.d));
    d.other = Math.min(d.other, d.seats);
    render();
  } else if (ds.nstep) {
    if (!V.draft.type || (V.draft.newTeam !== undefined && !V.draft.newTeam.trim())) {
      V.draft.typeErr = true;
      render();
      return;
    }
    V.draft.step = Number(ds.nstep);
    render();
    document.querySelector("#modal .sheet")?.scrollTo(0, 0);
    (document.querySelector("#modal .sheet input,#modal .sheet [role=radio][aria-checked=true]") || document.querySelector("#modal .sheet"))?.focus({ preventScroll: true });
  } else if ("nadv" in ds) {
    V.draft.adv = !V.draft.adv;
    render();
  } else if ("create" in ds) {
    const d = V.draft,
      x = applyDraft(d);
    if (!d.type) return;
    const owner = meName(),
      p = {
        id: "p" + Date.now(),
        ...x,
        name: x.name.trim() || (d.type === "other" && d.desc) || TYPES[d.type][1],
        desc: d.desc || "",
        owner,
        ent: (MGR(owner) || {}).ent || d.ent,
        status: "draft",
        startFrom: d.startFrom === "new" ? "new" : "team",
        aiPref: d.aiPref || "rec",
        justif: "",
        review: null,
        cmpSc: "est",
        own: [],
        roles: [],
        shared: { pm: pick("pm"), genai: pick("genai") },
        qty: {},
      };
    if (d.type !== "other" && d.empty !== "1") {
      suggest(p);
      /* project-wide defaults from «Avanzado» */
      p.roles.forEach((r) => {
        if (d.mod && d.mod !== "remote") r.mod = d.mod;
        if (d.country && d.country !== ENT(p.ent).country) r.country = d.country;
        if (d.ct === "emp") r.ct = "emp";
        if (d.ct === "free") r.ct = "free";
        if (r.ct === "emp" && !r.n) {
          r.n = 1;
          r.hours = 0;
        }
      });
    }
    applyAiPref(p);
    if (d.newTeam && d.newTeam.trim()) {
      const mm = MGR(owner);
      if (mm && !teamsOf(owner).some((t) => t.toLowerCase() === d.newTeam.trim().toLowerCase())) {
        mm.teams = [...teamsOf(owner), d.newTeam.trim().slice(0, 60)];
        mm.team = mm.teams[0];
      }
    }
    D.projects.unshift(p);
    syncFill(p, true);
    save();
    V.modal = null;
    V.jerr = false;
    go("project", p.id);
  } else if ("edit" in ds) {
    V.draft = {
      name: pr.name,
      goal: pr.goal || "",
      type: pr.type,
      size: pr.size,
      months: pr.months,
      dk: !!pr.dk,
      mTouched: true,
      budget: pr.budget,
      ent: pr.ent,
      smode: pr.start && pr.start !== monthKey() ? "pick" : "now",
      start: pr.start,
    };
    V.modal = "edit";
    render();
  } else if ("saveedit" in ds) {
    const scope0 = [pr.type, pr.size, !!pr.months, pr.months];
    Object.assign(pr, applyDraft(V.draft));
    pr.name = pr.name.trim() || TYPES[pr.type][1];
    /* only the estimated work, and only when what it depends on changed: a work figure the user typed survives a rename */
    if (pr.work != null && JSON.stringify(scope0) !== JSON.stringify([pr.type, pr.size, !!pr.months, pr.months])) estimateWork(pr);
    save();
    V.modal = null;
    render();
  } else if (ds.pfilter) {
    V.pf = PF[ds.pfilter] || ds.pfilter === "archived" ? ds.pfilter : "all";
    go("projects");
  } else if (ds.opentr) {
    V.menu = false;
    V.draft = { trv: ds.opentr };
    V.modal = "trv";
    render();
  } else if (ds.openp) {
    V.menu = false;
    const op = D.projects.find((x) => x.id === ds.openp);
    /* a rejected request (an addition to an approved project) opens as the request itself, with the answer and the way forward */
    if (op && op.parent && op.status === "rejected" && !isBoard() && personReqs().some((q) => q.id === op.id)) {
      V.draft = { trv: op.id };
      V.modal = "trv";
      render();
      return;
    }
    if (V.modal === "trv") V.modal = null;
    go("project", ds.openp);
  } else if (ds.open) {
    V.open = V.open === ds.open ? null : ds.open;
    render();
  } else if (ds.tsel) {
    const [k, ck, id] = ds.tsel.split("|");
    if (k === "s") {
      pr.shared[ck] = id || null;
      delete pr.qty[ck];
    } else {
      pr.roles[k].tools[ck] = id || null;
      delete (pr.roles[k].qty || {})[ck];
    }
    V.open = null;
    V.tnew = null;
    save();
    render();
  } else if (ds.qty) {
    const [k, ck] = ds.qty.split("|"),
      d = Number(ds.d);
    const K = cost(pr);
    if (k === "s") pr.qty[ck] = Math.max(0, (K.qs[ck] || 0) + d);
    else {
      const r = pr.roles[k];
      r.qty[ck] = Math.max(0, (K.qr[k][ck] || 0) + d);
    }
    save();
    render();
  } else if (ds.ppl) {
    const r = pr.roles[ds.ppl];
    r.n = Math.max(1, r.n + Number(ds.d));
    if (!r.n && !r.hours) r.hours = 80;
    r.ai = Math.min(r.ai, Math.max(1, r.n));
    syncFill(pr);
    r.qty = {};
    save();
    render();
  } else if (ds.hrs) {
    const r = pr.roles[ds.hrs];
    r.hours = Math.max(5, Math.min(HPM, r.hours + 5 * Number(ds.d)));
    save();
    render();
  } else if (ds.aip) {
    const r = pr.roles[ds.aip];
    r.ai = Math.max(0, Math.min(Math.max(1, r.n), r.ai + Number(ds.d)));
    r.qty = {};
    save();
    render();
  } else if (ds.ct) {
    const r = pr.roles[ds.ct];
    r.ct = ds.v;
    if (ds.v === "emp" && !r.n) {
      r.n = 1;
      r.ai = Math.min(r.ai, 1);
      r.qty = {};
    }
    save();
    render();
  } else if (ds.series) {
    const v = V.chart,
      k = ds.series;
    if (v.includes(k)) {
      if (v.length > 1) V.chart = v.filter((x) => x !== k);
    } else V.chart = [...v, k];
    render();
  } else if (ds.ded) {
    const r = pr.roles[ds.ded];
    if (ds.v === "hrs") {
      r.n = 0;
      r.hours = r.hours || 80;
      r.ai = Math.min(r.ai, 1);
    } else {
      r.n = Math.max(1, r.n);
    }
    syncFill(pr);
    r.qty = {};
    save();
    render();
  } else if (ds.aitog) {
    const r = pr.roles[ds.aitog];
    r.ai = r.ai > 0 ? 0 : 1;
    r.qty = {};
    save();
    render();
  } else if (ds.ropen !== undefined && V.view === "project") {
    const k = pr.id + ":" + ds.ropen;
    V.ropen = V.ropen === k ? null : k;
    render();
    if (V.ropen) {
      const el = document.getElementById("role-" + ds.ropen);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top < 70 || r.top > innerHeight - 120) scrollTo({ top: scrollY + r.top - 90, behavior: SMOOTH() });
      }
    }
  } else if (ds.grade !== undefined && ds.v) {
    pr.roles[ds.grade].grade = ds.v;
    save();
    render();
  } else if (ds.lr !== undefined && ds.v) {
    pr.roles[ds.lr].lr = ds.v;
    save();
    render();
  } else if (ds.reports) {
    const r = pr.roles[ds.reports];
    r.reports = Math.max(0, Math.min(60, (r.reports || 0) + Number(ds.d)));
    save();
    render();
  } else if (ds.scope !== undefined && ds.v) {
    const r = pr.roles[ds.scope],
      v = ds.v;
    r.scopes = r.scopes || [];
    r.scopes = r.scopes.includes(v) ? (r.scopes.length > 1 ? r.scopes.filter((x) => x !== v) : r.scopes) : [...r.scopes, v];
    save();
    render();
  } else if ("assume" in ds) {
    const inPanel = !!t.closest(".asmc");
    V.assume = V.assume === pr.id && inPanel ? null : pr.id;
    render();
    if (!inPanel) document.querySelector(".asmc")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if ("workreset" in ds) {
    estimateWork(pr);
    save();
    render();
  } else if (ds.upreset) {
    pr.roles[ds.upreset].up = null;
    save();
    render();
  } else if (ds.up) {
    const r = pr.roles[ds.up];
    r.up = Math.max(-50, Math.min(100, upOf(r) + 5 * Number(ds.d)));
    save();
    render();
  } else if (ds.loc !== undefined && ds.v) {
    pr.roles[ds.loc].loc = ds.v;
    save();
    render();
  } else if (ds.mod !== undefined && ds.v) {
    pr.roles[ds.mod].mod = ds.v;
    save();
    render();
  } else if (ds.rateclr) {
    delete pr.roles[ds.rateclr].rate;
    save();
    render();
  } else if (ds.rexp) {
    V.rexp = V.rexp === ds.rexp ? null : ds.rexp;
    render();
  } else if ("rall" in ds) {
    V.rall = true;
    render();
  } else if ("crole" in ds) {
    V.draft = { t: V.rq || "", cat: "product", arch: "ic", rate: 0 };
    V.modal = "crole";
    render();
  } else if ("backrole" in ds) {
    V.modal = "role";
    render();
  } else if ("savecrole" in ds) {
    const d = V.draft;
    if (!(d.t || "").trim()) return;
    const c = { id: "c-" + Date.now(), t: d.t.trim(), cat: d.cat, arch: d.arch, rate: d.rate || null };
    D.croles.push(c);
    regCustom(c);
    V.ropen = pr.id + ":" + pr.roles.length;
    const nr = mkRole(c.id, 1);
    if (c.rate) nr.rate = c.rate;
    nr.ct = pr.months && pr.months <= 3 ? "free" : "emp";
    pr.roles.push(nr);
    syncFill(pr);
    V.modal = null;
    save();
    V.toast = "Puesto creado y añadido";
    render();
  } else if (ds.delrole) {
    const id = ds.delrole,
      used = D.projects.filter((p) => p.roles.some((r) => r.id === id)).length;
    if (used) {
      V.toast = `Está en ${used} proyecto${used > 1 ? "s" : ""}: quítalo de ahí antes de borrarlo`;
      render();
      return;
    }
    D.croles = D.croles.filter((c) => c.id !== id);
    delete FAM[id];
    save();
    V.toast = "Rol eliminado del catálogo";
    render();
  } else if ("savedraft" in ds && pr) {
    save();
    V.pf = "draft";
    V.toast = "Guardado en Borradores. Puedes retomarlo cuando quieras.";
    go("projects");
  } else if ("askt" in ds) {
    const ap = D.projects.find((x) => x.id === ds.askt);
    V.askopen = ap && askOpen(ap) ? "x" + ds.askt : ds.askt;
    render();
  } else if ("pview" in ds) {
    V.pview = ds.pview;
    render();
  } else if ("lvopen" in ds) {
    V.lvopen = V.lvopen === ds.lvopen ? null : ds.lvopen;
    render();
  } else if ("toolreq" in ds) {
    V.menu = false;
    V.draft = { kind: "tool", cat: ds.tcat || "", where: "", pid: "", fid: "", when: "now", why: "", opt: null, who: "", err: "", whoIds: ds.trfor ? [ds.trfor] : [], forPid: ds.trfor || "" };
    V.modal = "ask";
    render();
  } else if ("sendask" in ds) {
    const d = V.draft,
      src = D.projects.find((x) => x.id === d.where),
      px = (D.people || []).find((x) => x.id === d.pid);
    if (d.pid === "reg") {
      if (!(d.rname || "").trim() || !d.fid) {
        d.err = !(d.rname || "").trim() ? "Escribe el nombre de la persona." : "Elige el puesto.";
        render();
        return;
      }
      const nk = (x) => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
      if ((D.people || []).some((x) => nk(x.name) === nk(d.rname) && x.fid === d.fid)) {
        d.err = "Ya hay una persona con este nombre y puesto en la empresa.";
        render();
        return;
      }
      const tm = meName(),
        mm = MGR(tm),
        un = d.team && teamsOf(tm).includes(d.team) ? d.team : teamsOf(tm)[0];
      D.people.push({ id: "u" + Date.now(), name: d.rname.trim().slice(0, 80), fid: d.fid, lvl: "mid", team: tm, ...(teamsOf(tm).length > 1 ? { unit: un } : {}), ent: (mm || {}).ent || D.entities[0].id });
      save();
      V.modal = null;
      V.toast = `${d.rname.trim()} añadida al equipo`;
      render();
      return;
    }
    if (d.pid === "new" && d.fid && visPeople().some((x) => x.fid === d.fid && isOpen(x.id))) {
      d.err = "Ya tienes a alguien libre con este puesto.";
      render();
      return;
    }
    if (!src || !d.pid) {
      d.err = !src ? "Elige dónde se suma." : "Elige a quién.";
      render();
      return;
    }
    if (px) {
      const eo = editSnap(d, true);
      if (d.editReq) D.projects = D.projects.filter((x) => x.id !== d.editReq);
      const c = amendOf(src),
        nr = mkRole(px.fid, 1);
      nr.ct = c.months && c.months <= 3 ? "free" : "emp";
      nr.fill = [{ src: "mine", pid: px.id }];
      if (d.team) nr.team = d.team;
      c.roles.push(nr);
      syncFill(c);
      c.justif = (d.why || "").trim() || "Asignación de alguien libre del equipo";
      c.status = "pending";
      c.sentAt = Date.now();
      D.projects.unshift(c);
      D.notes.unshift({ ic: "user-plus", k: "rev", to: "board", t: `${c.owner} pide asignar a ${px.name} a «${src.name}»`, s: "Pendiente de tu aprobación", p: c.id, ts: Date.now(), r: 0 });
      save();
      V.modal = null;
      V.toast = d.editReq ? "Petición actualizada" : "Petición enviada a Dirección";
      editUndo(eo, c.id);
      render();
      return;
    }
    if (!d.fid) {
      d.err = "Elige el puesto.";
      render();
      return;
    }
    if (!(d.why || "").trim()) {
      d.err = "Cuéntale a Dirección por qué la necesitas.";
      render();
      return;
    }
    const eo = editSnap(d, true);
    if (d.editReq) D.projects = D.projects.filter((x) => x.id !== d.editReq);
    const c = amendOf(src);
    if (d.when === "next") c.start = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
    const nr = mkRole(d.fid, 1);
    nr.ct = c.months && c.months <= 3 ? "free" : "emp";
    if (d.team) nr.team = d.team;
    nr.fill = [{ src: "new" }];
    c.roles.push(nr);
    applyAiPref({ ...c, roles: [nr], shared: {} });
    syncFill(c);
    c.justif = d.why.trim();
    c.status = "pending";
    c.sentAt = Date.now();
    D.projects.unshift(c);
    D.notes.unshift({ ic: "file-alt", k: "rev", to: "board", t: `${c.owner} pide sumar ${FAM[d.fid].t} a «${src.name}»${d.team ? ` para ${d.team}` : ""}`, s: "Pendiente de tu aprobación", p: c.id, ts: Date.now(), r: 0 });
    save();
    V.modal = null;
    V.toast = d.editReq ? "Petición actualizada" : "Petición enviada a Dirección";
    editUndo(eo, c.id);
    render();
  } else if ("sendtreq" in ds) {
    const d = V.draft;
    if (!d.opt) {
      d.err = "Elige la herramienta.";
      render();
      return;
    }
    const eo = editSnap(d, false),
      nid = "tr" + Date.now();
    D.toolReqs = (D.toolReqs || []).filter((x) => x.id !== d.editReq);
    D.toolReqs.unshift({ id: nid, opt: d.opt, forId: d.where && d.where !== "team" ? d.where : "", forName: d.where && d.where !== "team" ? "Para «" + ((D.projects.find((q) => q.id === d.where) || {}).name || "proyecto") + "»" : "Para tu equipo", who: (d.whoIds || []).map((i) => (PERSON(i) || {}).name).filter(Boolean).join(", "), why: (d.why || "").trim(), by: meName(), status: "pending", ts: Date.now() });
    D.notes.unshift({ ic: "key-skeleton", k: "lic", to: "board", t: `${meName()} pide ${opt(d.opt).n}`, s: "Pendiente de tu aprobación", p: "", ts: Date.now(), r: 0 });
    save();
    V.modal = null;
    V.toast = d.editReq ? "Petición actualizada" : "Petición enviada a Dirección";
    editUndo(eo, nid);
    render();
  } else if (ds.trcancel) {
    V.menu = false;
    V.draft = { trcx: ds.trcancel };
    V.modal = "trcx";
    render();
  } else if ("trcancelok" in ds) {
    const id = V.draft && V.draft.trcx,
      r = (D.toolReqs || []).find((q) => q.id === id) || personReqs().find((q) => q.id === id);
    V.modal = null;
    if (r && r.by === meName() && ["pending", "changes"].includes(r.status)) {
      const par = r.amend ? (D.projects.find((q) => q.id === id) || {}).parent : null;
      V.undo = { amend: !!r.amend, item: r.amend ? D.projects.find((q) => q.id === id) : (D.toolReqs || []).find((q) => q.id === id), notes: D.notes.filter((n) => n.p === id), par };
      if (r.amend) D.projects = D.projects.filter((q) => q.id !== id);
      else D.toolReqs = D.toolReqs.filter((q) => q.id !== id);
      D.notes = D.notes.filter((n) => n.p !== id);
      save();
      V.toast = "Petición cancelada";
      V.toastAct = "Deshacer";
      if (par && V.view === "project") {
        render();
        go("project", par);
        return;
      }
    }
    render();
  } else if (ds.trhide !== undefined || ds.trclear !== undefined) {
    /* take answered requests off the list (the request itself stays on record); «Deshacer» puts them back */
    const vk = noteViewer(),
      pool = [...(D.toolReqs || []), ...personReqs(isBoard())],
      ids = ds.trhide !== undefined ? [ds.trhide] : pool.filter((r) => r.status !== "pending" && !(r.hid || []).includes(vk) && (ds.trclear === "person" ? r.kind === "person" : r.kind !== "person") && (isBoard() || r.by === meName())).map((r) => r.id);
    const holder = (id) => (D.toolReqs || []).find((r) => r.id === id) || D.projects.find((p) => p.id === id);
    ids.forEach((id) => {
      const h = holder(id);
      if (!h) return;
      const k = (D.toolReqs || []).includes(h) ? "hid" : "hidReq";
      h[k] = [...(h[k] || []), vk];
    });
    V.menu = false;
    if (V.modal === "trv") V.modal = null;
    V.undo = { reqs: ids, vk };
    V.toastAct = "Deshacer";
    V.toast = ids.length > 1 ? `${ids.length} peticiones fuera de la lista` : "Petición quitada de la lista";
    save();
    render();
  } else if (ds.nread !== undefined) {
    const n = D.notes[Number(ds.nread)];
    if (n) {
      n.r = 1;
      save();
      render();
    }
  } else if (ds.ndis !== undefined) {
    /* an informative notice has nothing to open, so it is dismissed from its own row */
    const n = D.notes[Number(ds.ndis)],
      vk = noteViewer();
    if (n) {
      n.hid = [...(n.hid || []), vk];
      V.undo = { notes: [Number(ds.ndis)], vk };
      V.toastAct = "Deshacer";
      V.toast = "Notificación eliminada";
      save();
      render();
    }
  } else if ("nreadall" in ds) {
    myNotes().forEach((n) => (n.r = 1));
    save();
    render();
  } else if ("undotr" in ds) {
    const u = V.undo;
    V.undo = null;
    document.querySelectorAll(".toast").forEach((e) => e.remove());
    if (u && u.leave) {
      const x = (D.people || []).find((q) => q.id === u.leave), sn = JSON.parse(u.snap);
      if (x) delete x.leaving;
      D.projects = sn.projects;
      D.notes = sn.notes;
      save();
      render();
      return;
    }
    if (u && u.tchip) {
      const q = D.projects.find((x) => x.id === u.tchip), r = q && q.roles[u.ix];
      if (r) { r.tools = u.tools; r.ai = u.ai; save(); render(); }
      return;
    }
    if (u && u.resug) {
      const q = D.projects.find((x) => x.id === u.resug);
      if (q) { q.roles = u.roles; save(); render(); }
      return;
    }
    if (u && u.reqs) {
      u.reqs.forEach((id) => {
        const h = (D.toolReqs || []).find((r) => r.id === id) || D.projects.find((p) => p.id === id);
        if (!h) return;
        const k = (D.toolReqs || []).includes(h) ? "hid" : "hidReq";
        h[k] = (h[k] || []).filter((v) => v !== u.vk);
      });
      save();
      V.toast = "Petición recuperada";
    } else if (u && u.notes) {
      u.notes.forEach((k) => D.notes[k] && (D.notes[k].hid = (D.notes[k].hid || []).filter((v) => v !== u.vk)));
      save();
      V.toast = "Notificación recuperada";
    } else if (u && u.decision) {
      const o = JSON.parse(u.snap);
      D.projects = o.projects;
      D.toolReqs = o.toolReqs;
      D.people = o.people;
      D.licenses = o.licenses;
      D.notes = o.notes;
      save();
      V.toast = u.cancelp ? "Cancelación deshecha" : "Decisión deshecha";
    } else if (u && u.edit) {
      if (u.amend) D.projects = [u.old, ...D.projects.filter((x) => x.id !== u.newId && x.id !== u.old.id)];
      else D.toolReqs = [u.old, ...(D.toolReqs || []).filter((x) => x.id !== u.newId && x.id !== u.old.id)];
      D.notes = [...u.notes, ...D.notes.filter((n) => n.p !== u.newId)];
      save();
      V.toast = "Cambios deshechos";
    } else if (u && u.roles) {
      const q = D.projects.find((x) => x.id === u.pid);
      if (q) {
        q.roles = JSON.parse(u.roles);
        if (u.shared) q.shared = JSON.parse(u.shared);
        if (u.pqty) q.qty = JSON.parse(u.pqty);
        V.ropen = null;
        save();
        V.toast = u.shared ? "Cambio deshecho" : "Puesto recuperado";
      }
    } else if (u && u.item) {
      if (u.amend) D.projects.push(u.item);
      else D.toolReqs = [u.item, ...(D.toolReqs || [])];
      D.notes = [...u.notes, ...D.notes];
      save();
      V.toast = "Petición recuperada";
    }
    render();
    if (u && u.amend && u.par && V.view === "project") go("project", u.item.id);
  } else if (ds.trremind) {
    V.menu = false;
    const id = ds.trremind,
      r = (D.toolReqs || []).find((q) => q.id === id) || personReqs().find((q) => q.id === id);
    if (r && r.by === meName() && ["pending", "changes"].includes(r.status)) {
      {
        r.remindedAt = Date.now();
        if (r.amend) D.projects.find((q) => q.id === id).remindedAt = r.remindedAt;
        const days = Math.max(1, Math.round((Date.now() - r.ts) / 864e5));
        D.notes.unshift({ ic: "bell", k: "rev", to: "board", t: `${meName()} recuerda su petición: ${reqName(r)}`, s: `Lleva ${days} día${days > 1 ? "s" : ""} sin respuesta`, ts: Date.now(), r: 0 });
        V.toast = "Recordatorio enviado a Dirección";
      }
      save();
    }
    render();
  } else if (ds.treq) {
    const [id, a] = ds.treq.split("|");
    V.menu = false;
    if (V.modal === "trv") V.modal = null;
    boardDecide(id, a, "");
  } else if (ds.trrj) {
    V.menu = false;
    V.draft = { trrj: ds.trrj, comment: "", err: "", from: V.modal === "trv" ? "trv" : "" };
    V.modal = "trrj";
    render();
  } else if ("trrjback" in ds) {
    const id = V.draft && V.draft.trrj;
    V.draft = { trv: id };
    V.modal = "trv";
    render();
  } else if ("trrjok" in ds) {
    const d = V.draft;
    if (!d || !d.trrj) return;
    if (!(d.comment || "").trim()) {
      d.err = "Escribe por qué la rechazas.";
      render();
      return;
    }
    V.modal = null;
    boardDecide(d.trrj, "no", d.comment.trim());
  } else if ("costeye" in ds) {
    V.costRoles[ds.costeye] = !V.costRoles[ds.costeye];
    render();
  } else if (ds.costview !== undefined) {
    if (!isBoard() || !ds.v) return;
    D.costView = ds.v;
    V.showCost = false;
    save();
    V.toast = ds.v === "totals" ? "Dirección ve solo totales" : "Dirección ve el coste por persona";
    render();
  } else if (ds.leavex) {
    const x = PERSON(ds.leavex);
    V.menu = false;
    if (x) {
      V.draft = { kind: "leave", team: areaOf(x), lead: x.team, sel: x.id, date: "", err: "" };
      V.modal = "leave";
      render();
    }
  } else if (ds.leaveopen) {
    V.menu = false;
    V.draft = { kind: "leave", team: ds.leaveopen.split("||")[1], lead: ds.leaveopen.split("||")[0], sel: "", date: "", err: "" };
    V.modal = "leave";
    render();
  } else if ("leavedo" in ds) {
    const d = V.draft,
      x = (D.people || []).find((q) => q.id === d.sel);
    if (!x || !d.date) {
      d.err = !x ? "Elige a quién." : "Pon su último día.";
      render();
      return;
    }
    const tools = new Set(),
      names = [];
    D.projects
      .filter((q) => !q.archived && q.owner === meName())
      .forEach((q) =>
        q.roles.forEach((r) =>
          (r.fill || []).forEach((f, i) => {
            if (f && f.pid === x.id) {
              Object.values(r.tools || {}).forEach((o) => o && tools.add(o));
              r.fill[i] = { src: "new", vacated: x.name };
              if (!names.includes(q.name)) names.push(q.name);
            }
          })
        )
      );
    V.undo = { leave: x.id, snap: JSON.stringify({ projects: D.projects, notes: D.notes }) };
    x.leaving = { date: d.date, why: d.why || "quit", tools: [...tools], projects: names };
    D.notes.unshift({ ic: "user-minus", k: "rev", to: "board", t: `${meName()} ha dado de baja a ${x.name}`, s: `Último día: ${fmtShort(d.date)}${names.length ? " · deja sin cubrir " + names.map((n) => "«" + n + "»").join(" y ") : ""} · solo aviso`, ts: Date.now(), r: 0 });
    save();
    V.modal = null;
    V.toast = `${x.name} se va el ${fmtShort(d.date)}`;
    V.toastAct = "Deshacer";
    render();
  } else if (ds.tmp && V.draft) {
    const st = new Set(V.draft.sel || []);
    st.has(ds.tmp) ? st.delete(ds.tmp) : st.add(ds.tmp);
    V.draft.sel = [...st];
    if (V.draft.sel.length) V.draft.perr = "";
    render();
  } else if (ds.trwp) {
    const d = V.draft;
    d.whoIds = d.whoIds || [];
    d.whoIds = d.whoIds.includes(ds.trwp) ? d.whoIds.filter((i) => i !== ds.trwp) : [...d.whoIds, ds.trwp];
    render();
  } else if (ds.pcancel) {
    V.menu = null;
    V.modal = "pcancel";
    V.draft = { pid: ds.pcancel, t: "" };
    render();
    setTimeout(() => document.getElementById("pcx")?.focus(), 50);
  } else if ("pcancelok" in ds && V.draft) {
    const q = D.projects.find((x) => x.id === V.draft.pid), t = (V.draft.t || "").trim();
    if (!q) return;
    if (!t) { V.draft.err = true; render(); document.getElementById("pcx")?.focus(); return; }
    const snap = JSON.stringify({ projects: D.projects, toolReqs: D.toolReqs, people: D.people, licenses: D.licenses, notes: D.notes }), b = isBoard();
    q.prevStatus = q.status;
    q.status = "cancelled";
    q.cancel = { by: b ? "b" : "m", t, ts: Date.now(), who: meName() };
    pushThread(q, { who: b ? "b" : "m", k: "cancel", t, ts: Date.now() });
    D.notes.unshift(b ? { ic: "times-circle", k: "team", to: q.owner, t: `Dirección ha cancelado «${q.name}»`, s: t, p: q.id, ts: Date.now(), r: 0 } : { ic: "times-circle", k: "rev", to: "board", t: `${q.owner} ha cancelado «${q.name}»`, s: t, p: q.id, ts: Date.now(), r: 0 });
    V.modal = null;
    V.draft = null;
    V.undo = { decision: true, snap, cancelp: true };
    V.toastAct = "Deshacer";
    V.toast = "Proyecto cancelado";
    save();
    render();
  } else if ("ratesall" in ds) {
    V.ratesAll = !V.ratesAll;
    render();
  } else if (ds.phist) {
    V.menu = null;
    V.modal = "hist";
    V.draft = { pid: ds.phist };
    render();
  } else if (ds.rvfold) {
    const f = new Set(V.rvfold || []), id = ds.rvfold, sel = `.rvone[data-rvid="${id}"]`, o = document.querySelector(sel), h0 = o ? o.offsetHeight : 0;
    f.has(id) ? f.delete(id) : f.add(id);
    V.rvfold = [...f];
    render();
    const n = document.querySelector(sel);
    if (n && h0 && n.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const h1 = n.offsetHeight;
      n.style.overflow = "hidden";
      n.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 220, easing: "cubic-bezier(.2,0,0,1)" }).onfinish = () => (n.style.overflow = "");
    }
  } else if (ds.thr) {
    V.thr = V.thr === ds.thr ? "" : ds.thr;
    render();
  } else if (ds.setlang) {
    V.modal = null;
    setLang(ds.setlang);
    V.toast = ds.setlang === "en" ? "Language: English" : "Idioma: Español";
    render();
  } else if ("langopen" in ds) {
    V.menu = false;
    V.draft = { kind: "lang" };
    V.modal = "lang";
    render();
  } else if ("profile" in ds) {
    const k = ME().name, pf = (D.profiles || {})[k] || {};
    V.menu = false;
    V.draft = { kind: "profile", title: pf.title || (isBoard() ? "Dirección general" : "Responsable de proyecto"), email: pf.email || "", phone: pf.phone || "" };
    V.modal = "profile";
    render();
  } else if ("profsave" in ds && V.draft) {
    const d = V.draft, em = (d.email || "").trim();
    if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { d.err = "Escribe un correo válido."; render(); document.getElementById("pfe")?.focus(); return; }
    D.profiles = D.profiles || {};
    D.profiles[ME().name] = { title: (d.title || "").trim().slice(0, 60), email: em, phone: (d.phone || "").trim().slice(0, 30) };
    save();
    V.modal = null;
    V.toast = "Perfil guardado";
    render();
  } else if (ds.movex) {
    const x = PERSON(ds.movex);
    if (x) {
      V.draft = { kind: "move", sel: x.id, slot: "", keep: "hire", err: "" };
      V.modal = "move";
      render();
    }
  } else if ("movedo" in ds && V.draft && V.draft.kind === "move") {
    const d = V.draft;
    if (!d.slot) { d.err = "Elige a qué proyecto y puesto va."; render(); return; }
    const res = doMove(d);
    V.modal = null;
    V.toast = res;
    save();
    render();
  } else if (ds.asgx) {
    const x = PERSON(ds.asgx);
    if (x) {
      V.draft = { kind: "asg", team: areaOf(x), lead: x.team, sel: x.id, slot: "", err: "" };
      V.modal = "asg";
      render();
    }
  } else if (ds.asgopen) {
    V.menu = false;
    V.draft = { kind: "asg", team: ds.asgopen.split("||")[1], lead: ds.asgopen.split("||")[0], sel: "", slot: "", err: "" };
    V.modal = "asg";
    render();
  } else if ("asgdo" in ds) {
    const d = V.draft;
    if (!d.sel || !d.slot) {
      d.err = !d.sel ? "Elige a quién." : "Elige el puesto.";
      render();
      return;
    }
    const [prid, ri, i] = d.slot.split("|"),
      pj = D.projects.find((q) => q.id === prid),
      r = pj && pj.roles[Number(ri)],
      x = (D.people || []).find((q) => q.id === d.sel);
    if (pj && r && x && pj.owner === meName() && isFree(x.id)) {
      r.fill = r.fill || [];
      r.fill[Number(i)] = { src: "mine", pid: x.id };
      save();
      V.toast = `${x.name} ya está en «${pj.name}»`;
    }
    V.modal = null;
    render();
  } else if (ds.pxx) {
    const x = PERSON(ds.pxx), qs = x ? projectsOf(x.id).filter((q) => q.owner === meName()) : [];
    V.menu = false;
    V.draft = { kind: "px", team: areaOf(x), lead: x.team, sel: qs.length === 1 ? x.id + "|" + qs[0].id : "", err: "", only: x.id };
    V.modal = "px";
    render();
  } else if (ds.pxopen) {
    V.menu = false;
    V.draft = { kind: "px", team: ds.pxopen.split("||")[1], lead: ds.pxopen.split("||")[0], sel: "", err: "" };
    V.modal = "px";
    render();
  } else if ("pxmenu" in ds) {
    V.menu = V.menu === "px:" + ds.pxmenu ? false : "px:" + ds.pxmenu;
    V.pxsure = null;
    render();
  } else if (ds.pxask) {
    V.pxsure = ds.pxask;
    render();
  } else if (ds.pxout || "pxdo" in ds) {
    if ("pxdo" in ds && !V.draft.sel) {
      V.draft.err = "Elige a quién.";
      render();
      return;
    }
    const [pid, prid] = (ds.pxout || V.draft.sel).split("|"),
      pj = D.projects.find((q) => q.id === prid),
      px = (D.people || []).find((q) => q.id === pid);
    if (pj && px && pj.owner === meName()) {
      const r = pj.roles.find((q) => (q.fill || []).some((f) => f.pid === pid));
      if (r) {
        const i = r.fill.findIndex((f) => f.pid === pid);
        if (seatsOf(r) > 1) {
          r.n = seatsOf(r) - 1;
          r.fill.splice(i, 1);
        } else pj.roles.splice(pj.roles.indexOf(r), 1);
      }
      D.notes.unshift({ ic: "times", k: "rev", to: "board", t: `${pj.owner} ha sacado a ${px.name} de «${pj.name}»`, s: "Queda libre · solo aviso", p: pj.id, ts: Date.now(), r: 0 });
      save();
      V.toast = `${px.name} ya está libre`;
    }
    V.menu = false;
    V.pxsure = null;
    if ("pxdo" in ds) V.modal = null;
    render();
  } else if ("hire" in ds) {
    V.menu = false;
    if (ds.hteam && !isBoard()) {
      /* free people in the team come first: no modal while someone of that kind is waiting */
      const [hl, ht] = ds.hteam.split("||"),
        wait = (D.people || []).filter((x) => x.team === hl && areaOf(x) === ht && isOpen(x.id));
      if (wait.length) {
        V.toast = `Ya tienes ${wait.length === 1 ? wait[0].name + " libre" : wait.map((x) => x.name.split(" ")[0]).join(", ") + " libres"} en ${ht}. Asígna${wait.length === 1 ? "la" : "las"} a un proyecto antes de añadir a alguien.`;
        render();
        return;
      }
    }
    V.draft = { kind: ds.hire === "tool" ? "tool" : "person", where: "", pid: "", fid: "", when: "now", why: "", opt: null, who: "", err: "", team: ds.hteam ? ds.hteam.split("||")[1] : "", lead: ds.hteam ? ds.hteam.split("||")[0] : "" };
    V.modal = "ask";
    render();
  } else if ("tcmenu" in ds) {
    V.menu = V.menu === "tc:" + ds.tcmenu ? false : "tc:" + ds.tcmenu;
    render();
  } else if ("trmenu" in ds) {
    V.menu = V.menu === "tr:" + ds.trmenu ? false : "tr:" + ds.trmenu;
    render();
  } else if (ds.tredit) {
    V.menu = false;
    const tr = (D.toolReqs || []).find((x) => x.id === ds.tredit),
      old = !tr && D.projects.find((x) => x.id === ds.tredit),
      ro = old && old.roles[0],
      src = old && D.projects.find((x) => x.id === old.parent);
    if (tr && tr.by === meName() && tr.status === "pending") {
      const names = (tr.who || "").split(", ").filter(Boolean);
      V.draft = { kind: "tool", where: tr.forId || "team", pid: "", fid: "", when: "now", why: tr.why || "", opt: tr.opt, who: "", err: "", whoIds: (D.people || []).filter((x) => names.includes(x.name)).map((x) => x.id), editReq: tr.id };
      V.draft.sig = askSig(V.draft);
      V.modal = "ask";
      render();
    } else if (old && src && ro && old.owner === meName() && old.status === "pending") {
      /* a request to add someone is edited where it was made: on its page, with the person form */
      V.modal = null;
      go("project", old.id);
      openPerson(old, 0);
    }
  } else if (ds.afold) {
    const a = new Set(V.aopen || []);
    a.has(ds.afold) ? a.delete(ds.afold) : a.add(ds.afold);
    V.aopen = [...a];
    render();
  } else if (ds.renew) {
    const old = D.projects.find((x) => x.id === ds.renew),
      src = old && D.projects.find((x) => x.id === old.parent),
      ro = old && old.roles[0];
    const op = old && src && propOf(src);
    if (old && src && ro && old.owner === meName() && (!op || op.status !== "pending")) {
      /* same flow as any change to a running project: the person goes into the project's proposal,
         prefilled with what was asked, and the form opens so it can be adjusted right away */
      let c = op;
      if (!c) { c = proposeOn(src); D.projects.unshift(c); }
      const at = c.roles.length;
      JSON.parse(JSON.stringify(old.roles)).forEach((r, k) => {
        r.uid = "u" + Date.now().toString(36) + k;
        r.fill = (r.fill || []).map((f) => (f.src === "mine" && f.pid && !isFree(f.pid, c.id) ? { src: "new" } : { src: f.src, ...(f.pid ? { pid: f.pid } : {}) }));
        c.roles.push(r);
      });
      if (old.review && old.review.comment) c.prevRv = { comment: old.review.comment, ts: old.review.ts || Date.now() };
      old.hidReq = [...new Set([...(old.hidReq || []), noteViewer()])];
      save();
      V.modal = null;
      go("project", c.id);
      openPerson(c, at);
    } else if (old && src && ro && old.owner === meName()) {
      /* a rejected request is closed: the new one starts from the same data, on its own page */
      const c = amendOf(src);
      c.roles = JSON.parse(JSON.stringify(old.roles));
      c.roles.forEach((r) => (r.fill = (r.fill || []).map((f) => (f.src === "mine" && f.pid && !isFree(f.pid, c.id) ? { src: "new" } : { src: f.src, ...(f.pid ? { pid: f.pid } : {}) }))));
      c.justif = old.justif || "";
      D.projects.unshift(c);
      save();
      V.modal = null;
      go("project", c.id);
    }
  } else if (ds.extend) {
    const src = D.projects.find((x) => x.id === ds.extend);
    if (src && src.owner === meName()) {
      V.modal = null;
      let c = propOf(src);
      if (!c) {
        c = proposeOn(src);
        D.projects.unshift(c);
        save();
      }
      go("project", c.id);
    }
  } else if (ds.pdiscard) {
    const c = D.projects.find((x) => x.id === ds.pdiscard);
    if (c && c.full && canEdit(c)) {
      D.projects = D.projects.filter((x) => x !== c);
      save();
      V.toast = "Cambios descartados";
      go("project", c.parent);
    }
  } else if (ds.unrm) {
    const c = P(),
      b = baseOf(c),
      o = b && b.roles.find((r) => r.uid === ds.unrm);
    if (o && canEdit(c)) {
      c.roles.push(clone(o));
      save();
      render();
    }
  } else if ("delno" in ds) {
    V.delAsk = null;
    render();
  } else if (ds.rx !== undefined) {
    V.rx = V.rx || {};
    const k = pr.id + ":" + ds.rx;
    V.rx[k] = !rOpen(pr, Number(ds.rx), canEdit(pr));
    V.ms = null;
    render();
  } else if (ds.ms) {
    V.ms = V.ms === ds.ms ? null : ds.ms;
    render();
  } else if (ds.msel) {
    const [k, ck, id] = ds.msel.split("|");
    if (pr && canEdit(pr)) {
      if (k === "s" && ck === "genai") {
        const cur = genaiAll(pr),
          nx = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
        pr.shared.genai = nx[0] || null;
        pr.shared.genaiX = nx.slice(1);
      } else if (k === "s") pr.shared[ck] = pr.shared[ck] === id ? null : id;
      else {
        const r = pr.roles[Number(k)];
        r.tools[ck] = r.tools[ck] === id ? null : id;
        if (r.qty) delete r.qty[ck];
      }
      if (pr.qty) delete pr.qty[ck];
      save();
      render();
    }
  } else if ("toolchg" in ds) {
    V.tchg = V.tchg === ds.toolchg ? null : ds.toolchg;
    render();
  } else if (ds.toolswap) {
    const [from, to] = ds.toolswap.split("|");
    if (pr && canEdit(pr)) {
      V.undo = { roles: JSON.stringify(pr.roles), shared: JSON.stringify(pr.shared || {}), pqty: JSON.stringify(pr.qty || {}), pid: pr.id };
      V.toastAct = "Deshacer";
      pr.roles.forEach((r) => {
        for (const ck in r.tools)
          if (r.tools[ck] === from) {
            if (TC[ck]) r.tools[ck] = to;
            else {
              delete r.tools[ck];
              r.tools[to] = to;
            }
            if (r.qty) delete r.qty[ck];
          }
      });
      for (const ck in pr.shared || {})
        if (pr.shared[ck] === from) {
          pr.shared[ck] = to;
          if (pr.qty) delete pr.qty[ck];
        }
      V.tchg = null;
      V.toast = "Herramienta cambiada";
      save();
      render();
    }
  } else if (ds.tnew) {
    V.tnew = V.tnew === ds.tnew ? null : ds.tnew;
    render();
  } else if (ds.toolrm) {
    if (pr && canEdit(pr)) {
      const id = ds.toolrm;
      V.undo = { roles: JSON.stringify(pr.roles), shared: JSON.stringify(pr.shared || {}), pqty: JSON.stringify(pr.qty || {}), pid: pr.id };
      V.toastAct = "Deshacer";
      pr.roles.forEach((r) => {
        for (const ck in r.tools)
          if (r.tools[ck] === id) {
            if (TC[ck]) r.tools[ck] = null;
            else delete r.tools[ck];
            if (r.qty) delete r.qty[ck];
          }
      });
      for (const ck in pr.shared || {})
        if (pr.shared[ck] === id) {
          pr.shared[ck] = null;
          if (pr.qty) delete pr.qty[ck];
        }
      V.toast = "Herramienta quitada";
      save();
      render();
    }
  } else if (ds.seatrm) {
    const [ri, si] = ds.seatrm.split("|").map(Number),
      r = pr && pr.roles[ri];
    if (r && canEdit(pr)) {
      V.undo = { roles: JSON.stringify(pr.roles), pid: pr.id };
      V.toastAct = "Deshacer";
      if (seatsOf(r) > 1) {
        r.fill = arr(r.fill);
        r.fill.splice(si, 1);
        if (r.n > 0) r.n -= 1;
        if (si < r.ai) r.ai -= 1;
        r.ai = Math.min(r.ai, Math.max(1, r.n));
        r.qty = {};
        syncFill(pr);
      } else pr.roles.splice(ri, 1);
      {
        const fl = ((r.fill || [])[si] || (r.fill || [])[0] || {}), w = fl.pid && PERSON(fl.pid);
        V.toast = pr.full ? (w ? `${w.name} sale del equipo si Dirección lo aprueba` : "Puesto quitado de la propuesta") : w ? `${w.name} quitada del proyecto` : "Puesto quitado";
      }
      if (V.modal === "pform") V.modal = null;
      V.ropen = null;
      V.delAsk = null;
      save();
      render();
    }
  } else if (ds.del) {
    const dr = pr.roles[Number(ds.del)];
    if (dr && (dr.fill || []).some((f) => f.pid) && !("sure" in ds)) {
      V.delAsk = Number(ds.del);
      render();
      return;
    }
    V.delAsk = null;
    pr.roles.splice(Number(ds.del), 1);
    V.ropen = null;
    save();
    render();
  } else if ("addrole" in ds) {
    openPerson(pr, -1);
  } else if (ds.asgq) {
    const [ri, si, pid] = ds.asgq.split("|"),
      r = pr && pr.roles[Number(ri)];
    if (r && r.fill && r.fill[Number(si)]) {
      V.undo = { roles: JSON.stringify(pr.roles), pid: pr.id };
      V.toastAct = "Deshacer";
      r.fill[Number(si)] = { src: "other", pid };
      V.toast = `Asignado a ${PERSON(pid).name}`;
      save();
      render();
    }
  } else if (ds.pmore !== undefined) {
    V.px = V.px || {};
    const k = pr.id + ":" + ds.pmore;
    V.px[k] = !V.px[k];
    const y0 = document.getElementById("role-" + ds.pmore)?.getBoundingClientRect().top;
    render();
    const row = document.getElementById("role-" + ds.pmore);
    if (row && y0 != null) window.scrollBy(0, row.getBoundingClientRect().top - y0);
    row?.querySelector("[data-pmore]")?.focus({ preventScroll: true });
  } else if (ds.pedit !== undefined) {
    openPerson(pr, Number(ds.pedit));
  } else if (ds.pft) {
    const d = V.draft;
    const c = catOfOpt(ds.pft);
    d.tools = d.tools.includes(ds.pft) ? d.tools.filter((x) => x !== ds.pft) : [...d.tools.filter((x) => multiCat(c) || catOfOpt(x) !== c), ds.pft];
    render();
  } else if ("pfp" in ds) {
    V.draft.pOpen = !V.draft.pOpen;
    render();
  } else if ("pfmore" in ds) {
    V.draft.more = !V.draft.more;
    render();
  } else if ("pfsave" in ds) {
    const d = V.draft;
    if (d.ded === "custom") {
      const h = Math.round(Number((document.getElementById("pf-hrs") || {}).value || d.hrs) * 4);
      if (!(h > 0 && h < HPM)) {
        d.err = "";
        d.hrsErr = true;
        render();
        return;
      }
      d.ded = String(h);
    }
    if (!d.fid) {
      d.err = "Elige un puesto";
      render();
      return;
    }
    if (d.who === "reg") {
      const nm = (d.regn || "").trim();
      if (!nm) { d.regErr = true; render(); document.getElementById("pf-regn")?.focus(); return; }
      const x = { id: "u" + Date.now(), name: nm.slice(0, 80), fid: d.fid, lvl: F(d.fid).gr.includes(d.lvl) ? d.lvl : "mid", team: pr.owner, ent: pr.ent || (MGR(pr.owner) || {}).ent || D.entities[0].id };
      D.people.push(x);
      d.who = x.id;
    }
    if (pr && canEdit(pr)) {
      V.undo = { roles: JSON.stringify(pr.roles), pid: pr.id };
      V.toastAct = "Deshacer";
      const hrs = d.ded === "full" ? 0 : Number(d.ded),
        old = d.ri >= 0 ? pr.roles[d.ri] : null,
        r = old && old.id === d.fid ? old : mkRole(d.fid, 1);
      r.n = hrs ? 0 : 1;
      r.hours = hrs;
      r.tools = Object.fromEntries(d.tools.map((x) => [x, x]));
      r.qty = {};
      r.fill = [d.who === "new" ? { src: "new" } : { src: "mine", pid: d.who }];
      r.ai = hasAiTool(r) ? 1 : 0;
      r.ct = d.ct || "emp";
      if (hrs && !d.ctSet && r.ct === "emp") r.ct = "free";
      if (d.lvl && F(r.id).gr.includes(d.lvl)) r.grade = d.lvl;
      const hv = Number(String(d.hrate || "").replace(/\D/g, ""));
      if (r.ct === "free" && hv) r.hrate = hv;
      else delete r.hrate;
      const rv = r.ct === "free" ? 0 : Number(String(d.rate || "").replace(/\D/g, ""));
      if (rv) r.rate = rv;
      else delete r.rate;
      if (d.country) r.country = d.country;
      else delete r.country;
      if (old) pr.roles[d.ri] = r;
      else pr.roles.push(r);
      syncFill(pr);
      V.modal = null;
      V.toast = old ? "Persona actualizada" : "Persona añadida";
      save();
      render();
    }
  } else if ("addroleOld" in ds) {
    V.modal = "role";
    V.rq = "";
    V.rpos = "";
    V.rexp = null;
    render();
    setTimeout(() => document.getElementById("rq")?.focus(), 30);
  } else if (ds.addr) {
    {
      V.ropen = pr.id + ":" + pr.roles.length;
      const nr = mkRole(ds.addr, 1);
      nr.ct = pr.months && pr.months <= 3 ? "free" : "emp";
      pr.roles.push(nr);
      applyAiPref({ ...pr, roles: [nr], shared: {} });
      syncFill(pr);
    }
    V.modal = null;
    save();
    render();
    {
      const el = document.getElementById("role-" + (pr.roles.length - 1));
      if (el) scrollTo({ top: scrollY + el.getBoundingClientRect().top - 90, behavior: SMOOTH() });
    }
  } else if (ds.tchiprm && pr && canEdit(pr)) {
    /* quick removal from the team list; the toast can undo it */
    const [ix, y] = ds.tchiprm.split("|"), r = pr.roles[+ix];
    if (r && r.tools) {
      V.undo = { tchip: pr.id, ix: +ix, tools: { ...r.tools }, ai: r.ai };
      Object.keys(r.tools).forEach((k) => r.tools[k] === y && delete r.tools[k]);
      r.ai = hasAiTool(r) ? 1 : 0;
      save();
      V.toast = `${short0(opt(y) ? opt(y).n : y)} quitado`;
      V.toastAct = "Deshacer";
      render();
    }
  } else if ("pfnew" in ds && V.draft) {
    V.draft.nOpen = true;
    V.draft.nErr = false;
    render();
    document.getElementById("pf-nn")?.focus();
  } else if ("pfnewx" in ds && V.draft) {
    Object.assign(V.draft, { nOpen: false, nn: "", np: "", nai: false, nErr: false });
    render();
  } else if (ds.pfnai !== undefined && V.draft) {
    V.draft.nai = ds.pfnai === "1";
    render();
  } else if (ds.npai && isBoard()) {
    const o = opt(ds.npai), to = isAiTool(ds.npai) ? "other" : "genai";
    if (o && o.req) {
      TC[o.cat].opts = TC[o.cat].opts.filter((x) => x !== o);
      o.cat = to;
      TC[to].opts.push(o);
      const c = (D.custom || []).find((x) => x.id === o.id);
      if (c) c.cat = to;
      save();
      render();
    }
  } else if ("pfnewok" in ds && V.draft) {
    const d = V.draft, n = (d.nn || "").trim();
    if (!n) { d.nErr = true; render(); document.getElementById("pf-nn")?.focus(); return; }
    const o = { id: "c" + Date.now(), cat: d.nai ? "genai" : "other", n, p: Number(String(d.np || "").replace(",", ".")) || 0, cur: "EUR", req: true, note: "nuevo · lo pide " + meName() + " · lo aprueba Dirección con el equipo" };
    D.custom.push(o);
    TC[o.cat].opts.push(o);
    ALLOPTS.push(o);
    d.tools = [...d.tools, o.id];
    Object.assign(d, { nOpen: false, nn: "", np: "", nai: false, nErr: false });
    save();
    render();
  } else if ("resuggest" in ds) {
    V.undo = { resug: pr.id, roles: JSON.parse(JSON.stringify(pr.roles)) };
    V.toastAct = "Deshacer";
    suggest(pr);
    applyAiPref(pr);
    syncFill(pr, true);
    save();
    V.toast = "Equipo propuesto de nuevo";
    render();
  } else if ("send" in ds && pr && canEdit(pr)) {
    if (!(pr.justif || "").trim()) {
      V.jerr = true;
      render();
      document.getElementById("pj")?.focus();
      return;
    }
    V.jerr = false;
    if (pr.status === "changes") {
      /* answering a request for changes: a short window with what Dirección asked and room to say what changed */
      V.draft = { resend: pr.id, reply: "" };
      V.modal = "resend";
      render();
      return;
    }
    pushThread(pr, { who: "m", k: "sent", t: pr.justif, ts: Date.now() });
    pr.status = "pending";
    pr.sentAt = Date.now();
    D.notes.unshift({ ic: "file-alt", k: "rev", to: "board", t: `${pr.owner} ha enviado «${pr.name}»`, s: "Pendiente de tu aprobación", p: pr.id, ts: Date.now(), r: 0 });
    save();
    V.toast = "Enviada a Dirección";
    render();
  } else if ("resendok" in ds && V.draft && V.draft.resend) {
    const rp = D.projects.find((x) => x.id === V.draft.resend),
      reply = (V.draft.reply || "").trim();
    if (rp && canEdit(rp)) {
      pushThread(rp, { who: "m", k: "resent", t: reply, ts: Date.now() });
      rp.status = "pending";
      rp.sentAt = Date.now();
      rp.reply = reply;
      /* the earlier «ha enviado» notice is out of date now */
      D.notes.forEach((n) => {
        if (n.p === rp.id && n.k === "rev" && n.to === "board") n.hid = [...(n.hid || []), "board"];
      });
      D.notes.unshift({ ic: "file-alt", k: "rev", to: "board", t: `${rp.owner} ha reenviado «${rp.name}» con cambios`, s: reply || "Pendiente de tu aprobación", p: rp.id, ts: Date.now(), r: 0 });
      V.toast = "Reenviada a Dirección";
    }
    V.modal = null;
    V.draft = null;
    save();
    render();
  } else if ("gochg" in ds) {
    const t = document.querySelector(".cmain .rcard");
    if (t) {
      t.scrollIntoView({ behavior: SMOOTH(), block: "start" });
      t.classList.add("flash");
      setTimeout(() => t.classList.remove("flash"), 1600);
    }
  } else if ("withdraw" in ds && pr && pr.status === "pending" && pr.owner === meName() && !isBoard()) {
    pr.status = "draft";
    delete pr.sentAt;
    save();
    V.toast = "Propuesta retirada: vuelve a ser un borrador";
    render();
  } else if ("rcancel" in ds) {
    V.rmode = "";
    V.rerr = "";
    render();
  } else if (("approve" in ds || "askchg" in ds || "reject" in ds) && pr && isBoard() && pr.status === "pending") {
    const dec = "approve" in ds ? "approve" : "askchg" in ds ? "changes" : "reject",
      cm = (V.rcomment || "").trim();
    if (dec !== "approve" && V.rmode !== dec) {
      V.rmode = dec;
      V.rerr = "";
      render();
      { const rc = document.getElementById("rc"); if (rc) { rc.scrollIntoView({ block: "center", behavior: "smooth" }); rc.focus({ preventScroll: true }); } }
      return;
    }
    if (dec !== "approve" && !cm) {
      V.rerr = dec === "changes" ? "Escribe qué cambios pides." : "Escribe por qué la rechazas.";
      render();
      { const rc = document.getElementById("rc"); if (rc) { rc.scrollIntoView({ block: "center", behavior: "smooth" }); rc.focus({ preventScroll: true }); } }
      return;
    }
    V.rerr = "";
    V.rmode = "";
    V.rcomment = "";
    pushThread(pr, { who: "b", k: dec, t: cm, ts: Date.now() });
    pr.review = { by: "Dirección", ts: Date.now(), decision: dec, comment: cm };
    delete pr.reply;
    if (dec === "approve") approveProject(pr);
    else pr.status = dec === "changes" ? "changes" : "rejected";
    D.notes.unshift({
      ic: dec === "approve" ? "check-circle" : dec === "changes" ? "pen" : "times-circle",
      k: "team",
      to: pr.owner,
      t: dec === "approve" ? (pr.full ? `Dirección ha aprobado los cambios en «${pr.name}»` : `Dirección ha aprobado «${pr.name}»`) : dec === "changes" ? `Dirección pide cambios en «${pr.name}»` : `Dirección ha rechazado «${pr.name}»`,
      s: cm,
      p: pr.full && dec === "approve" ? pr.parent : pr.id,
      ts: Date.now(),
      r: 0,
    });
    /* Dirección keeps a trace of the changes it asked for (already read: it is its own action) */
    if (dec === "changes") D.notes.unshift({ ic: "pen", k: "team", to: "board", t: `Has pedido cambios en «${pr.name}»`, s: `Esperando a ${pr.owner}: ${cm}`, p: pr.id, ts: Date.now(), r: 1 });
    save();
    V.toast = dec === "approve" ? (pr.full ? "Cambios aprobados: ya están en el proyecto" : "Propuesta aprobada: ya está en curso") : dec === "changes" ? "Has pedido cambios" : "Propuesta rechazada";
    render();
  } else if (ds.hired) {
    const [ri, i] = ds.hired.split("|").map(Number),
      r = pr && pr.roles[ri];
    if (r && (r.fill || [])[i] && r.fill[i].hiring) {
      V.draft = { pid: pr.id, ri, i, name: "", err: "" };
      V.modal = "hired";
      render();
    }
  } else if ("hiredok" in ds) {
    const d = V.draft,
      q = D.projects.find((x) => x.id === d.pid),
      r = q && q.roles[d.ri],
      f = r && (r.fill || [])[d.i];
    if (!f) return;
    if (!d.name.trim()) {
      d.err = "Escribe el nombre de la persona.";
      render();
      return;
    }
    const g = gradeOf(r),
      x = { id: "u" + Date.now(), name: d.name.trim().slice(0, 80), fid: r.id, lvl: LVLS.includes(g) ? g : LV[g] > 2 ? "senior" : "mid", team: q.owner, ent: q.ent };
    if (d.cost > 0) x.cost = d.cost;
    D.people.push(x);
    r.fill[d.i] = { src: "mine", pid: x.id };
    save();
    V.modal = null;
    V.toast = `${x.name} se incorpora al equipo`;
    render();
  } else if ("addteam" in ds) {
    V.menu = false;
    V.draft = { name: "", lead: isBoard() ? D.managers[0].name : meName(), err: "" };
    V.modal = "team";
    render();
  } else if (ds.renteam) {
    V.menu = false;
    const [lead, t] = ds.renteam.split("||");
    V.draft = { name: t, lead, edit: t, err: "" };
    V.modal = "team";
    render();
  } else if (ds.delteam) {
    V.menu = false;
    const [lead, t] = ds.delteam.split("||"),
      m = MGR(lead);
    if (m && teamsOf(lead).length > 1 && !(D.people || []).some((x) => x.team === lead && unitOf(x) === t)) {
      m.teams = teamsOf(lead).filter((x) => x !== t);
      m.team = m.teams[0];
      save();
      V.toast = `Equipo «${t}» eliminado`;
    }
    render();
  } else if ("saveteam" in ds) {
    const d = V.draft,
      n = (d.name || "").trim().slice(0, 60),
      m = MGR(d.lead);
    if (!n) d.err = "Escribe el nombre del equipo.";
    else if (m && teamsOf(m.name).some((t) => t !== d.edit && t.toLowerCase() === n.toLowerCase())) d.err = "Ya tienes un equipo con ese nombre.";
    else d.err = "";
    d.perr = !d.edit && !(d.sel || []).length ? "Elige al menos una persona para el equipo." : "";
    if (d.err || d.perr || !m) {
      render();
      document.getElementById("tmn")?.focus();
      return;
    }
    if (d.edit) {
      (D.people || []).forEach((x) => {
        if (x.team === m.name && unitOf(x) === d.edit) x.unit = n;
      });
      m.teams = teamsOf(m.name).map((t) => (t === d.edit ? n : t));
      if (m.custom) m.custom = m.custom.map((t) => (t === d.edit ? n : t));
      m.team = m.teams[0];
    } else {
      m.teams = [...teamsOf(m.name), n];
      m.custom = [...(m.custom || []), n];
      (d.sel || []).forEach((id) => { const x = PERSON(id); if (x) x.unit = n; });
      if (isBoard() && m.name !== meName()) D.notes.unshift({ ic: "users-alt", k: "team", to: m.name, t: `Dirección ha creado el equipo ${n} para ti`, s: `Con ${(d.sel || []).length} persona${(d.sel || []).length !== 1 ? "s" : ""} de tu equipo`, p: "", ts: Date.now(), r: 0 });
    }
    save();
    V.modal = null;
    V.toast = d.edit ? `Equipo renombrado a «${n}»` : `Equipo «${n}» creado con ${(d.sel || []).length} persona${(d.sel || []).length !== 1 ? "s" : ""}`;
    render();
  } else if ("addperson" in ds) {
    V.menu = false;
    const [pt, pu] = (ds.addperson || "").split("||");
    V.draft = { name: "", fid: "product-designer", lvl: "mid", team: pt || (isBoard() ? D.managers[0].name : meName()), ...(pu ? { unit: pu } : {}), cost: 0, err: "" };
    V.modal = "person";
    render();
  } else if ("savep" in ds) {
    const d = V.draft;
    if (!d.name.trim()) {
      d.err = "Escribe el nombre de la persona.";
      render();
      return;
    }
    const tm = isBoard() ? d.team : meName(),
      x = { id: "u" + Date.now(), name: d.name.trim().slice(0, 80), fid: d.fid, lvl: d.lvl, team: tm, ...(teamsOf(tm).length > 1 ? { unit: teamsOf(tm).includes(d.unit) ? d.unit : teamsOf(tm)[0] } : {}), ent: (MGR(tm) || {}).ent || D.entities[0].id };
    if (d.cost > 0) x.cost = d.cost;
    D.people.push(x);
    const sl = d.asg ? regSlots(tm, d.fid).find((z) => z.key === d.asg) : null;
    if (sl) sl.p.roles[sl.ri].fill[sl.si] = { src: "mine", pid: x.id };
    save();
    V.modal = null;
    V.toast = sl ? `${x.name} añadida y asignada a «${sl.p.name}»` : `${x.name} añadida al equipo`;
    render();
  } else if (ds.shopen) {
    V.shOpen = V.shOpen === ds.shopen ? null : ds.shopen;
    render();
  } else if (ds.demo != null && t.closest("[data-demo]")) {
    V.demo = !V.demo;
    render();
  } else if (t.closest("[data-demoreset]")) {
    seedData();
    V.rvfold = [];
    V.nav = false;
    document.body.classList.remove("navopen");
    D.tourHidden = true;
    D.as = "manager";
    save();
    V.demo = false;
    V.view = "home";
    V.toast = "Demo reiniciada";
    render();
  } else if (ds.as) {
    D.as = ds.as === "board" ? "board" : "manager";
    if (ds.as.startsWith("m:")) {
      const m = (D.managers || []).find((x) => x.name === ds.as.slice(2));
      if (m && m.name !== D.me.name) D.me = { name: m.name, role: "Responsable", team: m.team };
    }
    V.pf = "all";
    save();
    V.menu = false;
    V.rerr = "";
    V.jerr = false;
    if (V.view === "project" && P() && !canSee(P())) V.view = "projects";
    V.demo = false;
    V.toast = `Ahora ves la demo como ${D.as === "board" ? "Dirección" : meName()}`;
    render();
  } else if (ds.lhold && V.draft) {
    const st = new Set(V.draft.hold || []);
    st.has(ds.lhold) ? st.delete(ds.lhold) : st.add(ds.lhold);
    V.draft.hold = [...st];
    render();
  } else if ("addlic" in ds) {
    if (!isBoard()) return;
    V.draft = { opt: null, scope: D.ent === "all" ? "group" : D.ent, seats: 5, other: 0 };
    V.modal = "lic";
    render();
  } else if ("licconn" in ds) {
    /* add the licence and go straight to the vendor's sign-in: once connected it is read from there */
    const d = V.draft;
    if (!multi()) d.scope = D.entities[0].id;
    /* the contracts already in HUMAIN are read from the vendor once connected; only a new one is added */
    if (!D.licenses.some((l) => l.opt === d.opt && l.scope === d.scope)) {
      const nl = { opt: d.opt, scope: d.scope, seats: d.seats, other: 0, holders: [] };
      nl.renew = defaultRenew(nl);
      D.licenses.push(nl);
    }
    save();
    V.lopen = d.opt;
    V.modal = "intg";
    V.draft = INTGOF(d.opt);
    V.intgWait = false;
    render();
  } else if ("savelic" in ds) {
    const d = V.draft;
    if (!d.opt) { d.err = "Elige una herramienta."; render(); return; }
    if (d.opt === "new") {
      /* a program the catalogue does not have: it joins the catalogue so projects can use it too */
      const nm = (d.nn || "").trim();
      if (!nm) { d.err = "Escribe el nombre del programa."; render(); document.getElementById("licn")?.focus(); return; }
      const o = { id: "c" + Date.now(), cat: d.nai ? "genai" : "other", n: nm.slice(0, 60), p: Number(String(d.np || "").replace(",", ".")) || 0, cur: "EUR", note: "añadido por Dirección" };
      D.custom.push(o);
      TC[o.cat].opts.push(o);
      ALLOPTS.push(o);
      d.opt = o.id;
    }
    if (!multi()) d.scope = D.entities[0].id;
    if ((d.hold || []).length + (d.other || 0) > d.seats) { render(); return; }
    const nl = { opt: d.opt, scope: d.scope, seats: d.seats, other: d.other || 0, holders: SYNC(d.opt) ? [] : [...(d.hold || [])] };
    const adm = (document.getElementById("ladm")?.value || d.adm || "").trim();
    if (adm) nl.admin = /^https?:\/\//.test(adm) ? adm : "https://" + adm;
    nl.renew = defaultRenew(nl);
    if (SYNC(nl.opt)) nl.synced = Date.now();
    D.licenses.push(nl);
    save();
    V.modal = null;
    V.toast = "Licencia registrada";
    render();
  } else if (ds.inv) {
    V.draft = ds.inv;
    V.modal = "inv";
    render();
  } else if (ds.othertool) {
    const [key, cat] = ds.othertool.split("|");
    V.draft = { key, cat, unit: "seat", n: "", pe: "" };
    V.modal = "tool";
    render();
  } else if ("savetool" in ds) {
    const d = V.draft,
      pe = Number(String(d.pe).replace(",", ".")) || 0;
    if (!d.n.trim()) return;
    const o = {
      id: "c" + Date.now(),
      cat: d.cat,
      n: d.n.trim(),
      p: pe,
      cur: "EUR",
      unit: d.unit === "plan" ? "plan" : undefined,
      note: "añadida por la empresa",
    };
    D.custom.push(o);
    TC[d.cat].opts.push(o);
    ALLOPTS.push(o);
    const pr = P();
    if (d.key === "s") pr.shared[d.cat] = o.id;
    else {
      pr.roles[d.key].tools[o.id] = o.id;
      delete (pr.roles[d.key].qty || {})[d.cat];
    }
    V.open = null;
    V.modal = null;
    save();
    V.toast = "Herramienta añadida al catálogo";
    render();
  } else if (ds.deltool) {
    const id = ds.deltool,
      o = opt(id),
      cat = o.cat;
    D.custom = D.custom.filter((c) => c.id !== id);
    TC[cat].opts = TC[cat].opts.filter((c) => c.id !== id);
    const ix = ALLOPTS.findIndex((c) => c.id === id);
    if (ix >= 0) ALLOPTS.splice(ix, 1);
    D.licenses = D.licenses.filter((l) => l.opt !== id);
    D.projects.forEach((p) => {
      p.roles.forEach((r) => {
        if (r.tools[cat] === id) {
          r.tools[cat] = pick(cat);
          delete (r.qty || {})[cat];
        }
        if (r.tools[id]) delete r.tools[id];
      });
      if (p.shared[cat] === id) {
        p.shared[cat] = pick(cat);
        delete p.qty[cat];
      }
      p.own = (p.own || []).filter((x) => x !== id);
    });
    save();
    V.toast = `${o.n} eliminada del catálogo`;
    render();
  } else if ("contact" in ds) {
    V.draft = { name: "", email: "", msg: "", err: "" };
    V.modal = "contact";
    render();
  } else if ("sendcontact" in ds) {
    const d = V.draft;
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email.trim())) {
      d.err = !d.name.trim() ? "Escribe tu nombre." : "Escribe un correo electrónico válido.";
      render();
      return;
    }
    D.requests = D.requests || [];
    D.requests.push({ name: d.name.trim(), email: d.email.trim(), msg: d.msg.trim(), ts: Date.now() });
    save();
    V.modal = null;
    V.toast = "Te escribiremos pronto";
    render();
  } else if ("reset" in ds) {
    V.modal = "reset";
    render();
  } else if ("resetok" in ds) {
    unregisterCustom();
    seedData();
    location.reload();
  } else if ("addent" in ds) {
    V.modal = "ent";
    render();
  } else if ("saveent" in ds) {
    const n = document.getElementById("en").value.trim();
    if (!n) return;
    D.entities.push({ id: "e" + Date.now(), name: n, country: document.getElementById("ec").value || "—", cur: "EUR", vat: "—" });
    save();
    V.modal = null;
    V.toast = "Empresa añadida";
    render();
  } else render();
});
const fmShow = (g) => {
  if (!g) return;
  V.fm = Number(g.dataset.fm);
  document.querySelectorAll(".fm.sel").forEach((x) => x.classList.remove("sel"));
  g.classList.add("sel");
  const c = document.getElementById("fcap");
  if (c) c.textContent = g.dataset.cap;
};
["pointerover", "focusin", "click"].forEach((ev) =>
  document.addEventListener(ev, (e) => e.target.closest && fmShow(e.target.closest("[data-fm]"))),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && V.modal) {
    /* keep Tab inside the open dialog */
    const sh = document.querySelector("#modal .sheet");
    if (sh) {
      const f = [...sh.querySelectorAll("button,input,select,textarea,a[href],[tabindex]:not([tabindex='-1'])")].filter(
        (x) => !x.disabled && x.offsetParent !== null,
      );
      if (f.length) {
        const first = f[0],
          last = f[f.length - 1];
        if (!sh.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && (document.activeElement === first || document.activeElement === sh)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }
  if (e.key === "Escape" && (V.modal || V.menu || V.nav || V.ws || V.dpop)) {
    if (V.dpop && !V.modal) setTimeout(() => document.querySelector("[data-demotag]")?.focus(), 0);
    V.dpop = false;
    const pm = typeof V.menu === "string" && V.menu.startsWith("pm:") ? V.menu.slice(3) : null;
    if (pm && !V.modal) setTimeout(() => document.querySelector(`[data-pmenu="${pm}"]`)?.focus(), 0);
    const rm = typeof V.menu === "string" && V.menu.startsWith("rm:") ? V.menu.slice(3) : null;
    if (rm && !V.modal) setTimeout(() => document.querySelector(`[data-rmenu="${rm}"]`)?.focus(), 0);
    const im = typeof V.menu === "string" && V.menu.startsWith("im:") ? V.menu.slice(3) : null;
    if (im && !V.modal) setTimeout(() => document.querySelector(`[data-imenu="${im}"]`)?.focus(), 0);
    const um = typeof V.menu === "string" && V.menu.startsWith("um:") ? V.menu.slice(3) : null;
    if (um && !V.modal) setTimeout(() => document.querySelector(`[data-umenu="${um}"]`)?.focus(), 0);
    V.modal = null;
    V.menu = false;
    V.nav = false;
    V.ws = false;
    render();
  }
});
/* Tooltips: the browser's grey title box is replaced by the system tooltip (ink, 13 px, rounded, 8 px from the control).
   Any element with a title gets it on hover and on keyboard focus; the title moves to data-tt so the native one never shows. */
(() => {
  const tip = document.createElement("div");
  tip.id = "tip";
  tip.setAttribute("role", "tooltip");
  tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);
  let cur = null,
    timer = 0;
  const hide = () => {
    clearTimeout(timer);
    cur = null;
    tip.classList.remove("on");
  };
  const place = (el) => {
    const r = el.getBoundingClientRect(),
      t = tip.getBoundingClientRect(),
      gap = 8,
      vw = document.documentElement.clientWidth;
    let top = r.bottom + gap,
      below = true;
    if (top + t.height > window.innerHeight - 8) {
      top = r.top - gap - t.height;
      below = false;
    }
    const left = Math.max(8, Math.min(vw - t.width - 8, r.left + r.width / 2 - t.width / 2));
    tip.style.top = top + "px";
    tip.style.left = left + "px";
    tip.style.setProperty("--ax", Math.max(10, Math.min(t.width - 10, r.left + r.width / 2 - left)) + "px");
    tip.classList.toggle("up", !below);
  };
  const show = (el, now) => {
    if (el.title) {
      el.dataset.tt = el.title;
      el.removeAttribute("title");
    }
    const txt = el.dataset.tt;
    if (!txt) return;
    clearTimeout(timer);
    cur = el;
    timer = setTimeout(
      () => {
        if (cur !== el || !el.isConnected) return;
        tip.textContent = txt;
        tip.classList.add("on");
        place(el);
      },
      now ? 0 : 350,
    );
  };
  const find = (n) => n && n.closest && n.closest("[title],[data-tt]");
  /* disabled buttons get no pointer events (CSS passes them to the parent), so the one under the pointer is found by position:
     that is where the reason it is disabled is told */
  const under = (e) => {
    const el = find(e.target);
    if (el) return el;
    const host = e.target && e.target.closest ? e.target : null;
    if (!host) return null;
    for (const b of host.querySelectorAll("button:disabled[title],button:disabled[data-tt]")) {
      const r = b.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return b;
    }
    return null;
  };
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const el = under(e);
    if (el && el !== cur) show(el);
    else if (!el && cur) hide();
  });
  document.documentElement.addEventListener("pointerleave", hide);
  document.addEventListener("focusin", (e) => {
    const el = find(e.target);
    if (el && el.matches(":focus-visible")) show(el, true);
  });
  document.addEventListener("focusout", hide);
  document.addEventListener("pointerdown", hide);
  /* touch has no hover: a tap on something whose tip appears on hover shows that tip instead
     (info icons, tags, disabled buttons that say why); a tap on a working button just does its job */
  document.addEventListener("pointerup", (e) => {
    if (e.pointerType !== "touch") return;
    const el = under(e);
    if (!el || el.classList.contains("itip")) return;
    const act = el.matches("button:not(:disabled),a[href],input,select,textarea,[data-opentr],[data-nav]") || el.closest("button:not(:disabled),a[href]") !== null;
    if (act) return;
    setTimeout(() => el.isConnected && show(el, true), 30);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".itip");
    if (!b) return;
    /* the page may re-render on the same click: show the tip on the icon that is now under the finger */
    const x = e.clientX,
      y = e.clientY;
    setTimeout(() => {
      const n = (b.isConnected ? b : document.elementFromPoint(x, y)?.closest(".itip")) || null;
      if (n) show(n, true);
    }, 30);
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && hide());
  window.addEventListener("scroll", hide, true);
  new MutationObserver(() => cur && !cur.isConnected && hide()).observe(document.body, { childList: true, subtree: true });
})();
/* Segmented control (DS): selected 600, unselected 400, same size; each segment reserves the width of its bold label
   (data-sl feeds a hidden bold copy in CSS) so nothing shifts when the selection changes */
(() => {
  const mark = () => document.querySelectorAll(".seg button:not([data-sl])").forEach((b) => (b.dataset.sl = b.textContent.trim()));
  let q = false;
  new MutationObserver(() => {
    if (q) return;
    q = true;
    queueMicrotask(() => {
      q = false;
      mark();
    });
  }).observe(document.body, { childList: true, subtree: true });
  mark();
})();
/* the slider's ring shows only when it was reached with the keyboard (Chrome also flags a mouse drag as focus-visible) */
document.addEventListener("keydown", (e) => e.key === "Tab" && document.documentElement.classList.add("kbd"), true);
document.addEventListener("pointerdown", () => document.documentElement.classList.remove("kbd"), true);
/* phones: the on-screen keyboard covers a sheet anchored to the bottom, so while it is open the sheet follows the visible area */
(() => {
  const vv = window.visualViewport;
  if (!vv) return;
  const fit = () => {
    const kb = window.innerHeight - vv.height - vv.offsetTop > 120,
      r = document.documentElement;
    r.classList.toggle("kbo", kb);
    r.style.setProperty("--vvh", vv.height + "px");
    r.style.setProperty("--vvt", vv.offsetTop + "px");
    if (V.dd) ddClose();
    if (kb) document.activeElement?.scrollIntoView?.({ block: "center" });
  };
  vv.addEventListener("resize", fit);
  vv.addEventListener("scroll", fit);
})();
render();
/* Mobile sheets: drag the sheet down from its top (or anywhere when it is not scrolled) to close it, like a native bottom sheet */
(() => {
  const mob = () => matchMedia("(max-width:699px)").matches;
  let sh = null, y0 = 0, dy = 0, drag = false;
  document.addEventListener("touchstart", (e) => {
    const s = e.target.closest && e.target.closest("#modal .sheet");
    if (!s || !mob() || s.classList.contains("pform") || s.querySelector(".field") || e.target.closest(".ddl,textarea,input,.mspanel")) return;
    if (s.scrollTop > 0 && !e.target.closest(".shead")) return;
    sh = s; y0 = e.touches[0].clientY; dy = 0; drag = false;
    sh._top = !!e.target.closest(".shead") || s.scrollHeight <= s.clientHeight + 2;
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!sh) return;
    dy = e.touches[0].clientY - y0;
    if (!drag && dy > 8) drag = true;
    if (!drag && dy < -8 && sh._top && !sh.classList.contains("sfull")) {
      if (e.cancelable) e.preventDefault();
      sh.style.transition = "none";
      sh.style.transform = `translateY(${Math.max(-60, dy / 3)}px)`;
      return;
    }
    if (drag) {
      if (e.cancelable) e.preventDefault();
      sh.style.transition = "none";
      sh.style.transform = `translateY(${Math.max(0, dy)}px)`;
    }
  }, { passive: false });
  document.addEventListener("touchend", () => {
    if (!sh) return;
    const s = sh;
    sh = null;
    if (!drag) {
      if (dy < -50 && s._top && !s.classList.contains("sfull")) s.classList.add("sfull");
      s.style.transition = "transform .2s ease";
      s.style.transform = "";
      return;
    }
    s.style.transition = "transform .2s ease";
    if (dy > Math.min(140, s.offsetHeight * 0.25)) {
      s.style.transform = "translateY(100%)";
      setTimeout(() => s.querySelector("[data-close]")?.click(), 180);
    } else s.style.transform = "";
  });
})();
document.addEventListener("input", (e) => {
  if (e.target.id === "pf-rate" && V.draft) V.draft.rate = e.target.value;
  if (e.target.id === "pf-nn" && V.draft) V.draft.nn = e.target.value;
  if (V.draft && V.draft.kind === "profile" && ["pft", "pfe", "pfph"].includes(e.target.id)) { V.draft[{ pft: "title", pfe: "email", pfph: "phone" }[e.target.id]] = e.target.value; V.draft.err = ""; }
  if (e.target.id === "licn" && V.draft) { V.draft.nn = e.target.value; V.draft.err = ""; }
  if (e.target.id === "licp" && V.draft) V.draft.np = e.target.value;
  if (e.target.id === "pf-regn" && V.draft) { V.draft.regn = e.target.value; V.draft.regErr = false; }
  if (e.target.id === "pf-np" && V.draft) V.draft.np = e.target.value;
  if (e.target.id === "pf-hrate" && V.draft) {
    V.draft.hrate = e.target.value;
    clearTimeout(V._hrT);
    V._hrT = setTimeout(() => {
      const el = document.getElementById("pf-hrate"),
        pos = el && el.selectionStart;
      render();
      const n = document.getElementById("pf-hrate");
      if (n) {
        n.focus({ preventScroll: true });
        try { n.setSelectionRange(pos, pos); } catch (er) {}
      }
    }, 400);
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "pf-hrs" && V.draft) {
    V.draft.hrs = e.target.value;
    V.draft.hrsErr = false;
  }
});
/* the bottom bar hides once the real buttons of the summary are on screen */
(() => {
  const tick = () => {
    const b = document.querySelector(".mbar"),
      cs = document.querySelector(".cside"),
      bt = cs && [...cs.querySelectorAll(".btn")].filter((x) => x.offsetParent),
      c = (bt && bt.length && bt[0]) || cs;
    document.body.classList.toggle("hasmbar", !!b);
    if (!b || !c) return;
    /* stays until the summary's own buttons come into view, so the action is never out of reach */
    b.classList.toggle("off", c.getBoundingClientRect().top < innerHeight - b.offsetHeight);
  };
  addEventListener("scroll", tick, { passive: true });
  new MutationObserver(tick).observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
})();

/* home card: team avatars on the right of the footer */
function hpTeam(p) {
  const rs = p.roles || [];
  if (!rs.length) return "";
  const av = rs.map((r) => { const f = (r.fill || [])[0] || {}, w = f.pid && PERSON(f.pid); return w ? `<i class="hav" title="${esc(w.name)}">${esc(initials(w.name))}</i>` : `<i class="hav nw" title="${f.src === "new" ? "Por contratar" : "Por asignar"}">${I("user-plus")}</i>`; });
  const max = 4, sh = av.slice(0, av.length > max ? max - 1 : max), more = av.length - sh.length;
  return `<span class="hteamc"><small>${rs.length} persona${rs.length !== 1 ? "s" : ""}</small><span class="havs">${sh.join("")}${more ? `<i class="hav more">+${more}</i>` : ""}</span></span>`;
}

/* rejected person request: what was asked, so it can be remembered before adjusting it */
function reqAsked(pid) {
  const c = D.projects.find((x) => x.id === pid);
  if (!c || !c.roles.length) return "";
  return `<div class="rqask"><small class="rql">Lo que pediste</small>${c.roles
    .map((r) => {
      const f = F(r.id), g = f.gr.length ? gradeOf(r) : null, x = seatCosts(r, c)[0],
        fl = (r.fill || [])[0] || {}, who = fl.src === "mine" && fl.pid && PERSON(fl.pid),
        tl = Object.values(r.tools || {}).filter((y) => y && opt(y)).sort(toolSort);
      return `<div class="rqrow"><b>${esc(f.t)}${g ? " · " + GR[g][0] : ""}</b><span>${esc(cap1([who ? who.name : "Contratar a alguien nuevo", dedTxt(r), r.country || "", x.f && x.f.ct === "free" ? "Freelance" : ""].filter(Boolean).join(" · ")))}</span>${tl.length ? `<span class="pchips">${tl.map((y) => `<span class="pchip${isAiTool(y) ? " ai" : ""}">${esc(opt(y).n.replace(/\s*\(.*?\)/g, ""))}</span>`).join("")}</span>` : ""}</div>`;
    })
    .join("")}<button class="lnk rqopen" data-openp="${c.id}">Ver la petición completa ${I("angle-right")}</button></div>`;
}

const short0 = (n) => String(n).replace(/\s*\(.*?\)/g, "").split(" · ")[0];

/* chips order everywhere: licences first, then AI; alphabetical inside each group */
function toolSort(a, b) {
  const ai = (t) => (isAiTool(t) ? 1 : 0), nm = (t) => (opt(t) ? opt(t).n : String(t)).toLowerCase();
  return ai(a) - ai(b) || nm(a).localeCompare(nm(b), "es");
}

/* person form: a program that is not in the catalogue. It is added to this person and goes to Dirección with the team. */
function pfNewHTML(d) {
  if (!d.nOpen) return `<button type="button" class="pfnew" data-pfnew>${I("plus")}<span>Otro programa que no está en la lista<small>Lo pides con el equipo y Dirección lo aprueba</small></span></button>`;
  return `<div class="pfnbox"><b>Otro programa</b>
  <div class="field"><label for="pf-nn">Nombre</label><input id="pf-nn" class="big md" value="${esc(d.nn || "")}" placeholder="Por ejemplo: Miro Business"/>${d.nErr ? `<p class="ferr" role="alert">Escribe el nombre del programa.</p>` : `<p class="note fh">Basta con el nombre. Dirección pone el precio cuando lo revise.</p>`}</div>
  <div class="field"><label id="pfnail">¿Es una herramienta de IA?</label><div class="seg pz" role="radiogroup" aria-labelledby="pfnail"><button type="button" role="radio" data-pfnai="" aria-checked="${!d.nai}">No</button><button type="button" role="radio" data-pfnai="1" aria-checked="${!!d.nai}">Sí</button></div><p class="note fh">Si usa IA, la persona lleva la etiqueta «Con IA».</p></div>
  <div class="pfnact"><button type="button" class="btn btn-s sm" data-pfnewx>Cancelar</button><button type="button" class="btn btn-p sm" data-pfnewok>Añadir</button></div></div>`;
}

/* printable proposal: reference number and state, like any formal document */
const docNo = (pr) => String(D.org || "DOC").normalize("NFD").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() + "-" + new Date(pr.sentAt > 9e11 ? pr.sentAt : Date.now()).getFullYear() + "-" + String(pr.id).replace(/\D/g, "").slice(-5).padStart(5, "0");
const docSt = (pr) => ({ draft: "Borrador", pending: "Pendiente de aprobación", changes: "Cambios pedidos", approved: "Aprobada", active: "Aprobada · en curso", done: "Finalizada", rejected: "Rechazada", cancelled: "Cancelada" })[stOf(pr)] || "Borrador";

/* register a person: open seats of the same puesto in the team's drafts and running projects (to be hired, not yet covered) */
function regSlots(tm, fid) {
  const out = [];
  D.projects
    .filter((p) => p.owner === tm && !p.archived && !p.full && (p.status === "draft" || isLive(p)))
    .forEach((p) => p.roles.forEach((r, ri) => r.id === fid && (r.fill || []).forEach((f, si) => f && f.src === "new" && out.push({ key: p.id + "|" + ri + "|" + si, p, ri, si, live: isLive(p) }))));
  return out;
}
function regAsgHTML(d) {
  const tm = isBoard() ? d.team : meName(), sl = d.fid ? regSlots(tm, d.fid) : [];
  if (!sl.length) return `<div class="field"><label>Proyecto <small class="opt-l">Opcional</small></label><div class="alert info" role="note">${I("info-circle")}<span>Ningún proyecto ${isBoard() ? "de este equipo" : "tuyo"} tiene una plaza de ${esc(F(d.fid).t)} por cubrir. Quedará <b>libre</b> y podrás asignarla después.</span></div></div>`;
  const cur = sl.find((z) => z.key === d.asg);
  return `<div class="field"><label>Proyecto <small class="opt-l">Opcional</small></label>${ddHTML({ id: "pasg", value: d.asg || "", ariaLabel: "Proyecto", options: [["", "Sin proyecto por ahora"], ...sl.map((z) => [z.key, `«${z.p.name}» · plaza por contratar`])] })}<p class="note fh">${cur ? (cur.live ? "Ocupa la plaza que se iba a contratar, así que esa contratación ya no hace falta." : "Ocupa la plaza que se iba a contratar en el borrador.") : "Si no eliges proyecto, quedará libre para asignarla después."}</p></div>`;
}


/* the demo has one Responsable (Emma) who leads every team, so a single login shows every case:
   running, pending, changes asked, drafts, hiring, people shared between projects */
function soloSeed() {
  const ME = "Emma Walker", others = ["Nora Mitchell", "Lucas Reed"];
  D.managers = [{ name: ME, team: "Producto digital", teams: ["Producto digital", "Diseño", "Marketing", "Desarrollo"], ent: "es" }];
  D.users = [["James Carter", "Dirección", "SRC"], [ME, "Responsable de proyecto", "SRC"]];
  (D.people || []).forEach((x) => others.includes(x.team) && (x.team = ME));
  (D.projects || []).forEach((p) => {
    if (others.includes(p.owner)) p.owner = ME;
    (p.roles || []).forEach((r) => (r.fill || []).forEach((f) => { if (f && f.pid && f.src === "other") f.src = "mine"; }));
  });
  /* more cases for the single Responsable: changes asked, rejected, and a change proposal on a running project */
  const by = (id) => D.projects.find((p) => p.id === id),
    copy = (src, o) => {
      const c = clone(src);
      c.roles.forEach((r, k) => { r.uid = o.id + "r" + k; r.fill = (r.fill || []).map(() => ({ src: "new" })); });
      return Object.assign(c, { archived: false, parent: undefined, full: undefined, reply: "" }, o);
    },
    now = Date.now();
  if (by("p4") && !by("p8"))
    D.projects.push(copy(by("p4"), { id: "p8", name: "Intranet de empleados", goal: "Un sitio único con nóminas, vacaciones y documentos internos.", justif: "Hoy todo va por correo y RR. HH. dedica dos días al mes a reenviar documentos.", status: "changes", sentAt: now - 6 * DAY, review: { by: "Dirección", ts: now - 2 * DAY, decision: "changes", comment: "Nos gusta mucho la idea. ¿Podríais valorar empezar con cuatro personas? Y quizá la IA de imágenes no haga falta en esta fase; si veis que sí, contadnos para qué y lo revisamos." } }));
  if (by("p7") && !by("p9"))
    D.projects.push(copy(by("p7"), { id: "p9", name: "Asistente de soporte con IA", type: by("p7").type, goal: "Responder las preguntas frecuentes sin pasar por el equipo de soporte.", justif: "El 60 % de los tickets son las mismas diez preguntas.", status: "rejected", start: undefined, sentAt: now - 20 * DAY, review: { by: "Dirección", ts: now - 15 * DAY, decision: "reject", comment: "Gracias por plantearlo, tiene mucho sentido. Este trimestre no tenemos presupuesto disponible; si os parece, lo retomamos en enero." } }));
  const web = by("p5");
  if (web && !D.projects.some((p) => p.parent === "p5" && p.full)) {
    const c = proposeOn(web);
    c.id = "p10";
    const nr = clone(web.roles[web.roles.length - 1]);
    nr.uid = "p10new";
    nr.fill = [{ src: "new" }];
    c.roles.push(nr);
    c.status = "pending";
    c.sentAt = now - 1 * DAY;
    c.justif = "La web sale en enero y hace falta una persona más para llegar a tiempo.";
    D.projects.push(c);
  }
}

/* ===== Conversation of a proposal: every message of the Responsable and of Dirección, so what was asked stays on record ===== */
function threadOf(p) {
  if (Array.isArray(p.thread)) return p.thread;
  const t = [];
  if (p.justif && (p.sentAt || p.review)) t.push({ who: "m", k: "sent", t: p.justif, ts: p.sentAt || (p.review ? p.review.ts - DAY : Date.now()) });
  if (p.review && (p.review.comment || p.review.decision)) t.push({ who: "b", k: p.review.decision, t: p.review.comment || "", ts: p.review.ts });
  if (p.reply) t.push({ who: "m", k: "resent", t: p.reply, ts: p.sentAt || Date.now() });
  return t;
}
function pushThread(p, it) {
  p.thread = [...threadOf(p), it];
}
/* ===== Chips on phones: long names cut with «…» (tap shows the full name) and at most two rows, with «Ver más» ===== */
function chipsPass() {
  if (!window.matchMedia || !matchMedia("(max-width:600px)").matches) return;
  V.chipOpen = V.chipOpen || [];
  document.querySelectorAll(".pchip").forEach((c) => {
    if (c.querySelector(":scope>.pct")) return;
    const tn = [...c.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!tn) return;
    const sp = document.createElement("span");
    sp.className = "pct";
    sp.textContent = tn.textContent.trim();
    c.replaceChild(sp, tn);
    if (sp.scrollWidth > sp.clientWidth + 1 && !c.title) c.title = sp.textContent;
  });
  document.querySelectorAll(".tusage>div, .xtools, .pchips, .pcs").forEach((box, k) => {
    const cs = [...box.children].filter((e) => e.classList.contains("pchip"));
    if (cs.length < 3 || box.querySelector(".chmore")) return;
    const top0 = cs[0].offsetTop, rows = [...new Set(cs.map((e) => e.offsetTop))].sort((a, b) => a - b);
    if (rows.length <= 2) return;
    const key = (box.closest("[data-k]") || {}).dataset?.k || box.textContent.slice(0, 40) + k;
    const hidden = cs.filter((e) => e.offsetTop > rows[1]);
    const open = V.chipOpen.includes(key);
    if (!open) hidden.forEach((e) => (e.hidden = true));
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pchip chmore";
    b.textContent = open ? "Ver menos" : `+${hidden.length} más`;
    b.onclick = (ev) => {
      ev.stopPropagation();
      V.chipOpen = open ? V.chipOpen.filter((x) => x !== key) : [...V.chipOpen, key];
      render();
    };
    box.appendChild(b);
    if (!open && b.offsetTop > rows[1]) {
      const last = cs.filter((e) => !e.hidden).pop();
      if (last) last.hidden = true, (b.textContent = `+${hidden.length + 1} más`);
    }
    void top0;
  });
}

/* ===== Programs a Responsable asked for that the company does not have yet ===== */
const newProgsOf = (pr) => {
  const n = {};
  (pr.roles || []).forEach((r) => Object.values(r.tools || {}).forEach((t) => { const o = t && opt(t); if (o && o.req) n[t] = (n[t] || 0) + (r.n || 1); }));
  return Object.entries(n);
};
/* Dirección sees them before deciding and can set or correct the price: the project's cost follows */
function newProgHTML(pr) {
  const ns = newProgsOf(pr);
  if (!ns.length || !isBoard()) return "";
  return `<div class="npw" role="group" aria-label="Programas nuevos para la empresa"><b>${ns.length === 1 ? "Un programa nuevo" : ns.length + " programas nuevos"} para la empresa</b><small>No ${ns.length === 1 ? "está" : "están"} en vuestro catálogo. Si apruebas, ${ns.length === 1 ? "queda añadido" : "quedan añadidos"} en Software e IA como pendiente de comprar. El precio puedes ponerlo ahora o cuando lo compres.</small>${ns
    .map(([t, k]) => {
      const o = opt(t), ai = isAiTool(t);
      return `<div class="nprow"><span class="npn"><b>${esc(o.n)}</b><small>${k} asiento${k !== 1 ? "s" : ""}${o.p ? "" : " · sin precio, no suma al coste"}</small><button type="button" class="npai${ai ? " on" : ""}" data-npai="${esc(t)}" aria-pressed="${ai}">${ai ? `${I("check")}Con IA` : "Marcar como IA"}</button></span><label class="npp"><span class="sr">Precio por asiento de ${esc(o.n)} (opcional)</span><input class="hin" inputmode="decimal" data-nprice="${esc(t)}" value="${o.p ? String(o.p).replace(".", ",") : ""}" placeholder="—"/><em>€/mes</em></label></div>`;
    })
    .join("")}</div>`;
}
function adoptNewProgs(pr) {
  newProgsOf(pr).forEach(([t, k]) => {
    const o = opt(t);
    if (!o) return;
    o.req = false;
    o.note = "añadido al aprobar «" + pr.name + "»";
    const c = (D.custom || []).find((x) => x.id === t);
    if (c) Object.assign(c, { req: false, note: o.note, p: o.p });
    if (!D.licenses.some((l) => l.opt === t)) { const nl = { opt: t, scope: pr.ent || D.entities[0].id, seats: 0, other: 0, holders: [] }; nl.renew = defaultRenew(nl); D.licenses.push(nl); }
  });
}
document.addEventListener("change", (e) => {
  const t = e.target && e.target.dataset && e.target.dataset.nprice;
  if (!t || !isBoard()) return;
  const v = Number(String(e.target.value).replace(",", ".")) || 0, o = opt(t), c = (D.custom || []).find((x) => x.id === t);
  if (o) o.p = v;
  if (c) c.p = v;
  save();
  render();
});

/* ===== Move someone who is already on a project to another one, in one step ===== */
const movableFrom = (pid) => D.projects.filter((q) => q.owner === meName() && !q.archived && !q.full && (isLive(q) || ["draft", "changes", "approved"].includes(q.status)) && q.roles.some((r) => (r.fill || []).some((f) => f && f.pid === pid)));
function moveSlots(x, skip) {
  return D.projects
    .filter((q) => q.owner === meName() && !q.archived && !q.full && !skip.includes(q.id) && (q.status === "draft" || q.status === "changes" || isLive(q)))
    .flatMap((q) => q.roles.flatMap((r, ri) => Array.from({ length: seatsOf(r) }, (_, i) => [r, i]).filter(([r2, i]) => F(r2.id).cat === F(x.fid).cat && (isLive(q) ? r2.fill?.[i] && r2.fill[i].src === "new" : !r2.fill?.[i] || (r2.fill[i].src !== "mine" && r2.fill[i].src !== "shared"))).map(([r2, i]) => ({ v: q.id + "|" + ri + "|" + i, l: `${q.name} · ${F(r2.id).t}${isLive(q) ? " · por contratar" : ""}${x.fid === r2.id ? " (su puesto)" : ""}`, p: q, live: isLive(q) }))));
}
/* a running project changes through its proposal (the open one, or a new one); a draft changes directly */
const editable = (q) => {
  if (!isLive(q) && q.status !== "approved") return q;
  let c = propOf(q);
  if (c && c.status !== "draft" && c.status !== "changes") return null;
  if (!c) { c = proposeOn(q); D.projects.unshift(c); }
  return c;
};
function doMove(d) {
  const x = PERSON(d.sel), from = movableFrom(x.id), [prid, ri, si] = d.slot.split("|"), dest = D.projects.find((q) => q.id === prid);
  const touched = [];
  from.forEach((q) => {
    const e = editable(q);
    if (!e) return;
    e.roles = e.roles.flatMap((r) => {
      const k = (r.fill || []).findIndex((f) => f && f.pid === x.id);
      if (k < 0) return [r];
      if (d.keep === "drop") {
        if ((r.fill || []).length <= 1 && (r.n || 1) <= 1) return [];
        r.fill.splice(k, 1);
        if (r.n > 1) r.n -= 1;
        return [r];
      }
      r.fill[k] = { src: "new" };
      return [r];
    });
    if (e !== q) touched.push(q.name);
  });
  if (dest) {
    const uid = dest.roles[Number(ri)] && dest.roles[Number(ri)].uid, e = editable(dest);
    const r = e && (e.roles.find((y) => uid && y.uid === uid) || e.roles[Number(ri)]);
    if (r) { r.fill = r.fill || []; r.fill[Number(si)] = { src: "mine", pid: x.id }; if (e !== dest) touched.push(dest.name); }
  }
  return touched.length ? `Cambios preparados en ${[...new Set(touched)].map((n) => "«" + n + "»").join(" y ")}: envíalos a Dirección` : `${x.name} ya está en «${dest ? dest.name : ""}»`;
}

/* ===== Phones: the buttons at the top of a page go into a ⋯ menu, so the title keeps the space ===== */
function headerPass() {
  if (!window.matchMedia || !matchMedia("(max-width:600px)").matches) return;
  document.querySelectorAll("#app .ph").forEach((ph) => {
    if (ph.querySelector(".pmw") || ph.querySelector(".mhw")) return;
    const bs = [...ph.querySelectorAll(".phact .btn, :scope > .btn")].filter((b) => !b.closest(".amenu"));
    /* rule: one action stays a button; two or more go into the ⋯ menu */
    if (bs.length < 2) return;
    const w = document.createElement("div");
    w.className = "pmw mhw";
    w.innerHTML = `<button class="ib" type="button" aria-label="Más acciones" aria-haspopup="menu" aria-expanded="false">${I("ellipsis")}</button>`;
    const tg = w.firstChild;
    const menu = document.createElement("div");
    menu.className = "amenu pm";
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    bs.forEach((b) => {
      const it = document.createElement("button");
      it.type = "button";
      it.setAttribute("role", "menuitem");
      it.textContent = b.textContent.trim();
      it.onclick = (e) => { e.stopPropagation(); menu.hidden = true; tg.setAttribute("aria-expanded", "false"); b.click(); };
      menu.appendChild(it);
      b.classList.add("mhid");
    });
    w.appendChild(menu);
    tg.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; tg.setAttribute("aria-expanded", String(!menu.hidden)); };
    (ph.querySelector(".phact") || ph).appendChild(w);
  });
}
document.addEventListener("click", () => document.querySelectorAll(".mhw .amenu").forEach((m) => { m.hidden = true; m.previousElementSibling && m.previousElementSibling.setAttribute("aria-expanded", "false"); }));

/* earlier messages, nested under the latest one (the latest is already on screen) */

/* Iconografía de eventos: un icono por tipo de hecho, en todo HUMAIN.
   Personas: user-* (alta, asignación, desasignación, baja). Solicitudes: file-plus-alt / check-circle / times-circle. */
const EVIC = { hire: "user-plus", assign: "user-check", unassign: "user-minus", leave: "user-times", req: "file-plus-alt", ok: "check-circle", no: "times-circle" };
function noteIc(n) {
  const t = n.t || "";
  if (/dado de baja/i.test(t)) return EVIC.leave;
  if (/ha sacado a|desasign/i.test(t)) return EVIC.unassign;
  if (/rechaz|cancelad/i.test(t)) return EVIC.no;
  if (/ha aprobado|^Ya est[áa]n?\b/i.test(t)) return EVIC.ok;
  if (/pide asignar|ha asignado|ha movido/i.test(t)) return EVIC.assign;
  if (/se ha incorporado|ha añadido a|da de alta/i.test(t)) return EVIC.hire;
  if (/ha enviado|ha reenviado|\bpide\b|recuerda su petición/i.test(t)) return EVIC.req;
  return n.ic === "times" ? EVIC.no : n.ic;
}

/* Badges explain themselves: a short line on hover, focus or tap. Same text for the same badge everywhere. */
const PILLTIP = {
  Borrador: () => (isBoard() ? "Aún no se ha enviado." : "Solo lo ves tú. Envíalo a Dirección cuando esté listo."),
  Pendiente: () => (isBoard() ? "Esperando tu decisión." : "Enviado. Esperando la respuesta de Dirección."),
  "Cambios pedidos": () => (isBoard() ? "Has pedido cambios. Esperando a que lo reenvíen." : "Dirección pide cambios. Edítalo y reenvíalo."),
  Aprobado: () => "Aprobado. Empieza en la fecha prevista.",
  "En curso": () => "El proyecto está en marcha.",
  Finalizado: () => "Ya ha terminado. Queda para consultarlo.",
  Rechazado: () => "Dirección no lo ha aprobado. Puedes ajustarlo y volver a pedirlo.",
  Cancelado: () => "Se paró después de aprobarse. Lo que usaba quedó libre.",
  Archivado: () => "Oculto de la lista. Se puede restaurar.",
  "Con IA": () => "Usa al menos una herramienta de IA en este proyecto.",
  IA: () => "Herramienta de inteligencia artificial.",
  Libre: () => "No está en ningún proyecto ahora.",
  "En proyecto": () => "Trabaja en un proyecto en curso.",
  Propuesta: () => "Está en una propuesta que aún no ha empezado.",
  "En contratación": () => "Se está contratando a alguien para este puesto.",
  "Por contratar": () => "Habrá que contratar a alguien si se aprueba.",
  "Por comprar": () => "Faltan asientos. Hay que comprarlos en el panel del programa.",
  Cubierto: () => "Hay asientos para todos los que la necesitan.",
  "Sin uso": () => "Ningún proyecto la usa ahora.",
  "Al día": () => "Nada que hacer con este contrato por ahora.",
  "Renueva pronto": () => "Renueva en menos de 4 meses y tiene asientos sin usar: buen momento para quitarlos.",
  Estimado: () => "Calculado con referencias de mercado, no con datos reales.",
  Nuevo: () => "Se añade con este cambio.",
  Nueva: () => "Herramienta nueva para la empresa.",
  "Se quita": () => "Se quita con este cambio.",
  "Próximamente": () => "Aún no está disponible.",
  Opcional: null,
};
function pillTips() {
  document.querySelectorAll("#app .pill, #modal .pill").forEach((p) => {
    if (p.dataset.tip) return;
    const t = p.textContent.trim().replace(/…$/, ""),
      k = Object.keys(PILLTIP).find((x) => t === x || (/^Falta/.test(t) && x === "Por comprar"));
    const f = /^Falta/.test(t) ? () => "Hay más personas usándola que asientos contratados." : k && PILLTIP[k];
    if (!f) return;
    p.dataset.tip = f();
    p.removeAttribute("title");
    p.setAttribute("tabindex", "0");
    p.setAttribute("aria-label", t + ". " + p.dataset.tip);
  });
}
const tipEl = () => document.getElementById("ptip") || Object.assign(document.body.appendChild(document.createElement("div")), { id: "ptip", role: "tooltip" });
function showTip(p) {
  const el = tipEl(), r = p.getBoundingClientRect();
  el.textContent = p.dataset.tip;
  el.className = "on";
  const w = Math.min(260, innerWidth - 24);
  el.style.maxWidth = w + "px";
  const tw = el.offsetWidth, th = el.offsetHeight;
  let x = Math.min(Math.max(12, r.left + r.width / 2 - tw / 2), innerWidth - tw - 12), y = r.top - th - 8;
  if (y < 64) y = r.bottom + 8;
  el.style.left = x + "px";
  el.style.top = y + "px";
}
const hideTip = () => { const el = document.getElementById("ptip"); if (el) el.className = ""; };
document.addEventListener("mouseover", (e) => { const p = e.target.closest && e.target.closest(".pill[data-tip]"); p ? showTip(p) : hideTip(); });
document.addEventListener("focusin", (e) => { const p = e.target.closest && e.target.closest(".pill[data-tip]"); p ? showTip(p) : hideTip(); });
addEventListener("scroll", hideTip, true);
/* on touch, a tap on a badge explains it instead of opening what is around it */
document.addEventListener("click", (e) => {
  const p = e.target.closest && e.target.closest(".pill[data-tip]");
  if (p && matchMedia("(hover: none)").matches) { e.preventDefault(); e.stopPropagation(); showTip(p); clearTimeout(window.__tt); window.__tt = setTimeout(hideTip, 3000); }
}, true);

/*@i18n*/
/* ===== i18n: Spanish is the source language; English is applied as a live translation layer over the DOM ===== */
const I18N = { dict: new Map(), rdict: new Map(), pats: [], cache: new Map(), done: new WeakMap() };
function i18nInit(pairs, pats) {
  for (const [es, en] of pairs) { I18N.dict.set(es, en); if (!I18N.rdict.has(en)) I18N.rdict.set(en, es); }
  I18N.pats = pats
    .map(([es, en]) => {
      const parts = es.split(/\{(\d+)\}/);
      let rx = "^", order = [];
      parts.forEach((p, i) => {
        if (i % 2) {
          const prev = parts[i - 1] || "", next = parts[i + 1] || "";
          /* glued to a word (proyecto{1}) = a plural ending */
          if (/[A-Za-zÁÉÍÓÚáéíóúñ]$/.test(prev)) rx += "([a-z]{0,2})";
          /* a count at the start of a plural phrase: only a number */
          else if (i === 1 && prev === "" && /^ [a-záéíóúñ]+$/.test(next) && /^\d+$/.test(parts[i + 2] || "")) rx += "([−+]?\\d[\\d.,]*|un|una)";
          /* right after another placeholder: only a " · …" tail */
          else if (prev === "" && i > 1) rx += "((?:\\s·\\s.*)?)";
          /* at the end after a space or colon: the rest of the text */
          else if (i === parts.length - 2 && next === "" && /[\s:(«]$/.test(prev)) rx += "(.*)";
          /* at the start: no separators; elsewhere: anything that is not a new sentence */
          else rx += i === 1 && prev === "" ? "((?:[^.:;!?·]|[.:,](?=\\d))*?)" : "((?:[^.!?]|\\.(?=[\\w)]))*?)";
          order.push(+p);
        } else rx += p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      });
      return { re: new RegExp(rx + "$"), order, en, lit: es.replace(/\{\d+\}/g, "").length };
    })
    .sort((a, b) => b.lit - a.lit);
}
/* number formats: 5.130 € → €5,130 ; 0,5 → 0.5 ; 21 % → 21% */
function i18nNum(s) {
  return s
    .replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?/g, (m, a, d) => a.replace(/\./g, ",") + (d ? "." + d : ""))
    .replace(/(−|-)?(\d[\d.,]*)[\u00a0 ]?€/g, (m, sg, n) => (sg || "") + "€" + n)
    .replace(/(\d[\d.,]*)[\u00a0 ]?\$(?![\w])/g, (m, n) => "$" + n)
    .replace(/(\d)[\u00a0 ]%/g, "$1%");
}
function tr(s) {
  if (LANG !== "en" || !s) return s;
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), core = m[2].replace(/\s+/g, " ");
  if (!core || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(core)) return LANG === "en" && core ? m[1] + i18nNum(core) + m[3] : s;
  let out = I18N.cache.get(core);
  if (out === undefined) {
    out = trCore(core);
    if (I18N.cache.size > 20000) I18N.cache.clear();
    I18N.cache.set(core, out);
  }
  return m[1] + out + m[3];
}
function trCore(core) {
  return trFix(trRaw(core));
}
const trFix = (s) => s.replace(/([^\s,]) y (?=[A-Z«])/g, "$1 and ").replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/g, (m) => m[0].toUpperCase() + m.slice(1)).replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December) de (\d{4})/g, "$1 $2");
function trRaw(core) {
  const d = I18N.dict.get(core);
  if (d !== undefined) return d;
  for (const p of I18N.pats) {
    const r = core.match(p.re);
    if (!r) continue;
    const caps = {};
    p.order.forEach((n, i) => (caps[n] = r[i + 1]));
    return (
      p.en.replace(/\{(\d+)(\|[^}]*)?\}/g, (x, n, mod) => {
        const raw = caps[n] == null ? "" : caps[n], v = raw.trim(), pre = raw.match(/^\s*/)[0], post = raw.match(/\s*$/)[0];
        if (mod) { const a = mod.slice(1).split("|"); return a.length === 1 ? (v ? a[0] : "") : v ? a[1] : a[0]; }
        const t = I18N.dict.get(v.trim());
        let o = t !== undefined ? t : I18N.dict.has(v + ".") ? I18N.dict.get(v + ".").replace(/\.$/, "") : /[a-záéíóúñ]{3}/i.test(v) && v.length < 400 ? trCore(v) : i18nNum(v);
        if (o === i18nNum(v) && /\(/.test(v)) o = v.replace(/\(([^()]+(?:\([^()]*\))?[^()]*)\)/g, (x, inner) => "(" + trCore(inner) + ")");
        return pre + o.replace(/» y «/g, "» and «").replace(/, y /g, ", and ") + post;
      })
    );
  }
  /* trailing punctuation the source string didn't have */
  const tp = core.match(/^(.*?)([.,;:])$/);
  if (tp && (I18N.dict.has(tp[1]) || I18N.pats.some((p) => p.re.test(tp[1])))) return trRaw(tp[1]) + tp[2];
  /* compound: "A · B · C" and "Sentence. Sentence." are translated part by part */
  if (core.includes(" · ")) {
    const ps = core.split(" · "), t = ps.map((x) => trCore(x));
    if (t.some((x, i) => x !== ps[i])) return t.join(" · ");
  }
  const lp = core.match(/^([.,;:·]\s)(.+)$/);
  if (lp) { const r = trCore(lp[2]); if (r !== lp[2]) return lp[1] + r; }
  /* «Name»: rest */
  const q = core.match(/^(«[^»]+»): (.+)$/);
  if (q) { const r = trCore(q[2]); if (r !== q[2]) return q[1] + ": " + r; }
  /* sentences: the first one, then the rest as a whole (so longer known sentences still match) */
  const bs = [];
  core.replace(/[.;] (?=[A-ZÁÉÍÓÚ¿«])/g, (m, i) => bs.push(i));
  if (bs.length) {
    const known = (h) => I18N.dict.has(h) || I18N.pats.some((p) => p.re.test(h));
    const k = [...bs].reverse().find((i) => known(core.slice(0, i + 1))) ?? bs[0];
    const h = core.slice(0, k + 1), rest = core.slice(k + 2), th = trCore(h), tr2 = trCore(rest);
    if (th !== h || tr2 !== rest) return th + " " + tr2;
  }
  return i18nNum(core);
}
const I18N_ATTRS = ["aria-label", "placeholder", "title", "data-tt", "data-tip", "alt", "aria-roledescription"];
function trAttr(el, a) {
  const v = el.getAttribute(a);
  if (!v) return;
  let m = I18N.done.get(el);
  if (!m || typeof m !== "object") { m = {}; I18N.done.set(el, m); }
  if (m[a] === v) return;
  const t = tr(v);
  if (t !== v) el.setAttribute(a, t);
  m[a] = t;
}
function i18nNode(n) {
  if (LANG !== "en") return;
  if (n.nodeType === 3) {
    const p = n.parentNode;
    if (!p || p.closest?.(".notr,script,style,textarea") || (p.nodeType === 1 && p.closest && p.closest(".notr"))) return;
    const v = n.nodeValue;
    if (I18N.done.get(n) === v) return;
    const t = tr(v);
    if (t !== v) n.nodeValue = t;
    I18N.done.set(n, t);
    return;
  }
  if (n.nodeType !== 1 || n.closest(".notr,script,style")) return;
  for (const a of I18N_ATTRS) trAttr(n, a);
  if (n.tagName === "INPUT") i18nInput(n);
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let c = w.nextNode();
  while (c) {
    if (c.nodeType === 1) {
      if (c.matches("textarea")) { for (const a of I18N_ATTRS) trAttr(c, a); c = nextSkip(w, c); continue; }
      if (c.matches(".notr,script,style")) { c = nextSkip(w, c); continue; }
      for (const a of I18N_ATTRS) trAttr(c, a);
      if (c.tagName === "INPUT") i18nInput(c);
    } else {
      const v = c.nodeValue;
      if (I18N.done.get(c) !== v) { const t = tr(v); if (t !== v) c.nodeValue = t; I18N.done.set(c, t); }
    }
    c = w.nextNode();
  }
}
/* numbers shown inside inputs follow the English format; the parsers already ignore separators */
function i18nInput(el) {
  if (el.dataset.i18nv || el === document.activeElement) return;
  const v = el.value;
  if (/^-?\d{1,3}(\.\d{3})+$/.test(v)) el.value = v.replace(/\./g, ",");
  else if (el.inputMode === "decimal" && /^\d+,\d+$/.test(v)) el.value = v.replace(",", ".");
  el.dataset.i18nv = "1";
}
function nextSkip(w, el) {
  let s = el;
  while (s && !s.nextSibling) s = s.parentNode;
  if (!s || s === document.body) return null;
  w.currentNode = s.nextSibling;
  return w.currentNode;
}
const i18nObs = new MutationObserver((ms) => {
  if (LANG !== "en") return;
  for (const m of ms) {
    if (m.type === "childList") m.addedNodes.forEach(i18nNode);
    else if (m.type === "characterData") i18nNode(m.target);
    else if (m.type === "attributes") trAttr(m.target, m.attributeName);
  }
  const tt = tr(document.title.replace(/ · HUMAIN$/, ""));
  if (!document.title.startsWith(tt)) document.title = tt + " · HUMAIN";
});
function i18nStart() {
  document.documentElement.lang = LANG;
  i18nObs.disconnect();
  if (LANG === "en") {
    i18nNode(document.body);
    i18nObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
  }
}
/* stored data: demo strings follow the language (exact matches only, so text people wrote is never touched) */
function i18nData(to) {
  const map = to === "en" ? I18N.dict : I18N.rdict;
  const seen = new WeakSet();
  const walkD = (o) => {
    if (!o || typeof o !== "object" || seen.has(o)) return;
    seen.add(o);
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === "string") { if (/^(name|goal|justif|comment|reply|t|why|msg|note|reason|title)$/.test(k)) { const t = map.get(v); if (t !== undefined && t !== v) o[k] = t; } }
      else if (v && typeof v === "object") walkD(v);
    }
  };
  walkD(D);
}
function setLang(l) {
  if (l === LANG) return;
  const from = LANG;
  LANG = l;
  try { localStorage.setItem(LANGK, l); } catch (e) {}
  I18N.cache.clear();
  if (D) { i18nData(l); save(); }
  if (from === "en" && l === "es") { i18nObs.disconnect(); }
  render();
  i18nStart();
}

i18nInit(I18N_PAIRS, I18N_PATS);
{
  const _seed = seedData;
  seedData = function () { const r = _seed.apply(this, arguments); if (LANG === "en") i18nData("en"); return r; };
}
if (D) { i18nData(LANG); try { save(); } catch (e) {} }
render();
i18nStart();
