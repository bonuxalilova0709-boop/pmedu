window.PM_MARK = "/assets/mark.png";
/* ===== utils.js — umumiy yordamchi funksiyalar (XSS himoyasi, sana, ikonlar) ===== */
"use strict";
const U = (() => {
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = (p = "id") => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const pad = (n) => String(n).padStart(2, "0");
  const OYLAR = ["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];
  const OYLAR_B = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
  const HAFTA = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const hm = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const rel = (ts) => {
    const d = new Date(ts), now = new Date();
    const diff = Math.round((fromKey(dayKey(now)) - fromKey(dayKey(d))) / 864e5);
    if (diff === 0) return "Bugun, " + hm(ts);
    if (diff === 1) return "Kecha, " + hm(ts);
    return `${d.getDate()}-${OYLAR[d.getMonth()]}, ${hm(ts)}`;
  };
  const dateLong = (ts) => { const d = new Date(ts); return `${d.getDate()}-${OYLAR[d.getMonth()]}, ${d.getFullYear()}`; };
  const mmss = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const initials = (a, b) => ((a || "?")[0] + (b || "")[0] || "").toUpperCase();
  const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  /* Lotin/kirill va apostrof farqlarini tekislash (qidiruv va AI uchun) */
  const CYR = {"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"j","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"x","ц":"s","ч":"ch","ш":"sh","щ":"sh","ъ":"","ы":"i","ь":"","э":"e","ю":"yu","я":"ya","ў":"o","қ":"q","ғ":"g","ҳ":"h"};
  const norm = (s) => String(s || "").toLowerCase().replace(/[а-яёўқғҳ]/g, (c) => CYR[c] ?? c)
    .replace(/[ʻʼ'`‘’]/g, "").replace(/\s+/g, " ").trim();

  const P = {
    home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    test:'<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M9 2v4M15 2v4M8.5 13l2.5 2.5 4.5-5"/>',
    bot:'<rect x="4" y="8" width="16" height="12" rx="4"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 17h5"/><circle cx="12" cy="3.5" r="1"/>',
    book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5M8 7h7"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    bell:'<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
    down:'<path d="M6 9l6 6 6-6"/>', right:'<path d="M9 6l6 6-6 6"/>', left:'<path d="M15 6l-6 6 6 6"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.1M6.6 6.6A17 17 0 002 12s3.5 7 10 7a9.8 9.8 0 005.4-1.6"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
    dl:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    out:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    users:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0114 0M16 4a4 4 0 010 8M22 21a7 7 0 00-4-6.3"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    bank:'<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
    route:'<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 000-7H8a3.5 3.5 0 010-7h7.5"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star:'<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4l-5.5 2.9 1-6.2L3 9.7l6.2-.9z"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
    trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0z"/><path d="M17 5h3v2a4 4 0 01-4 4M7 5H4v2a4 4 0 004 4"/>',
    fire:'<path d="M12 22c4 0 7-2.7 7-7 0-5-5-7-5-12-3 2-6 5.5-6 9 0 1.5.5 2.5.5 2.5S7 13 6.5 11C5.5 12.5 5 14 5 15c0 4.3 3 7 7 7z"/>',
    bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
    clip:'<path d="M21 11.5l-8.5 8.5a5.5 5.5 0 01-7.8-7.8l9-9a3.7 3.7 0 015.2 5.2l-9 9a1.8 1.8 0 01-2.6-2.6l8.5-8.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    flag:'<path d="M5 21V4h11l-2 4 2 4H5"/>', shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    bulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', refresh:'<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h3"/>',
    up:'<path d="M7 11v10H3V11zM7 11l4-8a3 3 0 013 3v4h6a2 2 0 012 2.3l-1.4 7A2 2 0 0118.6 21H7"/>',
    dn:'<path d="M17 13V3h4v10zM17 13l-4 8a3 3 0 01-3-3v-4H4a2 2 0 01-2-2.3l1.4-7A2 2 0 015.4 3H17"/>',
    file:'<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/>',
    play:'<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
    cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6"/>',
    brain:'<path d="M9 3a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 001 5 3 3 0 005 2V3.5A3 3 0 009 3zM15 3a3 3 0 013 3 3 3 0 012 5 3 3 0 01-1 5 3 3 0 01-5 2V3.5A3 3 0 0115 3z"/>',
    repeat:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 01-3 3H3"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    google:'',
  };
  const I = (name, cls = "") => {
    if (name === "google") return '<svg class="i ' + cls + '" viewBox="0 0 24 24" style="stroke:none"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 01-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.6l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10.5 10.5 0 0012 22.5z"/><path fill="#FBBC05" d="M6.2 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.3H2.7a10.5 10.5 0 000 9.4z"/><path fill="#EA4335" d="M12 5.7c1.5 0 2.9.5 4 1.5l3-3A10.5 10.5 0 002.7 7.3L6.2 10C7 7.5 9.3 5.7 12 5.7z"/></svg>';
    return `<svg class="i ${cls}" viewBox="0 0 24 24">${P[name] || P.info}</svg>`;
  };
  return { esc, $, $$, uid, clamp, pct, pad, OYLAR, OYLAR_B, HAFTA, dayKey, fromKey, hm, rel, dateLong, mmss, initials, debounce, norm, I };
})();

/* ===== data.js — fanlar, mavzular, savollar banki, adabiyotlar (boshlang'ich ma'lumotlar) ===== */
"use strict";
const DATA = (() => {
  const SUBJECTS = [
    { id: "analiz", name: "Matematik analiz", tone: "", desc: "Funksiyalar, limit, hosila, integral va ularning amaliy qo'llanmalari.", courses: [1, 2] },
    { id: "algebra", name: "Chiziqli algebra", tone: "", desc: "Vektorlar, matritsalar, chiziqli fazo va ularning amaliy masalalari.", courses: [1] },
    { id: "ehtimol", name: "Ehtimollar nazariyasi", tone: "bl", desc: "Ehtimolliklar, tasodifiy hodisalar va taqsimot qonunlari.", courses: [2] },
    { id: "statistika", name: "Matematik statistika", tone: "g", desc: "Ma'lumotlar tahlili, baholash, regressiya va statistik xulosalar.", courses: [2, 3] },
    { id: "dastur", name: "Dasturlash", tone: "bl", desc: "Matematik masalalarni dasturlash orqali yechish (Python, NumPy).", courses: [1, 2] },
    { id: "diftenglama", name: "Differensial tenglamalar", tone: "o", desc: "Oddiy differensial tenglamalar, Koshi masalasi va yechish usullari.", courses: [2] },
    { id: "diskret", name: "Diskret matematika", tone: "r", desc: "To'plamlar, mantiq, graflar va kombinatorik tuzilmalar.", courses: [1] },
  ];

  /* Mavzular: nazariya, asosiy formulalar, namuna. kw — AI yordamchi uchun kalit so'zlar */
  const TOPICS = [
    // --- Matematik analiz
    { id: "a1", s: "analiz", name: "Funksiya va uning xossalari", kw: ["funksiya", "aniqlanish soha", "juft", "toq", "monoton", "davriy"],
      theory: "Funksiya — X to'plamning har bir elementiga Y to'plamning yagona elementini mos qo'yuvchi qoida. Asosiy xossalar: aniqlanish sohasi, qiymatlar sohasi, juft-toqlik, monotonlik va davriylik.",
      formulas: ["Juft: f(−x) = f(x)", "Toq: f(−x) = −f(x)", "Davriy: f(x + T) = f(x)"],
      example: "f(x) = √(x − 3) uchun aniqlanish sohasi: x − 3 ≥ 0, ya'ni x ≥ 3." },
    { id: "a2", s: "analiz", name: "Limit va uzluksizlik", kw: ["limit", "uzluksiz", "intiladi", "ajoyib limit", "aniqmaslik"],
      theory: "x → a da f(x) ning limiti L ga teng, agar x a ga yetarlicha yaqinlashganda f(x) L ga istalgancha yaqin bo'lsa. Funksiya a nuqtada uzluksiz, agar lim f(x) = f(a) bo'lsa. 0/0 va ∞/∞ aniqmasliklar soddalashtirish yoki Lopital qoidasi bilan ochiladi.",
      formulas: ["lim(x→0) sin x / x = 1", "lim(x→∞) (1 + 1/x)ˣ = e", "Lopital: lim f/g = lim f′/g′"],
      example: "lim(x→2) (x² − 4)/(x − 2) = lim(x→2) (x + 2) = 4." },
    { id: "a3", s: "analiz", name: "Hosila va differensiallash", kw: ["hosila", "differensial", "xususiy hosila", "ikki ozgaruvchili", "zanjir qoidasi", "derivative"],
      theory: "Hosila — funksiya o'zgarish tezligi: f′(x) = lim(Δx→0) [f(x+Δx) − f(x)]/Δx. Ko'p o'zgaruvchili z = f(x, y) funksiya uchun xususiy hosila bitta o'zgaruvchi bo'yicha, qolganlari o'zgarmas deb olinib topiladi.",
      formulas: ["(xⁿ)′ = n·xⁿ⁻¹", "(u·v)′ = u′v + uv′", "(u/v)′ = (u′v − uv′)/v²", "f(g(x))′ = f′(g(x))·g′(x)", "∂z/∂x — y o'zgarmas deb olinadi"],
      example: "z = x² + y² bo'lsa: ∂z/∂x = 2x, ∂z/∂y = 2y." },
    { id: "a4", s: "analiz", name: "Hosilaning tatbiqlari", kw: ["ekstremum", "maksimum", "minimum", "kritik nuqta", "osish", "kamayish", "urinma"],
      theory: "f′(x) = 0 yoki mavjud bo'lmagan nuqtalar kritik nuqtalar. f′ ishorasi + dan − ga o'tsa — maksimum, − dan + ga o'tsa — minimum. Ikkinchi hosila: f″ > 0 — minimum, f″ < 0 — maksimum.",
      formulas: ["Urinma: y = f(x₀) + f′(x₀)(x − x₀)", "f″(x₀) > 0 ⇒ minimum"],
      example: "f(x) = x³ − 3x: f′ = 3x² − 3 = 0 ⇒ x = ±1; f″(1) = 6 > 0, demak x = 1 minimum." },
    { id: "a5", s: "analiz", name: "Aniqmas integral", kw: ["integral", "boshlangich funksiya", "aniqmas integral", "integrallash"],
      theory: "F(x) funksiya f(x) ning boshlang'ichi, agar F′(x) = f(x) bo'lsa. Barcha boshlang'ichlar to'plami aniqmas integral: ∫f(x)dx = F(x) + C. Asosiy usullar: jadval integrallari, o'zgaruvchini almashtirish, bo'laklab integrallash.",
      formulas: ["∫xⁿdx = xⁿ⁺¹/(n+1) + C", "∫dx/x = ln|x| + C", "∫eˣdx = eˣ + C", "∫u dv = uv − ∫v du"],
      example: "∫(3x² + 2x)dx = x³ + x² + C." },
    { id: "a6", s: "analiz", name: "Aniq integral", kw: ["aniq integral", "nyuton leybnits", "yuza", "egri chiziqli trapetsiya"],
      theory: "Aniq integral — integral yig'indilar limiti; geometrik ma'nosi egri chiziqli trapetsiya yuzi. Nyuton–Leybnits formulasi bilan hisoblanadi.",
      formulas: ["∫ₐᵇ f(x)dx = F(b) − F(a)", "S = ∫ₐᵇ |f(x)| dx"],
      example: "∫₀^π sin x dx = −cos π + cos 0 = 2." },
    { id: "a7", s: "analiz", name: "Sonli qatorlar", kw: ["qator", "yaqinlashish", "uzoqlashish", "garmonik", "geometrik progressiya"],
      theory: "∑aₙ qator yaqinlashuvchi, agar qismiy yig'indilar chekli limitga ega bo'lsa. Zarur shart: aₙ → 0. Alomatlar: taqqoslash, Dalamber, Koshi, integral alomat.",
      formulas: ["∑qⁿ⁻¹ = 1/(1 − q), |q| < 1", "∑1/nᵖ yaqinlashadi ⇔ p > 1"],
      example: "∑(n=1..∞) 1/2ⁿ = 1; garmonik qator ∑1/n uzoqlashuvchi." },
    // --- Chiziqli algebra
    { id: "b1", s: "algebra", name: "Matritsalar va amallar", kw: ["matritsa", "kopaytirish", "transponirlash", "rang", "birlik matritsa"],
      theory: "m×n matritsa — m qator va n ustundan iborat jadval. A(m×n)·B(n×k) ko'paytma m×k o'lchamli. Ko'paytma kommutativ emas: AB ≠ BA. Rang — chiziqli erkli qatorlarning maksimal soni.",
      formulas: ["(AB)ᵢⱼ = ∑ₖ aᵢₖbₖⱼ", "(AB)ᵀ = BᵀAᵀ", "AE = EA = A"],
      example: "2×3 va 3×4 matritsalar ko'paytmasi 2×4 o'lchamli." },
    { id: "b2", s: "algebra", name: "Determinantlar", kw: ["determinant", "aniqlovchi", "sarrus", "minor", "algebraik toldiruvchi"],
      theory: "Determinant — kvadrat matritsaga mos son. 2×2 uchun ad − bc; 3×3 uchun Sarrus qoidasi yoki qator bo'yicha yoyish. Qatorlar almashtirilsa ishora o'zgaradi; ikki qator proporsional bo'lsa det = 0.",
      formulas: ["|a b; c d| = ad − bc", "det(AB) = det A · det B", "det Aᵀ = det A"],
      example: "|1 2; 3 4| = 1·4 − 2·3 = −2." },
    { id: "b3", s: "algebra", name: "Teskari matritsa", kw: ["teskari matritsa", "inverse", "xosmas", "birlik"],
      theory: "A⁻¹ mavjud ⇔ det A ≠ 0. A⁻¹ = (1/det A)·Â, bu yerda Â — biriktirilgan (algebraik to'ldiruvchilardan tuzilgan transponirlangan) matritsa. Amalda Gauss–Jordan usuli qulay.",
      formulas: ["A·A⁻¹ = E", "|a b; c d|⁻¹ = 1/(ad − bc)·[d −b; −c a]"],
      example: "[2 0; 0 4]⁻¹ = [1/2 0; 0 1/4]." },
    { id: "b4", s: "algebra", name: "Chiziqli tenglamalar sistemasi", kw: ["sistema", "kramer", "gauss", "tenglamalar sistemasi", "chiziqli tenglama"],
      theory: "AX = B sistema. Kramer usuli (det A ≠ 0): xᵢ = Δᵢ/Δ. Gauss usuli — kengaytirilgan matritsani pog'onasimon ko'rinishga keltirish. Kroneker–Kapelli: sistema birgalikda ⇔ rang A = rang (A|B).",
      formulas: ["xᵢ = Δᵢ / Δ", "X = A⁻¹B"],
      example: "x + y = 5, x − y = 1 ⇒ Δ = −2, Δx = −6, Δy = −4 ⇒ x = 3, y = 2." },
    { id: "b5", s: "algebra", name: "Vektorlar va skalyar ko'paytma", kw: ["vektor", "skalyar kopaytma", "uzunlik", "perpendikulyar", "burchak", "vektor kopaytma"],
      theory: "Skalyar ko'paytma a·b = ∑aᵢbᵢ = |a||b|cos φ. Vektorlar perpendikulyar ⇔ a·b = 0. Vektor uzunligi |a| = √(a·a).",
      formulas: ["a·b = a₁b₁ + a₂b₂ + a₃b₃", "cos φ = a·b / (|a||b|)", "|a| = √(a₁² + a₂² + a₃²)"],
      example: "a = (1, 2, 3), b = (4, −5, 6): a·b = 4 − 10 + 18 = 12." },
    { id: "b6", s: "algebra", name: "Xos qiymatlar va xos vektorlar", kw: ["xos qiymat", "xos vektor", "eigen", "xarakteristik tenglama"],
      theory: "Av = λv (v ≠ 0) bo'lsa λ — xos qiymat, v — xos vektor. Xos qiymatlar xarakteristik tenglamadan topiladi: det(A − λE) = 0. Iz (trace) xos qiymatlar yig'indisiga, determinant ko'paytmasiga teng.",
      formulas: ["det(A − λE) = 0", "λ₁ + λ₂ = tr A, λ₁λ₂ = det A"],
      example: "[2 1; 1 2]: λ² − 4λ + 3 = 0 ⇒ λ = 1, λ = 3." },
    // --- Ehtimollar
    { id: "c1", s: "ehtimol", name: "Kombinatorika", kw: ["kombinatsiya", "orinlashtirish", "orin almashtirish", "faktorial", "kombinatorika"],
      theory: "O'rin almashtirishlar Pₙ = n!, o'rinlashtirishlar Aₙᵏ = n!/(n−k)!, kombinatsiyalar Cₙᵏ = n!/(k!(n−k)!). Tartib muhim bo'lsa — o'rinlashtirish, muhim bo'lmasa — kombinatsiya.",
      formulas: ["Pₙ = n!", "Aₙᵏ = n!/(n − k)!", "Cₙᵏ = n!/(k!(n − k)!)"],
      example: "5 ta talabadan 2 kishilik guruh: C₅² = 10." },
    { id: "c2", s: "ehtimol", name: "Ehtimol ta'rifi va xossalari", kw: ["ehtimol", "p(a)", "klassik ehtimol", "hodisa", "tanga", "zar"],
      theory: "Klassik ta'rif: P(A) = m/n, m — qulay natijalar, n — barcha teng imkoniyatli natijalar. 0 ≤ P(A) ≤ 1. Qo'shish teoremasi: P(A∪B) = P(A) + P(B) − P(AB).",
      formulas: ["P(A) = m / n", "P(Ā) = 1 − P(A)", "P(A + B) = P(A) + P(B) − P(AB)"],
      example: "Zar tashlanganda juft son tushishi: P = 3/6 = 1/2." },
    { id: "c3", s: "ehtimol", name: "Shartli ehtimol va Bayes formulasi", kw: ["shartli ehtimol", "bayes", "toliq ehtimol", "bogliqsiz"],
      theory: "P(A|B) = P(AB)/P(B). A va B bog'liqsiz ⇔ P(AB) = P(A)P(B). To'liq ehtimol formulasi va Bayes formulasi gipotezalar ehtimolini qayta baholash imkonini beradi.",
      formulas: ["P(A|B) = P(AB) / P(B)", "P(A) = ∑P(Hᵢ)P(A|Hᵢ)", "P(Hᵢ|A) = P(Hᵢ)P(A|Hᵢ) / P(A)"],
      example: "P(A) = 0.5, P(B) = 0.4, bog'liqsiz ⇒ P(AB) = 0.2." },
    { id: "c4", s: "ehtimol", name: "Tasodifiy miqdorlar", kw: ["tasodifiy miqdor", "matematik kutilma", "dispersiya", "taqsimot qonuni"],
      theory: "Diskret tasodifiy miqdor qiymatlari va ehtimollari bilan beriladi. Matematik kutilma M(X) = ∑xᵢpᵢ — o'rtacha qiymat; dispersiya D(X) — tarqoqlik o'lchovi.",
      formulas: ["M(X) = ∑xᵢpᵢ", "D(X) = M(X²) − [M(X)]²", "σ = √D(X)"],
      example: "Zar uchun M(X) = (1+2+…+6)/6 = 3.5." },
    { id: "c5", s: "ehtimol", name: "Binomial va normal taqsimot", kw: ["binomial", "bernulli", "normal taqsimot", "gauss", "puasson"],
      theory: "Bernulli sxemasi: n ta bog'liqsiz sinovda k marta muvaffaqiyat ehtimoli Pₙ(k) = Cₙᵏpᵏqⁿ⁻ᵏ. Binomial taqsimot uchun M = np, D = npq. Normal taqsimotda qiymatlarning ~68% i [μ − σ; μ + σ] oraliqda.",
      formulas: ["Pₙ(k) = Cₙᵏ pᵏ qⁿ⁻ᵏ", "M = np, D = npq", "Qoida: 68 – 95 – 99.7 %"],
      example: "n = 3, p = 1/2: P₃(2) = 3·(1/2)³ = 3/8." },
    // --- Statistika
    { id: "d1", s: "statistika", name: "Tavsifiy statistika", kw: ["ortacha", "median", "moda", "dispersiya", "tanlanma", "standart chetlanish"],
      theory: "Tanlanma — bosh to'plamdan olingan kuzatuvlar. Markaziy tendensiya: o'rtacha, median, moda. Tarqoqlik: dispersiya, standart chetlanish, qulach (razmax).",
      formulas: ["x̄ = (1/n)∑xᵢ", "s² = ∑(xᵢ − x̄)² / (n − 1)", "Median — tartiblangan qatorning o'rtasi"],
      example: "3, 1, 7, 5, 9 → tartiblaymiz: 1, 3, 5, 7, 9 → median = 5." },
    { id: "d2", s: "statistika", name: "Baholash va ishonch oraliqlari", kw: ["baho", "ishonch oraligi", "siljimagan", "nuqtaviy baho"],
      theory: "Nuqtaviy baho parametrni bitta son bilan baholaydi; siljimagan baho uchun M(θ̂) = θ. Ishonch oralig'i parametrni berilgan ishonchlilik bilan qoplaydi; tanlanma kattalashsa oraliq torayadi.",
      formulas: ["x̄ ± t·s/√n", "Siljimagan dispersiya: n − 1 ga bo'linadi"],
      example: "n oshsa, s/√n kamayadi — oraliq torayadi." },
    { id: "d3", s: "statistika", name: "Statistik gipotezalar", kw: ["gipoteza", "p qiymat", "ahamiyatlilik", "birinchi tur xato", "nol gipoteza"],
      theory: "H₀ — nol gipoteza, H₁ — muqobil. p-qiymat < α bo'lsa H₀ rad etiladi. I tur xato — to'g'ri H₀ ni rad etish (ehtimoli α), II tur xato — noto'g'ri H₀ ni qabul qilish.",
      formulas: ["p < α ⇒ H₀ rad etiladi", "α = P(I tur xato)"],
      example: "α = 0.05, p = 0.01 ⇒ H₀ rad etiladi." },
    { id: "d4", s: "statistika", name: "Korrelyatsiya va regressiya", kw: ["korrelyatsiya", "regressiya", "chiziqli bogliqlik", "eng kichik kvadratlar"],
      theory: "Korrelyatsiya koeffitsienti r ∈ [−1; 1] chiziqli bog'liqlik kuchini ko'rsatadi. Chiziqli regressiya y = a + bx eng kichik kvadratlar usuli bilan topiladi.",
      formulas: ["r = cov(X,Y) / (σₓσᵧ)", "b = cov(X,Y) / σₓ²", "a = ȳ − b·x̄"],
      example: "y = 2x + 1 modelida x = 3 ⇒ y = 7." },
    // --- Dasturlash
    { id: "e1", s: "dastur", name: "Python asoslari", kw: ["python", "ozgaruvchi", "tip", "operator", "print"],
      theory: "Python — dinamik tipli til. Asosiy tiplar: int, float, str, bool. Arifmetika: // butun bo'lish, % qoldiq, ** daraja. / har doim float qaytaradi.",
      formulas: ["7 // 2 = 3", "7 % 3 = 1", "2 ** 3 = 8"],
      example: "type(3/2) → <class 'float'>" },
    { id: "e2", s: "dastur", name: "Shart va sikllar", kw: ["if", "for", "while", "sikl", "range"],
      theory: "if/elif/else — tarmoqlanish. for x in range(a, b) — a dan b−1 gacha. while — shart bajarilguncha takrorlash.",
      formulas: ["range(1, 5) → 1, 2, 3, 4", "sum(range(1, 11)) = 55"],
      example: "for i in range(3): print(i) → 0 1 2" },
    { id: "e3", s: "dastur", name: "Funksiyalar va rekursiya", kw: ["def", "funksiya", "rekursiya", "return", "faktorial"],
      theory: "def bilan funksiya e'lon qilinadi. Rekursiya — funksiya o'zini chaqirishi; albatta to'xtash sharti (baza holati) bo'lishi kerak.",
      formulas: ["def f(n): return 1 if n <= 1 else n * f(n − 1)"],
      example: "f(5) = 120" },
    { id: "e4", s: "dastur", name: "Ro'yxatlar va lug'atlar", kw: ["list", "royxat", "lugat", "dict", "list comprehension"],
      theory: "list — tartiblangan o'zgaruvchan to'plam, dict — kalit:qiymat juftliklari. List comprehension: [f(x) for x in ...].",
      formulas: ["[x**2 for x in range(4)] → [0, 1, 4, 9]"],
      example: "len({'a': 1, 'b': 2}) → 2" },
    { id: "e5", s: "dastur", name: "NumPy bilan hisoblash", kw: ["numpy", "np", "massiv", "linalg"],
      theory: "NumPy — vektor va matritsalar bilan tez ishlash kutubxonasi. np.dot — skalyar/matritsa ko'paytma, np.linalg.det — determinant, np.linalg.inv — teskari matritsa, np.linalg.solve — sistema yechimi.",
      formulas: ["np.dot([1, 2], [3, 4]) → 11", "np.linalg.solve(A, b)"],
      example: "np.linalg.det([[1, 2], [3, 4]]) ≈ −2.0" },
    { id: "e6", s: "dastur", name: "Algoritm murakkabligi", kw: ["murakkablik", "big o", "binar qidiruv", "saralash"],
      theory: "O-belgisi algoritm vaqti kirish hajmi n ga qanday bog'liqligini ko'rsatadi. Binar qidiruv O(log n), pufakchali saralash O(n²), birlashtirib saralash O(n log n).",
      formulas: ["O(1) < O(log n) < O(n) < O(n log n) < O(n²)"],
      example: "1 000 000 elementli tartiblangan ro'yxatda binar qidiruv ~20 qadam." },
    // --- Differensial tenglamalar
    { id: "f1", s: "diftenglama", name: "O'zgaruvchilari ajraladigan tenglamalar", kw: ["differensial tenglama", "ajraladigan", "birinchi tartibli", "umumiy yechim"],
      theory: "y′ = f(x)g(y) ko'rinishidagi tenglama: dy/g(y) = f(x)dx deb ajratib, ikki tomon integrallanadi. Umumiy yechim ixtiyoriy o'zgarmas C ni o'z ichiga oladi.",
      formulas: ["dy/g(y) = f(x)dx", "y′ = ky ⇒ y = Ce^(kx)"],
      example: "y′ = 2x ⇒ y = x² + C." },
    { id: "f2", s: "diftenglama", name: "Birinchi tartibli chiziqli tenglamalar", kw: ["chiziqli differensial", "integrallovchi kopaytuvchi", "bernulli tenglamasi"],
      theory: "y′ + P(x)y = Q(x). Integrallovchi ko'paytuvchi μ = e^(∫P dx) ga ko'paytirilsa chap tomon (μy)′ bo'ladi.",
      formulas: ["μ(x) = e^(∫P(x)dx)", "y = (1/μ)(∫μQ dx + C)"],
      example: "y′ + y = 0 ⇒ y = Ce⁻ˣ." },
    { id: "f3", s: "diftenglama", name: "Ikkinchi tartibli o'zgarmas koeffitsientli", kw: ["ikkinchi tartibli", "xarakteristik tenglama", "ozgarmas koeffitsient", "bir jinsli"],
      theory: "y″ + py′ + qy = 0 uchun xarakteristik tenglama k² + pk + q = 0. Turli haqiqiy ildizlar: y = C₁e^(k₁x) + C₂e^(k₂x); kompleks ildizlar α ± βi: y = e^(αx)(C₁cos βx + C₂sin βx).",
      formulas: ["k² + pk + q = 0", "k = α ± βi ⇒ y = e^(αx)(C₁cos βx + C₂sin βx)"],
      example: "y″ − 5y′ + 6y = 0 ⇒ k = 2, 3 ⇒ y = C₁e²ˣ + C₂e³ˣ." },
    { id: "f4", s: "diftenglama", name: "Koshi masalasi", kw: ["koshi masalasi", "boshlangich shart", "xususiy yechim"],
      theory: "Koshi masalasi — differensial tenglama va boshlang'ich shart y(x₀) = y₀. Umumiy yechimga shart qo'yilib C topiladi va xususiy yechim olinadi.",
      formulas: ["y(x₀) = y₀ ⇒ C ni topish"],
      example: "y′ = y, y(0) = 2 ⇒ y = 2eˣ." },
    // --- Diskret
    { id: "g1", s: "diskret", name: "To'plamlar nazariyasi", kw: ["toplam", "birlashma", "kesishma", "qism toplam", "venn"],
      theory: "To'plamlar ustida amallar: birlashma A∪B, kesishma A∩B, ayirma A\\B, to'ldiruvchi. n elementli to'plamning qism to'plamlari soni 2ⁿ.",
      formulas: ["|A∪B| = |A| + |B| − |A∩B|", "|P(A)| = 2ⁿ"],
      example: "|A| = 5, |B| = 4, |A∩B| = 2 ⇒ |A∪B| = 7." },
    { id: "g2", s: "diskret", name: "Mulohazalar mantiqi", kw: ["mantiq", "implikatsiya", "de morgan", "rostlik jadvali", "diz'yunksiya", "konyunksiya"],
      theory: "Mantiqiy amallar: ¬ (inkor), ∧ (va), ∨ (yoki), → (implikatsiya), ↔ (ekvivalentlik). p → q faqat p rost, q yolg'on bo'lganda yolg'on.",
      formulas: ["¬(p ∧ q) ≡ ¬p ∨ ¬q", "¬(p ∨ q) ≡ ¬p ∧ ¬q", "p → q ≡ ¬p ∨ q"],
      example: "p = 1, q = 0 ⇒ p → q = 0." },
    { id: "g3", s: "diskret", name: "Graflar nazariyasi", kw: ["graf", "daraxt", "tugun", "qirra", "toliq graf", "daraja"],
      theory: "Graf G = (V, E) — uchlar va qirralar. Uchlar darajalari yig'indisi 2|E| ga teng (qo'l berishish lemmasi). n uchli daraxtda n − 1 qirra. To'liq graf Kₙ da n(n−1)/2 qirra.",
      formulas: ["∑deg(v) = 2|E|", "|E(Kₙ)| = n(n − 1)/2"],
      example: "K₅ da 5·4/2 = 10 qirra." },
  ];

  /* Savollar banki: q — savol, o — variantlar, a — to'g'ri javob indeksi, e — izoh, d — qiyinlik (1..3) */
  const Q = (id, t, q, o, a, e, d = 1) => ({ id, t, q, o, a, e, d });
  const QUESTIONS = [
    Q("qa1", "a1", "f(x) = √(x − 3) funksiyaning aniqlanish sohasi:", ["x > 3", "x ≥ 3", "x ≤ 3", "x ∈ ℝ"], 1, "Ildiz ostidagi ifoda manfiy bo'lmasligi kerak: x − 3 ≥ 0."),
    Q("qa2", "a1", "Quyidagi funksiyalardan qaysi biri juft?", ["f(x) = x³", "f(x) = x² + 1", "f(x) = sin x", "f(x) = x + 1"], 1, "f(−x) = (−x)² + 1 = x² + 1 = f(x)."),
    Q("qa3", "a2", "lim(x→0) sin x / x = ?", ["0", "1", "∞", "Mavjud emas"], 1, "Birinchi ajoyib limit."),
    Q("qa4", "a2", "lim(x→∞) (1 + 1/x)ˣ = ?", ["1", "0", "e", "∞"], 2, "Ikkinchi ajoyib limit.", 2),
    Q("qa5", "a2", "lim(x→2) (x² − 4)/(x − 2) = ?", ["0", "2", "4", "Mavjud emas"], 2, "x² − 4 = (x − 2)(x + 2) ⇒ limit x + 2 → 4."),
    Q("qa6", "a3", "(x³)′ = ?", ["x²", "3x²", "3x³", "x⁴/4"], 1, "(xⁿ)′ = n·xⁿ⁻¹."),
    Q("qa7", "a3", "(x · sin x)′ = ?", ["cos x", "sin x + x cos x", "x cos x", "sin x − x cos x"], 1, "Ko'paytma hosilasi: u′v + uv′.", 2),
    Q("qa8", "a3", "(e²ˣ)′ = ?", ["e²ˣ", "2e²ˣ", "2x·e²ˣ⁻¹", "e²ˣ/2"], 1, "Murakkab funksiya: (eᵘ)′ = eᵘ·u′, u′ = 2.", 2),
    Q("qa9", "a3", "z = x² + y² bo'lsa, ∂z/∂y = ?", ["2x", "2y", "2x + 2y", "y²"], 1, "x o'zgarmas deb olinadi."),
    Q("qa10", "a4", "f(x) = x³ − 3x funksiyaning minimum nuqtasi:", ["x = −1", "x = 0", "x = 1", "x = 3"], 2, "f′ = 3x² − 3 = 0 ⇒ x = ±1; f″(1) = 6 > 0.", 2),
    Q("qa11", "a5", "∫x² dx = ?", ["2x + C", "x³ + C", "x³/3 + C", "x²/2 + C"], 2, "∫xⁿdx = xⁿ⁺¹/(n+1) + C."),
    Q("qa12", "a5", "∫cos x dx = ?", ["sin x + C", "−sin x + C", "cos x + C", "tg x + C"], 0, "(sin x)′ = cos x."),
    Q("qa13", "a6", "∫₀¹ 2x dx = ?", ["0", "1", "2", "1/2"], 1, "x² |₀¹ = 1 − 0 = 1."),
    Q("qa14", "a6", "∫₀^π sin x dx = ?", ["0", "1", "2", "π"], 2, "−cos x |₀^π = 1 + 1 = 2.", 2),
    Q("qa15", "a7", "∑(n=1..∞) 1/2ⁿ yig'indisi:", ["1/2", "1", "2", "∞"], 1, "Geometrik qator: (1/2)/(1 − 1/2) = 1.", 2),
    Q("qa16", "a7", "Garmonik qator ∑1/n:", ["1 ga yaqinlashadi", "e ga yaqinlashadi", "Uzoqlashadi", "0 ga yaqinlashadi"], 2, "p = 1 bo'lganda ∑1/nᵖ uzoqlashadi.", 3),

    Q("qb1", "b2", "|1 2; 3 4| determinant qiymati:", ["2", "−2", "10", "−10"], 1, "1·4 − 2·3 = −2."),
    Q("qb2", "b2", "diag(2, 3, 4) diagonal matritsaning determinanti:", ["9", "24", "0", "12"], 1, "Diagonal matritsada det — diagonal elementlar ko'paytmasi."),
    Q("qb3", "b1", "A — 2×3, B — 3×4 matritsa. AB ning o'lchami:", ["3×3", "2×4", "4×2", "Ko'paytirib bo'lmaydi"], 1, "(m×n)(n×k) = m×k."),
    Q("qb4", "b1", "(AB)ᵀ = ?", ["AᵀBᵀ", "BᵀAᵀ", "BA", "AB"], 1, "Transponirlashda tartib almashadi.", 2),
    Q("qb5", "b1", "[1 2; 2 4] matritsaning rangi:", ["0", "1", "2", "4"], 1, "Ikkinchi qator birinchisiga proporsional.", 2),
    Q("qb6", "b3", "Teskari matritsa mavjud bo'lishi sharti:", ["det A = 0", "det A ≠ 0", "A simmetrik", "A diagonal"], 1, "A⁻¹ = Â / det A."),
    Q("qb7", "b3", "[2 0; 0 4]⁻¹ = ?", ["[2 0; 0 4]", "[1/2 0; 0 1/4]", "[−2 0; 0 −4]", "[4 0; 0 2]"], 1, "Diagonal elementlar teskarisi olinadi."),
    Q("qb8", "b4", "x + y = 5, x − y = 1 sistemaning yechimi:", ["(2; 3)", "(3; 2)", "(4; 1)", "(1; 4)"], 1, "Qo'shsak 2x = 6 ⇒ x = 3, y = 2."),
    Q("qb9", "b4", "Kramer usulini qo'llash sharti:", ["Δ = 0", "Δ ≠ 0", "Tenglamalar soni > noma'lumlar", "B = 0"], 1, "xᵢ = Δᵢ/Δ, Δ ≠ 0 bo'lishi shart."),
    Q("qb10", "b5", "a = (1, 2, 3), b = (4, −5, 6): a·b = ?", ["12", "32", "−12", "0"], 0, "4 − 10 + 18 = 12."),
    Q("qb11", "b5", "a = (3, 4) vektor uzunligi:", ["7", "5", "25", "√7"], 1, "√(9 + 16) = 5."),
    Q("qb12", "b5", "Ikki vektor perpendikulyar bo'lishi sharti:", ["a·b = 1", "a·b = 0", "|a| = |b|", "a = −b"], 1, "cos 90° = 0."),
    Q("qb13", "b6", "[2 1; 1 2] matritsaning xos qiymatlari:", ["2 va 2", "1 va 3", "0 va 4", "−1 va 3"], 1, "(2 − λ)² − 1 = 0 ⇒ λ = 1, 3.", 3),
    Q("qb14", "b6", "[2 0; 0 5] matritsa xos qiymatlari yig'indisi:", ["10", "7", "3", "5"], 1, "Yig'indi = iz (trace) = 2 + 5.", 2),

    Q("qc1", "c1", "C₅² = ?", ["20", "10", "25", "5"], 1, "5!/(2!·3!) = 10."),
    Q("qc2", "c1", "4! = ?", ["16", "12", "24", "4"], 2, "1·2·3·4 = 24."),
    Q("qc3", "c1", "A₅² (o'rinlashtirish) = ?", ["10", "20", "25", "60"], 1, "5!/3! = 20."),
    Q("qc4", "c2", "Tanga 2 marta tashlanadi. Ikkala marta ham gerb tushish ehtimoli:", ["1/2", "1/4", "1/3", "3/4"], 1, "(1/2)·(1/2) = 1/4."),
    Q("qc5", "c2", "Zar tashlanganda juft son tushish ehtimoli:", ["1/6", "1/3", "1/2", "2/3"], 2, "{2, 4, 6}: 3/6."),
    Q("qc6", "c2", "Ikki zar tashlanganda yig'indi 7 bo'lish ehtimoli:", ["1/6", "7/36", "1/12", "1/9"], 0, "6 ta qulay natija: 6/36.", 2),
    Q("qc7", "c3", "Shartli ehtimol formulasi P(A|B) = ?", ["P(A)·P(B)", "P(AB)/P(B)", "P(AB)/P(A)", "P(A) + P(B)"], 1, "Ta'rif bo'yicha."),
    Q("qc8", "c3", "A va B bog'liqsiz, P(A) = 0.5, P(B) = 0.4. P(AB) = ?", ["0.9", "0.2", "0.1", "0.45"], 1, "P(AB) = P(A)P(B).", 2),
    Q("qc9", "c4", "Zar ochkolari soni X ning matematik kutilmasi:", ["3", "3.5", "4", "6"], 1, "21/6 = 3.5."),
    Q("qc10", "c4", "Dispersiya formulasi D(X) = ?", ["M(X)²", "M(X²) − [M(X)]²", "M(X) − M(X²)", "√M(X)"], 1, "Asosiy formula.", 2),
    Q("qc11", "c5", "Binomial taqsimot: n = 10, p = 0.3. M(X) = ?", ["0.3", "3", "2.1", "7"], 1, "M = np.", 2),
    Q("qc12", "c5", "Normal taqsimotda [μ − σ; μ + σ] oraliqqa qiymatlarning taxminan qancha qismi tushadi?", ["50%", "68%", "95%", "99.7%"], 1, "68–95–99.7 qoidasi."),
    Q("qc13", "c5", "n = 3, p = 1/2 Bernulli sxemasida roppa-rosa 2 muvaffaqiyat ehtimoli:", ["1/4", "3/8", "1/2", "1/8"], 1, "C₃²·(1/2)³ = 3/8.", 3),

    Q("qd1", "d1", "2, 4, 6, 8 tanlanmaning o'rtachasi:", ["4", "5", "6", "20"], 1, "20/4 = 5."),
    Q("qd2", "d1", "3, 1, 7, 5, 9 tanlanmaning medianasi:", ["7", "5", "3", "4"], 1, "Tartiblangan: 1, 3, 5, 7, 9."),
    Q("qd3", "d1", "2, 3, 3, 5, 7 tanlanmaning modasi:", ["2", "3", "4", "5"], 1, "Eng ko'p uchraydigan qiymat."),
    Q("qd4", "d1", "2, 4, 4, 4, 5, 5, 7, 9 to'plamning (bosh to'plam) standart chetlanishi:", ["2", "4", "1.5", "3"], 0, "O'rtacha 5, dispersiya 32/8 = 4, σ = 2.", 3),
    Q("qd5", "d2", "Siljimagan tanlanma dispersiyasida yig'indi nimaga bo'linadi?", ["n", "n − 1", "n + 1", "√n"], 1, "Bessel tuzatmasi.", 2),
    Q("qd6", "d2", "Tanlanma hajmi oshsa, ishonch oralig'i:", ["Kengayadi", "Torayadi", "O'zgarmaydi", "Yo'qoladi"], 1, "Kenglik s/√n ga proporsional."),
    Q("qd7", "d3", "p-qiymat < α bo'lsa:", ["H₀ qabul qilinadi", "H₀ rad etiladi", "Xulosa yo'q", "α oshiriladi"], 1, "Natija statistik ahamiyatli."),
    Q("qd8", "d3", "Birinchi tur xato bu —", ["Noto'g'ri H₀ ni qabul qilish", "To'g'ri H₀ ni rad etish", "Hisoblash xatosi", "Tanlanma kichikligi"], 1, "Ehtimoli α ga teng.", 2),
    Q("qd9", "d4", "Korrelyatsiya koeffitsienti qiymatlar oralig'i:", ["[0; 1]", "[−1; 1]", "(−∞; ∞)", "[0; ∞)"], 1, "|r| ≤ 1."),
    Q("qd10", "d4", "r = 0 nimani anglatadi?", ["Kuchli bog'liqlik", "Chiziqli bog'liqlik yo'q", "Teskari bog'liqlik", "Funksional bog'liqlik"], 1, "Nochiziqli bog'liqlik bo'lishi mumkin.", 2),
    Q("qd11", "d4", "Regressiya modeli y = 2x + 1. x = 3 da bashorat:", ["6", "7", "5", "9"], 1, "2·3 + 1 = 7."),

    Q("qe1", "e1", "print(2 ** 3) natijasi:", ["6", "8", "9", "23"], 1, "** — darajaga ko'tarish."),
    Q("qe2", "e1", "type(3 / 2) natijasi:", ["int", "float", "str", "Xato"], 1, "/ har doim float qaytaradi."),
    Q("qe3", "e1", "7 // 2 natijasi:", ["3.5", "3", "4", "1"], 1, "Butun bo'lish."),
    Q("qe4", "e1", "7 % 3 natijasi:", ["2", "1", "0", "2.33"], 1, "Qoldiq."),
    Q("qe5", "e2", "list(range(1, 5)) natijasi:", ["[1, 2, 3, 4, 5]", "[1, 2, 3, 4]", "[0, 1, 2, 3, 4]", "[2, 3, 4]"], 1, "Oxirgi qiymat kirmaydi."),
    Q("qe6", "e2", "sum(range(1, 11)) = ?", ["45", "55", "66", "10"], 1, "1 + 2 + … + 10 = 55."),
    Q("qe7", "e3", "def f(n): return 1 if n <= 1 else n * f(n − 1). f(5) = ?", ["24", "120", "25", "5"], 1, "5! = 120.", 2),
    Q("qe8", "e4", "[x**2 for x in range(4)] = ?", ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 2, 4, 6]", "[0, 1, 2, 3]"], 1, "x = 0, 1, 2, 3."),
    Q("qe9", "e4", "len({'a': 1, 'b': 2}) = ?", ["1", "2", "4", "3"], 1, "Kalitlar soni."),
    Q("qe10", "e5", "np.dot([1, 2], [3, 4]) = ?", ["[3, 8]", "11", "10", "[4, 6]"], 1, "1·3 + 2·4 = 11."),
    Q("qe11", "e5", "Kvadrat matritsa determinantini hisoblovchi NumPy funksiyasi:", ["np.det", "np.linalg.det", "np.matrix.det", "np.linalg.inv"], 1, "linalg moduli."),
    Q("qe12", "e6", "Tartiblangan ro'yxatda binar qidiruv murakkabligi:", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 1, "Har qadamda oraliq ikki marta qisqaradi.", 2),
    Q("qe13", "e6", "Pufakchali saralash (bubble sort) eng yomon holatda:", ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], 2, "Ikki ichma-ich sikl.", 2),

    Q("qf1", "f1", "y′ = 2x tenglamaning umumiy yechimi:", ["y = 2", "y = x² + C", "y = 2x² + C", "y = Ceˣ"], 1, "Ikki tomon integrallanadi."),
    Q("qf2", "f1", "y′ = y tenglamaning umumiy yechimi:", ["y = x + C", "y = Ceˣ", "y = Cx", "y = eˣ + C"], 1, "dy/y = dx ⇒ ln|y| = x + C."),
    Q("qf3", "f2", "y′ + P(x)y = Q(x) uchun integrallovchi ko'paytuvchi:", ["∫P dx", "e^(∫P dx)", "e^(−∫Q dx)", "P(x)Q(x)"], 1, "μ = e^(∫P dx).", 2),
    Q("qf4", "f2", "y′ + y = 0 tenglamaning yechimi:", ["y = Ceˣ", "y = Ce⁻ˣ", "y = C − x", "y = Cx"], 1, "y′ = −y."),
    Q("qf5", "f3", "y″ − 5y′ + 6y = 0 xarakteristik tenglama ildizlari:", ["−2, −3", "2, 3", "1, 6", "−1, 6"], 1, "k² − 5k + 6 = 0.", 2),
    Q("qf6", "f3", "y″ + y = 0 tenglamaning umumiy yechimi:", ["C₁eˣ + C₂e⁻ˣ", "C₁cos x + C₂sin x", "C₁ + C₂x", "Ceˣ"], 1, "k = ±i.", 2),
    Q("qf7", "f4", "y′ = y, y(0) = 2 Koshi masalasining yechimi:", ["y = eˣ + 1", "y = 2eˣ", "y = e²ˣ", "y = 2x"], 1, "y = Ceˣ, C = 2.", 2),
    Q("qf8", "f1", "y″ + y = 0 tenglamaning tartibi:", ["1", "2", "0", "3"], 1, "Eng yuqori hosila tartibi."),

    Q("qg1", "g1", "|A| = 5, |B| = 4, |A∩B| = 2. |A∪B| = ?", ["9", "7", "11", "2"], 1, "5 + 4 − 2 = 7."),
    Q("qg2", "g1", "3 elementli to'plamning qism to'plamlari soni:", ["3", "6", "8", "9"], 2, "2³ = 8."),
    Q("qg3", "g2", "¬(p ∧ q) ga teng kuchli ifoda:", ["¬p ∧ ¬q", "¬p ∨ ¬q", "p ∨ q", "p → q"], 1, "De Morgan qonuni."),
    Q("qg4", "g2", "p → q qachon yolg'on?", ["p = 0, q = 0", "p = 1, q = 0", "p = 0, q = 1", "Hech qachon"], 1, "Rostdan yolg'on kelib chiqmaydi."),
    Q("qg5", "g3", "6 qirrali graf uchlari darajalari yig'indisi:", ["6", "12", "3", "36"], 1, "∑deg = 2|E|."),
    Q("qg6", "g3", "K₅ to'liq grafdagi qirralar soni:", ["5", "10", "20", "25"], 1, "5·4/2 = 10."),
    Q("qg7", "g3", "n uchli daraxtdagi qirralar soni:", ["n", "n − 1", "n + 1", "2n"], 1, "Daraxt — sikllarsiz bog'lamli graf.", 2),
  ];

  /* Testlar — savollar banki mavzulari asosida */
  const TESTS = [
    { id: "t-limit", s: "analiz", title: "Limit va uzluksizlik", topics: ["a1", "a2"], level: "O'rtacha" },
    { id: "t-hosila", s: "analiz", title: "Hosila va uning tatbiqlari", topics: ["a3", "a4"], level: "O'rtacha" },
    { id: "t-integral", s: "analiz", title: "Integral hisob", topics: ["a5", "a6", "a7"], level: "Qiyin" },
    { id: "t-matritsa", s: "algebra", title: "Matritsalar va determinantlar", topics: ["b1", "b2", "b3"], level: "Oson" },
    { id: "t-sistema", s: "algebra", title: "Sistemalar, vektorlar, xos qiymatlar", topics: ["b4", "b5", "b6"], level: "O'rtacha" },
    { id: "t-ehtimol", s: "ehtimol", title: "Ehtimollar nazariyasi asoslari", topics: ["c1", "c2", "c3"], level: "O'rtacha" },
    { id: "t-taqsimot", s: "ehtimol", title: "Tasodifiy miqdorlar va taqsimotlar", topics: ["c4", "c5"], level: "Qiyin" },
    { id: "t-regressiya", s: "statistika", title: "Regressiya va korrelyatsiya", topics: ["d1", "d4"], level: "O'rtacha" },
    { id: "t-gipoteza", s: "statistika", title: "Baholash va gipotezalar", topics: ["d2", "d3"], level: "Qiyin" },
    { id: "t-python", s: "dastur", title: "Python dasturlash asoslari", topics: ["e1", "e2", "e3", "e4"], level: "Oson" },
    { id: "t-numpy", s: "dastur", title: "NumPy va algoritmlar", topics: ["e5", "e6"], level: "Qiyin" },
    { id: "t-dt", s: "diftenglama", title: "Differensial tenglamalar", topics: ["f1", "f2", "f3", "f4"], level: "O'rtacha" },
    { id: "t-diskret", s: "diskret", title: "To'plamlar, mantiq va graflar", topics: ["g1", "g2", "g3"], level: "Oson" },
  ];

  const BOOKS = [
    { id: "k1", title: "Matematik analiz (I qism)", author: "T. Azlarov, H. Mansurov", type: "Darslik", s: "analiz", course: 1, cover: ["#3F37C9", "#5B4CF0"],
      about: "Haqiqiy sonlar, ketma-ketliklar, funksiya limiti, uzluksizlik va bir o'zgaruvchili funksiya differensial hisobi.", toc: ["Haqiqiy sonlar", "Ketma-ketlik limiti", "Funksiya limiti", "Uzluksizlik", "Hosila", "Hosilaning tatbiqlari"] },
    { id: "k2", title: "Matematik analizdan masalalar to'plami", author: "B. P. Demidovich", type: "Masalalar to'plami", s: "analiz", course: 1, cover: ["#1E3A8A", "#3B82F6"],
      about: "Matematik analizning barcha bo'limlari bo'yicha 4000 dan ortiq masala va mashqlar.", toc: ["Limitlar", "Hosilalar", "Aniqmas integral", "Aniq integral", "Qatorlar"] },
    { id: "k3", title: "Oliy algebra kursi", author: "A. G. Kurosh", type: "Darslik", s: "algebra", course: 1, cover: ["#6D28D9", "#A78BFA"],
      about: "Determinantlar, matritsalar, chiziqli tenglamalar sistemasi, chiziqli fazolar va ko'phadlar nazariyasi.", toc: ["Chiziqli tenglamalar sistemasi", "Determinantlar", "Matritsalar", "Chiziqli fazolar", "Ko'phadlar"] },
    { id: "k4", title: "Introduction to Linear Algebra", author: "G. Strang", type: "O'quv qo'llanma", s: "algebra", course: 1, cover: ["#7C3AED", "#C4B5FD"],
      about: "Chiziqli algebraning amaliy kursi: vektorlar, eliminatsiya, ortogonallik, xos qiymatlar, SVD.", toc: ["Vectors", "Elimination", "Vector spaces", "Orthogonality", "Eigenvalues", "SVD"] },
    { id: "k5", title: "Ehtimollar nazariyasi va matematik statistika", author: "V. E. Gmurman", type: "Darslik", s: "ehtimol", course: 2, cover: ["#065F46", "#10B981"],
      about: "Tasodifiy hodisalar, tasodifiy miqdorlar, taqsimot qonunlari va matematik statistika elementlari.", toc: ["Tasodifiy hodisalar", "Tasodifiy miqdorlar", "Taqsimotlar", "Katta sonlar qonuni", "Statistik baholar"] },
    { id: "k6", title: "Ehtimollar nazariyasidan masalalar yechishga qo'llanma", author: "V. E. Gmurman", type: "Masalalar to'plami", s: "ehtimol", course: 2, cover: ["#047857", "#34D399"],
      about: "Har bir bo'lim uchun qisqa nazariya, namunaviy yechimlar va mustaqil ish masalalari.", toc: ["Klassik ehtimol", "Qo'shish va ko'paytirish", "Bernulli sxemasi", "Tasodifiy miqdorlar"] },
    { id: "k7", title: "Differensial tenglamalardan masalalar to'plami", author: "A. F. Filippov", type: "Masalalar to'plami", s: "diftenglama", course: 2, cover: ["#9D174D", "#EC4899"],
      about: "Birinchi va yuqori tartibli tenglamalar, sistemalar va turg'unlik bo'yicha masalalar.", toc: ["Ajraladigan tenglamalar", "Chiziqli tenglamalar", "Yuqori tartibli tenglamalar", "Sistemalar"] },
    { id: "k8", title: "Python dasturlash asoslari", author: "PM Edu jamoasi", type: "Qo'shimcha manba", s: "dastur", course: 1, cover: ["#0F172A", "#475569"],
      about: "Python sintaksisi, funksiyalar, ro'yxatlar va NumPy bilan matematik hisoblashlar — amaliy misollar bilan.", toc: ["Tiplar va operatorlar", "Sikllar", "Funksiyalar", "NumPy", "Matplotlib"] },
    { id: "k9", title: "Discrete Mathematics and Its Applications", author: "K. H. Rosen", type: "O'quv qo'llanma", s: "diskret", course: 1, cover: ["#92400E", "#F59E0B"],
      about: "Mantiq, to'plamlar, kombinatorika, graflar va algoritmlar — informatika uchun diskret matematika.", toc: ["Logic and proofs", "Sets and functions", "Counting", "Graphs", "Trees"] },
    { id: "k10", title: "Statistik ma'lumotlar tahlili", author: "PM Edu jamoasi", type: "Ma'ruza", s: "statistika", course: 3, cover: ["#155E75", "#06B6D4"],
      about: "Tavsifiy statistika, gipotezalarni tekshirish va regressiya — ma'ruza matnlari to'plami.", toc: ["Tavsifiy statistika", "Baholash", "Gipotezalar", "Regressiya"] },
    { id: "k11", title: "Integral hisob: video darslar seriyasi", author: "PM Edu jamoasi", type: "Video dars", s: "analiz", course: 1, cover: ["#4338CA", "#818CF8"],
      about: "12 ta qisqa video: jadval integrallari, almashtirish usuli, bo'laklab integrallash, aniq integral tatbiqlari.", toc: ["Jadval integrallari", "Almashtirish", "Bo'laklab integrallash", "Yuzalarni hisoblash"] },
    { id: "k12", title: "Matematik modellashtirish", author: "A. A. Samarskiy, A. P. Mixaylov", type: "Darslik", s: "diftenglama", course: 3, cover: ["#831843", "#DB2777"],
      about: "Real jarayonlarning matematik modellari: qurish, tahlil qilish va hisoblash tajribasi.", toc: ["Modellash tamoyillari", "Oddiy modellar", "Nochiziqli modellar", "Hisoblash tajribasi"] },
  ];

  const UNIVERSITIES = [
    "Toshkent Davlat Yuridik Universiteti", "O'zbekiston Milliy universiteti", "Samarqand davlat universiteti",
    "Toshkent axborot texnologiyalari universiteti", "Toshkent davlat transport universiteti", "Farg'ona davlat universiteti", "Buxoro davlat universiteti",
  ];
  const FACULTIES = ["Amaliy matematika", "Amaliy matematika va informatika", "Matematika", "Kompyuter ilmlari va dasturlash"];
  const YEARS = ["2023 - 2024", "2024 - 2025", "2025 - 2026", "2026 - 2027"];

  /* Reyting uchun namunaviy talabalar (demo ma'lumot) */
  const PEERS = [
    { first: "Aziz", last: "Akbarov", score: 98 }, { first: "Madina", last: "Saidova", score: 96 },
    { first: "Behzod", last: "Raxmatov", score: 93 }, { first: "Sevara", last: "Qodirova", score: 88 },
    { first: "Jasur", last: "Nazarov", score: 81 }, { first: "Nigora", last: "Usmonova", score: 74 },
    { first: "Otabek", last: "Ergashev", score: 63 }, { first: "Zarina", last: "Hamidova", score: 57 },
  ];

  const QUOTES = [
    ["Maqsad — faqat o'qish emas, balki o'z ustingda doimiy ishlash.", "PM Edu"],
    ["Matematika — bu faqat raqamlar emas, bu fikrlash uslubidir.", "PM Edu"],
    ["Kichik qadamlar katta natijalarga olib keladi!", "PM Edu"],
    ["Orzular katta bo'lsa, progress ham katta bo'ladi!", "PM Edu"],
    ["Bilim — kelajak kaliti!", "PM Edu"],
  ];

  return { SUBJECTS, TOPICS, QUESTIONS, TESTS, BOOKS, UNIVERSITIES, FACULTIES, YEARS, PEERS, QUOTES };
})();

/* ===== store_remote.js — server rejimi: ma'lumotlar serverda, brauzerda faqat foydalanuvchiga ruxsat etilgan nusxa ===== */
"use strict";
const EMPTY_DB = () => ({ v: 1, users: [], attempts: [], learned: {}, goals: [], events: [], activity: [], notifs: [], chats: [], assignments: [], suggestions: [], books: [], lock: {}, secLog: [], session: { exp: Date.now() } });
const Store = (() => {
  let state = { cfg: { demo: false, registration: true }, me: null, db: EMPTY_DB() };
  const set = (st) => { if (!st) return; state = { cfg: st.cfg || state.cfg, me: st.me || null, db: st.db || EMPTY_DB() }; };
  const current = () => (state.me ? state.db.users.find((u) => u.id === state.me) || null : null);
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return {
    _set: set, cfg: () => state.cfg,
    async init() { try { await API.req("/api/state"); } catch (err) { /* tarmoq xatosi — kirish sahifasi ko'rsatiladi */ } },
    get: () => state.db, current, save() { /* serverda saqlanadi */ },
    need(...roles) { const u = current(); if (!u) throw new Error("Avval tizimga kiring."); if (roles.length && !roles.includes(u.role)) throw new Error("Bu amal uchun ruxsat yo'q."); return u; },
    async login(email, password, remember) { await API.req("/api/login", { email, password, remember }); return current(); },
    async register(o) { await API.req("/api/register", o); return current(); },
    async logout() { await API.req("/api/logout", {}); },
    changePassword: (oldPw, newPw) => API.call("changePassword", [{ old: oldPw, new: newPw }]),
    reset: () => API.call("resetAll", []),
    validatePassword(pw) { if (!pw || pw.length < 8) return "Parol kamida 8 ta belgidan iborat bo'lsin."; if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Parolda harf va raqam bo'lishi kerak."; return ""; },
    isPersistent: () => true,
    subjName: (id) => (DATA.SUBJECTS.find((s) => s.id === id) || {}).name || id,
    EMAIL_RE,
  };
})();
const API = {
  busy: 0,
  async req(url, body) {
    API.busy++; document.documentElement.classList.add("busy");
    try {
      let r; try { r = await fetch(url, { method: body ? "POST" : "GET", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-PM": "1" }, body: body ? JSON.stringify(body) : undefined }); }
      catch (err) { throw new Error("Server bilan aloqa yo'q. Internetni tekshiring."); }
      let j = {}; try { j = await r.json(); } catch (err) { /* bo'sh javob */ }
      if (j.state) Store._set(j.state); else if (url === "/api/state" && r.ok) Store._set(j);
      if (!r.ok) { if (r.status === 401 && j.state && typeof APP !== "undefined") setTimeout(() => APP.render(), 0); throw new Error(j.error || `Server xatosi (${r.status})`); }
      return j;
    } finally { API.busy--; if (!API.busy) document.documentElement.classList.remove("busy"); }
  },
  async call(fn, args) { const j = await API.req("/api/call", { fn, args }); return j.result; },
};

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

/* ===== mathcore.js — kichik simvolli hisoblash yadrosi (CAS): parser, soddalashtirish, hosila, integral, tenglamalar, matritsalar ===== */
"use strict";
const MC = (() => {
  /* ---------------- Tugunlar ---------------- */
  const N = (v) => ({ k: "n", v });
  const V = (n) => ({ k: "v", n });
  const add = (...a) => ({ k: "add", a });
  const mul = (...a) => ({ k: "mul", a });
  const pow = (b, e) => ({ k: "pow", b, e });
  const fn = (f, x) => ({ k: "fn", f, x });
  const neg = (x) => mul(N(-1), x);
  const sub = (a, b) => add(a, neg(b));
  const div = (a, b) => mul(a, pow(b, N(-1)));
  const isN = (x, v) => x.k === "n" && (v === undefined || Math.abs(x.v - v) < 1e-12);

  /* ---------------- Tokenizer va parser ---------------- */
  const FUNCS = { sin: "sin", cos: "cos", tan: "tan", tg: "tan", cot: "cot", ctg: "cot", ln: "ln", log: "ln", lg: "lg", exp: "exp", sqrt: "sqrt",
    asin: "asin", arcsin: "asin", acos: "acos", arccos: "acos", atan: "atan", arctg: "atan", arctan: "atan", abs: "abs" };
  const FNAMES = Object.keys(FUNCS).sort((a, b) => b.length - a.length);
  function prep(s) {
    return String(s).toLowerCase().replace(/[−–—]/g, "-").replace(/[×·∙]/g, "*").replace(/÷/g, "/").replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4")
      .replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/\*\*/g, "^").replace(/,(?=\d)/g, ".").replace(/[\[\]{}]/g, (c) => (c === "[" || c === "{" ? "(" : ")"));
  }
  function tokenize(src) {
    const s = prep(src), out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const v = parseFloat(s.slice(i, j)); if (isNaN(v)) throw new Error("son"); out.push({ t: "num", v }); i = j; continue; }
      if (/[a-z]/.test(c)) {
        let j = i; while (j < s.length && /[a-z]/.test(s[j])) j++;
        let w = s.slice(i, j);
        while (w.length) {
          const f = FNAMES.find((n) => w.startsWith(n));
          if (f) { out.push({ t: "fn", v: FUNCS[f] }); w = w.slice(f.length); continue; }
          if (w.startsWith("pi")) { out.push({ t: "id", v: "pi" }); w = w.slice(2); continue; }
          out.push({ t: "id", v: w[0] }); w = w.slice(1);
        }
        i = j; continue;
      }
      if ("+-*/^()|".includes(c)) { out.push({ t: c }); i++; continue; }
      throw new Error("Tushunarsiz belgi: " + c);
    }
    return out;
  }
  function parse(src) {
    const T = tokenize(src); let p = 0;
    const peek = () => T[p], eat = (t) => { if (!T[p] || T[p].t !== t) throw new Error("Kutilgan: " + t); return T[p++]; };
    const startsAtom = (t) => t && (t.t === "num" || t.t === "id" || t.t === "fn" || t.t === "(");
    function expr() { let x = term(); while (peek() && (peek().t === "+" || peek().t === "-")) { const o = T[p++].t; const y = term(); x = o === "+" ? add(x, y) : sub(x, y); } return x; }
    function term() {
      let x = unary();
      for (;;) {
        const t = peek();
        if (t && (t.t === "*" || t.t === "/")) { p++; const y = unary(); x = t.t === "*" ? mul(x, y) : div(x, y); }
        else if (startsAtom(t)) { x = mul(x, power()); }
        else break;
      }
      return x;
    }
    function unary() { if (peek() && peek().t === "-") { p++; return neg(unary()); } if (peek() && peek().t === "+") { p++; return unary(); } return power(); }
    function power() { const b = atom(); if (peek() && peek().t === "^") { p++; return pow(b, unary()); } return b; }
    function fnArg() {
      if (peek() && peek().t === "(") { p++; const x = expr(); eat(")"); return x; }
      let x = power(); while (peek() && (peek().t === "id" || peek().t === "num") ) x = mul(x, power()); return x;
    }
    function atom() {
      const t = T[p++]; if (!t) throw new Error("Ifoda tugallanmagan");
      if (t.t === "num") return N(t.v);
      if (t.t === "id") return V(t.v);
      if (t.t === "(") { const x = expr(); eat(")"); return x; }
      if (t.t === "|") { const x = expr(); eat("|"); return fn("abs", x); }
      if (t.t === "fn") {
        if (peek() && peek().t === "^") { p++; const e = unary(); const a = fnArg(); return pow(mkFn(t.v, a), e); }
        return mkFn(t.v, fnArg());
      }
      throw new Error("Kutilmagan belgi");
    }
    const x = expr(); if (p < T.length) throw new Error("Ortiqcha belgilar");
    return x;
  }
  function mkFn(f, x) { if (f === "sqrt") return pow(x, N(0.5)); if (f === "exp") return pow(V("e"), x); if (f === "lg") return div(fn("ln", x), fn("ln", N(10))); return fn(f, x); }

  /* ---------------- Yordamchilar ---------------- */
  const dep = (x, v) => x.k === "v" ? x.n === v : x.k === "n" ? false : x.k === "add" || x.k === "mul" ? x.a.some((y) => dep(y, v)) : x.k === "pow" ? dep(x.b, v) || dep(x.e, v) : dep(x.x, v);
  function vars(x, s = new Set()) { if (x.k === "v" && x.n !== "e" && x.n !== "pi") s.add(x.n); else if (x.a) x.a.forEach((y) => vars(y, s)); else if (x.k === "pow") { vars(x.b, s); vars(x.e, s); } else if (x.k === "fn") vars(x.x, s); return s; }
  function evaluate(x, env = {}) {
    switch (x.k) {
      case "n": return x.v;
      case "v": return x.n === "e" ? Math.E : x.n === "pi" ? Math.PI : env[x.n] !== undefined ? env[x.n] : NaN;
      case "add": return x.a.reduce((s, y) => s + evaluate(y, env), 0);
      case "mul": return x.a.reduce((s, y) => s * evaluate(y, env), 1);
      case "pow": { const b = evaluate(x.b, env), e = evaluate(x.e, env); if (b < 0 && !Number.isInteger(e)) { const q = Math.round(1 / e); if (Math.abs(1 / e - q) < 1e-9 && q % 2) return -Math.pow(-b, e); } return Math.pow(b, e); }
      case "fn": { const u = evaluate(x.x, env); return { sin: Math.sin, cos: Math.cos, tan: Math.tan, cot: (t) => 1 / Math.tan(t), ln: Math.log, lnabs: (t) => Math.log(Math.abs(t)), asin: Math.asin, acos: Math.acos, atan: Math.atan, abs: Math.abs }[x.f](u); }
    }
    return NaN;
  }

  /* ---------------- Sonlarni chiroyli yozish ---------------- */
  function frac(v, maxD = 200) {
    if (!isFinite(v)) return null;
    for (let d = 1; d <= maxD; d++) { const n = Math.round(v * d); if (Math.abs(v * d - n) < 1e-9 * Math.max(1, Math.abs(v * d))) return [n, d]; }
    return null;
  }
  function fmtNum(v) {
    if (!isFinite(v)) return v > 0 ? "∞" : v < 0 ? "−∞" : "aniqlanmagan";
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v)).replace("-", "−");
    const f = frac(v, 100); if (f) return (f[1] === 1 ? String(f[0]) : `${f[0]}/${f[1]}`).replace("-", "−");
    return String(+v.toPrecision(6)).replace("-", "−");
  }
  function nice(v) {
    if (!isFinite(v)) return fmtNum(v);
    const f = frac(v, 60); if (f && Math.abs(v) < 1e6) return fmtNum(v);
    const C = [[Math.E, "e"], [1 / Math.E, "1/e"], [Math.PI, "π"], [Math.PI / 2, "π/2"], [Math.PI / 4, "π/4"], [Math.PI / 3, "π/3"], [Math.PI / 6, "π/6"], [2 * Math.PI / 3, "2π/3"], [5 * Math.PI / 6, "5π/6"], [3 * Math.PI / 2, "3π/2"], [2 * Math.PI, "2π"], [Math.E ** 2, "e²"], [Math.SQRT2, "√2"], [Math.sqrt(3), "√3"], [Math.LN2, "ln 2"], [Math.sqrt(Math.E), "√e"]];
    for (const [c, s] of C) { if (Math.abs(v - c) < 1e-5) return s; if (Math.abs(v + c) < 1e-5) return "−" + s; }
    for (let k = 2; k <= 50; k++) { const r = Math.sqrt(k); if (Number.isInteger(r)) continue; for (let m = 1; m <= 6; m++) { if (Math.abs(v - (m * r)) < 1e-7) return (m > 1 ? m : "") + "√" + k; if (Math.abs(v - r / m) < 1e-7) return "√" + k + "/" + m; } }
    return String(+v.toPrecision(6)).replace("-", "−");
  }

  /* ---------------- Soddalashtirish (kanonik shakl) ---------------- */
  const key = (x) => str(x);
  function degree(x, v = "x") { if (!dep(x, v)) return 0; if (x.k === "v") return 1; if (x.k === "pow" && x.b.k === "v" && isN(x.e)) return x.e.v; if (x.k === "mul") return x.a.reduce((s, y) => s + degree(y, v), 0); return 0.5; }
  function splitCoef(t) { if (t.k === "n") return [t.v, null]; if (t.k === "mul") { let c = 1; const r = []; t.a.forEach((y) => (y.k === "n" ? (c *= y.v) : r.push(y))); return [c, r.length ? (r.length === 1 ? r[0] : mul(...r)) : null]; } return [1, t]; }
  function simp(x) {
    switch (x.k) {
      case "n": case "v": return x;
      case "fn": {
        const u = simp(x.x);
        if (u.k === "n") {
          const v = evaluate(fn(x.f, u));
          if (x.f !== "ln" && x.f !== "lnabs" ? Number.isInteger(v) && Math.abs(v) < 1e9 : Math.abs(v) < 1e-12) return N(Math.round(v));
        }
        if ((x.f === "ln" || x.f === "lnabs") && u.k === "v" && u.n === "e") return N(1);
        if ((x.f === "ln" || x.f === "lnabs") && u.k === "pow" && u.b.k === "v" && u.b.n === "e") return u.e;
        if (x.f === "abs" && u.k === "n") return N(Math.abs(u.v));
        return fn(x.f, u);
      }
      case "pow": {
        const b = simp(x.b), e = simp(x.e);
        if (isN(e, 0)) return N(1); if (isN(e, 1)) return b;
        if (isN(b, 1)) return N(1); if (isN(b, 0) && e.k === "n" && e.v > 0) return N(0);
        if (b.k === "n" && e.k === "n") { const v = Math.pow(b.v, e.v); if (isFinite(v) && (Number.isInteger(e.v) || Number.isInteger(+v.toFixed(10)))) return N(+v.toFixed(12)); }
        if (b.k === "pow" && e.k === "n" && b.e.k === "n" && (Number.isInteger(e.v) || b.e.v > 0 && Number.isInteger(b.e.v * e.v))) return simp(pow(b.b, N(b.e.v * e.v)));
        if (b.k === "mul" && e.k === "n" && Number.isInteger(e.v)) return simp(mul(...b.a.map((y) => pow(y, e))));
        if (b.k === "v" && b.n === "e" && e.k === "fn" && e.f === "ln") return e.x;
        return pow(b, e);
      }
      case "mul": {
        const fl = []; const push = (y) => (y.k === "mul" ? y.a.forEach(push) : fl.push(y));
        x.a.map(simp).forEach(push);
        let c = 1; const groups = new Map();
        for (const f of fl) {
          if (f.k === "n") { c *= f.v; continue; }
          let base = f, ex = N(1);
          if (f.k === "pow") { base = f.b; ex = f.e; }
          const kk = key(base);
          if (groups.has(kk)) { const g = groups.get(kk); g.e = (g.e.k === "n" && ex.k === "n") ? N(g.e.v + ex.v) : simp(add(g.e, ex)); }
          else groups.set(kk, { b: base, e: ex });
        }
        if (Math.abs(c) < 1e-14) return N(0);
        const fs = [];
        for (const g of groups.values()) { if (isN(g.e, 0)) continue; fs.push(isN(g.e, 1) ? g.b : simp(pow(g.b, g.e))); }
        const flat = []; fs.forEach((f) => (f.k === "mul" ? f.a.forEach((y) => (y.k === "n" ? (c *= y.v) : flat.push(y))) : f.k === "n" ? (c *= f.v) : flat.push(f)));
        const rank = (f) => { if (!vars(f).size && !(f.k === "pow" && f.b.k === "v" && f.b.n === "e")) return 6; const b = f.k === "pow" ? f.b : f; return b.k === "v" ? (b.n === "e" ? 3 : 1) : b.k === "add" ? 2 : b.k === "fn" ? 4 : 5; };
        flat.sort((a, b) => rank(a) - rank(b) || key(a).localeCompare(key(b)));
        if (!flat.length) return N(+c.toFixed(12));
        if (Math.abs(c - 1) < 1e-14 && flat.length === 1) return flat[0];
        return Math.abs(c - 1) < 1e-14 ? mul(...flat) : mul(N(+c.toFixed(12)), ...flat);
      }
      case "add": {
        const fl = []; const push = (y) => (y.k === "add" ? y.a.forEach(push) : fl.push(y));
        x.a.map(simp).forEach(push);
        const m = new Map(); let c = 0;
        for (const t of fl) { const [k, r] = splitCoef(t); if (!r) { c += k; continue; } const kk = key(r); if (m.has(kk)) m.get(kk).c += k; else m.set(kk, { c: k, r }); }
        const terms = [];
        for (const { c: k, r } of m.values()) { if (Math.abs(k) < 1e-12) continue; terms.push(Math.abs(k - 1) < 1e-12 ? r : simp(mul(N(k), r))); }
        const mv = [...vars(x)][0] || "x";
        terms.sort((a, b) => degree(b, mv) - degree(a, mv));
        if (Math.abs(c) > 1e-12) terms.push(N(+c.toFixed(12)));
        if (!terms.length) return N(0);
        return terms.length === 1 ? terms[0] : add(...terms);
      }
    }
    return x;
  }
  const S = (x) => simp(simp(x));

  /* ---------------- Chop etish (Unicode formatida) ---------------- */
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "−": "⁻", "-": "⁻", "+": "⁺", "(": "⁽", ")": "⁾", "/": "ᐟ", x: "ˣ", y: "ʸ", n: "ⁿ", t: "ᵗ", " ": "" };
  const toSup = (s) => ([...s].every((c) => SUP[c] !== undefined) ? [...s].map((c) => SUP[c]).join("") : null);
  const FN_OUT = { sin: "sin", cos: "cos", tan: "tg", cot: "ctg", ln: "ln", asin: "arcsin", acos: "arccos", atan: "arctg", abs: "abs" };
  const atomic = (x) => x.k === "v" || (x.k === "n" && x.v >= 0 && Number.isInteger(x.v));
  function str(x) {
    switch (x.k) {
      case "n": return fmtNum(x.v);
      case "v": return x.n === "pi" ? "π" : x.n;
      case "fn": {
        if (x.f === "lnabs") return `ln|${str(x.x)}|`;
        if (x.f === "abs") return `|${str(x.x)}|`;
        const a = str(x.x); return FN_OUT[x.f] + (atomic(x.x) || (x.x.k === "mul" && x.x.a.length === 2 && x.x.a[0].k === "n" && x.x.a[0].v > 0 && x.x.a[1].k === "v") ? " " + a : `(${a})`);
      }
      case "pow": {
        if (x.e.k === "n" && x.e.v < 0) return strMul(mul(x));
        if (isN(x.e, 0.5)) return "√" + (atomic(x.b) ? str(x.b) : `(${str(x.b)})`);
        let es = str(x.e); const sup = x.e.k === "n" || x.e.k === "v" || (x.e.k === "mul" && x.e.a.length <= 2) ? toSup(es) : null;
        if (x.b.k === "fn" && x.b.f !== "lnabs" && x.b.f !== "abs" && x.e.k === "n" && Number.isInteger(x.e.v) && x.e.v > 0) { const inner = str(x.b); const nm = FN_OUT[x.b.f]; return nm + toSup(es) + inner.slice(nm.length).replace(/^ /, ""); }
        const bs = atomic(x.b) ? str(x.b) : `(${str(x.b)})`;
        return bs + (sup != null ? sup : `^(${es})`);
      }
      case "mul": return strMul(x);
      case "add": {
        let s = "";
        x.a.forEach((t, i) => { const [c] = splitCoef(t); if (i === 0) s += str(t); else if (c < 0) s += " − " + str(S(mul(N(-1), t))); else s += " + " + str(t); });
        return s;
      }
    }
    return "?";
  }
  function strMul(x) {
    const fs = x.k === "mul" ? x.a : [x];
    let c = 1; const num = [], den = [];
    fs.forEach((f) => { if (f.k === "n") c *= f.v; else if (f.k === "pow" && f.e.k === "n" && f.e.v < 0) den.push(isN(f.e, -1) ? f.b : pow(f.b, N(-f.e.v))); else num.push(f); });
    const sign = c < 0 ? "−" : ""; c = Math.abs(c);
    let cn = c, cd = 1; const fr = frac(c, 100); if (fr) { cn = fr[0]; cd = fr[1]; }
    const part = (f, many) => (f.k === "add" && many) || (f.k === "add" && !many) ? `(${str(f)})` : str(f);
    const joinF = (arr, lead) => {
      let s = lead; arr.forEach((f, i) => {
        const fsr = part(f, true);
        const simple = f.k === "v" || (f.k === "pow" && f.b.k === "v" && !(f.b.n === "e"));
        const prevSimple = i > 0 && (arr[i - 1].k === "v" || (arr[i - 1].k === "pow" && arr[i - 1].b.k === "v" && arr[i - 1].b.n !== "e"));
        if (!s) s = fsr; else if (i === 0 && /^\d+$/.test(s) && f.k !== "add") s += fsr; else if (simple && (i === 0 || prevSimple)) s += fsr; else if (i === 0 && /^[\d]/.test(s) && f.k === "add") s += fsr; else s += "·" + fsr;
      }); return s;
    };
    let numS = joinF(num, cn !== 1 || !num.length ? (Number.isInteger(cn) ? String(cn) : fmtNum(cn)) : "");
    if (!den.length && cd === 1) return sign + numS;
    let denS = joinF(den, cd !== 1 ? String(cd) : "");
    if (den.length + (cd !== 1 ? 1 : 0) > 1 || (den.length === 1 && den[0].k === "mul")) denS = `(${denS})`;
    else if (den.length === 1 && den[0].k === "add" && cd === 1) denS = `(${str(den[0])})`;
    if (num.length > 1 && num.some((f) => f.k === "add")) numS = numS;
    return sign + numS + "/" + denS;
  }

  /* ---------------- Hosila ---------------- */
  function D(x, v, rules = new Set()) {
    switch (x.k) {
      case "n": return N(0);
      case "v": return N(x.n === v ? 1 : 0);
      case "add": rules.add("sum"); return add(...x.a.map((y) => D(y, v, rules)));
      case "mul": {
        const d = x.a.filter((y) => dep(y, v));
        if (d.length === 0) return N(0);
        if (d.length === 1) { if (x.a.length > 1) rules.add("const"); return mul(...x.a.map((y) => (y === d[0] ? D(y, v, rules) : y))); }
        if (x.a.some((y) => y.k === "pow" && y.e.k === "n" && y.e.v < 0 && dep(y.b, v))) rules.add("quot"); else rules.add("prod");
        return add(...x.a.map((y, i) => mul(...x.a.map((z, j) => (i === j ? D(z, v, rules) : z)))));
      }
      case "pow": {
        const b = x.b, e = x.e;
        if (!dep(e, v)) { rules.add("power"); if (b.k !== "v") rules.add("chain"); return mul(e, pow(b, add(e, N(-1))), D(b, v, rules)); }
        if (!dep(b, v)) { rules.add("expo"); if (e.k !== "v") rules.add("chain"); return mul(x, fn("ln", b), D(e, v, rules)); }
        rules.add("logd"); return mul(x, add(mul(D(e, v, rules), fn("ln", b)), mul(e, D(b, v, rules), pow(b, N(-1)))));
      }
      case "fn": {
        const u = x.x; if (!dep(u, v)) return N(0);
        rules.add("elem"); if (!(u.k === "v")) rules.add("chain");
        const du = D(u, v, rules);
        const o = { sin: fn("cos", u), cos: neg(fn("sin", u)), tan: pow(fn("cos", u), N(-2)), cot: neg(pow(fn("sin", u), N(-2))), ln: pow(u, N(-1)), lnabs: pow(u, N(-1)),
          asin: pow(add(N(1), neg(pow(u, N(2)))), N(-0.5)), acos: neg(pow(add(N(1), neg(pow(u, N(2)))), N(-0.5))), atan: pow(add(N(1), pow(u, N(2))), N(-1)),
          abs: mul(u, pow(fn("abs", u), N(-1))) }[x.f];
        return mul(o, du);
      }
    }
    return N(0);
  }
  const RULES = { sum: "Yig'indi hosilasi: (u ± v)′ = u′ ± v′", const: "O'zgarmas ko'paytuvchi: (c·u)′ = c·u′", prod: "Ko'paytma hosilasi: (uv)′ = u′v + uv′", quot: "Bo'linma hosilasi: (u/v)′ = (u′v − uv′)/v²",
    power: "Darajali funksiya: (uⁿ)′ = n·uⁿ⁻¹·u′", expo: "Ko'rsatkichli funksiya: (aᵘ)′ = aᵘ·ln a·u′  (eᵘ)′ = eᵘ·u′", logd: "Logarifmik differensiallash: (uᵛ)′ = uᵛ(v′ln u + v·u′/u)",
    elem: "Elementar funksiyalar hosilalari jadvali: (sin u)′ = cos u·u′, (ln u)′ = u′/u, …", chain: "Murakkab funksiya (zanjir) qoidasi: f(g(x))′ = f′(g(x))·g′(x)" };
  function derivative(expr, v = "x") { const rules = new Set(); const d = S(D(S(expr), v, rules)); return { d, rules: [...rules].map((r) => RULES[r]) }; }

  /* ---------------- Ko'phadlar ---------------- */
  function toPoly(x, v = "x") {
    switch (x.k) {
      case "n": return [x.v];
      case "v": return x.n === v ? [0, 1] : null;
      case "add": { let r = [0]; for (const y of x.a) { const p = toPoly(y, v); if (!p) return null; r = padd(r, p); } return r; }
      case "mul": { let r = [1]; for (const y of x.a) { const p = toPoly(y, v); if (!p) return null; r = pmul(r, p); } return r; }
      case "pow": { if (x.e.k !== "n" || !Number.isInteger(x.e.v) || x.e.v < 0 || x.e.v > 12) { if (!dep(x, v)) { const val = evaluate(x); return isFinite(val) ? [val] : null; } return null; } const b = toPoly(x.b, v); if (!b) return null; let r = [1]; for (let i = 0; i < x.e.v; i++) r = pmul(r, b); return r; }
      case "fn": { if (!dep(x, v)) { const val = evaluate(x); return isFinite(val) ? [val] : null; } return null; }
    }
    return null;
  }
  const padd = (a, b) => { const r = []; for (let i = 0; i < Math.max(a.length, b.length); i++) r.push((a[i] || 0) + (b[i] || 0)); return r; };
  const pmul = (a, b) => { const r = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y))); return r; };
  const ptrim = (p) => { p = p.map((c) => (Math.abs(c) < 1e-12 ? 0 : c)); while (p.length > 1 && p[p.length - 1] === 0) p.pop(); return p; };
  const fromPoly = (p, v = "x") => S(add(...p.map((c, i) => mul(N(c), pow(V(v), N(i))))));
  const linear = (u, v) => { const p = toPoly(u, v); if (!p) return null; const q = ptrim(p); if (q.length > 2) return null; return { a: q[1] || 0, c: q[0] || 0 }; };

  /* ---------------- Integral ---------------- */
  function anti(x, v, how) {
    if (!dep(x, v)) return mul(x, V(v));
    if (x.k === "v") { how.add("Jadval: ∫x dx = x²/2 + C"); return mul(N(0.5), pow(V(v), N(2))); }
    if (x.k === "add") { how.add("Integralning chiziqliligi: ∫(f ± g) = ∫f ± ∫g"); const r = x.a.map((y) => anti(y, v, how)); return r.some((y) => !y) ? null : add(...r); }
    if (x.k === "mul") {
      const cs = x.a.filter((y) => !dep(y, v)), ds = x.a.filter((y) => dep(y, v));
      if (ds.length === 1) { if (cs.length) how.add("O'zgarmasni integral belgisidan chiqarish: ∫c·f = c∫f"); const r = anti(ds[0], v, how); return r ? mul(...cs, r) : null; }
      const P = toPoly(x, v); if (P) { how.add("Ko'phadni ochib, har bir hadni integrallash"); return anti(fromPoly(ptrim(P), v), v, how); }
      if (ds.length === 2) {
        const pi = ds.findIndex((y) => toPoly(y, v)); const fi = 1 - pi;
        if (pi >= 0 && antiRepeatable(ds[fi], v)) {
          how.add("Bo'laklab integrallash: ∫u dv = uv − ∫v du (jadval usuli)");
          let P = ptrim(toPoly(ds[pi], v)), F = ds[fi], terms = [], sgn = 1;
          for (let k = 0; k < 14 && !(P.length === 1 && P[0] === 0); k++) { F = antiRepeatable(F, v); terms.push(mul(N(sgn), fromPoly(P, v), F)); sgn = -sgn; P = ptrim(P.slice(1).map((c, i) => c * (i + 1))); if (!P.length) P = [0]; }
          return mul(...cs, add(...terms));
        }
      }
      return null;
    }
    if (x.k === "pow") {
      const L = linear(x.b, v);
      if (L && L.a && !dep(x.e, v)) {
        const e = evaluate(x.e);
        if (Math.abs(e + 1) < 1e-12) { how.add("Jadval: ∫dx/x = ln|x| + C"); return mul(N(1 / L.a), fn("lnabs", x.b)); }
        how.add("Jadval: ∫xⁿdx = xⁿ⁺¹/(n + 1) + C"); if (!(x.b.k === "v")) how.add("Chiziqli almashtirish: u = ax + b, dx = du/a");
        return mul(N(1 / (L.a * (e + 1))), pow(x.b, N(e + 1)));
      }
      if (!dep(x.b, v)) {
        const Le = linear(x.e, v);
        if (Le && Le.a) { const isE = x.b.k === "v" && x.b.n === "e"; how.add(isE ? "Jadval: ∫eᵘdu = eᵘ + C" : "Jadval: ∫aˣdx = aˣ/ln a + C"); if (x.e.k !== "v") how.add("Chiziqli almashtirish: u = ax + b, dx = du/a"); return isE ? mul(N(1 / Le.a), x) : mul(N(1 / Le.a), x, pow(fn("ln", x.b), N(-1))); }
      }
      const P = toPoly(x, v); if (P) { how.add("Ko'phadni ochib, har bir hadni integrallash"); return anti(fromPoly(ptrim(P), v), v, how); }
      return null;
    }
    if (x.k === "fn") {
      const L = linear(x.x, v); if (!L || !L.a) return null; const k = N(1 / L.a), u = x.x;
      if (u.k !== "v") how.add("Chiziqli almashtirish: u = ax + b, dx = du/a");
      const T = { sin: () => (how.add("Jadval: ∫sin x dx = −cos x + C"), mul(N(-1 / L.a), fn("cos", u))), cos: () => (how.add("Jadval: ∫cos x dx = sin x + C"), mul(k, fn("sin", u))),
        tan: () => (how.add("∫tg x dx = −ln|cos x| + C"), mul(N(-1 / L.a), fn("lnabs", fn("cos", u)))), cot: () => (how.add("∫ctg x dx = ln|sin x| + C"), mul(k, fn("lnabs", fn("sin", u)))),
        ln: () => (how.add("Bo'laklab integrallash: ∫ln x dx = x ln x − x + C"), mul(k, add(mul(u, fn("ln", u)), neg(u)))), atan: () => null };
      return T[x.f] ? T[x.f]() : null;
    }
    return null;
  }
  function antiRepeatable(F, v) {
    if (F.k === "pow" && F.b.k === "v" && F.b.n === "e") { const L = linear(F.e, v); if (L && L.a) return mul(N(1 / L.a), F); }
    if (F.k === "mul" && F.a.length === 2 && F.a[0].k === "n") { const r = antiRepeatable(F.a[1], v); return r ? mul(F.a[0], r) : null; }
    if (F.k === "fn" && (F.f === "sin" || F.f === "cos")) { const L = linear(F.x, v); if (L && L.a) return F.f === "sin" ? mul(N(-1 / L.a), fn("cos", F.x)) : mul(N(1 / L.a), fn("sin", F.x)); }
    return null;
  }
  function integral(expr, v = "x") { const how = new Set(); const r = anti(S(expr), v, how); return { F: r ? S(r) : null, how: [...how] }; }
  function simpson(f, a, b, n = 2000) { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; }

  /* ---------------- Tenglamalar ---------------- */
  function polyRoots(p) {
    p = ptrim(p); const deg = p.length - 1; const roots = [];
    if (deg < 1) return { roots, deg };
    let q = p.slice();
    // ratsional ildizlar
    if (q.every((c) => Number.isInteger(c))) {
      const divs = (n) => { n = Math.abs(n); const r = []; for (let i = 1; i <= Math.min(n, 10000); i++) if (n % i === 0) r.push(i); return r; };
      let guard = 0;
      while (q.length > 3 && guard++ < 10) {
        if (q[0] === 0) { roots.push(0); q = q.slice(1); continue; }
        const cand = []; divs(q[0]).forEach((a) => divs(q[q.length - 1]).forEach((b) => cand.push(a / b, -a / b)));
        const r = cand.find((x) => Math.abs(q.reduceRight((s, c) => s * x + c, 0)) < 1e-9);
        if (r === undefined) break;
        roots.push(r); const n = []; let acc = 0; for (let i = q.length - 1; i >= 1; i--) { acc = acc * r + q[i]; n.unshift(acc); } q = n;
      }
    }
    if (q.length === 3) { const [c, b, a] = q; const Dd = b * b - 4 * a * c; if (Dd >= -1e-12) { const s = Math.sqrt(Math.max(0, Dd)); roots.push((-b - s) / (2 * a), (-b + s) / (2 * a)); } else return { roots, deg, complex: [-b / (2 * a), Math.sqrt(-Dd) / (2 * a)] }; }
    else if (q.length === 2) roots.push(-q[0] / q[1]);
    else if (q.length > 3) { const f = (x) => q.reduceRight((s, c) => s * x + c, 0); roots.push(...numRoots(f, -50, 50)); }
    return { roots: [...new Set(roots.map((r) => +r.toFixed(10)))].sort((a, b) => a - b), deg };
  }
  function numRoots(f, a, b, n = 4000) {
    const out = []; let px = a, pv = f(a);
    for (let i = 1; i <= n; i++) {
      const x = a + ((b - a) * i) / n, v = f(x);
      if (isFinite(pv) && isFinite(v)) {
        if (Math.abs(v) < 1e-12) out.push(x);
        else if (pv * v < 0 && Math.abs(pv - v) < 1e3) { let lo = px, hi = x; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } out.push((lo + hi) / 2); }
      }
      px = x; pv = v;
    }
    return [...new Set(out.map((r) => +r.toFixed(8)))].slice(0, 8);
  }

  /* ---------------- Kasrlar va matritsalar ---------------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const F = (n, d = 1) => { if (!Number.isInteger(n) || !Number.isInteger(d)) { const f = frac(n / d, 1000); if (f) { n = f[0]; d = f[1]; } else return { n: n / d, d: 1, approx: true }; } if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const fa = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d), fs = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d), fm = (a, b) => F(a.n * b.n, a.d * b.d), fd = (a, b) => F(a.n * b.d, a.d * b.n);
  const fz = (a) => Math.abs(a.n) < 1e-12, fv = (a) => a.n / a.d;
  const fstr = (a) => (a.approx ? String(+a.n.toFixed(4)) : a.d === 1 ? String(a.n) : `${a.n}/${a.d}`).replace("-", "−");
  const M = (rows) => rows.map((r) => r.map((x) => (typeof x === "object" ? x : F(x))));
  function detF(A) {
    const n = A.length; let m = A.map((r) => r.slice()), d = F(1), swaps = 0;
    for (let c = 0; c < n; c++) {
      let p = c; while (p < n && fz(m[p][c])) p++;
      if (p === n) return F(0);
      if (p !== c) { [m[p], m[c]] = [m[c], m[p]]; swaps++; }
      d = fm(d, m[c][c]);
      for (let r = c + 1; r < n; r++) { const k = fd(m[r][c], m[c][c]); for (let j = c; j < n; j++) m[r][j] = fs(m[r][j], fm(k, m[c][j])); }
    }
    return swaps % 2 ? fm(d, F(-1)) : d;
  }
  function inverseF(A) {
    const n = A.length; const m = A.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => F(i === j ? 1 : 0))));
    for (let c = 0; c < n; c++) {
      let p = c; while (p < n && fz(m[p][c])) p++; if (p === n) return null;
      [m[p], m[c]] = [m[c], m[p]]; const piv = m[c][c]; m[c] = m[c].map((x) => fd(x, piv));
      for (let r = 0; r < n; r++) if (r !== c && !fz(m[r][c])) { const k = m[r][c]; m[r] = m[r].map((x, j) => fs(x, fm(k, m[c][j]))); }
    }
    return m.map((r) => r.slice(n));
  }
  function rankF(A) {
    const m = A.map((r) => r.slice()), R = m.length, Cc = m[0].length; let rank = 0;
    for (let c = 0; c < Cc && rank < R; c++) {
      let p = rank; while (p < R && fz(m[p][c])) p++; if (p === R) continue;
      [m[p], m[rank]] = [m[rank], m[p]];
      for (let r = rank + 1; r < R; r++) { const k = fd(m[r][c], m[rank][c]); m[r] = m[r].map((x, j) => fs(x, fm(k, m[rank][j]))); }
      rank++;
    }
    return rank;
  }
  function mmul(A, B) { return A.map((r) => B[0].map((_, j) => r.reduce((s, x, k) => fa(s, fm(x, B[k][j])), F(0)))); }
  function charPoly(A) {
    const n = A.length; const a = A.map((r) => r.map(fv));
    if (n === 2) return [a[0][0] * a[1][1] - a[0][1] * a[1][0], -(a[0][0] + a[1][1]), 1];
    if (n === 3) {
      const tr = a[0][0] + a[1][1] + a[2][2];
      const m2 = a[0][0] * a[1][1] - a[0][1] * a[1][0] + a[0][0] * a[2][2] - a[0][2] * a[2][0] + a[1][1] * a[2][2] - a[1][2] * a[2][1];
      return [-fv(detF(A)), m2, -tr, 1];
    }
    return null;
  }

  return { N, V, add, mul, pow, fn, neg, sub, div, parse, S, str, derivative, integral, simpson, evaluate, vars, dep, toPoly, ptrim, fromPoly, polyRoots, numRoots, fmtNum, nice, frac,
    F, fa, fs, fm, fd, fz, fv, fstr, M, detF, inverseF, rankF, mmul, charPoly, D };
})();

/* ===== assistant.js — PM Edu AI yordamchi: niyatni aniqlash + qadamma-qadam yechim (internetsiz ishlaydi) ===== */
"use strict";
const AI = (() => {
  const e = U.esc;
  const fm = (s) => `<div class="formula">${e(s)}</div>`;
  const steps = (arr) => `<ol>${arr.map((x) => `<li>${x}</li>`).join("")}</ol>`;
  const reply = (html, text, actions = [], topic = null) => ({ html, text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), actions, topic });
  const has = (t, words) => words.some((w) => t.includes(w));

  /* Matn ichidan matematik ifodani ajratib olish */
  const KEEP = new Set(["sin", "cos", "tan", "tg", "ctg", "cot", "ln", "log", "lg", "exp", "sqrt", "arcsin", "arccos", "arctg", "arctan", "asin", "acos", "atan", "abs", "pi", "e", "x", "y", "z", "t"]);
  function extractExpr(raw, { dropAssign = true } = {}) {
    let s = String(raw).replace(/[ʻʼ‘’`]/g, "'");
    if (s.includes(":")) s = s.slice(s.lastIndexOf(":") + 1);
    s = s.replace(/\bd\s*[xyz]\b\s*$/i, "").replace(/\bd[xyz]\b/gi, " ");
    if (dropAssign) s = s.replace(/^.*?\b(?:f\s*\(\s*[xyz](?:\s*,\s*[xyz])?\s*\)|[yzf])\s*=\s*/i, "");
    const toks = s.replace(/([0-9)²³])(ning|ni|dan|ga|da|ning)\b/gi, "$1 ").split(/\s+/).filter(Boolean);
    const keep = toks.filter((tk) => {
      const w = tk.toLowerCase().replace(/[?.!,;]+$/, "");
      if (!w) return false;
      if (/[0-9+\-*/^()|²³√π=−·×]/.test(w)) return !/^[a-z']{4,}$/i.test(w);
      if (KEEP.has(w)) return true;
      if (/^[xyzt]+$/.test(w) && w.length <= 3) return true;
      if (/^(sin|cos|tg|ctg|tan|ln|log|exp|sqrt|arctg|arcsin|arccos)[a-z0-9(]*$/.test(w) && w.length <= 9) return true;
      return false;
    }).map((w) => w.replace(/[?!;,]+$/, "").replace(/\.$/, ""));
    return keep.join(" ").trim();
  }
  function tryParse(s) { try { if (!s || !/[0-9a-z]/i.test(s)) return null; return MC.parse(s); } catch (err) { return null; } }

  /* ---------------- Hosila ---------------- */
  function doDerivative(text) {
    const src = extractExpr(text); const ex = tryParse(src); if (!ex) return null;
    const vs = [...MC.vars(ex)].sort(); const v = vs.includes("x") ? "x" : vs[0] || "x";
    const f = MC.S(ex);
    const partial = vs.length > 1 || /xususiy|∂|partial/.test(U.norm(text));
    if (partial && vs.length > 1) {
      const rows = vs.map((w) => { const r = MC.derivative(ex, w); return { w, d: r.d, rules: r.rules }; });
      const rules = [...new Set(rows.flatMap((r) => r.rules))];
      const html = `<p><b>Xususiy hosilalar</b> — bitta o'zgaruvchi bo'yicha, qolganlari o'zgarmas deb olinadi.</p>${fm(`z = ${MC.str(f)}`)}
        ${steps(rows.map((r) => `∂z/∂${r.w} = <b class="m">${e(MC.str(r.d))}</b> <span class="muted small">(${vs.filter((q) => q !== r.w).join(", ")} — o'zgarmas)</span>`))}
        ${rules.length ? `<p class="small muted">Qo'llangan qoidalar:</p><ul class="small">${rules.map((r) => `<li>${e(r)}</li>`).join("")}</ul>` : ""}`;
      return reply(html, rows.map((r) => `∂z/∂${r.w} = ${MC.str(r.d)}`).join("; "), [], "a3");
    }
    const r = MC.derivative(ex, v); const d2 = MC.derivative(r.d, v).d;
    const html = `<p>Funksiya hosilasini topamiz:</p>${fm(`f(${v}) = ${MC.str(f)}`)}
      <p class="small muted">Qo'llangan qoidalar:</p>${steps(r.rules.map(e))}
      <p><b>Javob:</b></p>${fm(`f′(${v}) = ${MC.str(r.d)}`)}
      <p class="small muted">Ikkinchi tartibli hosila: <span class="m">f″(${v}) = ${e(MC.str(d2))}</span></p>`;
    return reply(html, `f′(${v}) = ${MC.str(r.d)}`, [{ label: "Shu mavzudan test", cmd: "test:t-hosila" }], "a3");
  }

  /* ---------------- Integral ---------------- */
  function limitsOf(text) {
    const t = text.replace(/[−–]/g, "-").replace(/π/g, "pi");
    const num = "(-?\\d+(?:[.,]\\d+)?|-?pi(?:\\s*/\\s*\\d+)?|e)";
    const pats = [new RegExp(num + "\\s*(?:dan|-?dan)\\s+" + num + "\\s*(?:gacha|-?gacha)", "i"), new RegExp("\\[\\s*" + num + "\\s*[,;]\\s*" + num + "\\s*\\]", "i"), new RegExp("\\bfrom\\s+" + num + "\\s+to\\s+" + num, "i"), new RegExp("\\ba\\s*=\\s*" + num + "\\s*,?\\s*b\\s*=\\s*" + num, "i")];
    for (const p of pats) { const m = t.match(p); if (m) { const val = (s) => MC.evaluate(MC.parse(s.replace(",", "."))); return { a: val(m[1]), b: val(m[2]), as: m[1], bs: m[2], rest: t.replace(m[0], " ") }; } }
    return null;
  }
  function doIntegral(text) {
    const L = limitsOf(text); const src = extractExpr(L ? L.rest : text); const ex = tryParse(src); if (!ex) return null;
    const vs = [...MC.vars(ex)]; const v = vs.includes("x") ? "x" : vs[0] || "x";
    const f = MC.S(ex); const r = MC.integral(ex, v);
    const fnum = (x) => MC.evaluate(ex, { [v]: x });
    if (L) {
      const num = MC.simpson(fnum, L.a, L.b);
      let exact = null; if (r.F) { const Fb = MC.evaluate(r.F, { [v]: L.b }), Fa = MC.evaluate(r.F, { [v]: L.a }); if (isFinite(Fb) && isFinite(Fa) && Math.abs(Fb - Fa - num) < 1e-4 * Math.max(1, Math.abs(num))) exact = Fb - Fa; }
      const val = exact ?? num;
      const html = `<p>Aniq integralni hisoblaymiz:</p>${fm(`∫ ${MC.str(f)} d${v},  ${v} ∈ [${L.as}; ${L.bs}]`)}
        ${r.F ? `${steps([...r.how.map(e), `Boshlang'ich funksiya: <span class="m">F(${v}) = ${e(MC.str(r.F))}</span>`, `Nyuton–Leybnits: F(${e(L.bs)}) − F(${e(L.as)}) = <b>${e(MC.nice(val))}</b>`])}` : `<p class="small muted">Boshlang'ich funksiya elementar ko'rinishda topilmadi — Simpson usuli (n = 2000) bilan sonli hisoblandi.</p>`}
        <p><b>Javob:</b></p>${fm(`= ${MC.nice(val)}${MC.nice(val) !== String(+val.toFixed(6)) ? "  ≈ " + (+val.toFixed(6)) : ""}`)}
        <p class="small muted">Tekshiruv (Simpson usuli): ${+num.toFixed(6)}</p>`;
      return reply(html, `= ${MC.nice(val)}`, [{ label: "Integral testi", cmd: "test:t-integral" }], "a6");
    }
    if (!r.F) return reply(`<p>Bu ifoda uchun boshlang'ich funksiyani elementar ko'rinishda topa olmadim:</p>${fm(MC.str(f))}<p>Chegaralarni yozsangiz, sonli qiymatini hisoblayman. Masalan: <i>integral ${e(src)} 0 dan 1 gacha</i></p>`, "", [], "a5");
    const check = MC.derivative(r.F, v).d;
    const html = `<p>Aniqmas integralni topamiz:</p>${fm(`∫ (${MC.str(f)}) d${v}`)}${steps(r.how.map(e))}
      <p><b>Javob:</b></p>${fm(`${MC.str(r.F)} + C`)}
      <p class="small muted">Tekshiruv: (${e(MC.str(r.F))})′ = ${e(MC.str(check))} ✓</p>`;
    return reply(html, `${MC.str(r.F)} + C`, [{ label: "Integral testi", cmd: "test:t-integral" }], "a5");
  }

  /* ---------------- Limit ---------------- */
  function doLimit(text) {
    const t = text.replace(/[−–]/g, "-").replace(/→/g, "->");
    const m = t.match(/([xyzt])\s*(?:->|=>|intil\w*)\s*(-?\s*(?:inf\w*|∞|cheksiz\w*)|-?\d+(?:[.,]\d+)?|-?pi|e)\b/i) || t.match(/([xyzt])\s+(-?\d+(?:[.,]\d+)?|∞|cheksiz\w*)\s*(?:ga\s*)?intil/i);
    if (!m) return null;
    const v = m[1].toLowerCase(); const aStr = m[2].replace(/\s/g, "");
    const inf = /inf|∞|cheksiz/i.test(aStr) ? (aStr.startsWith("-") ? -1 : 1) : 0;
    const a = inf ? inf * Infinity : MC.evaluate(MC.parse(aStr.replace(",", ".")));
    const rest = t.replace(m[0], " ").replace(/\blim(it)?\w*/gi, " ").replace(/\(\s*\)/g, " ");
    const ex = tryParse(extractExpr(rest)); if (!ex) return null;
    const f = MC.S(ex), F = (x) => MC.evaluate(f, { [v]: x });
    const lines = [];
    let val;
    if (!inf) {
      const direct = F(a);
      if (isFinite(direct)) { lines.push(`Funksiya ${v} = ${e(aStr)} nuqtada aniqlangan va uzluksiz — qiymatni bevosita qo'yamiz.`); val = direct; }
      else {
        const parts = numDen(f);
        if (parts && Math.abs(MC.evaluate(parts[0], { [v]: a })) < 1e-9 && Math.abs(MC.evaluate(parts[1], { [v]: a })) < 1e-9) {
          lines.push(`${v} = ${e(aStr)} qo'yilsa <b>0/0</b> ko'rinishidagi aniqmaslik hosil bo'ladi.`);
          let [P, Q] = parts;
          for (let k = 0; k < 4; k++) {
            P = MC.derivative(P, v).d; Q = MC.derivative(Q, v).d;
            lines.push(`Lopital qoidasi: <span class="m">lim (${e(MC.str(P))}) / (${e(MC.str(Q))})</span>`);
            const pv = MC.evaluate(P, { [v]: a }), qv = MC.evaluate(Q, { [v]: a });
            if (!(Math.abs(pv) < 1e-9 && Math.abs(qv) < 1e-9)) { val = pv / qv; break; }
          }
        }
        if (val === undefined) { const h = [1e-4, 1e-6]; const L = h.map((d) => (F(a - d) + F(a + d)) / 2); val = L[1]; lines.push(`Chap va o'ng limitlarni sonli yaqinlashish bilan tekshiramiz: f(${e(aStr)} ± 10⁻⁶) ≈ ${+val.toFixed(6)}.`);
          if (Math.abs(F(a - 1e-6) - F(a + 1e-6)) > 1e-2 * Math.max(1, Math.abs(val))) return reply(`<p>Chap limit (${+F(a - 1e-6).toFixed(4)}) va o'ng limit (${+F(a + 1e-6).toFixed(4)}) teng emas — <b>limit mavjud emas</b>.</p>`, "Limit mavjud emas", [], "a2"); }
      }
    } else {
      const xs = [1e3, 1e5, 1e7].map((x) => x * inf); const ys = xs.map(F);
      lines.push(`${v} → ${inf > 0 ? "+∞" : "−∞"}: qiymatlarni kuzatamiz — ${xs.map((x, i) => `f(${x > 0 ? "" : "−"}10${MC.fmtNum(Math.log10(Math.abs(x))).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}) ≈ ${Math.abs(ys[i]) > 1e9 ? "∞" : +ys[i].toFixed(6)}`).join(", ")}`);
      val = Math.abs(ys[2]) > 1e8 ? (ys[2] > 0 ? Infinity : -Infinity) : ys[2];
      if (Math.abs(val - Math.E) < 1e-4) lines.push("Bu — ikkinchi ajoyib limit: (1 + 1/x)ˣ → e.");
    }
    const ans = MC.nice(Math.abs(val) > 1e8 ? Math.sign(val) * Infinity : val);
    const html = `<p>Limitni hisoblaymiz:</p>${fm(`lim(${v} → ${inf ? (inf > 0 ? "∞" : "−∞") : aStr}) ${MC.str(f)}`)}${steps(lines)}<p><b>Javob:</b></p>${fm(`= ${ans}`)}`;
    return reply(html, "= " + ans, [{ label: "Limit testi", cmd: "test:t-limit" }], "a2");
  }
  function numDen(f) {
    const fs = f.k === "mul" ? f.a : [f];
    const den = fs.filter((x) => x.k === "pow" && x.e.k === "n" && x.e.v < 0), num = fs.filter((x) => !den.includes(x));
    if (!den.length) return null;
    return [MC.S(MC.mul(MC.N(1), ...num)), MC.S(MC.mul(MC.N(1), ...den.map((x) => MC.pow(x.b, MC.N(-x.e.v)))))];
  }

  /* ---------------- Tenglama ---------------- */
  function doEquation(text) {
    let s = String(text); if (s.includes(":")) s = s.slice(s.lastIndexOf(":") + 1);
    const parts = s.split("="); if (parts.length !== 2) return null;
    const L = tryParse(extractExpr(parts[0], { dropAssign: false })), R = tryParse(extractExpr(parts[1], { dropAssign: false }));
    if (!L || !R) return null;
    const f = MC.S(MC.sub(L, R)); const vs = [...MC.vars(f)]; if (vs.length !== 1) return null; const v = vs[0];
    const P = MC.toPoly(f, v);
    if (P) {
      const p = MC.ptrim(P); const deg = p.length - 1;
      if (deg === 1) { const x = -p[0] / p[1]; return reply(`<p>Chiziqli tenglama:</p>${fm(MC.str(f) + " = 0")}${steps([`${e(MC.fmtNum(p[1]))}${v} = ${e(MC.fmtNum(-p[0]))}`, `${v} = ${e(MC.fmtNum(-p[0]))} / ${e(MC.fmtNum(p[1]))}`])}<p><b>Javob:</b></p>${fm(`${v} = ${MC.nice(x)}`)}`, `${v} = ${MC.nice(x)}`); }
      if (deg === 2) {
        const [c, b, a] = p; const D = b * b - 4 * a * c; const ss = [`a = ${e(MC.fmtNum(a))}, b = ${e(MC.fmtNum(b))}, c = ${e(MC.fmtNum(c))}`, `Diskriminant: D = b² − 4ac = ${e(MC.fmtNum(b * b))} − ${e(MC.fmtNum(4 * a * c))} = <b>${e(MC.fmtNum(D))}</b>`];
        let ans;
        if (D > 1e-12) { const x1 = (-b - Math.sqrt(D)) / (2 * a), x2 = (-b + Math.sqrt(D)) / (2 * a); ss.push("D > 0 — ikkita haqiqiy ildiz:", `${v}₁,₂ = (−b ± √D) / 2a`); ans = `${v}₁ = ${MC.nice(Math.min(x1, x2))},  ${v}₂ = ${MC.nice(Math.max(x1, x2))}`; ss.push(`Viyet teoremasi bilan tekshiruv: ${v}₁ + ${v}₂ = ${e(MC.nice(x1 + x2))}, ${v}₁·${v}₂ = ${e(MC.nice(x1 * x2))}`); }
        else if (Math.abs(D) <= 1e-12) { ss.push("D = 0 — bitta (karrali) ildiz: x = −b / 2a"); ans = `${v} = ${MC.nice(-b / (2 * a))}`; }
        else { const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * a); ss.push("D < 0 — haqiqiy ildizlar yo'q, kompleks ildizlar:"); ans = `${v} = ${MC.nice(re)} ± ${MC.nice(Math.abs(im))}·i`; }
        return reply(`<p>Kvadrat tenglamani yechamiz:</p>${fm(MC.str(f) + " = 0")}${steps(ss)}<p><b>Javob:</b></p>${fm(ans)}`, ans);
      }
      if (deg >= 3) {
        const r = MC.polyRoots(p);
        const ans = r.roots.length ? r.roots.map((x, i) => `${v}${"₁₂₃₄₅₆"[i] || ""} = ${MC.nice(x)}`).join(",  ") : "Haqiqiy ildizlar topilmadi";
        return reply(`<p>${deg}-darajali tenglama:</p>${fm(MC.str(f) + " = 0")}${steps(["Butun koeffitsientlar bo'lsa, ratsional ildizlar ozod hadning bo'luvchilari orasidan izlanadi (Gorner sxemasi).", "Topilgan ildiz bo'yicha ko'phad bo'linib, daraja pasaytiriladi; qolgan qism kvadrat tenglama sifatida yechiladi."])}<p><b>Javob:</b></p>${fm(ans)}`, ans);
      }
      return null;
    }
    const roots = MC.numRoots((x) => MC.evaluate(f, { [v]: x }), -10, 10);
    const ans = roots.length ? roots.map((x) => `${v} ≈ ${MC.nice(x)}`).join(",  ") : "[−10; 10] oralig'ida ildiz topilmadi";
    return reply(`<p>Transsendent tenglama — [−10; 10] oralig'ida ishora almashishi va bisektsiya (teng ikkiga bo'lish) usuli bilan sonli yechamiz:</p>${fm(MC.str(f) + " = 0")}<p><b>Javob:</b></p>${fm(ans)}${/sin|cos|tg/.test(MC.str(f)) ? `<p class="small muted">Trigonometrik tenglamaning umumiy yechimi davriy: topilgan ildizlarga 2πk qo'shiladi.</p>` : ""}`, ans);
  }

  /* ---------------- Tenglamalar sistemasi (Kramer) ---------------- */
  function doSystem(text) {
    let s = String(text); if (s.includes(":")) s = s.slice(s.indexOf(":") + 1);
    const eqs = s.split(/[;\n]|,(?![^(]*\))|\bva\b/).map((x) => x.trim()).filter((x) => x.includes("="));
    if (eqs.length < 2 || eqs.length > 4) return null;
    const rows = [];
    for (const q of eqs) { const [l, r] = q.split("="); const L = tryParse(extractExpr(l, { dropAssign: false })), R = tryParse(extractExpr(r, { dropAssign: false })); if (!L || !R) return null; rows.push(MC.S(MC.sub(L, R))); }
    const vs = [...new Set(rows.flatMap((f) => [...MC.vars(f)]))].sort(); if (vs.length !== eqs.length) return null;
    const ev = (f, pt) => MC.evaluate(f, Object.fromEntries(vs.map((w, i) => [w, pt[i]])));
    const zero = vs.map(() => 0);
    const A = rows.map((f) => vs.map((_, j) => ev(f, vs.map((__, k) => (k === j ? 1 : 0))) - ev(f, zero)));
    const B = rows.map((f) => -ev(f, zero));
    const test = vs.map((_, i) => i * 1.7 + 0.3); if (rows.some((f, r) => Math.abs(ev(f, test) - (A[r].reduce((s2, c, j) => s2 + c * test[j], 0) - B[r])) > 1e-6)) return null;
    const AF = MC.M(A); const d = MC.detF(AF);
    const matS = (m) => `<table>${m.map((r) => `<tr>${r.map((c) => `<td>${e(typeof c === "object" ? MC.fstr(c) : MC.fmtNum(c))}</td>`).join("")}</tr>`).join("")}</table>`;
    const lines = [`Asosiy determinant: ${matS(AF)} Δ = <b>${e(MC.fstr(d))}</b>`];
    if (MC.fz(d)) return reply(`<p>Sistema:</p>${fm(eqs.join(";  "))}${steps(lines)}<p>Δ = 0 — Kramer usulini qo'llab bo'lmaydi: sistema yoki cheksiz ko'p yechimga ega, yoki birgalikda emas (Kroneker–Kapelli teoremasi bilan tekshiriladi).</p>`, "Δ = 0");
    const sol = vs.map((w, j) => { const Aj = AF.map((r, i) => r.map((c, k) => (k === j ? MC.F(B[i]) : c))); const dj = MC.detF(Aj); lines.push(`Δ${w} = ${e(MC.fstr(dj))}  ⇒  ${w} = Δ${w}/Δ = <b>${e(MC.fstr(MC.fd(dj, d)))}</b>`); return `${w} = ${MC.fstr(MC.fd(dj, d))}`; });
    return reply(`<p>Chiziqli tenglamalar sistemasini <b>Kramer usuli</b> bilan yechamiz:</p>${fm(eqs.join(";   "))}${steps(lines)}<p><b>Javob:</b></p>${fm(sol.join(",  "))}`, sol.join(", "), [{ label: "Sistemalar testi", cmd: "test:t-sistema" }], "b4");
  }

  /* ---------------- Matritsalar ---------------- */
  function parseMatrices(text) {
    const out = []; const t = text.replace(/[−–]/g, "-");
    const re = /\[\s*\[[^\]]*\](?:\s*,?\s*\[[^\]]*\])*\s*\]|\[[^\[\]]*;[^\[\]]*\]|\|[^|]*;[^|]*\|/g;
    let m; while ((m = re.exec(t))) {
      let body = m[0]; let rows;
      if (body.startsWith("[[")) rows = body.slice(1, -1).split(/\]\s*,?\s*\[/).map((r) => r.replace(/[\[\]]/g, ""));
      else rows = body.slice(1, -1).split(";");
      const M = rows.map((r) => (r.match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g) || []).map((x) => { const [a, b] = x.split("/"); return b ? MC.F(+a, +b) : MC.F(+a); }));
      if (M.length && M.every((r) => r.length === M[0].length && r.length)) out.push(M);
    }
    return out;
  }
  const matHtml = (M) => `<table>${M.map((r) => `<tr>${r.map((c) => `<td>${e(MC.fstr(c))}</td>`).join("")}</tr>`).join("")}</table>`;
  function doMatrix(text) {
    const Ms = parseMatrices(text); if (!Ms.length) return null;
    const t = U.norm(text); const A = Ms[0]; const n = A.length, sq = A.every((r) => r.length === n);
    if (Ms.length >= 2 && has(t, ["kopaytma", "kopaytir", "multiply", "*", "·"])) {
      const B = Ms[1]; if (A[0].length !== B.length) return reply(`<p>Ko'paytirib bo'lmaydi: A ustunlari soni (${A[0].length}) B qatorlari soniga (${B.length}) teng emas.</p>`);
      const C = MC.mmul(A, B);
      return reply(`<p>Matritsalar ko'paytmasi: (AB)ᵢⱼ = ∑ₖ aᵢₖbₖⱼ</p><div class="row wrap">${matHtml(A)} × ${matHtml(B)} =</div>${matHtml(C)}<p class="small muted">O'lcham: ${A.length}×${A[0].length} · ${B.length}×${B[0].length} = ${C.length}×${C[0].length}</p>`, "AB", [], "b1");
    }
    if (has(t, ["rang", "rank"])) { const r = MC.rankF(A); return reply(`<p>Matritsa rangi Gauss usuli (pog'onasimon ko'rinish) bilan topiladi:</p>${matHtml(A)}<p><b>Javob:</b> rang = ${r}</p>`, "rang = " + r, [], "b1"); }
    if (has(t, ["transp"])) { const T = A[0].map((_, j) => A.map((r) => r[j])); return reply(`<p>Transponirlangan matritsa (qatorlar ↔ ustunlar):</p>${matHtml(T)}`, "Aᵀ", [], "b1"); }
    if (!sq) return reply(`<p>Bu amal uchun kvadrat matritsa kerak (${A.length}×${A[0].length} berildi).</p>`);
    const d = MC.detF(A);
    if (has(t, ["teskari", "inverse", "obratn", "^-1", "⁻¹"])) {
      if (MC.fz(d)) return reply(`<p>det A = 0 — matritsa xos (singulyar), <b>teskari matritsa mavjud emas</b>.</p>${matHtml(A)}`, "Mavjud emas", [], "b3");
      const inv = MC.inverseF(A);
      const s2 = n === 2 ? `<p class="small">Formula: A⁻¹ = (1/det A)·[d −b; −c a]</p>` : `<p class="small">Gauss–Jordan usuli: [A | E] → [E | A⁻¹]</p>`;
      return reply(`<p>Teskari matritsani topamiz:</p>${matHtml(A)}<p>det A = <b>${e(MC.fstr(d))}</b> ≠ 0 — teskari matritsa mavjud.</p>${s2}<p><b>Javob:</b> A⁻¹ =</p>${matHtml(inv)}<p class="small muted">Tekshiruv: A·A⁻¹ = E ✓</p>`, "A⁻¹", [{ label: "Matritsalar testi", cmd: "test:t-matritsa" }], "b3");
    }
    if (has(t, ["xos", "eigen", "sobstven", "xarakteristik"])) {
      const cp = MC.charPoly(A); if (!cp) return reply("<p>Xos qiymatlarni hozircha 2×2 va 3×3 matritsalar uchun hisoblayman.</p>");
      const r = MC.polyRoots(cp.map((c) => +c.toFixed(10)));
      const poly = MC.str(MC.fromPoly(cp, "λ".replace("λ", "x"))).replace(/x/g, "λ");
      let vecs = "";
      if (n === 2 && r.roots.length) { const [[a, b], [c, dd]] = A.map((row) => row.map(MC.fv)); vecs = `<p class="small">Xos vektorlar (A − λE)v = 0 dan:</p><ul class="small">${r.roots.map((l) => { const v = Math.abs(b) > 1e-12 ? [b, l - a] : Math.abs(c) > 1e-12 ? [l - dd, c] : (Math.abs(l - a) < 1e-9 ? [1, 0] : [0, 1]); return `<li>λ = ${e(MC.nice(l))}: v = (${e(MC.nice(v[0]))}; ${e(MC.nice(v[1]))})</li>`; }).join("")}</ul>`; }
      const ans = r.roots.length ? r.roots.map((l, i) => `λ${"₁₂₃"[i]} = ${MC.nice(l)}`).join(",  ") : r.complex ? `λ = ${MC.nice(r.complex[0])} ± ${MC.nice(Math.abs(r.complex[1]))}·i` : "—";
      return reply(`<p>Xos qiymatlar xarakteristik tenglamadan topiladi: det(A − λE) = 0</p>${matHtml(A)}${fm(poly + " = 0")}<p><b>Javob:</b></p>${fm(ans)}${vecs}<p class="small muted">Tekshiruv: λ yig'indisi = iz (tr A), ko'paytmasi = det A = ${e(MC.fstr(d))}</p>`, ans, [], "b6");
    }
    const a = A.map((r) => r.map(MC.fstr));
    let how = "";
    if (n === 2) how = steps([`2×2 formula: |a b; c d| = ad − bc`, `${a[0][0]}·${a[1][1]} − (${a[0][1]})·(${a[1][0]}) = <b>${e(MC.fstr(d))}</b>`]);
    else if (n === 3) {
      const mn = (i) => { const sub = A.slice(1).map((r) => r.filter((_, j) => j !== i)); return MC.detF(sub); };
      how = steps(["Birinchi qator bo'yicha yoyamiz: det A = a₁₁M₁₁ − a₁₂M₁₂ + a₁₃M₁₃", ...[0, 1, 2].map((i) => `M₁${i + 1} = ${e(MC.fstr(mn(i)))}`), `det A = ${a[0][0]}·(${e(MC.fstr(mn(0)))}) − (${a[0][1]})·(${e(MC.fstr(mn(1)))}) + (${a[0][2]})·(${e(MC.fstr(mn(2)))}) = <b>${e(MC.fstr(d))}</b>`]);
    } else how = steps(["Gauss usuli: matritsa uchburchak ko'rinishga keltiriladi", "Determinant — diagonal elementlar ko'paytmasi (qator almashtirishlar ishorani o'zgartiradi)"]);
    return reply(`<p>Determinantni hisoblaymiz:</p>${matHtml(A)}${how}<p><b>Javob:</b></p>${fm("det A = " + MC.fstr(d))}${MC.fz(d) ? `<p class="small">det A = 0 — matritsa xos, teskarisi mavjud emas.</p>` : ""}`, "det A = " + MC.fstr(d), [{ label: "Determinantlar testi", cmd: "test:t-matritsa" }], "b2");
  }

  /* ---------------- Kombinatorika va statistika ---------------- */
  const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const Cnk = (n, k) => Math.round(fact(n) / (fact(k) * fact(n - k)));
  function doCombo(text) {
    const t = text.replace(/\s+/g, "");
    let m = t.match(/\bC\(?(\d+)[,;](\d+)\)?/i) || (/kombinatsiya/i.test(U.norm(text)) && text.match(/(\d+)\D+(\d+)/));
    if (m) { const n = +m[1], k = +m[2]; if (k > n || n > 170) return null; const v = Cnk(n, k); return reply(`<p>Kombinatsiyalar soni (tartib muhim emas):</p>${fm(`C${sub(n)}${S.sup(k)} = ${n}! / (${k}!·${n - k}!) = ${v}`)}`, String(v), [], "c1"); }
    m = t.match(/\bA\(?(\d+)[,;](\d+)\)?/i) || (/orinlashtirish/i.test(U.norm(text)) && text.match(/(\d+)\D+(\d+)/));
    if (m) { const n = +m[1], k = +m[2]; if (k > n || n > 170) return null; const v = Math.round(fact(n) / fact(n - k)); return reply(`<p>O'rinlashtirishlar soni (tartib muhim):</p>${fm(`A${sub(n)}${S.sup(k)} = ${n}! / ${n - k}! = ${v}`)}`, String(v), [], "c1"); }
    m = text.match(/(\d+)\s*!/) || text.match(/\bP\((\d+)\)/i);
    if (m) { const n = +m[1]; if (n > 170) return null; const v = fact(n); return reply(`<p>Faktorial (o'rin almashtirishlar soni):</p>${fm(`${n}! = ${n <= 12 ? Array.from({ length: n }, (_, i) => i + 1).join("·") + " = " : ""}${v.toLocaleString("en-US").replace(/,/g, " ")}`)}`, String(v), [], "c1"); }
    return null;
  }
  const sub = (n) => String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
  function doStats(text) {
    const nums = (text.replace(/[−–]/g, "-").match(/-?\d+(?:[.,]\d+)?/g) || []).map((x) => +x.replace(",", "."));
    if (nums.length < 3) return null;
    const n = nums.length, sorted = nums.slice().sort((a, b) => a - b), mean = nums.reduce((a, b) => a + b, 0) / n;
    const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const cnt = {}; nums.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const mx = Math.max(...Object.values(cnt)); const mode = mx > 1 ? Object.keys(cnt).filter((k) => cnt[k] === mx).join(", ") : "yo'q";
    const ss = nums.reduce((a, x) => a + (x - mean) ** 2, 0), vp = ss / n, vs = ss / (n - 1);
    const r = (x) => +x.toFixed(4);
    return reply(`<p>Tavsifiy statistika (n = ${n}):</p>
      <table><tr><td>Tartiblangan qator</td><td>${e(sorted.join(", "))}</td></tr><tr><td>O'rtacha x̄</td><td>${r(mean)}</td></tr><tr><td>Median</td><td>${r(med)}</td></tr><tr><td>Moda</td><td>${e(mode)}</td></tr>
      <tr><td>Qulach (max − min)</td><td>${r(sorted[n - 1] - sorted[0])}</td></tr><tr><td>Dispersiya (bosh to'plam, /n)</td><td>${r(vp)}</td></tr><tr><td>Tanlanma dispersiya (/n−1)</td><td>${r(vs)}</td></tr><tr><td>Standart chetlanish s</td><td>${r(Math.sqrt(vs))}</td></tr></table>
      <p class="small muted">x̄ = ∑xᵢ/n = ${r(nums.reduce((a, b) => a + b, 0))}/${n};  s² = ∑(xᵢ − x̄)²/(n − 1)</p>`, `x̄ = ${r(mean)}, median = ${r(med)}, s = ${r(Math.sqrt(vs))}`, [{ label: "Statistika testi", cmd: "test:t-regressiya" }], "d1");
  }

  /* ---------------- Bilimlar bazasi ---------------- */
  function findTopic(text) {
    const t = U.norm(text);
    let best = null, bs = 0;
    DATA.TOPICS.forEach((tp) => {
      let sc = 0; tp.kw.forEach((k) => { if (t.includes(U.norm(k))) sc += k.includes(" ") ? 3 : 2; });
      if (t.includes(U.norm(tp.name))) sc += 4;
      if (sc > bs) { bs = sc; best = tp; }
    });
    return bs >= 2 ? best : null;
  }
  function doTheory(text) {
    const tp = findTopic(text); if (!tp) return null;
    const s = DATA.SUBJECTS.find((x) => x.id === tp.s);
    const html = `<p><b>${e(tp.name)}</b> <span class="muted small">· ${e(s.name)}</span></p><p>${e(tp.theory)}</p>${tp.formulas.map(fm).join("")}<p><b>Misol:</b> ${e(tp.example)}</p>`;
    return reply(html, tp.theory, [{ label: "Mavzuni ochish", href: `#/fan/${tp.s}/${tp.id}` }, { label: "Mashq berish", cmd: "ask:" + tp.name + " bo'yicha mashq ber" }], tp.id);
  }
  function doSubject(text) {
    const t = U.norm(text); const s = DATA.SUBJECTS.find((x) => t.includes(U.norm(x.name)) || t.includes(U.norm(x.name.split(" ").pop())));
    if (!s) return null; const ts = DATA.TOPICS.filter((x) => x.s === s.id);
    return reply(`<p><b>${e(s.name)}</b> — ${e(s.desc)}</p><p>Asosiy mavzular va tushunchalar:</p><ol>${ts.map((x) => `<li><b>${e(x.name)}</b> — <span class="small">${e(x.theory.split(". ")[0])}.</span></li>`).join("")}</ol><p class="small muted">Istalgan mavzu haqida batafsil so'rang yoki «${e(s.name)} bo'yicha mashq ber» deb yozing.</p>`,
      s.desc, [{ label: "Fanni ochish", href: `#/fan/${s.id}` }]);
  }
  function doPractice(text) {
    const tp = findTopic(text); const u = Store.current();
    let tids = tp ? [tp.id] : u ? S.recommendations(u.id, 3).map((m) => m.tid) : ["a3", "b2", "c1"];
    const qs = [];
    tids.forEach((tid) => { if (S.GEN[tid]) qs.push(S.GEN[tid](Math.random), S.GEN[tid](Math.random)); DATA.QUESTIONS.filter((q) => q.t === tid).slice(0, 2).forEach((q) => qs.push(q)); });
    const pick = S.shuffle(qs).slice(0, 3);
    if (!pick.length) return null;
    const html = `<p>${tp ? `«${e(tp.name)}» mavzusi bo'yicha` : "Zaif mavzularingiz bo'yicha"} 3 ta mashq. Avval o'zingiz yeching, keyin javobni oching:</p>
      <ol>${pick.map((q) => `<li><b>${e(q.q)}</b><div class="small muted">${q.o.map((o, i) => `${"ABCD"[i]}) ${e(o)}`).join("   ")}</div><details class="small"><summary>Javobni ko'rish</summary>${"ABCD"[q.a]}) ${e(q.o[q.a])} — ${e(q.e)}</details></li>`).join("")}</ol>`;
    return reply(html, "Mashqlar", [{ label: "To'liq moslashuvchan test", cmd: "test:adaptive" }], tp ? tp.id : null);
  }
  function doRecommend() {
    const u = Store.current(); if (!u || u.role !== "student") return reply("<p>Shaxsiy tavsiyalar talaba hisobida ishlaydi.</p>");
    const rec = S.recommendations(u.id, 4);
    const html = `<p>Test natijalaringiz va unutish egri chizig'i (Ebbinghaus) asosida hozir quyidagilarni takrorlash foydali:</p>
      <ol>${rec.map((m) => `<li><b>${e(m.topic.name)}</b> <span class="badge ${S.LEVELS[m.level].cls}">${S.LEVELS[m.level].label}</span><div class="small muted">${e(m.reason)}</div></li>`).join("")}</ol>`;
    return reply(html, "Tavsiyalar", [{ label: "Moslashuvchan test", cmd: "test:adaptive" }, { label: "Bilim xaritasi", href: "#/progress" }]);
  }
  const CODE = {
    b2: "import numpy as np\nA = np.array([[1, 2], [3, 4]])\nprint(np.linalg.det(A))   # -2.0",
    b3: "import numpy as np\nA = np.array([[4, 7], [2, 6]])\nprint(np.linalg.inv(A))",
    b4: "import numpy as np\nA = np.array([[1, 1], [1, -1]])\nb = np.array([5, 1])\nprint(np.linalg.solve(A, b))   # [3. 2.]",
    b6: "import numpy as np\nA = np.array([[2, 1], [1, 2]])\nvals, vecs = np.linalg.eig(A)\nprint(vals)   # [3. 1.]",
    a3: "import sympy as sp\nx = sp.symbols('x')\nf = x**3 - 3*x\nprint(sp.diff(f, x))   # 3*x**2 - 3",
    a5: "import sympy as sp\nx = sp.symbols('x')\nprint(sp.integrate(x * sp.exp(x), x))   # (x - 1)*exp(x)",
    a6: "from scipy.integrate import quad\nimport numpy as np\nprint(quad(np.sin, 0, np.pi))   # (2.0, ...)",
    a2: "import sympy as sp\nx = sp.symbols('x')\nprint(sp.limit(sp.sin(x)/x, x, 0))   # 1",
    c1: "from math import comb, perm, factorial\nprint(comb(5, 2), perm(5, 2), factorial(4))   # 10 20 24",
    d1: "import statistics as st\ndata = [2, 4, 4, 4, 5, 5, 7, 9]\nprint(st.mean(data), st.median(data), st.stdev(data))",
    d4: "import numpy as np\nx = np.array([1, 2, 3, 4]); y = np.array([3, 5, 7, 9])\nb, a = np.polyfit(x, y, 1)\nprint(f'y = {a:.2f} + {b:.2f}x', np.corrcoef(x, y)[0, 1])",
    c5: "from scipy.stats import binom, norm\nprint(binom.pmf(2, 3, 0.5))   # 0.375\nprint(norm.cdf(1) - norm.cdf(-1))   # 0.6827",
  };
  function doCode(text) {
    const tp = findTopic(text) || { id: /determinant/.test(U.norm(text)) ? "b2" : "a3", name: "" };
    const code = CODE[tp.id] || CODE[{ analiz: "a3", algebra: "b2", ehtimol: "c1", statistika: "d1" }[tp.s]] || CODE.a3;
    return reply(`<p>Python'da shunday hisoblanadi${tp.name ? ` («${e(tp.name)}»)` : ""}:</p><pre class="formula" style="font-family:ui-monospace,Consolas,monospace;font-size:13px;white-space:pre">${e(code)}</pre><p class="small muted">sympy — simvolli hisoblash, numpy — sonli hisoblash kutubxonalari.</p>`, code, [], tp.id);
  }
  function doArith(text) {
    const s = text.replace(/[=?]+\s*$/, "").replace(/^\s*(hisobla\w*|hisob)\s*/i, "");
    if (!/^[\d\s+\-*/^().,√πe²³sincotaglqrxp]+$/i.test(s) || /[xyz]/i.test(s.replace(/exp|sqrt/gi, ""))) return null;
    const ex = tryParse(s); if (!ex || MC.vars(ex).size) return null;
    const v = MC.evaluate(ex); if (!isFinite(v)) return null;
    return reply(`${fm(`${MC.str(ex)} = ${MC.nice(v)}`)}${MC.nice(v) !== String(+v.toPrecision(10)) ? `<p class="small muted">≈ ${+v.toPrecision(10)}</p>` : ""}`, MC.nice(v));
  }

  const HELP = `<p>Men PM Edu AI yordamchiman — internet talab qilmaydigan matematik hisoblash yadrosi bilan ishlayman. Masalan, shunday yozing:</p>
    <ul><li><b>Hosila:</b> x^3*sin(x) hosilasi · z = x^2*y + sin(y) xususiy hosila</li><li><b>Integral:</b> integral x*e^x · integral sin(x) 0 dan pi gacha</li><li><b>Limit:</b> limit sin(x)/x, x->0</li>
    <li><b>Tenglama:</b> x^2 - 5x + 6 = 0 · sistema: 2x + y = 5; x - y = 1</li><li><b>Matritsa:</b> determinant [[1,2],[3,4]] · teskari [[2,1],[1,1]] · xos qiymat [[2,1],[1,2]]</li>
    <li><b>Kombinatorika / statistika:</b> C(10,3) · statistika 2, 4, 4, 5, 7</li><li><b>Nazariya:</b> Bayes formulasi nima? · Mashq ber · Nimani takrorlashim kerak?</li></ul>`;

  function answer(text) {
    const raw = String(text || "").trim(); if (!raw) return reply(HELP, "Yordam");
    const t = U.norm(raw);
    try {
      if (has(t, ["salom", "assalom", "hello", "privet"]) && raw.length < 25) return reply(`<p>Salom! Qanday yordam bera olaman?</p>${HELP}`);
      if (has(t, ["nima qila olasan", "yordam", "imkoniyat", "help"]) && raw.length < 40) return reply(HELP);
      if (has(t, ["takrorla", "zaif", "tavsiya", "qaysi mavzu", "nimani oqi", "nima oqi"])) return doRecommend();
      if (has(t, ["mashq", "misol ber", "savol ber", "masala ber", "test savollari"])) return doPractice(raw) || doRecommend();
      if (has(t, ["python", "kod", "numpy", "sympy"])) return doCode(raw);
      if (/\[|\|[^|]*;/.test(raw) && (parseMatrices(raw).length)) { const r = doMatrix(raw); if (r) return r; }
      if ((raw.match(/=/g) || []).length >= 2) { const r = doSystem(raw); if (r) return r; }
      if (/\blim|limit/.test(t) || /->|→/.test(raw)) { const r = doLimit(raw); if (r) return r; }
      if (/integral|∫|boshlangich/.test(t)) { const r = doIntegral(raw); if (r) return r; }
      if (/hosila|derivativ|differensial|diff\b|d\/dx|∂|′/.test(t + raw)) { const r = doDerivative(raw); if (r) return r; }
      if ((raw.match(/=/g) || []).length === 1 && /[xyzt]/.test(raw)) { const r = doEquation(raw); if (r) return r; }
      { const r = doCombo(raw); if (r) return r; }
      if (has(t, ["ortacha", "median", "moda", "dispersiya", "statistika", "standart chetlanish", "tavsifiy"])) { const r = doStats(raw); if (r) return r; }
      { const r = doArith(raw); if (r) return r; }
      if (/nima\b|asosiy|haqida|tushuncha/.test(t) && DATA.SUBJECTS.some((x) => t.includes(U.norm(x.name)))) { const r = doSubject(raw); if (r) return r; }
      { const r = doTheory(raw); if (r) return r; }
      { const r = doSubject(raw); if (r) return r; }
    } catch (err) { return reply(`<p>Ifodani tushunishda xatolik: ${e(err.message)}. Iltimos, ko'rinishini tekshiring, masalan: <i>x^2*sin(x) hosilasi</i>.</p>`); }
    return reply(`<p>Savolingizni to'liq tushunmadim. ${HELP}</p>`, "Yordam");
  }
  const QUICK = ["Integral nima?", "Determinant qanday hisoblanadi?", "Chiziqli algebra asosiy tushunchalari", "Ehtimollar nazariyasida P(A) nima?", "Matematik statistika nima?"];
  return { answer, QUICK, extractExpr, findTopic };
})();

