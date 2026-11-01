import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SquishyItem } from '../../domain/schemas/index.ts';
import { SquishySvgRenderer } from './SquishySvgRenderer.tsx';
import { asmrAudio } from '../../infrastructure/audio/WebAudioAsmrEngine.ts';
import { GachaDomainService } from '../../domain/services/GachaDomainService.ts';
import { Sparkles, Volume2, ShieldCheck, Heart, Award } from 'lucide-react';

interface SquishPlaygroundProps {
  item: SquishyItem;
  level?: number;
  onDelightEarned: (points: number, coins: number) => void;
  onSquishCountIncrement: () => void;
  squishCount: number;
}

interface FloatingAsmrText {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const SquishPlayground: React.FC<SquishPlaygroundProps> = ({
  item,
  level = 1,
  onDelightEarned,
  onSquishCountIncrement,
  squishCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Physics states
  const [deformationX, setDeformationX] = useState(0);
  const [deformationY, setDeformationY] = useState(0);
  const [squishDepth, setSquishDepth] = useState(0);
  const [wobble, setWobble] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingAsmrText[]>([]);
  const [actionMode, setActionMode] = useState<'squeeze' | 'tap' | 'poke'>('squeeze');

  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentForceRef = useRef(0);
  const lastSoundTimeRef = useRef(0);
  const wobbleVelocityRef = useRef(0);

  // Sound label lookup
  const getSoundLabel = useCallback(() => {
    switch (item.primarySound) {
      case 'foam_sigh':
        return 'フシュゥ〜… (Slow-Rise)';
      case 'gel_squeak':
        return 'キュキュッ！ (Gel Squeak)';
      case 'slime_pop':
        return 'パチパチッ！ (Slime Pop)';
      case 'mochi_squelch':
        return 'もちゅっ (Mochi Squelch)';
      case 'acrylic_tap':
        return 'コツコツ… (Acrylic Tap)';
      default:
        return 'ぷにっ';
    }
  }, [item.primarySound]);

  const addFloatingText = useCallback((text: string, clientX?: number, clientY?: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX ? clientX - rect.left : rect.width / 2 + (Math.random() * 80 - 40);
    const y = clientY ? clientY - rect.top - 20 : rect.height / 2 - 40;

    const newId = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev.slice(-6), { id: newId, text, x, y }]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newId));
    }, 1200);
  }, []);

  // Play corresponding ASMR audio
  const triggerAsmrSound = useCallback((force: number, isTap: boolean = false) => {
    const now = performance.now();
    // Throttle sound to prevent audio spam
    if (now - lastSoundTimeRef.current < 90) return;
    lastSoundTimeRef.current = now;

    if (isTap || actionMode === 'tap') {
      asmrAudio.playAcrylicTap();
      addFloatingText('コツッ！');
      return;
    }

    switch (item.primarySound) {
      case 'foam_sigh':
        asmrAudio.playFoamSigh(force);
        addFloatingText('フシュゥ…');
        break;
      case 'gel_squeak':
        asmrAudio.playGelSqueak(force, 1.0 + (1 - force) * 0.4);
        addFloatingText('キュッ！');
        break;
      case 'slime_pop':
        asmrAudio.playSlimePop(force);
        addFloatingText('パチパチッ');
        break;
      case 'mochi_squelch':
        asmrAudio.playMochiSquelch(force);
        addFloatingText('もちゅっ');
        break;
      case 'acrylic_tap':
        asmrAudio.playAcrylicTap();
        addFloatingText('コツコツ');
        break;
      default:
        asmrAudio.playFoamSigh(force);
        addFloatingText('ぷにっ');
    }
  }, [item.primarySound, actionMode, addFloatingText]);

  // Main physics loop (Spring and Rebound)
  useEffect(() => {
    let animId: number;
    let localWobble = 0;
    let localDepth = 0;
    let localDefX = 0;
    let localDefY = 0;

    const updatePhysics = () => {
      if (!isPointerDownRef.current) {
        // Rebound calculation
        // item.reboundSpeed determines how fast it recovers
        // memory_foam is slow (0.04 - 0.12), water_gel is fast (0.6 - 0.8)
        const springSpeed = item.reboundSpeed;

        localDepth += (0 - localDepth) * springSpeed;
        localDefX += (0 - localDefX) * springSpeed;
        localDefY += (0 - localDefY) * springSpeed;

        // Wobble spring
        wobbleVelocityRef.current += (0 - localWobble) * 0.2;
        wobbleVelocityRef.current *= 0.82;
        localWobble += wobbleVelocityRef.current;
      } else {
        localDepth += (currentForceRef.current - localDepth) * 0.4;
      }

      setSquishDepth(localDepth);
      setDeformationX(localDefX);
      setDeformationY(localDefY);
      setWobble(localWobble);

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [item.reboundSpeed]);

  // Pointer event handlers (touch & mouse)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isPointerDownRef.current = true;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    // Pressure or default
    const force = e.pressure && e.pressure > 0 ? e.pressure : (actionMode === 'poke' ? 0.9 : 0.65);
    currentForceRef.current = Math.min(1.0, force * item.softness);

    // Initial tap sound
    triggerAsmrSound(currentForceRef.current, actionMode === 'tap');
    onSquishCountIncrement();

    // Reward delight & occasional coins
    const delight = GachaDomainService.calculateSquishDelight(item, currentForceRef.current, level);
    const coins = Math.random() < 0.35 ? Math.max(1, Math.round(delight * 0.4)) : 0;
    onDelightEarned(delight, coins);

    // Initial offset
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);
    setDeformationX(dx * 0.4);
    setDeformationY(dy * 0.4);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaDist = Math.hypot(
      e.clientX - pointerStartRef.current.x,
      e.clientY - pointerStartRef.current.y
    );

    const force = Math.min(1.0, (deltaDist / 60 + 0.5) * item.softness);
    currentForceRef.current = force;

    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    setDeformationX(Math.max(-1, Math.min(1, dx)));
    setDeformationY(Math.max(-1, Math.min(1, dy)));

    if (deltaDist > 15) {
      triggerAsmrSound(force);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe ignore
    }

    // Trigger rebound release sound
    if (item.material === 'memory_foam') {
      asmrAudio.playFoamSigh(currentForceRef.current * 0.7);
    } else if (item.material === 'water_gel') {
      wobbleVelocityRef.current = currentForceRef.current * 0.3;
      asmrAudio.playGelSqueak(0.5);
    } else if (item.material === 'crunchy_floam') {
      asmrAudio.playSlimePop(0.5);
    }

    currentForceRef.current = 0;
  };

  const rarityBadge = {
    common: { label: 'Common', bg: 'bg-slate-700 text-slate-200' },
    rare: { label: 'Rare', bg: 'bg-sky-600 text-white' },
    epic: { label: 'Epic', bg: 'bg-purple-600 text-white' },
    legendary: { label: 'Legendary', bg: 'bg-amber-500 text-slate-950 font-bold' },
    mythic: { label: 'Mythic Secret', bg: 'bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 text-slate-950 font-extrabold' },
  }[item.rarity];

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Item Header Info */}
      <div className="w-full flex items-center justify-between px-3 py-2 mb-2 bg-slate-800/80 rounded-xl border border-slate-700/60 backdrop-blur-sm roblox-box-shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold tracking-wide ${rarityBadge.bg}`}>
            {rarityBadge.label}
          </span>
          <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
            {item.japaneseName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1 font-mono-numbers">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Lv.{level}
          </span>
          <span className="flex items-center gap-1 font-mono-numbers">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            {squishCount}回揉んだ
          </span>
        </div>
      </div>

      {/* Main Squeeze Arena */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full aspect-square max-w-[340px] sm:max-w-[400px] flex items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900 border-2 border-slate-700/80 cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none roblox-box-shadow"
      >
        {/* Soft floor shadow */}
        <div className="absolute bottom-8 w-44 h-10 rounded-full bg-black/40 blur-md pointer-events-none" />

        {/* Floating ASMR text indicators */}
        {floatingTexts.map((txt) => (
          <div
            key={txt.id}
            style={{ left: `${txt.x}px`, top: `${txt.y}px` }}
            className="absolute pointer-events-none text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-300 border border-amber-400/40 backdrop-blur-sm animate-bounce z-20 whitespace-nowrap shadow-md"
          >
            {txt.text}
          </div>
        ))}

        {/* The Deformable SVG Squishy */}
        <SquishySvgRenderer
          item={item}
          deformationX={deformationX}
          deformationY={deformationY}
          squishDepth={squishDepth}
          wobble={wobble}
          isTapping={actionMode === 'tap'}
        />

        {/* Hint overlay on first view */}
        {squishCount === 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 bg-black/60 rounded-full text-xs text-slate-300 flex items-center gap-1.5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            画面をタッチ＆ドラッグしてスクイーズ！
          </div>
        )}
      </div>

      {/* ASMR Sound Bar & Action Mode Bar */}
      <div className="w-full mt-4 flex flex-col gap-2.5">
        {/* Sound signature status */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200">ASMR音響:</span>
            <span className="text-emerald-300 font-medium">{getSoundLabel()}</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {item.material === 'memory_foam' ? '低反発スローライズ' : item.material === 'water_gel' ? '高弾力ジェル' : item.material === 'crunchy_floam' ? 'サクサク気泡' : 'もっちり餅'}
          </span>
        </div>

        {/* Action Mode Segmented Buttons */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800/90 rounded-xl border border-slate-700">
          <button
            onClick={() => setActionMode('squeeze')}
            className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              actionMode === 'squeeze'
                ? 'bg-amber-500 text-slate-950 roblox-box-shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>✊ 揉み込み</span>
          </button>

          <button
            onClick={() => setActionMode('poke')}
            className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              actionMode === 'poke'
                ? 'bg-amber-500 text-slate-950 roblox-box-shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>👉 ツンツン連打</span>
          </button>

          <button
            onClick={() => setActionMode('tap')}
            className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              actionMode === 'tap'
                ? 'bg-amber-500 text-slate-950 roblox-box-shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>💅 爪タップ音</span>
          </button>
        </div>
      </div>
    </div>
  );
};
