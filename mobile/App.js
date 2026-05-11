import 'react-native-gesture-handler';
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingOverlay from './src/components/OnboardingOverlay';

import { COLORS } from './src/constants/colours';
import { LangProvider, useLang } from './src/context/LangContext';

// ── Screen imports ──────────────────────────────────────────────────────────
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import HealthScoreScreen from './src/screens/HealthScoreScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import PocketScreen from './src/screens/PocketScreen';
import NudgeScreen from './src/screens/NudgeScreen';
import PTTPNTrackerScreen from './src/screens/PTTPNTrackerScreen';
import BNPLScreen from './src/screens/BNPLScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import PocketWithKawanScreen from './src/screens/PocketWithKawanScreen';
import BillSplitScreen from './src/screens/BillSplitScreen';
import WeeklyDigestScreen from './src/screens/WeeklyDigestScreen';
import ConnectedAccountsScreen from './src/screens/ConnectedAccountsScreen';

// ── Navigators ──────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Tab icon component (text-based, no external icon library) ──────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={tabIconStyles.container}>
      <Text style={[tabIconStyles.emoji, focused && tabIconStyles.focused]}>{emoji}</Text>
      <Text style={[tabIconStyles.label, focused && tabIconStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  emoji: { fontSize: 20, opacity: 0.45 },
  focused: { opacity: 1 },
  label: { fontSize: 10, color: COLORS.textLight, marginTop: 2, fontWeight: '600' },
  labelFocused: { color: COLORS.primary },
});

// ── More Screen translations ────────────────────────────────────────────────
const MORE_TRANSLATIONS = {
  bm: {
    title: 'Lebih Lagi',
    items: ['Notis Pintar', 'Penjejak PTPTN', 'BNPL Saya', 'Langganan', 'Poket Saya', 'Ringkasan Mingguan', 'Akaun Disambung'],
  },
  en: {
    title: 'More',
    items: ['Smart Nudges', 'PTPTN Tracker', 'My BNPL', 'Subscriptions', 'My Pocket', 'Weekly Summary', 'Connected Accounts'],
  },
};

// ── More Screen (placeholder hub for extra screens) ────────────────────────
function MoreScreen({ navigation }) {
  const { lang } = useLang();
  const t = MORE_TRANSLATIONS[lang];

  const items = [
    { icon: '🔔', screen: 'Nudge' },
    { icon: '🎓', screen: 'PTPTN' },
    { icon: '💳', screen: 'BNPL' },
    { icon: '📱', screen: 'Subscriptions' },
    { icon: '💰', screen: 'Pocket' },
    { icon: '📊', screen: 'WeeklyDigest' },
    { icon: '🔗', screen: 'ConnectedAccounts' },
  ];

  return (
    <View style={moreStyles.container}>
      <View style={moreStyles.header}>
        <Text style={moreStyles.headerTitle}>{t.title}</Text>
      </View>
      <View style={moreStyles.list}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={moreStyles.item}>
              <Text style={moreStyles.itemIcon}>{item.icon}</Text>
              <Text style={moreStyles.itemLabel}>{t.items[index]}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const moreStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.background, paddingHorizontal: 20,
    paddingTop: 56, paddingBottom: 20,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '900' },
  list: { padding: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemIcon: { fontSize: 22, marginRight: 14 },
  itemLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
});

const TAB_LABELS = {
  bm: { home: 'Utama', transactions: 'Transaksi', score: 'Skor', pocket: 'Poket', more: 'Lagi' },
  en: { home: 'Home', transactions: 'Txns', score: 'Score', pocket: 'Pocket', more: 'More' },
};

// ── Bottom Tab Navigator ────────────────────────────────────────────────────
function MainTabNavigator() {
  const { lang } = useLang();
  const tabs = TAB_LABELS[lang];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label={tabs.home} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label={tabs.transactions} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="HealthScore"
        component={HealthScoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="❤️" label={tabs.score} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={PocketScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💰" label={tabs.pocket} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="☰" label={tabs.more} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root Stack Navigator ────────────────────────────────────────────────────
function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tab navigator */}
      <Stack.Screen name="Main" component={MainTabNavigator} />

      {/* Modal/stack screens */}
      <Stack.Screen
        name="Nudge"
        component={NudgeScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="PTPTN"
        component={PTTPNTrackerScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="BNPL"
        component={BNPLScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Subscriptions"
        component={SubscriptionScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="PocketWithKawan"
        component={PocketWithKawanScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="BillSplit"
        component={BillSplitScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="WeeklyDigest"
        component={WeeklyDigestScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="ConnectedAccounts"
        component={ConnectedAccountsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Pocket"
        component={PocketScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}

// ── App Entry Point ─────────────────────────────────────────────────────────
export default function App() {
  const navigationRef = useRef(null);
  const [onboardingVisible, setOnboardingVisible] = useState(true);

  return (
    <LangProvider>
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <NavigationContainer
        ref={navigationRef}
        theme={{
          dark: true,
          colors: {
            primary: COLORS.primary,
            background: COLORS.background,
            card: COLORS.surface,
            text: COLORS.textPrimary,
            border: COLORS.border,
            notification: COLORS.primary,
          },
        }}
      >
        <RootNavigator />
        <OnboardingOverlay
          visible={onboardingVisible}
          onDismiss={() => setOnboardingVisible(false)}
          navigationRef={navigationRef}
        />
      </NavigationContainer>
    </SafeAreaProvider>
    </LangProvider>
  );
}
