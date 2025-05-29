import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';

export default function RecentReportsScreen() {
  const router = useRouter();
  const recentReports = [...mockReports].sort(
    (a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()
  );

  const handlePetPress = (id: string) => {
    router.push(`/pet/${id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recently Reported</Text>
        <View style={styles.headerInfo}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.headerSubtitle}>
            Latest lost and found pet reports
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {recentReports.map(report => (
            <TouchableOpacity
              key={report.id}
              style={styles.gridItem}
              onPress={() => handlePetPress(report.id)}
            >
              <PetCard report={report} />
            </TouchableOpacity>
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