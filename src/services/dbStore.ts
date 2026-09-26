import {
  UserProfile,
  DepositRequest,
  WithdrawalRequest,
  BankAccount,
  TransactionRecord,
  SupportChatMessage,
  GameItem,
  DepositAmountOption,
  AppSettings,
  AdminLog,
  ReferralMember,
  UserGameBetRecord,
} from '../types';

const STORAGE_KEY = 'bd_taka_app_db_v1';

interface DBState {
  users: UserProfile[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  bankAccounts: BankAccount[];
  transactions: TransactionRecord[];
  supportMessages: SupportChatMessage[];
  games: GameItem[];
  depositAmounts: DepositAmountOption[];
  settings: AppSettings;
  adminLogs: AdminLog[];
  gameBets: UserGameBetRecord[];
}

const DEFAULT_SETTINGS: AppSettings = {
  siteName: 'BD TAKA',
  noticeText: '🔥 BD TAKA-তে স্বাগতম! bKash এবং Nagad-এর মাধ্যমে দ্রুত ডিপোজিট ও উইথড্র করুন। রেফার করলেই পাচ্ছেন ৩ লেভেল পর্যন্ত আকর্ষণীয় কমিশন!',
  adminPassword: 'Sajib',
  bKashNumber: '01323367204',
  bKashEnabled: true,
  nagadNumber: '01772692185',
  nagadEnabled: true,
  minDeposit: 100,
  minWithdraw: 100,
  telegramGroupUrl: 'https://t.me/bdtakaofficial',
  telegramSupportUrl: 'https://t.me/bdtakasupport',
  telegramEnabled: true,
  referralEnabled: true,
  level1Percent: 5,
  level2Percent: 3,
  level3Percent: 1,
  referralSignupBonus: 15,
  newUserWelcomeBonus: 0,
};

const DEFAULT_DEPOSIT_AMOUNTS: DepositAmountOption[] = [
  { id: 'amt-1', amount: 100, label: '৳ 100', enabled: true, order: 1 },
  { id: 'amt-2', amount: 500, label: '৳ 500', enabled: true, order: 2 },
  { id: 'amt-3', amount: 700, label: '৳ 700', enabled: true, order: 3 },
  { id: 'amt-4', amount: 1000, label: '৳ 1K', enabled: true, order: 4 },
  { id: 'amt-5', amount: 2000, label: '৳ 2K', enabled: true, order: 5 },
  { id: 'amt-6', amount: 3000, label: '৳ 3K', enabled: true, order: 6 },
  { id: 'amt-7', amount: 5000, label: '৳ 5K', enabled: true, order: 7 },
  { id: 'amt-8', amount: 10000, label: '৳ 10K', enabled: true, order: 8 },
  { id: 'amt-9', amount: 15000, label: '৳ 15K', enabled: true, order: 9 },
  { id: 'amt-10', amount: 20000, label: '৳ 20K', enabled: true, order: 10 },
  { id: 'amt-11', amount: 25000, label: '৳ 25K', enabled: true, order: 11 },
  { id: 'amt-12', amount: 50000, label: '৳ 50K', enabled: true, order: 12 },
];

const DEFAULT_GAMES: GameItem[] = [
  {
    id: 'game-1',
    code: 'win_color',
    name: 'WinGo (DX WIN)',
    description: 'WinGo 30s, 1m, 3m, 5m • লাল, সবুজ, বেগুনি, সংখ্যা (০-৯) ও Big/Small প্রেডিকশন!',
    icon: 'Palette',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    minBet: 10,
    enabled: true,
    order: 1,
    playersCount: 2850,
  },
  {
    id: 'game-5',
    code: 'aviator',
    name: 'Aviator (ট্যাব আটার)',
    description: 'প্লেন ওড়ার সাথে গুণিতক বাড়বে! ক্র্যাশ হওয়ার আগেই ক্যাশআউট করুন!',
    icon: 'Plane',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    minBet: 10,
    enabled: true,
    order: 2,
    playersCount: 3420,
  },
  {
    id: 'game-2',
    code: 'number_game',
    name: 'Number Game',
    description: '০ থেকে ৯ সঠিক সংখ্যা অনুমান করে ৯ গুণ পুরস্কার উপভোগ করুন!',
    icon: 'Hash',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    minBet: 10,
    enabled: true,
    order: 3,
    playersCount: 890,
  },
  {
    id: 'game-3',
    code: 'lucky_spin',
    name: 'Lucky Game',
    description: 'প্রতিদিনের লাকি স্পিন ঘুরিয়ে আকর্ষণীয় কয়েন ও বোনাস লুফে নিন!',
    icon: 'Sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=600&q=80',
    minBet: 10,
    enabled: true,
    order: 4,
    playersCount: 2350,
  },
  {
    id: 'game-4',
    code: 'dice_roll',
    name: 'Dice Game',
    description: 'ক্লাসিক ডাইস রোল করে বিগ, স্মল কিংবা ট্রিপল প্রেডিক্ট করুন!',
    icon: 'Dice5',
    imageUrl: 'https://images.unsplash.com/photo-1522069213448-443a6ec4bb4c?auto=format&fit=crop&w=600&q=80',
    minBet: 10,
    enabled: true,
    order: 5,
    playersCount: 1420,
  },
];

const INITIAL_DEMO_USERS: UserProfile[] = [
  {
    uid: 'UID829471',
    name: 'সাকিব আহমেদ',
    mobile: '01712345678',
    email: 'sakib@example.com',
    balance: 250.0,
    referralCode: 'BD778899',
    registrationDate: '2026-09-15 14:32:00',
    status: 'active',
    role: 'user',
  },
  {
    uid: 'UID901234',
    name: 'তানভীর হাসান',
    mobile: '01899887766',
    email: 'tanvir@example.com',
    balance: 50.0,
    referralCode: 'BD112233',
    referredBy: 'BD778899',
    registrationDate: '2026-09-18 10:15:00',
    status: 'active',
    role: 'user',
  },
  {
    uid: 'ADMIN001',
    name: 'Super Admin',
    mobile: '01800000000',
    email: 'admin@bdtaka.com',
    balance: 99999.0,
    referralCode: 'BDMASTER',
    registrationDate: '2026-09-01 00:00:00',
    status: 'active',
    role: 'admin',
  },
];

const INITIAL_DEPOSITS: DepositRequest[] = [
  {
    id: 'DEP-1001',
    uid: 'UID829471',
    userName: 'সাকিব আহমেদ',
    userMobile: '01712345678',
    amount: 200,
    paymentMethod: 'bKash',
    paymentNumber: '01712-345678',
    transactionId: 'BK9X8A76YZ',
    date: '2026-09-24 16:20:10',
    status: 'Confirmed',
    confirmedAt: '2026-09-24 16:25:00',
    adminNote: 'অটো ভেরিফাইড',
  },
  {
    id: 'DEP-1002',
    uid: 'UID829471',
    userName: 'সাকিব আহমেদ',
    userMobile: '01712345678',
    amount: 100,
    paymentMethod: 'Nagad',
    paymentNumber: '01823-456789',
    transactionId: 'NG77T65Q11',
    date: '2026-09-25 18:40:00',
    status: 'Pending',
  },
];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'WTH-5001',
    uid: 'UID829471',
    userName: 'সাকিব আহমেদ',
    userMobile: '01712345678',
    amount: 150,
    method: 'bKash',
    accountNumber: '01712345678',
    accountHolderName: 'সাকিব আহমেদ',
    date: '2026-09-23 11:10:00',
    status: 'Completed',
    processedAt: '2026-09-23 11:45:00',
    adminNote: 'সফলভাবে টাকা পাঠানো হয়েছে',
  },
];

