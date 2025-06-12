import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { usePets } from '@/store/pets';


const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Only import react-native-maps if NOT running on web
let MapView: any, Marker: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { reports } = usePets();


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
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={initialRegion} // <-- forces map to center on user location
        showsUserLocation
        showsMyLocationButton
      >

        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.lastSeenLocation?.latitude || DEFAULT_REGION.latitude,
              longitude: report.lastSeenLocation?.longitude || DEFAULT_REGION.longitude,
            }}
            title={report.name || `${report.type} (${report.color})`}
            description={report.description}
            pinColor={report.reportType === 'lost' ? 'red' : 'green'}
          />
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
});
