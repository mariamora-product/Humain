/* ===== Move someone who is already on a project to another one, in one step ===== */
const movableFrom = (pid) => D.projects.filter((q) => q.owner === meName() && !q.archived && !q.full && (isLive(q) || ["draft", "changes", "approved"].includes(q.status)) && q.roles.some((r) => (r.fill || []).some((f) => f && f.pid === pid)));
function moveSlots(x, skip) {
  return D.projects
    .filter((q) => q.owner === meName() && !q.archived && !q.full && !skip.includes(q.id) && (q.status === "draft" || q.status === "changes" || isLive(q)))
    .flatMap((q) => q.roles.flatMap((r, ri) => Array.from({ length: seatsOf(r) }, (_, i) => [r, i]).filter(([r2, i]) => F(r2.id).cat === F(x.fid).cat && (isLive(q) ? r2.fill?.[i] && r2.fill[i].src === "new" : !r2.fill?.[i] || (r2.fill[i].src !== "mine" && r2.fill[i].src !== "shared"))).map(([r2, i]) => ({ v: q.id + "|" + ri + "|" + i, l: `${q.name} · ${F(r2.id).t}${isLive(q) ? " · por contratar" : ""}${x.fid === r2.id ? " (su puesto)" : ""}`, p: q, live: isLive(q) }))));
}
/* a running project changes through its proposal (the open one, or a new one); a draft changes directly */
const editable = (q) => {
  if (!isLive(q) && q.status !== "approved") return q;
  let c = propOf(q);
  if (c && c.status !== "draft" && c.status !== "changes") return null;
  if (!c) { c = proposeOn(q); D.projects.unshift(c); }
  return c;
};
function doMove(d) {
  const x = PERSON(d.sel), from = movableFrom(x.id), [prid, ri, si] = d.slot.split("|"), dest = D.projects.find((q) => q.id === prid);
  const touched = [];
  from.forEach((q) => {
    const e = editable(q);
    if (!e) return;
    e.roles = e.roles.flatMap((r) => {
      const k = (r.fill || []).findIndex((f) => f && f.pid === x.id);
      if (k < 0) return [r];
      if (d.keep === "drop") {
        if ((r.fill || []).length <= 1 && (r.n || 1) <= 1) return [];
        r.fill.splice(k, 1);
        if (r.n > 1) r.n -= 1;
        return [r];
      }
      r.fill[k] = { src: "new" };
      return [r];
    });
    if (e !== q) touched.push(q.name);
  });
  if (dest) {
    const uid = dest.roles[Number(ri)] && dest.roles[Number(ri)].uid, e = editable(dest);
    const r = e && (e.roles.find((y) => uid && y.uid === uid) || e.roles[Number(ri)]);
    if (r) { r.fill = r.fill || []; r.fill[Number(si)] = { src: "mine", pid: x.id }; if (e !== dest) touched.push(dest.name); }
  }
  return touched.length ? `Cambios preparados en ${[...new Set(touched)].map((n) => "«" + n + "»").join(" y ")}: envíalos a Dirección` : `${x.name} ya está en «${dest ? dest.name : ""}»`;
}

