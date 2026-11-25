document.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && V.modal) {
    /* keep Tab inside the open dialog */
    const sh = document.querySelector("#modal .sheet");
    if (sh) {
      const f = [...sh.querySelectorAll("button,input,select,textarea,a[href],[tabindex]:not([tabindex='-1'])")].filter(
        (x) => !x.disabled && x.offsetParent !== null,
      );
      if (f.length) {
        const first = f[0],
          last = f[f.length - 1];
        if (!sh.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && (document.activeElement === first || document.activeElement === sh)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }
  if (e.key === "Escape" && (V.modal || V.menu || V.nav || V.ws || V.dpop)) {
    if (V.dpop && !V.modal) setTimeout(() => document.querySelector("[data-demotag]")?.focus(), 0);
    V.dpop = false;
    const pm = typeof V.menu === "string" && V.menu.startsWith("pm:") ? V.menu.slice(3) : null;
    if (pm && !V.modal) setTimeout(() => document.querySelector(`[data-pmenu="${pm}"]`)?.focus(), 0);
    const rm = typeof V.menu === "string" && V.menu.startsWith("rm:") ? V.menu.slice(3) : null;
    if (rm && !V.modal) setTimeout(() => document.querySelector(`[data-rmenu="${rm}"]`)?.focus(), 0);
    const im = typeof V.menu === "string" && V.menu.startsWith("im:") ? V.menu.slice(3) : null;
    if (im && !V.modal) setTimeout(() => document.querySelector(`[data-imenu="${im}"]`)?.focus(), 0);
    const um = typeof V.menu === "string" && V.menu.startsWith("um:") ? V.menu.slice(3) : null;
    if (um && !V.modal) setTimeout(() => document.querySelector(`[data-umenu="${um}"]`)?.focus(), 0);
    V.modal = null;
    V.menu = false;
    V.nav = false;
    V.ws = false;
    render();
  }
});
/* Tooltips: the browser's grey title box is replaced by the system tooltip (ink, 13 px, rounded, 8 px from the control).
   Any element with a title gets it on hover and on keyboard focus; the title moves to data-tt so the native one never shows. */
(() => {
  const tip = document.createElement("div");
  tip.id = "tip";
  tip.setAttribute("role", "tooltip");
  tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);
  let cur = null,
    timer = 0;
  const hide = () => {
    clearTimeout(timer);
    cur = null;
    tip.classList.remove("on");
  };
  const place = (el) => {
    const r = el.getBoundingClientRect(),
      t = tip.getBoundingClientRect(),
      gap = 8,
      vw = document.documentElement.clientWidth;
    let top = r.bottom + gap,
      below = true;
    if (top + t.height > window.innerHeight - 8) {
      top = r.top - gap - t.height;
      below = false;
    }
    const left = Math.max(8, Math.min(vw - t.width - 8, r.left + r.width / 2 - t.width / 2));
    tip.style.top = top + "px";
    tip.style.left = left + "px";
    tip.style.setProperty("--ax", Math.max(10, Math.min(t.width - 10, r.left + r.width / 2 - left)) + "px");
    tip.classList.toggle("up", !below);
  };
  const show = (el, now) => {
    if (el.title) {
      el.dataset.tt = el.title;
      el.removeAttribute("title");
    }
    const txt = el.dataset.tt;
    if (!txt) return;
    clearTimeout(timer);
    cur = el;
    timer = setTimeout(
      () => {
        if (cur !== el || !el.isConnected) return;
        tip.textContent = txt;
        tip.classList.add("on");
        place(el);
      },
      now ? 0 : 350,
    );
  };
  const find = (n) => n && n.closest && n.closest("[title],[data-tt]");
  /* disabled buttons get no pointer events (CSS passes them to the parent), so the one under the pointer is found by position:
     that is where the reason it is disabled is told */
  const under = (e) => {
    const el = find(e.target);
    if (el) return el;
    const host = e.target && e.target.closest ? e.target : null;
    if (!host) return null;
    for (const b of host.querySelectorAll("button:disabled[title],button:disabled[data-tt]")) {
      const r = b.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return b;
    }
    return null;
  };
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const el = under(e);
    if (el && el !== cur) show(el);
    else if (!el && cur) hide();
  });
  document.documentElement.addEventListener("pointerleave", hide);
  document.addEventListener("focusin", (e) => {
    const el = find(e.target);
    if (el && el.matches(":focus-visible")) show(el, true);
  });
  document.addEventListener("focusout", hide);
  document.addEventListener("pointerdown", hide);
  /* touch has no hover: a tap on something whose tip appears on hover shows that tip instead
     (info icons, tags, disabled buttons that say why); a tap on a working button just does its job */
  document.addEventListener("pointerup", (e) => {
    if (e.pointerType !== "touch") return;
    const el = under(e);
    if (!el || el.classList.contains("itip")) return;
    const act = el.matches("button:not(:disabled),a[href],input,select,textarea,[data-opentr],[data-nav]") || el.closest("button:not(:disabled),a[href]") !== null;
    if (act) return;
    setTimeout(() => el.isConnected && show(el, true), 30);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".itip");
    if (!b) return;
    /* the page may re-render on the same click: show the tip on the icon that is now under the finger */
    const x = e.clientX,
      y = e.clientY;
    setTimeout(() => {
      const n = (b.isConnected ? b : document.elementFromPoint(x, y)?.closest(".itip")) || null;
      if (n) show(n, true);
    }, 30);
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && hide());
  window.addEventListener("scroll", hide, true);
  new MutationObserver(() => cur && !cur.isConnected && hide()).observe(document.body, { childList: true, subtree: true });
})();
/* Segmented control (DS): selected 600, unselected 400, same size; each segment reserves the width of its bold label
   (data-sl feeds a hidden bold copy in CSS) so nothing shifts when the selection changes */
