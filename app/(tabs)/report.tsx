import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

import { colors } from '../../constants/colors';
import { PetReport } from '../../types/pet';
import { usePets } from '../../store/pets';
import { useAuth } from '../../store/auth';

export default function ReportScreen() {
  const router = useRouter();
  const { addReport } = usePets();
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description || !location) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }

    const newReport: PetReport = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      description,
      isUrgent,
      dateReported: new Date().toISOString(),
      type: 'dog',
      color: 'brown',
      size: 'medium',
      photos: [],
      gender: 'unknown',
      status: 'active',
      name: '',
      breed: '',
      lastSeenDate: new Date().toISOString(),
      lastSeenLocation: {
        latitude: 0,
        longitude: 0,
        address: location,
      },
      contactInfo: {
        name: user?.name || 'Anonymous',
        email: user?.email || 'anon@example.com',
        phone: user?.phone,
      },
      reportType: 'lost',
      tags: [],
    };

    try {
      setLoading(true);
      await addReport(newReport);
      router.push('/(tabs)/recent');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit a Lost Pet Report</Text>

      <TextInput
        style={styles.input}
        placeholder="Describe your pet"
        placeholderTextColor={colors.textTertiary}
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Last seen location"
        placeholderTextColor={colors.textTertiary}
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity
        style={[styles.urgentToggle, isUrgent && styles.urgentToggleActive]}
        onPress={() => setIsUrgent(!isUrgent)}
      >
        <AlertTriangle size={20} color={isUrgent ? colors.white : colors.urgent} />
        <Text style={[styles.urgentText, isUrgent && styles.urgentTextActive]}>
          Mark as Urgent
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  urgentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.urgent,
  },
  urgentToggleActive: {
    backgroundColor: colors.urgent,
  },
  urgentText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.urgent,
  },
  urgentTextActive: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
