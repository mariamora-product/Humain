/* ===== People: the register of people. A manager sees her team; Leadership sees every team. ===== */
/* a team with nobody yet: its card with a way to add the first person */
const tact = (lead, t) => {
  const k = esc(lead + "||" + t),
    mine = (D.people || []).filter((x) => x.team === lead && areaOf(x) === t);
  return `<div class="pmw tact"><button class="ib" data-pmenu="${k}" aria-label="Acciones de ${esc(t)}" aria-haspopup="menu" aria-expanded="${V.menu === "pm:" + lead + "||" + t}">${I("ellipsis")}</button>${V.menu === "pm:" + lead + "||" + t ? `<div class="amenu pm" role="menu"><button role="menuitem" data-addperson="${esc(k)}">${I(EVIC.hire)}Añadir persona</button>${isBoard() ? "" : `${mine.some((x) => isOpen(x.id)) ? `<button role="menuitem" data-asgopen="${k}">${I(EVIC.assign)}Asignar a un proyecto</button>` : ""}${mine.some((x) => projectsOf(x.id).some((q) => q.owner === meName())) ? `<button role="menuitem" data-pxopen="${k}">${I(EVIC.unassign)}Sacar de un proyecto</button>` : ""}<button role="menuitem" class="danger" data-leaveopen="${k}">${I(EVIC.leave)}Dar de baja a alguien</button>`}</div>` : ""}</div>`;
};
/* a monthly cost is real (someone typed it), an estimate (market reference) or missing */
const costOf = (x) => {
  if (x.cost > 0) return { v: x.cost, k: "real" };
  const e = illus({ id: x.fid, grade: x.lvl }, ENT(x.ent).country);
  return e ? { v: e, k: "est" } : { v: 0, k: "none" };
};
/* Leadership starts hidden when the company chose «Solo totales»; project leads start visible. The eye flips it for the session, for anyone. */
V.costRoles = V.costRoles || {};
/* each eye reveals one row; the figure is still the average of the puesto, never one person's salary */
const costMasked = (x) => !V.costRoles[x.id];
/* when shown, the figure is the average of the cargo (same puesto) across everyone listed, never one person's own salary */
const cargoCost = (x, pool) => {
  const cs = (pool || []).filter((y) => y.fid === x.fid).map(costOf),
    n = cs.length || 1,
    v = Math.round(cs.reduce((a, c) => a + c.v, 0) / n);
  return { v, k: cs.length && cs.every((c) => c.k === "real") ? "real" : v ? "est" : "none" };
};
const teamCost = (xs) => {
  const cs = xs.map(costOf),
    sum = cs.reduce((a, c) => a + c.v, 0),
    real = cs.filter((c) => c.k === "real").length;
  return sum ? ` · ${real < xs.length ? "~" : ""}${eur(sum)}/mes${real < xs.length ? ` · ${real} de ${xs.length} con cifra real` : ""}` : "";
};
function pagePeople() {
  const board = isBoard(),
    ppl = visPeople(),
    head = `<div class="ph"><div><h1>Personas</h1></div>${D.me ? `<div class="phact">${isBoard() ? `<button class="btn btn-p sm" data-addperson>Añadir persona</button>` : `<button class="btn btn-p sm dsk" data-addperson>Añadir persona</button><div class="pmw"><button class="ib" data-pmenu="pplh" aria-label="Más acciones" aria-haspopup="menu" aria-expanded="${V.menu === "pm:pplh"}">${I("ellipsis")}</button>${V.menu === "pm:pplh" ? `<div class="amenu pm" role="menu"><button role="menuitem" class="mo" data-addperson>${I(EVIC.hire)}Añadir persona</button><button role="menuitem" class="danger" data-leaveopen="${esc(meName())}||">${I(EVIC.leave)}Dar de baja a alguien</button></div>` : ""}</div>`}</div>` : ""}</div>`;
  if (!ppl.length)
    return (
      head +
      `<div class="empty">${I("users-alt")}<b>Aún no hay nadie en ${board ? "la empresa" : "tu equipo"}</b><p>Añade a las personas de tu equipo: HUMAIN las propondrá primero cuando estén libres.</p>${D.me ? `<button class="btn btn-p sm" data-addperson>Añadir persona</button>` : ""}</div>`
    );
  const row = (x) => {
    const av = avail(x),
      /* Leadership does not see drafts: someone only in a draft reads as free for them */
      hb = heldBy(x.id).filter((q) => !board || q.status !== "draft"),
      ps = av.ps,
      /* «En proyecto» rather than «Ocupado/a»: it reads the same for everyone */
      inP = ps.length ? `<small class="avp">${ps.map((p) => esc(p.name)).join(" y ")}${av.n !== null ? " · " + av.label.toLowerCase() : ""}</small>` : "",
      mine = !board && ps.filter((q) => q.owner === meName()),
      /* person actions live in their own ⋯ menu, not as loose links in the row */
      pmo = V.menu === "pm:x" + x.id,
      pxm2 = !board && x.team === meName() && !x.leaving
        ? `<span class="pmw xpm"><button class="ib s" data-pmenu="x${esc(x.id)}" aria-label="Acciones de ${esc(x.name)}" aria-haspopup="menu" aria-expanded="${pmo}">${I("ellipsis")}</button>${pmo ? `<span class="amenu pm" role="menu">${isOpen(x.id) ? `<button role="menuitem" data-asgx="${esc(x.id)}">${I(EVIC.assign)}Asignar a un proyecto</button>` : ps.length ? `<button role="menuitem" data-movex="${esc(x.id)}">${I("exchange")}Mover a otro proyecto</button>` : ""}${mine && mine.length ? `<button role="menuitem" data-pxx="${esc(x.id)}">${I(EVIC.unassign)}Sacar de un proyecto</button>` : ""}<button role="menuitem" class="danger" data-leavex="${esc(x.id)}">${I(EVIC.leave)}Dar de baja</button></span>` : ""}</span>`
        : "",
      pxm = "",
      st = `<span class="avs">${x.leaving ? `<span class="pill leave">Se va el ${esc(fmtShort(x.leaving.date))}</span>` : ps.length ? `<span class="pill draft">En proyecto</span>` : hb.length ? `<span class="pill pend" title="Está en una propuesta que aún no ha empezado">Propuesta</span>` : `<span class="pill active">Libre</span>`}${inP || !hb.length ? inP : `<small class="avp">En ${hb.map((p) => "«" + esc(p.name) + "»").join(" y ")}, sin empezar</small>`}${pxm}</span>`,
      cc = cargoCost(x, ppl),
      cv = costMasked(x) ? "∗∗∗∗" : cc.k === "none" ? "—" : (cc.k === "est" ? "~" : "") + eur(cc.v);
    return `<div class="tr c4"><span class="xn xav"><span class="av sm" aria-hidden="true">${esc(initials(x.name))}</span><b>${esc(x.name)}</b></span><span class="sc xd">${esc(F(x.fid).t)}${lvlName(x) || (board && D.managers.length > 1) ? `<small>${[lvlName(x), board && D.managers.length > 1 ? esc(x.team) : ""].filter(Boolean).join(" · ")}</small>` : ""}</span><span class="xd">${st}</span><span class="cost ${cc.k}"><b${costMasked(x) ? ' class="mk"' : ""}>${cv}</b>${costMasked(x) ? "" : cc.k === "none" ? "<small>Sin dato</small>" : "<small>Media del cargo</small>"}<button class="ib s ceye" data-costeye="${esc(x.id)}" aria-label="${costMasked(x) ? "Mostrar" : "Ocultar"} el coste medio de ${esc(F(x.fid).t)}" title="${costMasked(x) ? "Mostrar" : "Ocultar"} el coste medio del puesto" aria-pressed="${!costMasked(x)}">${I(costMasked(x) ? "eye" : "eye-slash")}</button>${pxm2}</span><span class="xm"><span>${esc(F(x.fid).t)}${lvlName(x) ? " · " + lvlName(x) : ""}</span>${st}</span>${(() => { const ts = toolsOfPerson(x.id); return ts.length ? `<span class="xtools">${ts.map(toolChip).join("")}</span>` : ""; })()}</div>`;
  };
  const th = `<div class="tr th c4"><span>Nombre</span><span>Puesto y nivel</span><span>Estado</span><span class="cost">Coste al mes</span></div>`,
    tbl = (xs, title) =>
      `<div class="tbl pgrp ppl4">${title ? `<div class="pgh">${title}</div>` : ""}${th}${xs.map(row).join("")}</div>`;
  /* by area by default; the same people can also be read project by project */
  const pv = V.pview === "project" ? "project" : "area",
    viewSeg = `<div class="seg pz pvs" role="radiogroup" aria-label="Ver personas por"><button role="radio" data-pview="area" aria-checked="${pv === "area"}">Por área</button><button role="radio" data-pview="project" aria-checked="${pv === "project"}">Por proyecto</button></div>`,
    groups = (withTact) => {
      const sub = (xs, noCost, extra) => {
        const f = xs.filter((x) => isOpen(x.id)).length;
        return `<small>${xs.length} persona${xs.length !== 1 ? "s" : ""} · ${extra || (f ? `${f} libre${f !== 1 ? "s" : ""}` : "nadie libre")}${noCost ? "" : teamCost(xs)}</small>`;
      };
      if (pv === "project") {
        const ps = D.projects.filter((q) => !q.archived && (isLive(q) || ["draft", "changes", "pending", "approved"].includes(q.status))).sort((a, b) => Number(isLive(b)) - Number(isLive(a))),
          out = ps.map((q) => {
            const xs = ppl.filter((x) => q.roles.some((r) => (r.fill || []).some((f) => f.pid === x.id)));
            return xs.length ? tbl(xs, `<b>${esc(q.name)}</b>${sub(xs, true, isLive(q) ? "" : "propuesta sin aprobar")}`) : "";
          }),
          fr = ppl.filter((x) => isOpen(x.id));
        return out.join("") + (fr.length ? tbl(fr, `<b>Sin proyecto</b>${sub(fr, true)}`) : "");
      }
      /* teams the project lead (or Leadership) created: their own group, before the areas; people placed in one leave their area group */
      const own = [],
        inOwn = (x) => own.includes(x.unit);
      return (
        own
          .map((t) => {
            const xs = ppl.filter((x) => x.unit === t);
            return xs.length
              ? tbl(xs, `<b>${esc(t)}</b>${sub(xs)}`)
              : `<div class="card tempty"><div class="tehd"><span><b>${esc(t)}</b><small>Equipo nuevo · aún sin personas</small></span></div><div class="tebody"><p>Añade a alguien de la empresa a este equipo.</p><button class="btn btn-s sm" data-addperson="${esc(meName())}||${esc(t)}">${I("plus")}Añadir persona</button></div></div>`;
          })
          .join("") +
        AREAS.map((t) => {
          const xs = ppl.filter((x) => areaOf(x) === t && !inOwn(x)).sort((a, b) => Number(isOpen(b.id)) - Number(isOpen(a.id)));
          return xs.length ? tbl(xs, `<b>${esc(t)}</b>${sub(xs)}`) : "";
        }).join("")
      );
    };
  if (!board) {
    /* a readable summary instead of a bare count: how many, how many free, who frees up next */
    const fr = ppl.filter((x) => isOpen(x.id)).length,
      nx = ppl.map((x) => avail(x)).filter((a) => a.n > 0 && a.n !== null).sort((a, b) => a.n - b.n),
      soon = nx.length ? nx.filter((a) => a.n === nx[0].n).length : 0;
    const tcount = {};
    ppl.forEach((x) => toolsOfPerson(x.id).forEach((t) => (tcount[t] = (tcount[t] || 0) + 1)));
    const tsum = Object.entries(tcount).sort((a, b) => toolSort(a[0], b[0])),
      tt = andList([...new Set(D.projects.filter((q) => q.owner === meName() && isLive(q) && !q.full).flatMap(teamTools))]),
      toolsLine = tsum.length || tt ? `<div class="tusage"><small>Programas de tu equipo</small><div>${tsum.map(([t, n]) => toolChip(t).replace("</span>", n > 1 ? ` <b>×${n}</b></span>` : "</span>")).join("")}</div></div>` : "";
    const sum = `<div class="sech tsum"><h2>Tu equipo</h2><p><b>${ppl.length} personas</b><span>${fr ? `${fr} libre${fr > 1 ? "s" : ""}` : "Nadie libre"}</span>${soon ? `<span>${soon} se libera${soon > 1 ? "n" : ""} en ${monthIn(nx[0].n)}</span>` : ""}</p></div>`;
    /* Personas is about people; the team's programs as a whole live in Software e IA (each person still shows theirs) */
    return `${head}${sum}${toolReqHTML("person")}${viewSeg}${groups(true)}`;
  }
  return `${head}${toolReqHTML("person")}${viewSeg}${groups(false)}`;
}
