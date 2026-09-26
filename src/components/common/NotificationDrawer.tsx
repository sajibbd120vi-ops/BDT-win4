import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const settings = db.getSettings();

  const notifications = [
    {
      id: 'notif-1',
      title: 'সিস্টেম নোটিশ',
      message: settings.noticeText,
      date: 'আজকে',
      type: 'info',
    },
    {
      id: 'notif-2',
      title: 'পেমেন্ট চ্যানেল চালু',
      message: `bKash (${settings.bKashNumber}) এবং Nagad (${settings.nagadNumber}) ক্যাশ-আউট / সেন্ড মানি সার্ভিস সক্রিয় রয়েছে।`,
      date: '২৪ ঘন্টা',
      type: 'success',
    },
    {
      id: 'notif-3',
      title: 'রেফার বোনাস অফার',
      message: `আপনার রেফারেল কোড দিয়ে বন্ধুদের ইনভাইট করুন এবং প্রতিটি রেজিষ্ট্রেশনে নিশ্চিত বোনাস পান!`,
      date: 'চলমান',
      type: 'promo',
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-md bg-[#0d1629] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden mt-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#091124]">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Bell className="w-4 h-4" />
              </div>
              <span>বিজ্ঞপ্তি ও নোটিফিকেশন</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {n.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : n.type === 'info' ? (
                      <Info className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#091124] border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
