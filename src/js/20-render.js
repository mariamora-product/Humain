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
    /* no «Equipo» field: the area comes from the puesto. Leadership only says whose team it is, when there is more than one project lead */
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
