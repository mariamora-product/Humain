/* ===== With-AI vs without-AI comparison. Pure: builds two variants of the same project and prices them with cost(). =====
   Both start from the same team and the same estimated work. Each role keeps its share of the work; the only
   difference is how many people that share needs: without AI at 100 % productivity, with AI at (1 + gain).
   Gain by scenario: "zero" (no gain: AI only adds licences), "est" (evidence per area, AIUP.v), "high" (top of the range).
   Same deadline in both: the saving can only come from the AI gain, never from trimming a role below its share. */
const clone = (x) => JSON.parse(JSON.stringify(x));
const AIOK = (r) => F(r.id).cat in AIDESC;
const MINH = (id) => (id === "product-owner" || id === "project-manager" ? 60 : 40);
const rosterSig = (roles) => JSON.stringify(roles.map(({ people, ...r }) => r));
const CMPSC = [
  ["zero", "Sin mejora"],
  ["est", "Según estudios"],
  ["high", "Optimista"],
];
function cmpVariants(pr, sc = "est") {
  const W = pr.work || buildTeam(pr).work,
    M = pr.months || 12,
    base = pr.roles.length ? clone(pr.roles) : buildTeam(pr).roles,
    mk = (roles, ai) => ({
      ...pr,
      roles,
      work: W,
      qty: {},
      own: pr.own || [],
      shared: { ...pr.shared, ...(ai && !(pr.shared || {}).genai ? { genai: pick("genai") } : {}) },
    });
  /* hours of work per month each role is carrying now (its capacity, scaled so the team carries exactly W) */
  const capOf = (r) => {
    const up = upOf(r) / 100,
      fr = r.n ? r.ai / r.n : r.ai;
    return (r.n ? (r.n - r.ai) * HPM + r.ai * HPM * (1 + up) : r.hours * (1 + up * fr)) * (CF[F(r.id).arch] || 1);
  };
  const tot = base.reduce((a, r) => a + capOf(r), 0) * M,
    sh = tot ? W / tot : 1;
  const size = (r, gain, ai) => {
    const cf = CF[F(r.id).arch] || 1,
      x = (capOf(r) * sh) / (HPM * cf * (1 + gain / 100)),
      o = { ...clone(r), qty: {} };
    if (r.n >= 1 || x >= 0.9) {
      o.n = Math.max(1, Math.round(x));
      o.hours = 0;
    } else {
      o.n = 0;
      o.hours = Math.min(HPM, Math.max(MINH(r.id), Math.round((x * HPM) / 10) * 10));
    }
    o.ai = ai ? (o.n ? o.n : 1) : 0;
    o.up = ai ? (sc === "est" ? r.up : sc === "high" ? (AIUP[F(r.id).cat] || {}).hi || 0 : 0) : null;
    return o;
  };
  const gainOf = (r) => (sc === "zero" ? 0 : sc === "high" ? (AIUP[F(r.id).cat] || {}).hi || 0 : upOf(r));
  /* rounding can leave a variant short: add the cheapest step until it covers 95 % */
  const fit = (roles, ai) => {
    let k = cost(mk(roles, ai));
    for (let g = 0; g < 40 && k.cov != null && k.cov < 0.95; g++) {
      let best = null;
      roles.forEach((r, i) => {
        const c = r.n ? { ...r, n: r.n + 1, ai: r.ai ? r.ai + 1 : 0 } : r.hours < HPM ? { ...r, hours: Math.min(HPM, r.hours + 10) } : null;
        if (!c) return;
        const t = roles.map((x, j) => (j === i ? c : x)),
          kk = cost(mk(t, ai)),
          gain = (kk.cov - k.cov) / Math.max(1, kk.monthly - k.monthly);
        if (kk.cov > k.cov && (!best || gain > best.gain)) best = { t, kk, gain };
      });
      if (!best) break;
      roles = best.t;
      k = best.kk;
    }
    return roles;
  };
  const sinR = fit(base.map((r) => size(r, 0, false)), false),
    conR = fit(base.map((r) => (AIOK(r) ? size(r, gainOf(r), true) : size(r, 0, false))), true);
  const A = mk(sinR, false),
    B = mk(conR, true);
  return { sin: { pr: A, K: cost(A) }, con: { pr: B, K: cost(B) }, W, T: 0.95, sc };
}
/* the project's team is "customised" when it is neither the suggested team nor one of the two variants */
function teamCustomised(pr, V2) {
  if (!pr.roles.length) return false;
  const cur = rosterSig(pr.roles);
  return ![buildTeam(pr).roles, V2.sin.pr.roles, V2.con.pr.roles].some((r) => rosterSig(r) === cur);
}
function applyVariant(pr, which, sc) {
  const v = cmpVariants(pr, sc)[which === "ai" ? "con" : "sin"];
  pr.roles = clone(v.pr.roles);
  syncFill(pr);
  pr.shared = { ...v.pr.shared };
  pr.qty = {};
  pr.months = v.pr.months;
  if (pr.work == null) pr.work = v.W;
  return v;
}
const mFmt = (m) => String(Math.round(m * 10) / 10).replace(".", ",");
const dEur = (d) => (Math.abs(d) < 0.5 ? "Sin cambio" : (d > 0 ? "+" : "") + eur(d));
/* rows for the comparison: [label, sin value, con value, delta chip text, "good" | "bad" | "eq"] */
function cmpRows(pr, V2) {
  const a = V2.sin.K,
    b = V2.con.K,
    chip = (d, txt, lessIsGood = true) => [txt, Math.abs(d) < 0.5 ? "eq" : d < 0 === lessIsGood ? "good" : "bad"],
    rows = [];
  const dp = b.ppl - a.ppl,
    dm = V2.con.pr.months - V2.sin.pr.months,
    dmo = b.monthly - a.monthly,
    dt = b.total - a.total,
    dl = b.toolsM + b.api - (a.toolsM + a.api);
  rows.push([
    "Personas",
    `${a.ppl}`,
    `${b.ppl}`,
    ...chip(dp, dp === 0 ? "" : `${dp > 0 ? "+" : "−"}${Math.abs(dp)} persona${Math.abs(dp) > 1 ? "s" : ""}`),
  ]);
  rows.push([
    "Plazo",
    plazo(V2.sin.pr),
    plazo(V2.con.pr),
    ...chip(dm, dm === 0 ? "" : `${dm > 0 ? "+" : "−"}${mFmt(Math.abs(dm))} meses`),
  ]);
  rows.push(["Coste al mes", eur(a.monthly), eur(b.monthly), ...chip(dmo, dEur(dmo))]);
  rows.push([a.og ? "Coste de 12 meses" : "Coste total", eur(a.total), eur(b.total), ...chip(dt, dEur(dt))]);
  rows.push([
    "Licencias",
    eur(a.toolsM) + "/mes",
    eur(b.toolsM) + "/mes",
    ...chip(b.toolsM - a.toolsM, dEur(b.toolsM - a.toolsM) + (Math.abs(b.toolsM - a.toolsM) < 0.5 ? "" : "/mes")),
  ]);
  rows.push([
    "Uso de IA",
    "—",
    `${b.aiPpl} persona${b.aiPpl !== 1 ? "s" : ""} con IA${b.api ? " · API " + eur(b.api) + "/mes" : ""}`,
    "",
    "eq",
  ]);
  return rows;
}
const teamList = (roles) =>
  `<ul class="cteam">${roles.map((r) => `<li><b>${r.n ? r.n + " ×" : r.hours + " h/mes ·"}</b> ${dname(r)}${r.ai ? ` <em>IA</em>` : ""}</li>`).join("")}</ul>`;
