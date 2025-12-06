import { NextResponse } from "next/server";

/**
 * Rewrite API
 * mode:
 *  - soften
 *  - clarify
 *  - assertive
 *  - all
 */

// TR’de sertleşen kalıplar
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
  ["boş yapma", "konuyu biraz daha netleştirelim"],
];

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

function normalizeSpaces(text) {
  return text.replace(/\s+/g, " ").trim();
}

function hasGreeting(text) {
  const lower = text.trim().toLowerCase();
  return (
    lower.startsWith("merhaba") ||
    lower.startsWith("selam") ||
    lower.startsWith("iyi günler") ||
    lower.startsWith("lütfen")
  );
}

function soften(text) {
  let t = text;

  harshMap.forEach(([a, b]) => {
    const re = new RegExp(a, "gi");
    t = t.replace(re, b);
  });

  t = normalizeSpaces(t);
  t = t.replace(/!{2,}/g, "!");
  t = t.replace(/\b(ACİL|DERHAL)\b/g, "Mümkünse");

  if (!hasGreeting(t)) {
    t = "Lütfen bir göz atabilir misin? " + t;
  }

  return t;
}

function clarify(text) {
  let t = text;

  fillerWords.forEach((w) => {
    const re = new RegExp(`\\b${w}\\b`, "gi");
    t = t.replace(re, "");
  });

  t = normalizeSpaces(t);
  t = t.replace(/,{2,}/g, ",");
  t = t.replace(/\.{3,}/g, "…");

  if (!/[.!?…]$/.test(t)) t += ".";

  return t;
}

function assertive(text) {
  const base = clarify(text);
  return `Önerim net: ${base} Eğer uygunsa bu şekilde ilerleyelim.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const text = body?.text;
    const mode = body?.mode;

    if (!text || !String(text).trim()) {
      return NextResponse.json(
        { error: "Metin alanı boş olamaz." },
        { status: 400 }
      );
    }

    const m = (mode || "soften").toLowerCase();

    if (m === "all") {
      return NextResponse.json({
        success: true,
        mode: "all",
        original: text,
        rewritten: {
          soften: soften(text),
          clarify: clarify(text),
          assertive: assertive(text),
        },
      });
    }

    let rewritten = "";
    if (m === "soften") rewritten = soften(text);
    else if (m === "clarify") rewritten = clarify(text);
    else if (m === "assertive") rewritten = assertive(text);
    else {
      return NextResponse.json(
        { error: "Geçersiz mode. soften | clarify | assertive | all" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: m,
      original: text,
      rewritten,
    });
  } catch (err) {
    console.error("Rewrite API error:", err);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}

// TEK GET (çakışma yok)
export async function GET() {
  return NextResponse.json(
    { ok: true, message: "Rewrite API çalışıyor. POST kullan." },
    { status: 200 }
  );
}
