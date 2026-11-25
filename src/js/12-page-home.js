/* «Tareas pendientes» (manager and Leadership): only real tasks */
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
/* Leadership: what is committed and what is waiting for a decision */
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
  /* who has the ball: changes asked → the project lead must act, so it gets its own tab (not a draft) */
  changes: [(p) => p.status === "changes", "Cambios pedidos", 1],
  draft: [(p) => p.status === "draft", "Borradores", 1],
  pending: [(p) => p.status === "pending", "Pendientes"],
  approved: [(p) => stOf(p) === "approved", "Aprobados", 1],
  active: [(p) => stOf(p) === "active", "En curso"],
  done: [(p) => stOf(p) === "done", "Finalizados", 1],
  rejected: [(p) => p.status === "rejected", "Rechazados", 1],
  cancelled: [(p) => p.status === "cancelled", "Cancelados", 1],
};
