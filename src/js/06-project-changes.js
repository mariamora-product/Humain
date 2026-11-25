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
