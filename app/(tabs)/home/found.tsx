import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

import { colors } from '@/constants/colors';
import MiniPetCard from '@/components/MiniPetCard';
import { usePets } from '@/store/pets';
import { isNearMe } from '@/components/isNearMe';
import { PetReport } from '@/types/pet';

const screenWidth = Dimensions.get('window').width;
const cardMargin = 12;
const cardPadding = 32;
const cardWidth = (screenWidth - cardPadding - cardMargin) / 2;


export default function FoundPetsScreen() {
  const router = useRouter();


  const { setUserLocation, userLocation, getAllReports } = usePets();
  const reports = getAllReports();



  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);



  const foundPets = reports.filter(
    (r) =>
      r.reportType === 'found' &&
      r.status !== 'resolved' &&
      r.lastSeenLocation &&
      (!userLocation || isNearMe(r.lastSeenLocation, userLocation))
  );



  const handlePetPress = (id: string) => {
    router.push(`/pet/${id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Found Pets</Text>
        <View style={styles.headerInfo}>
          <MapPin size={16} color={colors.secondary} />
          <Text style={styles.headerSubtitle}>Pets found in your area</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {foundPets.length > 0 ? (
          <View style={styles.grid}>
            {foundPets.map((report: PetReport, index: number) => (
              <View key={report.id} style={[styles.gridItem, index % 2 === 0 && { marginRight: 12 }]}>
                <MiniPetCard report={report} onPress={() => handlePetPress(report.id)} />
              </View>
            ))}

          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No found pets</Text>
            <Text style={styles.emptyStateText}>
              There are currently no found pets reported in your area
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