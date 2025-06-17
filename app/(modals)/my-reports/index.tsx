import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { UserReport } from '@/lib/user';
import { useReports } from '@/store/reports';
import MiniPetCard from '@/components/MiniPetCard';
import { useAuth } from '@/store/auth';

export default function MyReportsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getUserReports, updateReportStatus } = useReports();
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    loadReports();
  }, [userId]);

  const loadReports = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const userReports = await getUserReports(userId);
      setReports(userReports);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 100 }}>
          Please sign in to view your reports.
        </Text>
      </View>
    );
  }

  const filteredReports = reports.filter((report: UserReport) => {
    if (activeTab === 'active') return report.status === 'pending';
    if (activeTab === 'resolved') return report.status === 'resolved';
    return false;
  });

  const handlePetPress = (id: string) => {
    router.push(`/pet/${id}`);
  };

  const handleResolvePet = async (report: UserReport) => {
    try {
      await updateReportStatus(report.id, 'resolved');
      await loadReports(); // Reload reports after status update
      Alert.alert(
        'Success',
        'Report marked as resolved. Would you like to share your reunion story?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
          },
          {
            text: 'Share Story',
            onPress: () => router.push('/story/create'),
          },
        ]
      );
    } catch (err) {
      console.error('Error updating report status:', err);
      Alert.alert('Error', 'Failed to update report status. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading reports...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReports}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.reportsGrid}>
            {filteredReports.map((report) => (
              <View key={report.id} style={styles.reportItem}>
                <MiniPetCard
                  report={report}
                  onPress={() => handlePetPress(report.id)}
                  showResolveButton={activeTab === 'active'}
                  onResolve={() => handleResolvePet(report)}
                />
              </View>
            ))}
          </View>

          {filteredReports.length === 0 && (
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
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    color: colors.error,
    marginBottom: 20,
  },
  retryButton: {
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
});