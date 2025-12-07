"use client";

import React, { useMemo, useState } from "react";

/**
 * =========================================================
 * Zenith Decision - Corporate Clean UI
 * - Analyze: /api/analyze
 * - Rewrite: /api/rewrite
 * - Feedback: /api/feedback
 * - No extra dependency
 * =========================================================
 */

const BINANCE_REF =
  "https://www.binance.com/activity/referral-entry/CPA?ref=CPA_003RRA9B6U";

const BINANCE_CTA = (
  <a
    href={BINANCE_REF}
    target="_blank"
    rel="noreferrer"
    className="mt-4 inline-flex items-center justify-center w-full zenith-btn-gold"
  >
    Binance’e Katıl & Zenith’i Destekle
  </a>
);

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

function ToneMiniChart({ percents }) {
  if (!percents) return null;

  const items = [
    { label: "Pozitif", value: percents.pos, colorVar: "var(--zenith-turq)" },
    { label: "Nötr", value: percents.neu, colorVar: "rgba(255,255,255,0.28)" },
    { label: "Negatif", value: percents.neg, colorVar: "var(--zenith-accent)" },
  ];

  return (
    <div className="zenith-card p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-zenith-ink">
          📊 Ton İstatistikleri
        </h4>
        <span className="zenith-chip">dashboard</span>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((it, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11px] font-semibold text-zenith-muted">
              <span>{it.label}</span>
              <span>{it.value}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-2.5"
                style={{ width: `${it.value}%`, background: it.colorVar }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function riskNoteText(analysis) {
  if (!analysis) return null;
  const s = analysis.bileşik_skor ?? 0;
  if (s <= -0.25)
    return "Yüksek stres tonu. Göndermeden önce yumuşat + kısa versiyon önerilir.";
  if (s >= 0.25) return "Aşırı coşku tonu. Netleştir ve karşı tez ekle.";
  return "Ton dengeli. Metni %20 kısaltman mesaj gücünü artırabilir.";
}

function PerceptionSurvey({ analysis, originalText }) {
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setLoading(true);
    setErr(null);
    setOk(false);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: { answer1, answer2, answer3, note },
          analysis,
          text_sample: (originalText || "").slice(0, 280),
          ts: Date.now(),
        }),
      });

      const data = await res.json();
      if (res.ok) setOk(true);
      else setErr(data.error || "Geri bildirim alınamadı.");
    } catch {
      setErr("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zenith-card zenith-card-raise p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-zenith-ink">
          🧪 Kısa Gözlem Anketi
        </h3>
        <span className="zenith-chip">opsiyonel</span>
      </div>

      <p className="mt-2 text-sm text-zenith-muted">
        Bu 3 soruluk mini anket, Zenith Decision motorunu geliştirmek içindir.
        <b> İsteğe bağlıdır.</b>
      </p>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <label className="font-semibold text-zenith-ink">
            1) Metinde en baskın gördüğün duygu neydi?
          </label>
          <select
            value={answer1}
            onChange={(e) => setAnswer1(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg border border-black/10 bg-white"
          >
            <option value="">Seç</option>
            <option>Korku</option>
            <option>Coşku / FOMO</option>
            <option>Kararsızlık</option>
            <option>Güven</option>
            <option>Nötr</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-zenith-ink">
            2) Bu analize güven seviyen?
          </label>
          <select
            value={answer2}
            onChange={(e) => setAnswer2(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg border border-black/10 bg-white"
          >
            <option value="">Seç</option>
            <option>Çok yüksek</option>
            <option>Yüksek</option>
            <option>Orta</option>
            <option>Düşük</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-zenith-ink">
            3) Analiz sonrası ne yapardın?
          </label>
          <select
            value={answer3}
            onChange={(e) => setAnswer3(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg border border-black/10 bg-white"
          >
            <option value="">Seç</option>
            <option>Hemen aksiyon</option>
            <option>Bekler, tekrar değerlendiririm</option>
            <option>Planımı değiştiririm</option>
            <option>Kararı iptal ederim</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-zenith-ink">
            Ek not (opsiyonel)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg border border-black/10 bg-white"
            placeholder="1 cümle bile yeter..."
          />
        </div>
      </div>

      {err && (
        <div className="mt-3 zenith-alert zenith-alert-danger">{err}</div>
      )}

      {ok && (
        <div className="mt-3 zenith-card p-3">
          <div className="text-sm font-bold text-zenith-ink">
            Teşekkürler! Bu katkı motoru güçlendirecek. 💛
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="mt-4 zenith-btn-turq w-full"
      >
        {loading ? "Gönderiliyor..." : "Geri Bildirim Gönder"}
      </button>

      <p className="mt-2 text-[10px] text-zenith-muted">
        Bu içerik yatırım tavsiyesi değildir.
      </p>
    </div>
  );
}

// Basit “mesaj gücü” heuristiği (UI için)
function messagePowerScore(text) {
  const t = (text || "").trim();
  if (!t)
    return { score: 0, label: "Boş", hint: "Metin girerek güç skorunu gör." };

  const len = t.length;
  const sentences = t.split(/[.!?…]\s*/).filter(Boolean).length || 1;
  const avgLen = Math.round(len / sentences);

  let score = 50;

  if (len < 80) score -= 15;
  if (len > 700) score -= 12;
  if (sentences >= 2 && sentences <= 6) score += 15;
  if (avgLen >= 25 && avgLen <= 90) score += 10;

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
  // Core input
  const [decisionText, setDecisionText] = useState("");

  // Analyze state
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Rewrite state
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  const [rewriteText, setRewriteText] = useState("");

  // Aksiyon checklist
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

  const power = useMemo(() => messagePowerScore(decisionText), [decisionText]);

  const hasText = decisionText.trim().length > 0;
  const showRightPanel =
    isLoading || Boolean(analysisResult) || rewriteLoading || Boolean(rewriteText);
  const showBinanceBox = hasText || Boolean(analysisResult);

  // Actions
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

  // UI
  return (
    <div className="relative min-h-screen bg-zenith-bg overflow-hidden">
      {/* Mesh + Orbs */}
      <div className="absolute inset-0 zenith-mesh opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] zenith-orb zenith-orb-a pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[560px] h-[560px] zenith-orb zenith-orb-b pointer-events-none" />

      <div className="relative z-10 px-4 pt-8 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Kurumsal amaç bandı */}
          <div className="zenith-card px-5 py-4 mb-5">
            <div className="text-sm font-extrabold text-zenith-ink">
              Karar metnini analiz et • Tonu dengele • Önyargı riskini gör • Profesyonel rewrite al
            </div>
            <div className="text-xs text-zenith-muted mt-1">
              30 saniyede daha net, daha güvenli ve daha kurumsal bir mesaj.
            </div>
          </div>

          {/* Top mini label */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="zenith-card px-4 py-2 inline-flex items-center">
              <span className="text-xs font-semibold text-zenith-muted">
                ⚡ Zero Ego • Corporate Decision Assistant
              </span>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-5 space-y-6">
              {/* Core input */}
              <div className="zenith-card zenith-card-raise p-7 animate-card-in">
                <header className="space-y-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="zenith-chip">Decision Quality</span>
                    <span className="zenith-chip">Tone & Bias</span>
                  </div>

                  <h1 className="text-4xl font-extrabold text-zenith-ink tracking-tight">
                    Zenith Decision
                  </h1>

                  <p className="text-base text-zenith-muted">
                    Karar metnindeki <b>duygu, risk ve önyargı sinyallerini</b> yakalar.
                    Mesajını <b>daha net, daha profesyonel ve daha güvenli</b> hale getirmen için
                    yönlendirme ve rewrite önerileri sunar.
                  </p>

                  <div className="zenith-card p-4">
                    <div className="text-sm font-extrabold text-zenith-ink">
                      3 Adımda Kullanım
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-zenith-muted">
                      <li>1) Karar metnini yaz.</li>
                      <li>2) Analiz ile ton/önyargı/risk haritasını gör.</li>
                      <li>3) Rewrite ile mesajını profesyonelleştirip gönder.</li>
                    </ul>
                  </div>
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

                  {/* Primary CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full zenith-btn-primary ${
                      isLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Analiz Ediliyor..." : "Kararı Analiz Et"}
                  </button>

                  {/* Secondary actions */}
                  <div className="pt-2">
                    <div className="text-sm font-semibold text-zenith-muted mb-2">
                      Mesajını profesyonelleştir (opsiyonel)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRewrite("soften")}
                        disabled={rewriteLoading || isLoading}
                        className="zenith-btn"
                      >
                        {rewriteLoading ? "..." : "Yumuşat"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRewrite("clarify")}
                        disabled={rewriteLoading || isLoading}
                        className="zenith-btn"
                      >
                        {rewriteLoading ? "..." : "Netleştir"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRewrite("assertive")}
                        disabled={rewriteLoading || isLoading}
                        className="zenith-btn"
                      >
                        {rewriteLoading ? "..." : "Güçlü & Saygılı"}
                      </button>
                    </div>
                  </div>
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
                          className="zenith-btn"
                        >
                          Kopyala
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecisionText(rewriteText)}
                          className="zenith-btn"
                        >
                          Uygula
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="zenith-textarea mt-3"
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

              {/* Message Power (left) */}
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

            {/* RIGHT */}
            {showRightPanel ? (
              <div className="lg:col-span-7 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="zenith-stat animate-card-in">
                    <div className="zenith-stat-label">Durum</div>
                    <div className="zenith-stat-value">
                      {analysisResult
                        ? "Analiz Hazır"
                        : isLoading
                        ? "İşleniyor"
                        : "Beklemede"}
                    </div>
                    <div className="zenith-stat-sub">Ton motoru</div>
                  </div>

                  <div className="zenith-stat animate-card-in">
                    <div className="zenith-stat-label">Rewrite</div>
                    <div className="zenith-stat-value">
                      {rewriteText
                        ? "1 Öneri"
                        : rewriteLoading
                        ? "Üretiliyor"
                        : "Hazır"}
                    </div>
                    <div className="zenith-stat-sub">
                      Mesaj profesyonelleştirme
                    </div>
                  </div>

                  <div className="zenith-stat animate-card-in">
                    <div className="zenith-stat-label">Mod</div>
                    <div className="zenith-stat-value">Premium</div>
                    <div className="zenith-stat-sub">Kurumsal UI</div>
                  </div>
                </div>

                {/* Analysis main */}
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

                  {isLoading && !analysisResult && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="zenith-shimmer h-28 rounded-xl" />
                      <div className="zenith-shimmer h-28 rounded-xl" />
                      <div className="zenith-shimmer h-28 rounded-xl" />
                      <div className="zenith-shimmer h-28 rounded-xl" />
                    </div>
                  )}

                  {analysisResult && (
                    <>
                      <PerceptionSurvey
                        analysis={analysisResult}
                        originalText={decisionText}
                      />

                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Compound score */}
                        <div className="zenith-card p-5">
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
                            <div className="mt-3 zenith-card p-3">
                              <span className="font-bold text-zenith-ink">
                                Not:
                              </span>{" "}
                              <span className="text-sm text-zenith-muted">
                                {riskNote}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tone distribution */}
                        <div className="zenith-card p-5">
                          <div className="text-xs font-semibold text-zenith-muted">
                            Ton Dağılımı
                          </div>

                          {percents && (
                            <div className="mt-4 space-y-3">
                              {[
                                { label: "Pozitif", v: percents.pos, c: "var(--zenith-turq)" },
                                { label: "Nötr", v: percents.neu, c: "rgba(255,255,255,0.28)" },
                                { label: "Negatif", v: percents.neg, c: "var(--zenith-accent)" },
                              ].map((x, i) => (
                                <div key={i}>
                                  <div className="flex justify-between text-[11px] font-semibold text-zenith-muted">
                                    <span>{x.label}</span>
                                    <span>{x.v}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                                    <div
                                      className="h-2"
                                      style={{ width: `${x.v}%`, background: x.c }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bias alerts */}
                        <div className="zenith-card p-5">
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
                                <span className="mt-2 inline-block w-2 h-2 rounded-full bg-white/60" />
                                <span className="text-zenith-ink">{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action checklist */}
                        <div className="zenith-card p-5">
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
                    </>
                  )}
                </div>

                {/* Quick templates */}
                <div className="zenith-card zenith-card-raise p-6 animate-card-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-zenith-ink">
                      ⚡ Hızlı Şablonlar
                    </h3>
                    <span className="zenith-chip">tek tık</span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {QUICK_TEMPLATES.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => applyTemplate(t.key)}
                        disabled={isLoading || rewriteLoading}
                        className="zenith-btn"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-[11px] text-zenith-muted">
                    Şablonlar metni otomatik yapılandırır; “Saygılı ama net”
                    rewrite motorunu çağırır.
                  </p>
                </div>

                {/* Binance */}
                {showBinanceBox && (
                  <div className="zenith-card zenith-card-raise p-6 animate-card-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold text-zenith-ink">
                        💛 Destek
                      </h3>
                      <span className="zenith-chip">affiliate</span>
                    </div>
                    <p className="mt-2 text-sm text-zenith-muted">
                      Eğer istersen Binance üzerinden kayıt olarak Zenith’in
                      gelişimine katkı sağlayabilirsin.
                    </p>
                    {BINANCE_CTA}
                    <p className="text-center text-xs text-zenith-muted mt-2 opacity-75">
                      Ref Kodu: CPA_003RRA9B6U
                    </p>
                  </div>
                )}

                {/* Message Power (right) */}
                <div className="zenith-card p-6 animate-card-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-zenith-ink">
                      🧠 Mesaj Gücü • Derin Görünüm
                    </h3>
                    <span className="zenith-chip">signal</span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="zenith-card p-4">
                      <div className="text-xs font-semibold text-zenith-muted">
                        Skor
                      </div>
                      <div className="mt-1 text-4xl font-extrabold text-zenith-ink">
                        {power.score}
                      </div>
                      <div className="text-sm font-bold text-zenith-muted">
                        {power.label}
                      </div>
                      <p className="mt-2 text-sm text-zenith-muted">
                        {power.hint}
                      </p>
                    </div>

                    <ToneMiniChart percents={percents} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-7">
                <div className="zenith-card zenith-card-raise p-8 animate-card-in">
                  <h3 className="text-xl font-extrabold text-zenith-ink">
                    Başlamak için karar metnini yaz 👈
                  </h3>
                  <p className="mt-2 text-sm text-zenith-muted">
                    Metni girince sağ tarafta ton, önyargı ve aksiyon paneli
                    otomatik açılacak.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-zenith-muted mt-10">
            Beta • Zero Ego AI • Corporate UI Layer
          </div>
        </div>
      </div>
    </div>
  );
}
