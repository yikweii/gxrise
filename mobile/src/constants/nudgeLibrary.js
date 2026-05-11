export const NUDGE_LIBRARY = {
  food_overspend: {
    id: 'food_overspend',
    title: '🍔 Perbelanjaan Makanan Tinggi',
    body: 'Kamu dah belanja RM{{food_amount}} untuk makanan minggu ini — {{percent}}% daripada pendapatan kamu. Cuba kurangkan sedikit, boleh jimat RM{{potential_save}} sebulan!',
    title_en: '🍔 High Food Spending',
    body_en: "You've spent RM{{food_amount}} on food this week — {{percent}}% of your income. Cutting back a little could save RM{{potential_save}} a month!",
    actions: [
      { id: 'dismiss', label: 'Faham, terima kasih', primary: true },
    ],
    actions_en: [
      { id: 'dismiss', label: 'Got it, thanks', primary: true },
    ],
    priority: 5,
    category: 'spending',
  },
  bnpl_due: {
    id: 'bnpl_due',
    title: '💳 Bayaran BNPL Akan Tiba',
    body: 'Bayaran {{provider}} sebanyak RM{{amount}} perlu dijelaskan pada {{due_date}}. Baki akaun kamu RM{{balance}}. {{warning}}',
    title_en: '💳 BNPL Payment Coming Up',
    body_en: '{{provider}} payment of RM{{amount}} is due on {{due_date}}. Your account balance is RM{{balance}}. {{warning}}',
    actions: [
      { id: 'view_bnpl', label: 'Lihat Semua BNPL', primary: true },
      { id: 'dismiss', label: 'Sudah tahu', primary: false },
    ],
    actions_en: [
      { id: 'view_bnpl', label: 'View All BNPL', primary: true },
      { id: 'dismiss', label: 'Already knew', primary: false },
    ],
    priority: 3,
    category: 'debt',
  },
  ptptn_disbursed: {
    id: 'ptptn_disbursed',
    title: '🎓 Bantuan PTPTN Diterima!',
    body: 'Tahniah! RM{{amount}} PTPTN dah masuk. Cadangan: simpan RM{{save_amount}} ke SSPN dan peruntukkan RM{{bnpl_amount}} untuk BNPL. Jangan lupa kos hidup bulan ini!',
    title_en: '🎓 PTPTN Disbursement Received!',
    body_en: "Congrats! RM{{amount}} PTPTN has been credited. Suggested: save RM{{save_amount}} to SSPN and allocate RM{{bnpl_amount}} for BNPL. Don't forget this month's living expenses!",
    actions: [
      { id: 'allocate_now', label: 'Agihkan Sekarang', primary: true },
      { id: 'view_plan', label: 'Lihat Pelan', primary: false },
    ],
    actions_en: [
      { id: 'allocate_now', label: 'Allocate Now', primary: true },
      { id: 'view_plan', label: 'View Plan', primary: false },
    ],
    priority: 1,
    category: 'income',
  },
  salary_credit: {
    id: 'salary_credit',
    title: '💰 Gaji Dah Masuk!',
    body: 'RM{{amount}} dah kredit ke akaun kamu. Masa yang baik untuk rancang bajet bulan ini. Cadangan simpanan: RM{{save_suggestion}} ({{save_percent}}% pendapatan).',
    title_en: '💰 Salary Credited!',
    body_en: "RM{{amount}} has been credited to your account. Great time to plan this month's budget. Savings suggestion: RM{{save_suggestion}} ({{save_percent}}% of income).",
    actions: [
      { id: 'plan_budget', label: 'Rancang Bajet', primary: true },
      { id: 'save_now', label: 'Simpan Terus', primary: false },
    ],
    actions_en: [
      { id: 'plan_budget', label: 'Plan Budget', primary: true },
      { id: 'save_now', label: 'Save Now', primary: false },
    ],
    priority: 2,
    category: 'income',
  },
  streak_day6: {
    id: 'streak_day6',
    title: '🔥 Streak 6 Hari — Hampir Seminggu!',
    body: 'Kamu dah rekod perbelanjaan 6 hari berturut-turut. Jom lengkapkan seminggu penuh esok! Kamu dah jimat RM{{saved_this_week}} minggu ini berbanding minggu lepas.',
    title_en: '🔥 6-Day Streak — Almost a Week!',
    body_en: "You've logged spending 6 days in a row. Complete a full week tomorrow! You've saved RM{{saved_this_week}} this week compared to last week.",
    actions: [
      { id: 'view_streak', label: 'Lihat Streak', primary: true },
      { id: 'dismiss', label: 'Teruskan!', primary: false },
    ],
    actions_en: [
      { id: 'view_streak', label: 'View Streak', primary: true },
      { id: 'dismiss', label: 'Keep going!', primary: false },
    ],
    priority: 6,
    category: 'engagement',
  },
  subscription_idle: {
    id: 'subscription_idle',
    title: '📱 Langganan Tidak Digunakan',
    body: '{{service}} dah {{days}} hari tidak digunakan tapi kamu masih bayar RM{{amount}}/bulan. Kalau cancel, kamu boleh jimat RM{{annual}} setahun!',
    title_en: '📱 Unused Subscription',
    body_en: "{{service}} hasn't been used for {{days}} days but you're still paying RM{{amount}}/month. Cancelling could save you RM{{annual}} a year!",
    actions: [
      { id: 'review_subs', label: 'Semak Langganan', primary: true },
      { id: 'keep', label: 'Simpan dulu', primary: false },
    ],
    actions_en: [
      { id: 'review_subs', label: 'Check Subscriptions', primary: true },
      { id: 'keep', label: 'Keep for now', primary: false },
    ],
    priority: 4,
    category: 'subscription',
  },
  weekend_pattern: {
    id: 'weekend_pattern',
    title: '📊 Corak Perbelanjaan Hujung Minggu',
    body: 'Kamu cenderung belanja {{percent}}% lebih banyak pada hujung minggu — purata RM{{weekend_avg}} berbanding RM{{weekday_avg}} pada hari biasa. Tetapkan had hujung minggu?',
    title_en: '📊 Weekend Spending Pattern',
    body_en: 'You tend to spend {{percent}}% more on weekends — averaging RM{{weekend_avg}} vs RM{{weekday_avg}} on weekdays. Set a weekend limit?',
    actions: [
      { id: 'set_weekend_limit', label: 'Tetapkan Had', primary: true },
      { id: 'dismiss', label: 'Nanti dulu', primary: false },
    ],
    actions_en: [
      { id: 'set_weekend_limit', label: 'Set Limit', primary: true },
      { id: 'dismiss', label: 'Maybe later', primary: false },
    ],
    priority: 7,
    category: 'pattern',
  },
};

export const NUDGE_PRIORITY_ORDER = [
  'ptptn_disbursed',
  'salary_credit',
  'bnpl_due',
  'subscription_idle',
  'food_overspend',
  'streak_day6',
  'weekend_pattern',
];
