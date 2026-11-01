import React, { useState } from 'react';
import { GachaBanner, SquishyItem } from '../../domain/schemas/index.ts';
import { GACHA_BANNERS } from '../../domain/model/banners.ts';
import { SQUISHY_CATALOG_MAP } from '../../domain/model/catalog.ts';
import { asmrAudio } from '../../infrastructure/audio/WebAudioAsmrEngine.ts';
import { Sparkles, Coins, Info, ShieldCheck } from 'lucide-react';

interface BannerSelectorProps {
  selectedBanner: GachaBanner;
  onSelectBanner: (banner: GachaBanner) => void;
  onPull: (banner: GachaBanner, count: 1 | 10) => void;
  playerCoins: number;
  pityCounters: Record<string, number>;
}

export const BannerSelector: React.FC<BannerSelectorProps> = ({
  selectedBanner,
  onSelectBanner,
  onPull,
  playerCoins,
  pityCounters,
}) => {
  const [showOddsModal, setShowOddsModal] = useState(false);
  const currentPity = pityCounters[selectedBanner.id] || 0;
  const pityLeft = Math.max(0, selectedBanner.pityThreshold - currentPity);

  const canAffordSingle = playerCoins >= selectedBanner.cost;
  const canAffordTen = playerCoins >= selectedBanner.cost * 10;

  const handlePull1x = () => {
    if (!canAffordSingle) {
      asmrAudio.playFoilCrinkle(0.3);
      return;
    }
    asmrAudio.playFoilCrinkle(0.8);
    onPull(selectedBanner, 1);
  };

  const handlePull10x = () => {
    if (!canAffordTen) {
      asmrAudio.playFoilCrinkle(0.3);
      return;
    }
    asmrAudio.playFoilCrinkle(1.0);
    onPull(selectedBanner, 10);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Banner Segment Tabs */}
      <div className="w-full max-w-2xl flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GACHA_BANNERS.map((banner) => {
          const isSelected = banner.id === selectedBanner.id;
          return (
            <button
              key={banner.id}
              onClick={() => {
                asmrAudio.playAcrylicTap();
                onSelectBanner(banner);
              }}
              style={{
                borderColor: isSelected ? banner.themeColor : 'transparent',
              }}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all border-2 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-lg roblox-box-shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{banner.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Banner Showcase Card */}
      <div className="w-full max-w-xl mt-3 p-5 rounded-3xl bg-slate-800/90 border-2 border-slate-700 roblox-box-shadow flex flex-col items-center text-center relative overflow-hidden">
        {/* Machine Theme Glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: selectedBanner.themeColor }}
        />

        {/* Machine Title & Info */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🛍️</span>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {selectedBanner.japaneseName}
          </h2>
          <button
            onClick={() => {
              asmrAudio.playAcrylicTap();
              setShowOddsModal(true);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
            title="排出確率一覧"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-1 max-w-md">
          {selectedBanner.subtitle}
        </p>

        {/* Pity Status Box */}
        <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">
            レア以上確定まであと:
          </span>
          <span className="font-bold text-amber-400 font-mono-numbers">
            {pityLeft} 回
          </span>
          <span className="text-[11px] text-slate-500">
            ({currentPity}/{selectedBanner.pityThreshold})
          </span>
        </div>

        {/* Blind Bag Preview Visual */}
        <div className="my-5 relative flex items-center justify-center">
          <div
            style={{ backgroundColor: selectedBanner.bagColor }}
            className="w-40 h-48 rounded-2xl border-4 border-white/80 shadow-2xl flex flex-col items-center justify-between p-3 transform hover:rotate-1 hover:scale-105 transition-all select-none"
          >
            <div className="text-[10px] font-black tracking-widest text-slate-800">
              ASMR SQUISHY
            </div>
            <div className="text-5xl">✨</div>
            <div className="text-[10px] font-bold text-slate-700 text-center">
              TAP OR SQUEEZE
            </div>
          </div>
        </div>

        {/* Action Buttons: 1x Pull & 10x Pull */}
        <div className="w-full grid grid-cols-2 gap-3 mt-1">
          {/* 1x Draw */}
          <button
            disabled={!canAffordSingle}
            onClick={handlePull1x}
            className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all roblox-box-shadow ${
              canAffordSingle
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 roblox-box-shadow-press cursor-pointer'
                : 'bg-slate-700/60 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <span className="tracking-wide">1回 開封する</span>
            <span className="flex items-center gap-1 font-mono-numbers text-xs">
              <Coins className="w-3.5 h-3.5" />
              {selectedBanner.cost} コイン
            </span>
          </button>

          {/* 10x Draw */}
          <button
            disabled={!canAffordTen}
            onClick={handlePull10x}
            className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all roblox-box-shadow ${
              canAffordTen
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 roblox-box-shadow-press cursor-pointer'
                : 'bg-slate-700/60 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <span className="tracking-wide">10連 一括開封</span>
            <span className="flex items-center gap-1 font-mono-numbers text-xs">
              <Coins className="w-3.5 h-3.5" />
              {selectedBanner.cost * 10} コイン
            </span>
          </button>
        </div>

        {!canAffordSingle && (
          <p className="mt-2 text-xs text-rose-400 font-medium">
            コインが不足しています！スクイーズを揉むかデイリーボーナスを受け取ろう！
          </p>
        )}
      </div>

      {/* Odds & Drop Pool Modal */}
      {showOddsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 roblox-box-shadow max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                <span>🎁 {selectedBanner.japaneseName} 排出確率</span>
              </h3>
              <button
                onClick={() => setShowOddsModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md bg-slate-800"
              >
                閉じる
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1 text-xs">
              {selectedBanner.dropPool.map((dp) => {
                const item = SQUISHY_CATALOG_MAP[dp.itemId];
                if (!item) return null;
                const totalWeight = selectedBanner.dropPool.reduce((s, p) => s + p.weight, 0);
                const percent = ((dp.weight / totalWeight) * 100).toFixed(1);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.accentColor }} />
                      <span className="font-bold text-white">{item.japaneseName}</span>
                      <span className="text-[10px] text-slate-400">({item.rarity})</span>
                    </div>
                    <span className="font-mono-numbers font-semibold text-amber-400">
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              ※天井システム: {selectedBanner.pityThreshold}回以内に必ずRare以上が排出されます。
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
