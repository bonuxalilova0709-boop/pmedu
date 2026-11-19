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
