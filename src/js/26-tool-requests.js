/* ===== Programs a project lead asked for that the company does not have yet ===== */
const newProgsOf = (pr) => {
  const n = {};
  (pr.roles || []).forEach((r) => Object.values(r.tools || {}).forEach((t) => { const o = t && opt(t); if (o && o.req) n[t] = (n[t] || 0) + (r.n || 1); }));
  return Object.entries(n);
};
/* Leadership sees them before deciding and can set or correct the price: the project's cost follows */
function newProgHTML(pr) {
  const ns = newProgsOf(pr);
  if (!ns.length || !isBoard()) return "";
  return `<div class="npw" role="group" aria-label="Programas nuevos para la empresa"><b>${ns.length === 1 ? "Un programa nuevo" : ns.length + " programas nuevos"} para la empresa</b><small>No ${ns.length === 1 ? "está" : "están"} en vuestro catálogo. Si apruebas, ${ns.length === 1 ? "queda añadido" : "quedan añadidos"} en Software e IA como pendiente de comprar. El precio puedes ponerlo ahora o cuando lo compres.</small>${ns
    .map(([t, k]) => {
      const o = opt(t), ai = isAiTool(t);
      return `<div class="nprow"><span class="npn"><b>${esc(o.n)}</b><small>${k} asiento${k !== 1 ? "s" : ""}${o.p ? "" : " · sin precio, no suma al coste"}</small><button type="button" class="npai${ai ? " on" : ""}" data-npai="${esc(t)}" aria-pressed="${ai}">${ai ? `${I("check")}Con IA` : "Marcar como IA"}</button></span><label class="npp"><span class="sr">Precio por asiento de ${esc(o.n)} (opcional)</span><input class="hin" inputmode="decimal" data-nprice="${esc(t)}" value="${o.p ? String(o.p).replace(".", ",") : ""}" placeholder="—"/><em>€/mes</em></label></div>`;
    })
    .join("")}</div>`;
}
function adoptNewProgs(pr) {
  newProgsOf(pr).forEach(([t, k]) => {
    const o = opt(t);
    if (!o) return;
    o.req = false;
    o.note = "añadido al aprobar «" + pr.name + "»";
    const c = (D.custom || []).find((x) => x.id === t);
    if (c) Object.assign(c, { req: false, note: o.note, p: o.p });
    if (!D.licenses.some((l) => l.opt === t)) { const nl = { opt: t, scope: pr.ent || D.entities[0].id, seats: 0, other: 0, holders: [] }; nl.renew = defaultRenew(nl); D.licenses.push(nl); }
  });
}
document.addEventListener("change", (e) => {
  const t = e.target && e.target.dataset && e.target.dataset.nprice;
  if (!t || !isBoard()) return;
  const v = Number(String(e.target.value).replace(",", ".")) || 0, o = opt(t), c = (D.custom || []).find((x) => x.id === t);
  if (o) o.p = v;
  if (c) c.p = v;
  save();
  render();
});

