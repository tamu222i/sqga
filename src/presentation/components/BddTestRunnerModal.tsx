import React, { useState, useEffect } from 'react';
import { runAllBddFeatures } from '../../tests/bdd/specs.ts';
import { BddScenarioResult } from '../../tests/bdd/bddEngine.ts';
import { CheckCircle2, XCircle, Play, RotateCcw, ShieldCheck, Clock } from 'lucide-react';
import { asmrAudio } from '../../infrastructure/audio/WebAudioAsmrEngine.ts';

interface BddTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BddTestRunnerModal: React.FC<BddTestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<BddScenarioResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const executeTests = async () => {
    setIsRunning(true);
    asmrAudio.playAcrylicTap();
    try {
      const res = await runAllBddFeatures();
      setResults(res);
      setHasRun(true);
      const allPassed = res.every((r) => r.passed);
      if (allPassed) {
        asmrAudio.playRevealChime('rare');
      } else {
        asmrAudio.playFoilCrinkle(0.5);
      }
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !hasRun) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 roblox-box-shadow flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-white text-base">
                BDD / TDD テストランナー (Given-When-Then)
              </h3>
              <p className="text-[11px] text-slate-400">
                ドメイン仕様・ガチャ天井・スキーマ検証・ASMR計算の自動検証スイート
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            閉じる
          </button>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between my-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">
              結果: {hasRun ? `${passedCount} / ${totalCount} シナリオ合格` : '準備完了'}
            </span>
            {hasRun && passedCount === totalCount && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                ALL PASSED (100%)
              </span>
            )}
          </div>

          <button
            disabled={isRunning}
            onClick={executeTests}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>再実行</span>
          </button>
        </div>

        {/* Test Scenarios List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {results.map((res, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${
                res.passed
                  ? 'bg-slate-800/50 border-slate-700/80'
                  : 'bg-rose-950/20 border-rose-800/80'
              }`}
            >
              {/* Feature & Scenario Title */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-amber-400 font-medium block">
                    {res.featureName}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {res.title}
                  </span>
                </div>
                {res.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </div>

              {/* Given When Then Steps */}
              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-slate-700">
                {res.steps.map((st, sIdx) => (
                  <div key={sIdx} className="flex items-baseline gap-2 text-slate-300">
                    <span
                      className={`text-[10px] font-mono font-bold px-1 rounded ${
                        st.type === 'GIVEN'
                          ? 'bg-blue-900/60 text-blue-300'
                          : st.type === 'WHEN'
                          ? 'bg-amber-900/60 text-amber-300'
                          : 'bg-emerald-900/60 text-emerald-300'
                      }`}
                    >
                      {st.type}
                    </span>
                    <span className="flex-1 text-[11px]">{st.description}</span>
                    <span className="font-mono-numbers text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {st.durationMs.toFixed(1)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
