import { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Share as ShareIcon, Heart, Award, X, Send, CornerDownRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport, Comment } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import { useAuth } from '@/store/auth';
import { useLikes } from '@/store/likes';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { togglePetLike, toggleCommentLike, isPetLiked, isCommentLiked } = useLikes();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null);
  
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
      console.error('Error sharing');
    }
  };

  const handleComment = () => {
    if (!comment.trim()) return;

    const newComment: Comment = {
      id: String(Date.now()),
      userId: user?.id || 'anonymous',
      userName: user?.name || 'Anonymous',
      userPhoto: user?.photo || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      content: comment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    if (replyTo) {
      // Add reply to the parent comment
      pet.comments = pet.comments.map(c => {
        if (c.id === replyTo.id) {
          return {
            ...c,
            replies: [...(c.replies || []), newComment]
          };
        }
        return c;
      });
    } else {
      // Add new top-level comment
      pet.comments = [newComment, ...pet.comments];
    }

    setComment('');
    setReplyTo(null);
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

  const handleLikePet = () => {
    togglePetLike(pet.id);
  };

  const handleLikeComment = (commentId: string) => {
    toggleCommentLike(commentId);
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo({ id: commentId, userName });
    setComment(`@${userName} `);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setComment('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View key={comment.id} style={[styles.commentItem, isReply && styles.replyItem]}>
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
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleLikeComment(comment.id)}
          >
            <Heart 
              size={16} 
              color={isCommentLiked(comment.id) ? colors.error : colors.textSecondary}
              fill={isCommentLiked(comment.id) ? colors.error : 'transparent'}
            />
            <Text style={[
              styles.commentActionText,
              isCommentLiked(comment.id) && styles.commentActionTextActive
            ]}>
              {comment.likes + (isCommentLiked(comment.id) ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity 
              style={styles.commentAction}
              onPress={() => handleReply(comment.id, comment.userName)}
            >
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
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
          <Text style={styles.headerTitle}>Pet Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <Image 
          source={{ uri: pet.photos[0] }} 
          style={styles.mainImage} 
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>
            {pet.name || `${pet.type} (${pet.color})`}
          </Text>
          
          {pet.reward && pet.status === 'active' && (
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

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            
            <View style={styles.commentInput}>
              {replyTo && (
                <View style={styles.replyingTo}>
                  <CornerDownRight size={16} color={colors.textSecondary} />
                  <Text style={styles.replyingToText}>
                    Replying to {replyTo.userName}
                  </Text>
                  <TouchableOpacity 
                    style={styles.cancelReplyButton}
                    onPress={cancelReply}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.commentInputRow}>
                <Image 
                  source={{ uri: user?.photo || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
                  style={styles.commentUserPhoto} 
                />
                <TextInput
                  style={styles.commentTextInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                />
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    !comment.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleComment}
                  disabled={!comment.trim()}
                >
                  <Send size={20} color={comment.trim() ? colors.primary : colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {pet.comments?.map((comment) => (
              <View key={comment.id}>
                {renderComment(comment)}
                {comment.replies?.map(reply => (
                  renderComment(reply, true)
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={handleLikePet}
        >
          <Heart 
            size={24} 
            color={isPetLiked(pet.id) ? colors.error : colors.textSecondary}
            fill={isPetLiked(pet.id) ? colors.error : 'transparent'}
          />
          <Text style={[
            styles.footerButtonText,
            isPetLiked(pet.id) && styles.footerButtonTextActive
          ]}>
            {pet.likes + (isPetLiked(pet.id) ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <ShareIcon size={20} color={colors.white} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
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
    paddingBottom: 80,
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  mainImage: {
    width: '100%',
    height: 240,
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
  commentsSection: {
    marginTop: 24,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  commentInput: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
  },
  replyingTo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginBottom: 12,
  },
  replyingToText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  cancelReplyButton: {
    padding: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentUserPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentTextInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: colors.gray[100],
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
  },
  replyItem: {
    marginLeft: 48,
    marginBottom: 8,
    backgroundColor: colors.gray[50],
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
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
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  commentActionTextActive: {
    color: colors.error,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  footerButtonText: {
    color: colors.textSecondary,
    marginLeft: 6,
    fontSize: 16,
  },
  footerButtonTextActive: {
    color: colors.error,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  shareButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});