/* ===== views_a.js — komponentlar, illyustratsiyalar, kirish/ro'yxatdan o'tish, bosh sahifa, fanlar ===== */
"use strict";
const A = {};          // data-act="..." bosilganda chaqiriladigan amallar
const V = {};          // sahifalar: V.name() → HTML
const AFTER = {};      // sahifa chizilgandan keyingi ishlar
const e = U.esc, I = U.I;
/* Server rejimida amallar API orqali, oflayn rejimda shu brauzerda bajariladi */
const SERVER = typeof API !== "undefined";
const LOCAL = {
  toggleLearned: (t) => S.toggleLearned(t), beginAssign: () => true, submitTest: (s) => S.submitTest(s),
  addGoal: (o) => S.addGoal(o), removeGoal: (id) => S.removeGoal(id), addEvent: (o) => S.addEvent(o), toggleEvent: (id) => S.toggleEvent(id), removeEvent: (id) => S.removeEvent(id),
  readAll: () => S.readAll(Store.current().id), saveChat: (c, q) => { S.saveChat(c); if (q) S.log(Store.current().id, "ai", "AI yordamchi – savol", q.slice(0, 40)); return true; }, deleteChat: (id) => S.deleteChat(id),
  suggestBook: (o) => S.suggestBook(o), updateProfile: (o) => S.updateProfile(o), changePassword: (o) => Store.changePassword(o.old, o.new),
  createAssignment: (o) => S.createAssignment(o), deleteAssignment: (id) => S.deleteAssignment(id), setBlocked: (id, v) => S.setBlocked(id, v), setRole: (id, r) => S.setRole(id, r),
  addBook: (o) => S.addBook(o), removeBook: (id) => S.removeBook(id), resolveSuggestion: (id, v) => S.resolveSuggestion(id, v), resetAll: () => Store.reset(),
  resetPassword: () => { throw new Error("Bu amal faqat server versiyasida mavjud."); },
};
const ACT = (fn, ...args) => (SERVER ? API.call(fn, args) : new Promise((ok) => ok(LOCAL[fn](...args))));
const fail = (err) => C.toast(err.message, "bad");

