import { NextResponse } from "next/server";

// Basit, kural-tabanlı MVP rewrite motoru.
// (İleride bunu LLM ile “premium” hale getiririz.)

const harshReplacements = [
  ["saçma", "çok uygun görünmüyor"],
  ["aptalca", "pek sağlıklı görünmüyor"],
  ["asla", "pek uygun olmayabilir"],
  ["kesinlikle", "büyük olasılıkla"],
  ["hemen", "mümkünse"],
  ["yanlış", "eksik kalmış olabilir"],
  ["anlamadın", "sanırım tam netleşmedi"],
  ["yapmak zorundasın", "yapmanı öneririm"],
];

function soften(text) {
  let t = text;
  harshReplacements.forEach(([a, b]) => {
    t = t.replaceAll(a, b);
    t = t.replaceAll(a.toUpperCase(), b);
  });

  // Kısa bir nazik giriş ekle (çok uzatmadan)
  if (!/^lütfen|merhaba|selam/i.test(t.trim())) {
    t = "Lütfen bir göz atabilir misin? " + t;
  }
  return t;
}

function clarify(text) {
  // Gereksiz dolgu kelimelerini hafif buda
  let t = text
    .replaceAll("yani", "")
    .replaceAll("işte", "")
    .replaceAll("aslında", "")
    .replace(/\s+/g, " ")
    .trim();

  // Cümleleri daha okunur yap
  // Çok kaba bir ayrıştırma: nokta/ünlem/soru
  const parts = t.split(/([.!?])/).filter(Boolean);
  let rebuilt = "";
  for (let i = 0; i < parts.length; i += 2) {
    const sentence = (parts[i] || "").trim();
    const punc = parts[i + 1] || ".";
    if (sentence) rebuilt += sentence + punc + " ";
  }
  return rebuilt.trim();
}

function assertiveRespectful(text) {
  const t = clarify(text);
  // Saygılı ama güçlü çerçeve
  return `Önerim net: ${t} Eğer uygunsa bu şekilde ilerleyelim.`;
}

export async function POST(request) {
  try {
    const { text, mode } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Metin alanı boş olamaz." },
        { status: 400 }
      );
    }

    const m = (mode || "soften").toLowerCase();

    let rewritten;
    if (m === "soften") rewritten = soften(text);
    else if (m === "clarify") rewritten = clarify(text);
    else if (m === "assertive") rewritten = assertiveRespectful(text);
    else {
      return NextResponse.json(
        { error: "Geçersiz mode. soften | clarify | assertive" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: m,
      original: text,
      rewritten,
    });
  } catch (error) {
    console.error("Rewrite API Hatası:", error);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "GET metoduna izin verilmiyor." },
    { status: 405 }
  );
}

import { NextResponse } from "next/server";

/**
 * Sıfır Ego Rewrite API (MVP-Pro)
 * mode:
 *  - soften: daha nazik ve yumuşak
 *  - clarify: daha kısa, net, düzenli
 *  - assertive: kararlı ama saygılı
 *
 * Not: Bu kural-tabanlı sürüm. İleride LLM ile premium yapılabilir.
 */

// TR’de sık gerilim yaratan kelime/kalıplar
const harshMap = [
  ["saçma", "çok uygun görünmüyor"],
  ["aptalca", "pek sağlıklı görünmüyor"],
  ["rezalet", "pek iyi görünmüyor"],
  ["berbat", "daha iyi olabilir"],
  ["asla", "pek uygun olmayabilir"],
  ["kesinlikle", "büyük olasılıkla"],
  ["hemen", "mümkünse"],
  ["yanlış", "eksik kalmış olabilir"],
  ["anlamadın", "sanırım tam netleşmedi"],
  ["yapmak zorundasın", "yapmanı rica ediyorum"],
  ["bunu bilmiyor musun", "bunu birlikte netleştirebilir miyiz"],
  ["ne diyorsun", "ne demek istediğini tam anlamak istiyorum"],
  ["boş yapma", "konuyu biraz daha netleştirelim"],
];

// Emredici sert başlangıçları yumuşatma
const openerSoft = [
  "Kısa bir not düşmek isterim:",
  "Nazikçe hatırlatmak isterim:",
  "Bunu daha sağlıklı ilerletmek için:",
];

// Gereksiz dolgu sözleri (clarify)
const fillerWords = [
  "yani",
  "işte",
  "aslında",
  "şey",
  "hani",
  "bir nevi",
  "falan",
  "filan",
  "galiba",
];

// Basit cümle düzenleyici
function normalizeSpaces(text) {
  return text.replace(/\s+/g, " ").trim();
}

function soften(text) {
  let t = text;

  // Kelime bazlı yumuşatma
  harshMap.forEach(([a, b]) => {
    // küçük/büyük harf varyasyonları için basit yaklaşım
    const re = new RegExp(a, "gi");
    t = t.replace(re, b);
  });

  t = normalizeSpaces(t);

  // Çok sert doğrudan başlangıçları nazik bir girişle tamponla
  const lower = t.toLowerCase();
  const hasGreeting =
    lower.startsWith("merhaba") ||
    lower.startsWith("selam") ||
    lower.startsWith("iyi günler") ||
    lower.startsWith("lütfen");

  if (!hasGreeting) {
    const pick = openerSoft[Math.floor(Math.random() * openerSoft.length)];
    t = `${pick} ${t}`;
  }

  // Ünlem/yüksek agresyonu azalt
  t = t.replace(/!{2,}/g, "!");
  t = t.replace(/\b(ACİL|Hemen|DERHAL)\b/g, "Mümkünse");

  return t;
}

function clarify(text) {
  let t = text;

  // Dolgu kelimeleri hafif buda
  fillerWords.forEach((w) => {
    const re = new RegExp(`\\b${w}\\b`, "gi");
    t = t.replace(re, "");
  });

  // Çoklu boşluk temizliği
  t = normalizeSpaces(t);

  // Noktalama sadeleştirme
  t = t.replace(/,{2,}/g, ",");
  t = t.replace(/\.{3,}/g, "…");

  // Cümleleri makul şekilde sonlandır
  if (!/[.!?…]$/.test(t)) t += ".";

  return t;
}

function assertive(text) {
  // Önce netleştir
  const base = clarify(text);

  // Çok yumuşak olmadan kararlılık çerçevesi
  // Finansal/karar metinlerinde işe yarayan güvenli kalıp
  return `Önerim net: ${base} Eğer uygunsa bu şekilde ilerleyelim.`;
}

export async function POST(request) {
  try {
    const { text, mode } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Metin alanı boş olamaz." },
        { status: 400 }
      );
    }

    const m = (mode || "soften").toLowerCase();

    let rewritten = "";
    if (m === "soften") rewritten = soften(text);
    else if (m === "clarify") rewritten = clarify(text);
    else if (m === "assertive") rewritten = assertive(text);
    else {
      return NextResponse.json(
        { error: "Geçersiz mode. soften | clarify | assertive" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: m,
      original: text,
      rewritten,
    });
  } catch (error) {
    console.error("Rewrite API Hatası:", error);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "GET metoduna izin verilmiyor." },
    { status: 405 }
  );
}
