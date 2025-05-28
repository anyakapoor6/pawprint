import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';

export default function UrgentCasesScreen() {
  const router = useRouter();
  const urgentCases = mockReports.filter(report => report.isUrgent);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Urgent Cases</Text>
        <View style={styles.headerInfo}>
          <AlertTriangle size={16} color={colors.urgent} />
          <Text style={styles.headerSubtitle}>
            These pets need immediate attention
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {urgentCases.map(report => (
            <View key={report.id} style={styles.gridItem}>
              <PetCard report={report} />
            </View>
          ))}
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
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
});