const INITIAL_BANKS: BankAccount[] = [
  {
    id: 'BNK-1',
    uid: 'UID829471',
    method: 'bKash',
    accountHolderName: 'সাকিব আহমেদ',
    accountNumber: '01712345678',
    isDefault: true,
  },
];

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TRX-1',
    uid: 'UID829471',
    type: 'deposit',
    title: 'bKash ডিপোজিট সফল',
    amount: 200,
    isCredit: true,
    date: '2026-09-24 16:25:00',
    referenceId: 'DEP-1001',
    status: 'Confirmed',
    description: 'ট্রানজেকশন আইডি: BK9X8A76YZ',
  },
  {
    id: 'TRX-2',
    uid: 'UID829471',
    type: 'withdraw',
    title: 'উইথড্র সম্পন্ন',
    amount: 150,
    isCredit: false,
    date: '2026-09-23 11:45:00',
    referenceId: 'WTH-5001',
    status: 'Completed',
    description: 'bKash 01712345678',
  },
  {
    id: 'TRX-3',
    uid: 'UID829471',
    type: 'referral',
    title: 'রেফারেল কমিশন প্রাপ্তি',
    amount: 15,
    isCredit: true,
    date: '2026-09-24 19:10:00',
    referenceId: 'REF-901234',
    status: 'Confirmed',
    description: 'তানভীর হাসান রেজিষ্ট্রেশন বোনাস',
  },
];

