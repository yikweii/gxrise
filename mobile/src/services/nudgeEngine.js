import { NUDGE_LIBRARY, NUDGE_PRIORITY_ORDER } from '../constants/nudgeLibrary';

const MAX_NUDGES_PER_DAY = 2;

export function selectNudge(userState, nudgesToday = 0, lang = 'bm') {
  if (nudgesToday >= MAX_NUDGES_PER_DAY) return null;

  const {
    income = 1050,
    bnpl = [],
    subscriptions = [],
    transactions = [],
    streak = 0,
    monthly_savings = 0,
    balance = 0,
  } = userState;

  for (const nudgeId of NUDGE_PRIORITY_ORDER) {
    switch (nudgeId) {
      case 'ptptn_disbursed': {
        const today = new Date('2026-05-08');
        const ptptnCredit = transactions.find(
          (t) =>
            t.type === 'credit' &&
            t.merchant.toLowerCase().includes('ptptn') &&
            Math.abs(new Date(t.date) - today) < 86400000 * 3
        );
        if (ptptnCredit) return formatNudge(NUDGE_LIBRARY.ptptn_disbursed, userState, lang);
        break;
      }

      case 'salary_credit': {
        const today = new Date('2026-05-08');
        const salaryCredit = transactions.find(
          (t) =>
            t.type === 'credit' &&
            (t.merchant.toLowerCase().includes('gaji') ||
              t.merchant.toLowerCase().includes('salary') ||
              t.merchant.toLowerCase().includes('income')) &&
            Math.abs(new Date(t.date) - today) < 86400000 * 3
        );
        if (salaryCredit) return formatNudge(NUDGE_LIBRARY.salary_credit, userState, lang);
        break;
      }

      case 'bnpl_due': {
        const urgentBNPL = bnpl.find((b) => {
          const dueDate = new Date(b.nextPayment);
          const now = new Date('2026-05-08');
          const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          return daysUntilDue <= 7 && daysUntilDue >= 0;
        });
        if (urgentBNPL) return formatNudge(NUDGE_LIBRARY.bnpl_due, { ...userState, urgentBNPL }, lang);
        break;
      }

      case 'subscription_idle': {
        const idleSub = subscriptions.find((s) => s.riskLevel === 'HIGH');
        if (idleSub)
          return formatNudge(NUDGE_LIBRARY.subscription_idle, { ...userState, idleSub }, lang);
        break;
      }

      case 'food_overspend': {
        const foodTxns = transactions.filter(
          (t) => t.type === 'debit' && t.category === 'Food & Drink'
        );
        const foodWeekTotal = foodTxns
          .filter((t) => {
            const txDate = new Date(t.date);
            const weekAgo = new Date('2026-05-08');
            weekAgo.setDate(weekAgo.getDate() - 7);
            return txDate >= weekAgo;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const foodPercent = Math.round((foodWeekTotal / income) * 100);
        if (foodPercent > 15)
          return formatNudge(NUDGE_LIBRARY.food_overspend, {
            ...userState,
            food_amount: foodWeekTotal,
            food_percent: foodPercent,
          }, lang);
        break;
      }

      case 'streak_day6': {
        if (streak === 6) return formatNudge(NUDGE_LIBRARY.streak_day6, userState, lang);
        break;
      }

      case 'weekend_pattern': {
        const dayOfWeek = new Date('2026-05-08').getDay();
        if (dayOfWeek === 1) return formatNudge(NUDGE_LIBRARY.weekend_pattern, userState, lang);
        break;
      }

      default:
        break;
    }
  }

  return getDemoNudge(lang);
}

export function formatNudge(nudge, userState, lang = 'bm') {
  const {
    income = 1050,
    balance = 465,
    food_amount = 67,
    food_percent = 21,
    urgentBNPL = null,
    idleSub = null,
    monthly_savings = 45,
    streak = 6,
  } = userState;

  const title = lang === 'en' && nudge.title_en ? nudge.title_en : nudge.title;
  const actions = lang === 'en' && nudge.actions_en ? nudge.actions_en : nudge.actions;

  const warningBM = balance < (urgentBNPL?.outstanding || 89)
    ? '⚠️ Baki kamu mungkin tidak mencukupi!'
    : '✅ Baki mencukupi.';
  const warningEN = balance < (urgentBNPL?.outstanding || 89)
    ? '⚠️ Your balance may be insufficient!'
    : '✅ Balance is sufficient.';

  let body = lang === 'en' && nudge.body_en ? nudge.body_en : nudge.body;

  const replacements = {
    '{{income}}': `${income.toFixed(2)}`,
    '{{food_amount}}': `${Math.round(food_amount)}`,
    '{{percent}}': `${food_percent}`,
    '{{potential_save}}': `${Math.round(income * 0.05)}`,
    '{{amount}}': urgentBNPL ? `${urgentBNPL.outstanding.toFixed(2)}` : '89.00',
    '{{provider}}': urgentBNPL ? urgentBNPL.provider : 'Atome',
    '{{due_date}}': urgentBNPL ? urgentBNPL.dueDate : '15 Mei 2026',
    '{{balance}}': `${balance.toFixed(2)}`,
    '{{warning}}': lang === 'en' ? warningEN : warningBM,
    '{{save_amount}}': `${Math.round(income * 0.1)}`,
    '{{bnpl_amount}}': '89.00',
    '{{save_suggestion}}': `${Math.round(income * 0.2)}`,
    '{{save_percent}}': '20',
    '{{service}}': idleSub ? idleSub.service : 'Netflix',
    '{{days}}': idleSub ? `${idleSub.daysIdle}` : '47',
    '{{annual}}': idleSub ? `${(idleSub.amount * 12).toFixed(2)}` : '204.00',
    '{{saved_this_week}}': `${monthly_savings}`,
    '{{weekend_avg}}': '85',
    '{{weekday_avg}}': '52',
  };

  for (const [key, val] of Object.entries(replacements)) {
    body = body.split(key).join(val);
  }

  return { ...nudge, title, body, actions };
}

export function getDemoNudge(lang = 'bm') {
  return formatNudge(NUDGE_LIBRARY.food_overspend, {
    income: 1050,
    food_amount: 67,
    food_percent: 21,
    balance: 465,
    monthly_savings: 45,
    streak: 6,
  }, lang);
}

export function getNudgeHistory(lang = 'bm') {
  return [
    {
      ...formatNudge(NUDGE_LIBRARY.bnpl_due, {
        urgentBNPL: {
          provider: 'Atome',
          outstanding: 89,
          dueDate: '15 Mei 2026',
          nextPayment: '2026-05-15',
        },
        balance: 465,
      }, lang),
      date: '2026-05-07',
      actionTaken: 'view_bnpl',
    },
    {
      ...formatNudge(NUDGE_LIBRARY.streak_day6, {
        monthly_savings: 45,
        streak: 6,
      }, lang),
      date: '2026-05-06',
      actionTaken: 'dismiss',
    },
    {
      ...formatNudge(NUDGE_LIBRARY.subscription_idle, {
        idleSub: {
          service: 'Netflix',
          daysIdle: 47,
          amount: 17,
        },
      }, lang),
      date: '2026-05-05',
      actionTaken: 'review_subs',
    },
    {
      ...formatNudge(NUDGE_LIBRARY.food_overspend, {
        income: 1050,
        food_amount: 72,
        food_percent: 23,
        balance: 420,
        monthly_savings: 30,
      }, lang),
      date: '2026-05-04',
      actionTaken: 'dismiss',
    },
    {
      ...formatNudge(NUDGE_LIBRARY.ptptn_disbursed, {
        income: 650,
        balance: 650,
        monthly_savings: 65,
      }, lang),
      date: '2026-05-01',
      actionTaken: 'allocate_now',
    },
  ];
}
