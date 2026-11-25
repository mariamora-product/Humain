/* ===== Phones: the buttons at the top of a page go into a ⋯ menu, so the title keeps the space ===== */
function headerPass() {
  if (!window.matchMedia || !matchMedia("(max-width:600px)").matches) return;
  document.querySelectorAll("#app .ph").forEach((ph) => {
    if (ph.querySelector(".pmw") || ph.querySelector(".mhw")) return;
    const bs = [...ph.querySelectorAll(".phact .btn, :scope > .btn")].filter((b) => !b.closest(".amenu"));
    /* rule: one action stays a button; two or more go into the ⋯ menu */
    if (bs.length < 2) return;
    const w = document.createElement("div");
    w.className = "pmw mhw";
    w.innerHTML = `<button class="ib" type="button" aria-label="Más acciones" aria-haspopup="menu" aria-expanded="false">${I("ellipsis")}</button>`;
    const tg = w.firstChild;
    const menu = document.createElement("div");
    menu.className = "amenu pm";
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    bs.forEach((b) => {
      const it = document.createElement("button");
      it.type = "button";
      it.setAttribute("role", "menuitem");
      it.textContent = b.textContent.trim();
      it.onclick = (e) => { e.stopPropagation(); menu.hidden = true; tg.setAttribute("aria-expanded", "false"); b.click(); };
      menu.appendChild(it);
      b.classList.add("mhid");
    });
    w.appendChild(menu);
    tg.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; tg.setAttribute("aria-expanded", String(!menu.hidden)); };
    (ph.querySelector(".phact") || ph).appendChild(w);
  });
}
document.addEventListener("click", () => document.querySelectorAll(".mhw .amenu").forEach((m) => { m.hidden = true; m.previousElementSibling && m.previousElementSibling.setAttribute("aria-expanded", "false"); }));

/* earlier messages, nested under the latest one (the latest is already on screen) */

/* Event icons: one icon per kind of event, across HUMAIN.
   People: user-* (added, assigned, unassigned, removed). Requests: file-plus-alt / check-circle / times-circle. */
const EVIC = { hire: "user-plus", assign: "user-check", unassign: "user-minus", leave: "user-times", req: "file-plus-alt", ok: "check-circle", no: "times-circle" };
function noteIc(n) {
  const t = n.t || "";
  if (/dado de baja/i.test(t)) return EVIC.leave;
  if (/ha sacado a|desasign/i.test(t)) return EVIC.unassign;
  if (/rechaz|cancelad/i.test(t)) return EVIC.no;
  if (/ha aprobado|^Ya est[áa]n?\b/i.test(t)) return EVIC.ok;
  if (/pide asignar|ha asignado|ha movido/i.test(t)) return EVIC.assign;
  if (/se ha incorporado|ha añadido a|da de alta/i.test(t)) return EVIC.hire;
  if (/ha enviado|ha reenviado|\bpide\b|recuerda su petición/i.test(t)) return EVIC.req;
  return n.ic === "times" ? EVIC.no : n.ic;
}

/* Badges explain themselves: a short line on hover, focus or tap. Same text for the same badge everywhere. */
const PILLTIP = {
  Borrador: () => (isBoard() ? "Aún no se ha enviado." : "Solo lo ves tú. Envíalo a Dirección cuando esté listo."),
  Pendiente: () => (isBoard() ? "Esperando tu decisión." : "Enviado. Esperando la respuesta de Dirección."),
  "Cambios pedidos": () => (isBoard() ? "Has pedido cambios. Esperando a que lo reenvíen." : "Dirección pide cambios. Edítalo y reenvíalo."),
  Aprobado: () => "Aprobado. Empieza en la fecha prevista.",
  "En curso": () => "El proyecto está en marcha.",
  Finalizado: () => "Ya ha terminado. Queda para consultarlo.",
  Rechazado: () => "Dirección no lo ha aprobado. Puedes ajustarlo y volver a pedirlo.",
  Cancelado: () => "Se paró después de aprobarse. Lo que usaba quedó libre.",
  Archivado: () => "Oculto de la lista. Se puede restaurar.",
  "Con IA": () => "Usa al menos una herramienta de IA en este proyecto.",
  IA: () => "Herramienta de inteligencia artificial.",
  Libre: () => "No está en ningún proyecto ahora.",
  "En proyecto": () => "Trabaja en un proyecto en curso.",
  Propuesta: () => "Está en una propuesta que aún no ha empezado.",
  "En contratación": () => "Se está contratando a alguien para este puesto.",
  "Por contratar": () => "Habrá que contratar a alguien si se aprueba.",
  "Por comprar": () => "Faltan asientos. Hay que comprarlos en el panel del programa.",
  Cubierto: () => "Hay asientos para todos los que la necesitan.",
  "Sin uso": () => "Ningún proyecto la usa ahora.",
  "Al día": () => "Nada que hacer con este contrato por ahora.",
  "Renueva pronto": () => "Renueva en menos de 4 meses y tiene asientos sin usar: buen momento para quitarlos.",
  Estimado: () => "Calculado con referencias de mercado, no con datos reales.",
  Nuevo: () => "Se añade con este cambio.",
  Nueva: () => "Herramienta nueva para la empresa.",
  "Se quita": () => "Se quita con este cambio.",
  "Próximamente": () => "Aún no está disponible.",
  Opcional: null,
};
function pillTips() {
  document.querySelectorAll("#app .pill, #modal .pill").forEach((p) => {
    if (p.dataset.tip) return;
    const t = p.textContent.trim().replace(/…$/, ""),
      k = Object.keys(PILLTIP).find((x) => t === x || (/^Falta/.test(t) && x === "Por comprar"));
    const f = /^Falta/.test(t) ? () => "Hay más personas usándola que asientos contratados." : k && PILLTIP[k];
    if (!f) return;
    p.dataset.tip = f();
    p.removeAttribute("title");
    p.setAttribute("tabindex", "0");
    p.setAttribute("aria-label", t + ". " + p.dataset.tip);
  });
}
const tipEl = () => document.getElementById("ptip") || Object.assign(document.body.appendChild(document.createElement("div")), { id: "ptip", role: "tooltip" });
function showTip(p) {
  const el = tipEl(), r = p.getBoundingClientRect();
  el.textContent = p.dataset.tip;
  el.className = "on";
  const w = Math.min(260, innerWidth - 24);
  el.style.maxWidth = w + "px";
  const tw = el.offsetWidth, th = el.offsetHeight;
  let x = Math.min(Math.max(12, r.left + r.width / 2 - tw / 2), innerWidth - tw - 12), y = r.top - th - 8;
  if (y < 64) y = r.bottom + 8;
  el.style.left = x + "px";
  el.style.top = y + "px";
}
const hideTip = () => { const el = document.getElementById("ptip"); if (el) el.className = ""; };
document.addEventListener("mouseover", (e) => { const p = e.target.closest && e.target.closest(".pill[data-tip]"); p ? showTip(p) : hideTip(); });
document.addEventListener("focusin", (e) => { const p = e.target.closest && e.target.closest(".pill[data-tip]"); p ? showTip(p) : hideTip(); });
addEventListener("scroll", hideTip, true);
/* on touch, a tap on a badge explains it instead of opening what is around it */
document.addEventListener("click", (e) => {
  const p = e.target.closest && e.target.closest(".pill[data-tip]");
  if (p && matchMedia("(hover: none)").matches) { e.preventDefault(); e.stopPropagation(); showTip(p); clearTimeout(window.__tt); window.__tt = setTimeout(hideTip, 3000); }
}, true);

