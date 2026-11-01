import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GachaBanner, SquishyItem } from '../../domain/schemas/index.ts';
import { asmrAudio } from '../../infrastructure/audio/WebAudioAsmrEngine.ts';
import { SquishySvgRenderer } from './SquishySvgRenderer.tsx';
import { PullResultItem } from '../../domain/services/GachaDomainService.ts';
import { Scissors, Sparkles, Volume2, ArrowRight, RotateCcw } from 'lucide-react';

interface UnboxingStageProps {
  banner: GachaBanner;
  pullResults: PullResultItem[];
  onFinish: () => void;
  onDelightEarned: (points: number, coins: number) => void;
}

type UnboxStep = 'TAPE_CUT' | 'BAG_TEAR' | 'REVEAL_ANIM' | 'INTERACTIVE_SHOWCASE';

export const UnboxingStage: React.FC<UnboxingStageProps> = ({
  banner,
  pullResults,
  onFinish,
  onDelightEarned,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPull = pullResults[currentIndex];
  const squishy = currentPull?.item;

  const [step, setStep] = useState<UnboxStep>('TAPE_CUT');
  const [tapeProgress, setTapeProgress] = useState(0); // 0 to 100%
  const [tearProgress, setTearProgress] = useState(0); // 0 to 100%
  const [testSquishDepth, setTestSquishDepth] = useState(0);

  const tapeTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingTapeRef = useRef(false);
  const lastCutSoundRef = useRef(0);

  // Reset steps when moving to next pull result
  useEffect(() => {
    setStep('TAPE_CUT');
    setTapeProgress(0);
    setTearProgress(0);
    setTestSquishDepth(0);
  }, [currentIndex]);

  // Tape cutter drag handler
  const handleTapePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingTapeRef.current = true;
    updateTapeProgress(e.clientX);
  };

  const handleTapePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingTapeRef.current) return;
    updateTapeProgress(e.clientX);
  };

  const handleTapePointerUp = (e: React.PointerEvent) => {
    isDraggingTapeRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe ignore
    }
  };

  const updateTapeProgress = (clientX: number) => {
    if (!tapeTrackRef.current) return;
    const rect = tapeTrackRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const progress = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));

    setTapeProgress(progress);

    // Audio cue on dragging
    const now = performance.now();
    if (now - lastCutSoundRef.current > 70) {
      asmrAudio.playTapeCut(1.2);
      lastCutSoundRef.current = now;
    }

    if (progress >= 95) {
      // Tape cut completed!
      isDraggingTapeRef.current = false;
      asmrAudio.playTapeCut(2.0);
      setStep('BAG_TEAR');
    }
  };

  // Foil Bag Tear Trigger
  const handleTearBag = () => {
    if (step !== 'BAG_TEAR') return;
    asmrAudio.playFoilCrinkle(1.0);
    setTearProgress(100);

    setTimeout(() => {
      triggerReveal();
    }, 400);
  };

  // Reveal Animation & Celebration
  const triggerReveal = () => {
    setStep('REVEAL_ANIM');
    asmrAudio.playRevealChime(squishy.rarity);

    // Confetti celebration for rare drops
    if (['epic', 'legendary', 'mythic'].includes(squishy.rarity)) {
      asmrAudio.playConfettiPop();
      confetti({
        particleCount: squishy.rarity === 'mythic' ? 120 : 60,
        spread: 75,
        origin: { y: 0.6 },
        colors: squishy.rarity === 'mythic' ? ['#facc15', '#f43f5e', '#a855f7'] : ['#38bdf8', '#818cf8', '#c084fc'],
      });
    }

    // Award initial unboxing delight
    onDelightEarned(squishy.basePrice * 2, 25);

    setTimeout(() => {
      setStep('INTERACTIVE_SHOWCASE');
    }, 900);
  };

  // Test Squeeze in showcase
  const handleShowcaseSquish = () => {
    setTestSquishDepth(0.8);
    if (squishy.primarySound === 'foam_sigh') asmrAudio.playFoamSigh(0.85);
    else if (squishy.primarySound === 'gel_squeak') asmrAudio.playGelSqueak(0.85);
    else if (squishy.primarySound === 'slime_pop') asmrAudio.playSlimePop(0.85);
    else if (squishy.primarySound === 'acrylic_tap') asmrAudio.playAcrylicTap();
    else asmrAudio.playMochiSquelch(0.85);

    onDelightEarned(15, 5);

    setTimeout(() => {
      setTestSquishDepth(0);
    }, 280);
  };

  const handleNext = () => {
    if (currentIndex < pullResults.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const rarityText = {
    common: 'Common',
    rare: 'Rare ★',
    epic: 'Epic ★★',
    legendary: 'Legendary ★★★',
    mythic: 'SECRET MYTHIC ★★★★★',
  }[squishy.rarity];

  const rarityColor = {
    common: 'from-slate-700 to-slate-900 text-slate-200 border-slate-600',
    rare: 'from-sky-600 to-blue-900 text-sky-200 border-sky-400',
    epic: 'from-purple-600 to-indigo-950 text-purple-200 border-purple-400',
    legendary: 'from-amber-500 to-orange-950 text-amber-200 border-amber-400',
    mythic: 'from-amber-400 via-rose-500 to-purple-600 text-white border-yellow-300 font-extrabold',
  }[squishy.rarity];

  return (
    <div className="flex flex-col items-center justify-center min-h-[520px] w-full max-w-lg mx-auto p-4 select-none">
      {/* Pull Progress indicator (e.g. 1/10) */}
      <div className="w-full flex items-center justify-between mb-4 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
        <span className="text-slate-300 font-medium">
          {banner.japaneseName}
        </span>
        <span className="font-mono-numbers text-amber-400 font-bold">
          {currentIndex + 1} / {pullResults.length} 個目
        </span>
      </div>

      {/* Main Blind Bag Container */}
      <div className="relative w-full aspect-[4/5] max-w-[340px] flex flex-col items-center justify-center rounded-3xl bg-slate-950/60 border-2 border-slate-700/60 p-6 overflow-hidden roblox-box-shadow">
        {/* Glow backdrop on reveal */}
        {step !== 'TAPE_CUT' && step !== 'BAG_TEAR' && (
          <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent animate-pulse pointer-events-none" />
        )}

        {/* STEP 1: TAPE CUTTING */}
        {step === 'TAPE_CUT' && (
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            {/* The Mystery Bag Body */}
            <div
              style={{ backgroundColor: banner.bagColor }}
              className="relative w-56 h-64 rounded-2xl flex flex-col items-center justify-between p-4 border-4 border-white/60 roblox-box-shadow transform hover:scale-[1.02] transition-transform"
            >
              <div className="text-xs font-bold text-slate-800 tracking-wider">
                MYSTERY BLIND BAG
              </div>
              <div className="text-4xl">🎁</div>
              <div className="text-[11px] font-semibold text-slate-700 text-center">
                ASMR SQUISHY SURPRISE
              </div>

              {/* Tape across the top */}
              <div
                ref={tapeTrackRef}
                onPointerDown={handleTapePointerDown}
                onPointerMove={handleTapePointerMove}
                onPointerUp={handleTapePointerUp}
                className="absolute -top-3 left-2 right-2 h-10 bg-amber-300 border-2 border-dashed border-amber-600 rounded-lg cursor-ew-resize flex items-center px-2 shadow-md touch-none"
              >
                {/* Cut Tape line */}
                <div
                  style={{ width: `${tapeProgress}%` }}
                  className="absolute left-0 top-0 bottom-0 bg-amber-400/40 border-r-4 border-red-500 transition-all pointer-events-none"
                />

                {/* Scissors slider handle */}
                <div
                  style={{ left: `calc(${tapeProgress}% - 14px)` }}
                  className="absolute w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-none transform -translate-y-0.5"
                >
                  <Scissors className="w-4 h-4 transform rotate-90" />
                </div>

                <span className="text-[10px] font-bold text-amber-900 mx-auto select-none opacity-80 pointer-events-none">
                  スワイプしてテープを切る ✂️
                </span>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              テープを右端までスワイプして切断！
            </p>
          </div>
        )}

        {/* STEP 2: FOIL BAG TEAR */}
        {step === 'BAG_TEAR' && (
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <button
              onClick={handleTearBag}
              className="group relative w-56 h-64 rounded-2xl flex flex-col items-center justify-center p-4 border-4 border-dashed border-amber-300 roblox-box-shadow transform active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: banner.bagColor }}
            >
              {/* Foil crack animation visual */}
              <div className="text-5xl animate-bounce">✨</div>
              <div className="mt-4 text-sm font-extrabold text-slate-900 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                タップして袋を開封！
              </div>
              <span className="mt-2 text-[11px] text-slate-700">
                パリパリ ASMR音を聴こう 🎧
              </span>
            </button>
            <p className="mt-6 text-xs text-amber-300 animate-pulse font-semibold">
              袋を破って中身を取り出そう！
            </p>
          </div>
        )}

        {/* STEP 3 & 4: REVEAL & SHOWCASE */}
        {(step === 'REVEAL_ANIM' || step === 'INTERACTIVE_SHOWCASE') && (
          <div className="relative flex flex-col items-center justify-center w-full h-full animate-in zoom-in-95 duration-300">
            {/* Rarity Ribbon */}
            <div className={`mb-3 px-4 py-1 rounded-full text-xs font-bold border shadow-lg bg-gradient-to-r ${rarityColor}`}>
              {rarityText}
            </div>

            {/* Squishy Render with quick test squeeze */}
            <div
              onClick={handleShowcaseSquish}
              className="cursor-pointer transform hover:scale-105 active:scale-95 transition-transform"
            >
              <SquishySvgRenderer
                item={squishy}
                deformationX={0}
                deformationY={0}
                squishDepth={testSquishDepth}
                wobble={testSquishDepth > 0 ? 0.3 : 0}
              />
            </div>

            {/* Item Name & Details */}
            <h3 className="mt-3 text-lg font-extrabold text-white text-center">
              {squishy.japaneseName}
            </h3>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
              <span className="text-amber-400 font-semibold">
                {currentPull.isNew ? '🎉 NEW!' : `Lv.${currentPull.newLevel} (+強化)`}
              </span>
              <span>·</span>
              <span className="text-emerald-300 font-medium flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                {squishy.primarySound}
              </span>
            </div>

            {step === 'INTERACTIVE_SHOWCASE' && (
              <p className="mt-2 text-[11px] text-slate-400">
                👆 タップして初揉み ASMR をチェック！
              </p>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="w-full mt-4 flex items-center justify-between gap-3">
        {step === 'TAPE_CUT' ? (
          <button
            onClick={() => {
              // Quick skip tape for fast unboxing
              setTapeProgress(100);
              asmrAudio.playTapeCut(2.0);
              setStep('BAG_TEAR');
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline py-2"
          >
            スキップして即開封
          </button>
        ) : (
          <div />
        )}

        {step === 'INTERACTIVE_SHOWCASE' && (
          <button
            onClick={handleNext}
            className="ml-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl roblox-box-shadow flex items-center gap-2 transition-all roblox-box-shadow-press"
          >
            <span>{currentIndex < pullResults.length - 1 ? '次のスクイーズへ' : '開封完了！棚へ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
