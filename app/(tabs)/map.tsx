import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Layers, List, MapPin, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { FEATURES } from '@/constants/features';

// ... rest of imports

export default function MapScreen() {
  // ... existing state and hooks

  // Only show basic map features if premium is disabled
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
      {/* ... other JSX */}
      
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

      {/* ... rest of JSX */}
    </View>
  );
}