(() => {
  const mark = () => document.querySelectorAll(".seg button:not([data-sl])").forEach((b) => (b.dataset.sl = b.textContent.trim()));
  let q = false;
  new MutationObserver(() => {
    if (q) return;
    q = true;
    queueMicrotask(() => {
      q = false;
      mark();
    });
  }).observe(document.body, { childList: true, subtree: true });
  mark();
})();
/* the slider's ring shows only when it was reached with the keyboard (Chrome also flags a mouse drag as focus-visible) */
document.addEventListener("keydown", (e) => e.key === "Tab" && document.documentElement.classList.add("kbd"), true);
document.addEventListener("pointerdown", () => document.documentElement.classList.remove("kbd"), true);
/* phones: the on-screen keyboard covers a sheet anchored to the bottom, so while it is open the sheet follows the visible area */
(() => {
  const vv = window.visualViewport;
  if (!vv) return;
  const fit = () => {
    const kb = window.innerHeight - vv.height - vv.offsetTop > 120,
      r = document.documentElement;
    r.classList.toggle("kbo", kb);
    r.style.setProperty("--vvh", vv.height + "px");
    r.style.setProperty("--vvt", vv.offsetTop + "px");
    if (V.dd) ddClose();
    if (kb) document.activeElement?.scrollIntoView?.({ block: "center" });
  };
  vv.addEventListener("resize", fit);
  vv.addEventListener("scroll", fit);
})();
render();
/* Mobile sheets: drag the sheet down from its top (or anywhere when it is not scrolled) to close it, like a native bottom sheet */
(() => {
  const mob = () => matchMedia("(max-width:699px)").matches;
  let sh = null, y0 = 0, dy = 0, drag = false;
  document.addEventListener("touchstart", (e) => {
    const s = e.target.closest && e.target.closest("#modal .sheet");
    if (!s || !mob() || s.classList.contains("pform") || s.querySelector(".field") || e.target.closest(".ddl,textarea,input,.mspanel")) return;
    if (s.scrollTop > 0 && !e.target.closest(".shead")) return;
    sh = s; y0 = e.touches[0].clientY; dy = 0; drag = false;
    sh._top = !!e.target.closest(".shead") || s.scrollHeight <= s.clientHeight + 2;
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!sh) return;
    dy = e.touches[0].clientY - y0;
    if (!drag && dy > 8) drag = true;
    if (!drag && dy < -8 && sh._top && !sh.classList.contains("sfull")) {
      if (e.cancelable) e.preventDefault();
      sh.style.transition = "none";
      sh.style.transform = `translateY(${Math.max(-60, dy / 3)}px)`;
      return;
    }
    if (drag) {
      if (e.cancelable) e.preventDefault();
      sh.style.transition = "none";
      sh.style.transform = `translateY(${Math.max(0, dy)}px)`;
    }
  }, { passive: false });
  document.addEventListener("touchend", () => {
    if (!sh) return;
    const s = sh;
    sh = null;
    if (!drag) {
      if (dy < -50 && s._top && !s.classList.contains("sfull")) s.classList.add("sfull");
      s.style.transition = "transform .2s ease";
      s.style.transform = "";
      return;
    }
    s.style.transition = "transform .2s ease";
    if (dy > Math.min(140, s.offsetHeight * 0.25)) {
      s.style.transform = "translateY(100%)";
      setTimeout(() => s.querySelector("[data-close]")?.click(), 180);
    } else s.style.transform = "";
  });
})();
document.addEventListener("input", (e) => {
  if (e.target.id === "pf-rate" && V.draft) V.draft.rate = e.target.value;
  if (e.target.id === "pf-nn" && V.draft) V.draft.nn = e.target.value;
  if (V.draft && V.draft.kind === "profile" && ["pft", "pfe", "pfph"].includes(e.target.id)) { V.draft[{ pft: "title", pfe: "email", pfph: "phone" }[e.target.id]] = e.target.value; V.draft.err = ""; }
  if (e.target.id === "licn" && V.draft) { V.draft.nn = e.target.value; V.draft.err = ""; }
  if (e.target.id === "licp" && V.draft) V.draft.np = e.target.value;
  if (e.target.id === "pf-regn" && V.draft) { V.draft.regn = e.target.value; V.draft.regErr = false; }
  if (e.target.id === "pf-np" && V.draft) V.draft.np = e.target.value;
  if (e.target.id === "pf-hrate" && V.draft) {
    V.draft.hrate = e.target.value;
    clearTimeout(V._hrT);
    V._hrT = setTimeout(() => {
      const el = document.getElementById("pf-hrate"),
        pos = el && el.selectionStart;
      render();
      const n = document.getElementById("pf-hrate");
      if (n) {
        n.focus({ preventScroll: true });
        try { n.setSelectionRange(pos, pos); } catch (er) {}
      }
    }, 400);
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "pf-hrs" && V.draft) {
    V.draft.hrs = e.target.value;
    V.draft.hrsErr = false;
  }
});
/* the bottom bar hides once the real buttons of the summary are on screen */
(() => {
  const tick = () => {
    const b = document.querySelector(".mbar"),
      cs = document.querySelector(".cside"),
      bt = cs && [...cs.querySelectorAll(".btn")].filter((x) => x.offsetParent),
      c = (bt && bt.length && bt[0]) || cs;
    document.body.classList.toggle("hasmbar", !!b);
    if (!b || !c) return;
    /* stays until the summary's own buttons come into view, so the action is never out of reach */
    b.classList.toggle("off", c.getBoundingClientRect().top < innerHeight - b.offsetHeight);
  };
  addEventListener("scroll", tick, { passive: true });
  new MutationObserver(tick).observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
})();