/* ---------------- Komponentlar ---------------- */
const C = {
  ring(p, size = 130, w = 12, sub = "") {
    const r = (size - w) / 2, c = 2 * Math.PI * r, off = c * (1 - U.clamp(p, 0, 100) / 100);
    return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><defs><linearGradient id="rg${size}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B4CF0"/><stop offset="1" stop-color="#9D8CFF"/></linearGradient></defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--soft)" stroke-width="${w}" fill="none"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="url(#rg${size})" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>
      <div class="v"><b style="font-size:${size > 110 ? 28 : size > 70 ? 18 : 13}px">${Math.round(p)}%</b>${sub ? `<span class="small muted">${sub}</span>` : ""}</div></div>`;
  },
  bar: (p, cls = "") => `<div class="bar ${cls}"><i style="width:${U.clamp(p, 0, 100)}%"></i></div>`,
  subjIcon(sid, cls = "") {
    const tone = (S.subj(sid) || {}).tone || "";
    const inner = {
      analiz: '<span class="mathic" style="font-size:1.25em">∫</span>',
      algebra: '<svg class="i" viewBox="0 0 24 24"><path d="M7 4H4v16h3M17 4h3v16h-3"/><text x="12" y="11" text-anchor="middle" font-size="6" fill="currentColor" stroke="none" font-weight="800">1 0</text><text x="12" y="18" text-anchor="middle" font-size="6" fill="currentColor" stroke="none" font-weight="800">0 1</text></svg>',
      ehtimol: '<svg class="i" viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/><circle cx="12" cy="7" r=".9" fill="currentColor"/><circle cx="7" cy="13" r=".9" fill="currentColor"/><circle cx="17" cy="15" r=".9" fill="currentColor"/></svg>',
      statistika: I("chart"), dastur: '<svg class="i" viewBox="0 0 24 24"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>',
      diftenglama: '<span class="mathic" style="font-size:.95em">y′</span>',
      diskret: '<svg class="i" viewBox="0 0 24 24"><circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="19" r="2.2"/><path d="M7 6h10M6 8l5 9M18 8l-5 9"/></svg>',
    }[sid] || I("book");
    return `<div class="ic-box ${tone} ${cls}">${inner}</div>`;
  },
  cover(b) {
    return `<div class="cover" style="background:linear-gradient(150deg,${b.cover[0]},${b.cover[1]})"><b>${e(b.title)}</b>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M0 50 Q25 10 50 30 T100 8" stroke="#fff" stroke-width="1.2" fill="none"/><path d="M0 58 L20 40 L40 46 L60 24 L80 30 L100 14" stroke="#fff" stroke-width=".7" fill="none" opacity=".7"/><g stroke="#fff" stroke-width=".3" opacity=".5">${[10, 30, 50, 70, 90].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="60"/>`).join("")}${[15, 30, 45].map((y) => `<line x1="0" y1="${y}" x2="100" y2="${y}"/>`).join("")}</g></svg>
      <small>${e(b.author)}</small></div>`;
  },
  ask(text, yes, label = "Ha, davom etish") { const ov = C.modal(`<h2>Tasdiqlang</h2><p class="mt-s">${e(text)}</p><div class="row mt" style="justify-content:flex-end"><button class="btn ghost" data-act="closeModal">Bekor qilish</button><button class="btn" id="askYes">${e(label)}</button></div>`); ov.querySelector("#askYes").onclick = () => { ov.remove(); yes(); }; },
  empty: (t, ic = "info") => `<div class="empty">${I(ic, "lg")}<div class="mt-s">${t}</div></div>`,
  levelBadge: (m) => `<span class="badge ${S.LEVELS[m.level].cls}">${S.LEVELS[m.level].label}</span>`,
  grade: (p) => (p >= 86 ? 5 : p >= 71 ? 4 : p >= 56 ? 3 : 2),
  gradeBadge: (p) => (p >= 86 ? '<span class="badge g">A\'lo</span>' : p >= 71 ? '<span class="badge g">Yaxshi</span>' : p >= 56 ? '<span class="badge o">Qoniqarli</span>' : '<span class="badge r">Qoniqarsiz</span>'),
  levelTag: (l) => `<span class="badge ${l === "Oson" ? "g" : l === "Qiyin" ? "r" : "o"}">${e(l)}</span>`,
  quote(i) { const q = DATA.QUOTES[i % DATA.QUOTES.length]; return `<div class="side-card">${e(q[0])}<div class="muted small mt-s">— ${e(q[1])}</div>${ART.cap(120)}</div>`; },
  modal(html, wide) { const ov = document.createElement("div"); ov.className = "ov"; ov.innerHTML = `<div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true"><button class="circ x" data-act="closeModal" aria-label="Yopish">${I("x", "sm")}</button>${html}</div>`; document.body.appendChild(ov); ov.addEventListener("mousedown", (ev) => { if (ev.target === ov) ov.remove(); }); const f = ov.querySelector("input,select,textarea"); if (f) setTimeout(() => f.focus(), 50); return ov; },
  toast(t, cls = "") { let box = U.$(".toasts"); if (!box) { box = document.createElement("div"); box.className = "toasts"; document.body.appendChild(box); } const d = document.createElement("div"); d.className = "toast " + cls; d.textContent = t; box.appendChild(d); setTimeout(() => d.remove(), 3800); },
  download(name, text, type = "text/plain;charset=utf-8") {
    const ov = C.modal(`<h2>${I("file")} ${e(name)}</h2><p class="small muted mt-s">Faylni yuklab oling yoki matnni nusxalang.</p><textarea class="in mt-s" id="dlTxt" readonly style="min-height:260px;font-family:ui-monospace,Consolas,monospace;font-size:12px">${e(text)}</textarea><div class="row wrap mt"><button class="btn" id="dlGo">${I("dl", "sm")} Yuklab olish</button><button class="btn ghost" id="dlCp">${I("copy", "sm")} Nusxa olish</button></div>`, true);
    ov.querySelector("#dlGo").onclick = () => { try { const b = new Blob([text], { type }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); } catch (err) { C.toast("Yuklab olish bloklandi — matnni nusxalang.", "bad"); } };
    ov.querySelector("#dlCp").onclick = () => { const ta = ov.querySelector("#dlTxt"); const done = () => C.toast("Nusxa olindi.", "ok"); (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(done, () => { ta.select(); try { document.execCommand("copy"); done(); } catch (err) { C.toast("Matnni belgilab, Ctrl+C bosing."); } }); };
  },
  calendar(y, m, sel, evDays, act = "calPick") {
    const first = new Date(y, m, 1), start = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), today = U.dayKey();
    let h = U.HAFTA.map((d) => `<div class="h">${d}</div>`).join("") + "<div></div>".repeat(start);
    for (let d = 1; d <= days; d++) { const k = `${y}-${U.pad(m + 1)}-${U.pad(d)}`; h += `<button class="${k === today ? "td" : ""} ${k === sel ? "sel" : ""} ${evDays.has(k) ? "ev" : ""}" data-act="${act}" data-id="${k}">${d}</button>`; }
    return `<div class="cal">${h}</div>`;
  },
  lineChart(pts, h = 220) {
    const W = 640, H = h, pl = 40, pr = 16, pt = 18, pb = 30, n = pts.length;
    const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, n - 1), y = (v) => pt + (1 - v / 100) * (H - pt - pb);
    const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
    const area = path + ` L${x(n - 1)} ${H - pb} L${x(0)} ${H - pb} Z`;
    const step = Math.ceil(n / 8), last = pts[n - 1];
    return `<div class="chartwrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="O'sish dinamikasi grafigi"><defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7B61FF" stop-opacity=".28"/><stop offset="1" stop-color="#7B61FF" stop-opacity="0"/></linearGradient></defs>
      ${[0, 25, 50, 75, 100].map((v) => `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`).join("")}
      <path d="${area}" fill="url(#lg1)"/><path d="${path}" fill="none" stroke="#5B4CF0" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="4" fill="var(--card)" stroke="#5B4CF0" stroke-width="2"><title>${p.label}: ${p.v}% (${p.n} test)</title></circle>${i % step === 0 || i === n - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${p.label}</text>` : ""}`).join("")}
      <g transform="translate(${x(n - 1) - 22},${y(last.v) - 32})"><rect width="44" height="22" rx="7" fill="#5B4CF0"/><text x="22" y="15" text-anchor="middle" style="fill:#fff;font-weight:800;font-size:11px">${last.v}%</text></g></svg></div>`;
  },
};

