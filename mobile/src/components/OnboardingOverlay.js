import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { FEATURES, FINAL_CARD } from './walkthroughData';

const { width: SW } = Dimensions.get('window');

const MODE_READING = 'reading';     // full overlay, feature intro card
const MODE_EXPLORING = 'exploring'; // page free, slim nav bar only
const MODE_DONE = 'done';           // final celebration card

// ── Navigation helper ────────────────────────────────────────────────────────
function navigateToFeature(idx, navRef) {
  if (!navRef?.current) return;
  const f = FEATURES[idx];
  if (!f) return;
  if (f.screen.isTab) {
    navRef.current.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main', state: { routes: [{ name: f.screen.tabName }], index: 0 } }],
      })
    );
  } else {
    navRef.current.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'Main' }, { name: f.screen.screen }],
      })
    );
  }
}

// ── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current, color = '#00FF94' }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 16 : 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: i < current
              ? 'rgba(255,255,255,0.45)'
              : i === current
              ? color
              : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </View>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function OnboardingOverlay({ visible, onDismiss, navigationRef }) {
  const [featureIdx, setFeatureIdx] = useState(0);
  const [mode, setMode] = useState(MODE_READING);

  const fIdxRef = useRef(0);

  // Card animations (used for reading + done modes)
  const cardSlide = useRef(new Animated.Value(300)).current;
  const cardFade  = useRef(new Animated.Value(0)).current;

  // Slim bar animations (exploring mode)
  const barSlide = useRef(new Animated.Value(80)).current;
  const barFade  = useRef(new Animated.Value(0)).current;

  // Backdrop fade on first show
  const backdropFade = useRef(new Animated.Value(0)).current;

  useEffect(() => { fIdxRef.current = featureIdx; }, [featureIdx]);

  const animateCardIn = useCallback((delay = 0) => {
    cardSlide.setValue(300);
    cardFade.setValue(0);
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, tension: 62, friction: 9, useNativeDriver: true }),
        Animated.timing(cardFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  const animateBarIn = useCallback(() => {
    barSlide.setValue(80);
    barFade.setValue(0);
    Animated.parallel([
      Animated.spring(barSlide, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.timing(barFade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Reset on mount / re-show ──────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    backdropFade.setValue(0);
    Animated.timing(backdropFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    fIdxRef.current = 0;
    setFeatureIdx(0);
    setMode(MODE_READING);
    const t = setTimeout(() => navigateToFeature(0, navigationRef), 400);
    return () => clearTimeout(t);
  }, [visible]);

  // ── Trigger animations when state changes ────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    if (mode === MODE_READING || mode === MODE_DONE) {
      animateCardIn(80);
    } else if (mode === MODE_EXPLORING) {
      animateBarIn();
    }
  }, [featureIdx, mode, visible]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const startExploring = useCallback(() => setMode(MODE_EXPLORING), []);

  const goNextFeature = useCallback(() => {
    const fi = fIdxRef.current;
    if (fi < FEATURES.length - 1) {
      const next = fi + 1;
      fIdxRef.current = next;
      navigateToFeature(next, navigationRef);
      setFeatureIdx(next);
      setMode(MODE_READING);
    } else {
      setMode(MODE_DONE);
    }
  }, [navigationRef]);

  const goPrevFeature = useCallback(() => {
    const fi = fIdxRef.current;
    if (fi > 0) {
      const prev = fi - 1;
      fIdxRef.current = prev;
      navigateToFeature(prev, navigationRef);
      setFeatureIdx(prev);
      setMode(MODE_READING);
    }
  }, [navigationRef]);

  const replayTour = useCallback(() => {
    fIdxRef.current = 0;
    navigateToFeature(0, navigationRef);
    setFeatureIdx(0);
    setMode(MODE_READING);
  }, [navigationRef]);

  const dismiss = useCallback(() => {
    if (navigationRef?.current) {
      navigationRef.current.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
      );
    }
    onDismiss();
  }, [navigationRef, onDismiss]);

  if (!visible) return null;

  const feature = FEATURES[featureIdx];
  const isFirst = featureIdx === 0;
  const isLast  = featureIdx === FEATURES.length - 1;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity: backdropFade }]}
      pointerEvents={mode === MODE_EXPLORING ? 'box-none' : 'auto'}
    >

      {/* ── READING MODE — full overlay + feature intro card ─────────────── */}
      {mode === MODE_READING && (
        <>
          <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} />

          <View style={styles.centreLayer}>
            <Animated.View style={[
              styles.cardWrapper,
              { transform: [{ translateY: cardSlide }], opacity: cardFade },
            ]}>
              <LinearGradient
                colors={feature.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.introCard}
              >
                {/* Top row: dots + counter + exit */}
                <View style={styles.cardTopRow}>
                  <ProgressDots total={FEATURES.length} current={featureIdx} />
                  <Text style={styles.cardCounter}>{featureIdx + 1} / {FEATURES.length}</Text>
                  <TouchableOpacity onPress={dismiss} hitSlop={12}>
                    <Text style={styles.exitBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardEmoji}>{feature.emoji}</Text>
                  <Text style={styles.featureTag}>Feature {feature.id}</Text>
                  <Text style={styles.cardHeadline}>{feature.layer1.headline}</Text>
                  <Text style={styles.cardSub}>{feature.layer1.subheadline}</Text>
                  <Text style={styles.cardDesc}>{feature.layer1.body}</Text>
                </View>

                {/* Footer: skip + explore */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.skipBtn} onPress={dismiss}>
                    <Text style={styles.skipBtnText}>Skip Tour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exploreBtn} onPress={startExploring}>
                    <Text style={styles.exploreBtnText}>Explore Page →</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </>
      )}

      {/* ── EXPLORING MODE — slim non-blocking nav bar ───────────────────── */}
      {mode === MODE_EXPLORING && (
        <Animated.View
          style={[
            styles.navBar,
            { transform: [{ translateY: barSlide }], opacity: barFade },
          ]}
        >
          {/* Progress dots + feature counter */}
          <View style={styles.navBarLeft}>
            <ProgressDots total={FEATURES.length} current={featureIdx} color={feature.gradient[1]} />
            <Text style={styles.navBarCounter}>{featureIdx + 1} / {FEATURES.length}</Text>
          </View>

          {/* Navigation buttons */}
          <View style={styles.navBarRight}>
            {!isFirst && (
              <TouchableOpacity style={styles.navBackBtn} onPress={goPrevFeature}>
                <Text style={styles.navBackText}>← Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.navNextBtn, { backgroundColor: feature.gradient[1] }]}
              onPress={goNextFeature}
              activeOpacity={0.85}
            >
              <Text style={styles.navNextText}>
                {isLast ? 'Finish Tour ✓' : 'Next Feature →'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismiss} hitSlop={8} style={styles.navExitBtn}>
              <Text style={styles.navExitText}>✕</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── DONE MODE — final celebration card ───────────────────────────── */}
      {mode === MODE_DONE && (
        <>
          <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} />

          <View style={styles.centreLayer}>
            <Animated.View style={[
              styles.cardWrapper,
              { transform: [{ translateY: cardSlide }], opacity: cardFade },
            ]}>
              <LinearGradient
                colors={['#1B1464', '#7C5CF5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneCard}
              >
                <Text style={styles.doneStars}>🎉</Text>
                <Text style={styles.doneHeadline}>{FINAL_CARD.headline}</Text>
                <Text style={styles.doneBody}>{FINAL_CARD.body}</Text>

                <View style={styles.doneDotsRow}>
                  {FEATURES.map((_, i) => (
                    <View key={i} style={styles.doneDot} />
                  ))}
                </View>

                <TouchableOpacity style={styles.donePrimaryBtn} onPress={dismiss}>
                  <Text style={styles.donePrimaryBtnText}>{FINAL_CARD.primaryCTA}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.doneSecondaryBtn} onPress={replayTour}>
                  <Text style={styles.doneSecondaryBtnText}>{FINAL_CARD.secondaryCTA}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </>
      )}

    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Shared ────────────────────────────────────────────────────────────────
  darkOverlay: {
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  centreLayer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  cardWrapper: {
    marginHorizontal: 14,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 24,
  },

  // ── Reading mode — intro card ──────────────────────────────────────────────
  introCard: {
    paddingBottom: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  cardCounter: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  exitBtn: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 16,
    fontWeight: '700',
    padding: 4,
  },
  cardBody: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  cardEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  featureTag: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardHeadline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 14,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.68)',
    textAlign: 'center',
    lineHeight: 21,
  },
  cardFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
  },
  skipBtnText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
  },
  exploreBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
  },
  exploreBtnText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Exploring mode — slim nav bar ──────────────────────────────────────────
  navBar: {
    position: 'absolute',
    bottom: 92,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(12, 10, 28, 0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 20,
  },
  navBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  navBarCounter: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  navBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBackBtn: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  navBackText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  navNextBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },
  navNextText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  navExitBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  navExitText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.28)',
    fontWeight: '700',
  },

  // ── Done mode — celebration card ───────────────────────────────────────────
  doneCard: {
    padding: 28,
    alignItems: 'center',
    borderRadius: 24,
  },
  doneStars: {
    fontSize: 52,
    marginBottom: 14,
  },
  doneHeadline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  doneBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  doneDotsRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 24,
  },
  doneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  donePrimaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    marginBottom: 10,
  },
  donePrimaryBtnText: {
    color: '#1B1464',
    fontSize: 15,
    fontWeight: '900',
  },
  doneSecondaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  doneSecondaryBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '700',
  },
});
