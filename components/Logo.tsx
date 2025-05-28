import { View, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface LogoProps {
  size?: number;
  color?: string;
}

export default function Logo({ size = 40, color = colors.primary }: LogoProps) {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      position: 'relative',
    },
    pawContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paw: {
      width: size * 0.6,
      height: size * 0.6,
      backgroundColor: color,
      borderRadius: size * 0.3,
      position: 'relative',
    },
    pad: {
      width: size * 0.25,
      height: size * 0.25,
      backgroundColor: color,
      borderRadius: size * 0.125,
      position: 'absolute',
    },
    padTop: {
      top: -size * 0.15,
      left: '50%',
      transform: [{ translateX: -size * 0.125 }],
    },
    padLeft: {
      top: '50%',
      left: -size * 0.15,
      transform: [{ translateY: -size * 0.125 }],
    },
    padRight: {
      top: '50%',
      right: -size * 0.15,
      transform: [{ translateY: -size * 0.125 }],
    },
    pinContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -size * 0.15 }, { translateY: -size * 0.15 }],
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.pawContainer}>
        <View style={styles.paw}>
          <View style={[styles.pad, styles.padTop]} />
          <View style={[styles.pad, styles.padLeft]} />
          <View style={[styles.pad, styles.padRight]} />
        </View>
      </View>
      <View style={styles.pinContainer}>
        <MapPin size={size * 0.3} color={colors.white} />
      </View>
    </View>
  );
}