import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Bell, Search } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function Header() {
  const router = useRouter();

  const handleSearchPress = () => {
    router.push('/(modals)/search');
  };

  const handleNotificationsPress = () => {
    router.push('/(modals)/notifications');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>PawPrint</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
            <Search size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
            <Bell size={24} color={colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.heroContainer}>
        {/* <Text style={styles.heroTitle}>
          Help reunite lost pets with their families
        </Text> */}
        <View style={styles.actionButtonsContainer}>
          <Link href="/report?type=lost" asChild>
            <TouchableOpacity style={[styles.actionButton, styles.lostButton]}>
              <Text style={styles.actionButtonText}>Report Lost Pet</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/report?type=found" asChild>
            <TouchableOpacity style={[styles.actionButton, styles.foundButton]}>
              <Text style={styles.actionButtonText}>Report Found Pet</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/story/create" asChild>
            <TouchableOpacity style={[styles.actionButton, styles.storyButton]}>
              <Text style={styles.actionButtonText}>Write a Story</Text>
            </TouchableOpacity>
          </Link>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyButton: {
    backgroundColor: colors.accent,
  },
  lostButton: {
    backgroundColor: colors.urgent,
  },
  foundButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});