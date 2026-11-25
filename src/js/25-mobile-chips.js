/* ===== Chips on phones: long names cut with «…» (tap shows the full name) and at most two rows, with «Ver más» ===== */
function chipsPass() {
  if (!window.matchMedia || !matchMedia("(max-width:600px)").matches) return;
  V.chipOpen = V.chipOpen || [];
  document.querySelectorAll(".pchip").forEach((c) => {
    if (c.querySelector(":scope>.pct")) return;
    const tn = [...c.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!tn) return;
    const sp = document.createElement("span");
    sp.className = "pct";
    sp.textContent = tn.textContent.trim();
    c.replaceChild(sp, tn);
    if (sp.scrollWidth > sp.clientWidth + 1 && !c.title) c.title = sp.textContent;
  });
  document.querySelectorAll(".tusage>div, .xtools, .pchips, .pcs").forEach((box, k) => {
    const cs = [...box.children].filter((e) => e.classList.contains("pchip"));
    if (cs.length < 3 || box.querySelector(".chmore")) return;
    const top0 = cs[0].offsetTop, rows = [...new Set(cs.map((e) => e.offsetTop))].sort((a, b) => a - b);
    if (rows.length <= 2) return;
    const key = (box.closest("[data-k]") || {}).dataset?.k || box.textContent.slice(0, 40) + k;
    const hidden = cs.filter((e) => e.offsetTop > rows[1]);
    const open = V.chipOpen.includes(key);
    if (!open) hidden.forEach((e) => (e.hidden = true));
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pchip chmore";
    b.textContent = open ? "Ver menos" : `+${hidden.length} más`;
    b.onclick = (ev) => {
      ev.stopPropagation();
      V.chipOpen = open ? V.chipOpen.filter((x) => x !== key) : [...V.chipOpen, key];
      render();
    };
    box.appendChild(b);
    if (!open && b.offsetTop > rows[1]) {
      const last = cs.filter((e) => !e.hidden).pop();
      if (last) last.hidden = true, (b.textContent = `+${hidden.length + 1} más`);
    }
    void top0;
  });
}

