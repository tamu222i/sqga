import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProfile, GachaBanner, SquishyItem } from './domain/schemas/index.ts';
import { GACHA_BANNERS } from './domain/model/banners.ts';
import { SQUISHY_CATALOG_MAP } from './domain/model/catalog.ts';
import { GachaDomainService, PullResultItem } from './domain/services/GachaDomainService.ts';
import { LocalStorageRepository } from './infrastructure/storage/LocalStorageRepository.ts';
import { asmrAudio } from './infrastructure/audio/WebAudioAsmrEngine.ts';
import { SquishPlayground } from './presentation/components/SquishPlayground.tsx';
import { BannerSelector } from './presentation/components/BannerSelector.tsx';
import { UnboxingStage } from './presentation/components/UnboxingStage.tsx';
import { CollectionShelf } from './presentation/components/CollectionShelf.tsx';
import { BddTestRunnerModal } from './presentation/components/BddTestRunnerModal.tsx';
import { Coins, Sparkles, Volume2, VolumeX, Shield, Gift, RefreshCw } from 'lucide-react';

type TabView = 'PLAYGROUND' | 'GACHA' | 'COLLECTION';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => LocalStorageRepository.loadProfile());
  const [currentTab, setCurrentTab] = useState<TabView>('PLAYGROUND');
  const [selectedBanner, setSelectedBanner] = useState<GachaBanner>(GACHA_BANNERS[0]);
  const [activeSquishyId, setActiveSquishyId] = useState<string>(() => {
    return profile.shelfItemIds[0] || 'bakery_toast';
  });

  // Gacha Unboxing session state
  const [activePullResults, setActivePullResults] = useState<PullResultItem[] | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  // Synchronize profile changes to LocalStorage with schema validation
  useEffect(() => {
    LocalStorageRepository.saveProfile(profile);
  }, [profile]);

  // Audio settings sync
  useEffect(() => {
    asmrAudio.setVolume(profile.soundSettings.volume);
    asmrAudio.setBassBoost(profile.soundSettings.bassBoost);
    asmrAudio.setMuted(isMuted);
  }, [profile.soundSettings, isMuted]);

  const activeSquishy: SquishyItem = SQUISHY_CATALOG_MAP[activeSquishyId] || SQUISHY_CATALOG_MAP['bakery_toast'];
  const activeInventoryEntry = profile.inventory.find((e) => e.itemId === activeSquishy.id);
  const activeLevel = activeInventoryEntry?.level || 1;
  const squishCount = activeInventoryEntry?.squishCount || 0;

  // Delight Points & Coins callback
  const handleDelightEarned = useCallback((points: number, coinsEarned: number) => {
    setProfile((prev) => ({
      ...prev,
      delightPoints: prev.delightPoints + points,
      coins: prev.coins + coinsEarned,
    }));
  }, []);

  // Increment squish counter
  const handleSquishCountIncrement = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.itemId === activeSquishyId ? { ...item, squishCount: item.squishCount + 1 } : item
      ),
    }));
  }, [activeSquishyId]);

  // Gacha Pull Handler
  const handleExecutePull = (banner: GachaBanner, count: 1 | 10) => {
    const currentPity = profile.pityCounters[banner.id] || 0;
    const execution = GachaDomainService.executePull(
      banner,
      count,
      profile.inventory,
      currentPity
    );

    // Deduct coins & update inventory and pity
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins - execution.coinsSpent,
      inventory: execution.newInventory,
      pityCounters: {
        ...prev.pityCounters,
        [banner.id]: execution.updatedPityCount,
      },
    }));

    // Trigger unboxing stage
    setActivePullResults(execution.results);
  };

  // Daily free bonus coins
  const handleClaimDailyCoins = () => {
    if (dailyClaimed) return;
    asmrAudio.playRevealChime('rare');
    setProfile((prev) => ({ ...prev, coins: prev.coins + 300 }));
    setDailyClaimed(true);
  };

  const handleFinishUnboxing = () => {
    if (activePullResults && activePullResults.length > 0) {
      // Set the last drawn item as active
      setActiveSquishyId(activePullResults[activePullResults.length - 1].item.id);
    }
    setActivePullResults(null);
    setCurrentTab('PLAYGROUND');
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    asmrAudio.setMuted(nextMute);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav links) - Zone 3 (Action) */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand title wordmark */}
        <div
          onClick={() => setCurrentTab('PLAYGROUND')}
          className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer font-display"
        >
          <span className="text-xl">🧸</span>
          <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 bg-clip-text text-transparent">
            Roblox ASMR Squishy
          </span>
        </div>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-400">
          <button
            onClick={() => {
              asmrAudio.playAcrylicTap();
              setCurrentTab('PLAYGROUND');
              setActivePullResults(null);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'PLAYGROUND' && !activePullResults
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            スクイーズ
          </button>

          <button
            onClick={() => {
              asmrAudio.playAcrylicTap();
              setCurrentTab('GACHA');
              setActivePullResults(null);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'GACHA' || activePullResults
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            ガチャ開封
          </button>

          <button
            onClick={() => {
              asmrAudio.playAcrylicTap();
              setCurrentTab('COLLECTION');
              setActivePullResults(null);
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'COLLECTION'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            コレクション
          </button>

          <button
            onClick={() => setIsTestModalOpen(true)}
            className="whitespace-nowrap shrink-0 text-slate-400 hover:text-emerald-400 transition-colors py-1 flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>BDDテスト</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'ミュート解除' : 'ミュート'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            disabled={dailyClaimed}
            onClick={handleClaimDailyCoins}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              dailyClaimed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 roblox-box-shadow-sm roblox-box-shadow-press'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{dailyClaimed ? '受取済' : '無料+300コイン'}</span>
            <span className="sm:hidden">{dailyClaimed ? '済' : '+300'}</span>
          </button>
        </div>
      </header>

      {/* Currency & ASMR Delight Status Strip */}
      <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono-numbers">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{profile.coins}</span>
            <span className="text-[11px] text-slate-400 font-normal">コイン</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-rose-300 font-mono-numbers">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>{profile.delightPoints}</span>
            <span className="text-[11px] text-slate-400 font-normal">ASMR快感Pt</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="hidden sm:inline">ヘッドホン推奨 🎧 音フェチ体験</span>
          <button
            onClick={() => {
              if (confirm('データを初期リセットしますか？')) {
                const fresh = LocalStorageRepository.resetProfile();
                setProfile(fresh);
                setActiveSquishyId('bakery_toast');
              }
            }}
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">リセット</span>
          </button>
        </div>
      </div>

      {/* Main App Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        {/* If Active Gacha Pulling is in progress, show Unboxing Stage */}
        {activePullResults ? (
          <UnboxingStage
            banner={selectedBanner}
            pullResults={activePullResults}
            onFinish={handleFinishUnboxing}
            onDelightEarned={handleDelightEarned}
          />
        ) : currentTab === 'PLAYGROUND' ? (
          <div className="w-full flex flex-col items-center">
            {/* Playful subtitle */}
            <div className="text-center mb-4">
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">
                ASMR スクイーズ・プレイグラウンド
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                マウスや指先で触って、揉んで、潰して、ゆっくり戻る低反発音やジェル音を楽しもう！
              </p>
            </div>

            <SquishPlayground
              item={activeSquishy}
              level={activeLevel}
              onDelightEarned={handleDelightEarned}
              onSquishCountIncrement={handleSquishCountIncrement}
              squishCount={squishCount}
            />

            {/* Quick shelf changer underneath */}
            <div className="w-full max-w-xl mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-300">
                  所持スクイーズに切り替え
                </span>
                <button
                  onClick={() => setCurrentTab('COLLECTION')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  図鑑をすべて見る →
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {profile.inventory.map((inv) => {
                  const item = SQUISHY_CATALOG_MAP[inv.itemId];
                  if (!item) return null;
                  const isCur = item.id === activeSquishyId;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        asmrAudio.playAcrylicTap();
                        setActiveSquishyId(item.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                        isCur
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.accentColor }} />
                      <span>{item.japaneseName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : currentTab === 'GACHA' ? (
          <div className="w-full">
            <BannerSelector
              selectedBanner={selectedBanner}
              onSelectBanner={setSelectedBanner}
              onPull={handleExecutePull}
              playerCoins={profile.coins}
              pityCounters={profile.pityCounters}
            />
          </div>
        ) : (
          <div className="w-full">
            <CollectionShelf
              inventory={profile.inventory}
              activeItemId={activeSquishyId}
              onSelectActiveItem={(id) => {
                setActiveSquishyId(id);
                setCurrentTab('PLAYGROUND');
              }}
              onDelightEarned={handleDelightEarned}
            />
          </div>
        )}
      </main>

      {/* BDD Test Modal */}
      <BddTestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      {/* Quiet Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>Roblox ASMR Squishy Gacha Simulator · Procedural Web Audio Synthesis & Spring Dynamics</p>
      </footer>
    </div>
  );
}
