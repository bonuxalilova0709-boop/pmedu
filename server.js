#!/usr/bin/env node
/* =====================================================================
   PM Edu — server (Node.js 18+, tashqi kutubxonalarsiz)
   - Biznes-mantiq brauzer bilan bir xil: shared/services.js server ichida ishlaydi
   - Ma'lumotlar: data/db.json (atomik yozish) + kunlik zaxira nusxalar
   - Parollar: scrypt; sessiya: HttpOnly cookie; rollar serverda tekshiriladi
   Ishga tushirish:  node server.js
   Admin yaratish:   node server.js create-admin email@domain.uz "Ism Familiya"
   Parol tiklash:    node server.js reset-password email@domain.uz
   ===================================================================== */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto"), zlib = require("zlib"), vm = require("vm");

/* ---------------- Sozlamalar (muhit o'zgaruvchilari) ---------------- */
loadEnv(path.join(__dirname, ".env"));
const CFG = {
  port: +process.env.PORT || 3000,
  host: process.env.HOST || "127.0.0.1",
  dataDir: path.resolve(__dirname, process.env.DATA_DIR || "data"),
  demo: process.env.PM_DEMO === "1",
  secureCookie: process.env.COOKIE_SECURE !== "0",
  allowedDomains: (process.env.ALLOWED_EMAIL_DOMAINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  registration: process.env.REGISTRATION !== "closed",
  backupsKeep: +process.env.BACKUPS_KEEP || 14,
};
function loadEnv(f) { try { fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/); if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }); } catch (e) { /* .env ixtiyoriy */ } }

/* ---------------- Umumiy kodni yuklash (brauzer bilan bir xil fayllar) ---------------- */
const ctx = vm.createContext({ console, Date, Math, JSON, TextEncoder, setTimeout, clearTimeout });
let CUR = null;          // joriy so'rov foydalanuvchisi (handlerlar sinxron — xavfsiz)
let db = null;
const ServerStore = {
  get: () => db, save: () => schedulePersist(), current: () => CUR,
  need(...roles) { if (!CUR) throw httpErr(401, "Avval tizimga kiring."); if (roles.length && !roles.includes(CUR.role)) throw httpErr(403, "Bu amal uchun ruxsat yo'q."); return CUR; },
  subjName: (id) => vm.runInContext("(DATA.SUBJECTS.find((s) => s.id === " + JSON.stringify(id) + ") || {}).name", ctx) || id,
  isPersistent: () => true,
  EMAIL_RE: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
};
ctx.Store = ServerStore;
for (const f of ["utils", "data", "services"]) vm.runInContext(fs.readFileSync(path.join(__dirname, "shared", f + ".js"), "utf8"), ctx, { filename: f + ".js" });
const S = vm.runInContext("S", ctx), DATA = vm.runInContext("DATA", ctx), U = vm.runInContext("U", ctx);

