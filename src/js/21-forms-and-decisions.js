/* Leadership approves: the project is in progress; another team's profiles become the person Leadership chose (or the first
   free one); new hires stay «En contratación». Tools no contract covers yet get a 0-seat licence, so the gap shows in Software e IA. */
/* Leadership decides a request from its row or its detail, never leaving the page */
function boardDecide(id, a, cm) {
  if (!isBoard()) return;
  const r = (D.toolReqs || []).find((x) => x.id === id),
    pr = !r && D.projects.find((x) => x.id === id && x.parent && x.status === "pending"),
    snap = JSON.stringify({ projects: D.projects, toolReqs: D.toolReqs || [], people: D.people, licenses: D.licenses, notes: D.notes }),
    undoable = () => {
      V.undo = { decision: true, snap };
      V.toastAct = "Deshacer";
    };
  if (pr) {
    pushThread(pr, { who: "b", k: a === "ok" ? "approve" : "reject", t: cm, ts: Date.now() });
    pr.review = { by: "Dirección", ts: Date.now(), decision: a === "ok" ? "approve" : "reject", comment: cm };
    if (a === "ok") approveProject(pr);
    else pr.status = "rejected";
    D.notes.unshift({ ic: a === "ok" ? "check-circle" : "times-circle", k: "team", to: pr.owner, t: a === "ok" ? `Dirección ha aprobado «${pr.name}»` : `Dirección ha rechazado «${pr.name}»`, s: cm, p: pr.id, ts: Date.now(), r: 0 });
    save();
    V.toast = a === "ok" ? "Petición aprobada" : "Petición rechazada";
    undoable();
    render();
    return;
  }
  if (!r || r.status !== "pending") return;
  r.status = a === "ok" ? "approved" : "rejected";
  if (a !== "ok") r.comment = cm;
  D.notes.unshift({ ic: a === "ok" ? "check-circle" : "times-circle", k: "lic", to: r.by, t: `${reqName(r)}: petición ${a === "ok" ? "aprobada" : "rechazada"}`, s: a === "ok" ? "Dirección la contratará" : cm, p: "", ts: Date.now(), r: 0 });
  save();
  if (a === "ok" && r.kind === "person") {
    D.people.push({ id: "u" + Date.now(), name: "Por contratar · " + ((F(r.fid) || {}).t || "persona"), fid: r.fid, lvl: "mid", team: r.by, ent: (MGR(r.by) || {}).ent || D.entities[0].id });
    save();
    V.toast = "Aprobada: entra libre en el equipo";
    undoable();
  } else if (a === "ok" && !D.licenses.some((l) => l.opt === r.opt)) {
    V.draft = { opt: r.opt, scope: D.ent === "all" ? "group" : D.ent, seats: 1, other: 0 };
    V.modal = "lic";
  } else {
    V.toast = a === "ok" ? "Petición aprobada" : "Petición rechazada";
    undoable();
  }
  render();
}
function approveProject(pr) {
  adoptNewProgs(pr);
  const taken = new Set();
  pr.roles.forEach((r) =>
    (r.fill || []).forEach((f) => {
      if (f.pid) taken.add(f.pid);
    }),
  );
  pr.roles.forEach((r) => {
    r.fill = (r.fill || []).map((f) => {
      if (f.src === "other") {
        if (f.pid && isFree(f.pid, pr.id)) return f;
        const x = otherFree(pr, r.id).find((y) => !taken.has(y.id));
        if (x) {
          taken.add(x.id);
          return { src: "other", pid: x.id };
        }
        return { src: "new", hiring: true };
      }
      return f.src === "new" ? { src: "new", hiring: true } : f;
    });
  });
  pr.status = "active";
  if (!pr.start || mIdx(pr.start) < 0) pr.start = monthKey();
  const base = baseOf(pr);
  if (base) {
    base.roles = clone(pr.roles);
    base.shared = clone(pr.shared || {});
    base.qty = clone(pr.qty || {});
    pr.status = "approved";
    pr.merged = true;
    pr.archived = true;
  }
  cost(pr).tools.forEach((t) => {
    if (t.buy > 0 && !t.plan && opt(t.id).p > 0 && !D.licenses.some((l) => l.opt === t.id && inScope(l, pr))) {
      const nl = { opt: t.id, scope: pr.ent, seats: 0, other: 0 };
      nl.renew = defaultRenew(nl);
      D.licenses.push(nl);
    }
  });
}
const go = (v, id) => {
  V.toast = null;
  V.toastAct = null;
  V.view = v;
  if (id) V.id = id;
  V.open = null;
  V.nav = false;
  V.menu = false;
  render();
  scrollTo(0, 0);
};
function useVariant(pr, which) {
  applyVariant(pr, which, pr.cmpSc || "est");
  save();
  V.modal = null;
  V.draft = null;
  V.toast = which === "ai" ? "Equipo con IA aplicado al proyecto" : "Equipo sin IA aplicado al proyecto";
  render();
}
/* free text in the proposal panel: stored as typed, no re-render */
document.addEventListener("input", (e) => {
  if (e.target.matches && e.target.matches("[data-trq]")) {
    const q = e.target.value.trim().toLowerCase();
    e.target.closest(".field").querySelectorAll(".trwr").forEach((b) => (b.hidden = !!q && !b.textContent.toLowerCase().includes(q)));
    return;
  }
  const t = e.target;
  if (t.dataset && t.dataset.justif !== undefined && P()) {
    P().justif = t.value.slice(0, 2000);
    if (V.jerr && t.value.trim()) {
      V.jerr = false;
      t.removeAttribute("aria-invalid");
      document.getElementById("pje")?.remove();
    }
    save();
  } else if (t.dataset && t.dataset.rcomment !== undefined) V.rcomment = t.value.slice(0, 1000);
  else if (t.dataset && t.dataset.ladm !== undefined && V.ldraft) V.ldraft.admin = t.value.slice(0, 300);
  else if (t.dataset && t.dataset.lren !== undefined && V.ldraft) V.ldraft.renew = t.value;
  else if (t.dataset && t.dataset.crange !== undefined) {
    /* dragging: the field and the label follow without re-rendering; the figure is saved on release */
    const v = Number(t.value),
      ref = Number(t.dataset.ref),
      line = t.closest(".line"),
      pos = rbPos(v, ref),
      f = line && line.querySelector("[data-crate]"),
      band = t.closest(".rband");
    if (f) f.value = numFmt(v);
    if (band) band.className = "rband " + pos;
    const so = line && line.querySelector(".rbo");
    if (so) so.textContent = rbLab(pos);
    t.setAttribute("aria-valuetext", `${eur(v)} al mes${rbLab(pos) ? ", " + rbLab(pos).toLowerCase() : ""}`);
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.leadchk !== undefined) {
    const r = P().roles[t.dataset.leadchk];
    r.lead = t.checked;
    if (r.lead && r.grade === "junior") r.grade = "mid";
    save();
    render();
    return;
  }
  if (t.dataset.ongoing !== undefined) {
    const d = V.draft;
    if (t.checked) {
      d.prevMonths = d.months || d.prevMonths || REFM[d.size || "m"] || 6;
      d.months = 0;
      d.custom = false;
      V.calOpen = false;
    } else d.months = d.prevMonths || REFM[d.size || "m"] || 6;
    d.mTouched = true;
    render();
    return;
  }
  if (t.dataset.work !== undefined) {
    const v = Number(t.value.replace(/\D/g, ""));
    if (v > 0) P().work = v;
    save();
    render();
    return;
  }
  if ((t.dataset.crange !== undefined || t.dataset.crate !== undefined) && isBoard()) {
    /* saved on release (slider) or on leaving the field; a toast says what changed and how far it reaches */
    const k = t.dataset.crange !== undefined ? t.dataset.crange : t.dataset.crate,
      v = t.dataset.crange !== undefined ? Number(t.value) : Number(t.value.replace(/\D/g, "")),
      row = rateRows().find(([kk]) => kk === k),
      nm = row ? F(row[1].id).t + (row[1].grade ? " · " + GR[row[1].grade][0] : "") : "Tarifa",
      n = row ? row[1].n.size : 0;
    if (v) D.rates[k] = v;
    else delete D.rates[k];
    save();
    V.toast = `${nm}: ${v ? eur(v) + "/mes" : "vuelve a la referencia de mercado"}. Guardado y aplicado a ${n} proyecto${n !== 1 ? "s" : ""}.`;
    render();
    return;
  }
  if (t.dataset.rate !== undefined) {
    const r = P().roles[t.dataset.rate],
      v = Number(t.value.replace(/\D/g, ""));
    if (v) r.rate = v;
    else delete r.rate;
    save();
    render();
    return;
  }
  if (t.dataset.crname) {
    const c = D.croles.find((x) => x.id === t.dataset.crname);
    if (c && t.value.trim()) {
      c.t = t.value.trim();
      FAM[c.id].t = c.t;
      save();
      render();
    }
    return;
  }
  if (t.id === "lgf" && t.files[0]) {
    const f = t.files[0];
    if (f.size > 400000) {
      V.toast = "El logo debe pesar menos de 400 KB";
      render();
      return;
    }
    const rd = new FileReader();
    rd.onload = () => {
      D.logo = rd.result;
      save();
      V.toast = "Logo actualizado";
      render();
    };
    rd.readAsDataURL(f);
    return;
  }
  if (t.dataset.hin) {
    const r = P().roles[t.dataset.hin];
    r.hours = Math.max(1, Math.min(HPM, Number(t.value.replace(/\D/g, "")) || r.hours));
    save();
    render();
    return;
  }
  if (t.dataset.ownp) {
    const pr = P(),
      id = t.dataset.ownp;
    pr.own = pr.own.includes(id) ? pr.own.filter((x) => x !== id) : [...pr.own, id];
    save();
    render();
  }
});
