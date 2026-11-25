document.addEventListener("click", (e) => {
  if (V.nav && !e.target.closest("#side") && !e.target.closest("[data-hamb]")) {
    V.nav = false;
    render();
    return;
  }
  const tp = e.target.closest("[data-tip]");
  if (tp) {
    document.querySelectorAll(".tip").forEach((x) => x.remove());
    const r = tp.querySelector(".i")?.getBoundingClientRect() || tp.getBoundingClientRect(),
      d = document.createElement("div");
    d.className = "tip";
    d.setAttribute("role", "status");
    d.textContent = tp.dataset.tip;
    document.body.appendChild(d);
    d.style.left = Math.max(8, Math.min(innerWidth - d.offsetWidth - 8, r.right - d.offsetWidth + 8)) + "px";
    d.style.top = r.top + scrollY - d.offsetHeight - 10 + "px";
    setTimeout(() => d.remove(), 2200);
    return;
  }
  const t = e.target.closest("button,[data-close],.treq.clk");
  if (!t) {
    if (V.menu || V.ws || V.dpop) {
      V.menu = false;
      V.ws = false;
      V.dpop = false;
      render();
    }
    return;
  }
  const ds = t.dataset,
    pr = V.view === "project" ? P() : null;
  if (!("acct" in ds) && !("pmenu" in ds) && !("rmenu" in ds) && !("imenu" in ds) && !("umenu" in ds) && !("pxmenu" in ds) && !("pxask" in ds) && !("trmenu" in ds) && !("tcmenu" in ds) && V.menu && !t.closest(".amenu")) V.menu = false;
  if (!("ws" in ds) && V.ws && !t.closest(".wsmenu")) V.ws = false;
  if (!("demotag" in ds) && V.dpop && !t.closest(".dpop")) V.dpop = false;
  if ("new" in ds) V.askBack = null;
  if ("new" in ds && !D.setup) {
    V.draft = { name: "", err: "" };
    V.modal = "setup";
    render();
  } else if ("new" in ds) {
    V.draft = newDraft();
    V.modal = "new";
    render();
  } else if ("newteam" in ds) {
    V.menu = false;
    V.askBack = null;
    if (!D.setup) {
      V.draft = { name: "", err: "" };
      V.modal = "setup";
    } else {
      V.draft = { ...newDraft(), newTeam: "" };
      V.modal = "new";
    }
    render();
  } else if ("regteam" in ds) {
    V.menu = false;
    V.draft = { name: "", people: [{ n: "", fid: "" }], err: "" };
    V.modal = "regteam";
    render();
  } else if ("regadd" in ds) {
    const l = V.draft.people[V.draft.people.length - 1];
    if (l && !(l.n.trim() && l.fid)) return;
    V.draft.people.push({ n: "", fid: "" });
    render();
    /* make the new row obvious: on a phone it lands below the fold */
    setTimeout(() => {
      const r = document.querySelectorAll("#modal .rtrow .rtn");
      const last = r[r.length - 1];
      if (last) { last.scrollIntoView({ block: "center", behavior: "smooth" }); last.focus({ preventScroll: true }); }
    }, 30);
  } else if (ds.regdel) {
    V.draft.people.splice(Number(ds.regdel), 1);
    if (!V.draft.people.length) V.draft.people.push({ n: "", fid: "" });
    render();
  } else if ("saveregteam" in ds) {
    const d = V.draft,
      n = (d.name || "").trim().slice(0, 60),
      owner = meName(),
      ppl = d.people.filter((q) => q.n.trim() && q.fid);
    if (!n) d.err = "Escribe el nombre del equipo.";
    else if (teamsOf(owner).some((t) => t.toLowerCase() === n.toLowerCase())) d.err = "Ya tienes un equipo con ese nombre.";
    else if (d.people.some((q) => q.n.trim() && !q.fid) || d.people.some((q) => !q.n.trim() && q.fid)) d.err = "Cada persona necesita nombre y puesto.";
    else d.err = "";
    if (d.err) {
      render();
      return;
    }
    const mm = MGR(owner);
    mm.teams = [...teamsOf(owner), n];
    ppl.forEach((q, i) => D.people.push({ id: "u" + Date.now() + i, name: q.n.trim().slice(0, 80), fid: q.fid, lvl: "mid", team: owner, unit: n, ent: mm.ent || D.entities[0].id }));
    save();
    V.modal = null;
    V.toast = `Equipo «${n}» registrado${ppl.length ? ` con ${ppl.length} persona${ppl.length !== 1 ? "s" : ""}` : ""}`;
    render();
  } else if ("askback" in ds) {
    V.draft = V.askBack;
    V.askBack = null;
    V.modal = "ask";
    render();
  } else if ("close" in ds) {
    V.askBack = null;
    V.modal = null;
    render();
  } else if (ds.nav) {
    if (ds.nav === "projects") V.pf = "all";
    go(ds.nav);
  } else if ("demotag" in ds) {
    V.dpop = !V.dpop;
    V.ws = false;
    render();
  } else if ("ws" in ds) {
    V.ws = !V.ws;
    render();
  } else if (ds.setent) {
    D.ent = ds.setent;
    V.ws = false;
    save();
    if (V.view === "project") V.view = "projects";
    render();
  } else if ("logoup" in ds) {
    document.getElementById("lgf").click();
  } else if ("logodel" in ds) {
    delete D.logo;
    save();
    render();
  } else if ("bell" in ds) {
    go("notes");
  } else if (ds.nopen !== undefined) {
    const n = D.notes[ds.nopen];
    if (n) {
      n.r = 1;
      save();
      if (n.k === "lic") go("licenses");
      else if (n.p && D.projects.some((p) => p.id === n.p && canSee(p))) go("project", n.p);
      else render();
    }
  } else if (ds.gop) {
    go("project", ds.gop);
  } else if ("hamb" in ds) {
    V.nav = !V.nav;
    render();
  } else if ("acct" in ds) {
    V.menu = V.menu === ds.acct ? false : ds.acct;
    render();
  } else if (ds.lother) {
    /* contract edits stay in a draft until «Guardar» */
    if (!V.ldraft) return;
    V.ldraft.other = Math.max(0, Math.min(999, V.ldraft.other + Number(ds.d)));
    render();
  } else if (ds.ledit) {
    if (!isBoard()) return;
    const l = D.licenses[ds.ledit];
    V.ledit = Number(ds.ledit);
    V.ldraft = { seats: l.seats, other: l.other, admin: l.admin || "", renew: RENEW(l) };
    render();
  } else if (ds.lopen) {
    V.lsheet = ds.lopen;
    V.modal = "licd";
    V.ledit = null;
    V.ldraft = null;
    render();
  } else if (ds.bought !== undefined) {
    /* Leadership bought the seats in the vendor's console: the contract grows and the owners of the projects waiting for them are told */
    if (!isBoard()) return;
    const l = D.licenses[ds.bought],
      inv = l && seatInventory(l);
    if (!inv) return;
    const n = inv.missing + inv.later,
      o = opt(l.opt),
      ps = [...inv.ps, ...inv.fut].filter((p) => needOfOpt(p, l.opt) > 0);
    l.seats += n;
    if (SYNC(l.opt)) l.synced = Date.now();
    /* one notice per owner, naming all her projects that were waiting */
    [...new Set(ps.map((p) => p.owner))].forEach((ow) => {
      const mine = ps.filter((p) => p.owner === ow);
      D.notes.unshift({ ic: "check-circle", k: "lic", to: ow, t: `${n > 1 ? "Ya están" : "Ya está"} ${n > 1 ? "los asientos" : "el asiento"} de ${o.n}`, s: `Para ${mine.map((p) => `«${p.name}»`).join(" y ")}`, p: mine[0].id, ts: Date.now(), r: 0 });
    });
    save();
    V.toast = `Asiento${n > 1 ? "s" : ""} añadido${n > 1 ? "s" : ""}. ${[...new Set(ps.map((p) => p.owner.split(" ")[0]))].join(" y ")} ya lo sabe${ps.length > 1 && new Set(ps.map((p) => p.owner)).size > 1 ? "n" : ""}.`;
    render();
  } else if (ds.trimmed !== undefined) {
    /* Leadership removed unused seats in the vendor's console: smaller contract, a year of those seats saved */
    if (!isBoard()) return;
    const l = D.licenses[ds.trimmed],
      tm = l ? trimmable(seatInventory(l)) : 0;
    if (!tm) return;
    l.seats -= tm;
    D.trims = D.trims || [];
    D.trims.push({ opt: l.opt, scope: l.scope, n: tm, ts: Date.now() });
    save();
    V.toast = `Contrato actualizado. Ahorras ${eur(tm * licPrice(l) * 12)} al año.`;
    render();
  } else if ("srcs" in ds) {
    V.srcOpen = !V.srcOpen;
    render();
  } else if ("lcancel" in ds) {
    V.ledit = null;
    V.ldraft = null;
    render();
  } else if (ds.lsave !== undefined) {
    const l = D.licenses[ds.lsave];
    if (l && V.ldraft) {
      l.seats = V.ldraft.seats;
      l.other = V.ldraft.other;
      if (/^\d{4}-\d{2}-\d{2}$/.test(V.ldraft.renew || "")) l.renew = V.ldraft.renew;
      const u = (V.ldraft.admin || "").trim();
      if (u) l.admin = /^https?:\/\//i.test(u) ? u : "https://" + u;
      else delete l.admin;
      save();
      V.toast = "Contrato guardado";
    }
    V.ledit = null;
    V.ldraft = null;
    render();
  } else if (ds.src !== undefined) {
    const [pid, ri] = ds.src.split("|");
    if (D.projects.some((x) => x.id === pid)) {
      V.id = pid;
      V.draft = { ri: Number(ri) };
      V.modal = "src";
      render();
    }
  } else if ("setup" in ds) {
    V.draft = { name: D.setup ? D.org : "", err: "" };
    V.modal = "setup";
    render();
  } else if ("setupok" in ds) {
    const d = V.draft,
      n = d.name.trim();
    if (!n) {
      d.err = "Escribe el nombre de tu empresa.";
      render();
      return;
    }
    D.org = n.slice(0, 80);
    D.entities[0].name = D.org;
    D.setup = true;
    save();
    V.draft = newDraft();
    V.modal = "new";
    render();
  } else if ("loadseed" in ds) {
    unregisterCustom();
    seedData();
    V.view = "home";
    V.modal = null;
    V.toast = "Datos iniciales restaurados";
    render();
  } else if ("fresh" in ds) {
    V.nav = false;
    V.dpop = false;
    V.modal = "fresh";
    render();
  } else if ("freshok" in ds) {
    V.nav = false;
    unregisterCustom();
    emptyData();
    V.view = "home";
    V.modal = null;
    V.menu = false;
    V.toast = "Empiezas de cero";
    render();
  } else if ("pendall" in ds) {
    V.pendAll = !V.pendAll;
    render();
  } else if ("cmp" in ds) {
    V.draft = {};
    V.modal = "cmp";
    render();
  } else if (ds.cmpup) {
    pr.cmpSc = ds.cmpup;
    save();
    render();
  } else if (ds.cmpuse) {
    const V2 = cmpVariants(pr, pr.cmpSc || "est");
    if (teamCustomised(pr, V2)) {
      V.draft = { confirm: ds.cmpuse };
      render();
    } else useVariant(pr, ds.cmpuse);
  } else if ("cmpyes" in ds) useVariant(pr, V.draft.confirm);
  else if ("cmpno" in ds) {
    V.draft = {};
    render();
  } else if ("expo" in ds) {
    go("export", pr.id);
  } else if (ds.pexp) {
    V.menu = false;
    go("export", ds.pexp);
  } else if ("expback" in ds) {
    go("project", V.id);
  } else if ("doprint" in ds) {
    exportPDF(t.closest("[data-doprint]"));
  } else if (ds.rmenu) {
    V.menu = V.menu === "rm:" + ds.rmenu ? false : "rm:" + ds.rmenu;
    V._focusMenu = !!V.menu;
    render();
  } else if ("mbar" in ds) {
    const c = document.querySelector(".cside");
    if (c) scrollTo({ top: c.getBoundingClientRect().top + scrollY - 72, behavior: "smooth" });
  } else if (ds.pmenu) {
    V.menu = V.menu === "pm:" + ds.pmenu ? false : "pm:" + ds.pmenu;
    V._focusMenu = !!V.menu;
    render();
  } else if (ds.pdup) {
    const src = D.projects.find((x) => x.id === ds.pdup);
    if (src) {
      const c = clone(src);
      c.id = "p" + Date.now();
      c.name = src.name + (src.status === "rejected" || src.status === "cancelled" || stOf(src) === "done" ? " (copia)" : " (escenario)");
      delete c.parent;
      c.status = "draft";
      c.archived = false;
      c.review = null;
      delete c.sentAt;
      c.start = monthKey();
      D.projects.unshift(c);
      syncFill(c, true);
      save();
      V.menu = false;
      V.toast = src.status === "rejected" || src.status === "cancelled" || stOf(src) === "done" ? "Proyecto duplicado como borrador" : "Escenario creado como borrador";
      go("project", c.id);
    }
  } else if (ds.parch) {
    const p = D.projects.find((x) => x.id === ds.parch);
    if (p) {
      p.archived = true;
      save();
      V.menu = false;
      V.toast = `«${p.name}» archivado`;
      if (V.view === "project") V.view = "projects";
      render();
    }
  } else if (ds.punarch) {
    const p = D.projects.find((x) => x.id === ds.punarch);
    if (p) {
      p.archived = false;
      save();
      V.menu = false;
      V.toast = `«${p.name}» restaurado`;
      render();
    }
  } else if (ds.pdel) {
    V.menu = false;
    const q = D.projects.find((x) => x.id === ds.pdel);
    if (q && q.parent) {
      V.draft = { trcx: ds.pdel };
      V.modal = "trcx";
    } else {
      V.draft = ds.pdel;
      V.modal = "del";
    }
    render();
  } else if ("pdelok" in ds) {
    const id = V.draft;
    D.projects = D.projects.filter((x) => x.id !== id);
    D.notes = D.notes.filter((n) => n.p !== id);
    save();
    V.modal = null;
    V.toast = "Proyecto eliminado";
    if (V.view === "project" || V.view === "export") V.view = "projects";
    render();
  } else if (ds.freeai !== undefined && isBoard()) {
    if (!isBoard() || !ds.v) return;
    const was = D.freeAI || "company";
    D.projects.forEach((p) => p.status !== "draft" && !p.freeAI && (p.freeAI = was));
    D.freeAI = ds.v;
    save();
    V.toast = ds.v === "own" ? "Los freelance usan su propia IA" : "Los freelance usan la IA de la empresa";
    render();
  } else if (ds.delent) {
    V.draft = ds.delent;
    V.modal = "delent";
    render();
  } else if ("delentok" in ds) {
    const id = V.draft;
    if (!D.projects.some((p) => p.ent === id) && D.entities.length > 1) {
      D.entities = D.entities.filter((e) => e.id !== id);
      D.licenses = D.licenses.filter((l) => l.scope !== id);
      if (D.ent === id) D.ent = "all";
      save();
      V.toast = "Empresa eliminada";
    }
    V.modal = null;
    render();
  } else if (ds.radv !== undefined) {
    V.radv = V.radv || {};
    const k = pr.id + ":" + ds.radv;
    V.radv[k] = !V.radv[k];
    /* keep the button where it was on screen: re-rendering must not move the page */
    const top0 = t.getBoundingClientRect().top;
    render();
    const nb = document.querySelector(`[data-radv="${ds.radv}"]`);
    if (nb) scrollBy(0, nb.getBoundingClientRect().top - top0);
  } else if (ds.crateclr && isBoard()) {
    delete D.rates[ds.crateclr];
    save();
    render();
  } else if (ds.seats !== undefined) {
    const l = D.licenses[ds.seats];
    if (!V.ldraft) return;
    V.ldraft.seats = Math.max(0, Math.min(CAP[l.opt] ? CAP[l.opt][0] : 9999, V.ldraft.seats + Number(ds.d)));
    render();
  } else if ("invite" in ds) {
    V.draft = { mode: "new", email: "", role: "Responsable de proyecto", scope: "Todas" };
    V.modal = "invite";
    render();
  } else if (ds.intmore) {
    V.intMore = V.intMore || {};
    V.intMore[ds.intmore] = !V.intMore[ds.intmore];
    render();
  } else if (ds.umenu) {
    V.menu = V.menu === "um:" + ds.umenu ? false : "um:" + ds.umenu;
    V._focusMenu = !!V.menu;
    render();
  } else if (ds.uresend) {
    V.menu = false;
    V.toast = "Invitación reenviada a " + D.users[ds.uresend][0];
    render();
  } else if (ds.uedit) {
    const u = D.users[ds.uedit];
    V.menu = false;
    V.draft = { mode: "edit", idx: Number(ds.uedit), name: u[0], role: roleKey(u[1]), scope: u[2] };
    V.modal = "invite";
    render();
  } else if (ds.udel) {
    V.menu = false;
    V.draft = Number(ds.udel);
    V.modal = "udel";
    render();
  } else if ("udelok" in ds) {
    const u = D.users[V.draft];
    if (u) {
      D.users.splice(V.draft, 1);
      save();
      V.toast = u[3] ? "Invitación a " + u[0] + " cancelada" : u[0] + " ya no tiene acceso";
    }
    V.modal = null;
    render();
  } else if ("uinviteok" in ds) {
    const d = V.draft;
    if (d.mode === "edit") {
      const u = D.users[d.idx];
      if (u) {
        u[1] = d.role;
        u[2] = d.role === "Administrador global" ? "Todas" : d.scope;
        V.toast = "Rol de " + u[0] + " actualizado";
      }
    } else {
      if (!emailOk(d.email, d)) return;
      D.users.push([d.email, d.role, d.role === "Administrador global" ? "Todas" : d.scope, "pend"]);
      V.toast = "Invitación enviada a " + d.email;
    }
    save();
    V.modal = null;
    render();
  } else if (ds.imenu) {
    V.menu = V.menu === "im:" + ds.imenu ? false : "im:" + ds.imenu;
    V._focusMenu = !!V.menu;
    render();
  } else if (ds.intgoff) {
    V.menu = false;
    V.draft = ds.intgoff;
    V.modal = "intgoff";
    render();
  } else if ("intgoffok" in ds) {
    D.intg = D.intg || {};
    D.intg[V.draft] = false;
    if (D.ratesSrc && D.ratesSrc.by === V.draft) delete D.ratesSrc; /* the figures stay as the company's own */
    save();
    V.toast = V.draft + " desconectado";
    V.modal = null;
    render();
  } else if (ds.intg) {
    /* like a real OAuth connection: HUMAIN explains what it will read, then the tool opens to sign in and grant access */
    V.modal = "intg";
    V.draft = ds.intg;
    V.intgWait = false;
    render();
  } else if ("intggo" in ds) {
    const n = V.draft;
    V.intgWait = true;
    render();
    clearTimeout(V.intgT);
    V.intgT = setTimeout(() => {
      if (V.modal !== "intg" || V.draft !== n) return;
      D.intg = D.intg || {};
      D.intg[n] = true;
      D.licenses.forEach((l) => {
        if (SYNC(l.opt) && !(l.synced > 0)) l.synced = Date.now();
      });
      const imp = isHR(n) ? importRates(n) : 0;
      save();
      V.modal = null;
      V.intgWait = false;
      V.toast = imp ? `${n} conectado: ${imp} tarifa${imp !== 1 ? "s" : ""} importada${imp !== 1 ? "s" : ""}` : `${n} conectado`;
      render();
    }, 2200);
  } else if (ds.dset) {
    const d = V.draft;
    if (ds.dset === "dk") {
      d.dk = true;
      d.months = REFM[d.size || "m"] || 6;
    } else d[ds.dset] = ds.dset === "months" ? Number(ds.v) : ds.v;
    /* only «No lo sé» follows the size (the typical duration of a team of that size); a duration the person sees selected never changes by itself */
    if (ds.dset === "size" && d.months !== 0 && d.dk) d.months = REFM[ds.v] || 6;
    if (ds.dset === "months") {
      d.mTouched = true;
      d.dk = false;
    }
    if (ds.dset === "smode" && ds.v === "pick" && !d.start) d.start = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
    render();
  } else if (ds.pickday) {
    V.draft.end = ds.pickday;
    V.calOpen = false;
    render();
  } else if (ds.calnav) {
    const d = V.draft,
      b = d.cal ? new Date(d.cal + "-01T12:00") : d.end ? new Date(d.end + "T12:00") : new Date(Date.now() + 14 * 864e5);
    b.setDate(1);
    b.setMonth(b.getMonth() + Number(ds.calnav));
    d.cal = `${b.getFullYear()}-${String(b.getMonth() + 1).padStart(2, "0")}`;
    render();
  } else if ("dcustom" in ds) {
    V.calOpen = !(V.draft.custom && V.calOpen);
    V.draft.custom = true;
    V.draft.months = V.draft.months || 6;
    render();
  } else if (ds.dseats) {
    const d = V.draft,
      k = ds.dseats;
    d[k] = Math.max(k === "seats" ? 1 : 0, d[k] + Number(ds.d));
    d.other = Math.min(d.other, d.seats);
    render();
  } else if (ds.nstep) {
    if (!V.draft.type || (V.draft.newTeam !== undefined && !V.draft.newTeam.trim())) {
      V.draft.typeErr = true;
      render();
      return;
    }
    V.draft.step = Number(ds.nstep);
    render();
    document.querySelector("#modal .sheet")?.scrollTo(0, 0);
    (document.querySelector("#modal .sheet input,#modal .sheet [role=radio][aria-checked=true]") || document.querySelector("#modal .sheet"))?.focus({ preventScroll: true });
  } else if ("nadv" in ds) {
    V.draft.adv = !V.draft.adv;
    render();
  } else if ("create" in ds) {
    const d = V.draft,
      x = applyDraft(d);
    if (!d.type) return;
    const owner = meName(),
      p = {
        id: "p" + Date.now(),
        ...x,
        name: x.name.trim() || (d.type === "other" && d.desc) || TYPES[d.type][1],
        desc: d.desc || "",
        owner,
        ent: (MGR(owner) || {}).ent || d.ent,
        status: "draft",
        startFrom: d.startFrom === "new" ? "new" : "team",
        aiPref: d.aiPref || "rec",
        justif: "",
        review: null,
        cmpSc: "est",
        own: [],
        roles: [],
        shared: { pm: pick("pm"), genai: pick("genai") },
        qty: {},
      };
    if (d.type !== "other" && d.empty !== "1") {
      suggest(p);
      /* project-wide defaults from «Avanzado» */
      p.roles.forEach((r) => {
        if (d.mod && d.mod !== "remote") r.mod = d.mod;
        if (d.country && d.country !== ENT(p.ent).country) r.country = d.country;
        if (d.ct === "emp") r.ct = "emp";
        if (d.ct === "free") r.ct = "free";
        if (r.ct === "emp" && !r.n) {
          r.n = 1;
          r.hours = 0;
        }
      });
    }
    applyAiPref(p);
    if (d.newTeam && d.newTeam.trim()) {
      const mm = MGR(owner);
      if (mm && !teamsOf(owner).some((t) => t.toLowerCase() === d.newTeam.trim().toLowerCase())) {
        mm.teams = [...teamsOf(owner), d.newTeam.trim().slice(0, 60)];
        mm.team = mm.teams[0];
      }
    }
    D.projects.unshift(p);
    syncFill(p, true);
    save();
    V.modal = null;
    V.jerr = false;
    go("project", p.id);
  } else if ("edit" in ds) {
    V.draft = {
      name: pr.name,
      goal: pr.goal || "",
      type: pr.type,
      size: pr.size,
      months: pr.months,
      dk: !!pr.dk,
      mTouched: true,
      budget: pr.budget,
      ent: pr.ent,
      smode: pr.start && pr.start !== monthKey() ? "pick" : "now",
      start: pr.start,
    };
    V.modal = "edit";
    render();
  } else if ("saveedit" in ds) {
    const scope0 = [pr.type, pr.size, !!pr.months, pr.months];
    Object.assign(pr, applyDraft(V.draft));
    pr.name = pr.name.trim() || TYPES[pr.type][1];
    /* only the estimated work, and only when what it depends on changed: a work figure the user typed survives a rename */
    if (pr.work != null && JSON.stringify(scope0) !== JSON.stringify([pr.type, pr.size, !!pr.months, pr.months])) estimateWork(pr);
    save();
    V.modal = null;
    render();
  } else if (ds.pfilter) {
    V.pf = PF[ds.pfilter] || ds.pfilter === "archived" ? ds.pfilter : "all";
    go("projects");
  } else if (ds.opentr) {
    V.menu = false;
    V.draft = { trv: ds.opentr };
    V.modal = "trv";
    render();
  } else if (ds.openp) {
    V.menu = false;
    const op = D.projects.find((x) => x.id === ds.openp);
    /* a rejected request (an addition to an approved project) opens as the request itself, with the answer and the way forward */
    if (op && op.parent && op.status === "rejected" && !isBoard() && personReqs().some((q) => q.id === op.id)) {
      V.draft = { trv: op.id };
      V.modal = "trv";
      render();
      return;
    }
    if (V.modal === "trv") V.modal = null;
    go("project", ds.openp);
  } else if (ds.open) {
    V.open = V.open === ds.open ? null : ds.open;
    render();
  } else if (ds.tsel) {
    const [k, ck, id] = ds.tsel.split("|");
    if (k === "s") {
      pr.shared[ck] = id || null;
      delete pr.qty[ck];
    } else {
      pr.roles[k].tools[ck] = id || null;
      delete (pr.roles[k].qty || {})[ck];
    }
    V.open = null;
    V.tnew = null;
    save();
    render();
  } else if (ds.qty) {
    const [k, ck] = ds.qty.split("|"),
      d = Number(ds.d);
    const K = cost(pr);
    if (k === "s") pr.qty[ck] = Math.max(0, (K.qs[ck] || 0) + d);
    else {
      const r = pr.roles[k];
      r.qty[ck] = Math.max(0, (K.qr[k][ck] || 0) + d);
    }
    save();
    render();
  } else if (ds.ppl) {
    const r = pr.roles[ds.ppl];
    r.n = Math.max(1, r.n + Number(ds.d));
    if (!r.n && !r.hours) r.hours = 80;
    r.ai = Math.min(r.ai, Math.max(1, r.n));
    syncFill(pr);
    r.qty = {};
    save();
    render();
  } else if (ds.hrs) {
    const r = pr.roles[ds.hrs];
    r.hours = Math.max(5, Math.min(HPM, r.hours + 5 * Number(ds.d)));
    save();
    render();
  } else if (ds.aip) {
    const r = pr.roles[ds.aip];
    r.ai = Math.max(0, Math.min(Math.max(1, r.n), r.ai + Number(ds.d)));
    r.qty = {};
    save();
    render();
  } else if (ds.ct) {
    const r = pr.roles[ds.ct];
    r.ct = ds.v;
    if (ds.v === "emp" && !r.n) {
      r.n = 1;
      r.ai = Math.min(r.ai, 1);
      r.qty = {};
    }
    save();
    render();
  } else if (ds.series) {
    const v = V.chart,
      k = ds.series;
    if (v.includes(k)) {
      if (v.length > 1) V.chart = v.filter((x) => x !== k);
    } else V.chart = [...v, k];
    render();
  } else if (ds.ded) {
    const r = pr.roles[ds.ded];
    if (ds.v === "hrs") {
      r.n = 0;
      r.hours = r.hours || 80;
      r.ai = Math.min(r.ai, 1);
    } else {
      r.n = Math.max(1, r.n);
    }
    syncFill(pr);
    r.qty = {};
    save();
    render();
  } else if (ds.aitog) {
    const r = pr.roles[ds.aitog];
    r.ai = r.ai > 0 ? 0 : 1;
    r.qty = {};
    save();
    render();
  } else if (ds.ropen !== undefined && V.view === "project") {
    const k = pr.id + ":" + ds.ropen;
    V.ropen = V.ropen === k ? null : k;
    render();
    if (V.ropen) {
      const el = document.getElementById("role-" + ds.ropen);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top < 70 || r.top > innerHeight - 120) scrollTo({ top: scrollY + r.top - 90, behavior: SMOOTH() });
      }
    }
  } else if (ds.grade !== undefined && ds.v) {
    pr.roles[ds.grade].grade = ds.v;
    save();
    render();
  } else if (ds.lr !== undefined && ds.v) {
    pr.roles[ds.lr].lr = ds.v;
    save();
    render();
  } else if (ds.reports) {
    const r = pr.roles[ds.reports];
    r.reports = Math.max(0, Math.min(60, (r.reports || 0) + Number(ds.d)));
    save();
    render();
  } else if (ds.scope !== undefined && ds.v) {
    const r = pr.roles[ds.scope],
      v = ds.v;
    r.scopes = r.scopes || [];
    r.scopes = r.scopes.includes(v) ? (r.scopes.length > 1 ? r.scopes.filter((x) => x !== v) : r.scopes) : [...r.scopes, v];
    save();
    render();
  } else if ("assume" in ds) {
    const inPanel = !!t.closest(".asmc");
    V.assume = V.assume === pr.id && inPanel ? null : pr.id;
    render();
    if (!inPanel) document.querySelector(".asmc")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if ("workreset" in ds) {
    estimateWork(pr);
    save();
    render();
  } else if (ds.upreset) {
    pr.roles[ds.upreset].up = null;
    save();
    render();
  } else if (ds.up) {
    const r = pr.roles[ds.up];
    r.up = Math.max(-50, Math.min(100, upOf(r) + 5 * Number(ds.d)));
    save();
    render();
  } else if (ds.loc !== undefined && ds.v) {
    pr.roles[ds.loc].loc = ds.v;
    save();
    render();
  } else if (ds.mod !== undefined && ds.v) {
    pr.roles[ds.mod].mod = ds.v;
    save();
    render();
  } else if (ds.rateclr) {
    delete pr.roles[ds.rateclr].rate;
    save();
    render();
  } else if (ds.rexp) {
    V.rexp = V.rexp === ds.rexp ? null : ds.rexp;
    render();
  } else if ("rall" in ds) {
    V.rall = true;
    render();
  } else if ("crole" in ds) {
    V.draft = { t: V.rq || "", cat: "product", arch: "ic", rate: 0 };
    V.modal = "crole";
    render();
  } else if ("backrole" in ds) {
    V.modal = "role";
    render();
  } else if ("savecrole" in ds) {
    const d = V.draft;
    if (!(d.t || "").trim()) return;
    const c = { id: "c-" + Date.now(), t: d.t.trim(), cat: d.cat, arch: d.arch, rate: d.rate || null };
    D.croles.push(c);
    regCustom(c);
    V.ropen = pr.id + ":" + pr.roles.length;
    const nr = mkRole(c.id, 1);
    if (c.rate) nr.rate = c.rate;
    nr.ct = pr.months && pr.months <= 3 ? "free" : "emp";
    pr.roles.push(nr);
    syncFill(pr);
    V.modal = null;
    save();
    V.toast = "Puesto creado y añadido";
    render();
  } else if (ds.delrole) {
    const id = ds.delrole,
      used = D.projects.filter((p) => p.roles.some((r) => r.id === id)).length;
    if (used) {
      V.toast = `Está en ${used} proyecto${used > 1 ? "s" : ""}: quítalo de ahí antes de borrarlo`;
      render();
      return;
    }
    D.croles = D.croles.filter((c) => c.id !== id);
    delete FAM[id];
    save();
    V.toast = "Rol eliminado del catálogo";
    render();
  } else if ("savedraft" in ds && pr) {
    save();
    V.pf = "draft";
    V.toast = "Guardado en Borradores. Puedes retomarlo cuando quieras.";
    go("projects");
  } else if ("askt" in ds) {
    const ap = D.projects.find((x) => x.id === ds.askt);
    V.askopen = ap && askOpen(ap) ? "x" + ds.askt : ds.askt;
    render();
  } else if ("pview" in ds) {
    V.pview = ds.pview;
    render();
  } else if ("lvopen" in ds) {
    V.lvopen = V.lvopen === ds.lvopen ? null : ds.lvopen;
    render();
  } else if ("toolreq" in ds) {
    V.menu = false;
    V.draft = { kind: "tool", cat: ds.tcat || "", where: "", pid: "", fid: "", when: "now", why: "", opt: null, who: "", err: "", whoIds: ds.trfor ? [ds.trfor] : [], forPid: ds.trfor || "" };
    V.modal = "ask";
    render();
  } else if ("sendask" in ds) {
    const d = V.draft,
      src = D.projects.find((x) => x.id === d.where),
      px = (D.people || []).find((x) => x.id === d.pid);
    if (d.pid === "reg") {
      if (!(d.rname || "").trim() || !d.fid) {
        d.err = !(d.rname || "").trim() ? "Escribe el nombre de la persona." : "Elige el puesto.";
        render();
        return;
      }
      const nk = (x) => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
      if ((D.people || []).some((x) => nk(x.name) === nk(d.rname) && x.fid === d.fid)) {
        d.err = "Ya hay una persona con este nombre y puesto en la empresa.";
        render();
        return;
      }
      const tm = meName(),
        mm = MGR(tm),
        un = d.team && teamsOf(tm).includes(d.team) ? d.team : teamsOf(tm)[0];
      D.people.push({ id: "u" + Date.now(), name: d.rname.trim().slice(0, 80), fid: d.fid, lvl: "mid", team: tm, ...(teamsOf(tm).length > 1 ? { unit: un } : {}), ent: (mm || {}).ent || D.entities[0].id });
      save();
      V.modal = null;
      V.toast = `${d.rname.trim()} añadida al equipo`;
      render();
      return;
    }
    if (d.pid === "new" && d.fid && visPeople().some((x) => x.fid === d.fid && isOpen(x.id))) {
      d.err = "Ya tienes a alguien libre con este puesto.";
      render();
      return;
    }
    if (!src || !d.pid) {
      d.err = !src ? "Elige dónde se suma." : "Elige a quién.";
      render();
      return;
    }
    if (px) {
      const eo = editSnap(d, true);
      if (d.editReq) D.projects = D.projects.filter((x) => x.id !== d.editReq);
      const c = amendOf(src),
        nr = mkRole(px.fid, 1);
      nr.ct = c.months && c.months <= 3 ? "free" : "emp";
      nr.fill = [{ src: "mine", pid: px.id }];
      if (d.team) nr.team = d.team;
      c.roles.push(nr);
      syncFill(c);
      c.justif = (d.why || "").trim() || "Asignación de alguien libre del equipo";
      c.status = "pending";
      c.sentAt = Date.now();
      D.projects.unshift(c);
      D.notes.unshift({ ic: "user-plus", k: "rev", to: "board", t: `${c.owner} pide asignar a ${px.name} a «${src.name}»`, s: "Pendiente de tu aprobación", p: c.id, ts: Date.now(), r: 0 });
      save();
      V.modal = null;
      V.toast = d.editReq ? "Petición actualizada" : "Petición enviada a Dirección";
      editUndo(eo, c.id);
      render();
      return;
    }
    if (!d.fid) {
      d.err = "Elige el puesto.";
      render();
      return;
    }
    if (!(d.why || "").trim()) {
      d.err = "Cuéntale a Dirección por qué la necesitas.";
      render();
      return;
    }
    const eo = editSnap(d, true);
    if (d.editReq) D.projects = D.projects.filter((x) => x.id !== d.editReq);
    const c = amendOf(src);
    if (d.when === "next") c.start = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
    const nr = mkRole(d.fid, 1);
    nr.ct = c.months && c.months <= 3 ? "free" : "emp";
    if (d.team) nr.team = d.team;
    nr.fill = [{ src: "new" }];
    c.roles.push(nr);
    applyAiPref({ ...c, roles: [nr], shared: {} });
    syncFill(c);
    c.justif = d.why.trim();
    c.status = "pending";
    c.sentAt = Date.now();
    D.projects.unshift(c);
    D.notes.unshift({ ic: "file-alt", k: "rev", to: "board", t: `${c.owner} pide sumar ${FAM[d.fid].t} a «${src.name}»${d.team ? ` para ${d.team}` : ""}`, s: "Pendiente de tu aprobación", p: c.id, ts: Date.now(), r: 0 });
    save();
    V.modal = null;
    V.toast = d.editReq ? "Petición actualizada" : "Petición enviada a Dirección";
    editUndo(eo, c.id);
    render();
  } else if ("sendtreq" in ds) {
    const d = V.draft;
    if (!d.opt) {
      d.err = "Elige la herramienta.";
      render();
      return;
    }
    const eo = editSnap(d, false),
      nid = "tr" + Date.now();
    D.toolReqs = (D.toolReqs || []).filter((x) => x.id !== d.editReq);
    D.toolReqs.unshift({ id: nid, opt: d.opt, forId: d.where && d.where !== "team" ? d.where : "", forName: d.where && d.where !== "team" ? "Para «" + ((D.projects.find((q) => q.id === d.where) || {}).name || "proyecto") + "»" : "Para tu equipo", who: (d.whoIds || []).map((i) => (PERSON(i) || {}).name).filter(Boolean).join(", "), why: (d.why || "").trim(), by: meName(), status: "pending", ts: Date.now() });
    D.notes.unshift({ ic: "key-skeleton", k: "lic", to: "board", t: `${meName()} pide ${opt(d.opt).n}`, s: "Pendiente de tu aprobación", p: "", ts: Date.now(), r: 0 });
    save();
    V.modal = null;
    V.toast = d.editReq ? "Petición actualizada" : "Petición enviada a Dirección";
    editUndo(eo, nid);
    render();
  } else if (ds.trcancel) {
    V.menu = false;
    V.draft = { trcx: ds.trcancel };
    V.modal = "trcx";
    render();
  } else if ("trcancelok" in ds) {
    const id = V.draft && V.draft.trcx,
      r = (D.toolReqs || []).find((q) => q.id === id) || personReqs().find((q) => q.id === id);
    V.modal = null;
    if (r && r.by === meName() && ["pending", "changes"].includes(r.status)) {
      const par = r.amend ? (D.projects.find((q) => q.id === id) || {}).parent : null;
      V.undo = { amend: !!r.amend, item: r.amend ? D.projects.find((q) => q.id === id) : (D.toolReqs || []).find((q) => q.id === id), notes: D.notes.filter((n) => n.p === id), par };
      if (r.amend) D.projects = D.projects.filter((q) => q.id !== id);
      else D.toolReqs = D.toolReqs.filter((q) => q.id !== id);
      D.notes = D.notes.filter((n) => n.p !== id);
      save();
      V.toast = "Petición cancelada";
      V.toastAct = "Deshacer";
      if (par && V.view === "project") {
        render();
        go("project", par);
        return;
      }
    }
    render();
  } else if (ds.trhide !== undefined || ds.trclear !== undefined) {
    /* take answered requests off the list (the request itself stays on record); «Deshacer» puts them back */
    const vk = noteViewer(),
      pool = [...(D.toolReqs || []), ...personReqs(isBoard())],
      ids = ds.trhide !== undefined ? [ds.trhide] : pool.filter((r) => r.status !== "pending" && !(r.hid || []).includes(vk) && (ds.trclear === "person" ? r.kind === "person" : r.kind !== "person") && (isBoard() || r.by === meName())).map((r) => r.id);
    const holder = (id) => (D.toolReqs || []).find((r) => r.id === id) || D.projects.find((p) => p.id === id);
    ids.forEach((id) => {
      const h = holder(id);
      if (!h) return;
      const k = (D.toolReqs || []).includes(h) ? "hid" : "hidReq";
      h[k] = [...(h[k] || []), vk];
    });
    V.menu = false;
    if (V.modal === "trv") V.modal = null;
    V.undo = { reqs: ids, vk };
    V.toastAct = "Deshacer";
    V.toast = ids.length > 1 ? `${ids.length} peticiones fuera de la lista` : "Petición quitada de la lista";
    save();
    render();
  } else if (ds.nread !== undefined) {
    const n = D.notes[Number(ds.nread)];
    if (n) {
      n.r = 1;
      save();
      render();
    }
  } else if (ds.ndis !== undefined) {
    /* an informative notice has nothing to open, so it is dismissed from its own row */
    const n = D.notes[Number(ds.ndis)],
      vk = noteViewer();
    if (n) {
      n.hid = [...(n.hid || []), vk];
      V.undo = { notes: [Number(ds.ndis)], vk };
      V.toastAct = "Deshacer";
      V.toast = "Notificación eliminada";
      save();
      render();
    }
  } else if ("nreadall" in ds) {
    myNotes().forEach((n) => (n.r = 1));
    save();
    render();
  } else if ("undotr" in ds) {
    const u = V.undo;
    V.undo = null;
    document.querySelectorAll(".toast").forEach((e) => e.remove());
    if (u && u.leave) {
      const x = (D.people || []).find((q) => q.id === u.leave), sn = JSON.parse(u.snap);
      if (x) delete x.leaving;
      D.projects = sn.projects;
      D.notes = sn.notes;
      save();
      render();
      return;
    }
    if (u && u.tchip) {
      const q = D.projects.find((x) => x.id === u.tchip), r = q && q.roles[u.ix];
      if (r) { r.tools = u.tools; r.ai = u.ai; save(); render(); }
      return;
    }
    if (u && u.resug) {
      const q = D.projects.find((x) => x.id === u.resug);
      if (q) { q.roles = u.roles; save(); render(); }
      return;
    }
    if (u && u.reqs) {
      u.reqs.forEach((id) => {
        const h = (D.toolReqs || []).find((r) => r.id === id) || D.projects.find((p) => p.id === id);
        if (!h) return;
        const k = (D.toolReqs || []).includes(h) ? "hid" : "hidReq";
        h[k] = (h[k] || []).filter((v) => v !== u.vk);
      });
      save();
      V.toast = "Petición recuperada";
    } else if (u && u.notes) {
      u.notes.forEach((k) => D.notes[k] && (D.notes[k].hid = (D.notes[k].hid || []).filter((v) => v !== u.vk)));
      save();
      V.toast = "Notificación recuperada";
    } else if (u && u.decision) {
      const o = JSON.parse(u.snap);
      D.projects = o.projects;
      D.toolReqs = o.toolReqs;
      D.people = o.people;
      D.licenses = o.licenses;
      D.notes = o.notes;
      save();
      V.toast = u.cancelp ? "Cancelación deshecha" : "Decisión deshecha";
    } else if (u && u.edit) {
      if (u.amend) D.projects = [u.old, ...D.projects.filter((x) => x.id !== u.newId && x.id !== u.old.id)];
      else D.toolReqs = [u.old, ...(D.toolReqs || []).filter((x) => x.id !== u.newId && x.id !== u.old.id)];
      D.notes = [...u.notes, ...D.notes.filter((n) => n.p !== u.newId)];
      save();
      V.toast = "Cambios deshechos";
    } else if (u && u.roles) {
      const q = D.projects.find((x) => x.id === u.pid);
      if (q) {
        q.roles = JSON.parse(u.roles);
        if (u.shared) q.shared = JSON.parse(u.shared);
        if (u.pqty) q.qty = JSON.parse(u.pqty);
        V.ropen = null;
        save();
        V.toast = u.shared ? "Cambio deshecho" : "Puesto recuperado";
      }
    } else if (u && u.item) {
      if (u.amend) D.projects.push(u.item);
      else D.toolReqs = [u.item, ...(D.toolReqs || [])];
      D.notes = [...u.notes, ...D.notes];
      save();
      V.toast = "Petición recuperada";
    }
    render();
    if (u && u.amend && u.par && V.view === "project") go("project", u.item.id);
  } else if (ds.trremind) {
    V.menu = false;
    const id = ds.trremind,
      r = (D.toolReqs || []).find((q) => q.id === id) || personReqs().find((q) => q.id === id);
    if (r && r.by === meName() && ["pending", "changes"].includes(r.status)) {
      {
        r.remindedAt = Date.now();
        if (r.amend) D.projects.find((q) => q.id === id).remindedAt = r.remindedAt;
        const days = Math.max(1, Math.round((Date.now() - r.ts) / 864e5));
        D.notes.unshift({ ic: "bell", k: "rev", to: "board", t: `${meName()} recuerda su petición: ${reqName(r)}`, s: `Lleva ${days} día${days > 1 ? "s" : ""} sin respuesta`, ts: Date.now(), r: 0 });
        V.toast = "Recordatorio enviado a Dirección";
      }
      save();
    }
    render();
  } else if (ds.treq) {
    const [id, a] = ds.treq.split("|");
    V.menu = false;
    if (V.modal === "trv") V.modal = null;
    boardDecide(id, a, "");
  } else if (ds.trrj) {
    V.menu = false;
    V.draft = { trrj: ds.trrj, comment: "", err: "", from: V.modal === "trv" ? "trv" : "" };
    V.modal = "trrj";
    render();
  } else if ("trrjback" in ds) {
    const id = V.draft && V.draft.trrj;
    V.draft = { trv: id };
    V.modal = "trv";
    render();
  } else if ("trrjok" in ds) {
    const d = V.draft;
    if (!d || !d.trrj) return;
    if (!(d.comment || "").trim()) {
      d.err = "Escribe por qué la rechazas.";
      render();
      return;
    }
    V.modal = null;
    boardDecide(d.trrj, "no", d.comment.trim());
  } else if ("costeye" in ds) {
    V.costRoles[ds.costeye] = !V.costRoles[ds.costeye];
    render();
  } else if (ds.costview !== undefined) {
    if (!isBoard() || !ds.v) return;
    D.costView = ds.v;
    V.showCost = false;
    save();
    V.toast = ds.v === "totals" ? "Dirección ve solo totales" : "Dirección ve el coste por persona";
    render();
  } else if (ds.leavex) {
    const x = PERSON(ds.leavex);
    V.menu = false;
    if (x) {
      V.draft = { kind: "leave", team: areaOf(x), lead: x.team, sel: x.id, date: "", err: "" };
      V.modal = "leave";
      render();
    }
  } else if (ds.leaveopen) {
    V.menu = false;
    V.draft = { kind: "leave", team: ds.leaveopen.split("||")[1], lead: ds.leaveopen.split("||")[0], sel: "", date: "", err: "" };
    V.modal = "leave";
    render();
  } else if ("leavedo" in ds) {
    const d = V.draft,
      x = (D.people || []).find((q) => q.id === d.sel);
    if (!x || !d.date) {
      d.err = !x ? "Elige a quién." : "Pon su último día.";
      render();
      return;
    }
    const tools = new Set(),
      names = [];
    D.projects
      .filter((q) => !q.archived && q.owner === meName())
      .forEach((q) =>
        q.roles.forEach((r) =>
          (r.fill || []).forEach((f, i) => {
            if (f && f.pid === x.id) {
              Object.values(r.tools || {}).forEach((o) => o && tools.add(o));
              r.fill[i] = { src: "new", vacated: x.name };
              if (!names.includes(q.name)) names.push(q.name);
            }
          })
        )
      );
    V.undo = { leave: x.id, snap: JSON.stringify({ projects: D.projects, notes: D.notes }) };
    x.leaving = { date: d.date, why: d.why || "quit", tools: [...tools], projects: names };
    D.notes.unshift({ ic: "user-minus", k: "rev", to: "board", t: `${meName()} ha dado de baja a ${x.name}`, s: `Último día: ${fmtShort(d.date)}${names.length ? " · deja sin cubrir " + names.map((n) => "«" + n + "»").join(" y ") : ""} · solo aviso`, ts: Date.now(), r: 0 });
    save();
    V.modal = null;
    V.toast = `${x.name} se va el ${fmtShort(d.date)}`;
    V.toastAct = "Deshacer";
    render();
  } else if (ds.tmp && V.draft) {
    const st = new Set(V.draft.sel || []);
    st.has(ds.tmp) ? st.delete(ds.tmp) : st.add(ds.tmp);
    V.draft.sel = [...st];
    if (V.draft.sel.length) V.draft.perr = "";
    render();
  } else if (ds.trwp) {
    const d = V.draft;
    d.whoIds = d.whoIds || [];
    d.whoIds = d.whoIds.includes(ds.trwp) ? d.whoIds.filter((i) => i !== ds.trwp) : [...d.whoIds, ds.trwp];
    render();
  } else if (ds.pcancel) {
    V.menu = null;
    V.modal = "pcancel";
    V.draft = { pid: ds.pcancel, t: "" };
    render();
    setTimeout(() => document.getElementById("pcx")?.focus(), 50);
  } else if ("pcancelok" in ds && V.draft) {
    const q = D.projects.find((x) => x.id === V.draft.pid), t = (V.draft.t || "").trim();
    if (!q) return;
    if (!t) { V.draft.err = true; render(); document.getElementById("pcx")?.focus(); return; }
    const snap = JSON.stringify({ projects: D.projects, toolReqs: D.toolReqs, people: D.people, licenses: D.licenses, notes: D.notes }), b = isBoard();
    q.prevStatus = q.status;
    q.status = "cancelled";
    q.cancel = { by: b ? "b" : "m", t, ts: Date.now(), who: meName() };
    pushThread(q, { who: b ? "b" : "m", k: "cancel", t, ts: Date.now() });
    D.notes.unshift(b ? { ic: "times-circle", k: "team", to: q.owner, t: `Dirección ha cancelado «${q.name}»`, s: t, p: q.id, ts: Date.now(), r: 0 } : { ic: "times-circle", k: "rev", to: "board", t: `${q.owner} ha cancelado «${q.name}»`, s: t, p: q.id, ts: Date.now(), r: 0 });
    V.modal = null;
    V.draft = null;
    V.undo = { decision: true, snap, cancelp: true };
    V.toastAct = "Deshacer";
    V.toast = "Proyecto cancelado";
    save();
    render();
  } else if ("ratesall" in ds) {
    V.ratesAll = !V.ratesAll;
    render();
  } else if (ds.phist) {
    V.menu = null;
    V.modal = "hist";
    V.draft = { pid: ds.phist };
    render();
  } else if (ds.rvfold) {
    const f = new Set(V.rvfold || []), id = ds.rvfold, sel = `.rvone[data-rvid="${id}"]`, o = document.querySelector(sel), h0 = o ? o.offsetHeight : 0;
    f.has(id) ? f.delete(id) : f.add(id);
    V.rvfold = [...f];
    render();
    const n = document.querySelector(sel);
    if (n && h0 && n.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const h1 = n.offsetHeight;
      n.style.overflow = "hidden";
      n.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 220, easing: "cubic-bezier(.2,0,0,1)" }).onfinish = () => (n.style.overflow = "");
    }
  } else if (ds.thr) {
    V.thr = V.thr === ds.thr ? "" : ds.thr;
    render();
  } else if (ds.setlang) {
    V.modal = null;
    setLang(ds.setlang);
    V.toast = ds.setlang === "en" ? "Language: English" : "Idioma: Español";
    render();
  } else if ("langopen" in ds) {
    V.menu = false;
    V.draft = { kind: "lang" };
    V.modal = "lang";
    render();
  } else if ("profile" in ds) {
    const k = ME().name, pf = (D.profiles || {})[k] || {};
    V.menu = false;
    V.draft = { kind: "profile", title: pf.title || (isBoard() ? "Dirección general" : "Responsable de proyecto"), email: pf.email || "", phone: pf.phone || "" };
    V.modal = "profile";
    render();
  } else if ("profsave" in ds && V.draft) {
    const d = V.draft, em = (d.email || "").trim();
    if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { d.err = "Escribe un correo válido."; render(); document.getElementById("pfe")?.focus(); return; }
    D.profiles = D.profiles || {};
    D.profiles[ME().name] = { title: (d.title || "").trim().slice(0, 60), email: em, phone: (d.phone || "").trim().slice(0, 30) };
    save();
    V.modal = null;
    V.toast = "Perfil guardado";
    render();
  } else if (ds.movex) {
    const x = PERSON(ds.movex);
    if (x) {
      V.draft = { kind: "move", sel: x.id, slot: "", keep: "hire", err: "" };
      V.modal = "move";
      render();
    }
  } else if ("movedo" in ds && V.draft && V.draft.kind === "move") {
    const d = V.draft;
    if (!d.slot) { d.err = "Elige a qué proyecto y puesto va."; render(); return; }
    const res = doMove(d);
    V.modal = null;
    V.toast = res;
    save();
    render();
  } else if (ds.asgx) {
    const x = PERSON(ds.asgx);
    if (x) {
      V.draft = { kind: "asg", team: areaOf(x), lead: x.team, sel: x.id, slot: "", err: "" };
      V.modal = "asg";
      render();
    }
  } else if (ds.asgopen) {
    V.menu = false;
    V.draft = { kind: "asg", team: ds.asgopen.split("||")[1], lead: ds.asgopen.split("||")[0], sel: "", slot: "", err: "" };
    V.modal = "asg";
    render();
  } else if ("asgdo" in ds) {
    const d = V.draft;
    if (!d.sel || !d.slot) {
      d.err = !d.sel ? "Elige a quién." : "Elige el puesto.";
      render();
      return;
    }
    const [prid, ri, i] = d.slot.split("|"),
      pj = D.projects.find((q) => q.id === prid),
      r = pj && pj.roles[Number(ri)],
      x = (D.people || []).find((q) => q.id === d.sel);
    if (pj && r && x && pj.owner === meName() && isFree(x.id)) {
      r.fill = r.fill || [];
      r.fill[Number(i)] = { src: "mine", pid: x.id };
      save();
      V.toast = `${x.name} ya está en «${pj.name}»`;
    }
    V.modal = null;
    render();
  } else if (ds.pxx) {
    const x = PERSON(ds.pxx), qs = x ? projectsOf(x.id).filter((q) => q.owner === meName()) : [];
    V.menu = false;
    V.draft = { kind: "px", team: areaOf(x), lead: x.team, sel: qs.length === 1 ? x.id + "|" + qs[0].id : "", err: "", only: x.id };
    V.modal = "px";
    render();
  } else if (ds.pxopen) {
    V.menu = false;
    V.draft = { kind: "px", team: ds.pxopen.split("||")[1], lead: ds.pxopen.split("||")[0], sel: "", err: "" };
    V.modal = "px";
    render();
  } else if ("pxmenu" in ds) {
    V.menu = V.menu === "px:" + ds.pxmenu ? false : "px:" + ds.pxmenu;
    V.pxsure = null;
    render();
  } else if (ds.pxask) {
    V.pxsure = ds.pxask;
    render();
  } else if (ds.pxout || "pxdo" in ds) {
    if ("pxdo" in ds && !V.draft.sel) {
      V.draft.err = "Elige a quién.";
      render();
      return;
    }
    const [pid, prid] = (ds.pxout || V.draft.sel).split("|"),
      pj = D.projects.find((q) => q.id === prid),
      px = (D.people || []).find((q) => q.id === pid);
    if (pj && px && pj.owner === meName()) {
      const r = pj.roles.find((q) => (q.fill || []).some((f) => f.pid === pid));
      if (r) {
        const i = r.fill.findIndex((f) => f.pid === pid);
        if (seatsOf(r) > 1) {
          r.n = seatsOf(r) - 1;
          r.fill.splice(i, 1);
        } else pj.roles.splice(pj.roles.indexOf(r), 1);
      }
      D.notes.unshift({ ic: "times", k: "rev", to: "board", t: `${pj.owner} ha sacado a ${px.name} de «${pj.name}»`, s: "Queda libre · solo aviso", p: pj.id, ts: Date.now(), r: 0 });
      save();
      V.toast = `${px.name} ya está libre`;
    }
    V.menu = false;
    V.pxsure = null;
    if ("pxdo" in ds) V.modal = null;
    render();
  } else if ("hire" in ds) {
    V.menu = false;
    if (ds.hteam && !isBoard()) {
      /* free people in the team come first: no modal while someone of that kind is waiting */
      const [hl, ht] = ds.hteam.split("||"),
        wait = (D.people || []).filter((x) => x.team === hl && areaOf(x) === ht && isOpen(x.id));
      if (wait.length) {
        V.toast = `Ya tienes ${wait.length === 1 ? wait[0].name + " libre" : wait.map((x) => x.name.split(" ")[0]).join(", ") + " libres"} en ${ht}. Asígna${wait.length === 1 ? "la" : "las"} a un proyecto antes de añadir a alguien.`;
        render();
        return;
      }
    }
    V.draft = { kind: ds.hire === "tool" ? "tool" : "person", where: "", pid: "", fid: "", when: "now", why: "", opt: null, who: "", err: "", team: ds.hteam ? ds.hteam.split("||")[1] : "", lead: ds.hteam ? ds.hteam.split("||")[0] : "" };
    V.modal = "ask";
    render();
  } else if ("tcmenu" in ds) {
    V.menu = V.menu === "tc:" + ds.tcmenu ? false : "tc:" + ds.tcmenu;
    render();
  } else if ("trmenu" in ds) {
    V.menu = V.menu === "tr:" + ds.trmenu ? false : "tr:" + ds.trmenu;
    render();
  } else if (ds.tredit) {
    V.menu = false;
    const tr = (D.toolReqs || []).find((x) => x.id === ds.tredit),
      old = !tr && D.projects.find((x) => x.id === ds.tredit),
      ro = old && old.roles[0],
      src = old && D.projects.find((x) => x.id === old.parent);
    if (tr && tr.by === meName() && tr.status === "pending") {
      const names = (tr.who || "").split(", ").filter(Boolean);
      V.draft = { kind: "tool", where: tr.forId || "team", pid: "", fid: "", when: "now", why: tr.why || "", opt: tr.opt, who: "", err: "", whoIds: (D.people || []).filter((x) => names.includes(x.name)).map((x) => x.id), editReq: tr.id };
      V.draft.sig = askSig(V.draft);
      V.modal = "ask";
      render();
    } else if (old && src && ro && old.owner === meName() && old.status === "pending") {
      /* a request to add someone is edited where it was made: on its page, with the person form */
      V.modal = null;
      go("project", old.id);
      openPerson(old, 0);
    }
  } else if (ds.afold) {
    const a = new Set(V.aopen || []);
    a.has(ds.afold) ? a.delete(ds.afold) : a.add(ds.afold);
    V.aopen = [...a];
    render();
  } else if (ds.renew) {
    const old = D.projects.find((x) => x.id === ds.renew),
      src = old && D.projects.find((x) => x.id === old.parent),
      ro = old && old.roles[0];
    const op = old && src && propOf(src);
    if (old && src && ro && old.owner === meName() && (!op || op.status !== "pending")) {
      /* same flow as any change to a running project: the person goes into the project's proposal,
         prefilled with what was asked, and the form opens so it can be adjusted right away */
      let c = op;
      if (!c) { c = proposeOn(src); D.projects.unshift(c); }
      const at = c.roles.length;
      JSON.parse(JSON.stringify(old.roles)).forEach((r, k) => {
        r.uid = "u" + Date.now().toString(36) + k;
        r.fill = (r.fill || []).map((f) => (f.src === "mine" && f.pid && !isFree(f.pid, c.id) ? { src: "new" } : { src: f.src, ...(f.pid ? { pid: f.pid } : {}) }));
        c.roles.push(r);
      });
      if (old.review && old.review.comment) c.prevRv = { comment: old.review.comment, ts: old.review.ts || Date.now() };
      old.hidReq = [...new Set([...(old.hidReq || []), noteViewer()])];
      save();
      V.modal = null;
      go("project", c.id);
      openPerson(c, at);
    } else if (old && src && ro && old.owner === meName()) {
      /* a rejected request is closed: the new one starts from the same data, on its own page */
      const c = amendOf(src);
      c.roles = JSON.parse(JSON.stringify(old.roles));
      c.roles.forEach((r) => (r.fill = (r.fill || []).map((f) => (f.src === "mine" && f.pid && !isFree(f.pid, c.id) ? { src: "new" } : { src: f.src, ...(f.pid ? { pid: f.pid } : {}) }))));
      c.justif = old.justif || "";
      D.projects.unshift(c);
      save();
      V.modal = null;
      go("project", c.id);
    }
  } else if (ds.extend) {
    const src = D.projects.find((x) => x.id === ds.extend);
    if (src && src.owner === meName()) {
      V.modal = null;
      let c = propOf(src);
      if (!c) {
        c = proposeOn(src);
        D.projects.unshift(c);
        save();
      }
      go("project", c.id);
    }
  } else if (ds.pdiscard) {
    const c = D.projects.find((x) => x.id === ds.pdiscard);
    if (c && c.full && canEdit(c)) {
      D.projects = D.projects.filter((x) => x !== c);
      save();
      V.toast = "Cambios descartados";
      go("project", c.parent);
    }
  } else if (ds.unrm) {
    const c = P(),
      b = baseOf(c),
      o = b && b.roles.find((r) => r.uid === ds.unrm);
    if (o && canEdit(c)) {
      c.roles.push(clone(o));
      save();
      render();
    }
  } else if ("delno" in ds) {
    V.delAsk = null;
    render();
  } else if (ds.rx !== undefined) {
    V.rx = V.rx || {};
    const k = pr.id + ":" + ds.rx;
    V.rx[k] = !rOpen(pr, Number(ds.rx), canEdit(pr));
    V.ms = null;
    render();
  } else if (ds.ms) {
    V.ms = V.ms === ds.ms ? null : ds.ms;
    render();
  } else if (ds.msel) {
    const [k, ck, id] = ds.msel.split("|");
    if (pr && canEdit(pr)) {
      if (k === "s" && ck === "genai") {
        const cur = genaiAll(pr),
          nx = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
        pr.shared.genai = nx[0] || null;
        pr.shared.genaiX = nx.slice(1);
      } else if (k === "s") pr.shared[ck] = pr.shared[ck] === id ? null : id;
      else {
        const r = pr.roles[Number(k)];
        r.tools[ck] = r.tools[ck] === id ? null : id;
        if (r.qty) delete r.qty[ck];
      }
      if (pr.qty) delete pr.qty[ck];
      save();
      render();
    }
  } else if ("toolchg" in ds) {
    V.tchg = V.tchg === ds.toolchg ? null : ds.toolchg;
    render();
  } else if (ds.toolswap) {
    const [from, to] = ds.toolswap.split("|");
    if (pr && canEdit(pr)) {
      V.undo = { roles: JSON.stringify(pr.roles), shared: JSON.stringify(pr.shared || {}), pqty: JSON.stringify(pr.qty || {}), pid: pr.id };
      V.toastAct = "Deshacer";
      pr.roles.forEach((r) => {
        for (const ck in r.tools)
          if (r.tools[ck] === from) {
            if (TC[ck]) r.tools[ck] = to;
            else {
              delete r.tools[ck];
              r.tools[to] = to;
            }
            if (r.qty) delete r.qty[ck];
          }
      });
      for (const ck in pr.shared || {})
        if (pr.shared[ck] === from) {
          pr.shared[ck] = to;
          if (pr.qty) delete pr.qty[ck];
        }
      V.tchg = null;
      V.toast = "Herramienta cambiada";
      save();
      render();
    }
  } else if (ds.tnew) {
    V.tnew = V.tnew === ds.tnew ? null : ds.tnew;
    render();
  } else if (ds.toolrm) {
    if (pr && canEdit(pr)) {
      const id = ds.toolrm;
      V.undo = { roles: JSON.stringify(pr.roles), shared: JSON.stringify(pr.shared || {}), pqty: JSON.stringify(pr.qty || {}), pid: pr.id };
      V.toastAct = "Deshacer";
      pr.roles.forEach((r) => {
        for (const ck in r.tools)
          if (r.tools[ck] === id) {
            if (TC[ck]) r.tools[ck] = null;
            else delete r.tools[ck];
            if (r.qty) delete r.qty[ck];
          }
      });
      for (const ck in pr.shared || {})
        if (pr.shared[ck] === id) {
          pr.shared[ck] = null;
          if (pr.qty) delete pr.qty[ck];
        }
      V.toast = "Herramienta quitada";
      save();
      render();
    }
  } else if (ds.seatrm) {
    const [ri, si] = ds.seatrm.split("|").map(Number),
      r = pr && pr.roles[ri];
    if (r && canEdit(pr)) {
      V.undo = { roles: JSON.stringify(pr.roles), pid: pr.id };
      V.toastAct = "Deshacer";
      if (seatsOf(r) > 1) {
        r.fill = arr(r.fill);
        r.fill.splice(si, 1);
        if (r.n > 0) r.n -= 1;
        if (si < r.ai) r.ai -= 1;
        r.ai = Math.min(r.ai, Math.max(1, r.n));
        r.qty = {};
        syncFill(pr);
      } else pr.roles.splice(ri, 1);
      {
        const fl = ((r.fill || [])[si] || (r.fill || [])[0] || {}), w = fl.pid && PERSON(fl.pid);
        V.toast = pr.full ? (w ? `${w.name} sale del equipo si Dirección lo aprueba` : "Puesto quitado de la propuesta") : w ? `${w.name} quitada del proyecto` : "Puesto quitado";
      }
      if (V.modal === "pform") V.modal = null;
      V.ropen = null;
      V.delAsk = null;
      save();
      render();
    }
  } else if (ds.del) {
    const dr = pr.roles[Number(ds.del)];
    if (dr && (dr.fill || []).some((f) => f.pid) && !("sure" in ds)) {
      V.delAsk = Number(ds.del);
      render();
      return;
    }
    V.delAsk = null;
    pr.roles.splice(Number(ds.del), 1);
    V.ropen = null;
    save();
    render();
  } else if ("addrole" in ds) {
    openPerson(pr, -1);
  } else if (ds.asgq) {
    const [ri, si, pid] = ds.asgq.split("|"),
      r = pr && pr.roles[Number(ri)];
    if (r && r.fill && r.fill[Number(si)]) {
      V.undo = { roles: JSON.stringify(pr.roles), pid: pr.id };
      V.toastAct = "Deshacer";
      r.fill[Number(si)] = { src: "other", pid };
      V.toast = `Asignado a ${PERSON(pid).name}`;
      save();
      render();
    }
  } else if (ds.pmore !== undefined) {
    V.px = V.px || {};
    const k = pr.id + ":" + ds.pmore;
    V.px[k] = !V.px[k];
    const y0 = document.getElementById("role-" + ds.pmore)?.getBoundingClientRect().top;
    render();
    const row = document.getElementById("role-" + ds.pmore);
    if (row && y0 != null) window.scrollBy(0, row.getBoundingClientRect().top - y0);
    row?.querySelector("[data-pmore]")?.focus({ preventScroll: true });
  } else if (ds.pedit !== undefined) {
    openPerson(pr, Number(ds.pedit));
  } else if (ds.pft) {
    const d = V.draft;
    const c = catOfOpt(ds.pft);
    d.tools = d.tools.includes(ds.pft) ? d.tools.filter((x) => x !== ds.pft) : [...d.tools.filter((x) => multiCat(c) || catOfOpt(x) !== c), ds.pft];
    render();
  } else if ("pfp" in ds) {
    V.draft.pOpen = !V.draft.pOpen;
    render();
  } else if ("pfmore" in ds) {
    V.draft.more = !V.draft.more;
    render();
  } else if ("pfsave" in ds) {
    const d = V.draft;
    if (d.ded === "custom") {
      const h = Math.round(Number((document.getElementById("pf-hrs") || {}).value || d.hrs) * 4);
      if (!(h > 0 && h < HPM)) {
        d.err = "";
        d.hrsErr = true;
        render();
        return;
      }
      d.ded = String(h);
    }
    if (!d.fid) {
      d.err = "Elige un puesto";
      render();
      return;
    }
    if (d.who === "reg") {
      const nm = (d.regn || "").trim();
      if (!nm) { d.regErr = true; render(); document.getElementById("pf-regn")?.focus(); return; }
      const x = { id: "u" + Date.now(), name: nm.slice(0, 80), fid: d.fid, lvl: F(d.fid).gr.includes(d.lvl) ? d.lvl : "mid", team: pr.owner, ent: pr.ent || (MGR(pr.owner) || {}).ent || D.entities[0].id };
      D.people.push(x);
      d.who = x.id;
    }
    if (pr && canEdit(pr)) {
      V.undo = { roles: JSON.stringify(pr.roles), pid: pr.id };
      V.toastAct = "Deshacer";
      const hrs = d.ded === "full" ? 0 : Number(d.ded),
        old = d.ri >= 0 ? pr.roles[d.ri] : null,
        r = old && old.id === d.fid ? old : mkRole(d.fid, 1);
      r.n = hrs ? 0 : 1;
      r.hours = hrs;
      r.tools = Object.fromEntries(d.tools.map((x) => [x, x]));
      r.qty = {};
      r.fill = [d.who === "new" ? { src: "new" } : { src: "mine", pid: d.who }];
      r.ai = hasAiTool(r) ? 1 : 0;
      r.ct = d.ct || "emp";
      if (hrs && !d.ctSet && r.ct === "emp") r.ct = "free";
      if (d.lvl && F(r.id).gr.includes(d.lvl)) r.grade = d.lvl;
      const hv = Number(String(d.hrate || "").replace(/\D/g, ""));
      if (r.ct === "free" && hv) r.hrate = hv;
      else delete r.hrate;
      const rv = r.ct === "free" ? 0 : Number(String(d.rate || "").replace(/\D/g, ""));
      if (rv) r.rate = rv;
      else delete r.rate;
      if (d.country) r.country = d.country;
      else delete r.country;
      if (old) pr.roles[d.ri] = r;
      else pr.roles.push(r);
      syncFill(pr);
      V.modal = null;
      V.toast = old ? "Persona actualizada" : "Persona añadida";
      save();
      render();
    }
  } else if ("addroleOld" in ds) {
    V.modal = "role";
    V.rq = "";
    V.rpos = "";
    V.rexp = null;
    render();
    setTimeout(() => document.getElementById("rq")?.focus(), 30);
  } else if (ds.addr) {
    {
      V.ropen = pr.id + ":" + pr.roles.length;
      const nr = mkRole(ds.addr, 1);
      nr.ct = pr.months && pr.months <= 3 ? "free" : "emp";
      pr.roles.push(nr);
      applyAiPref({ ...pr, roles: [nr], shared: {} });
      syncFill(pr);
    }
    V.modal = null;
    save();
    render();
    {
      const el = document.getElementById("role-" + (pr.roles.length - 1));
      if (el) scrollTo({ top: scrollY + el.getBoundingClientRect().top - 90, behavior: SMOOTH() });
    }
  } else if (ds.tchiprm && pr && canEdit(pr)) {
    /* quick removal from the team list; the toast can undo it */
    const [ix, y] = ds.tchiprm.split("|"), r = pr.roles[+ix];
    if (r && r.tools) {
      V.undo = { tchip: pr.id, ix: +ix, tools: { ...r.tools }, ai: r.ai };
      Object.keys(r.tools).forEach((k) => r.tools[k] === y && delete r.tools[k]);
      r.ai = hasAiTool(r) ? 1 : 0;
      save();
      V.toast = `${short0(opt(y) ? opt(y).n : y)} quitado`;
      V.toastAct = "Deshacer";
      render();
    }
  } else if ("pfnew" in ds && V.draft) {
    V.draft.nOpen = true;
    V.draft.nErr = false;
    render();
    document.getElementById("pf-nn")?.focus();
  } else if ("pfnewx" in ds && V.draft) {
    Object.assign(V.draft, { nOpen: false, nn: "", np: "", nai: false, nErr: false });
    render();
  } else if (ds.pfnai !== undefined && V.draft) {
    V.draft.nai = ds.pfnai === "1";
    render();
  } else if (ds.npai && isBoard()) {
    const o = opt(ds.npai), to = isAiTool(ds.npai) ? "other" : "genai";
    if (o && o.req) {
      TC[o.cat].opts = TC[o.cat].opts.filter((x) => x !== o);
      o.cat = to;
      TC[to].opts.push(o);
      const c = (D.custom || []).find((x) => x.id === o.id);
      if (c) c.cat = to;
      save();
      render();
    }
  } else if ("pfnewok" in ds && V.draft) {
    const d = V.draft, n = (d.nn || "").trim();
    if (!n) { d.nErr = true; render(); document.getElementById("pf-nn")?.focus(); return; }
    const o = { id: "c" + Date.now(), cat: d.nai ? "genai" : "other", n, p: Number(String(d.np || "").replace(",", ".")) || 0, cur: "EUR", req: true, note: "nuevo · lo pide " + meName() + " · lo aprueba Dirección con el equipo" };
    D.custom.push(o);
    TC[o.cat].opts.push(o);
    ALLOPTS.push(o);
    d.tools = [...d.tools, o.id];
    Object.assign(d, { nOpen: false, nn: "", np: "", nai: false, nErr: false });
    save();
    render();
  } else if ("resuggest" in ds) {
    V.undo = { resug: pr.id, roles: JSON.parse(JSON.stringify(pr.roles)) };
    V.toastAct = "Deshacer";
    suggest(pr);
    applyAiPref(pr);
    syncFill(pr, true);
    save();
    V.toast = "Equipo propuesto de nuevo";
    render();
  } else if ("send" in ds && pr && canEdit(pr)) {
    if (!(pr.justif || "").trim()) {
      V.jerr = true;
      render();
      document.getElementById("pj")?.focus();
      return;
    }
    V.jerr = false;
    if (pr.status === "changes") {
      /* answering a request for changes: a short window with what Leadership asked and room to say what changed */
      V.draft = { resend: pr.id, reply: "" };
      V.modal = "resend";
      render();
      return;
    }
    pushThread(pr, { who: "m", k: "sent", t: pr.justif, ts: Date.now() });
    pr.status = "pending";
    pr.sentAt = Date.now();
    D.notes.unshift({ ic: "file-alt", k: "rev", to: "board", t: `${pr.owner} ha enviado «${pr.name}»`, s: "Pendiente de tu aprobación", p: pr.id, ts: Date.now(), r: 0 });
    save();
    V.toast = "Enviada a Dirección";
    render();
  } else if ("resendok" in ds && V.draft && V.draft.resend) {
    const rp = D.projects.find((x) => x.id === V.draft.resend),
      reply = (V.draft.reply || "").trim();
    if (rp && canEdit(rp)) {
      pushThread(rp, { who: "m", k: "resent", t: reply, ts: Date.now() });
      rp.status = "pending";
      rp.sentAt = Date.now();
      rp.reply = reply;
      /* the earlier «ha enviado» notice is out of date now */
      D.notes.forEach((n) => {
        if (n.p === rp.id && n.k === "rev" && n.to === "board") n.hid = [...(n.hid || []), "board"];
      });
      D.notes.unshift({ ic: "file-alt", k: "rev", to: "board", t: `${rp.owner} ha reenviado «${rp.name}» con cambios`, s: reply || "Pendiente de tu aprobación", p: rp.id, ts: Date.now(), r: 0 });
      V.toast = "Reenviada a Dirección";
    }
    V.modal = null;
    V.draft = null;
    save();
    render();
  } else if ("gochg" in ds) {
    const t = document.querySelector(".cmain .rcard");
    if (t) {
      t.scrollIntoView({ behavior: SMOOTH(), block: "start" });
      t.classList.add("flash");
      setTimeout(() => t.classList.remove("flash"), 1600);
    }
  } else if ("withdraw" in ds && pr && pr.status === "pending" && pr.owner === meName() && !isBoard()) {
    pr.status = "draft";
    delete pr.sentAt;
    save();
    V.toast = "Propuesta retirada: vuelve a ser un borrador";
    render();
  } else if ("rcancel" in ds) {
    V.rmode = "";
    V.rerr = "";
    render();
  } else if (("approve" in ds || "askchg" in ds || "reject" in ds) && pr && isBoard() && pr.status === "pending") {
    const dec = "approve" in ds ? "approve" : "askchg" in ds ? "changes" : "reject",
      cm = (V.rcomment || "").trim();
    if (dec !== "approve" && V.rmode !== dec) {
      V.rmode = dec;
      V.rerr = "";
      render();
      { const rc = document.getElementById("rc"); if (rc) { rc.scrollIntoView({ block: "center", behavior: "smooth" }); rc.focus({ preventScroll: true }); } }
      return;
    }
    if (dec !== "approve" && !cm) {
      V.rerr = dec === "changes" ? "Escribe qué cambios pides." : "Escribe por qué la rechazas.";
      render();
      { const rc = document.getElementById("rc"); if (rc) { rc.scrollIntoView({ block: "center", behavior: "smooth" }); rc.focus({ preventScroll: true }); } }
      return;
    }
    V.rerr = "";
    V.rmode = "";
    V.rcomment = "";
    pushThread(pr, { who: "b", k: dec, t: cm, ts: Date.now() });
    pr.review = { by: "Dirección", ts: Date.now(), decision: dec, comment: cm };
    delete pr.reply;
    if (dec === "approve") approveProject(pr);
    else pr.status = dec === "changes" ? "changes" : "rejected";
    D.notes.unshift({
      ic: dec === "approve" ? "check-circle" : dec === "changes" ? "pen" : "times-circle",
      k: "team",
      to: pr.owner,
      t: dec === "approve" ? (pr.full ? `Dirección ha aprobado los cambios en «${pr.name}»` : `Dirección ha aprobado «${pr.name}»`) : dec === "changes" ? `Dirección pide cambios en «${pr.name}»` : `Dirección ha rechazado «${pr.name}»`,
      s: cm,
      p: pr.full && dec === "approve" ? pr.parent : pr.id,
      ts: Date.now(),
      r: 0,
    });
    /* Leadership keeps a trace of the changes it asked for (already read: it is its own action) */
    if (dec === "changes") D.notes.unshift({ ic: "pen", k: "team", to: "board", t: `Has pedido cambios en «${pr.name}»`, s: `Esperando a ${pr.owner}: ${cm}`, p: pr.id, ts: Date.now(), r: 1 });
    save();
    V.toast = dec === "approve" ? (pr.full ? "Cambios aprobados: ya están en el proyecto" : "Propuesta aprobada: ya está en curso") : dec === "changes" ? "Has pedido cambios" : "Propuesta rechazada";
    render();
  } else if (ds.hired) {
    const [ri, i] = ds.hired.split("|").map(Number),
      r = pr && pr.roles[ri];
    if (r && (r.fill || [])[i] && r.fill[i].hiring) {
      V.draft = { pid: pr.id, ri, i, name: "", err: "" };
      V.modal = "hired";
      render();
    }
  } else if ("hiredok" in ds) {
    const d = V.draft,
      q = D.projects.find((x) => x.id === d.pid),
      r = q && q.roles[d.ri],
      f = r && (r.fill || [])[d.i];
    if (!f) return;
    if (!d.name.trim()) {
      d.err = "Escribe el nombre de la persona.";
      render();
      return;
    }
    const g = gradeOf(r),
      x = { id: "u" + Date.now(), name: d.name.trim().slice(0, 80), fid: r.id, lvl: LVLS.includes(g) ? g : LV[g] > 2 ? "senior" : "mid", team: q.owner, ent: q.ent };
    if (d.cost > 0) x.cost = d.cost;
    D.people.push(x);
    r.fill[d.i] = { src: "mine", pid: x.id };
    save();
    V.modal = null;
    V.toast = `${x.name} se incorpora al equipo`;
    render();
  } else if ("addteam" in ds) {
    V.menu = false;
    V.draft = { name: "", lead: isBoard() ? D.managers[0].name : meName(), err: "" };
    V.modal = "team";
    render();
  } else if (ds.renteam) {
    V.menu = false;
    const [lead, t] = ds.renteam.split("||");
    V.draft = { name: t, lead, edit: t, err: "" };
    V.modal = "team";
    render();
  } else if (ds.delteam) {
    V.menu = false;
    const [lead, t] = ds.delteam.split("||"),
      m = MGR(lead);
    if (m && teamsOf(lead).length > 1 && !(D.people || []).some((x) => x.team === lead && unitOf(x) === t)) {
      m.teams = teamsOf(lead).filter((x) => x !== t);
      m.team = m.teams[0];
      save();
      V.toast = `Equipo «${t}» eliminado`;
    }
    render();
  } else if ("saveteam" in ds) {
    const d = V.draft,
      n = (d.name || "").trim().slice(0, 60),
      m = MGR(d.lead);
    if (!n) d.err = "Escribe el nombre del equipo.";
    else if (m && teamsOf(m.name).some((t) => t !== d.edit && t.toLowerCase() === n.toLowerCase())) d.err = "Ya tienes un equipo con ese nombre.";
    else d.err = "";
    d.perr = !d.edit && !(d.sel || []).length ? "Elige al menos una persona para el equipo." : "";
    if (d.err || d.perr || !m) {
      render();
      document.getElementById("tmn")?.focus();
      return;
    }
    if (d.edit) {
      (D.people || []).forEach((x) => {
        if (x.team === m.name && unitOf(x) === d.edit) x.unit = n;
      });
      m.teams = teamsOf(m.name).map((t) => (t === d.edit ? n : t));
      if (m.custom) m.custom = m.custom.map((t) => (t === d.edit ? n : t));
      m.team = m.teams[0];
    } else {
      m.teams = [...teamsOf(m.name), n];
      m.custom = [...(m.custom || []), n];
      (d.sel || []).forEach((id) => { const x = PERSON(id); if (x) x.unit = n; });
      if (isBoard() && m.name !== meName()) D.notes.unshift({ ic: "users-alt", k: "team", to: m.name, t: `Dirección ha creado el equipo ${n} para ti`, s: `Con ${(d.sel || []).length} persona${(d.sel || []).length !== 1 ? "s" : ""} de tu equipo`, p: "", ts: Date.now(), r: 0 });
    }
    save();
    V.modal = null;
    V.toast = d.edit ? `Equipo renombrado a «${n}»` : `Equipo «${n}» creado con ${(d.sel || []).length} persona${(d.sel || []).length !== 1 ? "s" : ""}`;
    render();
  } else if ("addperson" in ds) {
    V.menu = false;
    const [pt, pu] = (ds.addperson || "").split("||");
    V.draft = { name: "", fid: "product-designer", lvl: "mid", team: pt || (isBoard() ? D.managers[0].name : meName()), ...(pu ? { unit: pu } : {}), cost: 0, err: "" };
    V.modal = "person";
    render();
  } else if ("savep" in ds) {
    const d = V.draft;
    if (!d.name.trim()) {
      d.err = "Escribe el nombre de la persona.";
      render();
      return;
    }
    const tm = isBoard() ? d.team : meName(),
      x = { id: "u" + Date.now(), name: d.name.trim().slice(0, 80), fid: d.fid, lvl: d.lvl, team: tm, ...(teamsOf(tm).length > 1 ? { unit: teamsOf(tm).includes(d.unit) ? d.unit : teamsOf(tm)[0] } : {}), ent: (MGR(tm) || {}).ent || D.entities[0].id };
    if (d.cost > 0) x.cost = d.cost;
    D.people.push(x);
    const sl = d.asg ? regSlots(tm, d.fid).find((z) => z.key === d.asg) : null;
    if (sl) sl.p.roles[sl.ri].fill[sl.si] = { src: "mine", pid: x.id };
    save();
    V.modal = null;
    V.toast = sl ? `${x.name} añadida y asignada a «${sl.p.name}»` : `${x.name} añadida al equipo`;
    render();
  } else if (ds.shopen) {
    V.shOpen = V.shOpen === ds.shopen ? null : ds.shopen;
    render();
  } else if (ds.demo != null && t.closest("[data-demo]")) {
    V.demo = !V.demo;
    render();
  } else if (t.closest("[data-demoreset]")) {
    seedData();
    V.rvfold = [];
    V.nav = false;
    document.body.classList.remove("navopen");
    D.tourHidden = true;
    D.as = "manager";
    save();
    V.demo = false;
    V.view = "home";
    V.toast = "Demo reiniciada";
    render();
  } else if (ds.as) {
    D.as = ds.as === "board" ? "board" : "manager";
    if (ds.as.startsWith("m:")) {
      const m = (D.managers || []).find((x) => x.name === ds.as.slice(2));
      if (m && m.name !== D.me.name) D.me = { name: m.name, role: "Responsable", team: m.team };
    }
    V.pf = "all";
    save();
    V.menu = false;
    V.rerr = "";
    V.jerr = false;
    if (V.view === "project" && P() && !canSee(P())) V.view = "projects";
    V.demo = false;
    V.toast = `Ahora ves la demo como ${D.as === "board" ? "Dirección" : meName()}`;
    render();
  } else if (ds.lhold && V.draft) {
    const st = new Set(V.draft.hold || []);
    st.has(ds.lhold) ? st.delete(ds.lhold) : st.add(ds.lhold);
    V.draft.hold = [...st];
    render();
  } else if ("addlic" in ds) {
    if (!isBoard()) return;
    V.draft = { opt: null, scope: D.ent === "all" ? "group" : D.ent, seats: 5, other: 0 };
    V.modal = "lic";
    render();
  } else if ("licconn" in ds) {
    /* add the licence and go straight to the vendor's sign-in: once connected it is read from there */
    const d = V.draft;
    if (!multi()) d.scope = D.entities[0].id;
    /* the contracts already in HUMAIN are read from the vendor once connected; only a new one is added */
    if (!D.licenses.some((l) => l.opt === d.opt && l.scope === d.scope)) {
      const nl = { opt: d.opt, scope: d.scope, seats: d.seats, other: 0, holders: [] };
      nl.renew = defaultRenew(nl);
      D.licenses.push(nl);
    }
    save();
    V.lopen = d.opt;
    V.modal = "intg";
    V.draft = INTGOF(d.opt);
    V.intgWait = false;
    render();
  } else if ("savelic" in ds) {
    const d = V.draft;
    if (!d.opt) { d.err = "Elige una herramienta."; render(); return; }
    if (d.opt === "new") {
      /* a program the catalogue does not have: it joins the catalogue so projects can use it too */
      const nm = (d.nn || "").trim();
      if (!nm) { d.err = "Escribe el nombre del programa."; render(); document.getElementById("licn")?.focus(); return; }
      const o = { id: "c" + Date.now(), cat: d.nai ? "genai" : "other", n: nm.slice(0, 60), p: Number(String(d.np || "").replace(",", ".")) || 0, cur: "EUR", note: "añadido por Dirección" };
      D.custom.push(o);
      TC[o.cat].opts.push(o);
      ALLOPTS.push(o);
      d.opt = o.id;
    }
    if (!multi()) d.scope = D.entities[0].id;
    if ((d.hold || []).length + (d.other || 0) > d.seats) { render(); return; }
    const nl = { opt: d.opt, scope: d.scope, seats: d.seats, other: d.other || 0, holders: SYNC(d.opt) ? [] : [...(d.hold || [])] };
    const adm = (document.getElementById("ladm")?.value || d.adm || "").trim();
    if (adm) nl.admin = /^https?:\/\//.test(adm) ? adm : "https://" + adm;
    nl.renew = defaultRenew(nl);
    if (SYNC(nl.opt)) nl.synced = Date.now();
    D.licenses.push(nl);
    save();
    V.modal = null;
    V.toast = "Licencia registrada";
    render();
  } else if (ds.inv) {
    V.draft = ds.inv;
    V.modal = "inv";
    render();
  } else if (ds.othertool) {
    const [key, cat] = ds.othertool.split("|");
    V.draft = { key, cat, unit: "seat", n: "", pe: "" };
    V.modal = "tool";
    render();
  } else if ("savetool" in ds) {
    const d = V.draft,
      pe = Number(String(d.pe).replace(",", ".")) || 0;
    if (!d.n.trim()) return;
    const o = {
      id: "c" + Date.now(),
      cat: d.cat,
      n: d.n.trim(),
      p: pe,
      cur: "EUR",
      unit: d.unit === "plan" ? "plan" : undefined,
      note: "añadida por la empresa",
    };
    D.custom.push(o);
    TC[d.cat].opts.push(o);
    ALLOPTS.push(o);
    const pr = P();
    if (d.key === "s") pr.shared[d.cat] = o.id;
    else {
      pr.roles[d.key].tools[o.id] = o.id;
      delete (pr.roles[d.key].qty || {})[d.cat];
    }
    V.open = null;
    V.modal = null;
    save();
    V.toast = "Herramienta añadida al catálogo";
    render();
  } else if (ds.deltool) {
    const id = ds.deltool,
      o = opt(id),
      cat = o.cat;
    D.custom = D.custom.filter((c) => c.id !== id);
    TC[cat].opts = TC[cat].opts.filter((c) => c.id !== id);
    const ix = ALLOPTS.findIndex((c) => c.id === id);
    if (ix >= 0) ALLOPTS.splice(ix, 1);
    D.licenses = D.licenses.filter((l) => l.opt !== id);
    D.projects.forEach((p) => {
      p.roles.forEach((r) => {
        if (r.tools[cat] === id) {
          r.tools[cat] = pick(cat);
          delete (r.qty || {})[cat];
        }
        if (r.tools[id]) delete r.tools[id];
      });
      if (p.shared[cat] === id) {
        p.shared[cat] = pick(cat);
        delete p.qty[cat];
      }
      p.own = (p.own || []).filter((x) => x !== id);
    });
    save();
    V.toast = `${o.n} eliminada del catálogo`;
    render();
  } else if ("contact" in ds) {
    V.draft = { name: "", email: "", msg: "", err: "" };
    V.modal = "contact";
    render();
  } else if ("sendcontact" in ds) {
    const d = V.draft;
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email.trim())) {
      d.err = !d.name.trim() ? "Escribe tu nombre." : "Escribe un correo electrónico válido.";
      render();
      return;
    }
    D.requests = D.requests || [];
    D.requests.push({ name: d.name.trim(), email: d.email.trim(), msg: d.msg.trim(), ts: Date.now() });
    save();
    V.modal = null;
    V.toast = "Te escribiremos pronto";
    render();
  } else if ("reset" in ds) {
    V.modal = "reset";
    render();
  } else if ("resetok" in ds) {
    unregisterCustom();
    seedData();
    location.reload();
  } else if ("addent" in ds) {
    V.modal = "ent";
    render();
  } else if ("saveent" in ds) {
    const n = document.getElementById("en").value.trim();
    if (!n) return;
    D.entities.push({ id: "e" + Date.now(), name: n, country: document.getElementById("ec").value || "—", cur: "EUR", vat: "—" });
    save();
    V.modal = null;
    V.toast = "Empresa añadida";
    render();
  } else render();
});
const fmShow = (g) => {
  if (!g) return;
  V.fm = Number(g.dataset.fm);
  document.querySelectorAll(".fm.sel").forEach((x) => x.classList.remove("sel"));
  g.classList.add("sel");
  const c = document.getElementById("fcap");
  if (c) c.textContent = g.dataset.cap;
};
["pointerover", "focusin", "click"].forEach((ev) =>
  document.addEventListener(ev, (e) => e.target.closest && fmShow(e.target.closest("[data-fm]"))),
);
