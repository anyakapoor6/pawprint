import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { mockReports } from '@/data/mockData';
import MiniPetCard from '@/components/MiniPetCard';
import PetCard from '@/components/PetCard';
import { Dimensions } from 'react-native';
import { isNearMe } from '@/components/isNearMe';
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { usePets } from '@/store/pets';

const screenWidth = Dimensions.get('window').width;
const cardMargin = 12; // horizontal space between cards
const cardPadding = 32; // total horizontal padding of the parent view (16 left + 16 right)
const cardWidth = (screenWidth - cardPadding - cardMargin) / 2;



export default function UrgentPetsScreen() {
  const { reports, userLocation, setUserLocation } = usePets();

  useEffect(() => {
    if (!userLocation) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      })();
    }
  }, []);

  const urgentNearby = reports.filter(
    r =>
      r.isUrgent &&
      r.status !== 'reunited' &&
      r.lastSeenLocation &&
      userLocation &&
      isNearMe(r.lastSeenLocation, userLocation)
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Urgent Cases Near You</Text>
        <View style={styles.headerInfo}>
          <AlertTriangle size={16} color={colors.urgent} />
          <Text style={styles.headerSubtitle}>These pets need urgent help</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {urgentNearby.length > 0 ? (
          <View style={styles.grid}>
            {urgentNearby.map((report, index) => (
              <View
                key={report.id}
                style={[
                  styles.gridItem,
                  index % 2 === 0 && { marginRight: 12 },
                ]}
              >
                <MiniPetCard report={report} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No urgent reports</Text>
            <Text style={styles.emptyStateText}>
              There are currently no urgent pet reports near you
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
    width: cardWidth,
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