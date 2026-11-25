/* ===== Software and AI of a proposal: one line per licence, what is already paid and what is new ===== */
const catOfOpt = (id) => Object.keys(TC).find((k) => TC[k].opts.some((o) => o.id === id)),
  isAiTool = (id) => !!(catOfOpt(id) && TC[catOfOpt(id)].ai);
/* Leadership decides from this card, so it starts open for them; the project lead starts with it folded */
const askOpen = (pr) => (isBoard() ? V.askopen !== "x" + pr.id : V.askopen === pr.id);
/* what the edit form compares against: «Guardar cambios» stays off until something differs from the request as it was sent */
const askSig = (d) => JSON.stringify([d.opt || "", d.where || "", d.pid || "", d.fid || "", (d.whoIds || []).slice().sort(), (d.why || "").trim(), d.when || ""]);
/* ===== «Supuestos del cálculo»: every number the estimate rests on, with its source; the estimated work is editable ===== */
function assumeCard(pr, K) {
  if (!pr.roles.length && !pr.work) return "";
  const open = V.assume === pr.id,
    w0 = pr.type && pr.type !== "other" ? buildTeam(pr).work : null,
    cats = [...new Set(pr.roles.filter((r) => r.ai).map((r) => F(r.id).cat))].filter((c) => AIUP[c]),
    L = (x) => `<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)}${I("external-link-alt")}<span class="sr"> (se abre en una pestaña nueva)</span></a>`,
    pctS = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "\u00a0%";
  const body = `<div class="asm" id="asm-${pr.id}">
  <div class="line"><span>Trabajo estimado <small>${w0 && pr.work !== w0 ? `Valor tuyo. Según tipo y tamaño: ${w0.toLocaleString(LOC())} h. <button class="lnk" data-workreset>Usar</button>` : `Sale de las plantillas de HUMAIN por tipo y tamaño: cámbialo si conoces mejor el alcance. Como contraste, una app digital mediana (4,3 personas durante 6 meses, 26 personas-mes) coincide con el proyecto típico de ${L(QSMTYP)}: 4,9 personas, 5,1 meses y 25,8 personas-mes.`}</small></span><span class="inu sm"><input class="hin wide" data-work inputmode="numeric" value="${pr.work ? numFmt(pr.work) : ""}" aria-label="Trabajo estimado en horas"/><span class="u" aria-hidden="true">h</span></span></div>
  <div class="line"><span>Jornada completa <small>1.800 h al año. ${L(HPM_SRC)}</small></span><b class="av2">${HPM} h/mes</b></div>
  ${cats.length ? `<div class="line col"><span>Mejora con IA por área <small>Cuánto más trabajo saca una persona que usa IA según los estudios. Es informativa: el equipo se calcula como si la IA no ahorrara tiempo.</small></span><ul class="asl">${cats
    .map((c) => {
      const a = AIUP[c];
      return `<li><b>${esc(CATS.find((x) => x[0] === c)[1])}</b><span class="asv">${pctS(a.v)}</span><small>${a.why} Rango: de ${pctS(a.lo)} a ${pctS(a.hi)}.${a.src.length ? " " + a.src.map((k) => L(AIEV[k])).join(" · ") : ""}</small></li>`;
    })
    .join("")}</ul></div>` : ""}
  ${pr.months && (REFM[pr.size || "m"] || 6) / pr.months > 1 ? `<div class="line"><span>Coordinación <small>El plazo es más corto de lo habitual para este tamaño, así que el equipo crece y se suma un ${Math.round(COORD * 100)} % de trabajo cada vez que se duplica. Estimación: ${L(QSM)} muestra que los equipos grandes necesitan bastante más esfuerzo para el mismo resultado, pero no da una cifra aplicable.</small></span></div>` : ""}
  <div class="line"><span>Coste de cada persona <small>Guías salariales de Michael Page y LHH 2026 más la Seguridad Social de la empresa (${f2(ONCOST.rate * 100)} %). Fuentes completas en Ajustes.</small></span><button class="lnk" data-nav="settings">Ver fuentes</button></div>
  <div class="line"><span>Licencias <small>Precio de lista de cada proveedor, con pago anual salvo que se indique, comprobado en su web el 14/11/2026. Los que se publican en dólares, a ${String(FX).replace(".", ",")} € por dólar (BCE). Los asientos que ya pagas no suman.</small></span></div>
  <div class="line"><span>Uso de IA <small>Va incluido en cada asiento hasta su límite (${L({ n: "Claude Team", u: "https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan" })}, ${L({ n: "ChatGPT Business", u: "https://help.openai.com/en/articles/12003714-chatgpt-business-models-and-limits" })}, ${L({ n: "Cursor Teams", u: "https://cursor.com/en-US/business/teams" })}). Lo que pase de ese límite se paga por uso y no entra en la estimación.</small></span></div>
  </div>`;
  return `<div class="rcard asmc"><button class="advbtn" data-assume aria-expanded="${open}" aria-controls="asm-${pr.id}"><span class="advt">Supuestos del cálculo<small>Trabajo estimado, jornada, mejora con IA y de dónde sale cada coste</small></span>${I(open ? "angle-up" : "angle-down")}</button>${open ? body : ""}</div>`;
}
/* ===== The proposal ===== */
const canEdit = (pr) => !isBoard() && pr.owner === meName() && (pr.status === "draft" || pr.status === "changes") && !pr.archived;
const dedTxt = (r) => (r.n ? "jornada completa" : r.hours === HPM / 2 ? "media jornada" : `${Math.round(r.hours / 4)} h/semana`);
const lvlName = (x) => (F(x.fid).gr.length && GR[x.lvl] ? GR[x.lvl][0] : "");
const personTxt = (x) => `${F(x.fid).t} ${lvlName(x).toLowerCase()}`;
const sharedIn = (pr, pid) =>
  projectsOf(pid, pr.id)
    .map((p) => `«${esc(p.name)}»`)
    .join(" y ");