function cmpModalHTML(pr) {
  const sc = pr.cmpSc || "est",
    V2 = cmpVariants(pr, sc),
    rows = cmpRows(pr, V2),
    d = V.draft || {},
    saveTot = V2.sin.K.total - V2.con.K.total,
    dppl = V2.sin.K.ppl - V2.con.K.ppl,
    col = (k, v, ai) => {
      const idx = ai ? 2 : 1;
      return `<section class="ccol ${ai ? "ai" : ""}" aria-labelledby="cc-${k}"><h3 id="cc-${k}">${ai ? "Con IA" : "Sin IA"}</h3><small class="csub">${ai ? "IA donde aplica" : "El mismo trabajo, sin IA"}</small>${rows
        .map((r) => `<div class="cr"><span>${r[0]}</span><b>${r[idx]}</b>${ai && r[3] ? `<em class="dd ${r[4]}">${r[3]}</em>` : ""}</div>`)
        .join(
          "",
        )}<div class="cr cteamr"><span>Equipo</span>${teamList(v.pr.roles)}</div><button class="btn ${ai ? "btn-p" : "btn-s"} cuse" data-cmpuse="${k}">Usar equipo</button></section>`;
    };
  const head =
    saveTot > 0.5
      ? `Con IA ahorras ${eur(saveTot)}${dppl > 0 ? ` y ${dppl} persona${dppl > 1 ? "s" : ""}` : ""}.`
      : saveTot < -0.5
        ? V2.con.K.cov > V2.sin.K.cov * 1.03
          ? `Con IA, el mismo equipo tiene un ${Math.round((V2.con.K.cov / V2.sin.K.cov - 1) * 100)} % más de capacidad por ${eur(V2.con.K.monthly - V2.sin.K.monthly)} más al mes: es demasiado pequeño para necesitar menos personas.`
          : `Con este supuesto, la IA cuesta ${eur(-saveTot)} más de lo que ahorra.`
        : "Con este supuesto, la IA no cambia el coste de este proyecto.";
  return `<div class="scrim" data-close></div><div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="shead"><div><h2 id="mt">Comparar con IA y sin IA</h2><p class="shsub">${esc(pr.name)} · mismo trabajo estimado (${numFmt(V2.W)} horas)</p></div><button class="ib x" data-close aria-label="Cerrar">${I("times")}</button></div>
  <div class="cassume"><div><b>Mejora con IA</b><small>${sc === "zero" ? "La IA no acelera a nadie: solo suma sus licencias." : sc === "high" ? "El valor más alto de los estudios para cada área. Úsalo como techo, no como previsión." : "Un valor por área a partir de estudios controlados: desarrollo +10 %, contenido +30 %, producto +20 %; el resto, estimación."}</small></div><span class="seg" role="radiogroup" aria-label="Mejora con IA">${CMPSC.map(([k, t]) => `<button role="radio" aria-checked="${sc === k}" data-cmpup="${k}">${t}</button>`).join("")}</span></div>
  <p class="chead ${saveTot > 0.5 ? "good" : ""}" role="status">${head}</p>
  <div class="cmp">${col("noai", V2.sin, false)}${col("ai", V2.con, true)}</div>
  ${d.confirm ? `<div class="alert warn cconf" role="alertdialog" aria-label="Confirmar cambio de equipo">${I("exclamation-triangle")}<span><b>Vas a sustituir el equipo actual de «${esc(pr.name)}».</b> Se perderán los cambios que hayas hecho en puestos, herramientas y asientos. ${pr.status === "active" ? "El proyecto está en marcha: tendrás que guardar los cambios." : ""}</span><span class="cconfb"><button class="btn btn-s" data-cmpno>Cancelar</button><button class="btn btn-p" data-cmpyes>Usar ${d.confirm === "ai" ? "con IA" : "sin IA"}</button></span></div>` : ""}
</div>`;
}

