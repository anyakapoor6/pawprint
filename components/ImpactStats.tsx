import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useStats } from '@/store/stats';
import { useEffect } from 'react';

export default function ImpactStats() {
  const { petsFound, activeUsers, successRate, calculateStats } = useStats();

  useEffect(() => {
    calculateStats();
  }, []);

  return (
    <View style={styles.statsSection}>
      <Text style={styles.statsTitle}>PawPrint Impact</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{petsFound}</Text>
          <Text style={styles.statLabel}>Pets Found</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeUsers}</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{successRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    backgroundColor: colors.primary,
    padding: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.white,
    opacity: 0.2,
  },
});