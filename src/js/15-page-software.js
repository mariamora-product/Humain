/* ===== Software and AI. Contracts are Leadership's: it sees what to do (seats to buy, unused seats before a renewal) and every tool with who holds its seats.
   A project lead sees the tools of her team and whether her projects have their seats. ===== */
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
/* tool requests: a project lead asks for software nobody has contracted yet; Leadership decides */
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
/* a hiring request for a project is an amendment inside that project; the project lead reads it here as a request too */
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
    /* status: what needs Leadership, then the renewal date under it */
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
/* project lead: the tools of her team, who has them, and whether her projects have their seats */
function pageLicTeam() {
  const team = visPeople().map((x) => x.id),
    mine = D.projects.filter((p) => p.owner === meName() && !p.archived && stOf(p) !== "done" && p.status !== "rejected" && p.status !== "cancelled"),
    ids = new Set();
  D.licenses.forEach((l) => (l.holders || []).some((pid) => team.includes(pid)) && ids.add(l.opt));
  mine.forEach((p) => Object.keys(projNeed(p).need).forEach((oid) => ids.add(oid)));
  /* what this page is for (project lead): the tools of her team, asking for one, and following what she asked. Contracts are Leadership's */
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