/* ---------------- Illyustratsiyalar (inline SVG) ---------------- */
const ART = {
  defs: `<defs><linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B61FF"/><stop offset="1" stop-color="#4A3AE0"/></linearGradient><linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDEAFF"/><stop offset="1" stop-color="#C9C1FF"/></linearGradient><linearGradient id="gs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E2A8C"/><stop offset="1" stop-color="#4B3FD8"/></linearGradient></defs>`,
  plant: (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M0 0c-4-22-26-30-30-50 18 4 30 22 30 50zM0 0c2-26 18-40 36-46-2 20-18 36-36 46zM0 0c-2-18 4-44 14-58 6 18 2 40-14 58z" fill="#A99BFF" opacity=".9"/><rect x="-12" y="0" width="24" height="18" rx="4" fill="#8B7BFF"/></g>`,
  laptop(w = 330) {
    return `<svg viewBox="0 0 340 210" width="${w}" aria-hidden="true">${ART.defs}${ART.plant(300, 150, .9)}
      <rect x="40" y="150" width="210" height="16" rx="4" fill="#B7ADFF"/><rect x="48" y="138" width="190" height="14" rx="3" fill="#D6D0FF"/><rect x="56" y="126" width="170" height="14" rx="3" fill="#9D8CFF"/>
      <g transform="translate(95,18)"><rect width="170" height="112" rx="10" fill="url(#gs)"/><rect x="8" y="8" width="154" height="96" rx="6" fill="#3B34B5"/>
      <g stroke="#C9C1FF" stroke-width=".6" opacity=".6">${[30, 60, 90, 120].map((x) => `<line x1="${x}" y1="14" x2="${x}" y2="98"/>`).join("")}${[34, 58, 82].map((y) => `<line x1="14" y1="${y}" x2="156" y2="${y}"/>`).join("")}</g>
      <path d="M16 88 Q50 20 80 60 T150 26" stroke="#fff" stroke-width="2" fill="none"/><path d="M16 70 L50 76 L84 40 L118 52 L150 30" stroke="#9D8CFF" stroke-width="1.5" fill="none"/></g>
      <path d="M78 130h204l18 14H60z" fill="#6F63E8"/><rect x="60" y="143" width="240" height="6" rx="3" fill="#5140D9"/>
      <g transform="translate(250,112) rotate(-12)"><rect width="56" height="74" rx="9" fill="url(#gs)"/><rect x="7" y="7" width="42" height="15" rx="3" fill="#9D8CFF"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${8 + c * 14}" y="${28 + r * 11}" width="10" height="7" rx="2" fill="${c === 2 && r === 3 ? "#9D8CFF" : "#fff"}" opacity=".9"/>`).join("")).join("")}</g>
      <g transform="translate(62,40)"><rect width="34" height="34" rx="9" fill="#fff" opacity=".95"/><text x="17" y="24" text-anchor="middle" font-size="19" font-family="Cambria Math,serif" font-style="italic" font-weight="700" fill="#5B4CF0">π</text></g></svg>`;
  },
  robot(w = 190) {
    return `<svg viewBox="0 0 200 220" width="${w}" aria-hidden="true">${ART.defs}<ellipse cx="100" cy="208" rx="60" ry="8" fill="#5B4CF0" opacity=".12"/>
      <line x1="100" y1="30" x2="100" y2="14" stroke="#8B7BFF" stroke-width="4"/><circle cx="100" cy="11" r="7" fill="#7B61FF"/>
      <rect x="40" y="30" width="120" height="92" rx="36" fill="url(#gl)" stroke="#fff" stroke-width="3"/><rect x="54" y="46" width="92" height="60" rx="26" fill="#2A2380"/>
      <ellipse cx="80" cy="74" rx="9" ry="11" fill="#8FE3FF"/><ellipse cx="120" cy="74" rx="9" ry="11" fill="#8FE3FF"/><path d="M84 92q16 10 32 0" stroke="#8FE3FF" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="30" y="64" width="12" height="26" rx="6" fill="#9D8CFF"/><rect x="158" y="64" width="12" height="26" rx="6" fill="#9D8CFF"/>
      <rect x="62" y="124" width="76" height="66" rx="26" fill="url(#gl)" stroke="#fff" stroke-width="3"/><text x="100" y="168" text-anchor="middle" font-size="26" font-family="Cambria Math,serif" font-style="italic" font-weight="700" fill="#5B4CF0">π</text>
      <path d="M62 140q-24 4-30-18" stroke="#C9C1FF" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M138 140q22 10 26 30" stroke="#C9C1FF" stroke-width="12" fill="none" stroke-linecap="round"/></svg>`;
  },
  books(w = 300) {
    const cols = ["#4B3FD8", "#7B61FF", "#5B4CF0", "#9D8CFF", "#3F37C9", "#6D5CF5", "#B7ADFF"];
    return `<svg viewBox="0 0 320 200" width="${w}" aria-hidden="true">${ART.defs}${ART.plant(40, 150, .8)}
      ${cols.map((c, i) => `<rect x="${110 + i * 25}" y="${30 + (i % 3) * 8}" width="22" height="${130 - (i % 3) * 8}" rx="3" fill="${c}"/><rect x="${113 + i * 25}" y="${48 + (i % 3) * 8}" width="16" height="3" rx="1.5" fill="#fff" opacity=".6"/>`).join("")}
      <rect x="96" y="160" width="210" height="10" rx="4" fill="#C9C1FF"/><path d="M60 178q55-24 110 0q55-24 110 0v10q-55-20-110 0q-55-20-110 0z" fill="#fff" stroke="#C9C1FF" stroke-width="2"/>
      <g stroke="#C9C1FF" stroke-width="1.2">${[0, 1, 2].map((i) => `<path d="M${76 + i * 0} ${176 - i * 6 - 4}q40-14 80 0"/><path d="M${184} ${176 - i * 6 - 4}q40-14 80 0"/>`).join("")}</g>
      <g transform="translate(262,120)"><rect width="30" height="30" rx="8" fill="#fff"/><path d="M8 10h14M8 16h14M8 22h8" stroke="#9D8CFF" stroke-width="2"/></g></svg>`;
  },
  test(w = 300) {
    return `<svg viewBox="0 0 320 200" width="${w}" aria-hidden="true">${ART.defs}${ART.plant(292, 165, .7)}
      <g transform="translate(96,22)"><rect width="160" height="106" rx="10" fill="url(#gs)"/><rect x="8" y="8" width="144" height="90" rx="6" fill="#EDEAFF"/>
      ${[0, 1, 2].map((i) => `<rect x="22" y="${22 + i * 24}" width="12" height="12" rx="3" fill="#7B61FF"/><path d="M25 ${28 + i * 24}l3 3 5-6" stroke="#fff" stroke-width="2" fill="none"/><rect x="42" y="${24 + i * 24}" width="${88 - i * 14}" height="8" rx="4" fill="#C9C1FF"/>`).join("")}</g>
      <path d="M80 128h192l16 14H64z" fill="#6F63E8"/><rect x="64" y="141" width="224" height="6" rx="3" fill="#5140D9"/>
      <g transform="translate(34,110)"><circle cx="34" cy="34" r="34" fill="url(#gp)"/><circle cx="34" cy="34" r="26" fill="#fff"/><path d="M34 18v17l10 6" stroke="#5B4CF0" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(248,70)"><rect width="56" height="76" rx="8" fill="#fff" stroke="#C9C1FF" stroke-width="2"/><rect x="16" y="-6" width="24" height="12" rx="4" fill="#7B61FF"/>${[0, 1, 2].map((i) => `<path d="M10 ${22 + i * 16}l4 4 7-8" stroke="#1FAE7A" stroke-width="2.5" fill="none"/><rect x="26" y="${20 + i * 16}" width="22" height="5" rx="2.5" fill="#C9C1FF"/>`).join("")}</g>
      <text x="70" y="40" font-size="30" font-family="Cambria Math,serif" font-style="italic" font-weight="700" fill="#7B61FF" opacity=".8">π</text><text x="282" y="42" font-size="26" font-family="Cambria Math,serif" font-weight="700" fill="#9D8CFF">Σ</text></svg>`;
  },
  growth(w = 300) {
    return `<svg viewBox="0 0 320 200" width="${w}" aria-hidden="true">${ART.defs}
      ${[40, 62, 84, 108].map((h, i) => `<rect x="${60 + i * 42}" y="${150 - h}" width="30" height="${h}" rx="6" fill="url(#gp)" opacity="${0.55 + i * 0.15}"/>`).join("")}
      <path d="M52 120 L110 96 L150 104 L206 52 L236 30" stroke="#4A3AE0" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M222 24l20 2-4 20z" fill="#4A3AE0"/>
      <g transform="translate(240,78)"><circle cx="34" cy="34" r="34" fill="#fff" stroke="#C9C1FF" stroke-width="3"/><circle cx="34" cy="34" r="22" fill="none" stroke="#7B61FF" stroke-width="6"/><circle cx="34" cy="34" r="8" fill="#5B4CF0"/><path d="M34 34l30-30" stroke="#2E2A8C" stroke-width="4"/></g>
      <g transform="translate(96,150)"><rect width="150" height="32" rx="10" fill="url(#gp)"/><text x="75" y="21" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">Progress = Natija</text></g></svg>`;
  },
  cap(w = 120) {
    return `<svg viewBox="0 0 140 100" width="${w}" style="display:block;margin:10px 0 0 auto" aria-hidden="true">${ART.defs}${ART.plant(118, 78, .45)}
      <rect x="20" y="70" width="80" height="12" rx="3" fill="#9D8CFF"/><rect x="26" y="58" width="72" height="12" rx="3" fill="#C9C1FF"/><rect x="22" y="46" width="76" height="12" rx="3" fill="#7B61FF"/>
      <path d="M60 10l38 16-38 16-38-16z" fill="url(#gs)"/><path d="M40 34v10c0 5 40 5 40 0V34" fill="#3F37C9"/><path d="M96 27v16" stroke="#9D8CFF" stroke-width="2"/><circle cx="96" cy="45" r="3" fill="#9D8CFF"/></svg>`;
  },
  target(w = 100) { return `<svg viewBox="0 0 120 100" width="${w}" style="display:block;margin:10px auto 0" aria-hidden="true">${ART.defs}${ART.plant(96, 84, .4)}<circle cx="54" cy="52" r="36" fill="#fff" stroke="#C9C1FF" stroke-width="3"/><circle cx="54" cy="52" r="24" fill="none" stroke="#7B61FF" stroke-width="7"/><circle cx="54" cy="52" r="9" fill="#5B4CF0"/><path d="M54 52l36-36" stroke="#2E2A8C" stroke-width="4"/><path d="M84 12l10-2-2 10z" fill="#2E2A8C"/></svg>`; },
  stairs(w = 110) { return `<svg viewBox="0 0 130 100" width="${w}" style="display:block;margin:10px 0 0 auto" aria-hidden="true">${ART.defs}${[0, 1, 2, 3].map((i) => `<rect x="${10 + i * 26}" y="${76 - i * 16}" width="26" height="${16 + i * 16}" fill="url(#gp)" opacity="${0.5 + i * 0.15}"/>`).join("")}<path d="M16 60l30-14 26 6 38-34" stroke="#2E2A8C" stroke-width="4" fill="none"/><path d="M100 14l12-2-2 12z" fill="#2E2A8C"/></svg>`; },
};
const LOGO = () => `<img class="mark" src="${window.PM_MARK || ""}" alt="PM Edu">`;
const logoBlock = () => `<div class="logo" data-go="#/">${LOGO()}<div><b>PM <span>Edu</span></b><small>Amaliy matematika</small></div></div>`;

