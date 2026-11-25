/*@i18n*/
/* ===== i18n: Spanish is the source language; English is applied as a live translation layer over the DOM ===== */
const I18N = { dict: new Map(), rdict: new Map(), pats: [], cache: new Map(), done: new WeakMap() };
function i18nInit(pairs, pats) {
  for (const [es, en] of pairs) { I18N.dict.set(es, en); if (!I18N.rdict.has(en)) I18N.rdict.set(en, es); }
  I18N.pats = pats
    .map(([es, en]) => {
      const parts = es.split(/\{(\d+)\}/);
      let rx = "^", order = [];
      parts.forEach((p, i) => {
        if (i % 2) {
          const prev = parts[i - 1] || "", next = parts[i + 1] || "";
          /* glued to a word (proyecto{1}) = a plural ending */
          if (/[A-Za-zÁÉÍÓÚáéíóúñ]$/.test(prev)) rx += "([a-z]{0,2})";
          /* a count at the start of a plural phrase: only a number */
          else if (i === 1 && prev === "" && /^ [a-záéíóúñ]+$/.test(next) && /^\d+$/.test(parts[i + 2] || "")) rx += "([−+]?\\d[\\d.,]*|un|una)";
          /* right after another placeholder: only a " · …" tail */
          else if (prev === "" && i > 1) rx += "((?:\\s·\\s.*)?)";
          /* at the end after a space or colon: the rest of the text */
          else if (i === parts.length - 2 && next === "" && /[\s:(«]$/.test(prev)) rx += "(.*)";
          /* at the start: no separators; elsewhere: anything that is not a new sentence */
          else rx += i === 1 && prev === "" ? "((?:[^.:;!?·]|[.:,](?=\\d))*?)" : "((?:[^.!?]|\\.(?=[\\w)]))*?)";
          order.push(+p);
        } else rx += p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      });
      return { re: new RegExp(rx + "$"), order, en, lit: es.replace(/\{\d+\}/g, "").length };
    })
    .sort((a, b) => b.lit - a.lit);
}
/* number formats: 5.130 € → €5,130 ; 0,5 → 0.5 ; 21 % → 21% */
function i18nNum(s) {
  return s
    .replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?/g, (m, a, d) => a.replace(/\./g, ",") + (d ? "." + d : ""))
    .replace(/(−|-)?(\d[\d.,]*)[\u00a0 ]?€/g, (m, sg, n) => (sg || "") + "€" + n)
    .replace(/(\d[\d.,]*)[\u00a0 ]?\$(?![\w])/g, (m, n) => "$" + n)
    .replace(/(\d)[\u00a0 ]%/g, "$1%");
}
function tr(s) {
  if (LANG !== "en" || !s) return s;
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), core = m[2].replace(/\s+/g, " ");
  if (!core || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(core)) return LANG === "en" && core ? m[1] + i18nNum(core) + m[3] : s;
  let out = I18N.cache.get(core);
  if (out === undefined) {
    out = trCore(core);
    if (I18N.cache.size > 20000) I18N.cache.clear();
    I18N.cache.set(core, out);
  }
  return m[1] + out + m[3];
}
function trCore(core) {
  return trFix(trRaw(core));
}
const trFix = (s) => s.replace(/([^\s,]) y (?=[A-Z«])/g, "$1 and ").replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/g, (m) => m[0].toUpperCase() + m.slice(1)).replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December) de (\d{4})/g, "$1 $2");
function trRaw(core) {
  const d = I18N.dict.get(core);
  if (d !== undefined) return d;
  for (const p of I18N.pats) {
    const r = core.match(p.re);
    if (!r) continue;
    const caps = {};
    p.order.forEach((n, i) => (caps[n] = r[i + 1]));
    return (
      p.en.replace(/\{(\d+)(\|[^}]*)?\}/g, (x, n, mod) => {
        const raw = caps[n] == null ? "" : caps[n], v = raw.trim(), pre = raw.match(/^\s*/)[0], post = raw.match(/\s*$/)[0];
        if (mod) { const a = mod.slice(1).split("|"); return a.length === 1 ? (v ? a[0] : "") : v ? a[1] : a[0]; }
        const t = I18N.dict.get(v.trim());
        let o = t !== undefined ? t : I18N.dict.has(v + ".") ? I18N.dict.get(v + ".").replace(/\.$/, "") : /[a-záéíóúñ]{3}/i.test(v) && v.length < 400 ? trCore(v) : i18nNum(v);
        if (o === i18nNum(v) && /\(/.test(v)) o = v.replace(/\(([^()]+(?:\([^()]*\))?[^()]*)\)/g, (x, inner) => "(" + trCore(inner) + ")");
        return pre + o.replace(/» y «/g, "» and «").replace(/, y /g, ", and ") + post;
      })
    );
  }
  /* trailing punctuation the source string didn't have */
  const tp = core.match(/^(.*?)([.,;:])$/);
  if (tp && (I18N.dict.has(tp[1]) || I18N.pats.some((p) => p.re.test(tp[1])))) return trRaw(tp[1]) + tp[2];
  /* compound: "A · B · C" and "Sentence. Sentence." are translated part by part */
  if (core.includes(" · ")) {
    const ps = core.split(" · "), t = ps.map((x) => trCore(x));
    if (t.some((x, i) => x !== ps[i])) return t.join(" · ");
  }
  const lp = core.match(/^([.,;:·]\s)(.+)$/);
  if (lp) { const r = trCore(lp[2]); if (r !== lp[2]) return lp[1] + r; }
  /* «Name»: rest */
  const q = core.match(/^(«[^»]+»): (.+)$/);
  if (q) { const r = trCore(q[2]); if (r !== q[2]) return q[1] + ": " + r; }
  /* sentences: the first one, then the rest as a whole (so longer known sentences still match) */
  const bs = [];
  core.replace(/[.;] (?=[A-ZÁÉÍÓÚ¿«])/g, (m, i) => bs.push(i));
  if (bs.length) {
    const known = (h) => I18N.dict.has(h) || I18N.pats.some((p) => p.re.test(h));
    const k = [...bs].reverse().find((i) => known(core.slice(0, i + 1))) ?? bs[0];
    const h = core.slice(0, k + 1), rest = core.slice(k + 2), th = trCore(h), tr2 = trCore(rest);
    if (th !== h || tr2 !== rest) return th + " " + tr2;
  }
  return i18nNum(core);
}
const I18N_ATTRS = ["aria-label", "placeholder", "title", "data-tt", "data-tip", "alt", "aria-roledescription"];
function trAttr(el, a) {
  const v = el.getAttribute(a);
  if (!v) return;
  let m = I18N.done.get(el);
  if (!m || typeof m !== "object") { m = {}; I18N.done.set(el, m); }
  if (m[a] === v) return;
  const t = tr(v);
  if (t !== v) el.setAttribute(a, t);
  m[a] = t;
}
function i18nNode(n) {
  if (LANG !== "en") return;
  if (n.nodeType === 3) {
    const p = n.parentNode;
    if (!p || p.closest?.(".notr,script,style,textarea") || (p.nodeType === 1 && p.closest && p.closest(".notr"))) return;
    const v = n.nodeValue;
    if (I18N.done.get(n) === v) return;
    const t = tr(v);
    if (t !== v) n.nodeValue = t;
    I18N.done.set(n, t);
    return;
  }
  if (n.nodeType !== 1 || n.closest(".notr,script,style")) return;
  for (const a of I18N_ATTRS) trAttr(n, a);
  if (n.tagName === "INPUT") i18nInput(n);
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let c = w.nextNode();
  while (c) {
    if (c.nodeType === 1) {
      if (c.matches("textarea")) { for (const a of I18N_ATTRS) trAttr(c, a); c = nextSkip(w, c); continue; }
      if (c.matches(".notr,script,style")) { c = nextSkip(w, c); continue; }
      for (const a of I18N_ATTRS) trAttr(c, a);
      if (c.tagName === "INPUT") i18nInput(c);
    } else {
      const v = c.nodeValue;
      if (I18N.done.get(c) !== v) { const t = tr(v); if (t !== v) c.nodeValue = t; I18N.done.set(c, t); }
    }
    c = w.nextNode();
  }
}
/* numbers shown inside inputs follow the English format; the parsers already ignore separators */
function i18nInput(el) {
  if (el.dataset.i18nv || el === document.activeElement) return;
  const v = el.value;
  if (/^-?\d{1,3}(\.\d{3})+$/.test(v)) el.value = v.replace(/\./g, ",");
  else if (el.inputMode === "decimal" && /^\d+,\d+$/.test(v)) el.value = v.replace(",", ".");
  el.dataset.i18nv = "1";
}
function nextSkip(w, el) {
  let s = el;
  while (s && !s.nextSibling) s = s.parentNode;
  if (!s || s === document.body) return null;
  w.currentNode = s.nextSibling;
  return w.currentNode;
}
const i18nObs = new MutationObserver((ms) => {
  if (LANG !== "en") return;
  for (const m of ms) {
    if (m.type === "childList") m.addedNodes.forEach(i18nNode);
    else if (m.type === "characterData") i18nNode(m.target);
    else if (m.type === "attributes") trAttr(m.target, m.attributeName);
  }
  const tt = tr(document.title.replace(/ · HUMAIN$/, ""));
  if (!document.title.startsWith(tt)) document.title = tt + " · HUMAIN";
});
function i18nStart() {
  document.documentElement.lang = LANG;
  i18nObs.disconnect();
  if (LANG === "en") {
    i18nNode(document.body);
    i18nObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
  }
}
/* stored data: demo strings follow the language (exact matches only, so text people wrote is never touched) */
function i18nData(to) {
  const map = to === "en" ? I18N.dict : I18N.rdict;
  const seen = new WeakSet();
  const walkD = (o) => {
    if (!o || typeof o !== "object" || seen.has(o)) return;
    seen.add(o);
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === "string") { if (/^(name|goal|justif|comment|reply|t|why|msg|note|reason|title)$/.test(k)) { const t = map.get(v); if (t !== undefined && t !== v) o[k] = t; } }
      else if (v && typeof v === "object") walkD(v);
    }
  };
  walkD(D);
}
function setLang(l) {
  if (l === LANG) return;
  const from = LANG;
  LANG = l;
  try { localStorage.setItem(LANGK, l); } catch (e) {}
  I18N.cache.clear();
  if (D) { i18nData(l); save(); }
  if (from === "en" && l === "es") { i18nObs.disconnect(); }
  render();
  i18nStart();
}

i18nInit(I18N_PAIRS, I18N_PATS);
{
  const _seed = seedData;
  seedData = function () { const r = _seed.apply(this, arguments); if (LANG === "en") i18nData("en"); return r; };
}
if (D) { i18nData(LANG); try { save(); } catch (e) {} }
render();
i18nStart();
