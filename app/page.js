"use client";

import React, { useMemo, useState } from "react";

const PRIMARY_BG = "bg-zenith-primary";
const ACCENT_BG = "bg-zenith-accent";

export default function HomePage() {
  const [decisionText, setDecisionText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  const [rewriteText, setRewriteText] = useState("");

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
    setError(null);
    setAnalysisResult(null);

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
    } catch {}
  };

  return (
    <div className={`relative min-h-screen ${PRIMARY_BG} overflow-hidden`}>
      {/* ===== Premium animated background overlays ===== */}
      <div className="absolute inset-0 zenith-mesh opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] zenith-orb zenith-orb-a pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[560px] h-[560px] zenith-orb zenith-orb-b pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Glow ring behind card */}
        <div className="absolute w-[720px] max-w-[95vw] h-[720px] zenith-glow-ring pointer-events-none" />

        <div className="w-full max-w-xl bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-8 border border-white/40 zenith-fade-up">
          {/* ===== Header ===== */}
          <header className="text-center zenith-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/5 text-xs font-semibold text-gray-600">
              ⚡ Zero Ego • Premium Beta
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-zenith-primary tracking-tight">
              Zenith Decision
            </h1>
            <p className="text-gray-500 mt-1 italic">
              Duygusuz değil, önyargısız kararlar.
            </p>
          </header>

          {/* ===== Input & Actions ===== */}
          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              💸 Finansal Kararınızı Girin
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kararınızın Tam Metni
                </label>

                <div className="relative">
                  <textarea
                    rows={6}
                    className="w-full p-4 border border-gray-200 rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-black/10
                               focus:border-gray-300 transition
                               placeholder:text-gray-400
                               zenith-textarea"
                    placeholder="Örnek: 'Tüm paramla A hissesine girmeyi düşünüyorum...'"
                    value={decisionText}
                    onChange={(e) => setDecisionText(e.target.value)}
                    disabled={isLoading || rewriteLoading}
                    required
                  />
                  <div className="absolute right-3 bottom-3 text-[10px] text-gray-400">
                    {decisionText.length} / 2000
                  </div>
                </div>

                {/* Rewrite buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleRewrite("soften")}
                    disabled={rewriteLoading || isLoading}
                    className={`zenith-btn ${ACCENT_BG} text-black`}
                  >
                    {rewriteLoading ? "..." : "Yumuşat"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRewrite("clarify")}
                    disabled={rewriteLoading || isLoading}
                    className="zenith-btn bg-gray-100 text-gray-900 hover:bg-gray-200"
                  >
                    {rewriteLoading ? "..." : "Netleştir"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRewrite("assertive")}
                    disabled={rewriteLoading || isLoading}
                    className="zenith-btn bg-zenith-primary text-white"
                  >
                    {rewriteLoading ? "..." : "Güçlü & Saygılı"}
                  </button>
                </div>
              </div>

              {/* Analyze button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-extrabold text-black
                            ${ACCENT_BG} zenith-primary-cta
                            ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Analiz Ediliyor..." : "Kararı Analiz Et (Ücretsiz Beta)"}
              </button>
            </form>
          </section>

          {/* ===== Rewrite Error ===== */}
          {rewriteError && (
            <div className="zenith-alert zenith-alert-danger zenith-fade-in">
              <strong>Rewrite Hata:</strong>
              <span className="ml-2">{rewriteError}</span>
            </div>
          )}

          {/* ===== Rewrite Result ===== */}
          {rewriteText && (
            <section className="p-4 rounded-xl border border-gray-100 bg-white zenith-fade-up">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">✨ Önerilen Metin</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyRewrite}
                    className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold hover:opacity-90 transition"
                  >
                    Kopyala
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionText(rewriteText)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-bold hover:bg-gray-200 transition"
                  >
                    Uygula
                  </button>
                </div>
              </div>

              <textarea
                className="w-full mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                rows={5}
                readOnly
                value={rewriteText}
              />
            </section>
          )}

          {/* ===== Analyze Error ===== */}
          {error && (
            <div className="zenith-alert zenith-alert-danger zenith-fade-in">
              <strong>Hata:</strong>
              <span className="ml-2">{error}</span>
            </div>
          )}

          {/* ===== Analysis Result ===== */}
          {analysisResult && compoundMeta && (
            <section className="p-6 bg-gray-50 rounded-xl shadow-inner border-l-4 border-zenith-primary zenith-fade-up">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-zenith-primary">
                  🧠 Ego-Sıfır Analiz
                </h2>
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-full bg-white border
                              ${compoundMeta.color}`}
                >
                  {compoundMeta.text}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-700 border-b pb-2 border-gray-200">
                <span className="font-semibold">Bileşik Skor:</span>
                <span className={`ml-2 font-bold ${compoundMeta.color}`}>
                  {Number(analysisResult.bileşik_skor).toFixed(3)}
                </span>
              </p>

              <div className="flex justify-between text-xs pt-3">
                <p className="text-green-600 font-medium">
                  Pozitif: {(analysisResult.pozitif_skor * 100).toFixed(1)}%
                </p>
                <p className="text-gray-600 font-medium">
                  Nötr: {(analysisResult.nötr_skor * 100).toFixed(1)}%
                </p>
                <p className="text-red-600 font-medium">
                  Negatif: {(analysisResult.negatif_skor * 100).toFixed(1)}%
                </p>
              </div>

              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">
                  Zenith Eylem Tavsiyesi
                </h3>
                <p className="text-sm text-gray-600 italic">
                  Kararınız, mantıksal verilerden çok anlık duygusal ağırlık içeriyor.
                  Panik veya FOMO anında işlem yapmak uzun vadede riskinizi artırabilir.
                </p>

                <div className="mt-4">
                  <a
                    href="https://www.binance.com/activity/referral-entry/CPA?ref=CPA_003RRA9B6U"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block py-2 px-4 text-black font-extrabold rounded-lg
                               hover:shadow-md hover:opacity-95 transition text-center"
                    style={{ backgroundColor: "#FCD535" }}
                  >
                    🚀 Binance Hesabı Açın
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* ===== Footer ===== */}
          <footer className="text-center text-xs text-gray-400 pt-2">
            Beta V0.2 • Minimal animasyon • Stabil build
          </footer>
        </div>
      </div>

      {/* ===== Local CSS animations (no extra dependency) ===== */}
      <style jsx global>{`
        .zenith-mesh {
          background-image:
            radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.12), transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.10), transparent 45%),
            radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.10), transparent 40%),
            radial-gradient(circle at 70% 90%, rgba(255, 255, 255, 0.12), transparent 45%);
          filter: blur(18px);
        }

        .zenith-orb {
          border-radius: 9999px;
          filter: blur(46px);
          opacity: 0.35;
          animation: zenithFloat 10s ease-in-out infinite;
        }
        .zenith-orb-a {
          background: radial-gradient(circle, rgba(255,255,255,0.14), transparent 60%);
        }
        .zenith-orb-b {
          background: radial-gradient(circle, rgba(255,255,255,0.12), transparent 60%);
          animation-delay: -4s;
        }

        .zenith-glow-ring {
          background:
            radial-gradient(circle at center,
              rgba(255,255,255,0.12),
              rgba(255,255,255,0.0) 60%);
          filter: blur(22px);
          animation: zenithPulse 6.5s ease-in-out infinite;
        }

        .zenith-fade-in {
          animation: zenithFadeIn 260ms ease-out both;
        }
        .zenith-fade-up {
          animation: zenithFadeUp 420ms cubic-bezier(.16,.84,.24,1) both;
        }

        .zenith-btn {
          padding: 0.6rem 0.9rem;
          border-radius: 0.75rem;
          font-weight: 800;
          font-size: 0.95rem;
          transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease, background-color 160ms ease;
          box-shadow: 0 8px 18px rgba(0,0,0,0.06);
        }
        .zenith-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.10);
        }
        .zenith-btn:active {
          transform: translateY(0px) scale(0.99);
        }

        .zenith-primary-cta {
          transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
          box-shadow: 0 10px 26px rgba(0,0,0,0.08);
        }
        .zenith-primary-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(0,0,0,0.12);
        }
        .zenith-primary-cta:active {
          transform: scale(0.99);
        }

        .zenith-textarea {
          transition: box-shadow 160ms ease, border-color 160ms ease;
        }
        .zenith-textarea:focus {
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        .zenith-alert {
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          border: 1px solid transparent;
        }
        .zenith-alert-danger {
          background: #fee2e2;
          border-color: #fecaca;
          color: #991b1b;
        }

        @keyframes zenithFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zenithFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zenithFloat {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes zenithPulse {
          0%,100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}
