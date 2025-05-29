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
  const [isLiked, setIsLiked] = useState(false);
  
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
      await Share.share({
        message: `Help ${pet.reportType === 'lost' ? 'find' : 'identify'} this ${pet.type}! View details on PawPrint: https://pawprint.app/pet/${pet.id}`,
      });
    } catch (error) {
      Alert.alert('Error sharing');
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
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.photos[0] }} style={styles.image} />
          <TouchableOpacity 
            style={styles.backButtonCircle}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.imageActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsLiked(!isLiked)}
            >
              <Heart 
                size={20} 
                color={isLiked ? colors.error : colors.white} 
                fill={isLiked ? colors.error : 'transparent'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <ShareIcon size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.statusBadge,
            pet.reportType === 'lost' ? styles.lostBadge : styles.foundBadge
          ]}>
            <Text style={styles.statusText}>
              {pet.reportType === 'lost' ? 'LOST' : 'FOUND'}
            </Text>
          </View>
          
          {pet.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>
            {pet.name || `${pet.type.charAt(0).toUpperCase() + pet.type.slice(1)} (${pet.color})`}
          </Text>
          
          {pet.reward && (
            <View style={styles.rewardBanner}>
              <Award size={16} color={colors.white} />
              <Text style={styles.rewardText}>
                ${pet.reward.amount} Reward
              </Text>
            </View>
          )}
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Breed</Text>
                <Text style={styles.infoValue}>{pet.breed || 'Unknown'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Color</Text>
                <Text style={styles.infoValue}>{pet.color}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>{pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {pet.gender ? (pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)) : 'Unknown'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{pet.age || 'Unknown'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{pet.description}</Text>
          </View>
          
          <View style={styles.section}>
            <View style={styles.locationHeader}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Last Seen Location</Text>
            </View>
            <Text style={styles.locationText}>
              {pet.lastSeenLocation?.address || 'Location unknown'}
            </Text>
            <View style={styles.dateContainer}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {formatDate(pet.lastSeenDate || pet.dateReported)}
              </Text>
            </View>
            <View style={styles.mapPreview}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/6195286/pexels-photo-6195286.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
                style={styles.mapImage} 
              />
              <Link href={`/map?pet=${pet.id}`} asChild>
                <TouchableOpacity style={styles.viewMapButton}>
                  <Text style={styles.viewMapButtonText}>View on Map</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
          
          {pet.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {pet.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.contactName}>{pet.contactInfo.name}</Text>
            {pet.contactInfo.phone && (
              <Text style={styles.contactDetail}>{pet.contactInfo.phone}</Text>
            )}
            <Text style={styles.contactDetail}>{pet.contactInfo.email}</Text>
          </View>
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
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButtonCircle: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageActions: {
    position: 'absolute',
    top: 48,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lostBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.85)',
  },
  foundBadge: {
    backgroundColor: 'rgba(80, 200, 120, 0.85)',
  },
  statusText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  urgentBadge: {
    position: 'absolute',
    top: 48,
    right: 120,
    backgroundColor: colors.urgent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  urgentText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rewardText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  mapPreview: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  viewMapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMapButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});