/* =============== AUTENTIFIKATSIYA =============== */
const REG = { step: 1, d: { course: 2, uni: DATA.UNIVERSITIES[0], faculty: DATA.FACULTIES[0], year: "2025 - 2026" } };
function authWrap(inner) {
  return `<div class="auth"><div class="auth-art">${logoBlock()}<h1>Amaliy matematika bilimingizni keyingi <span>bosqichga olib chiqing!</span></h1>
    <p>PM Edu — amaliy matematika talabalari uchun zamonaviy ta'lim platformasi. Fanlar, testlar, AI yordamchi va shaxsiy progress bir joyda.</p>
    <div class="art">${ART.laptop(440)}</div>
    <div class="feat4">${[["book", "Fanlar"], ["test", "Testlar"], ["bot", "AI yordamchi"], ["trend", "Progress"]].map(([i, t]) => `<div>${`<div class="ic-box">${I(i)}</div>`}${t}</div>`).join("")}</div></div>
    <div class="auth-box"><div class="auth-card">${inner}</div></div></div>`;
}
V.welcome = () => authWrap(`<div class="row between">${logoBlock()}<span class="small muted row">${I("user", "sm")} O'zbekcha</span></div>
  <h2>Xush kelibsiz!</h2><p class="muted">Amaliy matematika bo'yicha fanlar, testlar va AI yordamchi — bitta platformada.</p>
  <div class="feat4 mt">${[["book", "Fanlar"], ["test", "Testlar"], ["bot", "AI yordamchi"], ["trend", "Progress"]].map(([i, t]) => `<div><div class="ic-box">${I(i)}</div>${t}</div>`).join("")}</div>
  <button class="btn block mt" data-act="google">${I("google")} Google orqali davom etish</button>
  <button class="btn ghost block mt-s" data-go="#/register">${I("mail")} Email orqali davom etish</button>
  <p class="center mt small muted">Hisobingiz bormi? <a data-go="#/login" href="#/login" class="b">Kirish</a></p>`);

V.login = () => authWrap(`${logoBlock()}<h2>Kirish</h2><p class="muted">Hisobingizga kirish uchun ma'lumotlaringizni kiriting.</p>
  <div class="tabs mt"><button class="on">Email orqali</button><button data-act="google">Google orqali</button></div>
  <form id="loginForm" autocomplete="on" novalidate>
    <div class="field"><label for="lEmail">Email manzilingiz</label><div class="inp">${I("mail")}<input class="in" id="lEmail" type="email" placeholder="example@gmail.com" autocomplete="username" required></div></div>
    <div class="field"><label for="lPass">Parol</label><div class="inp">${I("lock")}<input class="in" id="lPass" type="password" placeholder="Parol" autocomplete="current-password" required><button type="button" class="eye" data-act="eye" aria-label="Parolni ko'rsatish">${I("eye", "sm")}</button></div></div>
    <div class="row between mb-s"><label class="check"><input type="checkbox" id="lRem" checked> Meni eslab qol</label><a class="small b" data-act="forgot" href="javascript:void 0">Parolni unutdingizmi?</a></div>
    <div class="err" id="lErr" role="alert"></div>
    <button class="btn block" type="submit">Kirish</button></form>
  <div class="or">yoki</div><button class="btn ghost block" data-act="google">${I("google")} Google orqali kirish</button>
  <p class="center mt small muted">Hisobingiz yo'qmi? <a data-go="#/register" href="#/register" class="b">Ro'yxatdan o'tish</a></p>
  ${SERVER && !Store.cfg().demo ? "" : `<div class="demo-acc"><b class="small">Namoyish uchun demo hisoblar</b><div class="small muted">Bir marta bosing — maydonlar to'ldiriladi.</div>
    <div class="row wrap"><button class="btn sm soft" data-act="demo" data-id="dunyo@pmedu.uz|demo123">${I("cap", "sm")} Talaba</button><button class="btn sm soft" data-act="demo" data-id="ustoz@pmedu.uz|demo123">${I("users", "sm")} Ustoz</button><button class="btn sm soft" data-act="demo" data-id="admin@pmedu.uz|admin123">${I("shield", "sm")} Admin</button></div></div>`}`);
AFTER.login = () => {
  U.$("#loginForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    new Promise((ok) => ok(Store.login(U.$("#lEmail").value, U.$("#lPass").value, U.$("#lRem").checked)))
      .then((u) => { C.toast(`Xush kelibsiz, ${u.first}!`, "ok"); APP.go(homeOf(u)); })
      .catch((err) => { const el = U.$("#lErr"); if (el) el.textContent = err.message; else C.toast(err.message, "bad"); });
  });
};
A.demo = (el) => { const [m, p] = el.dataset.id.split("|"); U.$("#lEmail").value = m; U.$("#lPass").value = p; U.$("#lErr").textContent = ""; };
A.eye = (el) => { const inp = el.parentElement.querySelector("input"); inp.type = inp.type === "password" ? "text" : "password"; el.innerHTML = I(inp.type === "password" ? "eye" : "eyeoff", "sm"); };
A.google = () => C.toast("Google orqali kirish (OAuth 2.0) server bilan ulanganda ishlaydi. Hozircha email orqali davom eting.");
A.forgot = () => { if (SERVER) return C.modal(`<h2>Parolni tiklash</h2><p class="mt-s">Parolni tiklash uchun platforma administratoriga yoki ustozingizga murojaat qiling. Administrator sizga vaqtinchalik parol beradi, kirgach uni Sozlamalar bo'limida o'zgartirasiz.</p>`);
  const ov = C.modal(`<h2>Parolni tiklash</h2><p class="muted mt-s">Ro'yxatdan o'tgan email manzilingizni kiriting.</p><div class="field mt"><div class="inp">${I("mail")}<input class="in" id="fEmail" type="email" placeholder="example@gmail.com"></div></div><button class="btn block" id="fBtn">Tiklash havolasini yuborish</button><p class="small muted mt-s">Server rejimida havola emailga yuboriladi. Namoyish rejimida parolni administrator yangilaydi.</p>`);
  ov.querySelector("#fBtn").onclick = () => { const v = ov.querySelector("#fEmail").value.trim(); if (!Store.EMAIL_RE.test(v)) return C.toast("Email manzil noto'g'ri.", "bad"); ov.remove(); C.toast("Agar bunday hisob mavjud bo'lsa, tiklash bo'yicha ko'rsatma yuboriladi.", "ok"); }; };

const STEPS = ["Akkaunt", "Shaxsiy ma'lumotlar", "Ta'lim ma'lumotlari", "Tasdiqlash"];
V.register = () => {
  const s = REG.step, d = REG.d;
  const stepper = `<div class="stepper">${STEPS.map((t, i) => `<div class="st ${i + 1 < s ? "done" : i + 1 === s ? "on" : ""}"><div class="n">${i + 1 < s ? I("check", "sm") : i + 1}</div>${t}</div>`).join("")}</div>`;
  let body = "";
  if (s === 1) body = `<h2>Ro'yxatdan o'tish</h2><p class="muted">Davom etish uchun email va parol yarating.</p>${stepper}
    <div class="field"><label for="rEmail">Email manzilingiz</label><div class="inp">${I("mail")}<input class="in" id="rEmail" type="email" placeholder="example@gmail.com" value="${e(d.email || "")}" autocomplete="email"></div></div>
    <div class="field"><label for="rPass">Parol</label><div class="inp">${I("lock")}<input class="in" id="rPass" type="password" placeholder="Kamida 8 ta belgi, harf va raqam" value="${e(d.password || "")}" autocomplete="new-password"><button type="button" class="eye" data-act="eye">${I("eye", "sm")}</button></div><div class="strength" id="rStr"><i></i><i></i><i></i></div></div>
    <div class="field"><label for="rPass2">Parolni tasdiqlang</label><div class="inp">${I("lock")}<input class="in" id="rPass2" type="password" placeholder="Parolni qayta kiriting" value="${e(d.password || "")}" autocomplete="new-password"></div></div>
    <label class="check mb-s"><input type="checkbox" id="rTerms" ${d.terms ? "checked" : ""}> <span>Men <a data-act="terms" href="javascript:void 0">foydalanuvchi shartlari</a> va maxfiylik siyosatiga roziman.</span></label>
    <div class="err" id="rErr"></div><button class="btn block" data-act="regNext">Ro'yxatdan o'tish ${I("arrow", "sm")}</button>
    <div class="or">yoki</div><button class="btn ghost block" data-act="google">${I("google")} Google orqali davom etish</button>
    <p class="center mt small muted">Hisobingiz bormi? <a data-go="#/login" href="#/login" class="b">Kirish</a></p>`;
  if (s === 2) body = `${stepper}<h2>Shaxsiy ma'lumotlar</h2><p class="muted">Iltimos, o'zingiz haqingizdagi ma'lumotlarni kiriting.</p>
    <div class="field mt"><label for="rFirst">Ism</label><div class="inp">${I("user")}<input class="in" id="rFirst" placeholder="Masalan: Dunyo" value="${e(d.first || "")}" maxlength="40"></div></div>
    <div class="field"><label for="rLast">Familiya</label><div class="inp">${I("user")}<input class="in" id="rLast" placeholder="Masalan: Tolipova" value="${e(d.last || "")}" maxlength="40"></div></div>
    <div class="err" id="rErr"></div><div class="row between"><button class="btn ghost" data-act="regBack">${I("back", "sm")} Orqaga</button><button class="btn" data-act="regNext">Keyingi ${I("arrow", "sm")}</button></div>`;
  if (s === 3) body = `${stepper}<h2>Ta'lim ma'lumotlari</h2><p class="muted">Sizning ta'lim ma'lumotlaringiz platformada shaxsiy kurslaringizni belgilashda yordam beradi.</p>
    <div class="field mt"><label for="rUni">Universitet</label><div class="inp">${I("bank")}<select class="in" id="rUni">${DATA.UNIVERSITIES.map((x) => `<option ${x === d.uni ? "selected" : ""}>${e(x)}</option>`).join("")}</select></div></div>
    <div class="field"><label for="rFac">Fakultet / yo'nalish</label><div class="inp">${I("cap")}<select class="in" id="rFac">${DATA.FACULTIES.map((x) => `<option ${x === d.faculty ? "selected" : ""}>${e(x)}</option>`).join("")}</select></div></div>
    <div class="field"><label>Nechanchi bosqich?</label><div class="seg">${[1, 2, 3, 4].map((k) => `<button type="button" class="${+d.course === k ? "on" : ""}" data-act="regCourse" data-id="${k}">${k}-kurs</button>`).join("")}</div></div>
    <div class="g g2" style="gap:12px"><div class="field"><label for="rYear">O'qish yili</label><div class="inp">${I("cal")}<select class="in" id="rYear">${DATA.YEARS.map((x) => `<option ${x === d.year ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
    <div class="field"><label for="rGroup">Guruh</label><div class="inp">${I("users")}<input class="in" id="rGroup" placeholder="AM-21" value="${e(d.group || "")}" maxlength="20"></div></div></div>
    <div class="err" id="rErr"></div><div class="row between"><button class="btn ghost" data-act="regBack">${I("back", "sm")} Orqaga</button><button class="btn" data-act="regNext">Keyingi ${I("arrow", "sm")}</button></div>`;
  if (s === 4) body = `${stepper}<h2>Ma'lumotlarni tasdiqlang</h2><p class="muted">Quyidagi ma'lumotlar to'g'riligini tekshirib chiqing. Agar kerak bo'lsa, tahrirlashingiz mumkin.</p>
    <div class="card pad-s mt">${[["user", "Ism", d.first], ["user", "Familiya", d.last], ["mail", "Email", d.email], ["bank", "Universitet", d.uni], ["cap", "Fakultet / yo'nalish", d.faculty], ["layers", "Bosqich", d.course + "-kurs"], ["cal", "O'qish yili", d.year], ["users", "Guruh", d.group || "—"]]
      .map(([i, k, v]) => `<div class="sumrow">${I(i, "sm")}<span>${k}</span><b>${e(v)}</b></div>`).join("")}</div>
    <div class="err mt-s" id="rErr"></div><div class="row between mt-s"><button class="btn ghost" data-act="regBack">${I("back", "sm")} Orqaga</button><button class="btn" data-act="regDone">Profilni yaratish</button></div>`;
  if (s === 5) body = `<div class="center"><div class="bigok">${I("check", "lg")}</div><h2>Profilingiz tayyor!</h2><p class="muted">Endi siz platformadan to'liq foydalana olasiz. Omad tilaymiz!</p></div>
    <div class="card pad-s mt"><b class="small muted">Sizning yo'nalishingiz</b><div class="row mt-s"><div class="ic-box">${I("bank")}</div><div><b>${e(d.faculty)}</b><div class="small muted">${e(d.course)}-kurs | ${e(d.uni)}</div></div></div>
    ${["Fanlar ro'yxati shakllantirildi", "Sizning progressingiz saqlanadi", "AI yordamchi faol"].map((t) => `<div class="row mt-s small b"><span class="ic-box g sm" style="width:24px;height:24px;border-radius:50%">${I("check", "sm")}</span>${t}</div>`).join("")}</div>
    <button class="btn block mt" data-go="#/">Bosh sahifaga o'tish ${I("arrow", "sm")}</button>`;
  return authWrap(body);
};
AFTER.register = () => {
  const p = U.$("#rPass"); if (!p) return;
  const upd = () => { const v = p.value; const sc = (v.length >= 8) + (/[A-Za-z]/.test(v) && /\d/.test(v)) + (v.length >= 12 || /[^A-Za-z0-9]/.test(v)); U.$$("#rStr i").forEach((el, i) => (el.className = i < sc ? "on" + sc : "")); };
  p.addEventListener("input", upd); upd();
};
A.regCourse = (el) => { REG.d.course = +el.dataset.id; U.$$(".seg button").forEach((b) => b.classList.toggle("on", b === el)); };
A.regBack = () => { REG.step--; APP.render(); };
A.terms = () => A.page("terms");
A.regNext = () => {
  const d = REG.d, err = (t) => (U.$("#rErr").textContent = t);
  if (REG.step === 1) {
    d.email = U.$("#rEmail").value.trim().toLowerCase(); d.password = U.$("#rPass").value; d.terms = U.$("#rTerms").checked;
    if (!Store.EMAIL_RE.test(d.email)) return err("Email manzil noto'g'ri.");
    if (Store.get().users.some((u) => u.email === d.email)) return err("Bu email bilan hisob allaqachon mavjud.");
    const pe = Store.validatePassword(d.password); if (pe) return err(pe);
    if (d.password !== U.$("#rPass2").value) return err("Parollar mos kelmadi.");
    if (!d.terms) return err("Foydalanuvchi shartlariga rozilik bildiring.");
  }
  if (REG.step === 2) { d.first = U.$("#rFirst").value.trim(); d.last = U.$("#rLast").value.trim(); if (d.first.length < 2) return err("Ismni kiriting."); if (d.last.length < 2) return err("Familiyani kiriting."); }
  if (REG.step === 3) { d.uni = U.$("#rUni").value; d.faculty = U.$("#rFac").value; d.year = U.$("#rYear").value; d.group = U.$("#rGroup").value.trim(); }
  REG.step++; APP.render();
};
A.regDone = () => { new Promise((ok) => ok(Store.register(REG.d))).then(() => { REG.step = 5; APP.render(); }).catch((err) => { const el = U.$("#rErr"); if (el) el.textContent = err.message; }); };
const homeOf = (u) => (u.role === "teacher" ? "#/ustoz" : u.role === "admin" ? "#/admin" : "#/");

/* =============== BOSH SAHIFA (talaba) =============== */
V.home = (u) => {
  const o = S.overall(u.id), today = U.dayKey(), ev = S.events(u.id, today);
  const my = DATA.SUBJECTS.filter((s) => s.courses.includes(+u.course) || s.courses.includes(+u.course - 1)).slice(0, 4);
  const lb = S.leaderboard(), meIdx = lb.findIndex((x) => x.u.id === u.id);
  const rec = S.recommendations(u.id, 4), st = S.streak(u.id);
  const now = new Date(); const evDays = new Set(S.events(u.id).map((x) => x.date));
  return `
  <section class="hero"><div class="txt"><h1>Salom, ${e(u.first)}! 👋</h1><p>Amaliy matematika bo'yicha bilimlaringni kengaytir, kelajagingni qur!</p>
    <div class="chips-info">${[["bank", "Universitet", u.uni], ["route", "Yo'nalish", u.faculty], ["file", "Bosqich", u.course + "-kurs"], ["cal", "O'qish yili", u.year]].map(([i, k, v]) => `<div class="info"><div class="ic">${I(i, "sm")}</div><div><small>${k}</small><b>${e(v || "—")}</b></div></div>`).join("")}</div></div>
    <div class="art">${ART.laptop(330)}</div></section>
  <div class="g g4 mt">${[["book", "Fanlar", "Mashg'ulotlar va mavzular", "#/fanlar"], ["test", "Testlar", "Bilimingni sinab ko'r", "#/testlar"], ["bot", "AI yordamchi", "Savollarga javob ol", "#/ai"], ["file", "Adabiyotlar", "Kerakli manbalar", "#/adabiyotlar"]]
    .map(([i, t, s, h]) => `<div class="card pad-s qcard" data-go="${h}" tabindex="0"><div class="ic-box lg">${I(i, "lg")}</div><div><h3>${t}</h3><p class="small muted">${s}</p></div></div>`).join("")}</div>
  <div class="split-r mt">
    <div class="card"><div class="card-h"><h2>Mening progressim</h2><a data-go="#/progress">Batafsil ${I("arrow", "sm")}</a></div>
      <div class="row wrap" style="gap:28px"><div class="center">${C.ring(o.progress, 150, 14)}<div class="small muted mt-s">Umumiy progress</div></div>
      <div class="grow stack" style="gap:10px;min-width:220px">
        <div class="stat p"><div class="ic-box g sm">${I("check", "sm")}</div><div><small>Bajarilgan mavzular</small><b>${o.learned} / ${o.total}</b></div></div>
        <div class="stat p"><div class="ic-box r sm">${I("target", "sm")}</div><div><small>To'g'ri javoblar</small><b>${o.correctPct}%</b></div></div>
        <div class="stat o"><div class="ic-box o sm">${I("star", "sm")}</div><div><small>O'rtacha natija</small><b>${o.grade} / 5</b></div></div>
        <div class="stat"><div class="ic-box o sm">${I("fire", "sm")}</div><div><small>Faollik seriyasi</small><b>${st} kun</b></div></div></div></div></div>
    <div class="card"><div class="card-h"><h2>Bugungi vazifalar</h2><a data-go="#/kalendar">Barchasi ${I("arrow", "sm")}</a></div>
      ${ev.length ? ev.map((x) => taskRow(x)).join("") : C.empty("Bugun uchun vazifa yo'q. Kalendar orqali qo'shing.", "cal")}
      <button class="btn soft block mt-s sm" data-act="addEvent" data-id="${today}">${I("plus", "sm")} Vazifa qo'shish</button></div></div>
  <div class="card mt"><div class="card-h"><div><h2>${I("brain")} Siz uchun tavsiyalar</h2><p class="small muted">Test natijalari va unutish egri chizig'i asosida avtomatik tanlandi</p></div><button class="btn sm" data-act="startTest" data-id="adaptive">${I("bolt", "sm")} Moslashuvchan test</button></div>
    <div class="g g4">${rec.map((m) => `<div class="mini" data-go="#/fan/${m.topic.s}/${m.tid}"><div class="row between">${C.subjIcon(m.topic.s, "sm")}${C.levelBadge(m)}</div><div><b>${e(m.topic.name)}</b><div class="tiny muted">${e(S.subj(m.topic.s).name)}</div></div><div class="small muted">${e(m.reason)}</div>${C.bar(m.score, m.level === "weak" ? "r" : m.level === "review" ? "o" : "")}</div>`).join("")}</div></div>
  <div class="split-r mt">
    <div class="card"><div class="card-h"><h2>Asosiy fanlar</h2><a data-go="#/fanlar">Barchasi ${I("arrow", "sm")}</a></div>
      <div class="g g4" style="gap:14px">${my.map((s) => { const x = S.subjectStats(u.id, s.id); return `<div class="mini" data-go="#/fan/${s.id}">${C.subjIcon(s.id)}<b>${e(s.name)}</b><div class="small muted">${x.learned} / ${x.total} mavzu</div>${C.bar(U.pct(x.learned, x.total))}<div class="row" style="justify-content:flex-end"><span class="circ">${I("arrow", "sm")}</span></div></div>`; }).join("")}</div></div>
    <div class="card"><div class="card-h"><h2>Top talabalar</h2><a data-go="#/progress">Barchasi ${I("arrow", "sm")}</a></div>
      ${lb.slice(0, 3).map((x, i) => lbRow(x, i)).join("")}${meIdx > 2 ? lbRow(lb[meIdx], meIdx, true) : ""}</div></div>
  <div class="g g3 mt">
    <div class="card promo-ai" style="background:var(--hero)"><div class="row" style="align-items:center">${ART.robot(120)}<div><h2 style="color:var(--p)">AI Yordamchi</h2><p class="small muted mt-s">Matematikaga oid savollaringizga tez va aniq javob oling — qadamma-qadam yechim bilan.</p><button class="btn mt" data-go="#/ai">Savol berish ${I("arrow", "sm")}</button></div></div></div>
    <div class="card"><div class="card-h"><h2>So'nggi faoliyat</h2><a data-go="#/progress">Barchasi ${I("arrow", "sm")}</a></div>
      ${S.activity(u.id, 4).map((a) => `<div class="li"><div class="ic-box sm ${a.kind === "test" ? "g" : a.kind === "ai" ? "" : "bl"}">${I(a.kind === "test" ? "test" : a.kind === "ai" ? "bot" : "book", "sm")}</div><div class="grow"><div class="t">${e(a.title)}</div><div class="s">${U.rel(a.ts)}</div></div>${a.val && /%$/.test(a.val) ? `<span class="badge g">${e(a.val)}</span>` : `<span class="badge bl">${I("check", "sm")}</span>`}</div>`).join("") || C.empty("Hali faoliyat yo'q")}</div>
    <div class="card"><div class="card-h"><h2>Kalendar</h2><a data-go="#/kalendar">Barchasi ${I("arrow", "sm")}</a></div>
      <div class="b mb-s">${U.OYLAR_B[now.getMonth()]} ${now.getFullYear()}</div>${C.calendar(now.getFullYear(), now.getMonth(), "", evDays, "calGo")}</div></div>
  <div class="banner mt"><div class="ic-box lg">${I("trophy", "lg")}</div><div><h2>Katta maqsadlar kichik qadamlar bilan boshlanadi!</h2><p>Bugun kichik bir qadam tashlang — ertangi muvaffaqiyatingiz shu boshlanadi.</p></div><button class="btn light" data-act="startTest" data-id="adaptive">Boshlash ${I("arrow", "sm")}</button></div>`;
};
const taskRow = (x) => `<div class="li"><button class="ic-box sm ${x.done ? "g" : ""}" style="border:0;cursor:pointer" data-act="toggleEvent" data-id="${x.id}" title="Bajarildi deb belgilash">${I(x.done ? "check" : x.kind === "test" || x.kind === "assign" ? "test" : "book", "sm")}</button>
  <div class="grow" ${x.kind === "test" || x.kind === "assign" ? `data-act="startTest" data-id="${x.kind === "assign" ? "as:" + x.ref : x.ref}" style="cursor:pointer"` : x.ref ? `data-go="#/fan/${(S.topic(x.ref) || {}).s}/${x.ref}" style="cursor:pointer"` : ""}><div class="t" style="${x.done ? "text-decoration:line-through;opacity:.6" : ""}">${e(x.title)}</div><div class="s">${e(x.sub)}</div></div><span class="timepill">${e(x.time)}</span></div>`;
const lbRow = (x, i, me) => `<div class="li ${me || x.u.id === (Store.current() || {}).id ? "meRow" : ""}"><span class="rank ${i < 3 ? "r" + (i + 1) : ""}">${i + 1}</span><div class="av sm">${e(U.initials(x.u.first, x.u.last))}</div><div class="grow"><div class="row between"><span class="t">${x.u.id === (Store.current() || {}).id ? "Siz" : e(x.u.last + " " + x.u.first)}</span><b class="small">${x.score}%</b></div>${C.bar(x.score)}</div></div>`;
A.calGo = (el) => { APP.calSel = el.dataset.id; APP.go("#/kalendar"); };

/* =============== FANLAR =============== */
V.fanlar = (u) => {
  const f = APP.fanFilter || 0, list = DATA.SUBJECTS.filter((s) => !f || s.courses.includes(f));
  const o = u.role === "student" ? S.overall(u.id) : null;
  const top = u.role === "student" ? DATA.SUBJECTS.map((s) => ({ s, p: S.subjectStats(u.id, s.id).progress })).sort((a, b) => b.p - a.p).slice(0, 3) : [];
  return `<section class="hero"><div class="txt"><div class="kick">${LOGO().replace('class="mark"', 'class="mark" style="width:26px;height:27px"')} PM Edu</div><h1>Fanlarni o'rganing,<br>kelajagingizni quring!</h1>
    <p>Amaliy matematika yo'nalishidagi barcha fanlar bir joyda. O'zingizga mos fanlarni tanlang va bilimingizni mustahkamlang.</p><button class="btn mt" data-act="scrollTo" data-id="fanList">Boshlash ${I("arrow", "sm")}</button></div><div class="art">${ART.laptop(320)}</div></section>
  <div class="card pad-s mt"><div class="chips">${[0, 1, 2, 3].map((k) => `<button class="chip ${f === k ? "on" : ""}" data-act="fanFilter" data-id="${k}">${k ? k + "-kurs" : "Barchasi"}</button>`).join("")}${DATA.SUBJECTS.map((s) => `<button class="chip" data-go="#/fan/${s.id}">${e(s.name)}</button>`).join("")}</div></div>
  <div class="split mt"><div><div class="row between mb" id="fanList"><h2>Fanlar ro'yxati</h2><span class="small muted">Jami ${list.length} ta fan</span></div>
    <div class="g g2">${list.map((s) => { const x = u.role === "student" ? S.subjectStats(u.id, s.id) : { learned: 0, total: S.topicsOf(s.id).length }; return `<div class="card scard"><div class="row between">${C.subjIcon(s.id, "lg")}<span class="small muted">${S.topicsOf(s.id).length} mavzu · ${DATA.TESTS.filter((t) => t.s === s.id).length} test</span></div>
      <div><h3>${e(s.name)}</h3><p class="desc">${e(s.desc)}</p></div><div class="row small muted">${I("file", "sm")} ${x.total} ta mavzu</div><div class="row">${C.bar(U.pct(x.learned, x.total))}<span class="small muted" style="white-space:nowrap">${x.learned} / ${x.total}</span></div>
      <div><button class="btn sm" data-go="#/fan/${s.id}">Mavzularni ko'rish ${I("arrow", "sm")}</button></div><div class="row wrap" style="gap:6px">${s.courses.map((c) => `<span class="tag">${c}-kurs</span>`).join("")}</div></div>`; }).join("")}
      <div class="card scard"><div class="row between"><div class="ic-box lg">${I("bot", "lg")}</div><span class="badge">Bepul</span></div><div><h3>AI yordamchi</h3><p class="desc">Masalalarni yechish, tushuntirish va individual yordam — barcha fanlar bo'yicha.</p></div><div><button class="btn sm block" data-go="#/ai">AI bilan ishlash ${I("arrow", "sm")}</button></div><div><span class="tag">Barcha kurslar</span></div></div></div></div>
    <aside class="stack">${o ? `<div class="card"><h2 class="mb">Umumiy progress</h2><div class="row">${C.ring(o.progress, 110, 11)}<p class="small muted">Sizning umumiy ko'rsatkichingiz</p></div>
      ${[["check", "O'rganilgan mavzular", `${o.learned} / ${o.total}`, "g"], ["test", "Bajarilgan testlar", o.tests, "bl"], ["target", "To'g'ri javoblar", o.correctPct + "%", "r"], ["star", "O'rtacha baho", o.grade + " / 5", "o"]].map(([i, t, v, c]) => `<div class="li"><span class="ic-box sm ${c}">${I(i, "sm")}</span><span class="grow small">${t}</span><b class="small">${v}</b></div>`).join("")}</div>
      <div class="card"><h2 class="mb">Eng ko'p o'rganilayotgan fanlar</h2>${top.map((x, i) => `<div class="li"><span class="rank">${i + 1}</span><div class="grow"><div class="row between small"><b>${e(x.s.name)}</b><b>${x.p}%</b></div>${C.bar(x.p)}</div></div>`).join("")}</div>` : ""}
      <div class="card" style="background:var(--hero)"><div class="mathic" style="font-size:34px;color:var(--p);line-height:1">“</div><p class="b">Matematika — bu faqat raqamlar emas, bu fikrlash uslubidir.</p><p class="small muted mt-s">— PM Edu</p></div>
      <div class="card"><h2 class="mb">Tezkor havolalar</h2>${[["test", "Testlar", "#/testlar"], ["book", "Adabiyotlar", "#/adabiyotlar"], ["bot", "AI yordamchi", "#/ai"], ["cal", "Kalendar", "#/kalendar"]].map(([i, t, h]) => `<div class="li click" data-go="${h}"><span class="ic-box sm">${I(i, "sm")}</span><span class="t grow">${t}</span>${I("right", "sm")}</div>`).join("")}</div></aside></div>
  <div class="banner mt" style="background:var(--hero);color:var(--text)"><div>${ART.books(120)}</div><div><h2 style="color:var(--p)">Yana ko'proq bilimlar sari!</h2><p class="muted">Barcha fanlar, testlar va adabiyotlar bir platformada.</p></div><button class="btn" data-go="#/adabiyotlar">Adabiyotlar ${I("arrow", "sm")}</button></div>`;
};
A.fanFilter = (el) => { APP.fanFilter = +el.dataset.id; APP.render(); };
A.scrollTo = (el) => { const t = document.getElementById(el.dataset.id); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); };

