import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PenSquare } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { mockStories } from '@/data/mockData';
import StoryCard from '@/components/StoryCard';

export default function StoriesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
        <View style={styles.headerInfo}>
          <PenSquare size={16} color={colors.primary} />
          <Text style={styles.headerSubtitle}>
            Share your journey and connect with others
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {mockStories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
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
});