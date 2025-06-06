import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { useStories } from '@/store/stories';


export default function CreateStoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addStory } = useStories();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos(prev => [...prev, ...newPhotos]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Unable to take photo. Please try again.');
    }
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
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || photos.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and add at least one photo');
      return;
    }
    setLoading(true);
    try {
      const newStory = {
        id: Date.now().toString(),
        userId: user?.id || '',
        title: title.trim(),
        content: content.trim(),
        petReportId: 'story-' + Date.now(),
        petName: '',
        petPhoto: photos[0],
        userPhoto: user?.photo,
        userName: user?.name || 'Anonymous',
        date: new Date().toISOString(),
        likes: 0,
        comments: 0,
        photos,
      };
      await addStory(newStory);
      Alert.alert('Success', 'Your story has been published!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to publish story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back arrow and Publish button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Story</Text>
        <TouchableOpacity
          style={[styles.publishButton, (!title.trim() || !content.trim() || photos.length === 0 || loading) && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={!title.trim() || !content.trim() || photos.length === 0 || loading}
        >
          <Text style={styles.publishButtonText}>
            {loading ? 'Publishing...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Story Form */}
      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user?.photo || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
            style={styles.userPhoto}
          />
          <Text style={styles.userName}>{user?.name}</Text>
        </View>

        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Add a title to your story *"
          placeholderTextColor={colors.textTertiary}
          maxLength={100}
        />

        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Photos (Required)</Text>
          <Text style={styles.photoHelper}>
            Add photos to make your story more engaging
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosContainer}
          >
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
              onPress={() =>
                Alert.alert(
                  'Add Photo',
                  'Choose a method',
                  [
                    { text: 'Take Photo', onPress: takePhoto },
                    { text: 'Choose from Library', onPress: handleAddPhoto },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                )
              }
            >
              <ImagePlus size={24} color={colors.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        <View style={styles.storySection}>
          <Text style={styles.sectionTitle}>Your Story *</Text>
          <TextInput
            style={styles.storyInput}
            value={content}
            onChangeText={setContent}
            placeholder="Share your story..."
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.requiredNote}>* Required fields</Text>
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
  publishButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    padding: 0,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  photoHelper: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  photosContainer: {
    paddingRight: 16,
  },
  photoItem: {
    width: 120,
    height: 120,
    marginRight: 12,
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
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
  },
  storySection: {
    marginBottom: 24,
  },
  storyInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  requiredNote: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 24,
    fontStyle: 'italic',
  },
});
