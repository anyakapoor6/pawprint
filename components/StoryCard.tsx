import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Heart, MessageCircle, Calendar, Gift } from 'lucide-react-native';
import { Story } from '@/types/pet';
import { colors } from '@/constants/colors';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const formattedDate = new Date(story.date).toLocaleDateString();
  
  return (
    <Link href={`/story/${story.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: story.userPhoto || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
              style={styles.userPhoto} 
            />
            <View>
              <Text style={styles.userName}>{story.userName}</Text>
              <View style={styles.dateContainer}>
                <Calendar size={12} color={colors.textTertiary} />
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.content} numberOfLines={3}>{story.content}</Text>
        
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: story.petPhoto }} 
            style={styles.petPhoto} 
            resizeMode="cover"
          />
          {story.photos.length > 1 && (
            <View style={styles.morePhotosContainer}>
              <Text style={styles.morePhotosText}>+{story.photos.length - 1}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.statContainer}>
            <Heart size={16} color={colors.accent} />
            <Text style={styles.statText}>{story.likes}</Text>
          </View>
          <View style={styles.statContainer}>
            <MessageCircle size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{story.comments}</Text>
          </View>
          {story.totalDonations > 0 && (
            <View style={styles.statContainer}>
              <Gift size={16} color={colors.primary} />
              <Text style={styles.statText}>${story.totalDonations}</Text>
            </View>
          )}
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>Read full story</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  petPhoto: {
    width: '100%',
    height: 200,
  },
  morePhotosContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
  },
  morePhotosText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  readMoreContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: '500',
  },
});