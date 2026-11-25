function shell() {
  /* a missing or unknown workspace falls back to "all" (same rule as repairData) */
  if (D && D.ent !== "all" && !ENT(D.ent)) D.ent = "all";
  const navs = NAV.map(
    ([k, ic, t]) =>
      `<button class="nv" data-nav="${k}" ${k === "notes" && unread() ? `aria-label="Notificaciones, ${unread()} sin leer"` : ""} aria-current="${V.view === k || (k === "projects" && V.view === "project") || (k === "home" && V.view === "tasks") ? "page" : "false"}">${I(ic)}<span class="nvt">${t}</span>${k === "notes" && unread() ? `<span class="nvb" aria-hidden="true">${unread()}</span>` : ""}</button>`,
  ).join("");
  const cur = esc(D.ent === "all" ? D.org : ENT(D.ent).name),
    ini = esc(initials(D.org)),
    av = `<span class="wsav">${D.logo ? `<img src="${esc(D.logo)}" alt=""/>` : ini}</span>`;
  /* the example shows the selector even with one company: the next one (UK) is listed, switched off until after the demo */
  const sel = !multi() && !D.demo ? "" : `<div class="ws">${`<button class="wsbtn" data-ws aria-expanded="${!!V.ws}" aria-haspopup="menu" ${D.demo && !V.ws ? 'title="SRC es una empresa ficticia, creada para esta demo."' : ""}>${av}<span class="wsn"><b>${cur}</b><small>${multi() ? (D.ent === "all" ? D.entities.length + " empresas" : esc(D.org)) : esc(D.entities[0].country)}</small></span>${I("angle-down")}</button>`}${V.ws && !multi() ? `<div class="wsmenu" role="menu"><button role="menuitemradio" aria-checked="true" data-ws><span><b>${esc(D.entities[0].name)}</b><small>${esc(D.entities[0].country)}</small></span>${I("check")}</button><button role="menuitem" disabled data-tt="Reino Unido estará disponible más adelante."><span><b>SRC Reino Unido</b><small>Próximamente</small></span></button></div>` : ""}${V.ws && multi() ? `<div class="wsmenu" role="menu">${[["all", "Todas las empresas", D.org], ...D.entities.map((e) => [e.id, e.name, e.country])].map(([v, t, sub]) => `<button role="menuitemradio" aria-checked="${D.ent === v}" data-setent="${v}"><span><b>${esc(t)}</b><small>${esc(sub)}</small></span>${D.ent === v ? I("check") : ""}</button>`).join("")}</div>` : ""}${demoTag()}</div>`;
  return { navs, sel };
}
/* mobile: the fixed summary bar's real height becomes the content's bottom spacer */
function syncBar() {
  const cs = document.querySelector(".cside"),
    h = cs && getComputedStyle(cs).position === "fixed" ? Math.ceil(cs.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty("--sbh", (h || 0) + "px");
}
window.addEventListener("resize", syncBar);
/* Custom dropdown (dd): replaces the native <select>. The list lives in <body> (position:fixed) so the modal does not clip it. */
const DDR = {};
const ddLabel = (id, v) => {
  const o = DDR[id].options.find((x) => x[0] === v);
  return o ? o[1] : "";
};
/* simplified flags for the countries HUMAIN prices (drawn, not emoji: Windows shows emoji flags as letters) */
const FLAGS = {
  España: '<rect width="20" height="14" fill="#AA151B"/><rect y="3.5" width="20" height="7" fill="#F1BF00"/>',
  Portugal: '<rect width="20" height="14" fill="#DA291C"/><rect width="8" height="14" fill="#046A38"/><circle cx="8" cy="7" r="2.6" fill="#FFE900"/>',
  Francia: '<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#002654"/><rect x="13.33" width="6.67" height="14" fill="#CE1126"/>',
  Alemania: '<rect width="20" height="14" fill="#DD0000"/><rect width="20" height="4.67" fill="#000"/><rect y="9.33" width="20" height="4.67" fill="#FFCE00"/>',
  "Países Bajos": '<rect width="20" height="14" fill="#fff"/><rect width="20" height="4.67" fill="#AE1C28"/><rect y="9.33" width="20" height="4.67" fill="#21468B"/>',
  Irlanda: '<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#169B62"/><rect x="13.33" width="6.67" height="14" fill="#FF883E"/>',
  "Reino Unido": '<rect width="20" height="14" fill="#012169"/><path d="M0 0L20 14M20 0L0 14" stroke="#fff" stroke-width="2.8"/><path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" stroke-width="1"/><path d="M10 0V14M0 7H20" stroke="#fff" stroke-width="4.2"/><path d="M10 0V14M0 7H20" stroke="#C8102E" stroke-width="2.4"/>',
  Polonia: '<rect width="20" height="14" fill="#DC143C"/><rect width="20" height="7" fill="#fff"/>',
  "Estados Unidos": '<rect width="20" height="14" fill="#fff"/>' + [0, 1, 2, 3, 4, 5, 6].map((k) => `<rect y="${(k * 2 * 14) / 13}" width="20" height="${14 / 13}" fill="#B22234"/>`).join("") + '<rect width="8.5" height="7.54" fill="#3C3B6E"/>',
  México: '<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#006847"/><rect x="13.33" width="6.67" height="14" fill="#CE1126"/><circle cx="10" cy="7" r="1.7" fill="#8C6A3F"/>',
  Colombia: '<rect width="20" height="14" fill="#CE1126"/><rect width="20" height="7" fill="#FCD116"/><rect y="7" width="20" height="3.5" fill="#003893"/>',
  Argentina: '<rect width="20" height="14" fill="#74ACDF"/><rect y="4.67" width="20" height="4.67" fill="#fff"/><circle cx="10" cy="7" r="1.5" fill="#F6B40E"/>',
};
{
  const v3 = (a, b, c) => `<rect width="20" height="14" fill="${b}"/><rect width="6.67" height="14" fill="${a}"/><rect x="13.33" width="6.67" height="14" fill="${c}"/>`,
    h3 = (a, b, c) => `<rect width="20" height="14" fill="${b}"/><rect width="20" height="4.67" fill="${a}"/><rect y="9.33" width="20" height="4.67" fill="${c}"/>`,
    nx = (bg, cr, in2) => `<rect width="20" height="14" fill="${bg}"/><rect x="5" width="3" height="14" fill="${cr}"/><rect y="5.5" width="20" height="3" fill="${cr}"/>${in2 ? `<rect x="5.9" width="1.2" height="14" fill="${in2}"/><rect y="6.4" width="20" height="1.2" fill="${in2}"/>` : ""}`;
  FLAGS[EUANY] = '<rect width="20" height="14" fill="#003399"/>' + [...Array(12)].map((_, k) => `<circle cx="${(10 + 4.2 * Math.sin((k * Math.PI) / 6)).toFixed(2)}" cy="${(7 - 4.2 * Math.cos((k * Math.PI) / 6)).toFixed(2)}" r="0.65" fill="#FFCC00"/>`).join("");
  Object.assign(FLAGS, {
    Italia: v3("#009246", "#fff", "#CE2B37"),
    Austria: h3("#C8102E", "#fff", "#C8102E"),
    Bulgaria: h3("#fff", "#00966E", "#D62612"),
    Chequia: '<rect width="20" height="14" fill="#D7141A"/><rect width="20" height="7" fill="#fff"/><path d="M0 0L9 7L0 14Z" fill="#11457E"/>',
    Chipre: '<rect width="20" height="14" fill="#fff"/><ellipse cx="10" cy="6.5" rx="4" ry="2" fill="#D57800"/><path d="M7 10.5h6" stroke="#4E5B31" stroke-width="1"/>',
    Croacia: h3("#FF0000", "#fff", "#171796"),
    Dinamarca: nx("#C8102E", "#fff"),
    Eslovaquia: h3("#fff", "#0B4EA2", "#EE1C25"),
    Eslovenia: h3("#fff", "#005DA4", "#ED1C24"),
    Estonia: h3("#0072CE", "#000", "#fff"),
    Finlandia: nx("#fff", "#002F6C"),
    Grecia: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<rect y="${(k * 14) / 9}" width="20" height="${14 / 9}" fill="${k % 2 ? "#fff" : "#0D5EAF"}"/>`).join("") + '<rect width="7.8" height="7.8" fill="#0D5EAF"/><rect x="3.1" width="1.6" height="7.8" fill="#fff"/><rect y="3.1" width="7.8" height="1.6" fill="#fff"/>',
    Hungría: h3("#CE2939", "#fff", "#477050"),
    Letonia: '<rect width="20" height="14" fill="#9E3039"/><rect y="5.6" width="20" height="2.8" fill="#fff"/>',
    Lituania: h3("#FDB913", "#006A44", "#C1272D"),
    Luxemburgo: h3("#EF3340", "#fff", "#00A3E0"),
    Malta: '<rect width="20" height="14" fill="#CF142B"/><rect width="10" height="14" fill="#fff"/>',
    Noruega: nx("#BA0C2F", "#fff", "#00205B"),
    Rumanía: v3("#002B7F", "#FCD116", "#CE1126"),
    Suecia: nx("#006AA7", "#FECC02"),
  });
}
const flagSVG = (c) => (FLAGS[c] ? `<svg class="flag" viewBox="0 0 20 14" aria-hidden="true" focusable="false">${FLAGS[c]}</svg>` : "");
/* lists of names read in alphabetical order (scales such as months, hours, levels or contract types keep their own order);
   options that are not names («Contratar a alguien nuevo», «Para el equipo») stay where they were, first or last */
const DDSORT = /^(ptype|rcat|rpos|crc|asktool|askwhere|askfid|askpid|pf-cat|pf-fid|pf-who|pf-country|pcountry|country-|pfid|licopt|pxsel|asgs|asgp|asg-|tlead|pteam|irl)/;
const PINNED = new Set(["", "new", "reg", "team", "none", "other", "custom", "all", "auto"]);
function ddSort(options) {
  const out = [];
  let seg = [];
  const flush = () => {
    if (!seg.length) return;
    const head = [], tail = [], mid = [];
    seg.forEach((o, i) => (o[0] === EUANY ? head : PINNED.has(String(o[0])) ? (i < seg.length / 2 ? head : tail) : mid).push(o));
    mid.sort((a, b) => String(a[1]).localeCompare(String(b[1]), "es", { sensitivity: "base" }));
    out.push(...head, ...mid, ...tail);
    seg = [];
  };
  options.forEach((o) => {
    if (String(o[0]).startsWith("§")) {
      flush();
      out.push(o);
    } else seg.push(o);
  });
  flush();
  return out;
}
const ddHTML = ({ id, value, options, placeholder = "", disabled = false, ariaLabel = "", size = "big", shown = "" }) => {
  if (DDSORT.test(id)) options = ddSort(options);
  DDR[id] = { options, value, placeholder, size, ariaLabel };
  /* a single option that is already chosen leaves nothing to pick: shown, not openable */
  const real = options.filter((o) => !String(o[0]).startsWith("§"));
  if (real.length === 1 && real[0][0] === value) disabled = true;
  const t = shown || ddLabel(id, value);
  return `<button type="button" id="${id}" class="dsel ${size === "sm" ? "sm" : "big md"}" data-dd="${id}" aria-haspopup="listbox" aria-expanded="false"${ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""} ${disabled ? "disabled" : ""}><span class="ddt${t ? "" : " ddph"}">${flagSVG(t)}${esc(t || placeholder)}</span>${I("angle-down")}</button>`;
};
const ddSync = (id) => {
  const b = document.getElementById(id),
    r = DDR[id];
  if (!b || !r) return;
  const t = ddLabel(id, r.value),
    s = b.querySelector(".ddt");
  s.innerHTML = flagSVG(t) + esc(t || r.placeholder);
  s.classList.toggle("ddph", !t);
};
const ddList = () => document.querySelector(".ddl");
function ddClose(focus) {
  const l = ddList(),
    id = V.dd;
  if (l) l.remove();
  V.dd = null;
  if (!id) return;
  const b = document.getElementById(id);
  if (b) {
    b.setAttribute("aria-expanded", "false");
    b.querySelector("use")?.setAttribute("href", "#u-angle-down");
    if (focus) b.focus({ preventScroll: true });
  }
}
function ddOpen(b, focusOpt) {
  if (b.disabled) return;
  ddClose();
  const id = b.dataset.dd,
    r = DDR[id];
  if (!r) return;
  V.dd = id;
  b.setAttribute("aria-expanded", "true");
  b.querySelector("use")?.setAttribute("href", "#u-angle-up");
  const l = document.createElement("div");
  l.className = "ddl";
  l.setAttribute("role", "listbox");
  l.setAttribute("aria-label", r.ariaLabel || ddLabel(id, r.value) || r.placeholder);
  l.innerHTML = r.options
    .map(
      ([v, t, dis]) =>
        v.startsWith("§")
          ? `<div class="ddg" role="presentation">${esc(t)}</div>`
          : `<div class="ddo" role="option" tabindex="-1" data-ddv="${esc(v)}" aria-selected="${v === r.value}"${dis ? ' aria-disabled="true"' : ""}><span class="ddot">${flagSVG(t)}${esc(t)}</span>${v === r.value ? I("check") : ""}</div>`,
    )
    .join("");
  /* long lists: a search box on top, so typing takes you to the option */
  const long = r.options.filter((o) => !String(o[0]).startsWith("§")).length > 12;
  if (long) {
    const sw = document.createElement("div");
    sw.className = "dds";
    sw.innerHTML = `<input class="dds-i" type="search" placeholder="Buscar…" aria-label="Buscar en la lista" autocomplete="off"/>`;
    l.prepend(sw);
    const inp = sw.firstChild;
    inp.oninput = () => {
      const q = norm(inp.value);
      let any = false,
        grp = null,
        gAny = false;
      const flush = () => {
        if (grp) grp.hidden = !gAny;
      };
      [...l.children].forEach((c) => {
        if (c.classList.contains("ddg")) {
          flush();
          grp = c;
          gAny = false;
        } else if (c.classList.contains("ddo")) {
          const ok = !q || norm(c.textContent).includes(q);
          c.hidden = !ok;
          if (ok) {
            gAny = true;
            any = true;
          }
        }
      });
      flush();
      let none = l.querySelector(".ddn");
      if (!any && !none) {
        none = document.createElement("div");
        none.className = "ddn";
        none.textContent = "Nada coincide";
        l.appendChild(none);
      } else if (any && none) none.remove();
    };
  }
  document.body.appendChild(l);
  /* inside a scrolling sheet, scroll the field up so the list opens below it instead of covering the label */
  const sc = b.closest(".sheet");
  if (sc && sc.scrollHeight > sc.clientHeight) {
    const a0 = b.getBoundingClientRect(),
      vv0 = window.visualViewport,
      room = (vv0 ? vv0.height + vv0.offsetTop : innerHeight) - a0.bottom - 12,
      need = Math.min(320, l.scrollHeight + 14) - room,
      top0 = sc.getBoundingClientRect().top + 72;
    if (need > 0) {
      const can = Math.min(need, a0.top - top0, sc.scrollHeight - sc.clientHeight - sc.scrollTop);
      if (can > 0) {
        V.ddScrollAt = Date.now();
        sc.scrollTop += can;
      }
    }
  }
  const a = b.getBoundingClientRect(),
    w = Math.max(a.width, r.size === "sm" ? 200 : 0);
  l.style.width = w + "px";
  l.style.left = Math.max(8, Math.min(a.left, innerWidth - 8 - w)) + "px";
  const vv = window.visualViewport,
    below = (vv ? vv.height + vv.offsetTop : innerHeight) - a.bottom - 12,
    above = a.top - 12,
    h = l.scrollHeight + 14;
  if (h > below && above > below && !(sc && below >= 160)) {
    l.style.maxHeight = Math.min(320, above) + "px";
    l.style.top = Math.max(8, a.top - 4 - Math.min(h, 320, above)) + "px";
  } else {
    l.style.maxHeight = Math.min(320, Math.max(below, 120)) + "px";
    l.style.top = a.bottom + 4 + "px";
  }
  const si = l.querySelector(".dds-i");
  if (si && (!focusOpt || !r.value) && matchMedia("(hover:hover)").matches) si.focus({ preventScroll: true });
  else if (focusOpt) {
    const o = l.querySelector('[aria-selected="true"]') || l.querySelector(".ddo:not([aria-disabled])");
    o?.focus({ preventScroll: true });
    o?.scrollIntoView({ block: "nearest" });
  } else l.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
}
function ddPick(id, v) {
  const r = DDR[id];
  ddClose(true);
  if (!r || r.value === v) return;
  r.value = v;
  ddSync(id);
  const d = V.draft;
  if (id === "ptype") {
    d.type = v;
    d.typeErr = false;
    render();
  } else if (id === "crc") d.cat = v;
  else if (id === "irl") {
    d.role = v;
    const sc = document.getElementById("isc");
    if (d.role === "Administrador global") {
      d.scope = "Todas";
      DDR.isc.value = "Todas";
      ddSync("isc");
      sc.disabled = true;
    } else sc.disabled = false;
  } else if (id === "isc") d.scope = v;
  else if (id.startsWith("country-")) {
    P().roles[id.slice(8)].country = v;
    save();
    render();
  } else if (id === "paipref" || id === "pct") {
    d[id === "pct" ? "ct" : "aiPref"] = v;
    render();
  } else if (id.startsWith("pf-")) {
    const d = V.draft,
      k = id.slice(3);
    if (k === "cat") {
      if (d.cat !== v) Object.assign(d, { cat: v, fid: "", tools: [], who: "new" });
    } else if (k === "fid") {
      if (d.fid !== v) Object.assign(d, { fid: v, tools: defTools(v, P()), who: "new", err: "", lvl: "" });
    } else d[k] = v;
    render();
  } else if (id === "pext") {
    V.draft.ext = v;
    render();
  } else if (id === "pstart") {
    d.smode = v === "now" ? "now" : "pick";
    if (v !== "now") d.start = v;
  }
  else if (id === "pcountry") d.country = v;
  else if (id === "lvp") { d.sel = v; d.err = ""; render(); }
  else if (id === "plvl") { d.lvl = v; render(); }
  else if (id === "lvr") { d.why = v; }
  else if (id === "asgp") { d.sel = v; d.slot = ""; d.err = ""; render(); }
  else if (id === "asgs") { d.slot = v; d.err = ""; render(); }
  else if (id === "pxsel") {
    d.sel = v;
    d.err = "";
  } else if (id.startsWith("rtf-")) {
    d.people[Number(id.slice(4))].fid = v;
    { const b = document.querySelector("#modal [data-regadd]"); if (b) { const l = d.people[d.people.length - 1]; b.disabled = !(l && l.n.trim() && l.fid); } }
  } else if (id.startsWith("rchg-")) {
    const pr = P(),
      i = Number(id.slice(5)),
      old = pr.roles[i];
    if (old && old.id !== v) {
      pr.roles[i] = Object.assign(mkRole(v, old.n, old.hours), { ct: old.ct, up: old.up, fill: old.fill, ai: old.ai });
      save();
      render();
    }
  } else if (id === "asktool") {
    V.draft.opt = v;
    V.draft.err = "";
    /* asked from a person's menu: keep that person chosen unless they already have this program */
    V.draft.whoIds = V.draft.forPid && toolReqPeople(v).some(({ x, has }) => x.id === V.draft.forPid && !has) ? [V.draft.forPid] : [];
    render();
  } else if (id === "rcat") {
    V.rcat = v;
    V.rpos = "";
    render();
  } else if (id === "rpos") {
    V.rpos = v;
    render();
  } else if (id === "askwhere") {
    if (v === "new") {
      V.askBack = V.draft;
      if (D.setup) V.draft = newDraft();
      else V.draft = { name: "", err: "" };
      V.modal = D.setup ? "new" : "setup";
    } else V.draft.where = v;
    render();
  } else if (id === "askpid") {
    V.draft.pid = v;
    V.draft.err = "";
    render();
  } else if (id === "askfid") {
    V.draft.fid = v;
    V.draft.err = "";
    render();
  } else if (id === "mvs") {
    d.slot = v;
    d.err = "";
    render();
  } else if (id === "licopt") {
    d.opt = v;
    d.err = "";
    render();
  } else if (id === "pfid") {
    d.fid = v;
    d.asg = "";
    render();
  } else if (id === "pasg") {
    d.asg = v;
    render();
  } else if (id === "pteam") [d.team, d.unit] = v.split("||");
  else if (id === "tlead") { d.lead = v; d.sel = []; }
  else if (id.startsWith("src-") || id.startsWith("asg-")) {
    const [ri, i] = id.slice(4).split("-").map(Number),
      pr = P(),
      r = pr && pr.roles[ri];
    if (!r || !r.fill || !r.fill[i]) return;
    /* Leadership can give the seat to someone of another team or decide to hire instead (it then counts as new investment) */
    if (id.startsWith("asg-")) r.fill[i] = v === "new" ? { src: "new", byBoard: true } : { src: "other", ...(v ? { pid: v } : {}) };
    else {
      const [src, pid] = v.split(":");
      r.fill[i] = pid ? { src, pid } : { src };
    }
    save();
    render();
  }
}
document.addEventListener(
  "pointerdown",
  (e) => {
    if (!V.dd || e.target.closest(".ddl") || e.target.closest(`[data-dd="${V.dd}"]`)) return;
    ddClose();
    if (!e.target.closest(".dsel")) {
      V._ddSwallow = true;
      setTimeout(() => (V._ddSwallow = false), 400);
    }
  },
  true,
);
document.addEventListener(
  "click",
  (e) => {
    if (V._ddSwallow) {
      V._ddSwallow = false;
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    const o = e.target.closest(".ddo");
    if (o) {
      e.stopPropagation();
      if (o.getAttribute("aria-disabled") !== "true") ddPick(V.dd, o.dataset.ddv);
      return;
    }
    const b = e.target.closest("[data-dd]");
    if (b) {
      e.stopPropagation();
      if (V.dd === b.dataset.dd) ddClose(true);
      else ddOpen(b);
    }
  },
  true,
);
document.addEventListener(
  "keydown",
  (e) => {
    const t = e.target.closest ? e.target.closest("[data-dd]") : null;
    if (t && !V.dd && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      e.stopPropagation();
      ddOpen(t, true);
      return;
    }
    if (!V.dd) return;
    const l = ddList(),
      opts = l ? [...l.querySelectorAll(".ddo:not([aria-disabled]):not([hidden])")] : [],
      inSearch = document.activeElement && document.activeElement.classList.contains("dds-i"),
      cur = opts.indexOf(document.activeElement);
    const go = (i) => {
      const o = opts[Math.max(0, Math.min(opts.length - 1, i))];
      o?.focus({ preventScroll: true });
      o?.scrollIntoView({ block: "nearest" });
    };
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      ddClose(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      e.stopImmediatePropagation();
      ddClose(true);
    } else if (inSearch && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (opts[0]) ddPick(V.dd, opts[0].dataset.ddv);
    } else if (inSearch && (e.key === "Home" || e.key === "End" || e.key.length === 1)) {
      return;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      go(cur + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      go(cur < 0 ? opts.length - 1 : cur - 1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      go(e.key === "Home" ? 0 : opts.length - 1);
    } else if ((e.key === "Enter" || e.key === " ") && document.activeElement.classList.contains("ddo")) {
      e.preventDefault();
      e.stopPropagation();
      const o = document.activeElement;
      if (o.getAttribute("aria-disabled") !== "true") ddPick(V.dd, o.dataset.ddv);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase(),
        n = opts.findIndex((o, i) => i > cur && o.textContent.toLowerCase().startsWith(k)),
        m = n >= 0 ? n : opts.findIndex((o) => o.textContent.toLowerCase().startsWith(k));
      if (m >= 0) go(m);
    }
  },
  true,
);
document.addEventListener("keyup", (e) => {
  if (e.key === " " && e.target.closest && e.target.closest("[data-dd]")) e.preventDefault();
});
document.addEventListener(
  "scroll",
  (e) => {
    if (V.dd && !(e.target.closest && e.target.closest(".ddl")) && !(V.ddScrollAt && Date.now() - V.ddScrollAt < 300)) ddClose();
  },
  true,
);
addEventListener("resize", () => {
  V.dd && ddClose();
  const n = matchMedia("(max-width:900px)").matches;
  if (n !== V.wasNarrow) {
    V.wasNarrow = n;
    if (V.view === "project") render();
  }
});
/* «Descargar PDF»: the proposal is drawn into a real A4 PDF in the page (html2pdf) and handed to the viewer's download.
   Inside claude.ai downloads go through the page's downloads capability; opened as a file, through a normal link. */
let _pdfLib;
const loadPdfLib = () =>
  (_pdfLib =
    _pdfLib ||
    new Promise((ok, ko) => {
      if (window.html2pdf) return ok();
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      sc.onload = () => ok();
      sc.onerror = () => {
        _pdfLib = null;
        ko(new Error("lib"));
      };
      document.head.appendChild(sc);
    }));
async function exportPDF(btn) {
  const el = document.querySelector(".paper"),
    pr = P();
  if (!el || !pr || V.pdfBusy) return;
  V.pdfBusy = true;
  const label = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="ispin sm" aria-hidden="true"></span>Preparando PDF…`;
  }
  const filename = `Propuesta ${pr.name.replace(/[\\/:*?"<>|]/g, "")}.pdf`;
  let msg = "";
  try {
    await loadPdfLib();
    document.body.classList.add("pdfing");
    /* a heading never stays alone at the foot of a page: it travels with the short block under it */
    el.querySelectorAll("h2").forEach((h) => {
      const n = h.nextElementSibling;
      if (!n || n.offsetHeight > 420) return;
      const w = document.createElement("div");
      w.className = "xkeep";
      h.before(w);
      w.append(h, n);
    });
    const blob = await window
      .html2pdf()
      .set({
        margin: [12, 12, 14, 12],
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["tr", "h2", ".xkeep", ".xcov", "li"] },
      })
      .from(el)
      .outputPdf("blob");
    document.body.classList.remove("pdfing");
    render();
    const dl = window.claude && window.claude.use ? await window.claude.use("downloads").catch(() => null) : null;
    if (dl) {
      try {
        await dl.save({ filename, data: blob });
        msg = "PDF descargado";
      } catch (e) {
        msg = e && e.code === "declined" ? "" : "No se ha podido descargar el PDF";
      }
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 4000);
      msg = "PDF descargado";
    }
  } catch (e) {
    document.body.classList.remove("pdfing");
    msg = "No se ha podido preparar el PDF. Inténtalo de nuevo.";
  }
  V.pdfBusy = false;
  if (btn && btn.isConnected) {
    btn.disabled = false;
    btn.innerHTML = label;
  }
  if (msg) {
    V.toast = msg;
    render();
  }
}
function render() {
  _render();
  try { chipsPass(); } catch (e) {}
  try { pillTips(); } catch (e) {}
  try { headerPass(); } catch (e) {}
  try { tabsFade(); } catch (e) {}
  /* the account menu opens over the demo chip: hide the chip while it's open */
  document.body.classList.toggle("acctopen", V.menu === "side");
}
/* tabs that scroll sideways fade at the edge that has more, so hidden tabs are discoverable */
function tabsFade() {
  document.querySelectorAll(".tabs").forEach((t) => {
    const upd = () => {
      t.classList.toggle("more-r", t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
      t.classList.toggle("more-l", t.scrollLeft > 2);
    };
    upd();
    t.onscroll = upd;
  });
}
addEventListener("resize", () => { try { tabsFade(); } catch (e) {} });
const acctMenu = (cls) =>
  `<div class="${cls}" role="menu"><div class="am1"><b>${esc(ME().name)}</b><small>${esc(ME().role)}</small></div><button role="menuitem" data-profile><span>Perfil</span></button><button role="menuitem" class="amlang2" data-langopen><span>Idioma</span><em class="notr">${LANG === "en" ? flagSVG("Reino Unido") + "English" : flagSVG("España") + "Español"}</em>${I("angle-right")}</button></div>`;
const VIEWT = {
  home: "Inicio",
  tasks: "Tareas pendientes",
  notes: "Notificaciones",
  projects: "Proyectos",
  people: "Personas",
  licenses: "Software e IA",
  settings: "Ajustes",
  export: "Propuesta",
};
/* focus: a stable key for the focused element, to give focus back after every re-render */
const focusKey = (el) => {
  if (!el || el === document.body || !el.closest) return null;
  const root = el.closest("#modal,#side,#top,#app");
  if (!root) return null;
  const attrs = el.getAttributeNames().filter((n) => (n.startsWith("data-") && n !== "data-sl" && n !== "data-tt") || n === "id" || n === "aria-label");
  return {
    root: root.id,
    tag: el.tagName,
    attrs: attrs.map((n) => [n, el.getAttribute(n)]),
    sel: el.selectionStart != null && el.type !== "checkbox" ? [el.selectionStart, el.selectionEnd] : null,
  };
};
const findKey = (k) => {
  const root = document.getElementById(k.root);
  if (!root) return null;
  const q = k.tag.toLowerCase() + k.attrs.map(([n, v]) => `[${n}="${CSS.escape(v)}"]`).join("");
  const el = root.querySelector(q);
  if (el || !k.attrs.some(([n]) => n === "aria-label" || n === "placeholder")) return el;
  const q2 = k.tag.toLowerCase() + k.attrs.filter(([n]) => n !== "aria-label" && n !== "placeholder").map(([n, v]) => `[${n}="${CSS.escape(v)}"]`).join("");
  return q2 === k.tag.toLowerCase() ? null : root.querySelector(q2);
};
const focusEl = (el, k) => {
  if (!el) return false;
  el.focus({ preventScroll: true });
  if (k && k.sel)
    try {
      el.setSelectionRange(k.sel[0], k.sel[1]);
    } catch (e) {}
  return document.activeElement === el;
};
