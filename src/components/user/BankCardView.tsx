import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  CreditCard,
  Building,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { BankAccount } from '../../types';

interface BankCardViewProps {
  onBack: () => void;
}

export const BankCardView: React.FC<BankCardViewProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [bankList, setBankList] = useState<BankAccount[]>(
    currentUser ? db.getUserBankAccounts(currentUser.uid) : [],
  );

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Bank'>('bKash');
  const [accountHolderName, setAccountHolderName] = useState(currentUser ? currentUser.name : '');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');

  const refreshList = () => {
    if (currentUser) {
      setBankList(db.getUserBankAccounts(currentUser.uid));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !accountNumber.trim()) return;

    if (editingId) {
      db.updateBankAccount(editingId, {
        method,
        accountHolderName,
        accountNumber,
        bankName: method === 'Bank' ? bankName : undefined,
        branch: method === 'Bank' ? branch : undefined,
      });
      setEditingId(null);
    } else {
      db.saveBankAccount({
        uid: currentUser.uid,
        method,
        accountHolderName,
        accountNumber,
        bankName: method === 'Bank' ? bankName : undefined,
        branch: method === 'Bank' ? branch : undefined,
        isDefault: bankList.length === 0,
      });
      setIsAdding(false);
    }

    setAccountNumber('');
    setBankName('');
    setBranch('');
    refreshList();
  };

  const handleEdit = (bank: BankAccount) => {
    setEditingId(bank.id);
    setMethod(bank.method);
    setAccountHolderName(bank.accountHolderName);
    setAccountNumber(bank.accountNumber);
    setBankName(bank.bankName || '');
    setBranch(bank.branch || '');
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি এই অ্যাকাউন্টটি মুছে ফেলতে চান?')) {
      db.deleteBankAccount(id);
      refreshList();
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1c] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#091226]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>

        <h1 className="text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>ব্যাংক ও পেমেন্ট কার্ড</span>
        </h1>

        <div className="w-8" />
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Top prompt */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">নিরাপদ হিসাব সংরক্ষণ</h4>
              <p className="text-[10px] text-slate-400">উইথড্র দ্রুত করতে আপনার অ্যাকাউন্ট যোগ করুন</p>
            </div>
          </div>
          {!isAdding && (
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setAccountNumber('');
              }}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>যোগ করুন</span>
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {isAdding && (
          <form onSubmit={handleSave} className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white">
                {editingId ? 'অ্যাকাউন্ট সম্পাদনা' : 'নতুন অ্যাকাউন্ট যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                বাতিল
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">মেথড</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Bank'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-1.5 rounded-lg text-xs font-bold border ${
                      method === m
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">অ্যাকাউন্ট নম্বর / মোবাইল</label>
              <input
                type="text"
                placeholder="01XXXXXXXXX বা ব্যাংক হিসাব নং"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">হিসাবধারীর নাম</label>
              <input
                type="text"
                placeholder="সাকিব আহমেদ"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {method === 'Bank' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">ব্যাংকের নাম</label>
                  <input
                    type="text"
                    placeholder="Islami Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">শাখা / ব্রাঞ্চ</label>
                  <input
                    type="text"
                    placeholder="ঢাকা"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              {editingId ? 'আপডেট সম্পন্ন করুন' : 'সংরক্ষণ করুন'}
            </button>
          </form>
        )}

        {/* Existing Accounts List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            আপনার সংযুক্ত অ্যাকাউন্টসমূহ ({bankList.length})
          </h3>

          {bankList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
              কোনো ব্যাংক বা কার্ড যোগ করা নেই। উপরের বাটনে ক্লিক করে যোগ করুন।
            </div>
          ) : (
            bankList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      item.method === 'bKash'
                        ? 'bg-[#e2136e]/20 text-[#e2136e]'
                        : item.method === 'Nagad'
                        ? 'bg-[#f7941d]/20 text-[#f7941d]'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {item.method === 'Bank' ? <Building className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{item.method}</span>
                      {item.bankName && (
                        <span className="text-[11px] text-slate-400 font-normal">
                          - {item.bankName}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-emerald-400 font-semibold">
                      {item.accountNumber}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.accountHolderName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800"
                    title="এডিট"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    title="ডিলিট"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
