import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Camera, ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { usePets } from '@/store/pets';
import { PetReport, PetType } from '@/types/pet';
import { ENABLE_MONETIZATION } from '@/constants/features';

// ... rest of the imports

export default function ReportScreen() {
  // ... existing state and hooks

  return (
    <View style={styles.container}>
      {/* ... other JSX */}

      {ENABLE_MONETIZATION && report.reportType === 'lost' && (
        <>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, isUrgent && styles.checkboxChecked]}
              onPress={handleUrgentToggle}
            >
              <View style={[
                styles.checkboxInner,
                isUrgent && styles.checkboxCheckedInner
              ]} />
            </TouchableOpacity>
            <View style={styles.checkboxLabelContainer}>
              <View style={styles.checkboxHeaderContainer}>
                <Zap size={16} color={colors.primary} />
                <Text style={styles.checkboxLabel}>
                  Priority Boost
                </Text>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              </View>
              <Text style={styles.checkboxSubLabel}>
                Boost your report's visibility with priority placement, urgent tag, and extended reach ($9.99)
              </Text>
              <View style={styles.boostFeatures}>
                <Text style={styles.boostFeature}>• Featured in urgent section</Text>
                <Text style={styles.boostFeature}>• Higher search ranking</Text>
                <Text style={styles.boostFeature}>• Highlighted in map view</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reward (Optional)</Text>
            <TextInput
              style={styles.input}
              value={reward}
              onChangeText={setReward}
              placeholder="Amount in USD"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
            />
          </View>
        </>
      )}

      {/* ... rest of JSX */}
    </View>
  );
}