import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Award, Gift, Wallet } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface Reward {
  id: string;
  petName: string;
  amount: number;
  status: 'active' | 'claimed' | 'expired';
  claimedBy?: string;
  expiryDate?: string;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    petName: 'Max',
    amount: 500,
    status: 'active',
    expiryDate: '2024-04-01',
  },
  {
    id: '2',
    petName: 'Luna',
    amount: 300,
    status: 'claimed',
    claimedBy: 'Sarah Johnson',
  },
  {
    id: '3',
    petName: 'Charlie',
    amount: 200,
    status: 'expired',
    expiryDate: '2024-02-15',
  },
];

interface RewardsScreenProps {
  onClose?: () => void;
}

export default function RewardsScreen({ onClose }: RewardsScreenProps) {
  const router = useRouter();

  const renderRewardCard = (reward: Reward) => {
    const statusColor = {
      active: colors.primary,
      claimed: colors.success,
      expired: colors.textTertiary,
    }[reward.status];

    const statusText = {
      active: 'Active',
      claimed: 'Claimed',
      expired: 'Expired',
    }[reward.status];

    return (
      <View key={reward.id} style={styles.rewardCard}>
        <View style={styles.rewardHeader}>
          <Award size={24} color={statusColor} />
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        
        <Text style={styles.rewardAmount}>${reward.amount}</Text>
        <Text style={styles.rewardPet}>for finding {reward.petName}</Text>
        
        {reward.status === 'claimed' && (
          <Text style={styles.claimedBy}>Claimed by {reward.claimedBy}</Text>
        )}
        
        {reward.status === 'active' && reward.expiryDate && (
          <Text style={styles.expiryDate}>Expires {new Date(reward.expiryDate).toLocaleDateString()}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Gift size={24} color={colors.primary} />
            <Text style={styles.statAmount}>$1,000</Text>
            <Text style={styles.statLabel}>Total Rewards</Text>
          </View>
          <View style={styles.statCard}>
            <Wallet size={24} color={colors.accent} />
            <Text style={styles.statAmount}>$500</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Rewards</Text>
        
        <View style={styles.rewardsGrid}>
          {mockRewards.map(renderRewardCard)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rewardAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  rewardPet: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  claimedBy: {
    fontSize: 14,
    color: colors.success,
    marginTop: 8,
  },
  expiryDate: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
  },
});