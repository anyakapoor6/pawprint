import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SquarePen as PenSquare } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useStories } from '@/store/stories';
import { useAuth } from '@/store/auth';
import StoryCard from '@/components/StoryCard';

export default function StoriesScreen() {
  const router = useRouter();
  const { stories } = useStories();
  const { user } = useAuth();

  // Filter stories to only show current user's stories
  const userStories = stories.filter(story => story.userId === user?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Stories</Text>
        <View style={styles.headerInfo}>
          <PenSquare size={16} color={colors.primary} />
          <Text style={styles.headerSubtitle}>
            Share your journey and connect with others
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {userStories.length > 0 ? (
          userStories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No stories yet</Text>
            <Text style={styles.emptyStateText}>
              Share your first success story with the community
            </Text>
          </View>
        )}
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
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});