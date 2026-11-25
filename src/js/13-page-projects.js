function pageProjects() {
  const all = D.projects.filter((p) => inEnt(p) && canSee(p) && !(p.full && p.status === "draft") && !(p.parent && !p.full)),
    live = all.filter((p) => !p.archived),
    arch = all.filter((p) => p.archived),
    f = V.pf || "all",
    ps = f === "archived" ? arch : live.filter(PF[f] ? PF[f][0] : PF.all[0]),
    cnt = (k) => (k === "archived" ? arch : live.filter(PF[k][0])).length;
  return `<div class="ph"><div><div class="step ent-eb">${esc(isBoard() ? "Dirección" : teamName(meName()))}</div><h1>Proyectos</h1></div>${isBoard() ? "" : `<button class="btn btn-p sm" data-new>Nuevo proyecto</button>`}</div>${
    all.length
      ? `<div class="tabs pf" role="tablist" aria-label="Filtrar proyectos">${[...Object.keys(PF).filter((k) => (!PF[k][2] || cnt(k) || f === k) && !(k === "draft" && isBoard())).map((k) => [k, PF[k][1]]), ...(arch.length || f === "archived" ? [["archived", "Archivados"]] : [])]
          .map(([k, t]) => `<button class="tab" role="tab" data-pfilter="${k}" aria-selected="${f === k}">${t}<span class="tcn">${cnt(k)}</span></button>`)
          .join("")}</div>`
      : ""
  }${ps.length ? `<div class="cards">${ps.map(projCard).join("")}</div>` : all.length ? emptyTab(f) : `<div class="empty">${I("layer-group")}<b>Aún no tienes proyectos</b><p>Crea uno y HUMAIN propondrá las personas, el software y la IA que necesita.</p>${isBoard() ? "" : `<button class="btn btn-p sm" data-new>Nuevo proyecto</button>`}</div>`}`;
}