const INITIAL_SUPPORT: SupportChatMessage[] = [
  {
    id: 'SPT-1',
    uid: 'UID829471',
    userName: 'সাকিব আহমেদ',
    userMobile: '01712345678',
    sender: 'user',
    message: 'আমার ডিপোজিট কতক্ষণ লাগবে?',
    date: '2026-09-24 16:22:00',
    status: 'Answered',
  },
  {
    id: 'SPT-2',
    uid: 'UID829471',
    userName: 'সাকিব আহমেদ',
    userMobile: '01712345678',
    sender: 'admin',
    message: 'ধন্যবাদ, আপনার ডিপোজিট চেক করে ৩ মিনিটের মধ্যে অ্যাপ্রুভ করে দেওয়া হয়েছে।',
    date: '2026-09-24 16:25:00',
    status: 'Answered',
  },
];

const INITIAL_LOGS: AdminLog[] = [
  {
    id: 'LOG-1',
    action: 'SYSTEM_BOOT',
    adminUser: 'System',
    details: 'BD TAKA কোর ডাটাবেজ সফলভাবে ইনিশিয়ালাইজ হয়েছে।',
    timestamp: '2026-09-01 00:00:00',
  },
];

class DatabaseService {
  private state: DBState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DBState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const loadedSettings: AppSettings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
        if (!loadedSettings.bKashNumber || loadedSettings.bKashNumber === '01712-345678') {
          loadedSettings.bKashNumber = '01323367204';
        }
        if (!loadedSettings.nagadNumber || loadedSettings.nagadNumber === '01823-456789') {
          loadedSettings.nagadNumber = '01772692185';
        }
        if (!loadedSettings.adminPassword) {
          loadedSettings.adminPassword = 'Sajib';
        }

        let loadedGames: GameItem[] = parsed.games || DEFAULT_GAMES;
        if (!loadedGames.some((g: GameItem) => g.code === 'aviator')) {
          const aviatorDef = DEFAULT_GAMES.find((g) => g.code === 'aviator');
          if (aviatorDef) {
            loadedGames = [DEFAULT_GAMES[0], aviatorDef, ...loadedGames.filter(g => g.code !== 'win_color')];
          }
        }

