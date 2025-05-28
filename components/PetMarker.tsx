import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';

interface PetMarkerProps {
  pet: PetReport;
  lat: number;
  lng: number;
  onClick: () => void;
}

export default function PetMarker({ pet, onClick }: PetMarkerProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onClick}
    >
      <View style={[
        styles.marker,
        pet.reportType === 'lost' ? styles.lostMarker : styles.foundMarker
      ]}>
        <MapPin
          size={20}
          color={colors.white}
          style={styles.icon}
        />
      </View>
      {pet.isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    transform: Platform.OS === 'web' ? [
      { translateX: -20 },
      { translateY: -40 }
    ] : [],
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  lostMarker: {
    backgroundColor: colors.urgent,
  },
  foundMarker: {
    backgroundColor: colors.secondary,
  },
  icon: {
    marginBottom: 2,
  },
  urgentBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  urgentText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});