/* origin picker of a seat: free people of my team, people of my team already busy (shared), another team's profile, a new hire */
function srcOptions(pr, r, ri, i, noNew) {
  const used = new Set(pr.roles.flatMap((x, a) => (x.fill || []).filter((f, b) => f.pid && !(a === ri && b === i)).map((f) => f.pid))),
    cat = F(r.id).cat,
    cur0 = ((r.fill || [])[i] || {}).pid,
    /* only people who do this kind of work: for a designer, other designers */
    mine = (D.people || []).filter((x) => x.team === pr.owner && !used.has(x.id) && (F(x.fid).cat === cat || x.id === cur0)),
    rank = (x) => (x.fid === r.id ? 0 : F(x.fid).cat === cat ? 1 : 2),
    srt = (xs) => xs.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)),
    cur = (r.fill || [])[i] || { src: "new" };
  return [
    ...srt(mine.filter((x) => isFree(x.id, pr.id))).map((x) => ["mine:" + x.id, `Tu equipo · ${x.name} (${personTxt(x)})`]),
    ...srt(mine.filter((x) => !isFree(x.id, pr.id))).map((x) => ["shared:" + x.id, `Compartir · ${x.name} (en ${projectsOf(x.id, pr.id).map((p) => p.name).join(" y ")})`]),
    ...(noNew ? [] : [["new", "Contratación nueva"]]),
  ];
}
const srcVal = (f) => (f.src === "mine" || f.src === "shared") && f.pid ? f.src + ":" + f.pid : f.src;
function seatLine(pr, r, ri, i, x, ed, open, noPen) {
  const f = x.f,
    board = isBoard(),
    who = f.pid ? PERSON(f.pid) : null,
    named = who && (f.src !== "other" || board || pr.status === "active"),
    role = `${dname(r)} · ${dedTxt(r)}`,
    aiTag = i < r.ai ? `<em class="pill ai">Con IA</em>` : "";
  let title, meta, tag, note = "";
  if (f.src === "new") {
    title = dname(r);
    meta = cap1(dedTxt(r));
    tag = f.hiring && pr.status === "active" ? `<span class="pill run">En contratación</span>` : `<span class="pill active" tabindex="0" title="Contratación nueva: cuenta como inversión nueva.">Nueva</span>`; /* new money: same family as «Por comprar» */
    if (f.byBoard && pr.status === "pending") meta += " · Dirección prefiere contratar";
  } else if (f.src === "other") {
    title = named ? esc(who.name) : role;
    meta = named ? `${role} · ${esc(unitOf(who))}` : pr.status === "active" ? "Asignada por Dirección" : "Por asignar";
    tag = `<span class="pill" tabindex="0" title="Alguien de otro equipo de la empresa. Cuenta a su coste real y no es inversión nueva.">Otro equipo</span>`;
  } else {
    title = esc(who.name);
    meta = role;
    tag = `<span class="pill">${board || teamsOf(meName()).length > 1 ? esc(unitOf(who)) : "Tu equipo"}</span>`;
    if (f.src === "shared") {
      const where = sharedIn(pr, who.id);
      note = f.part
        ? `<p class="snote">Dedicación parcial${where ? `: también está en ${where}` : ""}.</p>`
        : `<p class="snote warnt">${I("exclamation-triangle")}<span>${ed ? `Compartir a ${esc(who.name.split(" ")[0])} ahorra ${eur(x.ref)}/mes de inversión, pero ya` : "Ya"} está en ${where || "otro proyecto"}.</span></p>`;
    }
  }
  const cost = x.real
    ? `<b>${eur(x.v)}<small>/mes</small></b><small>Coste real</small>`
    : `<b>${eur(x.v)}<small>/mes</small></b><small>${rangeTxt(x.v)}</small><small class="one" title="${esc(provText(r, pr))}">${provBtn(r, pr, ri, "src")}</small>`;
  const act =
    ed
      ? noPen && f.src === "new"
        ? `<span class="sapl">Por contratar</span>`
        : ddHTML({ id: `src-${ri}-${i}`, size: "sm", ariaLabel: `Quién ocupa este puesto de ${F(r.id).t}`, value: srcVal(f), shown: { mine: "Tu equipo", shared: "Compartida", other: "Otro equipo", new: "Contratación nueva" }[f.src], options: srcOptions(pr, r, ri, i, noPen) })
      : board && pr.status === "pending" && (f.src === "other" || f.src === "new")
        ? (() => {
            const cand = otherFree(pr, r.id).filter((y) => y.id === f.pid || !pr.roles.some((rr) => (rr.fill || []).some((g) => g.pid === y.id)));
            if (f.src === "new" && cand.length) {
              const c0 = cand[0];
              return `<div class="sugg"><span class="sgic" aria-hidden="true">${I("user-check")}</span><span class="sgtx"><b>${esc(c0.name.split(" ")[0])} está libre</b><small>${esc(F(c0.fid).t)} · ${esc(teamName(c0.team))}. Ahorra ${eur(x.v)}/mes de inversión nueva.</small></span><button class="btn btn-s sm" data-asgq="${ri}|${i}|${c0.id}">Asignar</button></div>${cand.length > 1 ? `<div class="sgmore"><span>O elige a otra persona</span>${ddHTML({ id: `asg-${ri}-${i}`, size: "sm", ariaLabel: "Asignar a otra persona libre", placeholder: `${cand.length - 1} más`, value: "", options: cand.slice(1).map((y) => [y.id, `${y.name} · ${teamName(y.team)}`]) })}</div>` : ""}`;
            }
            return cand.length
              ? `<span class="sapl">${f.src === "other" ? "¿Quién ocupa el puesto?" : "¿Alguien libre lo cubre?"}</span>` + ddHTML({ id: `asg-${ri}-${i}`, size: "sm", ariaLabel: `Asignar a una persona de otro equipo o contratar`, placeholder: "Asignar a…", value: f.src === "new" ? "new" : f.pid || "", options: [...cand.map((y) => [y.id, `${y.name} · ${teamName(y.team)} · ${eur(y.cost || 0)}`]), ["new", "Contratar a alguien nuevo"]] })
              : f.src === "new"
                ? ""
                : `<span class="sapl">Nadie libre en otros equipos: se contratará</span>`;
          })()
        : f.src === "new" && f.hiring && pr.status === "active" && (board || pr.owner === meName())
          ? `<div class="hirel hirel2">${I("clock")}<span><b>Contratación en curso</b><small>Cuando la persona se incorpore, notifícalo para ponerle nombre y que cuente en ${board ? "el equipo de " + esc(pr.owner.split(" ")[0]) : "tu equipo"}.</small></span><button class="btn btn-s sm" data-hired="${ri}|${i}">${I("user-check")}Notificar contratación</button></div>`
          : "";
  const pen =
    noPen
      ? ""
      : ed
      ? `<button class="ib s" data-ropen="${ri}" aria-expanded="${!!open}" aria-label="${open ? "Cerrar la edición de" : "Editar el puesto"} ${esc(F(r.id).t)}" title="${open ? "Cerrar" : "Editar puesto"}">${I(open && i === 0 ? "times" : "pen")}</button>`
      : ed
        ? `<span class="ibsp" aria-hidden="true"></span>`
        : "";
  const rm = ed ? `<button class="ib s srm" data-seatrm="${ri}|${i}" aria-label="Quitar este puesto: ${esc(f.pid && who ? who.name : dname(r))}" title="Quitar este puesto">${I("times")}</button>` : "";
  /* compact (area rows): the role name, its AI tag and its schedule are already in the row header, so a seat only says who fills it */
  const multi = seatsOf(r) > 1,
    sn = noPen
      ? !multi
        ? ""
        : f.src === "new" || (f.src === "other" && !named)
          ? `<b>Puesto ${i + 1}${aiTag}</b>`
          : `<b>${title}${aiTag}</b>`
      : `<b>${title}${aiTag}</b><small>${meta}</small>`;
  return `<div class="sline src-${f.src}${i ? " cont" : ""}${ed ? " ed" : act ? " act nt" : " nt"}${noPen && !sn ? " nosn" : ""}"><span class="sn">${sn}${ed ? "" : `<span class="stag">${tag}</span>`}${note}</span><span class="scost">${cost}</span>${ed || act ? `<span class="sact2">${act}${pen}${rm}</span>` : ""}</div>`;
}
/* ===== The team by area: one folded row per profile; unfolded, its card with people, programs and AI ===== */
const rOpen = (pr, i, ed) => {
  const v = (V.rx || {})[pr.id + ":" + i];
  return v === undefined ? !ed : v;
};
function areaTeam(pr, K, ed) {
  const ord = { head: 0, manager: 1, lead: 2, delivery: 3, ic: 4 },
    cix = (r) => CATS.findIndex((c) => c[0] === F(r.id).cat),
    W = pr.roles.map((r, i) => [r, i]).sort((a, b) => cix(a[0]) - cix(b[0]) || ord[F(a[0].id).arch] - ord[F(b[0].id).arch]),
    groups = [],
    DF = diffOf(pr);
  if (DF) DF.removed.forEach((r) => W.push([r, -1]));
  W.sort((a, b) => cix(a[0]) - cix(b[0]) || ord[F(a[0].id).arch] - ord[F(b[0].id).arch]);
  W.forEach(([r, i]) => {
    /* same areas as Personas: product design and graphic design are one «Diseño» */
    const cat = ["pdesign", "creative"].includes(F(r.id).cat) ? "pdesign" : F(r.id).cat;
    let g = groups.find((x) => x.cat === cat);
    if (!g) groups.push((g = { cat, items: [] }));
    g.items.push([r, i]);
  });
  const row = ([r, i]) => {
    const gone = i < 0,
      bo = DF && DF.bm[r.uid],
      isNew = DF && !gone && !bo,
      newT = new Set(DF && bo ? Object.values(r.tools || {}).filter((t) => t && !Object.values(bo.tools || {}).includes(t)) : []),
      dedCh = bo && !gone && ((bo.n || 0) !== (r.n || 0) || (bo.hours || 0) !== (r.hours || 0));
    const x = seatCosts(r, pr)[0],
      f = x.f,
      board = isBoard(),
      who = f.pid && PERSON(f.pid) && (f.src !== "other" || board || pr.status === "active" || pr.full) ? PERSON(f.pid) : null,
      nw = f.src === "new",
      title = who ? who.name : dname(r),
      sub = (who ? `${dname(r)} · ${dedTxt(r)}` : `${nw ? (f.hiring && pr.status === "active" ? "En contratación" : "Por contratar") : "Por asignar"} · ${dedTxt(r)}`) + (dedCh ? ` (antes ${dedTxt(bo)})` : ""),
      tl = Object.values(r.tools || {}).filter((y) => y && opt(y)).map((y) => opt(y).n),
      pills = (r.ai > 0 ? `<em class="pill ai">Con IA</em>` : "") + (isNew ? `<em class="pill dnew">Nuevo</em>` : "") + (gone ? `<em class="pill dgone">Se quita</em>` : ""),
      short = (n) => n.replace(/\s*\(.*?\)/g, "").split(" · ")[0],
      chips = Object.values(r.tools || {})
        .filter((y) => y && opt(y))
        .map((y) => `<span class="pchip${isAiTool(y) ? " ai" : ""}">${esc(short(opt(y).n))}</span>`)
        .join(""),
      acts = "",
      extra = !gone && !ed && ((board && pr.status === "pending" && (f.src === "new" || f.src === "other")) || (nw && f.hiring && pr.status === "active")) ? seatLine(pr, r, i, 0, x, false, false, true) : "",
      extraOk = /class="dd|data-hire|class="sugg|class="hirel/.test(extra);
    const tl2 = Object.values(r.tools || {}).filter((y) => y && opt(y)).sort(toolSort),
      px = (V.px || {})[pr.id + ":" + i],
      shown = px ? tl2 : tl2.slice(0, tl2.length > 4 ? 3 : 4),
      more = tl2.length - shown.length,
      chipsH = shown.map((y) => `<span class="pchip${isAiTool(y) ? " ai" : ""}${opt(y).req ? " preq" : ""}${newT.has(y) || isNew ? " dnew" : ""}${ed && !gone ? " pfc" : ""}"${short(opt(y).n) !== opt(y).n ? ` title="${esc(opt(y).n)}"` : ""}>${newT.has(y) ? "+ " : ""}${esc(short(opt(y).n))}${ed && !gone ? `<button type="button" data-tchiprm="${i}|${esc(y)}" aria-label="Quitar ${esc(opt(y).n)} a ${esc(title)}">${I("times")}</button>` : ""}</span>`).join("") + (more ? `<button type="button" class="pchip more" data-pmore="${i}" aria-expanded="false" aria-label="Ver ${more} programas más: ${esc(tl2.slice(shown.length).map((y) => opt(y).n).join(", "))}">+${more}</button>` : px && tl2.length > 4 ? `<button type="button" class="pchip more" data-pmore="${i}" aria-expanded="true">Ver menos</button>` : ""),
      btns = gone
        ? ed
          ? `<span class="pacts"><button class="lnk" data-unrm="${esc(r.uid)}">Deshacer</button></span>`
          : ""
        : ed
        ? `<span class="pacts"><button class="ib s" data-pedit="${i}" aria-label="Editar a ${esc(title)}" title="Editar">${I("pen")}</button><button class="ib s" data-seatrm="${i}|0" aria-label="Quitar a ${esc(title)} del proyecto" title="Quitar del proyecto">${I("trash-alt")}</button></span>`
        : "";
    return `<div class="arw prow${gone ? " dgonew" : ""}${isNew ? " dneww" : ""}" id="${gone ? "gone-" + esc(r.uid) : "role-" + i}"><div class="pr3"><span class="pav${who ? "" : " nw"}" aria-hidden="true">${who ? esc(initials(who.name)) : I("user-plus")}</span><b class="pname">${esc(title)}${pills}</b><span class="pmain"><small class="psub">${esc(cap1(sub.replace(/\d+\u00a0% · /, "")))}</small><small class="pcost3"><strong>${eur(x.v)}</strong>/mes</small></span>${btns}<span class="pchips">${chipsH || `<small class="pnone">Sin programas propios</small>`}</span></div>${extraOk ? `<div class="rficha">${extra}</div>` : ""}${gone ? `<p class="gonel">${I("info-circle")}<span>${who ? `Si Dirección aprueba los cambios, ${esc(who.name.split(" ")[0])} deja el proyecto y queda <b>libre</b> en Personas para otro proyecto.` : "Si Dirección aprueba los cambios, este puesto deja de cubrirse."}</span></p>` : ""}</div>`;
  };
  return groups
    .map((g) => {
      const label = g.cat === "pdesign" ? "Diseño" : CATS.find((c) => c[0] === g.cat)[1],
        ppl = g.items.filter(([, i]) => i >= 0).reduce((a, [r]) => a + seatsOf(r), 0);
      const rows = g.items.map(row).join(""),
        key = pr.id + ":" + g.cat,
        /* a running project is read, not edited: each area folds into one line (people, cost) so what needs
           attention (requests, hiring) stays on top. Areas with a pending action stay open. */
        fold = !ed && ["active", "done"].includes(pr.status) && !/class="rficha"/.test(rows);
      if (!fold) return `<section class="rcard blk area" aria-label="${esc(label)}"><div class="rh"><h2>${esc(label)}</h2><span class="cnt">${ppl}</span></div>${rows}</section>`;
      const open = (V.aopen || []).includes(key),
        mo = g.items.filter(([, i]) => i >= 0).reduce((a, [r]) => a + seatCosts(r, pr).reduce((t, x) => t + x.v, 0), 0),
        avs = g.items.filter(([, i]) => i >= 0).map(([r]) => { const f = (r.fill || [])[0] || {}, w = f.pid && PERSON(f.pid); return w ? `<i class="hav">${esc(initials(w.name))}</i>` : `<i class="hav nw">${I("user-plus")}</i>`; }),
        sh = avs.slice(0, avs.length > 4 ? 3 : 4);
      return `<section class="rcard blk area afold${open ? " open" : ""}" aria-label="${esc(label)}"><button class="rh afh" data-afold="${esc(key)}" aria-expanded="${open}"><h2>${esc(label)}</h2><span class="cnt">${ppl}</span><span class="afs">${open ? "" : `<span class="havs">${sh.join("")}${avs.length > sh.length ? `<i class="hav more">+${avs.length - sh.length}</i>` : ""}</span><span class="afm"><b>${eur(mo)}</b>/mes</span>`}${I("angle-down")}</span></button>${open ? rows : ""}</section>`;
    })
    .join("") + (pr.roles.length ? "" : `<section class="rcard blk"><div class="rh"><h2>Personas</h2><span class="cnt">0</span></div><p class="note">Aún no hay nadie. Añade a la primera persona.</p></section>`) +
    (ed ? `<div class="addrow"><button class="btn btn-s addp" data-addrole>${I("plus")}Añadir persona</button>${pr.work && !pr.full ? `<button class="btn btn-s resug" data-resuggest title="HUMAIN vuelve a proponer el equipo según el trabajo. Puedes deshacerlo.">${I("exchange")}Volver a proponer el equipo</button>` : ""}</div>` : "") +
    "";
}
/* side panel: the three figures, the budget, why it is needed and the action that fits the state and who is looking */
/* mobile: the two figures on top; the full panel (justification and decision) follows at the end */
function mobSum(pr, K) {
  const Mx = K.og ? 1 : K.M,
    per = K.og ? "/mes" : "";
  return `<div class="msum" aria-hidden="true"><div><small>Coste del proyecto</small><b>${eur(K.monthly * Mx)}${per}</b></div><div><small>Inversión nueva</small><b class="inv">${eur(K.inv * Mx)}${per}</b></div></div>`;
}
function panelHTML(pr, K) {
  const BK = pr.full && baseOf(pr) ? cost(baseOf(pr)) : null;
  if (BK) K = { ...K, inv: Math.max(0, K.inv - BK.inv), paid: Math.max(0, K.paid - BK.paid), peopleNew: Math.max(0, K.peopleNew - BK.peopleNew) };
  const og = K.og,
    Mx = og ? 1 : K.M,
    per = og ? "/mes" : "",
    proj = K.monthly * Mx,
    inv = K.inv * Mx,
    paid = K.paid * Mx,
    refNew = K.peopleNew * Mx,
    lo = r100(inv - refNew * RANGE),
    hi = r100(inv + refNew * RANGE),
    ed = canEdit(pr),
    mine = !isBoard() && pr.owner === meName(),
    rv = pr.review,
    when = (ts) => !(ts > 9e11) ? "" : fdateS(ts) + (new Date(ts).getFullYear() !== new Date().getFullYear() ? " de " + new Date(ts).getFullYear() : "");
  let budget = "";
  if (pr.budget) {
    const d = pr.budget - inv;
    budget = `<div class="frow"><span>Presupuesto${og ? " al mes" : ""}</span><b>${eur(pr.budget)}</b></div>${
      d >= 0
        ? `<p class="fnote ok">${I("check-circle")}<span>La inversión nueva cabe: quedan ${eur(d)}${per}.</span></p>`
        : `<div class="lup warn" role="status">${I("exclamation-triangle")}<div><b>Se pasa en ${eur(-d)}${per}</b><small>${isBoard() ? "La inversión nueva supera el presupuesto que puso " + esc(pr.owner.split(" ")[0]) + "." : "La inversión nueva supera el presupuesto. Puedes enviarla igualmente."}</small></div></div>`
    }`;
  }
  const just = ed
    ? `<div class="field jf"><label for="pj">Por qué lo necesitas</label><textarea id="pj" class="big md" data-justif rows="4" placeholder="Qué consigue la empresa con este proyecto y qué pasa si no se hace" ${V.jerr ? 'aria-invalid="true" aria-describedby="pje"' : ""}>${esc(pr.justif || "")}</textarea>${V.jerr ? `<p class="ferr" id="pje" role="alert">Explica por qué lo necesitas antes de enviarla.</p>` : ""}</div>`
    : pr.justif
      ? `<div class="just"><small>${mine ? "Por qué lo necesitas" : "Por qué lo necesita"}</small><p>${esc(pr.justif)}</p></div>`
      : "";
  let act = "";
  if (ed) act = `${pr.roles.length ? "" : `<div class="alert info" role="note">${I("info-circle")}<span>Añade al menos una persona para poder enviarlo.</span></div>`}<button class="btn btn-p full" data-send ${pr.roles.length ? "" : "disabled"}>${pr.status === "changes" ? "Reenviar a Dirección" : "Enviar a Dirección"}</button><button class="btn btn-s full" data-savedraft>Guardar borrador</button>`;
  else if (mine && pr.status === "pending")
    act = `<p class="fnote"><span>Enviada a Dirección el ${when(pr.sentAt || Date.now())}.</span></p><button class="btn btn-s full" data-withdraw>Retirar</button>`;
  else if (isBoard() && pr.status === "pending" && !pr.archived)
    act = V.rmode
      ? `<div class="field jf"><label for="rc">${V.rmode === "changes" ? `¿Qué cambios le pides a ${esc(pr.owner.split(" ")[0])}?` : `¿Por qué la rechazas?`}</label><textarea id="rc" class="big md" data-rcomment rows="3" placeholder="Por ejemplo: ¿Podríais valorar empezar con un equipo más pequeño? Así encajaría mejor en el presupuesto de este trimestre." ${V.rerr ? 'aria-invalid="true" aria-describedby="rce"' : ""}>${esc(V.rcomment || "")}</textarea>${V.rerr ? `<p class="ferr" id="rce" role="alert">${V.rerr}</p>` : ""}${V.rmode === "reject" ? `<p class="fnote2">${esc(pr.owner.split(" ")[0])} la verá en «Rechazados» con tu motivo; no se borra.</p>` : ""}</div><div class="rvb"><button class="btn btn-p full" ${V.rmode === "changes" ? "data-askchg" : "data-reject"}>${V.rmode === "changes" ? "Enviar cambios" : "Rechazar propuesta"}</button><button class="btn btn-s full" data-rcancel>Cancelar</button></div>`
      : `${newProgHTML(pr)}<div class="rvb"><button class="btn btn-p full" data-approve>Aprobar</button>${pr.parent && !pr.full ? "" : `<button class="btn btn-s full" data-askchg>Sugerir cambios</button>`}<button class="btn btn-dt full" data-reject>Rechazar</button></div>`;
  else if (pr.status === "active" && rv && rv.decision === "approve") act = `<p class="fnote ok">${I("check-circle")}<span>Aprobada por Dirección${when(rv.ts) ? " el " + when(rv.ts) : ""}.</span></p>`;
  else if (pr.status === "rejected" && rv) act = `<p class="fnote">${I("times-circle")}<span>Rechazada por Dirección${when(rv.ts) ? " el " + when(rv.ts) : ""}.</span></p>`;
  return `<div class="side pnl">${BK ? `<div class="fig"><small>Diferencia de coste</small><b>${K.monthly - BK.monthly > 0 ? "+ " : K.monthly - BK.monthly < 0 ? "− " : ""}${eur(Math.abs(K.monthly - BK.monthly))}<em>/mes</em></b><span>Pasa de ${eur(BK.monthly)} a ${eur(K.monthly)} al mes</span></div>` : `<div class="fig"><small>Coste del proyecto${itip("Todo lo que usa el proyecto: personas a su coste y asientos de licencia, también los que la empresa ya paga.")}</small><b>${eur(proj)}${og ? "<em>/mes</em>" : ""}</b><span>${og ? "servicio continuo" : `${eur(K.monthly)}/mes × ${String(K.M).replace(".", ",")} meses`}</span></div>`}
  <div class="fig fnew"><small>Inversión nueva${itip("Dinero nuevo que hay que aprobar: contrataciones y asientos de licencia que hay que comprar. Lo que ya pagáis no cuenta aquí.")}</small><b>${eur(inv)}${og ? "<em>/mes</em>" : ""}</b><span>${refNew > 0 ? `${eur(lo)} – ${eur(hi)} · rango orientativo ±10\u00a0%` : "sin contrataciones nuevas"}</span></div>
  <div class="frow"><span>Ya lo pagáis<small>Personas de la empresa y licencias libres</small></span><b>${eur(paid)}${per}</b></div>
  ${budget}${pr.parent && !ed ? "" : just}${act}</div>`;
}
function pageProject() {
  const pr = P(),
    K = cost(pr),
    ed = canEdit(pr),
    rv = pr.review;
  const par = pr.parent && D.projects.find((x) => x.id === pr.parent),
    kids = D.projects.filter((x) => x.parent === pr.id && !x.archived),
    mine = !isBoard() && pr.owner === meName() && !pr.archived,
    closed = pr.status === "rejected" || pr.status === "cancelled" || stOf(pr) === "done";
  const sub = [par ? (pr.full ? "Cambios propuestos" : `Ampliación de «${esc(par.name)}»`) : "", plazo(pr), startLabel(pr), isBoard() ? (D.managers.length > 1 ? `${esc(pr.owner)} · ${esc(teamName(pr.owner))}` : esc(pr.owner)) : "", multi() && isBoard() ? esc(ENT(pr.ent).name) : ""].filter(Boolean).join(" · ");
  const narrow = matchMedia("(max-width:900px)").matches;
  /* mobile: a bar fixed at the bottom with the money and the next step, so «Enviar» or «Aprobar» is never far away */
  const mbAct = ed ? (pr.status === "changes" ? "Revisar y reenviar" : "Revisar y enviar") : isBoard() && pr.status === "pending" ? "Revisar y decidir" : "",
    mbar = narrow && mbAct && pr.roles.length ? `<div class="mbar" role="region" aria-label="Resumen"><span class="mbv">${pr.full && baseOf(pr) ? (() => { const dm = K.monthly - cost(baseOf(pr)).monthly; return `<b>${dm > 0 ? "+ " : dm < 0 ? "− " : ""}${eur(Math.abs(dm))}/mes</b><small>diferencia de coste</small>`; })() : `<b>${eur(K.og ? K.inv : K.invTotal)}</b><small>inversión nueva</small>`}</span><button class="btn btn-p" data-mbar>${mbAct}</button></div>` : "";
  return `<div class="phw"><button class="backl" data-nav="projects">${I("angle-left")}Proyectos</button><div class="ph"><div><h1 style="margin-top:4px">${esc(pr.name)}</h1><p class="sub" style="margin:0">${cap1(sub)}</p>${pr.goal ? `<p class="pgoal">${esc(pr.goal)}</p>` : ""}</div><div class="pact">${mine && !pr.parent && ["active", "approved"].includes(stOf(pr)) ? `<button class="btn btn-s sm" data-extend="${pr.id}">${propOf(pr) ? "Ver cambios propuestos" : "Proponer cambios"}</button>` : ""}${mine && closed ? `<button class="btn btn-s sm" data-pdup="${pr.id}">Duplicar como nuevo proyecto</button>` : ""}${ed && !pr.parent ? `<button class="ib" data-edit aria-label="Editar proyecto" title="Editar proyecto">${I("pen")}</button>` : ""}${pmenu(pr, "pg")}</div></div></div>
 <div class="phm">${stPill(pr)}${par && !pr.full ? `<span class="phn">«${esc(par.name)}» sigue como estaba aprobado. Solo se decide lo que añades.</span>` : ""}</div>${(() => {
   const op = !pr.parent && propOf(pr);
   if (op) return `<div class="propban" role="status">${I("pen")}<span><b>${op.status === "draft" ? "Tienes cambios sin enviar" : op.status === "changes" ? "Dirección pide cambios en tu propuesta" : "Cambios pendientes de aprobar"}</b><small>Lo aprobado sigue en marcha hasta que Dirección decida.</small></span><button class="btn btn-s sm" data-extend="${pr.id}">Ver cambios</button></div>`;
   if (!pr.full) return "";
   const df = diffOf(pr),
     b = baseOf(pr),
     dm = cost(pr).monthly - cost(b).monthly;
   const prv = pr.prevRv && pr.status === "draft" ? `<section class="rvc rejected hasic" role="status"><i class="rvic" aria-hidden="true">${I("building")}</i><div class="rvx"><small class="rvl">Dirección rechazó tu petición anterior</small><p>${esc(pr.prevRv.comment)}</p></div></section>` : "";
   return prv + `<div class="propban" role="status">${I("pen")}<span><b>${pr.status === "draft" ? "Cambios sin enviar" : pr.status === "pending" ? "Cambios enviados a Dirección" : pr.status === "changes" ? "Dirección pide cambios" : "Cambios"}</b><small>${df.count ? `${df.count} cambio${df.count !== 1 ? "s" : ""} · ` : "Aún no has cambiado nada · "}lo aprobado sigue en marcha</small></span>${ed && pr.status === "draft" ? `<button class="lnk" data-pdiscard="${pr.id}">Descartar</button>` : ""}</div><div class="propdelta"><span>Diferencia de coste<small>Pasa de ${eur(cost(b).monthly)} a ${eur(cost(pr).monthly)} al mes</small></span><b class="${dm > 0 ? "up" : dm < 0 ? "down" : ""}">${dm > 0 ? "+ " : dm < 0 ? "− " : ""}${eur(Math.abs(dm))}<small>/mes</small></b></div>`;
 })()}
 <div class="cfg"><div class="cmain">
 ${(pr.status === "changes" || pr.status === "rejected") && rv && rv.comment ? (() => { const mn = (V.rvfold || []).includes(pr.id), xs = `${mine && !ed && pr.status === "changes" ? `<button class="btn btn-s sm" data-edit>Editar y reenviar</button>` : ""}${mine && pr.parent && pr.status === "rejected" ? `<button class="btn btn-s sm" data-renew="${pr.id}">Crear nueva petición</button>` : ""}${isBoard() && pr.status === "changes" ? `<p class="rvwait">Esperando a ${esc(pr.owner.split(" ")[0])}: lo edita y te lo reenvía. Te avisaremos.</p>` : ""}`; return `<section class="rvc ${pr.status} hasic rvone${mn ? " min" : ""}" data-rvid="${pr.id}" role="status"><button class="rvhd" data-rvfold="${pr.id}" aria-expanded="${!mn}" aria-label="${mn ? "Mostrar" : "Plegar"} el mensaje de Dirección"><i class="rvic" aria-hidden="true">${I("building")}</i><span class="rvtx"><span class="rvl">${pr.status === "changes" ? "Dirección pide cambios" : "Respuesta de Dirección"}</span><span class="rvq">«${esc(rv.comment)}»</span></span><span class="rvch" aria-hidden="true">${I("angle-down")}</span></button>${!mn && xs.trim() ? `<div class="rvb">${xs}</div>` : ""}</section>`; })() : ""}${pr.status === "cancelled" && pr.cancel ? `<section class="rvc rejected hasic rvcx" role="status"><i class="rvic" aria-hidden="true">${pr.cancel.by === "b" ? I("building") : esc(initials(pr.owner))}</i><div class="rvx"><small class="rvl">Cancelado por ${pr.cancel.by === "b" ? "Dirección" : esc(pr.owner.split(" ")[0])} · ${esc(fmtShort(new Date(pr.cancel.ts).toISOString().slice(0, 10)))}</small><p>${esc(pr.cancel.t)}</p><p class="rvwait">Las personas y los asientos que usaba quedan libres.</p></div></section>` : ""}${pr.reply && pr.status === "pending" ? (() => {
    const q = threadOf(pr).filter((x) => x.who === "b" && x.k === "changes" && x.t).pop(),
      fid = pr.id + ":r", mn = (V.rvfold || []).includes(fid);
    /* same component as Leadership's message: the header folds it; the avatar is the person who wrote it */
    return `<section class="rvc reply hasic rvone${mn ? " min" : ""}" data-rvid="${fid}" role="status"><button class="rvhd" data-rvfold="${fid}" aria-expanded="${!mn}" aria-label="${mn ? "Mostrar" : "Plegar"} la respuesta de ${esc(pr.owner.split(" ")[0])}"><i class="rvic rvav" aria-hidden="true">${esc(initials(pr.owner))}</i><span class="rvtx"><span class="rvl">Respuesta de ${esc(pr.owner.split(" ")[0])}</span><span class="rvq">«${esc(pr.reply)}»</span></span><span class="rvch" aria-hidden="true">${I("angle-down")}</span></button>${!mn && q ? `<div class="rvb"><p class="rvctx"><b>${isBoard() ? "Pediste" : "Dirección pidió"}:</b> «${esc(q.t)}»</p></div>` : ""}</section>`;
  })() : ""}${kids.length ? `<div class="card ampc"><div class="ch"><h2>Peticiones</h2><p class="note">Lo que has pedido después de aprobar el proyecto. Dirección decide cada petición por separado.</p></div>${kids.map((k) => `<button class="linkrow rl" data-openp="${k.id}"><span class="ampt"><b>${esc(k.name)}</b><small>${(() => { const c = cost(k), n = (k.roles || []).length; return `${n} puesto${n !== 1 ? "s" : ""} · ${eur(c.monthly)}/mes de inversión nueva`; })()}</small></span><span>${stPill(k)}</span></button>`).join("")}</div>` : ""}

 ${pr.archived ? `<div class="alert"><span>Este proyecto está archivado: no cuenta en los totales ni en la previsión.</span><button class="lnk" data-punarch="${pr.id}">Restaurar</button></div>` : ""}

 ${!closed && pr.roles.length && !K.lead && pr.roles.some((r) => r.ai > 0) ? `<div class="alert warn">${I("exclamation-triangle")}<span>Hace falta al menos una persona a jornada completa que lleve el proyecto y revise el trabajo de la IA.</span></div>` : ""}${K.missing.length ? `<div class="alert warn">${I("exclamation-triangle")}<span>Sin coste estimado: ${K.missing.join(", ")}. Indica una cifra en cada puesto para que el total sea completo.</span></div>` : ""}
 ${pr.full ? "" : mobSum(pr, K)}
 ${par && !pr.full ? `<div class="reqh"><h2>Lo que pides</h2><p>${pr.roles.length} persona${pr.roles.length !== 1 ? "s" : ""} más · ${eur(K.monthly)}/mes de inversión nueva</p></div>` : ""}${areaTeam(pr, K, ed)}
 ${narrow ? "" : assumeCard(pr, K)}
 
 </div><aside class="cside" aria-label="Resumen y decisión">${panelHTML(pr, K)}</aside></div>${narrow ? `<div class="asmtail">${assumeCard(pr, K)}</div>` : ""}${mbar}`;
}
/* demo controls: outside the product chrome, so nobody mistakes them for a feature */
function demoHTML() {
  if (!D.me) return "";
  /* every project lead of the demo company, so the answer to a project of Nora or Lucas can be followed from their side */
  const who = [
    ...(D.managers || []).map((m) => ["m:" + m.name, m.name, "Responsable"]),
    ["board", "James Carter", "Dirección"],
  ];
  if (!who.some((w) => w[0] === "m:" + D.me.name)) who.unshift(["m:" + D.me.name, D.me.name, D.me.role]);
  const cur = D.as === "board" ? who[who.length - 1] : who.find((w) => w[0] === "m:" + D.me.name) || who[0];
  return V.demo
    ? `<div class="demop" role="dialog" aria-label="Controles de la demo"><div class="demoh"><b>Controles de la demo</b><button class="demox" data-demo aria-label="Cerrar">${I("times")}</button></div><p>No forman parte de HUMAIN: sirven para enseñar el prototipo desde los dos lados. Prueba a enviar «Portal de clientes» como Emma y a decidir como James.</p><span class="demol">Ver como</span>${who
        .map(([k, n, r]) => `<button class="demoo" data-as="${k}" aria-pressed="${cur[0] === k}"><span><b>${esc(n)}</b><small>${esc(r)}</small></span>${cur[0] === k ? I("check") : ""}</button>`)
        .join("")}<button class="demor" data-demoreset>Reiniciar la demo</button></div>`
    : `<button class="demob" data-demo aria-label="Controles de la demo">${I("exchange")}<span>Demo · ${esc(cur[2])}</span></button>`;
}
