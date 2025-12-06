import { NextResponse } from 'next/server';
// 🛑 child_process importunu SİLİYORUZ!
import { Analyzer } from 'vader-sentiment-analyzer'; // Yeni Kütüphane

// VADER.js'in Node.js sürümünü kullanarak analizi doğrudan yapıyoruz.
const analyzer = new Analyzer();

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Metin alanı boş olamaz.' }, { status: 400 });
    }

    // ⚡️ Doğrudan Node.js'te Analiz ⚡️
    const analysis = analyzer.getSentiment(text);

    // Çıktı formatını eski Python çıktısına benzetiyoruz.
    const vs = analysis.getScores();

    const analysisResult = {
        negatif_skor: vs.negative,
        nötr_skor: vs.neutral,
        pozitif_skor: vs.positive,
        bileşik_skor: vs.compound // En önemli skor
    };

    return NextResponse.json({ 
        success: true, 
        raw_text: text,
        analysis: analysisResult 
    });

  } catch (error) {
    console.error('API İşleme Hatası:', error);
    return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}

export async function GET() {
    return NextResponse.json({ error: 'GET metoduna izin verilmiyor.' }, { status: 405 });
}