/* ---------------- Ma'lumotlar ombori ---------------- */
const DB_FILE = path.join(CFG.dataDir, "db.json"), BK_DIR = path.join(CFG.dataDir, "backups");
fs.mkdirSync(BK_DIR, { recursive: true });
const EMPTY = () => ({ v: 1, users: [], attempts: [], learned: {}, goals: [], events: [], activity: [], notifs: [], chats: [], assignments: [], suggestions: [], books: [], lock: {}, secLog: [], sessions: {}, assignStarts: {}, createdAt: Date.now() });
function loadDb() {
  if (fs.existsSync(DB_FILE)) { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); for (const [k, v] of Object.entries(EMPTY())) if (db[k] === undefined) db[k] = v; return; }
  db = CFG.demo ? demoSeed() : EMPTY(); persistNow();
  console.log(CFG.demo ? "Demo ma'lumotlar yaratildi." : "Bo'sh ma'lumotlar bazasi yaratildi. Admin yarating: node server.js create-admin email \"Ism Familiya\"");
}
let persistTimer = null;
function schedulePersist() { clearTimeout(persistTimer); persistTimer = setTimeout(persistNow, 400); }
function persistNow() {
  clearTimeout(persistTimer); persistTimer = null;
  const tmp = DB_FILE + ".tmp", data = JSON.stringify(db);
  const fd = fs.openSync(tmp, "w", 0o600); fs.writeSync(fd, data); fs.fsyncSync(fd); fs.closeSync(fd); fs.renameSync(tmp, DB_FILE);
}
function dailyBackup() {
  try {
    const name = path.join(BK_DIR, `db-${new Date().toISOString().slice(0, 10)}.json.gz`);
    if (!fs.existsSync(name) && fs.existsSync(DB_FILE)) fs.writeFileSync(name, zlib.gzipSync(fs.readFileSync(DB_FILE)), { mode: 0o600 });
    const all = fs.readdirSync(BK_DIR).filter((f) => /^db-.*\.json\.gz$/.test(f)).sort();
    all.slice(0, Math.max(0, all.length - CFG.backupsKeep)).forEach((f) => fs.unlinkSync(path.join(BK_DIR, f)));
  } catch (e) { console.error("Zaxira nusxa xatosi:", e.message); }
}
function demoSeed() {
  const c2 = vm.createContext({ console, Date, Math, JSON, TextEncoder, localStorage: { getItem: () => null, setItem() {} } });
  for (const f of ["utils", "sha256", "data", "store"]) vm.runInContext(fs.readFileSync(path.join(__dirname, "shared", f + ".js"), "utf8"), c2);
  vm.runInContext("Store.init()", c2);
  const d = JSON.parse(JSON.stringify(vm.runInContext("Store.get()", c2)));
  d.users.forEach((u) => { u.pw = hashPw(u.role === "admin" ? "admin123" : "demo123"); delete u.salt; delete u.hash; });
  d.session = undefined; d.sessions = {}; d.assignStarts = {};
  return d;
}