        return {
          users: parsed.users || INITIAL_DEMO_USERS,
          deposits: parsed.deposits || INITIAL_DEPOSITS,
          withdrawals: parsed.withdrawals || INITIAL_WITHDRAWALS,
          bankAccounts: parsed.bankAccounts || INITIAL_BANKS,
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          supportMessages: parsed.supportMessages || INITIAL_SUPPORT,
          games: loadedGames,
          depositAmounts: parsed.depositAmounts && parsed.depositAmounts.length >= 10 ? parsed.depositAmounts : DEFAULT_DEPOSIT_AMOUNTS,
          settings: loadedSettings,
          adminLogs: parsed.adminLogs || INITIAL_LOGS,
          gameBets: parsed.gameBets || [],
        };
      }
    } catch {
      // fallback to initial state
    }

    return {
      users: INITIAL_DEMO_USERS,
      deposits: INITIAL_DEPOSITS,
      withdrawals: INITIAL_WITHDRAWALS,
      bankAccounts: INITIAL_BANKS,
      transactions: INITIAL_TRANSACTIONS,
      supportMessages: INITIAL_SUPPORT,
      games: DEFAULT_GAMES,
      depositAmounts: DEFAULT_DEPOSIT_AMOUNTS,
      settings: DEFAULT_SETTINGS,
      adminLogs: INITIAL_LOGS,
      gameBets: [],
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  // --- GETTERS ---
  public getState(): DBState {
    return this.state;
  }

  public getSettings(): AppSettings {
    return this.state.settings;
  }

  public getGames(): GameItem[] {
    return [...this.state.games].sort((a, b) => a.order - b.order);
  }

  public getDepositAmounts(): DepositAmountOption[] {
    return [...this.state.depositAmounts].sort((a, b) => a.order - b.order);
  }

  public getUserByUid(uid: string): UserProfile | undefined {
    return this.state.users.find((u) => u.uid === uid);
  }

  public getUserByMobile(mobile: string): UserProfile | undefined {
    return this.state.users.find((u) => u.mobile === mobile);
  }

  public getUserByReferralCode(code: string): UserProfile | undefined {
    return this.state.users.find((u) => u.referralCode.toUpperCase() === code.trim().toUpperCase());
  }

  public getUserDeposits(uid: string): DepositRequest[] {
    return this.state.deposits
      .filter((d) => d.uid === uid)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getUserWithdrawals(uid: string): WithdrawalRequest[] {
    return this.state.withdrawals
      .filter((w) => w.uid === uid)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getUserBankAccounts(uid: string): BankAccount[] {
    return this.state.bankAccounts.filter((b) => b.uid === uid);
  }

  public getUserTransactions(uid: string): TransactionRecord[] {
    return this.state.transactions
      .filter((t) => t.uid === uid)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getSupportMessages(uid?: string): SupportChatMessage[] {
    if (uid) {
      return this.state.supportMessages
        .filter((m) => m.uid === uid)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return [...this.state.supportMessages].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  public getReferralTree(referralCode: string): {
    level1: ReferralMember[];
    level2: ReferralMember[];
    level3: ReferralMember[];
    totalEarnings: number;
  } {
    const l1Users = this.state.users.filter((u) => u.referredBy === referralCode);
    const l1Codes = l1Users.map((u) => u.referralCode);
    const l2Users = this.state.users.filter((u) => u.referredBy && l1Codes.includes(u.referredBy));
    const l2Codes = l2Users.map((u) => u.referralCode);
    const l3Users = this.state.users.filter((u) => u.referredBy && l2Codes.includes(u.referredBy));

    const mapMember = (u: UserProfile, lvl: 1 | 2 | 3): ReferralMember => ({
      uid: u.uid,
      name: u.name,
      mobile: u.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      date: u.registrationDate,
      level: lvl,
      earnings: lvl === 1 ? 15 : lvl === 2 ? 10 : 5,
    });

    const level1 = l1Users.map((u) => mapMember(u, 1));
    const level2 = l2Users.map((u) => mapMember(u, 2));
    const level3 = l3Users.map((u) => mapMember(u, 3));

    const totalEarnings =
      level1.length * 15 + level2.length * 10 + level3.length * 5;

    return { level1, level2, level3, totalEarnings };
  }

  // --- ACTIONS: AUTH ---
  public registerUser(params: {
    name: string;
    mobile: string;
    password?: string;
    referralCode?: string;
  }): { success: boolean; user?: UserProfile; message?: string } {
    const existing = this.getUserByMobile(params.mobile.trim());
    if (existing) {
      return { success: false, message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একাউন্ট খোলা আছে।' };
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const uid = `UID${randomSuffix}`;
    const newReferralCode = `BD${randomSuffix}`;

    let referredBy: string | undefined = undefined;
    if (params.referralCode && params.referralCode.trim()) {
      const refUser = this.getUserByReferralCode(params.referralCode);
      if (refUser) {
        referredBy = refUser.referralCode;
      }
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newUser: UserProfile = {
      uid,
      name: params.name.trim(),
      mobile: params.mobile.trim(),
      balance: this.state.settings.newUserWelcomeBonus || 0,
      referralCode: newReferralCode,
      referredBy,
      registrationDate: now,
      status: 'active',
      role: 'user',
    };

    this.state.users.push(newUser);

    // If referral exists and bonus enabled, credit referrer
    if (referredBy && this.state.settings.referralEnabled) {
      const referrer = this.getUserByReferralCode(referredBy);
      if (referrer) {
        const bonus = this.state.settings.referralSignupBonus || 15;
        referrer.balance += bonus;
        this.state.transactions.push({
          id: `TRX-${Date.now()}`,
          uid: referrer.uid,
          type: 'referral',
          title: 'নতুন রেফারেল বোনাস',
          amount: bonus,
          isCredit: true,
          date: now,
          referenceId: uid,
          status: 'Confirmed',
          description: `${newUser.name} যোগ দিয়েছেন (${newReferralCode})`,
        });
      }
    }

    this.logAdminAction('USER_REGISTER', 'System', uid, `নতুন ইউজার রেজিস্টার্ড: ${newUser.name} (${newUser.mobile})`);
    this.saveState();
    return { success: true, user: newUser };
  }

  // --- ACTIONS: DEPOSIT ---
  public submitDeposit(params: {
    uid: string;
    amount: number;
    paymentMethod: 'bKash' | 'Nagad';
    transactionId: string;
  }): { success: boolean; message: string; deposit?: DepositRequest } {
    const user = this.getUserByUid(params.uid);
    if (!user) return { success: false, message: 'ইউজার পাওয়া যায়নি।' };

    const paymentNumber =
      params.paymentMethod === 'bKash'
        ? this.state.settings.bKashNumber
        : this.state.settings.nagadNumber;

    const cleanTrx = params.transactionId.trim().toUpperCase();
    if (cleanTrx.length < 5) {
      return { success: false, message: 'সঠিক ট্রানজেকশন আইডি প্রদান করুন।' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newDep: DepositRequest = {
      id: `DEP-${Date.now().toString().slice(-6)}`,
      uid: user.uid,
      userName: user.name,
      userMobile: user.mobile,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      paymentNumber,
      transactionId: cleanTrx,
      date: now,
      status: 'Pending',
    };

    this.state.deposits.unshift(newDep);

    this.logAdminAction(
      'DEPOSIT_SUBMIT',
      user.name,
      newDep.id,
      `${params.amount} ৳ (${params.paymentMethod}) জমা অনুরোধ জমা পড়েছে। TrxID: ${cleanTrx}`,
    );

    this.saveState();
    return { success: true, message: 'ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে!', deposit: newDep };
  }

  // --- ADMIN ACTIONS: DEPOSIT CONFIRM / REJECT ---
  public confirmDeposit(depositId: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const dep = this.state.deposits.find((d) => d.id === depositId);
    if (!dep) return { success: false, message: 'ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি।' };

    // Strict security rule: Never double-confirm
    if (dep.status !== 'Pending') {
      return { success: false, message: `এই ডিপোজিট ইতিমধ্যে ${dep.status} করা হয়েছে!` };
    }

    const user = this.getUserByUid(dep.uid);
    if (!user) return { success: false, message: 'ইউজার অ্যাকাউন্ট পাওয়া যায়নি।' };

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Check if this is the user's first confirmed deposit
    const priorConfirmed = this.state.deposits.filter(
      (d) => d.uid === user.uid && d.status === 'Confirmed' && d.id !== dep.id,
    );
    const isFirstDeposit = priorConfirmed.length === 0;

    // 50% bonus on 1st deposit >= 100 Tk
    let bonusAmount = 0;
    if (isFirstDeposit && dep.amount >= 100) {
      bonusAmount = Math.floor(dep.amount * 0.5);
    }

    // Atomically update deposit status and user balance
    dep.status = 'Confirmed';
    dep.confirmedAt = now;
    dep.bonusAmount = bonusAmount;
    user.balance += dep.amount + bonusAmount;

    // Create immutable transaction ledger for deposit
    this.state.transactions.unshift({
      id: `TRX-${Date.now()}`,
      uid: user.uid,
      type: 'deposit',
      title: `${dep.paymentMethod} ডিপোজিট নিশ্চিত`,
      amount: dep.amount,
      isCredit: true,
      date: now,
      referenceId: dep.id,
      status: 'Confirmed',
      description: `ট্রানজেকশন আইডি: ${dep.transactionId}`,
    });

    // If first deposit bonus applied, add separate ledger record
    if (bonusAmount > 0) {
      this.state.transactions.unshift({
        id: `TRX-${Date.now() + 1}`,
        uid: user.uid,
        type: 'system',
        title: '🎁 ১ম ডিপোজিট ৫০% বোনাস',
        amount: bonusAmount,
        isCredit: true,
        date: now,
        referenceId: dep.id,
        status: 'Confirmed',
        description: `প্রথমবার ১০০ ৳ বা বেশি ডিপোজিট করায় ৫০% মেগা বোনাস (+${bonusAmount} ৳)`,
      });
    }

    this.logAdminAction(
      'DEPOSIT_CONFIRM',
      adminName,
      dep.id,
      `${user.name}-এর ${dep.amount} ৳ ডিপোজিট অনুমোদিত${bonusAmount > 0 ? ` (+${bonusAmount} ৳ ১ম ডিপোজিট ৫০% বোনাসসহ)` : ''} ও ব্যালেন্সে যুক্ত হয়েছে।`,
    );

    this.saveState();
    return { success: true, message: 'ডিপোজিট নিশ্চিত ও ব্যালেন্স আপডেট হয়েছে।' };
  }

  public rejectDeposit(depositId: string, adminNote: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const dep = this.state.deposits.find((d) => d.id === depositId);
    if (!dep) return { success: false, message: 'ডিপোজিট পাওয়া যায়নি।' };
    if (dep.status !== 'Pending') {
      return { success: false, message: `এই ডিপোজিট ইতিমধ্যে ${dep.status} রয়েছে।` };
    }

    dep.status = 'Rejected';
    dep.adminNote = adminNote || 'তথ্য অসম্পূর্ণ বা ভুল ট্রানজেকশন আইডি';

    this.logAdminAction(
      'DEPOSIT_REJECT',
      adminName,
      dep.id,
      `ডিপোজিট প্রত্যাখ্যাত: ${dep.amount} ৳ (${dep.adminNote})`,
    );

    this.saveState();
    return { success: true, message: 'ডিপোজিট বাতিল করা হয়েছে।' };
  }

  // --- ACTIONS: WITHDRAW ---
  public submitWithdrawal(params: {
    uid: string;
    amount: number;
    method: 'bKash' | 'Nagad' | 'Bank';
    accountNumber: string;
    accountHolderName: string;
    bankName?: string;
    branchName?: string;
  }): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
    const user = this.getUserByUid(params.uid);
    if (!user) return { success: false, message: 'ইউজার পাওয়া যায়নি।' };

    if (params.amount < this.state.settings.minWithdraw) {
      return { success: false, message: `সর্বনিম্ন উইথড্র পরিমাণ ${this.state.settings.minWithdraw} ৳।` };
    }

    if (user.balance < params.amount) {
      return { success: false, message: 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Atomically deduct balance and hold as Pending
    user.balance -= params.amount;

    const newWithdrawal: WithdrawalRequest = {
      id: `WTH-${Date.now().toString().slice(-6)}`,
      uid: user.uid,
      userName: user.name,
      userMobile: user.mobile,
      amount: params.amount,
      method: params.method,
      accountNumber: params.accountNumber,
      accountHolderName: params.accountHolderName,
      bankName: params.bankName,
      branchName: params.branchName,
      date: now,
      status: 'Pending',
    };

    this.state.withdrawals.unshift(newWithdrawal);

    this.state.transactions.unshift({
      id: `TRX-${Date.now()}`,
      uid: user.uid,
      type: 'withdraw',
      title: `${params.method} উইথড্র আবেদন`,
      amount: params.amount,
      isCredit: false,
      date: now,
      referenceId: newWithdrawal.id,
      status: 'Pending',
      description: `${params.accountNumber} (${params.accountHolderName})`,
    });

    this.logAdminAction(
      'WITHDRAW_SUBMIT',
      user.name,
      newWithdrawal.id,
      `${params.amount} ৳ উইথড্র রিকোয়েস্ট (${params.method} - ${params.accountNumber})`,
    );

    this.saveState();
    return { success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে!', withdrawal: newWithdrawal };
  }

  public updateWithdrawalStatus(
    id: string,
    status: 'Approved' | 'Rejected' | 'Completed',
    adminNote: string = '',
    adminName: string = 'Admin',
  ): { success: boolean; message: string } {
    const w = this.state.withdrawals.find((item) => item.id === id);
    if (!w) return { success: false, message: 'উইথড্র রিকোয়েস্ট পাওয়া যায়নি।' };

    const user = this.getUserByUid(w.uid);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // If rejecting a pending or approved withdrawal, refund the user balance
    if (status === 'Rejected' && w.status !== 'Rejected' && w.status !== 'Completed') {
      if (user) {
        user.balance += w.amount;
        this.state.transactions.unshift({
          id: `TRX-${Date.now()}`,
          uid: user.uid,
          type: 'system',
          title: 'উইথড্র রিফান্ড',
          amount: w.amount,
          isCredit: true,
          date: now,
          referenceId: w.id,
          status: 'Confirmed',
          description: `উইথড্র বাতিল হওয়ায় ${w.amount} ৳ ফেরত দেয়া হয়েছে।`,
        });
      }
    }

    w.status = status;
    w.adminNote = adminNote;
    w.processedAt = now;

    this.logAdminAction(
      'WITHDRAW_STATUS_UPDATE',
      adminName,
      w.id,
      `উইথড্র ${w.id} স্ট্যাটাস পরিবর্তিত: ${status}`,
    );

    this.saveState();
    return { success: true, message: `উইথড্র রিকোয়েস্ট সফলভাবে ${status} করা হয়েছে।` };
  }

  // --- ACTIONS: BANK CARDS ---
  public saveBankAccount(bank: Omit<BankAccount, 'id'>): { success: boolean; account: BankAccount } {
    const newBank: BankAccount = {
      ...bank,
      id: `BNK-${Date.now()}`,
    };
    this.state.bankAccounts.push(newBank);
    this.saveState();
    return { success: true, account: newBank };
  }

  public updateBankAccount(id: string, updates: Partial<BankAccount>): { success: boolean } {
    const index = this.state.bankAccounts.findIndex((b) => b.id === id);
    if (index !== -1) {
      this.state.bankAccounts[index] = { ...this.state.bankAccounts[index], ...updates };
      this.saveState();
      return { success: true };
    }
    return { success: false };
  }

  public deleteBankAccount(id: string): { success: boolean } {
    this.state.bankAccounts = this.state.bankAccounts.filter((b) => b.id !== id);
    this.saveState();
    return { success: true };
  }

  // --- ACTIONS: SUPPORT HELPLINE ---
  public sendSupportMessage(uid: string, message: string): { success: boolean; message: SupportChatMessage } {
    const user = this.getUserByUid(uid);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const userMsg: SupportChatMessage = {
      id: `SPT-${Date.now()}`,
      uid,
      userName: user ? user.name : 'Unknown User',
      userMobile: user ? user.mobile : '',
      sender: 'user',
      message: message.trim(),
      date: now,
      status: 'Pending',
    };

    this.state.supportMessages.push(userMsg);

    // Prompt requirement: "User Message পাঠালে একটি automatic acknowledgement দেখাবে: 'আপনার মেসেজ গ্রহণ করা হয়েছে। Admin review করে আপনাকে জানাবে।' AI কখনো Admin-এর আসল Reply হিসেবে নিজেকে উপস্থাপন করবে না।"
    const autoAck: SupportChatMessage = {
      id: `SPT-ACK-${Date.now() + 1}`,
      uid,
      userName: 'BD TAKA হেল্পডেস্ক',
      userMobile: '',
      sender: 'system',
      message: 'আপনার মেসেজ গ্রহণ করা হয়েছে। Admin review করে আপনাকে জানাবে।',
      date: new Date(Date.now() + 500).toISOString().replace('T', ' ').substring(0, 19),
      status: 'Pending',
    };

    this.state.supportMessages.push(autoAck);

    this.saveState();
    return { success: true, message: userMsg };
  }

  public replySupportMessage(chatId: string, replyText: string, adminName: string = 'Admin'): { success: boolean } {
    const original = this.state.supportMessages.find((m) => m.id === chatId);
    if (!original) return { success: false };

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    original.status = 'Answered';

    const adminMsg: SupportChatMessage = {
      id: `SPT-${Date.now()}`,
      uid: original.uid,
      userName: `${adminName} (সহায়তা টিম)`,
      userMobile: '',
      sender: 'admin',
      message: replyText.trim(),
      date: now,
      status: 'Answered',
    };

    this.state.supportMessages.push(adminMsg);
    this.logAdminAction('SUPPORT_REPLY', adminName, chatId, `সাপোর্ট রিপ্লাই পাঠানো হয়েছে: ${replyText}`);
    this.saveState();
    return { success: true };
  }

  public resolveSupportMessage(chatId: string): { success: boolean } {
    const original = this.state.supportMessages.find((m) => m.id === chatId);
    if (original) {
      original.status = 'Resolved';
      this.saveState();
      return { success: true };
    }
    return { success: false };
  }

  // --- ACTIONS: ADMIN SETTINGS & MANAGEMENT ---
  public updateSettings(newSettings: Partial<AppSettings>, adminName: string = 'Admin'): void {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.logAdminAction('UPDATE_SETTINGS', adminName, undefined, 'অ্যাপ্লিকেশন সেটিংস আপডেট করা হয়েছে।');
    this.saveState();
  }

  public setUserStatus(uid: string, status: 'active' | 'disabled', adminName: string = 'Admin'): void {
    const user = this.getUserByUid(uid);
    if (user) {
      user.status = status;
      this.logAdminAction('USER_STATUS', adminName, uid, `${user.name} অ্যাকাউন্ট অবস্থা: ${status}`);
      this.saveState();
    }
  }

  public adjustUserBalance(
    uid: string,
    amountDelta: number,
    reason: string,
    adminName: string = 'Admin',
  ): { success: boolean; message: string } {
    const user = this.getUserByUid(uid);
    if (!user) return { success: false, message: 'ইউজার পাওয়া যায়নি' };

    user.balance += amountDelta;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.state.transactions.unshift({
      id: `TRX-${Date.now()}`,
      uid: user.uid,
      type: 'system',
      title: amountDelta >= 0 ? 'অ্যাডমিন ব্যালেন্স যোগ' : 'অ্যাডমিন ব্যালেন্স কর্তন',
      amount: Math.abs(amountDelta),
      isCredit: amountDelta >= 0,
      date: now,
      referenceId: `ADM-ADJ-${Date.now()}`,
      status: 'Confirmed',
      description: reason || 'অ্যাডমিন দ্বারা সমন্বয়',
    });

    this.logAdminAction(
      'BALANCE_ADJUST',
      adminName,
      uid,
      `${user.name}-এর ব্যালেন্সে ${amountDelta >= 0 ? '+' : ''}${amountDelta} ৳ (${reason})`,
    );

    this.saveState();
    return { success: true, message: 'ব্যালেন্স সফলভাবে সমন্বয় করা হয়েছে।' };
  }

  // Deposit Amounts CRUD
  public addDepositAmount(amount: number, label: string): void {
    const newOption: DepositAmountOption = {
      id: `amt-${Date.now()}`,
      amount,
      label,
      enabled: true,
      order: this.state.depositAmounts.length + 1,
    };
    this.state.depositAmounts.push(newOption);
    this.saveState();
  }

  public updateDepositAmount(id: string, updates: Partial<DepositAmountOption>): void {
    const item = this.state.depositAmounts.find((a) => a.id === id);
    if (item) {
      Object.assign(item, updates);
      this.saveState();
    }
  }

  public deleteDepositAmount(id: string): void {
    this.state.depositAmounts = this.state.depositAmounts.filter((a) => a.id !== id);
    this.saveState();
  }

  // Games CRUD
  public addGame(game: Omit<GameItem, 'id'>): void {
    const newGame: GameItem = {
      ...game,
      id: `game-${Date.now()}`,
    };
    this.state.games.push(newGame);
    this.saveState();
  }

  public updateGame(id: string, updates: Partial<GameItem>): void {
    const game = this.state.games.find((g) => g.id === id);
    if (game) {
      Object.assign(game, updates);
      this.saveState();
    }
  }

  public deleteGame(id: string): void {
    this.state.games = this.state.games.filter((g) => g.id !== id);
    this.saveState();
  }

  // Admin Logs
  private logAdminAction(action: string, adminUser: string, targetId: string | undefined, details: string): void {
    const log: AdminLog = {
      id: `LOG-${Date.now()}`,
      action,
      adminUser,
      targetId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.state.adminLogs.unshift(log);
    if (this.state.adminLogs.length > 300) {
      this.state.adminLogs = this.state.adminLogs.slice(0, 300);
    }
  }

  // Permanent User Game Bets CRUD ("প্রত্যেকটা একাউন্টে গেমের হিস্টরি থাকবে সবসময়ের জন্য")
  public getUserGameBets(uid: string, gameCode?: string): UserGameBetRecord[] {
    const bets = (this.state.gameBets || []).filter((b) => b.uid === uid);
    if (gameCode) {
      return bets.filter((b) => b.gameCode === gameCode);
    }
    return bets;
  }

  public addUserGameBet(bet: Omit<UserGameBetRecord, 'id'>): UserGameBetRecord {
    const newBet: UserGameBetRecord = {
      ...bet,
      id: `BET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    if (!this.state.gameBets) {
      this.state.gameBets = [];
    }
    this.state.gameBets.unshift(newBet);
    if (this.state.gameBets.length > 2000) {
      this.state.gameBets = this.state.gameBets.slice(0, 2000);
    }
    this.saveState();
    return newBet;
  }

  public updateUserGameBet(id: string, updates: Partial<UserGameBetRecord>): void {
    if (!this.state.gameBets) return;
    const bet = this.state.gameBets.find((b) => b.id === id);
    if (bet) {
      Object.assign(bet, updates);
      this.saveState();
    }
  }

  public getAllGameBets(): UserGameBetRecord[] {
    return this.state.gameBets || [];
  }
}

export const db = new DatabaseService();
