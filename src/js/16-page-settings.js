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
/* where the company's figure sits against the market range (±10 %). For Leadership it is a slider over the market band:
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
