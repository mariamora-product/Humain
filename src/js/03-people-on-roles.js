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
/* what a project lead can ask for: one entry per product (Figma, Miro…), not per plan;
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
