import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Layers, List, MapPin, Navigation, Search, Filter, TriangleAlert as AlertTriangle, Lock } from 'lucide-react-native';
import * as Location from 'expo-location';
import GoogleMapReact from 'google-map-react';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import PetMarker from '@/components/PetMarker';
import PetCard from '@/components/PetCard';
import PremiumFeatureModal from '@/components/PremiumFeatureModal';
import { STRIPE_PRODUCTS } from '@/src/stripe-config';

const DEFAULT_ZOOM = 13;
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York City

const FREE_RADIUS = 5; // Free users can see pets within 5km

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
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [mapUnlocked, setMapUnlocked] = useState(false); // In real app, get from user's purchases
  const router = useRouter();

  const initializeLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      };

      setLocation(newLocation);

      // If we have map instance, center it on the new location
      if (mapInstance && mapsApi) {
        mapInstance.panTo(newLocation);
      }

      // Filter pets based on new location
      filterPetsByLocation(newLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, [mapInstance, mapsApi]);

  useEffect(() => {
    initializeLocation();

    // Set up location watcher
    let locationSubscription: any;

    const watchLocation = async () => {
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 100, // Update every 100 meters
        },
        (newLocation) => {
          const coords = {
            lat: newLocation.coords.latitude,
            lng: newLocation.coords.longitude,
          };
          setLocation(coords);
          filterPetsByLocation(coords);
        }
      );
    };

    watchLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const filterPetsByLocation = (center: { lat: number; lng: number }) => {
    // In a real app, this would be a server-side query
    const filtered = mockReports.filter(pet => {
      if (!pet.lastSeenLocation) return false;

      const distance = calculateDistance(
        center.lat,
        center.lng,
        pet.lastSeenLocation.latitude,
        pet.lastSeenLocation.longitude
      );

      return distance <= searchRadius;
    });

    setNearbyPets(filtered);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    setMapInstance(map);
    setMapsApi(maps);
  };

  const handleSelectPet = (pet: PetReport) => {
    setSelectedPet(pet);
    if (mapInstance && pet.lastSeenLocation) {
      mapInstance.panTo({
        lat: pet.lastSeenLocation.latitude,
        lng: pet.lastSeenLocation.longitude,
      });
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // In a real app, this would trigger a server-side search
    const filtered = mockReports.filter(pet => {
      const searchLower = text.toLowerCase();
      return (
        pet.type.toLowerCase().includes(searchLower) ||
        (pet.breed?.toLowerCase().includes(searchLower)) ||
        pet.color.toLowerCase().includes(searchLower) ||
        (pet.lastSeenLocation?.address.toLowerCase().includes(searchLower))
      );
    });
    setNearbyPets(filtered);
  };

  const handleCenterMap = async () => {
    await initializeLocation();
  };

  const handleMapUnlock = () => {
    setShowPremiumModal(true);
  };

  const handlePremiumSuccess = () => {
    setMapUnlocked(true);
    setShowPremiumModal(false);
    // In a real app, refresh user's purchases/permissions
  };

  const renderPets = () => {
    if (!mapUnlocked) {
      // Only show pets within FREE_RADIUS for free users
      return nearbyPets
        .filter(pet => {
          if (!pet.lastSeenLocation || !location) return false;
          const distance = calculateDistance(
            location.lat,
            location.lng,
            pet.lastSeenLocation.latitude,
            pet.lastSeenLocation.longitude
          );
          return distance <= FREE_RADIUS;
        })
        .map((pet) => (
          <PetMarker
            key={pet.id}
            lat={pet.lastSeenLocation?.latitude}
            lng={pet.lastSeenLocation?.longitude}
            pet={pet}
            onClick={() => handleSelectPet(pet)}
          />
        ));
    }

    return nearbyPets.map((pet) => (
      <PetMarker
        key={pet.id}
        lat={pet.lastSeenLocation?.latitude}
        lng={pet.lastSeenLocation?.longitude}
        pet={pet}
        onClick={() => handleSelectPet(pet)}
      />
    ));
  };

  if (!location && Platform.OS === 'web') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please enable location services to view the map</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Pets</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'map' && styles.toggleButtonActive]}
            onPress={() => setMode('map')}
          >
            <Layers size={20} color={mode === 'map' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'list' && styles.toggleButtonActive]}
            onPress={() => setMode('list')}
          >
            <List size={20} color={mode === 'list' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search this area"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {mode === 'map' ? (
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' && (
            <GoogleMapReact
              bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_KEY' }}
              defaultCenter={location || DEFAULT_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={handleApiLoaded}
              options={{
                fullscreenControl: false,
                zoomControl: false,
                gestureHandling: 'greedy',
              }}
            >
              {renderPets()}
            </GoogleMapReact>
          )}

          {!mapUnlocked && (
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={handleMapUnlock}
            >
              <Lock size={20} color={colors.white} />
              <Text style={styles.unlockButtonText}>
                Unlock Full Map Access
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.centerButton}
            onPress={handleCenterMap}
          >
            <Navigation size={24} color={colors.primary} />
          </TouchableOpacity>

          {selectedPet && (
            <View style={styles.selectedPetCard}>
              <PetCard report={selectedPet} />
              <Link href={`/pet/${selectedPet.id}`} asChild>
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statsContent}>
              <AlertTriangle size={16} color={colors.urgent} />
              <Text style={styles.statsText}>
                {nearbyPets.length} pets reported within {searchRadius}km
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <PremiumFeatureModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSuccess={handlePremiumSuccess}
        feature={{
          id: STRIPE_PRODUCTS.MAP_UNLOCK.id,
          name: STRIPE_PRODUCTS.MAP_UNLOCK.name,
          description: STRIPE_PRODUCTS.MAP_UNLOCK.description,
          price: 4.99,
          type: 'mapUnlock'
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedPetCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  viewDetailsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewDetailsText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  unlockButton: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  unlockButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});