/* =============== FAN SAHIFASI =============== */
V.fan = (u, [sid, tid]) => {
  const s = S.subj(sid); if (!s) return C.empty("Fan topilmadi.");
  const stud = u.role === "student", cache = {}, ts = S.topicsOf(sid), x = stud ? S.subjectStats(u.id, sid) : null;
  const tests = DATA.TESTS.filter((t) => t.s === sid), bks = S.books().filter((b) => b.s === sid);
  return `<div class="row small muted mb"><a data-go="#/fanlar" href="#/fanlar">Fanlar</a> ${I("right", "sm")} <span>${e(s.name)}</span></div>
  <section class="hero" style="min-height:0"><div class="txt" style="max-width:100%"><div class="row">${C.subjIcon(sid, "lg")}<div><h1>${e(s.name)}</h1><p style="margin-top:4px">${e(s.desc)}</p></div></div>
    <div class="chips-info">${stud ? `<div class="info"><div class="ic">${I("trend", "sm")}</div><div><small>Progress</small><b>${x.progress}%</b></div></div><div class="info"><div class="ic">${I("check", "sm")}</div><div><small>O'rganilgan</small><b>${x.learned} / ${x.total} mavzu</b></div></div><div class="info"><div class="ic">${I("test", "sm")}</div><div><small>Yechilgan testlar</small><b>${x.tests} ta · ${x.avgPct}%</b></div></div>` : ""}
    <div class="row wrap">${stud ? `<button class="btn" data-act="startTest" data-id="subj:${sid}">${I("test", "sm")} Umumiy test</button>` : ""}<button class="btn ghost" data-act="konspekt" data-id="${sid}">${I("dl", "sm")} Konspekt (.txt)</button><button class="btn ghost" data-go="#/ai">${I("bot", "sm")} AI dan so'rash</button></div></div></div></section>
  <div class="split mt"><div>${ts.map((t, i) => { const m = stud ? S.mastery(u.id, t.id) : null; const test = tests.find((q) => q.topics.includes(t.id));
    return `<details class="topic" id="tp-${t.id}" ${t.id === tid || (!tid && i === 0) ? "open" : ""}><summary><span class="ic-box sm">${i + 1}</span><div class="grow"><b>${e(t.name)}</b>${m ? `<div class="row small muted" style="gap:8px;margin-top:4px">${C.levelBadge(m)}${m.n ? `<span>${m.n} ta javob · ${Math.round(m.acc * 100)}% to'g'ri</span>` : ""}</div>` : ""}</div>${m ? `<span class="${m.learned ? "badge g" : "tag"}">${m.learned ? "O'rganilgan" : "Yangi"}</span>` : ""}${I("down", "sm")}</summary>
      <div class="body"><p>${e(t.theory)}</p><div><b class="small muted">Asosiy formulalar</b>${t.formulas.map((f) => `<div class="formula-box mt-s">${e(f)}</div>`).join("")}</div><div class="explain"><b>Namuna:</b> ${e(t.example)}</div>
      <div class="row wrap">${stud ? `<button class="btn sm ${m.learned ? "ok" : ""}" data-act="learn" data-id="${t.id}">${I("check", "sm")} ${m.learned ? "O'rganildi" : "O'rgandim"}</button>` : ""}
      <button class="btn sm soft" data-act="askAI" data-id="${e(t.name)} bo'yicha mashq ber">${I("bot", "sm")} AI mashq</button>${stud && test ? `<button class="btn sm ghost" data-act="startTest" data-id="${test.id}">${I("test", "sm")} Mavzu testi</button>` : ""}
      ${stud && S.GEN[t.id] ? `<button class="btn sm ghost" data-act="startTest" data-id="gen:${sid}">${I("repeat", "sm")} Cheksiz mashq</button>` : ""}</div></div></details>`; }).join("")}</div>
    <aside class="stack"><div class="card"><h2 class="mb">Testlar</h2>${tests.map((t) => `<div class="li click" ${stud ? `data-act="startTest" data-id="${t.id}"` : ""}><span class="ic-box sm">${I("test", "sm")}</span><div class="grow"><div class="t">${e(t.title)}</div><div class="s">${DATA.QUESTIONS.filter((q) => t.topics.includes(q.t)).length} savol bankda</div></div>${C.levelTag(t.level)}</div>`).join("")}</div>
      <div class="card"><h2 class="mb">Adabiyotlar</h2>${bks.map((b) => `<div class="li click" data-act="book" data-id="${b.id}"><span class="ic-box sm bl">${I("book", "sm")}</span><div class="grow"><div class="t">${e(b.title)}</div><div class="s">${e(b.author)} · ${e(b.type)}</div></div></div>`).join("") || C.empty("Adabiyot yo'q")}</div>${C.quote(2)}</aside></div>`;
};
AFTER.fan = (u, [, tid]) => { if (tid) { const el = document.getElementById("tp-" + tid); if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 60); } };
A.learn = (el) => ACT("toggleLearned", el.dataset.id).then((on) => { C.toast(on ? "Mavzu o'rganilganlar ro'yxatiga qo'shildi." : "Belgi olib tashlandi.", on ? "ok" : ""); APP.render(); }).catch(fail);
A.konspekt = (el) => C.download(`PM-Edu_${el.dataset.id}_konspekt.txt`, S.konspekt(el.dataset.id));
A.askAI = (el) => { APP.aiPrefill = el.dataset.id; APP.go("#/ai"); };

/* ===== views_b.js — testlar, test jarayoni, natija, AI, adabiyotlar, progress, kalendar, sozlamalar, ustoz, admin ===== */
"use strict";

/* =============== TESTLAR =============== */
V.testlar = (u) => {
  const f = APP.testFilter || "", d = Store.get();
  const tests = DATA.TESTS.filter((t) => !f || t.s === f);
  const o = S.overall(u.id), att = S.attemptsOf(u.id), mist = S.mistakes(u.id).length;
  const allAvg = d.attempts.length ? Math.round(d.attempts.reduce((x, a) => x + a.pct, 0) / d.attempts.length) : 0;
  const popular = DATA.TESTS.map((t) => { const a = d.attempts.filter((x) => x.testId === t.id); return { t, n: a.length, avg: a.length ? Math.round(a.reduce((x, y) => x + y.pct, 0) / a.length) : 0 }; }).sort((a, b) => b.n - a.n).slice(0, 5);
  const asg = S.assignmentsFor(u);
  const upcoming = S.events(u.id).filter((x) => (x.kind === "test" || x.kind === "assign") && x.date >= U.dayKey() && !x.done).slice(0, 4);
  const best = (tid) => { const a = att.filter((x) => x.testId === tid); return a.length ? Math.max(...a.map((x) => x.pct)) : null; };
  return `<section class="hero"><div class="txt"><div class="kick">${I("test", "sm")} Testlar</div><h1>Bilimingni sinab ko'r!</h1><p>Turli mavzulardagi testlar orqali o'zingni tekshir, bo'shliqlarni to'ldir va natijangni yaxshila.</p><button class="btn mt" data-act="scrollTo" data-id="testList">Testlar ro'yxatini ko'rish ${I("arrow", "sm")}</button></div><div class="art">${ART.test(320)}</div></section>
  <div class="g g4 mt">${[["test", "Jami testlar", DATA.TESTS.length + " + ∞"], ["file", "Mavzular", DATA.TOPICS.length], ["users", "Foydalanuvchilar", d.users.filter((x) => x.role === "student").length], ["star", "O'rtacha natija", allAvg + "%"]].map(([i, t, v]) => `<div class="card pad-s kpi"><div class="ic-box">${I(i)}</div><div><small class="muted">${t}</small><b>${v}</b></div></div>`).join("")}</div>
  <div class="card pad-s mt"><div class="chips"><button class="chip ${!f ? "on" : ""}" data-act="testFilter" data-id="">Barchasi</button>${DATA.SUBJECTS.map((s) => `<button class="chip ${f === s.id ? "on" : ""}" data-act="testFilter" data-id="${s.id}">${e(s.name)}</button>`).join("")}</div></div>
  <div class="split mt"><div class="stack">
    <div class="g g3">${[["bolt", "Moslashuvchan test", "AI zaif va takrorlash kerak bo'lgan mavzulardan savol tanlaydi.", "adaptive", ""], ["repeat", "Xatolar ustida ishlash", `Xato javob bergan ${mist} ta savolingiz qayta beriladi.`, "mistakes", "o"], ["refresh", "Cheksiz mashq", "Har safar yangi sonlar bilan generatsiya qilinadigan masalalar.", "gen:" + (f || ""), "g"]]
      .map(([i, t, s, id, c]) => `<div class="card scard"><div class="ic-box ${c}">${I(i)}</div><div><h3>${t}</h3><p class="desc">${s}</p></div><button class="btn sm" data-act="startTest" data-id="${id}" ${id === "mistakes" && !mist ? "disabled" : ""}>Boshlash ${I("arrow", "sm")}</button></div>`).join("")}</div>
    ${asg.length ? `<div class="card"><div class="card-h"><h2>${I("users")} Ustoz topshiriqlari</h2></div>${asg.map((a) => `<div class="boxli"><div class="ic-box">${C.subjIcon(a.s).replace(/^<div class="ic-box[^"]*">|<\/div>$/g, "")}</div><div class="grow"><b>${e(a.title)}</b><div class="small muted">${e(S.subj(a.s).name)} · ${a.qids.length} savol · ${a.minutes} daqiqa · muddat: ${U.dateLong(U.fromKey(a.deadline))}</div></div>
      ${a.attempt ? `<span class="badge g">${a.attempt.pct}% · topshirildi</span>` : U.fromKey(a.deadline) < U.fromKey(U.dayKey()) ? `<span class="badge r">Muddat o'tgan</span>` : `<button class="btn sm" data-act="startTest" data-id="as:${a.id}">Boshlash ${I("arrow", "sm")}</button>`}</div>`).join("")}</div>` : ""}
    <div class="card" id="testList"><div class="card-h"><h2>Mavzular bo'yicha testlar</h2><span class="small muted">${tests.length} ta test</span></div>
      ${tests.map((t) => { const n = DATA.QUESTIONS.filter((q) => t.topics.includes(q.t)).length, b = best(t.id); return `<div class="boxli">${C.subjIcon(t.s)}<div class="grow"><b>${e(t.title)}</b><div class="small muted row wrap" style="gap:10px">${e(S.subj(t.s).name)} <span>${I("file", "sm")} ${Math.min(10, n)} ta savol</span><span>${I("clock", "sm")} ${Math.max(5, Math.ceil(Math.min(10, n) * 1.5))} daqiqa</span>${b != null ? `<span>Eng yaxshi: <b>${b}%</b></span>` : ""}</div></div>${C.levelTag(t.level)}<button class="btn sm" data-act="startTest" data-id="${t.id}">Boshlash ${I("arrow", "sm")}</button></div>`; }).join("")}
      ${f ? `<button class="btn ghost block mt-s" data-act="startTest" data-id="subj:${f}">${I("layers", "sm")} ${e(S.subj(f).name)}: umumiy test</button>` : ""}</div>
    <div class="card"><div class="card-h"><h2>Mening natijalarim</h2><span class="small muted">${att.length} ta urinish</span></div>
      ${att.slice(0, 6).map((a) => `<div class="li click" data-go="#/natija/${a.id}"><span class="ic-box sm ${a.pct >= 71 ? "g" : a.pct >= 56 ? "o" : "r"}">${a.pct}</span><div class="grow"><div class="t">${e(a.title)}</div><div class="s">${a.score} / ${a.total} · ${U.rel(a.finishedAt)}</div></div>${C.gradeBadge(a.pct)}${I("right", "sm")}</div>`).join("") || C.empty("Hali test yechilmagan")}</div></div>
    <aside class="stack"><div class="card"><h2 class="mb">Umumiy progress</h2><div class="center">${C.ring(o.progress, 130, 13)}</div>
      ${[["target", "To'g'ri javoblar", o.correctPct, "g"], ["x", "Noto'g'ri javoblar", o.wrongPct, "r"], ["star", "O'rtacha natija", o.avgPct, ""]].map(([i, t, v, c]) => `<div class="mt-s"><div class="row between small"><span class="row">${I(i, "sm")} ${t}</span><b>${v}%</b></div>${C.bar(v, c)}</div>`).join("")}</div>
      <div class="card"><div class="card-h"><h2>Eng ko'p yechilgan testlar</h2></div>${popular.map((p, i) => `<div class="li"><span class="rank">${i + 1}</span><div class="grow"><div class="row between small"><b>${e(p.t.title)}</b><b>${p.avg}%</b></div><div class="tiny muted">${e(S.subj(p.t.s).name)} · ${p.n} urinish</div>${C.bar(p.avg)}</div></div>`).join("")}</div>
      <div class="card" style="background:var(--hero)"><div class="row">${ART.robot(80)}<div><h3 style="color:var(--p)">AI yordamchi</h3><p class="small muted">Savollaring bo'lsa, AI yordamchidan foydalan.</p></div></div><button class="btn block mt-s sm" data-go="#/ai">Savol berish ${I("arrow", "sm")}</button></div>
      <div class="card"><h2 class="mb">${I("cal")} Yaqin kunlar uchun</h2>${upcoming.map((x) => `<div class="li click" data-act="startTest" data-id="${x.kind === "assign" ? "as:" + x.ref : x.ref}"><span class="ic-box sm">${I("test", "sm")}</span><div class="grow"><div class="t">${e(x.title)}</div><div class="s">${U.dateLong(U.fromKey(x.date))}, ${e(x.time)}</div></div>${I("right", "sm")}</div>`).join("") || C.empty("Rejalashtirilgan test yo'q")}</div></aside></div>`;
};
A.testFilter = (el) => { APP.testFilter = el.dataset.id; APP.render(); };
A.startTest = (el) => {
  const id = el.dataset.id; const u = Store.current();
  if (!u || u.role !== "student") return C.toast("Testlar talaba hisobida yechiladi.");
  if (APP.ses && !el.force) return C.ask("Boshlangan test yakunlanmagan. Yangisini boshlaysizmi?", () => A.startTest({ dataset: el.dataset, force: true }));
  try {
    const cfg = id === "adaptive" ? { mode: "adaptive" } : id === "mistakes" ? { mode: "mistakes" } : id.startsWith("gen:") ? { mode: "gen", s: id.slice(4) || null } : id.startsWith("subj:") ? { s: id.slice(5) } : id.startsWith("as:") ? { assignId: id.slice(3) } : { testId: id };
    if (cfg.testId && !S.test(cfg.testId)) throw new Error("Test topilmadi.");
    const go = () => { APP.ses = S.startTest(cfg); APP.qi = 0; APP.go("#/test", true); };
    if (cfg.assignId) ACT("beginAssign", cfg.assignId).then(go).catch(fail); else go();
  } catch (err) { C.toast(err.message, "bad"); }
};

/* =============== TEST JARAYONI =============== */
V.test = () => {
  const s = APP.ses; if (!s) return C.empty("Faol test yo'q.");
  const i = APP.qi, q = s.qs[i], n = s.qs.length, answered = s.answers.filter((x) => x !== null).length;
  return `<div class="split"><div class="card"><div class="row between wrap"><div class="row">${C.subjIcon(s.s)}<div><h2>${e(s.title)}</h2><div class="small muted">${e(S.subj(s.s).name)} · ${n} ta savol</div></div></div><span class="badge">${i + 1} / ${n}</span></div>
    <div class="mt">${C.bar(U.pct(answered, n))}</div>
    <div class="mt"><div class="small muted b">Savol ${i + 1}${q.id ? "" : ` <span class="badge g">generatsiya</span>`}</div><div class="qtext m mt-s">${e(q.q)}</div></div>
    <div class="q-opts" role="radiogroup">${q.o.map((o, k) => `<button class="opt ${s.answers[i] === k ? "sel" : ""}" data-act="pick" data-id="${k}" role="radio" aria-checked="${s.answers[i] === k}"><span class="l">${"ABCD"[k]}</span><span class="m">${e(o)}</span></button>`).join("")}</div>
    <div class="row between mt wrap"><button class="btn ghost" data-act="qNav" data-id="-1" ${i === 0 ? "disabled" : ""}>${I("back", "sm")} Oldingi</button>
      <button class="btn soft" data-act="flag">${I("flag", "sm")} ${s.flags[i] ? "Belgini olish" : "Keyinroq qaytish"}</button>
      ${i < n - 1 ? `<button class="btn" data-act="qNav" data-id="1">Keyingi ${I("arrow", "sm")}</button>` : `<button class="btn" data-act="finish">Yakunlash ${I("check", "sm")}</button>`}</div>
    <p class="tiny muted mt">Klaviatura: 1–4 yoki A–D — javob tanlash, ← → — savollar orasida o'tish.</p></div>
  <aside class="stack"><div class="card center"><div class="small muted">Qolgan vaqt</div><div class="timer" id="timer">--:--</div></div>
    <div class="card"><h3 class="mb">Savollar</h3><div class="qnums">${s.qs.map((_, k) => `<button class="${s.answers[k] !== null ? "ans" : ""} ${k === i ? "cur" : ""} ${s.flags[k] ? "flag" : ""}" data-act="qGo" data-id="${k}">${k + 1}</button>`).join("")}</div>
      <div class="small muted mt">Javob berilgan: <b>${answered}</b> / ${n}</div><button class="btn block mt" data-act="finish">Testni yakunlash</button><button class="btn ghost block mt-s sm" data-act="quitTest">Chiqish</button></div></aside></div>`;
};
AFTER.test = () => {
  clearInterval(APP.tick);
  const t = () => { const s = APP.ses; if (!s) return clearInterval(APP.tick); const left = Math.max(0, Math.round(s.limitSec - (Date.now() - s.startedAt) / 1000)); const el = U.$("#timer"); if (el) { el.textContent = U.mmss(left); el.classList.toggle("low", left < 60); } if (left <= 0) { clearInterval(APP.tick); C.toast("Vaqt tugadi — test avtomatik yakunlandi."); A.finish(null, true); } };
  t(); APP.tick = setInterval(t, 1000);
};
A.pick = (el) => { APP.ses.answers[APP.qi] = +el.dataset.id; APP.render(); };
A.qNav = (el) => { APP.qi = U.clamp(APP.qi + +el.dataset.id, 0, APP.ses.qs.length - 1); APP.render(); };
A.qGo = (el) => { APP.qi = +el.dataset.id; APP.render(); };
A.flag = () => { APP.ses.flags[APP.qi] = !APP.ses.flags[APP.qi]; APP.render(); };
A.quitTest = () => C.ask("Testdan chiqasizmi? Javoblar saqlanmaydi.", () => { APP.ses = null; clearInterval(APP.tick); APP.go("#/testlar"); }, "Chiqish");
A.finish = (el, force) => {
  const s = APP.ses; if (!s) return; const left = s.answers.filter((x) => x === null).length;
  if (force !== true && left) return C.ask(`${left} ta savolga javob berilmagan. Testni yakunlaysizmi?`, () => A.finish(null, true), "Yakunlash");
  clearInterval(APP.tick); if (APP.submitting) return; APP.submitting = true;
  ACT("submitTest", s).then((at) => { APP.ses = null; APP.go("#/natija/" + at.id); })
    .catch((err) => C.toast(err.message + " Qayta urinib ko'ring.", "bad")).finally(() => { APP.submitting = false; });
};
document.addEventListener("keydown", (ev) => {
  if (!APP.ses || location.hash !== "#/test" || /input|textarea|select/i.test(document.activeElement.tagName)) return;
  const k = ev.key.toLowerCase(); const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
  if (k in map) { APP.ses.answers[APP.qi] = map[k]; APP.render(); }
  else if (ev.key === "ArrowRight" && APP.qi < APP.ses.qs.length - 1) { APP.qi++; APP.render(); }
  else if (ev.key === "ArrowLeft" && APP.qi > 0) { APP.qi--; APP.render(); }
});

/* =============== NATIJA =============== */
V.natija = (u, [id]) => {
  const a = Store.get().attempts.find((x) => x.id === id && (x.uid === u.id || u.role !== "student"));
  if (!a) return C.empty("Natija topilmadi.");
  const byT = {}; a.items.forEach((it) => { (byT[it.t] = byT[it.t] || { ok: 0, n: 0 }); byT[it.t].n++; if (it.ok) byT[it.t].ok++; });
  const mins = Math.max(1, Math.round((a.finishedAt - a.startedAt) / 60000));
  const again = a.mode === "test" && S.test(a.testId) ? a.testId : a.mode === "assign" ? null : a.testId && a.testId.startsWith("all-") ? "subj:" + a.s : a.mode;
  return `<div class="row small muted mb"><a data-go="#/testlar" href="#/testlar">Testlar</a> ${I("right", "sm")} <span>Natija</span></div>
  <div class="split"><div class="stack"><div class="card"><div class="row wrap" style="gap:28px">${C.ring(a.pct, 150, 14)}<div class="grow"><h1 style="font-size:24px">${e(a.title)}</h1><p class="muted mt-s">${e(S.subj(a.s).name)} · ${U.rel(a.finishedAt)}</p>
      <div class="row wrap mt">${C.gradeBadge(a.pct)}<span class="badge bl">Baho: ${C.grade(a.pct)}</span><span class="badge gr">${a.score} / ${a.total} to'g'ri</span><span class="badge gr">${I("clock", "sm")} ${mins} daqiqa</span></div>
      <div class="row wrap mt">${again ? `<button class="btn" data-act="startTest" data-id="${e(again === "gen" ? "gen:" : again)}">${I("refresh", "sm")} Qayta yechish</button>` : ""}${a.items.some((x) => !x.ok) ? `<button class="btn soft" data-act="startTest" data-id="mistakes">${I("repeat", "sm")} Xatolar ustida ishlash</button>` : ""}<button class="btn ghost" data-go="#/testlar">Testlarga qaytish</button></div></div></div></div>
    <div class="card"><h2 class="mb">Savollar tahlili</h2>${a.items.map((it, k) => { const q = S.itemQuestion(it); return `<div class="boxli" style="align-items:flex-start;flex-direction:column;gap:8px"><div class="row" style="width:100%"><span class="ic-box sm ${it.ok ? "g" : "r"}">${I(it.ok ? "check" : "x", "sm")}</span><b class="grow m">${k + 1}. ${e(q.q)}</b></div>
      <div class="small" style="padding-left:48px">${it.given == null ? '<span class="badge gr">Javob berilmagan</span>' : `Sizning javobingiz: <b class="m" style="color:${it.ok ? "var(--green)" : "var(--red)"}">${e(q.o[it.given])}</b>`}${!it.ok ? ` · To'g'ri javob: <b class="m" style="color:var(--green)">${e(q.o[q.a])}</b>` : ""}<div class="explain">${I("bulb", "sm")} ${e(q.e)}</div>
      ${!it.ok ? `<button class="btn sm soft mt-s" data-act="askAI" data-id="${e(S.topic(it.t).name)} haqida tushuntir">${I("bot", "sm")} AI dan tushuntirish</button>` : ""}</div></div>`; }).join("")}</div></div>
  <aside class="stack"><div class="card"><h2 class="mb">Mavzular bo'yicha</h2>${Object.entries(byT).map(([t, v]) => { const p = U.pct(v.ok, v.n), m = u.role === "student" ? S.mastery(u.id, t) : null; return `<div class="mt-s"><div class="row between small"><b>${e(S.topic(t).name)}</b><b>${v.ok}/${v.n}</b></div>${C.bar(p, p >= 80 ? "g" : p >= 50 ? "o" : "r")}${m ? `<div class="mt-s">${C.levelBadge(m)}</div>` : ""}</div>`; }).join("")}</div>
    ${u.role === "student" ? `<div class="card"><h2 class="mb">${I("brain")} Keyingi qadam</h2>${S.recommendations(u.id, 3).map((m) => `<div class="li click" data-go="#/fan/${m.topic.s}/${m.tid}"><div class="grow"><div class="t">${e(m.topic.name)}</div><div class="s">${e(m.reason)}</div></div>${I("right", "sm")}</div>`).join("")}</div>` : ""}</aside></div>`;
};

/* =============== AI YORDAMCHI =============== */
V.ai = (u) => {
  const chat = APP.chat || (APP.chat = { id: U.uid("ch"), title: "", msgs: [] });
  const list = S.chats(u.id).filter((c) => c.msgs.length);
  const answered = Store.get().chats.reduce((x, c) => x + c.msgs.filter((m) => m.role === "ai").length, 0);
  const ICONS = { a: '<span class="mathic">∫</span>', b: C.subjIcon("algebra").replace(/^<div class="ic-box[^"]*">|<\/div>$/g, ""), c: I("layers"), d: I("chart"), e: I("test") };
  return `<section class="hero"><div class="txt"><div class="kick">${I("bot", "sm")} AI yordamchi</div><h1>Salom, ${e(u.first)}! 👋</h1><p>Men — PM Edu AI yordamchiman. Savollaringga javob beraman, masalalar yechimida yordam beraman va o'qish jarayoningni yanada osonlashtiraman.</p>
    <div class="chips-info">${[["bolt", "Masalalar yechimi"], ["file", "Tushuntirish"], ["star", "Tavsiya"], ["shield", "Internetsiz ishlaydi"]].map(([i, t]) => `<div class="info" style="min-width:0"><div class="ic">${I(i, "sm")}</div><b>${t}</b></div>`).join("")}</div></div><div class="art" style="width:34%">${ART.robot(200)}</div></section>
  <div class="split mt"><div class="stack">
    <div class="card"><h2 class="mb">Savolingizni yozing</h2>
      <div class="composer"><label class="circ" title="Fayl biriktirish (.txt, .csv — sonlar statistikasi)" style="cursor:pointer">${I("clip", "sm")}<input type="file" id="aiFile" accept=".txt,.csv" hidden></label><textarea id="aiIn" rows="1" placeholder="Masalan: Integralni qanday hisoblash mumkin? yoki x^3*sin(x) hosilasi" maxlength="600">${e(APP.aiPrefill || "")}</textarea><button class="sendbtn" data-act="aiSend" aria-label="Yuborish">${I("send")}</button></div>
      <div class="chips mt-s">${[["Masala yechimi", "x^2 - 5x + 6 = 0"], ["Mavzuni tushuntir", "Bayes formulasi nima?"], ["Formulalar", "Hosila formulalari"], ["Test savollari", "Mashq ber"], ["Adabiyot tavsiyasi", "Matematik analiz bo'yicha adabiyot"], ["Nimani takrorlash kerak?", "Nimani takrorlashim kerak?"]].map(([t, q]) => `<button class="chip" data-act="aiFill" data-id="${e(q)}">${t}</button>`).join("")}</div></div>
    <div class="card"><div class="card-h"><h2>${chat.msgs.length ? e(chat.title || "Suhbat") : "AI yordamchi bilan misol"}</h2>${chat.msgs.length ? `<button class="link" data-act="aiNew">${I("plus", "sm")} Yangi suhbat</button>` : ""}</div>
      <div class="chat" id="chatBox">${chat.msgs.length ? chat.msgs.map(msgHtml).join("") : `${msgHtml({ role: "me", html: "Ikki o'zgaruvchili funksiya uchun hosilani qanday topish mumkin?" })}${msgHtml({ role: "ai", ...AI.answer("z = x^2 + y^2 xususiy hosila"), demo: true })}<p class="small muted center">Bu — namuna. Yuqoriga o'z savolingizni yozing.</p>`}</div></div>
    <div class="card"><div class="card-h"><h2>So'nggi suhbatlar</h2><span class="small muted">${list.length} ta</span></div>
      ${list.slice(0, 6).map((c) => `<div class="boxli click" data-act="aiOpen" data-id="${c.id}"><div class="ic-box">${ICONS[(AI.findTopic(c.title) || { id: "e" }).id[0]] || I("bot")}</div><div class="grow"><b>${e(c.title)}</b><div class="small muted">${e((c.msgs.find((m) => m.role === "ai") || {}).text || "").slice(0, 70)}…</div></div><span class="small muted">${U.rel(c.ts)}</span><button class="circ" data-act="aiDel" data-id="${c.id}" title="O'chirish">${I("trash", "sm")}</button></div>`).join("") || C.empty("Hali suhbatlar yo'q — birinchi savolingizni bering!", "bot")}</div></div>
  <aside class="stack"><div class="card"><h2 class="mb">${I("bolt")} Tezkor savollar</h2>${AI.QUICK.map((q) => `<div class="li click" data-act="aiAsk" data-id="${e(q)}"><span class="ic-box sm">${I("info", "sm")}</span><span class="t grow">${e(q)}</span></div>`).join("")}</div>
    <div class="promo"><div class="ic-box">${I("bulb")}</div><h3>Savollaring ko'pmi?</h3><p>AI yordamchiga istalgan vaqtda murojaat qilishing mumkin — hosila, integral, limit, matritsa, tenglama va statistika.</p><button class="btn light sm mt" data-act="aiAsk" data-id="yordam">Nimalar qila oladi? ${I("arrow", "sm")}</button></div>
    <div class="card"><h2 class="mb">${I("fire")} Mashhur mavzular</h2>${DATA.SUBJECTS.slice(0, 6).map((s, i) => `<div class="li click" data-act="aiAsk" data-id="${e(s.name)} asosiy tushunchalari">${C.subjIcon(s.id, "sm")}<span class="t grow">${e(s.name)}</span></div>`).join("")}</div>
    <div class="card"><h2 class="mb">${I("star")} Foydali maslahatlar</h2><p class="b">“Har bir katta natija — kichik qadamlar yig'indisidir.”</p><ul class="small muted" style="padding-left:18px"><li>Daraja: <b>^</b> (x^2), ko'paytma: <b>*</b></li><li>Aniq integral: «... 0 dan 1 gacha»</li><li>Matritsa: [[1,2],[3,4]]</li><li>Sistema: tenglamalarni «;» bilan ajrating</li></ul></div></aside></div>
  <div class="g g3 mt">${[["clock", "24/7", "Mavjud"], ["check", "+" + answered, "Yechilgan savol"], ["shield", "Offline", "Ma'lumotlar qurilmangizda"]].map(([i, v, t]) => `<div class="card pad-s kpi"><div class="ic-box">${I(i)}</div><div><b>${v}</b><small class="muted">${t}</small></div></div>`).join("")}</div>`;
};
function msgHtml(m) {
  if (m.role === "me") return `<div class="msg me"><div class="av sm">${e(U.initials((Store.current() || {}).first, (Store.current() || {}).last))}</div><div class="bub">${e(m.html)}</div></div>`;
  if (m.role === "ai" && !m.html) { const r = AI.answer(m.q || ""); m.html = r.html; m.actions = r.actions; if (!m.text) m.text = r.text; }
  if (m.role === "typing") return `<div class="msg"><div class="bot">${I("bot", "sm")}</div><div class="bub typing"><span></span><span></span><span></span></div></div>`;
  const acts = (m.actions || []).map((a) => a.href ? `<button class="btn sm soft" data-go="${e(a.href)}">${e(a.label)}</button>` : a.cmd.startsWith("test:") ? `<button class="btn sm soft" data-act="startTest" data-id="${e(a.cmd.slice(5))}">${e(a.label)}</button>` : `<button class="btn sm soft" data-act="aiAsk" data-id="${e(a.cmd.slice(4))}">${e(a.label)}</button>`).join("");
  return `<div class="msg"><div class="bot">${I("bot", "sm")}</div><div class="bub">${m.html}${acts ? `<div class="acts">${acts}</div>` : ""}
    ${m.demo ? "" : `<div class="meta"><span>${m.ts ? U.hm(m.ts) : ""}</span><button data-act="aiCopy" data-id="${m.id || ""}">${I("copy", "sm")} Nusxa olish</button><span class="grow"></span><span>Bu javob foydali bo'ldimi?</span><button class="${m.fb === 1 ? "on" : ""}" data-act="aiFb" data-id="${m.id}|1" aria-label="Ha">${I("up", "sm")}</button><button class="${m.fb === -1 ? "on" : ""}" data-act="aiFb" data-id="${m.id}|-1" aria-label="Yo'q">${I("dn", "sm")}</button></div>`}</div></div>`;
}
AFTER.ai = () => {
  APP.aiPrefill = ""; const ta = U.$("#aiIn"); const box = U.$("#chatBox"); if (box) box.scrollTop = box.scrollHeight;
  const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(160, ta.scrollHeight) + "px"; };
  ta.addEventListener("input", grow); grow();
  ta.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); A.aiSend(); } });
  U.$("#aiFile").addEventListener("change", (ev) => { const f = ev.target.files[0]; if (!f) return; if (f.size > 200000) return C.toast("Fayl hajmi 200 KB dan oshmasin.", "bad");
    const r = new FileReader(); r.onload = () => { const nums = (String(r.result).match(/-?\d+(?:[.,]\d+)?/g) || []).slice(0, 500); if (nums.length < 3) return C.toast("Faylda kamida 3 ta son bo'lishi kerak.", "bad"); ta.value = `statistika: ${nums.join(", ")}`; grow(); C.toast(`${nums.length} ta son o'qildi.`, "ok"); }; r.readAsText(f); });
  if (ta.value) ta.focus();
};
A.aiFill = (el) => { const ta = U.$("#aiIn"); ta.value = el.dataset.id; ta.focus(); };
A.aiAsk = (el) => { U.$("#aiIn").value = el.dataset.id; A.aiSend(); };
A.aiNew = () => { APP.chat = null; APP.render(); };
A.aiOpen = (el, ev) => { if (ev.target.closest("[data-act=aiDel]")) return; APP.chat = S.chats(Store.current().id).find((c) => c.id === el.dataset.id); APP.render(); window.scrollTo({ top: 300, behavior: "smooth" }); };
A.aiDel = (el) => ACT("deleteChat", el.dataset.id).then(() => { if (APP.chat && APP.chat.id === el.dataset.id) APP.chat = null; APP.render(); }).catch(fail);
A.aiSend = () => {
  const ta = U.$("#aiIn"); const q = ta.value.trim(); if (!q) return ta.focus();
  const chat = APP.chat || (APP.chat = { id: U.uid("ch"), title: "", msgs: [] });
  if (!chat.title) chat.title = q.slice(0, 60);
  chat.msgs.push({ role: "me", html: q, ts: Date.now() });
  ta.value = ""; APP.render();
  const box = U.$("#chatBox"); box.insertAdjacentHTML("beforeend", msgHtml({ role: "typing" })); box.scrollTop = box.scrollHeight;
  setTimeout(() => {
    const r = AI.answer(q);
    chat.msgs.push({ role: "ai", id: U.uid("m"), q, html: r.html, text: r.text, actions: r.actions, ts: Date.now(), fb: 0 });
    const draw = () => { if (location.hash === "#/ai") { APP.render(); const b = U.$("#chatBox"); if (b) b.scrollTop = b.scrollHeight; } };
    draw(); ACT("saveChat", chat, q).then(draw).catch(fail);
  }, 450);
};
A.aiCopy = (el) => { const m = (APP.chat || { msgs: [] }).msgs.find((x) => x.id === el.dataset.id); if (!m) return; (navigator.clipboard ? navigator.clipboard.writeText(m.text) : Promise.reject()).then(() => C.toast("Nusxa olindi.", "ok"), () => C.toast(m.text)); };
A.aiFb = (el) => { const [id, v] = el.dataset.id.split("|"); const m = (APP.chat || { msgs: [] }).msgs.find((x) => x.id === id); if (!m) return; m.fb = m.fb === +v ? 0 : +v; APP.render(); ACT("saveChat", APP.chat).then(() => { if (m.fb) C.toast("Rahmat! Fikringiz saqlandi.", "ok"); }).catch(fail); };

/* =============== ADABIYOTLAR =============== */
const BTYPES = ["Darslik", "O'quv qo'llanma", "Masalalar to'plami", "Ma'ruza", "Video dars", "Qo'shimcha manba"];
V.adabiyotlar = (u) => {
  const F = APP.bf || (APP.bf = { type: "", q: "", course: "", s: "", page: 1 });
  const all = S.books();
  const list = all.filter((b) => (!F.type || b.type === F.type) && (!F.course || b.course === +F.course) && (!F.s || b.s === F.s) && (!F.q || U.norm(b.title + " " + b.author).includes(U.norm(F.q))));
  let rec = all.slice();
  if (u.role === "student") { const w = DATA.SUBJECTS.map((s) => ({ s: s.id, p: S.subjectStats(u.id, s.id).progress })); rec.sort((a, b) => (w.find((x) => x.s === a.s) || {}).p - (w.find((x) => x.s === b.s) || {}).p); }
  rec = rec.slice(0, 8);
  const per = 7, pages = Math.max(1, Math.ceil(list.length / per)); F.page = Math.min(F.page, pages);
  const authors = [...new Map(all.filter((b) => !/jamoasi/.test(b.author)).map((b) => [b.author, b])).values()].slice(0, 5);
  return `<section class="hero"><div class="txt"><div class="kick">${I("book", "sm")} Adabiyotlar</div><h1>Kerakli adabiyotlar<br>bir joyda!</h1><p>Amaliy matematika bo'yicha darsliklar, qo'shimcha adabiyotlar va foydali manbalar — barchasi siz uchun.</p><button class="btn mt" data-act="scrollTo" data-id="allBooks">Kutubxonani ko'rish ${I("arrow", "sm")}</button></div><div class="art">${ART.books(320)}</div></section>
  <div class="split mt"><div class="stack"><div class="card pad-s"><div class="chips"><button class="chip ${!F.type ? "on" : ""}" data-act="bType" data-id="">Barchasi</button>${BTYPES.map((t) => `<button class="chip ${F.type === t ? "on" : ""}" data-act="bType" data-id="${e(t)}">${e(t)}</button>`).join("")}</div>
      <div class="row wrap mt-s"><div class="search grow" style="max-width:none">${I("search")}<input id="bQ" placeholder="Adabiyot nomi, muallif yoki mavzu..." value="${e(F.q)}"></div>
      <select class="in" id="bCourse" style="width:auto"><option value="">Barcha kurslar</option>${[1, 2, 3, 4].map((k) => `<option value="${k}" ${+F.course === k ? "selected" : ""}>${k}-kurs</option>`).join("")}</select>
      <select class="in" id="bSubj" style="width:auto"><option value="">Barcha fanlar</option>${DATA.SUBJECTS.map((s) => `<option value="${s.id}" ${F.s === s.id ? "selected" : ""}>${e(s.name)}</option>`).join("")}</select></div></div>
    <div class="card"><div class="card-h"><h2>${I("star")} Tavsiya etilgan adabiyotlar</h2>${u.role === "student" ? `<span class="small muted">Progressi pastroq fanlaringiz birinchi</span>` : ""}</div>
      <div class="g g4" style="gap:16px">${rec.map((b) => `<div class="bookc card pad-s"><div class="cv-wrap">${C.cover(b)}<span class="badge ${b.type === "Darslik" ? "g" : ""}">${e(b.type)}</span></div><b class="small mt-s">${e(b.title)}</b><div class="tiny muted">${e(b.author)}</div><div class="tiny muted">${e(b.type)} · ${b.course}-kurs</div><button class="btn sm" data-act="book" data-id="${b.id}">Ko'rish ${I("eye", "sm")}</button></div>`).join("")}</div></div>
    <div class="card" id="allBooks"><div class="card-h"><h2>Barcha adabiyotlar</h2><span class="small muted">Topildi: ${list.length}</span></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>№</th><th>Nomi</th><th class="hm">Muallif</th><th class="hm">Turi</th><th>Kurs</th><th>Amallar</th></tr></thead><tbody>
      ${list.slice((F.page - 1) * per, F.page * per).map((b, i) => `<tr><td>${(F.page - 1) * per + i + 1}</td><td class="b">${e(b.title)}</td><td class="hm">${e(b.author)}</td><td class="hm">${e(b.type)}</td><td>${b.course}-kurs</td><td><div class="row" style="gap:6px"><button class="circ" data-act="book" data-id="${b.id}" title="Ko'rish">${I("eye", "sm")}</button><button class="circ" data-act="bookDl" data-id="${b.id}" title="Annotatsiya va konspekt">${I("dl", "sm")}</button></div></td></tr>`).join("") || `<tr><td colspan="6">${C.empty("Hech narsa topilmadi")}</td></tr>`}</tbody></table></div>
      <div class="row between mt"><span class="small muted">Jami ${list.length} ta adabiyot</span><div class="pager"><button data-act="bPage" data-id="${F.page - 1}" ${F.page <= 1 ? "disabled" : ""}>${I("left", "sm")}</button>${Array.from({ length: pages }, (_, k) => `<button class="${F.page === k + 1 ? "on" : ""}" data-act="bPage" data-id="${k + 1}">${k + 1}</button>`).join("")}<button data-act="bPage" data-id="${F.page + 1}" ${F.page >= pages ? "disabled" : ""}>${I("right", "sm")}</button></div></div></div></div>
  <aside class="stack"><div class="card"><h2 class="mb">${I("bolt")} Tezkor havolalar</h2>${[["book", "Darslik", "Asosiy darsliklar"], ["test", "Masalalar to'plami", "Amaliy masalalar va yechimlar"], ["file", "Ma'ruza", "Ma'ruza matnlari"], ["play", "Video dars", "Tushunarli va qiziqarli darslar"]].map(([i, t, s]) => `<div class="li click" data-act="bType" data-id="${e(t)}"><span class="ic-box sm">${I(i, "sm")}</span><div class="grow"><div class="t">${e(t)}</div><div class="s">${s}</div></div></div>`).join("")}</div>
    <div class="promo"><div class="ic-box">${I("book")}</div><h3>Sizga kerakli adabiyot topilmadimi?</h3><p>Bizga taklif qiling, kutubxonani birgalikda boyitamiz!</p><button class="btn light sm mt" data-act="suggest">Taklif qilish ${I("arrow", "sm")}</button></div>
    <div class="card"><h2 class="mb">${I("users")} Mashhur mualliflar</h2>${authors.map((b) => `<div class="li click" data-act="bSearch" data-id="${e(b.author)}"><div class="av sm">${e(b.author.replace(/[^A-ZА-Я]/g, "").slice(0, 2))}</div><div class="grow"><div class="t">${e(b.author)}</div><div class="s">${e(S.subj(b.s).name)}</div></div></div>`).join("")}</div>
    <div class="card"><h2 class="mb">${I("cap")} Kurslar bo'yicha</h2>${[1, 2, 3, 4].map((k) => `<div class="boxli click" data-act="bCourse" data-id="${k}"><span class="ic-box sm">${I("book", "sm")}</span><div class="grow"><b>${k}-kurs</b><div class="small muted">${all.filter((b) => b.course === k).length} ta adabiyot</div></div>${I("right", "sm")}</div>`).join("")}</div></aside></div>`;
};
AFTER.adabiyotlar = () => {
  const F = APP.bf; const q = U.$("#bQ");
  q.addEventListener("input", U.debounce(() => { F.q = q.value; F.page = 1; APP.render(); const n = U.$("#bQ"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300));
  U.$("#bCourse").onchange = (ev) => { F.course = ev.target.value; F.page = 1; APP.render(); };
  U.$("#bSubj").onchange = (ev) => { F.s = ev.target.value; F.page = 1; APP.render(); };
};
A.bType = (el) => { APP.bf.type = el.dataset.id; APP.bf.page = 1; APP.render(); };
A.bPage = (el) => { APP.bf.page = +el.dataset.id; APP.render(); };
A.bSearch = (el) => { APP.bf.q = el.dataset.id; APP.bf.page = 1; APP.render(); };
A.bCourse = (el) => { APP.bf.course = el.dataset.id; APP.bf.page = 1; APP.render(); A.scrollTo({ dataset: { id: "allBooks" } }); };
const bookText = (b) => `${b.title}\nMuallif: ${b.author}\nTuri: ${b.type} · ${b.course}-kurs · ${S.subj(b.s).name}\n\nAnnotatsiya:\n${b.about || "—"}\n\nMundarija:\n${(b.toc || []).map((t, i) => `  ${i + 1}. ${t}`).join("\n")}\n\n\n${S.konspekt(b.s)}`;
A.book = (el) => {
  const b = S.books().find((x) => x.id === el.dataset.id); if (!b) return;
  C.modal(`<div class="row top wrap" style="gap:22px"><div style="width:170px">${C.cover(b)}</div><div class="grow" style="min-width:240px"><span class="badge">${e(b.type)}</span><h2 class="mt-s">${e(b.title)}</h2><p class="muted">${e(b.author)} · ${b.course}-kurs · ${e(S.subj(b.s).name)}</p>
    <p class="mt">${e(b.about || "")}</p>${(b.toc || []).length ? `<h3 class="mt">Mundarija</h3><ol class="small">${b.toc.map((t) => `<li>${e(t)}</li>`).join("")}</ol>` : ""}
    <h3 class="mt">Bog'liq mavzular</h3><div class="row wrap mt-s">${S.topicsOf(b.s).slice(0, 5).map((t) => `<button class="chip" data-go="#/fan/${b.s}/${t.id}">${e(t.name)}</button>`).join("")}</div>
    <div class="row wrap mt"><button class="btn" data-act="bookDl" data-id="${b.id}">${I("dl", "sm")} Annotatsiya va konspekt</button><button class="btn ghost" data-go="#/fan/${b.s}">Fanni ochish</button></div>
    <p class="tiny muted mt-s">To'liq matn nashriyot huquqlari tufayli universitet kutubxonasi orqali beriladi; platformada annotatsiya va fan konspekti mavjud.</p></div></div>`, true);
};
A.bookDl = (el) => { const b = S.books().find((x) => x.id === el.dataset.id); document.querySelectorAll(".ov").forEach((o) => o.remove()); C.download(`${b.title.replace(/[^\wА-Яа-яʻ' -]/g, "").slice(0, 50)}.txt`, bookText(b)); };
A.suggest = () => {
  const ov = C.modal(`<h2>Adabiyot taklif qilish</h2><p class="muted mt-s">Taklifingiz administratorga yuboriladi.</p>
    <div class="field mt"><label>Nomi</label><input class="in" id="sgT" maxlength="120"></div><div class="field"><label>Muallif</label><input class="in" id="sgA" maxlength="80"></div><div class="field"><label>Izoh</label><textarea class="in" id="sgN" maxlength="300" placeholder="Nega foydali?"></textarea></div><div class="err" id="sgE"></div><button class="btn block" id="sgB">Yuborish</button>`);
  ov.querySelector("#sgB").onclick = () => ACT("suggestBook", { title: ov.querySelector("#sgT").value, author: ov.querySelector("#sgA").value, note: ov.querySelector("#sgN").value })
    .then(() => { ov.remove(); C.toast("Rahmat! Taklifingiz yuborildi.", "ok"); }).catch((err) => { ov.querySelector("#sgE").textContent = err.message; });
};

/* =============== PROGRESS =============== */
V.progress = (u) => {
  const o = S.overall(u.id), stats = DATA.SUBJECTS.map((s) => ({ s, x: S.subjectStats(u.id, s.id) }));
  const days = APP.tlDays || 7, tl = S.timeline(u.id, days), km = S.knowledgeMap(u.id), goals = S.goals(u.id), att = S.attemptsOf(u.id), st = S.streak(u.id);
  const todayAt = att.filter((a) => U.dayKey(new Date(a.finishedAt)) === U.dayKey()).length, todayL = Object.values(Store.get().learned[u.id] || {}).filter((ts) => U.dayKey(new Date(ts)) === U.dayKey()).length;
  const colors = ["", "g", "o", "", "bl", "r", ""];
  const lvlBg = { new: "var(--card2)", weak: "var(--rsoft)", review: "var(--osoft)", mid: "var(--bsoft)", good: "var(--gsoft)" }, lvlFg = { new: "var(--muted)", weak: "var(--red)", review: "var(--orange)", mid: "var(--blue)", good: "var(--green)" };
  return `<section class="hero"><div class="txt"><div class="kick">${I("target", "sm")} Mening progressim</div><h1>Sizning o'sishingiz<br>biz uchun muhim!</h1><p>Har bir kichik qadam — katta natijaga olib boradi. Sizning yutuqlaringiz shu yerda.</p>
    <div class="chips-info">${[["book", "Jami o'qilgan mavzular", `${o.learned} / ${o.total}`], ["check", "Bajarilgan testlar", o.tests], ["trend", "Umumiy progress", o.progress + "%"], ["fire", "Faollik seriyasi", st + " kun"]].map(([i, k, v]) => `<div class="info"><div class="ic">${I(i, "sm")}</div><div><small>${k}</small><b>${v}</b></div></div>`).join("")}</div></div><div class="art">${ART.growth(300)}</div></section>
  <div class="split mt"><div class="stack">
    <div class="card"><h2 class="mb">Umumiy progress</h2><div class="row wrap" style="gap:28px"><div class="center">${C.ring(o.progress, 150, 14)}<div class="small muted mt-s">Umumiy progress</div></div>
      <div class="grow" style="min-width:240px">${stats.slice(0, 5).map(({ s, x }, i) => `<div class="li" style="border:0;padding:7px 0">${C.subjIcon(s.id, "sm")}<div class="grow"><div class="row between small"><b>${e(s.name)}</b><b>${x.progress}%</b></div>${C.bar(x.progress, colors[i])}</div></div>`).join("")}</div></div></div>
    <div class="card"><div class="card-h"><div><h2>${I("brain")} Bilim xaritasi</h2><p class="small muted">Har bir mavzu: oxirgi javoblar aniqligi × xotirada saqlanish (Ebbinghaus egri chizig'i)</p></div></div>
      <div class="row wrap small mb-s" style="gap:10px">${Object.entries(S.LEVELS).map(([k, l]) => `<span class="row" style="gap:6px"><i style="width:12px;height:12px;border-radius:4px;background:${lvlBg[k]};border:1px solid ${lvlFg[k]}"></i>${l.label}</span>`).join("")}</div>
      <div class="kmap">${km.map((m) => `<div class="cell" style="background:${lvlBg[m.level]};color:${lvlFg[m.level]}" data-go="#/fan/${m.topic.s}/${m.tid}" title="${e(m.topic.name)} — ${S.LEVELS[m.level].label}">${e(m.topic.name)}<small>${m.score}% · ${e(S.subj(m.topic.s).name)}</small></div>`).join("")}</div></div>
    <div class="card"><div class="card-h"><h2>Fanlar bo'yicha progress</h2></div>${stats.map(({ s, x }, i) => `<div class="li click" data-go="#/fan/${s.id}">${C.subjIcon(s.id, "sm")}<div class="grow"><div class="t">${e(s.name)}</div>${C.bar(x.progress, colors[i])}</div><b class="small">${x.progress}%</b><span class="small muted" style="width:70px;text-align:right">${x.learned} / ${x.total}</span>${I("right", "sm")}</div>`).join("")}</div>
    <div class="card"><div class="card-h"><h2>O'sish dinamikasi</h2><select class="in" id="tlSel" style="width:auto"><option value="7" ${days === 7 ? "selected" : ""}>So'nggi 7 kun</option><option value="14" ${days === 14 ? "selected" : ""}>So'nggi 14 kun</option><option value="30" ${days === 30 ? "selected" : ""}>So'nggi 30 kun</option></select></div>
      ${C.lineChart(tl)}<p class="tiny muted">Har bir nuqta — o'sha kungacha bo'lgan 14 kunlik oynadagi to'g'ri javoblar ulushi.</p></div>
    <div class="card"><div class="card-h"><h2>${I("trophy")} Yutuqlar</h2></div><div class="ach-list">${S.achievements(u.id).map((a) => `<div class="ach ${a.on ? "" : "off"}"><div class="ic-box ${a.on ? "o" : ""}">${I(a.ic)}</div>${e(a.t)}</div>`).join("")}</div></div>
    <div class="banner"><div class="ic-box lg">${I("trophy", "lg")}</div><div><h2>Sizning natijalaringiz</h2><p>Bugun siz ${todayAt} ta test yechdingiz va ${todayL} ta mavzuni o'rgandingiz. ${todayAt + todayL ? "Ajoyib natija!" : "Kichik qadamdan boshlang!"}</p></div><button class="btn light" data-act="startTest" data-id="adaptive">Davom etish ${I("arrow", "sm")}</button></div></div>
  <aside class="stack"><div class="card"><div class="card-h"><h2>Bugungi faollik</h2>${I("cal")}</div><div class="small muted mb-s">${U.dateLong(Date.now())}</div>
      ${S.events(u.id, U.dayKey()).map((x) => `<div class="li"><span class="ic-box sm">${I(x.kind === "test" || x.kind === "assign" ? "test" : "book", "sm")}</span><div class="grow"><div class="t">${e(x.title)}</div><div class="s">${e(x.sub)}</div></div>${x.done ? `<span class="badge g">${I("check", "sm")}</span>` : `<span class="tag">${e(x.time)}</span>`}</div>`).join("") || C.empty("Bugun reja yo'q")}
      <div class="li click" data-go="#/ai"><span class="ic-box sm">${I("bot", "sm")}</span><div class="grow"><div class="t">AI yordamchi</div><div class="s">Savol so'radingizmi?</div></div>${I("right", "sm")}</div></div>
    <div class="promo"><div class="row between"><div><h3>AI yordamchi</h3><p>Savollaringizga javob beramiz, masalalarni yechishga yordam beramiz!</p></div></div><button class="btn light sm mt" data-go="#/ai">Savol berish ${I("arrow", "sm")}</button></div>
    <div class="card"><div class="card-h"><h2>So'nggi natijalar</h2><a data-go="#/testlar">Barchasi ${I("arrow", "sm")}</a></div>${att.slice(0, 4).map((a) => `<div class="li click" data-go="#/natija/${a.id}">${C.subjIcon(a.s, "sm")}<div class="grow"><div class="t">${e(a.title)}</div><div class="s">${a.score} / ${a.total} · ${a.pct}% · ${U.dateLong(a.finishedAt)}</div></div>${C.gradeBadge(a.pct)}</div>`).join("") || C.empty("Natijalar yo'q")}</div>
    <div class="card"><div class="card-h"><h2>Maqsadlar</h2><span class="small muted">${goals.filter((g) => g.done).length} / ${goals.length}</span></div>
      ${goals.map((g) => `<div class="li"><span class="ic-box sm ${g.done ? "g" : ""}">${I(g.done ? "check" : "target", "sm")}</span><div class="grow"><div class="t">${e(g.title)}</div><div class="row">${C.bar(g.p, g.done ? "g" : "")}<b class="small">${g.p}%</b></div><div class="s">${e(g.note)}</div></div><button class="circ" data-act="goalDel" data-id="${g.id}" title="O'chirish">${I("trash", "sm")}</button></div>`).join("") || C.empty("Maqsad qo'yilmagan", "target")}
      <button class="btn soft block mt-s" data-act="goalAdd">${I("plus", "sm")} Yangi maqsad qo'yish</button></div>
    <div class="card"><div class="card-h"><h2>Top talabalar</h2></div>${S.leaderboard().slice(0, 5).map((x, i) => lbRow(x, i)).join("")}</div></aside></div>`;
};
AFTER.progress = () => { U.$("#tlSel").onchange = (ev) => { APP.tlDays = +ev.target.value; APP.render(); }; };
A.goalDel = (el) => ACT("removeGoal", el.dataset.id).then(() => APP.render()).catch(fail);
A.goalAdd = () => {
  const ov = C.modal(`<h2>Yangi maqsad</h2><div class="field mt"><label>Maqsad turi</label><select class="in" id="gT"><option value="subject">Fanni to'liq o'rganish</option><option value="tests">N ta test yechish</option><option value="score">O'rtacha natijaga erishish (%)</option></select></div>
    <div class="field"><label>Fan</label><select class="in" id="gS">${DATA.SUBJECTS.map((s) => `<option value="${s.id}">${e(s.name)}</option>`).join("")}</select></div><div class="field" id="gNw"><label>Qiymat</label><input class="in" id="gN" type="number" min="1" max="100" value="3"></div><div class="err" id="gE"></div><button class="btn block" id="gB">Saqlash</button>`);
  const sync = () => (ov.querySelector("#gNw").style.display = ov.querySelector("#gT").value === "subject" ? "none" : ""); ov.querySelector("#gT").onchange = sync; sync();
  ov.querySelector("#gB").onclick = () => ACT("addGoal", { type: ov.querySelector("#gT").value, s: ov.querySelector("#gS").value, target: ov.querySelector("#gN").value })
    .then(() => { ov.remove(); C.toast("Maqsad qo'shildi.", "ok"); APP.render(); }).catch((err) => { ov.querySelector("#gE").textContent = err.message; });
};

/* =============== KALENDAR =============== */
V.kalendar = (u) => {
  const sel = APP.calSel || U.dayKey(); const d = U.fromKey(sel); const ym = APP.calYM || [d.getFullYear(), d.getMonth()];
  const evDays = new Set(S.events(u.id).map((x) => x.date)), list = S.events(u.id, sel), upcoming = S.events(u.id).filter((x) => x.date > U.dayKey() && !x.done).slice(0, 6);
  return `<div class="split"><div class="stack"><div class="card"><div class="card-h"><h2>${U.OYLAR_B[ym[1]]} ${ym[0]}</h2><div class="row"><button class="circ" data-act="calM" data-id="-1">${I("left", "sm")}</button><button class="btn sm ghost" data-act="calToday">Bugun</button><button class="circ" data-act="calM" data-id="1">${I("right", "sm")}</button></div></div>
    <div style="max-width:520px;margin:auto">${C.calendar(ym[0], ym[1], sel, evDays)}</div></div>
    <div class="card"><div class="card-h"><h2>${U.dateLong(d)}</h2><button class="btn sm" data-act="addEvent" data-id="${sel}">${I("plus", "sm")} Vazifa qo'shish</button></div>
      ${list.map((x) => `<div class="li"><button class="ic-box sm ${x.done ? "g" : ""}" style="border:0;cursor:pointer" data-act="toggleEvent" data-id="${x.id}">${I(x.done ? "check" : "clock", "sm")}</button><div class="grow"><div class="t" style="${x.done ? "text-decoration:line-through;opacity:.6" : ""}">${e(x.title)}</div><div class="s">${e(x.sub)}</div></div><span class="timepill">${e(x.time)}</span>
        ${x.kind === "test" || x.kind === "assign" ? `<button class="btn sm soft" data-act="startTest" data-id="${x.kind === "assign" ? "as:" + x.ref : x.ref}">Boshlash</button>` : ""}${x.kind === "own" ? `<button class="circ" data-act="delEvent" data-id="${x.id}">${I("trash", "sm")}</button>` : ""}</div>`).join("") || C.empty("Bu kunga vazifa yo'q", "cal")}</div></div>
  <aside class="stack"><div class="card"><h2 class="mb">Yaqin rejalar</h2>${upcoming.map((x) => `<div class="li click" data-act="calPick" data-id="${x.date}"><span class="ic-box sm">${I("cal", "sm")}</span><div class="grow"><div class="t">${e(x.title)}</div><div class="s">${U.dateLong(U.fromKey(x.date))}, ${e(x.time)}</div></div></div>`).join("") || C.empty("Reja yo'q")}</div>${C.quote(0)}</aside></div>`;
};
A.calPick = (el) => { APP.calSel = el.dataset.id; const d = U.fromKey(el.dataset.id); APP.calYM = [d.getFullYear(), d.getMonth()]; if (location.hash !== "#/kalendar") APP.go("#/kalendar"); else APP.render(); };
A.calM = (el) => { const [y, m] = APP.calYM || [new Date().getFullYear(), new Date().getMonth()]; const d = new Date(y, m + +el.dataset.id, 1); APP.calYM = [d.getFullYear(), d.getMonth()]; APP.render(); };
A.calToday = () => { APP.calSel = U.dayKey(); APP.calYM = null; APP.render(); };
A.toggleEvent = (el) => ACT("toggleEvent", el.dataset.id).then(() => APP.render()).catch(fail);
A.delEvent = (el) => ACT("removeEvent", el.dataset.id).then(() => APP.render()).catch(fail);
A.addEvent = (el) => {
  const ov = C.modal(`<h2>Yangi vazifa</h2><div class="field mt"><label>Nomi</label><input class="in" id="eT" maxlength="80" placeholder="Masalan: Integral mavzusini takrorlash"></div><div class="field"><label>Izoh</label><input class="in" id="eS" maxlength="100"></div>
    <div class="g g2" style="gap:12px"><div class="field"><label>Sana</label><input class="in" id="eD" type="date" value="${e(el.dataset.id || U.dayKey())}"></div><div class="field"><label>Vaqt</label><input class="in" id="eH" type="time" value="18:00"></div></div><div class="err" id="eE"></div><button class="btn block" id="eB">Saqlash</button>`);
  ov.querySelector("#eB").onclick = () => ACT("addEvent", { title: ov.querySelector("#eT").value, sub: ov.querySelector("#eS").value, date: ov.querySelector("#eD").value, time: ov.querySelector("#eH").value })
    .then(() => { ov.remove(); C.toast("Vazifa qo'shildi.", "ok"); APP.render(); }).catch((err) => { ov.querySelector("#eE").textContent = err.message; });
};

/* =============== SOZLAMALAR =============== */
V.sozlamalar = (u) => {
  const log = Store.get().secLog.filter((l) => l.email === u.email).slice(0, 5);
  return `<h1 class="mb">Sozlamalar</h1><div class="split"><div class="stack"><div class="card"><h2 class="mb">Profil</h2>
    <div class="g g2" style="gap:12px"><div class="field"><label>Ism</label><input class="in" id="pF" value="${e(u.first)}" maxlength="40"></div><div class="field"><label>Familiya</label><input class="in" id="pL" value="${e(u.last)}" maxlength="40"></div></div>
    <div class="field"><label>Email</label><input class="in" value="${e(u.email)}" disabled></div>
    ${u.role === "student" ? `<div class="field"><label>Universitet</label><select class="in" id="pU">${DATA.UNIVERSITIES.map((x) => `<option ${x === u.uni ? "selected" : ""}>${e(x)}</option>`).join("")}</select></div>
    <div class="g g3" style="gap:12px"><div class="field"><label>Yo'nalish</label><select class="in" id="pFa">${DATA.FACULTIES.map((x) => `<option ${x === u.faculty ? "selected" : ""}>${e(x)}</option>`).join("")}</select></div><div class="field"><label>Kurs</label><select class="in" id="pC">${[1, 2, 3, 4].map((k) => `<option value="${k}" ${+u.course === k ? "selected" : ""}>${k}-kurs</option>`).join("")}</select></div><div class="field"><label>Guruh</label><input class="in" id="pG" value="${e(u.group)}" maxlength="20"></div></div>` : ""}
    <div class="err" id="pE"></div><button class="btn" data-act="saveProfile">Saqlash</button></div>
    <div class="card"><h2 class="mb">Parolni o'zgartirish</h2><div class="field"><label>Joriy parol</label><input class="in" type="password" id="pwO" autocomplete="current-password"></div><div class="g g2" style="gap:12px"><div class="field"><label>Yangi parol</label><input class="in" type="password" id="pwN" autocomplete="new-password"></div><div class="field"><label>Takrorlang</label><input class="in" type="password" id="pwN2" autocomplete="new-password"></div></div><div class="err" id="pwE"></div><button class="btn" data-act="savePw">Parolni yangilash</button></div></div>
  <aside class="stack"><div class="card"><h2 class="mb">Ko'rinish</h2><div class="seg"><button class="${!APP.isDark() ? "on" : ""}" data-act="setTheme" data-id="light">${I("sun", "sm")} Yorug'</button><button class="${APP.isDark() ? "on" : ""}" data-act="setTheme" data-id="dark">${I("moon", "sm")} Qorong'i</button></div></div>
    <div class="card"><h2 class="mb">${I("shield")} Xavfsizlik</h2><p class="small muted">${SERVER ? "Parol serverda scrypt algoritmi va tasodifiy tuz bilan xeshlanadi." : "Parol SHA-256 + tasodifiy tuz (salt) bilan 1000 marta xeshlanadi."} 5 ta xato urinishdan so'ng hisob 5 daqiqaga bloklanadi. Sessiya muddati: ${U.rel(Store.get().session.exp)} gacha.</p>
      <h3 class="mt">So'nggi kirishlar</h3>${log.map((l) => `<div class="li"><span class="ic-box sm ${l.ok ? "g" : "r"}">${I(l.ok ? "check" : "x", "sm")}</span><div class="grow small">${l.ok ? "Muvaffaqiyatli kirish" : "Noto'g'ri parol"}<div class="s">${U.rel(l.ts)}</div></div></div>`).join("") || C.empty("Ma'lumot yo'q")}</div>
    <div class="card"><h2 class="mb">Ma'lumotlarim</h2><p class="small muted">${SERVER ? "Ma'lumotlaringiz PM Edu serverida saqlanadi va faqat sizga hamda ustozingizga ko'rinadi." : "Barcha ma'lumotlar faqat shu qurilmada saqlanadi."}${Store.isPersistent() ? "" : " (Brauzer xotirasi yopiq — sahifa yopilganda ma'lumotlar tozalanadi.)"}</p><button class="btn ghost block mt-s" data-act="exportMe">${I("dl", "sm")} Ma'lumotlarimni yuklab olish (JSON)</button></div></aside></div>`;
};
A.saveProfile = () => {
  const u = Store.need(); const o = { first: U.$("#pF").value, last: U.$("#pL").value };
  if (u.role === "student") Object.assign(o, { uni: U.$("#pU").value, faculty: U.$("#pFa").value, course: U.$("#pC").value, group: U.$("#pG").value });
  ACT("updateProfile", o).then(() => { C.toast("Profil saqlandi.", "ok"); APP.render(); }).catch((err) => { U.$("#pE").textContent = err.message; });
};
A.savePw = () => { if (U.$("#pwN").value !== U.$("#pwN2").value) return (U.$("#pwE").textContent = "Yangi parollar mos emas."); ACT("changePassword", { old: U.$("#pwO").value, new: U.$("#pwN").value }).then(() => { C.toast("Parol yangilandi.", "ok"); APP.render(); }).catch((err) => { U.$("#pwE").textContent = err.message; }); };
A.setTheme = (el) => { APP.setTheme(el.dataset.id); APP.render(); };
A.exportMe = () => { const u = Store.need(), d = Store.get(); const { salt, hash, ...pub } = u;
  C.download("pm-edu-malumotlarim.json", JSON.stringify({ profil: pub, urinishlar: d.attempts.filter((a) => a.uid === u.id), organilgan: d.learned[u.id], maqsadlar: d.goals.filter((g) => g.uid === u.id), vazifalar: d.events.filter((x) => x.uid === u.id), suhbatlar: d.chats.filter((c) => c.uid === u.id) }, null, 2), "application/json"); };

/* =============== USTOZ PANELI =============== */
V.ustoz = (u) => {
  const groups = [...new Set(Store.get().users.filter((x) => x.role === "student" && x.group).map((x) => x.group))].sort();
  const g = APP.tGroup ?? "", cs = S.classStats(g), asg = S.assignmentsFor(u), ns = APP.newAs || (APP.newAs = { s: "analiz", topics: [] });
  const avg = cs.studs.length ? Math.round(cs.studs.reduce((x, s) => x + s.o.avgPct, 0) / cs.studs.length) : 0;
  const hard = cs.byT.filter((t) => t.acc != null).sort((a, b) => a.acc - b.acc);
  return `<section class="hero" style="min-height:0"><div class="txt"><div class="kick">${I("users", "sm")} Ustoz paneli</div><h1>Xush kelibsiz, ${e(u.first)} ${e(u.last)}!</h1><p>Guruhlar natijalarini kuzating, test topshiriqlari bering va qiyin mavzularni aniqlang.</p></div><div class="art">${ART.test(260)}</div></section>
  <div class="g g4 mt">${[["users", "Talabalar", cs.studs.length], ["test", "Topshiriqlar", asg.length], ["star", "Guruh o'rtachasi", avg + "%"], ["bulb", "Eng qiyin mavzu", hard[0] ? hard[0].t.name : "—"]].map(([i, t, v]) => `<div class="card pad-s kpi"><div class="ic-box">${I(i)}</div><div class="grow" style="min-width:0"><small class="muted">${t}</small><b style="font-size:${String(v).length > 12 ? 13 : 22}px">${e(v)}</b></div></div>`).join("")}</div>
  <div class="split mt"><div class="stack">
    <div class="card"><div class="card-h"><h2>Guruh natijalari</h2><div class="row"><select class="in" id="tGrp" style="width:auto"><option value="">Barcha guruhlar</option>${groups.map((x) => `<option ${x === g ? "selected" : ""}>${e(x)}</option>`).join("")}</select><button class="btn sm ghost" data-act="csvClass">${I("dl", "sm")} CSV</button></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Talaba</th><th class="hm">Guruh</th><th>Testlar</th><th>O'rtacha</th><th class="hm">Progress</th><th class="hm">Seriya</th></tr></thead><tbody>
      ${cs.studs.sort((a, b) => b.o.avgPct - a.o.avgPct).map(({ s, o, st }) => `<tr><td><div class="row"><div class="av sm">${e(U.initials(s.first, s.last))}</div><b>${e(s.last)} ${e(s.first)}</b></div></td><td class="hm">${e(s.group || "—")}</td><td>${o.tests}</td><td>${C.gradeBadge(o.avgPct)} <b>${o.avgPct}%</b></td><td class="hm" style="min-width:120px">${C.bar(o.progress)}<span class="tiny muted">${o.progress}%</span></td><td class="hm">${st} kun</td></tr>`).join("")}</tbody></table></div></div>
    <div class="card"><div class="card-h"><div><h2>${I("bulb")} Qiyin mavzular</h2><p class="small muted">Guruh bo'yicha to'g'ri javoblar ulushi eng past mavzular — darsda qayta ko'rib chiqish tavsiya etiladi</p></div></div>
      ${hard.slice(0, 6).map((t) => `<div class="li"><div class="grow"><div class="row between small"><b>${e(t.t.name)}</b><b>${t.acc}%</b></div><div class="tiny muted">${e(S.subj(t.t.s).name)} · ${t.n} ta javob</div>${C.bar(t.acc, t.acc < 50 ? "r" : t.acc < 70 ? "o" : "g")}</div></div>`).join("") || C.empty("Hali ma'lumot yo'q")}</div>
    <div class="card"><div class="card-h"><h2>Mening topshiriqlarim</h2></div>${asg.map((a) => { const rs = S.assignmentResults(a.id), done = rs.filter((r) => r.at); return `<div class="boxli">${C.subjIcon(a.s)}<div class="grow"><b>${e(a.title)}</b><div class="small muted">${e(a.group || "Barcha guruhlar")} · ${a.qids.length} savol · muddat ${U.dateLong(U.fromKey(a.deadline))}</div>${C.bar(U.pct(done.length, rs.length), "g")}<div class="tiny muted">Topshirdi: ${done.length} / ${rs.length}${done.length ? ` · o'rtacha ${Math.round(done.reduce((x, r) => x + r.at.pct, 0) / done.length)}%` : ""}</div></div><button class="btn sm soft" data-act="asRes" data-id="${a.id}">Natijalar</button><button class="circ" data-act="asDel" data-id="${a.id}" title="O'chirish">${I("trash", "sm")}</button></div>`; }).join("") || C.empty("Topshiriq berilmagan")}</div></div>
  <aside class="stack"><div class="card"><h2 class="mb">${I("plus")} Yangi test topshirig'i</h2>
    <div class="field"><label>Nomi</label><input class="in" id="nT" maxlength="80" placeholder="Masalan: Limitlar bo'yicha nazorat" value="${e(ns.title || "")}"></div>
    <div class="field"><label>Fan</label><select class="in" id="nS">${DATA.SUBJECTS.map((s) => `<option value="${s.id}" ${ns.s === s.id ? "selected" : ""}>${e(s.name)}</option>`).join("")}</select></div>
    <div class="field"><label>Mavzular</label>${S.topicsOf(ns.s).map((t) => `<label class="check"><input type="checkbox" class="nTop" value="${t.id}" ${ns.topics.includes(t.id) ? "checked" : ""}> ${e(t.name)}</label>`).join("")}</div>
    <div class="g g2" style="gap:10px"><div class="field"><label>Savollar</label><input class="in" id="nC" type="number" min="3" max="20" value="${ns.count || 6}"></div><div class="field"><label>Daqiqa</label><input class="in" id="nM" type="number" min="5" max="90" value="${ns.minutes || 15}"></div></div>
    <div class="field"><label>Muddat</label><input class="in" id="nD" type="date" value="${e(ns.deadline || U.dayKey(new Date(Date.now() + 3 * 864e5)))}" min="${U.dayKey()}"></div>
    <div class="field"><label>Guruh</label><select class="in" id="nG"><option value="">Barcha guruhlar</option>${groups.map((x) => `<option ${x === ns.group ? "selected" : ""}>${e(x)}</option>`).join("")}</select></div>
    <div class="err" id="nE"></div><button class="btn block" data-act="asCreate">Topshiriq berish</button><p class="tiny muted mt-s">Savollar tanlangan mavzular bankidan tasodifiy olinadi; talabalarga bildirishnoma va kalendar yozuvi yuboriladi.</p></div></aside></div>`;
};
const readAs = () => ({ title: U.$("#nT").value, s: U.$("#nS").value, topics: U.$$(".nTop:checked").map((x) => x.value), count: U.$("#nC").value, minutes: U.$("#nM").value, deadline: U.$("#nD").value, group: U.$("#nG").value });
AFTER.ustoz = () => {
  U.$("#tGrp").onchange = (ev) => { APP.tGroup = ev.target.value; APP.render(); };
  U.$("#nS").onchange = () => { APP.newAs = { ...readAs(), topics: [] }; APP.render(); };
};
A.asCreate = () => ACT("createAssignment", readAs()).then((r) => { APP.newAs = null; C.toast(`Topshiriq ${r.n} ta talabaga yuborildi.`, "ok"); APP.render(); }).catch((err) => { U.$("#nE").textContent = err.message; });
A.asDel = (el) => C.ask("Topshiriqni o'chirasizmi?", () => ACT("deleteAssignment", el.dataset.id).then(() => APP.render()).catch(fail), "O'chirish");
A.asRes = (el) => {
  const a = Store.get().assignments.find((x) => x.id === el.dataset.id); const rs = S.assignmentResults(a.id);
  const ov = C.modal(`<h2>${e(a.title)}</h2><p class="muted">${e(S.subj(a.s).name)} · ${a.qids.length} savol · muddat ${U.dateLong(U.fromKey(a.deadline))}</p>
    <div class="tbl-wrap mt"><table class="tbl"><thead><tr><th>Talaba</th><th>Guruh</th><th>Natija</th><th>Vaqt</th></tr></thead><tbody>${rs.map((r) => `<tr><td class="b">${e(r.s.last)} ${e(r.s.first)}</td><td>${e(r.s.group || "—")}</td><td>${r.at ? `${C.gradeBadge(r.at.pct)} <b>${r.at.pct}%</b>` : '<span class="badge gr">Topshirmagan</span>'}</td><td class="small muted">${r.at ? U.rel(r.at.finishedAt) : "—"}</td></tr>`).join("")}</tbody></table></div>
    <button class="btn ghost mt" id="asCsv">${I("dl", "sm")} CSV yuklab olish</button>`, true);
  ov.querySelector("#asCsv").onclick = () => C.download(`${a.title}.csv`, S.csv([["Talaba", "Guruh", "Natija %", "To'g'ri", "Jami", "Vaqt"], ...rs.map((r) => [`${r.s.last} ${r.s.first}`, r.s.group, r.at ? r.at.pct : "", r.at ? r.at.score : "", r.at ? r.at.total : "", r.at ? new Date(r.at.finishedAt).toLocaleString() : "topshirmagan"])]), "text/csv;charset=utf-8");
};
A.csvClass = () => { const cs = S.classStats(APP.tGroup || ""); C.download("guruh-natijalari.csv", S.csv([["Talaba", "Email", "Guruh", "Testlar", "O'rtacha %", "Progress %", "O'rganilgan mavzular"], ...cs.studs.map(({ s, o }) => [`${s.last} ${s.first}`, s.email, s.group, o.tests, o.avgPct, o.progress, o.learned])]), "text/csv;charset=utf-8"); };

/* =============== ADMIN =============== */
V.admin = (u) => {
  const st = S.platformStats(), d = Store.get();
  return `<section class="hero" style="min-height:0"><div class="txt"><div class="kick">${I("shield", "sm")} Administrator paneli</div><h1>Platforma boshqaruvi</h1><p>Foydalanuvchilar, adabiyotlar, takliflar va xavfsizlik jurnali.</p></div><div class="art">${ART.growth(240)}</div></section>
  <div class="g g4 mt">${[["users", "Foydalanuvchilar", `${st.users} (${st.students} talaba, ${st.teachers} ustoz)`], ["test", "Test urinishlari", st.attempts], ["bot", "AI xabarlari", st.aiMsgs], ["shield", "Xato kirishlar (24 soat)", st.failed24]].map(([i, t, v]) => `<div class="card pad-s kpi"><div class="ic-box">${I(i)}</div><div><small class="muted">${t}</small><b style="font-size:${String(v).length > 8 ? 14 : 22}px">${v}</b></div></div>`).join("")}</div>
  <div class="split mt"><div class="stack">
    <div class="card"><div class="card-h"><h2>Foydalanuvchilar</h2><span class="small muted">${d.users.length} ta</span></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ism</th><th class="hm">Email</th><th>Rol</th><th>Holat</th><th></th></tr></thead><tbody>
      ${d.users.map((x) => `<tr><td class="b">${e(x.first)} ${e(x.last)}</td><td class="hm small">${e(x.email)}</td><td><select class="in" style="padding:6px 8px;width:auto" data-role="${x.id}" ${x.id === u.id ? "disabled" : ""}>${[["student", "Talaba"], ["teacher", "Ustoz"], ["admin", "Admin"]].map(([k, l]) => `<option value="${k}" ${x.role === k ? "selected" : ""}>${l}</option>`).join("")}</select></td><td>${x.blocked ? '<span class="badge r">Bloklangan</span>' : '<span class="badge g">Faol</span>'}</td><td><div class="row" style="gap:6px">${x.id !== u.id ? `<button class="btn sm ${x.blocked ? "ok" : "danger"}" data-act="uBlock" data-id="${x.id}">${x.blocked ? "Ochish" : "Bloklash"}</button>${SERVER ? `<button class="btn sm ghost" data-act="uPass" data-id="${x.id}" title="Vaqtinchalik parol">${I("lock", "sm")}</button>` : ""}` : ""}</div></td></tr>`).join("")}</tbody></table></div></div>
    <div class="card"><div class="card-h"><h2>Fanlar bo'yicha faollik</h2></div>${st.bySubj.map((x) => `<div class="li">${C.subjIcon(x.s.id, "sm")}<div class="grow"><div class="row between small"><b>${e(x.s.name)}</b><span>${x.n} urinish · o'rtacha <b>${x.avg}%</b></span></div>${C.bar(x.avg)}</div></div>`).join("")}</div>
    <div class="card"><div class="card-h"><h2>Adabiyot takliflari</h2></div>${d.suggestions.map((s) => `<div class="boxli"><span class="ic-box sm">${I("book", "sm")}</span><div class="grow"><b>${e(s.title)}</b><div class="small muted">${e(s.author || "—")} · ${e(S.fullName(S.user(s.uid)))} · ${U.rel(s.ts)}</div>${s.note ? `<div class="small">${e(s.note)}</div>` : ""}</div>${s.status === "new" ? `<button class="btn sm ok" data-act="sgOk" data-id="${s.id}">Qabul</button><button class="btn sm danger" data-act="sgNo" data-id="${s.id}">Rad</button>` : `<span class="badge ${s.status === "ok" ? "g" : "r"}">${s.status === "ok" ? "Qabul qilingan" : "Rad etilgan"}</span>`}</div>`).join("") || C.empty("Takliflar yo'q")}</div>
    <div class="card"><div class="card-h"><h2>${I("shield")} Xavfsizlik jurnali</h2></div>${d.secLog.slice(0, 12).map((l) => `<div class="li"><span class="ic-box sm ${l.ok ? "g" : "r"}">${I(l.ok ? "check" : "x", "sm")}</span><div class="grow small"><b>${e(l.email)}</b><div class="s">${l.ok ? "Muvaffaqiyatli kirish" : "Noto'g'ri urinish"}</div></div><span class="small muted">${U.rel(l.ts)}</span></div>`).join("")}</div></div>
  <aside class="stack"><div class="card"><h2 class="mb">${I("plus")} Adabiyot qo'shish</h2><div class="field"><label>Nomi</label><input class="in" id="kT" maxlength="120"></div><div class="field"><label>Muallif</label><input class="in" id="kA" maxlength="80"></div>
    <div class="field"><label>Fan</label><select class="in" id="kS">${DATA.SUBJECTS.map((s) => `<option value="${s.id}">${e(s.name)}</option>`).join("")}</select></div><div class="g g2" style="gap:10px"><div class="field"><label>Turi</label><select class="in" id="kY">${BTYPES.map((t) => `<option>${e(t)}</option>`).join("")}</select></div><div class="field"><label>Kurs</label><select class="in" id="kC">${[1, 2, 3, 4].map((k) => `<option>${k}</option>`).join("")}</select></div></div>
    <div class="field"><label>Annotatsiya</label><textarea class="in" id="kB" maxlength="400"></textarea></div><div class="err" id="kE"></div><button class="btn block" data-act="bookAdd">Qo'shish</button>
    ${d.books.length ? `<h3 class="mt">Qo'shilganlar</h3>${d.books.map((b) => `<div class="li"><div class="grow small b">${e(b.title)}</div><button class="circ" data-act="bookDel" data-id="${b.id}">${I("trash", "sm")}</button></div>`).join("")}` : ""}</div>
    ${SERVER && !Store.cfg().demo ? "" : `<div class="card"><h2 class="mb">Namoyish ma'lumotlari</h2><p class="small muted">Barcha ma'lumotlarni boshlang'ich (demo) holatga qaytaradi. Joriy sessiya yakunlanadi.</p><button class="btn danger block mt-s" data-act="resetAll">${I("refresh", "sm")} Demo ma'lumotlarni tiklash</button></div>`}</aside></div>`;
};
AFTER.admin = () => { U.$$("[data-role]").forEach((s) => (s.onchange = () => ACT("setRole", s.dataset.role, s.value).then(() => C.toast("Rol o'zgartirildi.", "ok")).catch(fail).finally(() => APP.render()))); };
A.uBlock = (el) => { const x = S.user(el.dataset.id); const v = !x.blocked; ACT("setBlocked", x.id, v).then(() => C.toast(v ? "Foydalanuvchi bloklandi." : "Blok olib tashlandi.", "ok")).catch(fail).finally(() => APP.render()); };
A.uPass = (el) => { const x = S.user(el.dataset.id); C.ask(`${x.first} ${x.last} uchun yangi vaqtinchalik parol yaratilsinmi? Eski parol va sessiyalar bekor qilinadi.`, () => ACT("resetPassword", x.id).then((r) => C.modal(`<h2>Vaqtinchalik parol</h2><p class="mt-s">${e(x.email)}</p><div class="formula-box mt" style="font-family:ui-monospace,Consolas,monospace;user-select:all">${e(r.password)}</div><p class="small muted mt-s">Parolni foydalanuvchiga xavfsiz yo'l bilan bering. Kirgach, u Sozlamalarda parolni o'zgartirishi kerak.</p>`)).catch(fail), "Yaratish"); };
A.sgOk = (el) => ACT("resolveSuggestion", el.dataset.id, true).then(() => { C.toast("Adabiyot kutubxonaga qo'shildi.", "ok"); APP.render(); }).catch(fail);
A.sgNo = (el) => ACT("resolveSuggestion", el.dataset.id, false).then(() => APP.render()).catch(fail);
A.bookAdd = () => ACT("addBook", { title: U.$("#kT").value, author: U.$("#kA").value, s: U.$("#kS").value, type: U.$("#kY").value, course: U.$("#kC").value, about: U.$("#kB").value }).then(() => { C.toast("Adabiyot qo'shildi.", "ok"); APP.render(); }).catch((err) => { U.$("#kE").textContent = err.message; });
A.bookDel = (el) => ACT("removeBook", el.dataset.id).then(() => APP.render()).catch(fail);
A.resetAll = () => C.ask("Barcha ma'lumotlar demo holatga qaytadi. Davom etasizmi?", () => ACT("resetAll").then(() => { APP.chat = null; APP.ses = null; C.toast("Ma'lumotlar tiklandi.", "ok"); if (!SERVER) APP.go("#/login"); else APP.render(); }).catch(fail), "Tiklash");

/* =============== MA'LUMOT SAHIFALARI (modal) =============== */
const PAGES = {
  about: ["Biz haqimizda", `<p><b>PM Edu</b> — amaliy matematika yo'nalishi talabalari uchun raqamli ta'lim platformasi. Fanlar bo'yicha nazariya va formulalar, avtomatik tekshiriladigan testlar, qadamma-qadam yechim beruvchi AI yordamchi, adabiyotlar kutubxonasi va shaxsiy progress kuzatuvi bir joyda jamlangan.</p>
    <h3 class="mt">Nimasi bilan farq qiladi?</h3><ul><li><b>Bilim xaritasi</b> — har bir mavzu bo'yicha o'zlashtirish javoblar aniqligi va unutish egri chizig'i (Ebbinghaus) asosida hisoblanadi.</li><li><b>Moslashuvchan test</b> — savollar zaif va takrorlash vaqti kelgan mavzulardan tanlanadi.</li><li><b>Cheksiz mashq</b> — parametrik generator har safar yangi sonli masala tuzadi.</li><li><b>Internetsiz AI</b> — o'rnatilgan simvolli hisoblash yadrosi hosila, integral, limit, tenglama, matritsa va statistikani qadamlari bilan yechadi.</li><li><b>Ustoz paneli</b> — topshiriq berish, guruh natijalari va qiyin mavzular tahlili.</li></ul>`],
  help: ["Yordam", `<h3>Demo hisoblar</h3><ul><li>Talaba: <b>dunyo@pmedu.uz</b> / demo123</li><li>Ustoz: <b>ustoz@pmedu.uz</b> / demo123</li><li>Admin: <b>admin@pmedu.uz</b> / admin123</li></ul>
    <h3 class="mt">AI yordamchiga misollar</h3><ul><li>x^3*sin(x) hosilasi</li><li>integral x*e^x · integral sin(x) 0 dan pi gacha</li><li>limit (x^2-4)/(x-2), x->2</li><li>x^2 - 5x + 6 = 0 · sistema: 2x + y = 5; x - y = 1</li><li>teskari [[2,1],[1,1]] · xos qiymat [[2,1],[1,2]]</li></ul>
    <h3 class="mt">Test paytida</h3><p>1–4 yoki A–D tugmalari bilan javob tanlanadi, ← → bilan savollar orasida o'tiladi. Vaqt tugasa test avtomatik yakunlanadi.</p>`],
  terms: ["Foydalanish shartlari", `<ol><li>Platforma ta'lim maqsadida foydalanish uchun mo'ljallangan.</li><li>Test natijalari shaxsiy o'zlashtirishni baholash uchun; ustoz topshiriqlari natijalari ustozga ko'rinadi.</li><li>Hisobingiz ma'lumotlarini boshqalarga bermang. 5 ta noto'g'ri urinishdan so'ng hisob vaqtincha bloklanadi.</li><li>Adabiyotlar bo'limida mualliflik huquqi saqlanadi: platformada annotatsiya va konspektlar beriladi.</li><li>AI yordamchi javoblari o'quv yordamchisi sifatida beriladi; muhim hisob-kitoblarni o'qituvchi bilan tekshiring.</li></ol>`],
  privacy: ["Maxfiylik siyosati", `<ul><li>Namoyish versiyasida barcha ma'lumotlar faqat sizning brauzeringizda (localStorage) saqlanadi va hech qayerga yuborilmaydi.</li><li>Parollar ochiq holda saqlanmaydi: SHA-256 + tasodifiy tuz, 1000 marta takroriy xeshlash.</li><li>Foydalanuvchi kiritgan barcha matnlar ekranga chiqarishdan oldin ekranlanadi (XSS himoyasi).</li><li>«Sozlamalar → Ma'lumotlarimni yuklab olish» orqali o'z ma'lumotlaringizni JSON formatida olishingiz mumkin.</li></ul>`],
};
A.page = (name) => { const p = PAGES[typeof name === "string" ? name : name.dataset.id]; C.modal(`<h2>${p[0]}</h2><div class="mt">${p[1]}</div>`, true); };
A.closeModal = (el) => el.closest(".ov").remove();

/* ===== app.js — marshrutlash (router), asosiy qobiq, qidiruv, bildirishnomalar, mavzu ===== */
"use strict";
const APP = {
  ses: null, qi: 0, chat: null, tick: null, calSel: null, calYM: null, fanFilter: 0, testFilter: "", bf: null, tlDays: 7, tGroup: "", newAs: null, aiPrefill: "",
  go(h) { if (location.hash === h) APP.render(); else location.hash = h; },
  setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem("pmedu_theme", t); } catch (err) { /* xotira yopiq */ } },
  isDark() { const t = document.documentElement.dataset.theme; return t ? t === "dark" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); },
};
const NAV = {
  student: [["#/", "home", "Bosh sahifa"], ["#/fanlar", "grid", "Fanlar"], ["#/testlar", "test", "Testlar"], ["#/ai", "bot", "AI yordamchi"], ["#/adabiyotlar", "book", "Adabiyotlar"], ["#/progress", "target", "Mening progressim"], ["#/kalendar", "cal", "Kalendar"], ["#/sozlamalar", "gear", "Sozlamalar"]],
  teacher: [["#/ustoz", "users", "Ustoz paneli"], ["#/fanlar", "grid", "Fanlar"], ["#/adabiyotlar", "book", "Adabiyotlar"], ["#/ai", "bot", "AI yordamchi"], ["#/sozlamalar", "gear", "Sozlamalar"]],
  admin: [["#/admin", "shield", "Admin paneli"], ["#/fanlar", "grid", "Fanlar"], ["#/adabiyotlar", "book", "Adabiyotlar"], ["#/sozlamalar", "gear", "Sozlamalar"]],
};
const ROUTES = { "": "home", fanlar: "fanlar", fan: "fan", testlar: "testlar", test: "test", natija: "natija", ai: "ai", adabiyotlar: "adabiyotlar", progress: "progress", kalendar: "kalendar", sozlamalar: "sozlamalar", ustoz: "ustoz", admin: "admin" };
const ACCESS = { home: ["student"], testlar: ["student"], test: ["student"], progress: ["student"], kalendar: ["student"], ustoz: ["teacher"], admin: ["admin"] };
const TITLES = { home: "Bosh sahifa", fanlar: "Fanlar", fan: "Fan", testlar: "Testlar", test: "Test", natija: "Natija", ai: "AI yordamchi", adabiyotlar: "Adabiyotlar", progress: "Mening progressim", kalendar: "Kalendar", sozlamalar: "Sozlamalar", ustoz: "Ustoz paneli", admin: "Admin paneli" };

function parseHash() { const h = (location.hash || "#/").replace(/^#\/?/, ""); const [p, ...args] = h.split("/").map(decodeURIComponent); return { p, args }; }

APP.render = function () {
  const root = document.getElementById("app"); const { p, args } = parseHash(); const u = Store.current();
  document.querySelectorAll(".ov").forEach((o) => o.remove());
  if (!u) {
    clearInterval(APP.tick); APP.ses = null;
    const view = p === "login" ? "login" : p === "register" ? "register" : "welcome";
    if (view !== "register" && REG.step === 5) REG.step = 1;
    root.innerHTML = V[view](); document.title = "PM Edu — Amaliy matematika"; if (AFTER[view]) AFTER[view](); window.scrollTo(0, 0); return;
  }
  if (p === "login" || p === "register") { if (REG.step === 5 && p === "register") { root.innerHTML = V.register(); return; } location.replace(homeOf(u)); return; }
  let view = ROUTES[p]; if (view === undefined) view = "home";
  if (view === "home" && u.role !== "student") { location.replace(homeOf(u)); return; }
  if (ACCESS[view] && !ACCESS[view].includes(u.role)) { location.replace(homeOf(u)); return; }
  if (view === "test" && !APP.ses) { location.replace("#/testlar"); return; }
  if (view !== "test") clearInterval(APP.tick);
  const nav = NAV[u.role], unread = S.notifs(u.id).filter((n) => !n.read).length, cur = "#/" + p;
  let html; try { html = V[view](u, args); } catch (err) { console.error(err); html = C.empty("Sahifani ochishda xatolik: " + e(err.message)); }
  root.innerHTML = `<div class="app"><aside class="side" id="side">${logoBlock()}
    <nav class="nav" aria-label="Asosiy menyu">${nav.map(([h, i, t]) => `<a href="${h}" class="${cur === h || (h === "#/fanlar" && p === "fan") || (h === "#/testlar" && (p === "test" || p === "natija")) ? "on" : ""}">${I(i)} ${t}</a>`).join("")}</nav>
    ${C.quote(["home", "fanlar", "progress", "testlar", "ai"].indexOf(view) + 1)}</aside><div class="scrim" id="scrim" data-act="side"></div>
    <div class="main"><header class="top"><button class="iconbtn burger" data-act="side" aria-label="Menyu">${I("menu")}</button>
      <div class="search">${I("search")}<input id="gSearch" placeholder="Qidiruv... (fan, mavzu, test, kitob...)" autocomplete="off" aria-label="Qidiruv"><div class="drop hidden" id="gDrop"></div></div>
      <div class="top-r"><button class="iconbtn" data-act="theme" aria-label="Mavzu">${I(APP.isDark() ? "sun" : "moon")}</button>
        <div style="position:relative"><button class="iconbtn" data-act="notif" aria-label="Bildirishnomalar">${I("bell")}${unread ? '<span class="dot"></span>' : ""}</button><div class="menu notif hidden" id="nDrop"></div></div>
        <div class="user" data-act="umenu"><div class="av">${e(U.initials(u.first, u.last))}</div><span class="nm">${e(u.first)}</span>${I("down", "sm")}
          <div class="menu hidden" id="uDrop"><div class="hd"><b>${e(S.fullName(u))}</b><div class="small muted">${e(u.email)}</div><span class="badge mt-s">${{ student: "Talaba", teacher: "Ustoz", admin: "Administrator" }[u.role]}</span></div>
          <a href="#/sozlamalar">${I("gear", "sm")} Sozlamalar</a>${u.role === "student" ? `<a href="#/progress">${I("target", "sm")} Mening progressim</a>` : ""}<button data-act="page" data-id="help">${I("info", "sm")} Yordam</button><button data-act="logout">${I("out", "sm")} Chiqish</button></div></div></div></header>
      <main class="page" id="page">${html}</main>
      <footer class="foot">${logoBlock()}<nav><a data-act="page" data-id="about">Biz haqimizda</a><a data-act="page" data-id="help">Yordam</a><a data-act="page" data-id="terms">Foydalanish shartlari</a><a data-act="page" data-id="privacy">Maxfiylik siyosati</a></nav><span class="copy">© ${new Date().getFullYear()} PM Edu. Barcha huquqlar himoyalangan.</span></footer></div></div>`;
  document.title = `${TITLES[view] || "PM Edu"} — PM Edu`;
  bindSearch();
  if (AFTER[view]) try { AFTER[view](u, args); } catch (err) { console.error(err); }
};

function bindSearch() {
  const inp = document.getElementById("gSearch"), drop = document.getElementById("gDrop"); if (!inp) return;
  const run = () => {
    const r = S.search(inp.value); if (!r) { drop.classList.add("hidden"); return; }
    const u = Store.current(), stud = u.role === "student";
    const grp = (t, arr, f) => (arr.length ? `<div class="grp">${t}</div>${arr.map(f).join("")}` : "");
    const html = grp("Fanlar", r.subjects, (s) => `<a data-go="#/fan/${s.id}">${C.subjIcon(s.id, "sm")}<span>${e(s.name)}</span></a>`) +
      grp("Mavzular", r.topics, (t) => `<a data-go="#/fan/${t.s}/${t.id}"><span class="ic-box sm">${I("file", "sm")}</span><span>${e(t.name)}<div class="tiny muted">${e(S.subj(t.s).name)}</div></span></a>`) +
      (stud ? grp("Testlar", r.tests, (t) => `<a data-act="startTest" data-id="${t.id}"><span class="ic-box sm g">${I("test", "sm")}</span><span>${e(t.title)}</span></a>`) : "") +
      grp("Adabiyotlar", r.books, (b) => `<a data-act="book" data-id="${b.id}"><span class="ic-box sm bl">${I("book", "sm")}</span><span>${e(b.title)}<div class="tiny muted">${e(b.author)}</div></span></a>`);
    drop.innerHTML = html || `<div class="empty">Hech narsa topilmadi. <a data-act="aiQuery">AI yordamchidan so'rash</a></div>`;
    drop.classList.remove("hidden");
  };
  inp.addEventListener("input", U.debounce(run, 150));
  inp.addEventListener("focus", run);
  inp.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { drop.classList.add("hidden"); inp.blur(); } if (ev.key === "Enter") { const a = drop.querySelector("a"); if (a) a.click(); } });
}

/* ---------- Umumiy amallar ---------- */
A.side = () => { document.getElementById("side").classList.toggle("open"); document.getElementById("scrim").classList.toggle("open"); };
A.theme = () => { APP.setTheme(APP.isDark() ? "light" : "dark"); APP.render(); };
A.logout = (el) => { if (APP.ses && !(el && el.force)) return C.ask("Test yakunlanmagan. Baribir chiqasizmi?", () => A.logout({ force: true }), "Chiqish"); Promise.resolve(Store.logout()).catch(() => {}).then(() => { APP.ses = null; APP.chat = null; REG.step = 1; REG.d = { course: 2, uni: DATA.UNIVERSITIES[0], faculty: DATA.FACULTIES[0], year: "2025 - 2026" }; C.toast("Tizimdan chiqdingiz."); APP.go("#/login"); }); };
A.umenu = (el, ev) => { if (ev.target.closest(".menu")) return; document.getElementById("uDrop").classList.toggle("hidden"); document.getElementById("nDrop").classList.add("hidden"); };
A.aiQuery = () => { APP.aiPrefill = document.getElementById("gSearch").value; APP.go("#/ai"); };
A.notif = () => {
  const u = Store.current(), box = document.getElementById("nDrop"), ns = S.notifs(u.id);
  box.innerHTML = `<div class="hd row between"><b>Bildirishnomalar</b><span class="small muted">${ns.filter((n) => !n.read).length} yangi</span></div>` +
    (ns.map((n) => `<a class="n ${n.read ? "" : "new"}" ${n.link ? `data-go="${e(n.link)}"` : ""}><span class="ic-box sm">${I("bell", "sm")}</span><span>${e(n.text)}<div class="tiny muted">${U.rel(n.ts)}</div></span></a>`).join("") || C.empty("Bildirishnomalar yo'q", "bell"));
  box.classList.toggle("hidden"); document.getElementById("uDrop").classList.add("hidden");
  if (!box.classList.contains("hidden") && ns.some((n) => !n.read)) { ACT("readAll").catch(() => {}); const d = document.querySelector("[data-act=notif] .dot"); if (d) d.remove(); }
};

/* ---------- Hodisalarni delegatsiya qilish ---------- */
document.addEventListener("click", (ev) => {
  const t = ev.target.closest("[data-act],[data-go]");
  if (t && t.dataset.act && A[t.dataset.act]) { ev.preventDefault(); A[t.dataset.act](t, ev); }
  else if (t && t.dataset.go) { ev.preventDefault(); const side = document.getElementById("side"); if (side) side.classList.remove("open"); APP.go(t.dataset.go); return; }
  if (!ev.target.closest(".search")) { const d = document.getElementById("gDrop"); if (d) d.classList.add("hidden"); }
  if (!ev.target.closest(".user") && !ev.target.closest("[data-act=notif]") && !ev.target.closest("#nDrop")) { document.querySelectorAll("#uDrop,#nDrop").forEach((m) => m.classList.add("hidden")); }
});
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { const o = document.querySelector(".ov"); if (o) o.remove(); } if (ev.key === "Enter" && ev.target.matches(".qcard,[data-go][tabindex]")) ev.target.click(); });

let lastHash = location.hash;
window.addEventListener("hashchange", () => {
  if (APP.ses && lastHash === "#/test" && location.hash !== "#/test") {
    const target = location.hash; history.replaceState(null, "", "#/test");
    C.ask("Test yakunlanmagan. Sahifadan chiqsangiz javoblar saqlanmaydi. Chiqasizmi?", () => { APP.ses = null; clearInterval(APP.tick); lastHash = target; location.hash = target; }, "Chiqish");
    return;
  }
  lastHash = location.hash; APP.render(); window.scrollTo(0, 0);
});
window.addEventListener("beforeunload", (ev) => { if (APP.ses) { ev.preventDefault(); ev.returnValue = ""; } });

(function init() {
  let t = null; try { t = localStorage.getItem("pmedu_theme"); } catch (err) { /* */ }
  if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
  Promise.resolve(Store.init()).then(() => APP.render());
  if (SERVER) setInterval(() => {   // yangi bildirishnomalarni tekshirish (faqat qo'ng'iroqcha belgisi yangilanadi)
    if (document.visibilityState !== "visible" || APP.ses || !Store.current()) return;
    API.req("/api/state").then(() => { const u = Store.current(); if (!u) return APP.render(); const n = S.notifs(u.id).filter((x) => !x.read).length, btn = document.querySelector("[data-act=notif]");
      if (btn && n && !btn.querySelector(".dot")) btn.insertAdjacentHTML("beforeend", '<span class="dot"></span>'); }).catch(() => {});
  }, 60000);
})();
