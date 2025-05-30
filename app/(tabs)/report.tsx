import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, ImagePlus, X, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';

export default function CreateReportScreen() {
  const router = useRouter();
  const { type = 'lost' } = useLocalSearchParams<{ type: ReportType }>();
  const [reportType, setReportType] = useState<ReportType>(type as ReportType);
  const [petType, setPetType] = useState<PetType | null>(null);
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petSize, setPetSize] = useState<'small' | 'medium' | 'large' | null>(null);
  const [petGender, setPetGender] = useState<'male' | 'female' | 'unknown' | null>(null);
  const [petAge, setPetAge] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addReport } = usePets();
  const { user } = useAuth();

  const handleTypeSelection = (type: ReportType) => {
    setReportType(type);
  };

  const handlePetTypeSelection = (type: PetType) => {
    setPetType(type);
  };

  const handleSizeSelection = (size: 'small' | 'medium' | 'large') => {
    setPetSize(size);
  };

  const handleGenderSelection = (gender: 'male' | 'female' | 'unknown') => {
    setPetGender(gender);
  };

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
        Alert.alert(
          'Add Photo',
          'Choose how you want to add a photo',
          [
            {
              text: 'Take Photo',
              onPress: () => setShowCamera(true)
            },
            {
              text: 'Choose from Library',
              onPress: pickImage
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Failed to add photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos(prev => [...prev, ...newPhotos]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!petType || !petColor || !petSize || !description || !location || photos.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields and add at least one photo');
      return;
    }

    setLoading(true);

    try {
      const newReport = {
        id: Date.now().toString(),
        userId: user?.id || 'anonymous',
        name: petName,
        type: petType,
        breed: petBreed,
        color: petColor,
        size: petSize,
        gender: petGender || 'unknown',
        age: petAge,
        description,
        photos,
        reportType,
        status: 'active',
        isUrgent,
        dateReported: new Date().toISOString(),
        lastSeenDate: new Date().toISOString(),
        lastSeenLocation: {
          latitude: 0,
          longitude: 0,
          address: location,
        },
        contactInfo: {
          name: user?.name || 'Anonymous',
          email: user?.email || 'anonymous@example.com',
          phone: user?.phone,
        },
        tags: [],
      };

      await addReport(newReport);

      Alert.alert(
        "Report Submitted",
        "Your report has been submitted successfully. Would you like to share your story to help others?",
        [
          { 
            text: "Not Now",
            style: "cancel",
            onPress: () => router.replace('/(tabs)')
          },
          {
            text: "Share Story",
            onPress: () => router.push('/story/create')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          Report a {reportType === 'lost' ? 'Lost' : 'Found'} Pet
        </Text>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              reportType === 'lost' && styles.typeButtonActive
            ]}
            onPress={() => handleTypeSelection('lost')}
          >
            <Text style={[
              styles.typeButtonText,
              reportType === 'lost' && styles.typeButtonTextActive
            ]}>
              Lost Pet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              reportType === 'found' && styles.typeButtonActive
            ]}
            onPress={() => handleTypeSelection('found')}
          >
            <Text style={[
              styles.typeButtonText,
              reportType === 'found' && styles.typeButtonTextActive
            ]}>
              Found Pet
            </Text>
          </TouchableOpacity>
        </View>

        {reportType === 'lost' && (
          <TouchableOpacity
            style={[styles.urgentToggle, isUrgent && styles.urgentToggleActive]}
            onPress={() => setIsUrgent(!isUrgent)}
          >
            <AlertTriangle size={20} color={isUrgent ? colors.white : colors.urgent} />
            <Text style={[styles.urgentText, isUrgent && styles.urgentTextActive]}>
              Mark as Urgent
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Pet Type</Text>
        <View style={styles.petTypeContainer}>
          {(['dog', 'cat'] as PetType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.petTypeButton,
                petType === type && styles.petTypeButtonActive
              ]}
              onPress={() => handlePetTypeSelection(type)}
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

        {reportType === 'lost' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pet's Name</Text>
            <TextInput
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholder="Pet's name (if applicable)"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={petBreed}
            onChangeText={setPetBreed}
            placeholder="Breed (if known)"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={petColor}
            onChangeText={setPetColor}
            placeholder="Primary color(s)"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age (Optional)</Text>
          <TextInput
            style={styles.input}
            value={petAge}
            onChangeText={setPetAge}
            placeholder="Age in years (approximate)"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.sectionTitle}>Size</Text>
        <View style={styles.sizeContainer}>
          {(['small', 'medium', 'large'] as const).map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                petSize === size && styles.sizeButtonActive
              ]}
              onPress={() => handleSizeSelection(size)}
            >
              <Text style={[
                styles.sizeButtonText,
                petSize === size && styles.sizeButtonTextActive
              ]}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderContainer}>
          {(['male', 'female', 'unknown'] as const).map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                petGender === gender && styles.genderButtonActive
              ]}
              onPress={() => handleGenderSelection(gender)}
            >
              <Text style={[
                styles.genderButtonText,
                petGender === gender && styles.genderButtonTextActive
              ]}>
                {gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Unknown'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the pet in detail (distinctive features, behavior, etc.)"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {reportType === 'lost' ? 'Last Seen Location' : 'Found Location'}
          </Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.photoHelper}>
          Clear photos help increase the chances of finding your pet.
        </Text>
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

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text>ReportScreen Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.white,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  petTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  petTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: 8,
    marginBottom: 8,
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
  sizeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  sizeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sizeButtonTextActive: {
    color: colors.white,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  genderButtonTextActive: {
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
  photoHelper: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
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