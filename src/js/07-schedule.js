/* ===== Schedule: ONE function for when a project spends money, used by both the project total and the forecast.
   i = months from now (0 = this month). No ramp-up: a project active this month runs at 100%. ===== */
const mIdx = (d) => {
  const x = typeof d === "string" && /^\d{4}-\d{2}$/.test(d) ? new Date(+d.slice(0, 4), +d.slice(5) - 1, 1) : new Date(d),
    n = new Date();
  return (x.getFullYear() - n.getFullYear()) * 12 + x.getMonth() - n.getMonth();
};
function schedShare(p, i) {
  /* a project in progress spends from its start month; a proposal would spend from its planned start (never before this month) */
  const st = p.status === "active" ? (p.start ? mIdx(p.start) : 0) : Math.max(0, p.start ? mIdx(p.start) : 1);
  if (i < st) return 0;
  const k = i - st;
  return p.months ? Math.max(0, Math.min(1, p.months - k)) : 1;
}
