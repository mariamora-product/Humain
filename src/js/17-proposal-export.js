/* ===== Printable proposal ===== */
function pageExport() {
  const pr = P(),
    K = cost(pr),
    Mx = K.og ? 1 : K.M,
    per = K.og ? "/mes" : "",
    today = new Date().toLocaleDateString(LOC(), { day: "numeric", month: "long", year: "numeric" }),
    tools = K.tools.filter((t) => t.q > 0),
    SRC = { mine: "su equipo", shared: "compartida", other: "otro equipo", new: "nueva" };
  const lvl = (r) => {
    const f = F(r.id);
    return gradeOf(r) ? GR[gradeOf(r)][0] : f.arch === "ic" || f.arch === "delivery" ? "—" : ARCH_ES[f.arch];
  };
  const origin = (r) => {
    const c = {};
    (r.fill || []).forEach((f) => (c[f.src] = (c[f.src] || 0) + 1));
    return Object.entries(c)
      .map(([k, n]) => `${n} ${SRC[k]}${n > 1 && k !== "shared" ? (k === "new" ? "s" : "") : ""}`)
      .join(" · ");
  };
  return `<div class="xbar noprint"><button class="backl" data-expback>${I("angle-left")}Volver al proyecto</button><button class="btn btn-p sm" data-doprint>Descargar PDF</button></div>
  <article class="paper xdoc" aria-label="Propuesta de ${esc(pr.name)}">
  <div class="xdh"><span class="xbrand xorg">${D.logo ? `<img src="${esc(D.logo === "brand/src-isotipo.svg" ? "brand/src-isotipo-print.svg" : D.logo)}" alt="" class="xolg"/>` : `<span class="xoin" aria-hidden="true">${esc(initials(D.org))}</span>`}<span class="xon"><b>${esc(D.org)}</b>${ENT(pr.ent) && ENT(pr.ent).name !== D.org ? `<small>${esc(ENT(pr.ent).name)}</small>` : ""}</span></span><div class="xdt"><b>Propuesta de equipo y coste</b><dl><dt>Nº</dt><dd>${docNo(pr)}</dd><dt>Fecha</dt><dd>${today}</dd><dt>Estado</dt><dd>${docSt(pr)}</dd></dl></div></div>
  <h1>${esc(pr.name)}</h1>
  <div class="xparties"><div><small>Empresa</small><b>${esc(ENT(pr.ent).name || "—")}</b><span>${esc(ENT(pr.ent).country || "")}</span></div><div><small>Preparada por</small><b>${esc(pr.owner)}</b><span>Responsable · ${esc(teamName(pr.owner))}</span></div><div><small>Para</small><b>Dirección</b><span>Aprobación del equipo y el coste</span></div></div>
  <table class="xmeta"><tbody><tr><th>Tipo de proyecto</th><td>${esc(TYPES[pr.type][1])}</td><th>Plazo</th><td>${plazo(pr)}</td></tr><tr><th>Inicio</th><td>${pr.start ? cap1(startLabel(pr)) : "Por definir"}</td><th>Puestos</th><td>${K.ppl}</td></tr>${pr.goal ? `<tr><th>Objetivo</th><td colspan="3">${esc(pr.goal)}</td></tr>` : ""}</tbody></table>
  ${pr.justif ? `<h2>Por qué se necesita</h2><p class="xn" style="font-size:14px;color:inherit">${esc(pr.justif)}</p>` : ""}
  <h2>Personas</h2>${
    pr.roles.length
      ? `<div class="xtw"><table class="xt xteam"><thead><tr><th>Puesto</th><th>Nivel</th><th>Dedicación</th><th>Quién</th><th class="r">Coste al mes</th></tr></thead><tbody>${pr.roles
          .map((r) => {
            const c = roleSum(r, pr);
            return `<tr><td>${dname(r)}</td><td>${lvl(r)}</td><td>${r.n ? `${r.n} × jornada completa` : `${r.hours} h/mes`}</td><td>${origin(r)}</td><td class="r">${c.nodata ? "Sin coste" : eur(c.c)}<small>${esc(provText(r, pr))}</small></td></tr>`;
          })
          .join("")}<tr class="tot"><td>Personas</td><td></td><td></td><td></td><td class="r">${eur(K.people)}</td></tr></tbody></table></div>`
      : `<p class="xn">Este proyecto aún no tiene equipo.</p>`
  }
  <h2>Software e IA</h2>${
    tools.length
      ? `<div class="xtw"><table class="xt"><thead><tr><th>Herramienta</th><th>Asientos</th><th>Ya los tenéis</th><th>Nuevos</th><th class="r">Coste al mes</th></tr></thead><tbody>${tools
          .map(
            (t) =>
              `<tr><td>${esc(t.n)}${isAiTool(t.id) ? " · IA" : ""}</td><td>${opt(t.id).once ? "Compra puntual" : t.plan ? "Tarifa plana" : t.q}</td><td>${t.own ? "Propia" : t.plan ? (t.buy ? "No" : "Sí") : t.free}</td><td>${t.own ? "—" : t.plan ? (t.buy ? "Sí" : "—") : t.buy}</td><td class="r">${eur(t.m + t.saved)}</td></tr>`,
          )
          .join("")}<tr class="tot"><td colspan="4">Software e IA</td><td class="r">${eur(K.toolsM + K.saved)}</td></tr></tbody></table></div>`
      : `<p class="xn">Este equipo no necesita licencias.</p>`
  }
  <div class="xtotw"><table class="xtot"><tbody><tr><td>Personas</td><td class="r">${eur(K.people)}/mes</td></tr><tr><td>Software e IA</td><td class="r">${eur(K.toolsM + K.saved)}/mes</td></tr>${K.api ? `<tr><td>Uso de agentes (API)</td><td class="r">${eur(K.api)}/mes</td></tr>` : ""}${K.fee ? `<tr><td>Gestión HUMAIN</td><td class="r">${eur(K.fee)}/mes</td></tr>` : ""}<tr class="sub"><td>Total al mes</td><td class="r">${eur(K.monthly)}</td></tr>${K.og ? "" : `<tr><td>Duración</td><td class="r">× ${Mx} ${Mx === 1 ? "mes" : "meses"}</td></tr>`}<tr class="grand"><td>Coste del proyecto</td><td class="r">${eur(K.monthly * Mx)}${per}</td></tr><tr class="split"><td>De ello, inversión nueva</td><td class="r">${eur(K.inv * Mx)}${per}</td></tr><tr class="split"><td>De ello, ya lo pagáis</td><td class="r">${eur(K.paid * Mx)}${per}</td></tr></tbody></table></div>
  ${(() => {
    const rv = pr.review;
    if (rv && rv.decision === "approve" && rv.ts > 9e11) return `<div class="xsign ok"><b>Aprobada por Dirección</b><span>el ${new Date(rv.ts).toLocaleDateString(LOC(), { day: "numeric", month: "long", year: "numeric" })}${rv.comment ? ` · «${esc(rv.comment)}»` : ""}</span></div>`;
    return `<div class="xsigns"><div><small>Responsable</small><b>${esc(pr.owner)}</b><i></i><span>Firma y fecha</span></div><div><small>Dirección</small><b>&nbsp;</b><i></i><span>Firma y fecha</span></div></div>`;
  })()}
  <h2>Supuestos</h2><ul class="xa"><li>Las personas de la empresa cuentan con su coste real. Los perfiles de otro equipo y las contrataciones nuevas, con referencias de mercado (guías salariales de España, más la Seguridad Social de la empresa) o estimaciones, según se indica en cada puesto, con un rango orientativo de ±10 %. No son ofertas de contratación.</li><li>Inversión nueva: contrataciones nuevas y asientos de licencia que hay que comprar. Lo demás ya lo paga la empresa.</li><li>Las licencias están a precio de lista (USD) a ${String(FX).replace(".", ",")} €; quien ya tiene una herramienta usa su asiento, y para el resto se usan primero los asientos libres que la empresa ya paga.</li><li>La mejora con IA que miden los estudios es informativa: no se descuenta del equipo.</li><li>El uso de IA va incluido en cada asiento hasta su límite; lo que pase de ahí se paga por uso y no está incluido.</li><li>Jornada de ${HPM} h al mes (1.800 h al año, convenio de consultoría y tecnologías de la información).</li><li>Importes estimados en euros, sin impuestos.</li></ul>
  <div class="xf"><span class="xfby"><img src="brand/isotipo.svg" alt="" class="xfiso"/>${docNo(pr)} · Generado con HUMAIN el ${today}</span><span>Importes estimados en euros, sin IVA</span></div></article>`;
}
