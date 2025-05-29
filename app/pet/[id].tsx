import { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Share as ShareIcon, Heart, Award } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import { mockReports } from '@/data/mockData';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // In a real app, this would fetch from an API
  const pet = mockReports.find(p => p.id === id);
  
  if (!pet) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Pet not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const handleShare = async () => {
    try {
      const message = `Help ${pet.reportType === 'lost' ? 'find' : 'identify'} this ${pet.type}!\n\n` +
        `${pet.name ? pet.name + ' is a ' : 'A '}${pet.breed || ''} ${pet.type} that was ${pet.reportType} near ${pet.lastSeenLocation?.address || 'unknown location'}.\n\n` +
        `Description: ${pet.description}\n\n` +
        `View details and contact information at: https://pawprint.app/pet/${pet.id}`;

      const result = await Share.share({
        message,
        title: `${pet.reportType === 'lost' ? 'Lost' : 'Found'} ${pet.type} - PawPrint`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error sharing', 'Something went wrong while sharing this pet listing');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Success Story</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.storyHeader}>
          <Text style={styles.title}>{pet.title}</Text>
          
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: pet.userPhoto || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
              style={styles.userPhoto} 
            />
            <View>
              <Text style={styles.userName}>{pet.userName}</Text>
              <Text style={styles.date}>{formatDate(pet.date)}</Text>
            </View>
          </View>
        </View>
        
        <Image 
          source={{ uri: pet.petPhoto }} 
          style={styles.mainImage} 
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.storyText}>{pet.content}</Text>
          
          {pet.photos.length > 1 && (
            <View style={styles.photoGallery}>
              <Text style={styles.galleryTitle}>More Photos</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContent}
              >
                {pet.photos.map((photo, index) => (
                  <Image 
                    key={index}
                    source={{ uri: photo }} 
                    style={styles.galleryImage} 
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments ({pet.comments})</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShare}
      >
        <ShareIcon size={20} color={colors.white} />
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  storyHeader: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mainImage: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: 16,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 24,
  },
  photoGallery: {
    marginBottom: 24,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  galleryContent: {
    paddingRight: 16,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  commentsSection: {
    marginTop: 24,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  shareButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});