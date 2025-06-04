import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';

// Curated list of cute pet photos from Pexels
const PET_PHOTOS = [
  {
    id: '1',
    url: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
    type: 'dog',
    description: 'Cute Labrador puppy'
  },
  {
    id: '2',
    url: 'https://images.pexels.com/photos/2061057/pexels-photo-2061057.jpeg',
    type: 'dog',
    description: 'Smiling Corgi'
  },
  {
    id: '3',
    url: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
    type: 'dog',
    description: 'Golden Retriever puppy'
  },
  {
    id: '4',
    url: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg',
    type: 'dog',
    description: 'Husky with blue eyes'
  },
  {
    id: '5',
    url: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
    type: 'cat',
    description: 'Grey cat with green eyes'
  },
  {
    id: '6',
    url: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg',
    type: 'cat',
    description: 'Sleepy orange cat'
  },
  {
    id: '7',
    url: 'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
    type: 'cat',
    description: 'Curious kitten'
  },
  {
    id: '8',
    url: 'https://images.pexels.com/photos/1314550/pexels-photo-1314550.jpeg',
    type: 'cat',
    description: 'Sleeping white cat'
  }
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(user?.photo || PET_PHOTOS[0].url);
  const [loading, setLoading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'dog' | 'cat'>('all');

  const filteredPhotos = selectedType === 'all'
    ? PET_PHOTOS
    : PET_PHOTOS.filter(p => p.type === selectedType);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (email && !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photo,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
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
        <View style={styles.photoSection}>
          <TouchableOpacity
            onPress={() => setShowPhotoModal(true)}
            style={styles.photoButton}
          >
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: photo }}
                style={styles.profilePhoto}
              />
              <View style={styles.cameraIconContainer}>
                <Camera size={20} color={colors.white} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Choose a new profile picture</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showPhotoModal}
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Profile Picture</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPhotoModal(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedType === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedType('all')}
            >
              <Text style={[styles.filterText, selectedType === 'all' && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedType === 'dog' && styles.filterButtonActive]}
              onPress={() => setSelectedType('dog')}
            >
              <Text style={[styles.filterText, selectedType === 'dog' && styles.filterTextActive]}>
                Dogs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedType === 'cat' && styles.filterButtonActive]}
              onPress={() => setSelectedType('cat')}
            >
              <Text style={[styles.filterText, selectedType === 'cat' && styles.filterTextActive]}>
                Cats
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.photoGrid} contentContainerStyle={styles.photoGridContent}>
            {filteredPhotos.map((petPhoto) => (
              <TouchableOpacity
                key={petPhoto.id}
                style={[
                  styles.photoOption,
                  photo === petPhoto.url && styles.photoOptionSelected
                ]}
                onPress={() => {
                  setPhoto(petPhoto.url);
                  setShowPhotoModal(false);
                }}
              >
                <Image
                  source={{ uri: petPhoto.url }}
                  style={styles.photoOptionImage}
                />
                {photo === petPhoto.url && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.selectedIndicator} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
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
  photoSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  photoButton: {
    marginBottom: 8,
  },
  photoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  changePhotoText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  photoGrid: {
    flex: 1,
  },
  photoGridContent: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoOption: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
  },
  photoOptionSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  photoOptionImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
});