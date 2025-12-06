'use client';

import React, { useState } from 'react';

const PRIMARY_COLOR = 'bg-zenith-primary';
const ACCENT_COLOR = 'bg-zenith-accent';

export default function HomePage() {
  // =========================
  // ANALYZE STATES
  // =========================
  const [decisionText, setDecisionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // =========================
  // REWRITE STATES
  // =========================
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);

  // =========================
  // ANALYZE SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decisionText.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setError('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // REWRITE HANDLER
  // =========================
  const handleRewrite = async (mode) => {
    if (!decisionText.trim()) return;

    setRewriteLoading(true);
    setRewriteError(null);
    setRewriteText('');

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: decisionText, mode }),
      });

      const data = await response.json();

      if (response.ok) {
        setRewriteText(data.rewritten);
      } else {
        setRewriteError(data.error || 'Rewrite sırasında hata oluştu.');
      }
    } catch (err) {
      setRewriteError('Sunucuya bağlanılamadı.');
    } finally {
      setRewriteLoading(false);
    }
  };

  // =========================
  // Compound yorumlama
  // =========================
  const interpretCompoundScore = (score) => {
    if (score >= 0.05) return { text: "Yüksek Pozitif Ton", color: "text-green-600" };
    if (score <= -0.05) return { text: "Yüksek Negatif/Korku Tonu", color: "text-red-600" };
    return { text: "Nispeten Nötr Ton", color: "text-gray-600" };
  };

  const compound = analysisResult?.bileşik_skor;

  return (
    <div className={`min-h-screen ${PRIMARY_COLOR} flex items-center justify-center p-4`}>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 space-y-8">

        {/* Başlık */}
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-zenith-primary">Zenith Decision</h1>
          <p className="text-gray-500 mt-1 italic">Duygusuz Değil, Önyargısız Kararlar.</p>
        </header>

        {/* Form */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">💸 Finansal Kararınızı Girin</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="decision" className="block text-sm font-medium text-gray-700 mb-2">
                Kararınızın Tam Metni
              </label>

              <textarea
                id="decision"
                rows="6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-zenith-primary focus:border-zenith-primary transition duration-150"
                placeholder="Örnek: 'Tüm paramla A hissesine girmeyi düşünüyorum. Aşırı coşkuluyum ama ya düşerse diye de korkuyorum...'"
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                required
                disabled={isLoading}
              />

              {/* Rewrite butonları */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleRewrite("soften")}
                  className="py-2 rounded-lg bg-zenith-accent font-bold text-black hover:opacity-90 disabled:opacity-60"
                  disabled={rewriteLoading || isLoading}
                >
                  {rewriteLoading ? "..." : "Yumuşat"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRewrite("clarify")}
                  className="py-2 rounded-lg bg-gray-200 font-bold text-gray-800 hover:opacity-90 disabled:opacity-60"
                  disabled={rewriteLoading || isLoading}
                >
                  {rewriteLoading ? "..." : "Netleştir"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRewrite("assertive")}
                  className="py-2 rounded-lg bg-zenith-primary font-bold text-white hover:opacity-90 disabled:opacity-60"
                  disabled={rewriteLoading || isLoading}
                >
                  {rewriteLoading ? "..." : "Güçlü & Saygılı"}
                </button>
              </div>
            </div>

            {/* Analyze butonu */}
            <button
              type="submit"
              className={`w-full py-3 text-lg font-bold text-black rounded-lg transition duration-300 ease-in-out hover:shadow-lg ${ACCENT_COLOR} ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Analiz Ediliyor...' : 'Kararı Analiz Et (Ücretsiz Beta)'}
            </button>
          </form>
        </section>

        {/* Rewrite hata */}
        {rewriteError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Rewrite Hata!</strong>
            <span className="block sm:inline ml-2">{rewriteError}</span>
          </div>
        )}

        {/* Rewrite sonuç */}
        {rewriteText && (
          <section className="p-4 bg-white rounded-lg border">
            <h3 className="font-bold text-gray-800 mb-2">✨ Önerilen Metin</h3>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg"
              rows={5}
              value={rewriteText}
              readOnly
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-3 py-2 rounded bg-black text-white text-sm"
                onClick={() => navigator.clipboard.writeText(rewriteText)}
              >
                Kopyala
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded bg-gray-100 text-sm"
                onClick={() => setDecisionText(rewriteText)}
              >
                Metni Değiştir
              </button>
            </div>
          </section>
        )}

        {/* Analyze hata */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Analyze sonuç */}
        {analysisResult && (
          <section className="mt-2 p-6 bg-gray-50 rounded-lg shadow-inner border-l-4 border-zenith-primary">
            <h2 className="text-xl font-bold text-zenith-primary mb-4 flex items-center">
              🧠 Ego-Sıfır Analiz Sonucu
            </h2>

            <div className="space-y-3">
              <p className="text-sm text-gray-700 border-b pb-2 border-gray-200">
                <span className="font-semibold">🔍 Tespit Edilen Duygusallık (Bileşik):</span>
                <span className={`ml-2 font-bold ${interpretCompoundScore(compound).color} text-base`}>
                  {interpretCompoundScore(compound).text} ({Number(compound).toFixed(3)})
                </span>
              </p>

              <div className="flex justify-between text-xs pt-2">
                <p className="text-green-600 font-medium">
                  Pozitif Ton: {(analysisResult.pozitif_skor * 100).toFixed(1)}%
                </p>
                <p className="text-gray-600 font-medium">
                  Nötr Ton: {(analysisResult.nötr_skor * 100).toFixed(1)}%
                </p>
                <p className="text-red-600 font-medium">
                  Negatif Ton: {(analysisResult.negatif_skor * 100).toFixed(1)}%
                </p>
              </div>

              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">Zenith Eylem Tavsiyesi:</h3>

                <p className="text-sm text-gray-600 italic">
                  Kararınız, mantıksal verilerden çok anlık duygusal ağırlık içeriyor.
                  Panik (Negatif) veya FOMO (Pozitif) anında işlem yapmak, uzun vadede riskinizi artırabilir.
                </p>

                {/* Revshare alanı */}
                <p className="mt-3 text-sm">
                  Önyargılarınızı kenara bırakın ve dünyanın en güvenli platformlarından birinde yeni bir başlangıç yapın:
                  <br />
                  <a
                    href="https://www.binance.com/activity/referral-entry/CPA?ref=CPA_003RRA9B6U"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 py-2 px-4 text-black font-bold rounded-lg transition duration-300 ease-in-out hover:shadow-md hover:opacity-95 text-center"
                    style={{ backgroundColor: '#FCD535' }}
                  >
                    🚀 Binance Hesabı Açın (Komisyon İndirimi Kazanma Şansı!)
                  </a>
                </p>
              </div>
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          Beta V0.1. Veriler anonimleştirilerek AI modelini geliştirmek için kullanılabilir.
        </footer>
      </div>
    </div>
  );
}
