import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency } from '../utils/formatters';
import { getRecentTransactions } from '../services/mockData';
import TransactionItem from '../components/TransactionItem';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '← Kembali',
    title: 'Transaksi',
    months: ['Mei 2026', 'Apr 2026', 'Mac 2026'],
    out: 'Keluar',
    in: 'Masuk',
    transactions: 'Transaksi',
    spendingByCategory: 'Perbelanjaan Mengikut Kategori',
    filterTabs: ['Semua', 'Makanan', 'Transport', 'Shopping', 'BNPL', 'Langganan'],
    searchPlaceholder: 'Cari peniaga...',
    noTransactions: 'Tiada transaksi ditemui',
  },
  en: {
    back: '← Back',
    title: 'Transactions',
    months: ['May 2026', 'Apr 2026', 'Mar 2026'],
    out: 'Out',
    in: 'In',
    transactions: 'Transactions',
    spendingByCategory: 'Spending by Category',
    filterTabs: ['All', 'Food', 'Transport', 'Shopping', 'BNPL', 'Subscriptions'],
    searchPlaceholder: 'Search merchant...',
    noTransactions: 'No transactions found',
  },
};

// Internal keys (BM) used for filter/month logic — do not change
const FILTER_KEYS = ['Semua', 'Makanan', 'Transport', 'Shopping', 'BNPL', 'Langganan'];
const CATEGORY_MAP = {
  'Semua': null,
  'Makanan': 'Food & Drink',
  'Transport': 'Transport',
  'Shopping': 'Shopping',
  'BNPL': 'BNPL',
  'Langganan': 'Subscription',
};

const MONTH_KEYS = ['Mei 2026', 'Apr 2026', 'Mac 2026'];
const MONTH_PREFIX = {
  'Mei 2026': '2026-05-',
  'Apr 2026': '2026-04-',
  'Mac 2026': '2026-03-',
};

export default function TransactionsScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];

  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Mei 2026');

  const allTransactions = getRecentTransactions(90);

  const filtered = useMemo(() => {
    const prefix = MONTH_PREFIX[selectedMonth];
    let result = allTransactions.filter((t) => prefix && t.date.startsWith(prefix));

    const category = CATEGORY_MAP[activeFilter];
    if (category) result = result.filter((t) => t.category === category);

    if (searchQuery.trim()) {
      const words = searchQuery.trim().toLowerCase().split(/\s+/);
      result = result.filter((t) =>
        words.every((word) => t.merchant.toLowerCase().includes(word))
      );
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [allTransactions, activeFilter, searchQuery, selectedMonth]);

  const totalDebit = filtered.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalCredit = filtered.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);

  const categorySpend = useMemo(() => {
    const debitOnly = filtered.filter((t) => t.type === 'debit');
    const map = {};
    debitOnly.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([cat, amt]) => ({ cat, amt }))
      .sort((a, b) => b.amt - a.amt);
  }, [filtered]);

  const CAT_COLORS = {
    'Food & Drink': '#FF6B35',
    'Transport': '#4ECDC4',
    'Shopping': '#9B59B6',
    'BNPL': '#E74C3C',
    'Subscription': '#2ECC71',
    'Utilities': '#F39C12',
  };

  const maxSpend = categorySpend.length > 0 ? categorySpend[0].amt : 1;

  const ListHeader = () => (
    <>
      {/* ── Header ── */}
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
        ) : <View style={styles.backPlaceholder} />}
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={styles.backPlaceholder} />
      </View>

      {/* ── Month Selector ── */}
      <View style={styles.monthSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthScrollContent}>
          {MONTH_KEYS.map((monthKey, index) => (
            <TouchableOpacity
              key={monthKey}
              style={[styles.monthBtn, selectedMonth === monthKey && styles.monthBtnActive]}
              onPress={() => setSelectedMonth(monthKey)}
            >
              <Text style={[styles.monthText, selectedMonth === monthKey && styles.monthTextActive]}>
                {t.months[index]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Summary row ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.danger }]}>{formatCurrency(totalDebit)}</Text>
          <Text style={styles.summaryLabel}>{t.out}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>{formatCurrency(totalCredit)}</Text>
          <Text style={styles.summaryLabel}>{t.in}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{filtered.length}</Text>
          <Text style={styles.summaryLabel}>{t.transactions}</Text>
        </View>
      </View>

      {/* ── Category spend chart ── */}
      {categorySpend.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t.spendingByCategory}</Text>
          {categorySpend.map(({ cat, amt }) => (
            <View key={cat} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{cat}</Text>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      width: `${(amt / maxSpend) * 100}%`,
                      backgroundColor: CAT_COLORS[cat] || COLORS.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.chartAmt, { color: CAT_COLORS[cat] || COLORS.accent }]}>
                {formatCurrency(amt)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Search bar ── */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
        {FILTER_KEYS.map((key, index) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterTab, activeFilter === key && styles.filterTabActive]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.filterTabText, activeFilter === key && styles.filterTabTextActive]}>
              {t.filterTabs[index]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>{t.noTransactions}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filtered.length === 0 && styles.emptyContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    backgroundColor: COLORS.background,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  backPlaceholder: { width: 70 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  monthSelector: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  monthScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  monthBtn: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  monthBtnActive: {
    backgroundColor: COLORS.primary,
  },
  monthText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  monthTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  clearBtn: { fontSize: 14, color: COLORS.textLight, padding: 4 },

  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  filterTabTextActive: { color: '#fff', fontWeight: '700' },

  chartCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  chartLabel: { fontSize: 11, color: COLORS.textSecondary, width: 82, flexShrink: 0 },
  chartBarTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  chartBarFill: { height: '100%', borderRadius: 4 },
  chartAmt: { fontSize: 11, fontWeight: '700', width: 62, textAlign: 'right' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
  emptyContainer: { flexGrow: 1 },
});
