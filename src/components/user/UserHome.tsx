import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Send,
  Sparkles,
  Gamepad2,
  Palette,
  Hash,
  Dice5,
  Volume2,
  ChevronRight,
  Users,
  Play,
  Plane,
} from 'lucide-react';
import { BannerSlider } from '../common/BannerSlider';
import { db } from '../../services/dbStore';
import { GameItem } from '../../types';

interface UserHomeProps {
  onNavigate: (
    target: 'deposit' | 'withdraw' | 'records' | 'refer' | 'help' | 'game_win_color' | 'game_number' | 'game_lucky' | 'game_dice' | 'game_aviator',
  ) => void;
}

export const UserHome: React.FC<UserHomeProps> = ({ onNavigate }) => {
  const settings = db.getSettings();
  const enabledGames = db.getGames().filter((g) => g.enabled);

  const getGameIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'palette':
        return <Palette className="w-5 h-5" />;
      case 'plane':
        return <Plane className="w-5 h-5" />;
      case 'hash':
      case 'dice':
        return <Hash className="w-5 h-5" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'dice5':
      case 'gamepad':
      case 'gamepad2':
        return <Dice5 className="w-5 h-5" />;
      default:
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const handleOpenGame = (gameCode: string) => {
    if (gameCode === 'win_color') onNavigate('game_win_color');
    else if (gameCode === 'aviator') onNavigate('game_aviator');
    else if (gameCode === 'number_game') onNavigate('game_number');
    else if (gameCode === 'lucky_spin') onNavigate('game_lucky');
    else if (gameCode === 'dice_roll') onNavigate('game_dice');
    else onNavigate('game_win_color');
  };

  const handleOpenTelegram = () => {
    if (settings.telegramGroupUrl) {
      window.open(settings.telegramGroupUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Announcement Marquee */}
      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#0b1933] to-slate-900 border border-emerald-500/20 flex items-center gap-2 overflow-hidden shadow-sm">
        <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
          <Volume2 className="w-3.5 h-3.5" />
        </div>
        <div className="overflow-hidden whitespace-nowrap text-xs text-slate-300 font-medium">
          <span className="inline-block animate-marquee">{settings.noticeText}</span>
        </div>
      </div>

      {/* 3-Banner Auto Slider */}
      <BannerSlider
        onAction={(target) => {
          if (target === 'deposit') onNavigate('deposit');
          else if (target === 'refer') onNavigate('refer');
          else onNavigate('game_win_color');
        }}
      />

      {/* Quick Action Buttons (Deposit, Withdraw, Records, Telegram) */}
      <div className="grid grid-cols-4 gap-2">
        {/* Deposit */}
        <button
          type="button"
          onClick={() => onNavigate('deposit')}
          className="group p-3 rounded-2xl bg-slate-900/90 hover:bg-[#0c2242] border border-slate-800 hover:border-emerald-500/40 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-300">
            ডিপোজিট
          </span>
        </button>

        {/* Withdraw */}
        <button
          type="button"
          onClick={() => onNavigate('withdraw')}
          className="group p-3 rounded-2xl bg-slate-900/90 hover:bg-[#2b1022] border border-slate-800 hover:border-rose-500/40 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-rose-300">
            উইথড্র
          </span>
        </button>

        {/* Records */}
        <button
          type="button"
          onClick={() => onNavigate('records')}
          className="group p-3 rounded-2xl bg-slate-900/90 hover:bg-[#2e2309] border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-amber-300">
            হিসাব খাতা
          </span>
        </button>

        {/* Telegram */}
        <button
          type="button"
          onClick={handleOpenTelegram}
          className="group p-3 rounded-2xl bg-slate-900/90 hover:bg-[#0c2242] border border-slate-800 hover:border-[#229ED9]/40 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white font-bold flex items-center justify-center shadow-md shadow-[#229ED9]/20 group-hover:scale-105 transition-transform">
            <Send className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-[#229ED9]">
            টেলিগ্রাম
          </span>
        </button>
      </div>

      {/* Referral CTA Banner */}
      <div
        onClick={() => onNavigate('refer')}
        className="cursor-pointer p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 flex items-center justify-between hover:border-purple-500/50 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>৩ লেভেল টিম রেফারেল বোনাস</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-bold">
                কমিশন
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              বন্ধু যুক্ত করুন এবং আজীবন প্যাসিভ ইনকাম নিশ্চিত করুন
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-purple-400" />
      </div>

      {/* Games / Services Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">
                গেমস ও সার্ভিসেস (Games & Services)
              </h3>
              <p className="text-[10px] text-slate-400">
                ১০০% সুরক্ষিত ও ইনস্ট্যান্ট উইথড্র গেমস
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {enabledGames.length} গেমস চালু
          </span>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 gap-3">
          {enabledGames.map((game) => (
            <div
              key={game.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between overflow-hidden transition-all shadow-md group hover:shadow-emerald-500/10"
            >
              {/* Game Banner Image / Icon Header */}
              <div className="relative w-full h-24 bg-slate-950 overflow-hidden">
                {game.imageUrl ? (
                  <img
                    src={game.imageUrl}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if image link fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1730] via-transparent to-black/30" />

                {/* Min Bet Tag */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 text-[9px] font-black font-mono shadow">
                  মিনিমাম {game.minBet || 10} ৳
                </div>

                {/* Live Count */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-slate-300 text-[9px] font-mono">
                  {game.playersCount || 850}+ লাইভ
                </div>

                {/* Floating Game Icon */}
                <div className="absolute -bottom-2 right-2 w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700 text-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {getGameIcon(game.icon)}
                </div>
              </div>

              {/* Game Content */}
              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">
                    {game.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenGame(game.code)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 mt-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>খেলুন (১০ ৳)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
