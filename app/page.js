"use client";

import React, { useMemo, useState } from "react";

/**
 * =========================================================
 * Zenith Decision - Ultra Premium Dashboard (Full-Fat)
 * - Analyze: /api/analyze
 * - Rewrite: /api/rewrite
 * - No extra dependency
 * - Wide + Full card ecosystem
 * =========================================================
 */

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
      "Tek bir karara tek seferde %100 yüklenme hissi çoğunlukla duygusal tetikleyicidir. Böl, aşamalı düşün.",
  },
  {
    title: "3 Katman",
    body:
      "Metni 3 parçaya ayır: Veri, Risk, Plan. Bir katman eksikse karar duygusallaşır.",
  },
];

const QUICK_TEMPLATES = [
  { key: "fearTag", label: "Korku etiketi ekle" },
  { key: "joyTag", label: "Coşku etiketi ekle" },
  { key: "shorten", label: "Kısa versiyon" },
  { key: "counter", label: "Karşı tez ekle" },
  { key: "risk", label: "Risk sınırı cümlesi" },
  { key: "assertive", label: "Saygılı ama net" },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function interpretCompoundScore(score) {
  if (score >= 0.05) {
    return {
      text: "Pozitif Ton Baskın",
      color: "text-green-600",
      pill: "bg-green-50 border-green-200",
    };
  }
  if (score <= -0.05) {
    return {
      text: "Negatif/Korku Tonu",
      color: "text-red-600",
      pill: "bg-red-50 border-red-200",
    };
  }
  return {
    text: "Nötr Ton",
    color: "text-gray-600",
    pill: "bg-gray-50 border-gray-200",
  };
}

function buildBiasAlerts(analysis) {
  if (!analysis) return [];
  const list = [];

  const c = analysis.bileşik_skor ?? 0;
  const p = analysis.pozitif_skor ?? 0;
  const n = analysis.negatif_skor ?? 0;

  if (c >= 0.2 || p >= 0.6) list.push("FOMO / Aşırı iyimserlik sinyali");
  if (c <= -0.2 || n >= 0.6) list.push("Panik / Kayıp kaçınması sinyali");
  if (Math.abs(c) < 0.05)
    list.push("Ton dengeli: netleştirme ile mesaj gücü artar");
  if (p > 0.45 && n > 0.35)
    list.push("Çelişkili duygu karışımı: karar netliği düşebilir");

  return list.slice(0, 5);
}

function riskNoteText(analysis) {
  if (!analysis) return null;
  const s = analysis.bileşik_skor ?? 0;
  if (s <= -0.25)
    return "Yüksek stres tonu. Göndermeden önce yumuşat + kısa versiyon önerilir.";
  if (s >= 0.25)
    return "Aşırı coşku tonu. Netleştir ve karşı tez ekle.";
  return "Ton dengeli. Metni %20 kısaltman mesaj gücünü artırabilir.";
}

// Basit “mesaj gücü” heuristiği (UI için)
function messagePowerScore(text) {
  const t = (text || "").trim();
  if (!t) return { score: 0, label: "Boş", hint: "Metin girerek güç skorunu gör." };

  const len = t.length;
  const sentences = t.split(/[.!?…]\s*/).filter(Boolean).length || 1;
  const avgLen = Math.round(len / sentences);

  // ideal: 120-420 char aralığı, 2-6 cümle
  let score = 50;

  if (len < 80) score -= 15;
  if (len > 700) score -= 12;
  if (sentences >= 2 && sentences <= 6) score += 15;
  if (avgLen >= 25 && avgLen <= 90) score += 10;

  // aşırı ünlem/emoji varsa biraz kır
  const exclam = (t.match(/!/g) || []).length;
  if (exclam >= 3) score -= 8;

  score = Math.max(0, Math.min(100, score));

  let label = "Orta";
  if (score >= 80) label = "Çok Güçlü";
  else if (score >= 65) label = "Güçlü";
  else if (score <= 35) label = "Zayıf";

  const hint =
    label === "Çok Güçlü"
      ? "Kısa, net, dengeli ton."
      : label === "Güçlü"
      ? "Az daha kısaltma ve risk cümlesi ekleme ile mükemmel."
      : label === "Orta"
      ? "Netleştir + karşı tez eklersen bariz güçlenir."
      : "Metni kısalt, tek iddiayı tek cümleyle destekle.";

  return { score, label, hint };
}

function shortenText(text) {
  const t = (text || "").trim();
  if (!t) return t;
  const target = Math.max(80, Math.floor(t.length * 0.7));
  return t.slice(0, target);
}

export default function HomePage() {
  // =========================================================
  // Core input
  // =========================================================
  const [decisionText, setDecisionText] = useState("");

  // =========================================================
  // Analyze state
  // =========================================================
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // =========================================================
  // Rewrite state
  // =========================================================
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  const [rewriteText, setRewriteText] = useState("");

  // =========================================================
  // Aksiyon checklist UI state
  // =========================================================
  const [checks, setChecks] = useState({
    breathe: false,
    shorten: false,
    counter: false,
    risk: false,
  });

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

  const biasAlerts = useMemo(
    () => buildBiasAlerts(analysisResult),
    [analysisResult]
  );

  const riskNote = useMemo(
    () => riskNoteText(analysisResult),
    [analysisResult]
  );

  const power = useMemo(
    () => messagePowerScore(decisionText),
    [decisionText]
  );

  // =========================================================
  // Actions
  // =========================================================
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

  const applyTemplate = (tplKey) => {
    if (!decisionText.trim() && tplKey !== "assertive") return;

    if (tplKey === "fearTag") {
      setDecisionText(`[Korku] ${decisionText}`);
      return;
    }
    if (tplKey === "joyTag") {
      setDecisionText(`[Coşku] ${decisionText}`);
      return;
    }
    if (tplKey === "shorten") {
      setDecisionText(shortenText(decisionText));
      return;
    }
    if (tplKey === "counter") {
      setDecisionText(
        `${decisionText}\n\nKarşı tez: Yanılıyor olabilirim çünkü ...`
      );
      return;
    }
    if (tplKey === "risk") {
      setDecisionText(
        `${decisionText}\n\nRisk sınırım: Bu karar için kabul edilebilir maksimum zarar %...`
      );
      return;
    }
    if (tplKey === "assertive") {
      handleRewrite("assertive");
    }
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="relative min-h-screen bg-zenith-bg overflow-hidden">
      {/* Soft mesh background (globals.css varsa premium görünür) */}
      <div className="absolute inset-0 zenith-mesh opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] zenith-orb zenith-orb-a pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[560px] h-[560px] zenith-orb zenith-orb-b pointer-events-none" />

      <div className="relative z-10 px-4 pt-8 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-xs font-semibold text-zenith-muted">
              ⚡ Zero Ego • Ultra Premium
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="zenith-chip">Ton Radar</span>
              <span className="zenith-chip">Önyargı Uyarıları</span>
              <span className="zenith-chip">Sürpriz İçgörü</span>
              <span className="zenith-chip">Aksiyon Planı</span>
              <span className="zenith-chip">Rewrite</span>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ================= LEFT PANEL ================= */}
            <div className="lg:col-span-5 space-y-6">
              {/* Input / Core card */}
              <div className="zenith-card zenith-card-raise p-7 animate-card-in">
                <header>
                  <h1 className="text-3xl font-extrabold text-zenith-primary tracking-tight">
                    Zenith Decision
                  </h1>
                  <p className="text-zenith-muted mt-1 italic text-sm">
                    Duygu filtresi değil, ego sıfırlayan karar aynası.
                  </p>
                </header>

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

                  {/* Rewrite buttons */}
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

                  {/* Analyze CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full zenith-btn-gold text-base ${
                      isLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Analiz Ediliyor..." : "Kararı Analiz Et"}
                  </button>
                </form>

                {/* Errors */}
                {rewriteError && (
                  <div className="mt-4 zenith-alert zenith-alert-danger animate-card-in">
                    <strong>Rewrite:</strong>
                    <span className="ml-2">{rewriteError}</span>
                  </div>
                )}
                {error && (
                  <div className="mt-3 zenith-alert zenith-alert-danger animate-card-in">
                    <strong>Analiz:</strong>
                    <span className="ml-2">{error}</span>
                  </div>
                )}

                {/* Rewrite Result */}
                {rewriteText && (
                  <section className="mt-5 zenith-card p-4 animate-card-in">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-zenith-ink">
                        ✨ Önerilen Metin
                      </h3>
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
                  </section>
                )}
              </div>

              {/* Surprise Insight */}
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

              {/* Message Power (left variant) */}
              <div className="zenith-card p-6 animate-card-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-zenith-ink">
                    🧩 Mesaj Gücü
                  </h3>
                  <span className="zenith-chip">heuristic</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zenith-ink">
                    {power.score}
                  </span>
                  <span className="text-sm font-bold text-zenith-muted">
                    / 100 • {power.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zenith-muted">{power.hint}</p>
              </div>
            </div>

            {/* ================= RIGHT PANEL ================= */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stats row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="zenith-stat animate-card-in">
                  <div className="zenith-stat-label">Durum</div>
                  <div className="zenith-stat-value">
                    {analysisResult ? "Analiz Hazır" : isLoading ? "İşleniyor" : "Beklemede"}
                  </div>
                  <div className="zenith-stat-sub">Ton motoru</div>
                </div>
                <div className="zenith-stat animate-card-in">
                  <div className="zenith-stat-label">Rewrite</div>
                  <div className="zenith-stat-value">
                    {rewriteText ? "1 Öneri" : rewriteLoading ? "Üretiliyor" : "Hazır"}
                  </div>
                  <div className="zenith-stat-sub">Tek tık güçlendirme</div>
                </div>
                <div className="zenith-stat animate-card-in">
                  <div className="zenith-stat-label">Premium</div>
                  <div className="zenith-stat-value">Aktif</div>
                  <div className="zenith-stat-sub">Soft elit UI</div>
                </div>
              </div>

              {/* Main Analysis Mega Card */}
              <div className="zenith-card p-7 animate-card-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-zenith-primary">
                    🧠 Ton Radar & Ego Haritası
                  </h2>
                  {compoundMeta && (
                    <span
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-full border ${compoundMeta.pill} ${compoundMeta.color}`}
                    >
                      {compoundMeta.text}
                    </span>
                  )}
                </div>

                {/* Loading shimmer grid */}
                {isLoading && !analysisResult && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                    <div className="zenith-shimmer animate-shimmer h-28 rounded-xl" />
                  </div>
                )}

                {/* Results grid */}
                {analysisResult && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Compound score card */}
                    <div className="p-5 rounded-xl bg-black/[0.03] border border-zenith-border">
                      <div className="text-xs font-semibold text-zenith-muted">
                        Bileşik Skor
                      </div>
                      <div className="mt-2 text-4xl font-extrabold text-zenith-ink">
                        {Number(analysisResult.bileşik_skor).toFixed(3)}
                      </div>
                      <p className="mt-2 text-sm text-zenith-muted">
                        Skor metindeki duygu yönü ve yoğunluğunu özetler.
                      </p>

                      {riskNote && (
                        <div className="mt-3 p-3 rounded-lg bg-white border border-zenith-border text-sm text-zenith-ink">
                          <span className="font-bold">Not:</span> {riskNote}
                        </div>
                      )}
                    </div>

                    {/* Tone distribution */}
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
                              <div
                                className="h-2 bg-green-500"
                                style={{ width: `${percents.pos}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-gray-700">Nötr</span>
                              <span>{percents.neu}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                              <div
                                className="h-2 bg-gray-500"
                                style={{ width: `${percents.neu}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-red-700">Negatif</span>
                              <span>{percents.neg}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                              <div
                                className="h-2 bg-red-500"
                                style={{ width: `${percents.neg}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bias alerts */}
                    <div className="p-5 rounded-xl bg-white border border-zenith-border">
                      <div className="text-xs font-semibold text-zenith-muted">
                        Önyargı Uyarıları
                      </div>
                      <ul className="mt-3 space-y-2 text-sm">
                        {biasAlerts.length === 0 && (
                          <li className="text-zenith-muted">
                            Analiz uyarıları burada listelenecek.
                          </li>
                        )}
                        {biasAlerts.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 inline-block w-2 h-2 rounded-full bg-zenith-accent" />
                            <span className="text-zenith-ink">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action checklist */}
                    <div className="p-5 rounded-xl bg-white border border-zenith-border">
                      <div className="text-xs font-semibold text-zenith-muted">
                        Aksiyon Planı
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        {[
                          { key: "breathe", label: "10 saniye durakla ve yeniden oku" },
                          { key: "shorten", label: "Metni %20 kısalt" },
                          { key: "counter", label: "Karşı tez ekle" },
                          { key: "risk", label: "Risk sınırını yaz" },
                        ].map((it) => (
                          <label
                            key={it.key}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checks[it.key]}
                              onChange={() => toggleCheck(it.key)}
                              className="accent-black"
                            />
                            <span
                              className={
                                checks[it.key]
                                  ? "line-through text-zenith-muted"
                                  : "text-zenith-ink"
                              }
                            >
                              {it.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Templates */}
              <div className="zenith-card zenith-card-raise p-6 animate-card-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-zenith-ink">
                    ⚡ Hızlı Şablonlar
                  </h3>
                  <span className="zenith-chip">1 tık</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK_TEMPLATES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => applyTemplate(t.key)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/[0.04] hover:bg-black/[0.08] transition"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[11px] text-zenith-muted">
                  Bu şablonlar metin düzenleme amaçlıdır. Yatırım tavsiyesi değildir.
                </p>
              </div>

              {/* Binance CTA (premium + şeffaf) */}
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
                    Eğer Binance hesabı açmayı zaten düşünüyorsan, bu link üzerinden
                    kayıt olarak <strong>Zenith Decision</strong>’ın gelişimine destek
                    olabilirsin.
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

              {/* Message Power (right deep card) */}
              <div className="zenith-card p-6 animate-card-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-zenith-ink">
                    🧠 Netlik & Güç Göstergesi
                  </h3>
                  <span className="zenith-chip">premium ui</span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-black/[0.03] border border-zenith-border">
                  <div className="text-xs font-semibold text-zenith-muted">
                    Mesaj Gücü Skoru
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-zenith-ink">
                      {power.score}
                    </span>
                    <span className="text-sm font-bold text-zenith-muted">
                      /100 • {power.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zenith-muted">{power.hint}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-zenith-muted mt-10">
            Beta • Zero Ego AI • Ultra Premium UI Layer
          </div>
        </div>
      </div>
    </div>
  );
}
