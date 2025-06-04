import { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Share as ShareIcon, Heart, Award, Send, MessageCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport, PetComment } from '@/types/pet';
import { usePets } from '@/store/pets';
import { usePetInteractions } from '@/store/petInteractions';
import { useAuth } from '@/store/auth';
import MapView, { Marker } from 'react-native-maps';


export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getReportById } = usePets();
  const { toggleLike, isLiked, getLikeCount, getComments, addComment } = usePetInteractions();
  const [comment, setComment] = useState('');

  const pet = getReportById(id);
  const likeCount = getLikeCount(id);
  const comments = getComments(id);

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

  const handleComment = () => {
    if (!comment.trim()) return;

    const newComment: PetComment = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      userName: user?.name || 'Anonymous',
      userPhoto: user?.photo || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      content: comment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    addComment(id, newComment);
    setComment('');
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
              onPress={() => toggleLike(id)}
            >
              <Heart
                size={20}
                color={isLiked(id) ? colors.error : colors.white}
                fill={isLiked(id) ? colors.error : 'transparent'}
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
              <MapView
                style={{ width: '100%', height: '100%' }}
                initialRegion={{
                  latitude: pet.lastSeenLocation?.latitude || 0,
                  longitude: pet.lastSeenLocation?.longitude || 0,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: pet.lastSeenLocation?.latitude || 0,
                    longitude: pet.lastSeenLocation?.longitude || 0,
                  }}
                  title={pet.name || 'Pet'}
                  description={pet.lastSeenLocation?.address || ''}
                />
              </MapView>
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

            <View style={styles.interactionStats}>
              <View style={styles.statItem}>
                <Heart
                  size={16}
                  color={isLiked(id) ? colors.error : colors.textSecondary}
                  fill={isLiked(id) ? colors.error : 'transparent'}
                />
                <Text style={styles.statText}>{likeCount}</Text>
              </View>
              <View style={styles.statItem}>
                <MessageCircle size={16} color={colors.textSecondary} />
                <Text style={styles.statText}>{comments.length}</Text>
              </View>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.sectionTitle}>Comments</Text>

              <View style={styles.commentInput}>
                <Image
                  source={{ uri: user?.photo || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
                  style={styles.commentUserPhoto}
                />
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentTextInput}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Write a comment..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
                    onPress={handleComment}
                    disabled={!comment.trim()}
                  >
                    <Send size={20} color={comment.trim() ? colors.primary : colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>

              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={{ uri: comment.userPhoto }}
                    style={styles.commentUserPhoto}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUserName}>{comment.userName}</Text>
                      <Text style={styles.commentTime}>
                        {formatCommentTime(comment.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <TouchableOpacity
                      style={styles.commentLikeButton}
                      onPress={() => toggleLike(comment.id)}
                    >
                      <Heart
                        size={14}
                        color={isLiked(comment.id) ? colors.error : colors.textSecondary}
                        fill={isLiked(comment.id) ? colors.error : 'transparent'}
                      />
                      <Text style={[
                        styles.commentLikeCount,
                        isLiked(comment.id) && styles.commentLikeCountActive
                      ]}>
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
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
  interactionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  commentsSection: {
    marginTop: 16,
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
  commentInputContainer: {
    flex: 1,
    position: 'relative',
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
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentLikeCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  commentLikeCountActive: {
    color: colors.error,
  },
});