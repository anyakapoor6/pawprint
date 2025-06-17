import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Share as ShareIcon, Heart, Award, Send, MessageCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import { usePets } from '@/store/pets';
import { useAuth } from '@/store/auth';
import { useEngagement } from '@/store/engagement';
import MapView, { Marker } from 'react-native-maps';
import { Linking } from 'react-native';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getReportById } = usePets();
  const {
    isReportLiked,
    toggleReportLike,
    createReportComment,
    reportLikeCounts,
    reportCommentCounts,
    reportComments,
    loadReportEngagement,
    isLoading: engagementLoading
  } = useEngagement();
  const [comment, setComment] = useState('');

  const pet = getReportById(id);

  useEffect(() => {
    if (pet?.id) {
      loadReportEngagement(pet.id);
    }
  }, [pet?.id]);

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

  const formatCommentTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleLike = async () => {
    if (!user?.id) {
      router.push('/(auth)/sign-in' as any);
      return;
    }
    try {
      await toggleReportLike(pet.id);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !user?.id) return;

    try {
      await createReportComment(pet.id, comment.trim());
      setComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  const renderComment = (comment: any) => (
    <View key={comment.id} style={styles.commentItem}>
      <Image
        source={{ uri: comment.user_photo || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
        style={styles.commentUserPhoto}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUserName}>{comment.user_name}</Text>
          <Text style={styles.commentTime}>
            {formatCommentTime(comment.created_at)}
          </Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>
            {pet.reportType === 'lost' ? 'Lost Pet' : 'Found Pet'}
          </Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <ShareIcon size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image
            source={{ uri: pet.photos[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={styles.petDetails}>
              <Text style={styles.petDetail}>
                {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                {pet.breed ? ` • ${pet.breed}` : ''}
              </Text>
              <Text style={styles.petDetail}>
                {pet.color} • {pet.size} • {pet.gender}
              </Text>
            </View>

            {pet.reward && (
              <View style={styles.rewardContainer}>
                <Award size={16} color={colors.primary} />
                <Text style={styles.rewardText}>
                  Reward: ${pet.reward.amount}
                </Text>
              </View>
            )}

            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={styles.locationText}>
                {pet.lastSeenLocation?.address}
              </Text>
            </View>

            <Text style={styles.description}>{pet.description}</Text>

            {pet.lastSeenLocation && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: pet.lastSeenLocation.latitude,
                    longitude: pet.lastSeenLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: pet.lastSeenLocation.latitude,
                      longitude: pet.lastSeenLocation.longitude,
                    }}
                  />
                </MapView>
              </View>
            )}

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({reportCommentCounts[pet.id] || 0})
              </Text>

              <View style={styles.commentInput}>
                <Image
                  source={{ uri: user?.photo || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
                  style={styles.commentUserPhoto}
                />
                <TextInput
                  style={styles.commentTextInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Write a comment..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!comment.trim() || engagementLoading) && styles.sendButtonDisabled
                  ]}
                  onPress={handleComment}
                  disabled={!comment.trim() || engagementLoading}
                >
                  <Send size={20} color={comment.trim() && !engagementLoading ? colors.primary : colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {reportComments[pet.id]?.comments.map((comment) => renderComment(comment))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleLike}
          disabled={engagementLoading}
        >
          <Heart
            size={24}
            color={isReportLiked(pet.id) ? colors.error : colors.textSecondary}
            fill={isReportLiked(pet.id) ? colors.error : 'transparent'}
          />
          <Text style={[
            styles.footerButtonText,
            isReportLiked(pet.id) && styles.footerButtonTextActive
          ]}>
            {reportLikeCounts[pet.id] || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton}>
          <MessageCircle size={24} color={colors.textSecondary} />
          <Text style={styles.footerButtonText}>
            {reportCommentCounts[pet.id] || 0}
          </Text>
        </TouchableOpacity>

        {pet.reportType === 'lost' && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL(`tel:${pet.contactInfo?.phone}`)}
          >
            <Text style={styles.contactButtonText}>Contact Owner</Text>
          </TouchableOpacity>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 16,
    marginRight: 'auto',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  petInfo: {
    marginBottom: 24,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  petDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  petDetail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  rewardContainer: {
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  commentUserPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentTextInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    fontSize: 14,
    color: colors.text,
    minHeight: 36,
    maxHeight: 100,
  },
  sendButton: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  footerButtonTextActive: {
    color: colors.error,
  },
  contactButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  contactButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});