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
  /* Leadership is a user too: the demo's James Carter appears in «Usuarios y permisos» */
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
        /* the project lead only manages their own people: an «other team» seat in a project still being edited becomes a hire (Leadership can cover it when reviewing) */
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
/* each note goes to Leadership ("board"), to one manager, or to everyone (no "to") */
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
