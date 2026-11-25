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
const FX = 0.9024; /* USD → EUR: 1 / 1.1081, ECB reference rate of 12/11/2026 */
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
  /* programs a project lead asks for that the catalogue does not have yet: they travel with the team proposal */
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
