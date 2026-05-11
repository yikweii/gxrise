import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { getScoreColour, getScoreLabel } from '../utils/healthScore';
import { useLang } from '../context/LangContext';

export default function HealthScoreGauge({ score = 68, size = 200, showLabel = true }) {
  const { lang } = useLang();
  const scoreColour = getScoreColour(score);
  const scoreLabel = getScoreLabel(score, lang);

  const [animDeg, setAnimDeg] = useState(0);
  const [displayNum, setDisplayNum] = useState(0);

  const arcAnim = useRef(new Animated.Value(0)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    arcAnim.setValue(0);
    counterAnim.setValue(0);

    const arcListener = arcAnim.addListener(({ value }) => {
      setAnimDeg(Math.round(value));
    });
    const counterListener = counterAnim.addListener(({ value }) => {
      setDisplayNum(Math.round(value));
    });

    Animated.parallel([
      Animated.timing(arcAnim, {
        toValue: (score / 100) * 360,
        duration: 1400,
        useNativeDriver: false,
      }),
      Animated.timing(counterAnim, {
        toValue: score,
        duration: 1400,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.35, duration: 1000, useNativeDriver: false }),
      ])
    ).start();

    return () => {
      arcAnim.removeListener(arcListener);
      counterAnim.removeListener(counterListener);
    };
  }, [score]);

  const strokeWidth = size * 0.09;
  const ringSize = size;
  const innerSize = size - strokeWidth * 2 - 6;
  const r = (ringSize - strokeWidth) / 2;
  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const dotSize = strokeWidth + 1;

  return (
    <View style={[styles.wrapper, { width: size + 28, height: size + 28 }]}>
      {/* Outer pulsing glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 24,
            height: size + 24,
            borderRadius: (size + 24) / 2,
            borderColor: scoreColour,
            opacity: glowAnim,
          },
        ]}
      />

      {/* Shadow depth ring */}
      <View
        style={[
          styles.shadowRing,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            backgroundColor: scoreColour + '22',
          },
        ]}
      />

      <View style={[styles.container, { width: size, height: size }]}>
        {/* Background track ring */}
        <View
          style={{
            position: 'absolute',
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.border,
          }}
        />

        {/* Animated arc: one circular dot per degree, sweeping from 12-o'clock CW */}
        {Array.from({ length: animDeg }, (_, i) => {
          const rad = (i * Math.PI) / 180;
          const px = cx + r * Math.sin(rad) - dotSize / 2;
          const py = cy - r * Math.cos(rad) - dotSize / 2;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: scoreColour,
                left: px,
                top: py,
              }}
            />
          );
        })}

        {/* 3D inner circle */}
        <View
          style={[
            styles.innerShadow,
            {
              width: innerSize + 10,
              height: innerSize + 10,
              borderRadius: (innerSize + 10) / 2,
            },
          ]}
        />
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              shadowColor: scoreColour,
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
            },
          ]}
        >
          {/* Inner halo ring */}
          <View
            style={[
              styles.innerHalo,
              {
                width: innerSize - 4,
                height: innerSize - 4,
                borderRadius: (innerSize - 4) / 2,
                borderColor: scoreColour + '30',
              },
            ]}
          />

          <Text style={[styles.scoreText, { fontSize: size * 0.24, color: scoreColour }]}>
            {displayNum}
          </Text>
          <Text style={[styles.maxText, { fontSize: size * 0.09 }]}>/100</Text>
          {showLabel && (
            <Text style={[styles.labelText, { fontSize: size * 0.085, color: scoreColour }]}>
              {scoreLabel}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  shadowRing: {
    position: 'absolute',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerShadow: {
    position: 'absolute',
    backgroundColor: COLORS.border + '60',
  },
  innerCircle: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerHalo: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  scoreText: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  maxText: {
    color: COLORS.textLight,
    fontWeight: '500',
    marginTop: -3,
  },
  labelText: {
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
  },
});
