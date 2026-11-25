/* ===== Seed data (the SRC demo): three teams, two projects in progress, one proposal waiting for Leadership, one draft ===== */
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
  /* waiting for Leadership: Nora's launch campaign (her people, a designer of another team, new hires) */
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
  /* contracts sized like real ones: a few spare seats here and there; Jira España one short (a task for Leadership), Copilot México exact, so «Pagos en tienda» needs one before it starts */
  const spare = { "figma_pro|group": 1, "cc_pro|group": 0, "jira|es": -1, "copilot|mx": 0, "claude_std|es": 2, "jira|mx": 0 };
  D.licenses.forEach((l) => {
    const k = l.opt + "|" + l.scope;
    l.holders = l.holders || [];
    l.seats = Math.max(1, seatInventory(l).used + (k in spare ? spare[k] : hashStr(k) % 3));
  });
  /* in April, Adobe's renewal went down by two seats nobody used */
  D.trims = [{ opt: "cc_pro", scope: "group", n: 2, ts: new Date(now.getFullYear(), 3, 14).getTime() }];
  /* HubSpot renews in two months with a seat nobody uses: a saving for Leadership to decide */
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
