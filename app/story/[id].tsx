import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Share as ShareIcon, Send, CornerDownRight, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Story, Comment } from '@/types/pet';
import { useStories } from '@/store/stories';
import { useAuth } from '@/store/auth';
import { useLikes } from '@/store/likes';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { stories } = useStories();
  const { user } = useAuth();
  const { 
    toggleStoryLike, 
    toggleCommentLike, 
    isStoryLiked, 
    isCommentLiked 
  } = useLikes();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Johnson',
      userPhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      content: 'Such a heartwarming story! So happy you found your pet!',
      timestamp: '2024-03-15T10:30:00Z',
      likes: 5,
      replies: [
        {
          id: '1-1',
          userId: 'user3',
          userName: 'David Wilson',
          userPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          content: 'Thank you! It was an incredible moment when we found him.',
          timestamp: '2024-03-15T11:00:00Z',
          likes: 2,
        }
      ]
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Michael Chen',
      userPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      content: 'This gives me hope for finding my lost cat. Thank you for sharing!',
      timestamp: '2024-03-15T11:15:00Z',
      likes: 3,
    },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const story = stories.find(s => s.id === id);
  
  if (!story) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Story not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Read this amazing reunion story on PawPrint: "${story.title}" https://pawprint.app/story/${story.id}`,
      });
    } catch (error) {
      console.error('Error sharing story');
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
      setComments(prev => prev.map(c => {
        if (c.id === replyTo.id) {
          return {
            ...c,
            replies: [...(c.replies || []), newComment]
          };
        }
        return c;
      }));
    } else {
      // Add new top-level comment
      setComments(prev => [newComment, ...prev]);
    }

    setComment('');
    setReplyTo(null);

    // Scroll to the new comment
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
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

  const handleLikeStory = () => {
    toggleStoryLike(story.id);
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
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Success Story</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.storyHeader}>
          <Text style={styles.title}>{story.title}</Text>
          
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: story.userPhoto || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
              style={styles.userPhoto} 
            />
            <View>
              <Text style={styles.userName}>{story.userName}</Text>
              <Text style={styles.date}>{formatDate(story.date)}</Text>
            </View>
          </View>
        </View>
        
        <Image 
          source={{ uri: story.petPhoto }} 
          style={styles.mainImage} 
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.storyText}>{story.content}</Text>
          
          {story.photos.length > 1 && (
            <View style={styles.photoGallery}>
              <Text style={styles.galleryTitle}>More Photos</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContent}
              >
                {story.photos.map((photo, index) => (
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
            <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
            
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

            {comments.map((comment) => (
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
          onPress={handleLikeStory}
        >
          <Heart 
            size={24} 
            color={isStoryLiked(story.id) ? colors.error : colors.textSecondary}
            fill={isStoryLiked(story.id) ? colors.error : 'transparent'}
          />
          <Text style={[
            styles.footerButtonText,
            isStoryLiked(story.id) && styles.footerButtonTextActive
          ]}>
            {story.likes + (isStoryLiked(story.id) ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <MessageCircle size={24} color={colors.textSecondary} />
          <Text style={styles.footerButtonText}>{comments.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <ShareIcon size={20} color={colors.white} />
          <Text style={styles.shareButtonText}>Share Story</Text>
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
    paddingBottom: 80, // Space for footer
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