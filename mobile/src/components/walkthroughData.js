// ── GX Rise First-Time Walkthrough Content ──────────────────────────────────
// 8 features × 3 layers each
// Tone: smart friend, Malaysian context, bold + direct, never preachy

export const FEATURES = [
  // ─────────────────────────────────────────────────────────────────────────
  // Feature 1 — Financial Health Score
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Financial Health Score',
    emoji: '❤️',
    gradient: ['#9B1C1C', '#E63946'],
    screen: { isTab: true, tabName: 'HealthScore' },

    layer1: {
      headline: 'Your Money Has a Score',
      subheadline: 'One number that tells you exactly how healthy your wallet is — right now.',
      body: 'GX Rise scores your spending, savings, and debt from 0 to 100. Score drops when you GrabFood too much. Score climbs when you save. No guessing, no generic tips — just your real numbers.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'Overall Health Score',
        anchor: 'top',
        text: 'This big number is your score out of 100. Azri started at 45. After one semester with GX Rise, he hit 68. A red arrow means it dropped — tap it to see which transaction caused it.',
      },
      {
        sectionName: 'Four Dimensions',
        anchor: 'middle',
        text: 'Spending Control, Savings Rate, Debt Risk, Emergency Buffer. Each one is scored separately — so you know exactly which one needs fixing, not just that something is wrong.',
      },
      {
        sectionName: 'Week-on-Week Delta',
        anchor: 'middle',
        text: 'The change badge shows if you\'re trending up or down from last week. GX Rise tells you the exact spend category that moved your score — no detective work needed.',
      },
      {
        sectionName: 'Tap to Drill Down',
        anchor: 'bottom',
        text: 'Tap any sub-score bar to see which actual transactions are dragging it down. GrabFood overspend? BNPL too high? This is where you find out.',
      },
    ],

    layer3: {
      completionMessage: 'Your score is live — you know what drives it and how to push it higher.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Feature 2 — Smart Nudge Engine
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 2,
    name: 'Smart Nudge Engine',
    emoji: '🔔',
    gradient: ['#3730A3', '#7C5CF5'],
    screen: { isTab: false, screen: 'Nudge' },

    layer1: {
      headline: 'Nudges That Actually Help',
      subheadline: 'GX Rise pings you only when action saves you real ringgit.',
      body: 'Most apps send generic reminders. GX Rise reads your actual spending patterns and fires a nudge only when it matters — like when your GrabFood spend is 80% over budget, or your Atome payment is in 3 days. Maximum 2 nudges a day. That\'s it.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'Active Nudge Card',
        anchor: 'top',
        text: 'This is the nudge GX Rise is showing you right now. It\'s triggered by something real — your actual spend data, not a generic schedule.',
      },
      {
        sectionName: 'Why This Nudge Fired',
        anchor: 'middle',
        text: 'See the trigger reason below the nudge title. "GrabFood 7 days = RM67, 42% over budget" — that\'s the exact data that triggered this ping.',
      },
      {
        sectionName: 'One-Tap Actions',
        anchor: 'middle',
        text: 'Every nudge has an action — Save RM15, Ketepikan RM50, or Nanti lah. One tap. Done. No forms, no navigation, no friction.',
      },
      {
        sectionName: 'Daily Nudge Count',
        anchor: 'bottom',
        text: 'GX Rise caps at 2 nudges per day — on purpose. More than that and you\'d ignore all of them. Quality beats quantity here.',
      },
    ],

    layer3: {
      completionMessage: 'Smart nudges are live — they fire when you need them, not when they feel like it.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Feature 3 — Auto-Save Triggers
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 3,
    name: 'Auto-Save Triggers',
    emoji: '💰',
    gradient: ['#14532D', '#2DC653'],
    screen: { isTab: true, tabName: 'Goals' },

    layer1: {
      headline: 'Savings on Full Autopilot',
      subheadline: 'Set a goal. GX Rise does the saving part for you.',
      body: 'Saving fails because it needs willpower. GX Rise removes willpower from the equation. PTPTN lands? 20% auto-locked before you can touch it. Gaji masuk? 15% swept into your savings pocket. You\'re saving even on days you forget to think about it.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'Your Savings Goals',
        anchor: 'top',
        text: 'Each card is a savings goal you\'ve set — trip, laptop, emergency fund. Your money is split into pockets, not pooled where you\'ll spend it.',
      },
      {
        sectionName: 'Flexible vs Bonus Pocket',
        anchor: 'middle',
        text: 'Flexible means you can withdraw anytime. Bonus Pocket locks your money for 3–6 months and earns up to 3.55% p.a. — like a fixed deposit, but inside GX Rise.',
      },
      {
        sectionName: 'Progress to Target',
        anchor: 'middle',
        text: 'The progress bar shows how far you are to your goal. Tap the bar to see exactly which auto-save trigger contributed how much.',
      },
      {
        sectionName: 'Fund In & Withdraw',
        anchor: 'bottom',
        text: 'Fund In adds money anytime — manual or triggered. Withdraw is always available for Flexible pockets. Bonus pockets show early withdrawal warnings.',
      },
    ],

    layer3: {
      completionMessage: 'Your savings run on autopilot now — PTPTN and salary triggers are set.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Feature 4 — PTPTN Repayment Tracker
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 4,
    name: 'PTPTN Repayment Tracker',
    emoji: '🎓',
    gradient: ['#92400E', '#F59E0B'],
    screen: { isTab: false, screen: 'PTPTN' },

    layer1: {
      headline: 'Never Miss a PTPTN Payment',
      subheadline: 'Malaysia\'s first in-app PTPTN tracker — balance, countdown, and smart repayment tips.',
      body: '400,000 Malaysians haven\'t made a single PTPTN payment. Don\'t be that stat. GX Rise shows your outstanding balance, countdown to next payment, and tells you exactly how much extra you need to pay to finish 8 months early and save RM1,240 in interest.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'Outstanding Balance',
        anchor: 'top',
        text: 'The exact amount you still owe PTPTN. Watching this number go down every month is genuinely satisfying — better than Duolingo streaks.',
      },
      {
        sectionName: 'Next Payment Countdown',
        anchor: 'top',
        text: 'Live countdown to your next payment date. The status badge turns amber at 7 days, red at 3 days. No more "eh, bila due ah?" moments.',
      },
      {
        sectionName: 'Repayment Progress',
        anchor: 'middle',
        text: 'The progress bar shows how much of your total loan you\'ve paid off. Every instalment moves that bar. 34% repaid right now — keep going.',
      },
      {
        sectionName: 'Smart Repayment Tip',
        anchor: 'bottom',
        text: 'This AI tip shows you what happens if you add just RM50/month extra. Finish faster, pay less interest. Tap "Increase Payment" to set it up in one tap.',
      },
    ],

    layer3: {
      completionMessage: 'Your PTPTN is tracked — you\'ll never miss a due date or pay unnecessary interest again.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Feature 5 — BNPL Debt Aggregation
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 5,
    name: 'BNPL Debt Aggregation',
    emoji: '💳',
    gradient: ['#1E3A5F', '#00B4D8'],
    screen: { isTab: false, screen: 'BNPL' },

    layer1: {
      headline: 'All Your BNPL, One View',
      subheadline: 'Atome, Split, Shopee PayLater — every due date and total in one place.',
      body: 'BNPL feels free until the payments stack up and hit all at once. GX Rise pulls every BNPL commitment into one dashboard. See your total debt, free cash remaining, and exactly when each payment hits — before it surprise you.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'Total BNPL Committed',
        anchor: 'top',
        text: 'This number is what you owe across ALL your BNPL apps this month. Most people have no idea what this number is — now you do.',
      },
      {
        sectionName: 'Individual BNPL Cards',
        anchor: 'middle',
        text: 'Each card shows provider, amount due, and how many days left. Red badge = 7 days or less. That\'s your warning to make sure the cash is ready.',
      },
      {
        sectionName: 'Free Cash After BNPL',
        anchor: 'middle',
        text: 'This is what you actually have to spend after all BNPL payments are settled. If it\'s in the red zone — GX Rise tells you to pause new BNPL until next month.',
      },
      {
        sectionName: 'Payment Calendar',
        anchor: 'bottom',
        text: 'Every upcoming BNPL payment plotted on a calendar. See if two providers clash on the same week — and plan your cash flow before the crunch hits.',
      },
    ],

    layer3: {
      completionMessage: 'Your BNPL is fully visible now — no more invisible debt pile-ups.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Feature 6 — Weekly AI Digest
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 6,
    name: 'Weekly AI Digest',
    emoji: '📊',
    gradient: ['#4C1D95', '#9C6FFF'],
    screen: { isTab: false, screen: 'WeeklyDigest' },

    layer1: {
      headline: 'Your Week, Decoded by AI',
      subheadline: 'Every week: a personalised summary of what happened to your money.',
      body: 'Every Sunday, Claude AI generates a completely personalised financial summary in Bahasa Malaysia — just for you. Not a template. Your actual week, your actual numbers, one specific thing to do next week. No generic advice that doesn\'t apply to you.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'AI-Generated Digest Card',
        anchor: 'top',
        text: 'This was written by Claude AI just for you — based on your actual transactions, health score, and streak. No two digests are the same.',
      },
      {
        sectionName: 'Top Spending Category',
        anchor: 'middle',
        text: 'The one category where you spent the most this week — with the exact amount. GrabFood at RM67 again? The digest sees it so you don\'t have to do the maths.',
      },
      {
        sectionName: 'Savings & Streak Summary',
        anchor: 'middle',
        text: 'How much you saved this week, and your consecutive saving streak. Streak breaks are mentioned — but kindly, not like a disappointed parent.',
      },
      {
        sectionName: 'One Actionable Tip',
        anchor: 'bottom',
        text: 'The last line is always one specific thing to try next week. "Cook once, save RM20 to PTPTN Pocket." Not "spend less." An actual action.',
      },
    ],

    layer3: {
      completionMessage: 'Your weekly AI coach is live — every Sunday, personalised, in BM.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Feature 7 — Pocket with Kawan + Auto Bill Split
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 7,
    name: 'Pocket with Kawan',
    emoji: '👥',
    gradient: ['#7C2D12', '#EA580C'],
    screen: { isTab: false, screen: 'PocketWithKawan' },

    layer1: {
      headline: 'Tabung Kawan, Officially',
      subheadline: 'Shared savings with friends — with group approval on every withdrawal.',
      body: 'You know the WhatsApp group where someone holds everyone\'s cash for a trip and it always gets awkward? This is that — but with GXBank behind it. Everyone sees every transaction. Nobody can withdraw without group approval. No drama.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'Shared Pocket Card',
        anchor: 'top',
        text: 'Each pocket has a name, goal amount, and deadline. Trip Langkawi 2026 needs RM2,000 by August — everyone in the pocket sees this same card.',
      },
      {
        sectionName: 'Member Contributions',
        anchor: 'middle',
        text: 'Each member\'s avatar and their total contribution. You can see who\'s contributing — and who hasn\'t yet. No awkward WhatsApp nudges needed.',
      },
      {
        sectionName: 'Progress Ring',
        anchor: 'middle',
        text: 'The ring fills as the group hits 25%, 50%, 75%, 100%. At each milestone, GX Rise celebrates with the whole group. When it\'s full — everyone gets notified.',
      },
      {
        sectionName: 'Bill Split + Deposit',
        anchor: 'bottom',
        text: 'Tap "Split Bill" at mamak — scan the receipt, GX Rise splits it equally and sends DuitNow requests to everyone. Nobody has to do the mental maths.',
      },
    ],

    layer3: {
      completionMessage: 'Your group pocket is live — every ringgit is visible, every withdrawal needs approval.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Feature 8 — Smart Subscription Tracker
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 8,
    name: 'Smart Subscription Tracker',
    emoji: '📱',
    gradient: ['#831843', '#F72585'],
    screen: { isTab: false, screen: 'Subscriptions' },

    layer1: {
      headline: 'Kill Zombie Subscriptions',
      subheadline: 'GX Rise finds the ones you forgot — and helps you cancel in 45 seconds.',
      body: 'The average student pays RM90/month in subscriptions and actively uses about half of them. GX Rise auto-detects Netflix, Spotify, Shopee, Apple Music — rates each one by idle days — and shows you step-by-step how to cancel the ones bleeding you. Then redirects that money to your savings goal.',
      primaryCTA: 'Show Me How',
      skipCTA: 'Skip Feature',
    },

    layer2: [
      {
        sectionName: 'Potential Savings Banner',
        anchor: 'top',
        text: 'The top banner shows how much you could save per month by cancelling unused subscriptions. RM34/month = RM408/year. That\'s a flight ticket.',
      },
      {
        sectionName: 'Risk-Scored Subscription List',
        anchor: 'middle',
        text: '🔴 Red = not used in 20+ days, high risk of waste. 🟡 Yellow = used occasionally. 🟢 Green = actively used. GX Rise auto-detects these — you don\'t have to do anything.',
      },
      {
        sectionName: 'Last Used Indicator',
        anchor: 'middle',
        text: '"Last used: 47 hari lalu" — that\'s the number that makes you say "wait, really?" Netflix RM17/month for something you haven\'t opened in 6 weeks.',
      },
      {
        sectionName: 'Cancel Guidance',
        anchor: 'bottom',
        text: 'Tap "Review" on any 🔴 subscription. GX Rise shows you 3 steps to cancel — and offers to redirect that monthly amount straight to your savings pocket.',
      },
    ],

    layer3: {
      completionMessage: 'Zombie subscriptions spotted — cancel one today and redirect it to your savings goal.',
    },
  },
];

// ── Final completion card (after all 8 features) ──────────────────────────────
export const FINAL_CARD = {
  headline: 'You\'re Ready to Rise 🚀',
  body: 'Your Financial Health Score is live, nudges are armed, and your savings are on autopilot. First move: check your Health Score and see what one thing needs fixing this week.',
  primaryCTA: 'Go to My Dashboard',
  secondaryCTA: 'Replay Walkthrough',
};