/* home card: team avatars on the right of the footer */
function hpTeam(p) {
  const rs = p.roles || [];
  if (!rs.length) return "";
  const av = rs.map((r) => { const f = (r.fill || [])[0] || {}, w = f.pid && PERSON(f.pid); return w ? `<i class="hav" title="${esc(w.name)}">${esc(initials(w.name))}</i>` : `<i class="hav nw" title="${f.src === "new" ? "Por contratar" : "Por asignar"}">${I("user-plus")}</i>`; });
  const max = 4, sh = av.slice(0, av.length > max ? max - 1 : max), more = av.length - sh.length;
  return `<span class="hteamc"><small>${rs.length} persona${rs.length !== 1 ? "s" : ""}</small><span class="havs">${sh.join("")}${more ? `<i class="hav more">+${more}</i>` : ""}</span></span>`;
}

/* rejected person request: what was asked, so it can be remembered before adjusting it */
function reqAsked(pid) {
  const c = D.projects.find((x) => x.id === pid);
  if (!c || !c.roles.length) return "";
  return `<div class="rqask"><small class="rql">Lo que pediste</small>${c.roles
    .map((r) => {
      const f = F(r.id), g = f.gr.length ? gradeOf(r) : null, x = seatCosts(r, c)[0],
        fl = (r.fill || [])[0] || {}, who = fl.src === "mine" && fl.pid && PERSON(fl.pid),
        tl = Object.values(r.tools || {}).filter((y) => y && opt(y)).sort(toolSort);
      return `<div class="rqrow"><b>${esc(f.t)}${g ? " · " + GR[g][0] : ""}</b><span>${esc(cap1([who ? who.name : "Contratar a alguien nuevo", dedTxt(r), r.country || "", x.f && x.f.ct === "free" ? "Freelance" : ""].filter(Boolean).join(" · ")))}</span>${tl.length ? `<span class="pchips">${tl.map((y) => `<span class="pchip${isAiTool(y) ? " ai" : ""}">${esc(opt(y).n.replace(/\s*\(.*?\)/g, ""))}</span>`).join("")}</span>` : ""}</div>`;
    })
    .join("")}<button class="lnk rqopen" data-openp="${c.id}">Ver la petición completa ${I("angle-right")}</button></div>`;
}

