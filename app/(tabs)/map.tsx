import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search as SearchIcon, MapPin, Filter, X, Navigation } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';
import { FEATURES } from '@/constants/features';

const DEFAULT_ZOOM = 13;
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York City

export default function MapScreen() {
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPet, setSelectedPet] = useState<PetReport | null>(null);
  const [nearbyPets, setNearbyPets] = useState<PetReport[]>([]);
  const [searchRadius, setSearchRadius] = useState(5); // km
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapsApi, setMapsApi] = useState<any>(null);

  const mapFeatures = FEATURES.mapUnlock ? {
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'greedy',
  } : {
    fullscreenControl: false,
    zoomControl: false,
    gestureHandling: 'cooperative',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Pets</Text>
      </View>
      
      {Platform.OS === 'web' && (
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_KEY' }}
          defaultCenter={location || DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={handleApiLoaded}
          options={mapFeatures}
        >
          {nearbyPets.map((pet) => (
            <PetMarker
              key={pet.id}
              lat={pet.lastSeenLocation?.latitude}
              lng={pet.lastSeenLocation?.longitude}
              pet={pet}
              onClick={() => handleSelectPet(pet)}
            />
          ))}
        </GoogleMapReact>
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});