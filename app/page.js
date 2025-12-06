'use client';

import React, { useEffect, useMemo, useState } from 'react';

const PRIMARY_COLOR = 'bg-zenith-primary';
const ACCENT_COLOR = 'bg-zenith-accent';

const HISTORY_KEY = "zenith_history_v1";
const HISTORY_LIMIT = 20;

const SAMPLE_TEXTS = [
  {
    label: "FOMO/Korku",
    text: "Tüm paramla bu hisseye girmeyi düşünüyorum. Çok coşkuluyum ama ya düşerse diye de korkuyorum."
  },
  {
    label: "Aşırı Özgüven",
    text: "Bu iş kesin bende. Hiç risk yok gibi hissediyorum, hemen yüklenmek istiyorum."
  },
  {
    label: "Kararsızlık",
    text: "Bir yanım almak istiyor bir yanım çok çekiniyor. Veriler var ama duygularım karışık."
  },
];

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
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  const [rewritePack, setRewritePack] = useState(null); // { soften, clarify, assertive }

  // =========================
  // HISTORY STATE
  // =========================
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const persistHistory = (items) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {}
  };

  const pushHistory = (entry) => {
    const next = [entry, ...history].slice(0, HISTORY_LIMIT);
    persistHistory(next);
  };

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
        pushHistory({
          ts: Date.now(),
          text: decisionText,
          analysis: data.analysis,
          rewrites: rewritePack || null,
        });
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
  // REWRITE SINGLE
  // =========================
  const handleRewrite = async (mode) => {
    if (!decisionText.trim()) return;

    setRewriteLoading(true);
    setRewriteError(null);
    setRewritePack(null);

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: decisionText, mode }),
      });

      const data = await response.json();

      if (response.ok) {
        // tek mod gelirse pack'e dönüştür
        if (data.mode && data.mode !== "all") {
          setRewritePack({
            soften: mode === "soften" ? data.rewritten : "",
            clarify: mode === "clarify" ? data.rewritten : "",
            assertive: mode === "assertive" ? data.rewritten : "",
          });
        }
      } else {
        setRewriteError(data.error || 'Rewrite sırasında hata oluştu.');
      }
    } catch {
      setRewriteError('Sunucuya bağlanılamadı.');
    } finally {
      setRewriteLoading(false);
    }
  };

  // =========================
  // REWRITE ALL (PREMIUM HIZ)
  // =========================
  const handleRewriteAll = async () => {
    if (!decisionText.trim()) return;

    setRewriteLoading(true);
    setRewriteError(null);
    setRewritePack(null);

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: decisionText, mode: "all" }),
      });

      const data = await response.json();

      if (response.ok) {
        setRewritePack(data.rewritten);
      } else {
        setRewriteError(data.error || 'Rewrite sırasında hata oluştu.');
      }
    } catch {
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

  const tonePercents = useMemo(() => {
    if (!analysisResult) return null;
    return {
      pos: Math.round((analysisResult.pozitif_skor || 0) * 100),
      neu: Math.round((analysisResult.nötr_skor || 0) * 100),
      neg: Math.round((analysisResult.negatif_skor || 0) * 100),
    };
  }, [analysisResult]);

  const applyText = (t) => {
    if (!t) return;
    setDecisionText(t);
  };

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
          <h2 className="text-xl font-semibold text-gray-700 mb-3">💸 Finansal Kararınızı Girin</h2>

          {/* Örnek chip’ler */}
          <div className="flex flex-wrap gap-2 mb-3">
            {SAMPLE_TEXTS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => applyText(s.text)}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
                disabled={isLoading || rewriteLoading}
                title={s.text}
              >
                {s.label}
              </button>
            ))}
          </div>

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

              {/* 3 tekli rewrite butonu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleRewrite("soften")}
                  className="py-2 rounded-lg bg-zenith-accent font-bold text-black hover:opacity-90 disabled:opacity-60"
                  disabled={rewriteLoading || isLoading}
                >
                  Yumuşat
                </button>

                <button
                  type="button"
                  onClick={() => handleRewrite("clarify")}
                  className="py-2 rounded-lg bg-gray-200 font-bold text-gray-800 hover:opacity-90 disabled:opacity-60"
                  disabled={rewriteLoading || isLoading}
                >
                  Netleştir
                </button>

                <button
                  type="button"
                  onClick={() => handleRewrite("assertive")}
                  className="py-2 rounded-lg bg-zenith-primary font-bold text-white hover:opacity-90 disabled:opacity-60"
                  disabled={rewriteLoading || isLoading}
                >
                  Güçlü & Saygılı
                </button>
              </div>

              {/* Premium hız butonu */}
              <button
                type="button"
                onClick={handleRewriteAll}
                className="w-full py-2 rounded-lg bg-black text-white font-bold mt-3 hover:opacity-90 disabled:opacity-60"
                disabled={rewriteLoading || isLoading}
              >
                {rewriteLoading ? "Üretiliyor..." : "⚡ Akıllı Öneri Üret (3'ü bir arada)"}
              </button>
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

        {/* Premium rewrite kartları */}
        {rewritePack && (
          <section className="p-4 bg-white rounded-lg border">
            <h3 className="font-bold text-gray-800 mb-3">✨ Premium Öneriler</h3>

            <div className="space-y-3">
              {[
                { key: "soften", title: "Yumuşatılmış", desc: "Gerginliği düşürür, güven verir." },
                { key: "clarify", title: "Netleştirilmiş", desc: "Kısa, temiz, anlaşılır." },
                { key: "assertive", title: "Güçlü & Saygılı", desc: "Kararlı ama kırmadan." },
              ].map((item) => {
                const text = rewritePack[item.key] || "";
                if (!text) return null;

                return (
                  <div key={item.key} className="p-3 rounded-lg border bg-gray-50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded bg-black text-white"
                          onClick={() => navigator.clipboard.writeText(text)}
                        >
                          Kopyala
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded bg-white border"
                          onClick={() => setDecisionText(text)}
                        >
                          Uygula
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>
                );
              })}
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

        {/* Analiz sonuç */}
        {analysisResult && (
          <section className="mt-2 p-6 bg-gray-50 rounded-lg shadow-inner border-l-4 border-zenith-primary">
            <h2 className="text-xl font-bold text-zenith-primary mb-4 flex items-center">
              🧠 Ego-Sıfır Analiz Sonucu
            </h2>

            {/* Ton özeti */}
            {compound !== undefined && compound !== null && (
              <p className="text-sm text-gray-700 border-b pb-2 border-gray-200">
                <span className="font-semibold">🔍 Tespit Edilen Duygusallık (Bileşik):</span>
                <span className={`ml-2 font-bold ${interpretCompoundScore(compound).color} text-base`}>
                  {interpretCompoundScore(compound).text} ({Number(compound).toFixed(3)})
                </span>
              </p>
            )}

            {/* Mini ton barı */}
            {tonePercents && (
              <div className="mt-4">
                <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="h-2 bg-green-500"
                    style={{ width: `${tonePercents.pos}%` }}
                  />
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200 mt-1">
                  <div
                    className="h-2 bg-gray-500"
                    style={{ width: `${tonePercents.neu}%` }}
                  />
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200 mt-1">
                  <div
                    className="h-2 bg-red-500"
                    style={{ width: `${tonePercents.neg}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs pt-2">
                  <p className="text-green-600 font-medium">Pozitif: {tonePercents.pos}%</p>
                  <p className="text-gray-600 font-medium">Nötr: {tonePercents.neu}%</p>
                  <p className="text-red-600 font-medium">Negatif: {tonePercents.neg}%</p>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Zenith Eylem Tavsiyesi:</h3>
              <p className="text-sm text-gray-600 italic">
                Kararınız, mantıksal verilerden çok anlık duygusal ağırlık içeriyor.
                Panik (Negatif) veya FOMO (Pozitif) anında işlem yapmak, uzun vadede riskinizi artırabilir.
              </p>

              {/* Binance revshare alanı (senin akışın korunuyor) */}
              <p className="mt-3 text-sm">
                Önyargılarınızı kenara bırakın ve güvenli bir platformda yeni bir başlangıç yapın:
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
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">🕘 Son Analizler</h3>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded bg-gray-100"
                onClick={() => persistHistory([])}
              >
                Temizle
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {history.map((h) => (
                <button
                  key={h.ts}
                  type="button"
                  onClick={() => {
                    setDecisionText(h.text || "");
                    setAnalysisResult(h.analysis || null);
                    setRewritePack(h.rewrites || null);
                    setError(null);
                    setRewriteError(null);
                  }}
                  className="w-full text-left p-2 rounded border hover:bg-gray-50"
                >
                  <div className="text-xs text-gray-500">
                    {new Date(h.ts).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-800 line-clamp-2">
                    {h.text}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          Beta V0.2. Veriler anonimleştirilerek AI modelini geliştirmek için kullanılabilir.
        </footer>
      </div>
    </div>
  );
}