/* ---------------- Parollar va sessiyalar ---------------- */
function hashPw(pw) { const salt = crypto.randomBytes(16); const h = crypto.scryptSync(String(pw), salt, 64, { N: 16384, r: 8, p: 1 }); return `scrypt$${salt.toString("base64")}$${h.toString("base64")}`; }
function checkPw(pw, stored) {
  if (!stored || !stored.startsWith("scrypt$")) return false;
  const [, s, h] = stored.split("$"); const exp = Buffer.from(h, "base64");
  const got = crypto.scryptSync(String(pw), Buffer.from(s, "base64"), exp.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(got, exp);
}
const DUMMY = hashPw("dummy-password-for-timing");
function validatePassword(pw) { pw = String(pw || ""); if (pw.length < 8) return "Parol kamida 8 ta belgidan iborat bo'lsin."; if (pw.length > 200) return "Parol juda uzun."; if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Parolda harf va raqam bo'lishi kerak."; return ""; }
function newSession(res, uid, remember) {
  const tok = crypto.randomBytes(32).toString("base64url"), ttl = (remember ? 7 * 24 : 8) * 3.6e6;
  db.sessions[sha(tok)] = { uid, exp: Date.now() + ttl, created: Date.now() };
  res.setHeader("Set-Cookie", cookie("pm_sid", tok, remember ? ttl / 1000 : null));
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const cookie = (n, v, maxAge) => `${n}=${v}; Path=/; HttpOnly; SameSite=Strict${CFG.secureCookie ? "; Secure" : ""}${maxAge != null ? `; Max-Age=${Math.floor(maxAge)}` : ""}`;
function sessionUser(req) {
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)pm_sid=([A-Za-z0-9_-]+)/); if (!m) return null;
  const s = db.sessions[sha(m[1])]; if (!s) return null;
  if (s.exp < Date.now()) { delete db.sessions[sha(m[1])]; return null; }
  const u = db.users.find((x) => x.id === s.uid); return u && !u.blocked ? u : null;
}
function cleanSessions() { const now = Date.now(); for (const [k, s] of Object.entries(db.sessions)) if (s.exp < now) delete db.sessions[k]; }

/* ---------------- Kirish / ro'yxatdan o'tish ---------------- */
const ipHits = new Map();
function ipLimit(ip, max = 30, win = 10 * 60e3) { const now = Date.now(); const a = (ipHits.get(ip) || []).filter((t) => now - t < win); a.push(now); ipHits.set(ip, a); if (a.length > max) throw httpErr(429, "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring."); }
function login(b, req, res) {
  ipLimit(req.ip);
  const email = String(b.email || "").trim().toLowerCase().slice(0, 120), lk = db.lock[email];
  if (lk && lk.until > Date.now()) throw httpErr(429, `Ko'p marta noto'g'ri urinish. ${Math.ceil((lk.until - Date.now()) / 60000)} daqiqadan so'ng qayta urinib ko'ring.`);
  const u = db.users.find((x) => x.email === email);
  const ok = checkPw(b.password, u ? u.pw : DUMMY) && !!u;
  db.secLog.unshift({ ts: Date.now(), email, ok, ip: req.ip }); db.secLog = db.secLog.slice(0, 500);
  if (!ok) {
    const prev = lk ? (lk.until && lk.until <= Date.now() ? 0 : lk.fails) : 0, f = prev + 1;
    db.lock[email] = { fails: f, until: f >= 5 ? Date.now() + 5 * 60e3 : 0 }; schedulePersist();
    throw httpErr(401, f >= 5 ? "Hisob 5 daqiqaga bloklandi." : `Email yoki parol noto'g'ri. Qolgan urinishlar: ${5 - f}.`);
  }
  if (u.blocked) { schedulePersist(); throw httpErr(403, "Hisobingiz administrator tomonidan bloklangan."); }
  delete db.lock[email]; newSession(res, u.id, !!b.remember); schedulePersist(); return u;
}
function register(b, req, res) {
  ipLimit(req.ip, 10, 60 * 60e3);
  if (!CFG.registration) throw httpErr(403, "Ro'yxatdan o'tish yopilgan. Administratorga murojaat qiling.");
  const email = String(b.email || "").trim().toLowerCase();
  if (!ServerStore.EMAIL_RE.test(email) || email.length > 120) throw httpErr(400, "Email manzil noto'g'ri.");
  if (CFG.allowedDomains.length && !CFG.allowedDomains.includes(email.split("@")[1])) throw httpErr(400, `Faqat ${CFG.allowedDomains.join(", ")} domenidagi email bilan ro'yxatdan o'tish mumkin.`);
  if (db.users.some((x) => x.email === email)) throw httpErr(409, "Bu email bilan hisob allaqachon mavjud.");
  const pe = validatePassword(b.password); if (pe) throw httpErr(400, pe);
  const first = String(b.first || "").trim(), last = String(b.last || "").trim();
  if (first.length < 2 || first.length > 40) throw httpErr(400, "Ismni to'g'ri kiriting.");
  if (last.length < 2 || last.length > 40) throw httpErr(400, "Familiyani to'g'ri kiriting.");
  const u = { id: U.uid("u"), email, pw: hashPw(b.password), role: "student", first, last,
    uni: DATA.UNIVERSITIES.includes(b.uni) ? b.uni : DATA.UNIVERSITIES[0], faculty: DATA.FACULTIES.includes(b.faculty) ? b.faculty : DATA.FACULTIES[0],
    course: [1, 2, 3, 4].includes(+b.course) ? +b.course : 1, year: DATA.YEARS.includes(b.year) ? b.year : DATA.YEARS[2], group: String(b.group || "").trim().slice(0, 20), createdAt: Date.now(), blocked: false };
  db.users.push(u); db.learned[u.id] = {};
  db.notifs.push({ id: U.uid("n"), uid: u.id, ts: Date.now(), text: "PM Edu ga xush kelibsiz! Birinchi qadam — «Fanlar» bo'limidan mavzu tanlang.", read: false, link: "#/fanlar" });
  newSession(res, u.id, false); schedulePersist(); return u;
}

/* ---------------- Ruxsat etilgan amallar (whitelist) ---------------- */
const str = (v, n = 200) => String(v == null ? "" : v).slice(0, n);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
function cleanSession(ses) {
  ses = obj(ses); const u = CUR;
  if (!Array.isArray(ses.qs) || ses.qs.length < 1 || ses.qs.length > 30) throw httpErr(400, "Test ma'lumotlari noto'g'ri.");
  const mode = ["test", "assign", "mistakes", "adaptive", "gen"].includes(ses.mode) ? ses.mode : "test";
  let as = null, startedAt = Math.min(Date.now(), +ses.startedAt || Date.now());
  if (mode === "assign") {
    as = db.assignments.find((a) => a.id === ses.ref && (!a.group || a.group === u.group)); if (!as) throw httpErr(404, "Topshiriq topilmadi.");
    const st = (db.assignStarts[u.id] || {})[as.id]; if (!st) throw httpErr(400, "Topshiriq serverda boshlanmagan.");
    startedAt = st; if (Date.now() - st > (as.minutes * 60 + 120) * 1000) throw httpErr(400, "Topshiriq vaqti tugagan — natija qabul qilinmadi.");
    if (ses.qs.length !== as.qids.length || ses.qs.some((q) => !as.qids.includes(q && q.id))) throw httpErr(400, "Topshiriq savollari mos emas.");
  }
  const qs = ses.qs.map((q) => {
    q = obj(q);
    if (q.id) {
      const b = S.question(str(q.id, 20)); if (!b) throw httpErr(400, "Savol topilmadi.");
      const o = Array.isArray(q.o) && q.o.length === 4 && [...q.o].map(String).sort().join("\u0001") === [...b.o].sort().join("\u0001") ? q.o.map(String) : b.o.slice();
      return { ...b, o, a: o.indexOf(b.o[b.a]) };
    }
    if (mode === "assign") throw httpErr(400, "Topshiriqda faqat bank savollari bo'ladi.");
    const t = S.topic(str(q.t, 10)); if (!t) throw httpErr(400, "Mavzu noto'g'ri.");
    const o = Array.isArray(q.o) ? q.o.slice(0, 4).map((x) => str(x, 120)) : []; if (o.length !== 4) throw httpErr(400, "Variantlar noto'g'ri.");
    return { t: t.id, q: str(q.q, 300), o, a: Math.max(0, Math.min(3, Math.floor(+q.a) || 0)), e: str(q.e, 300) };
  });
  const answers = qs.map((_, i) => { const a = Array.isArray(ses.answers) ? ses.answers[i] : null; return Number.isInteger(a) && a >= 0 && a <= 3 ? a : null; });
  const t = S.test(ses.ref);
  const s = S.subj(ses.s) ? ses.s : S.topic(qs[0].t).s;
  const title = as ? as.title : t ? t.title : str(ses.title, 80) || "Test";
  return { id: U.uid("ses"), title, s, qs, answers, flags: qs.map(() => false), startedAt, limitSec: 0, ref: as ? as.id : t ? t.id : /^all-[a-z]+$/.test(ses.ref || "") ? ses.ref : null, mode };
}
function cleanChat(c) {
  c = obj(c); if (!/^ch_[A-Za-z0-9]{4,40}$/.test(c.id || "")) throw httpErr(400, "Suhbat identifikatori noto'g'ri.");
  const msgs = (Array.isArray(c.msgs) ? c.msgs : []).slice(-100).map((m) => {
    m = obj(m); const role = m.role === "ai" ? "ai" : "me";
    return role === "me" ? { role, html: str(m.html, 600), ts: +m.ts || Date.now() }
      : { role, id: str(m.id, 40), q: str(m.q, 600), text: str(m.text, 4000), ts: +m.ts || Date.now(), fb: [-1, 0, 1].includes(+m.fb) ? +m.fb : 0 };
  });
  return { id: c.id, title: str(c.title, 60), msgs };
}
const CALLS = {
  toggleLearned: (tid) => S.toggleLearned(str(tid, 10)),
  beginAssign: (aid) => { const u = ServerStore.need("student"); const as = db.assignments.find((a) => a.id === aid && (!a.group || a.group === u.group)); if (!as) throw httpErr(404, "Topshiriq topilmadi."); (db.assignStarts[u.id] = db.assignStarts[u.id] || {})[as.id] = Date.now(); schedulePersist(); return true; },
  submitTest: (ses) => { ServerStore.need("student"); return S.submitTest(cleanSession(ses)); },
  addGoal: (o) => S.addGoal(obj(o)), removeGoal: (id) => S.removeGoal(str(id, 40)),
  addEvent: (o) => S.addEvent(obj(o)), toggleEvent: (id) => S.toggleEvent(str(id, 40)), removeEvent: (id) => S.removeEvent(str(id, 40)),
  readAll: () => S.readAll(ServerStore.need().id),
  saveChat: (c) => { const u = ServerStore.need(); const ch = cleanChat(c); const old = db.chats.find((x) => x.id === ch.id && x.uid === u.id); const before = old ? old.msgs.filter((m) => m.role === "me").length : 0;
    if (db.chats.some((x) => x.id === ch.id && x.uid !== u.id)) throw httpErr(403, "Ruxsat yo'q.");
    S.saveChat(ch); const mine = ch.msgs.filter((m) => m.role === "me"); if (mine.length > before) S.log(u.id, "ai", "AI yordamchi – savol", mine[mine.length - 1].html.slice(0, 40)); return true; },
  deleteChat: (id) => S.deleteChat(str(id, 50)),
  suggestBook: (o) => S.suggestBook(obj(o)),
  updateProfile: (o) => S.updateProfile(obj(o)),
  changePassword: (o) => { o = obj(o); const u = ServerStore.need(); if (!checkPw(o.old, u.pw)) throw httpErr(400, "Joriy parol noto'g'ri."); const pe = validatePassword(o.new); if (pe) throw httpErr(400, pe);
    u.pw = hashPw(o.new); for (const [k, s] of Object.entries(db.sessions)) if (s.uid === u.id && k !== CUR_SID) delete db.sessions[k]; schedulePersist(); return true; },
  createAssignment: (o) => { const r = S.createAssignment(obj(o)); return { n: r.n }; }, deleteAssignment: (id) => S.deleteAssignment(str(id, 40)),
  setBlocked: (uid, v) => { S.setBlocked(str(uid, 40), !!v); if (v) for (const [k, s] of Object.entries(db.sessions)) if (s.uid === uid) delete db.sessions[k]; return true; },
  setRole: (uid, r) => S.setRole(str(uid, 40), str(r, 10)),
  addBook: (o) => S.addBook(obj(o)), removeBook: (id) => S.removeBook(str(id, 40)),
  resolveSuggestion: (id, ok) => S.resolveSuggestion(str(id, 40), !!ok),
  resetPassword: (uid) => { const me = ServerStore.need("admin"); const u = S.user(str(uid, 40)); if (!u) throw httpErr(404, "Foydalanuvchi topilmadi."); if (u.id === me.id) throw httpErr(400, "O'z parolingizni Sozlamalarda o'zgartiring.");
    const tmp = "Pm" + crypto.randomBytes(5).toString("hex") + "7"; u.pw = hashPw(tmp); for (const [k, s] of Object.entries(db.sessions)) if (s.uid === u.id) delete db.sessions[k]; schedulePersist(); return { password: tmp }; },
  resetAll: () => { ServerStore.need("admin"); if (!CFG.demo) throw httpErr(403, "Faqat demo rejimida mumkin."); db = demoSeed(); return true; },
};
let CUR_SID = null;

/* ---------------- Foydalanuvchiga ko'rinadigan ma'lumot (rol bo'yicha filtr) ---------------- */
function snapshot(u) {
  const cfg = { demo: CFG.demo, registration: CFG.registration };
  if (!u) return { cfg, me: null };
  const pub = ({ pw, ...x }) => x;
  const role = u.role, staff = role !== "student";
  const students = db.users.filter((x) => x.role === "student");
  const users = role === "admin" ? db.users.map(pub)
    : db.users.filter((x) => !x.blocked).map((x) => x.id === u.id ? pub(x) : { id: x.id, first: x.first, last: x.last, role: x.role, group: x.group, course: x.course, ...(staff && x.role === "student" ? { email: x.email } : {}) });
  const studIds = new Set(students.map((x) => x.id));
  const slim = (a) => ({ id: a.id, uid: a.uid, testId: a.testId, title: a.title, s: a.s, pct: a.pct, score: a.score, total: a.total, finishedAt: a.finishedAt, startedAt: a.startedAt, mode: a.mode, items: [] });
  const attempts = db.attempts.map((a) => (a.uid === u.id || (role === "teacher" && studIds.has(a.uid)) ? a : slim(a)));
  const learned = staff ? db.learned : { [u.id]: db.learned[u.id] || {} };
  const own = (k) => db[k].filter((x) => x.uid === u.id);
  const chats = role === "admin" ? db.chats.map((c) => c.uid === u.id ? c : { id: c.id, uid: c.uid, ts: c.ts, title: "", msgs: c.msgs.map(() => 0) }) : own("chats");
  const assignments = role === "admin" ? db.assignments : role === "teacher" ? db.assignments.filter((a) => a.by === u.id) : db.assignments.filter((a) => !a.group || a.group === u.group);
  const sess = Object.values(db.sessions).filter((s) => s.uid === u.id).sort((a, b) => b.exp - a.exp)[0];
  return { cfg, me: u.id, db: { v: 1, users, attempts, learned, goals: own("goals"), events: own("events"), activity: own("activity"), notifs: own("notifs"), chats, assignments,
    suggestions: role === "admin" ? db.suggestions : own("suggestions"), books: db.books, secLog: role === "admin" ? db.secLog.slice(0, 200).map(({ ip, ...l }) => l) : db.secLog.filter((l) => l.email === u.email).slice(0, 10).map(({ ip, ...l }) => l),
    session: { exp: sess ? sess.exp : Date.now() }, lock: {} } };
}

/* ---------------- HTTP ---------------- */
function httpErr(code, msg) { const e = new Error(msg); e.code = code; return e; }
const PUB = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8" };
const SEC = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=()", "Cross-Origin-Opener-Policy": "same-origin",
};
function send(req, res, code, body, type = "application/json; charset=utf-8", extra = {}) {
  let buf = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === "string" ? body : JSON.stringify(body));
  const h = { ...SEC, "Content-Type": type, ...extra };
  if (buf.length > 1024 && /\bgzip\b/.test(req.headers["accept-encoding"] || "") && /json|text|javascript|svg/.test(type)) { buf = zlib.gzipSync(buf); h["Content-Encoding"] = "gzip"; h.Vary = "Accept-Encoding"; }
  h["Content-Length"] = buf.length; res.writeHead(code, h); res.end(req.method === "HEAD" ? undefined : buf);
}
function readBody(req) {
  return new Promise((ok, bad) => { let n = 0; const ch = []; req.on("data", (c) => { n += c.length; if (n > 1e6) { bad(httpErr(413, "So'rov juda katta.")); req.destroy(); } else ch.push(c); });
    req.on("end", () => { try { ok(ch.length ? JSON.parse(Buffer.concat(ch).toString("utf8")) : {}); } catch (e) { bad(httpErr(400, "JSON noto'g'ri.")); } }); req.on("error", bad); });
}
function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname); if (p === "/" || !path.extname(p)) p = "/index.html";
  const f = path.normalize(path.join(PUB, p)); if (!f.startsWith(PUB + path.sep)) return send(req, res, 404, "Topilmadi", "text/plain; charset=utf-8");
  fs.readFile(f, (err, data) => {
    if (err) return send(req, res, 404, "Topilmadi", "text/plain; charset=utf-8");
    const ext = path.extname(f); send(req, res, 200, data, TYPES[ext] || "application/octet-stream", { "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600" });
  });
}
async function handle(req, res) {
  req.ip = (req.socket.remoteAddress === "127.0.0.1" || req.socket.remoteAddress === "::1") && req.headers["x-real-ip"] ? String(req.headers["x-real-ip"]) : req.socket.remoteAddress;
  const url = new URL(req.url, "http://x");
  if (!url.pathname.startsWith("/api/")) { if (req.method !== "GET" && req.method !== "HEAD") return send(req, res, 405, { error: "Usul ruxsat etilmagan" }); return serveStatic(req, res); }
  CUR = null; CUR_SID = null;
  try {
    if (req.method === "POST" && req.headers["x-pm"] !== "1") throw httpErr(403, "So'rov rad etildi.");
    const m = (req.headers.cookie || "").match(/(?:^|;\s*)pm_sid=([A-Za-z0-9_-]+)/); if (m) CUR_SID = sha(m[1]);
    CUR = sessionUser(req);
    const r = url.pathname;
    if (r === "/api/state" && req.method === "GET") return send(req, res, 200, snapshot(CUR), undefined, { "Cache-Control": "no-store" });
    if (req.method !== "POST") throw httpErr(405, "Usul ruxsat etilmagan.");
    const b = obj(await readBody(req));
    CUR = sessionUser(req);
    if (r === "/api/login") { CUR = login(b, req, res); return send(req, res, 200, { ok: true, state: snapshot(CUR) }); }
    if (r === "/api/register") { CUR = register(b, req, res); return send(req, res, 200, { ok: true, state: snapshot(CUR) }); }
    if (r === "/api/logout") { if (CUR_SID) delete db.sessions[CUR_SID]; schedulePersist(); res.setHeader("Set-Cookie", cookie("pm_sid", "", 0)); return send(req, res, 200, { ok: true, state: snapshot(null) }); }
    if (r === "/api/call") {
      if (!CUR) throw httpErr(401, "Sessiya tugagan. Qaytadan kiring.");
      const fn = CALLS[b.fn]; if (!Object.prototype.hasOwnProperty.call(CALLS, b.fn)) throw httpErr(400, "Noma'lum amal.");
      const args = Array.isArray(b.args) ? b.args.slice(0, 3) : [];
      let result = fn(...args); if (result && typeof result === "object" && result.items) result = { id: result.id, pct: result.pct };
      schedulePersist();
      return send(req, res, 200, { ok: true, result: result === undefined ? null : result, state: snapshot(sessionUser(req) && CUR) });
    }
    throw httpErr(404, "Topilmadi.");
  } catch (e) {
    const internal = !e.code && (e instanceof TypeError || e instanceof ReferenceError || e instanceof RangeError || e instanceof SyntaxError);
    const code = Number.isInteger(e.code) ? e.code : internal ? 500 : 400;
    if (!e.code) console.error(new Date().toISOString(), req.method, req.url, e.stack || e.message);
    return send(req, res, code, { error: internal ? "Server xatosi. Keyinroq qayta urinib ko'ring." : String(e.message || "Xatolik"), state: code === 401 ? snapshot(null) : undefined });
  } finally { CUR = null; }
}

