"use client";

import React, { useMemo, useState } from "react";

const BINANCE_REF =
  "https://www.binance.com/activity/referral-entry/CPA?ref=CPA_003RRA9B6U";

const SURPRISE_TIPS = [
  {
    title: "10 Saniye Kuralı",
    body:
      "Metni göndermeden önce 10 saniye bekle. Bu mini duraklama panik ve FOMO kararlarını kırar.",
  },
  {
    title: "Tek Cümle Testi",
    body:
      "Kararını tek cümlede kanıt ve risk/ödül oranıyla özetleyebiliyor musun? Özetleyemiyorsan önce netleştir.",
  },
  {
    title: "Karşı Tez",
    body:
      "Kendine şu soruyu sor: 'Bu kararın yanlış çıkması için en güçlü sebep ne?'",
  },
  {
    title: "Duygu Etiketi",
    body:
      "Metninin başına etiket koy: [Korku], [Coşku], [Kararsızlık]. Etiketlemek otomatik mesafe kazandırır.",
  },
  {
    title: "Mikro-Revizyon",
    body:
      "Metnin %20’sini sil. Kısaldıkça tonlar yumuşar ve söylemek istediğin daha güçlü çıkar.",
  },
  {
    title: "Risk Sınırı",
    body:
      "Tek bir karara tek seferde %100 yüklenme hissi genelde duygusal tetikleyicidir. Böl, aşamalı düşün.",
  },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function HomePage() {
  const [decisionText, setDecisionText] = useState("");

  // analyze
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // rewrite
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  const [rewriteText, setRewriteText] = useState("");

  const interpretCompoundScore = (score) => {
    if (score >= 0.05) return { text: "Pozitif Ton Baskın", color: "text-green-600" };
    if (score <= -0.05) return { text: "Negatif/Korku Tonu", color: "text-red-600" };
    return { text: "Nötr Ton", color: "text-gray-600" };
  };

  const compoundMeta = useMemo(() => {
    if (!analysisResult) return null;
    return interpretCompoundScore(analysisResult.bileşik_skor ?? 0);
  }, [analysisResult]);

  const percents = useMemo(() => {
    if (!analysisResult) return null;
    const pos = Math.round((analysisResult.pozitif_skor || 0) * 100);
    const neu = Math.round((analysisResult.nötr_skor || 0) * 100);
    const neg = Math.round((analysisResult.negatif_skor || 0) * 100);
    return { pos, neu, neg };
  }, [analysisResult]);

  const surprise = useMemo(() => {
    const base = decisionText.trim() || "zero-ego";
    const idx = hashString(base) % SURPRISE_TIPS.length;
    return SURPRISE_TIPS[idx];
  }, [decisionText]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decisionText.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: decisionText }),
      });

      const data = await res.json();

      if (res.ok) setAnalysisResult(data.analysis);
      else setError(data.error || "Analiz sırasında beklenmedik bir hata oluştu.");
    } catch {
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
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: decisionText, mode }),
      });

      const data = await res.json();

      if (res.ok) setRewriteText(data.rewritten);
      else setRewriteError(data.error || "Rewrite sırasında hata oluştu.");
    } catch {
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
    <div className="min-h-screen bg-zenith-bg">
      {/* Background soft mesh (global CSS varsa güzel görünür, yoksa sorun değil) */}
      <div className="absolute inset-0 zenith-mesh opacity-30 pointer-events-none" />

      <div className="relative px-4 pt-8 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-xs font-semibold text-zenith-muted">
              ⚡ Zero Ego • Premium Dashboard
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="zenith-chip">Ton Radar</span>
              <span className="zenith-chip">Rewrite</span>
              <span className="zenith-chip">Sürpriz İçgörü</span>
              <span className="zenith-chip">Aksiyon</span>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-5 space-y-6">
              {/* Input card */}
              <div className="zenith-card zenith-card-raise p-7 animate-card-in">
                <h1 className="text-3xl font-extrabold text-zenith-primary tracking-tight">
                  Zenith Decision
                </h1>
                <p className="text-zenith-muted mt-1 italic text-sm">
                  Duygusuz değil, önyargısız kararlar.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block text-sm font-medium text-zenith-ink">
                    Karar Metni
                  </label>

                  <textarea
                    rows={8}
                    className="zenith-textarea"
                    placeholder="Örnek: 'Tüm paramla X'e girmeyi düşünüyorum...'"
                    value={decisionText}
                    onChange={(e) => setDecisionText(e.target.value)}
                    disabled={isLoading || rewriteLoading}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRewrite("soften")}
                      disabled={rewriteLoading || isLoading}
                      className="zenith-btn-gold"
                    >
                      {rewriteLoading ? "..." : "Yumuşat"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRewrite("clarify")}
                      disabled={rewriteLoading || isLoading}
                      className="zenith-btn bg-black/[0.04] text-zenith-ink"
                    >
                      {rewriteLoading ? "..." : "Netleştir"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRewrite("assertive")}
                      disabled={rewriteLoading || isLoading}
                      className="zenith-btn-primary"
                    >
                      {rewriteLoading ? "..." : "Güçlü & Saygılı"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full zenith-btn-gold text-base"
                  >
                    {isLoading ? "Analiz Ediliyor..." : "Kararı Analiz Et"}
                  </button>
                </form>

                {/* Errors */}
                {rewriteError && (
                  <div className="mt-4 zenith-alert zenith-alert-danger">
                    <strong>Rewrite:</strong>
                    <span className="ml-2">{rewriteError}</span>
                  </div>
                )}
                {error && (
                  <div className="mt-3 zenith-alert zenith-alert-danger">
                    <strong>Analiz:</strong>
                    <span className="ml-2">{error}</span>
                  </div>
                )}

                {/* Rewrite result */}
                {rewriteText && (
                  <div className="mt-5 zenith-card p-4 animate-card-in">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-zenith-ink">✨ Önerilen Metin</h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={copyRewrite}
                          className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold"
                        >
                          Kopyala
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecisionText(rewriteText)}
                          className="px-3 py-1.5 rounded-lg bg-black/[0.05] text-xs font-bold"
                        >
                          Uygula
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="w-full mt-3 p-3 border border-zenith-border rounded-lg bg-black/[0.02]"
                      rows={5}
                      readOnly
                      value={rewriteText}
                    />
                  </div>
                )}
              </div>

              {/* Surprise */}
              <div className="zenith-card zenith-card-raise p-6 animate-card-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-zenith-ink">
                    🎁 Sürpriz İçgörü
                  </h3>
                  <span className="zenith-chip">metne özel</span>
                </div>
                <p className="mt-2 text-sm font-bold text-zenith-primary">
                  {surprise.title}
                </p>
                <p className="mt-2 text-sm text-zenith-muted">
                  {surprise.body}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="zenith-stat animate-card-in">
                  <div className="zenith-stat-label">Durum</div>
                  <div className="zenith-stat-value">
                    {analysisResult ? "Hazır" : isLoading ? "İşleniyor" : "Beklemede"}
                  </div>
                  <div className="zenith-stat-sub">Ton motoru</div>
                </div>
                <div className="zenith-stat animate-card-in">
                  <div className="zenith-stat-label">Rewrite</div>
                  <div className="zenith-stat-value">
                    {rewriteText ? "1 öneri" : "Hazır"}
                  </div>
                  <div className="zenith-stat-sub">Tek tık güçlendirme</div>
                </div>
                <div className="zenith-stat animate-card-in">
                  <div className="zenith-stat-label">Premium</div>
                  <div className="zenith-stat-value">Aktif</div>
                  <div className="zenith-stat-sub">Soft elit UI</div>
                </div>
              </div>

              {/* Analysis panel */}
              <div className="zenith-card p-7 animate-card-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-zenith-primary">
                    🧠 Ton Radar
                  </h2>
                  {compoundMeta && (
                    <span className={`text-xs font-extrabold ${compoundMeta.color}`}>
                      {compoundMeta.text}
                    </span>
                  )}
                </div>

                {/* Loading blocks */}
                {isLoading && !analysisResult && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                  </div>
                )}

                {/* Results */}
                {analysisResult && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-black/[0.03] border border-zenith-border">
                      <div className="text-xs font-semibold text-zenith-muted">
                        Bileşik Skor
                      </div>
                      <div className="mt-2 text-4xl font-extrabold text-zenith-ink">
                        {Number(analysisResult.bileşik_skor).toFixed(3)}
                      </div>
                      <p className="mt-2 text-sm text-zenith-muted">
                        Skor, duygusal yön ve yoğunluk göstergesidir.
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-black/[0.03] border border-zenith-border">
                      <div className="text-xs font-semibold text-zenith-muted">
                        Ton Dağılımı
                      </div>

                      {percents && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-green-700">Pozitif</span>
                              <span>{percents.pos}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                              <div className="h-2 bg-green-500" style={{ width: `${percents.pos}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-gray-700">Nötr</span>
                              <span>{percents.neu}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                              <div className="h-2 bg-gray-500" style={{ width: `${percents.neu}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-red-700">Negatif</span>
                              <span>{percents.neg}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                              <div className="h-2 bg-red-500" style={{ width: `${percents.neg}%` }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* BINANCE CTA - analysis sonrası ödül gibi */}
              {analysisResult && (
                <div className="zenith-card zenith-card-raise p-6 animate-card-in">
                  <div className="flex items-center justify-between">
                    <span className="zenith-chip">Destek & Avantaj</span>
                    <span className="text-[10px] font-bold text-zenith-muted">
                      sponsor öneri
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-extrabold text-zenith-ink">
                    💛 Zenith Topluluğuna Katıl
                  </h3>

                  <p className="mt-2 text-sm text-zenith-muted">
                    Eğer kripto tarafında bir hesap açmayı zaten düşünüyorsan,
                    bu link üzerinden kayıt olarak <strong>Zenith Decision</strong>’ın
                    gelişimine destek olabilirsin.
                  </p>

                  <ul className="mt-3 space-y-1 text-xs text-zenith-muted">
                    <li>• Zorunlu değil, tamamen isteğe bağlı.</li>
                    <li>• Bu içerik yatırım tavsiyesi değildir.</li>
                    <li>• Kampanya/avantaj koşulları Binance tarafından belirlenir.</li>
                  </ul>

                  <a
                    href={BINANCE_REF}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center justify-center w-full zenith-btn-gold"
                  >
                    Binance’e Katıl & Zenith’i Destekle
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-[10px] text-zenith-muted mt-10">
            Beta • Zero Ego AI
          </div>
        </div>
      </div>
    </div>
  );
}
