import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { usePets } from '@/store/pets';
import { Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CalloutSubview } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';





const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Only import react-native-maps if NOT running on web
let MapView: any, Marker: any, Callout: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { reports } = usePets();
  const [showLost, setShowLost] = useState(true);
  const [showFound, setShowFound] = useState(true);
  const [showReunited, setShowReunited] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPets, setModalPets] = useState<typeof reports>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);






  useEffect(() => {
    console.log('Full reports object:', reports);
  }, [reports]);

  useEffect(() => {
    console.log('Reports updated:', reports.map(r => r.name));
  }, [reports]);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Map is not supported on web.</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{errorMsg}</Text>
      </View>
    );
  }

  const initialRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : DEFAULT_REGION;

  const filteredReports = reports
    .filter(report =>
      report.lastSeenLocation &&
      report.lastSeenLocation.latitude !== 0 &&
      report.lastSeenLocation.longitude !== 0
    )
    .filter(report => {
      if (report.status === 'reunited') return showReunited;
      if (report.reportType === 'lost') return showLost;
      if (report.reportType === 'found') return showFound;
      return false; // fallback for unknown types
    })


  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterOption}
          onPress={() => setShowLost(!showLost)}
        >
          <Text style={styles.filterText}>
            {showLost ? '☑️' : '⬜️'} Lost
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterOption}
          onPress={() => setShowFound(!showFound)}
        >
          <Text style={styles.filterText}>
            {showFound ? '☑️' : '⬜️'} Found
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterOption}
          onPress={() => setShowReunited(!showReunited)}
        >
          <Text style={styles.filterText}>
            {showReunited ? '☑️' : '⬜️'} Reunited
          </Text>
        </TouchableOpacity>
      </View>


      <MapView
        key={reports.length}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={initialRegion}
        showsUserLocation
        showsMyLocationButton
      // pointerEvents="auto"
      >
        {filteredReports.map((report) => {
          const { latitude, longitude } = report.lastSeenLocation!;
          const roundedLat = Number(latitude.toFixed(5));
          const roundedLng = Number(longitude.toFixed(5));

          // Get all pets with same rounded location
          const sameLocationReports = filteredReports.filter(r => {
            const rLat = Number(r.lastSeenLocation!.latitude.toFixed(5));
            const rLng = Number(r.lastSeenLocation!.longitude.toFixed(5));
            return rLat === roundedLat && rLng === roundedLng;
          });

          return (
            <Marker
              key={report.id}
              onPress={() => {
                if (selectedMarkerId === report.id) {
                  // Deselect if it's already selected
                  setSelectedMarkerId(null);
                  setModalVisible(false);
                } else {
                  setSelectedMarkerId(report.id);
                }
              }}

              coordinate={{ latitude, longitude }}
              pinColor={
                report.status === 'reunited'
                  ? '#FF69B4'
                  : report.reportType === 'lost'
                    ? 'red'
                    : 'green'
              }
            >
              <Callout
                tooltip={false}
                onPress={() => {
                  setModalPets(sameLocationReports);
                  setModalVisible(true);
                }}
              >
                <View style={{ width: 240, paddingVertical: 4 }}>
                  {/* Horizontal scroll preview */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                  >
                    {sameLocationReports.map((pet, index) => (
                      <View key={index} style={{ marginRight: 12, alignItems: 'center' }}>
                        {pet.photos?.[0] && (
                          <Image
                            source={{ uri: pet.photos[0] }}
                            style={{ width: 70, height: 70, borderRadius: 8, marginBottom: 4 }}
                          />
                        )}
                        <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '500' }}>
                          {pet.name || pet.type}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Tap message */}
                  {sameLocationReports.length > 1 && (
                    <Text
                      style={{
                        marginTop: 6,
                        textAlign: 'center',
                        color: colors.primary,
                        fontWeight: '600',
                        fontSize: 13,
                      }}
                    >
                      Tap to see all ({sameLocationReports.length})
                    </Text>
                  )}
                </View>
              </Callout>


            </Marker>
          );
        })}


      </MapView>
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pets at this Location</Text>
            <ScrollView>
              {modalPets.map((pet, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setModalVisible(false);
                    router.push(`/pet/${pet.id}`);
                  }}
                >
                  <View style={styles.miniCard}>
                    {pet.photos?.[0] && (
                      <Image source={{ uri: pet.photos[0] }} style={styles.miniCardImage} />
                    )}
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: '600' }}>{pet.name || pet.type}</Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {(pet.reportType || pet.status || 'unknown').toUpperCase()}
                      </Text>

                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{ marginTop: 12, alignSelf: 'center' }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'gray' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 10,
    right: 10,
    zIndex: 999,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  filterOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  filterText: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.textPrimary,
  },


});