const short0 = (n) => String(n).replace(/\s*\(.*?\)/g, "").split(" · ")[0];

/* chips order everywhere: licences first, then AI; alphabetical inside each group */
function toolSort(a, b) {
  const ai = (t) => (isAiTool(t) ? 1 : 0), nm = (t) => (opt(t) ? opt(t).n : String(t)).toLowerCase();
  return ai(a) - ai(b) || nm(a).localeCompare(nm(b), "es");
}

/* person form: a program that is not in the catalogue. It is added to this person and goes to Leadership with the team. */
function pfNewHTML(d) {
  if (!d.nOpen) return `<button type="button" class="pfnew" data-pfnew>${I("plus")}<span>Otro programa que no está en la lista<small>Lo pides con el equipo y Dirección lo aprueba</small></span></button>`;
  return `<div class="pfnbox"><b>Otro programa</b>
  <div class="field"><label for="pf-nn">Nombre</label><input id="pf-nn" class="big md" value="${esc(d.nn || "")}" placeholder="Por ejemplo: Miro Business"/>${d.nErr ? `<p class="ferr" role="alert">Escribe el nombre del programa.</p>` : `<p class="note fh">Basta con el nombre. Dirección pone el precio cuando lo revise.</p>`}</div>
  <div class="field"><label id="pfnail">¿Es una herramienta de IA?</label><div class="seg pz" role="radiogroup" aria-labelledby="pfnail"><button type="button" role="radio" data-pfnai="" aria-checked="${!d.nai}">No</button><button type="button" role="radio" data-pfnai="1" aria-checked="${!!d.nai}">Sí</button></div><p class="note fh">Si usa IA, la persona lleva la etiqueta «Con IA».</p></div>
  <div class="pfnact"><button type="button" class="btn btn-s sm" data-pfnewx>Cancelar</button><button type="button" class="btn btn-p sm" data-pfnewok>Añadir</button></div></div>`;
}

/* printable proposal: reference number and state, like any formal document */
const docNo = (pr) => String(D.org || "DOC").normalize("NFD").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() + "-" + new Date(pr.sentAt > 9e11 ? pr.sentAt : Date.now()).getFullYear() + "-" + String(pr.id).replace(/\D/g, "").slice(-5).padStart(5, "0");
const docSt = (pr) => ({ draft: "Borrador", pending: "Pendiente de aprobación", changes: "Cambios pedidos", approved: "Aprobada", active: "Aprobada · en curso", done: "Finalizada", rejected: "Rechazada", cancelled: "Cancelada" })[stOf(pr)] || "Borrador";

