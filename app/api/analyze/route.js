import { NextResponse } from "next/server";
import vader from "vader-sentiment";

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Metin alanı boş olamaz." }, { status: 400 });
    }

    const vs = vader.SentimentIntensityAnalyzer.polarity_scores(text);

    const analysisResult = {
      negatif_skor: vs.neg,
      nötr_skor: vs.neu,
      pozitif_skor: vs.pos,
      bileşik_skor: vs.compound,
    };

    return NextResponse.json({
      success: true,
      raw_text: text,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("API İşleme Hatası:", error);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "GET metoduna izin verilmiyor." }, { status: 405 });
}
