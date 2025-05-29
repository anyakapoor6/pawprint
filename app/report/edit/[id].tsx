import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { usePets } from '@/store/pets';
import { PetReport, PetType } from '@/types/pet';

export default function EditReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getReportById, updateReport } = usePets();
  const report = getReportById(id);

  const [title, setTitle] = useState(report?.name || '');
  const [petType, setPetType] = useState<PetType>(report?.type || 'dog');
  const [breed, setBreed] = useState(report?.breed || '');
  const [color, setColor] = useState(report?.color || '');
  const [description, setDescription] = useState(report?.description || '');
  const [location, setLocation] = useState(report?.lastSeenLocation?.address || '');
  const [photos, setPhotos] = useState<string[]>(report?.photos || []);
  const [reward, setReward] = useState(report?.reward?.amount.toString() || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!report) {
      Alert.alert('Error', 'Report not found');
      router.back();
    }
  }, [report]);

  const handleAddPhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        
        const promise = new Promise((resolve) => {
          input.onchange = (e: any) => {
            resolve(e.target.files);
          };
        });
        
        input.click();
        
        const files = await promise;
        if (files) {
          const fileArray = Array.from(files as FileList);
          const urls = fileArray.map(file => URL.createObjectURL(file));
          setPhotos(prev => [...prev, ...urls]);
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.images,
          allowsMultipleSelection: true,
          quality: 1,
        });

        if (!result.canceled && result.assets) {
          const newPhotos = result.assets.map(asset => asset.uri);
          setPhotos(prev => [...prev, ...newPhotos]);
        }
      }
    } catch (error) {
      console.error('Error adding photos:', error);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!report) return;

    setLoading(true);

    try {
      const updatedReport: PetReport = {
        ...report,
        name: title.trim(),
        type: petType,
        breed: breed.trim(),
        color: color.trim(),
        description: description.trim(),
        photos,
        lastSeenLocation: {
          ...report.lastSeenLocation!,
          address: location.trim()
        },
        reward: reward ? {
          amount: parseInt(reward, 10),
          description: 'Reward for safe return'
        } : undefined
      };

      await updateReport(updatedReport);
      Alert.alert('Success', 'Report updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  if (!report) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Report</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pet's Name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Pet's name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <Text style={styles.sectionTitle}>Pet Type</Text>
          <View style={styles.petTypeContainer}>
            {(['dog', 'cat'] as PetType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.petTypeButton,
                  petType === type && styles.petTypeButtonActive
                ]}
                onPress={() => setPetType(type)}
              >
                <Text style={[
                  styles.petTypeText,
                  petType === type && styles.petTypeTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="Breed"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="Color"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the pet"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Last seen location"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoThumbnail} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <X size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
            >
              <ImagePlus size={24} color={colors.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          {report.reportType === 'lost' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reward Amount (Optional)</Text>
              <TextInput
                style={styles.input}
                value={reward}
                onChangeText={setReward}
                placeholder="Enter reward amount"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
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
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  petTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  petTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: 8,
  },
  petTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  petTypeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  petTypeTextActive: {
    color: colors.white,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
});