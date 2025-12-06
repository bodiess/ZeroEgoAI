"use client";

import React, { useMemo, useState } from "react";

const PRIMARY_BG = "bg-zenith-bg";
const CARD_BG = "bg-white";
const PRIMARY_TEXT = "text-zenith-primary";
const ACCENT_BG = "bg-zenith-accent";

export default function HomePage() {
  const [decisionText, setDecisionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const [rewriteText, setRewriteText] = useState("");
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);

  const interpretCompoundScore = (score) => {
    if (score >= 0.05) return { text: "Yüksek Pozitif Ton", color: "text-green-600" };
    if (score <= -0.05) return { text: "Yüksek Negatif/Korku Tonu", color: "text-red-600" };
    return { text: "Nispeten Nötr Ton", color: "text-gray-600" };
  };

  const compoundMeta = useMemo(() => {
    if (!analysisResult) return null;
    return interpretCompoundScore(analysisResult.bileşik_skor);
  }, [analysisResult]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decisionText.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: decisionText }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data.analysis);
      } else {
        setError(data.error || "Analiz sırasında beklenmedik bir hata oluştu.");
      }
    } catch (err) {
      console.error("API Bağlantı Hatası:", err);
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewrite = async (mode) => {
    if (!decisionText.trim()) return;

    setRewriteLoading(true);
    setRewriteError(null);
    setRewriteText("");

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: decisionText, mode }),
      });

      const data = await response.json();

      if (response.ok) {
        setRewriteText(data.rewritten);
      } else {
        setRewriteError(data.error || "Rewrite sırasında hata oluştu.");
      }
    } catch (err) {
      setRewriteError("Sunucuya bağlanılamadı.");
    } finally {
      setRewriteLoading(false);
    }
  };

  const copyRewrite = async () => {
    try {
      await navigator.clipboard.writeText(rewriteText);
    } catch (_) {}
  };

  return (
    <div className={`min-h-screen ${PRIMARY_BG} flex items-center justify-center p-4`}>
      <div
        className={`w-full max-w-xl ${CARD_BG} rounded-2xl shadow-2xl p-8 space-y-8
        transition-all duration-300`}
      >
        {/* Başlık */}
        <header className="text-center">
          <h1 className={`text-3xl md:text-4xl font-extrabold ${PRIMARY_TEXT}`}>
            Zenith Decision
          </h1>
          <p className="text-gray-500 mt-1 italic">
            Duygusuz değil, önyargısız kararlar.
          </p>
        </header>

        {/* Form */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            💸 Finansal Kararınızı Girin
          </h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="decision" className="block text-sm font-medium text-gray-700 mb-2">
              Kararınızın Tam Metni
            </label>

            <textarea
              id="decision"
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-zenith-accent focus:border-zenith-accent
                         transition duration-150"
              placeholder="Örnek: 'Tüm paramla A hissesine girmeyi düşünüyorum...'"
              value={decisionText}
              onChange={(e) => setDecisionText(e.target.value)}
              required
              disabled={isLoading || rewriteLoading}
            />

            {/* Rewrite butonları */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleRewrite("soften")}
                className={`py-2 rounded-lg ${ACCENT_BG} font-bold text-black
                            hover:opacity-90 transition`}
                disabled={rewriteLoading}
              >
                {rewriteLoading ? "..." : "Yumuşat"}
              </button>

              <button
                type="button"
                onClick={() => handleRewrite("clarify")}
                className="py-2 rounded-lg bg-gray-100 font-bold text-gray-800
                           hover:bg-gray-200 transition"
                disabled={rewriteLoading}
              >
                {rewriteLoading ? "..." : "Netleştir"}
              </button>

              <button
                type="button"
                onClick={() => handleRewrite("assertive")}
                className="py-2 rounded-lg bg-zenith-primary font-bold text-white
                           hover:opacity-90 transition"
                disabled={rewriteLoading}
              >
                {rewriteLoading ? "..." : "Güçlü & Saygılı"}
              </button>
            </div>

            {/* Analiz butonu */}
            <button
              type="submit"
              className={`w-full mt-5 py-3 text-lg font-bold text-black rounded-lg
                          ${ACCENT_BG}
                          hover:shadow-lg hover:opacity-95 transition
                          ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Analiz Ediliyor..." : "Kararı Analiz Et (Ücretsiz Beta)"}
            </button>
          </form>
        </section>

        {/* Rewrite hata */}
        {rewriteError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            {rewriteError}
          </div>
        )}

        {/* Rewrite sonuç */}
        {rewriteText && (
          <section className="p-4 bg-white rounded-lg border border-gray-100">
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
                onClick={copyRewrite}
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

        {/* Analiz hata */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Hata!</strong>
            <span className="ml-2">{error}</span>
          </div>
        )}

        {/* Analiz sonuç */}
        {analysisResult && compoundMeta && (
          <section className="mt-2 p-6 bg-gray-50 rounded-lg shadow-inner border-l-4 border-zenith-primary">
            <h2 className={`text-xl font-bold ${PRIMARY_TEXT} mb-4 flex items-center`}>
              🧠 Ego-Sıfır Analiz Sonucu
            </h2>

            <p className="text-sm text-gray-700 border-b pb-2 border-gray-200">
              <span className="font-semibold">🔍 Tespit Edilen Duygusallık (Bileşik):</span>
              <span className={`ml-2 font-bold ${compoundMeta.color} text-base`}>
                {compoundMeta.text} ({Number(analysisResult.bileşik_skor).toFixed(3)})
              </span>
            </p>

            <div className="flex justify-between text-xs pt-3">
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
                Panik veya FOMO anında işlem yapmak uzun vadede zarar riskini artırır.
              </p>

              <div className="mt-4">
                <a
                  href="https://www.binance.com/activity/referral-entry/CPA?ref=CPA_003RRA9B6U"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block py-2 px-4 text-black font-bold rounded-lg
                             hover:shadow-md hover:opacity-95 transition text-center"
                  style={{ backgroundColor: "#FCD535" }}
                >
                  🚀 Binance Hesabı Açın
                </a>
              </div>
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          Beta V0.1
        </footer>
      </div>
    </div>
  );
}
