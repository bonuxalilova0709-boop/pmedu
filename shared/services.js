/* ===== services.js — biznes-mantiq: o'zlashtirish modeli, testlar, maqsadlar, ustoz va admin amallari ===== */
"use strict";
const S = (() => {
  const db = () => Store.get();
  const subj = (id) => DATA.SUBJECTS.find((s) => s.id === id);
  const topic = (id) => DATA.TOPICS.find((t) => t.id === id);
  const topicsOf = (s) => DATA.TOPICS.filter((t) => t.s === s);
  const question = (id) => DATA.QUESTIONS.find((q) => q.id === id);
  const test = (id) => DATA.TESTS.find((t) => t.id === id);
  const books = () => DATA.BOOKS.concat(db().books);
  const user = (id) => db().users.find((u) => u.id === id);
  const fullName = (u) => u ? `${u.first} ${u.last}`.trim() : "—";
  const shuffle = (arr, r = Math.random) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const log = (uid, kind, title, val = "") => { db().activity.unshift({ id: U.uid("ac"), uid, ts: Date.now(), kind, title, val }); db().activity = db().activity.slice(0, 400); };
  const notify = (uid, text, link = "") => db().notifs.unshift({ id: U.uid("n"), uid, ts: Date.now(), text, read: false, link });

  /* ---------- O'zlashtirish modeli (Ebbinghaus unutish egri chizig'i asosida) ---------- */
  function answersByTopic(uid) {
    const m = {};
    db().attempts.filter((a) => a.uid === uid).sort((a, b) => a.finishedAt - b.finishedAt).forEach((a) =>
      a.items.forEach((it) => { (m[it.t] = m[it.t] || []).push({ ok: it.ok, ts: a.finishedAt }); }));
    return m;
  }
  function mastery(uid, tid, cache) {
    const ans = (cache || answersByTopic(uid))[tid] || [];
    const learnedTs = (db().learned[uid] || {})[tid];
    const last8 = ans.slice(-8), n = last8.length;
    const acc = n ? last8.filter((x) => x.ok).length / n : 0;
    const lastTs = Math.max(learnedTs || 0, ans.length ? ans[ans.length - 1].ts : 0);
    const days = lastTs ? (Date.now() - lastTs) / 864e5 : 0;
    const strength = 6 + 3 * Math.min(10, ans.filter((x) => x.ok).length);
    const retention = lastTs ? Math.exp(-days / strength) : 0;
    const base = n ? acc * 100 : learnedTs ? 45 : 0;
    const score = Math.round(base * (0.6 + 0.4 * retention));
    let level = "new";
    if (n || learnedTs) {
      if (n && acc < 0.6) level = "weak";
      else if (retention < 0.4) level = "review";
      else if (n && acc >= 0.8) level = "good";
      else level = "mid";
    }
    return { tid, n, acc, retention, score, level, learned: !!learnedTs, days: Math.round(days) };
  }
  const LEVELS = {
    new: { label: "Boshlanmagan", cls: "gr" }, weak: { label: "Zaif", cls: "r" }, review: { label: "Takrorlash kerak", cls: "o" },
    mid: { label: "O'rtacha", cls: "bl" }, good: { label: "O'zlashtirilgan", cls: "g" },
  };
  function knowledgeMap(uid) { const c = answersByTopic(uid); return DATA.TOPICS.map((t) => ({ ...mastery(uid, t.id, c), topic: t })); }

  function subjectStats(uid, s) {
    const c = answersByTopic(uid), ts = topicsOf(s);
    const ms = ts.map((t) => mastery(uid, t.id, c));
    const at = db().attempts.filter((a) => a.uid === uid && a.s === s);
    const learned = ms.filter((m) => m.learned).length;
    const avgM = ms.length ? Math.round(ms.reduce((x, m) => x + m.score, 0) / ms.length) : 0;
    return { total: ts.length, learned, mastery: avgM, tests: at.length, avgPct: at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : 0,
      progress: Math.round(0.5 * U.pct(learned, ts.length) + 0.5 * avgM) };
  }
  function overall(uid) {
    const learned = Object.keys(db().learned[uid] || {}).length, total = DATA.TOPICS.length;
    const at = db().attempts.filter((a) => a.uid === uid);
    const items = at.flatMap((a) => a.items), okN = items.filter((i) => i.ok).length;
    const km = knowledgeMap(uid), avgM = Math.round(km.reduce((x, m) => x + m.score, 0) / km.length);
    const avgPct = at.length ? at.reduce((x, a) => x + a.pct, 0) / at.length : 0;
    return { learned, total, tests: at.length, answered: items.length, correctPct: U.pct(okN, items.length), wrongPct: U.pct(items.length - okN, items.length),
      grade: at.length ? Math.max(2, Math.min(5, avgPct / 20)).toFixed(1) : "—", progress: Math.round(0.5 * U.pct(learned, total) + 0.5 * avgM), avgPct: Math.round(avgPct) };
  }
  function recommendations(uid, n = 4) {
    const u = user(uid), km = knowledgeMap(uid);
    const courseSubj = DATA.SUBJECTS.filter((s) => !u || s.courses.includes(+u.course) || s.courses.includes(+u.course - 1)).map((s) => s.id);
    const prio = { review: 0, weak: 1, mid: 3, new: 2, good: 9 };
    return km.filter((m) => m.level !== "good").sort((a, b) => (prio[a.level] - prio[b.level]) || (courseSubj.includes(b.topic.s) - courseSubj.includes(a.topic.s)) || a.score - b.score)
      .slice(0, n).map((m) => ({ ...m, reason: m.level === "review" ? `${m.days} kun oldin o'rganilgan — xotirada ${Math.round(m.retention * 100)}% qolgan` : m.level === "weak" ? `To'g'ri javoblar ${Math.round(m.acc * 100)}% — mustahkamlash kerak` : m.level === "new" ? "Hali boshlanmagan mavzu" : "Natijani 80% dan oshiring" }));
  }
  function mistakes(uid) {
    const last = {};
    db().attempts.filter((a) => a.uid === uid).sort((a, b) => a.finishedAt - b.finishedAt).forEach((a) => a.items.forEach((it) => { if (it.qid) last[it.qid] = it.ok; }));
    return Object.keys(last).filter((k) => !last[k]).map(question).filter(Boolean);
  }
  function streak(uid) {
    const days = new Set(db().attempts.filter((a) => a.uid === uid).map((a) => U.dayKey(new Date(a.finishedAt))));
    Object.values(db().learned[uid] || {}).forEach((ts) => days.add(U.dayKey(new Date(ts))));
    let n = 0, d = new Date(); if (!days.has(U.dayKey(d))) d = new Date(Date.now() - 864e5);
    while (days.has(U.dayKey(d))) { n++; d = new Date(d.getTime() - 864e5); }
    return n;
  }
  function timeline(uid, days = 7) {
    const at = db().attempts.filter((a) => a.uid === uid).sort((a, b) => a.finishedAt - b.finishedAt);
    const out = [];
    for (let k = days - 1; k >= 0; k--) {
      const end = U.fromKey(U.dayKey(new Date(Date.now() - k * 864e5))).getTime() + 864e5;
      const upto = at.filter((a) => a.finishedAt < end && a.finishedAt >= end - 14 * 864e5);
      const items = upto.flatMap((a) => a.items);
      out.push({ label: `${new Date(end - 1).getDate()}-${U.OYLAR[new Date(end - 1).getMonth()].slice(0, 3)}`, v: items.length ? U.pct(items.filter((i) => i.ok).length, items.length) : null,
        n: at.filter((a) => a.finishedAt < end && a.finishedAt >= end - 864e5).length });
    }
    let prev = null; out.forEach((p) => { if (p.v == null) p.v = prev ?? 0; prev = p.v; });
    return out;
  }
  function leaderboard(group) {
    return db().users.filter((u) => u.role === "student" && !u.blocked && (!group || u.group === group)).map((u) => {
      const at = db().attempts.filter((a) => a.uid === u.id).slice(-10);
      return { u, score: at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : 0, tests: at.length };
    }).sort((a, b) => b.score - a.score);
  }
  function achievements(uid) {
    const at = db().attempts.filter((a) => a.uid === uid), learned = Object.keys(db().learned[uid] || {}).length;
    const aiQ = db().chats.filter((c) => c.uid === uid).reduce((x, c) => x + c.msgs.filter((m) => m.role === "me").length, 0);
    return [
      { ic: "test", t: "Birinchi test", on: at.length >= 1 }, { ic: "fire", t: "3 kunlik seriya", on: streak(uid) >= 3 },
      { ic: "star", t: "100% natija", on: at.some((a) => a.pct === 100) }, { ic: "book", t: "10 ta mavzu", on: learned >= 10 },
      { ic: "trophy", t: "10 ta test", on: at.length >= 10 }, { ic: "bot", t: "AI bilan 10 savol", on: aiQ >= 10 },
      { ic: "repeat", t: "Xatolar ustida ishlash", on: at.some((a) => a.mode === "mistakes") },
    ];
  }

  /* ---------- Mavzularni o'rganish ---------- */
  function toggleLearned(tid) {
    const u = Store.need("student"); const L = (db().learned[u.id] = db().learned[u.id] || {});
    if (L[tid]) delete L[tid]; else { L[tid] = Date.now(); log(u.id, "topic", `${subj(topic(tid).s).name} – Mavzu o'qildi`, topic(tid).name); }
    Store.save(); return !!L[tid];
  }

  /* ---------- Parametrik savollar generatori: har urinishda yangi sonlar (ko'chirishga qarshi) ---------- */
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const opts = (r, correct, wrongs) => {
    const set = [String(correct)]; wrongs.map(String).forEach((w) => { if (!set.includes(w) && set.length < 4) set.push(w); });
    let k = 1; while (set.length < 4) { const w = String(+correct + k * (k % 2 ? 1 : -1)); if (!set.includes(w)) set.push(w); k++; }
    const o = shuffle(set, r); return { o, a: o.indexOf(String(correct)) };
  };
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
  const GEN = {
    a3: (r) => { const a = ri(r, 2, 6), n = ri(r, 2, 4), b = ri(r, 1, 9), x0 = ri(r, 1, 3); const v = a * n * x0 ** (n - 1) + b;
      return { t: "a3", q: `f(x) = ${a}x${sup(n)} + ${b}x bo'lsa, f′(${x0}) = ?`, ...opts(r, v, [a * x0 ** n + b, a * n * x0 ** n + b, a * n * x0 ** (n - 1)]), e: `f′(x) = ${a * n}x${sup(n - 1)} + ${b} ⇒ f′(${x0}) = ${v}.` }; },
    a6: (r) => { const a = ri(r, 1, 4) * 3, b = ri(r, 1, 3); const v = (a / 3) * b ** 3;
      return { t: "a6", q: `∫₀${sup(b)} ${a}x² dx = ?`, ...opts(r, v, [a * b ** 2, a * b ** 3, (a / 2) * b ** 2]), e: `${a}·x³/3 |₀${sup(b)} = ${a / 3}·${b ** 3} = ${v}.` }; },
    b2: (r) => { const [a, b, c, d] = [ri(r, -5, 7), ri(r, -4, 6), ri(r, -3, 6), ri(r, 1, 8)]; const v = a * d - b * c;
      return { t: "b2", q: `|${a} ${b}; ${c} ${d}| determinant qiymati:`, ...opts(r, v, [a * d + b * c, b * c - a * d, a * c - b * d]), e: `${a}·${d} − (${b})·(${c}) = ${v}.` }; },
    b5: (r) => { const a = [ri(r, -3, 5), ri(r, -3, 5), ri(r, 1, 5)], b = [ri(r, -3, 5), ri(r, 1, 5), ri(r, -3, 5)]; const v = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      return { t: "b5", q: `a = (${a.join(", ")}), b = (${b.join(", ")}). a·b = ?`, ...opts(r, v, [v + 2, v - 3, a[0] * b[0] + a[1] * b[1]]), e: `${a.map((x, i) => `${x}·${b[i]}`).join(" + ")} = ${v}.` }; },
    c1: (r) => { const n = ri(r, 5, 10), k = ri(r, 2, 3); const v = C(n, k);
      return { t: "c1", q: `${n} ta talabadan ${k} kishilik guruhni necha usulda tanlash mumkin?`, ...opts(r, v, [v * (k === 2 ? 2 : 6), n * k, C(n, k + 1)]), e: `C${subDigits(n)}${sup(k)} = ${n}!/(${k}!·${n - k}!) = ${v}.` }; },
    c2: (r) => { const w = ri(r, 2, 6), b = ri(r, 2, 6), v = `${w}/${w + b}`;
      return { t: "c2", q: `Qutida ${w} ta oq va ${b} ta qora shar bor. Tasodifan olingan shar oq bo'lish ehtimoli:`, ...opts(r, v, [`${b}/${w + b}`, `${w}/${b}`, `1/${w + b}`]), e: `P = m/n = ${w}/${w + b}.` }; },
    d1: (r) => { const xs = Array.from({ length: 5 }, () => ri(r, 1, 12)); const sum = xs.reduce((a, b) => a + b, 0); const v = +(sum / 5).toFixed(1);
      return { t: "d1", q: `${xs.join(", ")} tanlanmaning o'rtacha qiymati:`, ...opts(r, v, [+(v + 1).toFixed(1), sum, [...xs].sort((a, b) => a - b)[2]]), e: `${sum}/5 = ${v}.` }; },
    e1: (r) => { const a = ri(r, 11, 40), b = ri(r, 3, 7);
      return { t: "e1", q: `Python: print(${a} // ${b}, ${a} % ${b}) natijasi:`, ...opts(r, `${Math.floor(a / b)} ${a % b}`, [`${(a / b).toFixed(1)} ${a % b}`, `${a % b} ${Math.floor(a / b)}`, `${Math.floor(a / b) + 1} ${a % b}`]), e: `// — butun bo'linma, % — qoldiq.` }; },
    f3: (r) => { const p = ri(r, 1, 4), q = ri(r, p + 1, 6);
      return { t: "f3", q: `y″ − ${p + q}y′ + ${p * q}y = 0 tenglamaning umumiy yechimi:`, ...opts(r, `C₁e${sup(p === 1 ? "x" : p + "x")} + C₂e${sup(q + "x")}`, [`C₁e${sup("-" + p + "x")} + C₂e${sup("-" + q + "x")}`, `C₁cos ${p}x + C₂sin ${q}x`, `(C₁ + C₂x)e${sup(p + "x")}`]), e: `k² − ${p + q}k + ${p * q} = 0 ⇒ k = ${p}, ${q}.` }; },
    g3: (r) => { const n = ri(r, 4, 12); const v = (n * (n - 1)) / 2;
      return { t: "g3", q: `K${subDigits(n)} to'liq grafda nechta qirra bor?`, ...opts(r, v, [n * (n - 1), n * n, n - 1]), e: `n(n − 1)/2 = ${n}·${n - 1}/2 = ${v}.` }; },
  };
  function sup(s) { const m = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻", "+": "⁺", x: "ˣ", n: "ⁿ", "(": "⁽", ")": "⁾" }; s = String(s); return [...s].every((c) => m[c]) ? [...s].map((c) => m[c]).join("") : `^(${s})`; }
  function subDigits(s) { const m = "₀₁₂₃₄₅₆₇₈₉"; return String(s).replace(/\d/g, (d) => m[d]); }
  const genTopics = Object.keys(GEN);

  /* ---------- Test sessiyasi ---------- */
  function prepare(q, r) {
    const idx = shuffle([0, 1, 2, 3], r);
    return { ...q, o: idx.map((i) => q.o[i]), a: idx.indexOf(q.a) };
  }
  function startTest(cfg) {
    const u = Store.need("student");
    let title, s, qs, minutes, ref = null, mode = "test";
    if (cfg.testId) {
      const t = test(cfg.testId); title = t.title; s = t.s;
      qs = shuffle(DATA.QUESTIONS.filter((q) => t.topics.includes(q.t))).slice(0, 10);
      const gt = t.topics.filter((x) => GEN[x]); if (gt.length) qs = qs.slice(0, 8).concat([GEN[gt[0]](Math.random), GEN[gt[gt.length - 1]](Math.random)]);
      ref = t.id;
    } else if (cfg.assignId) {
      const as = db().assignments.find((a) => a.id === cfg.assignId); if (!as) throw new Error("Topshiriq topilmadi.");
      title = as.title; s = as.s; qs = as.qids.map(question).filter(Boolean); minutes = as.minutes; ref = as.id; mode = "assign";
    } else if (cfg.mode === "mistakes") {
      qs = shuffle(mistakes(u.id)).slice(0, 10); if (!qs.length) throw new Error("Xatolar daftaringiz bo'sh — ajoyib!");
      title = "Xatolar ustida ishlash"; s = qs[0].t ? topic(qs[0].t).s : "analiz"; mode = "mistakes";
    } else if (cfg.mode === "adaptive") {
      const rec = recommendations(u.id, 5).map((m) => m.tid);
      qs = rec.flatMap((tid) => shuffle(DATA.QUESTIONS.filter((q) => q.t === tid)).slice(0, 2));
      rec.filter((tid) => GEN[tid]).slice(0, 2).forEach((tid) => qs.push(GEN[tid](Math.random)));
      if (qs.length < 4) qs = qs.concat(shuffle(DATA.QUESTIONS).slice(0, 6));
      qs = qs.slice(0, 10); title = "Moslashuvchan test (zaif mavzular)"; s = topic(qs[0].t).s; mode = "adaptive";
    } else if (cfg.mode === "gen") {
      const pool = cfg.s ? genTopics.filter((t) => topic(t).s === cfg.s) : genTopics;
      qs = Array.from({ length: 8 }, (_, i) => GEN[pool[i % pool.length]](Math.random)); title = "Cheksiz mashq (generator)"; s = topic(qs[0].t).s; mode = "gen";
    } else if (cfg.s) {
      const t = subj(cfg.s); title = t.name + ": umumiy test"; s = t.id;
      qs = shuffle(DATA.QUESTIONS.filter((q) => topic(q.t).s === s)).slice(0, 12); ref = "all-" + s;
    } else throw new Error("Test turi noma'lum.");
    qs = qs.map((q) => prepare(q, Math.random));
    return { id: U.uid("ses"), title, s, qs, answers: qs.map(() => null), flags: qs.map(() => false), startedAt: Date.now(), limitSec: (minutes || Math.max(5, Math.ceil(qs.length * 1.5))) * 60, ref, mode };
  }
  function submitTest(ses) {
    const u = Store.need("student");
    const items = ses.qs.map((q, i) => ({ qid: q.id || null, t: q.t, given: ses.answers[i], ok: ses.answers[i] === q.a, gen: q.id ? null : { q: q.q, o: q.o, a: q.a, e: q.e }, o: q.o, a: q.a }));
    const score = items.filter((i) => i.ok).length;
    const at = { id: U.uid("at"), uid: u.id, testId: ses.ref, title: ses.title, s: ses.s, startedAt: ses.startedAt, finishedAt: Date.now(), items, score, total: items.length, pct: U.pct(score, items.length), mode: ses.mode };
    db().attempts.push(at);
    log(u.id, "test", `${ses.title} – Test natijasi`, at.pct + "%");
    db().events.filter((e) => e.uid === u.id && e.ref === ses.ref && !e.done).forEach((e) => (e.done = true));
    if (ses.mode === "assign") { const as = db().assignments.find((a) => a.id === ses.ref); if (as) notify(as.by, `${fullName(u)} «${as.title}» topshirig'ini bajardi: ${at.pct}%`, "#/ustoz"); }
    if (at.pct === 100) notify(u.id, `Ajoyib! «${ses.title}» testida 100% natija. Yangi yutuq ochildi.`, "#/progress");
    const weakT = [...new Set(items.filter((i) => !i.ok).map((i) => i.t))];
    if (weakT.length) notify(u.id, `Tavsiya: «${topic(weakT[0]).name}» mavzusini takrorlang — testda xato bo'ldi.`, `#/fan/${topic(weakT[0]).s}`);
    Store.save(); return at;
  }
  const attemptsOf = (uid) => db().attempts.filter((a) => a.uid === uid).sort((a, b) => b.finishedAt - a.finishedAt);
  const itemQuestion = (it) => (it.qid ? { ...question(it.qid), o: it.o || question(it.qid).o, a: it.a ?? question(it.qid).a } : { ...it.gen, t: it.t });

  /* ---------- Maqsadlar ---------- */
  function goals(uid) {
    return db().goals.filter((g) => g.uid === uid).map((g) => {
      let p = 0, note = "";
      if (g.type === "subject") { const st = subjectStats(uid, g.s); p = U.pct(st.learned, st.total); note = `${st.learned} / ${st.total} mavzu`; }
      else if (g.type === "tests") { const n = db().attempts.filter((a) => a.uid === uid && a.s === g.s && a.finishedAt >= g.createdAt).length; p = U.pct(Math.min(n, g.target), g.target); note = `${Math.min(n, g.target)} / ${g.target} test`; }
      else if (g.type === "score") { const st = subjectStats(uid, g.s); p = U.clamp(U.pct(st.avgPct, g.target), 0, 100); note = `${st.avgPct}% / ${g.target}%`; }
      return { ...g, p, note, done: p >= 100 };
    });
  }
  function addGoal(o) {
    const u = Store.need("student");
    if (!subj(o.s)) throw new Error("Fanni tanlang.");
    const target = o.type === "subject" ? 100 : U.clamp(+o.target || 0, 1, o.type === "score" ? 100 : 50);
    const title = o.type === "subject" ? `${subj(o.s).name}ni to'liq o'rganish` : o.type === "tests" ? `${subj(o.s).name} bo'yicha ${target} ta testni yechish` : `${subj(o.s).name}: o'rtacha natija ${target}%`;
    db().goals.push({ id: U.uid("g"), uid: u.id, type: o.type, s: o.s, target, title, createdAt: Date.now() }); Store.save();
  }
  function removeGoal(id) { const u = Store.need(); db().goals = db().goals.filter((g) => !(g.id === id && g.uid === u.id)); Store.save(); }

  /* ---------- Kalendar / vazifalar ---------- */
  const events = (uid, date) => db().events.filter((e) => e.uid === uid && (!date || e.date === date)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  function addEvent(o) {
    const u = Store.need();
    const title = String(o.title || "").trim(); if (title.length < 2) throw new Error("Vazifa nomini kiriting.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.date)) throw new Error("Sanani tanlang.");
    db().events.push({ id: U.uid("ev"), uid: u.id, date: o.date, time: /^\d{2}:\d{2}$/.test(o.time) ? o.time : "09:00", title: title.slice(0, 80), sub: String(o.sub || "").slice(0, 100), kind: "own", done: false }); Store.save();
  }
  function toggleEvent(id) { const u = Store.need(); const e = db().events.find((x) => x.id === id && x.uid === u.id); if (e) { e.done = !e.done; Store.save(); } }
  function removeEvent(id) { const u = Store.need(); db().events = db().events.filter((x) => !(x.id === id && x.uid === u.id)); Store.save(); }

  /* ---------- Bildirishnomalar ---------- */
  const notifs = (uid) => db().notifs.filter((n) => n.uid === uid).sort((a, b) => b.ts - a.ts).slice(0, 30);
  function readAll(uid) { db().notifs.forEach((n) => { if (n.uid === uid) n.read = true; }); Store.save(); }
  const activity = (uid, n = 6) => db().activity.filter((a) => a.uid === uid).sort((a, b) => b.ts - a.ts).slice(0, n);

  /* ---------- AI suhbatlar ---------- */
  const chats = (uid) => db().chats.filter((c) => c.uid === uid).sort((a, b) => b.ts - a.ts);
  function saveChat(chat) {
    const u = Store.need(); chat.uid = u.id; chat.ts = Date.now();
    const i = db().chats.findIndex((c) => c.id === chat.id && c.uid === u.id);
    if (i < 0) db().chats.push(chat); else if (db().chats[i] !== chat) db().chats[i] = chat;
    const mine = db().chats.filter((c) => c.uid === u.id); if (mine.length > 60) db().chats = db().chats.filter((c) => c.uid !== u.id || mine.slice(-60).includes(c));
    Store.save();
  }
  function deleteChat(id) { const u = Store.need(); db().chats = db().chats.filter((c) => !(c.id === id && c.uid === u.id)); Store.save(); }

  /* ---------- Profil ---------- */
  function updateProfile(o) {
    const u = Store.need(); const f = String(o.first || "").trim(), l = String(o.last || "").trim();
    if (f.length < 2 || f.length > 40 || (u.role !== "admin" && (l.length < 2 || l.length > 40))) throw new Error("Ism va familiyani to'liq kiriting.");
    u.first = f; u.last = l.slice(0, 40);
    if (u.role === "student") {
      if (DATA.UNIVERSITIES.includes(o.uni)) u.uni = o.uni;
      if (DATA.FACULTIES.includes(o.faculty)) u.faculty = o.faculty;
      if ([1, 2, 3, 4].includes(+o.course)) u.course = +o.course;
      u.group = String(o.group || "").trim().slice(0, 20);
    }
    Store.save(); return true;
  }

  /* ---------- Adabiyotlar ---------- */
  function suggestBook(o) {
    const u = Store.need(); const title = String(o.title || "").trim();
    if (title.length < 3) throw new Error("Adabiyot nomini kiriting.");
    db().suggestions.unshift({ id: U.uid("sg"), uid: u.id, title: title.slice(0, 120), author: String(o.author || "").slice(0, 80), note: String(o.note || "").slice(0, 300), ts: Date.now(), status: "new" });
    db().users.filter((x) => x.role === "admin").forEach((a) => notify(a.id, `Yangi adabiyot taklifi: «${title.slice(0, 60)}»`, "#/admin"));
    Store.save();
  }

  /* ---------- Ustoz ---------- */
  function createAssignment(o) {
    const u = Store.need("teacher");
    const title = String(o.title || "").trim(); if (title.length < 3) throw new Error("Topshiriq nomini kiriting.");
    if (!subj(o.s)) throw new Error("Fanni tanlang.");
    const topics = (o.topics || []).filter((t) => topic(t) && topic(t).s === o.s); if (!topics.length) throw new Error("Kamida bitta mavzu tanlang.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.deadline) || U.fromKey(o.deadline) < U.fromKey(U.dayKey())) throw new Error("Muddat bugundan oldin bo'lmasin.");
    const pool = shuffle(DATA.QUESTIONS.filter((q) => topics.includes(q.t)));
    const count = U.clamp(+o.count || 5, 3, pool.length);
    const as = { id: U.uid("as"), by: u.id, title: title.slice(0, 80), s: o.s, topics, count, minutes: U.clamp(+o.minutes || 15, 5, 90), deadline: o.deadline, group: String(o.group || "").trim(), createdAt: Date.now(), qids: pool.slice(0, count).map((q) => q.id) };
    db().assignments.unshift(as);
    const studs = db().users.filter((x) => x.role === "student" && (!as.group || x.group === as.group));
    studs.forEach((s) => { notify(s.id, `${u.first[0]}. ${u.last} yangi test topshirig'i berdi: «${as.title}»`, "#/testlar"); db().events.push({ id: U.uid("ev"), uid: s.id, date: as.deadline, time: "23:59", title: as.title, sub: "Ustoz topshirig'i — muddat", kind: "assign", ref: as.id, done: false }); });
    Store.save(); return { as, n: studs.length };
  }
  function assignmentsFor(u) {
    if (u.role === "teacher") return db().assignments.filter((a) => a.by === u.id);
    return db().assignments.filter((a) => !a.group || a.group === u.group).map((a) => ({ ...a, attempt: db().attempts.find((t) => t.uid === u.id && t.testId === a.id) }));
  }
  function assignmentResults(aid) {
    const u = Store.need("teacher", "admin"); const as = db().assignments.find((a) => a.id === aid); if (!as || (u.role === "teacher" && as.by !== u.id)) throw new Error("Topshiriq topilmadi.");
    return db().users.filter((x) => x.role === "student" && (!as.group || x.group === as.group)).map((s) => ({ s, at: db().attempts.filter((t) => t.uid === s.id && t.testId === aid).sort((a, b) => b.finishedAt - a.finishedAt)[0] }));
  }
  function deleteAssignment(aid) { const u = Store.need("teacher"); db().assignments = db().assignments.filter((a) => !(a.id === aid && a.by === u.id)); db().events = db().events.filter((e) => e.ref !== aid); Store.save(); }
  function classStats(group) {
    Store.need("teacher", "admin");
    const studs = db().users.filter((x) => x.role === "student" && (!group || x.group === group));
    const ids = new Set(studs.map((s) => s.id));
    const items = db().attempts.filter((a) => ids.has(a.uid)).flatMap((a) => a.items);
    const byT = DATA.TOPICS.map((t) => { const its = items.filter((i) => i.t === t.id); return { t, n: its.length, acc: its.length ? U.pct(its.filter((i) => i.ok).length, its.length) : null }; });
    return { studs: studs.map((s) => ({ s, o: overall(s.id), st: streak(s.id) })), byT };
  }
  function csv(rows) { return "﻿" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n"); }

  /* ---------- Admin ---------- */
  function setBlocked(uid, v) { const me = Store.need("admin"); if (uid === me.id) throw new Error("O'zingizni bloklay olmaysiz."); const u = user(uid); if (u) { u.blocked = v; Store.save(); } }
  function setRole(uid, role) { const me = Store.need("admin"); if (uid === me.id) throw new Error("O'z rolingizni o'zgartira olmaysiz."); if (!["student", "teacher", "admin"].includes(role)) return; const u = user(uid); if (u) { u.role = role; Store.save(); } }
  function addBook(o) {
    Store.need("admin"); const title = String(o.title || "").trim(); if (title.length < 3) throw new Error("Nomi kiritilmadi.");
    if (!subj(o.s)) throw new Error("Fanni tanlang.");
    const colors = [["#3F37C9", "#5B4CF0"], ["#065F46", "#10B981"], ["#9D174D", "#EC4899"], ["#92400E", "#F59E0B"], ["#155E75", "#06B6D4"]];
    db().books.unshift({ id: U.uid("k"), title: title.slice(0, 120), author: String(o.author || "—").slice(0, 80), type: o.type || "Qo'shimcha manba", s: o.s, course: U.clamp(+o.course || 1, 1, 4), cover: colors[db().books.length % colors.length], about: String(o.about || "").slice(0, 400), toc: [], custom: true });
    Store.save();
  }
  function removeBook(id) { Store.need("admin"); db().books = db().books.filter((b) => b.id !== id); Store.save(); }
  function resolveSuggestion(id, approve) {
    Store.need("admin"); const s = db().suggestions.find((x) => x.id === id); if (!s) return;
    s.status = approve ? "ok" : "no";
    if (approve) { addBook({ title: s.title, author: s.author || "—", s: "analiz", type: "Qo'shimcha manba", about: s.note }); notify(s.uid, `Taklifingiz qabul qilindi: «${s.title}» kutubxonaga qo'shildi.`, "#/adabiyotlar"); }
    else notify(s.uid, `Taklifingiz ko'rib chiqildi: «${s.title}» hozircha qo'shilmadi.`, "#/adabiyotlar");
    Store.save();
  }
  function platformStats() {
    Store.need("admin"); const d = db();
    const bySubj = DATA.SUBJECTS.map((s) => { const at = d.attempts.filter((a) => a.s === s.id); return { s, n: at.length, avg: at.length ? Math.round(at.reduce((x, a) => x + a.pct, 0) / at.length) : 0 }; });
    return { users: d.users.length, students: d.users.filter((u) => u.role === "student").length, teachers: d.users.filter((u) => u.role === "teacher").length,
      attempts: d.attempts.length, aiMsgs: d.chats.reduce((x, c) => x + c.msgs.length, 0), books: books().length, bySubj,
      failed24: d.secLog.filter((l) => !l.ok && Date.now() - l.ts < 864e5).length };
  }

  /* ---------- Qidiruv ---------- */
  function search(q) {
    q = U.norm(q); if (q.length < 2) return null;
    const has = (s) => U.norm(s).includes(q);
    return {
      subjects: DATA.SUBJECTS.filter((s) => has(s.name)).slice(0, 4),
      topics: DATA.TOPICS.filter((t) => has(t.name) || t.kw.some(has)).slice(0, 6),
      tests: DATA.TESTS.filter((t) => has(t.title)).slice(0, 4),
      books: books().filter((b) => has(b.title) || has(b.author)).slice(0, 4),
    };
  }

  /* ---------- Konspekt (yuklab olish uchun) ---------- */
  function konspekt(sid) {
    const s = subj(sid); const L = [`PM Edu — ${s.name}: qisqa konspekt`, "=".repeat(50), s.desc, ""];
    topicsOf(sid).forEach((t, i) => { L.push(`${i + 1}. ${t.name}`, "-".repeat(40), t.theory, "", "Asosiy formulalar:"); t.formulas.forEach((f) => L.push("  • " + f)); L.push("", "Namuna: " + t.example, ""); });
    L.push("", "© PM Edu — Amaliy matematika talabalari uchun raqamli ta'lim platformasi");
    return L.join("\n");
  }

  return { subj, topic, topicsOf, question, test, books, user, fullName, shuffle, LEVELS, mastery, knowledgeMap, subjectStats, overall, recommendations, mistakes, streak, timeline, leaderboard, achievements,
    toggleLearned, GEN, genTopics, sup, startTest, submitTest, attemptsOf, itemQuestion, goals, addGoal, removeGoal, events, addEvent, toggleEvent, removeEvent, notifs, readAll, activity,
    chats, saveChat, deleteChat, updateProfile, suggestBook, createAssignment, assignmentsFor, assignmentResults, deleteAssignment, classStats, csv, setBlocked, setRole, addBook, removeBook, resolveSuggestion, platformStats, search, konspekt, log };
})();
