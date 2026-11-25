/* ===== Conversation of a proposal: every message of the project lead and of Leadership, so what was asked stays on record ===== */
function threadOf(p) {
  if (Array.isArray(p.thread)) return p.thread;
  const t = [];
  if (p.justif && (p.sentAt || p.review)) t.push({ who: "m", k: "sent", t: p.justif, ts: p.sentAt || (p.review ? p.review.ts - DAY : Date.now()) });
  if (p.review && (p.review.comment || p.review.decision)) t.push({ who: "b", k: p.review.decision, t: p.review.comment || "", ts: p.review.ts });
  if (p.reply) t.push({ who: "m", k: "resent", t: p.reply, ts: p.sentAt || Date.now() });
  return t;
}
function pushThread(p, it) {
  p.thread = [...threadOf(p), it];
}
