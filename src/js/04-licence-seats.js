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
