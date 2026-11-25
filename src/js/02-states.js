/* ===== Who is looking, people and project states ===== */
const ST = {
  draft: ["Borrador", "draft"],
  pending: ["Pendiente", "pend"],
  changes: ["Cambios pedidos", "pend"],
  approved: ["Aprobado", "active"],
  active: ["En curso", "run"],
  done: ["Finalizado", "draft"],
  rejected: ["Rechazado", "rej"],
  cancelled: ["Cancelado", "draft"],
};
/* the stage shown to people: an approved project is «Aprobado» until its start month and «Finalizado» once its last month is over */
const stOf = (p) => {
  if (p.status !== "active") return p.status;
  if (p.start && mIdx(p.start) > 0) return "approved";
  const e = endsIn(p);
  return e !== null && e <= 0 ? "done" : "active";
};
const stPill = (p) => (p.archived ? `<span class="pill">Archivado</span>` : `<span class="pill ${ST[stOf(p)][1]}">${ST[stOf(p)][0]}</span>`);
const LVLS = ["junior", "mid", "senior"],
  LVLS_ALL = ["intern", "junior", "mid", "senior", "staff", "principal"],
  LV = { intern: -1, junior: 0, mid: 1, senior: 2, staff: 3, principal: 4 };
const isBoard = () => D.as === "board";
const meName = () => (D.me && D.me.name) || "Tú";
const canSee = (p) => (isBoard() ? p.status !== "draft" : p.owner === meName());
const PERSON = (id) => (D.people || []).find((x) => x.id === id);
const MGR = (name) => (D.managers || []).find((m) => m.name === name);
/* a project lead can lead several teams: m.teams (the first is m.team); each person belongs to one of them (x.unit) */
const teamsOf = (owner) => {
  const m = MGR(owner);
  return m ? m.teams || [m.team] : owner ? [owner] : [];
};
const teamName = (owner) => {
  const t = teamsOf(owner);
  return t.length > 2 ? `Equipo de ${String(owner).split(" ")[0]}` : t.join(" y ");
};
const unitOf = (x) => {
  if (!x) return "";
  const ts = teamsOf(x.team);
  if (x.unit && ts.includes(x.unit)) return x.unit;
  /* no team set yet: designers go to «Diseño» when their lead has one (the demo's two-team lead), everyone else to the lead's first team */
  return ts.includes("Diseño") && ["pdesign", "creative"].includes(F(x.fid).cat) ? "Diseño" : ts[0] || "";
};
/* people are listed by area (the kind of role), not by a team someone had to create: designers, product managers, engineers... */
const areaOf = (x) => {
  const c = F(x.fid).cat;
  return ["pdesign", "creative"].includes(c) ? "Diseño" : (CATS.find((k) => k[0] === c) || [0, "Otros"])[1];
};
const areaCats = (a) => (a === "Diseño" ? ["pdesign", "creative"] : CATS.filter((k) => k[1] === a).map((k) => k[0]));
const AREAS = [...new Set(CATS.map((k) => (["pdesign", "creative"].includes(k[0]) ? "Diseño" : k[1])))];
const isLive = (p) => p.status === "active" && !p.archived;
/* months from now until a live project ends (null = continuous) */
const endsIn = (p) => (p.months ? (p.start ? mIdx(p.start) : 0) + p.months : null);
/* a person is busy when a seat of a project in progress (approved) points at them.
   For another project (except), only what still runs when that one starts counts: someone who finishes before is free for it. */
const projectsOf = (pid, except) => {
  const ex = except && D.projects.find((p) => p.id === except),
    from = ex && ex.status !== "active" ? Math.max(0, ex.start ? mIdx(ex.start) : 1) : null;
  return D.projects.filter((p) => isLive(p) && p.id !== except && (from === null || endsIn(p) === null || endsIn(p) > from) && p.roles.some((r) => (r.fill || []).some((f) => f.pid === pid)));
};
const isFree = (pid, except) => !projectsOf(pid, except).length && !((PERSON(pid) || {}).leaving); /* someone who is leaving is not available for a new project */
/* someone placed in a project that is not running yet (draft, changes, pending, approved) is not free any more, but not busy either */
const heldBy = (pid, except) => D.projects.filter((p) => !isLive(p) && !p.archived && p.id !== except && ["draft", "changes", "pending", "approved"].includes(p.status) && p.roles.some((r) => (r.fill || []).some((f) => f.pid === pid && f.src === "mine")));
const isOpen = (pid, except) => isFree(pid, except) && !heldBy(pid, except).length;
const visPeople = () => (D.people || []).filter((x) => isBoard() || x.team === meName());
/* free people of OTHER teams with this exact role */
const otherFree = (pr, fid, except = pr.id) => (D.people || []).filter((x) => x.team !== pr.owner && x.fid === fid && isFree(x.id, except));
/* The fill rule, seat by seat: a free person of my team (same role; else same area and same or higher level) ->
   part-time seats may share someone of my team who is already busy -> a free profile of another team (Leadership picks who) -> a new hire. */
function autoSeat(pr, r, U) {
  if (pr.startFrom === "new") return { src: "new" };
  const f = F(r.id),
    g = LV[gradeOf(r)] ?? 0,
    mine = (D.people || []).filter((x) => x.team === pr.owner && !U.ids.has(x.id)),
    fr = mine.filter((x) => isFree(x.id, pr.id));
  let x = fr.find((y) => y.fid === r.id) || fr.find((y) => F(y.fid).cat === f.cat && LV[y.lvl] >= g);
  if (x) {
    U.ids.add(x.id);
    return { src: "mine", pid: x.id };
  }
  if (!r.n) {
    x = mine.find((y) => y.fid === r.id);
    if (x) {
      U.ids.add(x.id);
      return { src: "shared", pid: x.id, part: true };
    }
  }
  return { src: "new" };
}
/* keeps one fill entry per seat: existing choices stay, new seats follow the rule; reset = fill every seat again */
function syncFill(pr, reset) {
  const U = { ids: new Set(), oc: {} };
  pr.roles.forEach((r) => {
    r.fill = reset ? [] : arr(r.fill).slice(0, seatsOf(r));
    r.fill.forEach((f) => {
      if (f.pid) U.ids.add(f.pid);
      if (f.src === "other") U.oc[r.id] = (U.oc[r.id] || 0) + 1;
    });
  });
  pr.roles.forEach((r) => {
    while (r.fill.length < seatsOf(r)) r.fill.push(autoSeat(pr, r, U));
  });
}
