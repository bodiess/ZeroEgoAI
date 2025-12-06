"use client";

import React, { useMemo, useState } from "react";

const PRIMARY_BG = "bg-zenith-primary";
const ACCENT_BG = "bg-zenith-accent";

const SURPRISE_TIPS = [
  {
    title: "10 Saniye Kuralı",
    body:
      "Metni göndermeden önce 10 saniye bekle. Bu mini duraklama, panik ve FOMO kararlarını ciddi şekilde kırar.",
  },
  {
    title: "Tek Cümle Testi",
    body:
      "Kararını tek cümlede, kanıt ve risk/ödül oranıyla özetleyebiliyor musun? Özetleyemiyorsan önce netleştir.",
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
      "Tek bir karara tek seferde %100 yüklenme hissi, çoğunlukla duygusal tetikleyicidir. Böl, aşamalı düşün.",
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
  // =========================
  // Core input
  // =========================
  const [decisionText, setDecisionText] = useState("");

  // =========================
  // Analyze state
  // =========================
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // =========================
  // Rewrite state
  // =========================
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  const [rewriteText, setRewriteText] = useState("");

  // Mini “aksiyon checklist” state (UI-only)
  const [checks, setChecks] = useState({
    breathe: false,
    clarify: false,
    counterThesis: false,
    riskLimit: false,
  });

  const interpretCompoundScore = (score) => {
    if (score >= 0.05) return { text: "Pozitif Ton Baskın", color: "text-green-600", pill: "bg-green-50 border-green-200" };
    if (score <= -0.05) return { text: "Negatif/Korku Tonu", color: "text-red-600", pill: "bg-red-50 border-red-200" };
    return { text: "Nötr Ton", color: "text-gray-600", pill: "bg-gray-50 border-gray-200" };
  };

  const compoundMeta = useMemo(() => {
    if (!analysisResult) return null;
    return interpretCompoundScore(analysisResult.bileşik_skor);
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

  const biasAlerts = useMemo(() => {
    if (!analysisResult) return [];
    const list = [];

    const c = analysisResult.bileşik_skor ?? 0;
    const p = analysisResult.pozitif_skor ?? 0;
    const n = analysisResult.negatif_skor ?? 0;

    if (c >= 0.2 || p >= 0.6) list.push("FOMO / Aşırı iyimserlik sinyali");
    if (c <= -0.2 || n >= 0.6) list.push("Panik / Kayıp kaçınması sinyali");
    if (Math.abs(c) < 0.05) list.push("Ton dengeli fakat 'Netleştir' ile mesaj gücü artar");
    if (p > 0.45 && n > 0.35) list.push("Çelişkili duygu karışımı: karar netliği düşebilir");

    return list.slice(0, 4);
  }, [analysisResult]);

  const riskNote = useMemo(() => {
    const s = analysisResult?.bileşik_skor;
    if (s === undefined || s === null) return null;
    if (s <= -0.25) return "Yüksek stres tonu. Göndermeden önce yumuşat + kısa versiyon önerilir.";
    if (s >= 0.25) return "Aşırı coşku tonu. Netleştir ve karşı tez ekle.";
    return "Ton dengeli. Metni %20 kısaltman mesaj gücünü artırabilir.";
  }, [analysisResult]);

  // =========================
  // Actions
  // =========================
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

  const toggleCheck = (key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={`relative min-h-screen ${PRIMARY_BG} overflow-hidden`}>
      {/* Premium animated background */}
      <div className="absolute inset-0 zenith-mesh opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[560px] h-[560px] zenith-orb zenith-orb-a pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[620px] h-[620px] zenith-orb zenith-orb-b pointer-events-none" />

      {/* Top strip */}
      <div className="relative z-10 px-4 pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white/90">
              ⚡ Zero Ego • Premium Dashboard
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="zenith-chip">Hızlı Rewrite</span>
              <span className="zenith-chip">Ton Radar</span>
              <span className="zenith-chip">Sürpriz İçgörü</span>
              <span className="zenith-chip">Aksiyon Planı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 px-4 pb-10 pt-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= LEFT: Input + Core Flow ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-7 border border-white/40 zenith-fade-up">
              <header className="text-left">
                <h1 className="text-3xl font-extrabold text-zenith-primary tracking-tight">
                  Zenith Decision
                </h1>
                <p className="text-gray-500 mt-1 italic">
                  Duygu filtresi değil, ego sıfırlayan karar aynası.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Karar Metni
                </label>

                <div className="relative">
                  <textarea
                    rows={8}
                    className="w-full p-4 border border-gray-200 rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-black/10
                               focus:border-gray-300 transition
                               placeholder:text-gray-400 zenith-textarea"
                    placeholder="Örnek: 'Tüm paramla X'e girmeyi düşünüyorum...'"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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

                {/* Analyze CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-black
                              ${ACCENT_BG} zenith-primary-cta
                              ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "Analiz Ediliyor..." : "Kararı Analiz Et"}
                </button>
              </form>

              {/* Errors */}
              {rewriteError && (
                <div className="mt-4 zenith-alert zenith-alert-danger zenith-fade-in">
                  <strong>Rewrite:</strong>
                  <span className="ml-2">{rewriteError}</span>
                </div>
              )}
              {error && (
                <div className="mt-3 zenith-alert zenith-alert-danger zenith-fade-in">
                  <strong>Analiz:</strong>
                  <span className="ml-2">{error}</span>
                </div>
              )}

              {/* Rewrite Result */}
              {rewriteText && (
                <section className="mt-5 p-4 rounded-xl border border-gray-100 bg-white zenith-fade-up">
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
            </div>

            {/* Surprise card (left secondary) */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 border border-white/40 zenith-fade-up">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-gray-900">🎁 Sürpriz İçgörü</h3>
                <span className="text-[10px] px-2 py-1 rounded-full bg-black/5 border border-black/5 text-gray-600 font-semibold">
                  metne özel
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-zenith-primary">{surprise.title}</p>
              <p className="mt-2 text-sm text-gray-600">{surprise.body}</p>
            </div>
          </div>

          {/* ================= RIGHT: Premium Dashboard ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="zenith-stat-card">
                <div className="zenith-stat-label">Durum</div>
                <div className="zenith-stat-value">
                  {analysisResult ? "Analiz Hazır" : isLoading ? "İşleniyor" : "Beklemede"}
                </div>
                <div className="zenith-stat-sub">
                  {analysisResult ? "Dashboard aktif" : "Metin gir, başlat"}
                </div>
              </div>
              <div className="zenith-stat-card">
                <div className="zenith-stat-label">Rewrite</div>
                <div className="zenith-stat-value">
                  {rewriteText ? "1 Öneri" : rewriteLoading ? "Üretiliyor" : "Hazır"}
                </div>
                <div className="zenith-stat-sub">Tek tık güçlendirme</div>
              </div>
              <div className="zenith-stat-card">
                <div className="zenith-stat-label">Premium Mod</div>
                <div className="zenith-stat-value">Aktif</div>
                <div className="zenith-stat-sub">Animasyon + akış</div>
              </div>
            </div>

            {/* Main analysis panel */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-7 border border-white/40 zenith-fade-up">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-2xl font-extrabold text-zenith-primary">
                  🧠 Ton Radar & Ego Haritası
                </h2>

                {compoundMeta && (
                  <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full border ${compoundMeta.pill} ${compoundMeta.color}`}>
                    {compoundMeta.text}
                  </span>
                )}
              </div>

              {/* Loading shimmer */}
              {isLoading && !analysisResult && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="zenith-shimmer h-28 rounded-xl" />
                  <div className="zenith-shimmer h-28 rounded-xl" />
                  <div className="zenith-shimmer h-28 rounded-xl" />
                  <div className="zenith-shimmer h-28 rounded-xl" />
                </div>
              )}

              {/* Results */}
              {analysisResult && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Big score card */}
                  <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500">Bileşik Skor</div>
                    <div className="mt-2 text-4xl font-extrabold text-gray-900">
                      {Number(analysisResult.bileşik_skor).toFixed(3)}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Bu skor metindeki duygusal yoğunluğun yönünü ve gücünü gösterir.
                    </div>
                    {riskNote && (
                      <div className="mt-3 p-3 rounded-lg bg-white border border-gray-100 text-sm text-gray-700">
                        <span className="font-bold">Not:</span> {riskNote}
                      </div>
                    )}
                  </div>

                  {/* Tone bars */}
                  <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500">Ton Dağılımı</div>

                    {percents && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-green-700">Pozitif</span>
                            <span>{percents.pos}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-2 bg-green-500" style={{ width: `${percents.pos}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-gray-700">Nötr</span>
                            <span>{percents.neu}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-2 bg-gray-500" style={{ width: `${percents.neu}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-red-700">Negatif</span>
                            <span>{percents.neg}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-2 bg-red-500" style={{ width: `${percents.neg}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bias alerts */}
                  <div className="p-5 rounded-xl bg-white border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500">Önyargı Uyarıları</div>
                    <ul className="mt-3 space-y-2 text-sm">
                      {biasAlerts.length === 0 && (
                        <li className="text-gray-500">Analiz sonrası otomatik uyarılar burada görünür.</li>
                      )}
                      {biasAlerts.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 inline-block w-2 h-2 rounded-full bg-zenith-accent" />
                          <span className="text-gray-700">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action checklist */}
                  <div className="p-5 rounded-xl bg-white border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500">Aksiyon Planı</div>
                    <div className="mt-3 space-y-2 text-sm">
                      {[
                        { key: "breathe", label: "10 saniye durakla ve yeniden oku" },
                        { key: "clarify", label: "Metni %20 kısalt (netleştir)" },
                        { key: "counterThesis", label: "Karşı tez ekle: 'Yanılıyor olabilirim çünkü...'" },
                        { key: "riskLimit", label: "Risk sınırını cümle içine yaz" },
                      ].map((it) => (
                        <label key={it.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checks[it.key]}
                            onChange={() => toggleCheck(it.key)}
                            className="accent-black"
                          />
                          <span className={`${checks[it.key] ? "line-through text-gray-400" : "text-gray-700"}`}>
                            {it.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Extra premium cards row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 border border-white/40 zenith-fade-up">
                <h3 className="text-lg font-extrabold text-gray-900">🧩 Mesaj Gücü Skoru</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Bu alan, ileride “netlik, kısalık, sakin ton” metrikleriyle güç puanı verecek.
                  Şimdilik premium görünüm katmanı aktif.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-500">
                  V1: UI hazır • V2: metrik motoru • V3: kişisel koç
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 border border-white/40 zenith-fade-up">
                <h3 className="text-lg font-extrabold text-gray-900">⚡ Hızlı Şablonlar</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Korku etiketi ekle", "Kısa versiyon", "Karşı tez ekle", "Saygılı ama net"].map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!decisionText.trim()) return;
                        if (t === "Korku etiketi ekle") setDecisionText(`[Korku] ${decisionText}`);
                        if (t === "Kısa versiyon") setDecisionText(decisionText.slice(0, Math.max(60, Math.floor(decisionText.length * 0.7))));
                        if (t === "Karşı tez ekle") setDecisionText(`${decisionText}\n\nKarşı tez: Yanılıyor olabilirim çünkü ...`);
                        if (t === "Saygılı ama net") handleRewrite("assertive");
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Bu şablonlar sadece metni düzenler; yatırım tavsiyesi değildir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Local CSS animations ===== */}
      <style jsx global>{`
        .zenith-mesh {
          background-image:
            radial-gradient(circle at 15% 10%, rgba(255,255,255,0.14), transparent 40%),
            radial-gradient(circle at 85% 25%, rgba(255,255,255,0.10), transparent 45%),
            radial-gradient(circle at 25% 85%, rgba(255,255,255,0.10), transparent 40%),
            radial-gradient(circle at 70% 90%, rgba(255,255,255,0.14), transparent 45%);
          filter: blur(18px);
        }
        .zenith-orb {
          border-radius: 9999px;
          filter: blur(52px);
          opacity: 0.35;
          animation: zenithFloat 10s ease-in-out infinite;
        }
        .zenith-orb-a {
          background: radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%);
        }
        .zenith-orb-b {
          background: radial-gradient(circle, rgba(255,255,255,0.12), transparent 60%);
          animation-delay: -4s;
        }

        .zenith-fade-up {
          animation: zenithFadeUp 420ms cubic-bezier(.16,.84,.24,1) both;
        }
        .zenith-fade-in {
          animation: zenithFadeIn 260ms ease-out both;
        }

        .zenith-btn {
          padding: 0.65rem 0.9rem;
          border-radius: 0.8rem;
          font-weight: 800;
          font-size: 0.95rem;
          transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease, background-color 160ms ease;
          box-shadow: 0 8px 18px rgba(0,0,0,0.06);
        }
        .zenith-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.10);
        }
        .zenith-btn:active { transform: translateY(0px) scale(0.99); }

        .zenith-primary-cta {
          transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
          box-shadow: 0 10px 26px rgba(0,0,0,0.08);
        }
        .zenith-primary-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(0,0,0,0.12);
        }
        .zenith-primary-cta:active { transform: scale(0.99); }

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

        .zenith-chip{
          display:inline-flex;
          align-items:center;
          gap:.35rem;
          padding:.35rem .6rem;
          border-radius:9999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.92);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .2px;
        }

        .zenith-stat-card{
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 1rem;
          padding: 1.1rem 1.2rem;
          box-shadow: 0 10px 28px rgba(0,0,0,0.10);
          animation: zenithFadeUp 420ms cubic-bezier(.16,.84,.24,1) both;
        }
        .zenith-stat-label{
          font-size: 10px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        .zenith-stat-value{
          margin-top: .35rem;
          font-size: 22px;
          font-weight: 900;
          color: #111827;
        }
        .zenith-stat-sub{
          margin-top: .25rem;
          font-size: 11px;
          color: #6b7280;
        }

        .zenith-shimmer{
          background: linear-gradient(90deg,
            rgba(0,0,0,0.04) 0%,
            rgba(0,0,0,0.08) 35%,
            rgba(0,0,0,0.04) 70%);
          background-size: 200% 100%;
          animation: zenithShimmer 1.2s ease-in-out infinite;
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
        @keyframes zenithShimmer{
          0% { background-position: 0% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