/* ---------------- CLI buyruqlari ---------------- */
function cli(argv) {
  const [cmd, email, name] = argv; if (!cmd) return false;
  loadDb();
  if (cmd === "create-admin") {
    if (!email || !ServerStore.EMAIL_RE.test(email)) { console.error('Foydalanish: node server.js create-admin email@domain.uz "Ism Familiya"'); process.exit(1); }
    const e = email.toLowerCase(); if (db.users.some((u) => u.email === e)) { console.error("Bu email band."); process.exit(1); }
    const [first, ...rest] = String(name || "Administrator").split(" "); const pw = "Pm" + crypto.randomBytes(6).toString("hex") + "9";
    db.users.push({ id: U.uid("u"), email: e, pw: hashPw(pw), role: "admin", first, last: rest.join(" "), uni: "", faculty: "", course: 1, year: "", group: "", createdAt: Date.now(), blocked: false });
    persistNow(); console.log(`Admin yaratildi: ${e}\nVaqtinchalik parol: ${pw}\nKirgandan so'ng Sozlamalar bo'limida parolni o'zgartiring.`); return true;
  }
  if (cmd === "reset-password") {
    const u = db.users.find((x) => x.email === String(email || "").toLowerCase()); if (!u) { console.error("Foydalanuvchi topilmadi."); process.exit(1); }
    const pw = "Pm" + crypto.randomBytes(6).toString("hex") + "9"; u.pw = hashPw(pw); u.blocked = false; delete db.lock[u.email];
    for (const [k, s] of Object.entries(db.sessions)) if (s.uid === u.id) delete db.sessions[k];
    persistNow(); console.log(`Yangi vaqtinchalik parol (${u.email}): ${pw}`); return true;
  }
  if (cmd === "backup") { const f = path.join(BK_DIR, `manual-${new Date().toISOString().replace(/[:.]/g, "-")}.json.gz`); fs.writeFileSync(f, zlib.gzipSync(fs.readFileSync(DB_FILE)), { mode: 0o600 }); console.log("Zaxira nusxa:", f); return true; }
  console.error("Noma'lum buyruq. Mavjud: create-admin, reset-password, backup"); process.exit(1);
}

if (!cli(process.argv.slice(2))) {
  loadDb(); dailyBackup();
  setInterval(() => { cleanSessions(); dailyBackup(); }, 3.6e6).unref();
  const srv = http.createServer((req, res) => { handle(req, res).catch((e) => { console.error(e); try { send(req, res, 500, { error: "Server xatosi" }); } catch (x) { /* */ } }); });
  srv.headersTimeout = 20000; srv.requestTimeout = 30000;
  srv.listen(CFG.port, CFG.host, () => console.log(`PM Edu: http://${CFG.host}:${CFG.port}  (demo: ${CFG.demo ? "ha" : "yo'q"})`));
  const stop = () => { console.log("To'xtatilmoqda..."); persistNow(); srv.close(() => process.exit(0)); setTimeout(() => process.exit(0), 3000).unref(); };
  process.on("SIGTERM", stop); process.on("SIGINT", stop);
}
