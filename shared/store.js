/* ===== store.js — ma'lumotlar ombori (localStorage + zaxira xotira) va autentifikatsiya ===== */
"use strict";
const Store = (() => {
  const KEY = "pmedu_db_v1";
  const SESSION_HOURS = 8, MAX_FAILS = 5, LOCK_MIN = 5;
  let mem = null, db = null, persistent = true;

  const read = () => { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { persistent = false; return mem; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { persistent = false; mem = JSON.parse(JSON.stringify(db)); } };

  /* Deterministik tasodifiy generator (seed ma'lumotlari har safar bir xil bo'lishi uchun) */
  const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

  function mkUser(o) {
    const salt = SHA256.salt();
    return { id: o.id || U.uid("u"), email: o.email.toLowerCase(), salt, hash: SHA256.pass(o.password, salt), role: o.role || "student",
      first: o.first, last: o.last, uni: o.uni || "", faculty: o.faculty || "", course: o.course || 1, year: o.year || "2025 - 2026",
      group: o.group || "", createdAt: o.createdAt || Date.now(), blocked: false, demo: !!o.demo };
  }

  function seedAttempts(d, uid, skill, n, r) {
    const now = Date.now();
    for (let k = 0; k < n; k++) {
      const t = DATA.TESTS[Math.floor(r() * DATA.TESTS.length)];
      const qs = DATA.QUESTIONS.filter((q) => t.topics.includes(q.t)).slice(0, 10);
      const sk = skill[t.s] ?? 0.6;
      const items = qs.map((q) => { const ok = r() < sk; const wrong = (q.a + 1 + Math.floor(r() * 3)) % 4; return { qid: q.id, t: q.t, given: ok ? q.a : wrong, ok }; });
      const score = items.filter((i) => i.ok).length;
      const ts = now - Math.floor((n - k) * (9 / n) * 864e5) - Math.floor(r() * 5e6);
      d.attempts.push({ id: U.uid("at"), uid, testId: t.id, title: t.title, s: t.s, startedAt: ts - 9e5, finishedAt: ts, items, score, total: items.length, pct: U.pct(score, items.length), mode: "test" });
    }
  }

  function seed() {
    const d = { v: 1, users: [], attempts: [], learned: {}, goals: [], events: [], activity: [], notifs: [], chats: [], assignments: [], suggestions: [], books: [], lock: {}, secLog: [], session: null, createdAt: Date.now() };
    const dunyo = mkUser({ id: "u_dunyo", email: "dunyo@pmedu.uz", password: "demo123", first: "Dunyo", last: "Tolipova", uni: DATA.UNIVERSITIES[0], faculty: "Amaliy matematika", course: 2, year: "2025 - 2026", group: "AM-21", demo: true });
    const ustoz = mkUser({ id: "u_ustoz", email: "ustoz@pmedu.uz", password: "demo123", role: "teacher", first: "Rustam", last: "Karimov", uni: DATA.UNIVERSITIES[0], faculty: "Amaliy matematika", demo: true });
    const admin = mkUser({ id: "u_admin", email: "admin@pmedu.uz", password: "admin123", role: "admin", first: "Administrator", last: "", demo: true });
    d.users.push(dunyo, ustoz, admin);
    const r = rng(20260929);
    DATA.PEERS.forEach((p, i) => {
      const u = mkUser({ email: `${p.first.toLowerCase()}.${p.last.toLowerCase()}@pmedu.uz`, password: "demo123", first: p.first, last: p.last, uni: DATA.UNIVERSITIES[0], faculty: "Amaliy matematika", course: 2, group: i % 2 ? "AM-22" : "AM-21", demo: true });
      d.users.push(u);
      const sk = {}; DATA.SUBJECTS.forEach((s) => (sk[s.id] = Math.min(0.99, p.score / 100 + (r() - 0.5) * 0.08)));
      seedAttempts(d, u.id, sk, 8, r);
      d.learned[u.id] = {}; DATA.TOPICS.forEach((t) => { if (r() < p.score / 100) d.learned[u.id][t.id] = Date.now() - Math.floor(r() * 12) * 864e5; });
    });
    seedAttempts(d, dunyo.id, { analiz: 0.82, algebra: 0.66, ehtimol: 0.55, statistika: 0.6, dastur: 0.46, diftenglama: 0.32, diskret: 0.72 }, 14, r);
    d.learned[dunyo.id] = {};
    ["a1", "a2", "a3", "a4", "a5", "b1", "b2", "b3", "c1", "c2", "d1", "e1", "e2", "g1", "g2"].forEach((t, i) => (d.learned[dunyo.id][t] = Date.now() - (15 - i) * 0.7 * 864e5));
    const today = U.dayKey(), tomorrow = U.dayKey(new Date(Date.now() + 864e5)), in2 = U.dayKey(new Date(Date.now() + 2 * 864e5));
    d.events.push(
      { id: U.uid("ev"), uid: dunyo.id, date: today, time: "10:00", title: "Matematik analiz", sub: "Mavzu: Limit va uzluksizlik", kind: "topic", ref: "a2", done: true },
      { id: U.uid("ev"), uid: dunyo.id, date: today, time: "14:00", title: "Chiziqli algebra", sub: "Mavzu: Matritsalar", kind: "topic", ref: "b1", done: false },
      { id: U.uid("ev"), uid: dunyo.id, date: today, time: "17:00", title: "Test sinovi", sub: "Ehtimollar nazariyasi asoslari", kind: "test", ref: "t-ehtimol", done: false },
      { id: U.uid("ev"), uid: dunyo.id, date: tomorrow, time: "15:00", title: "Chiziqli algebra: Test", sub: "Matritsalar va determinantlar", kind: "test", ref: "t-matritsa", done: false },
      { id: U.uid("ev"), uid: dunyo.id, date: in2, time: "10:00", title: "Differensial tenglamalar", sub: "Mavzu: Koshi masalasi", kind: "topic", ref: "f4", done: false },
    );
    d.goals.push(
      { id: U.uid("g"), uid: dunyo.id, type: "subject", s: "analiz", target: 100, title: "Matematik analizni to'liq o'rganish", createdAt: Date.now() - 6 * 864e5 },
      { id: U.uid("g"), uid: dunyo.id, type: "tests", s: "dastur", target: 3, title: "Dasturlash bo'yicha 3 ta testni yechish", createdAt: Date.now() - 3 * 864e5 },
    );
    const aid = U.uid("as"), dl = U.dayKey(new Date(Date.now() + 3 * 864e5));
    d.assignments.push({ id: aid, by: ustoz.id, title: "Matematik analiz: Nazorat testi", s: "analiz", topics: ["a2", "a3", "a5"], count: 8, minutes: 15, deadline: dl, group: "AM-21", createdAt: Date.now() - 864e5,
      qids: DATA.QUESTIONS.filter((q) => ["a2", "a3", "a5"].includes(q.t)).slice(0, 8).map((q) => q.id) });
    d.events.push({ id: U.uid("ev"), uid: dunyo.id, date: dl, time: "14:00", title: "Matematik analiz: Test", sub: "Ustoz topshirig'i", kind: "assign", ref: aid, done: false });
    d.notifs.push(
      { id: U.uid("n"), uid: dunyo.id, ts: Date.now() - 864e5, text: "R. Karimov yangi test topshirig'i berdi: «Matematik analiz: Nazorat testi»", read: false, link: "#/testlar" },
      { id: U.uid("n"), uid: dunyo.id, ts: Date.now() - 2 * 864e5, text: "«Determinantlar» mavzusini takrorlash vaqti keldi — bilim xaritasini ko'ring.", read: false, link: "#/progress" },
    );
    d.attempts.filter((a) => a.uid === dunyo.id).slice(-4).forEach((a) => d.activity.push({ id: U.uid("ac"), uid: dunyo.id, ts: a.finishedAt, kind: "test", title: `${subjName(a.s)} – Test natijasi`, val: a.pct + "%" }));
    d.activity.push({ id: U.uid("ac"), uid: dunyo.id, ts: Date.now() - 3.6e6 * 5, kind: "topic", title: "Chiziqli algebra – Mavzu o'qildi", val: "" });
    d.chats.push({ id: U.uid("ch"), uid: dunyo.id, title: "Ikki o'zgaruvchili funksiya hosilasi", ts: Date.now() - 3.6e6 * 3, msgs: [] });
    d.secLog.push({ ts: Date.now() - 3.6e6 * 30, email: "noma'lum@pmedu.uz", ok: false });
    return d;
  }
  const subjName = (id) => (DATA.SUBJECTS.find((s) => s.id === id) || {}).name || id;

  function init() {
    db = read();
    if (!db || db.v !== 1) { db = seed(); save(); }
    return db;
  }
  function reset() { db = seed(); save(); }

  /* ---------- Autentifikatsiya ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function current() {
    if (!db.session) return null;
    if (Date.now() > db.session.exp) { db.session = null; save(); return null; }
    const u = db.users.find((x) => x.id === db.session.uid);
    return u && !u.blocked ? u : null;
  }
  function login(email, password, remember) {
    email = String(email || "").trim().toLowerCase();
    const lk = db.lock[email];
    if (lk && lk.until > Date.now()) {
      const m = Math.ceil((lk.until - Date.now()) / 60000);
      throw new Error(`Ko'p marta noto'g'ri urinish. ${m} daqiqadan so'ng qayta urinib ko'ring.`);
    }
    const u = db.users.find((x) => x.email === email);
    const ok = u && SHA256.pass(password, u.salt) === u.hash;
    db.secLog.unshift({ ts: Date.now(), email, ok: !!ok }); db.secLog = db.secLog.slice(0, 200);
    if (!ok) {
      const prev = lk ? (lk.until && lk.until <= Date.now() ? 0 : lk.fails) : 0;
      const f = prev + 1;
      db.lock[email] = { fails: f, until: f >= MAX_FAILS ? Date.now() + LOCK_MIN * 60000 : 0 };
      save();
      const left = MAX_FAILS - f;
      throw new Error(left > 0 ? `Email yoki parol noto'g'ri. Qolgan urinishlar: ${left}.` : `Hisob ${LOCK_MIN} daqiqaga bloklandi.`);
    }
    if (u.blocked) { save(); throw new Error("Hisobingiz administrator tomonidan bloklangan."); }
    delete db.lock[email];
    db.session = { uid: u.id, exp: Date.now() + (remember ? 7 * 24 : SESSION_HOURS) * 3.6e6 };
    save();
    return u;
  }
  function validatePassword(pw) {
    if (!pw || pw.length < 8) return "Parol kamida 8 ta belgidan iborat bo'lsin.";
    if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Parolda harf va raqam bo'lishi kerak.";
    return "";
  }
  function register(o) {
    const email = String(o.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new Error("Email manzil noto'g'ri.");
    if (db.users.some((x) => x.email === email)) throw new Error("Bu email bilan hisob allaqachon mavjud.");
    const pe = validatePassword(o.password); if (pe) throw new Error(pe);
    const first = String(o.first || "").trim(), last = String(o.last || "").trim();
    if (first.length < 2 || first.length > 40) throw new Error("Ismni to'g'ri kiriting.");
    if (last.length < 2 || last.length > 40) throw new Error("Familiyani to'g'ri kiriting.");
    const u = mkUser({ email, password: o.password, first, last, uni: o.uni, faculty: o.faculty, course: +o.course || 1, year: o.year, group: String(o.group || "").slice(0, 20) });
    db.users.push(u); db.learned[u.id] = {};
    db.notifs.push({ id: U.uid("n"), uid: u.id, ts: Date.now(), text: "PM Edu ga xush kelibsiz! Birinchi qadam — «Fanlar» bo'limidan mavzu tanlang.", read: false, link: "#/fanlar" });
    db.session = { uid: u.id, exp: Date.now() + SESSION_HOURS * 3.6e6 };
    save();
    return u;
  }
  function logout() { db.session = null; save(); }
  function changePassword(oldPw, newPw) {
    const u = current(); if (!u) throw new Error("Avval tizimga kiring.");
    if (SHA256.pass(oldPw, u.salt) !== u.hash) throw new Error("Joriy parol noto'g'ri.");
    const pe = validatePassword(newPw); if (pe) throw new Error(pe);
    u.salt = SHA256.salt(); u.hash = SHA256.pass(newPw, u.salt); save();
  }
  function need(...roles) {
    const u = current();
    if (!u) throw new Error("Avval tizimga kiring.");
    if (roles.length && !roles.includes(u.role)) throw new Error("Bu amal uchun ruxsat yo'q.");
    return u;
  }
  const get = () => db;
  const isPersistent = () => persistent;
  return { init, reset, save, get, current, login, register, logout, changePassword, need, validatePassword, isPersistent, subjName, EMAIL_RE };
})();
