'use client'; // Bu dosyanın client-side çalıştığını belirtmek için Next.js'e bildiriyoruz.

import React, { useState } from 'react';

const PRIMARY_COLOR = 'bg-zenith-primary';
const ACCENT_COLOR = 'bg-zenith-accent';

export default function HomePage() {
  const [decisionText, setDecisionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decisionText.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      // API'mize (app/api/analyze/route.js) POST isteği gönderiyoruz
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: decisionText }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data.analysis);
      } else {
        setError(data.error || 'Analiz sırasında beklenmedik bir hata oluştu.');
      }
    } catch (err) {
      console.error("API Bağlantı Hatası:", err);
      setError('Sunucuya bağlanılamadı. Lütfen Python motorunuzun çalıştığından emin olun.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bileşik skorun yorumlanması
  const interpretCompoundScore = (score) => {
    if (score >= 0.05) return { text: "Yüksek Pozitif Ton", color: "text-green-600" };
    if (score <= -0.05) return { text: "Yüksek Negatif/Korku Tonu", color: "text-red-600" };
    return { text: "Nispeten Nötr Ton", color: "text-gray-600" };
  };

  return (
    <div className={`min-h-screen ${PRIMARY_COLOR} flex items-center justify-center p-4`}>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 space-y-8">
        
        {/* Başlık Alanı */}
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-zenith-primary">Zenith Decision</h1>
          <p className="text-gray-500 mt-1 italic">Duygusuz Değil, Önyargısız Kararlar.</p>
        </header>

        {/* Form Alanı */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">💸 Finansal Kararınızı Girin</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="decision" className="block text-sm font-medium text-gray-700 mb-2">
                Kararınızın Tam Metni
              </label>
              <textarea
                id="decision"
                rows="6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-zenith-primary focus:border-zenith-primary transition duration-150"
                placeholder="Örnek: 'Tüm paramla A hissesine girmeyi düşünüyorum. Aşırı coşkuluyum ama ya düşerse diye de korkuyorum...' "
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-lg font-bold text-black rounded-lg transition duration-300 ease-in-out hover:shadow-lg ${ACCENT_COLOR} ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Analiz Ediliyor...' : 'Kararı Analiz Et (Ücretsiz Beta)'}
            </button>
          </form>
        </section>
        
        {/* Hata Mesajı */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Hata!</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}

        {/* Analiz Sonuç Alanı */}
        {analysisResult && (
          <section className="mt-8 p-6 bg-zenith-bg rounded-lg border-l-4 border-zenith-primary">
            <h2 className="text-xl font-bold text-zenith-primary mb-4">🧠 Ego-Sıfır Analiz Sonucu</h2>
            
            <div className="space-y-3">
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">🔍 Tespit Edilen Duygusallık (Bileşik):</span> 
                    <span className={`ml-2 font-bold ${interpretCompoundScore(analysisResult.bileşik_skor).color}`}>
                        {interpretCompoundScore(analysisResult.bileşik_skor).text} ({analysisResult.bileşik_skor.toFixed(3)})
                    </span>
                </p>
                
                <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                    <p className="text-green-600 font-medium">Pozitif Ton: {(analysisResult.pozitif_skor * 100).toFixed(1)}%</p>
                    <p className="text-gray-600 font-medium">Nötr Ton: {(analysisResult.nötr_skor * 100).toFixed(1)}%</p>
                    <p className="text-red-600 font-medium">Negatif Ton: {(analysisResult.negatif_skor * 100).toFixed(1)}%</p>
                </div>

                <div className="mt-4">
                    <h3 className="font-bold text-gray-800">Zenith Yorumu:</h3>
                    <p className="text-sm text-gray-600 italic mt-1">
                        Metninizdeki {interpretCompoundScore(analysisResult.bileşik_skor).text} **duygusal önyargı**, kararınızın mantık yerine anlık durumlara dayandığını gösteriyor. Gerçek bir Zenith Kararı için bu duygusal ağırlığı dikkate almadan, sadece piyasa verilerini analiz etmelisiniz. (Bu, ilerideki aşamada AI'ın vereceği nihai tavsiyeye dönüşecektir.)
                    </p>
                </div>
            </div>
          </section>
        )}
        
        <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            Beta V0.1. Veriler anonimleştirilerek AI modelini eğitmek için kullanılır.
        </footer>
      </div>
    </div>
  );
}