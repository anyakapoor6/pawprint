import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { usePets } from '@/store/pets';
import { Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CalloutSubview } from 'react-native-maps';




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

  return (
    <View style={styles.container}>
      <MapView
        key={reports.length}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {reports
          .filter(report =>
            report.lastSeenLocation &&
            report.lastSeenLocation.latitude !== 0 &&
            report.lastSeenLocation.longitude !== 0
          )

          .map(report => (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.lastSeenLocation!.latitude,
                longitude: report.lastSeenLocation!.longitude,
              }}
              pinColor={
                report.status === 'reunited'
                  ? '#FF69B4'
                  : report.reportType === 'lost'
                    ? 'red'
                    : 'green'
              }
            >
              <Callout onPress={() => router.push(`/pet/${report.id}`)}>
                <View style={styles.calloutContainer}>
                  {report.photos?.[0] && (
                    <Image
                      source={{ uri: report.photos[0] }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.name}>
                    {report.name?.trim() || `${report.color || 'Unknown'} ${report.type || 'Pet'}`}
                  </Text>

                  <Text style={styles.description} numberOfLines={3}>
                    {report.description || 'No description provided.'}
                  </Text>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>View Listing</Text>
                  </View>
                </View>
              </Callout>

            </Marker>
          ))}

      </MapView>
    </View>
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
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
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

});