/* register a person: open seats of the same puesto in the team's drafts and running projects (to be hired, not yet covered) */
function regSlots(tm, fid) {
  const out = [];
  D.projects
    .filter((p) => p.owner === tm && !p.archived && !p.full && (p.status === "draft" || isLive(p)))
    .forEach((p) => p.roles.forEach((r, ri) => r.id === fid && (r.fill || []).forEach((f, si) => f && f.src === "new" && out.push({ key: p.id + "|" + ri + "|" + si, p, ri, si, live: isLive(p) }))));
  return out;
}
function regAsgHTML(d) {
  const tm = isBoard() ? d.team : meName(), sl = d.fid ? regSlots(tm, d.fid) : [];
  if (!sl.length) return `<div class="field"><label>Proyecto <small class="opt-l">Opcional</small></label><div class="alert info" role="note">${I("info-circle")}<span>Ningún proyecto ${isBoard() ? "de este equipo" : "tuyo"} tiene una plaza de ${esc(F(d.fid).t)} por cubrir. Quedará <b>libre</b> y podrás asignarla después.</span></div></div>`;
  const cur = sl.find((z) => z.key === d.asg);
  return `<div class="field"><label>Proyecto <small class="opt-l">Opcional</small></label>${ddHTML({ id: "pasg", value: d.asg || "", ariaLabel: "Proyecto", options: [["", "Sin proyecto por ahora"], ...sl.map((z) => [z.key, `«${z.p.name}» · plaza por contratar`])] })}<p class="note fh">${cur ? (cur.live ? "Ocupa la plaza que se iba a contratar, así que esa contratación ya no hace falta." : "Ocupa la plaza que se iba a contratar en el borrador.") : "Si no eliges proyecto, quedará libre para asignarla después."}</p></div>`;
}


/* the demo has one project lead (Emma) who leads every team, so a single login shows every case:
   running, pending, changes asked, drafts, hiring, people shared between projects */
function soloSeed() {
  const ME = "Emma Walker", others = ["Nora Mitchell", "Lucas Reed"];
  D.managers = [{ name: ME, team: "Producto digital", teams: ["Producto digital", "Diseño", "Marketing", "Desarrollo"], ent: "es" }];
  D.users = [["James Carter", "Dirección", "SRC"], [ME, "Responsable de proyecto", "SRC"]];
  (D.people || []).forEach((x) => others.includes(x.team) && (x.team = ME));
  (D.projects || []).forEach((p) => {
    if (others.includes(p.owner)) p.owner = ME;
    (p.roles || []).forEach((r) => (r.fill || []).forEach((f) => { if (f && f.pid && f.src === "other") f.src = "mine"; }));
  });
  /* more cases for the single project lead: changes asked, rejected, and a change proposal on a running project */
  const by = (id) => D.projects.find((p) => p.id === id),
    copy = (src, o) => {
      const c = clone(src);
      c.roles.forEach((r, k) => { r.uid = o.id + "r" + k; r.fill = (r.fill || []).map(() => ({ src: "new" })); });
      return Object.assign(c, { archived: false, parent: undefined, full: undefined, reply: "" }, o);
    },
    now = Date.now();
  if (by("p4") && !by("p8"))
    D.projects.push(copy(by("p4"), { id: "p8", name: "Intranet de empleados", goal: "Un sitio único con nóminas, vacaciones y documentos internos.", justif: "Hoy todo va por correo y RR. HH. dedica dos días al mes a reenviar documentos.", status: "changes", sentAt: now - 6 * DAY, review: { by: "Dirección", ts: now - 2 * DAY, decision: "changes", comment: "Nos gusta mucho la idea. ¿Podríais valorar empezar con cuatro personas? Y quizá la IA de imágenes no haga falta en esta fase; si veis que sí, contadnos para qué y lo revisamos." } }));
  if (by("p7") && !by("p9"))
    D.projects.push(copy(by("p7"), { id: "p9", name: "Asistente de soporte con IA", type: by("p7").type, goal: "Responder las preguntas frecuentes sin pasar por el equipo de soporte.", justif: "El 60 % de los tickets son las mismas diez preguntas.", status: "rejected", start: undefined, sentAt: now - 20 * DAY, review: { by: "Dirección", ts: now - 15 * DAY, decision: "reject", comment: "Gracias por plantearlo, tiene mucho sentido. Este trimestre no tenemos presupuesto disponible; si os parece, lo retomamos en enero." } }));
  const web = by("p5");
  if (web && !D.projects.some((p) => p.parent === "p5" && p.full)) {
    const c = proposeOn(web);
    c.id = "p10";
    const nr = clone(web.roles[web.roles.length - 1]);
    nr.uid = "p10new";
    nr.fill = [{ src: "new" }];
    c.roles.push(nr);
    c.status = "pending";
    c.sentAt = now - 1 * DAY;
    c.justif = "La web sale en enero y hace falta una persona más para llegar a tiempo.";
    D.projects.push(c);
  }
}

