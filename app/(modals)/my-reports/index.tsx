import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import { usePets } from '@/store/pets';
import PetCard from '@/components/PetCard';
import MiniPetCard from '@/components/MiniPetCard';
import { useAuth } from '@/store/auth';

export default function MyReportsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');

  const { getUserReports, updatePetStatus } = usePets();
  const { user } = useAuth();
  const userId = user?.id;

  console.log('Current user:', user);


  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 100 }}>
          Please sign in to view your reports.
        </Text>
      </View>
    );
  }


  const userReports = getUserReports(userId).filter((report: PetReport) => {
    if (activeTab === 'active') return report.status === 'active';
    if (activeTab === 'resolved') return report.status === 'reunited';
    return false;
  });


  const handlePetPress = (id: string) => {
    router.push(`/pet/${id}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleResolvePet = (report: PetReport) => {
    Alert.alert(
      'Resolve Pet Report',
      `Has ${report.name || 'this pet'} been reunited?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes, Mark as Reunited',
          onPress: () => {
            updatePetStatus(report.id, 'reunited');
            Alert.alert(
              'Report Resolved',
              'Would you like to share your success story?',
              [
                {
                  text: 'Not Now',
                  style: 'cancel'
                },
                {
                  text: 'Share Story',
                  onPress: () => router.push('/story/create')
                }
              ]
            );
          }

        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resolved' && styles.activeTab]}
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeTabText]}>
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.reportsGrid}>
          {userReports.map((report) => (
            <View key={report.id} style={styles.reportItem}>
              <MiniPetCard
                report={report}
                onPress={() => handlePetPress(report.id)}
                showResolveButton={activeTab === 'active' && report.reportType === 'lost'}
                onResolve={() => handleResolvePet(report)}
              />
            </View>
          ))}
        </View>

        {userReports.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              No {activeTab} reports
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'active'
                ? "You don't have any active reports at the moment"
                : "You haven't resolved any reports yet"}
            </Text>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportItem: {
    width: '48%',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 20,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});